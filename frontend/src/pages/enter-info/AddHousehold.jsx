import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router-dom'
import useRunBlocking from '../../hooks/useRunBlocking'

import {
  regexEmail, regexPostalCode, requiredErrorMsg, setValueAsInt, validateNonNegative,
} from '../../utils/validation'
import { capitalizeWords } from '../../utils/string'
import { API, jsonHeader } from '../../utils/requests'

import CheckboxGroup from '../../components/CheckboxGroup'
import TemperatureSettingInput from '../../components/TemperatureSettingInput'
import Dropdown from '../../components/Dropdown'
import InputLabel from '../../components/InputLabel'

const householdTypesValues = [
  'house',
  'apartment',
  'townhome',
  'condominium',
  'mobile home',
]

const publicUtilitiesValues = [
  'electric',
  'gas',
  'steam',
  'fuel oil',
]

export default function HouseholdInfo() {
  const { runBlocking, unblock } = useRunBlocking()
  const [, setHouseholdState] = useOutletContext()
  const navigate = useNavigate()

  const form = useForm({
    // mode: 'onBlur',
    defaultValues: {
      public_utilities: [],
    },
  })

  const submitHandler = runBlocking(async (data) => {
    const formattedData = {
      ...data,
      public_utilities: data.public_utilities.length === 0 ? ['off-the-grid'] : data.public_utilities,
      thermostat_setting_heating: data.thermostat_setting_heating ?? null,
      thermostat_setting_cooling: data.thermostat_setting_cooling ?? null,
    }

    try {
      const res = await fetch(`${API}create_household`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify(formattedData),
      })

      if (res.status === 200) {
        const json = await res.json()

        if (!json.email) {
          form.setError('email', {
            type: 'duplicate',
            message: 'This email has already been used.',
          })
        }

        if (!json.postal_code) {
          form.setError('postal_code', {
            type: 'DNE',
            message: 'This postal code is not valid.',
          })
        }
      } else if (res.status === 201) {
        setHouseholdState((prevState) => ({
          ...prevState,
          email: data.email,
          isOffTheGrid: data.public_utilities.length === 0,
        }))
        navigate('/enter-info/add-appliance', { replace: true })
      } else {
        throw Error(`${res.status} ${res.statusText}`)
      }
    } catch (err) {
      alert(`${err.message} \n\nTry again.`)
    }

    unblock()
  })

  return (
    <div className="input-page-size">
      <div className="page-name">Enter household info</div>
      <form onSubmit={form.handleSubmit(submitHandler)} noValidate>
        <InputLabel
          label="Email"
          formName="email"
          form={form}
          hasError
        >
          <input
            type="text"
            placeholder="example@domain.com"
            {...form.register('email', {
              required: requiredErrorMsg,
              pattern: {
                value: regexEmail,
                message: 'Please enter a valid email.',
              },
            })}
          />
        </InputLabel>

        <InputLabel
          label="5-digits postal code"
          formName="postal_code"
          form={form}
          hasError
        >
          <input
            type="text"
            placeholder="77002"
            {...form.register('postal_code', {
              required: requiredErrorMsg,
              pattern: {
                value: regexPostalCode,
                message: 'Please enter a 5 digits postal code.',
              },
            })}
          />
        </InputLabel>

        <InputLabel
          label="Home type"
          formName="household_type"
          form={form}
        >
          <Dropdown
            formName="household_type"
            values={householdTypesValues}
            display={capitalizeWords}
            form={form}
          />
        </InputLabel>

        <InputLabel
          label="Square footages"
          formName="square_footage"
          form={form}
          hasError
        >
          <input
            type="text"
            {...form.register(
              'square_footage',
              {
                required: requiredErrorMsg,
                setValueAs: setValueAsInt,
                validate: {
                  nonNegative: validateNonNegative,
                },
              },
            )}
          />
        </InputLabel>

        <InputLabel
          label="Thermostat setting for heating"
          formName="thermostat_setting_heating"
          form={form}
          hasError
        >
          <TemperatureSettingInput
            name="thermostat_setting_heating"
            checkboxLabel="No heating"
            form={form}
          />
        </InputLabel>

        <InputLabel
          label="Thermostat setting for cooling"
          formName="thermostat_setting_cooling"
          form={form}
          hasError
        >
          <TemperatureSettingInput
            name="thermostat_setting_cooling"
            checkboxLabel="No cooling"
            form={form}
          />
        </InputLabel>

        <InputLabel
          label="Public utilities (If none, leave unchecked)"
          formName="public_utilities"
          form={form}
          disableFocus
        >
          <CheckboxGroup
            formName="public_utilities"
            values={publicUtilitiesValues}
            display={capitalizeWords}
            requiredCount={0}
            form={form}
          />
        </InputLabel>

        <div className="margin-top align-right">
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  )
}
