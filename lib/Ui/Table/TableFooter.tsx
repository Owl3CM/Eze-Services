type Props = {
  totalItems?: number;
  children?: React.ReactNode;
};

export const TableFooter = ({ totalItems, children }: Props) => {
  return (
    <div className="row-center-between p-md border-t border-bord">
      <div className="text-sm text-hint">{totalItems != null ? `Total: ${totalItems}` : ""}</div>
      <div className="row-center gap-md">{children}</div>
    </div>
  );
};
