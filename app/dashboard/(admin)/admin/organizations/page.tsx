import { prisma as db } from "@/lib/prisma"
import { OrgList } from "@/components/admin/org-list"
import { OrgForm } from "@/components/admin/org-form"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Organization Management",
    description: "Manage organizations and their permissions",
}

export default async function OrganizationsPage() {
    const organizations = await db.organization.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    projects: true,
                    members: true,
                },
            },
        },
    })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
                <div className="flex items-center space-x-2">
                    <OrgForm />
                </div>
            </div>
            <OrgList organizations={organizations} />
        </div>
    )
}
