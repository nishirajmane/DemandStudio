import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BlogForm } from "@/components/blogs/blog-form"

import { prisma } from "@/lib/prisma"

export default async function NewBlogPage(props: {
  params: Promise<{ orgSlug: string; projectSlug: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { orgSlug, projectSlug } = await props.params;

  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug,
      organization: {
        slug: orgSlug
      }
    }
  });

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">New Blog</h1>
      <BlogForm
        userId={session.user.id}
        organizationId={project.organizationId}
        projectId={project.id}
        redirectUrl={`/dashboard/${orgSlug}/projects/${projectSlug}/blogs`}
      />
    </div>
  )
}
