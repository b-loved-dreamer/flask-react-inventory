import React from 'react'

function Dropdown({
  formName, values, display, form,
}) {
  return (
    <select {...form.register(formName, { shouldUnregister: true })}>
      {values.map((value) => (
        <option key={value} value={value}>
          {display(value)}
        </option>
      ))}
    </select>
  )
}

Dropdown.defaultProps = {
  display: (value) => value,
}

export default Dropdown
