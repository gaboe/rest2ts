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
    args: any;
  };

  export type FetchResponseOfSuccess<TData, TStatus extends number = 0> = 
  {
    data: TData;
    error: null;
    status: TStatus;
    args: any;
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
      fn: (
        response: FetchResponse<unknown, any>
      ) => FetchResponse<unknown, any> | TerminateResponse;
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
        request = middlewareResponse;
      } catch (e) {
        console.error("Request middleware error", e);
      }
    }
    return request;
  }

  export function processResponseWithMiddlewares<T extends FetchResponse<unknown, any>>(
    response: T
  ): T | Termination {
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
          } as FetchResponseOfError as unknown as T;
        }
        response = middlewareResponse as T;
      } catch (e) {
        console.error("Response middleware error", e);
      }
    }
    return response;
  }

  export type FetchOptions = {
    method: string;
    headers: Headers;
    body?: any;
    redirect: RequestRedirect;
  };

  export type FetchArgs = {
    url: string;
    options: FetchOptions;
  }

  export async function fetchJson<T extends FetchResponse<unknown, number>>(
    args: FetchArgs
  ): Promise<T> {
    const errorResponse = (error: StandardError, status: number, args: any) => {
      const errorResponse = {
        status: status as ErrorStatuses,
        args,
        data: null,
        error,
      } satisfies FetchResponse<T>;

      return processResponseWithMiddlewares(errorResponse) as unknown as T;
    };

    const errorStatus = (args: any) => {
      const errorResponse = {
        status: 0,
        args,
        data: null,
        error: new Error("Network error"),
      } as FetchResponse<T, Error500s>;

      return processResponseWithMiddlewares(errorResponse) as unknown as T;
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
        } as FetchResponse<T, Error500s>;

        return processResponseWithMiddlewares(
          terminationResponse
        ) as unknown as T;
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
        return processResponseWithMiddlewares(response) as unknown as T;
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

  
  function updateHeadersAndGetBody<TResponse extends FetchResponse<unknown, number>, TRequest>(
    request: TRequest,
    headers: Headers
  ) {
    if (request instanceof FormData) {
      headers.delete("Content-Type");
      return request;
    } else {
      updateHeaders(headers);
      return JSON.stringify(request);
    }
  }
  
  function updateHeaders(headers: Headers) {
    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }
    const token = getJwtKey();
    if (!headers.has("Authorization") && !!token) {
      headers.append("Authorization", token);
    }
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
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  
  const raw = updateHeadersAndGetBody(request, headers); 

  const requestOptions: FetchOptions = {
    method: "POST",
    headers,
    body: raw,
    redirect: "follow",
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export type ParamsObject = {
  [key: string]: any;
};

export function apiGet<TResponse extends FetchResponse<unknown, number>>(
  url: string,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);
  
  const maybeQueryString = getQueryParamsString(paramsObject);

  const requestOptions: FetchOptions = {
    method: "GET",
    headers,
    redirect: "follow",
  };

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export function apiPut<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const raw = JSON.stringify(request);

  const requestOptions: FetchOptions = {
    method: "PUT",
    headers,
    body: raw,
    redirect: "follow",
  };

  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export function apiDelete<TResponse extends FetchResponse<unknown, number>>(
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

  const requestOptions: FetchOptions = {
    method: "DELETE",
    headers,
    redirect: "follow",
  };

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}

export function apiPatch<TResponse extends FetchResponse<unknown, number>, TRequest>(
  url: string,
  request: TRequest,
  headers: Headers,
  paramsObject: ParamsObject = {}
) {
  updateHeaders(headers);

  const raw = JSON.stringify(request);

  const requestOptions: FetchOptions = {
    method: "PATCH",
    headers,
    body: raw,
    redirect: "follow",
  };
  const maybeQueryString = getQueryParamsString(paramsObject);

  return fetchJson<TResponse>({
    url: `${url}${maybeQueryString}`,
    options: requestOptions,
  });
}
// INFRASTRUCTURE END

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

export type GetApiV1WorkflowsStepsFetchResponse = 
| FetchResponse<EntityListOfStepDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1WorkflowsStepsPath = () => `/api/v1/workflows/steps`;

export const getApiV1WorkflowsSteps = (headers = new Headers()):
  Promise<GetApiV1WorkflowsStepsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1WorkflowsStepsPath()}`, headers, {}) as Promise<GetApiV1WorkflowsStepsFetchResponse>;
}

export type GetApiV1UserCompanyFetchResponse = 
| FetchResponse<UserCompanyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1UserCompanyPath = () => `/api/v1/user/company`;

export const getApiV1UserCompany = (headers = new Headers()):
  Promise<GetApiV1UserCompanyFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1UserCompanyPath()}`, headers, {}) as Promise<GetApiV1UserCompanyFetchResponse>;
}

export type PutApiV1UserCompanyFetchResponse = 
| FetchResponse<SetUserCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1UserCompanyPath = () => `/api/v1/user/company`;

export const putApiV1UserCompany = (requestContract: UserCompanySetRequest, headers = new Headers()):
  Promise<PutApiV1UserCompanyFetchResponse> => {
    const requestData = getApiRequestData<UserCompanySetRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1UserCompanyPath()}`, requestData, headers) as Promise<PutApiV1UserCompanyFetchResponse>;
}

export type GetApiV1ServicesPackagesFetchResponse = 
| FetchResponse<EntityListOfServicePackageListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1ServicesPackagesPath = () => `/api/v1/services/packages`;

export const getApiV1ServicesPackages = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiV1ServicesPackagesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiV1ServicesPackagesPath()}`, headers, queryParams) as Promise<GetApiV1ServicesPackagesFetchResponse>;
}

export type GetApiV1ServicesPackagesAvailableServicesFetchResponse = 
| FetchResponse<EntityListOfServiceListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1ServicesPackagesAvailableServicesPath = () => `/api/v1/services/packages/available-services`;

export const getApiV1ServicesPackagesAvailableServices = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiV1ServicesPackagesAvailableServicesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiV1ServicesPackagesAvailableServicesPath()}`, headers, queryParams) as Promise<GetApiV1ServicesPackagesAvailableServicesFetchResponse>;
}

export type PostApiV1ServicesPackageFetchResponse = 
| FetchResponse<CreateServicePackageCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1ServicesPackagePath = () => `/api/v1/services/package`;

export const postApiV1ServicesPackage = (requestContract: SaveServicePackageRequest, headers = new Headers()):
  Promise<PostApiV1ServicesPackageFetchResponse> => {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1ServicesPackagePath()}`, requestData, headers) as Promise<PostApiV1ServicesPackageFetchResponse>;
}

export type GetApiV1ServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<ServicePackageDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1ServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const getApiV1ServicesServicePublicIDPackage = (servicePublicID: string, headers = new Headers()):
  Promise<GetApiV1ServicesServicePublicIDPackageFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1ServicesServicePublicIDPackagePath(servicePublicID)}`, headers, {}) as Promise<GetApiV1ServicesServicePublicIDPackageFetchResponse>;
}

export type DeleteApiV1ServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<ServicePackageDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteApiV1ServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const deleteApiV1ServicesServicePublicIDPackage = (servicePublicID: string, headers = new Headers()):
  Promise<DeleteApiV1ServicesServicePublicIDPackageFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteApiV1ServicesServicePublicIDPackagePath(servicePublicID)}`, headers, {}) as Promise<DeleteApiV1ServicesServicePublicIDPackageFetchResponse>;
}

