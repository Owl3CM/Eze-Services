import "./service.css";
import React from "react";
import { PaginatedContainer, PagenationService, Grid } from "../Lib";
import MockApiService from "../../../mock/MockApiService";

const ItemCard = ({ item }) => {
  return (
    <div className="card">
      <p>{item.name}</p>
      <p>{item.description}</p>
      <p>{item.wholeSalePrice}</p>
      <p>{item.morabaaId}</p>
      <p>{item.test}</p>
    </div>
  );
};

const ServicesExample = () => {
  const service = React.useMemo(() => {
    const test = new MockApiService({ baseURL: "baseURL_test" });
    const _service = new PagenationService({
      callback: test.get,
      endpoint: "endpoint_test",
      useCash: true,
      storage: sessionStorage,
      // storageKey: 'test-pagenation'
    });
    console.log({ _service });

    _service.load();
    return _service;
  }, []);

  return (
    <PaginatedContainer service={service} useRefresh>
      <input
        type="text"
        className="input"
        onChange={({ target }) => {
          service.updateQueryParams({ id: "name", value: target.value });
        }}
      />
      <p>LOL</p>
      <Grid service={service} itemBuilder={ItemCard} stateKey="data" />
    </PaginatedContainer>
  );
};

export default ServicesExample;
