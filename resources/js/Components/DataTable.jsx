import { GoChevronDown } from 'react-icons/go';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useDisclosure } from "@mantine/hooks";
import { useRef, useState, useEffect } from 'react';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

DataTable.use(DT);

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
    const [opened, { toggle, close }] = useDisclosure(false);
    const [searchValue, setSearchValue] = useState(activeSearch);
    const [selected, setSelected] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const tableRef = useRef(null);

    const sortBillDate = [
        { name: "Today", value: "today" },
        { name: "Last 7 Days", value: "last-7-days" },
        { name: "Last 15 Days", value: "last-15-days" },
        { name: "Last 30 Days", value: "last-30-days" },
        { name: "Last 1 Year", value: "last-year" },
        { name: "Custom Range", value: "custom" },
    ];

    useEffect(() => {
        setSearchValue(activeSearch);
    }, [activeSearch]);

    useEffect(() => {
        // 1. Guard against non-string, null, undefined, or empty values
        if (!activeFilter || typeof activeFilter !== 'string') {
            setSelected(null);
            return;
        }

        // 2. Safe string check
        if (activeFilter.startsWith('custom:')) {
            setSelected({ name: "Custom Range", value: "custom" });
        } else {
            const found = sortBillDate.find((item) => item.value === activeFilter);
            setSelected(found || null);
        }
    }, [activeFilter]);

    const handleReset = () => {
        setSelected('');
        setStartDate(null);
        setEndDate(null);
        close();

        // 2. Clear DataTables search engine if active
        if (tableRef.current?.dt()) {
            tableRef.current.dt().search('').draw();
        }

        // 3. Delegate server request reset to parent
        onReset?.();
    };

    const handleSelect = (item) => {
        setSelected(item);

        if (item.value !== 'custom') {
            setStartDate(null);
            setEndDate(null);
            close();

            onFilter?.(item.value);
        }
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;

        setStartDate(start);
        setEndDate(end);

        if (start && end) {
            const startDate = start.toISOString().split('T')[0];
            const endDate = end.toISOString().split('T')[0];

            close();

            onDateFilter?.(startDate, endDate);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchValue(val);
        onSearch?.(val);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden p-4">
            <div className="flex items-center gap-4 mb-4 relative">
                <div className="relative w-80">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchValue}
                        placeholder="search by name, email_id, phone, date etc..."
                        onChange={handleSearch}
                        className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={toggle}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                        <FiFilter className="w-4 h-4 text-gray-500" />
                        <span>{selected ? selected.name : "Filter"}</span>
                        <GoChevronDown className={classNames("transition-transform text-gray-400", { "rotate-180": opened })} />
                    </button>

                    {opened && (
                        <div className="absolute top-12 left-0 z-50 flex flex-col w-[300px] border border-gray-200 rounded-md shadow-lg bg-white ">

                            {/* TOP PANEL: Main Options */}
                            <div className="w-full flex flex-col py-2 px-2 border-b border-gray-200">
                                {sortBillDate.map((item) => (
                                    <button
                                        key={item.value}
                                        onClick={() => handleSelect(item)}
                                        className={classNames(
                                            "w-full px-4 py-[10.5px] text-left text-sm rounded-md",
                                            selected?.value === item.value ? "bg-[#EAEFFF] font-medium" : "hover:bg-[#F5F8FF]"
                                        )}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>

                            {selected?.value === "custom" && (
                                <div className="w-full p-2 max-h-[250px] overflow-y-auto">
                                    <div className="w-full overflow-x-auto rounded-lg border border-gray-300 [&_table.dataTable]:border-none [&_table.dataTable_tbody_td]:border-t [&_table.dataTable_tbody_td]:border-gray-100 [&_table.dataTable_thead_th]:border-b [&_.dt-layout-row]:!m-0">
                                        <DatePicker
                                            onChange={handleDateChange}
                                            startDate={startDate}
                                            endDate={endDate}
                                            selectsRange
                                            inline
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
            <div className="w-full 
    [&_table.dataTable]:!border-separate 
[&_table.dataTable_tbody_tr:last-child_td]:!border-b-0
    [&_table.dataTable]:!border 
    [&_table.dataTable]:!border-solid 
    [&_table.dataTable]:!border-gray-200 
    [&_table.dataTable]:rounded-xl 
    [&_table.dataTable]:overflow-hidden [&_.dt-layout-row:last-child]:mt-4 [&_.dt-layout-row:last-child]:!flex
    [&_.dt-layout-row:last-child]:!items-center
    [&_.dt-info]:text-sm
[&_.dt-info]:text-gray-500
[&_.dt-paging-button]:rounded-lg
[&_.dt-paging-button]:!border-0
[&_.dt-paging-button]:!bg-transparent
[&_.dt-paging-button.current]:!text-white
[&_.dt-paging-button]:mx-0.5
[&_.dt-paging-button:hover]:!bg-purple-50
[&_.dt-paging-button.disabled]:!text-gray-300
[&_.dt-paging-button.disabled:hover]:!bg-transparent
[&_.dt-layout-row:last-child]:py-2
[&_table.dataTable_tbody_tr:hover]:!bg-[#6C38CC]/[0.015]
[&_.dt-layout-row:last-child]:rounded-xl
[&_.dt-layout-row:last-child_.dt-layout-cell]:!w-auto

    [&_.dt-layout-row:last-child]:!justify-between [&_.dt-search]:hidden [&_.dt-layout-row:has(.dt-search)]:hidden [&_table.dataTable]:rounded-xl [&_table.dataTable]:overflow-hidden [&_table.dataTable_thead_th:first-child]:rounded-tl-xl [&_table.dataTable_thead_th:last-child]:rounded-tr-xl [&_table.dataTable_tbody_tr:last-child_td:first-child]:rounded-bl-xl [&_table.dataTable_tbody_tr:last-child_td:last-child]:rounded-br-xl [&_table.dataTable_tbody_td]:border-t [&_table.dataTable_tbody_td]:border-gray-100 [&_table.dataTable_thead_th]:bg-[#F3E8FF] [&_table.dataTable_thead_th]:border-b [&_table.dataTable_thead_th]:border-gray-100">
                <DataTable
                    ref={tableRef}
                    columns={columns}
                    processing={true}
                    data={data}
                    className=" w-full overflow-x-auto"
                    options={{
                        layout: {
                            topStart: null,
                            topEnd: null,
                            bottomStart: 'info',
                            bottomEnd: 'paging',
                        },
                        searching: false,
                        lengthChange: false,
                        language: {
                            search: "_INPUT_",
                            searchPlaceholder: "search by name, email_id, phone, date etc...",
                        },
                        paging: true,
                        info: true,
                        pageLength: 10,
                        autoWidth: false,
                    }}
                >
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th key={column.name || column.data || index}>
                                    {column.title || column.name || ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                </DataTable>
            </div>
        </div>
    );
}