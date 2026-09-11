import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { FiFilter } from 'react-icons/fi';
import { GoChevronDown } from 'react-icons/go';
import { useDisclosure } from "@mantine/hooks";

const SORT_BILL_DATE = [
    { name: "Today", value: "today" },
    { name: "Last 7 Days", value: "last-7-days" },
    { name: "Last 15 Days", value: "last-15-days" },
    { name: "Last 30 Days", value: "last-30-days" },
    { name: "Last 1 Year", value: "last-year" },
    { name: "Custom Range", value: "custom" },
];

export default function TableFilterDropdown({ activeFilter = '', onFilter, onDateFilter }) {
    const [opened, { toggle, close }] = useDisclosure(false);
    const [selected, setSelected] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        if (!activeFilter || typeof activeFilter !== 'string') {
            setSelected(null);
            return;
        }

        if (activeFilter.startsWith('custom:')) {
            setSelected({ name: "Custom Range", value: "custom" });
        } else {
            const found = SORT_BILL_DATE.find((item) => item.value === activeFilter);
            setSelected(found || null);
        }
    }, [activeFilter]);

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
            const formattedStart = start.toISOString().split('T')[0];
            const formattedEnd = end.toISOString().split('T')[0];
            close();
            onDateFilter?.(formattedStart, formattedEnd);
        }
    };

    return (
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
                <div className="absolute top-12 left-0 z-50 flex flex-col w-[300px] border border-gray-200 rounded-md shadow-lg bg-white">
                    <div className="w-full flex flex-col py-2 px-2 border-b border-gray-200">
                        {SORT_BILL_DATE.map((item) => (
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
    );
}