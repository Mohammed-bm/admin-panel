import React from 'react';
import TableView from '@/Components/DataTable/TableView';

export default function TransactionalEmail({ campaigns = [] }) {
    console.log('transactional email logs:', campaigns);

    const transactionalEmailColumns = [
        {
            title: 'Recipient Email',
            data: 'to_email',
            name: 'to_email',
            render: (value) => value || '-',
        },
        {
            title: 'From Email',
            data: 'from_email',
            name: 'from_email',
            render: (value) => value || '-',
        },
        {
            title: 'Subject',
            data: 'subject',
            name: 'subject',
            render: (value) => value || '-',
        },
        {
            title: 'Template Key',
            data: 'template_key',
            name: 'template_key',
            render: (value) => value || '-',
        },
        {
            title: 'Mode',
            data: 'mode',
            name: 'mode',
            render: (value) => value || '-',
        },
        {
            title: 'Status',
            data: 'status',
            name: 'status',
            render: (value) => value || '-',
        },
        {
            title: 'Sent At',
            data: 'sent_at',
            name: 'sent_at',
            render: (value) => value || '-',
        },
    ];

    return (
        <TableView
            columns={transactionalEmailColumns}
            data={campaigns}
        />
    );
}