import { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function TableSearchInput({activeSearch = '', onSearch, placeholder = "Search..." }) {
    // 1. Local state only for typing
    const [searchValue, setSearchValue] = useState(activeSearch);
    const onSearchRef = useRef(onSearch);

    useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);

    const isFirstRender = useRef(true);

    // 2. Debounce trigger to parent
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            onSearch?.(searchValue);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchValue]);

    // 3. Handle keystrokes (ONLY updates local state)
    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    }

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