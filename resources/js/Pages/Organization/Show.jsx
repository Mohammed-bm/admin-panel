import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Subscriptions from '@/Pages/Organization/Subscriptions';
import Payments from '@/Pages/Organization/Payments';
import Credits from '@/Pages/Organization/Credits';
import Mailboxes from '@/Pages/Organization/Mailboxes';
import Licenses from '@/Pages/Organization/Licenses';

export default function Show({
    organization,
    subscriptions,
    payments = [],
    credits,
    licenses,
    mailboxes = {},
    licenseFilters = {},
    mailboxFilters = {},
}) {
    console.log('Payments in Show page:', payments);
    console.log('Credits in Show page:', credits);
    console.log('Licenses:', licenses);
    console.log('mailboxes:', mailboxes)

    const activeTab = new URLSearchParams(window.location.search).get('tab') || 'subscriptions';

    return (
        <AuthenticatedLayout>
            <Head title="Subscription Details" />

            <div>
                {/* Tab Controls */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => router.get(`/organization/${organization.id}`, {
                                tab: 'subscriptions',
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            })}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'subscriptions'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Subscriptions
                        </button>
                        <button
                            onClick={() => router.get(`/organization/${organization.id}`, {
                                tab: 'payments',
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            })}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'payments'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Payments
                        </button>
                        <button
                            onClick={() => router.get(`/organization/${organization.id}`, {
                                tab: 'credits',
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            })}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'credits'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Credit
                        </button>
                        <button
                            onClick={() => router.get(`/organization/${organization.id}`, {
                                tab: 'licenses',
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            })}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'licenses'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Licenses
                        </button>
                        <button
                            onClick={() => router.get(`/organization/${organization.id}`, {
                                tab: 'mailboxes',
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            })}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'mailboxes'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Mailboxes
                        </button>
                    </nav>
                </div>

                {/* Content switching */}
                {activeTab === 'subscriptions' && (
                    <Subscriptions subscriptions={subscriptions} />
                )}
                {activeTab === 'payments' && (
                    <Payments payments={payments} />
                )}
                {activeTab === 'credits' && (
                    <Credits credits={credits} />
                )}
                {activeTab === 'mailboxes' && (
                    <Mailboxes
                        organization={organization}
                        mailboxes={mailboxes?.data || []}
                        pagination={mailboxes}
                        mailboxFilters={mailboxFilters}
                    />
                )}
                {activeTab === 'licenses' && (
                    <Licenses
                        organization={organization}
                        licenses={licenses?.data || []}
                        pagination={licenses}
                        licenseFilters={licenseFilters}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}