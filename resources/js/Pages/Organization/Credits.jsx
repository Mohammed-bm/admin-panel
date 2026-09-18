import React from 'react';

export default function Credits({ credits = [] }) {

    const featureLabels = {
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

    const creditData = Array.isArray(credits) ? credits[0] : credits;

    if (!creditData) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                No credit records found.
            </div>
        );
    }

    // Safe JSON parser
    const parseJson = (data) => {
        if (!data) return {};
        if (typeof data === 'object') return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    };

    const capacities = parseJson(creditData.capacities);
    const usage = parseJson(creditData.usage);

    return (
        <div className="space-y-6">
            {/* Metadata Header Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-xs text-gray-500">
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${creditData.is_active
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
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50/75 px-6 py-3.5">
                        <h3 className="font-semibold text-gray-900 text-sm">Plan Limits</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[420px]">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead className="border-b border-gray-200 bg-gray-50/50 uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-6 py-2.5 font-semibold">Feature / Resource</th>
                                    <th className="px-6 py-2.5 font-semibold text-right">Limit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.entries(capacities).length > 0 ? (
                                    Object.entries(capacities).map(([key, val]) => (
                                        key !== '0' && (
                                            <tr key={featureLabels[key] || key} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-2.5 font-medium text-gray-800">
                                                    {featureLabels[key] || key}
                                                </td>
                                                <td className="px-6 py-2.5 font-mono text-right font-semibold text-gray-900">
                                                    {val === -1
                                                        ? 'Disabled'
                                                        : val
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-center text-gray-400">
                                            No capacities specified.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50/75 px-6 py-3.5">
                        <h3 className="font-semibold text-gray-900 text-sm">Current Usage</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[420px]">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead className="border-b border-gray-200 bg-gray-50/50 uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-6 py-2.5 font-semibold">Feature / Resource</th>
                                    <th className="px-6 py-2.5 font-semibold text-right">Used</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.entries(usage).length > 0 ? (
                                    Object.entries(usage).map(([key, val]) => (
                                        <tr key={featureLabels[key] || key} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-2.5 font-medium text-gray-800">
                                                {featureLabels[key] || key}
                                            </td>
                                            <td className="px-6 py-2.5 font-mono text-right font-semibold text-indigo-600">
                                                {val}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-center text-gray-400">
                                            No usage recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}