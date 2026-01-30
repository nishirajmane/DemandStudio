import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/login")
    }

    if (session.user.role === "admin") {
        redirect("/dashboard/admin/organizations")
    }

    // Redirect to first org if user has one
    const member = await prisma.organizationMember.findFirst({
        where: { userId: session.user.id },
        include: { organization: true },
        orderBy: { createdAt: 'asc' }
    })

    if (member) {
        redirect(`/dashboard/${member.organization.slug}`)
    }

    // Fallback to user overview
    redirect("/dashboard/overview")
}
