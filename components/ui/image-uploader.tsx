"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Copy, Check, Download } from "lucide-react"

interface ImageUploaderProps {
    value?: string
    onChange: (url: string) => void
    label?: string
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Upload failed")

            const data = await res.json()
            onChange(data.url)
        } catch (error) {
            console.error("Upload error:", error)
            alert("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const copyToClipboard = () => {
        if (value) {
            navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}

            <div className="border rounded-lg p-4 space-y-4">
                {value ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                        <img src={value} alt="Preview" className="h-full w-full object-cover" />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => onChange("")}
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-md bg-muted/50">
                        <div className="text-center space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Upload or paste URL below</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                    />
                    <div className="relative">
                        <Input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleUpload}
                            accept="image/*"
                            disabled={isUploading}
                        />
                        <Button type="button" variant="outline" disabled={isUploading}>
                            {isUploading ? "Uploading..." : <Upload className="h-4 w-4" />}
                        </Button>
                    </div>

                    {value && (
                        <>
                            <Button type="button" variant="outline" size="icon" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button type="button" variant="outline" size="icon" asChild>
                                <a href={value} download target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
