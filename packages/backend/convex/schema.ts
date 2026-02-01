import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    users: defineTable({
        email: v.string(),
        avatarKey: v.optional(v.string()),
    }),
    tasks: defineTable({
        text: v.string(),
        isCompleted: v.boolean(),
    }),
})
