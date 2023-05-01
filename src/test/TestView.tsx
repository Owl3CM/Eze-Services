import { RecyclerList, ApiService, Grid, PagenationService, PaginatedContainer, setDefaultStateKit, ServiceStateBuilder } from "../lib";
import React from "react";
import TestService from "../lib/services/TestService";

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

const TestView = () => {
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

    // _service.load();
    return _service;
  }, []);

  return (
    <PaginatedContainer service={service} className="wrapper p-l">
      <Actions service={service} />
      <div className="bg-king">
        <Grid service={service} itemBuilder={({ item }: any) => <ItemBuilder service={service} item={item} />} />

        <ServiceStateBuilder
          service={service}
          // soNice={() => {
          //   return <h1>this was taken</h1>;
          // }}
          // error={() => <p>test</p>}
        />
      </div>
    </PaginatedContainer>
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
