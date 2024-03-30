import React from "react";

interface Props {
  children?: React.ReactNode;
}
const empty = ({ children }: Props) => {
  return (
    <div className="fixed inset-0 col s-loading-container">
      <div className="col-center m-auto">
        <LoadingComponent />
        {children}
      </div>
    </div>
  );
};

export default empty;

const LoadingComponent = () => <span>No Content!</span>;
