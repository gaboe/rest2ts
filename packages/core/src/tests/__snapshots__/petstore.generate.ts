/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN

// INFRASTRUCTURE START
type StandardError = globalThis.Error;
type Error500s = 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
type ErrorStatuses = 0 | Error500s;
export type ErrorResponse = FetchResponse<unknown, ErrorStatuses>;

export type FetchResponseOfError = {
  data: null;
  error: StandardError;
  status: ErrorStatuses;
  args: any;
};

export type FetchResponseOfSuccess<TData, TStatus extends number = 0> = {
  data: TData;
  error: null;
  status: TStatus;
  args: any;
  responseHeaders: Headers;
};

export type FetchResponse<
  TData,
  TStatus extends number = 0,
> = TStatus extends ErrorStatuses
  ? FetchResponseOfError
  : FetchResponseOfSuccess<TData, TStatus>;

type Configuration = {
  jwtKey: string | undefined | (() => string | null | undefined);
  onResponse?: (response: FetchResponse<unknown, any>) => void;
};

let CONFIG: Configuration = {
  jwtKey: undefined,
  onResponse: () => {},
};

export function configureApiCalls(configuration: Configuration) {
  CONFIG = { ...CONFIG, ...configuration };
}

async function fetchJson<T extends FetchResponse<unknown, number>>(
  ...args: any
): Promise<T> {
  const errorResponse = (error: StandardError, status: number, args: any) => {
    const errorResponse = {
      status: status as ErrorStatuses,
      args,
      data: null,
      error,
    } satisfies FetchResponse<T>;
    CONFIG.onResponse && CONFIG.onResponse(errorResponse);
    return errorResponse as unknown as T;
  };

  const errorStatus = (args: any) => {
    const errorResponse = {
      status: 0,
      args,
      data: null,
      error: new Error("Network error"),
    } as FetchResponse<T, Error500s>;
    CONFIG.onResponse && CONFIG.onResponse(errorResponse);
    return errorResponse as unknown as T;
  };

  try {
    const res: Response = await (fetch as any)(...args);
    const status = res.status;
    try {
      const json = await res.json();
      const response = {
        data: json,
        status: res.status,
        args,
        error: null,
        responseHeaders: res.headers,
      };
      CONFIG.onResponse && CONFIG.onResponse(response);
      return response as unknown as T;
    } catch (error) {
      return errorResponse(error as StandardError, status, args);
    }
  } catch {
    return errorStatus(args);
  }
}

function getToken(): string | null | undefined {
  if (typeof CONFIG.jwtKey === "function") {
    return CONFIG.jwtKey();
  }

  if (typeof CONFIG.jwtKey === "string") {
    return localStorage.getItem(CONFIG.jwtKey);
  }

  return undefined;
}

function updateHeaders(headers: Headers) {
  if (!headers.has("Content-Type")) {
    headers.append("Content-Type", "application/json");
  }
  const token = getToken();
  if (!headers.has("Authorization") && token) {
    headers.append("Authorization", token);
  }
}

function getQueryParamsString(paramsObject: ParamsObject = {}) {
  const queryString = Object.entries(paramsObject)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((val) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
          .join("&");
      }
      // Handling non-array parameters
      return value !== undefined && value !== null
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        : "";
    })
    .filter((part) => part !== "")
    .join("&");

  return queryString.length > 0 ? `?${queryString}` : "";
}

function apiPost<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  var raw = JSON.stringify(request);
  updateHeaders(headers);
  var requestOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>(
    `${url}${maybeQueryString}`,
    requestOptions as any
  );
}

type ParamsObject = {
  [key: string]: any;
};

function apiGet<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const maybeQueryString = getQueryParamsString(paramsObject);
  const requestOptions = {
    method: "GET",
    headers,
    redirect: "follow",
  };
  return fetchJson<TResponse>(`${url}${maybeQueryString}`, requestOptions);
}

function apiPut<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  var raw = JSON.stringify(request);

  var requestOptions = {
    method: "PUT",
    headers,
    body: raw,
    redirect: "follow",
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>(
    `${url}${maybeQueryString}`,
    requestOptions as any
  );
}

function apiDelete<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);
  const queryString = Object.entries(paramsObject)
    .filter(([_, val]) => val !== undefined && val !== null)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
  const maybeQueryString = queryString.length > 0 ? `?${queryString}` : "";

  var requestOptions = {
    method: "DELETE",
    headers,
    redirect: "follow",
  };
  return fetchJson<TResponse>(`${url}${maybeQueryString}`, requestOptions);
}

function apiPatch<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  var raw = JSON.stringify(request);

  var requestOptions = {
    method: "PATCH",
    headers,
    body: raw,
    redirect: "follow",
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>(
    `${url}${maybeQueryString}`,
    requestOptions as any
  );
}
// INFRASTRUCTURE END

