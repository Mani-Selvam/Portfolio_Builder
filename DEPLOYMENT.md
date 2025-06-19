# Deployment Guide

## Netlify Deployment (Frontend Only)

### Quick Setup:
- **Base directory:** `.` 
- **Build command:** `vite build`
- **Publish directory:** `dist`

### Important Notes:
This configuration deploys only the frontend. The backend API and database features won't work since Netlify is for static sites.

### Environment Variables Needed:
If you want API calls to work, you'll need to deploy the backend separately and update the API URLs in the frontend.

## Full Application Deployment Options

### Option 1: Vercel (Recommended for Full-Stack)
Vercel supports both frontend and backend with serverless functions:
- Connect your GitHub repository
- Vercel auto-detects the configuration
- Add your DATABASE_URL in environment variables

### Option 2: Railway/Render (Recommended for Database Apps)
These platforms support full-stack applications with databases:
- Deploy both frontend and backend together
- Built-in PostgreSQL database support
- Simple one-click deployment

### Option 3: Separate Deployment
- Frontend: Netlify/Vercel
- Backend: Railway/Render/Heroku
- Database: Neon/Supabase/PlanetScale

## Local Development
Run `npm run dev` to start the full application with database features.

## Database Requirements
Your application needs PostgreSQL. Make sure to:
1. Set up a database (Neon, Supabase, or similar)
2. Add DATABASE_URL to environment variables
3. Run `npm run db:push` to set up tables