import { JsonBuilder } from "morabaa-utils";
import React from "react";

interface Props {
  service: any;
  error?: any;
}

const error = ({ service, error = { Error: "not passed" } }: Props) => {
  if (process.env.NODE_ENV === "production") return <></>;
  return (
    <div
      onClick={({ target }) => {
        if (service?.retry) {
          service.retry();
        } else if (service?.reload) {
          service.reload();
        } else {
          service?.setState("idle");
        }
      }}
      className="fixed bg-blur inset-0 overflow-auto"
      style={{ zIndex: 1000000, paddingBlock: 100 }}>
      <div className="col-center m-auto" style={{ maxWidth: 720 }}>
        <div
          className="animate-bounce round-full bg-red row-center justify-center"
          style={{ opacity: 0.3, width: 100, height: 100, boxShadow: " 0 0 10px var(--red)" }}>
          <p className="text-white text-center ">Error!</p>
        </div>
        <JsonBuilder json={error} className="col gap-2x bg-prim p-4x round-x" />
      </div>
    </div>
  );
};

export default error;
