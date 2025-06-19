# Portfolio Website Generator

A full-stack application for collecting client portfolio submissions with an admin dashboard for management.

## Features

-   **Public Submission Form**: Clients can submit portfolio information with file uploads
-   **Admin Dashboard**: Manage submissions, update status, view details
-   **File Management**: Resume, profile photos, and project screenshot uploads
-   **Database Integration**: PostgreSQL with Drizzle ORM
-   **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Vite
-   **Backend**: Node.js, Express, TypeScript
-   **Database**: PostgreSQL (Neon compatible)
-   **File Upload**: Multer for file handling
-   **Validation**: Zod for schema validation

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd portfolio-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

Create a Neon database and add your connection string:

```bash
# Create .env file
echo "DATABASE_URL=your_neon_connection_string" > .env
```

### 4. Create Database Tables

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5000

## Deployment

### Netlify (Frontend Only)

-   Base directory: `.`
-   Build command: `vite build`
-   Publish directory: `dist`

### Full-Stack Deployment

-   **Frontend**: Netlify/Vercel
-   **Backend**: Railway/Render
-   **Database**: Neon

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
SESSION_SECRET=your-session-secret
```

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Database schema
├── uploads/         # File uploads (not in git)
└── netlify/         # Netlify functions
```
