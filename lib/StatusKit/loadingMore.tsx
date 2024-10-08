import React from "react";

interface Props {
  children?: React.ReactNode;
}
const LoadingMore = ({ children }: Props) => {
  return (
    <div className="col-span-full col s-loading-container">
      <div className="col-center m-auto">
        <LoadingComponent />
        {children}
      </div>
    </div>
  );
};

export default LoadingMore;

const LoadingComponent = () => <span className="s-loading-2" />;
