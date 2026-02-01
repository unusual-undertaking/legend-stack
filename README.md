# Legend Stack

A highly opinionated "batteries included" starter kit that lets devs build serious software quickly, using Convex, Tanstack Start, and Effect.

Heavily inspired by [Epic Stack](https://github.com/epicweb-dev/epic-stack).

## WARNING

This is a work in progress and is not yet ready for production use. I'm actively working on finishing up the initial work, docs, and instructions.

## Getting Started

To install dependencies:

```bash
npm install
```

To run (web + backend together):

```bash
npm run dev
```

To run separately (two terminals):

```bash
npm run dev:web
npm run dev:backend
```

If you need to configure Convex locally:

```bash
npm run dev:setup
```

To build:

```bash
npm run build
```

To deploy:

```bash
cd packages/backend
npx convex deploy
```

If you ever need to update the local Better Auth schema, run:

```bash
cd packages/backend/convex/betterAuth
npx @better-auth/cli generate -y
```

Note: certain options changes may require schema generation. The Better Auth docs will often note when this is the case.

## Stack

- Typescript
- Convex
- Tanstack (start/router/query/forms/etc.)
- Tailwind + Shadcn UI / BaseUI (moving to BaseUI as components become available)
- Cloudflare R2 for image storage
- Resend for emails
- Polar or Autumn for billing/subscriptions (undecided which one atm)

## R2 Setup (Cloudflare)

1. Create a Cloudflare account and an R2 bucket.
2. Add a CORS policy for the bucket (allow GET + PUT). For local dev with Vite:

```json
[
    {
        "AllowedOrigins": ["http://localhost:3000"],
        "AllowedMethods": ["GET", "PUT"],
        "AllowedHeaders": ["Content-Type"]
    }
]
```

3. Create an R2 API token with **Object Read & Write** for your bucket.
4. Set Convex environment variables (from the API token screen):

```bash
cd packages/backend
npx convex env set R2_TOKEN <token>
npx convex env set R2_ACCESS_KEY_ID <access-key-id>
npx convex env set R2_SECRET_ACCESS_KEY <secret-access-key>
npx convex env set R2_ENDPOINT <endpoint>
npx convex env set R2_BUCKET <bucket-name>
```

5. Start the app and open `/account` after signing in to upload a profile image.

Local dev note: if the R2 env vars are missing, uploads are disabled and a warning
is logged to the `npx convex dev` console. The UI will also show which variables
are missing.

## Notes

- Verifying emails and resetting passwords requires sending emails (project is configured for Resend) that contains a url that can be visited to complete the action, but locally (or when a Resend API key is not available) the verification urls will be logged to the console (the `npx convex dev` terminal window).

## TODO

- [x] [Local Better Auth setup](https://labs.convex.dev/better-auth/features/local-install)
- [x] Sign In / Sign Up (via Better Auth component)
- [x] Reset Passwords (via Better Auth component)
- [x] Email Verification (via Better Auth component)
- [x] Sign Out (via Better Auth component)
- [x] Set up Turborepo monorepo
- [x] Oxfmt & Oxlint setup
- [x] Lint-staged / husky pre-commit hook
- [ ] Account page
- [ ] Account page: Change password
- [ ] Subscriptions / Billing page - show subscription
- [ ] Upgrade to Pro functionality
- [ ] Notifications
- [ ] Comprehensive todo list functionality
- [ ] R2 Component integration
- [ ] Account page: profile pic uploader
- [ ] Presence Component
- [ ] Team / Org setup
- [x] Dark / light mode
- [ ] Social Sign-On: Google / Github / Apple
- [ ] Last Login Method (Better Auth utility w/social sign-on)
- [ ] Two factor auth (Better Auth util)
- [ ] Sentry setup guide
- [ ] Logging setup guide
- [ ] Analytics setup guide
- [ ] Save sidebar state to cookie
- [ ] Convex Effect integration
- [ ] Convex Ents integration
- [ ] Unit tests
- [ ] Integration tests
