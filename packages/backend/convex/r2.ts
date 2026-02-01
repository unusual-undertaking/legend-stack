import { ConvexError, v } from "convex/values";
import { R2 } from "@convex-dev/r2";
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { authComponent } from "./auth";
import { Id } from "./_generated/dataModel";

const requiredR2EnvVars = [
  "R2_TOKEN",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET",
] as const;

type R2EnvVar = (typeof requiredR2EnvVars)[number];

const getR2EnvStatus = () => {
  const missing = requiredR2EnvVars.filter((key) => !process.env[key]) as R2EnvVar[];
  return {
    enabled: missing.length === 0,
    missing,
  };
};

const getAvatarKeyPrefix = (userId: Id<"users">) => `avatars/${userId}/`;

const buildAvatarKey = (userId: Id<"users">) =>
  `${getAvatarKeyPrefix(userId)}${crypto.randomUUID()}`;

const getR2ClientOptions = () => {
  const status = getR2EnvStatus();
  if (status.enabled) {
    return {
      R2_BUCKET: process.env.R2_BUCKET!,
      R2_ENDPOINT: process.env.R2_ENDPOINT!,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
    };
  }

  return {
    R2_BUCKET: "missing",
    R2_ENDPOINT: "http://localhost",
    R2_ACCESS_KEY_ID: "missing",
    R2_SECRET_ACCESS_KEY: "missing",
  };
};

const r2 = new R2(components.r2, getR2ClientOptions());

let hasLoggedMissingR2Env = false;

const logMissingR2Env = (missing: R2EnvVar[]) => {
  if (hasLoggedMissingR2Env) {
    return;
  }

  console.warn("R2 is not configured; uploads are disabled.", {
    missing,
  });
  hasLoggedMissingR2Env = true;
};

const assertCanUpload = async (ctx: Parameters<typeof authComponent.safeGetAuthUser>[0]) => {
  const status = getR2EnvStatus();
  if (!status.enabled) {
    logMissingR2Env(status.missing);
    throw new ConvexError(
      "R2 is not configured in this environment. Set the required env vars to enable uploads.",
    );
  }

  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser || !authUser.userId) {
    throw new ConvexError("Unauthenticated");
  }

  return authUser;
};

export const r2Status = query({
  args: {},
  handler: async () => {
    const status = getR2EnvStatus();
    if (!status.enabled) {
      logMissingR2Env(status.missing);
    }
    return status;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await assertCanUpload(ctx);
    const userId = authUser.userId as Id<"users">;
    const key = buildAvatarKey(userId);
    return await r2.generateUploadUrl(key);
  },
});

const { syncMetadata } = r2.clientApi({
  checkUpload: assertCanUpload,
});

export { syncMetadata };

export const setCurrentUserAvatar = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser || !authUser.userId) {
      throw new ConvexError("Unauthenticated");
    }

    const userId = authUser.userId as Id<"users">;
    const prefix = getAvatarKeyPrefix(userId);
    if (!args.key.startsWith(prefix)) {
      throw new ConvexError("Invalid avatar key.");
    }

    await ctx.db.patch(userId, {
      avatarKey: args.key,
    });
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser || !authUser.userId) {
      return null;
    }

    const userId = authUser.userId as Id<"users">;
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const { enabled } = getR2EnvStatus();
    const avatarKey = (user as { avatarKey?: string }).avatarKey;
    const prefix = getAvatarKeyPrefix(userId);
    const canServeAvatar = enabled && avatarKey && avatarKey.startsWith(prefix);
    const avatarUrl = canServeAvatar ? await r2.getUrl(avatarKey) : null;

    return {
      ...user,
      avatarKey: avatarKey ?? null,
      avatarUrl,
    };
  },
});
