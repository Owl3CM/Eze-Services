import React from "react";

interface Props {
  children?: React.ReactNode;
}
const Processing = ({ children = <p>Processing...</p> }: Props) => {
  return (
    <div className="fixed inset-0 col s-Processing-container">
      <div className="col-center m-auto">
        <ProgressingComponent />
        {children}
      </div>
    </div>
  );
};

export default Processing;

const ProgressingComponent = () => <span className="s-Processing" />;
