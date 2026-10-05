import React from 'react';
import TableView from '@/Components/DataTable/TableView';

export default function PushNotifications({ campaigns = [] }) {
    console.log('push notification campaigns:', campaigns);

    const pushNotificationColumns = [
        {
            title: 'Title ',
            data: 'title',
            name: 'title',
            render: (value) => value || '-',
        },
        {
            title: 'Template Name',
            data: 'template_name',
            name: 'template_name',
            render: (value) => value || '-',
        },
        {
            title: 'Type',
            data: 'type',
            name: 'type',
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
            data: 'total_devices',
            name: 'total_devices',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Pending',
            data: 'pending_count',
            name: 'pending_count',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Sent',
            data: 'sent_count',
            name: 'sent_count',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Temp Blocked',
            data: 'temp_blocked_count',
            name: 'temp_blocked_count',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Perm Blocked',
            data: 'perm_blocked_count',
            name: 'perm_blocked_count',
            render: (value) => Number(value || 0).toLocaleString(),
        },
        {
            title: 'Scheduled Time',
            data: 'schedule_time',
            name: 'schedule_time',
            render: (value) => value || '-',
        },
        {
            title: 'Last Updated',
            data: 'updated_at',
            name: 'updated_at',
            render: (value) => value || '-',
        },
    ];

    return (
        <TableView
            columns={pushNotificationColumns}
            data={campaigns}
        />
    );
}