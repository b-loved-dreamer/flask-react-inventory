import React from 'react'
import { ErrorMessage as HookFormErrorMessage } from '@hookform/error-message'

export default function ErrorMessage(props) {
  return <span className="error-message"><HookFormErrorMessage {...props} /></span>
}
