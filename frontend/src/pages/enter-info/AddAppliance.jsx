import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router-dom'
import useFetchWithRetry from '../../hooks/useFetchWithRetry'
import useRunBlocking from '../../hooks/useRunBlocking'

import { addSpaceBeteweenCapitalized } from '../../utils/string'
import { requiredErrorMsg, setValueAsInt, validateNonNegative } from '../../utils/validation'
import { API, jsonHeader } from '../../utils/requests'

import AirHandlerInput from '../../components/AirHandlerInputs'
import Dropdown from '../../components/Dropdown'
import InputLabel from '../../components/InputLabel'
import WaterHeaterInput from '../../components/WaterHeaterInput'

const applianceTypeValues = [
  'AirHandler',
  'WaterHeater',
]

export default function AddAppliance() {
  const navigate = useNavigate()
  const { runBlocking, unblock } = useRunBlocking()
  const form = useForm({
    // mode: 'onBlur',
    defaultValues: { methods: [] },
  })
  const [householdState, setHouseholdState] = useOutletContext()
  const [manufacturersData, isLoadingManufacturers] = useFetchWithRetry(
    `${API}list_manufacturers`,
    { methods: 'GET' },
    2000,
  )

  const applianceType = form.watch('appliance_type')

  const submitHandler = runBlocking(async (data) => {
    const formattedData = {
      ...data,
      email: householdState.email,
      order_entered: householdState.applianceID,
      model_name: data.model_name.trim() === '' ? null : data.model_name,
      current_temperature_setting:
        data.appliance_type === 'WaterHeater'
          ? (data.current_temperature_setting ?? null)
          : undefined,
    }

    try {
      const res = await fetch(`${API}create_appliance`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify(formattedData),
      })

      if (res.status === 201) {
        setHouseholdState((prevState) => ({
          ...prevState,
          applianceID: prevState.applianceID + 1,
        }))
        navigate('/enter-info/appliance-listing', { replace: true })
      } else {
        throw Error(`${res.status} ${res.statusText}`)
      }
    } catch (err) {
      alert(`${err.message} \n\nTry again.`)
    }

    unblock()
  })

  if (isLoadingManufacturers) {
    return <div>Loading...</div>
  }

  return (
    <div className="input-page-size">
      <div className="page-name">Add appliance</div>
      <form onSubmit={form.handleSubmit(submitHandler)} noValidate>

        <InputLabel
          label="Appliance type"
          formName="appliance_type"
          form={form}
        >
          <Dropdown
            values={applianceTypeValues}
            display={addSpaceBeteweenCapitalized}
            formName="appliance_type"
            form={form}
          />
        </InputLabel>

        <InputLabel
          label="Manufacturer"
          formName="manufacturer_name"
          form={form}
        >
          <Dropdown
            formName="manufacturer_name"
            values={manufacturersData.result}
            form={form}
          />
        </InputLabel>

        <InputLabel
          label="Model name"
          formName="model_name"
          form={form}
        >
          <input type="text" {...form.register('model_name')} />
        </InputLabel>

        <InputLabel
          label="BTU rating"
          formName="btu_rating"
          form={form}
          hasError
        >
          <input
            type="text"
            {...form.register('btu_rating', {
              required: requiredErrorMsg,
              setValueAs: setValueAsInt,
              validate: {
                nonNegative: validateNonNegative,
              },
            })}
          />
        </InputLabel>

        {applianceType === 'WaterHeater'
          ? (<WaterHeaterInput form={form} />)
          : (<AirHandlerInput form={form} />)}

        <div className="align-right margin-top">
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  )
}
