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
  
export type ApiProblemDetails = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export type ErrorDetail = {
	code: ErrorCode;
	message?: string | null;
};

export enum ErrorCode {
	Unspecified = "Unspecified",
	OutOfRange = "OutOfRange",
	NotFound = "NotFound",
	Invalid = "Invalid",
	Forbidden = "Forbidden",
	TooManyRequests = "TooManyRequests",
	Conflict = "Conflict",
	NullOrEmpty = "NullOrEmpty",
	Unauthorized = "Unauthorized",
	ExternalProviderNotAvailable = "ExternalProviderNotAvailable"
};

export type ProblemDetails = {
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export type EntityListOfStepDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: StepDto[];
};

export type StepDto = {
	stepID: number;
	type: StepType;
};

export enum StepType {
	Draft = "Draft",
	ClientAssignment = "ClientAssignment",
	ClientReview = "ClientReview",
	ClientApproval = "ClientApproval",
	ProcessingServices = "ProcessingServices",
	ClientInvoiceIssuance = "ClientInvoiceIssuance",
	ClientInvoicePayment = "ClientInvoicePayment",
	EnterpriseInvoiceIssuanceAndPayment = "EnterpriseInvoiceIssuanceAndPayment",
	ClientInvoiceRecurringPayment = "ClientInvoiceRecurringPayment",
	Completed = "Completed",
	ClientPrepaidPaymentApproval = "ClientPrepaidPaymentApproval"
};

export type UserCompanyDto = {
	companyID?: number | null;
	publicID: string;
};

export type SetUserCompanyCommandResult = {};

export type UserCompanySetRequest = {
	publicID: string;
};

export type EntityListOfServicePackageListItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: ServicePackageListItemDto[];
};

export type ServicePackageListItemDto = {
	serviceID: number;
	servicePublicID: string;
	name: string;
	description?: string | null;
	relatedServices?: ServicePackageListRelatedServiceListItemDto[] | null;
	variants?: ServicePackageListVariantListItemDto[] | null;
	canEdit: boolean;
};

export type ServicePackageListRelatedServiceListItemDto = {
	name: string;
};

export type ServicePackageListVariantListItemDto = {
	serviceVariantID: number;
	name: string;
	priceWithoutTax: number;
	priceWithTax: number;
	currencyCode: string;
	frequency: ServiceVariantFrequency;
	product: ServiceVariantProduct;
	taxRate: number;
};

export enum ServiceVariantFrequency {
	Single = "Single",
	Monthly = "Monthly"
};

export enum ServiceVariantProduct {
	None = "None",
	EucsGarance = "EucsGarance"
};

export type EntityListOfServiceListItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: ServiceListItemDto[];
};

export type ServiceListItemDto = {
	name: string;
	description?: string | null;
	servicePublicID: string;
	serviceID: number;
};

export type CreateServicePackageCommandResult = {
	serviceID: number;
	servicePublicID: string;
};

export type SaveServicePackageRequest = {
	name: string;
	description: string;
	relatedServices: SaveServicePackageRelatedService[];
	variants: SaveServicePackageServiceVariant[];
};

export type SaveServicePackageRelatedService = {
	serviceID: number;
};

export type SaveServicePackageServiceVariant = {
	serviceVariantID?: number | null;
	currencyCode: string;
	taxRate: number;
	priceWithoutTax: number;
	priceWithTax: number;
	isEnabled: boolean;
	name: string;
	frequency: ServiceVariantFrequency;
};

export type ServicePackageDto = {
	servicePublicID: string;
	name: string;
	description?: string | null;
	relatedServices: PackageRelatedServiceListItemDto[];
	variants: PackageVariantListItemDto[];
};

export type PackageRelatedServiceListItemDto = {
	name: string;
	servicePublicID: string;
	serviceID: number;
};

export type PackageVariantListItemDto = {
	name: string;
	priceWithoutTax?: number | null;
	priceWithTax?: number | null;
	taxRate?: number | null;
	currencyID: number;
	frequency: ServiceVariantFrequency;
	serviceVariantID: number;
};

export type UpdateServicePackageCommandResult = {
	serviceID: number;
	servicePublicID: string;
};

export type PartyDto = {
	publicID: string;
	type: PartyType;
	firstName?: string | null;
	lastName?: string | null;
	companyName?: string | null;
	taxNumber?: string | null;
	companyNumber?: string | null;
	personalNumber?: string | null;
	birthDate?: string | null;
	isForeigner: boolean;
	isVATPayer?: boolean | null;
	iban?: string | null;
	phone?: string | null;
	email?: string | null;
	identification?: IdentificationType | null;
	identificationNumber?: string | null;
	companyRepresentativeFirstName?: string | null;
	companyRepresentativeLastName?: string | null;
	companyRepresentativeBirthDate?: string | null;
	addresses: AddressDto[];
};

export enum PartyType {
	NaturalPerson = "NaturalPerson",
	LegalEntity = "LegalEntity",
	SelfEmployed = "SelfEmployed"
};

export enum IdentificationType {
	IDCard = "IDCard",
	Other = "Other"
};

export type AddressDto = {
	addressID: number;
	type: AddressType;
	street?: string | null;
	streetNumber?: string | null;
	orientationNumber?: string | null;
	postalCode: string;
	municipality: string;
};

export enum AddressType {
	Permanent = "Permanent",
	Mail = "Mail"
};

export type EntityListOfOrderListItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: OrderListItemDto[];
};

export type OrderListItemDto = {
	orderID: number;
	externalID: string;
	clientFirstName?: string | null;
	clientLastName?: string | null;
	clientCompanyName?: string | null;
	clientFormattedName: string;
	advisorFormattedName: string;
	advisorFirstName?: string | null;
	advisorLastName?: string | null;
	dueDate?: string | null;
	dateOfInvoiceAfterDueDate?: string | null;
	priceWithoutTax: number;
	priceWithTax: number;
	currentStepType: StepType;
	currentStepStatus: OrderWorkflowStepStatus;
	lastCompleteStepType: StepType;
	lastCompleteStepStatus: OrderWorkflowStepStatus;
	currencyCode: string;
	number: number;
	workflowType: WorkflowType;
	areAllStepsCompleted: boolean;
	paymentFrequency: OrderPaymentFrequency;
};

export enum OrderWorkflowStepStatus {
	NotStarted = "NotStarted",
	InProgress = "InProgress",
	Rejected = "Rejected",
	Completed = "Completed"
};

export enum WorkflowType {
	PaidAdvisoryFree = "PaidAdvisoryFree",
	PaidAdvisoryStrict = "PaidAdvisoryStrict",
	PaidAdvisoryRecurringPaymentFree = "PaidAdvisoryRecurringPaymentFree",
	PaidAdvisoryRecurringPaymentStrict = "PaidAdvisoryRecurringPaymentStrict",
	PaidAdvisoryPrepaidPaymentFree = "PaidAdvisoryPrepaidPaymentFree",
	PaidAdvisoryPrepaidPaymentStrict = "PaidAdvisoryPrepaidPaymentStrict",
	PaidAdvisoryPrepaidRecurringPaymentFree = "PaidAdvisoryPrepaidRecurringPaymentFree",
	PaidAdvisoryPrepaidRecurringPaymentStrict = "PaidAdvisoryPrepaidRecurringPaymentStrict"
};

export enum OrderPaymentFrequency {
	Single = "Single",
	Monthly = "Monthly",
	Quarterly = "Quarterly",
	Semiannually = "Semiannually",
	Yearly = "Yearly"
};

export type OrderDto = {
	publicID: string;
	orderID: number;
	number: number;
	priceWithoutTax: number;
	priceWithTax: number;
	currencyCode: string;
	supplierCompanyID: number;
	supplierCompanyPublicID: string;
	supplierPartyPublicID: string;
	clientPartyPublicID: string;
	userID: number;
	userPartyPublicID: string;
	userRelationType: RelationType;
	currentStepType: StepType;
	currentStepStatus: OrderWorkflowStepStatus;
	lastCompleteStepType: StepType;
	lastCompleteStepStatus: OrderWorkflowStepStatus;
	periodicity: OrderPeriodicity;
	frequency?: OrderFrequency | null;
	paymentType: OrderPaymentType;
	nextOrderDate?: string | null;
	serviceRate: OrderServiceRate;
	hourRateServiceVariantID?: number | null;
	hourRatePriceWithoutTax?: number | null;
	hourRatePriceWithTax?: number | null;
	clientID: number;
	clientStatus: OrderClientStatus;
	note?: string | null;
	invoices: OrderInvoiceDto[];
	paymentFrequency: OrderPaymentFrequency;
	paymentFrequencyDateFrom?: string | null;
	paymentFrequencyDateTo?: string | null;
	workflowType: WorkflowType;
	isRecurringPayment: boolean;
	isClientPersonalDataProcessingConsent?: boolean | null;
	isClientElectronicCommunicationConsent?: boolean | null;
	areAllStepsCompleted: boolean;
	dateOfInvoiceAfterDueDate?: string | null;
};

