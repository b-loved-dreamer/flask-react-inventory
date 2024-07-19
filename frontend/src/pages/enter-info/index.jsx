import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function EnterInfo() {
  const [householdState, setHouseholdState] = useState({
    email: '', isOffTheGrid: undefined, applianceID: 1, powergenID: 1,
  })

  return (
    <div>
      <Outlet context={[householdState, setHouseholdState]} />
    </div>
  )
}

export { default as AddAppliance } from './AddAppliance'
export { default as AddHousehold } from './AddHousehold'
export { default as AddPowerGeneration } from './AddPowerGeneration'
export { default as ApplianceListing } from './ApplianceListing'
export { default as PowerGenerationListing } from './PowerGenerationListing'
export { default as Done } from './Done'