export type PutApiV1ServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<UpdateServicePackageCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1ServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const putApiV1ServicesServicePublicIDPackage = (requestContract: SaveServicePackageRequest, servicePublicID: string, headers = new Headers()):
  Promise<PutApiV1ServicesServicePublicIDPackageFetchResponse> => {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1ServicesServicePublicIDPackagePath(servicePublicID)}`, requestData, headers) as Promise<PutApiV1ServicesServicePublicIDPackageFetchResponse>;
}

export type GetApiV1PartiesPublicIDFetchResponse = 
| FetchResponse<PartyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1PartiesPublicIDPath = (publicID: string) => `/api/v1/parties/${publicID}`;

export const getApiV1PartiesPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiV1PartiesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1PartiesPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiV1PartiesPublicIDFetchResponse>;
}

export type GetApiV1PartiesSearchAresFetchResponse = 
| FetchResponse<PartyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1PartiesSearchAresPath = () => `/api/v1/parties/search/ares`;

export const getApiV1PartiesSearchAres = (query?: string, partyType?: PartyType | undefined | null, headers = new Headers()):
  Promise<GetApiV1PartiesSearchAresFetchResponse> => {
    const queryParams = {
      "query": query,
      "partyType": partyType
    }
    return apiGet(`${getApiUrl()}${getApiV1PartiesSearchAresPath()}`, headers, queryParams) as Promise<GetApiV1PartiesSearchAresFetchResponse>;
}

export type GetApiV1OrdersFetchResponse = 
| FetchResponse<EntityListOfOrderListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPath = () => `/api/v1/orders`;

export const getApiV1Orders = (offset?: number, limit?: number, workflowStatuses?: string[], query?: string | undefined | null, startDate?: string | undefined | null, endDate?: string | undefined | null, isSearchInStructure?: boolean, onlyAfterInvoiceDueDate?: boolean, includeClientReminderAvailable?: boolean, headers = new Headers()):
  Promise<GetApiV1OrdersFetchResponse> => {
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
    }
    return apiGet(`${getApiUrl()}${getApiV1OrdersPath()}`, headers, queryParams) as Promise<GetApiV1OrdersFetchResponse>;
}

export type GetApiV1OrdersPublicIDFetchResponse = 
| FetchResponse<OrderDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPublicIDPath = (publicID: string) => `/api/v1/orders/${publicID}`;

export const getApiV1OrdersPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiV1OrdersPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiV1OrdersPublicIDFetchResponse>;
}

export type DeleteApiV1OrdersPublicIDFetchResponse = 
| FetchResponse<DeleteOrderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteApiV1OrdersPublicIDPath = (publicID: string) => `/api/v1/orders/${publicID}`;

export const deleteApiV1OrdersPublicID = (publicID: string, headers = new Headers()):
  Promise<DeleteApiV1OrdersPublicIDFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteApiV1OrdersPublicIDPath(publicID)}`, headers, {}) as Promise<DeleteApiV1OrdersPublicIDFetchResponse>;
}

export type PutApiV1OrdersPublicIDPeriodicityFetchResponse = 
| FetchResponse<SetPeriodicityCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1OrdersPublicIDPeriodicityPath = (publicID: string) => `/api/v1/orders/${publicID}/periodicity`;

export const putApiV1OrdersPublicIDPeriodicity = (requestContract: SetPeriodicityRequest, publicID: string, headers = new Headers()):
  Promise<PutApiV1OrdersPublicIDPeriodicityFetchResponse> => {
    const requestData = getApiRequestData<SetPeriodicityRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1OrdersPublicIDPeriodicityPath(publicID)}`, requestData, headers) as Promise<PutApiV1OrdersPublicIDPeriodicityFetchResponse>;
}

export type GetApiV1OrdersPublicIDServicesFetchResponse = 
| FetchResponse<EntityListOfOrderServiceDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPublicIDServicesPath = (publicID: string) => `/api/v1/orders/${publicID}/services`;

export const getApiV1OrdersPublicIDServices = (publicID: string, headers = new Headers()):
  Promise<GetApiV1OrdersPublicIDServicesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersPublicIDServicesPath(publicID)}`, headers, {}) as Promise<GetApiV1OrdersPublicIDServicesFetchResponse>;
}

export type DeleteApiV1OrdersServicesServiceIDFetchResponse = 
| FetchResponse<DeleteOrderServiceCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteApiV1OrdersServicesServiceIDPath = (serviceID: number) => `/api/v1/orders/services/${serviceID}`;

export const deleteApiV1OrdersServicesServiceID = (serviceID: number, headers = new Headers()):
  Promise<DeleteApiV1OrdersServicesServiceIDFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteApiV1OrdersServicesServiceIDPath(serviceID)}`, headers, {}) as Promise<DeleteApiV1OrdersServicesServiceIDFetchResponse>;
}

export type GetApiV1OrdersPeriodicUpcomingFetchResponse = 
| FetchResponse<EntityListOfUpcomingPeriodicOrderDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPeriodicUpcomingPath = () => `/api/v1/orders/periodic/upcoming`;

export const getApiV1OrdersPeriodicUpcoming = (offset?: number, limit?: number, nexOrderDate?: string, headers = new Headers()):
  Promise<GetApiV1OrdersPeriodicUpcomingFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit,
      "nexOrderDate": nexOrderDate
    }
    return apiGet(`${getApiUrl()}${getApiV1OrdersPeriodicUpcomingPath()}`, headers, queryParams) as Promise<GetApiV1OrdersPeriodicUpcomingFetchResponse>;
}

export type GetApiV1OrdersRevocationExampleFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersRevocationExampleFilePath = () => `/api/v1/orders/revocation/example/file`;

export const getApiV1OrdersRevocationExampleFile = (headers = new Headers()):
  Promise<GetApiV1OrdersRevocationExampleFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersRevocationExampleFilePath()}`, headers, {}) as Promise<GetApiV1OrdersRevocationExampleFileFetchResponse>;
}

export type GetApiV1OrdersPublicIDPaymentCalendarItemsFetchResponse = 
| FetchResponse<EntityListOfPaymentCalendarItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPublicIDPaymentCalendarItemsPath = (publicID: string) => `/api/v1/orders/${publicID}/payment-calendar-items`;

