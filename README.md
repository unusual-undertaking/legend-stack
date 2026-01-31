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

To run:

```bash
npx vite dev
npx convex dev
```

To build:

```bash
npm run build
```

To deploy:

```bash
npx convex deploy
```

If you ever need to update the local Better Auth schema, run:

```bash
cd convex/betterAuth
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

## Notes

- Verifying emails and resetting passwords requires sending emails (project is configured for Resend) that contains a url that can be visited to complete the action, but locally (or when a Resend API key is not available) the verification urls will be logged to the console (the `npx convex dev` terminal window). 

## TODO

- [x] [Local Better Auth setup](https://labs.convex.dev/better-auth/features/local-install)
- [x] Sign In / Sign Up (via Better Auth component)
- [x] Reset Passwords (via Better Auth component)
- [x] Email Verification (via Better Auth component)
- [x] Sign Out (via Better Auth component)
- [ ] Oxfmt & Oxlint setup
- [ ] Lint stage pre-commit hook
- [ ] Convex Effect setup
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
- [ ] Dark / light mode
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
