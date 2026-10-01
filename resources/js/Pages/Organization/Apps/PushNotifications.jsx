import React from 'react';
import TableView from '@/Components/DataTable/TableView';

export default function PushNotifications({ campaigns = [] }) {
    console.log('push notification campaigns:', campaigns);

    const pushNotificationColumns = [
        {
            title: 'Campaign Name',
            data: 'campaign_name',
            name: 'campaign_name',
        },
        {
            title: 'Type',
            data: 'type',
            name: 'type',
        },
        {
            title: 'Status',
            data: 'status',
            name: 'status',
        },
        {
            title: 'Total Records',
            data: 'total_records',
            name: 'total_records',
        },
        {
            title: 'Sent',
            data: 'sent_count',
            name: 'sent_count',
        },
        {
            title: 'Failed',
            data: 'failed_count',
            name: 'failed_count',
        },
        {
            title: 'Amount',
            data: 'amount',
            name: 'amount',
            render: (value) => {
                if (value === null || value === undefined || value === '') {
                    return '-';
                }
                const numeric = parseFloat(value);
                if (isNaN(numeric)) {
                    return '-';
                }
                return `$${numeric.toFixed(2)}`;
            },
        },
        {
            title: 'Debited From',
            data: 'debited_from',
            name: 'debited_from',
        },
        {
            title: 'Scheduled Timezone',
            data: 'scheduled_timezone',
            name: 'scheduled_timezone',
            render: (value) => value || '-',
        },
        {
            title: 'Scheduled Time',
            data: 'scheduled_time',
            name: 'scheduled_time',
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