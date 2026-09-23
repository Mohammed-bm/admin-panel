import React from 'react';
import { useForm } from '@inertiajs/react';
import PlanCard from '@/Components/PlanCard';
import { FiX } from 'react-icons/fi';

export default function EditPlanModal({ organization, plans, isOpen, onClose }) {
    // 1. Move hooks to top level (ALWAYS call hooks unconditionally)
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        plan_id: organization?.plan_id || '',
    });

    // 2. Early return AFTER all hook declarations
    if (!isOpen || !organization) return null;

    const handleSelectPlan = (id) => {
        clearErrors();
        setData('plan_id', id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/organization/${organization.id}/assign-plan`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Change Plan - {organization.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Select a new plan to assign to this organization.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {errors.plan_id && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                            {errors.plan_id}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isSelected={data.plan_id === plan.id}
                                isCurrentPlan={organization.plan_id === plan.id}
                                onSelect={handleSelectPlan}
                                slug={organization.plan}
                            />
                        ))}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={
                            processing ||
                            !data.plan_id ||
                            data.plan_id === organization.plan_id
                        }
                        className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {processing ? 'Assigning Plan...' : 'Confirm Plan Change'}
                    </button>
                </div>
            </div>
        </div>
    );
}