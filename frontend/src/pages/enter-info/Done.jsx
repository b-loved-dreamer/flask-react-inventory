import React from 'react'
import { useNavigate } from 'react-router-dom'
import useRunBlocking from '../../hooks/useRunBlocking'

export default function Done() {
  const navigate = useNavigate()
  const { runBlocking, unblock } = useRunBlocking()

  const handleReturnMainMenu = runBlocking(async () => {
    navigate('/', { replace: true })
    unblock()
  })

  return (
    <div className="input-page-size">
      <div className="page-name">Submission complete!</div>
      <div>Thank you for providing your information to Alternakraft!</div>
      <button className="link-button" type="button" onClick={handleReturnMainMenu}>Return to the main menu</button>
    </div>
  )
}
