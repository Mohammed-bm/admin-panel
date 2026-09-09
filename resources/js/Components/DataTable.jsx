import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import { CiCalendarDate } from 'react-icons/ci';
import { GoChevronDown } from 'react-icons/go';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import { useState } from 'react';
import { useDisclosure } from "@mantine/hooks";

export default function DataTable({
    rows,
    columns,
    rowCount,
    paginationModel,
    onPaginationModelChange,
    search,
    onSearch,
    onFilter
}) {

    const [opened, { toggle, close }] = useDisclosure(false);
    const [selected, setSelected] = useState('');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const sortBillDate = [
        { name: "Today", value: "today" },
        { name: "Last 7 Days", value: "last-7-days" },
        { name: "Last 15 Days", value: "last-15-days" },
        { name: "Last 30 Days", value: "last-30-days" },
        { name: "Last 1 Year", value: "last-year" },
        { name: "Custom Range", value: "custom" },
    ];

    const handleSelect = (item) => {
        setSelected(item);
        setStartDate(null);
        setEndDate(null);

        if (item.value !== "custom") {
            onFilter(item.value);
        }
        
        close();
    };


    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(end);
        setEndDate(start);

        if (start && end) {
            const [first, last] = start < end ? [start, end] : [end, start];

            const formatDate = (date) => {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            };

            const d1 = formatDate(first);
            const d2 = formatDate(last);

            onFilter(`custom:${d1}:${d2}`);
            close();
        }
    };

    return (
        <>
            <div className="flex items-center gap-4 relative">
                <TextField
                    label="Search"
                    color="secondary"
                    value={search}
                    focused
                    onChange={(e) => onSearch(e.target.value.slice(0, 20))}
                    size="small"
                />

                <button
                    onClick={toggle}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                    <CiCalendarDate className="w-5 h-5" />
                    <span>{selected ? selected.name : "Filter by Date"}</span>
                    <GoChevronDown className={classNames("transition-transform", { "rotate-180": opened })} />
                </button>

                {opened && (
                    <div className="absolute top-12 left-[230px] z-50 flex flex-col w-[300px] border border-gray-200 rounded-md shadow-lg bg-white">

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
                                <div className="flex justify-center p-2">
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
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows ?? []}
                        columns={columns}
                        paginationMode="server"
                        rowCount={rowCount}
                        paginationModel={paginationModel}
                        onPaginationModelChange={onPaginationModelChange}
                        pageSizeOptions={[15]}
                    />
                </Paper>
            </Box>
        </>
    );
}