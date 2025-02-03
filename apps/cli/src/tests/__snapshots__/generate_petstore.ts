/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN

// INFRASTRUCTURE START
  export type StandardError = globalThis.Error;
  export type Error500s = 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
  export type ErrorStatuses = 0 | Error500s;
  export type ErrorResponse = FetchResponse<unknown, ErrorStatuses>;

  export type FetchResponseOfError = {
    data: null;
    error: StandardError;
    status: ErrorStatuses;
    args: FetchArgs;
  };

  export type FetchResponseOfSuccess<TData, TStatus extends number = 0> = 
  {
    data: TData;
    error: null;
    status: TStatus;
    args: FetchArgs;
    responseHeaders: Headers;
  };

  export type FetchResponse<TData, TStatus extends number = 0> = 
    TStatus extends ErrorStatuses ? FetchResponseOfError: FetchResponseOfSuccess<TData, TStatus>;

  export type TerminateRequest = null;
  export type TerminateResponse = null;

  export type Configuration = {
    apiUrl: string | (() => string);
    jwtKey: string | undefined | (() => string | null | undefined);
    requestMiddlewares?: Array<{
      name: string;
      fn: (request: FetchArgs) => FetchArgs | TerminateRequest;
    }>;
    responseMiddlewares?: Array<{
      name: string;
      fn: <TData, TStatus extends number>(
        response: FetchResponse<TData, TStatus>,
      ) => FetchResponse<TData, TStatus> | TerminateResponse;
    }>;
  };

  let CONFIG: Configuration = {
    apiUrl: () => "",
    jwtKey: undefined,
    requestMiddlewares: [],
    responseMiddlewares: [],
  };

  export function setupClient(configuration: Configuration) {
    CONFIG = {
      ...CONFIG,
      ...configuration,
      requestMiddlewares: [
        ...(CONFIG.requestMiddlewares || []),
        ...(configuration.requestMiddlewares || []),
      ],
      responseMiddlewares: [
        ...(CONFIG.responseMiddlewares || []),
        ...(configuration.responseMiddlewares || []),
      ],
    };
  }

  export function getApiUrl() {
    if (typeof CONFIG.apiUrl === "function") {
      return CONFIG.apiUrl();
    }
    return CONFIG.apiUrl;
  }

  export type Termination = {
    termination: {
      name: string;
    };
  };

  export function processRequestWithMiddlewares(
    request: FetchArgs
  ): FetchArgs | Termination {
    for (const middleware of CONFIG.requestMiddlewares || []) {
      try {
        const middlewareResponse = middleware.fn(request);
        if (middlewareResponse === null) {
          return { termination: { name: middleware.name } };
        }
        return middlewareResponse;
      } catch (e) {
        console.error("Request middleware error", e);
      }
    }
    return request;
  }

  export function processResponseWithMiddlewares<TData, TStatus extends number>(
    response: FetchResponse<TData, TStatus>,
  ): FetchResponse<TData, TStatus | 0> {
    for (const middleware of CONFIG.responseMiddlewares || []) {
      try {
        const middlewareResponse = middleware.fn(response);
        if (middlewareResponse === null) {
          return {
            status: 0,
            args: response.args,
            data: null,
            error: new Error(
              `Response terminated by middleware: ${middleware.name}`
            ),
          } satisfies FetchResponseOfError;
        }
        response = middlewareResponse;
      } catch (e) {
        console.error("Response middleware error", e);
      }
    }
    return response;
  }

  export type FetchArgsOptions = Omit<RequestInit, "method" | "redirect" | "body">;

  export type FetchArgs = {
    url: string;
    options: RequestInit;
  }

  export type UriComponent = string | number | boolean;
  export type ParamsObject = {
    [key: string]: UriComponent | UriComponent[] | undefined | null;
  };

  export async function fetchJson<TData>(args: FetchArgs): Promise<FetchResponse<TData, number> | FetchResponseOfError> {
    const errorResponse = (error: StandardError, status: number, args: FetchArgs) => {  
      const errorResponse = {
        status: status as ErrorStatuses,
        args,
        data: null,
        error,
      } satisfies FetchResponseOfError;

      return processResponseWithMiddlewares(errorResponse);
    };

    const errorStatus = (args: FetchArgs) => {
      const errorResponse = {
        status: 0,
        args,
        data: null,
        error: new Error("Network error"),
      } satisfies FetchResponseOfError;

      return processResponseWithMiddlewares(errorResponse);
    };

    try {
      const fetchRequest = processRequestWithMiddlewares(args);

      if ("termination" in fetchRequest) {
        const terminationResponse = {
          status: 0,
          args,
          data: null,
          error: new Error(
            `Request terminated by middleware: ${fetchRequest.termination.name}`
          ),
        } satisfies FetchResponseOfError;

        return processResponseWithMiddlewares(terminationResponse);
      }

      const fetchResponse: Response = await fetch(fetchRequest.url, fetchRequest.options);
      const status = fetchResponse.status;
      try {
        const json = await fetchResponse.json();
        const response = {
          data: json,
          status: fetchResponse.status,
          args,
          error: null,
          responseHeaders: fetchResponse.headers,
        };
        return processResponseWithMiddlewares(response);
      } catch (error) {
        return errorResponse(error as StandardError, status, args);
      }
    } catch {
      return errorStatus(args);
    }
  }

  export function getJwtKey(): string | null | undefined {
    if (typeof CONFIG.jwtKey === "function") {
      return CONFIG.jwtKey();
    }

    if (typeof CONFIG.jwtKey === "string") {
      return localStorage.getItem(CONFIG.jwtKey);
    }

    return undefined;
  } 
  
  
 function getApiRequestData<Type extends any>(
    requestContract: Type | undefined,
    isFormData: boolean = false
  ): FormData | Type | {} {
  
    if (!isFormData) {
      return requestContract !== undefined ? requestContract : {};
    }
  
    //multipart/form-data
    const formData = new FormData();
  
     if (requestContract) {
      Object.keys(requestContract).forEach(key => {
        const value = requestContract[key as keyof Type];
        const isKeyArrayAndValueIterable = key.endsWith('[]') && typeof (value as any)[Symbol.iterator] === 'function';
        const values = isKeyArrayAndValueIterable ? Array.from(value as Iterable<any>) : [value];
          for (const val of values) {
              if (val === undefined) {
                  continue;
              }
              if (val === null) {
                  formData.append(key, '');
              } else if (val instanceof File) {
                  formData.append(key, val);
              } else if (typeof val === 'object' && val !== null) {
                  formData.append(key, JSON.stringify(val));
              } else {
                  formData.append(key, val);
              }
          }
      });
    }
  
    return formData;
  }

  
