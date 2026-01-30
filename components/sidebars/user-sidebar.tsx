"use client"

import * as React from "react"
import {
    LayoutDashboard,
    FileText,
    Key,
    Database,
    Building,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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

type Org = {
    id: string
    name: string
    slug: string
}

type ContentType = {
    id: string
    name: string
    slug: string
}

export function UserSidebar({
    user,
    ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
    const pathname = usePathname()
    const [orgs, setOrgs] = React.useState<Org[]>([])


    // Fetch data for regular users
    React.useEffect(() => {
        fetch("/api/organizations")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrgs(data)
            })
            .catch(console.error)


    }, [])

    const data = React.useMemo(() => {
        return {
            user: {
                name: user.name || "User",
                email: user.email || "",
                avatar: user.image || "",
            },
            teams: orgs.map(org => ({
                name: org.name,
                logo: Building, // Placeholder logo
                plan: "Organization",
                url: `/dashboard/${org.slug}`
            })),
            navMain: [
                {
                    title: "Dashboard",
                    url: "/dashboard",
                    icon: LayoutDashboard,
                    isActive: pathname === "/dashboard",
                    items: [],
                },
                {
                    title: "Content",
                    url: "#",
                    icon: FileText,
                    isActive: true,
                    items: [
                        {
                            title: "Posts",
                            url: "/dashboard/posts",
                            isActive: pathname.startsWith("/dashboard/posts"),
                        },
                        {
                            title: "Blogs",
                            url: "/dashboard/blogs",
                            isActive: pathname.startsWith("/dashboard/blogs"),
                        },
                    ],
                },
                {
                    title: "Developer",
                    url: "#",
                    icon: Key,
                    items: [
                        {
                            title: "API Keys",
                            url: "/dashboard/api-keys",
                            isActive: pathname.startsWith("/dashboard/api-keys"),
                        },
                        {
                            title: "API Docs",
                            url: "/dashboard/api-docs",
                            isActive: pathname.startsWith("/dashboard/api-docs"),
                        },
                    ],
                },

            ],
        }
    }, [user, pathname, orgs])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {data.teams.length > 0 && (
                    <TeamSwitcher teams={data.teams} />
                )}
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
