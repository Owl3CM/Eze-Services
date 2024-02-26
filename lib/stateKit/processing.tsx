import React from "react";

interface Props {
  children?: React.ReactNode;
}
const processing = ({ children = <p>Processing...</p> }: Props) => {
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
