import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import ConsolidatedStatBar from '@/Components/Stats/CampaignStatsGrid';
import EmailCampaigns from '@/Pages/Organization/Apps/EmailCampaigns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Pagination from '@/Components/DataTable/Pagination'
import SmsCampaigns from '@/Pages/Organization/Apps/SmsCampaigns';
import PushNotifications from '@/Pages/Organization/Apps/PushNotifications';

export default function Apps({ apps = {}, stats = {} }) {
    console.log(apps);
    const queryParams = new URLSearchParams(window.location.search);
    const activeSubTab = queryParams.get('sub_tab') || 'emails';

    // State to track expanded apps (allows opening multiple simultaneously)
    const [openAppIds, setOpenAppIds] = useState([]);

    const toggleAppExpand = (appId) => {
        setOpenAppIds((prev) =>
            prev.includes(appId)
                ? prev.filter((id) => id !== appId)
                : [...prev, appId]
        );
    };

    const handleSubTabChange = (subTabName) => {
        router.get(
            window.location.pathname,
            {
                tab: 'apps',
                sub_tab: subTabName
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleCampaignPageChange = (appId, page) => {
        const params = Object.fromEntries(
            new URLSearchParams(window.location.search)
        );

        params[`campaigns_page_${appId}`] = page;

        router.get(
            window.location.pathname,
            params,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleCampaignLengthChange = (appId, perPage) => {
        const params = Object.fromEntries(
            new URLSearchParams(window.location.search)
        );

        params[`campaigns_page_${appId}`] = 1;
        params[`campaigns_per_page_${appId}`] = perPage;

        router.get(
            window.location.pathname,
            params,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const appData = apps?.data || [];

    return (
        <div className="flex flex-col gap-6">
            {/* Sub-Tab Navigation Bar */}
            <div className="inline-flex p-1 rounded-lg w-fit">
                <nav className="flex space-x-1">
                    <button
                        onClick={() => handleSubTabChange('emails')}
                        className={`py-3 px-3 border-b-2 text-sm font-medium ${activeSubTab === 'emails'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Email Campaigns
                    </button>

                    <button
                        onClick={() => handleSubTabChange('sms')}
                        className={`py-3 px-3 border-b-2 text-sm font-medium ${activeSubTab === 'sms'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        SMS Campaigns
                    </button>

                    <button
                        onClick={() => handleSubTabChange('push')}
                        className={`py-3 px-3 border-b-2 text-sm font-medium ${activeSubTab === 'push'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Push Notification
                    </button>
                </nav>
            </div>

            {/* Sub-Tab Content Area */}
            <div className="flex flex-col gap-4">
                {appData.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded-xl">
                        No applications found for this organization.
                    </div>
                ) : (
                    appData.map((app) => {
                        const isExpanded = openAppIds.includes(app.id);
                        const campaignsList = app?.campaigns || [];

                        return (
                            <div
                                key={app.id}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                            >
                                {/* App Header Bar (Clickable to Toggle Accordion) */}
                                <div
                                    onClick={() => toggleAppExpand(app.id)}
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-base font-semibold text-gray-900">
                                            {app.name}
                                        </h4>
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                            App ID: {app.id}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <span>
                                            {isExpanded
                                                ? 'Hide Campaigns'
                                                : 'View Campaigns'}
                                        </span>
                                        {isExpanded ? (
                                            <KeyboardArrowUpIcon fontSize="small" />
                                        ) : (
                                            <KeyboardArrowDownIcon fontSize="small" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content Area (Stats Bar + Campaign Table) */}
                                {isExpanded && (
                                    <>
                                        <div className="border-t border-gray-100 p-3 bg-gray-50/50 flex flex-col">
                                            <ConsolidatedStatBar
                                                stats={app.stats || stats}
                                                type={activeSubTab}
                                            />
                                            {activeSubTab === 'emails' && (

                                                <EmailCampaigns
                                                    campaigns={campaignsList}
                                                />

                                            )}
                                            {activeSubTab === 'sms' && (
                                                <SmsCampaigns
                                                    campaigns={campaignsList}
                                                />
                                            )}
                                            {activeSubTab === 'push' && (
                                                <PushNotifications
                                                    campaigns={campaignsList}
                                                />
                                            )}
                                        </div>
                                        <Pagination
                                            currentPage={campaignsList.current_page || 1}
                                            lastPage={campaignsList.last_page || 1}
                                            total={campaignsList.total || 0}
                                            perPage={campaignsList.per_page || 10}
                                            onPageChange={(page) => handleCampaignPageChange(app.id, page)}
                                            onLengthChange={(perPage) => handleCampaignLengthChange(app.id, perPage)}
                                        />
                                    </>

                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}