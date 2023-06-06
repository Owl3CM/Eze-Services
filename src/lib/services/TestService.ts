import { PopupMe, PrintMe } from "morabaa-provider";
import PagenationService from "./PagenationService";
import { ItemBuilder, kit, kitKeys } from "../../test/TestView";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default class TestService extends PagenationService<kitKeys> {
  updateItem: (item: any) => void;
  clearData: () => void;
  showUpdateItem: (item: any) => void;
  // stateKit = kit;

  header: any;
  setHeader: React.Dispatch<React.SetStateAction<any>> = () => {};
  onHeaderChanged = (header: any) => {
    console.log("onHeaderChanged", header);
  };

  // mahomose: any;
  // setMahomose: React.Dispatch<React.SetStateAction<any>> = () => {};
  // onMahomose = (mahomose: any) => {
  //   console.log("onMahomoseChanged", mahomose);
  // };

  constructor(props: any) {
    super(props);

    this.updateItem = async (item: any) => {
      console.log("updateItem", item);
      this.setState("Headyer");
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

export type ITestService = TestService;
