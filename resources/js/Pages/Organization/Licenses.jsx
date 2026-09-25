import React from 'react';
import { Typography } from '@mui/material';
import TableView from '@/Components/DataTable/TableView';
import Pagination from '@/Components/DataTable/Pagination';
import { router } from '@inertiajs/react'; 

export default function Licenses({ licenses = [], pagination = {} }) {
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
        {
            title: 'Expires At',
            data: 'expires_at',
            render: (data) => {
                return data || '-';
            },
        },
    ];

    const handlePageChange = (page) => {
        router.get(
            window.location.pathname,
            {
                licenses_page: page,
                licenses_per_page: pagination.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleLengthChange = (perPage) => {
        router.get(
            window.location.pathname,
            {
                licenses_page: 1,
                licenses_per_page: perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <div>
            {licenses.length === 0 ? (
                <Typography color="text.secondary">
                    No licenses found.
                </Typography>
            ) : (
                <>
                    <TableView
                        columns={columns}
                        data={licenses}
                    />
                    <div className="mt-4 bg-white rounded-xl border border-gray-200/80 shadow-sm">
                        <Pagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            onPageChange={handlePageChange}
                            onLengthChange={handleLengthChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}