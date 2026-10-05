import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

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
    ],
    push: [
        {
            key: 'total_push_notification',
            label: 'Notifications',
            icon: NotificationsOutlinedIcon,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            getValue: (s) => formatNum(s.total_push_notification)
        },
        {
            key: 'total_occurrence_count',
            label: 'Total Devices',
            icon: PeopleOutlineIcon,
            color: '#10b981',
            bgColor: '#ecfdf5',
            getValue: (s) => formatNum(s.total_occurrence_count)
        },
        {
            key: 'total_sent',
            label: 'Sent',
            icon: SendOutlinedIcon,
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            getValue: (s) => formatNum(s.total_sent)
        },
        {
            key: 'total_pending',
            label: 'Pending',
            icon: HourglassEmptyIcon,
            color: '#f59e0b',
            bgColor: '#fffbeb',
            getValue: (s) => formatNum(s.total_pending)
        },
        {
            key: 'total_temporary_blocked',
            label: 'Temp Blocked',
            icon: ReportProblemOutlinedIcon,
            color: '#06b6d4',
            bgColor: '#ecfeff',
            getValue: (s) => formatNum(s.total_temporary_blocked)
        },
        {
            key: 'total_permanently_blocked',
            label: 'Perm Blocked',
            icon: BlockIcon,
            color: '#ef4444',
            bgColor: '#fef2f2',
            getValue: (s) => formatNum(s.total_permanently_blocked)
        }
    ],
    web: [
        {
            key: 'total_push_notification',
            label: 'Notifications',
            icon: NotificationsOutlinedIcon,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            getValue: (s) => formatNum(s.total_push_notification),
        },
        {
            key: 'total_devices',
            label: 'Total Devices',
            icon: PeopleOutlineIcon,
            color: '#10b981',
            bgColor: '#ecfdf5',
            getValue: (s) => formatNum(s.total_devices),
        },
        {
            key: 'total_delivered',
            label: 'Delivered',
            icon: SendOutlinedIcon,
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            getValue: (s) => formatNum(s.total_delivered),
        },
        {
            key: 'total_failed',
            label: 'Failed',
            icon: CancelOutlinedIcon,
            color: '#ef4444',
            bgColor: '#fef2f2',
            getValue: (s) => formatNum(s.total_failed),
        },
    ],
    transactional_email: [
        {
            key: 'total_sent',
            label: 'Total Sent',
            icon: SendOutlinedIcon,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            getValue: (s) => formatNum(s.total_sent),
        },
        {
            key: 'success',
            label: 'Success',
            icon: CheckCircleOutlinedIcon,
            color: '#10b981',
            bgColor: '#ecfdf5',
            getValue: (s) => formatNum(s.success),
        },
        {
            key: 'failed',
            label: 'Failed',
            icon: CancelOutlinedIcon,
            color: '#ef4444',
            bgColor: '#fef2f2',
            getValue: (s) => formatNum(s.failed),
        },
    ],
    transactional_sms: [
        {
            key: 'total_sent',
            label: 'Total Sent',
            icon: SendOutlinedIcon,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            getValue: (s) => formatNum(s.total_sent),
        },
        {
            key: 'success',
            label: 'Success',
            icon: CheckCircleOutlinedIcon,
            color: '#10b981',
            bgColor: '#ecfdf5',
            getValue: (s) => formatNum(s.success),
        },
        {
            key: 'insufficient_balance',
            label: 'Insufficient Balance',
            icon: ReportProblemOutlinedIcon,
            color: '#f59e0b',
            bgColor: '#fffbeb',
            getValue: (s) => formatNum(s.insufficient_balance),
        },
        {
            key: 'failed',
            label: 'Failed',
            icon: CancelOutlinedIcon,
            color: '#ef4444',
            bgColor: '#fef2f2',
            getValue: (s) => formatNum(s.failed),
        },
    ],

};