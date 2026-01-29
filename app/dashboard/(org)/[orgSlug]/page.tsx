import { auth } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { ProjectForm } from "@/components/admin/project-form"
import { ProjectList } from "@/components/admin/project-list"

// interface OrgDashboardProps removed as it is replaced by inline type

export default async function OrgDashboardPage(props: { params: Promise<{ orgSlug: string }> }) {
    const params = await props.params;
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const org = await db.organization.findUnique({
        where: { slug: params.orgSlug },
        include: {
            projects: {
                orderBy: { createdAt: 'desc' }
            },
            members: {
                where: { userId: session.user.id }
            }
        }
    })

    if (!org) {
        notFound()
    }

    // Verify membership
    const member = org.members[0];
    if (!member) {
        redirect("/dashboard") // Or 403 page
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{org.name}</h2>
                    <p className="text-muted-foreground">Manage projects and settings for this organization.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <ProjectForm organizationId={org.id} />
                </div>
            </div>
            <div className="h-full py-6">
                <ProjectList projects={org.projects} orgSlug={org.slug} />
            </div>
        </div>
    )
}
