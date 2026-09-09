import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { TextField } from '@mui/material';

import { CiCalendarDate } from "react-icons/ci";
import { GoChevronDown } from "react-icons/go";
import { useDisclosure } from "@mantine/hooks";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import classNames from "classnames";

export default function Index({ users }) {

    const [search, setSearch] = useState(null);
    const [sorting, setSorting] = useState(null);

    const [selected, setSelected] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Mantine hooks are identical in JS
    const [opened, { toggle, close }] = useDisclosure(false);
    //const activityRef = useClickOutside(() => close());

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/users', {
                search: search,
                filter: sorting,
                page: 1,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [search]);

    const columns = [
        {
            field: 'rowNumber', headerName: '#', width: 70, valueGetter: (_, row) =>
                (users.current_page - 1) * users.per_page
                + (users?.data ?? []).indexOf(row)
                + 1,
        },
        { field: 'id', headerName: 'User ID', width: 150 },
        { field: 'first_name', headerName: 'First Name', width: 150 },
        { field: 'last_name', headerName: 'Last Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'date', headerName: 'Date', width: 140 },
        { field: 'time', headerName: 'Time', width: 120 },
        { field: 'profile_completed', headerName: 'Profile Created', width: 150, valueGetter: (value) => Number(value) === 1 ? 'Yes' : 'No' },
    ];

    const sortBillDate = [
        { name: "Today", value: "today" },
        { name: "Last 7 Days", value: "last-7-days" },
        { name: "Last 15 Days", value: "last-15-days" },
        { name: "Last 30 Days", value: "last-30-days" },
        { name: "Last 1 Year", value: "last-year" },
        { name: "Custom Range", value: "custom" },
    ];

    const [paginationModel, setPaginationModel] = useState({
        page: users.current_page - 1,
        pageSize: users.per_page,
    });

    const applyFilter = (filterValue) => {
        setSorting(filterValue);
        router.get('/users', {
            search: search,
            filter: filterValue,
            page: 1,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePaginationChange = (newModel) => {
        setPaginationModel(newModel);

        router.get('/users', {
            search: search,
            filter: sorting,
            page: newModel.page + 1,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSelect = (item) => {
        setSelected(item);
        setStartDate(null);
        setEndDate(null);

        if (item.value !== "custom") {
            applyFilter(item.value);
        } else {
            setSorting(item.value);
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

            applyFilter(`custom:${d1}:${d2}`);
            close();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Users Table
                </h2>
            }
        >
            <div className="p-6 space-y-4">

                {/* Search & Filter Controls Container */}
                <div className="flex items-center gap-4 relative">
                    <TextField
                        label="Search"
                        color="secondary"
                        value={search}
                        focused
                        onChange={(e) => setSearch(e.target.value.slice(0, 20))}
                        size="small"
                    />

                    {/* Dropdown Trigger Button */}
                    <button
                        onClick={toggle}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                        <CiCalendarDate className="w-5 h-5" />
                        <span>{selected ? selected.name : "Filter by Date"}</span>
                        <GoChevronDown className={classNames("transition-transform", { "rotate-180": opened })} />
                    </button>

                    {/* Floating Dropdown Menu */}
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
                            rows={users?.data ?? []}
                            columns={columns}
                            paginationMode="server"
                            rowCount={users.total}
                            paginationModel={paginationModel}
                            onPaginationModelChange={handlePaginationChange}
                            pageSizeOptions={[15]}
                        />
                    </Paper>
                </Box>
            </div>
        </AuthenticatedLayout>
    );
}