export enum RelationType {
	Visibility = "Visibility",
	OrderActions = "OrderActions",
	Representative = "Representative"
};

export enum OrderPeriodicity {
	Single = "Single",
	Periodic = "Periodic"
};

export enum OrderFrequency {
	Weekly = "Weekly",
	Monthly = "Monthly",
	Quarterly = "Quarterly",
	Yearly = "Yearly"
};

export enum OrderPaymentType {
	PaymentAfterProcessingOrder = "PaymentAfterProcessingOrder",
	Prepaid = "Prepaid"
};

export enum OrderServiceRate {
	FixedPrice = "FixedPrice",
	HourRate = "HourRate"
};

export enum OrderClientStatus {
	New = "New",
	Existing = "Existing"
};

export type OrderInvoiceDto = {
	invoicePublicID: string;
	number: number;
	invoiceForClientByOrderID: number;
	status: ClientInvoiceStatus;
	dateCanceled?: string | null;
};

export enum ClientInvoiceStatus {
	Issued = "Issued",
	Paid = "Paid",
	Canceled = "Canceled"
};

export type DeleteOrderCommandResult = {};

export type SetPeriodicityCommandResult = {};

export type SetPeriodicityRequest = {
	periodicity: OrderPeriodicity;
	frequency?: OrderFrequency | null;
};

export type EntityListOfOrderServiceDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: OrderServiceDto[];
};

export type OrderServiceDto = {
	orderServiceID: number;
	priceWithTax: number;
	priceWithoutTax: number;
	serviceName: string;
	serviceDescription?: string | null;
	serviceVariantName: string;
	currencyCode: string;
	serviceID: number;
	serviceVariantID?: number | null;
	status: OrderServiceStatus;
	dateProcessed: string;
	processedByUserPartyPublicID?: string | null;
	hoursSpent?: number | null;
	serviceType: ServiceType;
	products: OrderServiceProductDto[];
	packageRelatedServices: PackageServiceDto[];
};

export enum OrderServiceStatus {
	NotStarted = "NotStarted",
	Completed = "Completed"
};

export enum ServiceType {
	HourRate = "HourRate",
	ProvidedService = "ProvidedService",
	Package = "Package"
};

export type OrderServiceProductDto = {
	orderServiceProductID: number;
	externalID?: string | null;
	product: ServiceVariantProduct;
	institutionStatus: OrderServiceProductInstitutionStatus;
};

export enum OrderServiceProductInstitutionStatus {
	WaitToCreate = "WaitToCreate",
	Created = "Created",
	Canceled = "Canceled",
	CreationError = "CreationError",
	NotCreatedBecauseTest = "NotCreatedBecauseTest"
};

export type PackageServiceDto = {
	packageServiceID: number;
	relatedService: ServiceDto;
};

export type ServiceDto = {
	publicID: string;
	name: string;
	description?: string | null;
};

export type DeleteOrderServiceCommandResult = {};

export type EntityListOfUpcomingPeriodicOrderDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: UpcomingPeriodicOrderDto[];
};

export type UpcomingPeriodicOrderDto = {
	externalID: string;
	clientFirstName?: string | null;
	clientLastName?: string | null;
	clientCompanyName?: string | null;
	clientFormattedName?: string | null;
	number: number;
};

export type File = {
	utF8NoBOM: Encoding;
};

export type Encoding = {
	default: Encoding;
	preamble: ReadOnlySpanOfByte;
	bodyName: string;
	encodingName: string;
	headerName: string;
	webName: string;
	windowsCodePage: number;
	isBrowserDisplay: boolean;
	isBrowserSave: boolean;
	isMailNewsDisplay: boolean;
	isMailNewsSave: boolean;
	isSingleByte: boolean;
	encoderFallback: EncoderFallback;
	decoderFallback: DecoderFallback;
	isReadOnly: boolean;
	ascii: Encoding;
	latin1: Encoding;
	codePage: number;
	isUTF8CodePage: boolean;
	unicode: Encoding;
	bigEndianUnicode: Encoding;
	utF7: Encoding;
	utF8: Encoding;
	utF32: Encoding;
	bigEndianUTF32: Encoding;
};

export type ReadOnlySpanOfByte = {
	item: Byte;
	length: number;
	isEmpty: boolean;
	empty: ReadOnlySpanOfByte;
};

export type Byte = {};

export type EncoderFallback = {
	replacementFallback: EncoderFallback;
	exceptionFallback: EncoderFallback;
	maxCharCount: number;
};

export type DecoderFallback = {
	replacementFallback: DecoderFallback;
	exceptionFallback: DecoderFallback;
	maxCharCount: number;
};

export type EntityListOfPaymentCalendarItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: PaymentCalendarItemDto[];
};

export type PaymentCalendarItemDto = {
	paymentCalendarItemID: number;
	invoiceDate: string;
	priceWithoutTax: number;
	priceWithTax: number;
	taxRate: number;
	advisorCommissionWithTax?: number | null;
	advisorCommissionWithoutTax?: number | null;
	advisorCommissionTax?: number | null;
	status: PaymentCalendarItemStatus;
	invoiceForClientByOrderInvoiceID?: number | null;
	invoiceForClientByOrderNumber?: number | null;
	invoicePublicID?: string | null;
	invoiceForSupplierCompanyByUserInvoiceID?: number | null;
	invoiceForSupplierCompanyByUserInvoiceNumber?: number | null;
	invoiceForClientByOrderID?: number | null;
	lastReminderSent?: string | null;
	lastReminderSentByUserPartyPublicID?: string | null;
	dateCanceled?: string | null;
	paidByClientDate?: string | null;
	dateOfSentInvoiceToClient?: string | null;
	currencyCode: string;
	invoiceForClientByOrderStatus?: ClientInvoiceStatus | null;
	invoiceForClientByOrderDateCanceled?: string | null;
	processedByUserPartyPublicID?: string | null;
	invoiceDueDate?: string | null;
	isPrepaidInvoiceAfterDueDate: boolean;
	isInvoiceAfterDueDate: boolean;
};

export enum PaymentCalendarItemStatus {
	Created = "Created",
	Canceled = "Canceled",
	SentToClient = "SentToClient",
	PaidByClient = "PaidByClient",
	CommissionPaid = "CommissionPaid"
};

export type GetOrdersCountQueryResult = {
	ordersCount: number;
};

export type ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest = {
	paymentCalendarInvoiceDateTo: string;
	sendEmailToClient: boolean;
};

export type EntityListOfPaymentCalendarClientZoneItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: PaymentCalendarClientZoneItemDto[];
};

export type PaymentCalendarClientZoneItemDto = {
	invoiceDate: string;
	priceWithoutTax: number;
	priceWithTax: number;
	status: PaymentCalendarItemStatus;
	invoicePublicID?: string | null;
	currencyCode: string;
	invoiceDueDate?: string | null;
	isInvoiceAfterDueDate: boolean;
	invoiceNumber?: number | null;
};

export type GetEucsOrderInfoQueryResult = {
	orderInfoResponseDto: OrderInfoResponseDto;
};

export type OrderInfoResponseDto = {
	order_state?: string | null;
	payment_frequency?: string | null;
	account_number?: string | null;
	vs?: number | null;
	amount?: number | null;
	documents: Document[];
	status?: string | null;
};

export type Document = {
	url: string;
	filename: string;
	size: number;
	type: string;
};

export type CancelProductInInstitutionCommandResult = {};

export type CancelProductInInstitutionCommandRequest = {
	product: ServiceVariantProduct;
};

export type CreateProductInInstitutionCommandResult = {
	status: OrderServiceProductInstitutionStatus;
};

export type CreateProductInInstitutionRequest = {
	product: ServiceVariantProduct;
	sendEmailWhenCreationError: boolean;
};

export type EntityListOfOrderWorkflowStepDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: OrderWorkflowStepDto[];
};

export type OrderWorkflowStepDto = {
	type: StepType;
	rank: number;
	status: OrderWorkflowStepStatus;
	dateProcessed?: string | null;
	dateInProgressStarted?: string | null;
	processedByUserPartyPublicID?: string | null;
	clientReviewStep?: ClientReviewStepDto | null;
	clientApprovalStep?: ClientApprovalStepDto | null;
	invoicePaymentStep?: InvoicePaymentStepDto | null;
	clientPrepaidPaymentApprovalStep?: ClientPrepaidPaymentApprovalStepDto | null;
	workflowType: WorkflowType;
};

export type ClientReviewStepDto = {
	clientReviewStepID: number;
	lastReminderSent?: string | null;
};

export type ClientApprovalStepDto = {
	isRevocationDisabled: boolean;
};

export type InvoicePaymentStepDto = {
	invoicePaymentStepID: number;
	lastReminderSent?: string | null;
};

export type ClientPrepaidPaymentApprovalStepDto = {
	isRevocationDisabled: boolean;
};

export type SaveDraftCommandResult = {
	order: OrderDto;
};

