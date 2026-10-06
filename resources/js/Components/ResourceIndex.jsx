import React from 'react';
import { router } from '@inertiajs/react';
import TableView from '@/components/DataTable/TableView';
import TableSearchInput from '@/components/DataTable/TableSearchInput';
import TableFilterDropdown from '@/components/DataTable/TableFilterDropdown';
import Pagination from '@/Components/DataTable/pagination';

export default function ResourceIndex({
    title,
    data = [],
    columns = [],
    pagination = {},
    filters = {},
    baseUrl,
    preserveTab = null, // e.g., active tab for profile pages
    searchPlaceholder = "Search...",
    children, // Slot for page-specific custom filters if needed
}) {
    const currentPage = pagination.current_page || 1;
    const currentPerPage = pagination.per_page || 10;
    const lastPage = pagination.last_page || 1;

    const {
        search = '',
        filter = '',
        start_date = '',
        end_date = '',
        ...otherFilters
    } = filters;

    // Unified parameter updater using Inertia
    const updateParams = (newParams) => {
        const query = {
            tab: preserveTab || undefined,
            filter: filter || undefined,
            search: search || undefined,
            start_date: start_date || undefined,
            end_date: end_date || undefined,
            ...otherFilters,
            page: currentPage,
            per_page: currentPerPage || undefined,
            ...newParams,
        };

        // Clean out empty/undefined keys
        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '') delete query[key];
        });

        router.get(baseUrl, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePageChange = (page) => updateParams({ page, per_page: currentPerPage });
    const handleLengthChange = (perPage) => updateParams({ page: 1, per_page: perPage });
    const handleSearch = (searchValue) => updateParams({ search: searchValue, page: 1 });
    const handleFilter = (filterValue) => updateParams({ filter: filterValue, page: 1 });
    const handleDateFilter = (startDate, endDate) => {
        updateParams({
            filter: 'custom',
            start_date: startDate,
            end_date: endDate,
            page: 1,
        });
    };

    const handleReset = () => {
        router.get(baseUrl, preserveTab ? { tab: preserveTab } : {}, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    return (
        <div className="mt-6 space-y-4">
            {/* Header & Controls Toolbar */}
            <div className="flex flex-wrap items-end justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
                <div className="flex items-end gap-4 flex-wrap">
                    <TableFilterDropdown
                        activeFilter={filter}
                        onFilter={handleFilter}
                        onDateFilter={handleDateFilter}
                    />
                    <div>
                        <TableSearchInput
                            activeSearch={search}
                            onSearch={handleSearch}
                            placeholder={searchPlaceholder}
                        />
                    </div>
                    {children} {/* Render any page-specific custom filter elements here */}
                </div>

                <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                >
                    Reset Filters
                </button>
            </div>
            
            {/* Data Table Section */}
            <div className="bg-white p-4 shadow sm:rounded-lg space-y-4">
                {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
                <TableView columns={columns} data={data} />
            </div>

            {/* Pagination Bar */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    total={pagination.total || 0}
                    perPage={currentPerPage}
                    onPageChange={handlePageChange}
                    onLengthChange={handleLengthChange}
                />
            </div>
        </div>
    );
}