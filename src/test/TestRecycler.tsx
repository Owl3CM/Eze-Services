import React from "react";
import { ApiService, Grid, PagenationService, PaginatedContainer } from "../lib";
import { RecyclerList } from "../lib/recyclerList";

const TestRecycler = () => {
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
    _service.load();
    _service.setState("error");
    return _service;
  }, []);

  return (
    <RecyclerList service={pagenationService} itemBuilder={TestCard} stateKey="data">
      {/* <h1>TestServices</h1>
      <TestBtn
        text="Test"
        onClick={() => {
          pagenationService.load();
        }}
      /> */}
    </RecyclerList>
  );
};

export default TestRecycler;

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
