import React from 'react'
const Dynimc = ({ service, title, type }) => {
  return () => {
    return (
      <div>
        <p>{title}</p>
        <p>{type}</p>
      </div>
    )
  }
}

const error = Dynimc({ title: 'Error', type: 'error' })
const success = Dynimc({ title: 'Success', type: 'success' })
const info = Dynimc({ title: 'Info', type: 'info' })
const loading = Dynimc({ title: 'Searching', type: 'searching' })
const processing = Dynimc({ title: 'Processing', type: 'processing' })
const noContent = Dynimc({ title: 'No Content', type: 'noContent' })

const StateKit = {
  loading,
  error,
  success,
  info,
  processing,
  noContent
}

export default StateKit
