import { Link, usePage } from '@inertiajs/react';

const Tabs = ({ tabs = [] }) => {
    const { url } = usePage();

    return (
        <div className="flex w-fit overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {tabs.map((tab) => {
                const isActive = url === tab.href;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
};

export default Tabs;