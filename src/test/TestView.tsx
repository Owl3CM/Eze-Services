import { setDefaultStateKit, ServiceStateBuilder, Api, StateListener, CardsContainer } from "../lib";
import React from "react";
import { JsonBuilder } from "morabaa-utils";

const service = {
  items: [
    { id: 1, name: "ali" },
    { id: 2, name: "ali" },
  ],
  setItem: (item: any) => {
    service.items = item;
  },
  onItemsChanged: (service: any) => {
    console.log("change", service.items);
  },
};

const TestView = () => {
  return (
    <div>
      <p
        onClick={() => {
          service.setItem({ id: 1, name: "LOL" });
          console.log(service.items);
        }}>
        change
      </p>
      <StateListener
        name="items"
        service={service}
        Component={({ state, setState }) => {
          return state.map((item: any) => <p key={item.id}>{item.name}</p>);
        }}
      />
      {/* <CardsContainer stateName="items" service={service} itemBuilder={({ item }: any) => <JsonBuilder json={item} />} /> */}
    </div>
  );
};
export default TestView;

// export const ItemBuilder = ({ item, service, title }: any) => {
//   return (
//     <div
//       onClick={(e) => {
//         service.showUpdateItem(item);
//       }}
//       className=" overflow-hidden text-black">
//       {/* <p>{JSON.stringify(item)}</p> */}
//       <p>{item.name}</p>
//       <p>{title}</p>
//     </div>
//   );

// const Actions = ({ service }: any) => {
//   const [name, setName] = React.useState("ali");

//   return (
//     <div className="col gap-l p-l round-l bg-king">
//       <div className="row gap-2x ">
//         <p
//           onClick={() => {
//             service.setHeader([
//               { id: "name", value: name, title: "name" },
//               { id: "isDeleted", value: false, title: "name" },
//             ]);
//           }}>
//           testHeader
//         </p>
//         <p
//           className="button"
//           onClick={() => {
//             service.setQueryParmas([
//               { id: "name", value: name, title: "name" },
//               { id: "isDeleted", value: false, title: "name" },
//             ]);
//           }}>
//           load
//         </p>
//         <p
//           className="button"
//           onClick={() => {
//             service.loadMore();
//           }}>
//           loadMore
//         </p>

//         <p
//           className="button"
//           onClick={() => {
//             service.updateItem({ id: 1, name: "ali" });
//           }}>
//           updateItem
//         </p>

//         <p
//           className="button bg-green"
//           onClick={() => {
//             service.updateQueryParams({
//               id: "name",
//               value: name,
//               title: "name",
//             });
//           }}>
//           update query
//         </p>
//       </div>
//       <input value={name} onChange={(e) => setName(e.target.value)} />
//     </div>
//   );
// };
// interface StateBuilderTestProps {
//   service: ITestService;
//   label?: string;
// }

// export const kit = {
//   MAHMOSE: () => <div>amMahomse</div>,
//   Headyer: () => <div>amHeadyer</div>,
//   ALI: () => <div>amHeadyer</div>,
// };
// export type kitKeys = keyof typeof kit;
// setDefaultStateKit(kit);
