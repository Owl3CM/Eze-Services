import React from 'react'
import StateBuilder from '../kit/StateBuilder'

const ServiceContainer = ({ children, ...props }) => {
  const service = {}
  return (
    <>
      {children}
      <StateBuilder service={service} />
    </>
  )
}

export default ServiceContainer
