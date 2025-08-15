import React from 'react';
import { TableCell, TableHeader, TableRow } from "../../ui/table";

export default function RoleTableHeader() {
    return (
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Tên vai trò
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Mô tả
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Số người dùng
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Số quyền
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Cập nhật cuối
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Thao tác
                </TableCell>
            </TableRow>
        </TableHeader>
    );
}
