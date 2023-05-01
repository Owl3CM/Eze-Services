import React from "react";
import { IDemoService } from "../services/DemoService";
import { DemoServiceProps } from "../Demo";

const DemoGrid = ({ service }: DemoServiceProps) => {
  [service.data, service.setData] = React.useState(service.data);
  return (
    <div className="grid">
      <h1>DemoGrid</h1>
      {service.data.map((item: any) => (
        <div className="bg-prim round-s p-l ">
          <div>{item.id}</div>
          <div>{item.title}</div>
        </div>
      ))}
    </div>
  );
};

export default DemoGrid;
