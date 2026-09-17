import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ subscriptions }) {
    return (
        <AuthenticatedLayout>
            <Head title="Subscription Details" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Subscription Details
                </h1>

                {subscriptions.map((subscription) => (
                    <div
                        key={subscription.id}
                        className="mt-6 rounded-lg bg-white p-6 shadow-sm"
                    >
                        <div className="grid grid-cols-2 gap-6">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Subscription
                                </p>
                                <p className="font-medium">
                                    {subscription.subscription_name || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Status
                                </p>
                                <p className="font-medium">
                                    {subscription.stripe_status || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Amount
                                </p>
                                <p className="font-medium">
                                    {subscription.currency || 'N/A'} {subscription.amount || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Payment
                                </p>
                                <p className="font-medium">
                                    {subscription.payed_or_unpaid || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Payment Method
                                </p>
                                <p className="font-medium">
                                    {subscription.payment_method || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Quantity
                                </p>
                                <p className="font-medium">
                                    {subscription.quantity || 'Not specified'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Trial Ends
                                </p>
                                <p className="font-medium">
                                    {subscription.trial_ends_at || 'No trial'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Method
                                </p>
                                <p className="font-medium">
                                    {subscription.source_type || ''}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Subscription Ends At
                                </p>
                                <p className="font-medium">
                                    {subscription.ends_at || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Subscription Created At
                                </p>
                                <p className="font-medium">
                                    {subscription.created_date || '-'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Subscription Updated At
                                </p>
                                <p className="font-medium">
                                    {subscription.updated_date || '-'}
                                </p>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}