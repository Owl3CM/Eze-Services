import React from "react";
import { MultiBuilderGrid, Wrapper } from "../lib";

const service = {
  data: [
    { id: 1, name: "test" },
    { id: 2, name: "test2" },
    { id: 3, name: "test3" },
    { id: 4, name: "test4" },
    { id: 5, name: "test5" },
  ],
  setCardTemplate(template: string) {
    this.template = template;
  },
  template: "One",
  reload: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("reload");
  },
};

const One = ({ item }: any) => (
  <div className="bg-cyan">
    <p>{item.name}</p>
  </div>
);

const Two = ({ item }: any) => (
  <div className="bg-green">
    <p>{item.name}</p>
  </div>
);

const TestGrid = () => {
  return (
    <Wrapper service={service} reloaderProps={reloaderProps}>
      <h1>TestGrid</h1>

      <div className="row gap-x p-l">
        <p
          className="button"
          onClick={() => {
            service.setCardTemplate("One");
          }}>
          one
        </p>
        <p
          className="button"
          onClick={() => {
            service.setCardTemplate("Two");
          }}>
          two
        </p>
      </div>

      <MultiBuilderGrid service={service} builders={{ One, Two }} />
    </Wrapper>
  );
};

export default TestGrid;

const reloaderProps = {
  // reloadingClass: "squiggle",
  onPull: ({ diff, diffPercentage, reloader }) => {
    console.log(diff, diffPercentage, reloader);

    const dashOffset = 650 + diffPercentage * 650;
    (reloader.firstChild.lastChild as any).style.strokeDashoffset = `${dashOffset}`;
  },
  Component: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 500 500">
      <path
        className="reload-squiggle-back"
        fill="none"
        stroke="#DA374633"
        strokeWidth="47"
        d="M111.6,344.3h217.2c33.8-2.5,61.2-29.9,61.2-63.7V88.8c0-33.9-27.5-61.4-61.4-61.4H87.3c-33.8,0-61.1,27.4-61.1,61.1l0.6,238.7c0.1,34.6,28.3,62.5,63.1,62.5h67.8"></path>
      <path
        fill="none"
        stroke="#DA3746"
        strokeWidth="46"
        className="reload-squiggle"
        d="M111.6,344.3h217.2c33.8-2.5,61.2-29.9,61.2-63.7V88.8c0-33.9-27.5-61.4-61.4-61.4H87.3c-33.8,0-61.1,27.4-61.1,61.1l0.6,238.7c0.1,34.6,28.3,62.5,63.1,62.5h67.8"></path>
    </svg>
  ),
  className: "relative",
};
