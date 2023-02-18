import React from 'react'
/**
 * @param {Object} service
 * @param {Function} ItemBuilder
 * @param {string} className
 * @param {Function} onClick
 * @returns {JSX.Element}
 * @example
 * <Grid service={service} ItemBuilder={ItemBuilder} className="grid" onClick={onClick} />
 *  */

const Grid = ({ service, ItemBuilder, className = 'grid', onClick }) => {
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
