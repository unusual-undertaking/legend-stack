import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Container } from "@/components/ui/container";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
    component: ForgotPassword,
    beforeLoad: ({ context }) => {
        if (context.isAuthenticated) {
            throw redirect({ to: "/" });
        }
    },
});

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const base =
                import.meta.env.VITE_SITE_URL ??
                (typeof window !== "undefined" ? window.location.origin : "");
            const redirectTo = new URL("/reset-password", base).toString();
            await authClient.requestPasswordReset({
                email,
                redirectTo,
            });
            setEmailSent(true);
        } catch {
            setError("Failed to send reset password link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <Container>
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg md:text-xl">
                            Check your email
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                            We've sent a password reset link to{" "}
                            <span className="font-medium text-neutral-200">
                                {email}
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-neutral-400">
                            Click the link in the email to reset your password.
                            If you don't see it, check your spam folder.
                        </p>
                    </CardContent>
                </Card>
                <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                    Remember your password?{" "}
                    <Link
                        to="/sign-in"
                        className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                    >
                        Sign in
                    </Link>
                </p>
            </Container>
        );
    }

    return (
        <Container>
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">
                        Forgot your password?
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Enter your email and we'll send you a link to reset your
                        password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Send reset link"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Remember your password?{" "}
                <Link
                    to="/sign-in"
                    className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                >
                    Sign in
                </Link>
            </p>
        </Container>
    );
}
