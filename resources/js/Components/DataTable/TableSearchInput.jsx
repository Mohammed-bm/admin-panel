import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function TableSearchInput({ activeSearch = '', onSearch, placeholder = "Search..." }) {
    // 1. Local state only for typing
    const [searchValue, setSearchValue] = useState(activeSearch);

    // 2. Keep local input in sync if parent changes activeSearch externally
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchValue !== activeSearch) {
                onSearch?.(searchValue);
            }
        }, 400); // Wait 400ms after user stops typing

        return () => clearTimeout(handler);
    }, [searchValue]);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchValue(val);
        onSearch?.(val); // Send value back to parent
    };

    return (
        <div className="relative w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
                type="text"
                value={searchValue}
                placeholder={placeholder}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
        </div>
    );
}