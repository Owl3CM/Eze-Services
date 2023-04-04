import React from "react";
import ServiceStateBuilder from "../../stateKit/ServiceStateBuilder";
const postions = {};

const defaultRefresherProps = {
  id: "refresher",
  reloadingClass: "reloading",
  disappearingClass: "disappearing",
  pullingClass: "pulling",
  onPull: ({ diff, diffPercentage, refresher }) => {
    let rotateAngle = 720 - diffPercentage * 360;
    refresher.style.transform = `rotate(${rotateAngle}deg)`;
  },
};

export class PaginatedContainer extends React.Component {
  constructor(props) {
    super(props);
    this.id = window.location.pathname.replace(/\//g, "");
    this.refresh = props.useRefresh ? props.onRefresh || props.service.reload : props.onRefresh;
  }
  refresherProps = defaultRefresherProps;
  componentDidMount() {
    this.container = document.getElementById(this.id);
    const top = postions[this.id];
    console.log({ postions }, { id: this.id });
    top && this.container.scrollTo({ top, left: 0, behavior: "auto" });
    if (this.refresh) {
      Object.entries(this.props.refresherProps).forEach(([key, value]) => {
        this.refresherProps[key] = value;
      });
      pullToRefreshEvent(this.container, this.props.service, this.refresh, this.refresherProps);
    }
  }
  render() {
    const { service, children, className = "local-wrapper scroller", addStateBuilder = true } = this.props;
    return (
      <div
        id={this.id}
        className={className}
        onScroll={({ target }) => {
          if (service.canFetch && target.scrollHeight - target.scrollTop < target.clientHeight + 400) {
            service.canFetch = false;
            service.loadMore();
          }
          postions[service.scrollerId] = target.scrollTop;
        }}>
        {children}
        {this.refresh && <div id="refresher">{this.props.refresher}</div>}
        {addStateBuilder && <ServiceStateBuilder service={service} />}
      </div>
    );
  }
}

const pullToRefreshEvent = (container, service, refresh, refresherProps) => {
  if (!container) return;
  let reloader = container.querySelector("#refresher");
  reloader.remove = () => {
    let defaultClass = `${refresherProps.reloadingClass} ${refresherProps.disappearingClass}`;
    reloader.style = "";
    reloader.className = defaultClass;
    setTimeout(() => {
      reloader.className === defaultClass && (reloader.className = refresherProps.disappearingClass);
    }, 1000);
  };
  reloader.remove();

  let diff = 0;
  const onSwipeDown = (e) => {
    diff = e.touches[0].clientY - service.startY;
    if (diff > 20) {
      if (diff > 200) diff = 200;
      let diffPercentage = diff / 100;
      let offset = (1 - diffPercentage) * reloader.offsetHeight;
      reloader.style.marginTop = -offset + "px";
      reloader.style.opacity = diffPercentage;
      refresherProps.onPull({ diff, diffPercentage, refresher: reloader });
    }
  };

  const touchEnd = () => {
    container.removeEventListener("touchend", touchEnd, { passive: true });
    container.removeEventListener("touchmove", onSwipeDown, { passive: true });

    if (diff < 100) {
      reloader?.remove();
      service.pulling = false;
      return;
    }
    reloader.className = refresherProps.reloadingClass;
    setTimeout(async () => {
      await refresh();
      reloader?.remove();
      service.pulling = false;
    }, 200);
  };

  setTimeout(() => {
    if (container.childElementCount > 1) {
      container.insertBefore(reloader, container.childNodes[1]);
    } else container.insertBefore(reloader, container.firstChild);
  }, 300);

  container.addEventListener("touchstart", (e) => {
    if (container.scrollTop > 5 || service.pulling || service.state !== "none") return;
    service.pulling = true;
    reloader.style.opacity = "0";
    reloader.style.marginTop = "-80px";
    reloader.className = refresherProps.pullingClass;
    diff = 0;

    container.addEventListener("touchmove", onSwipeDown, { passive: true });
    container.addEventListener("touchend", touchEnd, { passive: true });
    service.startY = e.touches[0].clientY;
  });
};