export const getApiV1OrdersPublicIDPaymentCalendarItems = (publicID: string, headers = new Headers()):
  Promise<GetApiV1OrdersPublicIDPaymentCalendarItemsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersPublicIDPaymentCalendarItemsPath(publicID)}`, headers, {}) as Promise<GetApiV1OrdersPublicIDPaymentCalendarItemsFetchResponse>;
}

export type GetApiV1OrdersCountFetchResponse = 
| FetchResponse<GetOrdersCountQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersCountPath = () => `/api/v1/orders/count`;

export const getApiV1OrdersCount = (onlyActive?: boolean, headers = new Headers()):
  Promise<GetApiV1OrdersCountFetchResponse> => {
    const queryParams = {
      "onlyActive": onlyActive
    }
    return apiGet(`${getApiUrl()}${getApiV1OrdersCountPath()}`, headers, queryParams) as Promise<GetApiV1OrdersCountFetchResponse>;
}

export type PostApiV1OrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse = 
| FetchResponse<SetPeriodicityCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientPath = (orderPublicID: string) => `/api/v1/orders/${orderPublicID}/client-invoice-recurring-payment-create-invoice-and-set-as-paid-by-client`;

export const postApiV1OrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClient = (requestContract: ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest, orderPublicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse> => {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientPath(orderPublicID)}`, requestData, headers) as Promise<PostApiV1OrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse>;
}

export type GetApiV1OrdersPublicIDClientZonePaymentCalendarItemsFetchResponse = 
| FetchResponse<EntityListOfPaymentCalendarClientZoneItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPublicIDClientZonePaymentCalendarItemsPath = (publicID: string) => `/api/v1/orders/${publicID}/client-zone/payment-calendar-items`;

export const getApiV1OrdersPublicIDClientZonePaymentCalendarItems = (publicID: string, headers = new Headers()):
  Promise<GetApiV1OrdersPublicIDClientZonePaymentCalendarItemsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersPublicIDClientZonePaymentCalendarItemsPath(publicID)}`, headers, {}) as Promise<GetApiV1OrdersPublicIDClientZonePaymentCalendarItemsFetchResponse>;
}

export type GetApiV1OrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse = 
| FetchResponse<GetEucsOrderInfoQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoPath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/eucs-order/info`;

export const getApiV1OrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfo = (publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<GetApiV1OrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoPath(publicID, orderServiceID)}`, headers, {}) as Promise<GetApiV1OrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse>;
}

export type PostApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse = 
| FetchResponse<CancelProductInInstitutionCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCancelPath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/cancel`;

export const postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCancel = (requestContract: CancelProductInInstitutionCommandRequest, publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse> => {
    const requestData = getApiRequestData<CancelProductInInstitutionCommandRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCancelPath(publicID, orderServiceID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse>;
}

export type PostApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse = 
| FetchResponse<CreateProductInInstitutionCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCreatePath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/create`;

export const postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCreate = (requestContract: CreateProductInInstitutionRequest, publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse> => {
    const requestData = getApiRequestData<CreateProductInInstitutionRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCreatePath(publicID, orderServiceID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse>;
}

export type GetApiV1OrdersPublicIDWorkflowStepsFetchResponse = 
| FetchResponse<EntityListOfOrderWorkflowStepDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPublicIDWorkflowStepsPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/steps`;

export const getApiV1OrdersPublicIDWorkflowSteps = (publicID: string, headers = new Headers()):
  Promise<GetApiV1OrdersPublicIDWorkflowStepsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersPublicIDWorkflowStepsPath(publicID)}`, headers, {}) as Promise<GetApiV1OrdersPublicIDWorkflowStepsFetchResponse>;
}

export type PostApiV1OrdersWorkflowDraftFetchResponse = 
| FetchResponse<SaveDraftCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersWorkflowDraftPath = () => `/api/v1/orders/workflow/draft`;

export const postApiV1OrdersWorkflowDraft = (requestContract: SaveDraftRequest, headers = new Headers()):
  Promise<PostApiV1OrdersWorkflowDraftFetchResponse> => {
    const requestData = getApiRequestData<SaveDraftRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersWorkflowDraftPath()}`, requestData, headers) as Promise<PostApiV1OrdersWorkflowDraftFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowDraftCompleteFetchResponse = 
| FetchResponse<DraftStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowDraftCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/draft/complete`;

export const postApiV1OrdersPublicIDWorkflowDraftComplete = (publicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowDraftCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowDraftCompletePath(publicID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowDraftCompleteFetchResponse>;
}

export type GetApiV1OrdersWorkflowClientReviewTokenSummaryFetchResponse = 
| FetchResponse<GetClientReviewSummaryQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersWorkflowClientReviewTokenSummaryPath = (token: string) => `/api/v1/orders/workflow/client-review/${token}/summary`;

export const getApiV1OrdersWorkflowClientReviewTokenSummary = (token: string, headers = new Headers()):
  Promise<GetApiV1OrdersWorkflowClientReviewTokenSummaryFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersWorkflowClientReviewTokenSummaryPath(token)}`, headers, {}) as Promise<GetApiV1OrdersWorkflowClientReviewTokenSummaryFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientReviewReminderFetchResponse = 
| FetchResponse<SendReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientReviewReminderPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-review/reminder`;

export const postApiV1OrdersPublicIDWorkflowClientReviewReminder = (publicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientReviewReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientReviewReminderPath(publicID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientReviewReminderFetchResponse>;
}

export type PostApiV1OrdersWorkflowClientApprovalTokenRejectFetchResponse = 
| FetchResponse<ClientApprovalStepRejectCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersWorkflowClientApprovalTokenRejectPath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/reject`;

export const postApiV1OrdersWorkflowClientApprovalTokenReject = (requestContract: ClientApprovalRejectRequest, token: string, headers = new Headers()):
  Promise<PostApiV1OrdersWorkflowClientApprovalTokenRejectFetchResponse> => {
    const requestData = getApiRequestData<ClientApprovalRejectRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersWorkflowClientApprovalTokenRejectPath(token)}`, requestData, headers) as Promise<PostApiV1OrdersWorkflowClientApprovalTokenRejectFetchResponse>;
}

export type PutApiV1OrdersWorkflowClientApprovalTokenInProgressFetchResponse = 
| FetchResponse<ClientApprovalStepInitCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1OrdersWorkflowClientApprovalTokenInProgressPath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/in-progress`;

export const putApiV1OrdersWorkflowClientApprovalTokenInProgress = (token: string, headers = new Headers()):
  Promise<PutApiV1OrdersWorkflowClientApprovalTokenInProgressFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPut(`${getApiUrl()}${putApiV1OrdersWorkflowClientApprovalTokenInProgressPath(token)}`, requestData, headers) as Promise<PutApiV1OrdersWorkflowClientApprovalTokenInProgressFetchResponse>;
}

export type PostApiV1OrdersWorkflowClientApprovalTokenCompleteFetchResponse = 
| FetchResponse<CompleteClientApprovalStepCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCompleteClientApprovalStepError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersWorkflowClientApprovalTokenCompletePath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/complete`;

export const postApiV1OrdersWorkflowClientApprovalTokenComplete = (requestContract: ClientApprovalCompleteRequest, token: string, headers = new Headers()):
  Promise<PostApiV1OrdersWorkflowClientApprovalTokenCompleteFetchResponse> => {
    const requestData = getApiRequestData<ClientApprovalCompleteRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersWorkflowClientApprovalTokenCompletePath(token)}`, requestData, headers) as Promise<PostApiV1OrdersWorkflowClientApprovalTokenCompleteFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse = 
