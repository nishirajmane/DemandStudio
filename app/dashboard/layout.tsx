import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-6">
          <div className="flex-1">
            {/* Breadcrumb or title can go here */}
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
