import React from "react";
import StateKit from "./StateKit";
import { Utils } from "../utils";

let defaultProps = {
  ...StateKit,
  service: {},
  state: "idle",
  test: false,
  singleState: false,
  className: "",
};

const StateBuilder = (args = defaultProps) => {
  if (!args.service) throw new Error("StateBuilder: service is required");

  return (
    <div
      style={{ display: args.state === "idle" ? "none" : "block" }}
      className={args.className ?? ""}
      ref={(_ref) => {
        if (!_ref) return;
        let ref = _ref;
        const service = args.service;
        const getStateComponent = (state) => args[state] ?? defaultProps[state];

        if (args.singleState ?? defaultProps.singleState)
          service.setState = (stateProps = { state: "idle", parentId: "", props: {} }) => {
            if (typeof stateProps === "string") stateProps = { state: stateProps };
            const { state, parentId, props } = stateProps;

            if (service.state === state) return;
            service.state = state;
            const newChild = getStateNode({ state, props }) ?? "";

            if (parentId) outerParent();
            else ref.replace(newChild);

            function outerParent() {
              setTimeout(() => {
                const parent = document.getElementById(parentId);
                if (parent) {
                  parent.append(newChild);
                  ref.replace("");
                } else ref.replace(newChild);

                const oldSetState = service.setState;
                service.setState = (_stateProps) => {
                  const _state = _stateProps.state ?? _stateProps;
                  if (service.state === _state) return;
                  newChild.remove();
                  service.setState = oldSetState;
                  service.setState(_stateProps);
                };
              }, 10);
            }
          };
        else {
          const stateByParent = {};
          service.setState = (stateProps = { state: "idle", parentId: "", props: {} }) => {
            if (typeof stateProps === "string") stateProps = { state: stateProps };
            const { state, parentId, props } = stateProps;

            if (service.state === state) return;
            service.state = state;
            const newChild = getStateNode({ state, props }) ?? "";

            if (parentId) outerParent();
            else ref.replace(newChild);

            function outerParent() {
              setTimeout(() => {
                const parent = document.getElementById(parentId);
                if (!parent) throw new Error("StateBuilder: parent not found");
                const old = stateByParent[parentId];
                if (old) {
                  if (old.state === state) return;
                  old.newChild.remove();
                }
                stateByParent[parentId] = { state, newChild };
                parent.append(newChild);
              }, 10);
            }
          };
        }

        const getStateNode = ({ state, props = { service } }) =>
          Utils.ReactToNode({
            reactComponent: getStateComponent(state),
            props,
          });

        ref.replace = (newChild) => {
          ref.replaceChildren(newChild);
          ref.style.display = ref.childElementCount > 0 ? "block" : "none";
        };

        if (args.test) {
          const _keys = [...Object.keys(args), ...Object.keys(defaultProps)].filter((key) => !["service", "state"].includes(key));
          let i = 0;
          const indector = document.createElement("p");
          indector.style =
            "position: absolute; top: 0; left: 0;right:0; background: #fff; color: #000; text-align: center; padding: 5px; font-size: 14px; z-index: 9999; opacity: 1;";
          indector.innerText = service.state;
          ref.parentElement.append(indector);

          setInterval(() => {
            service.setState(_keys[i++ % _keys.length]);
            indector.innerText = service.state;
          }, 1000);
        }
      }}
    />
  );
};

export default React.memo(StateBuilder);
