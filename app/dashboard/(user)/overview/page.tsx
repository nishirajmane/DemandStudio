import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BookOpen, Eye, EyeOff } from "lucide-react"

export default async function DashboardOverviewPage() {
    const session = await auth()

    if (!session || !session.user) {
        redirect("/login")
    }

    const [postsCount, blogsCount, publishedPosts, publishedBlogs] = await Promise.all([
        prisma.post.count(),
        prisma.blog.count(),
        prisma.post.count({ where: { published: true } }),
        prisma.blog.count({ where: { published: true } }),
    ])

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <p className="text-gray-600 mb-8">
                Welcome back, {session?.user?.name || session?.user?.email}!
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{postsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {publishedPosts} published
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{blogsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {publishedBlogs} published
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedPosts}</div>
                        <p className="text-xs text-muted-foreground">
                            {postsCount - publishedPosts} drafts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Blogs</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedBlogs}</div>
                        <p className="text-xs text-muted-foreground">
                            {blogsCount - publishedBlogs} drafts
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
