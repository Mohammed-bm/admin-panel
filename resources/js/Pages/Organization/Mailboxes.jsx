import React from 'react';
import { Typography, Chip } from '@mui/material';
import TableView from '@/Components/DataTable/TableView';
import Pagination from '@/Components/DataTable/pagination';
import { router } from '@inertiajs/react';

export default function Mailboxes({ organization, mailboxes = [], pagination = {} }) {
    const currentPage = pagination.current_page || 1;
    const currentPerPage = pagination.per_page || 10;
    const lastPage = pagination.last_page || 1;

    const tableData = mailboxes.map((mailboxes, index) => ({
        ...mailboxes,
        row_number: (currentPage - 1) * currentPerPage + index + 1,
    }));
    // Define the columns for DataTables.net
    const columns = [
        {
            title: 'Email',
            data: 'email'
        },
        {
            title: 'License Type',
            render: (data, type, row) => {
                const activeAssignment = row.assignments?.find(
                    a => a.status === 'active'
                );

                return activeAssignment?.license?.license_type_name || '-';
            },
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
            title: 'Created At',
            render: (data, type, row) => {
                const activeAssignment = row.assignments?.find(
                    a => a.status === 'active'
                );

                const createdAt = activeAssignment?.license?.created_at || '-';

                if (!createdAt) {
                    return '-';
                }

                return new Date(createdAt).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            },
        },
        {
            title: 'Expires At',
            render: (data, type, row) => {
                const activeAssignment = row.assignments?.find(
                    a => a.status === 'active'
                );

                return activeAssignment?.license?.expires_at || '-';
            },
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

    const updateParams = (newParams) => {
        const query = {
            mailboxes_page: currentPage,
            mailboxes_per_page: currentPerPage,
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
            mailboxes_page: page,
        });
    };

    const handleLengthChange = (perPage) => {
        updateParams({
            mailboxes_page: 1,
            mailboxes_per_page: perPage,
        });
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