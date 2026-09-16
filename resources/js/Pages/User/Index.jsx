import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router, Head } from '@inertiajs/react';
import { useRef } from 'react';

import { TableSearchInput, TableFilterDropdown, TableView } from '@/components/DataTable';

import "react-datepicker/dist/react-datepicker.css";

export default function Index({ users, filters = {} }) {

    const tableRef = useRef(null);

    const currentPage = users.current_page || 1;
    const currentPerPage = users.per_page || 10;

    const columns = [
        {
            data: null, title: '#', orderable: false, searchable: false, render: (data, type, row, meta) => { return (currentPage - 1) * currentPerPage + meta.row + 1; },
        },
        { data: 'id', title: 'User ID' },
        { data: 'first_name', title: 'First Name' },
        { data: 'last_name', title: 'Last Name' },
        { data: 'email', title: 'Email' },
        { data: 'phone', title: 'Phone' },
        { data: 'date', title: 'Date' },
        { data: 'time', title: 'Time' },
        {
            data: 'profile_completed',
            title: 'Profile Created',
            render: (data) => {
                const isCompleted = Number(data) === 1;

                const badgeClass = isCompleted
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border-rose-200';

                const label = isCompleted ? 'Yes' : 'No';

                // Return formatted HTML string for DataTables
                return `<span class="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-md border ${badgeClass}">
            ${label}
        </span>`;
            },
        },
    ];

    const { search = '', filter = '' } = filters;

    const updateParams = (newParams) => {
        console.log('UPDATE PARAMS:', newParams);
        const isFilterOrSearch = 'search' in newParams || 'filter' in newParams;

        const query = {
            filter: filter || undefined,
            search: search || undefined,
            page: isFilterOrSearch ? 1 : currentPage,
            per_page: currentPerPage || undefined,
            ...newParams,
        };

        // Clean out empty/undefined keys so the URL stays clean
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

        console.log('ROUTER.GET /users:', query);
        router.get('/users', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (searchValue) => {
        updateParams({ search: searchValue });
    };

    const handleFilter = (filterValue) => {
        updateParams({ filter: filterValue });
    };

    const handleDateFilter = (startDate, endDate) => {
        updateParams({ filter: `custom:${startDate}:${endDate}` });
    };

    // Reset Handler: Sends request without any query params to reload all users
    const handleReset = () => {
        router.get('/users', {}, {
            preserveState: false, // Allows clean reload of initial page state
            preserveScroll: true,
        });
    };

    const handlePageChange = (page) => {
        console.log('PAGE CHANGE CALLED:', page);
        updateParams({ page });
    };

    const handleLengthChange = (per_page) => {
        updateParams({ per_page, page: 1 }); // Reset to page 1 on page length change
    };

    return (
        <AuthenticatedLayout
        >
            <Head title="Users List" />

            <div>
                <div className="mx-auto lg space-y-2">

                    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Users Management
                        </h2>

                        <div className="flex items-end gap-4">
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-sm font-medium text-gray-500">Filter By Date:</span>

                                <TableFilterDropdown
                                    activeFilter={filter}
                                    onFilter={handleFilter}
                                    onDateFilter={handleDateFilter}
                                />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Search:</span>
                                <TableSearchInput
                                    activeSearch={search}
                                    onSearch={handleSearch}
                                    placeholder="Search users by name, email, or phone..."
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

                    {/* SEPARATE LOCATION 3: Dedicated Table Container */}
                    <div className="bg-white px-4 rounded-xl border border-gray-200/80 shadow-sm">

                        {/* Placed standalone in Table Section */}
                        <TableView
                            ref={tableRef}
                            columns={columns}
                            data={users}
                            onPageChange={handlePageChange}
                            onLengthChange={handleLengthChange}
                        />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}