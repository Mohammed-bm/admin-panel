import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { FiFilter } from 'react-icons/fi';
import { GoChevronDown } from 'react-icons/go';
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import "react-datepicker/dist/react-datepicker.css";

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

    const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

    // Attach click-outside hook to close the main filter dropdown
    const dropdownRef = useClickOutside(() => close());

    useEffect(() => {
        console.log('activeFilter changed:', activeFilter);
        if (!activeFilter) {
            setSelected(null);
            setShowCustomDateInputs(false);
            setStartDate(null);
            setEndDate(null);
            return;
        }

        if (activeFilter === 'custom') {
            setSelected({ name: 'Custom Range', value: 'custom' });
            return;
        }

        const found = SORT_BILL_DATE.find(
            (item) => item.value === activeFilter
        );

        setSelected(found || null);
        setShowCustomDateInputs(false);
    }, [activeFilter]);

    const handleSelect = (item) => {
        setSelected(item);

        if (item.value === 'custom') {
            setShowCustomDateInputs(true);
            close();
            return;
        }

        setStartDate(null);
        setEndDate(null);
        setShowCustomDateInputs(false);
        close();
        onFilter?.(item.value);
    };

    const handleStartDateChange = (date) => {
        setStartDate(date);
        if (date && endDate) {
            triggerDateFilter(date, endDate);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        if (startDate && date) {
            triggerDateFilter(startDate, date);
        }
    };

    const triggerDateFilter = (start, end) => {
        const formattedStart = start.toISOString().split('T')[0];
        const formattedEnd = end.toISOString().split('T')[0];
        onDateFilter?.(formattedStart, formattedEnd);
    };

    return (
        <div className="relative flex items-end gap-2">

            {/* Main Filter Button Container with Label */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 h-4">
                    Filter by Date:
                </label>

                <div ref={dropdownRef} className="relative">
                    <button
                        onClick={toggle}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                        <FiFilter className="w-4 h-4 text-gray-500" />

                        <span>
                            {selected ? selected.name : "Filter"}
                        </span>

                        <GoChevronDown
                            className={classNames(
                                "transition-transform text-gray-400",
                                {
                                    "rotate-180": opened,
                                }
                            )}
                        />
                    </button>

                    {/* Filter Dropdown */}
                    {opened && (
                        <div className="absolute top-12 left-0 z-50 flex flex-col w-[300px] border border-gray-200 rounded-md shadow-lg bg-white">
                            <div className="w-full flex flex-col py-2 px-2 border-b border-gray-200">
                                {SORT_BILL_DATE.map((item) => (
                                    <button
                                        key={item.value}
                                        onClick={() => handleSelect(item)}
                                        className={classNames(
                                            "w-full px-4 py-[10.5px] text-left text-sm rounded-md",
                                            selected?.value === item.value
                                                ? "bg-[#EAEFFF] font-medium"
                                                : "hover:bg-[#F5F8FF]"
                                        )}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Date Inputs */}
            {showCustomDateInputs && (
                <div className="flex items-end gap-2">

                    {/* Start Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 h-4">
                            Start Date
                        </label>

                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="yyyy-MM-dd"
                            dateFormat="yyyy-MM-dd"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white text-gray-700"
                        />
                    </div>

                    {/* To */}
                    <span className="text-gray-400 text-sm mb-2">
                        to
                    </span>

                    {/* End Date */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 h-4">
                            End Date
                        </label>

                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="yyyy-MM-dd"
                            dateFormat="yyyy-MM-dd"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white text-gray-700"
                        />
                    </div>

                </div>
            )}
        </div>
    );
}