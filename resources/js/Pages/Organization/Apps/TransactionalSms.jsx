import React from 'react';
import TableView from '@/Components/DataTable/TableView';

export default function TransactionalSms({ campaigns = [] }) {
    console.log('transactional sms logs:', campaigns);

    const transactionalSmsColumns = [
        {
            title: 'Recipient Number',
            data: 'recipient_number',
            name: 'recipient_number',
            render: (value) => value || '-',
        },
        {
            title: 'Title / Preview',
            data: 'msg_title',
            name: 'msg_title',
            render: (value, row) => {
                const title = row?.msg_title || value || '';
                const preview = row?.text_preview || '';
                
                if (title && preview) return `${title} — ${preview}`;
                if (title) return title;
                if (preview) return preview;
                return '-';
            },
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
            title: 'Scheduled At',
            data: 'scheduled_at',
            name: 'scheduled_at',
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
            columns={transactionalSmsColumns}
            data={campaigns}
        />
    );
}