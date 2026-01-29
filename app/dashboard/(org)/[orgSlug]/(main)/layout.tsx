import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ModeToggle } from "@/components/mode-toggle"
import { prisma as db } from "@/lib/prisma"
import { NavUserHeader } from "@/components/nav-user-header"
import Link from "next/link"

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

    if (!org || org.members.length === 0) {
        redirect("/dashboard")
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/${org.slug}`} className="flex items-center gap-2 font-bold text-xl">
                            DemandStudio
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <NavUserHeader user={{
                            name: session.user.name || null,
                            email: session.user.email || null,
                            avatar: null
                        }} />
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    )
}