function updateHeaders(headers: HeadersInit) {
  const token = getJwtKey();
  if (headers instanceof Headers) {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    if (!headers.has("Authorization") && !!token) {
      headers.append("Authorization", token);
    }
    return;
  }

  if (Array.isArray(headers)) {
    if (!headers.find(([key]) => key === "Content-Type")) {
      headers.push(["Content-Type", "application/json"]);
    }
    if (!headers.find(([key]) => key === "Authorization") && !!token) {
      headers.push(["Authorization", token]);
    }
    return;
  }

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (!headers.Authorization && !!token) {
    headers.Authorization = token;
  }
}

function removeContentTypeHeader(headers: HeadersInit) {
  if (headers instanceof Headers) {
    headers.delete("Content-Type");
    return;
  }

  if (Array.isArray(headers)) {
    return headers.filter(([key]) => key !== "Content-Type");
  }

  delete headers["Content-Type"];
}

export function createRequest<TRequest>(
  method: string,
  request: TRequest | undefined,
  options: FetchArgsOptions | undefined,
  url: string,
  paramsObject: ParamsObject = {},
) {
  const fetchOptions = options ?? {};

  if (!fetchOptions.headers) {
    fetchOptions.headers = new Headers();
  }

  updateHeaders(fetchOptions.headers);
  if (request instanceof FormData) {
    removeContentTypeHeader(fetchOptions.headers);
  }

  const body = request !== undefined || !(request instanceof FormData) ? JSON.stringify(request) : undefined;
  const maybeQueryString = getQueryParamsString(paramsObject);

  const requestOptions: RequestInit = {
    ...fetchOptions,
    method,
    body,
    redirect: "follow",
  };

  return { options: requestOptions, url: `${url}${maybeQueryString}` } as FetchArgs;
}

