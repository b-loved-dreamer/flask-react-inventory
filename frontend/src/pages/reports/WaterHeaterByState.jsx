import React, { useEffect, useMemo, useState, useRef } from 'react';
import useRunBlocking from '../../hooks/useRunBlocking';
import useFetchWithRetry from '../../hooks/useFetchWithRetry';
import { API, jsonHeader } from '../../utils/requests';
import WaterHeaterDrilldownTable from '../../components/WaterHeaterDrilldownTable';

const columns = [
  {
    Header: 'State',
    accessor: 'state',
  },
  {
    Header: 'Water Heater Count',
    accessor: 'water_heater_count',
  },
  {
    Header: 'Avg Capacity',
    accessor: 'avg_water_heater_capacity',
  },
  {
    Header: 'Avg BTUs',
    accessor: 'avg_water_heater_btu',
  },
  {
    Header: 'Avg Temp Setting',
    accessor: 'avg_temperature_setting',
  },
  {
    Header: 'Set Temp Count',
    accessor: 'provided_ts_count',
  },
  {
    Header: 'No Temp Count',
    accessor: 'not_provided_ts_count',
  },
];

const energySources = ['electric', 'gas', 'thermosolar', 'heat pump'];


export default function WaterHeaterByState() {
  const { runBlocking, unblock } = useRunBlocking();
  const [waterHeaterData, isLoading, refetch] = useFetchWithRetry(
    `${API}water_heater_statistics_by_states`,
    {
      method: 'GET',
      headers: jsonHeader,
    },
    2000
  );

  let [parentTableSortedData, setParentTableSortedData] = useState([]);
  const [drilldownTableSortedData, setDrilldownTableSortedData] = useState([]);
  
  

  useEffect(() => {
    if (waterHeaterData && waterHeaterData.result) {
      const parentData = waterHeaterData.result.map((stateData) => {
        const {
          state,
          water_heater_count,
          avg_water_heater_capacity,
          avg_water_heater_btu,
          avg_temperature_setting,
          provided_ts_count,
          not_provided_ts_count,
        } = stateData;
        return {
          state,
          water_heater_count,
          avg_water_heater_capacity,
          avg_water_heater_btu,
          avg_temperature_setting,
          provided_ts_count,
          not_provided_ts_count,
        };
      });
  
      setParentTableSortedData(
        parentData.sort((a, b) => a.state.localeCompare(b.state))
      );
    }
  }, [waterHeaterData]);

  const drilldownTableDataRef = useRef([]);
  const [selectedState, setSelectedState] = useState(null);
  
  const handleDrilldown = runBlocking(async (record) => {
    const { state } = record;
    try {
      const res = await fetch(`${API}water_heater_statistics_drilldown`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify({ "state": state }),
      });

      if (res.status === 201) {
        refetch();
      }

      const data = await res.json();

      drilldownTableDataRef.current = data.result.flatMap((energySourceData) => {
        const { energy_source } = energySourceData;
        const trimmedEnergySource = energy_source.trim();
        return energySources.includes(trimmedEnergySource) ? {
          state: state,
          energy_source: trimmedEnergySource,
          min_wh_capacity: energySourceData.min_wh_capacity,
          avg_wh_capacity: energySourceData.avg_wh_capacity,
          max_wh_capacity: energySourceData.max_wh_capacity,
          min_temperature_setting: energySourceData.min_temperature_setting,
          avg_temperature_setting: energySourceData.avg_temperature_setting,
          max_temperature_setting: energySourceData.max_temperature_setting
        } : null;
      }).filter((d) => d !== null);
      
      
      if (res.status === 201) {
        refetch();
      }
      setSelectedState(record.state); 
      
      setDrilldownTableSortedData(
        drilldownTableDataRef.current.sort((a, b) =>
          a.energy_source.localeCompare(b.energy_source) || a.state.localeCompare(b.state)
        )
      );  // update drilldownTableSortedData
    } catch (err) {
      alert(err.message);
    }
  
    unblock();
  });
  
  const drilldownTableColumns = useMemo(() => {
    return [
      {
        Header: 'Energy Source',
        accessor: 'energy_source',
      },
      {
        Header: 'Min Capacity',
        accessor: 'min_wh_capacity',
      },
      {
        Header: 'Avg Capacity',
        accessor: 'avg_wh_capacity',
      },
      {
        Header: 'Max Capacity',
        accessor: 'max_wh_capacity',
      },
      {
        Header: 'Min Temp Setting',
        accessor: 'min_temperature_setting',
      },
      {
        Header: 'Avg Temp Setting',
        accessor: 'avg_temperature_setting',
      },
      {
        Header: 'Max Temp Setting',
        accessor: 'max_temperature_setting',
      },
    ];
  }, []);

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Water Heater Statistics By State</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <WaterHeaterDrilldownTable
            data={parentTableSortedData}
            columns={columns}
            onRowClick={handleDrilldown}
          />
          {drilldownTableSortedData.length > 0 && selectedState ? (
        <div>
          <h2>{selectedState}</h2>
            <WaterHeaterDrilldownTable
            data={drilldownTableSortedData}
            columns={drilldownTableColumns}
            onRowClick={() => {}}
            hideState={true}
            />
          </div>
          ) : selectedState ? (
          <div>
          <h2>{selectedState}</h2>
        <p>No data exists for this state.</p>
        </div>
          ) : null}

        </div>
      )}
    </div>
  );  
}

