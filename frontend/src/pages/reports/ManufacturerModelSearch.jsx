import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import useRunBlocking from '../../hooks/useRunBlocking'
import InputLabel from '../../components/InputLabel'
import { requiredErrorMsg } from '../../utils/validation'
import { API, jsonHeader } from '../../utils/requests'
import HighlightTable from '../../components/HighlightTable'

const columns = [
  {
    Header: 'Manufacturer',
    accessor: 'manufacturer_name',
  },
  {
    Header: 'Model',
    accessor: 'model_name',
  },
]

export default function ManufacturerModelSearch() {
  const { runBlocking, unblock } = useRunBlocking()
  const [searchString, setSearchString] = useState()
  const [searchData, setSearchData] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm()

  const submitHandler = runBlocking(async (data) => {
    const formattedData = {
      search_string: data.search_string,
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${API}manufacturer_model_search`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify(formattedData),
      })

      if (res.status === 200) {
        const json = await res.json()

        setSearchData(json)
        setSearchString(form.getValues('search_string'))
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

    if (searchData.result.length === 0) {
      return <div>No data exists for this search.</div>
    }

    return (
      <div>
        <div>
          <span className="page-name">Search string: </span>
          <span>{searchString}</span>
        </div>
        <HighlightTable
          columns={columns}
          data={searchData.result}
          searchString={searchString}
          minWidth="500px"
        />
      </div>
    )
  }

  return (
    <div>
      <h1>Manufacturer / Model Search</h1>
      <form onSubmit={form.handleSubmit(submitHandler)} noValidate>
        <InputLabel
          label="Search string"
          formName="search_string"
          form={form}
          style={{
            width: 'fit-content',
          }}
        >
          <input
            type="text"
            {...form.register('search_string', {
              required: requiredErrorMsg,
            })}
          />
          <button style={{ margin: '0 0.3em 0 1em' }} type="submit">Submit</button>
        </InputLabel>
      </form>
      {renderTable()}
    </div>
  )
}
