
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { Plus, Pencil, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface ContentItem {
    id: string
    data: any
    published: boolean
    createdAt: string
    updatedAt: string
}

interface ContentType {
    id: string
    name: string
    slug: string
    description?: string
    fields: any[]
}

export default function ContentListPage() {
    const router = useRouter()
    const params = useParams()
    const typeSlug = params?.typeSlug as string

    const [contentType, setContentType] = useState<ContentType | null>(null)
    const [items, setItems] = useState<ContentItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (typeSlug) fetchData()
    }, [typeSlug])

    const fetchData = async () => {
        try {
            // Fetch type info first (could be optimized in one call but separating for now)
            // Actually we need to search type by slug, but our types GET /api/content-types return all or by ID.
            // Let's rely on the list items endpoint which validates slug, but we need the type name for the header.
            // A dedicated GET /api/content-types?slug=xyz would be better, but we can filter the list if needed,
            // OR let's iterate. 
            // Current API constraint: GET /api/content-types returns ALL. We can find it there.

            const [typesRes, itemsRes] = await Promise.all([
                fetch("/api/content-types"),
                fetch(`/api/content-items/${typeSlug}`)
            ])

            if (!typesRes.ok || !itemsRes.ok) throw new Error("Failed to fetch data")

            const types = await typesRes.json()
            const type = types.find((t: ContentType) => t.slug === typeSlug)

            if (!type) {
                throw new Error("Content type not found")
            }

            setContentType(type)
            setItems(await itemsRes.json())
        } catch (error) {
            console.error(error)
            toast.error("Failed to load content")
            // router.push("/dashboard") 
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return

        try {
            const res = await fetch(`/api/content-items/${typeSlug}/${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Item deleted")
            fetchData() // Refresh
        } catch (error) {
            toast.error("Failed to delete item")
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!contentType) return <div className="p-8">Content type not found</div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{contentType.name}</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your {contentType.name.toLowerCase()}.
                    </p>
                </div>
                <Link href={`/dashboard/content/${typeSlug}/new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New {contentType.name}
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All {contentType.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title / Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No items found. Create your first one!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {/* Try to guess the "Title" field. Fallback to ID or "Untitled" */}
                                            {item.data.title || item.data.name || item.data.headline || item.data.slug || "Untitled"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.published ? "default" : "secondary"}>
                                                {item.published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(item.updatedAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Preview link could be added if we have a frontend route for it */}
                                                <Link href={`/dashboard/content/${typeSlug}/${item.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
