import { PopupMe, PrintMe } from "morabaa-provider";
import PagenationService from "./PagenationService";
import { ItemBuilder } from "../../test/TestView";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type TESTO = "NICE" | "SO_NICE" | "ERROR" | "LOADING" | "CUSTOM_STATE" | "DEMO";
// export type TESTO = State | { state: State; props: any; parent?: HTMLElement | undefined };
export default class TestService extends PagenationService<TESTO> {
  updateItem: (item: any) => void;
  clearData: () => void;
  showUpdateItem: (item: any) => void;
  constructor(props: any) {
    super(props);

    this.updateItem = async (item: any) => {
      console.log("updateItem", item);

      this.setState("processing");
      this.setState({
        state: "processing",
        props: { title: "test now" },
      });
      await sleep(5000);
      this.setState("idle");
    };

    this.clearData = () => {
      this.setState("noContent");
      this.setData([]);
    };

    this.showUpdateItem = (item: any) => {
      //   PopupMe({
      //     Component: ItemBuilder,
      //     componentProps: { item, service: this, title: "teee" },
      //     id: "updateItem",
      //   });
      PrintMe({
        Component: ItemBuilder,
        componentProps: { item, service: this, title: "teee" },
      });
    };
  }
}
