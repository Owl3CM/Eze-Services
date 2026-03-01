import { QueryAPI } from "../Types";
import { TimedCallback } from "../../../../Utils";

export interface IQueryProps {
  id: string;
  query: QueryAPI<any>;
  debounce?: number;
  [key: string]: any;
}

interface IQueryElementProps extends IQueryProps {
  Element: any;
}

export const QueryElement = ({ id, query, Element, debounce, ...props }: IQueryElementProps) => (
  <Element id={id} value={query.getParam(id)} setValue={getValueChanged(id, query, debounce)} {...props} />
);

const getValueChanged = (id: string, query: QueryAPI<any>, debounce?: number) =>
  debounce
    ? (value: any) => {
        TimedCallback.create({
          callback: () => query.updateQuery({ id, value }),
          id: id,
          timeout: debounce,
        });
      }
    : (value: any) => {
        query.updateQuery({ id, value });
      };
