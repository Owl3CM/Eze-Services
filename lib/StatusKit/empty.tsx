import React from "react";

interface Props {
  children?: React.ReactNode;
}
const Empty = ({ children }: Props) => {
  return (
    <div className="fixed inset-0 col s-loading-container">
      <div className="col-center m-auto">
        <LoadingComponent />
        {children}
      </div>
    </div>
  );
};

export default Empty;

const LoadingComponent = () => <span>No Content!</span>;
