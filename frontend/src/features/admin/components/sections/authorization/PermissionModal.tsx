import React from 'react';
import PermissionCategory from './PermissionCategory';
import type { Role, Permission } from "../../../services/authorizationService";

interface PermissionModalProps {
    role: Role;
    permissionsData: Permission[];
    isEditing: boolean;
    editingPermissions: string[];
    onClose: () => void;
    onStartEditing: () => void;
    onTogglePermission: (permissionId: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function PermissionModal({
    role,
    permissionsData,
    isEditing,
    editingPermissions,
    onClose,
    onStartEditing,
    onTogglePermission,
    onSave,
    onCancel
}: PermissionModalProps) {
    const getPermissionsByCategory = (permissions: string[]) => {
        const categories: { [key: string]: Permission[] } = {};
        permissions.forEach((permId) => {
            const permission = permissionsData.find((p) => p.id === permId);
            if (permission) {
                if (!categories[permission.category]) {
                    categories[permission.category] = [];
                }
                categories[permission.category].push(permission);
            }
        });
        return categories;
    };

    const currentPermissions = isEditing ? editingPermissions : role.permissions;
    const categorizedPermissions = getPermissionsByCategory(currentPermissions);

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-10 overflow-hidden">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                        Quyền của vai trò: {role.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 hover:bg-slate-50 rounded-full dark:text-gray-400 dark:hover:text-gray-200 p-2"
                        title="Đóng"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {Object.entries(categorizedPermissions).map(([category]) => (
                        <PermissionCategory
                            key={category}
                            category={category}
                            permissions={permissionsData.filter((p) => p.category === category)}
                            selectedPermissions={currentPermissions}
                            isEditing={isEditing}
                            onTogglePermission={onTogglePermission}
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    {isEditing ? (
                        <>
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={onSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700"
                            >
                                Lưu thay đổi
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={onStartEditing}
                                className="px-4 py-2 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700"
                            >
                                Chỉnh sửa quyền
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
