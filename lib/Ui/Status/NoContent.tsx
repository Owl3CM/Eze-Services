export interface NoContentProps {
  label?: string;
}

const EmptyIcon = () => (
  <svg className="eze-kit-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const NoContent = ({ label = "No content" }: NoContentProps) => {
  return (
    <div className="eze-kit-empty">
      <EmptyIcon />
      <p className="eze-kit-empty-label">{label}</p>
    </div>
  );
};

export default NoContent;
