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
		credentials?: RequestCredentials;
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
        const isKeyArrayAndValueIterable = key.endsWith('[]') && typeof (value as any)[Symbol.iterator] === 'function';
        const values = isKeyArrayAndValueIterable ? Array.from(value as Iterable<any>) : [value];
          for (const val of values) {
              if (val === undefined) {
                  continue;
              } else if (val === null) {
                  formData.append(key, '');
              } else if (val instanceof File) {
                  formData.append(key, val);
              } else if (typeof val === 'object' && val !== null) {
                  formData.append(key, JSON.stringify(val));
              } else {
                  formData.append(key, val as any);
              }
          }
      });
    }
  
    return formData;
  }

  
  function updateHeadersAndGetBody<TResponse extends FetchResponse<unknown, number>, TRequest>(
    request: TRequest,
    headers: Headers
  ) {
    updateHeaders(headers);
    if (request instanceof FormData) {
      headers.delete("Content-Type");
      return request;
    } else {      
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
		credentials: "include",
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
		credentials: "include",
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
		credentials: "include",
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
		credentials: "include",
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
		credentials: "include",
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

export type GetApiWorkflowsStepsFetchResponse = 
| FetchResponse<EntityListOfStepDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiWorkflowsStepsPath = () => `/api/v1/workflows/steps`;

export const getApiWorkflowsSteps = (headers = new Headers()):
  Promise<GetApiWorkflowsStepsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiWorkflowsStepsPath()}`, headers, {}) as Promise<GetApiWorkflowsStepsFetchResponse>;
}

export type GetApiUserCompanyFetchResponse = 
| FetchResponse<UserCompanyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiUserCompanyPath = () => `/api/v1/user/company`;

export const getApiUserCompany = (headers = new Headers()):
  Promise<GetApiUserCompanyFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiUserCompanyPath()}`, headers, {}) as Promise<GetApiUserCompanyFetchResponse>;
}

export type PutApiUserCompanyFetchResponse = 
| FetchResponse<SetUserCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiUserCompanyPath = () => `/api/v1/user/company`;

export const putApiUserCompany = (requestContract: UserCompanySetRequest, headers = new Headers()):
  Promise<PutApiUserCompanyFetchResponse> => {
    const requestData = getApiRequestData<UserCompanySetRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiUserCompanyPath()}`, requestData, headers) as Promise<PutApiUserCompanyFetchResponse>;
}

export type GetApiServicesPackagesFetchResponse = 
| FetchResponse<EntityListOfServicePackageListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiServicesPackagesPath = () => `/api/v1/services/packages`;

export const getApiServicesPackages = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiServicesPackagesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiServicesPackagesPath()}`, headers, queryParams) as Promise<GetApiServicesPackagesFetchResponse>;
}

export type GetApiServicesPackagesAvailableServicesFetchResponse = 
| FetchResponse<EntityListOfServiceListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiServicesPackagesAvailableServicesPath = () => `/api/v1/services/packages/available-services`;

export const getApiServicesPackagesAvailableServices = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiServicesPackagesAvailableServicesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiServicesPackagesAvailableServicesPath()}`, headers, queryParams) as Promise<GetApiServicesPackagesAvailableServicesFetchResponse>;
}

export type PostApiServicesPackageFetchResponse = 
| FetchResponse<CreateServicePackageCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiServicesPackagePath = () => `/api/v1/services/package`;

export const postApiServicesPackage = (requestContract: SaveServicePackageRequest, headers = new Headers()):
  Promise<PostApiServicesPackageFetchResponse> => {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiServicesPackagePath()}`, requestData, headers) as Promise<PostApiServicesPackageFetchResponse>;
}

export type GetApiServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<ServicePackageDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const getApiServicesServicePublicIDPackage = (servicePublicID: string, headers = new Headers()):
  Promise<GetApiServicesServicePublicIDPackageFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiServicesServicePublicIDPackagePath(servicePublicID)}`, headers, {}) as Promise<GetApiServicesServicePublicIDPackageFetchResponse>;
}

export type DeleteApiServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<ServicePackageDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteApiServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const deleteApiServicesServicePublicIDPackage = (servicePublicID: string, headers = new Headers()):
  Promise<DeleteApiServicesServicePublicIDPackageFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteApiServicesServicePublicIDPackagePath(servicePublicID)}`, headers, {}) as Promise<DeleteApiServicesServicePublicIDPackageFetchResponse>;
}

export type PutApiServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<UpdateServicePackageCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const putApiServicesServicePublicIDPackage = (requestContract: SaveServicePackageRequest, servicePublicID: string, headers = new Headers()):
  Promise<PutApiServicesServicePublicIDPackageFetchResponse> => {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiServicesServicePublicIDPackagePath(servicePublicID)}`, requestData, headers) as Promise<PutApiServicesServicePublicIDPackageFetchResponse>;
}

export type GetApiPartiesPublicIDFetchResponse = 
| FetchResponse<PartyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiPartiesPublicIDPath = (publicID: string) => `/api/v1/parties/${publicID}`;

export const getApiPartiesPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiPartiesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiPartiesPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiPartiesPublicIDFetchResponse>;
}

export type GetApiPartiesSearchAresFetchResponse = 
| FetchResponse<PartyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiPartiesSearchAresPath = () => `/api/v1/parties/search/ares`;

export const getApiPartiesSearchAres = (query?: string, partyType?: PartyType | undefined | null, headers = new Headers()):
  Promise<GetApiPartiesSearchAresFetchResponse> => {
    const queryParams = {
      "query": query,
      "partyType": partyType
    }
    return apiGet(`${getApiUrl()}${getApiPartiesSearchAresPath()}`, headers, queryParams) as Promise<GetApiPartiesSearchAresFetchResponse>;
}

export type GetApiOrdersFetchResponse = 
| FetchResponse<EntityListOfOrderListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPath = () => `/api/v1/orders`;

export const getApiOrders = (offset?: number, limit?: number, workflowStatuses?: string[], query?: string | undefined | null, startDate?: string | undefined | null, endDate?: string | undefined | null, isSearchInStructure?: boolean, onlyAfterInvoiceDueDate?: boolean, includeClientReminderAvailable?: boolean, headers = new Headers()):
  Promise<GetApiOrdersFetchResponse> => {
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
    return apiGet(`${getApiUrl()}${getApiOrdersPath()}`, headers, queryParams) as Promise<GetApiOrdersFetchResponse>;
}

export type GetApiOrdersPublicIDFetchResponse = 
| FetchResponse<OrderDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPublicIDPath = (publicID: string) => `/api/v1/orders/${publicID}`;

export const getApiOrdersPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiOrdersPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiOrdersPublicIDFetchResponse>;
}

export type DeleteApiOrdersPublicIDFetchResponse = 
| FetchResponse<DeleteOrderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteApiOrdersPublicIDPath = (publicID: string) => `/api/v1/orders/${publicID}`;

export const deleteApiOrdersPublicID = (publicID: string, headers = new Headers()):
  Promise<DeleteApiOrdersPublicIDFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteApiOrdersPublicIDPath(publicID)}`, headers, {}) as Promise<DeleteApiOrdersPublicIDFetchResponse>;
}

