#!/bin/bash

# BCU Design Studio - GitHub Setup Script
# This script helps set up the GitHub repository and push the initial code

echo "🚀 Setting up BCU Design Studio for GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: BCU Design Studio app"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding remote origin..."
    git remote add origin https://github.com/egoscicki/BCU-UI-Generator.git
    echo "✅ Remote origin added"
else
    echo "✅ Remote origin already exists"
fi

# Check current branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "🔄 Switching to main branch..."
    git checkout -b main
    echo "✅ Now on main branch"
else
    echo "✅ Already on main branch"
fi

# Add all files
echo "📝 Adding all files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: Complete BCU Design Studio application

- Wireframe editor with drawing tools
- AI-powered design generator
- BCU design system and components
- Responsive layout and modern UI
- ChatGPT API integration ready
- Deployment configuration"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "🎉 Setup complete! Your BCU Design Studio is now on GitHub!"
echo ""
echo "Next steps:"
echo "1. Visit: https://github.com/egoscicki/BCU-UI-Generator"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Set source to 'gh-pages' branch"
echo "4. Deploy with: npm run deploy"
echo ""
echo "Your app will be available at:"
echo "https://egoscicki.github.io/BCU-UI-Generator"
echo ""
echo "Happy coding! 🎨✨"
