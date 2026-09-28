import React from 'react';
import { Typography } from '@mui/material';
import TableView from '@/Components/DataTable/TableView';
import Pagination from '@/Components/DataTable/Pagination';
import { router } from '@inertiajs/react';
import { TableSearchInput, TableFilterDropdown } from '@/components/DataTable';

export default function Licenses({ organization, licenses = [], pagination = {}, filters = {} }) {

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
            licenses_page: currentPage,
            licenses_per_page: currentPerPage,
            ...newParams,
        };

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

    const { filter = '' } = filters;

    const handleFilter = (filterValue) => {
        updateParams({ filter: filterValue });
    };

    const handleDateFilter = (startDate, endDate) => {
        updateParams({ filter: `custom:${startDate}:${endDate}` });
    };

    const handleReset = () => {
        router.get(`/organization/${organization.id}`, {}, {
            preserveState: false, // Allows clean reload of initial page state
            preserveScroll: true,
        });
    };

    return (
        <div>
            {licenses.length === 0 ? (
                <Typography color="text.secondary">
                    No licenses found.
                </Typography>
            ) : (
                <>
                    <div className="flex items-end gap-4">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-sm font-medium text-gray-500">Filter By Date:</span>

                            <TableFilterDropdown
                                onFilter={handleFilter}
                                onDateFilter={handleDateFilter}
                            />
                        </div>

                        <button
                            onClick={handleReset}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                    <TableView
                        columns={columns}
                        data={tableData}
                    />
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
                </>
            )}
        </div>
    );
}