export type PutApiOrdersPublicIDPeriodicityFetchResponse = 
| FetchResponse<SetPeriodicityCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiOrdersPublicIDPeriodicityPath = (publicID: string) => `/api/v1/orders/${publicID}/periodicity`;

export const putApiOrdersPublicIDPeriodicity = (requestContract: SetPeriodicityRequest, publicID: string, headers = new Headers()):
  Promise<PutApiOrdersPublicIDPeriodicityFetchResponse> => {
    const requestData = getApiRequestData<SetPeriodicityRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiOrdersPublicIDPeriodicityPath(publicID)}`, requestData, headers) as Promise<PutApiOrdersPublicIDPeriodicityFetchResponse>;
}

export type GetApiOrdersPublicIDServicesFetchResponse = 
| FetchResponse<EntityListOfOrderServiceDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPublicIDServicesPath = (publicID: string) => `/api/v1/orders/${publicID}/services`;

export const getApiOrdersPublicIDServices = (publicID: string, headers = new Headers()):
  Promise<GetApiOrdersPublicIDServicesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersPublicIDServicesPath(publicID)}`, headers, {}) as Promise<GetApiOrdersPublicIDServicesFetchResponse>;
}

export type DeleteApiOrdersServicesServiceIDFetchResponse = 
| FetchResponse<DeleteOrderServiceCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteApiOrdersServicesServiceIDPath = (serviceID: number) => `/api/v1/orders/services/${serviceID}`;

export const deleteApiOrdersServicesServiceID = (serviceID: number, headers = new Headers()):
  Promise<DeleteApiOrdersServicesServiceIDFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteApiOrdersServicesServiceIDPath(serviceID)}`, headers, {}) as Promise<DeleteApiOrdersServicesServiceIDFetchResponse>;
}

export type GetApiOrdersPeriodicUpcomingFetchResponse = 
| FetchResponse<EntityListOfUpcomingPeriodicOrderDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPeriodicUpcomingPath = () => `/api/v1/orders/periodic/upcoming`;

export const getApiOrdersPeriodicUpcoming = (offset?: number, limit?: number, nexOrderDate?: string, headers = new Headers()):
  Promise<GetApiOrdersPeriodicUpcomingFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit,
      "nexOrderDate": nexOrderDate
    }
    return apiGet(`${getApiUrl()}${getApiOrdersPeriodicUpcomingPath()}`, headers, queryParams) as Promise<GetApiOrdersPeriodicUpcomingFetchResponse>;
}

export type GetApiOrdersRevocationExampleFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersRevocationExampleFilePath = () => `/api/v1/orders/revocation/example/file`;

export const getApiOrdersRevocationExampleFile = (headers = new Headers()):
  Promise<GetApiOrdersRevocationExampleFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersRevocationExampleFilePath()}`, headers, {}) as Promise<GetApiOrdersRevocationExampleFileFetchResponse>;
}

export type GetApiOrdersPublicIDPaymentCalendarItemsFetchResponse = 
| FetchResponse<EntityListOfPaymentCalendarItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPublicIDPaymentCalendarItemsPath = (publicID: string) => `/api/v1/orders/${publicID}/payment-calendar-items`;

export const getApiOrdersPublicIDPaymentCalendarItems = (publicID: string, headers = new Headers()):
  Promise<GetApiOrdersPublicIDPaymentCalendarItemsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersPublicIDPaymentCalendarItemsPath(publicID)}`, headers, {}) as Promise<GetApiOrdersPublicIDPaymentCalendarItemsFetchResponse>;
}

export type GetApiOrdersCountFetchResponse = 
| FetchResponse<GetOrdersCountQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersCountPath = () => `/api/v1/orders/count`;

export const getApiOrdersCount = (onlyActive?: boolean, headers = new Headers()):
  Promise<GetApiOrdersCountFetchResponse> => {
    const queryParams = {
      "onlyActive": onlyActive
    }
    return apiGet(`${getApiUrl()}${getApiOrdersCountPath()}`, headers, queryParams) as Promise<GetApiOrdersCountFetchResponse>;
}

export type PostApiOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse = 
| FetchResponse<SetPeriodicityCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientPath = (orderPublicID: string) => `/api/v1/orders/${orderPublicID}/client-invoice-recurring-payment-create-invoice-and-set-as-paid-by-client`;

export const postApiOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClient = (requestContract: ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest, orderPublicID: string, headers = new Headers()):
  Promise<PostApiOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse> => {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientPath(orderPublicID)}`, requestData, headers) as Promise<PostApiOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse>;
}

export type GetApiOrdersPublicIDClientZonePaymentCalendarItemsFetchResponse = 
| FetchResponse<EntityListOfPaymentCalendarClientZoneItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPublicIDClientZonePaymentCalendarItemsPath = (publicID: string) => `/api/v1/orders/${publicID}/client-zone/payment-calendar-items`;

export const getApiOrdersPublicIDClientZonePaymentCalendarItems = (publicID: string, headers = new Headers()):
  Promise<GetApiOrdersPublicIDClientZonePaymentCalendarItemsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersPublicIDClientZonePaymentCalendarItemsPath(publicID)}`, headers, {}) as Promise<GetApiOrdersPublicIDClientZonePaymentCalendarItemsFetchResponse>;
}

export type GetApiOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse = 
| FetchResponse<GetEucsOrderInfoQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoPath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/eucs-order/info`;

export const getApiOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfo = (publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<GetApiOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoPath(publicID, orderServiceID)}`, headers, {}) as Promise<GetApiOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse>;
}

export type PostApiOrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse = 
| FetchResponse<CancelProductInInstitutionCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDOrderServiceOrderServiceIDProductCancelPath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/cancel`;

