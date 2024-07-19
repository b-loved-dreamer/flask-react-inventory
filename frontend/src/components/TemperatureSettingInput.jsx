import React, { useState, useEffect } from 'react'
import {
  requiredErrorMsg, setValueAsInt, validateInteger,
} from '../utils/validation'

export default function TemperatureSettingInput({
  name, checkboxLabel, form,
}) {
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    if (isChecked) {
      form.unregister(name)
    } else {
      form.register(name)
    }
  }, [isChecked])

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked)
  }

  if (isChecked) {
    return (
      <div>
        <input
          className="margin-right"
          type="text"
          disabled
        />
        <label>
          <input type="checkbox" onChange={handleCheckboxChange} />
          {checkboxLabel}
        </label>
      </div>
    )
  }
  return (
    <div>
      <input
        className="margin-right"
        type="text"
        disabled={isChecked}
        {...form.register(name, {
          required: { value: !isChecked, message: requiredErrorMsg },
          setValueAs: setValueAsInt,
          validate: validateInteger,
        })}
      />
      <label>
        <input type="checkbox" onChange={handleCheckboxChange} />
        {checkboxLabel}
      </label>
    </div>
  )
}
