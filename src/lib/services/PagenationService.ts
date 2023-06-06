import Service from "./Service";
import { IPagenationService, ServiceConstructor, State } from "../Types";

export default class PagenationService<S = null> extends Service<S> implements IPagenationService {
  loadMore = async () => {};
  constructor(props: ServiceConstructor) {
    super(props);
    this.loadMore = async () => {
      this.canFetch = false;
      let query = this.query + `&offset=${this.offset}`;
      this.setState("loadingMore");
      try {
        const result = await this.callback(query);
        this.onResponse(result);
      } catch (error) {
        this.onError(error);
      }
    };
  }
}