export type SaveDraftRequest = {
	orderID: number;
	supplierCompanyID: number;
	clientID: number;
	clientParty: PartyCreateDto;
	periodicity: OrderPeriodicity;
	frequency?: OrderFrequency | null;
	serviceRate: OrderServiceRate;
	paymentFrequency: OrderPaymentFrequency;
	paymentType: OrderPaymentType;
	paymentFrequencyDateFrom?: string | null;
	paymentFrequencyDateTo?: string | null;
	hourRateServiceVariantID?: number | null;
	clientStatus: OrderClientStatus;
	isClientPersonalDataProcessingConsent?: boolean | null;
	isClientElectronicCommunicationConsent?: boolean | null;
	note?: string | null;
	orderServices: SaveDraftOrderService[];
};

export type PartyCreateDto = {
	type: PartyType;
	firstName?: string | null;
	lastName?: string | null;
	companyName?: string | null;
	taxNumber?: string | null;
	companyNumber?: string | null;
	personalNumber?: string | null;
	birthDate?: string | null;
	isForeigner: boolean;
	isVATPayer?: boolean | null;
	iban?: string | null;
	phone?: string | null;
	email?: string | null;
	identification?: IdentificationType | null;
	identificationNumber?: string | null;
	companyRepresentativeFirstName?: string | null;
	companyRepresentativeLastName?: string | null;
	companyRepresentativeBirthDate?: string | null;
	addresses: AddressDto[];
};

export type SaveDraftOrderService = {
	serviceVariantID: number;
	serviceName: string;
	serviceDescription: string;
	serviceVariantName: string;
	serviceVariantProduct: ServiceVariantProduct;
	serviceVariantTaxRate: number;
	priceWithoutTax: number;
	priceWithTax: number;
	taxRate: number;
	hoursSpent?: number | null;
	currencyCode: string;
	serviceType: ServiceType;
};

export type DraftStepCompleteCommandResult = {};

export type GetClientReviewSummaryQueryResult = {
	order: OrderDto;
	clientParty: PartyDto;
	supplierParty: PartyDto;
	orderServices: OrderServiceDto[];
	supplierCompanyPublicID: string;
	enterprisePublicID: string;
	enterpriseEmailCommunicationMode: EnterpriseEmailCommunicationMode;
	userFormatName: string;
	clientApprovalStep: OrderWorkflowStepDto;
	clientPrepaidPaymentApprovalStep: OrderWorkflowStepDto;
	prepaidPaymentInformation?: PrepaidPaymentInformationDto | null;
};

export enum EnterpriseEmailCommunicationMode {
	OnlySupplierCompany = "OnlySupplierCompany",
	SupplierCompanyAndUser = "SupplierCompanyAndUser"
};

export type PrepaidPaymentInformationDto = {
	supplierIban: string;
	variableSymbol: string;
	priceWithoutTax: number;
	priceWithTax: number;
	currencyCode: string;
};

export type SendReminderCommandResult = {};

export type ClientApprovalStepRejectCommandResult = {};

export type ClientApprovalRejectRequest = {
	userAgent: string;
};

export type ClientApprovalStepInitCommandResult = {};

export type CompleteClientApprovalStepCommandResult = {};

export type ApiProblemDetailsOfCompleteClientApprovalStepError = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum CompleteClientApprovalStepError {
	InvalidSignatureCode = "InvalidSignatureCode",
	AlreadyCompleted = "AlreadyCompleted",
	AlreadyRejected = "AlreadyRejected"
};

export type ClientApprovalCompleteRequest = {
	userAgent: string;
	signatureCode: string;
	isRevocationDisabled: boolean;
};

export type OrderServiceCompleteCommandResult = {
	orderService: OrderServiceDto;
	areAllServicesCompleted: boolean;
};

export type InvoiceIssuanceStepCompleteCommandResult = {};

export type InvoicePaymentStepCompleteCommandResult = {};

export type InvoicePaymentStepReminderCommand = {
	publicID: string;
	enterpriseID: number;
};

export type EnterpriseInvoiceIssuanceAndPaymentStepQueryResult = {
	dueDate?: string | null;
};

export type ClientInvoiceRecurringPaymentCancelCommandResult = {};

export type ApiProblemDetailsOfClientInvoiceRecurringPaymentCancelErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum ClientInvoiceRecurringPaymentCancelErrorStatus {
	CannotCancelPaymentCalendarInThisStatus = "CannotCancelPaymentCalendarInThisStatus"
};

export type ClientInvoiceRecurringPaymentReminderCommandResult = {};

export type ApiProblemDetailsOfClientInvoiceRecurringPaymentReminderErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum ClientInvoiceRecurringPaymentReminderErrorStatus {
	InvoiceWasNoSentToClientInPast = "InvoiceWasNoSentToClientInPast",
	InvoiceWasCanceled = "InvoiceWasCanceled"
};

export type ClientPrepaidInvoiceRecurringPaymentReminderCommandResult = {};

export type ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentReminderErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum ClientPrepaidInvoiceRecurringPaymentReminderErrorStatus {
	InvoiceWasCanceled = "InvoiceWasCanceled"
};

export type ClientInvoiceRecurringPaymentCreateInvoiceCommandResult = {};

export type ApiProblemDetailsOfClientInvoiceRecurringPaymentCreateAndSendInvoiceToClientErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum ClientInvoiceRecurringPaymentCreateAndSendInvoiceToClientErrorStatus {
	InvoiceHasAlreadyBeenCreatedAndSentToClient = "InvoiceHasAlreadyBeenCreatedAndSentToClient",
	InvoiceWasCanceled = "InvoiceWasCanceled"
};

export type ClientInvoiceRecurringPaymentClientPaidCommandResult = {};

export type ApiProblemDetailsOfClientInvoiceRecurringPaymentClientPaidErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum ClientInvoiceRecurringPaymentClientPaidErrorStatus {
	HasAlreadyBeenMarkedAsPaid = "HasAlreadyBeenMarkedAsPaid",
	MustBeCreateInvoiceForClientBeforeThisAction = "MustBeCreateInvoiceForClientBeforeThisAction",
	InvoiceWasCanceled = "InvoiceWasCanceled"
};

export type ClientInvoiceRecurringPaymentClientPaidRequest = {
	transactionIDFromBankPayment?: string | null;
	instructionIDFromBankPayment?: string | null;
};

export type ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidCommandResult = {};

export type ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidErrorStatus {
	InvoiceHasAlreadyBeenCreatedAndSentToClient = "InvoiceHasAlreadyBeenCreatedAndSentToClient"
};

export type ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest = {
	transactionIDFromBankPayment?: string | null;
	instructionIDFromBankPayment?: string | null;
};

export type SendClientAssignmentEmailCommandResult = {};

export type ClientPrepaidPaymentApprovalStepCompleteCommandResult = {};

export type ClientPrepaidPaymentApprovalStepCompleteCommandRequest = {
	transactionIDFromBankPayment?: string | null;
	instructionIDFromBankPayment?: string | null;
};

export type ApiProblemDetailsOfInProgressClientApprovalStepError = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum InProgressClientApprovalStepError {
	AlreadyInProgress = "AlreadyInProgress",
	AlreadyRejected = "AlreadyRejected"
};

export type ClientPrepaidPaymentApprovalStepInProgressCommandResult = {};

export type ClientPrepaidPaymentApprovalStepInProgressRequest = {
	userAgent: string;
	isRevocationDisabled: boolean;
};

export type ClientPrepaidPaymentApprovalStepRejectCommandResult = {};

export type ClientPrepaidPaymentApprovalStepRejectRequest = {
	userAgent: string;
};

export type SaveUserNotificationSettingsCommandResult = {};

export type UserNotificationUpdateRequest = {
	isEmailNotificationActive: boolean;
};

export type EntityListOfInvoiceForSupplierCompanyByUserListItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: InvoiceForSupplierCompanyByUserListItemDto[];
};

export type InvoiceForSupplierCompanyByUserListItemDto = {
	invoiceForSupplierCompanyByUserID: number;
	publicID: string;
	number: number;
	invoiceDate: string;
	priceWithTax: number;
	priceWithoutTax: number;
	tax: number;
	currencyID: number;
	customerFormattedName: string;
	customerCompanyNumber?: string | null;
	customerTaxNumber?: string | null;
};

export type InvoiceDto = {
	invoiceID: number;
	number: number;
	invoiceDate: string;
	dueDate?: string | null;
	issuer?: string | null;
	variableSymbol?: string | null;
	constantSymbol?: string | null;
	specificSymbol?: string | null;
	currencyID: number;
	supplier?: PartyDto | null;
	customer?: PartyDto | null;
	priceWithoutTax: number;
	priceWithTax: number;
	tax: number;
	items: InvoiceItemDto[];
};

export type InvoiceItemDto = {
	invoiceItemID: number;
	invoiceID: number;
	name?: string | null;
	amount: number;
	priceWithoutTax: number;
	priceWithTax: number;
	taxRate: number;
};

export type InvoiceISDOCDto = {
	isdocXmlBase64: string;
};

export type InvoiceISDOCPdfBase64Dto = {
	isdocPdfBase64: string;
};

