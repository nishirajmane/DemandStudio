"use client"

import * as React from "react"
import {
    Building,
    ArrowLeft,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

// Types
type User = {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
}

type Org = {
    id: string
    name: string
    slug: string
}

export function OrgSidebar({
    user,
    org,
    ...props
}: React.ComponentProps<typeof Sidebar> & { user: User, org: Org }) {
    const pathname = usePathname()

    const data = React.useMemo(() => {
        return {
            user: {
                name: user.name || "User",
                email: user.email || "",
                avatar: user.image || "",
            },
            navMain: [
                {
                    title: org.name,
                    url: "#",
                    icon: Building,
                    isActive: true,
                    items: [
                        {
                            title: "Overview",
                            url: `/dashboard/${org.slug}`,
                            isActive: pathname === `/dashboard/${org.slug}` || pathname === `/dashboard/${org.slug}/`,
                        },
                        {
                            title: "Projects",
                            url: `/dashboard/${org.slug}/projects`,
                            isActive: pathname.startsWith(`/dashboard/${org.slug}/projects`),
                        },
                        {
                            title: "Members",
                            url: `/dashboard/${org.slug}/members`,
                            isActive: pathname.startsWith(`/dashboard/${org.slug}/members`),
                        },
                        {
                            title: "Settings",
                            url: `/dashboard/${org.slug}/settings`,
                            isActive: pathname.startsWith(`/dashboard/${org.slug}/settings`),
                        },
                    ],
                },
            ],
        }
    }, [user, org, pathname])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 font-bold text-lg text-sidebar-foreground">
                        <Building className="h-6 w-6" />
                        <span className="truncate">{org.name}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="/dashboard" className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                <span>Back to Dashboard</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
