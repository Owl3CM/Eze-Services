import { Filters } from "./Filters";
import { Honey } from "../../../../Bees/Honey";
import { QueryAPI } from "../Types";

type Props = {
  query: QueryAPI<any>;
  children?: any;
  className?: string;
};

/** Minimal query container: observes query hive changes, renders filters + children. */
export const QueryContainer = ({ children, query, className }: Props) => {
  return (
    <Honey hive={query.queryHive}>
      {() => (
        <div className={className}>
          <Filters query={query} />
          {children}
        </div>
      )}
    </Honey>
  );
};
