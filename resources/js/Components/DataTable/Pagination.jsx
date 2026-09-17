const Pagination = ({
    currentPage,
    lastPage,
    total,
    perPage,
    onPageChange,
    onLengthChange,
}) => {
    const getPages = () => {
        if (lastPage <= 7) {
            return Array.from({ length: lastPage }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', lastPage];
        }

        if (currentPage >= lastPage - 3) {
            return [
                1,
                '...',
                lastPage - 4,
                lastPage - 3,
                lastPage - 2,
                lastPage - 1,
                lastPage,
            ];
        }

        return [
            1,
            '...',
            currentPage - 1,
            currentPage,
            currentPage + 1,
            '...',
            lastPage,
        ];
    };

    const pages = getPages();
    return (
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
                <span>Show</span>

                <select
                    value={perPage}
                    onChange={(e) => onLengthChange(Number(e.target.value))}
                    className="border border-gray-200 rounded-md pl-2 pr-5 py-1 bg-white cursor-pointer"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <div className="flex items-center gap-1">
                <button
                    className="w-8 h-8 flex items-center justify-center rounded-full text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed text-lg font-semibold"
                    disabled={currentPage === 1}
                    onClick={() => {
                        console.log('PREVIOUS CLICK:', currentPage - 1);
                        onPageChange(currentPage - 1);
                    }}
                >
                    ‹
                </button>

                {pages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 py-1"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => {
                                console.log('PAGINATION CLICK:', page);
                                onPageChange(page);
                            }}
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${currentPage === page
                                ? 'bg-purple-700 text-white font-medium'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    className="w-8 h-8 flex items-center justify-center rounded-full text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed text-lg font-semibold"
                    disabled={currentPage === lastPage}
                    onClick={() => {
                        console.log('NEXT CLICK:', currentPage + 1);
                        onPageChange(currentPage + 1);
                    }}
                >
                    ›
                </button>
            </div>
            <div className="text-sm text-gray-500">
                View {((currentPage - 1) * perPage) + 1}
                -
                {Math.min(currentPage * perPage, total)}
                of {total} list
            </div>
        </div>
    );
};

export default Pagination;