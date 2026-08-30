export interface CallsProps {
  timeout: number;
  callback: () => void;
  onRepeated?: () => void;
  timeoutId: any;
}
export class TimedCallback {
  static Calls: { [id: string]: CallsProps } = {};
  static alreadyPending = (id: string) => !!this.Calls[id]?.timeoutId;
  static restart = ({ id, timeout }: { id: string; timeout: number }) => {
    this.Calls[id]?.onRepeated?.();
    clearTimeout(this.Calls[id].timeoutId);
    this.Calls[id].timeoutId = setTimedCallBack({ id, timeout });
  };
  static remove = (id: string) => {
    if (this.alreadyPending(id)) {
      clearTimeout(this.Calls[id].timeoutId);
      delete this.Calls[id];
    }
  };
  static create = ({ id, timeout, callback, onRepeated }: { id: string; timeout: number; callback: () => void; onRepeated?: () => void }) => {
    this.remove(id);
    this.Calls[id] = {
      callback,
      timeout,
      onRepeated,
      timeoutId: setTimedCallBack({ id, timeout }),
    };
  };
}

const setTimedCallBack = ({ id, timeout }: any) => {
  return setTimeout(() => {
    TimedCallback.Calls[id].callback();
    delete TimedCallback.Calls[id];
  }, timeout);
};
