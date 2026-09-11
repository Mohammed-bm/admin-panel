import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTableComponent from '@/components/DataTable';
import { router } from '@inertiajs/react';

// import { TableSearchInput, TableFilterDropdown, TableView } from '@/components/DataTable';

import "react-datepicker/dist/react-datepicker.css";

export default function Index({ users, filters = {} }) {

    const columns = [
        {
            data: null, title: '#', orderable: false, searchable: false, render: (data, type, row, meta) => { return meta.row + 1; },
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

    // Reset Handler: Sends request without any query params to reload all users
    const handleReset = () => {
        router.get('/users', {}, {
            preserveState: false, // Allows clean reload of initial page state
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Users Table
                </h2>
            }
        >
            <div className="space-y-4">
                <DataTableComponent
                    columns={columns}
                    data={users}
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
}