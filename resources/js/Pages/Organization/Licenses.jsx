import React from 'react';
import TableView from '@/Components/DataTable/TableView';
import Pagination from '@/Components/DataTable/Pagination';
import { router } from '@inertiajs/react';
import { TableFilterDropdown } from '@/components/DataTable';

export default function Licenses({ organization, licenses = [], pagination = {}, filters = {}, licenseFilters = {} }) {

    const currentPage = pagination.current_page || 1;
    const currentPerPage = pagination.per_page || 10;
    const lastPage = pagination.last_page || 1;

    const tableData = licenses.map((license, index) => ({
        ...license,
        row_number: (currentPage - 1) * currentPerPage + index + 1,
    }));

    const columns = [
        {
            title: 'License Code',
            data: 'license_code',
        },
        {
            title: 'License Type',
            data: 'license_type_name',
        },
        {
            title: 'Storage',
            render: (data, type, row) => {
                return row.total_storage_gb != null
                    ? `${row.total_storage_gb} GB`
                    : '-';
            },
        },
        {
            title: 'Created At',
            render: (data, type, row) => {
                if (!row.created_at) {
                    return '-';
                }

                return new Date(row.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
            },
        },
        {
            title: 'Expires At',
            data: 'expires_at',
            render: (data) => {
                return data || '-';
            },
        },
        {
            title: 'Status',
            render: (data, type, row) => {
                const status = row.status || 'unknown';

                return `<span class="text-xs rounded-md ${status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : status === 'assigned'
                        ? 'bg-blue-100 text-blue-700'
                        : status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }">${status}</span>`;
            },
        },
    ];

    const updateParams = (newParams) => {
        const query = {
            tab: 'licenses',

            licenses_page: currentPage,
            licenses_per_page: currentPerPage,

            licenses_filter: licenseFilters.filter,
            licenses_start_date: licenseFilters.start_date,
            licenses_end_date: licenseFilters.end_date,

            ...newParams,
        };

        Object.keys(query).forEach((key) => {
            if (
                query[key] === undefined ||
                query[key] === null ||
                query[key] === ''
            ) {
                delete query[key];
            }
        });

        router.get(`/organization/${organization.id}`, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePageChange = (page) => {
        updateParams({
            licenses_page: page,
        });
    };

    const handleLengthChange = (perPage) => {
        updateParams({
            licenses_page: 1,
            licenses_per_page: perPage,
        });
    };

    const handleFilter = (filterValue) => {
        updateParams({
            licenses_filter: filterValue,
            licenses_start_date: undefined,
            licenses_end_date: undefined,
            licenses_page: 1,
        });
    };

    const handleDateFilter = (startDate, endDate) => {
        updateParams({
            licenses_filter: 'custom',
            licenses_start_date: startDate,
            licenses_end_date: endDate,
            licenses_page: 1,
        });
    };

    const handleReset = () => {
        router.get(`/organization/${organization.id}`, {
            tab: 'licenses',
            licenses_page: 1,
            licenses_per_page: currentPerPage,
        }, {
            preserveState: false,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <div>
            <div className="flex flex-col gap-4 bg-white p-2 rounded-xl border border-gray-200/80 shadow-sm">
                <div className="flex items-end gap-4">
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-medium text-gray-500">
                            Filter By Date:
                        </span>

                        <TableFilterDropdown
                            onFilter={handleFilter}
                            onDateFilter={handleDateFilter}
                            activeFilter={licenseFilters.filter || ''}
                        />
                    </div>

                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div>
                <TableView
                    columns={columns}
                    data={tableData}
                />
            </div>

            <div className="mt-4 bg-white rounded-xl border border-gray-200/80 shadow-sm">
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