"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ExternalLink, Settings, Trash } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface Project {
    id: string
    name: string
    slug: string
    description?: string | null
    createdAt: string | Date
}

interface ProjectListProps {
    projects: Project[]
    orgSlug: string
}

export function ProjectList({ projects, orgSlug }: ProjectListProps) {
    const router = useRouter()

    async function deleteProject(id: string) {
        if (!confirm("Are you sure? This will delete all content types and items within this project.")) return

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Project deleted")
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete project")
        }
    }

    if (projects.length === 0) {
        return (
            <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">No projects added</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        You haven&apos;t added any projects to this organization yet.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <Card key={project.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            {project.name}
                        </CardTitle>
                        <CardDescription>{project.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Created {formatDate(project.createdAt)}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/${orgSlug}/${project.slug}`)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteProject(project.id)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
