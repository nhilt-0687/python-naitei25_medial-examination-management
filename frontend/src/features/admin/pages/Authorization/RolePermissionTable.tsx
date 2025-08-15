// RolePermissionTable.tsx - FILE GỐC CỦA BẠN SAU KHI REFACTOR
import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/sections/authorization/LoadingSpinner";
import ErrorDisplay from "../../components/sections/authorization/ErrorDisplay";
import RoleManagementHeader from "../../components/sections/authorization/RoleManagementHeader";
import RoleSearchFilter from "../../components/sections/authorization/RoleSearchFilter";
import RoleTable from "../../components/sections/authorization/RoleTable";
import PermissionModal from "../../components/sections/authorization/PermissionModal";
import type { Role } from "../../services/authorizationService";
import { permissionsData, roleService } from "../../services/authorizationService";
import { PAGE_SIZE } from "../../../../shared/constants/constants";

export default function RolePermissionTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);

  useEffect(() => {
    const fetchRolesWithUserCount = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await roleService.getRoles({
          page: currentPage,
          limit: PAGE_SIZE,
          search: searchTerm || undefined,
        });

        const userRes = await import("../../services/authorizationService").then(m => 
          m.userService.getUsers({ limit: 1000 })
        );
        const users = userRes.users;

        const nameToRole = {
          "Quản trị viên": "ADMIN",
          "Bác sĩ": "DOCTOR",
          "Lễ tân": "RECEPTIONIST",
          "Bệnh nhân": "PATIENT",
        };
        const rolesWithUserCount = res.roles.map((role) => {
          const backendRole = nameToRole[role.name as keyof typeof nameToRole];
          const userCount = users.filter((u) => u.role === backendRole).length;
          return { ...role, userCount };
        });
        setRoles(rolesWithUserCount);
        setTotalItems(res.total);
        setTotalPages(res.totalPages);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu vai trò");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRolesWithUserCount();
  }, [currentPage, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewPermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionModal(true);
  };

  const handleStartEditingPermissions = () => {
    if (selectedRole) {
      setEditingPermissions([...selectedRole.permissions]);
      setIsEditingPermissions(true);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setEditingPermissions((current) => {
      if (current.includes(permissionId)) {
        return current.filter((id) => id !== permissionId);
      } else {
        return [...current, permissionId];
      }
    });
  };

  const handleSavePermissions = () => {
    // TODO: Call API to update permissions for the selected role
    setIsEditingPermissions(false);
  };

  const handleCancelEditingPermissions = () => {
    setIsEditingPermissions(false);
    setEditingPermissions([]);
  };

  const handleCloseModal = () => {
    setShowPermissionModal(false);
    setIsEditingPermissions(false);
    setEditingPermissions([]);
  };

  if (isLoading) {
    return <LoadingSpinner message="Đang tải dữ liệu vai trò..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <RoleManagementHeader totalItems={totalItems} />
        <RoleSearchFilter 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />
        <RoleTable
          roles={roles}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onViewPermissions={handleViewPermissions}
        />
      </div>

      {showPermissionModal && selectedRole && (
        <PermissionModal
          role={selectedRole}
          permissionsData={permissionsData}
          isEditing={isEditingPermissions}
          editingPermissions={editingPermissions}
          onClose={handleCloseModal}
          onStartEditing={handleStartEditingPermissions}
          onTogglePermission={handleTogglePermission}
          onSave={handleSavePermissions}
          onCancel={handleCancelEditingPermissions}
        />
      )}
    </div>
  );
}
