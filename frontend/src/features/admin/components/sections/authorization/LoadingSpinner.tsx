import React from "react";

interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({
    message = "Đang tải dữ liệu...",
}: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-t-base-600 border-base-200 rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
}
