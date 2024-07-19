import React from 'react';
import { Link } from 'react-router-dom'

const WaterHeaterDrilldownTable = ({ data, columns, onRowClick, hideState }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.accessor}>{column.Header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
  {data.map((row, rowIndex) => (
    <tr key={row.id || rowIndex}>
      {columns.map((column, columnIndex) => (
        <td key={`${column.accessor}-${row.id}`}>
          {columnIndex === 0 && !hideState ? (
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onRowClick(row);
              }}
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              {row[column.accessor]}
            </Link>
          ) : (
            row[column.accessor]
          )}
        </td>
      ))}
    </tr>
  ))}
</tbody>

    </table>
  );
};

export default WaterHeaterDrilldownTable;


