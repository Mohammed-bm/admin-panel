import React from 'react';

export default function Payments({ payments = [] }) {
    
    console.log('Payments in Payments component:', payments);

    // Helper function to render status badges
    const renderStatusBadge = (status) => {
        const isCompleted = status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'paid';
        const isFailed = status?.toLowerCase() === 'failed' || status?.toLowerCase() === 'canceled';

        return (
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${isCompleted
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                        : isFailed
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                    }`}
            >
                {status || 'N/A'}
            </span>
        );
    };

    return (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50/75 uppercase tracking-wider text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Order ID</th>
                            <th className="px-6 py-4 font-semibold">Payment ID</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Amount</th>
                            <th className="px-6 py-4 font-semibold">Provider & Method</th>
                            <th className="px-6 py-4 font-semibold">Created Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {payments && payments.length > 0 ? (
                            payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="transition-colors hover:bg-gray-50/50"
                                >
                                    {/* Order ID & Record ID */}
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 font-mono text-xs">
                                            {payment.order_id || 'N/A'}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 font-mono text-xs">
                                            {payment.payment_id || 'N/A'}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderStatusBadge(payment.status)}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                        {payment.amount ? (Math.floor(parseFloat(payment.amount) * 100) / 100).toFixed(2) : '0.00'}
                                    </td>

                                    {/* Provider & Method */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900 capitalize">
                                            {payment.provider || 'N/A'}
                                        </div>
                                        <div className="text-gray-400 text-xs capitalize">
                                            Method: {payment.method || 'Card'}
                                        </div>
                                    </td>

                                    {/* Created Date */}
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                                        {payment.created_date || payment.created_at || '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-6 py-8 text-center text-sm text-gray-500"
                                >
                                    No payment records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}