| FetchResponse<OrderServiceCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompletePath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/workflow/processing-services/${orderServiceID}/complete`;

export const postApiV1OrdersPublicIDWorkflowProcessingServicesOrderServiceIDComplete = (publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompletePath(publicID, orderServiceID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse = 
| FetchResponse<InvoiceIssuanceStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowInvoiceIssuanceCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-issuance/complete`;

export const postApiV1OrdersPublicIDWorkflowInvoiceIssuanceComplete = (publicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowInvoiceIssuanceCompletePath(publicID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse = 
| FetchResponse<InvoicePaymentStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowInvoicePaymentCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-payment/complete`;

export const postApiV1OrdersPublicIDWorkflowInvoicePaymentComplete = (publicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowInvoicePaymentCompletePath(publicID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse = 
| FetchResponse<InvoicePaymentStepReminderCommand, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowInvoicePaymentReminderPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-payment/reminder`;

export const postApiV1OrdersPublicIDWorkflowInvoicePaymentReminder = (publicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowInvoicePaymentReminderPath(publicID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse>;
}

export type GetApiV1OrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse = 
| FetchResponse<EnterpriseInvoiceIssuanceAndPaymentStepQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1OrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/enterprise-invoice-issuance-and-payment`;

export const getApiV1OrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPayment = (publicID: string, headers = new Headers()):
  Promise<GetApiV1OrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1OrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentPath(publicID)}`, headers, {}) as Promise<GetApiV1OrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentCancelCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentCancelErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/cancel`;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancel = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentReminderErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/reminder`;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminder = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse = 
| FetchResponse<ClientPrepaidInvoiceRecurringPaymentReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentReminderErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/reminder`;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminder = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentCreateInvoiceCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentCreateAndSendInvoiceToClientErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoicePath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/send-invoice`;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoice = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoicePath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentClientPaidCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentClientPaidErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/pay`;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPay = (requestContract: ClientInvoiceRecurringPaymentClientPaidRequest, publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse> => {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentClientPaidRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse = 
| FetchResponse<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/send-invoice-and-pay`;

export const postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPay = (requestContract: ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest, publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse = 
| FetchResponse<SendClientAssignmentEmailCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-assignment/send-assignment-email`;

export const postApiV1OrdersPublicIDWorkflowClientAssignmentSendAssignmentEmail = (publicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailPath(publicID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse>;
}

export type PostApiV1OrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-prepaid-payment-approval/complete`;

export const postApiV1OrdersPublicIDWorkflowClientPrepaidPaymentApprovalComplete = (requestContract: ClientPrepaidPaymentApprovalStepCompleteCommandRequest, publicID: string, headers = new Headers()):
  Promise<PostApiV1OrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepCompleteCommandRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompletePath(publicID)}`, requestData, headers) as Promise<PostApiV1OrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse>;
}

export type PostApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepInProgressCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfInProgressClientApprovalStepError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressPath = (token: string) => `/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/in-progress`;

export const postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenInProgress = (requestContract: ClientPrepaidPaymentApprovalStepInProgressRequest, token: string, headers = new Headers()):
  Promise<PostApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepInProgressRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressPath(token)}`, requestData, headers) as Promise<PostApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse>;
}

export type PostApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepRejectCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenRejectPath = (token: string) => `/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/reject`;

export const postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenReject = (requestContract: ClientPrepaidPaymentApprovalStepRejectRequest, token: string, headers = new Headers()):
  Promise<PostApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepRejectRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenRejectPath(token)}`, requestData, headers) as Promise<PostApiV1OrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse>;
}

export type PutApiV1NotificationsUserSettingsFetchResponse = 
| FetchResponse<SaveUserNotificationSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1NotificationsUserSettingsPath = () => `/api/v1/notifications/user-settings`;

export const putApiV1NotificationsUserSettings = (requestContract: UserNotificationUpdateRequest, headers = new Headers()):
  Promise<PutApiV1NotificationsUserSettingsFetchResponse> => {
    const requestData = getApiRequestData<UserNotificationUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1NotificationsUserSettingsPath()}`, requestData, headers) as Promise<PutApiV1NotificationsUserSettingsFetchResponse>;
}

export type GetApiV1InvoicesUserInvoicesFetchResponse = 
| FetchResponse<EntityListOfInvoiceForSupplierCompanyByUserListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1InvoicesUserInvoicesPath = () => `/api/v1/invoices/user-invoices`;

export const getApiV1InvoicesUserInvoices = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiV1InvoicesUserInvoicesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiV1InvoicesUserInvoicesPath()}`, headers, queryParams) as Promise<GetApiV1InvoicesUserInvoicesFetchResponse>;
}

export type GetApiV1InvoicesPublicIDFetchResponse = 
| FetchResponse<InvoiceDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1InvoicesPublicIDPath = (publicID: string) => `/api/v1/invoices/${publicID}`;

export const getApiV1InvoicesPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiV1InvoicesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1InvoicesPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiV1InvoicesPublicIDFetchResponse>;
}

export type GetApiV1InvoicesPublicIDISDOCFetchResponse = 
| FetchResponse<InvoiceISDOCDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1InvoicesPublicIDISDOCPath = (publicID: string) => `/api/v1/invoices/${publicID}/ISDOC`;

export const getApiV1InvoicesPublicIDISDOC = (publicID: string, headers = new Headers()):
  Promise<GetApiV1InvoicesPublicIDISDOCFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1InvoicesPublicIDISDOCPath(publicID)}`, headers, {}) as Promise<GetApiV1InvoicesPublicIDISDOCFetchResponse>;
}

export type GetApiV1InvoicesPublicIDISDOCPdfFetchResponse = 
| FetchResponse<InvoiceISDOCPdfBase64Dto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1InvoicesPublicIDISDOCPdfPath = (publicID: string) => `/api/v1/invoices/${publicID}/ISDOCPdf`;

export const getApiV1InvoicesPublicIDISDOCPdf = (publicID: string, headers = new Headers()):
  Promise<GetApiV1InvoicesPublicIDISDOCPdfFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1InvoicesPublicIDISDOCPdfPath(publicID)}`, headers, {}) as Promise<GetApiV1InvoicesPublicIDISDOCPdfFetchResponse>;
}

export type GetApiV1InvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse = 
| FetchResponse<InvoiceForSupplierCompanyByUserISDOCPdfBase64ListDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1InvoicesInvoiceForSupplierCompanyByUserISDOCPdfPath = () => `/api/v1/invoices/invoice-for-supplier-company-by-user/ISDOCPdf`;

export const getApiV1InvoicesInvoiceForSupplierCompanyByUserISDOCPdf = (InvoicePublicIDs?: string[], headers = new Headers()):
  Promise<GetApiV1InvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse> => {
    const queryParams = {
      "InvoicePublicIDs": InvoicePublicIDs
    }
    return apiGet(`${getApiUrl()}${getApiV1InvoicesInvoiceForSupplierCompanyByUserISDOCPdfPath()}`, headers, queryParams) as Promise<GetApiV1InvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse>;
}

export type PostApiV1InvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse = 
| FetchResponse<CancelInvoiceForClientByOrderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1InvoicesInvoiceForClientByOrderPublicIDCancelPath = (publicID: string) => `/api/v1/invoices/invoice-for-client-by-order/${publicID}/cancel`;

export const postApiV1InvoicesInvoiceForClientByOrderPublicIDCancel = (publicID: string, headers = new Headers()):
  Promise<PostApiV1InvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1InvoicesInvoiceForClientByOrderPublicIDCancelPath(publicID)}`, requestData, headers) as Promise<PostApiV1InvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse>;
}

