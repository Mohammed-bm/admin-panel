import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import DataTable from 'datatables.net-react';

const TableView = forwardRef(({ columns = [], data = [], onPageChange, onLengthChange }, ref) => {
    const tableData = Array.isArray(data) ? data : (data?.data || []);
    const totalRecords = data?.total || 0;
    const currentPage = data?.current_page || 1;
    const perPage = data?.per_page || 10;

    const localRef = useRef(null);
    useImperativeHandle(ref, () => localRef.current);

    const onPageChangeRef = useRef(onPageChange);
    const onLengthChangeRef = useRef(onLengthChange);
    const currentPageRef = useRef(currentPage);
    const requestedPageRef = useRef(currentPage);

    // Refs for values captured by the (stale) ajax closure - always read current values
    const tableDataRef = useRef(tableData);
    const totalRecordsRef = useRef(totalRecords);
    const perPageRef = useRef(perPage);

    tableDataRef.current = tableData;
    totalRecordsRef.current = totalRecords;
    perPageRef.current = perPage;

    // Force DataTables to redraw when Inertia sends new server data.
    // In serverSide mode dt.draw() triggers the ajax callback, which now
    // reads current values from the refs above.
    useEffect(() => {
        if (!localRef.current) return;

        const dt = localRef.current.dt();

        if (!dt) return;

        dt.draw(false);
    }, [data]);

    useEffect(() => {
        onPageChangeRef.current = onPageChange;
        onLengthChangeRef.current = onLengthChange;
        currentPageRef.current = currentPage;
        requestedPageRef.current = currentPage;
    }, [onPageChange, onLengthChange, currentPage]);

    return (
        <div className="w-full 
            [&_table.dataTable]:!border-separate 
            [&_table.dataTable]:!border 
            [&_table.dataTable]:!border-solid 
            [&_table.dataTable]:!border-gray-200 
            [&_table.dataTable]:rounded-xl 
            [&_table.dataTable]:overflow-hidden 
            [&_table.dataTable_tbody_tr:last-child_td]:!border-b-0
            [&_table.dataTable_tbody_tr:hover]:!bg-[#6C38CC]/[0.015]
            
            [&_.dt-layout-row:last-child]:!items-center
            [&_.dt-info]:text-sm
            [&_.dt-info]:text-gray-500

            /* Circular pagination buttons */
            [&_.dt-paging-button]:!border-0
            [&_.dt-paging-button]:!bg-transparent
            [&_.dt-paging-button]:!rounded-full
            [&_.dt-paging-button]:!w-8
            [&_.dt-paging-button]:!h-8
            [&_.dt-paging-button]:!p-0
            [&_.dt-paging-button]:!inline-flex
            [&_.dt-paging-button]:!items-center
            [&_.dt-paging-button]:!justify-center
            [&_.dt-paging-button:hover]:!bg-purple-50
            [&_.dt-paging-button.disabled]:!text-gray-300
            [&_.dt-paging-button.disabled:hover]:!bg-transparent

            /* Active page solid dark style */
            [&_.dt-paging-button.current]:!bg-[#F6EDFF]
            [&_.dt-paging-button.current]:!text-[#8B2C91]
            [&_.dt-paging-button.current:hover]:!bg-[#EAD8FF]
            [&_.dt-layout-row:last-child]:rounded-xl

            [&_.dt-layout-row:last-child]:!justify-between 
            [&_.dt-search]:hidden 
            [&_.dt-layout-row:has(.dt-search)]:hidden 
            [&_table.dataTable_thead_th:first-child]:rounded-tl-xl 
            [&_table.dataTable_thead_th:last-child]:rounded-tr-xl 
            [&_table.dataTable_tbody_tr:last-child_td:first-child]:rounded-bl-xl 
            [&_table.dataTable_tbody_tr:last-child_td:last-child]:rounded-br-xl 
            [&_table.dataTable_tbody_td]:border-t 
            [&_table.dataTable_tbody_td]:border-gray-100 
            [&_table.dataTable_thead_th]:bg-[#F3E8FF] 
            [&_table.dataTable_thead_th]:border-b 
            [&_table.dataTable_thead_th]:border-gray-100
            
            [&_.dt-length_select]:!appearance-none
            [&_.dt-length_select]:!pl-3
            [&_.dt-length_select]:!pr-4
            [&_.dt-length_select]:!bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]
            [&_.dt-length_select]:!bg-[length:9px_9px]
            [&_.dt-length_select]:!bg-[right_10px_center]
            [&_.dt-length_select]:!bg-no-repeat
            [&_table.dataTable_tbody_td]:!py-4
            [&_table.dataTable_thead_th]:!py-4

            [&_table.dataTable_tbody_td]:!align-middle
            [&_table.dataTable_tbody_td]:!text-center
            [&_table.dataTable_thead_th]:!align-middle
            [&_table.dataTable_thead_th]:!text-center"
        >
            <DataTable
    ref={localRef}
    columns={columns}
    className="w-full overflow-x-auto"
    options={{
        serverSide: true,
    processing: false,

    pageLength: perPage,

    searching: false,
    lengthChange: true,
    info: true,
    paging: true,
    autoWidth: false,

        ajax: (dtParams, callback) => {

            const requestedPage =
                Math.floor(
                    dtParams.start / dtParams.length
                ) + 1;

            const requestedLength =
                dtParams.length;

            // PAGE CHANGED
            if (
                requestedPage !==
                    currentPageRef.current &&
                requestedPage !==
                    requestedPageRef.current
            ) {

                requestedPageRef.current =
                    requestedPage;

                onPageChangeRef.current?.(
                    requestedPage
                );

                return;
            }

            // LENGTH CHANGED
            if (
                requestedLength !== perPageRef.current
            ) {

                onLengthChangeRef.current?.(
                    requestedLength
                );

                return;
            }

            // GIVE CURRENT DATA TO DATATABLE
            callback({
                draw: dtParams.draw,
                recordsTotal: totalRecordsRef.current,
                recordsFiltered: totalRecordsRef.current,
                data: tableDataRef.current,
            });
        },

        layout: {
            topStart: null,
            topEnd: null,
            bottomStart: null,
            bottom: [
                'pageLength',
                'paging',
                'info'
            ],
            bottomEnd: null,
        },

        language: {
            lengthMenu: 'Show _MENU_',
            info: 'View _START_ - _END_ of _TOTAL_ List',
        },
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
    );
});

TableView.displayName = 'TableView';
export default TableView;
