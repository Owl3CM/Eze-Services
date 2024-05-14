import { createHiveArray } from "../Beehive";
import { loadingStauts } from "./DefaultsServiceFunctions";
import { IPaginatorService } from "./PaginatorService";
import { IService } from "./Service";
export const defaultLoad =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("loading");
    try {
      service.beforeLoad?.(true);
      const data = await func.load(service.queryParamsHive.honey);
      // const data = mockData;
      service.onResponse({ data, clear: true, hasMore: func.hasMore });
    } catch (error) {
      service.onError(error);
    }
  };

export const defaultReload =
  (service: IService, func: any = service.loader) =>
  async () => {
    service.statusHive.setHoney("reloading");
    try {
      service.beforeReload?.(true);
      const data = await func.reload(service.queryParamsHive.honey);
      service.onResponse({ data, clear: true, hasMore: func.hasMore });
    } catch (error) {
      service.onError(error);
    }
  };

export const defaultLoadMore = (service: IPaginatorService) => async () => {
  service.statusHive.setHoney("loadingMore");
  try {
    service.beforeLoadMore?.();
    const data = await service.paginator.loadMore();
    service.onResponse({ data, hasMore: service.paginator.hasMore });
  } catch (error) {
    service.onError(error);
  }
};
interface DefaultOnPaginatorResProps<Response> {
  data: Response;
  clear?: boolean;
  hasMore: boolean;
}
export const defaultOnPaginatorRes = <Response, FormattedResponse>(service: IPaginatorService<any, Response, FormattedResponse, any>, formatResponse: any) => {
  service.dataHive = createHiveArray<FormattedResponse>([] as FormattedResponse[]);

  service.dataHive.subscribe((data) => {
    if (loadingStauts.includes(service.statusHive.honey)) service.statusHive.setHoney(data.length ? "idle" : "empty");
  });
  if (formatResponse)
    return async ({ data, clear, hasMore }: DefaultOnPaginatorResProps<Response[]>) => {
      data = formatResponse(data);
      if (clear) service.dataHive.setHoney(data as any[]);
      else service.dataHive.append(data as any[]);
      setTimeout(() => {
        service.canLoadHive.setHoney(hasMore);
      }, 100);
    };
  else
    return async ({ data, clear, hasMore }: DefaultOnPaginatorResProps<FormattedResponse[]>) => {
      if (clear) service.dataHive.setHoney(data);
      else service.dataHive.append(data);
      setTimeout(() => {
        service.canLoadHive.setHoney(hasMore);
      }, 100);
    };
};

