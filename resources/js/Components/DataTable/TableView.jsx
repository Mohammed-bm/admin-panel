import { forwardRef } from 'react';
import DataTable from 'datatables.net-react';

const TableView = forwardRef(({ columns = [], data = [] }, ref) => {
    return (
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
            [&_.dt-layout-row:last-child]:!justify-between [&_.dt-search]:hidden [&_.dt-layout-row:has(.dt-search)]:hidden [&_table.dataTable]:rounded-xl [&_table.dataTable]:overflow-hidden [&_table.dataTable_thead_th:first-child]:rounded-tl-xl [&_table.dataTable_thead_th:last-child]:rounded-tr-xl [&_table.dataTable_tbody_tr:last-child_td:first-child]:rounded-bl-xl [&_table.dataTable_tbody_tr:last-child_td:last-child]:rounded-br-xl [&_table.dataTable_tbody_td]:border-t [&_table.dataTable_tbody_td]:border-gray-100 [&_table.dataTable_thead_th]:bg-[#F3E8FF] [&_table.dataTable_thead_th]:border-b [&_table.dataTable_thead_th]:border-gray-100"
        >
            <DataTable
                ref={ref}
                columns={columns}
                processing={true}
                data={data}
                className="w-full overflow-x-auto"
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
    );
});

TableView.displayName = 'TableView';
export default TableView;