export const postApiOrdersPublicIDOrderServiceOrderServiceIDProductCancel = (requestContract: CancelProductInInstitutionCommandRequest, publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse> => {
    const requestData = getApiRequestData<CancelProductInInstitutionCommandRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDOrderServiceOrderServiceIDProductCancelPath(publicID, orderServiceID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse>;
}

export type PostApiOrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse = 
| FetchResponse<CreateProductInInstitutionCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDOrderServiceOrderServiceIDProductCreatePath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/create`;

export const postApiOrdersPublicIDOrderServiceOrderServiceIDProductCreate = (requestContract: CreateProductInInstitutionRequest, publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse> => {
    const requestData = getApiRequestData<CreateProductInInstitutionRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDOrderServiceOrderServiceIDProductCreatePath(publicID, orderServiceID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse>;
}

export type GetApiOrdersPublicIDWorkflowStepsFetchResponse = 
| FetchResponse<EntityListOfOrderWorkflowStepDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPublicIDWorkflowStepsPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/steps`;

export const getApiOrdersPublicIDWorkflowSteps = (publicID: string, headers = new Headers()):
  Promise<GetApiOrdersPublicIDWorkflowStepsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersPublicIDWorkflowStepsPath(publicID)}`, headers, {}) as Promise<GetApiOrdersPublicIDWorkflowStepsFetchResponse>;
}

export type PostApiOrdersWorkflowDraftFetchResponse = 
| FetchResponse<SaveDraftCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersWorkflowDraftPath = () => `/api/v1/orders/workflow/draft`;

export const postApiOrdersWorkflowDraft = (requestContract: SaveDraftRequest, headers = new Headers()):
  Promise<PostApiOrdersWorkflowDraftFetchResponse> => {
    const requestData = getApiRequestData<SaveDraftRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersWorkflowDraftPath()}`, requestData, headers) as Promise<PostApiOrdersWorkflowDraftFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowDraftCompleteFetchResponse = 
| FetchResponse<DraftStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowDraftCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/draft/complete`;

export const postApiOrdersPublicIDWorkflowDraftComplete = (publicID: string, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowDraftCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowDraftCompletePath(publicID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowDraftCompleteFetchResponse>;
}

export type GetApiOrdersWorkflowClientReviewTokenSummaryFetchResponse = 
| FetchResponse<GetClientReviewSummaryQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersWorkflowClientReviewTokenSummaryPath = (token: string) => `/api/v1/orders/workflow/client-review/${token}/summary`;

export const getApiOrdersWorkflowClientReviewTokenSummary = (token: string, headers = new Headers()):
  Promise<GetApiOrdersWorkflowClientReviewTokenSummaryFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersWorkflowClientReviewTokenSummaryPath(token)}`, headers, {}) as Promise<GetApiOrdersWorkflowClientReviewTokenSummaryFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientReviewReminderFetchResponse = 
| FetchResponse<SendReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientReviewReminderPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-review/reminder`;

export const postApiOrdersPublicIDWorkflowClientReviewReminder = (publicID: string, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientReviewReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientReviewReminderPath(publicID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientReviewReminderFetchResponse>;
}

export type PostApiOrdersWorkflowClientApprovalTokenRejectFetchResponse = 
| FetchResponse<ClientApprovalStepRejectCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersWorkflowClientApprovalTokenRejectPath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/reject`;

export const postApiOrdersWorkflowClientApprovalTokenReject = (requestContract: ClientApprovalRejectRequest, token: string, headers = new Headers()):
  Promise<PostApiOrdersWorkflowClientApprovalTokenRejectFetchResponse> => {
    const requestData = getApiRequestData<ClientApprovalRejectRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersWorkflowClientApprovalTokenRejectPath(token)}`, requestData, headers) as Promise<PostApiOrdersWorkflowClientApprovalTokenRejectFetchResponse>;
}

export type PutApiOrdersWorkflowClientApprovalTokenInProgressFetchResponse = 
| FetchResponse<ClientApprovalStepInitCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiOrdersWorkflowClientApprovalTokenInProgressPath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/in-progress`;

export const putApiOrdersWorkflowClientApprovalTokenInProgress = (token: string, headers = new Headers()):
  Promise<PutApiOrdersWorkflowClientApprovalTokenInProgressFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPut(`${getApiUrl()}${putApiOrdersWorkflowClientApprovalTokenInProgressPath(token)}`, requestData, headers) as Promise<PutApiOrdersWorkflowClientApprovalTokenInProgressFetchResponse>;
}

export type PostApiOrdersWorkflowClientApprovalTokenCompleteFetchResponse = 
| FetchResponse<CompleteClientApprovalStepCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCompleteClientApprovalStepError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersWorkflowClientApprovalTokenCompletePath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/complete`;

export const postApiOrdersWorkflowClientApprovalTokenComplete = (requestContract: ClientApprovalCompleteRequest, token: string, headers = new Headers()):
  Promise<PostApiOrdersWorkflowClientApprovalTokenCompleteFetchResponse> => {
    const requestData = getApiRequestData<ClientApprovalCompleteRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersWorkflowClientApprovalTokenCompletePath(token)}`, requestData, headers) as Promise<PostApiOrdersWorkflowClientApprovalTokenCompleteFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse = 
| FetchResponse<OrderServiceCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompletePath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/workflow/processing-services/${orderServiceID}/complete`;

export const postApiOrdersPublicIDWorkflowProcessingServicesOrderServiceIDComplete = (publicID: string, orderServiceID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompletePath(publicID, orderServiceID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse = 
| FetchResponse<InvoiceIssuanceStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowInvoiceIssuanceCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-issuance/complete`;

