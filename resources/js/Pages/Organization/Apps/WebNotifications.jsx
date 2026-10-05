import React from "react";
import { TableView } from "@/Components/DataTable";

    export default function WebNotifications({ campaigns = [] }) {
    console.log('campagins:', campaigns)
    const webnotificationColumns = [
        {
            title: 'Title',
            data: 'title',
            name: 'title',
            render: (value) => value || '-',
        },
        {
            title: 'Body',
            data: 'body',
            name: 'body',
            render: (value) => value || '-',
        },
        {
            title: 'Status',
            data: 'status',
            name: 'status',
            render: (value) => value || '-',
        },
        {
            title: 'Total Devices',
            data: 'total_targets',
            name: 'total_targets',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Delivered',
            data: 'delivered',
            name: 'delivered',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Failed',
            data: 'failed',
            name: 'failed',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Scheduled At',
            data: 'scheduled_at',
            name: 'scheduled_at',
            render: (value) => value || '-',
        },
        {
            title: 'Launched At',
            data: 'launched_at',
            name: 'launched_at',
            render: (value) => value || '-',
        },
    ];
    return (
        <TableView
            columns={webnotificationColumns}
            data={campaigns}
        />
    );
}