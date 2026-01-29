
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { DynamicContentForm } from "@/components/content-builder/dynamic-form"

export default function EditContentPage() {
    const router = useRouter()
    const params = useParams()
    const typeSlug = params?.typeSlug as string
    const id = params?.id as string

    const [contentType, setContentType] = useState<any>(null)
    const [contentItem, setContentItem] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (typeSlug && id) fetchData()
    }, [typeSlug, id])

    const fetchData = async () => {
        try {
            // 1. Fetch the item to ensure it exists and we get the data
            const itemRes = await fetch(`/api/content-items/${typeSlug}/${id}`)
            if (!itemRes.ok) throw new Error("Failed to fetch item")
            const item = await itemRes.json()
            setContentItem(item)

            // 2. Fetch the content type details (using the ID from item or lookup by slug)
            // Since item has contentTypeId, we can use that to be direct
            const typeId = item.contentTypeId || item.contentType?.id

            const typeRes = await fetch(`/api/content-types/${typeId}`)
            if (!typeRes.ok) throw new Error("Failed to fetch type details")
            const type = await typeRes.json()
            setContentType(type)

        } catch (error) {
            console.error(error)
            toast.error("Failed to load content")
            router.push(`/dashboard/content/${typeSlug}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (data: any, published: boolean) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/content-items/${typeSlug}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data, published }),
            })

            if (!res.ok) throw new Error("Failed to update")

            toast.success("Content updated successfully")
            // Don't redirect immediately to allow further edits, or redirect to list
            router.push(`/dashboard/content/${typeSlug}`)
        } catch (error) {
            toast.error("Failed to update content")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!contentType || !contentItem) return <div className="p-8">Content not found</div>

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit {contentType.name}</h1>
            </div>

            <DynamicContentForm
                contentType={contentType}
                initialData={contentItem.data}
                initialPublished={contentItem.published}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
