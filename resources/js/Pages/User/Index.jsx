import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/components/DataTable';
import { router } from '@inertiajs/react';

import "react-datepicker/dist/react-datepicker.css";

export default function Index({ users }) {

    const columns = [
        {
            field: 'rowNumber', headerName: '#', width: 70, valueGetter: (_, row) =>
                (users.current_page - 1) * users.per_page
                + (users?.data ?? []).indexOf(row)
                + 1,
        },
        { field: 'id', headerName: 'User ID', width: 150 },
        { field: 'first_name', headerName: 'First Name', width: 150 },
        { field: 'last_name', headerName: 'Last Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'date', headerName: 'Date', width: 140 },
        { field: 'time', headerName: 'Time', width: 120 },
        { field: 'profile_completed', headerName: 'Profile Created', width: 150, valueGetter: (value) => Number(value) === 1 ? 'Yes' : 'No' },
    ];

    const [sorting, setSorting] = useState(null);
    const [search, setSearch] = useState('');

    const [paginationModel, setPaginationModel] = useState({
        page: users.current_page - 1,
        pageSize: users.per_page,
    });


    const handlePaginationChange = (newModel) => {
        setPaginationModel(newModel);

        router.get('/users', {
            search: search,
            filter: sorting,
            page: newModel.page + 1,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (value) => {
        setSearch(value);

        router.get('/users', {
            search: value,
            filter: sorting,
            page: 1,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilter = (filterValue) => {
        setSorting(filterValue);

        router.get('/users', {
            search: search,
            filter: filterValue,
            page: 1,
        }, {
            preserveState: true,
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
            <div className="p-6 space-y-4">
                <DataTable
                    rows={users?.data}
                    columns={columns}
                    rowCount={users?.total ?? 0}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationChange}
                    search={search}
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                />
            </div>
        </AuthenticatedLayout>
    );
}