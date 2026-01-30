import { notFound } from "next/navigation"
import { prisma as db } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CreateProjectForm } from "@/components/dashboard/create-project-form"

export default async function CreateProjectPage(props: {
    params: Promise<{ orgSlug: string }>
}) {
    const params = await props.params;
    const session = await auth()

    if (!session) {
        return notFound()
    }

    const org = await db.organization.findUnique({
        where: {
            slug: params.orgSlug,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            members: {
                where: {
                    userId: session.user.id,
                },
            },
        },
    })

    if (!org) {
        notFound()
    }

    if (org.members.length === 0) {
        return notFound()
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
                <p className="text-muted-foreground mt-2">
                    Add a new project to {org.name}.
                </p>
            </div>

            <CreateProjectForm organizationId={org.id} orgSlug={org.slug} />
        </div>
    )
}
