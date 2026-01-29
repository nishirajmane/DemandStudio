"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface Member {
    id: string
    role: string
    user: {
        id: string
        name: string | null
        email: string
    }
}

interface OrgMembersManagerProps {
    orgId: string
    initialMembers: Member[]
}

export function OrgMembersManager({ orgId, initialMembers }: OrgMembersManagerProps) {
    const [members, setMembers] = React.useState<Member[]>(initialMembers)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [newMemberEmail, setNewMemberEmail] = React.useState("")
    const [newMemberPassword, setNewMemberPassword] = React.useState("")
    const [newMemberRole, setNewMemberRole] = React.useState("MEMBER")
    const router = useRouter()

    async function addMember() {
        if (!newMemberEmail) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/organizations/${orgId}/members`, {
                method: "POST",
                body: JSON.stringify({ email: newMemberEmail, role: newMemberRole, password: newMemberPassword }),
                headers: { "Content-Type": "application/json" },
            })

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error || "Failed to add member")
            }

            const newMember = await res.json()
            setMembers([...members, newMember])
            setNewMemberEmail("")
            setNewMemberPassword("")
            setIsDialogOpen(false)
            toast.success("Member added successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Failed to add member")
        } finally {
            setIsLoading(false)
        }
    }

    async function removeMember(memberId: string) {
        if (!confirm("Are you sure you want to remove this member?")) return

        try {
            const res = await fetch(`/api/organizations/${orgId}/members?memberId=${memberId}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to remove member")

            setMembers(members.filter((m) => m.id !== memberId))
            toast.success("Member removed")
            router.refresh()
        } catch (error) {
            toast.error("Failed to remove member")
        }
    }

    async function updateRole(memberId: string, newRole: string) {
        try {
            const res = await fetch(`/api/organizations/${orgId}/members`, {
                method: "PATCH",
                body: JSON.stringify({ memberId, role: newRole }),
                headers: { "Content-Type": "application/json" },
            })

            if (!res.ok) throw new Error("Failed to update role")

            setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
            toast.success("Role updated")
            router.refresh()
        } catch (error) {
            toast.error("Failed to update role")
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Members</CardTitle>
                    <CardDescription>Users belonging to this organization</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Member</DialogTitle>
                            <DialogDescription>
                                Add a user to this organization. If the user does not exist, an account will be created with the provided password.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="user@example.com"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password (Optional if user exists)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="******"
                                    value={newMemberPassword}
                                    onChange={(e) => setNewMemberPassword(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OWNER">Owner</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="MEMBER">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={addMember} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Member
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase">
                                    {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{member.user.name || "Unknown User"}</p>
                                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <BadgeRole role={member.role} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => updateRole(member.id, "OWNER")}>
                                            Make Owner
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateRole(member.id, "ADMIN")}>
                                            Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateRole(member.id, "MEMBER")}>
                                            Make Member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => removeMember(member.id)}>
                                            Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                            No members found.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function BadgeRole({ role }: { role: string }) {
    const styles = {
        OWNER: "bg-primary/20 text-primary border-primary/50",
        ADMIN: "bg-blue-500/20 text-blue-600 border-blue-500/50",
        MEMBER: "bg-secondary text-secondary-foreground border-border",
    }[role] || "bg-secondary text-secondary-foreground"

    return (
        <div className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${styles}`}>
            {role.toLowerCase()}
        </div>
    )
}
