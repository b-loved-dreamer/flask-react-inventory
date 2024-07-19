import React from 'react';
import { Link } from 'react-router-dom';

const ManufacturerDrilldownTable = ({ data, columns, onRowClick, isDrilldown }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id || column.accessor}>{column.Header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((rowData, rowIndex) => {
          const row = { ...rowData, index: rowIndex };

          return (
            <tr key={row.id || rowIndex}>
              {columns.map((column, columnIndex) => {
                const cellContent =
                  column.Cell && typeof column.Cell === 'function'
                    ? column.Cell({ row, rowIndex, column, columnIndex })
                    : row[column.accessor];

                return (
                  <td key={`${column.id || column.accessor}-${row.id}`}>
                    {columnIndex === 1  && !isDrilldown? (
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onRowClick(row);
                        }}
                        style={{ color: 'blue', textDecoration: 'underline' }}
                      >
                        {cellContent}
                      </Link>
                    ) : (
                      cellContent
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ManufacturerDrilldownTable;
