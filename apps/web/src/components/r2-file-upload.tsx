import type { ChangeEvent, FormEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { useUploadFile } from "@convex-dev/r2/react"
import { api } from "@convex-tanstack-starter-kit/backend/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export function R2FileUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const uploadFile = useUploadFile(api.r2)
    const setCurrentUserAvatar = useMutation(api.r2.setCurrentUserAvatar)
    const status = useQuery(api.r2.r2Status, {})
    const profile = useQuery(api.r2.getCurrentUserProfile, {})

    const previewUrl = useMemo(() => {
        if (!file) {
            return null
        }
        return URL.createObjectURL(file)
    }, [file])

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const isEnabled = status?.enabled ?? false
    const isDisabled = !isEnabled || isUploading
    const avatarSrc = previewUrl ?? profile?.avatarUrl ?? undefined
    const initials = profile?.email?.slice(0, 1)?.toUpperCase() ?? "U"

    const resetFileInput = () => {
        setFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null
        if (!selectedFile) {
            resetFileInput()
            return
        }

        if (!selectedFile.type.startsWith("image/")) {
            toast.error("Only image files are supported.")
            resetFileInput()
            return
        }

        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            toast.error("Image must be 5MB or smaller.")
            resetFileInput()
            return
        }

        setFile(selectedFile)
    }

    const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!file) {
            return
        }

        if (!isEnabled) {
            toast.error("R2 is not configured. Uploads are disabled.")
            return
        }

        try {
            setIsUploading(true)
            const key = await uploadFile(file)
            await setCurrentUserAvatar({ key })
            toast.success("Profile image updated.")
            resetFileInput()
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Upload failed. Please try again."
            toast.error(message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="space-y-2">
                <CardTitle>Profile Image</CardTitle>
                <CardDescription>Upload a new profile image to Cloudflare R2.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarSrc} alt="Profile image" />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-muted-foreground">
                        {profile?.avatarKey
                            ? "Current image stored in R2."
                            : "No profile image set yet."}
                    </div>
                </div>

                {!isEnabled && status?.missing?.length ? (
                    <div className="mb-4 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        R2 is not configured. Missing env vars: {status.missing.join(", ")}
                    </div>
                ) : null}

                <form className="grid gap-4" onSubmit={handleUpload}>
                    <div className="grid gap-2">
                        <Label htmlFor="avatar">Choose an image</Label>
                        <Input
                            id="avatar"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            disabled={isDisabled}
                            onChange={handleFileChange}
                        />
                    </div>

                    <Button type="submit" disabled={isDisabled || !file}>
                        {isUploading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            "Upload image"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
