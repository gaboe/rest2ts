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
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as any);
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
  
export enum ContractTypeCode {
	BEN = "BEN",
	CONSIGNMENT = "CONSIGNMENT",
	DYN = "DYN",
	FCG = "FCG",
	LIBERO_RS = "LIBERO_RS",
	OKP = "OKP",
	OKS_FKI = "OKS_FKI",
	OKS_Investor = "OKS_Investor",
	OKS_LC = "OKS_LC",
	OKS_LC_EX = "OKS_LC_EX",
	OKS_LC_EX_ = "OKS_LC_EX_",
	OKSP_LC = "OKSP_LC",
	OKSP_LC_EX = "OKSP_LC_EX",
	OKSP_LC_EX_ = "OKSP_LC_EX_",
	RS_INVCZK = "RS_INVCZK",
	RS_INVCZKSELF = "RS_INVCZKSELF",
	RS_INVEUR = "RS_INVEUR",
	RS_INVEURSELF = "RS_INVEURSELF",
	RS_INVPROFICZK = "RS_INVPROFICZK",
	RS_OKSmartFondy = "RS_OKSmartFondy",
	RS_OKSmartFondy_EX = "RS_OKSmartFondy_EX",
	RS_OKSmartFondy_EX_ = "RS_OKSmartFondy_EX_",
	RS_OKSmartProdukty = "RS_OKSmartProdukty",
	RS_OKSmartProdukty_EX = "RS_OKSmartProdukty_EX",
	RS_OKSmartProdukty_EX_ = "RS_OKSmartProdukty_EX_"
};

export type ProductItemDto = {
	className?: string | null;
	order?: number | null;
	singleMinInvestment?: number | null;
	singleMaxInvestment?: number | null;
	singleDefaultInvestment?: number | null;
	periodicalMinInvestment?: number | null;
	periodicalMaxInvestment?: number | null;
	periodicalDefaultInvestment?: number | null;
	color?: string | null;
	hasPeriodicalRedemption?: boolean | null;
	minPerformance?: number | null;
	maxPerformance?: number | null;
	productCode?: string | null;
	isin?: string | null;
	productName?: string | null;
	productSingleSS?: string | null;
	productPeriodicalSS?: string | null;
};

export type ProcessBankIDVerificationCommandResult = {
	status: ProcessBankIDVerificationCommandResultStatus;
	profile?: BankIDProfileResponse | null;
};

export enum ProcessBankIDVerificationCommandResultStatus {
	BankIDUserInfoError = "BankIDUserInfoError",
	Success = "Success",
	Fail = "Fail",
	VerificationAlreadyExists = "VerificationAlreadyExists"
};

export type BankIDProfileResponse = {
	sub: string;
	txn: string;
	verified_claims?: VerifiedClaimsDto | null;
	given_name: string;
	family_name: string;
	gender: string;
	birthdate: string;
	birthnumber?: string | null;
	age: number;
	majority: boolean;
	date_of_death: any;
	birthplace: string;
	primary_nationality: string;
	nationalities: string[];
	maritalstatus: string;
	email: string;
	phone_number: string;
	pep: boolean;
	limited_legal_capacity: boolean;
	addresses: Address[];
	idcards: Idcard[];
	paymentAccounts: string[];
	updated_at: number;
};

export type VerifiedClaimsDto = {
	verification?: Verification | null;
	claims: Claims;
};

export type Verification = {
	trust_framework?: string | null;
	verification_process: string;
};

export type Claims = {
	given_name: string;
	family_name: string;
	gender: string;
	birthdate: string;
	addresses: Address[];
	idcards: Idcard[];
};

export type Address = {
	type: string;
	street: string;
	buildingapartment: string;
	streetnumber: string;
	city: string;
	zipcode: string;
	country: string;
	ruian_reference: string;
};

export type Idcard = {
	type: string;
	description: string;
	country: string;
	number: string;
	valid_to: string;
	issuer: string;
	issue_date: string;
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

  getApiBankIDVerifyBankId(token?: string | undefined | null): Observable<ResponseResult<ProcessBankIDVerificationCommandResult, 200>> {
    const queryParams = {
      "token": token
    };
    return apiGet<ResponseResult<ProcessBankIDVerificationCommandResult, 200>>(this.httpClient, `${this.baseUrl}/api/BankID/verify-bank-id`, queryParams);
  }

  getApiProductList(contractTypeCode?: ContractTypeCode | undefined | null): Observable<ResponseResult<ProductItemDto[], 200>> {
    const queryParams = {
      "contractTypeCode": contractTypeCode
    };
    return apiGet<ResponseResult<ProductItemDto[], 200>>(this.httpClient, `${this.baseUrl}/api/product/list`, queryParams);
  }
}

