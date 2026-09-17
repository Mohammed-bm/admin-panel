import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ subscriptions }) {
    // Helper function to render status badges
    const renderStatusBadge = (status) => {
        const isCompleted = status?.toLowerCase() === 'active' || status?.toLowerCase() === 'paid';
        const isCanceled = status?.toLowerCase() === 'canceled' || status?.toLowerCase() === 'unpaid';

        return (
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                    isCompleted
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                        : isCanceled
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                        : 'bg-gray-100 text-gray-700 ring-1 ring-gray-500/10'
                }`}
            >
                {status || 'N/A'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Subscription Details" />

            <div>
                {/* Header */}
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Subscription Details
                        </h1>
                    </div>
                </div>

                {/* Subscriptions Table Card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="border-b border-gray-200 bg-gray-50/75 uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Subscription</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold">Payment Method</th>
                                    <th className="px-6 py-4 font-semibold">Details & Trial</th>
                                    <th className="px-6 py-4 font-semibold">Billing Dates</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subscriptions && subscriptions.length > 0 ? (
                                    subscriptions.map((subscription) => (
                                        <tr
                                            key={subscription.id}
                                            className="transition-colors hover:bg-gray-50/50"
                                        >
                                            {/* Subscription Name */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {subscription.subscription_name || 'N/A'}
                                                </div>
                                                <div className="text-gray-400">
                                                    ID: #{subscription.id}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {renderStatusBadge(subscription.stripe_status)}
                                            </td>

                                            {/* Amount & Payment Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">
                                                    {subscription.currency || ''} {subscription.amount || '0.00'}
                                                </div>
                                                <span className="font-medium text-gray-400 capitalize">
                                                    ({subscription.payed_or_unpaid || 'N/A'})
                                                </span>
                                            </td>

                                            {/* Payment Method & Source */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {subscription.payment_method || 'N/A'}
                                                </div>
                                                {subscription.source_type && (
                                                    <div className="text-gray-400 capitalize">
                                                        Method: {subscription.source_type}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Quantity & Trial */}
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                <div>
                                                    <span className="font-medium text-gray-700">Qty:</span>{' '}
                                                    {subscription.quantity || 'Not specified'}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Trial:</span>{' '}
                                                    {subscription.trial_ends_at || 'No trial'}
                                                </div>
                                            </td>

                                            {/* Dates */}
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                <div>
                                                    <span className="font-medium text-gray-700">Created:</span>{' '}
                                                    {subscription.created_date || '-'}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Ends At:</span>{' '}
                                                    {subscription.ends_at || '-'}
                                                </div>
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
            </div>
        </AuthenticatedLayout>
    );
}