# CMS Portal - Content Management System

A complete CMS portal built with Next.js, TypeScript, shadcn/ui, and Prisma. Similar to Sanity Studio, this application allows you to manage posts and blogs with a modern, intuitive interface.

## Features

- 🔐 **Authentication** - Secure login system using NextAuth.js
- 📝 **Post Management** - Create, edit, delete, and manage posts
- 📚 **Blog Management** - Create, edit, delete, and manage blogs
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui components
- 📊 **Dashboard** - Overview of your content with statistics
- 🔒 **Protected Routes** - Middleware protection for admin pages
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🌐 **Public API** - RESTful API with CORS support for accessing content
- 🔑 **API Key Management** - Secure API key generation and management
- 📖 **API Documentation** - Complete API reference documentation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite (via Prisma)
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run db:generate
npm run db:push
```

3. Create an admin user:
```bash
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login Credentials

After seeding:
- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## API Access

### Public API Endpoints

All API endpoints are available at `/api/v1/`:

- `GET /api/v1/health` - Health check
- `GET /api/v1/posts` - Get all published posts
- `GET /api/v1/posts/[slug]` - Get a single post by slug
- `GET /api/v1/blogs` - Get all published blogs
- `GET /api/v1/blogs/[slug]` - Get a single blog by slug

### API Authentication

API keys are optional but recommended for production use. Create API keys in the dashboard under "API Keys".

**Using API Key:**
```javascript
fetch('http://localhost:3000/api/v1/posts', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
})
```

### CORS Configuration

CORS is enabled by default. Configure allowed origins in `.env`:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

Leave empty or set to `*` to allow all origins (not recommended for production).

### API Query Parameters

**Posts & Blogs:**
- `published` - Filter by published status (true/false)
- `featured` - Filter featured content (true)
- `limit` - Number of results (default: 10)
- `offset` - Pagination offset (default: 0)
- `search` - Search in title, content, excerpt
- `tags` - Filter by tags (comma-separated)
- `category` - Filter blogs by category

**Example:**
```
GET /api/v1/posts?limit=10&offset=0&featured=true&search=technology
```

## Project Structure

```
CMS/
├── app/
│   ├── api/
│   │   ├── v1/          # Public API endpoints
│   │   ├── api-keys/    # API key management
│   │   └── auth/        # Authentication
│   ├── dashboard/       # Dashboard pages
│   ├── login/           # Login page
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── dashboard/       # Dashboard components
│   ├── posts/          # Post-related components
│   └── blogs/          # Blog-related components
├── lib/
│   ├── auth.ts         # NextAuth configuration
│   ├── prisma.ts       # Prisma client
│   ├── cors.ts         # CORS utilities
│   ├── api-auth.ts     # API authentication
│   └── utils.ts        # Utility functions
├── prisma/
│   └── schema.prisma   # Database schema
└── types/              # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed admin user

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"
```

Generate a secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Features in Detail

### Posts Management
- Create new posts with title, slug, content, excerpt
- Edit existing posts
- Delete posts with confirmation
- Publish/unpublish posts
- Mark posts as featured
- Add tags and images
- View all posts in a table

### Blogs Management
- Create new blogs with category support
- Edit existing blogs
- Delete blogs with confirmation
- Publish/unpublish blogs
- Mark blogs as featured
- Add tags, images, and categories
- View all blogs in a table

### API Key Management
- Create API keys with custom names
- Set expiration dates
- Activate/deactivate keys
- View usage statistics
- Delete keys

### Public API
- RESTful API endpoints
- CORS support
- Pagination
- Search and filtering
- Optional API key authentication

## Security

- All admin routes are protected by middleware
- Passwords are hashed using bcrypt
- Session-based authentication
- CSRF protection via NextAuth.js
- API key authentication for API access
- CORS configuration for API endpoints

## License

MIT
