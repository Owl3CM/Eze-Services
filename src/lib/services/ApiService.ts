interface Props {
  baseURL: string;
  headers?: any;
  onResponse?: Function;
  onError?: Function;
  interceptor?: Function;
}
interface IApiService {
  get: (endpoint: string) => Promise<any>;
  delete: (endpoint: string) => Promise<any>;
  post: (endpoint: string, body: any) => Promise<any>;
  put: (endpoint: string, body: any) => Promise<any>;
  patch: (endpoint: string, body: any) => Promise<any>;
}

interface IAPIS {
  [key: string]: IApiService;
}

const APIs: IAPIS = {};

const getErrorRespoinse = (res: any, props: any) => ({ ...props, ...res, statusMessage: StatusCodeByMessage[res.status] || "Unknown Error" });
const ApiService = {
  create: ({ baseURL, headers, onResponse, onError, interceptor }: Props) => {
    const _Key = JSON.stringify({ baseURL, headers, onResponse, onError, interceptor });
    let _apiService = APIs[_Key];

    if (!_apiService) {
      _apiService = {
        get: async (endpoint: string) => await create("get", _apiService).then(() => _apiService.get(endpoint)),
        delete: async (endpoint: string) => await create("delete", _apiService).then(() => _apiService.delete(endpoint)),
        post: async (endpoint: string, body: any) => await create("post", _apiService).then(() => _apiService.post(endpoint, body)),
        put: async (endpoint: string, body: any) => await create("put", _apiService).then(() => _apiService.put(endpoint, body)),
        patch: async (endpoint: string, body: any) => await create("patch", _apiService).then(() => _apiService.patch(endpoint, body)),
      };

      const create = async (method: string, _apiService: any) => {
        _apiService[method] = (endpoint: string, body: any) => {
          const abortId = `${method}-${endpoint.includes("?") ? endpoint.split("?")[0] : endpoint}`;
          if (_apiService[abortId]) {
            console.warn("A B O R T E D \nhttps: " + baseURL.slice(6) + endpoint.split("?")[0] + "\n?" + endpoint.split("?")[1]);
            _apiService[abortId].abort();
          }
          _apiService[abortId] = new AbortController();
          let _url = !endpoint || endpoint.startsWith("/") ? `${baseURL}${endpoint}` : `${baseURL}/${endpoint}`;
          let props = { "Content-Type": "application/json", signal: _apiService[abortId].signal, method, headers, body: JSON.stringify(body) || null };
          return new Promise(async (resolve, reject) => {
            try {
              if (interceptor) props = await interceptor(props);
              const res = await fetch(_url, props);
              _apiService[abortId] = null;
              if (res.ok) {
                let jsonRes;
                try {
                  jsonRes = await res?.json();
                } catch {}
                onResponse?.(jsonRes);
                resolve(jsonRes);
              } else reject(getErrorRespoinse(res, props));
            } catch (err: any) {
              if (err.name === "AbortError") return;
              if (onError) onError(err);
              else throw err;
            }
          });
        };
      };
      APIs[_Key] = _apiService;
    }
    return _apiService;
  },
  init: (roots: InitProps[]) => {
    roots.forEach((root) => {
      ApiService.create(root);
    });
  },
};

interface InitProps {
  key: string;
  baseURL: string;
  headers?: any;
  onResponse?: Function;
  onError?: Function;
  interceptor?: Function;
}

// const Apis = {
//   hub: "https://hubcore.morabaaapps.com/api/v1",
//   items: "https://items.morabaaapps.com/api/v1",
//   sales: "https://salereports.morabaaapps.com/api/v1",
//   reps: "https://repsapi.morabaaapps.com/api/v1",
// };

// export const getApi = (id) => {
//   if (typeof Apis[id] === "string") {
//       console.log("First Time Create Api: ", id);
//       Apis[id] = new ApiService({
//           baseURL: Apis[id],
//           headers: {
//               "Content-Type": "application/json",
//               "App-Package": "com.morabaa." + (id === "sales" ? "accounts" : "reps"),
//               Authorization: localStorage.getItem("token"),
//           },
//       });
//   }
//   return Apis[id];
// };

const StatusCodeByMessage: { [key: number]: string } = {
  0: "There Is No Response From Server Body Is Empty Connection May Be Very Slow",

  100: " Continue ",
  101: " Switching protocols ",
  102: " Processing ",
  103: " Early Hints ",

  //2xx Succesful
  200: " OK ",
  201: " Created ",
  202: " Accepted ",
  203: " Non-Authoritative Information ",
  204: " No Content ",
  205: " Reset Content ",
  206: " Partial Content ",
  207: " Multi-Status ",
  208: " Already Reported ",
  226: " IM Used ",

  //3xx Redirection
  300: " Multiple Choices ",
  301: " Moved Permanently ",
  302: " Found (Previously 'Moved Temporarily') ",
  303: " See Other ",
  304: " Not Modified ",
  305: " Use Proxy ",
  306: " Switch Proxy ",
  307: " Temporary Redirect ",
  308: " Permanent Redirect ",

  //4xx Client Error
  400: " Bad Request ",
  401: " Unauthorized ",
  402: " Payment Required ",
  403: " Forbidden ",
  404: " Not Found ",
  405: " Method Not Allowed ",
  406: " Not Acceptable ",
  407: " Proxy Authentication Required ",
  408: " Request Timeout ",
  409: " Conflict ",
  410: " Gone ",
  411: " Length Required ",
  412: " Precondition Failed ",
  413: " Payload Too Large ",
  414: " URI Too Long ",
  415: " Unsupported Media Type ",
  416: " Range Not Satisfiable ",
  417: " Expectation Failed ",
  418: " I'm a Teapot ",
  421: " Misdirected Request ",
  422: " Unprocessable Entity ",
  423: " Locked ",
  424: " Failed Dependency ",
  425: " Too Early ",
  426: " Upgrade Required ",
  428: " Precondition Required ",
  429: " Too Many Requests ",
  431: " Request Header Fields Too Large ",
  451: " Unavailable For Legal Reasons ",

  //5xx Server Error
  500: " Internal Server Error ",
  501: " Not Implemented ",
  502: " Bad Gateway ",
  503: " Service Unavailable ",
  504: " Gateway Timeout ",
  505: " HTTP Version Not Supported ",
  506: " Variant Also Negotiates ",
  507: " Insufficient Storage ",
  508: " Loop Detected ",
  510: " Not Extended ",
  511: " Network Authentication Required ",
};

export default ApiService;
