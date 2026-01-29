"use client"

import * as React from "react"
import {
    Settings,
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
} from "@/components/ui/sidebar"

// Types
type User = {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
}

export function AdminSidebar({
    user,
    ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
    const pathname = usePathname()

    const data = React.useMemo(() => {
        return {
            user: {
                name: user.name || "Admin",
                email: user.email || "",
                avatar: user.image || "",
            },
            navMain: [
                {
                    title: "Admin Portal",
                    url: "#",
                    icon: Settings,
                    isActive: true,
                    items: [
                        {
                            title: "Overview",
                            url: "/dashboard/admin",
                            isActive: pathname === "/dashboard/admin",
                        },
                        {
                            title: "Organizations",
                            url: "/dashboard/admin/organizations",
                            isActive: pathname.startsWith("/dashboard/admin/organizations"),
                        },
                        {
                            title: "Users",
                            url: "/dashboard/admin/users",
                            isActive: pathname.startsWith("/dashboard/admin/users"),
                        },
                        {
                            title: "Settings",
                            url: "/dashboard/admin/settings",
                            isActive: pathname.startsWith("/dashboard/admin/settings"),
                        },
                    ],
                },
            ],
        }
    }, [user, pathname])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2 font-bold text-lg text-sidebar-foreground">
                    <Settings className="h-6 w-6" />
                    <span className="truncate">Admin Portal</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
