import { useState, useEffect } from 'react'

export default function useFetchWithRetry(url, options, delay) {
  const [data, setData] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [errorChecker, setErrorChecker] = useState(false)

  const refetch = () => {
    setErrorChecker((b) => !b)
  }

  useEffect(
    () => {
      let timeoutID

      (async () => {
        try {
          const response = await fetch(url, options)
          const json = await response.json()

          setData(json)
          setIsLoading(false)
        } catch (err) {
          timeoutID = setTimeout(() => {
            setErrorChecker((b) => !b)
          }, delay)
        }
      })()

      return () => {
        clearTimeout(timeoutID)
      }
    },
    [errorChecker],
  )

  return [data, isLoading, refetch]
}
