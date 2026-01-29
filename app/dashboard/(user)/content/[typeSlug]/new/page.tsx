
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { DynamicContentForm } from "@/components/content-builder/dynamic-form"

export default function NewContentPage() {
    const router = useRouter()
    const params = useParams()
    const typeSlug = params?.typeSlug as string

    const [contentType, setContentType] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (typeSlug) fetchContentType()
    }, [typeSlug])

    const fetchContentType = async () => {
        try {
            // We need to match slug. Current API GET /api/content-types returns all.
            // Optimization: create endpoint /api/content-types/by-slug/[slug] in future.
            const res = await fetch("/api/content-types")
            if (!res.ok) throw new Error("Failed to fetch types")

            const types = await res.json()
            const type = types.find((t: any) => t.slug === typeSlug)

            if (!type) throw new Error("Content type not found")

            // We need FULL fields details. If the list API doesn't return fields, we need to fetch specific ID.
            // Based on my implementation: GET /api/content-types returns list with _count.items, NO fields.
            // GET /api/content-types/[id] returns fields.
            // Be careful: I must fetch the detail.

            const detailRes = await fetch(`/api/content-types/${type.id}`)
            if (!detailRes.ok) throw new Error("Failed to fetch type details")

            const detail = await detailRes.json()
            setContentType(detail)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load content type")
            router.push(`/dashboard/content/${typeSlug}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (data: any, published: boolean) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/content-items/${typeSlug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data, published }),
            })

            if (!res.ok) throw new Error("Failed to create")

            toast.success("Content created successfully")
            router.push(`/dashboard/content/${typeSlug}`)
        } catch (error) {
            toast.error("Failed to create content")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!contentType) return <div className="p-8">Content type not found</div>

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">New {contentType.name}</h1>
            </div>

            <DynamicContentForm
                contentType={contentType}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
