// IMPORTANT: this is a Convex Node Action
"use node"
import { components } from "./_generated/api"
import { Resend } from "@convex-dev/resend"
import { internalAction } from "./_generated/server"
import { v } from "convex/values"
import { render, pretty } from "@react-email/render"
import { Text, Html, Button, Section } from "@react-email/components"

// Check if Resend is configured - if not, we'll log URLs to console for local dev
const isResendConfigured = !!process.env.RESEND_API_KEY

export const resend: Resend = new Resend(components.resend, {
    testMode: false,
})

/**
 * Sends a verification email with a link to verify the user's email address.
 * The URL contains a token that expires after a set time (configured in Better Auth).
 *
 * @param email - The recipient's email address
 * @param url - The full verification URL with token (provided by Better Auth)
 */
export const sendVerificationEmail = internalAction({
    args: {
        email: v.string(),
        url: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        // Dev mode: log URL to console instead of sending email
        if (!isResendConfigured) {
            console.log("\n" + "=".repeat(60))
            console.log("📧 VERIFICATION EMAIL (dev mode - no email sent)")
            console.log("=".repeat(60))
            console.log(`To: ${args.email}`)
            console.log(`Verification URL: ${args.url}`)
            console.log("=".repeat(60) + "\n")
            return null
        }

        const html = await pretty(
            await render(
                <Html>
                    <Text>
                        Welcome! Please verify your email address to get started.
                    </Text>
                    <Section style={{ textAlign: "center", margin: "32px 0" }}>
                        <Button
                            href={args.url}
                            style={{
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                padding: "12px 24px",
                                borderRadius: "6px",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "16px",
                                display: "inline-block",
                            }}
                        >
                            Verify Email
                        </Button>
                    </Section>
                    <Text
                        style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            wordBreak: "break-all",
                        }}
                    >
                        If the button doesn't work, copy and paste this link into
                        your browser:{" "}
                        <a
                            href={args.url}
                            style={{ color: "#2563eb" }}
                        >
                            {args.url}
                        </a>
                    </Text>
                    <Text>
                        If you didn't create an account, you can safely ignore this email.
                    </Text>
                </Html>,
            ),
        )

        await resend.sendEmail(ctx, {
            from: "Title <noreply@emails.domain.com>",
            to: args.email,
            subject: "Title | Verify your email",
            html,
        })

        return null
    },
})

/**
 * Sends a password reset email with a link to reset the user's password.
 * The URL contains a token that expires after a set time (configured in Better Auth).
 *
 * @param email - The recipient's email address
 * @param url - The full reset URL with token (provided by Better Auth)
 */
export const sendPasswordResetEmail = internalAction({
    args: {
        email: v.string(),
        url: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        // Dev mode: log URL to console instead of sending email
        if (!isResendConfigured) {
            console.log("\n" + "=".repeat(60))
            console.log("🔐 PASSWORD RESET EMAIL (dev mode - no email sent)")
            console.log("=".repeat(60))
            console.log(`To: ${args.email}`)
            console.log(`Reset URL: ${args.url}`)
            console.log("=".repeat(60) + "\n")
            return null
        }

        const html = await pretty(
            await render(
                <Html>
                    <Text>
                        You requested a password reset for your account.
                    </Text>
                    <Text>
                        Click the link below to reset your password:
                    </Text>
                    <Text>
                        <a href={args.url}>{args.url}</a>
                    </Text>
                    <Text>
                        If you didn't request this, you can safely ignore this email.
                    </Text>
                    <Text>
                        This link will expire in 1 hour.
                    </Text>
                </Html>,
            ),
        )

        await resend.sendEmail(ctx, {
            from: "Title <noreply@emails.domain.com>",
            to: args.email,
            subject: "Title | Reset your password",
            html,
        })

        return null
    },
})