export const postApiOrdersPublicIDWorkflowInvoiceIssuanceComplete = (publicID: string, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowInvoiceIssuanceCompletePath(publicID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse = 
| FetchResponse<InvoicePaymentStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowInvoicePaymentCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-payment/complete`;

export const postApiOrdersPublicIDWorkflowInvoicePaymentComplete = (publicID: string, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowInvoicePaymentCompletePath(publicID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse = 
| FetchResponse<InvoicePaymentStepReminderCommand, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowInvoicePaymentReminderPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-payment/reminder`;

export const postApiOrdersPublicIDWorkflowInvoicePaymentReminder = (publicID: string, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowInvoicePaymentReminderPath(publicID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse>;
}

export type GetApiOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse = 
| FetchResponse<EnterpriseInvoiceIssuanceAndPaymentStepQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/enterprise-invoice-issuance-and-payment`;

export const getApiOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPayment = (publicID: string, headers = new Headers()):
  Promise<GetApiOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentPath(publicID)}`, headers, {}) as Promise<GetApiOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentCancelCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentCancelErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/cancel`;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancel = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentReminderErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/reminder`;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminder = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse = 
| FetchResponse<ClientPrepaidInvoiceRecurringPaymentReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentReminderErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/reminder`;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminder = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentCreateInvoiceCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentCreateAndSendInvoiceToClientErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoicePath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/send-invoice`;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoice = (publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoicePath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentClientPaidCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentClientPaidErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/pay`;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPay = (requestContract: ClientInvoiceRecurringPaymentClientPaidRequest, publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse> => {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentClientPaidRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse = 
| FetchResponse<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/send-invoice-and-pay`;

export const postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPay = (requestContract: ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest, publicID: string, paymentCalendarItemID: number, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayPath(publicID, paymentCalendarItemID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse = 
| FetchResponse<SendClientAssignmentEmailCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-assignment/send-assignment-email`;

export const postApiOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmail = (publicID: string, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailPath(publicID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse>;
}

export type PostApiOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-prepaid-payment-approval/complete`;

export const postApiOrdersPublicIDWorkflowClientPrepaidPaymentApprovalComplete = (requestContract: ClientPrepaidPaymentApprovalStepCompleteCommandRequest, publicID: string, headers = new Headers()):
  Promise<PostApiOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepCompleteCommandRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompletePath(publicID)}`, requestData, headers) as Promise<PostApiOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse>;
}

export type PostApiOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepInProgressCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfInProgressClientApprovalStepError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressPath = (token: string) => `/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/in-progress`;

export const postApiOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgress = (requestContract: ClientPrepaidPaymentApprovalStepInProgressRequest, token: string, headers = new Headers()):
  Promise<PostApiOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepInProgressRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressPath(token)}`, requestData, headers) as Promise<PostApiOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse>;
}

export type PostApiOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepRejectCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectPath = (token: string) => `/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/reject`;

export const postApiOrdersWorkflowClientPrepaidPaymentApprovalTokenReject = (requestContract: ClientPrepaidPaymentApprovalStepRejectRequest, token: string, headers = new Headers()):
  Promise<PostApiOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepRejectRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectPath(token)}`, requestData, headers) as Promise<PostApiOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse>;
}

export type PutApiNotificationsUserSettingsFetchResponse = 
| FetchResponse<SaveUserNotificationSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiNotificationsUserSettingsPath = () => `/api/v1/notifications/user-settings`;

export const putApiNotificationsUserSettings = (requestContract: UserNotificationUpdateRequest, headers = new Headers()):
  Promise<PutApiNotificationsUserSettingsFetchResponse> => {
    const requestData = getApiRequestData<UserNotificationUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiNotificationsUserSettingsPath()}`, requestData, headers) as Promise<PutApiNotificationsUserSettingsFetchResponse>;
}

export type GetApiInvoicesUserInvoicesFetchResponse = 
| FetchResponse<EntityListOfInvoiceForSupplierCompanyByUserListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiInvoicesUserInvoicesPath = () => `/api/v1/invoices/user-invoices`;

export const getApiInvoicesUserInvoices = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiInvoicesUserInvoicesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiInvoicesUserInvoicesPath()}`, headers, queryParams) as Promise<GetApiInvoicesUserInvoicesFetchResponse>;
}

export type GetApiInvoicesPublicIDFetchResponse = 
| FetchResponse<InvoiceDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiInvoicesPublicIDPath = (publicID: string) => `/api/v1/invoices/${publicID}`;

export const getApiInvoicesPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiInvoicesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiInvoicesPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiInvoicesPublicIDFetchResponse>;
}

export type GetApiInvoicesPublicIDISDOCFetchResponse = 
| FetchResponse<InvoiceISDOCDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiInvoicesPublicIDISDOCPath = (publicID: string) => `/api/v1/invoices/${publicID}/ISDOC`;

export const getApiInvoicesPublicIDISDOC = (publicID: string, headers = new Headers()):
  Promise<GetApiInvoicesPublicIDISDOCFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiInvoicesPublicIDISDOCPath(publicID)}`, headers, {}) as Promise<GetApiInvoicesPublicIDISDOCFetchResponse>;
}

export type GetApiInvoicesPublicIDISDOCPdfFetchResponse = 
| FetchResponse<InvoiceISDOCPdfBase64Dto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiInvoicesPublicIDISDOCPdfPath = (publicID: string) => `/api/v1/invoices/${publicID}/ISDOCPdf`;

export const getApiInvoicesPublicIDISDOCPdf = (publicID: string, headers = new Headers()):
  Promise<GetApiInvoicesPublicIDISDOCPdfFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiInvoicesPublicIDISDOCPdfPath(publicID)}`, headers, {}) as Promise<GetApiInvoicesPublicIDISDOCPdfFetchResponse>;
}

export type GetApiInvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse = 
| FetchResponse<InvoiceForSupplierCompanyByUserISDOCPdfBase64ListDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiInvoicesInvoiceForSupplierCompanyByUserISDOCPdfPath = () => `/api/v1/invoices/invoice-for-supplier-company-by-user/ISDOCPdf`;

export const getApiInvoicesInvoiceForSupplierCompanyByUserISDOCPdf = (InvoicePublicIDs?: string[], headers = new Headers()):
  Promise<GetApiInvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse> => {
    const queryParams = {
      "InvoicePublicIDs": InvoicePublicIDs
    }
    return apiGet(`${getApiUrl()}${getApiInvoicesInvoiceForSupplierCompanyByUserISDOCPdfPath()}`, headers, queryParams) as Promise<GetApiInvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse>;
}

export type PostApiInvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse = 
| FetchResponse<CancelInvoiceForClientByOrderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiInvoicesInvoiceForClientByOrderPublicIDCancelPath = (publicID: string) => `/api/v1/invoices/invoice-for-client-by-order/${publicID}/cancel`;

export const postApiInvoicesInvoiceForClientByOrderPublicIDCancel = (publicID: string, headers = new Headers()):
  Promise<PostApiInvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiInvoicesInvoiceForClientByOrderPublicIDCancelPath(publicID)}`, requestData, headers) as Promise<PostApiInvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse>;
}

export type PostApiEnterprisesFetchResponse = 
| FetchResponse<void, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiEnterprisesPath = () => `/api/v1/enterprises`;

export const postApiEnterprises = (requestContract: CreateEnterpriseRequest, headers = new Headers()):
  Promise<PostApiEnterprisesFetchResponse> => {
    const requestData = getApiRequestData<CreateEnterpriseRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiEnterprisesPath()}`, requestData, headers) as Promise<PostApiEnterprisesFetchResponse>;
}

export type PostApiEnterprisesChangeModeFetchResponse = 
| FetchResponse<ChangeEnterpriseModeCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiEnterprisesChangeModePath = () => `/api/v1/enterprises/change-mode`;

export const postApiEnterprisesChangeMode = (requestContract: EnterpriseModeChangeRequest, headers = new Headers()):
  Promise<PostApiEnterprisesChangeModeFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseModeChangeRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiEnterprisesChangeModePath()}`, requestData, headers) as Promise<PostApiEnterprisesChangeModeFetchResponse>;
}

export type PutApiEnterprisesDesignSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseDesignSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiEnterprisesDesignSettingsPath = () => `/api/v1/enterprises/design-settings`;

export const putApiEnterprisesDesignSettings = (requestContract: EnterpriseDesignSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiEnterprisesDesignSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseDesignSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiEnterprisesDesignSettingsPath()}`, requestData, headers) as Promise<PutApiEnterprisesDesignSettingsFetchResponse>;
}

export type PutApiEnterprisesCommunicationSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseCommunicationSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiEnterprisesCommunicationSettingsPath = () => `/api/v1/enterprises/communication-settings`;

export const putApiEnterprisesCommunicationSettings = (requestContract: EnterpriseCommunicationSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiEnterprisesCommunicationSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseCommunicationSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiEnterprisesCommunicationSettingsPath()}`, requestData, headers) as Promise<PutApiEnterprisesCommunicationSettingsFetchResponse>;
}

export type GetApiEnterprisesBasicSettingsFetchResponse = 
| FetchResponse<EnterpriseBasicSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesBasicSettingsPath = () => `/api/v1/enterprises/basic-settings`;

export const getApiEnterprisesBasicSettings = (headers = new Headers()):
  Promise<GetApiEnterprisesBasicSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesBasicSettingsPath()}`, headers, {}) as Promise<GetApiEnterprisesBasicSettingsFetchResponse>;
}

export type GetApiEnterprisesExternalIDBasicSettingsFetchResponse = 
| FetchResponse<EnterpriseBasicSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesExternalIDBasicSettingsPath = (externalID: string) => `/api/v1/enterprises/${externalID}/basic-settings`;

export const getApiEnterprisesExternalIDBasicSettings = (externalID: string, headers = new Headers()):
  Promise<GetApiEnterprisesExternalIDBasicSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesExternalIDBasicSettingsPath(externalID)}`, headers, {}) as Promise<GetApiEnterprisesExternalIDBasicSettingsFetchResponse>;
}

export type GetApiEnterprisesCommissionSettingsFetchResponse = 
| FetchResponse<EntityListOfEnterpriseCommissionSettingsListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesCommissionSettingsPath = () => `/api/v1/enterprises/commission-settings`;

export const getApiEnterprisesCommissionSettings = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiEnterprisesCommissionSettingsFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiEnterprisesCommissionSettingsPath()}`, headers, queryParams) as Promise<GetApiEnterprisesCommissionSettingsFetchResponse>;
}

export type PostApiEnterprisesCommissionSettingsFetchResponse = 
| FetchResponse<CreateEnterpriseCommissionSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCreateEnterpriseCommissionSettingsErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiEnterprisesCommissionSettingsPath = () => `/api/v1/enterprises/commission-settings`;

export const postApiEnterprisesCommissionSettings = (requestContract: CreateEnterpriseCommissionSettingsRequest, headers = new Headers()):
  Promise<PostApiEnterprisesCommissionSettingsFetchResponse> => {
    const requestData = getApiRequestData<CreateEnterpriseCommissionSettingsRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiEnterprisesCommissionSettingsPath()}`, requestData, headers) as Promise<PostApiEnterprisesCommissionSettingsFetchResponse>;
}

export type GetApiEnterprisesServiceSettingsFetchResponse = 
| FetchResponse<EnterpriseServiceSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesServiceSettingsPath = () => `/api/v1/enterprises/service-settings`;

export const getApiEnterprisesServiceSettings = (headers = new Headers()):
  Promise<GetApiEnterprisesServiceSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesServiceSettingsPath()}`, headers, {}) as Promise<GetApiEnterprisesServiceSettingsFetchResponse>;
}

export type PutApiEnterprisesServiceSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseServiceSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiEnterprisesServiceSettingsPath = () => `/api/v1/enterprises/service-settings`;

export const putApiEnterprisesServiceSettings = (requestContract: EnterpriseServiceSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiEnterprisesServiceSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiEnterprisesServiceSettingsPath()}`, requestData, headers) as Promise<PutApiEnterprisesServiceSettingsFetchResponse>;
}

export type GetApiEnterprisesServicesFetchResponse = 
| FetchResponse<EnterpriseServiceListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesServicesPath = () => `/api/v1/enterprises/services`;

export const getApiEnterprisesServices = (headers = new Headers()):
  Promise<GetApiEnterprisesServicesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesServicesPath()}`, headers, {}) as Promise<GetApiEnterprisesServicesFetchResponse>;
}

export type PutApiEnterprisesServicesFetchResponse = 
| FetchResponse<SaveEnterpriseServicesCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiEnterprisesServicesPath = () => `/api/v1/enterprises/services`;

export const putApiEnterprisesServices = (requestContract: EnterpriseServicesUpdateRequest, headers = new Headers()):
  Promise<PutApiEnterprisesServicesFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseServicesUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiEnterprisesServicesPath()}`, requestData, headers) as Promise<PutApiEnterprisesServicesFetchResponse>;
}

export type GetApiEnterprisesLogoFetchResponse = 
| FetchResponse<EnterpriseLogoDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesLogoPath = () => `/api/v1/enterprises/logo`;

export const getApiEnterprisesLogo = (headers = new Headers()):
  Promise<GetApiEnterprisesLogoFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesLogoPath()}`, headers, {}) as Promise<GetApiEnterprisesLogoFetchResponse>;
}

export type GetApiEnterprisesPublicIDLogoJsonFetchResponse = 
| FetchResponse<EnterpriseLogoDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesPublicIDLogoJsonPath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/json`;

export const getApiEnterprisesPublicIDLogoJson = (publicID: string, headers = new Headers()):
  Promise<GetApiEnterprisesPublicIDLogoJsonFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesPublicIDLogoJsonPath(publicID)}`, headers, {}) as Promise<GetApiEnterprisesPublicIDLogoJsonFetchResponse>;
}

export type GetApiEnterprisesPublicIDLogoFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesPublicIDLogoFilePath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/file`;

export const getApiEnterprisesPublicIDLogoFile = (publicID: string, headers = new Headers()):
  Promise<GetApiEnterprisesPublicIDLogoFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesPublicIDLogoFilePath(publicID)}`, headers, {}) as Promise<GetApiEnterprisesPublicIDLogoFileFetchResponse>;
}

export type GetApiEnterprisesPublicIDLogoTenantFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesPublicIDLogoTenantFilePath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/tenant/file`;

