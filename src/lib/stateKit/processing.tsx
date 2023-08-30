import React from "react";

interface Props {
  children?: React.ReactNode;
}
const defaultChildren = <p>Processing...</p>;
const processing = ({ children = defaultChildren }: Props) => {
  return (
    <div className="fixed inset-0 col s-processing-container">
      <div className="col-center m-auto">
        <ProgressingComponent />
        {children}
      </div>
    </div>
  );
};

export default processing;

const ProgressingComponent = () => <span className="s-processing" />;
