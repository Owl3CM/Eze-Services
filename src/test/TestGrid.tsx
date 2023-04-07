import React from "react";
import { Grid, MultiBuilderGrid } from "../lib";

const service = {
  data: [
    { id: 1, name: "test" },
    { id: 2, name: "test2" },
    { id: 3, name: "test3" },
    { id: 4, name: "test4" },
    { id: 5, name: "test5" },
  ],
};

const multiGrid = true;

const Two = ({ item }: any) => (
  <div className="text-green">
    <p>{item.name}</p>
  </div>
);
const One = ({ item }: any) => (
  <div className="text-cyan">
    <p>{item.name}</p>
  </div>
);

const TestGrid = () => {
  return (
    <div>
      <h1>TestGrid</h1>
      {multiGrid ? <MultiBuilderGrid service={service} builders={{ One, Two }} stateKey="data" /> : <Grid service={service} itemBuilder={One} />}
    </div>
  );
};

export default TestGrid;
