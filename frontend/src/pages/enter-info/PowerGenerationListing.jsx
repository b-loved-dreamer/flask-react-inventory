import React, { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import useRunBlocking from '../../hooks/useRunBlocking'
import useFetchWithRetry from '../../hooks/useFetchWithRetry'
import { API, jsonHeader } from '../../utils/requests'
import ListingTable from '../../components/ListingTable'

const columns = [
  {
    Header: 'Num',
    accessor: 'order_entered',
  },
  {
    Header: 'Type',
    accessor: 'power_generation_type',
  },
  {
    Header: 'Monthly kWh',
    accessor: 'monthly_kWh',
  },
  {
    Header: 'Storage kWh',
    accessor: 'storage_kWh',
  },
]

export default function PowerGenerationListing() {
  const navigate = useNavigate()
  const { runBlocking, unblock } = useRunBlocking()
  const [householdState] = useOutletContext()
  const [nextError, setNextError] = useState(false)
  const [powergenData, isLoading, refetch] = useFetchWithRetry(
    `${API}list_power_generators`,
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
      const res = await fetch(`${API}delete_power_generator`, {
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
    navigate('/enter-info/add-power-generation', { replace: true })
    unblock()
  })

  const handleNext = runBlocking(() => {
    if (powergenData.result.length === 0 && householdState.isOffTheGrid) {
      setNextError(true)
    } else {
      navigate('/enter-info/done')
    }

    unblock()
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="input-page-size">
      <div className="page-name">Power generation listing</div>
      {nextError ? <div className="next-error-message">You must have at least one power generator to continue.</div> : null}
      <div className="align-right">
        {powergenData.result === undefined ? null : (
          <ListingTable
            columns={columns}
            data={powergenData.result}
            handleDelete={handleDelete}
          />
        )}
        <div className="margin-bottom">
          <button className="link-button" type="button" onClick={handleAddAnother}>+ Add another power generator</button>
        </div>
        <button type="button" onClick={handleNext}>Next</button>
      </div>
    </div>
  )
}
