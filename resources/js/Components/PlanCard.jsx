import React from 'react';

export default function PlanCard({
    plan,
    isSelected,
    isCurrentPlan,
    onSelect,
    slug
}) {
    // Disable if explicit prop is passed OR if slug matches current active plan/slug identifier
    const isDisabled = isCurrentPlan || slug === 'current' || slug === plan.slug;

    return (
        <button
            type="button"
            onClick={() => onSelect(plan.id)}
            disabled={isDisabled}
            className={`w-full p-6 text-left rounded-2xl border transition-all font-semibold text-sm text-center ${
                isDisabled
                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed pointer-events-none opacity-80'
                    : isSelected
                    ? 'border-blue-600 bg-blue-600 text-white ring-2 ring-blue-600/20 shadow-md cursor-pointer'
                    : 'border-gray-200 bg-white text-gray-800 shadow-sm hover:border-blue-300 cursor-pointer'
            }`}
        >
            {plan.name}
        </button>
    );
}