export type PostApiV1EnterprisesFetchResponse = 
| FetchResponse<void, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1EnterprisesPath = () => `/api/v1/enterprises`;

export const postApiV1Enterprises = (requestContract: CreateEnterpriseRequest, headers = new Headers()):
  Promise<PostApiV1EnterprisesFetchResponse> => {
    const requestData = getApiRequestData<CreateEnterpriseRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1EnterprisesPath()}`, requestData, headers) as Promise<PostApiV1EnterprisesFetchResponse>;
}

export type PostApiV1EnterprisesChangeModeFetchResponse = 
| FetchResponse<ChangeEnterpriseModeCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1EnterprisesChangeModePath = () => `/api/v1/enterprises/change-mode`;

export const postApiV1EnterprisesChangeMode = (requestContract: EnterpriseModeChangeRequest, headers = new Headers()):
  Promise<PostApiV1EnterprisesChangeModeFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseModeChangeRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1EnterprisesChangeModePath()}`, requestData, headers) as Promise<PostApiV1EnterprisesChangeModeFetchResponse>;
}

export type PutApiV1EnterprisesDesignSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseDesignSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1EnterprisesDesignSettingsPath = () => `/api/v1/enterprises/design-settings`;

export const putApiV1EnterprisesDesignSettings = (requestContract: EnterpriseDesignSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiV1EnterprisesDesignSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseDesignSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1EnterprisesDesignSettingsPath()}`, requestData, headers) as Promise<PutApiV1EnterprisesDesignSettingsFetchResponse>;
}

export type PutApiV1EnterprisesCommunicationSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseCommunicationSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1EnterprisesCommunicationSettingsPath = () => `/api/v1/enterprises/communication-settings`;

export const putApiV1EnterprisesCommunicationSettings = (requestContract: EnterpriseCommunicationSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiV1EnterprisesCommunicationSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseCommunicationSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1EnterprisesCommunicationSettingsPath()}`, requestData, headers) as Promise<PutApiV1EnterprisesCommunicationSettingsFetchResponse>;
}

export type GetApiV1EnterprisesBasicSettingsFetchResponse = 
| FetchResponse<EnterpriseBasicSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesBasicSettingsPath = () => `/api/v1/enterprises/basic-settings`;

export const getApiV1EnterprisesBasicSettings = (headers = new Headers()):
  Promise<GetApiV1EnterprisesBasicSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesBasicSettingsPath()}`, headers, {}) as Promise<GetApiV1EnterprisesBasicSettingsFetchResponse>;
}

export type GetApiV1EnterprisesExternalIDBasicSettingsFetchResponse = 
| FetchResponse<EnterpriseBasicSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesExternalIDBasicSettingsPath = (externalID: string) => `/api/v1/enterprises/${externalID}/basic-settings`;

export const getApiV1EnterprisesExternalIDBasicSettings = (externalID: string, headers = new Headers()):
  Promise<GetApiV1EnterprisesExternalIDBasicSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesExternalIDBasicSettingsPath(externalID)}`, headers, {}) as Promise<GetApiV1EnterprisesExternalIDBasicSettingsFetchResponse>;
}

export type GetApiV1EnterprisesCommissionSettingsFetchResponse = 
| FetchResponse<EntityListOfEnterpriseCommissionSettingsListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesCommissionSettingsPath = () => `/api/v1/enterprises/commission-settings`;

export const getApiV1EnterprisesCommissionSettings = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiV1EnterprisesCommissionSettingsFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesCommissionSettingsPath()}`, headers, queryParams) as Promise<GetApiV1EnterprisesCommissionSettingsFetchResponse>;
}

export type PostApiV1EnterprisesCommissionSettingsFetchResponse = 
| FetchResponse<CreateEnterpriseCommissionSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCreateEnterpriseCommissionSettingsErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1EnterprisesCommissionSettingsPath = () => `/api/v1/enterprises/commission-settings`;

export const postApiV1EnterprisesCommissionSettings = (requestContract: CreateEnterpriseCommissionSettingsRequest, headers = new Headers()):
  Promise<PostApiV1EnterprisesCommissionSettingsFetchResponse> => {
    const requestData = getApiRequestData<CreateEnterpriseCommissionSettingsRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1EnterprisesCommissionSettingsPath()}`, requestData, headers) as Promise<PostApiV1EnterprisesCommissionSettingsFetchResponse>;
}

export type GetApiV1EnterprisesServiceSettingsFetchResponse = 
| FetchResponse<EnterpriseServiceSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesServiceSettingsPath = () => `/api/v1/enterprises/service-settings`;

export const getApiV1EnterprisesServiceSettings = (headers = new Headers()):
  Promise<GetApiV1EnterprisesServiceSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesServiceSettingsPath()}`, headers, {}) as Promise<GetApiV1EnterprisesServiceSettingsFetchResponse>;
}

export type PutApiV1EnterprisesServiceSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseServiceSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1EnterprisesServiceSettingsPath = () => `/api/v1/enterprises/service-settings`;

export const putApiV1EnterprisesServiceSettings = (requestContract: EnterpriseServiceSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiV1EnterprisesServiceSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1EnterprisesServiceSettingsPath()}`, requestData, headers) as Promise<PutApiV1EnterprisesServiceSettingsFetchResponse>;
}

export type GetApiV1EnterprisesServicesFetchResponse = 
| FetchResponse<EnterpriseServiceListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesServicesPath = () => `/api/v1/enterprises/services`;

export const getApiV1EnterprisesServices = (headers = new Headers()):
  Promise<GetApiV1EnterprisesServicesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesServicesPath()}`, headers, {}) as Promise<GetApiV1EnterprisesServicesFetchResponse>;
}

export type PutApiV1EnterprisesServicesFetchResponse = 
| FetchResponse<SaveEnterpriseServicesCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1EnterprisesServicesPath = () => `/api/v1/enterprises/services`;

export const putApiV1EnterprisesServices = (requestContract: EnterpriseServicesUpdateRequest, headers = new Headers()):
  Promise<PutApiV1EnterprisesServicesFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseServicesUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1EnterprisesServicesPath()}`, requestData, headers) as Promise<PutApiV1EnterprisesServicesFetchResponse>;
}

export type GetApiV1EnterprisesLogoFetchResponse = 
| FetchResponse<EnterpriseLogoDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesLogoPath = () => `/api/v1/enterprises/logo`;

export const getApiV1EnterprisesLogo = (headers = new Headers()):
  Promise<GetApiV1EnterprisesLogoFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesLogoPath()}`, headers, {}) as Promise<GetApiV1EnterprisesLogoFetchResponse>;
}

export type GetApiV1EnterprisesPublicIDLogoJsonFetchResponse = 
| FetchResponse<EnterpriseLogoDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesPublicIDLogoJsonPath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/json`;

