import React from "react";
import { Utils } from "../utils";

export class RecyclerListJs extends React.Component {
  threshold = 200;
  initItemsToCalculate = 10;
  dir = "ltr";
  indecatorProps = {
    width: 6,
    borderRadius: 3,
    color: "#63cfc999",
    backgroundColor: "#63cfc955",
  };

  constructor(props) {
    const {
      service,
      itemBuilder,
      nodeBuilder,
      gridClass,
      containerClass = "local-wrapper relative",
      viewedItems,
      indecator,
      stateKey = "items",
      children,
    } = props;
    super(props);
    this.dir = document.documentElement.getAttribute("dir") || "ltr";
    // this.useRecycler = localStorage.getItem("useRecycler") !== "Disable Recycler";
    this.Card = itemBuilder;
    this.containerClass = containerClass + " -hide-scroller";
    this.children = children;
    if (indecator) {
      Object.entries(indecator).forEach(([key, value]) => {
        this.indecatorProps[key] = value;
      });
    }
    const itemsKey = Utils.convertToCamelCase(`set-${stateKey}`);
    service[itemsKey] = (callBack, clear) => {
      const _clear = clear || this.itemsData.length <= 0;
      if (typeof callBack === "function") {
        this.itemsData = callBack(this.itemsData);
        _clear && this.initGrid();
      } else {
        if (!Array.isArray(callBack)) throw new Error("setItems must be a function or an array");
        if (this.itemsData.length <= 0) {
          this.itemsData = callBack;
          this.initGrid();
        } else this.itemsData = callBack;
      }
    };
    this.service = service;
    this.itemsData = service[stateKey];
    this.viewedItems = viewedItems || 25;
    this.buildItem = nodeBuilder ? (item) => nodeBuilder(item) : (item) => convertToNode(itemBuilder, item);

    this.grid = document.createElement("div");
    this.grid.className = gridClass || "local-grid";
    this.grid.append(...this.itemsData.slice(0, this.initItemsToCalculate).map((item) => this.buildItem(item)));
    this.initGrid = () => {
      this.grid.replaceChildren(...this.itemsData.slice(0, this.viewedItems).map((item) => this.buildItem(item)));
      this.handleCalculations();
      setTimeout(() => {
        if (this.service.canFetch && this.container.offsetHeight - this.grid.offsetHeight > -400) {
          this.service.loadMore().then(() => {
            this.updateIndecatorProps();
            let newViewedItems = Math.floor(this.viewedItems * 1.5);
            this.grid.append(...this.itemsData.slice(this.viewedItems, newViewedItems).map((item) => this.buildItem(item)));
            this.viewedItems = newViewedItems;
            this.handleCalculations();
          });
        }
      }, 500);
    };
  }
  componentDidMount() {
    this.container = document.getElementById("recycler");
    this.container.append(this.grid);
    this.handleCalculations();
    this.initGrid();
    createIndecator(this);
    this.container.addEventListener("scroll", ({ target }) => recyclingOnScroll(target, this));
    window.addEventListener("resize", this.handleCalculations);
  }
  render = () => (
    <div className="relative">
      <div id="recycler" className={this.containerClass}>
        {this.children && this.children}
      </div>
    </div>
  );
  handleCalculations = () => {
    if (!this.grid.firstChild) return;
    this.colums = Math.floor(this.container.offsetWidth / this.grid.firstChild.offsetWidth);
    this.viewedItems = Math.floor(this.viewedItems / this.colums) * this.colums;
    this.scrollHeight = this.container.scrollHeight - this.container.offsetHeight;
    this.centerOfContainer = this.scrollHeight / 2;
    this.lastItem = this.viewedItems;
    setTimeout(this.updateIndecatorProps, 100);
  };
}
const recyclingOnScroll = (target, recycler) => {
  const scrollDown = target.scrollTop >= recycler.lastScrollTop;
  recycler.lastScrollTop = target.scrollTop;
  recycler.updateIndecatorPostion();

  if (scrollDown) {
    if (target.scrollTop > recycler.centerOfContainer + recycler.threshold) {
      if (recycler.lastItem + recycler.colums < recycler.itemsData.length) {
        onScrollDown(recycler);
        // setTimeout(() => {
        //   console.log(target.scrollTop, target.scrollHeight);
        //   if (target.scrollTop + target.scrollHeight > target.scrollHeight - 1) {
        //     target.scrollTop = target.scrollTop - 1;
        //   }
        // }, 5);
      } else if (recycler.service.canFetch)
        recycler.service.loadMore().then(() => {
          recycler.updateIndecatorProps();
          setTimeout(() => onScrollDown(recycler), 10);
        });
    }
  } else if (target.scrollTop < recycler.centerOfContainer - recycler.threshold && recycler.lastItem > recycler.viewedItems) {
    onScrollUp(recycler);
    // setTimeout(() => {
    //   if (target.scrollTop < 1) target.scrollTop = 2;
    // }, 5);
  }
};

const onScrollDown = (recycler) => {
  let start = recycler.lastItem;
  recycler.lastItem += recycler.colums;
  let array = recycler.itemsData.slice(start, recycler.lastItem);
  for (let i = 0; i < array.length; i++) {
    let itemNode = recycler.buildItem(array[i]);
    recycler.grid.firstChild.remove();
    recycler.grid.append(itemNode);
  }
};

