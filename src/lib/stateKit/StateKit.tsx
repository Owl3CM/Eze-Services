import React from "react";
interface IStateKit {
  error: React.ReactNode | React.FC;
  success: React.ReactNode | React.FC;
  info: React.ReactNode | React.FC;
  loading: React.ReactNode | React.FC;
  processing: React.ReactNode | React.FC;
  noContent: React.ReactNode | React.FC;
  loadingMore: React.ReactNode | React.FC;
  reloading: React.ReactNode | React.FC;
  searching: React.ReactNode | React.FC;
  [key: string]: React.ReactNode | React.FC;
}

interface Props {
  service?: any;
  title: string;
  type: string;
}

const Dynimc = ({ service, title, type }: Props) => {
  return () => {
    return (
      <div className="bg-prim text-penguin">
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

export const setDefaultStateKit = (kit: IStateKit & any) => {
  Object.keys(kit).forEach((key) => {
    StateKit[key] = kit[key];
  });
};

export default StateKit;
