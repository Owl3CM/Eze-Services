import Service from "./Service";
import { IPagenationService, ServiceConstructor } from "./Types";

export default class PagenationService extends Service implements IPagenationService {
  loadMore = async () => {};

  constructor({ onError, callback, onResponse, interceptor, storage = localStorage, useCash, storageKey }: ServiceConstructor) {
    super({ onError, callback, onResponse, interceptor, storage, useCash, storageKey });
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
