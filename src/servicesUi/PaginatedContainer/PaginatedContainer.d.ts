declare module PaginatedContainer {
  export interface IPaginatedContainerProps {
    service: any;
    onRefresh: (e: React.MouseEvent<HTMLDivElement>) => void;
    useRefresh: boolean;
    className: string;
    children: React.ReactNode;
    id: string;
    refresher: React.ReactNode;
    refresherProps: {
      id: string;
      reloadingClass: string;
      disappearingClass: string;
      pullingClass: string;
      onPull: (e: React.MouseEvent<HTMLDivElement>) => void;
    };
  }
}
