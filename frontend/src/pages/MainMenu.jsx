import React from 'react'
import { Link } from 'react-router-dom'

export default function MainMenu() {
  return (
    <div>
      <div className="page-name">Welcome to Alternakraft!</div>
      <div>Please choose what you&apos;d like to do:</div>
      <div>
        <Link replace to="/enter-info/add-household">Enter my household info</Link>
      </div>
      <div>
        <Link replace to="/reports">View reports/query data</Link>
      </div>
    </div>
  )
}
