import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BlogForm } from "@/components/blogs/blog-form"

export default async function NewBlogPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">New Blog</h1>
      <BlogForm userId={session.user.id} />
    </div>
  )
}
