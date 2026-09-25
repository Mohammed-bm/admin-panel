import React from 'react';
import { Typography, Chip } from '@mui/material';
import TableView from '@/Components/DataTable/TableView';
import Pagination from '@/Components/DataTable/pagination';
import { router } from '@inertiajs/react';

export default function Mailboxes({ mailboxes = [], pagination = {} }) {
    // Define the columns for DataTables.net
    const columns = [
        {
            title: 'Email',
            data: 'email'
        },
        {
            title: 'License',
            render: (data, type, row) => {
                const activeAssignment = row.assignments?.find(a => a.status === 'active');
                return activeAssignment?.license?.license_code || '-';
            }
        },
        {
            title: 'License Type',
            render: (data, type, row) => {
                const activeAssignment = row.assignments?.find(a => a.status === 'active');
                return activeAssignment?.license?.license_type_name || '-';
            }
        },
        {
            title: 'Storage',
            render: (data, type, row) => {
                const activeAssignment = row.assignments?.find(a => a.status === 'active');
                const storage = activeAssignment?.license?.total_storage_gb;
                return storage != null ? `${storage} GB` : '-';
            }
        },
        {
            title: 'Status',
            render: (data, type, row) => {
                // Return HTML string or label for DataTables rendering
                const status = row.status || 'unknown';
                return `<span class="text-xs rounded-md ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }">${status}</span>`;
            }
        },
    ];

    const handlePageChange = (page) => {
        router.get(
            window.location.pathname,
            {
                mailboxes_page: page,
                mailboxes_per_page: pagination.per_page,
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
                mailboxes_page: 1,
                mailboxes_per_page: perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <div>

            {mailboxes.length === 0 ? (
                <Typography color="text.secondary">
                    No mailboxes found.
                </Typography>
            ) : (
                <>
                    <TableView
                        columns={columns}
                        data={mailboxes}
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