export const getApiEnterprisesPublicIDLogoTenantFile = (publicID: string, headers = new Headers()):
  Promise<GetApiEnterprisesPublicIDLogoTenantFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesPublicIDLogoTenantFilePath(publicID)}`, headers, {}) as Promise<GetApiEnterprisesPublicIDLogoTenantFileFetchResponse>;
}

export type GetApiEnterprisesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<EnterpriseDesignSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/enterprises/${publicID}/design-settings`;

export const getApiEnterprisesPublicIDDesignSettings = (publicID: string, headers = new Headers()):
  Promise<GetApiEnterprisesPublicIDDesignSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesPublicIDDesignSettingsPath(publicID)}`, headers, {}) as Promise<GetApiEnterprisesPublicIDDesignSettingsFetchResponse>;
}

export type GetApiEnterprisesPackageServiceSettingsFetchResponse = 
| FetchResponse<EnterprisePackageServiceSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiEnterprisesPackageServiceSettingsPath = () => `/api/v1/enterprises/package-service-settings`;

export const getApiEnterprisesPackageServiceSettings = (headers = new Headers()):
  Promise<GetApiEnterprisesPackageServiceSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiEnterprisesPackageServiceSettingsPath()}`, headers, {}) as Promise<GetApiEnterprisesPackageServiceSettingsFetchResponse>;
}

export type PutApiEnterprisesPackageServiceSettingsFetchResponse = 
| FetchResponse<SaveEnterprisePackageServiceSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiEnterprisesPackageServiceSettingsPath = () => `/api/v1/enterprises/package-service-settings`;

export const putApiEnterprisesPackageServiceSettings = (requestContract: EnterprisePackageServiceSettingsUpdateRequest, headers = new Headers()):
  Promise<PutApiEnterprisesPackageServiceSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterprisePackageServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiEnterprisesPackageServiceSettingsPath()}`, requestData, headers) as Promise<PutApiEnterprisesPackageServiceSettingsFetchResponse>;
}

export type GetApiCutoffsFetchResponse = 
| FetchResponse<EntityListOfCutoffListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsPath = () => `/api/v1/cutoffs`;

export const getApiCutoffs = (offset?: number, limit?: number, headers = new Headers()):
  Promise<GetApiCutoffsFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getApiCutoffsPath()}`, headers, queryParams) as Promise<GetApiCutoffsFetchResponse>;
}

export type PostApiCutoffsFetchResponse = 
| FetchResponse<CreateCutoffCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCreateCutoffErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetailsOfCreateCutoffErrorStatus, 409> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiCutoffsPath = () => `/api/v1/cutoffs`;

export const postApiCutoffs = (requestContract: CutoffCreateRequest, headers = new Headers()):
  Promise<PostApiCutoffsFetchResponse> => {
    const requestData = getApiRequestData<CutoffCreateRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiCutoffsPath()}`, requestData, headers) as Promise<PostApiCutoffsFetchResponse>;
}

export type GetApiCutoffsPublicIDFetchResponse = 
| FetchResponse<CutoffDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsPublicIDPath = (publicID: string) => `/api/v1/cutoffs/${publicID}`;

export const getApiCutoffsPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiCutoffsPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCutoffsPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiCutoffsPublicIDFetchResponse>;
}

export type GetApiCutoffsCompanyIDDateFromForNextCutoffFetchResponse = 
| FetchResponse<DateFromForNextCutoffDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsCompanyIDDateFromForNextCutoffPath = (companyID: number) => `/api/v1/cutoffs/${companyID}/date-from-for-next-cutoff`;

export const getApiCutoffsCompanyIDDateFromForNextCutoff = (companyID: number, headers = new Headers()):
  Promise<GetApiCutoffsCompanyIDDateFromForNextCutoffFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCutoffsCompanyIDDateFromForNextCutoffPath(companyID)}`, headers, {}) as Promise<GetApiCutoffsCompanyIDDateFromForNextCutoffFetchResponse>;
}

export type GetApiCutoffsExpectedUserCommissionFetchResponse = 
| FetchResponse<GetExpectedUserCommissionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsExpectedUserCommissionPath = () => `/api/v1/cutoffs/expected-user-commission`;

export const getApiCutoffsExpectedUserCommission = (headers = new Headers()):
  Promise<GetApiCutoffsExpectedUserCommissionFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCutoffsExpectedUserCommissionPath()}`, headers, {}) as Promise<GetApiCutoffsExpectedUserCommissionFetchResponse>;
}

export type GetApiCutoffsPaidUserCommissionFetchResponse = 
| FetchResponse<GetPaidUserCommissionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsPaidUserCommissionPath = () => `/api/v1/cutoffs/paid-user-commission`;

export const getApiCutoffsPaidUserCommission = (headers = new Headers()):
  Promise<GetApiCutoffsPaidUserCommissionFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCutoffsPaidUserCommissionPath()}`, headers, {}) as Promise<GetApiCutoffsPaidUserCommissionFetchResponse>;
}

export type GetApiCutoffsPublicIDISDOCPdfsFetchResponse = 
| FetchResponse<CutoffISDOCPdfsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsPublicIDISDOCPdfsPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/ISDOCPdfs`;

export const getApiCutoffsPublicIDISDOCPdfs = (publicID: string, headers = new Headers()):
  Promise<GetApiCutoffsPublicIDISDOCPdfsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCutoffsPublicIDISDOCPdfsPath(publicID)}`, headers, {}) as Promise<GetApiCutoffsPublicIDISDOCPdfsFetchResponse>;
}

export type PostApiCutoffsPublicIDSendPaymentsFetchResponse = 
| FetchResponse<SendCutoffPaymentsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiCutoffsPublicIDSendPaymentsPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/send-payments`;

export const postApiCutoffsPublicIDSendPayments = (publicID: string, headers = new Headers()):
  Promise<PostApiCutoffsPublicIDSendPaymentsFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postApiCutoffsPublicIDSendPaymentsPath(publicID)}`, requestData, headers) as Promise<PostApiCutoffsPublicIDSendPaymentsFetchResponse>;
}

export type GetApiCutoffsPublicIDDetailPdfFetchResponse = 
| FetchResponse<CutoffDetailPdfBase64Dto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsPublicIDDetailPdfPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/detail-pdf`;

export const getApiCutoffsPublicIDDetailPdf = (publicID: string, headers = new Headers()):
  Promise<GetApiCutoffsPublicIDDetailPdfFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCutoffsPublicIDDetailPdfPath(publicID)}`, headers, {}) as Promise<GetApiCutoffsPublicIDDetailPdfFetchResponse>;
}

export type GetApiCutoffsUserSupplierCompaniesFetchResponse = 
| FetchResponse<CutoffUserSupplierCompanyListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCutoffsUserSupplierCompaniesPath = () => `/api/v1/cutoffs/user-supplier-companies`;