export type InvoiceForSupplierCompanyByUserISDOCPdfBase64ListDto = {
	isdocPdfBase64List: string[];
	isdocPdfsZipBase64: string;
};

export type CancelInvoiceForClientByOrderCommandResult = {};

export type CreateEnterpriseRequest = {
	externalID: string;
	name: string;
	mode: EnterpriseMode;
	designSetting?: EnterpriseDesignSettingDto | null;
	companies?: EnterpriseCompaniesDto | null;
};

export enum EnterpriseMode {
	Strict = "Strict",
	Free = "Free"
};

export type EnterpriseDesignSettingDto = {
	color: string;
	logoBase64?: string | null;
};

export type EnterpriseCompaniesDto = {
	default: EnterpriseCompanyDto;
	others: EnterpriseCompanyDto[];
};

export type EnterpriseCompanyDto = {
	externalId: string;
	invoiceNumberSeries?: number | null;
	designSetting?: EnterpriseCompanyDesignSettingDto | null;
	party: EnterprisePartyDto;
};

export type EnterpriseCompanyDesignSettingDto = {
	logoBase64?: string | null;
};

export type EnterprisePartyDto = {
	type: PartyType;
	firstName?: string | null;
	lastName?: string | null;
	companyName?: string | null;
	taxNumber?: string | null;
	companyNumber?: string | null;
	personalNumber?: string | null;
	isVATPayer?: boolean | null;
	iban?: string | null;
	phoneNumber?: string | null;
	email?: string | null;
	birthDate?: string | null;
	addresses: EnterprisePartyAddressDto[];
};

export type EnterprisePartyAddressDto = {
	type: AddressType;
	municipality: string;
	postalCode: string;
	street?: string | null;
	streetNumber?: string | null;
	orientationNumber?: string | null;
};

export type ChangeEnterpriseModeCommandResult = {};

export type EnterpriseModeChangeRequest = {
	mode: EnterpriseMode;
};

export type SaveEnterpriseDesignSettingsCommandResult = {};

export type EnterpriseDesignSettingsUpdateRequest = {
	color: string;
	logoBase64?: string | null;
};

export type SaveEnterpriseCommunicationSettingsCommandResult = {};

export type EnterpriseCommunicationSettingsUpdateRequest = {
	emailCommunicationMode: EnterpriseEmailCommunicationMode;
	prepaidOrderReminderForPaymentCalendarItemsStatus: EnterprisePrepaidOrderInvoiceToClientCommunicationMode;
};

export enum EnterprisePrepaidOrderInvoiceToClientCommunicationMode {
	Active = "Active",
	Inactive = "Inactive"
};

export type EnterpriseBasicSettingsDto = {
	color: string;
	mode: EnterpriseMode;
	emailCommunicationMode: EnterpriseEmailCommunicationMode;
	prepaidOrderReminderForPaymentCalendarItemsStatus: EnterprisePrepaidOrderInvoiceToClientCommunicationMode;
};

export type CreateEnterpriseCommissionSettingsCommandResult = {};

export type ApiProblemDetailsOfCreateEnterpriseCommissionSettingsErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum CreateEnterpriseCommissionSettingsErrorStatus {
	DateFromIsInConflictWithAnotherCommission = "DateFromIsInConflictWithAnotherCommission",
	DateFromCannotBeInPast = "DateFromCannotBeInPast"
};

export type CreateEnterpriseCommissionSettingsRequest = {
	enterpriseCommissionRate: number;
	advisorCommissionRate: number;
	dateFrom: string;
};

export type EntityListOfEnterpriseCommissionSettingsListItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: EnterpriseCommissionSettingsListItemDto[];
};

export type EnterpriseCommissionSettingsListItemDto = {
	enterpriseCommissionSettingID: number;
	enterpriseCommissionRate: number;
	advisorCommissionRate: number;
	dateFrom: string;
	dateTo?: string | null;
	isActive: boolean;
};

export type EnterpriseServiceSettingsDto = {
	maximalPriceRangeRate?: number | null;
	canUserSetPrice: boolean;
};

export type SaveEnterpriseServiceSettingsCommandResult = {};

export type EnterpriseServiceSettingsUpdateRequest = {
	canUserSetPrice: boolean;
	maximalPriceRangeRate?: number | null;
};

export type EnterpriseServiceListItemDto = {
	serviceSettingID: number;
	serviceID: number;
	name: string;
	description?: string | null;
	isEnabled: boolean;
	type: ServiceType;
	variants: EnterpriseServiceVariantListItemDto[];
};

export type EnterpriseServiceVariantListItemDto = {
	serviceSettingServiceVariantID: number;
	currencyID: number;
	currencyCode: string;
	isEnabled: boolean;
	priceWithoutTax?: number | null;
	taxRate: number;
	priceWithTax?: number | null;
	name: string;
	serviceVariantID: number;
	product: ServiceVariantProduct;
	frequency: ServiceVariantFrequency;
};

export type SaveEnterpriseServicesCommandResult = {};

export type EnterpriseServicesUpdateRequest = {
	services: EnterpriseServiceUpdateListItemDto[];
};

export type EnterpriseServiceUpdateListItemDto = {
	serviceSettingID: number;
	isEnabled: boolean;
	variants: EnterpriseServiceVariantUpdateListItemDto[];
};

export type EnterpriseServiceVariantUpdateListItemDto = {
	serviceSettingServiceVariantID: number;
	isEnabled: boolean;
	priceWithoutTax?: number | null;
	priceWithTax?: number | null;
};

export type EnterpriseLogoDto = {
	logoBase64?: string | null;
};

export type EnterpriseDesignSettingsDto = {
	color: string;
};

export type EnterprisePackageServiceSettingsDto = {
	minimalPriceWithoutTaxSingle?: number | null;
	maximalPriceWithoutTaxSingle?: number | null;
	minimalPriceWithoutTaxMonthly?: number | null;
	maximalPriceWithoutTaxMonthly?: number | null;
	isCreatePackageByAdvisorEnabled: boolean;
	canUserCreatePackage: boolean;
};

export type SaveEnterprisePackageServiceSettingsCommandResult = {};

export type EnterprisePackageServiceSettingsUpdateRequest = {
	minimalPriceWithoutTaxSingle?: number | null;
	maximalPriceWithoutTaxSingle?: number | null;
	minimalPriceWithoutTaxMonthly?: number | null;
	maximalPriceWithoutTaxMonthly?: number | null;
	isCreatePackageByAdvisorEnabled: boolean;
};

export type EntityListOfCutoffListItemDto = {
	offset: number;
	limit: number;
	totalCount: number;
	items: CutoffListItemDto[];
};

export type CutoffListItemDto = {
	publicID: string;
	dateFrom: string;
	dateTo: string;
	dateProcessed: string;
	priceWithoutTax: number;
	currencyID: number;
	priceWithTax: number;
	tax: number;
	companyName: string;
	companyNumber: string;
	taxNumber: string;
	isSendingPaymentsEnabled: boolean;
};

export type CutoffDto = {
	cutoffID: number;
	enterpriseID: number;
	dateFrom: string;
	dateTo: string;
	dateProcessed: string;
	currencyID: number;
	users: CutoffUserDto[];
};

export type CutoffUserDto = {
	cutoffUserID: number;
	userExternalID: string;
	userCompanyParty?: PartyDto | null;
	items: CutoffUserItemDto[];
};

export type CutoffUserItemDto = {
	cutoffUserItemID: number;
	priceWithoutTax: number;
	priceWithTax: number;
	advisorCommissionRate: number;
	advisorCommissionWithoutTax: number;
	advisorCommissionWithTax: number;
	orderNumber: number;
	currencyID: number;
};

export type CreateCutoffCommandResult = {
	pdfBase64: string;
};

export type ApiProblemDetailsOfCreateCutoffErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum CreateCutoffErrorStatus {
	ForThisSupplierCutoffAlreadyRunning = "ForThisSupplierCutoffAlreadyRunning",
	DateFromIsInConflictWithPreviousCutoffDateTo = "DateFromIsInConflictWithPreviousCutoffDateTo"
};

export type CutoffCreateRequest = {
	dateFrom: string;
	dateTo: string;
	isDraft: boolean;
	orderSupplierCompanyID: number;
};

export type DateFromForNextCutoffDto = {
	nextCutoffDateFrom?: string | null;
};

export type GetExpectedUserCommissionQueryResult = {
	expectedUserCommission: number;
};

export type GetPaidUserCommissionQueryResult = {
	paidUserCommission: number;
};

export type CutoffISDOCPdfsDto = {
	isdocPdfsZipBase64: string;
};

export type SendCutoffPaymentsCommandResult = {
	isSuccess: boolean;
};

export type CutoffDetailPdfBase64Dto = {
	cutoffDetailPdfBase64: string;
};

export type CutoffUserSupplierCompanyListItemDto = {
	companyID: number;
	companyName?: string | null;
	taxNumber?: string | null;
	companyNumber?: string | null;
};

