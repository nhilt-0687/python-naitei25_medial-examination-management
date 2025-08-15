import React from 'react';
import type { Permission } from "../../../services/authorizationService";

interface PermissionCategoryProps {
    category: string;
    permissions: Permission[];
    selectedPermissions: string[];
    isEditing: boolean;
    onTogglePermission?: (permissionId: string) => void;
}

export default function PermissionCategory({
    category,
    permissions,
    selectedPermissions,
    isEditing,
    onTogglePermission
}: PermissionCategoryProps) {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">
                {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {permissions.map((permission) => (
                    <div
                        key={permission.id}
                        className={`flex items-center gap-2 p-2 rounded-md ${isEditing
                                ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                : selectedPermissions.includes(permission.id)
                                    ? "bg-green-50 dark:bg-green-900/20"
                                    : "bg-gray-50 dark:bg-gray-800"
                            }`}
                        onClick={() => {
                            if (isEditing && onTogglePermission) {
                                onTogglePermission(permission.id);
                            }
                        }}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${selectedPermissions.includes(permission.id)
                                    ? "bg-green-500"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {permission.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