export type ApiResponse = {
  code: number;
  type: string;
  message: string;
};

export type Category = {
  id: number;
  name: string;
};

export type Pet = {
  id: number;
  category: Category;
  name: string;
  photoUrls: string[];
  tags: Tag[];
  status: "available" | "pending" | "sold";
};

export type Tag = {
  id: number;
  name: string;
};

export type Order = {
  id: number;
  petId: number;
  quantity: number;
  shipDate: string;
  status: "placed" | "approved" | "delivered";
  complete: boolean;
};

export type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userStatus: number;
};

const API_URL = "";

export type PostPetPetIdUploadImageFetchResponse =
  | FetchResponse<ApiResponse, 200>
  | ErrorResponse;

export const postPetPetIdUploadImagePath = "/pet/${petId}/uploadImage";

export const postPetPetIdUploadImage = (
  petId: number,
  headers = new Headers()
): Promise<PostPetPetIdUploadImageFetchResponse> => {
  return apiPost(
    `${API_URL}${postPetPetIdUploadImagePath}`,
    {},
    headers
  ) as Promise<PostPetPetIdUploadImageFetchResponse>;
};

export type PostPetFetchResponse = FetchResponse<void, 405> | ErrorResponse;

export const postPetPath = "/pet";

export const postPet = (
  requestContract: Pet,
  headers = new Headers()
): Promise<PostPetFetchResponse> => {
  return apiPost(
    `${API_URL}${postPetPath}`,
    requestContract,
    headers
  ) as Promise<PostPetFetchResponse>;
};

export type PutPetFetchResponse =
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | FetchResponse<void, 405>
  | ErrorResponse;

export const putPetPath = "/pet";

export const putPet = (
  requestContract: Pet,
  headers = new Headers()
): Promise<PutPetFetchResponse> => {
  return apiPut(
    `${API_URL}${putPetPath}`,
    requestContract,
    headers
  ) as Promise<PutPetFetchResponse>;
};

export type GetPetFindByStatusFetchResponse =
  | FetchResponse<Pet[], 200>
  | FetchResponse<void, 400>
  | ErrorResponse;

export const getPetFindByStatus = (
  status: string[],
  headers = new Headers()
): Promise<GetPetFindByStatusFetchResponse> => {
  const queryParams = {
    status: status,
  };
  return apiGet(
    `${API_URL}/pet/findByStatus`,
    headers,
    queryParams
  ) as Promise<GetPetFindByStatusFetchResponse>;
};

export type GetPetFindByTagsFetchResponse =
  | FetchResponse<Pet[], 200>
  | FetchResponse<void, 400>
  | ErrorResponse;

export const getPetFindByTags = (
  tags: string[],
  headers = new Headers()
): Promise<GetPetFindByTagsFetchResponse> => {
  const queryParams = {
    tags: tags,
  };
  return apiGet(
    `${API_URL}/pet/findByTags`,
    headers,
    queryParams
  ) as Promise<GetPetFindByTagsFetchResponse>;
};

export type GetPetPetIdFetchResponse =
  | FetchResponse<Pet, 200>
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | ErrorResponse;

export const getPetPetId = (
  petId: number,
  headers = new Headers()
): Promise<GetPetPetIdFetchResponse> => {
  return apiGet(
    `${API_URL}/pet/${petId}`,
    headers,
    {}
  ) as Promise<GetPetPetIdFetchResponse>;
};

export type DeletePetPetIdFetchResponse =
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | ErrorResponse;

export const deletePetPetId = (
  petId: number,
  headers = new Headers()
): Promise<DeletePetPetIdFetchResponse> => {
  return apiDelete(
    `${API_URL}/pet/${petId}`,
    headers,
    {}
  ) as Promise<DeletePetPetIdFetchResponse>;
};

export type PostPetPetIdFetchResponse =
  | FetchResponse<void, 405>
  | ErrorResponse;

export const postPetPetIdPath = "/pet/${petId}";

export const postPetPetId = (
  petId: number,
  headers = new Headers()
): Promise<PostPetPetIdFetchResponse> => {
  return apiPost(
    `${API_URL}${postPetPetIdPath}`,
    {},
    headers
  ) as Promise<PostPetPetIdFetchResponse>;
};

export type GetStoreInventoryFetchResponse =
  | FetchResponse<object, 200>
  | ErrorResponse;

export const getStoreInventory = (
  headers = new Headers()
): Promise<GetStoreInventoryFetchResponse> => {
  return apiGet(
    `${API_URL}/store/inventory`,
    headers,
    {}
  ) as Promise<GetStoreInventoryFetchResponse>;
};

export type PostStoreOrderFetchResponse =
  | FetchResponse<Order, 200>
  | FetchResponse<void, 400>
  | ErrorResponse;

export const postStoreOrderPath = "/store/order";

export const postStoreOrder = (
  requestContract: Order,
  headers = new Headers()
): Promise<PostStoreOrderFetchResponse> => {
  return apiPost(
    `${API_URL}${postStoreOrderPath}`,
    requestContract,
    headers
  ) as Promise<PostStoreOrderFetchResponse>;
};

export type GetStoreOrderOrderIdFetchResponse =
  | FetchResponse<Order, 200>
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | ErrorResponse;

export const getStoreOrderOrderId = (
  orderId: number,
  headers = new Headers()
): Promise<GetStoreOrderOrderIdFetchResponse> => {
  return apiGet(
    `${API_URL}/store/order/${orderId}`,
    headers,
    {}
  ) as Promise<GetStoreOrderOrderIdFetchResponse>;
};

export type DeleteStoreOrderOrderIdFetchResponse =
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | ErrorResponse;

export const deleteStoreOrderOrderId = (
  orderId: number,
  headers = new Headers()
): Promise<DeleteStoreOrderOrderIdFetchResponse> => {
  return apiDelete(
    `${API_URL}/store/order/${orderId}`,
    headers,
    {}
  ) as Promise<DeleteStoreOrderOrderIdFetchResponse>;
};

export type PostUserCreateWithListFetchResponse =
  | FetchResponse<void, 201>
  | ErrorResponse;

export const postUserCreateWithListPath = "/user/createWithList";

export const postUserCreateWithList = (
  requestContract: User[],
  headers = new Headers()
): Promise<PostUserCreateWithListFetchResponse> => {
  return apiPost(
    `${API_URL}${postUserCreateWithListPath}`,
    requestContract,
    headers
  ) as Promise<PostUserCreateWithListFetchResponse>;
};

export type GetUserUsernameFetchResponse =
  | FetchResponse<User, 200>
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | ErrorResponse;

export const getUserUsername = (
  username: string,
  headers = new Headers()
): Promise<GetUserUsernameFetchResponse> => {
  return apiGet(
    `${API_URL}/user/${username}`,
    headers,
    {}
  ) as Promise<GetUserUsernameFetchResponse>;
};

export type DeleteUserUsernameFetchResponse =
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | ErrorResponse;

export const deleteUserUsername = (
  username: string,
  headers = new Headers()
): Promise<DeleteUserUsernameFetchResponse> => {
  return apiDelete(
    `${API_URL}/user/${username}`,
    headers,
    {}
  ) as Promise<DeleteUserUsernameFetchResponse>;
};

export type PutUserUsernameFetchResponse =
  | FetchResponse<void, 400>
  | FetchResponse<void, 404>
  | ErrorResponse;

export const putUserUsernamePath = "/user/${username}";

export const putUserUsername = (
  requestContract: User,
  username: string,
  headers = new Headers()
): Promise<PutUserUsernameFetchResponse> => {
  return apiPut(
    `${API_URL}${putUserUsernamePath}`,
    requestContract,
    headers
  ) as Promise<PutUserUsernameFetchResponse>;
};

export type GetUserLoginFetchResponse =
  | FetchResponse<string, 200>
  | FetchResponse<void, 400>
  | ErrorResponse;

export const getUserLogin = (
  password: string,
  username: string,
  headers = new Headers()
): Promise<GetUserLoginFetchResponse> => {
  const queryParams = {
    password: password,
    username: username,
  };
  return apiGet(
    `${API_URL}/user/login`,
    headers,
    queryParams
  ) as Promise<GetUserLoginFetchResponse>;
};

export type GetUserLogoutFetchResponse =
  | FetchResponse<void, 200>
  | ErrorResponse;

export const getUserLogout = (
  headers = new Headers()
): Promise<GetUserLogoutFetchResponse> => {
  return apiGet(
    `${API_URL}/user/logout`,
    headers,
    {}
  ) as Promise<GetUserLogoutFetchResponse>;
};

export type PostUserCreateWithArrayFetchResponse =
  | FetchResponse<void, 201>
  | ErrorResponse;

export const postUserCreateWithArrayPath = "/user/createWithArray";

export const postUserCreateWithArray = (
  requestContract: User[],
  headers = new Headers()
): Promise<PostUserCreateWithArrayFetchResponse> => {
  return apiPost(
    `${API_URL}${postUserCreateWithArrayPath}`,
    requestContract,
    headers
  ) as Promise<PostUserCreateWithArrayFetchResponse>;
};

export const postUserPath = "/user";

export type PostUserFetchResponse = FetchResponse<void, 201> | ErrorResponse;

export const postUser = (
  requestContract: User,
  headers = new Headers()
): Promise<PostUserFetchResponse> => {
  return apiPost(
    `${API_URL}${postUserPath}`,
    requestContract,
    headers
  ) as Promise<PostUserFetchResponse>;
};
