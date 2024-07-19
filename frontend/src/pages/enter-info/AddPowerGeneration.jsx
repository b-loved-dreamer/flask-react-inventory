import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router-dom'
import useRunBlocking from '../../hooks/useRunBlocking'

import { API, jsonHeader } from '../../utils/requests'
import { capitalizeWords } from '../../utils/string'
import { requiredErrorMsg, setValueAsInt, validateNonNegative } from '../../utils/validation'

import Dropdown from '../../components/Dropdown'
import InputLabel from '../../components/InputLabel'

const powerGenerationTypeValues = [
  'solar-electric',
  'wind',
]

export default function AddPowerGeneration() {
  const navigate = useNavigate()
  const { runBlocking, unblock } = useRunBlocking()
  const form = useForm(/* { mode: 'onBlur' } */)
  const [householdState, setHouseholdState] = useOutletContext()

  const handleSkip = runBlocking(async () => {
    navigate('/enter-info/done', { replace: true })
    unblock()
  })

  const submitHandler = runBlocking(async (data) => {
    const formattedData = {
      ...data,
      email: householdState.email,
      order_entered: householdState.powergenID,
      storage_kWh: data.storage_kWh ?? null,
    }

    try {
      const res = await fetch(`${API}create_power_generator`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify(formattedData),
      })

      if (res.status === 201) {
        setHouseholdState((prevState) => ({
          ...prevState,
          powergenID: prevState.powergenID + 1,
        }))
        navigate('/enter-info/power-generation-listing', { replace: true })
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
      <div className="page-name">Add power generator</div>
      <form onSubmit={form.handleSubmit(submitHandler)} noValidate>
        <InputLabel
          label="Type"
          formName="power_generation_type"
          form={form}
        >
          <Dropdown
            values={powerGenerationTypeValues}
            display={capitalizeWords}
            formName="power_generation_type"
            form={form}
          />
        </InputLabel>

        <InputLabel
          label="Monthly kWh"
          formName="monthly_kWh"
          form={form}
          hasError
        >
          <input
            type="text"
            {...form.register('monthly_kWh', {
              required: requiredErrorMsg,
              setValueAs: setValueAsInt,
              validate: {
                nonNegative: validateNonNegative,
              },
            })}
          />
        </InputLabel>

        <InputLabel
          label="Storage kWh"
          formName="storage_kWh"
          form={form}
          hasError
        >
          <input
            type="text"
            {...form.register('storage_kWh', {
              setValueAs: setValueAsInt,
              validate: {
                nonNegative: (num) => num === null || validateNonNegative(num),
              },
            })}
          />
        </InputLabel>

        {!householdState.isOffTheGrid
          ? (
            <div className="align-right margin-top">
              <button type="button" onClick={handleSkip}>Skip</button>
            </div>
          ) : null}
        <div className="align-right margin-top">
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  )
}
