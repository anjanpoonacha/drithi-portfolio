# ✨ Drithi Sparkle

A beautiful story reading website created by Drithi (Age 13).

## 🚀 Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Bun** - Fast JavaScript runtime and package manager
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS v4** - Modern styling
- **Vercel** - Deployment platform

## 📖 Features

- Beautiful homepage with decorative design
- Story reading pages with character photos
- Dynamic category system for organizing books
- Background music player
- Cherry blossom animations
- Responsive design for all devices

## 🛠️ Development

Install dependencies:

```bash
bun install
```

Run development server:

```bash
bun dev
```

Build for production:

```bash
bun run build
```

Start production server:

```bash
bun start
```

Run tests:

```bash
bun test
```

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### Required Variables

- `BLOB_BASE_URL` - Base URL for Vercel Blob Storage (e.g., `https://xyz.public.blob.vercel-storage.com`)
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage access token
- `DRITHI_KV_REST_API_URL` - Upstash Redis REST API URL
- `DRITHI_KV_REST_API_TOKEN` - Upstash Redis access token
- `ADMIN_PASSWORD` - Password for admin access

### Storage Paths

Storage paths are configured in `lib/constants.ts`:
- `/stories.json` - Main stories data file
- `/stories/` - Directory for story images

These paths are automatically combined with `BLOB_BASE_URL` to create full URLs.

## 📋 Project Structure

See [plan.md](./plan.md) for the complete project plan and development roadmap.

## 🎨 Design

The design sketches are available as JPEG files in the root directory (1.jpeg - 7.jpeg).

## 📝 License

Created by Drithi - All rights reserved.

---

Built with ❤️ using Bun and Next.js
