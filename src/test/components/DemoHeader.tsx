import React from "react";
import { IDemoService } from "../services/DemoService";

interface DemoGridProps {
  service: IDemoService;
}

const DemoHeader = ({ service }: DemoGridProps) => {
  [service.demoHeader, service.setDemoHeader] = React.useState(service.demoHeader);
  return (
    <div className="bg-prince p-2x">
      <h1>DemoHeader</h1>
      {service.demoHeader ? (
        <div className="bg-king text-green">
          <p>
            <span className="text-shark">someTest :</span>
            {service.demoHeader.someTest}
          </p>
          <p>
            <span className="text-shark">title :</span>
            {service.demoHeader.title}
          </p>
          <p>
            <span className="text-shark">subTitle :</span>
            {service.demoHeader.subTitle}
          </p>
        </div>
      ) : (
        <p className="text-red">no header</p>
      )}
    </div>
  );
};

export default DemoHeader;
