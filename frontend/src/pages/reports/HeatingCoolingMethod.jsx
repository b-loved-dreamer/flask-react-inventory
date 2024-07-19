import React from 'react'
import useFetchWithRetry from '../../hooks/useFetchWithRetry'
import { API } from '../../utils/requests'
import SimpleTable from '../../components/SimpleTable'

const minWidth = '500px'

const acColumns = [
  {
    Header: 'Household Type',
    accessor: 'household_type',
  },

  {
    Header: 'Count',
    accessor: 'count',
  },

  {
    Header: 'Average BTU',
    accessor: 'avg_btu',
  },

  {
    Header: 'Average EER',
    accessor: 'avg_eer',
  },

]

const hColumns = [
  {
    Header: 'Household Type',
    accessor: 'household_type',
  },

  {
    Header: 'Count',
    accessor: 'count',
  },

  {
    Header: 'Average BTU',
    accessor: 'avg_btu',
  },

  {
    Header: 'Most Common Energy Source',
    accessor: 'most_common_energy_source',
  },

]

const hpColumns = [
  {
    Header: 'Household Type',
    accessor: 'household_type',
  },

  {
    Header: 'Count',
    accessor: 'count',
  },

  {
    Header: 'Average BTU',
    accessor: 'avg_btu',
  },

  {
    Header: 'Average SEER',
    accessor: 'avg_seer',
  },

  {
    Header: 'Average HSPF',
    accessor: 'avg_hspf',
  },

]

export default function HeatingCoolingMethod() {
  const [methodData, isLoading] = useFetchWithRetry(
    `${API}heating_cooling_method`,
    {
      method: 'GET',
    },
    2000,
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Heating/Cooling Method Details</h1>
      <h2>Air Conditioner</h2>
      <SimpleTable
        columns={acColumns}
        data={methodData.heating_cooling_method_ac}
        style={{ minWidth }}
      />
      <h2>Heater</h2>
      <SimpleTable
        columns={hColumns}
        data={methodData.heating_cooling_method_heater}
        style={{ minWidth }}
      />
      <h2>Heat pump</h2>
      <SimpleTable
        columns={hpColumns}
        data={methodData.heating_cooling_method_heat_pump}
        style={{ minWidth }}
      />
    </div>

  )
}
