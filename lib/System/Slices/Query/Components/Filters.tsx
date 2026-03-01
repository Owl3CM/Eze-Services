import { QueryAPI } from "../Types";

type Props = {
  query: QueryAPI<any>;
  className?: string;
};

/** Renders all non-hidden filters from the query API. Headless — no layout opinions. */
export const Filters = ({ query, className }: Props) => {
  const entries = query.getFilterEntries();

  return (
    <div className={className}>
      {entries.map(({ id, type, Component, props }) => {
        if (type === "hidden" || !Component) return null;
        return <Component key={id} id={id} query={query} {...props} />;
      })}
    </div>
  );
};
