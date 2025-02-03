/* eslint-disable */
// THIS FILE WAS GENERATED
// ALL CHANGES WILL BE OVERWRITTEN

// INFRASTRUCTURE START

import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type FlattenableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | FlattenableValue[]
  | {
      [prop: string]: FlattenableValue;
    };

type QueryParams = { [key: string]: FlattenableValue } | null | undefined;


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


function flattenQueryParams(data: QueryParams) {
  const params: Record<string, any> = {};
  flatten(params, data, '');
  return params;
}

function flatten(params: any, data: FlattenableValue, path: string) {
  for (const key of Object.keys(data)) {
    if (data[key] instanceof Array) {
      data[key].forEach((item: FlattenableValue, index: number) => {
        if (item instanceof Object) {
          flatten(params, item, `${path}${key}[${index}].`);
        } else {
          params[`${path}${key}[${index}]`] = item;
        }
      });
    } else if (data[key]?.constructor === Object) {
      flatten(params, data[key], `${path}${key}.`);
    } else {
      params[`${path}${key}`] = data[key];
    }
  }
}

type ResponseResult<T, U extends number = 0> = {
  status: U;
  response: U extends 0 ? unknown : T;
};

function createQueryUrl(url: string, paramsObject: QueryParams) {
  const queryString = Object.entries(flattenQueryParams(paramsObject))
    .map(([key, val]) => {
			
			if (key && val !== null && val !== undefined) {
				return Array.isArray(val) 
					? val.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`).join('&') 
					: `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
			}
			return null;
		})
		.filter(p => !!p)
    .join("&");

  const maybeQueryString = queryString.length > 0 ? `?${queryString}` : "";
  return `${url}${maybeQueryString}`;
}

function parseErrorResponse<T>(error: unknown): T | unknown {
	try {
		return JSON.parse(error as string) as T;
	} catch (e) {
		return error;
	}
}