export const getApiCutoffsUserSupplierCompanies = (headers = new Headers()):
  Promise<GetApiCutoffsUserSupplierCompaniesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCutoffsUserSupplierCompaniesPath()}`, headers, {}) as Promise<GetApiCutoffsUserSupplierCompaniesFetchResponse>;
}

export type GetApiCompaniesPublicIDFetchResponse = 
| FetchResponse<CompanyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCompaniesPublicIDPath = (publicID: string) => `/api/v1/companies/${publicID}`;

export const getApiCompaniesPublicID = (publicID: string, headers = new Headers()):
  Promise<GetApiCompaniesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCompaniesPublicIDPath(publicID)}`, headers, {}) as Promise<GetApiCompaniesPublicIDFetchResponse>;
}

export type PostApiCompaniesFetchResponse = 
| FetchResponse<CreateCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiCompaniesPath = () => `/api/v1/companies`;

export const postApiCompanies = (requestContract: CompanyCreateRequest, headers = new Headers()):
  Promise<PostApiCompaniesFetchResponse> => {
    const requestData = getApiRequestData<CompanyCreateRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiCompaniesPath()}`, requestData, headers) as Promise<PostApiCompaniesFetchResponse>;
}

export type PutApiCompaniesFetchResponse = 
| FetchResponse<UpdateCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiCompaniesPath = () => `/api/v1/companies`;

export const putApiCompanies = (requestContract: CompanyUpdateRequest, headers = new Headers()):
  Promise<PutApiCompaniesFetchResponse> => {
    const requestData = getApiRequestData<CompanyUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiCompaniesPath()}`, requestData, headers) as Promise<PutApiCompaniesFetchResponse>;
}

export type GetApiCompaniesUserSupplierCompaniesFetchResponse = 
| FetchResponse<UserSupplierCompanyListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCompaniesUserSupplierCompaniesPath = () => `/api/v1/companies/user-supplier-companies`;

export const getApiCompaniesUserSupplierCompanies = (headers = new Headers()):
  Promise<GetApiCompaniesUserSupplierCompaniesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCompaniesUserSupplierCompaniesPath()}`, headers, {}) as Promise<GetApiCompaniesUserSupplierCompaniesFetchResponse>;
}

export type PostApiCompaniesUserSupplierCompanyFetchResponse = 
| FetchResponse<SetUserSupplierCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiCompaniesUserSupplierCompanyPath = () => `/api/v1/companies/user-supplier-company`;

export const postApiCompaniesUserSupplierCompany = (requestContract: UserSupplierCompanySetRequest, headers = new Headers()):
  Promise<PostApiCompaniesUserSupplierCompanyFetchResponse> => {
    const requestData = getApiRequestData<UserSupplierCompanySetRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiCompaniesUserSupplierCompanyPath()}`, requestData, headers) as Promise<PostApiCompaniesUserSupplierCompanyFetchResponse>;
}

export type GetApiCompaniesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<CompanyDesignSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCompaniesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/design-settings`;

export const getApiCompaniesPublicIDDesignSettings = (publicID: string, headers = new Headers()):
  Promise<GetApiCompaniesPublicIDDesignSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCompaniesPublicIDDesignSettingsPath(publicID)}`, headers, {}) as Promise<GetApiCompaniesPublicIDDesignSettingsFetchResponse>;
}

export type PutApiCompaniesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<SaveCompanyDesignSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiCompaniesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/design-settings`;

export const putApiCompaniesPublicIDDesignSettings = (requestContract: SaveCompanyDesignSettingsRequest, publicID: string, headers = new Headers()):
  Promise<PutApiCompaniesPublicIDDesignSettingsFetchResponse> => {
    const requestData = getApiRequestData<SaveCompanyDesignSettingsRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiCompaniesPublicIDDesignSettingsPath(publicID)}`, requestData, headers) as Promise<PutApiCompaniesPublicIDDesignSettingsFetchResponse>;
}

export type GetApiCompaniesPublicIDFioSettingsFetchResponse = 
| FetchResponse<CompanyFioSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCompaniesPublicIDFioSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/fio-settings`;

export const getApiCompaniesPublicIDFioSettings = (publicID: string, headers = new Headers()):
  Promise<GetApiCompaniesPublicIDFioSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCompaniesPublicIDFioSettingsPath(publicID)}`, headers, {}) as Promise<GetApiCompaniesPublicIDFioSettingsFetchResponse>;
}

export type PutApiCompaniesPublicIDFioSettingsFetchResponse = 
| FetchResponse<SaveCompanyFioSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiCompaniesPublicIDFioSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/fio-settings`;

export const putApiCompaniesPublicIDFioSettings = (requestContract: SaveFioSettingsRequest, publicID: string, headers = new Headers()):
  Promise<PutApiCompaniesPublicIDFioSettingsFetchResponse> => {
    const requestData = getApiRequestData<SaveFioSettingsRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiCompaniesPublicIDFioSettingsPath(publicID)}`, requestData, headers) as Promise<PutApiCompaniesPublicIDFioSettingsFetchResponse>;
}

export type GetApiCompaniesPublicIDLogoFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCompaniesPublicIDLogoFilePath = (publicID: string) => `/api/v1/companies/${publicID}/logo/file`;

export const getApiCompaniesPublicIDLogoFile = (publicID: string, headers = new Headers()):
  Promise<GetApiCompaniesPublicIDLogoFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCompaniesPublicIDLogoFilePath(publicID)}`, headers, {}) as Promise<GetApiCompaniesPublicIDLogoFileFetchResponse>;
}

export type GetApiCodeListsFetchResponse = 
| FetchResponse<GetCodeListCollectionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiCodeListsPath = () => `/api/v1/code-lists`;

export const getApiCodeLists = (headers = new Headers()):
  Promise<GetApiCodeListsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiCodeListsPath()}`, headers, {}) as Promise<GetApiCodeListsFetchResponse>;
}

export type GetApiClientsCountFetchResponse = 
| FetchResponse<GetClientsCountQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiClientsCountPath = () => `/api/v1/clients/count`;

export const getApiClientsCount = (headers = new Headers()):
  Promise<GetApiClientsCountFetchResponse> => {
    return apiGet(`${getApiUrl()}${getApiClientsCountPath()}`, headers, {}) as Promise<GetApiClientsCountFetchResponse>;
}

export type GetApiClientsSearchFetchResponse = 
| FetchResponse<ClientDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiClientsSearchPath = () => `/api/v1/clients/search`;

