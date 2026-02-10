import { ConvexError } from 'convex/values'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { ERRORS } from './errors'

type Identity = {
    subject: string
    tokenIdentifier: string
}

const normalizeIdentifier = (value: string) => {
    const trimmed = value.trim().replace(/^['"]|['"]$/g, '')
    if (trimmed.length === 0) return ''
    return trimmed
}

const parseAdmins = () =>
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

const getUserIdFromIdentity = (identity: Identity) => {
    const userId = [...getAuthCandidates(identity)][0]
    return userId ?? null
}

const canManageByCandidates = (authCandidates: Set<string>) => {
    const admins = parseAdmins()
    if (admins.length === 0) {
        return false
    }

    return admins.some((admin) => {
        const adminCandidates = toCandidates(admin)
        return adminCandidates.some((candidate) => authCandidates.has(candidate))
    })
}

const requireIdentity = async (ctx: QueryCtx | MutationCtx): Promise<Identity> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
        throw new ConvexError(ERRORS.UNAUTHORIZED)
    }
    return identity
}

export const canManageGamesIdentity = (identity: Identity | null) => {
    if (!identity) return false

    const authCandidates = getAuthCandidates(identity)
    if (authCandidates.size === 0) return false

    return canManageByCandidates(authCandidates)
}

export const ensureAuthUserId = async (ctx: QueryCtx | MutationCtx): Promise<string> => {
    const identity = await requireIdentity(ctx)
    const userId = getUserIdFromIdentity(identity)
    if (!userId) {
        throw new ConvexError(ERRORS.UNAUTHORIZED)
    }
    return userId
}

export const ensureCanManageGames = async (ctx: MutationCtx): Promise<string> => {
    const identity = await requireIdentity(ctx)
    const authCandidates = getAuthCandidates(identity)
    const userId = [...authCandidates][0]
    if (!userId) {
        throw new ConvexError(ERRORS.UNAUTHORIZED)
    }

    if (!canManageByCandidates(authCandidates)) {
        throw new ConvexError(ERRORS.FORBIDDEN)
    }
    return userId
}
