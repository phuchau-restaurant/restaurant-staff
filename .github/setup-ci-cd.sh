#!/bin/bash

# 🚀 GitHub Actions CI/CD Quick Setup Script
# Script này giúp bạn setup nhanh GitHub Actions

echo "🚀 GitHub Actions CI/CD Quick Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if git is initialized
echo "📋 Step 1: Checking Git repository..."
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not found!${NC}"
    echo "Please run: git init"
    exit 1
fi
echo -e "${GREEN}✅ Git repository found${NC}"
echo ""

# Step 2: Check if GitHub remote is set
echo "📋 Step 2: Checking GitHub remote..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}⚠️  No GitHub remote found${NC}"
    echo "Please add your GitHub repository:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo ""
else
    echo -e "${GREEN}✅ GitHub remote: $REMOTE_URL${NC}"
    echo ""
fi

# Step 3: Check workflows
echo "📋 Step 3: Checking GitHub Actions workflows..."
if [ -d ".github/workflows" ]; then
    WORKFLOW_COUNT=$(ls -1 .github/workflows/*.yml 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ Found $WORKFLOW_COUNT workflow(s)${NC}"
    ls -1 .github/workflows/*.yml 2>/dev/null | while read file; do
        echo "   - $(basename $file)"
    done
else
    echo -e "${RED}❌ No workflows found!${NC}"
    exit 1
fi
echo ""

# Step 4: Check if Vercel is linked (frontend)
echo "📋 Step 4: Checking Vercel setup..."
if [ -f "frontend/.vercel/project.json" ]; then
    echo -e "${GREEN}✅ Vercel project is linked${NC}"
    VERCEL_ORG_ID=$(cat frontend/.vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    VERCEL_PROJECT_ID=$(cat frontend/.vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    echo "   Org ID: $VERCEL_ORG_ID"
    echo "   Project ID: $VERCEL_PROJECT_ID"
else
    echo -e "${YELLOW}⚠️  Vercel project not linked${NC}"
    echo "To link Vercel project:"
    echo "  cd frontend"
    echo "  npx vercel"
fi
echo ""

# Step 5: Secrets checklist
echo "📋 Step 5: GitHub Secrets Checklist"
echo "Please make sure you have added these secrets to your GitHub repository:"
echo "  Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "Required secrets:"
echo "  [ ] RENDER_DEPLOY_HOOK_URL"
echo "  [ ] VITE_BACKEND_URL"
echo "  [ ] VITE_TENANT_ID (if applicable)"
echo "  [ ] VERCEL_TOKEN"
echo "  [ ] VERCEL_ORG_ID"
echo "  [ ] VERCEL_PROJECT_ID"
echo ""
echo "For detailed instructions, see: .github/SECRETS_SETUP.md"
echo ""

# Step 6: Test local build
echo "📋 Step 6: Testing local builds..."
echo ""

# Test backend
echo "Testing backend..."
cd backend
if npm ci > /dev/null 2>&1; then
    if node -c server.js > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: Dependencies installed & syntax valid${NC}"
    else
        echo -e "${RED}❌ Backend: Syntax error in server.js${NC}"
    fi
else
    echo -e "${RED}❌ Backend: Failed to install dependencies${NC}"
fi
cd ..

# Test frontend
echo "Testing frontend..."
cd frontend
if npm ci > /dev/null 2>&1; then
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: Dependencies installed & build successful${NC}"
    else
        echo -e "${RED}❌ Frontend: Build failed${NC}"
    fi
else
    echo -e "${RED}❌ Frontend: Failed to install dependencies${NC}"
fi
cd ..

echo ""
echo "===================================="
echo -e "${GREEN}🎉 Setup check complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Add required secrets to GitHub (see checklist above)"
echo "2. Commit and push your code:"
echo "   git add ."
echo "   git commit -m \"feat: setup GitHub Actions CI/CD\""
echo "   git push origin main"
echo "3. Check GitHub Actions tab to see workflows running"
echo ""
echo "For more information, see: .github/README.md"
