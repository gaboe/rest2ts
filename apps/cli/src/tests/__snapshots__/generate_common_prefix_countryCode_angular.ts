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
  
export type Session = {
	sessionId: string;
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

  postCountryCodeVerify(body: string): Observable<ResponseResult<void, 200>> {
    const requestData = getApiRequestData<string>(body, false);

    return apiPost<ResponseResult<void, 200>>(this.httpClient, `${this.baseUrl}/{countryCode}/verify`, requestData);
  }

  postCountryCodeSessions(countryCode?: string, lang?: string, type?: string): Observable<ResponseResult<Session, 201>> {
		const queryParams = {
      "lang": lang,
      "type": type
    };
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<Session, 201>>(this.httpClient, `${this.baseUrl}/${countryCode}/Sessions`, requestData, queryParams);
  }
}

