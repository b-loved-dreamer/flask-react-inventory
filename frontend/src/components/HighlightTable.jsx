import React from 'react'
import { useTable } from 'react-table'

function HighlightText({ string, highlightString }) {
  if (string === null || string === undefined) {
    return <span />
  }

  const regex = new RegExp(`(${highlightString})`, 'gi')
  const substrArr = string.split(regex)

  return (
    <span>
      {substrArr.map((substr, i) => {
        if (substr.toLowerCase() === highlightString.toLowerCase()) {
          return <span key={i} className="highlight-text">{substr}</span>
        }
        return <span key={i}>{substr}</span>
      })}
    </span>
  )
}

export default function HighlightTable({
  columns, data, searchString, minWidth,
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
    <table className="input-box margin-top" style={{ minWidth }} {...getTableProps()}>
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
                  <HighlightText string={cell.value} highlightString={searchString} />
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
