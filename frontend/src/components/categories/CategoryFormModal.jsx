import CategoryForm from "./CategoryForm";

/**
 * CategoryFormModal - Modal bọc quanh CategoryForm để thêm/sửa danh mục
 * @param {boolean} open - Hiển thị modal hay không
 * @param {object} category - Dữ liệu danh mục (nếu sửa)
 * @param {function} onSubmit - Callback khi submit
 * @param {function} onClose - Callback khi đóng modal
 */
const CategoryFormModal = ({ open, category, onSubmit, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white rounded-lg shadow-lg p-0 sm:p-6 w-full max-w-lg relative">
        <CategoryForm
          category={category}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default CategoryFormModal;
