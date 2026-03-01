import Loading from "./Kit/Loading";
import Error from "./Kit/Error";
import Progressing from "./Kit/Progressing";
import NoContent from "./Kit/NoContent";

export const DefaultStatusKit = {
  error: {
    component: Error,
    priority: 10,
    props: {},
  },
  processing: {
    component: Progressing,
    priority: 10,
    props: {},
  },
  loading: {
    component: Loading,
    priority: 10,
    props: {},
  },
  noContent: {
    component: NoContent,
    priority: 5,
    props: {},
  },
  empty: {
    component: NoContent,
    priority: 5,
    props: {},
  },
  reloading: {
    component: Loading,
    priority: 8,
    props: {},
  },
};
