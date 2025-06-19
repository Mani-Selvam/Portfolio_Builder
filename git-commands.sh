#!/bin/bash

echo "=== Portfolio Website Generator - Git Setup ==="
echo

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "1. Initializing Git repository..."
    git init
else
    echo "1. Git repository already exists"
fi

echo "2. Adding all files to staging..."
git add .

echo "3. Creating commit..."
git commit -m "Portfolio website generator: Full-stack app with client forms and admin dashboard

Features:
- Public portfolio submission form with file uploads
- Admin dashboard with submission management
- PostgreSQL database with Drizzle ORM
- File upload handling (resume, photos, screenshots)
- Status tracking and export functionality
- Responsive design with Tailwind CSS"

echo "4. Ready to push to remote repository"
echo
echo "Next steps:"
echo "- Create repository on GitHub/GitLab"
echo "- Run: git remote add origin <your-repo-url>"
echo "- Run: git push -u origin main"
echo
echo "For deployment:"
echo "- Frontend: Use Netlify with 'vite build' command"
echo "- Backend: Use Railway/Render for full functionality"
echo "- Database: Set up Neon PostgreSQL"