export type CompanyDto = {
	companyID: number;
	publicID: string;
	partyID: number;
	isDefault: boolean;
	canBeSelectedToOrderDisabled: boolean;
	invoiceNumberSeries: number;
	party: PartyDto;
};

export type UpdateCompanyCommandResult = {};

export type CompanyUpdateRequest = {
	publicID: string;
	companyNumber: string;
	companyName: string;
	taxNumber?: string | null;
	isVATPayer: boolean;
	phone: string;
	email: string;
	iban: string;
	invoiceNumberSeries: number;
	isDefault: boolean;
	canBeSelectedToOrderDisabled: boolean;
	vatPayerOrderTaxChangeType: VATPayerOrderTaxChangeType;
	address: AddressDto;
};

export enum VATPayerOrderTaxChangeType {
	None = "None",
	IncreaseTax = "IncreaseTax",
	DecreaseTax = "DecreaseTax"
};

export type CreateCompanyCommandResult = {
	publicID: string;
};

export type CompanyCreateRequest = {
	companyNumber: string;
	companyName: string;
	taxNumber?: string | null;
	isVATPayer: boolean;
	phone: string;
	email: string;
	iban: string;
	invoiceNumberSeries: number;
	isDefault: boolean;
	address: AddressDto;
};

export type UserSupplierCompanyListItemDto = {
	companyID: number;
	publicID: string;
	isDefault: boolean;
	isVATPayer?: boolean | null;
	companyName?: string | null;
	taxNumber?: string | null;
	companyNumber?: string | null;
	canBeSelectedToOrderDisabled: boolean;
	permanentAddress: AddressDto;
};

export type SetUserSupplierCompanyCommandResult = {};

export type UserSupplierCompanySetRequest = {
	publicID: string;
};

export type CompanyDesignSettingsDto = {
	logoBase64?: string | null;
};

export type SaveCompanyDesignSettingsCommandResult = {};

export type SaveCompanyDesignSettingsRequest = {
	logoBase64?: string | null;
};

export type CompanyFioSettingsDto = {
	companyFioSettingID: number;
	companyID: number;
	isMatchingPaymentsEnabled: boolean;
	isSendingPaymentsEnabled: boolean;
	isEnabled: boolean;
	fioApiKey?: string | null;
};

export type SaveCompanyFioSettingsCommandResult = {};

export type SaveFioSettingsRequest = {
	isEnabled: boolean;
	isMatchingPaymentsEnabled: boolean;
	isSendingPaymentsEnabled: boolean;
	fioApiKey?: string | null;
};

export type GetCodeListCollectionQueryResult = {
	countries: CodeListItemDto[];
	currencies: CodeListItemDto[];
};

export type CodeListItemDto = {
	id: number;
	code: string;
	name: string;
};

export type GetClientsCountQueryResult = {
	clientsCount: number;
};

export type ClientDto = {
	clientID: number;
	externalClientID?: string | null;
	partyID: number;
	party: PartyDto;
};

export type SignUpCommandResult = {};

export type ApiProblemDetailsOfSignUpErrorStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum SignUpErrorStatus {
	UserExists = "UserExists"
};

export type ApiProblemDetailsOfPasswordChangeResultStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum PasswordChangeResultStatus {
	PasswordNotMatch = "PasswordNotMatch",
	NullOrEmpty = "NullOrEmpty",
	TooShort = "TooShort",
	Success = "Success"
};

export type SignUpCommand = {
	login: string;
	password: string;
};

export type SignInResult = {
	token: string;
	login: string;
	firstName: string;
	lastName: string;
	userIdentityProviders: IdentityProvider[];
	accessRightCodes: string[];
	isFirstSignIn: boolean;
	profilePicture?: string | null;
	logoUrl?: string | null;
	color?: string | null;
};

export enum IdentityProvider {
	Application = "Application",
	Google = "Google",
	BankID = "BankID",
	Broker = "Broker"
};

export type ApiProblemDetailsOfAuthError = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum AuthError {
	ApplicationVerification = "ApplicationVerification",
	InvalidCredentials = "InvalidCredentials",
	AccountIsDisabled = "AccountIsDisabled",
	AccountNotFound = "AccountNotFound",
	PhoneNumberNotFound = "PhoneNumberNotFound",
	SmsSendingFailed = "SmsSendingFailed",
	InvalidToken = "InvalidToken",
	AccountWaitingForEmailConfirmation = "AccountWaitingForEmailConfirmation",
	AccountNotActive = "AccountNotActive"
};

export type SignInCommand = {
	login: string;
	password: string;
};

export type TokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
};

export type EmailVerificationCommandResult = {
	signInResult: SignInResult;
};

export type ApiProblemDetailsOfEmailVerificationCommandResultStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum EmailVerificationCommandResultStatus {
	TokenNotFound = "TokenNotFound",
	UserNotFound = "UserNotFound"
};

export type EmailVerificationCommand = {
	token: string;
};

export type ResendVerificationEmailCommandResult = {};

export type ResendVerificationEmailCommand = {
	email: string;
};

export type SsoSignInRequest = {
	token: string;
	state?: string | null;
	identityProvider: IdentityProvider;
	mode?: AuthMode | null;
	originUrl?: string | null;
};

export enum AuthMode {
	OAuth = "OAuth",
	UserToken = "UserToken"
};

export type RedirectHttpResult = {
	permanent: boolean;
	preserveMethod: boolean;
	url: string;
	acceptLocalUrlOnly: boolean;
};

export type ResetPasswordCommandResult = {};

export type ApiProblemDetailsOfResetPasswordCommandResultStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum ResetPasswordCommandResultStatus {
	Fail = "Fail"
};

export type ResetPasswordCommand = {
	login: string;
};

export type SetPasswordCommandResult = {
	signInResult: SignInResult;
};

export type ApiProblemDetailsOfSetPasswordCommandStatus = {
	errors: { [key: string | number]: ErrorDetail[] };
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
};

export enum SetPasswordCommandStatus {
	TokenNotFound = "TokenNotFound"
};

