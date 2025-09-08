# Prisim Frontend
##prisim1
The frontend interface for **Prisim**, a modern web-based media gallery. Built with React and Tailwind CSS, this UI supports uploading, previewing, and organizing image and video content.

## Features ##

- Responsive, mobile-friendly UI
- File upload preview
- Sub-gallery navigation
- Tailwind CSS styling
- Integration-ready with Cloudflare Workers and a database binding (`DB`)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/prisim-frontend.git
cd prisim-frontend
2. Install dependencies
bash
Copy
Edit
npm install
# or
yarn
3. Start the development server
bash
Copy
Edit
npm run dev
Project Structure
src/ – React components and layout

public/ – Static assets

index.html – Root HTML file

vite.config.ts – Vite configuration

License
MIT

## Database Migrations

Run migrations before starting the app to ensure the database schema matches the latest API routes.

```bash
wrangler d1 migrations apply DB
```

This will apply `migrations/003_add_file_key_column.sql` and any earlier scripts, adding the `gallery` and `file_key` columns required by the upload and gallery APIs.

## API Routes

- `/api/gallery` – list galleries and related media
- `/api/sketches` – fetch sketches
- `/api/uploads` – upload new sketches
- `/api/files/[key]` – serve files from R2
- `/api/images` – **removed**. Images are now stored in the `assets` table and surfaced via the gallery APIs.
