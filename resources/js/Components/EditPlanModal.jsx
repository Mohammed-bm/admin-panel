import React from 'react';
import { useForm } from '@inertiajs/react';
import PlanCard from '@/Components/PlanCard';
import { FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function EditPlanModal({ organization, plans, isOpen, onClose }) {
    const isSamePlan = Boolean(organization?.plan_id) && data.plan_id === organization.plan_id;
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
                Swal.fire({
                    icon: 'success',
                    title: 'Plan Changed Successfully',
                    text: 'The organization plan has been updated.',
                    confirmButtonText: 'OK',
                });
                onClose();
            },
            onError: (errs) => {
                // Grab the first validation error message, or fallback to a default string
                const errorMessage = Object.values(errs)[0] || 'The organization plan could not be updated.';

                Swal.fire({
                    icon: 'error',
                    title: 'Something went wrong',
                    text: errorMessage,
                    confirmButtonText: 'OK',
                });
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6 items-stretch">
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
                            isSamePlan
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