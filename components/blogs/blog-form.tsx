"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Editor } from "@/components/blocks/editor-x/editor"
import { ImageUploader } from "@/components/ui/image-uploader"
import { FAQEditor } from "@/components/blogs/faq-editor"
import { Eye, CalendarClock } from "lucide-react"

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  published: z.boolean(),
  featured: z.boolean(),
  tags: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  // New fields
  canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogImage: z.string().optional(),
  jsonLd: z.string().optional(), // Should validate JSON but let's be lenient first
  faqSchema: z.string().optional(),
  faqs: z.string().optional(), // JSON string for FAQs
  publishedAt: z.string().optional(), // ISO date string
  enableToc: z.boolean().default(false),
  tocStructure: z.string().optional(), // JSON string for TOC
  displayedAuthorId: z.string().optional(),
})

type BlogFormData = z.infer<typeof blogSchema>

interface BlogFormProps {
  userId: string
  blog?: {
    id: string
    title: string
    slug: string
    content: string
    excerpt?: string | null
    published: boolean
    featured: boolean
    tags?: string | null
    image?: string | null
    category?: string | null
    canonicalUrl?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
    metaKeywords?: string | null
    ogImage?: string | null
    jsonLd?: string | null
    faqSchema?: string | null
    faqs?: string | null
    publishedAt?: Date | null
    enableToc: boolean
    tocStructure?: string | null
    displayedAuthorId?: string | null
  }
  organizationId?: string
  projectId?: string
  redirectUrl?: string
}

// Helper to handle existing content
const parseContent = (content: string) => {
  try {
    // Check if it looks like JSON
    if (content.trim().startsWith("{")) {
      return JSON.parse(content)
    }
    throw new Error("Not JSON")
  } catch (e) {
    // Create a basic Lexical state for plain text
    return {
      root: {
        children: [
          {
            type: "paragraph",
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: content,
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    }
  }
}

export function BlogForm({ userId, blog, organizationId, projectId, redirectUrl }: BlogFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema) as any,
    defaultValues: blog
      ? {
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt || "",
        published: blog.published,
        featured: blog.featured,
        tags: blog.tags || "",
        image: blog.image || "",
        category: blog.category || "",
        canonicalUrl: blog.canonicalUrl || "",
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
        metaKeywords: blog.metaKeywords || "",
        ogImage: blog.ogImage || "",
        jsonLd: blog.jsonLd || "",
        faqSchema: blog.faqSchema || "",
        faqs: blog.faqs || "",
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : "",
        enableToc: blog.enableToc,
        tocStructure: blog.tocStructure || "",
        displayedAuthorId: blog.displayedAuthorId || "",
      }
      : {
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        published: false,
        featured: false,
        tags: "",
        image: "",
        category: "",
        canonicalUrl: "",
        seoTitle: "",
        seoDescription: "",
        metaKeywords: "",
        ogImage: "",
        jsonLd: "",
        faqSchema: "",
        faqs: "",
        publishedAt: "",
        enableToc: false,
        tocStructure: "",
        displayedAuthorId: "",
      },
  })

  // Register content field manually since Editor doesn't use ref
  useEffect(() => {
    register("content")
  }, [register])

  const title = watch("title")
  useEffect(() => {
    if (!blog && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setValue("slug", slug)
    }
  }, [title, setValue, blog])

  const onSubmit: SubmitHandler<BlogFormData> = async (data) => {
    setLoading(true)
    try {
      const url = blog ? `/api/blogs/${blog.id}` : "/api/blogs"
      const method = blog ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          ...data,
          authorId: userId,
          publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : (data.published ? new Date().toISOString() : null),
          displayedAuthorId: data.displayedAuthorId || null,
          tocStructure: data.tocStructure || null,
          organizationId,
          projectId,
        }),
      })

      if (response.ok) {
        if (redirectUrl) {
          router.push(redirectUrl)
        } else {
          router.push("/dashboard/blogs")
        }
        router.refresh()
      } else {
        alert("Failed to save blog")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    const slug = watch("slug")
    if (slug) {
      window.open(`/blogs/${slug}`, "_blank")
    } else {
      alert("Please enter a slug first")
    }
  }

  const handleSchedule = (e: React.MouseEvent) => {
    e.preventDefault()
    const publishedAt = watch("publishedAt")
    if (!publishedAt) {
      alert("Please select a date and time to schedule the post.")
      const dateInput = document.getElementById("publishedAt") as HTMLInputElement
      if (dateInput) {
        dateInput.focus()
        // @ts-ignore
        if (dateInput.showPicker) {
          // @ts-ignore
          dateInput.showPicker();
        }
      }
      return
    }
    handleSubmit(onSubmit)()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{blog ? "Edit Blog" : "Create Blog"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter blog title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="blog-url-slug"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Blog category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              placeholder="Brief description of the blog"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="min-h-[400px]">
              <Editor
                editorSerializedState={blog?.content ? parseContent(blog.content) : undefined}
                onSerializedChange={(state) => {
                  setValue("content", JSON.stringify(state))
                  trigger("content")
                }}
              />
            </div>
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="space-y-2">
            <ImageUploader
              label="Cover Image"
              value={watch("image") || ""}
              onChange={(url) => setValue("image", url)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input id="seoTitle" {...register("seoTitle")} placeholder="SEO Title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input id="canonicalUrl" {...register("canonicalUrl")} placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea id="seoDescription" {...register("seoDescription")} placeholder="Meta description for SEO" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input id="metaKeywords" {...register("metaKeywords")} placeholder="keyword1, keyword2" />
              </div>

              <div className="space-y-2">
                <Label>Open Graph Image URL</Label>
                <ImageUploader
                  label=""
                  value={watch("ogImage") || ""}
                  onChange={(url) => setValue("ogImage", url)}
                />
              </div>

              <div className="space-y-2">
                <Label>FAQs</Label>
                <FAQEditor
                  value={watch("faqs") || "[]"}
                  onChange={(val) => setValue("faqs", val)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jsonLd">JSON-LD (Structured Data)</Label>
                <Textarea id="jsonLd" {...register("jsonLd")} placeholder="{ ... }" className="font-mono text-sm" rows={5} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faqSchema">FAQ Schema (JSON)</Label>
                <Textarea id="faqSchema" {...register("faqSchema")} placeholder="{ ... }" className="font-mono text-sm" rows={5} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing & Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Published At</Label>
                  <Input type="datetime-local" id="publishedAt" {...register("publishedAt")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayedAuthorId">Displayed Author ID</Label>
                  <Input id="displayedAuthorId" {...register("displayedAuthorId")} placeholder="Author ID" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tocStructure">TOC Structure (JSON)</Label>
                <Textarea id="tocStructure" {...register("tocStructure")} placeholder='[{"title": "...", "id": "...", "level": "h2"}]' className="font-mono text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableToc"
                    {...register("enableToc")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="enableToc">Enable Table of Contents</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                {...register("published")}
                className="h-4 w-4"
              />
              <Label htmlFor="published">Published</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                {...register("featured")}
                className="h-4 w-4"
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : blog ? "Update Blog" : "Create Blog"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSchedule}
              disabled={loading}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card >
  )
}

