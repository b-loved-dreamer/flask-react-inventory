/* eslint-disable camelcase */
import React, { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import useRunBlocking from '../../hooks/useRunBlocking'

import ListingTable from '../../components/ListingTable'
import useFetchWithRetry from '../../hooks/useFetchWithRetry'
import { API, jsonHeader } from '../../utils/requests'

const columns = [
  {
    Header: 'Num',
    accessor: 'order_entered',
  },
  {
    Header: 'Type',
    accessor: 'appliance_type',
  },
  {
    Header: 'Manufacturer',
    accessor: 'manufacturer_name',
  },
  {
    Header: 'Model',
    accessor: 'model_name',
  },
]

export default function ApplianceListing() {
  const navigate = useNavigate()
  const { runBlocking, unblock } = useRunBlocking()
  const [householdState] = useOutletContext()
  const [nextError, setNextError] = useState(false)
  const [appliancesData, isLoading, refetch] = useFetchWithRetry(
    `${API}list_appliances`,
    {
      method: 'POST',
      headers: jsonHeader,
      body: JSON.stringify({ email: householdState.email }),
    },
    2000,
  )

  const handleDelete = runBlocking(async (order_entered) => {
    const formattedData = {
      email: householdState.email,
      order_entered,
    }

    try {
      const res = await fetch(`${API}delete_appliance`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify(formattedData),
      })

      if (res.status === 201) {
        refetch()
      }
    } catch (err) {
      alert(`${err.message} \n\nTry again.`)
    }

    unblock()
  })

  const handleAddAnother = runBlocking(() => {
    navigate('/enter-info/add-appliance', { replace: true })
    unblock()
  })

  const handleNext = runBlocking(() => {
    if (appliancesData.result.length === 0) {
      setNextError(true)
    } else {
      navigate('/enter-info/add-power-generation')
    }

    unblock()
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="input-page-size">
      <div className="page-name">Appliance listing</div>
      {nextError ? <div className="next-error-message">You must have at least one appliance to continue.</div> : null}
      <div className="align-right">
        {appliancesData.result === undefined ? null : (
          <ListingTable
            columns={columns}
            data={appliancesData.result}
            handleDelete={handleDelete}
          />
        )}
        <div className="margin-bottom">
          <button className="link-button" type="button" onClick={handleAddAnother}>+ Add another appliance</button>
        </div>
        <button type="button" onClick={handleNext}>Next</button>
      </div>
    </div>
  )
}
