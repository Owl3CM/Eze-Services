interface IStateBuilderProps {
  service: any;
  state: string;
  test: boolean;
  singleState: boolean;
  className: string;
  idle: React.ReactNode;
  loading: React.ReactNode;
  error: React.ReactNode;
  empty: React.ReactNode;
  noData: React.ReactNode;
  noConnection: React.ReactNode;
}
export declare const StateBuilder: React.FC<IStateBuilderProps>;
export default StateBuilder;
