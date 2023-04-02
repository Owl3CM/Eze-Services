import React from 'react'
import TimedCallback from '../utils/TimedCallback'
import PageStateKit from '../PageStateKit/PageStateKit'
import ServiceStateBuilder from '../PageStateKit/ServiceStateBuilder'
import Refresher from './Refresher'
const postions = {}
const PagenatedScroller = ({
  service,
  children,
  loadinBuilder = PageStateKit.loading,
  emptyBuilder,
  errorBuilder,
  loadingMoreBuilder
}) => {
  service.scrollerId = window.location.pathname.replace(/\//g, '')
  return (
    <Refresher
      onScroll={({ target }) => {
        if (
          service.canFetch &&
          target.scrollHeight - target.scrollTop < target.clientHeight + 400
        ) {
          service.canFetch = false
          service.loadMore()
        }
        postions[service.scrollerId] = target.scrollTop
      }}
      refrence={(ref) => {
        if (!ref) return
        const top = postions[service.scrollerId]
        top && ref.scrollTo({ top, left: 0, behavior: 'auto' })
      }}
      service={service}
      className='local-wrapper scroller'
      id={service.scrollerId}
      onRefresh={service.useCash ? service.reload : null}
    >
      {/* <TestService service={service} /> */}
      {children}
      <ServiceStateBuilder service={service} />
    </Refresher>
  )
}

export default React.memo(PagenatedScroller)

const TestService = ({ service }) => {
  return (
    <>
      <div className='row gap-2x'>
        <input
          onChange={({ target }) => {
            TimedCallback.create({
              id: 'queryinput',
              callback: () => {
                service.updateQueryParams({
                  key: 'queryinput',
                  value: target.value
                })
              },
              timeout: 1000,
              onRepated: () => {
                console.log('repated')
              }
            })
          }}
        />

        {Object.keys(PageStateKit).map((stateName, i) => (
          <p
            onClick={() => {
              service.setState(stateName)
            }}
            key={i}
            className='button'
          >
            {stateName}
          </p>
        ))}
      </div>

      <div className='row-center gap-l p-l'>
        <p className='text-red'>!! Change Here Then Submit </p>
        <input
          type='text'
          onKeyDown={(e) =>
            e.key === 'Enter' &&
            service.updateQueryParams({ key: 'name', value: e.target.value })
          }
        />
      </div>
    </>
  )
}
