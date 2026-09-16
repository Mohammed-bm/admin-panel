import { useRef } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

import TableSearchInput from './TableSearchInput';
import TableFilterDropdown from './TableFilterDropdown';
import TableView from './TableView';

// Export sub-components individually for standalone layout placements
export { TableSearchInput, TableFilterDropdown, TableView };

DataTable.use(DT);

// Default combined wrapper component
export default function DataTableComponent({
    columns = [],
    data = [],
    onSearch,
    onFilter,
    onDateFilter,
    onReset,
    activeSearch = '',
    activeFilter = '',
}) {
    const tableRef = useRef(null);

    const handleReset = () => {
        // Clear DataTables internal search engine if active
        if (tableRef.current?.dt()) {
            tableRef.current.dt().search('').draw();
        }
        // Delegate server request reset to parent page
        onReset?.();
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden p-4">
            <div className="flex items-center gap-4 mb-4 relative">
                {/* Search Bar Sub-component */}
                <TableSearchInput 
                    activeSearch={activeSearch} 
                    onSearch={onSearch} 
                />

                {/* Filter Dropdown Sub-component */}
                <TableFilterDropdown 
                    activeFilter={activeFilter} 
                    onFilter={onFilter} 
                    onDateFilter={onDateFilter} 
                />

                {/* Reset Button */}
                <div className="relative">
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* DataTable Sub-component */}
            <TableView ref={tableRef} columns={columns} data={data} />
        </div>
    );
}