import React from "react";

type RefresherProps = {
    service: any;
    onRefresh?: any;
    className?: string;
    id?: string;
    refrence?: any;
    children?: any;
    onScroll?: any;
};

const Refresher: React.FC<RefresherProps> = ({ service, onRefresh, children, className, id, refrence, ...porps }) => {
    const containerId = id || "refresher" + Math.random().toFixed(2);
    setTimeout(() => {
        if (onRefresh) addScrollEvent(service, onRefresh, containerId);
    }, 100);

    if (!onRefresh)
        return (
            <div ref={refrence} className={className} {...porps}>
                {children}
            </div>
        );
    return (
        <div ref={refrence} className={className} id={containerId} {...porps}>
            <div id="refresher">
                <svg className="refresher-svg" viewBox="0 0 512 512">
                    <path fill="#A5EB78" d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z" />
                    <path
                        className="fill-throne"
                        d="M256,431.967c-97.03,0-175.967-78.939-175.967-175.967c0-28.668,7.013-56.655,20.156-81.677l-25.144-16.639l107.282-54.228l-7.974,119.943l-26.111-17.279c-7.203,15.517-11.041,32.51-11.041,49.879c0,65.507,53.294,118.801,118.801,118.801s118.801-53.294,118.801-118.801s-53.295-118.8-118.802-118.8V80.033c97.028,0,175.967,78.938,175.967,175.967S353.028,431.967,256,431.967z"
                    />
                </svg>
                {/* <svg className="reload-squiggle" viewBox="0 0 303.597 303.597">
                    <path d="M57.866,268.881c25.982,19.891,56.887,30.403,89.369,30.402h0.002c6.545,0,13.176-0.44,19.707-1.308c39.055-5.187,73.754-25.272,97.702-56.557c14.571-19.033,24.367-41.513,28.329-65.01c0.689-4.084-2.064-7.954-6.148-8.643l-19.721-3.326c-1.964-0.33-3.974,0.131-5.595,1.284c-1.621,1.153-2.717,2.902-3.048,4.864c-3.019,17.896-10.49,35.032-21.608,49.555c-18.266,23.861-44.73,39.181-74.521,43.137c-4.994,0.664-10.061,1-15.058,1c-24.757,0-48.317-8.019-68.137-23.191c-23.86-18.266-39.18-44.73-43.136-74.519c-3.957-29.787,3.924-59.333,22.189-83.194c21.441-28.007,54.051-44.069,89.469-44.069c24.886,0,48.484,7.996,68.245,23.122c6.55,5.014,12.43,10.615,17.626,16.754l-36.934-6.52c-1.956-0.347-3.973,0.101-5.604,1.241c-1.631,1.141-2.739,2.882-3.085,4.841l-3.477,19.695c-0.72,4.079,2.003,7.969,6.081,8.689l88.63,15.647c0.434,0.077,0.869,0.114,1.304,0.114c1.528,0,3.031-0.467,4.301-1.355c1.63-1.141,2.739-2.882,3.084-4.841l15.646-88.63c0.721-4.079-2.002-7.969-6.081-8.69l-19.695-3.477c-4.085-0.723-7.97,2.003-8.689,6.082l-6.585,37.3c-7.387-9.162-15.87-17.463-25.248-24.642c-25.914-19.838-56.86-30.324-89.495-30.324c-46.423,0-89.171,21.063-117.284,57.787C6.454,93.385-3.878,132.123,1.309,171.178C6.497,210.236,26.583,244.933,57.866,268.881z" />
                </svg> */}
                {/* <svg className="reload-squiggle" viewBox="0 0 489.533 489.533">
                    <path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6C49.575,418.961,150.875,501.261,268.175,488.161z" />
                </svg> */}
            </div>
            {children}
        </div>
    );
};

export default Refresher;

const addScrollEvent = (service: any, onRefresh: any, id: string) => {
    const scroller: any = document.getElementById(id);
    let reloader = scroller.firstChild;

    reloader.remove = () => {
        reloader.style = "";
        reloader.className = "reloading disappearing";
    };
    reloader.remove();

    let diff = 0;
    if (!scroller) return;

    const onSwipeDown = (e: any) => {
        diff = e.touches[0].clientY - service.startY;
        if (diff > 20) {
            if (diff > 200) diff = 200;
            let diffPersent = diff / 100;
            let offset = (1 - diffPersent) * reloader.offsetHeight;
            let rotateAngle = 720 - diffPersent * 360;
            reloader.style.marginTop = -offset + "px";
            reloader.style.opacity = diffPersent;
            reloader.style.rotate = `${rotateAngle}deg`;
        }
    };

    const touchEnd = () => {
        scroller.removeEventListener("touchend", touchEnd, { passive: true });
        scroller.removeEventListener("touchmove", onSwipeDown, { passive: true });

        if (diff < 100) {
            reloader?.remove();
            service.pulling = false;
            return;
        }
        reloader.className = "reloading";
        setTimeout(async () => {
            await onRefresh();
            reloader?.remove();
            service.pulling = false;
        }, 200);
    };

    setTimeout(() => {
        if (scroller.childElementCount > 1) {
            scroller.insertBefore(reloader, scroller.childNodes[1]);
        } else scroller.insertBefore(reloader, scroller.firstChild);
    }, 300);

    scroller.addEventListener("touchstart", (e: any) => {
        if (scroller.scrollTop > 5 || service.pulling || service.state !== "none") return;
        service.pulling = true;
        reloader.style.opacity = "0";
        reloader.style.marginTop = "-80px";
        reloader.className = "pulling";
        diff = 0;

        scroller.addEventListener("touchmove", onSwipeDown, { passive: true });
        scroller.addEventListener("touchend", touchEnd, { passive: true });
        service.startY = e.touches[0].clientY;
    });
};
