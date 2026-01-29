import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BlogForm } from "@/components/blogs/blog-form"

export default async function EditBlogPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params;
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
  })

  if (!blog) {
    redirect("/dashboard/blogs")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
      <BlogForm userId={session.user.id} blog={blog} />
    </div>
  )
}