export type SetPasswordCommand = {
	token: string;
	password: string;
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

  getApiV1WorkflowsSteps(): Observable<ResponseResult<EntityListOfStepDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EntityListOfStepDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/workflows/steps`);
  }

  getApiV1UserCompany(): Observable<ResponseResult<UserCompanyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<UserCompanyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/user/company`);
  }

  putApiV1UserCompany(requestContract: UserCompanySetRequest): Observable<ResponseResult<SetUserCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<UserCompanySetRequest>(requestContract, false);

    return apiPut<ResponseResult<SetUserCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/user/company`, requestData);
  }

  getApiV1ServicesPackages(offset?: number, limit?: number): Observable<ResponseResult<EntityListOfServicePackageListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "offset": offset,
      "limit": limit
    };
    return apiGet<ResponseResult<EntityListOfServicePackageListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/services/packages`, queryParams);
  }

  getApiV1ServicesPackagesAvailableServices(offset?: number, limit?: number): Observable<ResponseResult<EntityListOfServiceListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "offset": offset,
      "limit": limit
    };
    return apiGet<ResponseResult<EntityListOfServiceListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/services/packages/available-services`, queryParams);
  }

  postApiV1ServicesPackage(requestContract: SaveServicePackageRequest): Observable<ResponseResult<CreateServicePackageCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPost<ResponseResult<CreateServicePackageCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/services/package`, requestData);
  }

  getApiV1ServicesServicePublicIDPackage(servicePublicID: string): Observable<ResponseResult<ServicePackageDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<ServicePackageDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/services/${servicePublicID}/package`);
  }

  deleteApiV1ServicesServicePublicIDPackage(servicePublicID: string): Observable<ResponseResult<ServicePackageDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiDelete<ResponseResult<ServicePackageDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/services/${servicePublicID}/package`);
  }

  putApiV1ServicesServicePublicIDPackage(requestContract: SaveServicePackageRequest, servicePublicID: string): Observable<ResponseResult<UpdateServicePackageCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPut<ResponseResult<UpdateServicePackageCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/services/${servicePublicID}/package`, requestData);
  }

  getApiV1PartiesPublicID(publicID: string): Observable<ResponseResult<PartyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<PartyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/parties/${publicID}`);
  }

  getApiV1PartiesSearchAres(query?: string, partyType?: PartyType | undefined | null): Observable<ResponseResult<PartyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "query": query,
      "partyType": partyType
    };
    return apiGet<ResponseResult<PartyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/parties/search/ares`, queryParams);
  }

  getApiV1Orders(offset?: number, limit?: number, workflowStatuses?: string[], query?: string | undefined | null, startDate?: string | undefined | null, endDate?: string | undefined | null, isSearchInStructure?: boolean, onlyAfterInvoiceDueDate?: boolean, includeClientReminderAvailable?: boolean): Observable<ResponseResult<EntityListOfOrderListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "offset": offset,
      "limit": limit,
      "workflowStatuses": workflowStatuses,
      "query": query,
      "startDate": startDate,
      "endDate": endDate,
      "isSearchInStructure": isSearchInStructure,
      "onlyAfterInvoiceDueDate": onlyAfterInvoiceDueDate,
      "includeClientReminderAvailable": includeClientReminderAvailable
    };
    return apiGet<ResponseResult<EntityListOfOrderListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders`, queryParams);
  }

  getApiV1OrdersPublicID(publicID: string): Observable<ResponseResult<OrderDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<OrderDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}`);
  }

  deleteApiV1OrdersPublicID(publicID: string): Observable<ResponseResult<DeleteOrderCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiDelete<ResponseResult<DeleteOrderCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}`);
  }

  putApiV1OrdersPublicIDPeriodicity(requestContract: SetPeriodicityRequest, publicID: string): Observable<ResponseResult<SetPeriodicityCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SetPeriodicityRequest>(requestContract, false);

    return apiPut<ResponseResult<SetPeriodicityCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/periodicity`, requestData);
  }

  getApiV1OrdersPublicIDServices(publicID: string): Observable<ResponseResult<EntityListOfOrderServiceDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EntityListOfOrderServiceDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/services`);
  }

  deleteApiV1OrdersServicesServiceID(serviceID: number): Observable<ResponseResult<DeleteOrderServiceCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiDelete<ResponseResult<DeleteOrderServiceCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/services/${serviceID}`);
  }

  getApiV1OrdersPeriodicUpcoming(offset?: number, limit?: number, nexOrderDate?: string): Observable<ResponseResult<EntityListOfUpcomingPeriodicOrderDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "offset": offset,
      "limit": limit,
      "nexOrderDate": nexOrderDate
    };
    return apiGet<ResponseResult<EntityListOfUpcomingPeriodicOrderDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/periodic/upcoming`, queryParams);
  }

  getApiV1OrdersRevocationExampleFile(): Observable<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 204> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 204> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/revocation/example/file`);
  }

  getApiV1OrdersPublicIDPaymentCalendarItems(publicID: string): Observable<ResponseResult<EntityListOfPaymentCalendarItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EntityListOfPaymentCalendarItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/payment-calendar-items`);
  }

  getApiV1OrdersCount(onlyActive?: boolean): Observable<ResponseResult<GetOrdersCountQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "onlyActive": onlyActive
    };
    return apiGet<ResponseResult<GetOrdersCountQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/count`, queryParams);
  }

  postApiV1OrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClient(requestContract: ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest, orderPublicID: string): Observable<ResponseResult<SetPeriodicityCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest>(requestContract, false);

    return apiPost<ResponseResult<SetPeriodicityCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${orderPublicID}/client-invoice-recurring-payment-create-invoice-and-set-as-paid-by-client`, requestData);
  }

  getApiV1OrdersPublicIDClientZonePaymentCalendarItems(publicID: string): Observable<ResponseResult<EntityListOfPaymentCalendarClientZoneItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EntityListOfPaymentCalendarClientZoneItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/client-zone/payment-calendar-items`);
  }

  getApiV1OrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfo(publicID: string, orderServiceID: number): Observable<ResponseResult<GetEucsOrderInfoQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<GetEucsOrderInfoQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/order-service/${orderServiceID}/eucs-order/info`);
  }

  postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCancel(requestContract: CancelProductInInstitutionCommandRequest, publicID: string, orderServiceID: number): Observable<ResponseResult<CancelProductInInstitutionCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ApiProblemDetails, 500>> {
    const requestData = getApiRequestData<CancelProductInInstitutionCommandRequest>(requestContract, false);

    return apiPost<ResponseResult<CancelProductInInstitutionCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ApiProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/cancel`, requestData);
  }

  postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCreate(requestContract: CreateProductInInstitutionRequest, publicID: string, orderServiceID: number): Observable<ResponseResult<CreateProductInInstitutionCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ApiProblemDetails, 500>> {
    const requestData = getApiRequestData<CreateProductInInstitutionRequest>(requestContract, false);

    return apiPost<ResponseResult<CreateProductInInstitutionCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ApiProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/create`, requestData);
  }

  getApiV1OrdersPublicIDWorkflowSteps(publicID: string): Observable<ResponseResult<EntityListOfOrderWorkflowStepDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EntityListOfOrderWorkflowStepDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/steps`);
  }

  postApiV1OrdersWorkflowDraft(requestContract: SaveDraftRequest): Observable<ResponseResult<SaveDraftCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SaveDraftRequest>(requestContract, false);

    return apiPost<ResponseResult<SaveDraftCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/workflow/draft`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowDraftComplete(publicID: string): Observable<ResponseResult<DraftStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<DraftStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/draft/complete`, requestData);
  }

  getApiV1OrdersWorkflowClientReviewTokenSummary(token: string): Observable<ResponseResult<GetClientReviewSummaryQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<GetClientReviewSummaryQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/workflow/client-review/${token}/summary`);
  }

  postApiV1OrdersPublicIDWorkflowClientReviewReminder(publicID: string): Observable<ResponseResult<SendReminderCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<SendReminderCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-review/reminder`, requestData);
  }

  postApiV1OrdersWorkflowClientApprovalTokenReject(requestContract: ClientApprovalRejectRequest, token: string): Observable<ResponseResult<ClientApprovalStepRejectCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientApprovalRejectRequest>(requestContract, false);

    return apiPost<ResponseResult<ClientApprovalStepRejectCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/workflow/client-approval/${token}/reject`, requestData);
  }

  putApiV1OrdersWorkflowClientApprovalTokenInProgress(token: string): Observable<ResponseResult<ClientApprovalStepInitCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPut<ResponseResult<ClientApprovalStepInitCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/workflow/client-approval/${token}/in-progress`, requestData);
  }

  postApiV1OrdersWorkflowClientApprovalTokenComplete(requestContract: ClientApprovalCompleteRequest, token: string): Observable<ResponseResult<CompleteClientApprovalStepCommandResult, 200> | ResponseResult<ApiProblemDetailsOfCompleteClientApprovalStepError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientApprovalCompleteRequest>(requestContract, false);

    return apiPost<ResponseResult<CompleteClientApprovalStepCommandResult, 200> | ResponseResult<ApiProblemDetailsOfCompleteClientApprovalStepError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/workflow/client-approval/${token}/complete`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowProcessingServicesOrderServiceIDComplete(publicID: string, orderServiceID: number): Observable<ResponseResult<OrderServiceCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<OrderServiceCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/processing-services/${orderServiceID}/complete`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowInvoiceIssuanceComplete(publicID: string): Observable<ResponseResult<InvoiceIssuanceStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<InvoiceIssuanceStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/invoice-issuance/complete`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowInvoicePaymentComplete(publicID: string): Observable<ResponseResult<InvoicePaymentStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<InvoicePaymentStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/invoice-payment/complete`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowInvoicePaymentReminder(publicID: string): Observable<ResponseResult<InvoicePaymentStepReminderCommand, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<InvoicePaymentStepReminderCommand, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/invoice-payment/reminder`, requestData);
  }

  getApiV1OrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPayment(publicID: string): Observable<ResponseResult<EnterpriseInvoiceIssuanceAndPaymentStepQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseInvoiceIssuanceAndPaymentStepQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/enterprise-invoice-issuance-and-payment`);
  }

  postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancel(publicID: string, paymentCalendarItemID: number): Observable<ResponseResult<ClientInvoiceRecurringPaymentCancelCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentCancelErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<ClientInvoiceRecurringPaymentCancelCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentCancelErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/cancel`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminder(publicID: string, paymentCalendarItemID: number): Observable<ResponseResult<ClientInvoiceRecurringPaymentReminderCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentReminderErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<ClientInvoiceRecurringPaymentReminderCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentReminderErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/reminder`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminder(publicID: string, paymentCalendarItemID: number): Observable<ResponseResult<ClientPrepaidInvoiceRecurringPaymentReminderCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentReminderErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<ClientPrepaidInvoiceRecurringPaymentReminderCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentReminderErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/reminder`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoice(publicID: string, paymentCalendarItemID: number): Observable<ResponseResult<ClientInvoiceRecurringPaymentCreateInvoiceCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentCreateAndSendInvoiceToClientErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<ClientInvoiceRecurringPaymentCreateInvoiceCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentCreateAndSendInvoiceToClientErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/send-invoice`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPay(requestContract: ClientInvoiceRecurringPaymentClientPaidRequest, publicID: string, paymentCalendarItemID: number): Observable<ResponseResult<ClientInvoiceRecurringPaymentClientPaidCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentClientPaidErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentClientPaidRequest>(requestContract, false);

    return apiPost<ResponseResult<ClientInvoiceRecurringPaymentClientPaidCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientInvoiceRecurringPaymentClientPaidErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/pay`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPay(requestContract: ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest, publicID: string, paymentCalendarItemID: number): Observable<ResponseResult<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest>(requestContract, false);

    return apiPost<ResponseResult<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidCommandResult, 200> | ResponseResult<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/send-invoice-and-pay`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowClientAssignmentSendAssignmentEmail(publicID: string): Observable<ResponseResult<SendClientAssignmentEmailCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<SendClientAssignmentEmailCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-assignment/send-assignment-email`, requestData);
  }

  postApiV1OrdersPublicIDWorkflowClientPrepaidPaymentApprovalComplete(requestContract: ClientPrepaidPaymentApprovalStepCompleteCommandRequest, publicID: string): Observable<ResponseResult<ClientPrepaidPaymentApprovalStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepCompleteCommandRequest>(requestContract, false);

    return apiPost<ResponseResult<ClientPrepaidPaymentApprovalStepCompleteCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/${publicID}/workflow/client-prepaid-payment-approval/complete`, requestData);
  }

  postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenInProgress(requestContract: ClientPrepaidPaymentApprovalStepInProgressRequest, token: string): Observable<ResponseResult<ClientPrepaidPaymentApprovalStepInProgressCommandResult, 200> | ResponseResult<ApiProblemDetailsOfInProgressClientApprovalStepError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepInProgressRequest>(requestContract, false);

    return apiPost<ResponseResult<ClientPrepaidPaymentApprovalStepInProgressCommandResult, 200> | ResponseResult<ApiProblemDetailsOfInProgressClientApprovalStepError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/in-progress`, requestData);
  }

  postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenReject(requestContract: ClientPrepaidPaymentApprovalStepRejectRequest, token: string): Observable<ResponseResult<ClientPrepaidPaymentApprovalStepRejectCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepRejectRequest>(requestContract, false);

    return apiPost<ResponseResult<ClientPrepaidPaymentApprovalStepRejectCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/reject`, requestData);
  }

  putApiV1NotificationsUserSettings(requestContract: UserNotificationUpdateRequest): Observable<ResponseResult<SaveUserNotificationSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<UserNotificationUpdateRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveUserNotificationSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/notifications/user-settings`, requestData);
  }

  getApiV1InvoicesUserInvoices(offset?: number, limit?: number): Observable<ResponseResult<EntityListOfInvoiceForSupplierCompanyByUserListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "offset": offset,
      "limit": limit
    };
    return apiGet<ResponseResult<EntityListOfInvoiceForSupplierCompanyByUserListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/invoices/user-invoices`, queryParams);
  }

  getApiV1InvoicesPublicID(publicID: string): Observable<ResponseResult<InvoiceDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<InvoiceDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/invoices/${publicID}`);
  }

  getApiV1InvoicesPublicIDISDOC(publicID: string): Observable<ResponseResult<InvoiceISDOCDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<InvoiceISDOCDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/invoices/${publicID}/ISDOC`);
  }

  getApiV1InvoicesPublicIDISDOCPdf(publicID: string): Observable<ResponseResult<InvoiceISDOCPdfBase64Dto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<InvoiceISDOCPdfBase64Dto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/invoices/${publicID}/ISDOCPdf`);
  }

  getApiV1InvoicesInvoiceForSupplierCompanyByUserISDOCPdf(InvoicePublicIDs?: string[]): Observable<ResponseResult<InvoiceForSupplierCompanyByUserISDOCPdfBase64ListDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "InvoicePublicIDs": InvoicePublicIDs
    };
    return apiGet<ResponseResult<InvoiceForSupplierCompanyByUserISDOCPdfBase64ListDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/invoices/invoice-for-supplier-company-by-user/ISDOCPdf`, queryParams);
  }

  postApiV1InvoicesInvoiceForClientByOrderPublicIDCancel(publicID: string): Observable<ResponseResult<CancelInvoiceForClientByOrderCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<CancelInvoiceForClientByOrderCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/invoices/invoice-for-client-by-order/${publicID}/cancel`, requestData);
  }

  postApiV1Enterprises(requestContract: CreateEnterpriseRequest): Observable<ResponseResult<void, 204> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<CreateEnterpriseRequest>(requestContract, false);

    return apiPost<ResponseResult<void, 204> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises`, requestData);
  }

  postApiV1EnterprisesChangeMode(requestContract: EnterpriseModeChangeRequest): Observable<ResponseResult<ChangeEnterpriseModeCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<EnterpriseModeChangeRequest>(requestContract, false);

    return apiPost<ResponseResult<ChangeEnterpriseModeCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/change-mode`, requestData);
  }

  putApiV1EnterprisesDesignSettings(requestContract: EnterpriseDesignSettingsUpdateRequest): Observable<ResponseResult<SaveEnterpriseDesignSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<EnterpriseDesignSettingsUpdateRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveEnterpriseDesignSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/design-settings`, requestData);
  }

  putApiV1EnterprisesCommunicationSettings(requestContract: EnterpriseCommunicationSettingsUpdateRequest): Observable<ResponseResult<SaveEnterpriseCommunicationSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<EnterpriseCommunicationSettingsUpdateRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveEnterpriseCommunicationSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/communication-settings`, requestData);
  }

  getApiV1EnterprisesBasicSettings(): Observable<ResponseResult<EnterpriseBasicSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseBasicSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/basic-settings`);
  }

  getApiV1EnterprisesExternalIDBasicSettings(externalID: string): Observable<ResponseResult<EnterpriseBasicSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseBasicSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/${externalID}/basic-settings`);
  }

  getApiV1EnterprisesCommissionSettings(offset?: number, limit?: number): Observable<ResponseResult<EntityListOfEnterpriseCommissionSettingsListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "offset": offset,
      "limit": limit
    };
    return apiGet<ResponseResult<EntityListOfEnterpriseCommissionSettingsListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/commission-settings`, queryParams);
  }

  postApiV1EnterprisesCommissionSettings(requestContract: CreateEnterpriseCommissionSettingsRequest): Observable<ResponseResult<CreateEnterpriseCommissionSettingsCommandResult, 200> | ResponseResult<ApiProblemDetailsOfCreateEnterpriseCommissionSettingsErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<CreateEnterpriseCommissionSettingsRequest>(requestContract, false);

    return apiPost<ResponseResult<CreateEnterpriseCommissionSettingsCommandResult, 200> | ResponseResult<ApiProblemDetailsOfCreateEnterpriseCommissionSettingsErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/commission-settings`, requestData);
  }

  getApiV1EnterprisesServiceSettings(): Observable<ResponseResult<EnterpriseServiceSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseServiceSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/service-settings`);
  }

  putApiV1EnterprisesServiceSettings(requestContract: EnterpriseServiceSettingsUpdateRequest): Observable<ResponseResult<SaveEnterpriseServiceSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<EnterpriseServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveEnterpriseServiceSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ChangeEnterpriseModeCommandResult, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/service-settings`, requestData);
  }

  getApiV1EnterprisesServices(): Observable<ResponseResult<EnterpriseServiceListItemDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseServiceListItemDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/services`);
  }

  putApiV1EnterprisesServices(requestContract: EnterpriseServicesUpdateRequest): Observable<ResponseResult<SaveEnterpriseServicesCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<EnterpriseServicesUpdateRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveEnterpriseServicesCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/services`, requestData);
  }

  getApiV1EnterprisesLogo(): Observable<ResponseResult<EnterpriseLogoDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseLogoDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/logo`);
  }

  getApiV1EnterprisesPublicIDLogoJson(publicID: string): Observable<ResponseResult<EnterpriseLogoDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseLogoDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/${publicID}/logo/json`);
  }

  getApiV1EnterprisesPublicIDLogoFile(publicID: string): Observable<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/${publicID}/logo/file`);
  }

  getApiV1EnterprisesPublicIDLogoTenantFile(publicID: string): Observable<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 204> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 204> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/${publicID}/logo/tenant/file`);
  }

  getApiV1EnterprisesPublicIDDesignSettings(publicID: string): Observable<ResponseResult<EnterpriseDesignSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterpriseDesignSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/${publicID}/design-settings`);
  }

  getApiV1EnterprisesPackageServiceSettings(): Observable<ResponseResult<EnterprisePackageServiceSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<EnterprisePackageServiceSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/package-service-settings`);
  }

  putApiV1EnterprisesPackageServiceSettings(requestContract: EnterprisePackageServiceSettingsUpdateRequest): Observable<ResponseResult<SaveEnterprisePackageServiceSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<EnterprisePackageServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveEnterprisePackageServiceSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/enterprises/package-service-settings`, requestData);
  }

  getApiV1Cutoffs(offset?: number, limit?: number): Observable<ResponseResult<EntityListOfCutoffListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "offset": offset,
      "limit": limit
    };
    return apiGet<ResponseResult<EntityListOfCutoffListItemDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs`, queryParams);
  }

  postApiV1Cutoffs(requestContract: CutoffCreateRequest): Observable<ResponseResult<CreateCutoffCommandResult, 200> | ResponseResult<ApiProblemDetailsOfCreateCutoffErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ApiProblemDetailsOfCreateCutoffErrorStatus, 409> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<CutoffCreateRequest>(requestContract, false);

    return apiPost<ResponseResult<CreateCutoffCommandResult, 200> | ResponseResult<ApiProblemDetailsOfCreateCutoffErrorStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ApiProblemDetailsOfCreateCutoffErrorStatus, 409> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs`, requestData);
  }

  getApiV1CutoffsPublicID(publicID: string): Observable<ResponseResult<CutoffDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<CutoffDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/${publicID}`);
  }

  getApiV1CutoffsCompanyIDDateFromForNextCutoff(companyID: number): Observable<ResponseResult<DateFromForNextCutoffDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<DateFromForNextCutoffDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/${companyID}/date-from-for-next-cutoff`);
  }

  getApiV1CutoffsExpectedUserCommission(): Observable<ResponseResult<GetExpectedUserCommissionQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<GetExpectedUserCommissionQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/expected-user-commission`);
  }

  getApiV1CutoffsPaidUserCommission(): Observable<ResponseResult<GetPaidUserCommissionQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<GetPaidUserCommissionQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/paid-user-commission`);
  }

  getApiV1CutoffsPublicIDISDOCPdfs(publicID: string): Observable<ResponseResult<CutoffISDOCPdfsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<CutoffISDOCPdfsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/${publicID}/ISDOCPdfs`);
  }

  postApiV1CutoffsPublicIDSendPayments(publicID: string): Observable<ResponseResult<SendCutoffPaymentsCommandResult, 200> | ResponseResult<ApiProblemDetails, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost<ResponseResult<SendCutoffPaymentsCommandResult, 200> | ResponseResult<ApiProblemDetails, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/${publicID}/send-payments`, requestData);
  }

  getApiV1CutoffsPublicIDDetailPdf(publicID: string): Observable<ResponseResult<CutoffDetailPdfBase64Dto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<CutoffDetailPdfBase64Dto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/${publicID}/detail-pdf`);
  }

  getApiV1CutoffsUserSupplierCompanies(): Observable<ResponseResult<CutoffUserSupplierCompanyListItemDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<CutoffUserSupplierCompanyListItemDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cutoffs/user-supplier-companies`);
  }

  getApiV1CompaniesPublicID(publicID: string): Observable<ResponseResult<CompanyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<CompanyDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/${publicID}`);
  }

  postApiV1Companies(requestContract: CompanyCreateRequest): Observable<ResponseResult<CreateCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<CompanyCreateRequest>(requestContract, false);

    return apiPost<ResponseResult<CreateCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies`, requestData);
  }

  putApiV1Companies(requestContract: CompanyUpdateRequest): Observable<ResponseResult<UpdateCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<CompanyUpdateRequest>(requestContract, false);

    return apiPut<ResponseResult<UpdateCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies`, requestData);
  }

  getApiV1CompaniesUserSupplierCompanies(): Observable<ResponseResult<UserSupplierCompanyListItemDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<UserSupplierCompanyListItemDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/user-supplier-companies`);
  }

  postApiV1CompaniesUserSupplierCompany(requestContract: UserSupplierCompanySetRequest): Observable<ResponseResult<SetUserSupplierCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<UserSupplierCompanySetRequest>(requestContract, false);

    return apiPost<ResponseResult<SetUserSupplierCompanyCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/user-supplier-company`, requestData);
  }

  getApiV1CompaniesPublicIDDesignSettings(publicID: string): Observable<ResponseResult<CompanyDesignSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<CompanyDesignSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/${publicID}/design-settings`);
  }

  putApiV1CompaniesPublicIDDesignSettings(requestContract: SaveCompanyDesignSettingsRequest, publicID: string): Observable<ResponseResult<SaveCompanyDesignSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SaveCompanyDesignSettingsRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveCompanyDesignSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/${publicID}/design-settings`, requestData);
  }

  getApiV1CompaniesPublicIDFioSettings(publicID: string): Observable<ResponseResult<CompanyFioSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<CompanyFioSettingsDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/${publicID}/fio-settings`);
  }

  putApiV1CompaniesPublicIDFioSettings(requestContract: SaveFioSettingsRequest, publicID: string): Observable<ResponseResult<SaveCompanyFioSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SaveFioSettingsRequest>(requestContract, false);

    return apiPut<ResponseResult<SaveCompanyFioSettingsCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/${publicID}/fio-settings`, requestData);
  }

  getApiV1CompaniesPublicIDLogoFile(publicID: string): Observable<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<File, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/companies/${publicID}/logo/file`);
  }

  getApiV1CodeLists(): Observable<ResponseResult<GetCodeListCollectionQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<GetCodeListCollectionQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/code-lists`);
  }

  getApiV1ClientsCount(): Observable<ResponseResult<GetClientsCountQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    return apiGet<ResponseResult<GetClientsCountQueryResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/clients/count`);
  }

  getApiV1ClientsSearch(query?: string): Observable<ResponseResult<ClientDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "query": query
    };
    return apiGet<ResponseResult<ClientDto[], 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/clients/search`, queryParams);
  }

  getApiV1ClientsSearchPersonalNumber(query?: string): Observable<ResponseResult<ClientDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>> {
    const queryParams = {
      "query": query
    };
    return apiGet<ResponseResult<ClientDto, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetails, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/clients/search/personal-number`, queryParams);
  }

  postApiV1CacheRefresh(body: string): Observable<ResponseResult<void, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 403> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<string>(body, false);

    return apiPost<ResponseResult<void, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 403> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/cache/refresh`, requestData);
  }

  postApiV1AuthSignUp(requestContract: SignUpCommand): Observable<ResponseResult<SignUpCommandResult, 201> | ResponseResult<ApiProblemDetailsOfPasswordChangeResultStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfSignUpErrorStatus, 409> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SignUpCommand>(requestContract, false);

    return apiPost<ResponseResult<SignUpCommandResult, 201> | ResponseResult<ApiProblemDetailsOfPasswordChangeResultStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfSignUpErrorStatus, 409> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/sign-up`, requestData);
  }

  postApiV1AuthSignIn(requestContract: SignInCommand): Observable<ResponseResult<SignInResult, 200> | ResponseResult<ApiProblemDetailsOfAuthError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SignInCommand>(requestContract, false);

    return apiPost<ResponseResult<SignInResult, 200> | ResponseResult<ApiProblemDetailsOfAuthError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/sign-in`, requestData);
  }

  postApiV1AuthToken(): Observable<ResponseResult<TokenResponse, 200> | ResponseResult<ApiProblemDetailsOfAuthError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<object>(undefined, true);

    return apiPost<ResponseResult<TokenResponse, 200> | ResponseResult<ApiProblemDetailsOfAuthError, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/token`, requestData);
  }

  postApiV1AuthEmailVerification(requestContract: EmailVerificationCommand): Observable<ResponseResult<EmailVerificationCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfEmailVerificationCommandResultStatus, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<EmailVerificationCommand>(requestContract, false);

    return apiPost<ResponseResult<EmailVerificationCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfEmailVerificationCommandResultStatus, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/email-verification`, requestData);
  }

  postApiV1AuthEmailVerificationSend(requestContract: ResendVerificationEmailCommand): Observable<ResponseResult<ResendVerificationEmailCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ResendVerificationEmailCommand>(requestContract, false);

    return apiPost<ResponseResult<ResendVerificationEmailCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/email-verification/send`, requestData);
  }

  postApiV1AuthSso(requestContract: SsoSignInRequest): Observable<ResponseResult<SignInResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfAuthError, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SsoSignInRequest>(requestContract, false);

    return apiPost<ResponseResult<SignInResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfAuthError, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/sso`, requestData);
  }

  getApiV1AuthSsoToken(IdentityProvider?: IdentityProvider): Observable<ResponseResult<RedirectHttpResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500> | ResponseResult<ApiProblemDetails, 501>> {
    const queryParams = {
      "IdentityProvider": IdentityProvider
    };
    return apiGet<ResponseResult<RedirectHttpResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ProblemDetails, 500> | ResponseResult<ApiProblemDetails, 501>>(this.httpClient, `${this.baseUrl}/api/v1/auth/sso-token`, queryParams);
  }

  postApiV1AuthPasswordReset(requestContract: ResetPasswordCommand): Observable<ResponseResult<ResetPasswordCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfResetPasswordCommandResultStatus, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<ResetPasswordCommand>(requestContract, false);

    return apiPost<ResponseResult<ResetPasswordCommandResult, 200> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfResetPasswordCommandResultStatus, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/password-reset`, requestData);
  }

  putApiV1AuthPassword(requestContract: SetPasswordCommand): Observable<ResponseResult<SetPasswordCommandResult, 200> | ResponseResult<ApiProblemDetailsOfPasswordChangeResultStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfSetPasswordCommandStatus, 404> | ResponseResult<ProblemDetails, 500>> {
    const requestData = getApiRequestData<SetPasswordCommand>(requestContract, false);

    return apiPut<ResponseResult<SetPasswordCommandResult, 200> | ResponseResult<ApiProblemDetailsOfPasswordChangeResultStatus, 400> | ResponseResult<ApiProblemDetails, 401> | ResponseResult<ApiProblemDetailsOfSetPasswordCommandStatus, 404> | ResponseResult<ProblemDetails, 500>>(this.httpClient, `${this.baseUrl}/api/v1/auth/password`, requestData);
  }
}

