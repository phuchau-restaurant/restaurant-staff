# Quick Reference - Quản Lý Danh Mục

## 📂 File Locations

| Type | File Path | Purpose |
|------|-----------|---------|
| **Service** | `src/services/categoryService.js` | API calls |
| **Constants** | `src/constants/categoryConstants.js` | Options & messages |
| **Utils** | `src/utils/categoryUtils.js` | Helper functions |
| **Filter Bar** | `src/components/categories/CategoryFilterBar.jsx` | Search, filter, sort, toggle |
| **Card** | `src/components/categories/CategoryCard.jsx` | Grid view display |
| **List** | `src/components/categories/CategoryListView.jsx` | Table view display |
| **Form** | `src/components/categories/CategoryForm.jsx` | Add/edit modal |
| **Main Screen** | `src/screens/Dashboard/CategoriesScreen.jsx` | Main logic & state |
| **Inventory** | `src/screens/Dashboard/InventoryContent.jsx` | Updated wrapper |

## 🔑 Key Functions

### Service (categoryService.js)
```javascript
fetchCategories(searchTerm)      // GET all categories
createCategory(data)              // POST new category
updateCategory(id, data)          // PUT category by id
deleteCategory(id)                // DELETE category by id
```

### Utils (categoryUtils.js)
```javascript
filterAndSortCategories(...)      // Filter & sort categories
formatDate(dateString)            // Format date to DD/MM/YYYY
validateCategoryData(data)        // Validate form data
```

## 🎯 User Actions Flow

```
1. SEARCH      → User types in search box
                → filterAndSortCategories() executes
                → Display filtered results

2. FILTER      → User selects status dropdown
                → filterAndSortCategories() executes
                → Display filtered results

3. SORT        → User selects sort option
                → filterAndSortCategories() executes
                → Display sorted results

4. TOGGLE      → User clicks grid/list button
                → setViewMode() changes state
                → Re-render with different component

5. ADD         → User clicks "Thêm Danh Mục"
                → Show form modal (CategoryForm)
                → Form submit → createCategory() API
                → Show success message
                → Refresh list

6. EDIT        → User clicks edit button
                → Show form modal with data pre-filled
                → Form submit → updateCategory() API
                → Show success message
                → Refresh list

7. DELETE      → User clicks delete button (List view only)
                → Show confirm dialog
                → Confirm → deleteCategory() API
                → Show success message
                → Refresh list
```

## 📊 Component Data Flow

```
CategoriesScreen (Main)
├── States:
│   ├── categories[] - Tất cả danh mục
│   ├── filteredCategories[] - Danh mục đã lọc
│   ├── viewMode (grid/list)
│   ├── searchTerm
│   ├── statusFilter
│   ├── sortBy
│   ├── showForm
│   ├── editingCategory
│   └── modals (alert, confirm)
│
├── Renders CategoryFilterBar
│   └── Props: searchTerm, statusFilter, sortBy, viewMode, callbacks
│
├── Renders CategoryCard (if Grid) or CategoryListView (if List)
│   └── Data: filteredCategories
│
├── Renders CategoryForm (if showForm)
│   └── Props: category, onSubmit, onClose
│
└── Renders Modals (AlertModal, ConfirmModal)
    └── Props: title, message, callbacks
```

## 🎨 Tailwind CSS Classes Used

```
Grid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
Filter Bar: flex flex-wrap gap-4 items-center bg-white rounded-lg
Card: rounded-xl overflow-hidden shadow-md hover:shadow-lg
Button: px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors
Input: px-4 py-2 border rounded-lg focus:ring-2
Modal: fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
```

## 🔄 State Management Pattern

```
User Action
    ↓
Event Handler (e.g., handleEditClick)
    ↓
API Call (e.g., updateCategory)
    ↓
Update State (e.g., setCategories)
    ↓
useEffect Listener
    ↓
filterAndSortCategories()
    ↓
Update Filtered List
    ↓
Re-render Components
```

## ✅ Form Validation Rules

| Field | Rules |
|-------|-------|
| Name | Required, Max 100 chars |
| Description | Optional, Max 500 chars |
| Image | Optional, Image file only |
| IsActive | Optional, Boolean |

## 📱 Responsive Breakpoints

| Device | Grid Cols | Width |
|--------|-----------|-------|
| Mobile | 1 | < 640px |
| Tablet | 2 | 640px - 1024px |
| Desktop | 3-4 | > 1024px |

## 🔌 API Response Format

```javascript
// Success
{
  success: true,
  data: {
    id: "cat-1",
    name: "Snack",
    description: "...",
    image: "...",
    isActive: true,
    createdAt: "2024-01-10T10:00:00Z"
  }
}

// Error
{
  success: false,
  message: "Error message here"
}
```

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| API fails | Backend down | Use mock data (dev mode) |
| Form won't submit | Validation error | Fill required fields |
| Delete button missing | Grid view | Switch to list view |
| Changes not reflecting | State not updating | Check API response |
| Modal closes immediately | Event bubbling | Add e.stopPropagation() |

## 🚀 Performance Tips

- Memoize components (memo wrapper) for filter bar
- Use useCallback for event handlers
- Avoid unnecessary re-renders
- Mock data for development (no API lag)

## 📚 Dependencies Used

```javascript
import { useState, useEffect, useCallback } from "react"
import { Plus, Edit2, Trash2, Search, Grid, List, Upload, X } from "lucide-react"
```

## 🌐 Environment Variables

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_TENANT_ID=your-tenant-id
```

## 🔗 Related Files

- DashboardLayout.jsx (Parent component)
- AlertModal.jsx (Success/error notifications)
- ConfirmModal.jsx (Confirmation dialogs)
- tableConstants.js (Similar pattern)
- tableService.js (Similar pattern)

---

**Quick Links:**
- 📖 Full Implementation: [CATEGORIES_IMPLEMENTATION.md](CATEGORIES_IMPLEMENTATION.md)
- 👤 User Guide: [CATEGORIES_USER_GUIDE.md](CATEGORIES_USER_GUIDE.md)
- 🔍 Search in code: `CategoryScreen`, `categoryService`, `filterAndSort`
