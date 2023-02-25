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

const loading = Dynimc({ title: 'Loading', type: 'loading' })
const error = Dynimc({ title: 'Error', type: 'error' })
const success = Dynimc({ title: 'Success', type: 'success' })
const info = Dynimc({ title: 'Info', type: 'info' })
const searching = Dynimc({ title: 'Searching', type: 'searching' })
const processing = Dynimc({ title: 'Processing', type: 'processing' })
const noContent = Dynimc({ title: 'No Content', type: 'noContent' })

const StateKit = {
  loading,
  error,
  success,
  info,
  searching,
  processing,
  noContent
}

export default StateKit
