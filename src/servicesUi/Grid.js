import React from 'react'
const Grid = ({ service, ItemBuilder, className = 'local-grid', onClick }) => {
  ;[service.items, service.setItems] = React.useState(service.items)
  service.setItem = React.useMemo(
    () => (item) =>
      service.setItems((items) =>
        items.map((i) => (i.id === item.id ? item : i))
      ),
    []
  )
  return (
    <div id='grid-container' className={className} onClick={onClick}>
      {service.items.map((item, i) => (
        <ItemBuilder key={i} item={item} />
      ))}
    </div>
  )
}
export default Grid
