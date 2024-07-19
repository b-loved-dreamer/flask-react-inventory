import React, { useEffect } from 'react'

import { capitalizeWords } from '../utils/string'
import { requiredErrorMsg, setValueAsFloat, validateTenthsDecimal } from '../utils/validation'

import Dropdown from './Dropdown'
import InputLabel from './InputLabel'

const eer = 'energy_efficiency_ratio'
const es = 'energy_source'
const seer = 'seasonal_energy_efficiency_rating'
const hspf = 'heating_seasonal_performance_factor'

const energySourceValues = [
  'electric',
  'gas',
  'fuel oil',
]

export function AirConditionerInput({ form }) {
  useEffect(() => () => {
    form.unregister(eer)
  }, [])

  return (
    <InputLabel
      label="Energy efficiency ratio"
      formName={eer}
      form={form}
      hasError
    >
      <input
        type="text"
        {...form.register(eer, {
          shouldUnregister: true,
          required: requiredErrorMsg,
          setValueAs: setValueAsFloat,
          validate: {
            tenthDecimal: validateTenthsDecimal,
          },
        })}
      />
    </InputLabel>
  )
}

export function HeaterInput({ form }) {
  useEffect(() => () => {
    form.unregister(es)
  }, [])

  return (
    <InputLabel
      label="Energy source"
      formName={es}
      form={form}
    >
      <Dropdown
        formName={es}
        values={energySourceValues}
        display={capitalizeWords}
        form={form}
      />
    </InputLabel>
  )
}

export function HeatPumpInput({ form }) {
  return (
    <>
      <InputLabel
        label="Seasonal efficiency rating"
        formName={seer}
        form={form}
        hasError
      >
        <input
          type="text"
          {...form.register(seer, {
            shouldUnregister: true,
            required: requiredErrorMsg,
            setValueAs: setValueAsFloat,
            validate: {
              tenthDecimal: validateTenthsDecimal,
            },
          })}
        />
      </InputLabel>

      <InputLabel
        label="Heating seasonal performance factor"
        formName={hspf}
        form={form}
        hasError
      >
        <input
          type="text"
          {...form.register(hspf, {
            shouldUnregister: true,
            required: requiredErrorMsg,
            setValueAs: setValueAsFloat,
            validate: {
              tenthDecimal: validateTenthsDecimal,
            },
          })}
        />
      </InputLabel>
    </>
  )
}
