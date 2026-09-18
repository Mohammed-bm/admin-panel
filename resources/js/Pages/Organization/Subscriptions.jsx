import React from 'react';

export default function Subscriptions({ subscriptions = [] }) {
    // Helper function to render status badges
    const renderStatusBadge = (status) => {
        const isCompleted = status?.toLowerCase() === 'active' || status?.toLowerCase() === 'paid';
        const isCanceled = status?.toLowerCase() === 'canceled' || status?.toLowerCase() === 'unpaid';

        return (
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${isCompleted
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                        : isCanceled
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                    }`}
            >
                {status || 'N/A'}
            </span>
        );
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50/75 uppercase tracking-wider text-xs text-gray-500">
                        <tr>
                            <th className="px-6 py-3.5 font-semibold">Plan & Account</th>
                            <th className="px-6 py-3.5 font-semibold">Status</th>
                            <th className="px-6 py-3.5 font-semibold">Amount</th>
                            <th className="px-6 py-3.5 font-semibold">Payment Info</th>
                            <th className="px-6 py-3.5 font-semibold">Stripe & Transaction IDs</th>
                            <th className="px-6 py-3.5 font-semibold">Billing Timeline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subscriptions && subscriptions.length > 0 ? (
                            subscriptions.map((sub) => (
                                <tr
                                    key={sub.id}
                                    className="transition-colors hover:bg-gray-50/50"
                                >
                                    {/* Plan Name & Core Foreign Keys */}
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 text-base">
                                            {sub.subscription_name || 'N/A'}
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderStatusBadge(sub.stripe_status)}
                                    </td>

                                    {/* Billing Amount & Payment State */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900 text-base">
                                            {sub.currency ? sub.currency.toUpperCase() : 'USD'} {sub.amount ? parseFloat(sub.amount).toFixed(2) : '0.00'}
                                        </div>
                                        <div className="text-xs text-gray-400 capitalize">
                                            Payment: <span className="font-medium text-gray-600">{sub.payed_or_unpaid || 'N/A'}</span> (Qty: {sub.quantity || 1})
                                        </div>
                                    </td>

                                    {/* Gateway & Source */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900 capitalize">
                                            {sub.payment_method || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-400 capitalize">
                                            Type: {sub.source_type || 'N/A'}
                                        </div>
                                    </td>

                                    {/* Key Admin External IDs */}
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 font-mono text-xs break-all">
                                            {sub.stripe_subscription_id || 'N/A'}
                                        </div>
                                        <div className="font-semibold text-gray-900 font-mono text-xs break-all">
                                            {sub.transaction_id || 'N/A'}
                                        </div>
                                    </td>

                                    {/* Key Lifecycle Dates */}
                                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                        <div>
                                            <span className="font-medium text-gray-700">Created At:</span>{' '}
                                            {sub.created_date || sub.created_at || '-'}
                                        </div>
                                        {sub.trial_ends_at && (
                                            <div className="text-amber-600">
                                                <span className="font-medium">Trial End:</span> {sub.trial_ends_at}
                                            </div>
                                        )}
                                        {sub.ends_at && (
                                            <div className="text-rose-600">
                                                <span className="font-medium">Ends At:</span> {sub.ends_at}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-6 py-8 text-center text-sm text-gray-500"
                                >
                                    No subscription records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}