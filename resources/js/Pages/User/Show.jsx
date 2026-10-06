import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import UserActivity from '@/Pages/User/View/UserActivity';
import UserOrganizations from '@/Pages/User/View/Organizations';
import UserSubscription from '@/Pages/User/View/Subscriptions';

export default function Show({ user, activities = [], organizations = {}, pagination = {}, filters = {}, subscriptions = {} }) {
    
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('tab') || 'activity';
        }
        return 'activity';
    });

    const switchTab = (tabName) => {
        setActiveTab(tabName);

        // Fetch the data for the newly selected tab from the backend via Inertia router
        router.get(`/users/${user.id}`, { tab: tabName }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const tabs = [
        { id: 'activity', label: 'Activity Log' },
        { id: 'organizations', label: 'Organizations' },
        { id: 'subscriptions', label: 'Subscriptions' },
        { id: 'payments', label: 'Payments' },
        { id: 'credit', label: 'Credit' },
        { id: 'licenses', label: 'Licenses' },
        { id: 'mailboxes', label: 'Mailboxes' },
        { id: 'email-campaigns', label: 'Email Campaigns' },
        { id: 'sms-campaigns', label: 'SMS Campaigns' },
        { id: 'push-notification', label: 'Push Notification' },
        { id: 'web-notification', label: 'Web Notification' },
        { id: 'transactional-email', label: 'Transactional Email' },
        { id: 'sms-analytics', label: 'Sms Analytics' },
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

            <div>
                {/* Header Tab Controls with horizontal scroll for many items */}
                <div className="border-b border-gray-200 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <nav className="-mb-px flex space-x-8 whitespace-nowrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => switchTab(tab.id)}
                                className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
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
                    {activeTab === 'payments' && <div>{/* Payments Component */}</div>}
                    {activeTab === 'credit' && <div>{/* Credit Component */}</div>}
                    {activeTab === 'licenses' && <div>{/* Licenses Component */}</div>}
                    {activeTab === 'mailboxes' && <div>{/* Mailboxes Component */}</div>}
                    {activeTab === 'email-campaigns' && <div>{/* Email Campaigns Component */}</div>}
                    {activeTab === 'sms-campaigns' && <div>{/* SMS Campaigns Component */}</div>}
                    {activeTab === 'push-notification' && <div>{/* Push Notification Component */}</div>}
                    {activeTab === 'web-notification' && <div>{/* Web Notification Component */}</div>}
                    {activeTab === 'transactional-email' && <div>{/* Transactional Email Component */}</div>}
                    {activeTab === 'sms-analytics' && <div>{/* Sms Analytics Component */}</div>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}