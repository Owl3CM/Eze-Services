import React from "react";
import { MultiBuilderGrid } from "../lib";

const service = {
  data: [
    { id: 1, name: "test" },
    { id: 2, name: "test2" },
    { id: 3, name: "test3" },
    { id: 4, name: "test4" },
    { id: 5, name: "test5" },
  ],
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
    <div>
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
    </div>
  );
};

export default TestGrid;
