import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Container } from "@/components/ui/container"

export const Route = createFileRoute("/sign-up")({
    component: SignUp,
    beforeLoad: ({ context }) => {
        if (context.isAuthenticated) {
            throw redirect({ to: "/" })
        }
    },
})

type FieldErrors = {
    email?: string
    password?: string
    passwordConfirmation?: string
}

function parseErrorMessage(message: string): FieldErrors {
    const errors: FieldErrors = {}

    if (message.includes("Invalid email") || message.includes("[body.email]")) {
        errors.email = "Please enter a valid email address"
    }
    if (message.includes("[body.password]") || message.includes("Too small")) {
        errors.password = "Password is required"
    }
    if (message.includes("Password must be at least")) {
        errors.password = message
    }
    if (message.includes("User already exists")) {
        errors.email = "An account with this email already exists"
    }

    // If we couldn't parse specific errors, show the original
    if (Object.keys(errors).length === 0) {
        errors.email = message
    }

    return errors
}

function SignUp() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [loading, setLoading] = useState(false)
    const [signUpComplete, setSignUpComplete] = useState(false)
    const [errors, setErrors] = useState<FieldErrors>({})

    const validate = (): boolean => {
        const newErrors: FieldErrors = {}

        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (!password) {
            newErrors.password = "Password is required"
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
        }

        if (password && password !== passwordConfirmation) {
            newErrors.passwordConfirmation = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSignUp = async () => {
        if (!validate()) return

        const { data, error } = await authClient.signUp.email(
            {
                email,
                password,
                name: `${firstName} ${lastName}`,
            },
            {
                onRequest: () => {
                    setLoading(true)
                    setErrors({})
                },
                onSuccess: async () => {
                    setLoading(false)
                    setSignUpComplete(true)
                },
                onError: async (ctx) => {
                    setLoading(false)
                    setErrors(parseErrorMessage(ctx.error.message))
                },
            },
        )
        console.log({ data, error })
    }

    if (signUpComplete) {
        return (
            <Container>
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-lg md:text-xl">Check your email</CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                            We've sent a verification link to{" "}
                            <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Click the link in the email to verify your account and get started. If
                            you don't see it, check your spam folder.
                        </p>
                    </CardContent>
                </Card>
                <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                    Already verified?{" "}
                    <Link
                        to="/sign-in"
                        className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                    >
                        Sign in
                    </Link>
                </p>
            </Container>
        )
    }

    return (
        <Container>
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input
                                    id="first-name"
                                    placeholder="Jane"
                                    required
                                    onChange={(e) => {
                                        setFirstName(e.target.value)
                                    }}
                                    value={firstName}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input
                                    id="last-name"
                                    placeholder="Doe"
                                    required
                                    onChange={(e) => {
                                        setLastName(e.target.value)
                                    }}
                                    value={lastName}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                required
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (errors.email)
                                        setErrors((prev) => ({
                                            ...prev,
                                            email: undefined,
                                        }))
                                }}
                                value={email}
                            />
                            <p
                                className={`text-xs h-4 ${errors.email ? "text-destructive" : "invisible"}`}
                            >
                                {errors.email || "\u00A0"}
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (errors.password)
                                        setErrors((prev) => ({
                                            ...prev,
                                            password: undefined,
                                        }))
                                }}
                                autoComplete="new-password"
                                placeholder="Password"
                            />
                            <p
                                className={`text-xs h-4 ${errors.password ? "text-destructive" : "invisible"}`}
                            >
                                {errors.password || "\u00A0"}
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => {
                                    setPasswordConfirmation(e.target.value)
                                    if (errors.passwordConfirmation)
                                        setErrors((prev) => ({
                                            ...prev,
                                            passwordConfirmation: undefined,
                                        }))
                                }}
                                autoComplete="new-password"
                                placeholder="Confirm Password"
                            />
                            <p
                                className={`text-xs h-4 ${errors.passwordConfirmation ? "text-destructive" : "invisible"}`}
                            >
                                {errors.passwordConfirmation || "\u00A0"}
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            onClick={handleSignUp}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Create an account"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <p className="text-center mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Already have an account?{" "}
                <Link
                    to="/sign-in"
                    className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                >
                    Sign in
                </Link>
            </p>
        </Container>
    )
}
