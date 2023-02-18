import React from 'react'
const postions = {}

/**
 * @param {Object} props
 * @param {Object} props.service
 * @param {Function} props.onRefresh
 * @param {Boolean} props.useRefresh
 * @param {String} props.className
 * @param {ReactNode} props.children
 * @param {String} props.id
 * <PaginatedContainer service={service} onRefresh={service.reload} useRefresh >
 * {children}
 * </PaginatedContainer>
 */
const PaginatedContainer = ({
  service,
  onRefresh,
  useRefresh,
  className,
  children,
  id
}) => {
  return (
    <PaginatedContainerClass
      {...{ service, onRefresh, useRefresh, className, children, id }}
    />
  )
}
export default PaginatedContainer

class PaginatedContainerClass extends React.Component {
  constructor(props) {
    super(props)
    this.id = window.location.pathname.replace(/\//g, '')
    this.refresh = props.useRefresh
      ? props.onRefresh || props.service.reload
      : props.onRefresh
  }
  componentDidMount() {
    this.container = document.getElementById(this.id)
    const top = postions[this.id]
    top && this.container.scrollTo({ top, left: 0, behavior: 'auto' })
    console.log('this.refresh', this.refresh)
    if (this.refresh) {
      pullToRefreshEvent(this.container, this.props.service, this.refresh)
    }
  }
  render() {
    const { service, children, className = 'wrapper scroller' } = this.props
    return (
      <div
        id={this.id}
        className={className}
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
      >
        {this.refresh && (
          <div id='refresher'>
            <svg className='refresher-svg' viewBox='0 0 512 512'>
              <path
                fill='#A5EB78'
                d='M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z'
              />
              <path
                className='fill-throne'
                d='M256,431.967c-97.03,0-175.967-78.939-175.967-175.967c0-28.668,7.013-56.655,20.156-81.677l-25.144-16.639l107.282-54.228l-7.974,119.943l-26.111-17.279c-7.203,15.517-11.041,32.51-11.041,49.879c0,65.507,53.294,118.801,118.801,118.801s118.801-53.294,118.801-118.801s-53.295-118.8-118.802-118.8V80.033c97.028,0,175.967,78.938,175.967,175.967S353.028,431.967,256,431.967z'
              />
            </svg>
          </div>
        )}
        {children}
        {/* <ServiceStateBuilder service={service} /> */}
      </div>
    )
  }
}

const pullToRefreshEvent = (container, service, refresh) => {
  console.log({ container })
  let reloader = container.firstChild

  reloader.remove = () => {
    reloader.style = ''
    reloader.className = 'reloading disappearing'
    setTimeout(() => {
      reloader.className = 'disappearing'
    }, 1000)
  }
  reloader.remove()

  let diff = 0
  if (!container) return

  const onSwipeDown = (e) => {
    diff = e.touches[0].clientY - service.startY
    console.log({ diff })
    if (diff > 20) {
      if (diff > 200) diff = 200
      let diffPersent = diff / 100
      let offset = (1 - diffPersent) * reloader.offsetHeight
      let rotateAngle = 720 - diffPersent * 360
      reloader.style.marginTop = -offset + 'px'
      reloader.style.opacity = diffPersent
      reloader.style.rotate = `${rotateAngle}deg`
    }
  }

  const touchEnd = () => {
    container.removeEventListener('touchend', touchEnd, { passive: true })
    container.removeEventListener('touchmove', onSwipeDown, { passive: true })

    if (diff < 100) {
      reloader?.remove()
      service.pulling = false
      return
    }
    reloader.className = 'reloading'
    setTimeout(async () => {
      await refresh()
      reloader?.remove()
      service.pulling = false
    }, 200)
  }

  setTimeout(() => {
    if (container.childElementCount > 1) {
      container.insertBefore(reloader, container.childNodes[1])
    } else container.insertBefore(reloader, container.firstChild)
  }, 300)

  container.addEventListener('touchstart', (e) => {
    console.log({
      scrollTop: container.scrollTop,
      pulling: service.pulling,
      state: service.state
    })
    if (container.scrollTop > 5 || service.pulling || service.state !== 'none')
      return
    console.log('start')
    service.pulling = true
    reloader.style.opacity = '0'
    reloader.style.marginTop = '-80px'
    reloader.className = 'pulling'
    diff = 0

    container.addEventListener('touchmove', onSwipeDown, { passive: true })
    container.addEventListener('touchend', touchEnd, { passive: true })
    service.startY = e.touches[0].clientY
  })
}
