# 🚀 GitHub Actions CI/CD

Dự án này sử dụng **GitHub Actions** để tự động hóa quá trình kiểm thử và deploy.

## 📋 Workflows

### 1. **Backend CI/CD** (`backend-ci-cd.yml`)
- **Trigger**: Push/PR vào `main` hoặc `develop` (chỉ khi có thay đổi trong `backend/`)
- **Jobs**:
  - ✅ Test & Build trên Node.js 18.x và 20.x
  - ✅ Lint code (nếu có ESLint)
  - ✅ Run tests (nếu có)
  - ✅ Syntax validation
  - 🚀 Auto-deploy lên Render (chỉ khi push vào `main`)

### 2. **Frontend CI/CD** (`frontend-ci-cd.yml`)
- **Trigger**: Push/PR vào `main` hoặc `develop` (chỉ khi có thay đổi trong `frontend/`)
- **Jobs**:
  - ✅ Lint code với ESLint
  - ✅ Build production
  - ✅ Upload build artifacts
  - 🚀 Auto-deploy lên Vercel (chỉ khi push vào `main`)

### 3. **Full Stack CI** (`full-stack-ci.yml`)
- **Trigger**: Mọi push/PR vào `main` hoặc `develop`
- **Jobs**:
  - ✅ Health check cho cả backend và frontend
  - ✅ Tạo summary report

## 🔧 Setup

### Bước 1: Cấu hình Secrets
Xem hướng dẫn chi tiết tại: [SECRETS_SETUP.md](./SECRETS_SETUP.md)

**Secrets cần thiết:**
- `RENDER_DEPLOY_HOOK_URL` - Webhook URL từ Render
- `VITE_BACKEND_URL` - URL backend production
- `VITE_TENANT_ID` - Tenant ID (nếu có)
- `VERCEL_TOKEN` - Token từ Vercel
- `VERCEL_ORG_ID` - Organization ID từ Vercel
- `VERCEL_PROJECT_ID` - Project ID từ Vercel

### Bước 2: Link Vercel Project
```bash
cd frontend
npx vercel
# Làm theo hướng dẫn để link project
```

### Bước 3: Push code
```bash
git add .
git commit -m "feat: setup GitHub Actions CI/CD"
git push origin main
```

### Bước 4: Kiểm tra workflow
Vào **GitHub → Actions** tab để xem workflow chạy.

## 📊 Workflow Status Badges

Thêm badges vào README.md chính:

```markdown
![Backend CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/backend-ci-cd.yml/badge.svg)
![Frontend CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/frontend-ci-cd.yml/badge.svg)
![Full Stack CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/full-stack-ci.yml/badge.svg)
```

## 🔄 Workflow Flow

```
┌─────────────────────────────────────────────────────────┐
│  Developer pushes code to GitHub                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions triggers workflows                      │
│  - Backend CI/CD (if backend/* changed)                 │
│  - Frontend CI/CD (if frontend/* changed)               │
│  - Full Stack CI (always)                               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  CI Phase: Test & Build                                 │
│  ✓ Install dependencies                                 │
│  ✓ Lint code                                            │
│  ✓ Run tests                                            │
│  ✓ Build production                                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  CD Phase: Deploy (only on main branch)                 │
│  ✓ Backend → Render                                     │
│  ✓ Frontend → Vercel                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  ✅ Deployment Complete!                                │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Best Practices

1. **Luôn test local trước khi push**
   ```bash
   # Backend
   cd backend && npm run lint && npm test
   
   # Frontend
   cd frontend && npm run lint && npm run build
   ```

2. **Sử dụng Pull Requests**
   - Tạo branch mới cho mỗi feature
   - Tạo PR để merge vào `main`
   - CI sẽ tự động chạy và báo lỗi (nếu có)

3. **Kiểm tra logs khi workflow fail**
   - Vào GitHub Actions → Click vào workflow bị fail
   - Xem logs chi tiết để debug

4. **Protect main branch**
   - Settings → Branches → Add rule
   - Require status checks to pass before merging
   - Require pull request reviews

## 🔍 Troubleshooting

### Workflow không chạy?
- Kiểm tra file `.yml` có syntax error không
- Kiểm tra branch name có đúng không (`main` vs `master`)

### Deploy fail?
- Kiểm tra secrets có đúng không
- Kiểm tra logs trong GitHub Actions
- Kiểm tra Render/Vercel dashboard

### Build fail?
- Kiểm tra dependencies có đầy đủ không
- Kiểm tra environment variables
- Test build local: `npm run build`

## 📚 Tài liệu

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
