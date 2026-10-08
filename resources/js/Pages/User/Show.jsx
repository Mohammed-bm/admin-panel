import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import UserActivity from '@/Pages/User/View/UserActivity';
import UserOrganizations from '@/Pages/User/View/Organizations';
import UserSubscription from '@/Pages/User/View/Subscriptions';
import UserPayments from '@/Pages/User/View/Payments';
import UserLicenses from '@/Pages/User/View/Licenses';
import UserMailboxes from '@/Pages/User/View/Mailboxes';
import UserCredit from '@/Pages/User/View/Credits';

export default function Show({
    user,
    activities = [],
    organizations = {},
    pagination = {},
    filters = {},
    subscriptions = {},
    payments = {},
    licenses = {},
    mailboxes = {},
    credits = {}
}) {
    const activeTab = new URLSearchParams(window.location.search).get('tab') || 'activity';

    const switchTab = (tabName) => {
        router.get(`/users/${user.id}`, { tab: tabName }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'activity', label: 'Activity Log' },
        { id: 'organizations', label: 'Organizations' },
        { id: 'subscriptions', label: 'Subscriptions' },
        { id: 'payments', label: 'Payments' },
        { id: 'credits', label: 'Credits' },
        { id: 'licenses', label: 'Licenses' },
        { id: 'mailboxes', label: 'Mailboxes' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`User Details - ${user.first_name}`} />

            <div>
                <h1 className="text-xl font-bold text-gray-900">
                    {user.first_name} {user.last_name || ''}
                </h1>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="mt-6">
                {/* Header Tab Controls */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => switchTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                                        isActive
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content Rendering */}
                <div className="mt-6">
                    {activeTab === 'activity' && (
                        <UserActivity
                            user={user}
                            activities={activities?.data || activities}
                            pagination={pagination}
                            filters={filters}
                        />
                    )}

                    {activeTab === 'organizations' && (
                        <UserOrganizations
                            user={user}
                            organizations={organizations}
                            pagination={pagination}
                            filters={filters}
                        />
                    )}

                    {activeTab === 'subscriptions' && (
                        <UserSubscription
                            user={user}
                            subscriptions={subscriptions}
                            pagination={pagination}
                            filters={filters}
                        />
                    )}

                    {activeTab === 'payments' && (
                        <UserPayments
                            user={user}
                            payments={payments}
                            pagination={pagination}
                            filters={filters}
                        />
                    )}

                    {activeTab === 'credits' && (
                        <UserCredit
                            user={user}
                            credits={credits}
                            pagination={pagination}
                            filters={filters}
                        />
                    )}

                    {activeTab === 'licenses' && (
                        <UserLicenses
                            user={user}
                            licenses={licenses}
                            pagination={pagination}
                            filters={filters}
                        />
                    )}

                    {activeTab === 'mailboxes' && (
                        <UserMailboxes
                            user={user}
                            mailboxes={mailboxes}
                            pagination={pagination}
                            filters={filters}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}