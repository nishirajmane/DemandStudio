import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Eye } from "lucide-react"
import { format } from "date-fns"
import { DeleteBlogButton } from "@/components/blogs/delete-button"

export const dynamic = "force-dynamic"

type BlogWithAuthor = Prisma.BlogGetPayload<{
  include: {
    author: {
      select: {
        name: true
        email: true
      }
    }
  }
}>

export default async function BlogsPage(props: {
  params: Promise<{ orgSlug: string; projectSlug: string }>
}) {
  const params = await props.params;
  const session = await auth()

  if (!session) return null

  // Get project first to ensure it exists and user has access
  const project = await prisma.project.findUnique({
    where: {
      slug: params.projectSlug,
      organization: {
        slug: params.orgSlug
      }
    }
  })

  if (!project) return null

  let blogs: BlogWithAuthor[] = []
  try {
    blogs = await prisma.blog.findMany({
      where: {
        projectId: project.id
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Failed to fetch blogs:", error)
    // Fallback to empty array or handle error
    blogs = []
  }

  const baseUrl = `/dashboard/${params.orgSlug}/projects/${params.projectSlug}`

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blogs</h1>
        <Link href={`${baseUrl}/blogs/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Blog
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blogs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No blogs found. Create your first blog!
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell className="text-gray-500">{blog.slug}</TableCell>
                    <TableCell>{blog.category || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={blog.published ? "default" : "secondary"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{blog.author.name || blog.author.email}</TableCell>
                    <TableCell>
                      {format(new Date(blog.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/blogs/${blog.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`${baseUrl}/blogs/${blog.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteBlogButton blogId={blog.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

