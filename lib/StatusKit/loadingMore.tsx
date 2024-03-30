import React from "react";

interface Props {
  children?: React.ReactNode;
}
const loadingMore = ({ children }: Props) => {
  return (
    <div className="col-span-full col s-loading-container">
      <div className="col-center m-auto">
        <LoadingComponent />
        {children}
      </div>
    </div>
  );
};

export default loadingMore;

const LoadingComponent = () => <span className="s-loading-2" />;
