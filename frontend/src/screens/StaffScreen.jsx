import { useState, useEffect } from "react";
import { Users, Plus } from "lucide-react";

// Components
import StaffFilterBar from "../components/staff/StaffFilterBar";
import StaffList from "../components/staff/StaffList";
import StaffCard from "../components/staff/StaffCard";
import StaffForm from "../components/staff/StaffForm";
import AlertModal from "../components/Modal/AlertModal";
import ConfirmModal from "../components/Modal/ConfirmModal";
import Pagination from "../components/SpinnerLoad/Pagination";
import { useAlert } from "../hooks/useAlert";
import { SkeletonCard, SkeletonTable } from "../components/Skeleton";

// Context
import { useSocket } from "../context/SocketContext";

// Services
import * as staffService from "../services/staffService";

/**
 * StaffScreen - Màn hình quản lý nhân viên
 */
const StaffScreen = () => {
  const { alert, showSuccess, showError, closeAlert } = useAlert();
  const { socket, isConnected, connectSocket, disconnectSocket } = useSocket();

  // State quản lý confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });

  // State quản lý dữ liệu
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý UI
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // State quản lý filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("fullName");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    fetchStaff();
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("👥 Setting up staff socket listeners");

    // Listen for user created event — treat socket as signal, fetch via HTTP
    const handleUserCreated = async (data) => {
      try {
        console.log("📡 User created (signal):", data);
        if (!data?.userId) return;

        // Fetch the created user's full data from API and insert if not exists
        const newUser = await staffService.getStaffById(data.userId);
        setStaff((prevStaff) => {
          if (prevStaff.some((s) => s.id === newUser.id)) return prevStaff;
          return [newUser, ...prevStaff];
        });
      } catch (error) {
        console.error("Failed to fetch user after socket create:", error);
      }
    };

    // Listen for user updated event — fetch updated user via HTTP
    const handleUserUpdated = async (data) => {
      try {
        console.log("📡 User updated (signal):", data);
        if (!data?.userId) return;

        const updatedUser = await staffService.getStaffById(data.userId);
        setStaff((prevStaff) =>
          prevStaff.map((s) => (s.id === updatedUser.id ? updatedUser : s))
        );
      } catch (error) {
        console.error("Failed to fetch user after socket update:", error);
      }
    };

    // Listen for user deleted event — remove locally (no fetch needed)
    const handleUserDeleted = (data) => {
      try {
        console.log("📡 User deleted (signal):", data);
        if (!data?.userId) return;
        setStaff((prevStaff) => prevStaff.filter((s) => s.id !== data.userId));
      } catch (error) {
        console.error("Error handling user deleted signal:", error);
      }
    };

    // Register event listeners
    socket.on("user:created", handleUserCreated);
    socket.on("user:updated", handleUserUpdated);
    socket.on("user:deleted", handleUserDeleted);

    // Cleanup listeners on unmount
    return () => {
      console.log("👥 Cleaning up staff socket listeners");
      socket.off("user:created", handleUserCreated);
      socket.off("user:updated", handleUserUpdated);
      socket.off("user:deleted", handleUserDeleted);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    handleFilterAndSort();
  }, [staff, searchTerm, roleFilter, statusFilter, sortBy]);

  useEffect(() => {
    // Tính tổng số trang
    setTotalPages(Math.ceil(filteredStaff.length / itemsPerPage));
  }, [filteredStaff, itemsPerPage]);

  // ==================== API CALLS ====================

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffService.fetchStaff({});
      setStaff(data);
      setFilteredStaff(data);
    } catch (error) {
      showError("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleFilterAndSort = () => {
    let filtered = [...staff];

    // Search by name or email
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          (member.fullName || member.full_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter && roleFilter !== "all") {
      filtered = filtered.filter(
        (member) => member.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Filter by status
    if (statusFilter && statusFilter !== "all") {
      const isActive = statusFilter === "true";
      filtered = filtered.filter(
        (member) => (member.isActive ?? member.is_active) === isActive
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "fullName":
          return (a.fullName || a.full_name || "").localeCompare(
            b.fullName || b.full_name || ""
          );
        case "email":
          return a.email.localeCompare(b.email);
        case "role":
          return (a.role || "").localeCompare(b.role || "");
        case "createdAt":
          return (
            new Date(b.createdAt || b.created_at || 0) -
            new Date(a.createdAt || a.created_at || 0)
          );
        default:
          return 0;
      }
    });

    setFilteredStaff(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleCreate = () => {
    setEditingStaff(null);
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setShowForm(true);
  };

  const handleDelete = (member) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận vô hiệu hóa nhân viên",
      message: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${
        member.fullName || member.full_name
      }"?`,
      onConfirm: () => confirmDelete(member.id),
      type: "danger",
    });
  };

  const confirmDelete = async (staffId) => {
    try {
      await staffService.updateStaffStatus(staffId, false);
      showSuccess("Đã vô hiệu hóa tài khoản nhân viên");
      await fetchStaff();
    } catch (error) {
      showError(error.message || "Không thể cập nhật trạng thái nhân viên");
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const newStatus = !(member.isActive ?? member.is_active);
      await staffService.updateStaffStatus(member.id, newStatus);
      showSuccess(
        `Đã ${newStatus ? "kích hoạt" : "vô hiệu hóa"} tài khoản thành công`
      );
      await fetchStaff();
    } catch (error) {
      showError(error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleRestore = (member) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận khôi phục",
      message: `Bạn có chắc chắn muốn khôi phục tài khoản "${
        member.fullName || member.full_name
      }"?`,
      onConfirm: () => confirmRestore(member.id),
      type: "success",
    });
  };

  const confirmRestore = async (staffId) => {
    try {
      await staffService.updateStaffStatus(staffId, true);
      showSuccess("Khôi phục tài khoản thành công");
      await fetchStaff();
    } catch (error) {
      showError(error.message || "Không thể khôi phục tài khoản");
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleDeletePermanent = (member) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa vĩnh viễn",
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${
        member.fullName || member.full_name
      }"? Hành động này không thể hoàn tác!`,
      onConfirm: () => confirmDeletePermanent(member.id),
      type: "danger",
    });
  };

  const confirmDeletePermanent = async (staffId) => {
    try {
      await staffService.deleteStaffPermanent(staffId);
      showSuccess("Đã xóa vĩnh viễn tài khoản");
      await fetchStaff();
    } catch (error) {
      showError(error.message || "Không thể xóa vĩnh viễn tài khoản");
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff.id, formData);
        showSuccess("Cập nhật nhân viên thành công");
      } else {
        await staffService.createStaff(formData);
        showSuccess("Tạo tài khoản nhân viên mới thành công");
      }

      setShowForm(false);
      setEditingStaff(null);
      await fetchStaff();
    } catch (error) {
      showError(error.message || "Có lỗi xảy ra");
      throw error; // Re-throw để form có thể xử lý
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  // ==================== PAGINATION ====================

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStaff.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <SkeletonTable rows={12} columns={5} />
        )}
      </div>
    );
  }

  const paginatedStaff = getPaginatedData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản Lý Nhân Viên
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Quản lý tài khoản nhân viên nhà hàng (Admin, Bếp, Phục vụ)
                <span
                  className={`ml-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    isConnected
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {isConnected ? "Live" : "Offline"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-4 h-4" />
              Thêm nhân viên
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Filter Bar */}
        <StaffFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateNew={handleCreate}
        />

        {/* Staff Display */}
        {paginatedStaff.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <div className="bg-white rounded-lg shadow-sm">
                <StaffList
                  staff={paginatedStaff}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onRestore={handleRestore}
                  onDeletePermanent={handleDeletePermanent}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedStaff.map((member) => (
                  <StaffCard
                    key={member.id}
                    member={member}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onRestore={handleRestore}
                    onDeletePermanent={handleDeletePermanent}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredStaff.length}
                pageSize={itemsPerPage}
                onPageChange={(p) => handlePageChange(p)}
                onPageSizeChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                ? "Không tìm thấy nhân viên phù hợp"
                : "Chưa có nhân viên nào. Hãy thêm nhân viên đầu tiên!"}
            </p>
          </div>
        )}
      </div>

      {/* Staff Form Modal */}
      {showForm && (
        <StaffForm
          staff={editingStaff}
          onSubmit={handleFormSubmit}
          onClose={handleFormCancel}
        />
      )}

      {/* Alert Modal */}
      {alert.isOpen && (
        <AlertModal
          isOpen={alert.isOpen}
          type={alert.type}
          message={alert.message}
          onClose={closeAlert}
        />
      )}

      {/* Confirm Modal */}
      {confirmDialog.isOpen && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onClose={closeConfirmDialog}
          type={confirmDialog.type}
        />
      )}
    </div>
  );
};

export default StaffScreen;
