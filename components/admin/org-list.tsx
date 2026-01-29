"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface Organization {
    id: string
    name: string
    slug: string
    createdAt: string | Date
    _count?: {
        projects: number
        members: number
    }
}

interface OrgListProps {
    organizations: Organization[]
}

export function OrgList({ organizations }: OrgListProps) {
    const router = useRouter()

    async function deleteOrg(id: string) {
        if (!confirm("Are you sure? This will delete all projects and content within this organization.")) return

        try {
            const response = await fetch(`/api/organizations/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Organization deleted")
            router.refresh()
        } catch (error) {
            toast.error("Failed to delete organization")
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {organizations.map((org) => (
                        <TableRow key={org.id}>
                            <TableCell className="font-medium">{org.name}</TableCell>
                            <TableCell>{org.slug}</TableCell>
                            <TableCell>{org._count?.projects || 0}</TableCell>
                            <TableCell>{org._count?.members || 0}</TableCell>
                            <TableCell>{formatDate(org.createdAt)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${org.slug}`)}>
                                            Manage
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => deleteOrg(org.id)}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {organizations.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                No organizations found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
