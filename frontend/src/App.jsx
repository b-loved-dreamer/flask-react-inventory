import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import MainMenu from './pages/MainMenu'
import EnterInfo, {
  AddHousehold, AddAppliance, ApplianceListing, AddPowerGeneration, PowerGenerationListing, Done,
} from './pages/enter-info'
import Reports from './pages/Reports'

import TopManufacturers from './pages/reports/TopManufacturers'
import ManufacturerModelSearch from './pages/reports/ManufacturerModelSearch'
import HeatingCoolingMethod from './pages/reports/HeatingCoolingMethod'
import WaterHeaterByState from './pages/reports/WaterHeaterByState'
import OffGridHousehold from './pages/reports/OffGridHousehold'
import HouseholdAverage from './pages/reports/HouseholdAverage'

import './app.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<MainMenu />} />
        <Route path="enter-info" element={<EnterInfo />}>
          <Route path="add-household" element={<AddHousehold />} />
          <Route path="add-appliance" element={<AddAppliance />} />
          <Route path="appliance-listing" element={<ApplianceListing />} />
          <Route path="add-power-generation" element={<AddPowerGeneration />} />
          <Route
            path="power-generation-listing"
            element={<PowerGenerationListing />}
          />
          <Route
            path="done"
            element={<Done />}
          />
        </Route>
        <Route path="reports" element={<Reports />}>
          <Route path="topmanufacturers" element={<TopManufacturers />} />
          <Route path="manufacturer-model-search" element={<ManufacturerModelSearch />} />
          <Route path="heat_cool_method" element={<HeatingCoolingMethod />} />
          <Route path="waterheater_state" element={<WaterHeaterByState />} />
          <Route path="offgrid_household" element={<OffGridHousehold />} />
          <Route path="household_average" element={<HouseholdAverage />} />
        </Route>

      </Routes>
    </Router>
  )
}
