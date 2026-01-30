"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
  Key,
  Database,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/posts", label: "Posts", icon: FileText },
  { href: "/dashboard/blogs", label: "Blogs", icon: BookOpen },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/api-docs", label: "API Docs", icon: FileText },
]

function OrgLinks() {
  const [orgs, setOrgs] = useState<{ id: string, name: string, slug: string }[]>([])
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/organizations")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrgs(data)
      })
      .catch(console.error)
  }, [])


  return (
    <>
      {orgs.map((org) => {
        const isActive = pathname.startsWith(`/dashboard/${org.slug}`)
        return (
          <Link
            key={org.id}
            href={`/dashboard/${org.slug}`}
            className={cn(
              "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <div className="mr-3 flex h-5 w-5 items-center justify-center rounded border bg-background text-[10px] font-bold">
              {org.name.substring(0, 1)}
            </div>
            {org.name}
          </Link>
        )
      })}
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)




  const SidebarContent = () => (
    <div className="flex flex-col flex-grow border-r border-sidebar-border bg-sidebar overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4 h-16">
        <h1 className="text-xl font-bold">Demand Studio</h1>
      </div>
      <div className="mt-5 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname === item.href + "/"
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

          <div className="pt-4 pb-2">
            <h3 className="px-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              My Organizations
            </h3>
          </div>

          {/* Temporary simplified org list */}
          <OrgLinks />





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

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border bg-sidebar">
          <h1 className="text-xl font-bold">CMS Portal</h1>
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

