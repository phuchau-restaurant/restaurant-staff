# 🔐 GitHub Actions Secrets Setup Guide

Để GitHub Actions hoạt động đúng, bạn cần cấu hình các **secrets** trong repository.

## 📍 Cách thêm Secrets vào GitHub

1. Vào repository của bạn trên GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Thêm các secrets theo danh sách bên dưới

---

## 🔑 Danh sách Secrets cần thiết

### **Backend Secrets**

#### `RENDER_DEPLOY_HOOK_URL`
- **Mô tả**: URL webhook để trigger deploy trên Render
- **Cách lấy**:
  1. Vào Render Dashboard → chọn service backend
  2. Vào **Settings** → **Deploy Hook**
  3. Copy URL (dạng: `https://api.render.com/deploy/srv-xxx?key=xxx`)
- **Ví dụ**: `https://api.render.com/deploy/srv-abc123?key=xyz789`

---

### **Frontend Secrets**

#### `VITE_BACKEND_URL`
- **Mô tả**: URL của backend API (production)
- **Ví dụ**: `https://restaurant-staff-1.onrender.com`

#### `VITE_TENANT_ID` (nếu có)
- **Mô tả**: Tenant ID của ứng dụng
- **Ví dụ**: `019abac9-846f-75d0-8dfd-bcf9c9457866`

#### `VERCEL_TOKEN`
- **Mô tả**: Token để deploy lên Vercel
- **Cách lấy**:
  1. Vào https://vercel.com/account/tokens
  2. Click **Create Token**
  3. Đặt tên (vd: `github-actions`)
  4. Copy token (chỉ hiện 1 lần!)
- **Ví dụ**: `vercel_xxx...`

#### `VERCEL_ORG_ID`
- **Mô tả**: Organization ID của Vercel
- **Cách lấy**:
  1. Chạy `npx vercel` trong thư mục frontend
  2. Login và link project
  3. Mở file `.vercel/project.json`
  4. Copy giá trị `orgId`
- **Ví dụ**: `team_xxx...` hoặc `user_xxx...`

#### `VERCEL_PROJECT_ID`
- **Mô tả**: Project ID của Vercel
- **Cách lấy**:
  1. Mở file `.vercel/project.json` (sau khi link project)
  2. Copy giá trị `projectId`
- **Ví dụ**: `prj_xxx...`

---

## 🚀 Cách link Vercel project (lần đầu)

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Login và link project với Vercel
npx vercel

# Làm theo hướng dẫn:
# - Set up and deploy? Yes
# - Which scope? (chọn account của bạn)
# - Link to existing project? No (nếu chưa có) hoặc Yes (nếu đã có)
# - What's your project's name? restaurant-staff-frontend
# - In which directory is your code located? ./

# Sau khi link xong, file .vercel/project.json sẽ được tạo
cat .vercel/project.json
```

---

## ✅ Checklist Setup

- [ ] `RENDER_DEPLOY_HOOK_URL` đã được thêm vào GitHub Secrets
- [ ] `VITE_BACKEND_URL` đã được thêm vào GitHub Secrets
- [ ] `VITE_TENANT_ID` đã được thêm vào GitHub Secrets (nếu có)
- [ ] `VERCEL_TOKEN` đã được thêm vào GitHub Secrets
- [ ] `VERCEL_ORG_ID` đã được thêm vào GitHub Secrets
- [ ] `VERCEL_PROJECT_ID` đã được thêm vào GitHub Secrets
- [ ] File `.vercel/project.json` đã được tạo (local)
- [ ] Đã test push code lên GitHub để xem workflow chạy

---

## 🧪 Test Workflow

Sau khi setup xong, test bằng cách:

```bash
# Tạo một commit nhỏ
git add .
git commit -m "test: trigger GitHub Actions"
git push origin main

# Vào GitHub → Actions tab để xem workflow chạy
```

---

## 🔧 Troubleshooting

### Lỗi: "Secret not found"
→ Kiểm tra lại tên secret có đúng không (phân biệt hoa thường)

### Lỗi: "Vercel deployment failed"
→ Kiểm tra lại `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Lỗi: "Render deployment failed"
→ Kiểm tra lại `RENDER_DEPLOY_HOOK_URL` có đúng không

---

## 📚 Tài liệu tham khảo

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
