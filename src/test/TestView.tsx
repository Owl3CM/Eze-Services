import { RecyclerList, ApiService, Grid, PagenationService, PaginatedContainer, setDefaultStateKit, ServiceStateBuilder } from "../lib";
import React from "react";

const TestView = () => {
  const apiService = React.useMemo(() => {
    return new ApiService({
      baseURL: "https://salereports.morabaaapps.com/api/v1",
      headers: {
        Authorization: "kqHrOdtZmAOjI8ZC93ftc1bp8GMsire1rXGwf6e8ayESJyUU",
      },
    });
  }, []);

  const service = React.useMemo(() => {
    setDefaultStateKit({
      nice: ({ text, className }: any) => {
        return (
          <div className={className}>
            <h1>am so nice error</h1>
            <h1>{text}</h1>
          </div>
        );
      },
    });
    const _service = new PagenationService({
      callback: apiService.get,
      endpoint: "accounts",
      onResponse: (response) => {
        return response;
      },
    });
    _service.statekit = {
      soNice: () => {
        return (
          <div>
            <h1>soNice</h1>
          </div>
        );
      },
      thisNote: () => {
        return (
          <div>
            <h1>soNice</h1>
          </div>
        );
      },
    };
    _service.load();
    _service.setState("soNice");
    return _service;
  }, []);

  // return <RecyclerList itemBuilder={ItemBuilder} service={service} />;
  return (
    <PaginatedContainer
      service={service}
      onRefresh={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("refresh");
      }}>
      {/* <Grid service={service} itemBuilder={ItemBuilder} /> */}
      <div className="row-center gap-l p-l">
        <p
          className="button"
          onClick={() => {
            service.setState("soNice");
          }}>
          soNice
        </p>
        <p
          className="button"
          onClick={() => {
            service.setState("nice");
          }}>
          nice
        </p>
        <div
          onClick={({ currentTarget }) => {
            service.setState({
              state: "nice",
              parent: currentTarget,
              props: {
                text: "after click",
                className: "absolute bg-prim p-l rounded-x ",
              },
            });
          }}>
          <p className="button">nice</p>
        </div>
        <p
          className="button"
          onClick={() => {
            service.setState("loading");
          }}>
          loading
        </p>
      </div>
      <ServiceStateBuilder
        service={service}
        soNice={() => {
          return <h1>this was taken</h1>;
        }}
      />
    </PaginatedContainer>
  );
};

const ItemBuilder = ({ item }: any) => {
  return (
    <div className="card overflow-hidden">
      <p>{JSON.stringify(item)}</p>
    </div>
  );
};
export default TestView;
