import React from "react";
import { PaginatedContainer } from "./PaginatedContainerJs";

const Refresher = (
  <svg className="refresher-svg" viewBox="0 0 512 512">
    <path fill="#A5EB78" d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z" />
    <path
      className="fill-throne"
      d="M256,431.967c-97.03,0-175.967-78.939-175.967-175.967c0-28.668,7.013-56.655,20.156-81.677l-25.144-16.639l107.282-54.228l-7.974,119.943l-26.111-17.279c-7.203,15.517-11.041,32.51-11.041,49.879c0,65.507,53.294,118.801,118.801,118.801s118.801-53.294,118.801-118.801s-53.295-118.8-118.802-118.8V80.033c97.028,0,175.967,78.938,175.967,175.967S353.028,431.967,256,431.967z"
    />
  </svg>
);

interface onPullProps {
  diff: number;
  diffPercentage: number;
  refresher: HTMLElement;
}
interface Props {
  service: any;
  onRefresh?: Function;
  useRefresh?: boolean;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  refresher?: React.ReactNode;
  refresherProps?: {
    id: string;
    reloadingClass: string;
    disappearingClass: string;
    pullingClass: string;
    onPull: (props: onPullProps) => void;
  };
}

export default (props: Props) => <PaginatedContainer refresher={Refresher} {...props} />;
