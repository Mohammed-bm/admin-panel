import React, { useState } from 'react';

export default function UserCredit({
    credits = [],
}) {
    const [openOrganization, setOpenOrganization] = useState(null);

    const toggleOrganization = (organizationId) => {
        setOpenOrganization(
            openOrganization === organizationId ? null : organizationId
        );
    };

    const formatDate = (date) => {
        if (!date) return '-';

        return new Date(date).toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatLabel = (key) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className="mt-6 space-y-3">
            {credits.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
                    No organizations found.
                </div>
            ) : (
                credits.map((organization) => {
                    const isOpen =
                        openOrganization === organization.organization_id;

                    const capacity = organization.capacity;

                    const capacities = capacity?.capacities || {};
                    const usage = capacity?.usage || {};

                    return (
                        <div
                            key={organization.organization_id}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                        >
                            {/* Organization Header */}
                            <button
                                type="button"
                                onClick={() =>
                                    toggleOrganization(
                                        organization.organization_id
                                    )
                                }
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {organization.organization_name}
                                    </span>

                                    <span className="text-sm text-gray-500">
                                        (Org #{organization.organization_id})
                                    </span>
                                </div>

                                <span className="text-gray-500 text-lg">
                                    {isOpen ? '−' : '+'}
                                </span>
                            </button>

                            {/* Organization Details */}
                            {isOpen && (
                                <div className="border-t border-gray-200 p-5 space-y-6">

                                    {/* Plan Limits + Current Usage */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                        {/* Plan Limits */}
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Plan Limits
                                                </h3>
                                            </div>

                                            {Object.keys(capacities).length === 0 ? (
                                                <div className="p-5 text-sm text-gray-500">
                                                    No plan limits available.
                                                </div>
                                            ) : (
                                                <div className="max-h-[500px] overflow-y-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50 sticky top-0">
                                                            <tr>
                                                                <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase text-xs tracking-wide">
                                                                    Feature / Resource
                                                                </th>
                                                                <th className="px-5 py-3 text-right font-medium text-gray-500 uppercase text-xs tracking-wide">
                                                                    Limit
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className="divide-y divide-gray-200">
                                                            {Object.entries(capacities).map(
                                                                ([key, value]) => (
                                                                    <tr
                                                                        key={key}
                                                                        className="hover:bg-gray-50"
                                                                    >
                                                                        <td className="px-5 py-3 text-gray-700">
                                                                            {formatLabel(key)}
                                                                        </td>

                                                                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                                            {value}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        {/* Current Usage */}
                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="px-5 py-4 border-b border-gray-200">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Current Usage
                                                </h3>
                                            </div>

                                            {Object.keys(usage).length === 0 ? (
                                                <div className="min-h-[500px] flex items-center justify-center text-sm text-gray-400">
                                                    No usage recorded yet.
                                                </div>
                                            ) : (
                                                <div className="max-h-[500px] overflow-y-auto">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50 sticky top-0">
                                                            <tr>
                                                                <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase text-xs tracking-wide">
                                                                    Feature / Resource
                                                                </th>
                                                                <th className="px-5 py-3 text-right font-medium text-gray-500 uppercase text-xs tracking-wide">
                                                                    Used
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className="divide-y divide-gray-200">
                                                            {Object.entries(usage).map(
                                                                ([key, value]) => (
                                                                    <tr
                                                                        key={key}
                                                                        className="hover:bg-gray-50"
                                                                    >
                                                                        <td className="px-5 py-3 text-gray-700">
                                                                            {formatLabel(key)}
                                                                        </td>

                                                                        <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                                            {value}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}