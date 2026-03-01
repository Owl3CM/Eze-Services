type Props = {
  variant?: "v-small" | "small" | "medium";
};

const Loader = ({ variant }: Props) => {
  const className = variant ? `eze-kit-loader ${variant}` : "eze-kit-loader";
  return <span className={className} />;
};

export default Loader;
