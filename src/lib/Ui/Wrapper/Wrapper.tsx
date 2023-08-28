import React from "react";
import { ServiceStateBuilder } from "../../stateKit";
import { IWrapperProps, ListenToPullProps, onPullProps } from "./types";

class Wrapper extends React.Component {
  id: string;
  container = document.createElement("div");
  reloaderProps: ReloaderProps;

  constructor(props: IWrapperProps) {
    super(props);
    this.id = `wrapper-${window.location.pathname.replace(/\//g, "")}`;
    this.reloaderProps = { ..._reloaderProps, ...props.reloaderProps };
  }
  componentDidMount() {
    this.container = document.getElementById(this.id) as HTMLDivElement;
    const { loadMore, reload, service } = this.props as IWrapperProps;

    loadMore && this.listnToScroll(loadMore);
    reload && listenToPull({ reload, container: this.container, service, reloaderProps: this.reloaderProps });
    this.returnToLastScrollPostion();
  }
  private returnToLastScrollPostion() {
    setTimeout(() => {
      PostionById[this.id] && this.container.scrollTo({ top: PostionById[this.id], left: 0, behavior: "auto" });
    }, 0);
  }

  private listnToScroll(loadMore: () => void) {
    this.container.onscroll = ({ target }: any) => {
      if ((this.props as IWrapperProps).service.canLoadMore && target.scrollHeight - target.scrollTop < target.clientHeight + 400) loadMore();
    };
  }

  componentWillUnmount(): void {
    PostionById[this.id] = this.container.scrollTop;
  }
  render() {
    const { service, children, reloader, addStateBuilder, reload, loadMore, ...props } = this.props as IWrapperProps;
    const { Component, className } = this.reloaderProps;
    return (
      <div id={this.id} {...props}>
        {reload && (
          <div className={className} style={{ display: "none" }} id="reloader-container">
            {Component}
          </div>
        )}
        {children}
        {addStateBuilder && <ServiceStateBuilder service={service as any} />}
      </div>
    );
  }
}

const listenToPull = ({ reload, container, service, reloaderProps }: ListenToPullProps) => {
  if (!container) return;
  const containerGap = parseInt(window.getComputedStyle(container).gap.replace("px", "")) || 0;

  let isPulling = false,
    startY = 0,
    diff = 0,
    reloader = container.querySelector("#reloader-container") as any & HTMLElement;
  reloader.style.setProperty("--m-top", `-${100 + containerGap}px`);

  reloader.remove = async () => {
    let defaultClass = `${reloaderProps.reloadingClass} ${reloaderProps.disappearingClass}`;
    reloader.style = "";

    reloader.setClassName(defaultClass);
    await new Promise((resolve) => setTimeout(resolve, 500));
    isPulling = false;
    reloader.className === defaultClass && reloader.setClassName(reloaderProps.disappearingClass);
    reloader.style.display = "none";
  };

  reloader.setClassName = (className: string) => {
    reloader.className = `${reloaderProps.className} ${className}`;
  };

  const onSwipeDown = (e: any) => {
    diff = e.touches[0].clientY - startY;
    if (diff > 20) {
      if (diff > 200) diff = 200;
      let diffPercentage = diff / 100;
      let offset = (1 - diffPercentage) * reloader.offsetHeight;
      reloader.style.marginTop = -offset - containerGap + "px";
      reloader.style.opacity = diffPercentage;
      (reloaderProps as any).onPull({ diff, diffPercentage, reloader });
    }
  };

  const touchEnd = () => {
    container.removeEventListener("touchend", touchEnd);
    container.removeEventListener("touchmove", onSwipeDown);

    if (diff < 100) {
      setTimeout(async () => {
        await reloader.remove();
      }, 0);
      return;
    }
    reloader.setClassName(reloaderProps.reloadingClass);
    setTimeout(async () => {
      await reload();
      await reloader?.remove();
    }, 200);
  };

  container.addEventListener("touchstart", (e: any) => {
    if (container.scrollTop > 5 || isPulling || (service.state && service.state !== "idle")) return;
    isPulling = true;
    reloader.style.display = "";
    reloader.style.opacity = "0";
    reloader.style.marginTop = -100 - containerGap + "px";
    reloader.setClassName(reloaderProps.pullingClass);
    diff = 0;

    container.addEventListener("touchmove", onSwipeDown);
    container.addEventListener("touchend", touchEnd);
    startY = e.touches[0].clientY;
  });
};

const PostionById: any = {};

export default ({
  service = {},
  reload = service.reload,
  loadMore = service.loadMore,
  addStateBuilder = !!service.setState,
  className = "local-wrapper",
  ...props
}: IWrapperProps) => {
  const _props = { service, reload, loadMore, addStateBuilder, className, ...props };
  return <Wrapper {..._props} />;
};

export type ReloaderProps = {
  [P in keyof typeof _reloaderProps]?: (typeof _reloaderProps)[P];
};

const _reloaderProps = {
  id: "reloader",
  reloadingClass: "reloading",
  disappearingClass: "disappearing",
  pullingClass: "pulling",
  onPull: ({ diff, diffPercentage, reloader }: onPullProps) => {
    let rotateAngle = 720 - diffPercentage * 360;
    reloader.style.transform = `rotate(${rotateAngle}deg)`;
  },
  className: "",
  Component: (
    <svg className="reloader-svg" viewBox="0 0 512 512">
      <path d="M256,431.967c-97.03,0-175.967-78.939-175.967-175.967c0-28.668,7.013-56.655,20.156-81.677l-25.144-16.639l107.282-54.228l-7.974,119.943l-26.111-17.279c-7.203,15.517-11.041,32.51-11.041,49.879c0,65.507,53.294,118.801,118.801,118.801s118.801-53.294,118.801-118.801s-53.295-118.8-118.802-118.8V80.033c97.028,0,175.967,78.938,175.967,175.967S353.028,431.967,256,431.967z" />
    </svg>
  ),
};