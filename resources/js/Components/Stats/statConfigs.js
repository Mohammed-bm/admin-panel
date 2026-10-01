import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// Formatters
const formatNum = (val) => Number(val || 0).toLocaleString();
const formatPct = (pct) => `${Number(pct || 0)}%`;

export const STAT_CONFIGS = {
    emails: [
        {
            key: 'campaigns',
            label: 'Campaigns',
            icon: EmailOutlinedIcon,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            getValue: (s) => formatNum(s.campaigns)
        },
        {
            key: 'recipients',
            label: 'Recipients',
            icon: PeopleOutlineIcon,
            color: '#10b981',
            bgColor: '#ecfdf5',
            getValue: (s) => formatNum(s.recipients)
        },
        {
            key: 'delivered',
            label: 'Delivered',
            icon: SendOutlinedIcon,
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            getValue: (s) => `${formatNum(s.delivered)} (${formatPct(s.delivered_percentage)})`
        },
        {
            key: 'opened',
            label: 'Opened',
            icon: EmailOutlinedIcon,
            color: '#06b6d4',
            bgColor: '#ecfeff',
            getValue: (s) => `${formatNum(s.opened)} (${formatPct(s.opened_percentage)})`
        },
        {
            key: 'clicked',
            label: 'Clicked',
            icon: AdsClickIcon,
            color: '#f59e0b',
            bgColor: '#fffbeb',
            getValue: (s) => `${formatNum(s.clicked)} (${formatPct(s.clicked_percentage)})`
        },
        {
            key: 'failed',
            label: 'Failed',
            icon: CancelOutlinedIcon,
            color: '#ef4444',
            bgColor: '#fef2f2',
            getValue: (s) => formatNum(s.failed)
        }
    ],
    sms: [
        {
            key: 'campaigns',
            label: 'Campaigns',
            icon: SmsOutlinedIcon,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            getValue: (s) => formatNum(s.campaigns || s.total_campaigns)
        },
        {
            key: 'total_records',
            label: 'Total Records',
            icon: PeopleOutlineIcon,
            color: '#10b981',
            bgColor: '#ecfdf5',
            getValue: (s) => formatNum(s.total_records || s.recipients)
        },
        {
            key: 'sent_count',
            label: 'Sent',
            icon: SendOutlinedIcon,
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            getValue: (s) => formatNum(s.sent_count || s.sent)
        },
        {
            key: 'failed_count',
            label: 'Failed',
            icon: CancelOutlinedIcon,
            color: '#ef4444',
            bgColor: '#fef2f2',
            getValue: (s) => formatNum(s.failed_count || s.failed)
        },
        {
            key: 'amount',
            label: 'Amount Spent',
            icon: AttachMoneyIcon,
            color: '#059669',
            bgColor: '#ecfdf5',
            getValue: (s) => `$${formatNum(s.amount)}`
        }
    ]
};