export const getApiV1EnterprisesPublicIDLogoJson = (publicID: string, headers = new Headers()):
  Promise<GetApiV1EnterprisesPublicIDLogoJsonFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesPublicIDLogoJsonPath(publicID)}`, headers, {}) as Promise<GetApiV1EnterprisesPublicIDLogoJsonFetchResponse>;
}

export type GetApiV1EnterprisesPublicIDLogoFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesPublicIDLogoFilePath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/file`;

export const getApiV1EnterprisesPublicIDLogoFile = (publicID: string, headers = new Headers()):
  Promise<GetApiV1EnterprisesPublicIDLogoFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesPublicIDLogoFilePath(publicID)}`, headers, {}) as Promise<GetApiV1EnterprisesPublicIDLogoFileFetchResponse>;
}

export type GetApiV1EnterprisesPublicIDLogoTenantFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesPublicIDLogoTenantFilePath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/tenant/file`;

export const getApiV1EnterprisesPublicIDLogoTenantFile = (publicID: string, headers = new Headers()):
  Promise<GetApiV1EnterprisesPublicIDLogoTenantFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesPublicIDLogoTenantFilePath(publicID)}`, headers, {}) as Promise<GetApiV1EnterprisesPublicIDLogoTenantFileFetchResponse>;
}

export type GetApiV1EnterprisesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<EnterpriseDesignSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/enterprises/${publicID}/design-settings`;

export const getApiV1EnterprisesPublicIDDesignSettings = (publicID: string, headers = new Headers()):
  Promise<GetApiV1EnterprisesPublicIDDesignSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesPublicIDDesignSettingsPath(publicID)}`, headers, {}) as Promise<GetApiV1EnterprisesPublicIDDesignSettingsFetchResponse>;
}

export type GetApiV1EnterprisesPackageServiceSettingsFetchResponse = 
| FetchResponse<EnterprisePackageServiceSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1EnterprisesPackageServiceSettingsPath = () => `/api/v1/enterprises/package-service-settings`;

export const getApiV1EnterprisesPackageServiceSettings = (headers = new Headers()):
  Promise<GetApiV1EnterprisesPackageServiceSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1EnterprisesPackageServiceSettingsPath()}`, headers, {}) as Promise<GetApiV1EnterprisesPackageServiceSettingsFetchResponse>;
}

export type PutApiV1EnterprisesPackageServiceSettingsFetchResponse = 
| FetchResponse<SaveEnterprisePackageServiceSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1EnterprisesPackageServiceSettingsPath = () => `/api/v1/enterprises/package-service-settings`;

export const putApiV1EnterprisesPackageServiceSettings = (requestContract: EnterprisePackageServiceSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiV1EnterprisesPackageServiceSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterprisePackageServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1EnterprisesPackageServiceSettingsPath()}`, requestData, headers) as Promise<PutApiV1EnterprisesPackageServiceSettingsFetchResponse>;
}

export type GetApiV1CutoffsFetchResponse = 
| FetchResponse<EntityListOfCutoffListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsPath = () => `/api/v1/cutoffs`;

export const getApiV1Cutoffs = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiV1CutoffsFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiV1CutoffsPath()}`, headers, queryParams) as Promise<GetApiV1CutoffsFetchResponse>;
}

export type PostApiV1CutoffsFetchResponse = 
| FetchResponse<CreateCutoffCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCreateCutoffErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetailsOfCreateCutoffErrorStatus, 409> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1CutoffsPath = () => `/api/v1/cutoffs`;

export const postApiV1Cutoffs = (requestContract: CutoffCreateRequest, headers = new Headers()):
  Promise<PostApiV1CutoffsFetchResponse> => {
    const requestData = getApiRequestData<CutoffCreateRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1CutoffsPath()}`, requestData, headers) as Promise<PostApiV1CutoffsFetchResponse>;
}

export type GetApiV1CutoffsPublicIDFetchResponse = 
| FetchResponse<CutoffDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsPublicIDPath = (publicID: string) => `/api/v1/cutoffs/${publicID}`;

export const getApiV1CutoffsPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiV1CutoffsPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CutoffsPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiV1CutoffsPublicIDFetchResponse>;
}

export type GetApiV1CutoffsCompanyIDDateFromForNextCutoffFetchResponse = 
| FetchResponse<DateFromForNextCutoffDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsCompanyIDDateFromForNextCutoffPath = (companyID: number) => `/api/v1/cutoffs/${companyID}/date-from-for-next-cutoff`;

export const getApiV1CutoffsCompanyIDDateFromForNextCutoff = (companyID: number, headers = new Headers()):
  Promise<GetApiV1CutoffsCompanyIDDateFromForNextCutoffFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CutoffsCompanyIDDateFromForNextCutoffPath(companyID)}`, headers, {}) as Promise<GetApiV1CutoffsCompanyIDDateFromForNextCutoffFetchResponse>;
}

export type GetApiV1CutoffsExpectedUserCommissionFetchResponse = 
| FetchResponse<GetExpectedUserCommissionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsExpectedUserCommissionPath = () => `/api/v1/cutoffs/expected-user-commission`;

export const getApiV1CutoffsExpectedUserCommission = (headers = new Headers()):
  Promise<GetApiV1CutoffsExpectedUserCommissionFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CutoffsExpectedUserCommissionPath()}`, headers, {}) as Promise<GetApiV1CutoffsExpectedUserCommissionFetchResponse>;
}

export type GetApiV1CutoffsPaidUserCommissionFetchResponse = 
| FetchResponse<GetPaidUserCommissionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsPaidUserCommissionPath = () => `/api/v1/cutoffs/paid-user-commission`;

export const getApiV1CutoffsPaidUserCommission = (headers = new Headers()):
  Promise<GetApiV1CutoffsPaidUserCommissionFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CutoffsPaidUserCommissionPath()}`, headers, {}) as Promise<GetApiV1CutoffsPaidUserCommissionFetchResponse>;
}

export type GetApiV1CutoffsPublicIDISDOCPdfsFetchResponse = 
| FetchResponse<CutoffISDOCPdfsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsPublicIDISDOCPdfsPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/ISDOCPdfs`;

export const getApiV1CutoffsPublicIDISDOCPdfs = (publicID: string, headers = new Headers()):
  Promise<GetApiV1CutoffsPublicIDISDOCPdfsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CutoffsPublicIDISDOCPdfsPath(publicID)}`, headers, {}) as Promise<GetApiV1CutoffsPublicIDISDOCPdfsFetchResponse>;
}

export type PostApiV1CutoffsPublicIDSendPaymentsFetchResponse = 
| FetchResponse<SendCutoffPaymentsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1CutoffsPublicIDSendPaymentsPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/send-payments`;

export const postApiV1CutoffsPublicIDSendPayments = (publicID: string, headers = new Headers()):
  Promise<PostApiV1CutoffsPublicIDSendPaymentsFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiV1CutoffsPublicIDSendPaymentsPath(publicID)}`, requestData, headers) as Promise<PostApiV1CutoffsPublicIDSendPaymentsFetchResponse>;
}

