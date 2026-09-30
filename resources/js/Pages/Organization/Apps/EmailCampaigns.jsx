import React from 'react';
import TableView from '@/Components/DataTable/TableView';

export default function EmailCampaigns({ campaigns = [] }) {
    console.log('campaigns:', campaigns);
    const campaignColumns = [
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
            title: 'Recipients',
            data: 'recipients',
            name: 'recipients',
        },
        {
            title: 'Delivered',
            data: 'sent_count',
            name: 'sent_count',
        },
        {
            title: 'Opened',
            data: 'open_count',
            name: 'open_count',
        },
        {
            title: 'Clicks',
            data: 'click_count',
            name: 'click_count',
        },
        {
            title: 'Soft Bounce',
            data: 'soft_bounce',
            name: 'soft_bounce',
        },
        {
            title: 'Hard Bounce',
            data: 'hard_bounce',
            name: 'hard_bounce',
        },
        {
            title: 'Launched',
            data: 'launched',
            name: 'launched',
        },
    ];

    return (
        <TableView
            columns={campaignColumns}
            data={campaigns}
        />
    );
}