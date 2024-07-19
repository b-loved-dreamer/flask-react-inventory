import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import useRunBlocking from '../../hooks/useRunBlocking'
import { API, jsonHeader } from '../../utils/requests'

import InputLabel from '../../components/InputLabel'
import SimpleTable from '../../components/SimpleTable'
import Dropdown from '../../components/Dropdown'

import {
  requiredErrorMsg, regexPostalCode, setValueAsInt, validateNonNegative,
} from '../../utils/validation'

const columns = [
  { Header: 'Number of household', accessor: 'household_count' },
  { Header: 'Number of house type', accessor: 'house_type_count' },
  { Header: 'Number of apartment type', accessor: 'apartment_type_count' },
  { Header: 'Number of townhome type', accessor: 'townhome_type_count' },
  { Header: 'Number of condominium type', accessor: 'condominium_type_count' },
  { Header: 'Number of mobile home type', accessor: 'mobile_home_type_count' },
  { Header: 'Average square footage', accessor: 'avg_square_footage' },
  { Header: 'Average thermostat heating', accessor: 'avg_thermostat_heating' },
  { Header: 'Average thermostat cooling', accessor: 'avg_thermostat_cooling' },
  { Header: 'Public utilities used', accessor: 'public_utilities_used' },
  { Header: 'Number of off-the-grid households', accessor: 'off_the_grid_count' },
  { Header: 'Number of households with power generation', accessor: 'homes_with_pg' },
  { Header: 'Most common power generation', accessor: 'most_common_pg' },
  { Header: 'Average monthly kWh', accessor: 'avg_monthly_kWh' },
  { Header: 'Number of households with battery storage', accessor: 'homes_with_battery' },
]

export default function HouseholdAverage() {
  const { runBlocking, unblock } = useRunBlocking()
  const [searchStrings, setSearchStrings] = useState([])
  const [searchData, setSearchData] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()

  const submitHandler = runBlocking(async (data) => {
    try {
      const res = await fetch(`${API}valid_postal_code`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify({ postal_code: data.postal_code }),
      })

      if (res.status === 200) {
        const json = await res.json()

        if (!json.postal_code) {
          form.setError('postal_code', {
            type: 'DNE',
            message: 'This postal code is not valid.',
          })
        } else {
          const formattedData = {
            postal_code: data.postal_code,
            radius: data.radius,
          }

          setIsLoading(true)
          const resData = await fetch(`${API}household_averages_by_radius`, {
            method: 'POST',
            headers: jsonHeader,
            body: JSON.stringify(formattedData),
          })
          const jsonData = await resData.json()

          setSearchData(jsonData.result)
          setSearchStrings({
            postal_code: form.getValues('postal_code'),
            radius: form.getValues('radius'),
          })
        }
      }
    } catch (err) {
      alert(`${err.message} \n\nTry again.`)
    }

    setIsLoading(false)
    unblock()
  })

  function renderTable() {
    if (isLoading) {
      return <div>Loading...</div>
    }

    if (searchData === undefined) {
      return null
    }

    if (searchData[0].household_count === 0) {
      return <div>No data exists for this search.</div>
    }

    return (
      <div>
        <div>
          <span className="page-name">Postal code: </span>
          <span>{searchStrings.postal_code}</span>
        </div>
        <div>
          <span className="page-name">Radius: </span>
          <span>{searchStrings.radius}</span>
        </div>
        <SimpleTable columns={columns} data={searchData} style={{ minWidth: '500px' }} />
      </div>
    )
  }

  return (
    <div>
      <h1>Household averages by radius</h1>
      <form onSubmit={form.handleSubmit(submitHandler)} noValidate>
        <div
          className="input-box"
          style={{
            width: 'fit-content', margin: 0, padding: 0,
          }}
        >
          <InputLabel
            label="5-digits postal code"
            formName="postal_code"
            form={form}
            hasError
            style={{
              width: 'fit-content', border: 'none', marginBottom: 0, paddingBottom: 0,
            }}
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
          label="Radius"
          formName="radius"
          form={form}
          style={{
            width: 'fit-content', border: 'none', marginBottom: 0,
          }}
          >
            <Dropdown
              formName="radius"
              values={[0, 5, 10, 25, 50, 100, 250]}
              form={form}
            />
          </InputLabel>

          <div className="align-right" style={{ padding: '0 0.5em 0.5em 0' }}>
            <button type="submit">Submit</button>
          </div>
        </div>
      </form>
      {renderTable()}

    </div>
  )
}
