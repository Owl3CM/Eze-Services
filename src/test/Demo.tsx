import React from "react";
import DemoService, { IDemoService } from "./services/DemoService";
import DemoGrid from "./components/DemoGrid";
import DemoHeader from "./components/DemoHeader";
import { Grid, PagenatedContainer, ServiceStateBuilder, setDefaultStateKit } from "../lib";
import { TimedCallback } from "morabaa-utils";

export interface DemoServiceProps {
  service: IDemoService;
}

const Demo = () => {
  const demoService = React.useMemo(() => {
    const _service = new DemoService();
    _service.load();
    return _service;
  }, []);

  return (
    <div>
      <h1>Demo</h1>
      <div id="state-holder" className="bg-white relative"></div>
      <Actions service={demoService} />
      <DemoHeader service={demoService} />
      {/* <DemoGrid service={demoService} /> */}
      <PagenatedContainer service={demoService} addStateBuilder>
        <Grid service={demoService} itemBuilder={DemoBuilder} />
      </PagenatedContainer>
      {/* <ServiceStateBuilder
        service={demoService}
        demo={({ title }: any) => (
          <div className="bg-prim p-4x round-full ">
            <h1>TEST {title}</h1>
          </div>
        )}
      /> */}
    </div>
  );
};

export default Demo;

export const Actions = ({ service }: DemoServiceProps) => {
  return (
    <div className="row gap-l p-l">
      <p
        className="button bg-green"
        onClick={() => {
          service.setState({
            state: "error",
            props: {
              title: "demo title",
            },
            parent: document.getElementById("state-holder") || undefined,
          });
        }}>
        demo
      </p>
      <p
        className="button bg-green"
        onClick={() => {
          service.setState("loading");
        }}>
        loading
      </p>
      <form>
        <input
          type="text"
          onChange={({ target }) => {
            TimedCallback.create({
              callback: () => {
                service.updateQueryParams({ id: "name", value: target.value });
              },
              id: "name",
              onRepated: () => {
                console.log("repeated");
              },
              timeout: 1000,
            });
          }}
        />
      </form>

      <p
        className="button"
        onClick={() => {
          service.updateHeader({
            title: "new title",
            subTitle: "new subTitle",
          });
        }}>
        updateHeader
      </p>
      <p
        className="button"
        onClick={() => {
          service.load();
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
        onClick={({ currentTarget }) => {
          service.popupSomthing(currentTarget);
        }}>
        popup
      </p>
    </div>
  );
};

const DemoBuilder = ({ item }: any) => {
  return (
    <div className="bg-prim round-s p-l ">
      <div>{item.id}</div>
      <div>{item.title}</div>
    </div>
  );
};
