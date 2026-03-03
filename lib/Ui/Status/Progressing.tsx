import Loader from "./Loader";

export interface Props {
  label?: string;
}

const Progressing = ({ label = "Processing..." }: Props) => {
  return (
    <div className="eze-kit-processing">
      <div className="eze-kit-processing-card">
        <Loader />
        <p className="eze-kit-processing-label">{label}</p>
      </div>
    </div>
  );
};

export default Progressing;
