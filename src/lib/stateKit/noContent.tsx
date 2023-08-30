import React from "react";

interface Props {
  children?: React.ReactNode;
}
const noContent = ({ children }: Props) => {
  return (
    <div className="fixed inset-0 col s-loading-container">
      <div className="col-center m-auto">
        <LoadingComponent />
        {children}
      </div>
    </div>
  );
};

export default noContent;

const LoadingComponent = () => <span>No Content!</span>;
