import React from 'react';
import { TableCell, TableRow } from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { Shield } from "lucide-react";
import type { Role } from "../../../services/authorizationService";

interface RoleTableRowProps {
    role: Role;
    onViewPermissions: (role: Role) => void;
}

export default function RoleTableRow({ role, onViewPermissions }: RoleTableRowProps) {
    return (
        <TableRow key={role.id}>
            <TableCell className="py-3">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {role.name}
                        </p>
                        <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {role.id}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-xs">
                <div className="truncate" title={role.description}>
                    {role.description}
                </div>
            </TableCell>
            <TableCell className="py-3">
                <Badge size="sm" color="base">
                    {role.userCount} người
                </Badge>
            </TableCell>
            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {role.permissions.length} quyền
            </TableCell>
            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {role.updatedAt}
            </TableCell>
            <TableCell className="py-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewPermissions(role)}
                        className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                        title="Xem quyền"
                    >
                        <Shield size={14} />
                        Phân quyền
                    </button>
                </div>
            </TableCell>
        </TableRow>
    );
}