export type GetApiV1CutoffsPublicIDDetailPdfFetchResponse = 
| FetchResponse<CutoffDetailPdfBase64Dto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsPublicIDDetailPdfPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/detail-pdf`;

export const getApiV1CutoffsPublicIDDetailPdf = (publicID: string, headers = new Headers()):
  Promise<GetApiV1CutoffsPublicIDDetailPdfFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CutoffsPublicIDDetailPdfPath(publicID)}`, headers, {}) as Promise<GetApiV1CutoffsPublicIDDetailPdfFetchResponse>;
}

export type GetApiV1CutoffsUserSupplierCompaniesFetchResponse = 
| FetchResponse<CutoffUserSupplierCompanyListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CutoffsUserSupplierCompaniesPath = () => `/api/v1/cutoffs/user-supplier-companies`;

export const getApiV1CutoffsUserSupplierCompanies = (headers = new Headers()):
  Promise<GetApiV1CutoffsUserSupplierCompaniesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CutoffsUserSupplierCompaniesPath()}`, headers, {}) as Promise<GetApiV1CutoffsUserSupplierCompaniesFetchResponse>;
}

export type GetApiV1CompaniesPublicIDFetchResponse = 
| FetchResponse<CompanyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CompaniesPublicIDPath = (publicID: string) => `/api/v1/companies/${publicID}`;

export const getApiV1CompaniesPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiV1CompaniesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CompaniesPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiV1CompaniesPublicIDFetchResponse>;
}

export type PostApiV1CompaniesFetchResponse = 
| FetchResponse<CreateCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1CompaniesPath = () => `/api/v1/companies`;

export const postApiV1Companies = (requestContract: CompanyCreateRequest, headers = new Headers()):
  Promise<PostApiV1CompaniesFetchResponse> => {
    const requestData = getApiRequestData<CompanyCreateRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1CompaniesPath()}`, requestData, headers) as Promise<PostApiV1CompaniesFetchResponse>;
}

export type PutApiV1CompaniesFetchResponse = 
| FetchResponse<UpdateCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1CompaniesPath = () => `/api/v1/companies`;

export const putApiV1Companies = (requestContract: CompanyUpdateRequest, headers = new Headers()):
  Promise<PutApiV1CompaniesFetchResponse> => {
    const requestData = getApiRequestData<CompanyUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1CompaniesPath()}`, requestData, headers) as Promise<PutApiV1CompaniesFetchResponse>;
}

export type GetApiV1CompaniesUserSupplierCompaniesFetchResponse = 
| FetchResponse<UserSupplierCompanyListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CompaniesUserSupplierCompaniesPath = () => `/api/v1/companies/user-supplier-companies`;

export const getApiV1CompaniesUserSupplierCompanies = (headers = new Headers()):
  Promise<GetApiV1CompaniesUserSupplierCompaniesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CompaniesUserSupplierCompaniesPath()}`, headers, {}) as Promise<GetApiV1CompaniesUserSupplierCompaniesFetchResponse>;
}

export type PostApiV1CompaniesUserSupplierCompanyFetchResponse = 
| FetchResponse<SetUserSupplierCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1CompaniesUserSupplierCompanyPath = () => `/api/v1/companies/user-supplier-company`;

export const postApiV1CompaniesUserSupplierCompany = (requestContract: UserSupplierCompanySetRequest, headers = new Headers()):
  Promise<PostApiV1CompaniesUserSupplierCompanyFetchResponse> => {
    const requestData = getApiRequestData<UserSupplierCompanySetRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1CompaniesUserSupplierCompanyPath()}`, requestData, headers) as Promise<PostApiV1CompaniesUserSupplierCompanyFetchResponse>;
}

export type GetApiV1CompaniesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<CompanyDesignSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CompaniesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/design-settings`;

export const getApiV1CompaniesPublicIDDesignSettings = (publicID: string, headers = new Headers()):
  Promise<GetApiV1CompaniesPublicIDDesignSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CompaniesPublicIDDesignSettingsPath(publicID)}`, headers, {}) as Promise<GetApiV1CompaniesPublicIDDesignSettingsFetchResponse>;
}

export type PutApiV1CompaniesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<SaveCompanyDesignSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1CompaniesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/design-settings`;

export const putApiV1CompaniesPublicIDDesignSettings = (requestContract: SaveCompanyDesignSettingsRequest, publicID: string, headers = new Headers()):
  Promise<PutApiV1CompaniesPublicIDDesignSettingsFetchResponse> => {
    const requestData = getApiRequestData<SaveCompanyDesignSettingsRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1CompaniesPublicIDDesignSettingsPath(publicID)}`, requestData, headers) as Promise<PutApiV1CompaniesPublicIDDesignSettingsFetchResponse>;
}

export type GetApiV1CompaniesPublicIDFioSettingsFetchResponse = 
| FetchResponse<CompanyFioSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CompaniesPublicIDFioSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/fio-settings`;

export const getApiV1CompaniesPublicIDFioSettings = (publicID: string, headers = new Headers()):
  Promise<GetApiV1CompaniesPublicIDFioSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CompaniesPublicIDFioSettingsPath(publicID)}`, headers, {}) as Promise<GetApiV1CompaniesPublicIDFioSettingsFetchResponse>;
}

export type PutApiV1CompaniesPublicIDFioSettingsFetchResponse = 
| FetchResponse<SaveCompanyFioSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1CompaniesPublicIDFioSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/fio-settings`;

export const putApiV1CompaniesPublicIDFioSettings = (requestContract: SaveFioSettingsRequest, publicID: string, headers = new Headers()):
  Promise<PutApiV1CompaniesPublicIDFioSettingsFetchResponse> => {
    const requestData = getApiRequestData<SaveFioSettingsRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1CompaniesPublicIDFioSettingsPath(publicID)}`, requestData, headers) as Promise<PutApiV1CompaniesPublicIDFioSettingsFetchResponse>;
}

export type GetApiV1CompaniesPublicIDLogoFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CompaniesPublicIDLogoFilePath = (publicID: string) => `/api/v1/companies/${publicID}/logo/file`;

export const getApiV1CompaniesPublicIDLogoFile = (publicID: string, headers = new Headers()):
  Promise<GetApiV1CompaniesPublicIDLogoFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CompaniesPublicIDLogoFilePath(publicID)}`, headers, {}) as Promise<GetApiV1CompaniesPublicIDLogoFileFetchResponse>;
}

export type GetApiV1CodeListsFetchResponse = 
| FetchResponse<GetCodeListCollectionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1CodeListsPath = () => `/api/v1/code-lists`;

export const getApiV1CodeLists = (headers = new Headers()):
  Promise<GetApiV1CodeListsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1CodeListsPath()}`, headers, {}) as Promise<GetApiV1CodeListsFetchResponse>;
}

export type GetApiV1ClientsCountFetchResponse = 
| FetchResponse<GetClientsCountQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1ClientsCountPath = () => `/api/v1/clients/count`;

export const getApiV1ClientsCount = (headers = new Headers()):
  Promise<GetApiV1ClientsCountFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiV1ClientsCountPath()}`, headers, {}) as Promise<GetApiV1ClientsCountFetchResponse>;
}

