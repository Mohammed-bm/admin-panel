import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Subscriptions from '@/Pages/Organization/Subscriptions';
import Payments from '@/Pages/Organization/Payments';
import Credits from '@/Pages/Organization/Credits';

export default function Show({ subscriptions, payments = [], credits }) {
    console.log('Payments in Show page:', payments);
    console.log('Credits in Show page:', credits);
    const [activeTab, setActiveTab] = useState('subscriptions');

    return (
        <AuthenticatedLayout>
            <Head title="Subscription Details" />

            <div>
                {/* Tab Controls */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'subscriptions'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Subscriptions
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'payments'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Payments
                        </button>
                        <button
                            onClick={() => setActiveTab('credits')}
                            className={`py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'credits'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Credit
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
            </div>
        </AuthenticatedLayout>
    );
}