export function getQueryParamsString(paramsObject: ParamsObject = {}) {
	const queryString = Object.entries(paramsObject)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(val => `${encodeURIComponent(key)}=${encodeURIComponent(
            val,
          )}`)
          .join('&');
      }
      // Handling non-array parameters
      return value !== undefined && value !== null 
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}` 
        : '';
    })
    .filter(part => part !== '')
    .join("&");

	return queryString.length > 0 ? `?${queryString}` : '';
}

export function apiPost<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("POST", request, options, url, paramsObject));
}

export function apiGet<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("GET", undefined, options, url, paramsObject));
}

export function apiPut<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("PUT", request, options, url, paramsObject));
}

export function apiDelete<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("DELETE", undefined, options, url, paramsObject));
}

export function apiPatch<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  options: FetchArgsOptions | undefined,
  paramsObject: ParamsObject = {}
) {
  return fetchJson<TResponse>(createRequest("PATCH", request, options, url, paramsObject));
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

export type PostPetPetIdUploadImageFetchResponse = 
| FetchResponse<ApiResponse, 200> 
| ErrorResponse;

export const postPetPetIdUploadImagePath = (petId: number) => `/pet/${petId}/uploadImage`;

export const postPetPetIdUploadImage = (petId: number, options?: FetchArgsOptions):
  Promise<PostPetPetIdUploadImageFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, true);

    return apiPost(`${getApiUrl()}${postPetPetIdUploadImagePath(petId)}`, requestData, options) as Promise<PostPetPetIdUploadImageFetchResponse>;
}

export type PostPetFetchResponse = 
| FetchResponse<void, 405> 
| ErrorResponse;

export const postPetPath = () => `/pet`;

export const postPet = (requestContract: Pet, options?: FetchArgsOptions):
  Promise<PostPetFetchResponse> => {
    const requestData = getApiRequestData<Pet>(requestContract, false);

    return apiPost(`${getApiUrl()}${postPetPath()}`, requestData, options) as Promise<PostPetFetchResponse>;
}

export type PutPetFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| FetchResponse<void, 405> 
| ErrorResponse;

export const putPetPath = () => `/pet`;

export const putPet = (requestContract: Pet, options?: FetchArgsOptions):
  Promise<PutPetFetchResponse> => {
    const requestData = getApiRequestData<Pet>(requestContract, false);

    return apiPut(`${getApiUrl()}${putPetPath()}`, requestData, options) as Promise<PutPetFetchResponse>;
}

export type GetPetFindByStatusFetchResponse = 
| FetchResponse<Pet[], 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const getPetFindByStatusPath = () => `/pet/findByStatus`;

export const getPetFindByStatus = (status: string[], options?: FetchArgsOptions):
  Promise<GetPetFindByStatusFetchResponse> => {
    const queryParams = {
      "status": status
    }
    return apiGet(`${getApiUrl()}${getPetFindByStatusPath()}`, options, queryParams) as Promise<GetPetFindByStatusFetchResponse>;
}

export type GetPetFindByTagsFetchResponse = 
| FetchResponse<Pet[], 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const getPetFindByTagsPath = () => `/pet/findByTags`;

export const getPetFindByTags = (tags: string[], options?: FetchArgsOptions):
  Promise<GetPetFindByTagsFetchResponse> => {
    const queryParams = {
      "tags": tags
    }
    return apiGet(`${getApiUrl()}${getPetFindByTagsPath()}`, options, queryParams) as Promise<GetPetFindByTagsFetchResponse>;
}

export type GetPetPetIdFetchResponse = 
| FetchResponse<Pet, 200> 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const getPetPetIdPath = (petId: number) => `/pet/${petId}`;

export const getPetPetId = (petId: number, options?: FetchArgsOptions):
  Promise<GetPetPetIdFetchResponse> => {
    return apiGet(`${getApiUrl()}${getPetPetIdPath(petId)}`, options, {}) as Promise<GetPetPetIdFetchResponse>;
}

export type DeletePetPetIdFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const deletePetPetIdPath = (petId: number) => `/pet/${petId}`;

export const deletePetPetId = (petId: number, options?: FetchArgsOptions):
  Promise<DeletePetPetIdFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deletePetPetIdPath(petId)}`, options, {}) as Promise<DeletePetPetIdFetchResponse>;
}

export type PostPetPetIdFetchResponse = 
| FetchResponse<void, 405> 
| ErrorResponse;

export const postPetPetIdPath = (petId: number) => `/pet/${petId}`;

export const postPetPetId = (petId: number, options?: FetchArgsOptions):
  Promise<PostPetPetIdFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postPetPetIdPath(petId)}`, requestData, options) as Promise<PostPetPetIdFetchResponse>;
}

export type GetStoreInventoryFetchResponse = 
| FetchResponse<object, 200> 
| ErrorResponse;

export const getStoreInventoryPath = () => `/store/inventory`;

export const getStoreInventory = (options?: FetchArgsOptions):
  Promise<GetStoreInventoryFetchResponse> => {
    return apiGet(`${getApiUrl()}${getStoreInventoryPath()}`, options, {}) as Promise<GetStoreInventoryFetchResponse>;
}

export type PostStoreOrderFetchResponse = 
| FetchResponse<Order, 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const postStoreOrderPath = () => `/store/order`;

export const postStoreOrder = (requestContract: Order, options?: FetchArgsOptions):
  Promise<PostStoreOrderFetchResponse> => {
    const requestData = getApiRequestData<Order>(requestContract, false);

    return apiPost(`${getApiUrl()}${postStoreOrderPath()}`, requestData, options) as Promise<PostStoreOrderFetchResponse>;
}

export type GetStoreOrderOrderIdFetchResponse = 
| FetchResponse<Order, 200> 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const getStoreOrderOrderIdPath = (orderId: number) => `/store/order/${orderId}`;

export const getStoreOrderOrderId = (orderId: number, options?: FetchArgsOptions):
  Promise<GetStoreOrderOrderIdFetchResponse> => {
    return apiGet(`${getApiUrl()}${getStoreOrderOrderIdPath(orderId)}`, options, {}) as Promise<GetStoreOrderOrderIdFetchResponse>;
}

export type DeleteStoreOrderOrderIdFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const deleteStoreOrderOrderIdPath = (orderId: number) => `/store/order/${orderId}`;

export const deleteStoreOrderOrderId = (orderId: number, options?: FetchArgsOptions):
  Promise<DeleteStoreOrderOrderIdFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteStoreOrderOrderIdPath(orderId)}`, options, {}) as Promise<DeleteStoreOrderOrderIdFetchResponse>;
}

