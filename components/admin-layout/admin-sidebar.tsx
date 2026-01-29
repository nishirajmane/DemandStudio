"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/organizations", label: "Organizations", icon: Building },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const SidebarContent = () => (
        <div className="flex flex-col flex-grow border-r border-sidebar-border bg-sidebar overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 h-16 bg-sidebar-primary text-sidebar-primary-foreground">
                <h1 className="text-xl font-bold">Admin Portal</h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">

                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname.startsWith(item.href)
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
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
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
                    <h1 className="text-xl font-bold">Admin Portal</h1>
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
