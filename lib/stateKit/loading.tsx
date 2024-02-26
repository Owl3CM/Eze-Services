import React from "react";

interface Props {
  children?: React.ReactNode;
}
const loading = ({ children }: Props) => {
  return (
    <div className="fixed inset-0 col s-loading-container">
      <div className="col-center m-auto">
        <LoadingComponent />
        {children}
      </div>
    </div>
  );
};

export default loading;

const LoadingComponent = () => <span className="s-loading-2" />;
