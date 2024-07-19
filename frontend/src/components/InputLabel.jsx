import React from 'react'
import ErrorMessage from './ErrorMessage'

export default function InputLabel({
  label, formName, form, hasError, disableFocus, style, children,
}) {
  return (
    <div className="input-box" style={style}>
      {!disableFocus
        ? (
          <label>
            <span>{label}</span>
            {children}
          </label>
        )

        : (
          <>
            <label>
              <span>{label}</span>
            </label>
            {children}
          </>
        )}
      {hasError ? (
        <span className="margin-left">
          <ErrorMessage
            errors={form.formState.errors}
            name={formName}
          />
        </span>
      ) : null}
    </div>
  )
}

InputLabel.defaultProps = {
  hasError: false,
}
