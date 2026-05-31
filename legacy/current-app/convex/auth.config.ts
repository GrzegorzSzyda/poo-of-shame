import { type AuthConfig } from 'convex/server'

const clerkIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN

if (!clerkIssuerDomain || clerkIssuerDomain.trim().length === 0) {
    throw new Error('Missing CLERK_JWT_ISSUER_DOMAIN for Convex auth provider config.')
}

export default {
    providers: [
        {
            domain: clerkIssuerDomain,
            applicationID: 'convex',
        },
    ],
} satisfies AuthConfig
