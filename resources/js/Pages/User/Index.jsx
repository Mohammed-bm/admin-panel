import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTableComponent from '@/components/DataTable';

import "react-datepicker/dist/react-datepicker.css";

export default function Index() {

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
                />
            </div>
        </AuthenticatedLayout>
    );
}