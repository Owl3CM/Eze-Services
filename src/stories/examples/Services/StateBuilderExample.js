import React from 'react'
import { StateBuilder, StateKit } from '../Lib'

const states = [
  'loading',
  'error',
  'success',
  'info',
  'noContent',
  'searching',
  'service',
  'lol'
]

const customKit = {
  loading: ({ title = 'tII' }) => {
    return (
      <div>
        <p>Hi From Outside</p>
      </div>
    )
  }
}

const StateBuilderExample = () => {
  const service = {}
  const statesKes = [...Object.keys(StateKit), ...Object.keys(customKit)]
  return (
    <div>
      <div className='grid'>
        {statesKes.map((state, i) => {
          return (
            <p
              key={i}
              className='button'
              onClick={() => {
                const parentId = `${state}-holder`
                if (state === 'loading' || state === 'noContent')
                  service.setState?.({ state })
                service.setState?.({ state, parentId })
              }}
            >
              state: {state}
            </p>
          )
        })}
      </div>
      <StateBuilder
        service={service}
        // lol={() => {
        //   return <div>Am lol</div>
        // }}
        {...customKit}
      />
      <div className='grid'>
        <div
          id='loading-holder'
          className='bg-prim '
          style={{ minHeight: 100 }}
        >
          <p>wating for state</p>
        </div>
        <div
          id='searching-holder'
          className='bg-prim '
          style={{ minHeight: 100 }}
        >
          <p>wating for state</p>
        </div>
        <div
          id='processing-holder'
          className='bg-prim '
          style={{ minHeight: 100 }}
        >
          <p>wating for state</p>
        </div>
        <div id='info-holder' className='bg-prim ' style={{ minHeight: 100 }}>
          <p>wating for state</p>
        </div>
        <div
          id='noContent-holder'
          className='bg-prim '
          style={{ minHeight: 100 }}
        >
          <p>wating for state</p>
        </div>
        <div id='error-holder' className='bg-prim ' style={{ minHeight: 100 }}>
          <p>wating for state</p>
        </div>
      </div>
    </div>
  )
}

export default StateBuilderExample
