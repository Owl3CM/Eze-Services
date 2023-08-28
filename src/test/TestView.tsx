import { setDefaultStateKit, ServiceStateBuilder, Api, ReactStateBuilder } from "../lib";
import React from "react";
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

const ItemsBuilder = ({ service }: any) => {
  return (
    <div>
      <h1>items</h1>
      {service.items && <JsonBuilder json={service.items} />}
    </div>
  );
};

const TestView = () => {
  return <div></div>;
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
