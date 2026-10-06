import React from 'react';
import { router } from '@inertiajs/react';
import { TableSearchInput, TableFilterDropdown, TableView } from '@/components/DataTable';
import Pagination from '@/Components/DataTable/pagination';

export default function UserActivity({
    user,
    activities = [],
    pagination = {},
    filters = {}
}) {
    // Grab the current active tab from the URL so we can preserve it
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'activity'; // Adjust default tab name if needed

    const safePagination = pagination || {};

    const currentPage = safePagination.current_page || 1;
    const currentPerPage = safePagination.per_page || 10;
    const lastPage = safePagination.last_page || 1;
    const total = safePagination.total || 0;

    const tableData = activities.map((activity, index) => ({
        ...activity,
        row_number: (currentPage - 1) * currentPerPage + index + 1,
    }));

    const columns = [
        {
            title: 'Category',
            render: (data, type, row) => {
                const category = row.category || 'GENERAL';
                return `<span class="font-semibold text-xs px-2 py-1 bg-gray-100 rounded-md">[${category.toUpperCase()}]</span>`;
            }
        },
        {
            title: 'Organization',
            data: 'organization',
            render: (data) => data || '-'
        },
        {
            title: 'App',
            data: 'app',
            render: (data) => data || '-'
        },
        {
            title: 'Activity',
            data: 'activity',
        },
        {
            title: 'Status',
            data: 'status',
            render: (data) => data || '-'
        },
        {
            title: 'Date & Time',
            render: (data, type, row) => row.date_time || '-',
        },
    ];

    const {
        search = '',
        filter = '',
        start_date = '',
        end_date = '',
    } = filters;

    const handlePageChange = (page) => {
        updateParams({ page, per_page: currentPerPage });
    };

    const handleLengthChange = (perPage) => {
        updateParams({ page: 1, per_page: perPage });
    };

    const handleSearch = (searchValue) => {
        updateParams({ search: searchValue, page: 1 });
    };

    const handleFilter = (filterValue) => {
        updateParams({ filter: filterValue, page: 1 });
    };

    const handleDateFilter = (startDate, endDate) => {
        updateParams({
            filter: 'custom',
            start_date: startDate,
            end_date: endDate,
            page: 1,
        });
    };

    const handleReset = () => {
        router.get(`/users/${user.id}`, { tab: activeTab }, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const updateParams = (newParams) => {
        const query = {
            tab: activeTab, // Always preserve the current tab!
            filter: filter || undefined,
            search: search || undefined,
            start_date: start_date || undefined,
            end_date: end_date || undefined,
            page: currentPage,
            per_page: currentPerPage || undefined,
            ...newParams,
        };

        // Clean out empty/undefined keys
        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '') delete query[key];
        });

        router.get(`/users/${user.id}`, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <div className="mt-6 space-y-4">
            <div className="flex items-end gap-4">
                <div className="flex flex-col items-start gap-1">
                    <TableFilterDropdown
                        onFilter={handleFilter}
                        onDateFilter={handleDateFilter}
                    />
                </div>
                <div>
                    <span className="text-sm font-medium text-gray-500">Search:</span>
                    <TableSearchInput
                        activeSearch={search}
                        onSearch={handleSearch}
                        placeholder="Search organizations by name, email, website..."
                    />
                </div>

                <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                >
                    Reset
                </button>
            </div>

            <div>
                
                <TableView
                    columns={columns}
                    data={tableData}
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    total={total}
                    perPage={currentPerPage}
                    onPageChange={handlePageChange}
                    onLengthChange={handleLengthChange}
                />
            </div>
        </div>
    );
}