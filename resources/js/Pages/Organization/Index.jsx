import React from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTableComponent from "@/Components/DataTable";

export default function Index({ organizations, filters = {} }) {

    const columns = [
        {
            data: null, title: '#', orderable: false, searchable: false, render: (data, type, row, meta) => { return meta.row + meta.settings._iDisplayStart + 1; },
        },
        { data: 'id', title: 'User ID' },
        { data: 'first_name', title: 'First Name' },
        { data: 'last_name', title: 'Last Name' },
        { data: 'email', title: 'Email' },
        { data: 'phone', title: 'Phone' },
        { data: 'date', title: 'Date' },
        { data: 'time', title: 'Time' },
        { data: 'profile_completed', title: 'Profile Created', render: (data) => { return Number(data) === 1 ? 'Yes' : 'No'; }, },
    ];

    const { search = '', filter = '' } = filters;

    const updateParams = (newParams) => {
        const query = {
            filter: filter || undefined,
            search: search || undefined,
            ...newParams,
        };

        // Clean out empty/undefined keys so the URL stays clean
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

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

    const handleReset = () => {
        router.get('/organizations', {}, {
            preserveState: false, // Allows clean reload of initial page state
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Organization Table
                </h2>
            }
        >
            <div className="space-y-4">
                <DataTableComponent
                    columns={columns}
                    data={organizations}
                    activeSearch={search}
                    activeFilter={filter}
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    onDateFilter={handleDateFilter}
                    onReset={handleReset}
                />
            </div>

        </AuthenticatedLayout>
    );
};
