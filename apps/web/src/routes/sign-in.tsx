import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export const Route = createFileRoute("/sign-in")({
    component: SignIn,
    beforeLoad: ({ context }) => {
        if (context.isAuthenticated) {
            throw redirect({ to: "/" })
        }
    },
})

function SignIn() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSignIn = async () => {
        const { data, error } = await authClient.signIn.email(
            {
                email,
                password,
            },
            {
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: async (ctx) => {
                    setLoading(false)
                    if (ctx.data.twoFactorRedirect) {
                        //await navigate({ to: '/verify-2fa' })
                    } else {
                        await navigate({ to: "/" })
                    }
                },
                onError: (ctx) => {
                    setLoading(false)
                    alert(ctx.error.message)
                },
            },
        )

        console.log({ data, error })
    }

    return (
        <Container>
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            void handleSignIn()
                        }}
                        className="grid gap-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                required
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                                value={email}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                autoComplete="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Don&apos;t have an account?{" "}
                <Link
                    to="/sign-up"
                    className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                >
                    Sign up
                </Link>
            </p>
        </Container>
    )
}