export type PostUserCreateWithListFetchResponse = 
| FetchResponse<void, 201> 
| ErrorResponse;

export const postUserCreateWithListPath = () => `/user/createWithList`;

export const postUserCreateWithList = (requestContract: User[], options?: FetchArgsOptions):
  Promise<PostUserCreateWithListFetchResponse> => {
    const requestData = getApiRequestData<User[]>(requestContract, false);

    return apiPost(`${getApiUrl()}${postUserCreateWithListPath()}`, requestData, options) as Promise<PostUserCreateWithListFetchResponse>;
}

export type GetUserUsernameFetchResponse = 
| FetchResponse<User, 200> 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const getUserUsernamePath = (username: string) => `/user/${username}`;

export const getUserUsername = (username: string, options?: FetchArgsOptions):
  Promise<GetUserUsernameFetchResponse> => {
    return apiGet(`${getApiUrl()}${getUserUsernamePath(username)}`, options, {}) as Promise<GetUserUsernameFetchResponse>;
}

export type DeleteUserUsernameFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const deleteUserUsernamePath = (username: string) => `/user/${username}`;

export const deleteUserUsername = (username: string, options?: FetchArgsOptions):
  Promise<DeleteUserUsernameFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteUserUsernamePath(username)}`, options, {}) as Promise<DeleteUserUsernameFetchResponse>;
}

export type PutUserUsernameFetchResponse = 
| FetchResponse<void, 400> 
| FetchResponse<void, 404> 
| ErrorResponse;

export const putUserUsernamePath = (username: string) => `/user/${username}`;

export const putUserUsername = (requestContract: User, username: string, options?: FetchArgsOptions):
  Promise<PutUserUsernameFetchResponse> => {
    const requestData = getApiRequestData<User>(requestContract, false);

    return apiPut(`${getApiUrl()}${putUserUsernamePath(username)}`, requestData, options) as Promise<PutUserUsernameFetchResponse>;
}

export type GetUserLoginFetchResponse = 
| FetchResponse<string, 200> 
| FetchResponse<void, 400> 
| ErrorResponse;

export const getUserLoginPath = () => `/user/login`;

export const getUserLogin = (username: string, password: string, options?: FetchArgsOptions):
  Promise<GetUserLoginFetchResponse> => {
    const queryParams = {
      "username": username,
      "password": password
    }
    return apiGet(`${getApiUrl()}${getUserLoginPath()}`, options, queryParams) as Promise<GetUserLoginFetchResponse>;
}

export type GetUserLogoutFetchResponse = 
| FetchResponse<void, 200> 
| ErrorResponse;

export const getUserLogoutPath = () => `/user/logout`;

export const getUserLogout = (options?: FetchArgsOptions):
  Promise<GetUserLogoutFetchResponse> => {
    return apiGet(`${getApiUrl()}${getUserLogoutPath()}`, options, {}) as Promise<GetUserLogoutFetchResponse>;
}

export type PostUserCreateWithArrayFetchResponse = 
| FetchResponse<void, 201> 
| ErrorResponse;

export const postUserCreateWithArrayPath = () => `/user/createWithArray`;

export const postUserCreateWithArray = (requestContract: User[], options?: FetchArgsOptions):
  Promise<PostUserCreateWithArrayFetchResponse> => {
    const requestData = getApiRequestData<User[]>(requestContract, false);

    return apiPost(`${getApiUrl()}${postUserCreateWithArrayPath()}`, requestData, options) as Promise<PostUserCreateWithArrayFetchResponse>;
}

export type PostUserFetchResponse = 
| FetchResponse<void, 201> 
| ErrorResponse;

export const postUserPath = () => `/user`;

export const postUser = (requestContract: User, options?: FetchArgsOptions):
  Promise<PostUserFetchResponse> => {
    const requestData = getApiRequestData<User>(requestContract, false);

    return apiPost(`${getApiUrl()}${postUserPath()}`, requestData, options) as Promise<PostUserFetchResponse>;
}
