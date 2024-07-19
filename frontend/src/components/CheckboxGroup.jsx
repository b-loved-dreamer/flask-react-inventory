import React from 'react'

function CheckboxGroup({
  formName, values, display, requiredCount, form,
}) {
  return (
    <div>
      {values.map((value) => (
        <div key={value}>
          <label>
            <input
              type="checkbox"
              value={value}
              {...form.register(formName, {
                shouldUnregister: true,
                validate: (arr) => arr.length >= requiredCount || `Please select at least ${requiredCount}.`,
              })}
            />
            {display(value)}
          </label>
        </div>
      ))}
    </div>
  )
}

CheckboxGroup.defaultProps = {
  display: (value) => value,
}

export default CheckboxGroup
