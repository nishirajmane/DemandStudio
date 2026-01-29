import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PostForm } from "@/components/posts/post-form"

export default async function NewPostPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">New Post</h1>
      <PostForm userId={session.user.id} />
    </div>
  )
}