export type GetApiV1ClientsSearchFetchResponse = 
| FetchResponse<ClientDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1ClientsSearchPath = () => `/api/v1/clients/search`;

export const getApiV1ClientsSearch = (query?: string, headers = new Headers()):
  Promise<GetApiV1ClientsSearchFetchResponse> => {
    const queryParams = {
      "query": query
    }
    return apiGet(`${getApiUrl()}${getApiV1ClientsSearchPath()}`, headers, queryParams) as Promise<GetApiV1ClientsSearchFetchResponse>;
}

export type GetApiV1ClientsSearchPersonalNumberFetchResponse = 
| FetchResponse<ClientDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiV1ClientsSearchPersonalNumberPath = () => `/api/v1/clients/search/personal-number`;

export const getApiV1ClientsSearchPersonalNumber = (query?: string, headers = new Headers()):
  Promise<GetApiV1ClientsSearchPersonalNumberFetchResponse> => {
    const queryParams = {
      "query": query
    }
    return apiGet(`${getApiUrl()}${getApiV1ClientsSearchPersonalNumberPath()}`, headers, queryParams) as Promise<GetApiV1ClientsSearchPersonalNumberFetchResponse>;
}

export type PostApiV1CacheRefreshFetchResponse = 
| FetchResponse<void, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1CacheRefreshPath = () => `/api/v1/cache/refresh`;

export const postApiV1CacheRefresh = (body: string, headers = new Headers()):
  Promise<PostApiV1CacheRefreshFetchResponse> => {
    const requestData = getApiRequestData<string>(body, false);

    return apiPost(`${getApiUrl()}${postApiV1CacheRefreshPath()}`, requestData, headers) as Promise<PostApiV1CacheRefreshFetchResponse>;
}

export type PostApiV1AuthSignUpFetchResponse = 
| FetchResponse<SignUpCommandResult, 201> 
| FetchResponse<ApiProblemDetailsOfPasswordChangeResultStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfSignUpErrorStatus, 409> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1AuthSignUpPath = () => `/api/v1/auth/sign-up`;

export const postApiV1AuthSignUp = (requestContract: SignUpCommand, headers = new Headers()):
  Promise<PostApiV1AuthSignUpFetchResponse> => {
    const requestData = getApiRequestData<SignUpCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1AuthSignUpPath()}`, requestData, headers) as Promise<PostApiV1AuthSignUpFetchResponse>;
}

export type PostApiV1AuthSignInFetchResponse = 
| FetchResponse<SignInResult, 200> 
| FetchResponse<ApiProblemDetailsOfAuthError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1AuthSignInPath = () => `/api/v1/auth/sign-in`;

export const postApiV1AuthSignIn = (requestContract: SignInCommand, headers = new Headers()):
  Promise<PostApiV1AuthSignInFetchResponse> => {
    const requestData = getApiRequestData<SignInCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1AuthSignInPath()}`, requestData, headers) as Promise<PostApiV1AuthSignInFetchResponse>;
}

export type PostApiV1AuthTokenFetchResponse = 
| FetchResponse<TokenResponse, 200> 
| FetchResponse<ApiProblemDetailsOfAuthError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1AuthTokenPath = () => `/api/v1/auth/token`;

export const postApiV1AuthToken = (headers = new Headers()):
  Promise<PostApiV1AuthTokenFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, true);

    return apiPost(`${getApiUrl()}${postApiV1AuthTokenPath()}`, requestData, headers) as Promise<PostApiV1AuthTokenFetchResponse>;
}

export type PostApiV1AuthEmailVerificationFetchResponse = 
| FetchResponse<EmailVerificationCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfEmailVerificationCommandResultStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1AuthEmailVerificationPath = () => `/api/v1/auth/email-verification`;

export const postApiV1AuthEmailVerification = (requestContract: EmailVerificationCommand, headers = new Headers()):
  Promise<PostApiV1AuthEmailVerificationFetchResponse> => {
    const requestData = getApiRequestData<EmailVerificationCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1AuthEmailVerificationPath()}`, requestData, headers) as Promise<PostApiV1AuthEmailVerificationFetchResponse>;
}

export type PostApiV1AuthEmailVerificationSendFetchResponse = 
| FetchResponse<ResendVerificationEmailCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1AuthEmailVerificationSendPath = () => `/api/v1/auth/email-verification/send`;

export const postApiV1AuthEmailVerificationSend = (requestContract: ResendVerificationEmailCommand, headers = new Headers()):
  Promise<PostApiV1AuthEmailVerificationSendFetchResponse> => {
    const requestData = getApiRequestData<ResendVerificationEmailCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1AuthEmailVerificationSendPath()}`, requestData, headers) as Promise<PostApiV1AuthEmailVerificationSendFetchResponse>;
}

export type PostApiV1AuthSsoFetchResponse = 
| FetchResponse<SignInResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfAuthError, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1AuthSsoPath = () => `/api/v1/auth/sso`;

export const postApiV1AuthSso = (requestContract: SsoSignInRequest, headers = new Headers()):
  Promise<PostApiV1AuthSsoFetchResponse> => {
    const requestData = getApiRequestData<SsoSignInRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1AuthSsoPath()}`, requestData, headers) as Promise<PostApiV1AuthSsoFetchResponse>;
}

export type GetApiV1AuthSsoTokenFetchResponse = 
| FetchResponse<RedirectHttpResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| FetchResponse<ApiProblemDetails, 501> 
| ErrorResponse;

export const getApiV1AuthSsoTokenPath = () => `/api/v1/auth/sso-token`;

export const getApiV1AuthSsoToken = (IdentityProvider?: IdentityProvider, headers = new Headers()):
  Promise<GetApiV1AuthSsoTokenFetchResponse> => {
    const queryParams = {
      "IdentityProvider": IdentityProvider
    }
    return apiGet(`${getApiUrl()}${getApiV1AuthSsoTokenPath()}`, headers, queryParams) as Promise<GetApiV1AuthSsoTokenFetchResponse>;
}

export type PostApiV1AuthPasswordResetFetchResponse = 
| FetchResponse<ResetPasswordCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfResetPasswordCommandResultStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiV1AuthPasswordResetPath = () => `/api/v1/auth/password-reset`;

export const postApiV1AuthPasswordReset = (requestContract: ResetPasswordCommand, headers = new Headers()):
  Promise<PostApiV1AuthPasswordResetFetchResponse> => {
    const requestData = getApiRequestData<ResetPasswordCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiV1AuthPasswordResetPath()}`, requestData, headers) as Promise<PostApiV1AuthPasswordResetFetchResponse>;
}

export type PutApiV1AuthPasswordFetchResponse = 
| FetchResponse<SetPasswordCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfPasswordChangeResultStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfSetPasswordCommandStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiV1AuthPasswordPath = () => `/api/v1/auth/password`;

export const putApiV1AuthPassword = (requestContract: SetPasswordCommand, headers = new Headers()):
  Promise<PutApiV1AuthPasswordFetchResponse> => {
    const requestData = getApiRequestData<SetPasswordCommand>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiV1AuthPasswordPath()}`, requestData, headers) as Promise<PutApiV1AuthPasswordFetchResponse>;
}
