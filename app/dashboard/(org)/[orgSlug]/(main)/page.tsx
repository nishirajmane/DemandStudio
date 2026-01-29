import { notFound } from "next/navigation"
import { prisma as db } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
    Greeting,
    NotificationsWidget,
    RecentProjectsWidget,
    FavoritesWidget,
    ActivityWidget,
    InsightsWidget
} from "@/components/dashboard/dashboard-widgets"

export default async function OrgDashboardPage(props: {
    params: Promise<{ orgSlug: string }>
}) {
    const params = await props.params;
    const session = await auth()

    if (!session) {
        return null
    }

    const org = await db.organization.findUnique({
        where: {
            slug: params.orgSlug,
        },
        include: {
            members: {
                where: {
                    userId: session.user.id,
                },
            },
            projects: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 5
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
        <div className="max-w-6xl mx-auto space-y-8">
            <Greeting orgName={org.name} />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <NotificationsWidget />
                    <FavoritesWidget />
                    <InsightsWidget />
                </div>

                {/* Right Column (spanning 2 cols on medium+) */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <RecentProjectsWidget projects={org.projects} orgSlug={org.slug} />
                    <ActivityWidget />
                </div>
            </div>
        </div>
    )
}
