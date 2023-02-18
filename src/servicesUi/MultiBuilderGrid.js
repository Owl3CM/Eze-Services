import React from 'react'
import Grid from './Grid'

const Button = ({ onClick, title, className = 'bg-red text-white' }) => (
  <p
    className={`px-md py-sm rounded-lg pointer ${className}`}
    onClick={onClick}
  >
    {title}
  </p>
)

const MultiBuilderGrid = ({ service, builders }) => {
  ;[service.cardTemplate, service.setCardTemplate] = React.useState(
    localStorage.getItem(`${service.id}-builder`) || Object.keys(builders)[0]
  )

  return (
    <>
      <div className='row-center self-start gap-md bg-prim px-md rounded-lg py-sm mx-md'>
        <p className='text-shark'>Card Template : </p>

        {Object.keys(builders).map((card, i) => (
          <Button
            className={
              card === service.cardTemplate
                ? 'bg-cyan text-black'
                : 'bg-prince text-crow'
            }
            key={i}
            onClick={() => {
              localStorage.setItem(`${service.id}-builder`, card)
              service.setCardTemplate(card)
            }}
            title={`${card}`}
          />
        ))}
      </div>
      <Grid service={service} ItemBuilder={builders[service.cardTemplate]} />
    </>
  )
}

export default MultiBuilderGrid
