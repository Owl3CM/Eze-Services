import React from "react";
import { DemoServiceProps } from "../Demo";

const UpdateAny = ({ service }: DemoServiceProps) => {
  return (
    <div>
      <h1>UpdateAny</h1>
      <p
        className="button"
        onClick={() => {
          service.load();
        }}>
        load
      </p>
      <p
        className="button"
        onClick={() => {
          service.loadMore();
        }}>
        loadMore
      </p>
    </div>
  );
};

export default UpdateAny;