export const getApiClientsSearch = (query?: string, headers = new Headers()):
  Promise<GetApiClientsSearchFetchResponse> => {
    const queryParams = {
      "query": query
    }
    return apiGet(`${getApiUrl()}${getApiClientsSearchPath()}`, headers, queryParams) as Promise<GetApiClientsSearchFetchResponse>;
}

export type GetApiClientsSearchPersonalNumberFetchResponse = 
| FetchResponse<ClientDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getApiClientsSearchPersonalNumberPath = () => `/api/v1/clients/search/personal-number`;

export const getApiClientsSearchPersonalNumber = (query?: string, headers = new Headers()):
  Promise<GetApiClientsSearchPersonalNumberFetchResponse> => {
    const queryParams = {
      "query": query
    }
    return apiGet(`${getApiUrl()}${getApiClientsSearchPersonalNumberPath()}`, headers, queryParams) as Promise<GetApiClientsSearchPersonalNumberFetchResponse>;
}

export type PostApiCacheRefreshFetchResponse = 
| FetchResponse<void, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiCacheRefreshPath = () => `/api/v1/cache/refresh`;

export const postApiCacheRefresh = (body: string, headers = new Headers()):
  Promise<PostApiCacheRefreshFetchResponse> => {
    const requestData = getApiRequestData<string>(body, false);

    return apiPost(`${getApiUrl()}${postApiCacheRefreshPath()}`, requestData, headers) as Promise<PostApiCacheRefreshFetchResponse>;
}

export type PostApiAuthSignUpFetchResponse = 
| FetchResponse<SignUpCommandResult, 201> 
| FetchResponse<ApiProblemDetailsOfPasswordChangeResultStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfSignUpErrorStatus, 409> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiAuthSignUpPath = () => `/api/v1/auth/sign-up`;

export const postApiAuthSignUp = (requestContract: SignUpCommand, headers = new Headers()):
  Promise<PostApiAuthSignUpFetchResponse> => {
    const requestData = getApiRequestData<SignUpCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiAuthSignUpPath()}`, requestData, headers) as Promise<PostApiAuthSignUpFetchResponse>;
}

export type PostApiAuthSignInFetchResponse = 
| FetchResponse<SignInResult, 200> 
| FetchResponse<ApiProblemDetailsOfAuthError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiAuthSignInPath = () => `/api/v1/auth/sign-in`;

export const postApiAuthSignIn = (requestContract: SignInCommand, headers = new Headers()):
  Promise<PostApiAuthSignInFetchResponse> => {
    const requestData = getApiRequestData<SignInCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiAuthSignInPath()}`, requestData, headers) as Promise<PostApiAuthSignInFetchResponse>;
}

export type PostApiAuthTokenFetchResponse = 
| FetchResponse<TokenResponse, 200> 
| FetchResponse<ApiProblemDetailsOfAuthError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiAuthTokenPath = () => `/api/v1/auth/token`;

export const postApiAuthToken = (headers = new Headers()):
  Promise<PostApiAuthTokenFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, true);

    return apiPost(`${getApiUrl()}${postApiAuthTokenPath()}`, requestData, headers) as Promise<PostApiAuthTokenFetchResponse>;
}

export type PostApiAuthEmailVerificationFetchResponse = 
| FetchResponse<EmailVerificationCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfEmailVerificationCommandResultStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiAuthEmailVerificationPath = () => `/api/v1/auth/email-verification`;

export const postApiAuthEmailVerification = (requestContract: EmailVerificationCommand, headers = new Headers()):
  Promise<PostApiAuthEmailVerificationFetchResponse> => {
    const requestData = getApiRequestData<EmailVerificationCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiAuthEmailVerificationPath()}`, requestData, headers) as Promise<PostApiAuthEmailVerificationFetchResponse>;
}

export type PostApiAuthEmailVerificationSendFetchResponse = 
| FetchResponse<ResendVerificationEmailCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiAuthEmailVerificationSendPath = () => `/api/v1/auth/email-verification/send`;

export const postApiAuthEmailVerificationSend = (requestContract: ResendVerificationEmailCommand, headers = new Headers()):
  Promise<PostApiAuthEmailVerificationSendFetchResponse> => {
    const requestData = getApiRequestData<ResendVerificationEmailCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiAuthEmailVerificationSendPath()}`, requestData, headers) as Promise<PostApiAuthEmailVerificationSendFetchResponse>;
}

export type PostApiAuthSsoFetchResponse = 
| FetchResponse<SignInResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfAuthError, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiAuthSsoPath = () => `/api/v1/auth/sso`;

export const postApiAuthSso = (requestContract: SsoSignInRequest, headers = new Headers()):
  Promise<PostApiAuthSsoFetchResponse> => {
    const requestData = getApiRequestData<SsoSignInRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiAuthSsoPath()}`, requestData, headers) as Promise<PostApiAuthSsoFetchResponse>;
}

export type GetApiAuthSsoTokenFetchResponse = 
| FetchResponse<RedirectHttpResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| FetchResponse<ApiProblemDetails, 501> 
| ErrorResponse;

export const getApiAuthSsoTokenPath = () => `/api/v1/auth/sso-token`;

export const getApiAuthSsoToken = (IdentityProvider?: IdentityProvider, headers = new Headers()):
  Promise<GetApiAuthSsoTokenFetchResponse> => {
    const queryParams = {
      "IdentityProvider": IdentityProvider
    }
    return apiGet(`${getApiUrl()}${getApiAuthSsoTokenPath()}`, headers, queryParams) as Promise<GetApiAuthSsoTokenFetchResponse>;
}

export type PostApiAuthPasswordResetFetchResponse = 
| FetchResponse<ResetPasswordCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfResetPasswordCommandResultStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postApiAuthPasswordResetPath = () => `/api/v1/auth/password-reset`;

export const postApiAuthPasswordReset = (requestContract: ResetPasswordCommand, headers = new Headers()):
  Promise<PostApiAuthPasswordResetFetchResponse> => {
    const requestData = getApiRequestData<ResetPasswordCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postApiAuthPasswordResetPath()}`, requestData, headers) as Promise<PostApiAuthPasswordResetFetchResponse>;
}

export type PutApiAuthPasswordFetchResponse = 
| FetchResponse<SetPasswordCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfPasswordChangeResultStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfSetPasswordCommandStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putApiAuthPasswordPath = () => `/api/v1/auth/password`;

export const putApiAuthPassword = (requestContract: SetPasswordCommand, headers = new Headers()):
  Promise<PutApiAuthPasswordFetchResponse> => {
    const requestData = getApiRequestData<SetPasswordCommand>(requestContract, false);

    return apiPut(`${getApiUrl()}${putApiAuthPasswordPath()}`, requestData, headers) as Promise<PutApiAuthPasswordFetchResponse>;
}
