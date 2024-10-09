import React from "react";
import { IWrapperProps, ListenToPullProps, onPullProps } from "./Types";
import { StatusBee } from "../../StatusKit";
import { IHive } from "../../Beehive";

class WrapperClassComponent extends React.Component {
  id: string;
  container: HTMLDivElement = null as any;
  reloaderProps: ReloaderProps;

  constructor(props: IWrapperProps) {
    super(props);
    this.id = `wrapper-${window.location.pathname.replace(/\//g, "")}-${props.id}`;
    this.reloaderProps = { ..._reloaderProps, ...props.reloaderProps };
    const { position, className } = this.reloaderProps;
    this.reloaderProps.className = `${className ? `${className} ` : ""}${position}`;
  }
  componentDidMount() {
    const { loadMore, reload, canLoadHive, statusHive, rememberScrollPosition } = this.props as IWrapperProps;

    loadMore && this.listnToScroll(loadMore, canLoadHive);
    reload && listenToPull({ reload, container: this.container, statusHive: statusHive as any, reloaderProps: this.reloaderProps });
    if (rememberScrollPosition) this.returnToLastScrollPostion();
  }
  private returnToLastScrollPostion() {
    setTimeout(() => {
      PostionById[this.id] && this.container.scrollTo({ top: PostionById[this.id], left: 0, behavior: "instant" });
    }, 20);
  }

  private listnToScroll(loadMore: () => void, canLoadHive?: IHive<boolean>) {
    if (canLoadHive)
      this.container.onscroll = ({ target }: any) => {
        if (canLoadHive.honey && target.scrollHeight - target.scrollTop < target.clientHeight + 400) loadMore();
      };
  }

  componentWillUnmount() {
    const containerScrollTop = this.container.scrollTop;
    if (containerScrollTop === 0) return;
    PostionById[this.id] = containerScrollTop;
  }
  render() {
    const {
      service,
      statusKit,
      statusHive,
      children,
      reloader,
      subscribeToStatus,
      reload,
      loadMore,
      reloaderProps,
      canLoadHive,
      rememberScrollPosition,
      ...props
    } = this.props as IWrapperProps;
    const { Component, className } = this.reloaderProps;
    return (
      <div
        ref={(_ref) => {
          if (_ref) this.container = _ref;
        }}
        {...props}>
        {reload && (
          <div className={className} style={{ display: "none" }} id="reloader-container">
            {Component}
          </div>
        )}
        {children}
        {subscribeToStatus && (
          <StatusBee
            hive={statusHive}
            service={
              service || {
                statusHive,
                statusKit,
              }
            }
          />
        )}
      </div>
    );
  }
}

const listenToPull = ({ reload, container, statusHive, reloaderProps }: ListenToPullProps) => {
  if (!container) return;
  const containerGap = parseInt(window.getComputedStyle(container).gap.replace("px", "")) || 0;

  let isPulling = false,
    startY = 0,
    diff = 0,
    reloader = container.querySelector("#reloader-container") as any & HTMLElement;
  document.documentElement.style.setProperty("--reloader-m-top", `-${100 + containerGap}px`);

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
    }, 500);
  };

  container.addEventListener("touchstart", (e: any) => {
    if (container.scrollTop > 5 || isPulling || statusHive.honey === "reloading") return;
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

const Wrapper = ({
  service = {},
  reload = service.reload,
  loadMore = service.loadMore,
  subscribeToStatus = !!service.statusHive,
  statusHive = service.statusHive,
  canLoadHive = service.canLoadHive,
  statusKit = service.statusKit,
  className = "local-wrapper",
  rememberScrollPosition = true,
  ...props
}: IWrapperProps) => {
  return (
    <WrapperClassComponent
      {...{
        service,
        reload,
        loadMore,
        subscribeToStatus,
        className,
        statusHive,
        canLoadHive,
        statusKit,
        rememberScrollPosition,
        ...props,
      }}
    />
  );
};

export default Wrapper;

export type ReloaderProps = {
  [P in keyof typeof _reloaderProps]?: (typeof _reloaderProps)[P];
};

const _reloaderProps = {
  id: "reloader",
  reloadingClass: "reloading",
  disappearingClass: "disappearing",
  pullingClass: "pulling",
  onPull: ({ diff, diffPercentage, reloader }: onPullProps) => {
    (reloader as any).style.transform = `rotate(${diffPercentage * -360}deg)`;
  },
  Component: (
    <svg className="reloader-svg" viewBox="0 0 512 512">
      <path d="M256,431.967c-97.03,0-175.967-78.939-175.967-175.967c0-28.668,7.013-56.655,20.156-81.677l-25.144-16.639l107.282-54.228l-7.974,119.943l-26.111-17.279c-7.203,15.517-11.041,32.51-11.041,49.879c0,65.507,53.294,118.801,118.801,118.801s118.801-53.294,118.801-118.801s-53.295-118.8-118.802-118.8V80.033c97.028,0,175.967,78.938,175.967,175.967S353.028,431.967,256,431.967z" />
    </svg>
  ),
  className: "",
  position: "relative" as "absolute" | "fixed" | "relative",
};
