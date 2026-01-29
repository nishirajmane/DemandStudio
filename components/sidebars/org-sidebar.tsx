"use client"

import * as React from "react"
import {
    Building,
    ArrowLeft,
    GalleryVerticalEnd,
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

type Project = {
    id: string
    name: string
    slug: string
    description?: string | null
}

export function OrgSidebar({
    user,
    org,
    ...props
}: React.ComponentProps<typeof Sidebar> & { user: User, org: Org }) {
    const pathname = usePathname()
    const [projects, setProjects] = React.useState<Project[]>([])

    // Fetch projects for this org
    React.useEffect(() => {
        fetch(`/api/organizations/${org.id}/projects`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProjects(data)
            })
            .catch(console.error)
    }, [org.id])

    const data = React.useMemo(() => {
        return {
            user: {
                name: user.name || "User",
                email: user.email || "",
                avatar: user.image || "",
            },
            // Map projects to switcher teams
            teams: projects.map(p => ({
                name: p.name,
                logo: GalleryVerticalEnd,
                plan: "Project",
                url: `/dashboard/${org.slug}/projects/${p.slug}` // Assumed URL structure for project dashboard
            })),
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
    }, [user, org, pathname, projects])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher
                    teams={data.teams.length > 0 ? data.teams : [{
                        name: org.name,
                        logo: GalleryVerticalEnd,
                        plan: "Organization",
                        url: "#"
                    }]}
                    label={data.teams.length > 0 ? "Projects" : "Organization"}
                    addLabel="Create Project"
                />
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
