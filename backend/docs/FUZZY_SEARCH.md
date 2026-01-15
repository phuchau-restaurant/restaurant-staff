# Fuzzy Search Implementation for Menu Items

## 📋 Overview

Fuzzy search cho phép tìm kiếm món ăn với khả năng chấp nhận lỗi chính tả, sử dụng PostgreSQL `pg_trgm` (trigram similarity).

## 🚀 Setup Instructions

### 1. Enable PostgreSQL Extension

Chạy SQL migration trong Supabase SQL Editor:

```bash
# File: backend/migrations/enable_fuzzy_search.sql
```

Hoặc chạy trực tiếp:

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes
CREATE INDEX IF NOT EXISTS dishes_name_trgm_idx 
ON dishes USING gin (name gin_trgm_ops);

-- Create function (xem file migration để biết chi tiết)
```

### 2. Test Backend API

```bash
# Exact match
GET /api/menus/search/fuzzy?q=phở bò

# Typo tolerance
GET /api/menus/search/fuzzy?q=pho bo
GET /api/menus/search/fuzzy?q=fo bo&threshold=0.2

# Vietnamese without diacritics
GET /api/menus/search/fuzzy?q=com tam&threshold=0.3
```

### 3. API Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | required | Từ khóa tìm kiếm |
| `threshold` | float | 0.3 | Ngưỡng similarity (0.0 - 1.0) |

**Threshold Guide:**
- `0.1-0.2`: Rất lỏng lẻo (nhiều kết quả, có thể không chính xác)
- `0.3-0.4`: Cân bằng (khuyên dùng)
- `0.5-0.7`: Chặt chẽ (ít kết quả, chính xác hơn)
- `0.8-1.0`: Rất chặt (gần như exact match)

### 4. Response Format

```json
{
  "success": true,
  "message": "Found 3 menu items matching \"pho bo\"",
  "total": 3,
  "data": [
    {
      "id": "uuid",
      "name": "Phở Bò Đặc Biệt",
      "price": 50000,
      "similarity_score": 0.85,
      ...
    }
  ]
}
```

## 🔧 Frontend Integration

### Option 1: Update existing menuService.js

```javascript
// frontend/src/services/menuService.js

export const fuzzySearchMenuItems = async (searchTerm, threshold = 0.3) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("q", searchTerm);
    if (threshold) queryParams.append("threshold", threshold);

    const url = `${BASE_URL}/search/fuzzy?${queryParams.toString()}`;
    const response = await fetch(url, { headers: getHeaders() });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Fuzzy search error:", error);
    return [];
  }
};
```

### Option 2: Use in React Component

```jsx
import { fuzzySearchMenuItems } from '../services/menuService';

const MenuSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (term) => {
    if (term.trim() === '') {
      setResults([]);
      return;
    }
    
    const items = await fuzzySearchMenuItems(term, 0.3);
    setResults(items);
  };

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        handleSearch(e.target.value);
      }}
      placeholder="Tìm món ăn (có thể gõ sai chính tả)..."
    />
  );
};
```

## 📊 Performance

- **Index**: GIN index trên `dishes.name` giúp tìm kiếm nhanh
- **Limit**: Mặc định giới hạn 50 kết quả
- **Caching**: Có thể thêm Redis cache cho các query phổ biến

## 🧪 Testing Examples

```bash
# Test với Postman/curl
curl "http://localhost:3000/api/menus/search/fuzzy?q=pho%20bo" \
  -H "x-tenant-id: 019abac9-846f-75d0-8dfd-bcf9c9457866"

# Test typo
curl "http://localhost:3000/api/menus/search/fuzzy?q=fo%20bo&threshold=0.2" \
  -H "x-tenant-id: 019abac9-846f-75d0-8dfd-bcf9c9457866"
```

## 🐛 Troubleshooting

### Error: "function fuzzy_search_dishes does not exist"
- Chạy migration SQL trong Supabase
- Kiểm tra extension `pg_trgm` đã được enable

### Error: "Fuzzy search not available, falling back to ilike"
- Extension chưa được cài đặt
- Hệ thống tự động fallback về tìm kiếm thông thường

### Không tìm thấy kết quả
- Giảm threshold (ví dụ từ 0.3 xuống 0.2)
- Kiểm tra index đã được tạo chưa

## 📝 Notes

- Fuzzy search hoạt động tốt với tiếng Việt có dấu và không dấu
- Similarity score càng cao = kết quả càng chính xác
- Kết quả được sắp xếp theo similarity score giảm dần
