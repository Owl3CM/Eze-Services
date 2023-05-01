import { PopupMe } from "morabaa-provider";
import { ApiService, IPagenationService, PagenationService } from "../../lib";
import MockApiService from "../../lib/mock/MockApiService";
import UpdateAny from "../components/UpdateAny";
import { Actions } from "../Demo";

const apiService = new ApiService({
  baseURL: "https://jsonplaceholder.typicode.com",
});

export interface IDemoService extends IPagenationService {
  amTest: () => void;
  demoHeader: any;
  setDemoHeader: (value: any) => void;
  updateHeader: (value?: any) => void;
  popupSomthing: (target: any) => void;
}

export default class DemoService extends PagenationService implements IDemoService {
  demoHeader: any = null;
  setDemoHeader = (value: any) => {};

  amTest = () => {
    this.load;
    alert("amTest");
  };

  updateHeader = async (value?: any) => {
    value.someTest = "test";
    // this.setDemoHeader(value);
    this.setState("loading");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setData((prev: any) => {
      const newData = { id: 1, title: "foo" };
      return [newData, ...prev];
    });

    this.setState("idle");
  };

  popupSomthing = (target: any) => {
    PopupMe({
      Component: Actions,
      componentProps: {
        title: "test",
        service: this,
      },
      target,
    });
  };

  constructor() {
    super({
      callback: apiService.get,
      endpoint: "posts",
      onResponse: (response) => {
        console.log(response);
        return response;
      },
    });
  }
}
