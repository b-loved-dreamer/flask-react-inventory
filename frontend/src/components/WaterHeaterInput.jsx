import React from 'react'

import { capitalizeWords } from '../utils/string'
import {
  requiredErrorMsg, setValueAsInt, validateNonNegative, validateInteger,
} from '../utils/validation'

import Dropdown from './Dropdown'
import InputLabel from './InputLabel'

const energySourceValues = [
  'electric',
  'gas',
  'thermosolar',
  'heat pump',
]

export default function WaterHeater({
  form,
}) {
  return (
    <>
      <InputLabel
        label="Capacity (gallons)"
        formName="capacity"
        form={form}
        hasError
      >
        <input
          type="text"
          {...form.register('capacity', {
            shouldUnregister: true,
            required: requiredErrorMsg,
            setValueAs: setValueAsInt,
            validate: {
              nonNegative: validateNonNegative,
            },
          })}
        />
      </InputLabel>

      <InputLabel
        label="Current temperature setting"
        formName="current_temperature_setting"
        form={form}
        hasError
      >
        <input
          type="text"
          {...form.register('current_temperature_setting', {
            shouldUnregister: true,
            setValueAs: setValueAsInt,
            validate: {
              integer: (num) => num === null || validateInteger(num),
            },
          })}
        />
      </InputLabel>

      <InputLabel
        label="Energy source"
        formName="energy_source"
        form={form}
      >
        <Dropdown
          formName="energy_source"
          values={energySourceValues}
          display={capitalizeWords}
          form={form}
        />
      </InputLabel>
    </>
  )
}
