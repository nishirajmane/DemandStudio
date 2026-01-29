import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
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
        <SidebarProvider>
            <AppSidebar user={session.user} role="org" org={{ id: org.id, name: org.name, slug: org.slug }} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4 justify-between">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <div className="text-sm font-medium">
                            {session.user.name || session.user.email}
                        </div>
                    </div>
                </header>
                <main className="flex-1 flex flex-col gap-4 p-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
