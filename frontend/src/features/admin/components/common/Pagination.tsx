import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  // Debug log
  console.log("Pagination component props:", {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
  });

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const getPages = () => {
    const pages = [];
    console.log("getPages called with totalPages:", totalPages);
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    console.log("Generated pages:", pages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Hiển thị
            <span className="font-medium mx-1">{start}</span>
            đến
            <span className="font-medium mx-1">{end}</span>
            trong tổng số
            <span className="font-medium mx-1">{totalItems}</span>
            kết quả
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-xs"
            aria-label="Pagination"
          >
            <button
              onClick={() => {
                console.log(
                  "Previous button clicked, currentPage:",
                  currentPage
                );
                if (currentPage > 1) {
                  onPageChange(currentPage - 1);
                }
              }}
              disabled={currentPage <= 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-gray-300 ring-inset focus:z-20 focus:outline-offset-0 ${
                currentPage <= 1
                  ? "text-gray-300 cursor-not-allowed opacity-50"
                  : "text-gray-400 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {getPages().map((page) => (
              <button
                key={page}
                onClick={() => {
                  console.log("Page number clicked:", page);
                  onPageChange(page);
                }}
                aria-current={page === currentPage ? "page" : undefined}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 cursor-pointer ${
                  page === currentPage
                    ? "z-10 bg-base-600 text-white"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => {
                console.log(
                  "Next button clicked, currentPage:",
                  currentPage,
                  "totalPages:",
                  totalPages
                );
                if (currentPage < totalPages) {
                  onPageChange(currentPage + 1);
                }
              }}
              disabled={currentPage >= totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-gray-300 ring-inset focus:z-20 focus:outline-offset-0 ${
                currentPage >= totalPages
                  ? "text-gray-300 cursor-not-allowed opacity-50"
                  : "text-gray-400 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="size-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
