import React, { useEffect, useMemo, useState, useRef } from 'react';
import useRunBlocking from '../../hooks/useRunBlocking';
import useFetchWithRetry from '../../hooks/useFetchWithRetry';
import { API, jsonHeader } from '../../utils/requests';
import ManufacturerDrilldownTable from '../../components/ManufacturerDrilldownTable';

const columns = [
  {
    Header: 'No.',
    id: 'row-number',
    Cell: ({ row }) => row.index + 1,
    disableSortBy: true,
  },
  {
    Header: 'Manufacturer Name',
    accessor: 'manufacturer_name',
  },
  {
    Header: 'Appliance Count',
    accessor: 'appliance_count',
  }
];

export default function TopManufacturers() {
  const { runBlocking, unblock } = useRunBlocking();
  const [manufacturerData, isLoading, refetch] = useFetchWithRetry(
    `${API}top_twenty_five_manufacturers`,
    {
      method: 'GET',
      headers: jsonHeader,
    },
    2000
  );

  let [parentTableData, setParentTableData] = useState([]);
  let [drilldownTableData, setDrilldownTableData] = useState([]);

  useEffect(() => {
    if (manufacturerData && manufacturerData.result) {
      const parentData = manufacturerData.result.map((data) => {
        const {
          manufacturer_name,
          appliance_count
        } = data;
        return {
          manufacturer_name,
          appliance_count,
        };
      });
  
      setParentTableData(parentData);
    }
  }, [manufacturerData]);

  const drilldownTableDataRef = useRef([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  
  const handleDrilldown = runBlocking(async (record) => {
    const { manufacturer_name } = record;
    try {
      const res = await fetch(`${API}manufacturer_appliance_count_by_type`, {
        method: 'POST',
        headers: jsonHeader,
        body: JSON.stringify({ "manufacturer_name": manufacturer_name.trim()}),
      });

      if (res.status === 201) {
        refetch();
      }

      const manufacturerDetailData = await res.json();

      if (manufacturerDetailData && manufacturerDetailData.result) {
        const newData = [];
        const data = manufacturerDetailData.result[0];
        newData.push({ appliance_type: 'Air Conditioner', appliance_count: data.air_conditioner_count });
        newData.push({ appliance_type: 'Heater', appliance_count: data.heater_count });
        newData.push({ appliance_type: 'Heat Pump', appliance_count: data.heat_pump_count });
        newData.push({ appliance_type: 'Water Heater', appliance_count: data.water_heater_count });
        newData.push({ appliance_type: 'Air Handler', appliance_count: data.air_handler_count });
      
        drilldownTableDataRef.current = newData;
        setDrilldownTableData(drilldownTableDataRef.current);
      }      
      
      
      if (res.status === 201) {
        refetch();
      }
      setSelectedManufacturer(record.manufacturer_name); 
      
      setDrilldownTableData(drilldownTableDataRef.current);
    } catch (err) {
      alert(err.message);
    }
  
    unblock();
  });
  
  const drilldownTableColumns = useMemo(() => {
    return [
      {
        Header: 'Appliance Type',
        accessor: 'appliance_type',
      },
      {
        Header: 'Appliance Count',
        accessor: 'appliance_count',
      },
    ];
  }, []);
  

  if (isLoading) {
    return <div>Loading...</div>
  }

return (
  <div>
    <h1>Top 25 popular manufacturers</h1>
    {isLoading ? (
      <div>Loading...</div>
    ) : (
      <div>
        <ManufacturerDrilldownTable
          data={parentTableData}
          columns={columns}
          onRowClick={handleDrilldown}
        />
        {drilldownTableData.length > 0 && selectedManufacturer ?(
          <div>
            <h2>{selectedManufacturer}</h2>
            <ManufacturerDrilldownTable
              data={drilldownTableData}
              columns={drilldownTableColumns}
              onRowClick={() => {}}
              isDrilldown = {true}
            />
          </div>
        ) : null}
      </div>
    )}
  </div>
);
}

