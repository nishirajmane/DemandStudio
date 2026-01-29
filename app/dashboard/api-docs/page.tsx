import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Globe, Key, Book } from "lucide-react"

export default function ApiDocsPage() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Complete API reference for accessing your CMS content
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-lg">{baseUrl}/api/v1</code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Authentication
            </CardTitle>
            <CardDescription>
              API keys are optional for public endpoints, but recommended for production use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">Using API Key (Recommended)</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto">
                {`// Header method
X-API-Key: your-api-key-here

// Authorization header
Authorization: Bearer your-api-key-here`}
              </pre>
            </div>
            <div>
              <p className="font-medium mb-2">Example Request</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto">
                {`fetch('${baseUrl}/api/v1/posts', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
})`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Health Check */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-lg">/api/v1/health</code>
              </div>
              <p className="text-muted-foreground mb-2">Check API health status</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`// Response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}`}
              </pre>
            </div>

            {/* Get Posts */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-lg">/api/v1/posts</code>
              </div>
              <p className="text-muted-foreground mb-2">Get all published posts</p>
              <div className="mb-2">
                <p className="font-medium text-sm mb-1">Query Parameters:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><code>published</code> - Filter by published status (true/false)</li>
                  <li><code>featured</code> - Filter featured posts (true)</li>
                  <li><code>limit</code> - Number of results (default: 10)</li>
                  <li><code>offset</code> - Pagination offset (default: 0)</li>
                  <li><code>search</code> - Search in title, content, excerpt</li>
                  <li><code>tags</code> - Filter by tags (comma-separated)</li>
                </ul>
              </div>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`// Example
GET /api/v1/posts?limit=10&offset=0&featured=true

// Response
{
  "data": [
    {
      "id": "...",
      "title": "Post Title",
      "slug": "post-slug",
      "content": "...",
      "excerpt": "...",
      "published": true,
      "featured": false,
      "tags": "tag1, tag2",
      "image": "...",
      "author": {
        "id": "...",
        "name": "Author Name",
        "email": "author@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}`}
              </pre>
            </div>

            {/* Get Single Post */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-lg">/api/v1/posts/[slug]</code>
              </div>
              <p className="text-muted-foreground mb-2">Get a single post by slug</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`// Example
GET /api/v1/posts/my-post-slug

// Response
{
  "data": {
    "id": "...",
    "title": "Post Title",
    "slug": "my-post-slug",
    "content": "...",
    ...
  }
}`}
              </pre>
            </div>

            {/* Get Blogs */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-lg">/api/v1/blogs</code>
              </div>
              <p className="text-muted-foreground mb-2">Get all published blogs</p>
              <div className="mb-2">
                <p className="font-medium text-sm mb-1">Query Parameters:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li><code>published</code> - Filter by published status (true/false)</li>
                  <li><code>featured</code> - Filter featured blogs (true)</li>
                  <li><code>category</code> - Filter by category</li>
                  <li><code>limit</code> - Number of results (default: 10)</li>
                  <li><code>offset</code> - Pagination offset (default: 0)</li>
                  <li><code>search</code> - Search in title, content, excerpt</li>
                  <li><code>tags</code> - Filter by tags (comma-separated)</li>
                </ul>
              </div>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`// Example
GET /api/v1/blogs?category=tech&limit=5

// Response (same structure as posts)`}
              </pre>
            </div>

            {/* Get Single Blog */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-lg">/api/v1/blogs/[slug]</code>
              </div>
              <p className="text-muted-foreground mb-2">Get a single blog by slug</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`// Example
GET /api/v1/blogs/my-blog-slug

// Response (same structure as single post)`}
              </pre>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Dynamic Content</h3>

              {/* Get Content Items by Type */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-lg">/api/content-items/[typeSlug]</code>
                </div>
                <p className="text-muted-foreground mb-2">Get all items for a specific content type</p>
                <div className="mb-2">
                  <p className="font-medium text-sm mb-1">Query Parameters:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li><code>published</code> - Filter by published status (true/false)</li>
                  </ul>
                </div>
                <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                  {`// Example
GET /api/content-items/products?published=true

// Response
[
  {
    "id": "...",
    "contentTypeId": "...",
    "data": {
      "productName": "Super Gadget",
      "price": 99.99,
      ...
    },
    "published": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]`}
                </pre>
              </div>

              {/* Get Single Content Item */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-lg">/api/content-items/[typeSlug]/[id]</code>
                </div>
                <p className="text-muted-foreground mb-2">Get a single content item by ID</p>
                <div className="mb-2">
                  <p className="font-medium text-sm mb-1">Note:</p>
                  <p className="text-sm text-muted-foreground">The <code>typeSlug</code> in the URL must match the item's content type.</p>
                </div>
                <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                  {`// Example
GET /api/content-items/products/cm6...

// Response
{
  "id": "...",
  "contentTypeId": "...",
  "data": {
    "productName": "Super Gadget",
    ...
  },
  "published": true,
  "contentType": {
    "name": "Products",
    "slug": "products",
    ...
  }
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-2">JavaScript/TypeScript</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`const response = await fetch('${baseUrl}/api/v1/posts', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
const data = await response.json();
console.log(data.data);`}
              </pre>
            </div>
            <div>
              <p className="font-medium mb-2">cURL</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`curl -X GET "${baseUrl}/api/v1/posts" \\
  -H "X-API-Key: your-api-key-here"`}
              </pre>
            </div>
            <div>
              <p className="font-medium mb-2">Python</p>
              <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
                {`import requests

headers = {
    'X-API-Key': 'your-api-key-here'
}

response = requests.get('${baseUrl}/api/v1/posts', headers=headers)
data = response.json()
print(data['data'])`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-muted p-4 rounded overflow-x-auto text-sm">
              {`// 400 Bad Request
{
  "error": "Invalid request parameters"
}

// 401 Unauthorized
{
  "error": "API key is required"
}

// 404 Not Found
{
  "error": "Post not found"
}

// 500 Internal Server Error
{
  "error": "Failed to fetch posts"
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

