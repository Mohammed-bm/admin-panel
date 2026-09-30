import React from 'react';
import { Box, Typography } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export default function ConsolidatedStatBar({ stats = {} }) {
    const {
        campaigns = 0,
        recipients = 0,
        delivered = 0,
        deliveredRate = '0%',
        opened = 0,
        openRate = '0%',
        clicked = 0,
        clickRate = '0%',
        failed = 0
    } = stats;

    const items = [
        {
            icon: EmailOutlinedIcon,
            label: 'Campaigns',
            value: campaigns.toLocaleString(),
            color: '#3b82f6', // Blue
            bgColor: '#eff6ff'
        },
        {
            icon: PeopleOutlineIcon,
            label: 'Recipients',
            value: recipients.toLocaleString(),
            color: '#10b981', // Green
            bgColor: '#ecfdf5'
        },
        {
            icon: SendOutlinedIcon,
            label: 'Delivered',
            value: `${delivered.toLocaleString()} (${deliveredRate})`,
            color: '#8b5cf6', // Purple
            bgColor: '#f5f3ff'
        },
        {
            icon: EmailOutlinedIcon,
            label: 'Opened',
            value: `${opened.toLocaleString()} (${openRate})`,
            color: '#06b6d4', // Cyan
            bgColor: '#ecfeff'
        },
        {
            icon: AdsClickIcon,
            label: 'Clicked',
            value: `${clicked.toLocaleString()} (${clickRate})`,
            color: '#f59e0b', // Amber/Orange
            bgColor: '#fffbeb'
        },
        {
            icon: CancelOutlinedIcon,
            label: 'Failed',
            value: failed.toLocaleString(),
            color: '#ef4444', // Red
            bgColor: '#fef2f2'
        }
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                width: '100%',
                py: 1,
                px: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'grey.200',
                backgroundColor: '#ffffff'
            }}
        >
            {items.map((item, index) => (
                <React.Fragment key={item.label}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: 'center' }}>
                        {/* Colored Circle Icon */}
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                backgroundColor: item.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shrink: 0
                            }}
                        >
                            <item.icon sx={{ fontSize: 18, color: item.color }} />
                        </Box>

                        {/* Text Stack */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
                                {item.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 700 }}>
                                {item.value}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Subtle Vertical Divider */}
                    {index < items.length - 1 && (
                        <Box sx={{ width: '1px', height: '28px', bgcolor: 'grey.200' }} />
                    )}
                </React.Fragment>
            ))}
        </Box>
    );
}