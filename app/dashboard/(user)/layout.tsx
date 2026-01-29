import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { UserSidebar } from "@/components/sidebars/user-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <UserSidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex-1">
            {/* Breadcrumb or title can go here */}
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 flex flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
