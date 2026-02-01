import { AuthFunctions, createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { internalAction, query, QueryCtx } from "./_generated/server";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { withoutSystemFields } from "convex-helpers";
import authConfig from "./auth.config";
import { ConvexError } from "convex/values";
import betterAuthSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL;

const authFunctions: AuthFunctions = internal.auth;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof betterAuthSchema>(
  components.betterAuth,
  {
    authFunctions,
    verbose: false,
    local: {
      schema: betterAuthSchema,
    },
    triggers: {
      user: {
        onCreate: async (ctx, authUser) => {
          const userId = await ctx.db.insert("users", {
            email: authUser.email,
          });
          // TODO: remove the deprecated setUserId call
          await authComponent.setUserId(ctx, authUser._id, userId);
        },
        onUpdate: async (ctx, newUser, oldUser) => {
          if (oldUser.email === newUser.email) {
            return;
          }

          await ctx.db.patch(newUser.userId as Id<"users">, {
            email: newUser.email,
          });
        },
        onDelete: async (ctx, authUser) => {
          const user = await ctx.db.get(authUser.userId as Id<"users">);
          if (!user) return;

          // Cascade-style deletions here for user data
          // const todos = await ctx.db
          //     .query("todos")
          //     .withIndex("userId", (q) => q.eq("userId", user._id))
          //     .collect()
          // await asyncMap(todos, async (todo) => {
          //     await ctx.db.delete(todo._id)
          // })
          // await ctx.db.delete(user._id)
        },
      },
    },
  },
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const { getAuthUser } = authComponent.clientApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 900, // 15 minutes
      sendResetPassword: async ({ user, url }, _request) => {
        // scheduler is only available in action/mutation contexts
        // This callback is only invoked during auth flows (HTTP actions)
        if ("scheduler" in ctx) {
          await ctx.scheduler
            .runAfter(0, internal.emails.sendPasswordResetEmail, {
              email: user.email,
              url,
            })
            .catch((err) => {
              console.error("sendPasswordResetEmail scheduler failed", { err, email: user.email });
            });
        }
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }, _request) => {
        // scheduler is only available in action/mutation contexts
        // This callback is only invoked during auth flows (HTTP actions)
        if ("scheduler" in ctx) {
          await ctx.scheduler
            .runAfter(0, internal.emails.sendVerificationEmail, {
              email: user.email,
              url,
            })
            .catch((err) => {
              console.error("sendVerificationEmail scheduler failed", { err, email: user.email });
            });
        }
      },
      async afterEmailVerification(user, _request) {
        // Your custom logic here, e.g., grant access to premium features
        console.log(`${user.email} has been successfully verified!`);
      },
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

export const rotateKeys = internalAction({
  args: {},
  handler: async (ctx) => {
    const auth = createAuth(ctx);
    return auth.api.rotateKeys();
  },
});

// Below are example functions for getting the current user
// Feel free to edit, omit, etc.
export const safeGetUser = async (ctx: QueryCtx) => {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    return;
  }
  const user = await ctx.db.get(authUser.userId as Id<"users">);
  if (!user) {
    return;
  }
  return { ...user, ...withoutSystemFields(authUser) };
};

export const getUser = async (ctx: QueryCtx) => {
  const user = await safeGetUser(ctx);
  if (!user) {
    throw new ConvexError("Unauthenticated");
  }
  return user;
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getUser(ctx);
  },
});

export const hasPassword = query({
  args: {},
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const accounts = await auth.api.listUserAccounts({
      headers,
    });
    return accounts.some((account) => account.providerId === "credential");
  },
});
