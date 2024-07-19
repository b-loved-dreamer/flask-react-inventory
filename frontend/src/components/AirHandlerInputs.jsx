import React from 'react'

import { addSpaceBeteweenCapitalized } from '../utils/string'

import { AirConditionerInput, HeaterInput, HeatPumpInput } from './AirHandlerMethodsInput'
import CheckboxGroup from './CheckboxGroup'
import InputLabel from './InputLabel'

const methodsValues = [
  'AirConditioner',
  'Heater',
  'HeatPump',
]

export default function AirHandlerInput({ form }) {
  const methodsSelected = form.watch('methods')

  return (
    <InputLabel
      label="Heating / cooling methods"
      formName="methods"
      form={form}
      hasError
      disableFocus
    >
      <CheckboxGroup
        formName="methods"
        values={methodsValues}
        display={addSpaceBeteweenCapitalized}
        requiredCount={1}
        form={form}
      />

      {Array.isArray(methodsSelected)
        ? (
          <div>
            {methodsSelected.includes('AirConditioner') && (
            <AirConditionerInput form={form} />
            )}
            {methodsSelected.includes('Heater') && (
            <HeaterInput form={form} />
            )}
            {methodsSelected.includes('HeatPump') && (
            <HeatPumpInput form={form} />
            )}
          </div>
        ) : null}
    </InputLabel>
  )
}
