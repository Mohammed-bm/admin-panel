import React from 'react';
import { Typography } from '@mui/material';
import TableView from '@/Components/DataTable/TableView';
import Pagination from '@/Components/DataTable/pagination';
import { router } from '@inertiajs/react';
import { TableFilterDropdown } from '@/components/DataTable';

export default function Mailboxes({ organization, mailboxes = [], pagination = {}, mailboxFilters = {} }) {
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
            tab: 'mailboxes',

            mailboxes_page: currentPage,
            mailboxes_per_page: currentPerPage,

            mailboxes_filter: mailboxFilters.filter,
            mailboxes_start_date: mailboxFilters.start_date,
            mailboxes_end_date: mailboxFilters.end_date,

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
            mailboxes_page: page,
            mailboxes_per_page: currentPerPage,
        });
    };

    const handleLengthChange = (perPage) => {
        updateParams({
            mailboxes_page: 1,
            mailboxes_per_page: currentPerPage,
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
        router.get(
            `/organization/${organization.id}`,
            {
                tab: 'mailboxes',
                mailboxes_page: 1,
                mailboxes_per_page: currentPerPage,
            }, {
            preserveState: false,
            preserveScroll: true,
            replace: true,
        }
        );
    };

    return (
        <div className='mt-6'>
            <div className="flex flex-col gap-4 bg-white p-2 rounded-xl border border-gray-200/80 shadow-sm">
                <div className="flex items-end gap-4">
                    <div className="flex flex-col items-start gap-1">


                        <TableFilterDropdown
                            onFilter={handleFilter}
                            onDateFilter={handleDateFilter}
                            activeFilter={mailboxFilters.filter || ''}
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