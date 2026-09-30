import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

// 1. Constants & Utilities (Ideally move to separate files)
const FEATURE_LABELS = {
    webhooks: 'Webhooks',
    api_requests: 'API Requests',
    crm_contacts: 'CRM Contacts',
    nest_mailsuit: 'MailSuite',
    salesnest_crm: 'SalesNest CRM',
    schedule_nest: 'ScheduleNest',
    nest_e_docusign: 'E-Signatures',
    email_validation: 'Email Validations',
    phone_validation: 'Phone Validations',
    priority_support: 'Priority Support',
    user_invitations: 'User Invitations',
    email_promotional: 'Promotional Emails',
    email_transactional: 'Transactional Emails',
    sms_promotional_us: 'Promotional SMS (US)',
    sms_transactional_us: 'Transactional SMS (US)',
    nest_meet_meetings: 'Meetings',
    nestbot_ai_replies: 'AI Replies',
    users_team_members: 'Team Members',
    analytics_reporting: 'Analytics & Reporting',
    web_push_notifications: 'Web Push Notifications',
    mobile_push_notifications: 'Mobile Push Notifications',
    dedicated_success_manager: 'Dedicated Success Manager',
    role_based_permissions_users: 'Role-Based Permissions',
    sla_support: 'SLA Support',
};

const parseJson = (data) => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch {
        return {};
    }
};

// 2. Reusable Sub-component to eliminate DRY violations
function DataTableCard({ title, data, action, emptyMessage, renderValue }) {
    const entries = Object.entries(data);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/75 px-6 py-3.5">
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                {action && <div>{action}</div>}
            </div>
            <div className="overflow-x-auto max-h-[420px]">
                <table className="w-full text-left text-xs text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50/50 uppercase tracking-wider text-gray-400">
                        <tr>
                            <th className="px-6 py-2.5 font-semibold">Feature / Resource</th>
                            <th className="px-6 py-2.5 font-semibold text-right">{title === 'Plan Limits' ? 'Limit' : 'Used'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {entries.length > 0 ? (
                            entries.map(([key, val]) => {
                                if (key === '0') return null;
                                return (
                                    <tr key={key} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-2.5 font-medium text-gray-800">
                                            {FEATURE_LABELS[key] || key}
                                        </td>
                                        <td className="px-6 py-2.5 text-right font-mono">
                                            {renderValue ? renderValue(key, val) : val}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="2" className="px-6 py-4 text-center text-gray-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Credits({ credits = [] }) {
    const creditData = Array.isArray(credits) ? credits[0] : credits;

    const capacities = parseJson(creditData?.capacities);
    const usage = parseJson(creditData?.usage);

    const [isEditing, setIsEditing] = useState(false);
    const [editedCapacities, setEditedCapacities] = useState(capacities);

    if (!creditData) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                No credit records found.
            </div>
        );
    }

    const handleSave = () => {
        router.patch(
            `/organization/${creditData.organization_id}/capacity`,
            { capacities: editedCapacities },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Plan Limits Updated Successfully',
                        text: 'The organization plan limits have been updated.',
                        confirmButtonText: 'OK',
                    });
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: 'The organization plan limits could not be updated.',
                        confirmButtonText: 'OK',
                    })
                }
            }
        );
    };

    return (
        <div className="mt-6 space-y-6">
            {/* Metadata Header Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-xs text-gray-500">
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        creditData.is_active
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                    }`}>
                        {creditData.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="font-semibold text-gray-900">
                        Plan ID: #{creditData.plan_id}
                    </span>
                    <span className="font-mono">
                        (Org #{creditData.organization_id} | User #{creditData.user_id})
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div>
                        <span className="font-medium text-gray-700">Created At:</span>{' '}
                        {creditData.created_date || creditData.created_at || '-'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Updated At:</span>{' '}
                        {creditData.updated_date || creditData.updated_at || '-'}
                    </div>
                </div>
            </div>

            {/* Side-by-Side Table Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Capacities Card */}
                <DataTableCard
                    title="Plan Limits"
                    data={capacities}
                    emptyMessage="No capacities specified."
                    action={
                        isEditing ? (
                            <button
                                type="button"
                                onClick={handleSave}
                                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditedCapacities(capacities); // Reset back to fresh props before editing
                                    setIsEditing(true);
                                }}
                                className="rounded-md px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                title="Edit capacities"
                            >
                                <ModeEditIcon fontSize="small" />
                            </button>
                        )
                    }
                    renderValue={(key, val) =>
                        isEditing ? (
                            <input
                                type="number"
                                min="-1"
                                value={editedCapacities[key] ?? val}
                                onChange={(e) =>
                                    setEditedCapacities({
                                        ...editedCapacities,
                                        [key]: Number(e.target.value),
                                    })
                                }
                                className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right font-mono text-xs font-semibold text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        ) : (
                            <span className="font-semibold text-gray-900">
                                {val === -1 ? 'Unlimited' : val}
                            </span>
                        )
                    }
                />

                {/* Usage Card */}
                <DataTableCard
                    title="Current Usage"
                    data={usage}
                    emptyMessage="No usage recorded yet."
                    renderValue={(_, val) => (
                        <span className="font-semibold text-indigo-600">{val}</span>
                    )}
                />
            </div>
        </div>
    );
}