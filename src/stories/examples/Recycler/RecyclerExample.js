import "./recycler.css";
import React from "react";
import MockApiService from "../../../XD/mock/MockApiService";

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

const RecyclerExample = () => {
  const service = React.useMemo(() => {
    const mockApi = new MockApiService({ baseURL: "baseURL_test" });
    // const _service = new PagenationService({
    //   callback: mockApi.get,
    //   endpoint: 'mock',
    //   useCash: true,
    //   storage: sessionStorage
    //   // storageKey: 'test-recycler'
    // })
    // _service.load()
    // return _service
  }, []);

  return (
    <div service={service} itemBuilder={ItemCard}>
      <input
        type="text"
        onChange={({ target }) => {
          service.updateQueryParams({ id: "name", value: target.value });
        }}
      />
    </div>
  );
};

export default RecyclerExample;
