import { useState } from 'react'

/* Based on https://stackoverflow.com/a/60732231
 * Wrap event handlers to run only one of them at a time.
 */

export default function useRunBlocking() {
  const [called, setCalled] = useState(false)

  return {
    runBlocking: (callback) => (...args) => {
      if (!called) {
        setCalled(true)
        callback(...args)
      }
    },
    unblock: () => setCalled(false),
  }
}
