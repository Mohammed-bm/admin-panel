import React from 'react';
import { router } from '@inertiajs/react';
import { TableSearchInput, TableFilterDropdown, TableView } from '@/components/DataTable';
import Pagination from '@/Components/DataTable/pagination';

export default function UserPayments({
    user,
    payments = {},
    filters = {}
}) {
    console.log("payments:", payments)
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab') || 'payments';

    const subscriptionList = payments?.data || [];
    const currentPage = payments?.current_page || 1;
    const currentPerPage = payments?.per_page || 10;
    const lastPage = payments?.last_page || 1;
    const total = payments?.total || 0;

    const tableData = subscriptionList.map((org, index) => ({
        ...org,
        email: user?.email || '-',
        row_number: (currentPage - 1) * currentPerPage + index + 1,
    }));

    const columns = [
        {
            title: '#',
            data: 'row_number',
            orderable: false,
            searchable: false,
        },
        {
            title: 'Organization',
            data: 'organization_name',
            render: (data) => data || '-',
        },
        {
            title: 'App Name',
            data: 'app_name',
            render: (data) => data || '-',
        },
        {
            title: 'provider',
            data: 'provider',
            render: (data) => data || '-',
        },
        {
            title: 'method',
            data: 'method',
            render: (data) => data || '-',
        },
        {
            title: 'Amount',
            data: 'amount',
            render: (data, row) => data ? `${row.currency ? row.currency.toUpperCase() : '$'} ${(parseFloat(data)).toFixed(2)}` : '$0.00',
        },
        {
            title: 'Payment Status',
            data: 'status',
            render: (data) => data || '-',
        },
        {
            title: 'Created At',
            data: 'created_at',
            render: (data) => data || '-',
        },
        {
            title: 'Updated At',
            data: 'updated_at',
            render: (data) => data || '-',
        },
    ];

    const {
        search = '',
        filter = '',
        start_date = '',
        end_date = '',
    } = filters || {};

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
            tab: activeTab,
            filter: filter || undefined,
            search: search || undefined,
            start_date: start_date || undefined,
            end_date: end_date || undefined,
            page: currentPage,
            per_page: currentPerPage || undefined,
            ...newParams,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === undefined || query[key] === '' || query[key] === null) {
                delete query[key];
            }
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
                        placeholder="Search organizations by name, website..."
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