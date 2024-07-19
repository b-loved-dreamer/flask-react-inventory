import React from 'react'
import { API } from '../../utils/requests'
import useFetchWithRetry from '../../hooks/useFetchWithRetry'
import SimpleTable from '../../components/SimpleTable'

const minWidth = '500px'
const stateColumns = [
  {
    Header: 'State with most',
    accessor: 'state',
  },
  {
    Header: 'Number of households',
    accessor: 'household_count',
  },
]

const avgStorageColumns = [
  {
    Header: 'Average battery storage capacity (kWh)',
    accessor: 'avg_off_grid_storage_kWh',
  },
]

const pgTypeColumns = [
  {
    Header: 'Percentage with only solar-electric power generations',
    accessor: 'solar_only',
  },
  {
    Header: 'Percentage with only wind power generations',
    accessor: 'wind_only',
  },
  {
    Header: 'Percentage with mixed power generations',
    accessor: 'mixed',
  },
]

const avgWhCapacityColumns = [
  {
    Header: 'Average water heater capacity (gallons)',
    accessor: 'avg_capacity',
  },
  {
    Header: 'Type of grid',
    accessor: 'on_or_off_grid',
  },
]

const btuColumns = [
  {
    Header: 'Appliance type',
    accessor: 'appliance_type',
  },
  {
    Header: 'Average BTU',
    accessor: 'avg_btu',
  },
  {
    Header: 'Max BTU',
    accessor: 'max_btu',
  },
  {
    Header: 'Min BTU',
    accessor: 'min_btu',
  },
]

export default function OffGridHousehold() {
  const [offGridData, isLoading] = useFetchWithRetry(
    `${API}off_the_grid_household_dashboard`,
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
      <h1>Off-the-grid Dashboard</h1>

      <SimpleTable
        columns={stateColumns}
        data={offGridData.off_the_grid_dashboard_state}
        style={{ minWidth }}
      />
      <SimpleTable
        columns={avgStorageColumns}
        data={offGridData.off_the_grid_dashboard_avg_storage_capacity}
        style={{ minWidth }}
      />
      <SimpleTable
        columns={pgTypeColumns}
        data={offGridData.off_the_grid_dashboard_power_generation_type}
        style={{ minWidth }}
      />
      <SimpleTable
        columns={avgWhCapacityColumns}
        data={offGridData.off_the_grid_dashboard_on_or_off_grid}
        style={{ minWidth }}
      />
      <SimpleTable
        columns={btuColumns}
        data={offGridData.off_the_grid_dashboard_btu}
        style={{ minWidth }}
      />
    </div>
  )
}
