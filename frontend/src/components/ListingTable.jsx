/* eslint-disable camelcase */
import React from 'react'
import { useTable } from 'react-table'

export default function ListingTable({
  columns, data, handleDelete,
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
    <table className="input-box" style={{ minWidth: '500px' }} {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((col) => (
              <th {...col.getHeaderProps()}>{col.render('Header')}</th>
            ))}
            <th style={{ userSelect: 'none', color: 'transparent' }}>delete</th>
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
              <td>
                <button
                  className="link-button"
                  type="button"
                  onClick={() => handleDelete(row.values.order_entered)}
                >
                  delete
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
