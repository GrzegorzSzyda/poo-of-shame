import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { internalQuery, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'

type Identity = {
    subject: string
    tokenIdentifier: string
    issuer: string
    email?: string
    name?: string
}

const normalizeIdentifier = (value: string) => {
    const trimmed = value.trim().replace(/^['"]|['"]$/g, '')
    return trimmed
}

const parseBootstrapAdmins = () =>
    (process.env.GAMES_ADMIN_TOKEN_IDENTIFIERS ?? '')
        .split(',')
        .map(normalizeIdentifier)
        .filter((value) => value.length > 0)

const toCandidates = (value: string) => {
    const normalized = normalizeIdentifier(value)
    if (normalized.length === 0) return []

    const parts = normalized.split('|')
    const suffix = parts.length > 1 ? (parts[parts.length - 1] ?? '') : ''
    return suffix && suffix !== normalized ? [normalized, suffix] : [normalized]
}

const getAuthCandidates = (identity: Identity) =>
    new Set([
        ...toCandidates(identity.subject),
        ...toCandidates(identity.tokenIdentifier),
    ])

const isBootstrapAdmin = (identity: Identity) => {
    const authCandidates = getAuthCandidates(identity)
    return parseBootstrapAdmins().some((admin) =>
        toCandidates(admin).some((candidate) => authCandidates.has(candidate)),
    )
}

const requireIdentity = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
        throw new ConvexError('UNAUTHORIZED')
    }
    return identity
}

const getAppUserByIdentity = async (ctx: QueryCtx | MutationCtx, identity: Identity) => {
    const byTokenIdentifier = await ctx.db
        .query('appUsers')
        .withIndex('by_tokenIdentifier', (q) =>
            q.eq('tokenIdentifier', identity.tokenIdentifier),
        )
        .unique()

    if (byTokenIdentifier) return byTokenIdentifier

    return await ctx.db
        .query('appUsers')
        .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
        .unique()
}

const canManageAdmin = async (ctx: QueryCtx | MutationCtx, identity: Identity) => {
    if (isBootstrapAdmin(identity)) return true

    const appUser = await getAppUserByIdentity(ctx, identity)
    return appUser?.role === 'admin'
}

export const ensureAdmin = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await requireIdentity(ctx)
    if (!(await canManageAdmin(ctx, identity))) {
        throw new ConvexError('FORBIDDEN')
    }
    return identity
}

export const getCurrentAdminAccess = internalQuery({
    args: {},
    handler: async (ctx) => {
        const identity = await requireIdentity(ctx)
        return {
            canManage: await canManageAdmin(ctx, identity),
            userId: identity.subject,
        }
    },
})

export const getIgdbCredentialsForCurrentAdmin = internalQuery({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx)

        const settings = await ctx.db
            .query('integrationSettings')
            .withIndex('by_key', (q) => q.eq('key', 'igdb'))
            .unique()

        if (!settings) return null

        return {
            clientId: settings.igdbClientId,
            clientSecret: settings.igdbClientSecret,
        }
    },
})

const toAdminUser = (user: Doc<'appUsers'>) => ({
    _id: user._id,
    subject: user.subject,
    tokenIdentifier: user.tokenIdentifier,
    email: user.email,
    name: user.name,
    role: user.role,
    lastSeenAt: user.lastSeenAt,
    updatedAt: user.updatedAt,
})

export const syncCurrentUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await requireIdentity(ctx)
        const existing = await getAppUserByIdentity(ctx, identity)
        const now = Date.now()
        const nextRole = isBootstrapAdmin(identity) ? 'admin' : (existing?.role ?? 'user')

        if (existing) {
            await ctx.db.patch(existing._id, {
                subject: identity.subject,
                tokenIdentifier: identity.tokenIdentifier,
                issuer: identity.issuer,
                email: identity.email,
                name: identity.name,
                role: nextRole,
                lastSeenAt: now,
                updatedAt: now,
            })
            return existing._id
        }

        return await ctx.db.insert('appUsers', {
            subject: identity.subject,
            tokenIdentifier: identity.tokenIdentifier,
            issuer: identity.issuer,
            email: identity.email,
            name: identity.name,
            role: nextRole,
            lastSeenAt: now,
            createdAt: now,
            updatedAt: now,
        })
    },
})

export const getAdminStatus = query({
    args: {},
    handler: async (ctx) => {
        const identity = await requireIdentity(ctx)
        const appUser = await getAppUserByIdentity(ctx, identity)
        return {
            canManage: await canManageAdmin(ctx, identity),
            role: isBootstrapAdmin(identity) ? 'admin' : (appUser?.role ?? 'user'),
        }
    },
})

export const getAdminPanel = query({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx)

        const [users, igdbSettings] = await Promise.all([
            ctx.db.query('appUsers').order('desc').take(100),
            ctx.db
                .query('integrationSettings')
                .withIndex('by_key', (q) => q.eq('key', 'igdb'))
                .unique(),
        ])

        return {
            users: users.map(toAdminUser),
            igdb: igdbSettings
                ? {
                      clientId: igdbSettings.igdbClientId,
                      hasClientSecret: igdbSettings.igdbClientSecret.length > 0,
                      updatedAt: igdbSettings.updatedAt,
                      updatedByUserId: igdbSettings.updatedByUserId,
                  }
                : null,
        }
    },
})

export const setUserRole = mutation({
    args: {
        appUserId: v.id('appUsers'),
        role: v.union(v.literal('user'), v.literal('admin')),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)

        const user = await ctx.db.get(args.appUserId)
        if (!user) {
            throw new ConvexError('USER_NOT_FOUND')
        }

        await ctx.db.patch(args.appUserId, {
            role: args.role,
            updatedAt: Date.now(),
        })
    },
})

export const saveIgdbCredentials = mutation({
    args: {
        clientId: v.string(),
        clientSecret: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAdmin(ctx)
        const clientId = args.clientId.trim()
        const clientSecret = args.clientSecret?.trim()

        if (clientId.length === 0) {
            throw new ConvexError('IGDB_CLIENT_ID_REQUIRED')
        }

        const now = Date.now()
        const existing = await ctx.db
            .query('integrationSettings')
            .withIndex('by_key', (q) => q.eq('key', 'igdb'))
            .unique()

        if (existing) {
            await ctx.db.patch(existing._id, {
                igdbClientId: clientId,
                igdbClientSecret:
                    clientSecret && clientSecret.length > 0
                        ? clientSecret
                        : existing.igdbClientSecret,
                updatedByUserId: identity.subject,
                updatedAt: now,
            })
            return
        }

        if (!clientSecret || clientSecret.length === 0) {
            throw new ConvexError('IGDB_CLIENT_SECRET_REQUIRED')
        }

        await ctx.db.insert('integrationSettings', {
            key: 'igdb',
            igdbClientId: clientId,
            igdbClientSecret: clientSecret,
            updatedByUserId: identity.subject,
            createdAt: now,
            updatedAt: now,
        })
    },
})
