import React from 'react';

interface ErrorDisplayProps {
    error: string;
    onRetry?: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-red-100 p-3">
                <svg
                    className="size-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <div>
                <p className="text-gray-900 font-medium dark:text-white">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
}