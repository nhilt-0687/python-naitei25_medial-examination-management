import React from 'react';
import SearchInput from "../../common/SearchInput";

interface RoleSearchFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export default function RoleSearchFilter({ searchTerm, onSearchChange }: RoleSearchFilterProps) {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <SearchInput
                    placeholder="Tìm kiếm vai trò..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </div>
    );
}
