import React from "react";
import { ApiService, Grid, PagenationService, PagenatedContainer, ServiceStateBuilder, State } from "../lib";

const states: State[] = ["loading", "idle", "error", "reloading", "loadingMore", "noContent", "processing", "searching"];

const TestServices = () => {
  const apiService = React.useMemo(
    () =>
      new ApiService({
        baseURL: "https://jsonplaceholder.typicode.com/posts",
      }),
    []
  );

  const pagenationService = React.useMemo(() => {
    const _service = new PagenationService({
      callback: apiService.get,
      onResponse: (response) => {
        console.log(response);
      },
    });
    // _service.load();
    return _service;
  }, []);

  return (
    <PagenatedContainer service={pagenationService} addStateBuilder>
      <h1>TestServices</h1>
      <div className="row-center gap-2x">
        {states.map((state) => {
          return (
            <TestBtn
              key={state}
              text={state}
              onClick={() => {
                pagenationService.setState(state);
              }}
            />
          );
        })}
      </div>
      <TestBtn
        text="load"
        onClick={() => {
          pagenationService.load();
        }}
      />
      <Grid service={pagenationService} itemBuilder={TestCard} />
    </PagenatedContainer>
  );
};

export default TestServices;

const TestBtn = ({ text, onClick }: any) => {
  return (
    <button className="button bg-lord" onClick={onClick}>
      {text}
    </button>
  );
};

const TestCard = ({ item }: any) => {
  return (
    <div className="bg-prim rounded-l p-l m-l">
      <h1>{item.title}</h1>
      <p>{item.body}</p>
    </div>
  );
};
