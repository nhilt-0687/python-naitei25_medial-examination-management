import React from 'react';
import { Table, TableBody } from "../../ui/table";
import Pagination from "../../common/Pagination";
import RoleTableHeader from './RoleTableHeader';
import RoleTableRow from './RoleTableRow';
import type { Role } from "../../../services/authorizationService";
import { PAGE_SIZE } from "../../../../../shared/constants/constants";

interface RoleTableProps {
    roles: Role[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onViewPermissions: (role: Role) => void;
}

export default function RoleTable({
    roles,
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    onViewPermissions
}: RoleTableProps) {
    return (
        <div className="max-w-full overflow-x-auto">
            <Table>
                <RoleTableHeader />
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {roles.map((role) => (
                        <RoleTableRow
                            key={role.id}
                            role={role}
                            onViewPermissions={onViewPermissions}
                        />
                    ))}
                </TableBody>
            </Table>
            <div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={PAGE_SIZE}
                    totalItems={totalItems}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}
