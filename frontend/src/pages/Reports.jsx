import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function Reports() {
  return (
    <div>
      <div className="page-name">List of Reports</div>
      <div>
        <Link to="/reports/topmanufacturers">Top 25 popular manufacturers</Link>
      </div>
      <div>
        <Link to="/reports/manufacturer-model-search">Manufacturer/model search</Link>
      </div>
      <div>
        <Link to="/reports/heat_cool_method">Heating/cooling method details</Link>
      </div>
      <div>
        <Link to="/reports/waterheater_state">Water heater statistics by state</Link>
      </div>
      <div>
        <Link to="/reports/offgrid_household">Off-the-grid household dashboard</Link>
      </div>
      <div>
        <Link to="/reports/household_average">Household averages by radius</Link>
      </div>
      <div>
        <Link to="/">Return to main menu</Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