const mockData = [
  {
    id: 1,
    createdAt: "2024-05-13T02:48:37.99576+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 195",
    phoneNumber: "phoneNumber 195",
    email: "email 195",
    photoUrl: "photoUrl 195",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 195",
    price: 195,
  },
  {
    id: 2,
    createdAt: "2024-05-13T02:48:39.858162+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 52",
    phoneNumber: "phoneNumber 52",
    email: "email 52",
    photoUrl: "photoUrl 52",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 52",
    price: 52,
  },
  {
    id: 3,
    createdAt: "2024-05-13T02:48:41.105824+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 875",
    phoneNumber: "phoneNumber 875",
    email: "email 875",
    photoUrl: "photoUrl 875",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 875",
    price: 875,
  },
  {
    id: 4,
    createdAt: "2024-05-13T02:48:41.276352+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 870",
    phoneNumber: "phoneNumber 870",
    email: "email 870",
    photoUrl: "photoUrl 870",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 870",
    price: 870,
  },
  {
    id: 5,
    createdAt: "2024-05-13T02:48:41.444178+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 592",
    phoneNumber: "phoneNumber 592",
    email: "email 592",
    photoUrl: "photoUrl 592",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 592",
    price: 592,
  },
  {
    id: 6,
    createdAt: "2024-05-13T02:48:41.582951+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 985",
    phoneNumber: "phoneNumber 985",
    email: "email 985",
    photoUrl: "photoUrl 985",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 985",
    price: 985,
  },
  {
    id: 7,
    createdAt: "2024-05-13T02:48:41.72519+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 312",
    phoneNumber: "phoneNumber 312",
    email: "email 312",
    photoUrl: "photoUrl 312",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 312",
    price: 312,
  },
  {
    id: 8,
    createdAt: "2024-05-13T02:48:41.866033+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 941",
    phoneNumber: "phoneNumber 941",
    email: "email 941",
    photoUrl: "photoUrl 941",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 941",
    price: 941,
  },
  {
    id: 9,
    createdAt: "2024-05-13T02:48:42.027175+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 327",
    phoneNumber: "phoneNumber 327",
    email: "email 327",
    photoUrl: "photoUrl 327",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 327",
    price: 327,
  },
  {
    id: 10,
    createdAt: "2024-05-13T02:48:42.17535+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 775",
    phoneNumber: "phoneNumber 775",
    email: "email 775",
    photoUrl: "photoUrl 775",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 775",
    price: 775,
  },
  {
    id: 11,
    createdAt: "2024-05-13T02:48:42.318577+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 910",
    phoneNumber: "phoneNumber 910",
    email: "email 910",
    photoUrl: "photoUrl 910",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 910",
    price: 910,
  },
  {
    id: 12,
    createdAt: "2024-05-13T02:48:42.46839+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 889",
    phoneNumber: "phoneNumber 889",
    email: "email 889",
    photoUrl: "photoUrl 889",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 889",
    price: 889,
  },
  {
    id: 13,
    createdAt: "2024-05-13T02:48:42.621952+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 62",
    phoneNumber: "phoneNumber 62",
    email: "email 62",
    photoUrl: "photoUrl 62",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 62",
    price: 62,
  },
  {
    id: 14,
    createdAt: "2024-05-13T02:48:42.766066+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 19",
    phoneNumber: "phoneNumber 19",
    email: "email 19",
    photoUrl: "photoUrl 19",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 19",
    price: 19,
  },
  {
    id: 15,
    createdAt: "2024-05-13T02:48:42.924393+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 52",
    phoneNumber: "phoneNumber 52",
    email: "email 52",
    photoUrl: "photoUrl 52",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 52",
    price: 52,
  },
  {
    id: 16,
    createdAt: "2024-05-13T02:48:43.078018+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 163",
    phoneNumber: "phoneNumber 163",
    email: "email 163",
    photoUrl: "photoUrl 163",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 163",
    price: 163,
  },
  {
    id: 17,
    createdAt: "2024-05-13T02:48:43.233057+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 599",
    phoneNumber: "phoneNumber 599",
    email: "email 599",
    photoUrl: "photoUrl 599",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 599",
    price: 599,
  },
  {
    id: 18,
    createdAt: "2024-05-13T02:48:43.376975+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 837",
    phoneNumber: "phoneNumber 837",
    email: "email 837",
    photoUrl: "photoUrl 837",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 837",
    price: 837,
  },
  {
    id: 19,
    createdAt: "2024-05-13T02:48:43.516724+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 578",
    phoneNumber: "phoneNumber 578",
    email: "email 578",
    photoUrl: "photoUrl 578",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 578",
    price: 578,
  },
  {
    id: 20,
    createdAt: "2024-05-13T02:49:57.832148+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 929",
    phoneNumber: "phoneNumber 929",
    email: "email 929",
    photoUrl: "photoUrl 929",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 929",
    price: 929,
  },
  {
    id: 21,
    createdAt: "2024-05-13T02:49:57.985624+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 485",
    phoneNumber: "phoneNumber 485",
    email: "email 485",
    photoUrl: "photoUrl 485",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 485",
    price: 485,
  },
  {
    id: 22,
    createdAt: "2024-05-13T02:49:58.129923+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 515",
    phoneNumber: "phoneNumber 515",
    email: "email 515",
    photoUrl: "photoUrl 515",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 515",
    price: 515,
  },
  {
    id: 23,
    createdAt: "2024-05-13T02:49:58.270123+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 322",
    phoneNumber: "phoneNumber 322",
    email: "email 322",
    photoUrl: "photoUrl 322",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 322",
    price: 322,
  },
  {
    id: 24,
    createdAt: "2024-05-13T02:49:58.419612+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 301",
    phoneNumber: "phoneNumber 301",
    email: "email 301",
    photoUrl: "photoUrl 301",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 301",
    price: 301,
  },
  {
    id: 25,
    createdAt: "2024-05-13T02:49:58.708697+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 107",
    phoneNumber: "phoneNumber 107",
    email: "email 107",
    photoUrl: "photoUrl 107",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 107",
    price: 107,
  },
  {
    id: 26,
    createdAt: "2024-05-13T02:49:58.85372+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 425",
    phoneNumber: "phoneNumber 425",
    email: "email 425",
    photoUrl: "photoUrl 425",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 425",
    price: 425,
  },
  {
    id: 27,
    createdAt: "2024-05-13T02:49:58.995032+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 403",
    phoneNumber: "phoneNumber 403",
    email: "email 403",
    photoUrl: "photoUrl 403",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 403",
    price: 403,
  },
  {
    id: 28,
    createdAt: "2024-05-13T02:49:59.426909+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 796",
    phoneNumber: "phoneNumber 796",
    email: "email 796",
    photoUrl: "photoUrl 796",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 796",
    price: 796,
  },
  {
    id: 29,
    createdAt: "2024-05-13T02:49:59.718629+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 676",
    phoneNumber: "phoneNumber 676",
    email: "email 676",
    photoUrl: "photoUrl 676",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 676",
    price: 676,
  },
  {
    id: 30,
    createdAt: "2024-05-13T02:50:00.018468+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 630",
    phoneNumber: "phoneNumber 630",
    email: "email 630",
    photoUrl: "photoUrl 630",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 630",
    price: 630,
  },
  {
    id: 31,
    createdAt: "2024-05-13T02:50:00.155104+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 122",
    phoneNumber: "phoneNumber 122",
    email: "email 122",
    photoUrl: "photoUrl 122",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 122",
    price: 122,
  },
  {
    id: 32,
    createdAt: "2024-05-13T02:50:00.303379+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 323",
    phoneNumber: "phoneNumber 323",
    email: "email 323",
    photoUrl: "photoUrl 323",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 323",
    price: 323,
  },
  {
    id: 33,
    createdAt: "2024-05-13T02:50:00.482491+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 838",
    phoneNumber: "phoneNumber 838",
    email: "email 838",
    photoUrl: "photoUrl 838",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 838",
    price: 838,
  },
  {
    id: 34,
    createdAt: "2024-05-13T02:50:00.662271+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 503",
    phoneNumber: "phoneNumber 503",
    email: "email 503",
    photoUrl: "photoUrl 503",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 503",
    price: 503,
  },
  {
    id: 35,
    createdAt: "2024-05-13T02:50:00.813467+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 479",
    phoneNumber: "phoneNumber 479",
    email: "email 479",
    photoUrl: "photoUrl 479",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 479",
    price: 479,
  },
  {
    id: 36,
    createdAt: "2024-05-13T02:50:00.963936+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 876",
    phoneNumber: "phoneNumber 876",
    email: "email 876",
    photoUrl: "photoUrl 876",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 876",
    price: 876,
  },
  {
    id: 37,
    createdAt: "2024-05-13T02:50:01.111597+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 603",
    phoneNumber: "phoneNumber 603",
    email: "email 603",
    photoUrl: "photoUrl 603",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 603",
    price: 603,
  },
  {
    id: 38,
    createdAt: "2024-05-13T02:50:01.24579+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 485",
    phoneNumber: "phoneNumber 485",
    email: "email 485",
    photoUrl: "photoUrl 485",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 485",
    price: 485,
  },
  {
    id: 39,
    createdAt: "2024-05-13T02:50:01.397529+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 980",
    phoneNumber: "phoneNumber 980",
    email: "email 980",
    photoUrl: "photoUrl 980",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 980",
    price: 980,
  },
  {
    id: 40,
    createdAt: "2024-05-13T02:50:01.553243+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 52",
    phoneNumber: "phoneNumber 52",
    email: "email 52",
    photoUrl: "photoUrl 52",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 52",
    price: 52,
  },
  {
    id: 41,
    createdAt: "2024-05-13T02:50:01.695203+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 793",
    phoneNumber: "phoneNumber 793",
    email: "email 793",
    photoUrl: "photoUrl 793",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 793",
    price: 793,
  },
  {
    id: 42,
    createdAt: "2024-05-13T02:50:01.836341+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 792",
    phoneNumber: "phoneNumber 792",
    email: "email 792",
    photoUrl: "photoUrl 792",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 792",
    price: 792,
  },
  {
    id: 43,
    createdAt: "2024-05-13T02:50:01.996732+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 432",
    phoneNumber: "phoneNumber 432",
    email: "email 432",
    photoUrl: "photoUrl 432",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 432",
    price: 432,
  },
  {
    id: 44,
    createdAt: "2024-05-13T02:50:02.136767+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 399",
    phoneNumber: "phoneNumber 399",
    email: "email 399",
    photoUrl: "photoUrl 399",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 399",
    price: 399,
  },
  {
    id: 45,
    createdAt: "2024-05-13T02:50:02.278475+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 745",
    phoneNumber: "phoneNumber 745",
    email: "email 745",
    photoUrl: "photoUrl 745",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 745",
    price: 745,
  },
  {
    id: 46,
    createdAt: "2024-05-13T02:50:02.419907+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 390",
    phoneNumber: "phoneNumber 390",
    email: "email 390",
    photoUrl: "photoUrl 390",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 390",
    price: 390,
  },
  {
    id: 47,
    createdAt: "2024-05-13T02:50:02.54705+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 248",
    phoneNumber: "phoneNumber 248",
    email: "email 248",
    photoUrl: "photoUrl 248",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 248",
    price: 248,
  },
  {
    id: 48,
    createdAt: "2024-05-13T02:50:02.886562+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 375",
    phoneNumber: "phoneNumber 375",
    email: "email 375",
    photoUrl: "photoUrl 375",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 375",
    price: 375,
  },
  {
    id: 49,
    createdAt: "2024-05-13T02:50:03.140012+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 518",
    phoneNumber: "phoneNumber 518",
    email: "email 518",
    photoUrl: "photoUrl 518",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 518",
    price: 518,
  },
  {
    id: 50,
    createdAt: "2024-05-13T02:50:03.294377+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 766",
    phoneNumber: "phoneNumber 766",
    email: "email 766",
    photoUrl: "photoUrl 766",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 766",
    price: 766,
  },
  {
    id: 51,
    createdAt: "2024-05-13T02:50:03.444495+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 217",
    phoneNumber: "phoneNumber 217",
    email: "email 217",
    photoUrl: "photoUrl 217",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 217",
    price: 217,
  },
  {
    id: 52,
    createdAt: "2024-05-13T02:50:03.578585+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 161",
    phoneNumber: "phoneNumber 161",
    email: "email 161",
    photoUrl: "photoUrl 161",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 161",
    price: 161,
  },
  {
    id: 53,
    createdAt: "2024-05-13T02:50:03.72806+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 579",
    phoneNumber: "phoneNumber 579",
    email: "email 579",
    photoUrl: "photoUrl 579",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 579",
    price: 579,
  },
  {
    id: 54,
    createdAt: "2024-05-13T02:50:03.879989+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 206",
    phoneNumber: "phoneNumber 206",
    email: "email 206",
    photoUrl: "photoUrl 206",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 206",
    price: 206,
  },
  {
    id: 55,
    createdAt: "2024-05-13T02:50:04.0111+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 86",
    phoneNumber: "phoneNumber 86",
    email: "email 86",
    photoUrl: "photoUrl 86",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 86",
    price: 86,
  },
  {
    id: 56,
    createdAt: "2024-05-13T02:50:04.334572+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 970",
    phoneNumber: "phoneNumber 970",
    email: "email 970",
    photoUrl: "photoUrl 970",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 970",
    price: 970,
  },
  {
    id: 57,
    createdAt: "2024-05-13T02:50:04.469988+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 145",
    phoneNumber: "phoneNumber 145",
    email: "email 145",
    photoUrl: "photoUrl 145",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 145",
    price: 145,
  },
  {
    id: 58,
    createdAt: "2024-05-13T02:50:04.636409+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 238",
    phoneNumber: "phoneNumber 238",
    email: "email 238",
    photoUrl: "photoUrl 238",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 238",
    price: 238,
  },
  {
    id: 59,
    createdAt: "2024-05-13T02:50:04.77021+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 0",
    phoneNumber: "phoneNumber 0",
    email: "email 0",
    photoUrl: "photoUrl 0",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 0",
    price: 0,
  },
  {
    id: 60,
    createdAt: "2024-05-13T02:50:04.919841+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 130",
    phoneNumber: "phoneNumber 130",
    email: "email 130",
    photoUrl: "photoUrl 130",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 130",
    price: 130,
  },
  {
    id: 61,
    createdAt: "2024-05-13T02:50:05.077788+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 419",
    phoneNumber: "phoneNumber 419",
    email: "email 419",
    photoUrl: "photoUrl 419",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 419",
    price: 419,
  },
  {
    id: 62,
    createdAt: "2024-05-13T02:50:05.227611+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 541",
    phoneNumber: "phoneNumber 541",
    email: "email 541",
    photoUrl: "photoUrl 541",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 541",
    price: 541,
  },
  {
    id: 63,
    createdAt: "2024-05-13T02:50:05.386124+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 419",
    phoneNumber: "phoneNumber 419",
    email: "email 419",
    photoUrl: "photoUrl 419",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 419",
    price: 419,
  },
  {
    id: 64,
    createdAt: "2024-05-13T02:50:05.552951+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 522",
    phoneNumber: "phoneNumber 522",
    email: "email 522",
    photoUrl: "photoUrl 522",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 522",
    price: 522,
  },
  {
    id: 65,
    createdAt: "2024-05-13T02:50:05.698657+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 259",
    phoneNumber: "phoneNumber 259",
    email: "email 259",
    photoUrl: "photoUrl 259",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 259",
    price: 259,
  },
  {
    id: 66,
    createdAt: "2024-05-13T02:50:05.848664+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 587",
    phoneNumber: "phoneNumber 587",
    email: "email 587",
    photoUrl: "photoUrl 587",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 587",
    price: 587,
  },
  {
    id: 67,
    createdAt: "2024-05-13T02:50:06.023155+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 366",
    phoneNumber: "phoneNumber 366",
    email: "email 366",
    photoUrl: "photoUrl 366",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 366",
    price: 366,
  },
  {
    id: 68,
    createdAt: "2024-05-13T02:50:06.364078+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 223",
    phoneNumber: "phoneNumber 223",
    email: "email 223",
    photoUrl: "photoUrl 223",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 223",
    price: 223,
  },
  {
    id: 69,
    createdAt: "2024-05-13T02:50:06.507544+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 594",
    phoneNumber: "phoneNumber 594",
    email: "email 594",
    photoUrl: "photoUrl 594",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 594",
    price: 594,
  },
  {
    id: 70,
    createdAt: "2024-05-13T03:20:21.37495+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 311",
    phoneNumber: "phoneNumber 311",
    email: "email 311",
    photoUrl: "photoUrl 311",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 311",
    price: 311,
  },
  {
    id: 71,
    createdAt: "2024-05-13T03:20:21.553158+03:00",
    updatedAt: "2021-09-03T14:00:00+03:00",
    deletedAt: "0001-01-01T02:57:40+02:57",
    fullName: "fullName 203",
    phoneNumber: "phoneNumber 203",
    email: "email 203",
    photoUrl: "photoUrl 203",
    birthDate: "2021-09-03T11:00:00.000Z",
    gender: "",
    bio: "bio 203",
    price: 203,
  },
];
