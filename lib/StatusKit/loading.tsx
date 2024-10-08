import React from "react";

interface Props {
  children?: React.ReactNode;
}
const Loading = ({ children }: Props) => {
  return (
    <div className="fixed inset-0 col s-loading-container">
      <div className="col-center m-auto">
        <LoadingComponent />
        {children}
      </div>
    </div>
  );
};

export default Loading;

const LoadingComponent = () => <span className="s-loading-2" />;
