import React from "react";
import { router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useRef } from 'react';
import Pagination from '@/Components/DataTable/Pagination';

import "react-datepicker/dist/react-datepicker.css";
import { FiEye } from 'react-icons/fi';

import { TableSearchInput, TableFilterDropdown, TableView } from '@/components/DataTable';

export default function Index({ organizations, filters = {} }) {

    const tableRef = useRef(null);

    const currentPage = organizations.current_page || 1;
    const currentPerPage = organizations.per_page || 10;
    const lastPage = organizations.last_page || 1;

    const tableData = organizations.data.map((organization, index) => ({
        ...organization,
        row_number: (currentPage - 1) * currentPerPage + index + 1,
    }));

    console.log('Organizations Data:', organizations.data);

    const columns = [
        {
            data: 'row_number', title: '#', orderable: false, searchable: false,
        },
        { data: 'email', title: 'Email' },
        { data: 'name', title: 'Name' },
        { data: 'website', title: 'Website' },
        { data: 'plan', title: 'Plan' },
        { data: 'balance', title: 'Balance', render: (data) => data ? `$${(Math.floor(parseFloat(data) * 100) / 100).toFixed(2)}` : '$0.00' },
        { data: 'date', title: 'Date' },
        {
            data: null,
            name: 'action',
            title: 'Action',
        }
    ];

    const slots = {
        action: (data, row) => (
            <button
                type="button"
                onClick={() => router.visit(`/organization/${row.id}`)}
            >
                <FiEye size={18} />
            </button>
        ),
    };

    const { search = '', filter = '' } = filters;

    const updateParams = (newParams) => {
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

        router.get('/organization', query, {
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

    const handleReset = () => {
        router.get('/organization', {}, {
            preserveState: false, // Allows clean reload of initial page state
            preserveScroll: true,
        });
    };

    const handlePageChange = (page) => {
        updateParams({ page });
    };

    const handleLengthChange = (per_page) => {
        updateParams({ per_page, page: 1 });
    };

    return (
        <AuthenticatedLayout
        >
            <Head title="organizations List" />

            <div>
                <div className="mx-auto lg space-y-2">

                    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm">
                        <h2 className="text-xl font-bold">
                            organizations Management
                        </h2>

                        <div className="flex items-end gap-4">
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-sm font-medium text-gray-500">Filter By Date:</span>

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
                    </div>

                    {/* SEPARATE LOCATION 3: Dedicated Table Container */}
                    <div>
                        {/* Placed standalone in Table Section */}
                        <TableView
                            ref={tableRef}
                            columns={columns}
                            data={tableData}
                            slots={slots}
                        />
                    </div>
                    <div className="bg-white px-4 rounded-xl border border-gray-200/80 shadow-sm">
                        <Pagination
                            currentPage={currentPage}
                            lastPage={lastPage}
                            total={organizations.total || 0}
                            perPage={currentPerPage}
                            onPageChange={handlePageChange}
                            onLengthChange={handleLengthChange}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};
