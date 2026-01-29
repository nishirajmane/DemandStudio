
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface ContentType {
    id: string
    name: string
    slug: string
    description?: string
    _count: {
        items: number
    }
}

export default function BuilderPage() {
    const router = useRouter()
    const [contentTypes, setContentTypes] = useState<ContentType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newType, setNewType] = useState({ name: "", slug: "", description: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchContentTypes()
    }, [])

    const fetchContentTypes = async () => {
        try {
            const res = await fetch("/api/content-types")
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setContentTypes(data)
        } catch (error) {
            toast.error("Failed to load content types")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch("/api/content-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newType),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Failed to create")
            }

            await fetchContentTypes()
            setIsCreateOpen(false)
            setNewType({ name: "", slug: "", description: "" })
            toast.success("Content type created successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create content type")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all content items of this type.")) return

        try {
            const res = await fetch(`/api/content-types/${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Content type deleted")
            fetchContentTypes()
        } catch (error) {
            toast.error("Failed to delete content type")
        }
    }

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")

        setNewType(prev => ({ ...prev, name, slug }))
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Type Builder</h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage dynamic content types for your CMS.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Create Content Type</DialogTitle>
                                <DialogDescription>
                                    Define a new content type. You can add fields later.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newType.name}
                                        onChange={handleNameChange}
                                        placeholder="e.g. Testimonials"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={newType.slug}
                                        onChange={(e) => setNewType({ ...newType, slug: e.target.value })}
                                        placeholder="e.g. testimonials"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={newType.description}
                                        onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                                        placeholder="Brief description of this content type"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Content Type"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Content Types</CardTitle>
                    <CardDescription>
                        Manage your content schemas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : contentTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No content types found. Create your first one!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contentTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{type.slug}</TableCell>
                                        <TableCell>{type.description || "-"}</TableCell>
                                        <TableCell>{type._count.items}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/dashboard/builder/${type.id}`)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(type.id)}
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
