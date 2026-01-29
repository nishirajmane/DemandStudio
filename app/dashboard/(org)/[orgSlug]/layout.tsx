import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { OrgSidebar } from "@/components/sidebars/org-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { prisma as db } from "@/lib/prisma"

export default async function OrgLayout(props: {
    children: React.ReactNode
    params: Promise<{ orgSlug: string }>
}) {
    const params = await props.params;
    const { children } = props;
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // Verify membership for this specific org
    const org = await db.organization.findUnique({
        where: { slug: params.orgSlug },
        include: {
            members: {
                where: { userId: session.user.id }
            }
        }
    })

    // If org doesn't exist or user is not a member, redirect
    if (!org || org.members.length === 0) {
        redirect("/dashboard")
    }

    return (
        <>
            {children}
        </>
    )
}