const onScrollUp = (recycler) => {
  recycler.lastItem -= recycler.colums;
  let end = recycler.lastItem - recycler.viewedItems;
  let start = end + recycler.colums;
  let array = recycler.itemsData.slice(end, start);
  for (let i = array.length - 1; i > -1; i--) {
    let itemNode = recycler.buildItem(array[i]);
    recycler.grid.lastChild.remove();
    recycler.grid.prepend(itemNode);
  }
};

const createIndecator = (recycler) => {
  const scrollerIndecator = document.createElement("p");
  scrollerIndecator.style.position = "absolute"; //'scroller-indecator'
  scrollerIndecator.style.transition = "top 0.1s linear";
  scrollerIndecator.style.backgroundColor = recycler.indecatorProps.color;
  scrollerIndecator.style.width = `${recycler.indecatorProps.width}px`;
  scrollerIndecator.style.borderRadius = `${recycler.indecatorProps.borderRadius}px`;

  recycler.updateIndecatorPostion = () => {
    scrollerIndecator.style.top = `${((recycler.lastItem - recycler.viewedItems) / recycler.itemsData.length) * recycler.indecatorAllowdAreay}px`;
  };
  recycler.updateIndecatorProps = () => {
    if (!recycler.lastItem || !recycler.itemsData.length) {
      scrollerIndecator.style.height = `0px`;
      recycler.indecatorAllowdAreay = recycler.container.offsetHeight;
      recycler.updateIndecatorPostion();
      return;
    }
    let height = (recycler.container.offsetHeight / (recycler.itemsData.length / recycler.colums)) * 15;
    height = height < 20 ? 20 : height > recycler.container.offsetHeight ? recycler.container.offsetHeight - 20 : height;
    scrollerIndecator.style.height = `${height}px`;
    recycler.indecatorAllowdAreay = recycler.container.offsetHeight;
    recycler.updateIndecatorPostion();
  };
  setTimeout(recycler.updateIndecatorProps, 1000);

  recycler.onSwipeIndecator = (e) => {
    const lastIndex = Math.floor((e.clientY / recycler.container.offsetHeight) * recycler.itemsData.length);
    if (lastIndex <= recycler.viewedItems || lastIndex > recycler.itemsData.length) return;
    const scrollDown = e.clientY > recycler.lastPointerY;
    recycler.lastPointerY = e.clientY;
    recycler.lastItem = lastIndex;
    if (scrollDown) {
      onScrollDown(recycler);
      recycler.container.scrollTop = recycler.scrollHeight;
    } else {
      onScrollUp(recycler);
      recycler.container.scrollTop = 0;
    }
    recycler.updateIndecatorPostion();
  };

  scrollerIndecator.addEventListener("mousedown", (e) => {
    recycler.lastPointerY = e.clientY;
    scrollerIndecator.style.transition = "unset";
    const mouseUp = () => {
      scrollerIndecator.style.transition = "top 0.1s linear";
      if (recycler.lastItem - recycler.viewedItems < 0) recycler.lastItem = recycler.viewedItems;
      else if (recycler.lastItem > recycler.itemsData.length) recycler.lastItem = recycler.itemsData.length;
      recycler.grid.replaceChildren(
        ...recycler.itemsData.slice(recycler.lastItem - recycler.viewedItems, recycler.lastItem).map((item) => recycler.buildItem(item))
      );
      recycler.container.scrollTop = recycler.container.scrollTop > recycler.centerOfContainer ? recycler.container.scrollHeight : 0;
      window.removeEventListener("mousemove", recycler.onSwipeIndecator);
      window.removeEventListener("mouseup", mouseUp);
    };
    window.addEventListener("mousemove", recycler.onSwipeIndecator);
    window.addEventListener("mouseup", mouseUp);
  });

  const indecatorContainer = document.createElement("div");
  indecatorContainer.style.position = "relative";
  // indecatorContainer.style.height = `${recycler.container.offsetHeight}px`;
  indecatorContainer.style.height = "100%";
  indecatorContainer.style.backgroundColor = recycler.indecatorProps.backgroundColor;
  indecatorContainer.style.width = `${recycler.indecatorProps.width}px`;
  indecatorContainer.append(scrollerIndecator);

  const parent = recycler.container.parentElement;
  parent.style.display = "grid";

  if (recycler.dir === "ltr") {
    parent.style.gridTemplateColumns = "auto 1fr";
    parent.prepend(indecatorContainer);
  } else {
    parent.style.gridTemplateColumns = "1fr auto";
    parent.append(indecatorContainer);
  }
  recycler.scrollerIndecator = scrollerIndecator;
};

// const observe = new IntersectionObserver(
//     (entries) => entries.forEach((entry) => (entry.isIntersecting ? entry.target.classList.add("intersecting") : entry.target.classList.remove("intersecting")))
//     // ,{ threshold: 1, root: document.getElementById("recycler"), rootMargin: "0px" }
// );

const convertToNode = (node, item) => create(node({ item }));

const create = (reactComponent) => {
  const element = document.createElement(reactComponent.type);
  Object.entries(reactComponent.props).map(([key, value]) => {
    if (key === "children") return;
    if (key !== "className") key = key.toLocaleLowerCase();
    if (key === "style") return Object.entries(value).map(([styleKey, styleValue]) => (element.style[styleKey] = styleValue));
    element[key] = value;
  });
  if (typeof reactComponent.props.children === "object") {
    Array.isArray(reactComponent.props.children)
      ? Object.values(reactComponent.props.children).forEach((nestedChild) => element.append(create(nestedChild)))
      : element.append(create(reactComponent.props.children));
  } else element.append(reactComponent.props.children);
  return element;
};
