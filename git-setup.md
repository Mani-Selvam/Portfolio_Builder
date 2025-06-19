# Git Setup Commands

## Initial Repository Setup

```bash
# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Portfolio website generator with admin dashboard"

# Add remote repository (replace with your GitHub/GitLab URL)
git remote add origin https://github.com/yourusername/portfolio-generator.git

# Push to main branch
git push -u origin main
```

## Alternative: If repository already exists

```bash
# Clone existing repository
git clone https://github.com/yourusername/portfolio-generator.git
cd portfolio-generator

# Add all project files
git add .

# Commit changes
git commit -m "Add complete portfolio generator application"

# Push to repository
git push origin main
```

## Environment Setup for Deployment

Create a `.env.example` file to show required environment variables:

```bash
# Copy environment template
cp .env .env.example

# Edit .env.example to remove sensitive values
```

## Deployment Branches (Optional)

```bash
# Create deployment branch for Netlify
git checkout -b netlify-deploy
git push -u origin netlify-deploy

# Create branch for backend deployment
git checkout -b backend-deploy
git push -u origin backend-deploy

# Return to main branch
git checkout main
```

## Before Pushing

Make sure these files exist:
- ✅ README.md
- ✅ .gitignore (updated)
- ✅ netlify.toml
- ✅ package.json
- ✅ All source code files

Files automatically ignored:
- node_modules/
- .env files
- uploads/ folder
- dist/ folder
```