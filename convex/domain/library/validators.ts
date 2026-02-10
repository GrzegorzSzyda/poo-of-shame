import { v } from 'convex/values'

export const platformValidator = v.union(
    v.literal('ps_disc'),
    v.literal('ps_store'),
    v.literal('ps_plus'),
    v.literal('steam'),
    v.literal('epic'),
    v.literal('gog'),
    v.literal('amazon_gaming'),
    v.literal('ubisoft_connect'),
    v.literal('xbox'),
    v.literal('switch'),
    v.literal('other'),
)

export const progressStatusValidator = v.union(
    v.literal('backlog'),
    v.literal('playing'),
    v.literal('completed'),
    v.literal('done'),
    v.literal('dropped'),
)
