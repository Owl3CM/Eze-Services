import React from "react";
interface IStateKit {
  [key: string]: any;
}

interface Props {
  service?: any;
  title: string;
  type: string;
}

const Dynimc = ({ service, title, type }: Props) => {
  return () => {
    return (
      <div>
        <p>{title}</p>
        <p>{type}</p>
      </div>
    );
  };
};

const error = Dynimc({ title: "Error", type: "error" });
const success = Dynimc({ title: "Success", type: "success" });
const info = Dynimc({ title: "Info", type: "info" });
const loading = Dynimc({ title: "Loading", type: "loading" });
const processing = Dynimc({ title: "Processing", type: "processing" });
const noContent = Dynimc({ title: "No Content", type: "noContent" });
const loadingMore = Dynimc({ title: "loading More", type: "loading More" });
const reloading = Dynimc({ title: "Reloading", type: "reloading" });
const searching = Dynimc({ title: "Searching", type: "searching" });

const StateKit: IStateKit = {
  loading,
  error,
  success,
  info,
  processing,
  noContent,
  loadingMore,
  reloading,
  searching,
};

export default StateKit;