function apiGet<T extends ResponseResult<unknown, number>>(
	httpClient: HttpClient,
	url: string,
	params?: QueryParams,
): Observable<T | never> {
	const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.get<HttpResponse<T['response']>>(queryUrl, { observe: 'response' })
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiGetFile<T extends ResponseResult<unknown, number>>(
	httpClient: HttpClient,
	url: string,
	params?: QueryParams,
): Observable<T | never> {
	const mapResult = (response: HttpResponse<Blob>) => {
		const contentDisposition = response.headers ? response.headers.get("content-disposition") : undefined;
		let fileNameMatch = contentDisposition ? /filename\*=(?:(\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/g.exec(contentDisposition) : undefined;
		let fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[3] || fileNameMatch[2] : undefined;
		if (fileName) {
			fileName = decodeURIComponent(fileName);
		} else {
			fileNameMatch = contentDisposition ? /filename="?([^"]*?)"?(;|$)/g.exec(contentDisposition) : undefined;
			fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[1] : undefined;
		}
		return { data: response.body, fileName: fileName };
	}

	const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.get(queryUrl, { observe: 'response', responseType: "blob" })
		.pipe(
			map(
				(r) =>
				({
					status: r.status,
					response: mapResult(r),
				} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPost<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
  params?: QueryParams,
): Observable<T | never> {
  const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.post<HttpResponse<T['response']>>(queryUrl, body, {
			observe: 'response',
		})
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPut<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
  params?: QueryParams,
): Observable<T | never> {
  const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.put<HttpResponse<T['response']>>(queryUrl, body, {
			observe: 'response',
		})
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiDelete<T extends ResponseResult<unknown, number>>(
	httpClient: HttpClient,
	url: string,
	params?: QueryParams,
) {
	const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.delete<HttpResponse<T['response']>>(queryUrl, { observe: 'response' })
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

function apiPatch<T extends ResponseResult<unknown, number>, U = unknown>(
	httpClient: HttpClient,
	url: string,
	body: U,
  params?: QueryParams,
): Observable<T | never> {
  const queryUrl = !!params ? createQueryUrl(url, params) : url;
	return httpClient
		.patch<HttpResponse<T['response']>>(queryUrl, body, {
			observe: 'response',
		})
		.pipe(
			map(
				(r) =>
					({
						status: r.status,
						response: r.body as T['response'],
					} as T),
			),
			catchError((err) => {
				if (err instanceof HttpErrorResponse) {
					return of({ status: err.status, response: parseErrorResponse<T>(err.error) }) as Observable<T>;
				}
				return throwError(() => err);
			}),
		);
}

// INFRASTRUCTURE END

export interface FileResponse {
  data: Blob;
  fileName?: string;
}
  
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



export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable()
export class ApiService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(
    @Inject(HttpClient) httpClient: HttpClient,
    @Optional() @Inject(API_BASE_URL) baseUrl?: string
  ) {
      this.httpClient = httpClient;
      this.baseUrl = baseUrl ?? "";
  }

  postPetPetIdUploadImage(petId: number): Observable<ResponseResult<ApiResponse, 200>> {
    const requestData = getApiRequestData<object>(undefined, true);

    return apiPost<ResponseResult<ApiResponse, 200>>(this.httpClient, `${this.baseUrl}/pet/${petId}/uploadImage`, requestData);
  }

  postPet(requestContract: Pet): Observable<ResponseResult<void, 405>> {
    const requestData = getApiRequestData<Pet>(requestContract, false);

    return apiPost<ResponseResult<void, 405>>(this.httpClient, `${this.baseUrl}/pet`, requestData);
  }

  putPet(requestContract: Pet): Observable<ResponseResult<void, 400> | ResponseResult<void, 404> | ResponseResult<void, 405>> {
    const requestData = getApiRequestData<Pet>(requestContract, false);

    return apiPut<ResponseResult<void, 400> | ResponseResult<void, 404> | ResponseResult<void, 405>>(this.httpClient, `${this.baseUrl}/pet`, requestData);
  }

  getPetFindByStatus(status: string[]): Observable<ResponseResult<Pet[], 200> | ResponseResult<void, 400>> {
    const queryParams = {
      "status": status
    };
    return apiGet<ResponseResult<Pet[], 200> | ResponseResult<void, 400>>(this.httpClient, `${this.baseUrl}/pet/findByStatus`, queryParams);
  }

  getPetFindByTags(tags: string[]): Observable<ResponseResult<Pet[], 200> | ResponseResult<void, 400>> {
    const queryParams = {
      "tags": tags
    };
    return apiGet<ResponseResult<Pet[], 200> | ResponseResult<void, 400>>(this.httpClient, `${this.baseUrl}/pet/findByTags`, queryParams);
  }

  getPetPetId(petId: number): Observable<ResponseResult<Pet, 200> | ResponseResult<void, 400> | ResponseResult<void, 404>> {
    return apiGet<ResponseResult<Pet, 200> | ResponseResult<void, 400> | ResponseResult<void, 404>>(this.httpClient, `${this.baseUrl}/pet/${petId}`);
  }

  deletePetPetId(petId: number): Observable<ResponseResult<void, 400> | ResponseResult<void, 404>> {
    return apiDelete<ResponseResult<void, 400> | ResponseResult<void, 404>>(this.httpClient, `${this.baseUrl}/pet/${petId}`);
  }

  postPetPetId(petId: number): Observable<ResponseResult<void, 405>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<void, 405>>(this.httpClient, `${this.baseUrl}/pet/${petId}`, requestData);
  }

  getStoreInventory(): Observable<ResponseResult<object, 200>> {
    return apiGet<ResponseResult<object, 200>>(this.httpClient, `${this.baseUrl}/store/inventory`);
  }

  postStoreOrder(requestContract: Order): Observable<ResponseResult<Order, 200> | ResponseResult<void, 400>> {
    const requestData = getApiRequestData<Order>(requestContract, false);

    return apiPost<ResponseResult<Order, 200> | ResponseResult<void, 400>>(this.httpClient, `${this.baseUrl}/store/order`, requestData);
  }

  getStoreOrderOrderId(orderId: number): Observable<ResponseResult<Order, 200> | ResponseResult<void, 400> | ResponseResult<void, 404>> {
    return apiGet<ResponseResult<Order, 200> | ResponseResult<void, 400> | ResponseResult<void, 404>>(this.httpClient, `${this.baseUrl}/store/order/${orderId}`);
  }

  deleteStoreOrderOrderId(orderId: number): Observable<ResponseResult<void, 400> | ResponseResult<void, 404>> {
    return apiDelete<ResponseResult<void, 400> | ResponseResult<void, 404>>(this.httpClient, `${this.baseUrl}/store/order/${orderId}`);
  }

  postUserCreateWithList(requestContract: User[]): Observable<ResponseResult<void, 201>> {
    const requestData = getApiRequestData<User[]>(requestContract, false);

    return apiPost<ResponseResult<void, 201>>(this.httpClient, `${this.baseUrl}/user/createWithList`, requestData);
  }

  getUserUsername(username: string): Observable<ResponseResult<User, 200> | ResponseResult<void, 400> | ResponseResult<void, 404>> {
    return apiGet<ResponseResult<User, 200> | ResponseResult<void, 400> | ResponseResult<void, 404>>(this.httpClient, `${this.baseUrl}/user/${username}`);
  }

  deleteUserUsername(username: string): Observable<ResponseResult<void, 400> | ResponseResult<void, 404>> {
    return apiDelete<ResponseResult<void, 400> | ResponseResult<void, 404>>(this.httpClient, `${this.baseUrl}/user/${username}`);
  }

  putUserUsername(requestContract: User, username: string): Observable<ResponseResult<void, 400> | ResponseResult<void, 404>> {
    const requestData = getApiRequestData<User>(requestContract, false);

    return apiPut<ResponseResult<void, 400> | ResponseResult<void, 404>>(this.httpClient, `${this.baseUrl}/user/${username}`, requestData);
  }

  getUserLogin(username: string, password: string): Observable<ResponseResult<string, 200> | ResponseResult<void, 400>> {
    const queryParams = {
      "username": username,
      "password": password
    };
    return apiGet<ResponseResult<string, 200> | ResponseResult<void, 400>>(this.httpClient, `${this.baseUrl}/user/login`, queryParams);
  }

  getUserLogout(): Observable<ResponseResult<void, 200>> {
    return apiGet<ResponseResult<void, 200>>(this.httpClient, `${this.baseUrl}/user/logout`);
  }

  postUserCreateWithArray(requestContract: User[]): Observable<ResponseResult<void, 201>> {
    const requestData = getApiRequestData<User[]>(requestContract, false);

    return apiPost<ResponseResult<void, 201>>(this.httpClient, `${this.baseUrl}/user/createWithArray`, requestData);
  }

  postUser(requestContract: User): Observable<ResponseResult<void, 201>> {
    const requestData = getApiRequestData<User>(requestContract, false);

    return apiPost<ResponseResult<void, 201>>(this.httpClient, `${this.baseUrl}/user`, requestData);
  }
}

