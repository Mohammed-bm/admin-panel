import React from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ organizations }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Organization Table
                </h2>
            }
        >
            {organizations.data.map((org) => (
                <div key={org.id}>
                    <p>{org.name}</p>
                </div>
            ))}

        </AuthenticatedLayout>
    );
};
