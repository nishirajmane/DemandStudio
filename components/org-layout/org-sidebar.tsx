"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    Users,
    Globe,
    Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function OrgSidebar() {
    const pathname = usePathname()
    const params = useParams()
    const orgSlug = params.orgSlug as string
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // In a real app, we might fetch the Org Name here or pass it down via Layout
    // For now, we use the slug or specific fetch if needed.

    const navItems = [
        { href: `/dashboard/${orgSlug}`, label: "Overview", icon: LayoutDashboard },
        { href: `/dashboard/${orgSlug}/projects`, label: "Projects", icon: Globe },
        { href: `/dashboard/${orgSlug}/members`, label: "Members", icon: Users },
        { href: `/dashboard/${orgSlug}/settings`, label: "Settings", icon: Settings },
    ]

    const SidebarContent = () => (
        <div className="flex flex-col flex-grow border-r border-sidebar-border bg-sidebar overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 h-16 border-b">
                <h1 className="text-lg font-bold truncate uppercase">{orgSlug}</h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                    <div className="pt-2 pb-2">
                        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground px-2 flex items-center">
                            &larr; Back to Main Dashboard
                        </Link>
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon
                        // Exact match for Overview, startsWith for others to handle sub-routes
                        const isActive = item.href === `/dashboard/${orgSlug}`
                            ? pathname === item.href
                            : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                    isActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="px-2 pb-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <SidebarContent />
            </div>

            <div className="md:hidden">
                <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border bg-sidebar">
                    <h1 className="text-xl font-bold">{orgSlug}</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
                {mobileMenuOpen && (
                    <div className="bg-sidebar border-b border-sidebar-border fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto">
                        <SidebarContent />
                    </div>
                )}
            </div>
        </>
    )
}
