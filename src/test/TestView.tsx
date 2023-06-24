import { RecyclerList, ApiService, Grid, PagenationService, PagenatedContainer, setDefaultStateKit, ServiceStateBuilder } from "../lib";
import React from "react";
import TestService, { ITestService } from "../lib/services/TestService";
import { ReactStateBuilder } from "../lib/Ui/ReactStateBuilder";
import { JsonBuilder } from "morabaa-utils";

// setDefaultStateKit({
//   loading: ({ title = "" }) => (
//     <div className="bg-prim text-red p-2x fixed inset-0 bg-green opacity-60">
//       <h1>loading </h1>
//       <span className="text-white">{title}</span>
//     </div>
//   ),
//   error: ({ title = "" }) => (
//     <div className="bg-prim text-red p-2x">
//       <h1>Error </h1>
//       <span className="text-white">{title}</span>
//     </div>
//   ),
//   customState: ({ title = "" }) => (
//     <div className="bg-prim text-red p-2x">
//       <h1>customState </h1>
//       <span className="text-white">{title}</span>
//     </div>
//   ),
// });

const ItemsBuilder = ({ service }: { service: ITestService }) => {
  return (
    <div>
      <h1>items</h1>
      {service.items && <JsonBuilder json={service.items} />}
    </div>
  );
};

const TestView = () => {
  const [data, setData] = React.useState<any[]>([]);

  const apiService = React.useMemo(() => {
    return new ApiService({
      baseURL: "https://salereports.morabaaapps.com/api/v1",
      headers: { Authorization: "kqHrOdtZmAOjI8ZC93ftc1bp8GMsire1rXGwf6e8ayESJyUU" },
    });
  }, []);

  const service = React.useMemo(() => {
    const _service = new TestService({
      callback: apiService.get,
      endpoint: "accounts",
    });
    return _service;
  }, []);

  return (
    <div>
      <h1
        className="button"
        onClick={() => {
          service.setItems({
            title: "hi",
            price: 1999,
          });
        }}>
        TEST
      </h1>
      <ItemsBuilder service={service} />
      <ReactStateBuilder service={service} stateName="items" Component={ItemsBuilder} />
    </div>
  );

  return (
    <PagenatedContainer service={service} className="wrapper p-l">
      {/* <ReactStateBuilder service={service} Component={StateBuilderTest} stateKey="header" /> */}
      <p
        onClick={() => {
          // mahomose: any;
          // setMahomose: React.Dispatch<React.SetStateAction<any>> = () => {};
          // onMahomoseChange = (mahomose: any) => {
          //   console.log("onMahomoseChanged", mahomose);
          // };
          // service.setMahomose({
          //   name: "mahomose",
          //   age: 29,
          // });
        }}>
        setMahomose
      </p>
      <div className="bg-red col gap-l">
        {/* <ReactStateBuilder service={service} Component={StateBuilderTest} stateName="header" />
        <ReactStateBuilder service={service} Component={StateBuilderTest} stateName="accounts" /> */}

        <ReactStateBuilder
          service={service}
          stateName="header"
          Component={() => {
            return <StateBuilderTest service={service} label="hi" />;
          }}
        />

        <StateBuilderTest service={service} label="hi" />
      </div>

      {/* <ReactStateBuilder service={service} Component={StateBuilderTest} stateKey="data" /> */}

      {/* <Actions service={service} /> */}
      <div className="bg-king">
        {/* <Grid service={service} itemBuilder={({ item }: any) => <ItemBuilder service={service} item={item} />} /> */}
        <ServiceStateBuilder<kitKeys> service={service} />
      </div>
    </PagenatedContainer>
  );
};

export const ItemBuilder = ({ item, service, title }: any) => {
  return (
    <div
      onClick={(e) => {
        service.showUpdateItem(item);
      }}
      className=" overflow-hidden text-black">
      {/* <p>{JSON.stringify(item)}</p> */}
      <p>{item.name}</p>
      <p>{title}</p>
    </div>
  );
};
export default TestView;

const Actions = ({ service }: any) => {
  const [name, setName] = React.useState("ali");

  return (
    <div className="col gap-l p-l round-l bg-king">
      <div className="row gap-2x ">
        <p
          onClick={() => {
            service.setHeader([
              { id: "name", value: name, title: "name" },
              { id: "isDeleted", value: false, title: "name" },
            ]);
          }}>
          testHeader
        </p>
        <p
          className="button"
          onClick={() => {
            service.setQueryParmas([
              { id: "name", value: name, title: "name" },
              { id: "isDeleted", value: false, title: "name" },
            ]);
          }}>
          load
        </p>
        <p
          className="button"
          onClick={() => {
            service.loadMore();
          }}>
          loadMore
        </p>

        <p
          className="button"
          onClick={() => {
            service.updateItem({ id: 1, name: "ali" });
          }}>
          updateItem
        </p>

        <p
          className="button bg-green"
          onClick={() => {
            service.updateQueryParams({
              id: "name",
              value: name,
              title: "name",
            });
          }}>
          update query
        </p>
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
};
interface StateBuilderTestProps {
  service: ITestService;
  label?: string;
}

export const kit = {
  MAHMOSE: () => <div>amMahomse</div>,
  Headyer: () => <div>amHeadyer</div>,
  ALI: () => <div>amHeadyer</div>,
};
export type kitKeys = keyof typeof kit;
setDefaultStateKit(kit);
