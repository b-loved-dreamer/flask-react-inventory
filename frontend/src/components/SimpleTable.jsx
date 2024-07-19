/* eslint-disable camelcase */
import React from 'react'
import { useTable } from 'react-table'

export default function SimpleTable({
  columns, data, style,
}) {
  const tableInstance = useTable({ columns, data })
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance

  return (
    <table className="input-box" style={style} {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((col) => (
              <th {...col.getHeaderProps()}>{col.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()}>
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
