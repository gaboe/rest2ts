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

  const body = (request instanceof FormData) ? request : JSON.stringify(request);
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

export type GetWorkflowsStepsFetchResponse = 
| FetchResponse<EntityListOfStepDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getWorkflowsStepsPath = () => `/api/v1/workflows/steps`;

export const getWorkflowsSteps = (options?: FetchArgsOptions):
  Promise<GetWorkflowsStepsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getWorkflowsStepsPath()}`, options, {}) as Promise<GetWorkflowsStepsFetchResponse>;
}

export type GetUserCompanyFetchResponse = 
| FetchResponse<UserCompanyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getUserCompanyPath = () => `/api/v1/user/company`;

export const getUserCompany = (options?: FetchArgsOptions):
  Promise<GetUserCompanyFetchResponse> => {
    return apiGet(`${getApiUrl()}${getUserCompanyPath()}`, options, {}) as Promise<GetUserCompanyFetchResponse>;
}

export type PutUserCompanyFetchResponse = 
| FetchResponse<SetUserCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putUserCompanyPath = () => `/api/v1/user/company`;

export const putUserCompany = (requestContract: UserCompanySetRequest, options?: FetchArgsOptions):
  Promise<PutUserCompanyFetchResponse> => {
    const requestData = getApiRequestData<UserCompanySetRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putUserCompanyPath()}`, requestData, options) as Promise<PutUserCompanyFetchResponse>;
}

export type GetServicesPackagesFetchResponse = 
| FetchResponse<EntityListOfServicePackageListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getServicesPackagesPath = () => `/api/v1/services/packages`;

export const getServicesPackages = (offset?: number, limit?: number, options?: FetchArgsOptions):
  Promise<GetServicesPackagesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getServicesPackagesPath()}`, options, queryParams) as Promise<GetServicesPackagesFetchResponse>;
}

export type GetServicesPackagesAvailableServicesFetchResponse = 
| FetchResponse<EntityListOfServiceListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getServicesPackagesAvailableServicesPath = () => `/api/v1/services/packages/available-services`;

export const getServicesPackagesAvailableServices = (offset?: number, limit?: number, options?: FetchArgsOptions):
  Promise<GetServicesPackagesAvailableServicesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getServicesPackagesAvailableServicesPath()}`, options, queryParams) as Promise<GetServicesPackagesAvailableServicesFetchResponse>;
}

export type PostServicesPackageFetchResponse = 
| FetchResponse<CreateServicePackageCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postServicesPackagePath = () => `/api/v1/services/package`;

export const postServicesPackage = (requestContract: SaveServicePackageRequest, options?: FetchArgsOptions):
  Promise<PostServicesPackageFetchResponse> => {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postServicesPackagePath()}`, requestData, options) as Promise<PostServicesPackageFetchResponse>;
}

export type GetServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<ServicePackageDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const getServicesServicePublicIDPackage = (servicePublicID: string, options?: FetchArgsOptions):
  Promise<GetServicesServicePublicIDPackageFetchResponse> => {
    return apiGet(`${getApiUrl()}${getServicesServicePublicIDPackagePath(servicePublicID)}`, options, {}) as Promise<GetServicesServicePublicIDPackageFetchResponse>;
}

export type DeleteServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<ServicePackageDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const deleteServicesServicePublicIDPackage = (servicePublicID: string, options?: FetchArgsOptions):
  Promise<DeleteServicesServicePublicIDPackageFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteServicesServicePublicIDPackagePath(servicePublicID)}`, options, {}) as Promise<DeleteServicesServicePublicIDPackageFetchResponse>;
}

export type PutServicesServicePublicIDPackageFetchResponse = 
| FetchResponse<UpdateServicePackageCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putServicesServicePublicIDPackagePath = (servicePublicID: string) => `/api/v1/services/${servicePublicID}/package`;

export const putServicesServicePublicIDPackage = (requestContract: SaveServicePackageRequest, servicePublicID: string, options?: FetchArgsOptions):
  Promise<PutServicesServicePublicIDPackageFetchResponse> => {
    const requestData = getApiRequestData<SaveServicePackageRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putServicesServicePublicIDPackagePath(servicePublicID)}`, requestData, options) as Promise<PutServicesServicePublicIDPackageFetchResponse>;
}

export type GetPartiesPublicIDFetchResponse = 
| FetchResponse<PartyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getPartiesPublicIDPath = (publicID: string) => `/api/v1/parties/${publicID}`;

export const getPartiesPublicID = (publicID: string, options?: FetchArgsOptions):
  Promise<GetPartiesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getPartiesPublicIDPath(publicID)}`, options, {}) as Promise<GetPartiesPublicIDFetchResponse>;
}

export type GetPartiesSearchAresFetchResponse = 
| FetchResponse<PartyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getPartiesSearchAresPath = () => `/api/v1/parties/search/ares`;

export const getPartiesSearchAres = (query?: string, partyType?: PartyType | undefined | null, options?: FetchArgsOptions):
  Promise<GetPartiesSearchAresFetchResponse> => {
    const queryParams = {
      "query": query,
      "partyType": partyType
    }
    return apiGet(`${getApiUrl()}${getPartiesSearchAresPath()}`, options, queryParams) as Promise<GetPartiesSearchAresFetchResponse>;
}

export type GetOrdersFetchResponse = 
| FetchResponse<EntityListOfOrderListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPath = () => `/api/v1/orders`;

export const getOrders = (offset?: number, limit?: number, workflowStatuses?: string[], query?: string | undefined | null, startDate?: string | undefined | null, endDate?: string | undefined | null, isSearchInStructure?: boolean, onlyAfterInvoiceDueDate?: boolean, includeClientReminderAvailable?: boolean, options?: FetchArgsOptions):
  Promise<GetOrdersFetchResponse> => {
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
    return apiGet(`${getApiUrl()}${getOrdersPath()}`, options, queryParams) as Promise<GetOrdersFetchResponse>;
}

export type GetOrdersPublicIDFetchResponse = 
| FetchResponse<OrderDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPublicIDPath = (publicID: string) => `/api/v1/orders/${publicID}`;

export const getOrdersPublicID = (publicID: string, options?: FetchArgsOptions):
  Promise<GetOrdersPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersPublicIDPath(publicID)}`, options, {}) as Promise<GetOrdersPublicIDFetchResponse>;
}

export type DeleteOrdersPublicIDFetchResponse = 
| FetchResponse<DeleteOrderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteOrdersPublicIDPath = (publicID: string) => `/api/v1/orders/${publicID}`;

export const deleteOrdersPublicID = (publicID: string, options?: FetchArgsOptions):
  Promise<DeleteOrdersPublicIDFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteOrdersPublicIDPath(publicID)}`, options, {}) as Promise<DeleteOrdersPublicIDFetchResponse>;
}

export type PutOrdersPublicIDPeriodicityFetchResponse = 
| FetchResponse<SetPeriodicityCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putOrdersPublicIDPeriodicityPath = (publicID: string) => `/api/v1/orders/${publicID}/periodicity`;

export const putOrdersPublicIDPeriodicity = (requestContract: SetPeriodicityRequest, publicID: string, options?: FetchArgsOptions):
  Promise<PutOrdersPublicIDPeriodicityFetchResponse> => {
    const requestData = getApiRequestData<SetPeriodicityRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putOrdersPublicIDPeriodicityPath(publicID)}`, requestData, options) as Promise<PutOrdersPublicIDPeriodicityFetchResponse>;
}

export type GetOrdersPublicIDServicesFetchResponse = 
| FetchResponse<EntityListOfOrderServiceDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPublicIDServicesPath = (publicID: string) => `/api/v1/orders/${publicID}/services`;

export const getOrdersPublicIDServices = (publicID: string, options?: FetchArgsOptions):
  Promise<GetOrdersPublicIDServicesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersPublicIDServicesPath(publicID)}`, options, {}) as Promise<GetOrdersPublicIDServicesFetchResponse>;
}

export type DeleteOrdersServicesServiceIDFetchResponse = 
| FetchResponse<DeleteOrderServiceCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const deleteOrdersServicesServiceIDPath = (serviceID: number) => `/api/v1/orders/services/${serviceID}`;

export const deleteOrdersServicesServiceID = (serviceID: number, options?: FetchArgsOptions):
  Promise<DeleteOrdersServicesServiceIDFetchResponse> => {
    return apiDelete(`${getApiUrl()}${deleteOrdersServicesServiceIDPath(serviceID)}`, options, {}) as Promise<DeleteOrdersServicesServiceIDFetchResponse>;
}

export type GetOrdersPeriodicUpcomingFetchResponse = 
| FetchResponse<EntityListOfUpcomingPeriodicOrderDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPeriodicUpcomingPath = () => `/api/v1/orders/periodic/upcoming`;

export const getOrdersPeriodicUpcoming = (offset?: number, limit?: number, nexOrderDate?: string, options?: FetchArgsOptions):
  Promise<GetOrdersPeriodicUpcomingFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit,
      "nexOrderDate": nexOrderDate
    }
    return apiGet(`${getApiUrl()}${getOrdersPeriodicUpcomingPath()}`, options, queryParams) as Promise<GetOrdersPeriodicUpcomingFetchResponse>;
}

export type GetOrdersRevocationExampleFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersRevocationExampleFilePath = () => `/api/v1/orders/revocation/example/file`;

export const getOrdersRevocationExampleFile = (options?: FetchArgsOptions):
  Promise<GetOrdersRevocationExampleFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersRevocationExampleFilePath()}`, options, {}) as Promise<GetOrdersRevocationExampleFileFetchResponse>;
}

export type GetOrdersPublicIDPaymentCalendarItemsFetchResponse = 
| FetchResponse<EntityListOfPaymentCalendarItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPublicIDPaymentCalendarItemsPath = (publicID: string) => `/api/v1/orders/${publicID}/payment-calendar-items`;

export const getOrdersPublicIDPaymentCalendarItems = (publicID: string, options?: FetchArgsOptions):
  Promise<GetOrdersPublicIDPaymentCalendarItemsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersPublicIDPaymentCalendarItemsPath(publicID)}`, options, {}) as Promise<GetOrdersPublicIDPaymentCalendarItemsFetchResponse>;
}

export type GetOrdersCountFetchResponse = 
| FetchResponse<GetOrdersCountQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersCountPath = () => `/api/v1/orders/count`;

export const getOrdersCount = (onlyActive?: boolean, options?: FetchArgsOptions):
  Promise<GetOrdersCountFetchResponse> => {
    const queryParams = {
      "onlyActive": onlyActive
    }
    return apiGet(`${getApiUrl()}${getOrdersCountPath()}`, options, queryParams) as Promise<GetOrdersCountFetchResponse>;
}

export type PostOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse = 
| FetchResponse<SetPeriodicityCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientPath = (orderPublicID: string) => `/api/v1/orders/${orderPublicID}/client-invoice-recurring-payment-create-invoice-and-set-as-paid-by-client`;

export const postOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClient = (requestContract: ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest, orderPublicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse> => {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientPath(orderPublicID)}`, requestData, options) as Promise<PostOrdersOrderPublicIDClientInvoiceRecurringPaymentCreateInvoiceAndSetAsPaidByClientFetchResponse>;
}

export type GetOrdersPublicIDClientZonePaymentCalendarItemsFetchResponse = 
| FetchResponse<EntityListOfPaymentCalendarClientZoneItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPublicIDClientZonePaymentCalendarItemsPath = (publicID: string) => `/api/v1/orders/${publicID}/client-zone/payment-calendar-items`;

export const getOrdersPublicIDClientZonePaymentCalendarItems = (publicID: string, options?: FetchArgsOptions):
  Promise<GetOrdersPublicIDClientZonePaymentCalendarItemsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersPublicIDClientZonePaymentCalendarItemsPath(publicID)}`, options, {}) as Promise<GetOrdersPublicIDClientZonePaymentCalendarItemsFetchResponse>;
}

export type GetOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse = 
| FetchResponse<GetEucsOrderInfoQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoPath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/eucs-order/info`;

export const getOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfo = (publicID: string, orderServiceID: number, options?: FetchArgsOptions):
  Promise<GetOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoPath(publicID, orderServiceID)}`, options, {}) as Promise<GetOrdersPublicIDOrderServiceOrderServiceIDEucsOrderInfoFetchResponse>;
}

export type PostOrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse = 
| FetchResponse<CancelProductInInstitutionCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDOrderServiceOrderServiceIDProductCancelPath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/cancel`;

export const postOrdersPublicIDOrderServiceOrderServiceIDProductCancel = (requestContract: CancelProductInInstitutionCommandRequest, publicID: string, orderServiceID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse> => {
    const requestData = getApiRequestData<CancelProductInInstitutionCommandRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDOrderServiceOrderServiceIDProductCancelPath(publicID, orderServiceID)}`, requestData, options) as Promise<PostOrdersPublicIDOrderServiceOrderServiceIDProductCancelFetchResponse>;
}

export type PostOrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse = 
| FetchResponse<CreateProductInInstitutionCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDOrderServiceOrderServiceIDProductCreatePath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/order-service/${orderServiceID}/product/create`;

export const postOrdersPublicIDOrderServiceOrderServiceIDProductCreate = (requestContract: CreateProductInInstitutionRequest, publicID: string, orderServiceID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse> => {
    const requestData = getApiRequestData<CreateProductInInstitutionRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDOrderServiceOrderServiceIDProductCreatePath(publicID, orderServiceID)}`, requestData, options) as Promise<PostOrdersPublicIDOrderServiceOrderServiceIDProductCreateFetchResponse>;
}

export type GetOrdersPublicIDWorkflowStepsFetchResponse = 
| FetchResponse<EntityListOfOrderWorkflowStepDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPublicIDWorkflowStepsPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/steps`;

export const getOrdersPublicIDWorkflowSteps = (publicID: string, options?: FetchArgsOptions):
  Promise<GetOrdersPublicIDWorkflowStepsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersPublicIDWorkflowStepsPath(publicID)}`, options, {}) as Promise<GetOrdersPublicIDWorkflowStepsFetchResponse>;
}

export type PostOrdersWorkflowDraftFetchResponse = 
| FetchResponse<SaveDraftCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersWorkflowDraftPath = () => `/api/v1/orders/workflow/draft`;

export const postOrdersWorkflowDraft = (requestContract: SaveDraftRequest, options?: FetchArgsOptions):
  Promise<PostOrdersWorkflowDraftFetchResponse> => {
    const requestData = getApiRequestData<SaveDraftRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersWorkflowDraftPath()}`, requestData, options) as Promise<PostOrdersWorkflowDraftFetchResponse>;
}

export type PostOrdersPublicIDWorkflowDraftCompleteFetchResponse = 
| FetchResponse<DraftStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowDraftCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/draft/complete`;

export const postOrdersPublicIDWorkflowDraftComplete = (publicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowDraftCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowDraftCompletePath(publicID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowDraftCompleteFetchResponse>;
}

export type GetOrdersWorkflowClientReviewTokenSummaryFetchResponse = 
| FetchResponse<GetClientReviewSummaryQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersWorkflowClientReviewTokenSummaryPath = (token: string) => `/api/v1/orders/workflow/client-review/${token}/summary`;

export const getOrdersWorkflowClientReviewTokenSummary = (token: string, options?: FetchArgsOptions):
  Promise<GetOrdersWorkflowClientReviewTokenSummaryFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersWorkflowClientReviewTokenSummaryPath(token)}`, options, {}) as Promise<GetOrdersWorkflowClientReviewTokenSummaryFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientReviewReminderFetchResponse = 
| FetchResponse<SendReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientReviewReminderPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-review/reminder`;

export const postOrdersPublicIDWorkflowClientReviewReminder = (publicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientReviewReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientReviewReminderPath(publicID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientReviewReminderFetchResponse>;
}

export type PostOrdersWorkflowClientApprovalTokenRejectFetchResponse = 
| FetchResponse<ClientApprovalStepRejectCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersWorkflowClientApprovalTokenRejectPath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/reject`;

export const postOrdersWorkflowClientApprovalTokenReject = (requestContract: ClientApprovalRejectRequest, token: string, options?: FetchArgsOptions):
  Promise<PostOrdersWorkflowClientApprovalTokenRejectFetchResponse> => {
    const requestData = getApiRequestData<ClientApprovalRejectRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersWorkflowClientApprovalTokenRejectPath(token)}`, requestData, options) as Promise<PostOrdersWorkflowClientApprovalTokenRejectFetchResponse>;
}

export type PutOrdersWorkflowClientApprovalTokenInProgressFetchResponse = 
| FetchResponse<ClientApprovalStepInitCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putOrdersWorkflowClientApprovalTokenInProgressPath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/in-progress`;

export const putOrdersWorkflowClientApprovalTokenInProgress = (token: string, options?: FetchArgsOptions):
  Promise<PutOrdersWorkflowClientApprovalTokenInProgressFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPut(`${getApiUrl()}${putOrdersWorkflowClientApprovalTokenInProgressPath(token)}`, requestData, options) as Promise<PutOrdersWorkflowClientApprovalTokenInProgressFetchResponse>;
}

export type PostOrdersWorkflowClientApprovalTokenCompleteFetchResponse = 
| FetchResponse<CompleteClientApprovalStepCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCompleteClientApprovalStepError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersWorkflowClientApprovalTokenCompletePath = (token: string) => `/api/v1/orders/workflow/client-approval/${token}/complete`;

export const postOrdersWorkflowClientApprovalTokenComplete = (requestContract: ClientApprovalCompleteRequest, token: string, options?: FetchArgsOptions):
  Promise<PostOrdersWorkflowClientApprovalTokenCompleteFetchResponse> => {
    const requestData = getApiRequestData<ClientApprovalCompleteRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersWorkflowClientApprovalTokenCompletePath(token)}`, requestData, options) as Promise<PostOrdersWorkflowClientApprovalTokenCompleteFetchResponse>;
}

export type PostOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse = 
| FetchResponse<OrderServiceCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompletePath = (publicID: string, orderServiceID: number) => `/api/v1/orders/${publicID}/workflow/processing-services/${orderServiceID}/complete`;

export const postOrdersPublicIDWorkflowProcessingServicesOrderServiceIDComplete = (publicID: string, orderServiceID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompletePath(publicID, orderServiceID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowProcessingServicesOrderServiceIDCompleteFetchResponse>;
}

export type PostOrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse = 
| FetchResponse<InvoiceIssuanceStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowInvoiceIssuanceCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-issuance/complete`;

export const postOrdersPublicIDWorkflowInvoiceIssuanceComplete = (publicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowInvoiceIssuanceCompletePath(publicID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowInvoiceIssuanceCompleteFetchResponse>;
}

export type PostOrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse = 
| FetchResponse<InvoicePaymentStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowInvoicePaymentCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-payment/complete`;

export const postOrdersPublicIDWorkflowInvoicePaymentComplete = (publicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowInvoicePaymentCompletePath(publicID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowInvoicePaymentCompleteFetchResponse>;
}

export type PostOrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse = 
| FetchResponse<InvoicePaymentStepReminderCommand, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowInvoicePaymentReminderPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/invoice-payment/reminder`;

export const postOrdersPublicIDWorkflowInvoicePaymentReminder = (publicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowInvoicePaymentReminderPath(publicID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowInvoicePaymentReminderFetchResponse>;
}

export type GetOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse = 
| FetchResponse<EnterpriseInvoiceIssuanceAndPaymentStepQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/enterprise-invoice-issuance-and-payment`;

export const getOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPayment = (publicID: string, options?: FetchArgsOptions):
  Promise<GetOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse> => {
    return apiGet(`${getApiUrl()}${getOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentPath(publicID)}`, options, {}) as Promise<GetOrdersPublicIDWorkflowEnterpriseInvoiceIssuanceAndPaymentFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentCancelCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentCancelErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/cancel`;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancel = (publicID: string, paymentCalendarItemID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelPath(publicID, paymentCalendarItemID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDCancelFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentReminderErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/reminder`;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminder = (publicID: string, paymentCalendarItemID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderPath(publicID, paymentCalendarItemID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDReminderFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse = 
| FetchResponse<ClientPrepaidInvoiceRecurringPaymentReminderCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentReminderErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/reminder`;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminder = (publicID: string, paymentCalendarItemID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderPath(publicID, paymentCalendarItemID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidReminderFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentCreateInvoiceCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentCreateAndSendInvoiceToClientErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoicePath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/send-invoice`;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoice = (publicID: string, paymentCalendarItemID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoicePath(publicID, paymentCalendarItemID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDSendInvoiceFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse = 
| FetchResponse<ClientInvoiceRecurringPaymentClientPaidCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientInvoiceRecurringPaymentClientPaidErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/pay`;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPay = (requestContract: ClientInvoiceRecurringPaymentClientPaidRequest, publicID: string, paymentCalendarItemID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse> => {
    const requestData = getApiRequestData<ClientInvoiceRecurringPaymentClientPaidRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayPath(publicID, paymentCalendarItemID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPayFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse = 
| FetchResponse<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayPath = (publicID: string, paymentCalendarItemID: number) => `/api/v1/orders/${publicID}/workflow/client-invoice-recurring-payment/${paymentCalendarItemID}/prepaid/send-invoice-and-pay`;

export const postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPay = (requestContract: ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest, publicID: string, paymentCalendarItemID: number, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidInvoiceRecurringPaymentSendInvoiceAndSetPaidRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayPath(publicID, paymentCalendarItemID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientInvoiceRecurringPaymentPaymentCalendarItemIDPrepaidSendInvoiceAndPayFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse = 
| FetchResponse<SendClientAssignmentEmailCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailPath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-assignment/send-assignment-email`;

export const postOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmail = (publicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailPath(publicID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientAssignmentSendAssignmentEmailFetchResponse>;
}

export type PostOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepCompleteCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompletePath = (publicID: string) => `/api/v1/orders/${publicID}/workflow/client-prepaid-payment-approval/complete`;

export const postOrdersPublicIDWorkflowClientPrepaidPaymentApprovalComplete = (requestContract: ClientPrepaidPaymentApprovalStepCompleteCommandRequest, publicID: string, options?: FetchArgsOptions):
  Promise<PostOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepCompleteCommandRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompletePath(publicID)}`, requestData, options) as Promise<PostOrdersPublicIDWorkflowClientPrepaidPaymentApprovalCompleteFetchResponse>;
}

export type PostOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepInProgressCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfInProgressClientApprovalStepError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressPath = (token: string) => `/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/in-progress`;

export const postOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgress = (requestContract: ClientPrepaidPaymentApprovalStepInProgressRequest, token: string, options?: FetchArgsOptions):
  Promise<PostOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepInProgressRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressPath(token)}`, requestData, options) as Promise<PostOrdersWorkflowClientPrepaidPaymentApprovalTokenInProgressFetchResponse>;
}

export type PostOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse = 
| FetchResponse<ClientPrepaidPaymentApprovalStepRejectCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectPath = (token: string) => `/api/v1/orders/workflow/client-prepaid-payment-approval/${token}/reject`;

export const postOrdersWorkflowClientPrepaidPaymentApprovalTokenReject = (requestContract: ClientPrepaidPaymentApprovalStepRejectRequest, token: string, options?: FetchArgsOptions):
  Promise<PostOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse> => {
    const requestData = getApiRequestData<ClientPrepaidPaymentApprovalStepRejectRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectPath(token)}`, requestData, options) as Promise<PostOrdersWorkflowClientPrepaidPaymentApprovalTokenRejectFetchResponse>;
}

export type PutNotificationsUserSettingsFetchResponse = 
| FetchResponse<SaveUserNotificationSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putNotificationsUserSettingsPath = () => `/api/v1/notifications/user-settings`;

export const putNotificationsUserSettings = (requestContract: UserNotificationUpdateRequest, options?: FetchArgsOptions):
  Promise<PutNotificationsUserSettingsFetchResponse> => {
    const requestData = getApiRequestData<UserNotificationUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putNotificationsUserSettingsPath()}`, requestData, options) as Promise<PutNotificationsUserSettingsFetchResponse>;
}

export type GetInvoicesUserInvoicesFetchResponse = 
| FetchResponse<EntityListOfInvoiceForSupplierCompanyByUserListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getInvoicesUserInvoicesPath = () => `/api/v1/invoices/user-invoices`;

export const getInvoicesUserInvoices = (offset?: number, limit?: number, options?: FetchArgsOptions):
  Promise<GetInvoicesUserInvoicesFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getInvoicesUserInvoicesPath()}`, options, queryParams) as Promise<GetInvoicesUserInvoicesFetchResponse>;
}

export type GetInvoicesPublicIDFetchResponse = 
| FetchResponse<InvoiceDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getInvoicesPublicIDPath = (publicID: string) => `/api/v1/invoices/${publicID}`;

export const getInvoicesPublicID = (publicID: string, options?: FetchArgsOptions):
  Promise<GetInvoicesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getInvoicesPublicIDPath(publicID)}`, options, {}) as Promise<GetInvoicesPublicIDFetchResponse>;
}

export type GetInvoicesPublicIDISDOCFetchResponse = 
| FetchResponse<InvoiceISDOCDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getInvoicesPublicIDISDOCPath = (publicID: string) => `/api/v1/invoices/${publicID}/ISDOC`;

export const getInvoicesPublicIDISDOC = (publicID: string, options?: FetchArgsOptions):
  Promise<GetInvoicesPublicIDISDOCFetchResponse> => {
    return apiGet(`${getApiUrl()}${getInvoicesPublicIDISDOCPath(publicID)}`, options, {}) as Promise<GetInvoicesPublicIDISDOCFetchResponse>;
}

export type GetInvoicesPublicIDISDOCPdfFetchResponse = 
| FetchResponse<InvoiceISDOCPdfBase64Dto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getInvoicesPublicIDISDOCPdfPath = (publicID: string) => `/api/v1/invoices/${publicID}/ISDOCPdf`;

export const getInvoicesPublicIDISDOCPdf = (publicID: string, options?: FetchArgsOptions):
  Promise<GetInvoicesPublicIDISDOCPdfFetchResponse> => {
    return apiGet(`${getApiUrl()}${getInvoicesPublicIDISDOCPdfPath(publicID)}`, options, {}) as Promise<GetInvoicesPublicIDISDOCPdfFetchResponse>;
}

export type GetInvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse = 
| FetchResponse<InvoiceForSupplierCompanyByUserISDOCPdfBase64ListDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getInvoicesInvoiceForSupplierCompanyByUserISDOCPdfPath = () => `/api/v1/invoices/invoice-for-supplier-company-by-user/ISDOCPdf`;

export const getInvoicesInvoiceForSupplierCompanyByUserISDOCPdf = (InvoicePublicIDs?: string[], options?: FetchArgsOptions):
  Promise<GetInvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse> => {
    const queryParams = {
      "InvoicePublicIDs": InvoicePublicIDs
    }
    return apiGet(`${getApiUrl()}${getInvoicesInvoiceForSupplierCompanyByUserISDOCPdfPath()}`, options, queryParams) as Promise<GetInvoicesInvoiceForSupplierCompanyByUserISDOCPdfFetchResponse>;
}

export type PostInvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse = 
| FetchResponse<CancelInvoiceForClientByOrderCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postInvoicesInvoiceForClientByOrderPublicIDCancelPath = (publicID: string) => `/api/v1/invoices/invoice-for-client-by-order/${publicID}/cancel`;

export const postInvoicesInvoiceForClientByOrderPublicIDCancel = (publicID: string, options?: FetchArgsOptions):
  Promise<PostInvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postInvoicesInvoiceForClientByOrderPublicIDCancelPath(publicID)}`, requestData, options) as Promise<PostInvoicesInvoiceForClientByOrderPublicIDCancelFetchResponse>;
}

export type PostEnterprisesFetchResponse = 
| FetchResponse<void, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postEnterprisesPath = () => `/api/v1/enterprises`;

export const postEnterprises = (requestContract: CreateEnterpriseRequest, options?: FetchArgsOptions):
  Promise<PostEnterprisesFetchResponse> => {
    const requestData = getApiRequestData<CreateEnterpriseRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postEnterprisesPath()}`, requestData, options) as Promise<PostEnterprisesFetchResponse>;
}

export type PostEnterprisesChangeModeFetchResponse = 
| FetchResponse<ChangeEnterpriseModeCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postEnterprisesChangeModePath = () => `/api/v1/enterprises/change-mode`;

export const postEnterprisesChangeMode = (requestContract: EnterpriseModeChangeRequest, options?: FetchArgsOptions):
  Promise<PostEnterprisesChangeModeFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseModeChangeRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postEnterprisesChangeModePath()}`, requestData, options) as Promise<PostEnterprisesChangeModeFetchResponse>;
}

export type PutEnterprisesDesignSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseDesignSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putEnterprisesDesignSettingsPath = () => `/api/v1/enterprises/design-settings`;

export const putEnterprisesDesignSettings = (requestContract: EnterpriseDesignSettingsUpdateRequest, options?: FetchArgsOptions):
  Promise<PutEnterprisesDesignSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseDesignSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putEnterprisesDesignSettingsPath()}`, requestData, options) as Promise<PutEnterprisesDesignSettingsFetchResponse>;
}

export type PutEnterprisesCommunicationSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseCommunicationSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putEnterprisesCommunicationSettingsPath = () => `/api/v1/enterprises/communication-settings`;

export const putEnterprisesCommunicationSettings = (requestContract: EnterpriseCommunicationSettingsUpdateRequest, options?: FetchArgsOptions):
  Promise<PutEnterprisesCommunicationSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseCommunicationSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putEnterprisesCommunicationSettingsPath()}`, requestData, options) as Promise<PutEnterprisesCommunicationSettingsFetchResponse>;
}

export type GetEnterprisesBasicSettingsFetchResponse = 
| FetchResponse<EnterpriseBasicSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesBasicSettingsPath = () => `/api/v1/enterprises/basic-settings`;

export const getEnterprisesBasicSettings = (options?: FetchArgsOptions):
  Promise<GetEnterprisesBasicSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesBasicSettingsPath()}`, options, {}) as Promise<GetEnterprisesBasicSettingsFetchResponse>;
}

export type GetEnterprisesExternalIDBasicSettingsFetchResponse = 
| FetchResponse<EnterpriseBasicSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesExternalIDBasicSettingsPath = (externalID: string) => `/api/v1/enterprises/${externalID}/basic-settings`;

export const getEnterprisesExternalIDBasicSettings = (externalID: string, options?: FetchArgsOptions):
  Promise<GetEnterprisesExternalIDBasicSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesExternalIDBasicSettingsPath(externalID)}`, options, {}) as Promise<GetEnterprisesExternalIDBasicSettingsFetchResponse>;
}

export type GetEnterprisesCommissionSettingsFetchResponse = 
| FetchResponse<EntityListOfEnterpriseCommissionSettingsListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesCommissionSettingsPath = () => `/api/v1/enterprises/commission-settings`;

export const getEnterprisesCommissionSettings = (offset?: number, limit?: number, options?: FetchArgsOptions):
  Promise<GetEnterprisesCommissionSettingsFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getEnterprisesCommissionSettingsPath()}`, options, queryParams) as Promise<GetEnterprisesCommissionSettingsFetchResponse>;
}

export type PostEnterprisesCommissionSettingsFetchResponse = 
| FetchResponse<CreateEnterpriseCommissionSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCreateEnterpriseCommissionSettingsErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postEnterprisesCommissionSettingsPath = () => `/api/v1/enterprises/commission-settings`;

export const postEnterprisesCommissionSettings = (requestContract: CreateEnterpriseCommissionSettingsRequest, options?: FetchArgsOptions):
  Promise<PostEnterprisesCommissionSettingsFetchResponse> => {
    const requestData = getApiRequestData<CreateEnterpriseCommissionSettingsRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postEnterprisesCommissionSettingsPath()}`, requestData, options) as Promise<PostEnterprisesCommissionSettingsFetchResponse>;
}

export type GetEnterprisesServiceSettingsFetchResponse = 
| FetchResponse<EnterpriseServiceSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesServiceSettingsPath = () => `/api/v1/enterprises/service-settings`;

export const getEnterprisesServiceSettings = (options?: FetchArgsOptions):
  Promise<GetEnterprisesServiceSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesServiceSettingsPath()}`, options, {}) as Promise<GetEnterprisesServiceSettingsFetchResponse>;
}

export type PutEnterprisesServiceSettingsFetchResponse = 
| FetchResponse<SaveEnterpriseServiceSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ChangeEnterpriseModeCommandResult, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putEnterprisesServiceSettingsPath = () => `/api/v1/enterprises/service-settings`;

export const putEnterprisesServiceSettings = (requestContract: EnterpriseServiceSettingsUpdateRequest, options?: FetchArgsOptions):
  Promise<PutEnterprisesServiceSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putEnterprisesServiceSettingsPath()}`, requestData, options) as Promise<PutEnterprisesServiceSettingsFetchResponse>;
}

export type GetEnterprisesServicesFetchResponse = 
| FetchResponse<EnterpriseServiceListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesServicesPath = () => `/api/v1/enterprises/services`;

export const getEnterprisesServices = (options?: FetchArgsOptions):
  Promise<GetEnterprisesServicesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesServicesPath()}`, options, {}) as Promise<GetEnterprisesServicesFetchResponse>;
}

export type PutEnterprisesServicesFetchResponse = 
| FetchResponse<SaveEnterpriseServicesCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putEnterprisesServicesPath = () => `/api/v1/enterprises/services`;

export const putEnterprisesServices = (requestContract: EnterpriseServicesUpdateRequest, options?: FetchArgsOptions):
  Promise<PutEnterprisesServicesFetchResponse> => {
    const requestData = getApiRequestData<EnterpriseServicesUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putEnterprisesServicesPath()}`, requestData, options) as Promise<PutEnterprisesServicesFetchResponse>;
}

export type GetEnterprisesLogoFetchResponse = 
| FetchResponse<EnterpriseLogoDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesLogoPath = () => `/api/v1/enterprises/logo`;

export const getEnterprisesLogo = (options?: FetchArgsOptions):
  Promise<GetEnterprisesLogoFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesLogoPath()}`, options, {}) as Promise<GetEnterprisesLogoFetchResponse>;
}

export type GetEnterprisesPublicIDLogoJsonFetchResponse = 
| FetchResponse<EnterpriseLogoDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesPublicIDLogoJsonPath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/json`;

export const getEnterprisesPublicIDLogoJson = (publicID: string, options?: FetchArgsOptions):
  Promise<GetEnterprisesPublicIDLogoJsonFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesPublicIDLogoJsonPath(publicID)}`, options, {}) as Promise<GetEnterprisesPublicIDLogoJsonFetchResponse>;
}

export type GetEnterprisesPublicIDLogoFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesPublicIDLogoFilePath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/file`;

export const getEnterprisesPublicIDLogoFile = (publicID: string, options?: FetchArgsOptions):
  Promise<GetEnterprisesPublicIDLogoFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesPublicIDLogoFilePath(publicID)}`, options, {}) as Promise<GetEnterprisesPublicIDLogoFileFetchResponse>;
}

export type GetEnterprisesPublicIDLogoTenantFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 204> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesPublicIDLogoTenantFilePath = (publicID: string) => `/api/v1/enterprises/${publicID}/logo/tenant/file`;

export const getEnterprisesPublicIDLogoTenantFile = (publicID: string, options?: FetchArgsOptions):
  Promise<GetEnterprisesPublicIDLogoTenantFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesPublicIDLogoTenantFilePath(publicID)}`, options, {}) as Promise<GetEnterprisesPublicIDLogoTenantFileFetchResponse>;
}

export type GetEnterprisesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<EnterpriseDesignSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/enterprises/${publicID}/design-settings`;

export const getEnterprisesPublicIDDesignSettings = (publicID: string, options?: FetchArgsOptions):
  Promise<GetEnterprisesPublicIDDesignSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesPublicIDDesignSettingsPath(publicID)}`, options, {}) as Promise<GetEnterprisesPublicIDDesignSettingsFetchResponse>;
}

export type GetEnterprisesPackageServiceSettingsFetchResponse = 
| FetchResponse<EnterprisePackageServiceSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getEnterprisesPackageServiceSettingsPath = () => `/api/v1/enterprises/package-service-settings`;

export const getEnterprisesPackageServiceSettings = (options?: FetchArgsOptions):
  Promise<GetEnterprisesPackageServiceSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getEnterprisesPackageServiceSettingsPath()}`, options, {}) as Promise<GetEnterprisesPackageServiceSettingsFetchResponse>;
}

export type PutEnterprisesPackageServiceSettingsFetchResponse = 
| FetchResponse<SaveEnterprisePackageServiceSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putEnterprisesPackageServiceSettingsPath = () => `/api/v1/enterprises/package-service-settings`;

export const putEnterprisesPackageServiceSettings = (requestContract: EnterprisePackageServiceSettingsUpdateRequest, options?: FetchArgsOptions):
  Promise<PutEnterprisesPackageServiceSettingsFetchResponse> => {
    const requestData = getApiRequestData<EnterprisePackageServiceSettingsUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putEnterprisesPackageServiceSettingsPath()}`, requestData, options) as Promise<PutEnterprisesPackageServiceSettingsFetchResponse>;
}

export type GetCutoffsFetchResponse = 
| FetchResponse<EntityListOfCutoffListItemDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsPath = () => `/api/v1/cutoffs`;

export const getCutoffs = (offset?: number, limit?: number, options?: FetchArgsOptions):
  Promise<GetCutoffsFetchResponse> => {
    const queryParams = {
      "offset": offset,
      "limit": limit
    }
    return apiGet(`${getApiUrl()}${getCutoffsPath()}`, options, queryParams) as Promise<GetCutoffsFetchResponse>;
}

export type PostCutoffsFetchResponse = 
| FetchResponse<CreateCutoffCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfCreateCutoffErrorStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ApiProblemDetailsOfCreateCutoffErrorStatus, 409> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postCutoffsPath = () => `/api/v1/cutoffs`;

export const postCutoffs = (requestContract: CutoffCreateRequest, options?: FetchArgsOptions):
  Promise<PostCutoffsFetchResponse> => {
    const requestData = getApiRequestData<CutoffCreateRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postCutoffsPath()}`, requestData, options) as Promise<PostCutoffsFetchResponse>;
}

export type GetCutoffsPublicIDFetchResponse = 
| FetchResponse<CutoffDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsPublicIDPath = (publicID: string) => `/api/v1/cutoffs/${publicID}`;

export const getCutoffsPublicID = (publicID: string, options?: FetchArgsOptions):
  Promise<GetCutoffsPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCutoffsPublicIDPath(publicID)}`, options, {}) as Promise<GetCutoffsPublicIDFetchResponse>;
}

export type GetCutoffsCompanyIDDateFromForNextCutoffFetchResponse = 
| FetchResponse<DateFromForNextCutoffDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsCompanyIDDateFromForNextCutoffPath = (companyID: number) => `/api/v1/cutoffs/${companyID}/date-from-for-next-cutoff`;

export const getCutoffsCompanyIDDateFromForNextCutoff = (companyID: number, options?: FetchArgsOptions):
  Promise<GetCutoffsCompanyIDDateFromForNextCutoffFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCutoffsCompanyIDDateFromForNextCutoffPath(companyID)}`, options, {}) as Promise<GetCutoffsCompanyIDDateFromForNextCutoffFetchResponse>;
}

export type GetCutoffsExpectedUserCommissionFetchResponse = 
| FetchResponse<GetExpectedUserCommissionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsExpectedUserCommissionPath = () => `/api/v1/cutoffs/expected-user-commission`;

export const getCutoffsExpectedUserCommission = (options?: FetchArgsOptions):
  Promise<GetCutoffsExpectedUserCommissionFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCutoffsExpectedUserCommissionPath()}`, options, {}) as Promise<GetCutoffsExpectedUserCommissionFetchResponse>;
}

export type GetCutoffsPaidUserCommissionFetchResponse = 
| FetchResponse<GetPaidUserCommissionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsPaidUserCommissionPath = () => `/api/v1/cutoffs/paid-user-commission`;

export const getCutoffsPaidUserCommission = (options?: FetchArgsOptions):
  Promise<GetCutoffsPaidUserCommissionFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCutoffsPaidUserCommissionPath()}`, options, {}) as Promise<GetCutoffsPaidUserCommissionFetchResponse>;
}

export type GetCutoffsPublicIDISDOCPdfsFetchResponse = 
| FetchResponse<CutoffISDOCPdfsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsPublicIDISDOCPdfsPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/ISDOCPdfs`;

export const getCutoffsPublicIDISDOCPdfs = (publicID: string, options?: FetchArgsOptions):
  Promise<GetCutoffsPublicIDISDOCPdfsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCutoffsPublicIDISDOCPdfsPath(publicID)}`, options, {}) as Promise<GetCutoffsPublicIDISDOCPdfsFetchResponse>;
}

export type PostCutoffsPublicIDSendPaymentsFetchResponse = 
| FetchResponse<SendCutoffPaymentsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postCutoffsPublicIDSendPaymentsPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/send-payments`;

export const postCutoffsPublicIDSendPayments = (publicID: string, options?: FetchArgsOptions):
  Promise<PostCutoffsPublicIDSendPaymentsFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, false);

    return apiPost(`${getApiUrl()}${postCutoffsPublicIDSendPaymentsPath(publicID)}`, requestData, options) as Promise<PostCutoffsPublicIDSendPaymentsFetchResponse>;
}

export type GetCutoffsPublicIDDetailPdfFetchResponse = 
| FetchResponse<CutoffDetailPdfBase64Dto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsPublicIDDetailPdfPath = (publicID: string) => `/api/v1/cutoffs/${publicID}/detail-pdf`;

export const getCutoffsPublicIDDetailPdf = (publicID: string, options?: FetchArgsOptions):
  Promise<GetCutoffsPublicIDDetailPdfFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCutoffsPublicIDDetailPdfPath(publicID)}`, options, {}) as Promise<GetCutoffsPublicIDDetailPdfFetchResponse>;
}

export type GetCutoffsUserSupplierCompaniesFetchResponse = 
| FetchResponse<CutoffUserSupplierCompanyListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCutoffsUserSupplierCompaniesPath = () => `/api/v1/cutoffs/user-supplier-companies`;

export const getCutoffsUserSupplierCompanies = (options?: FetchArgsOptions):
  Promise<GetCutoffsUserSupplierCompaniesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCutoffsUserSupplierCompaniesPath()}`, options, {}) as Promise<GetCutoffsUserSupplierCompaniesFetchResponse>;
}

export type GetCompaniesPublicIDFetchResponse = 
| FetchResponse<CompanyDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCompaniesPublicIDPath = (publicID: string) => `/api/v1/companies/${publicID}`;

export const getCompaniesPublicID = (publicID: string, options?: FetchArgsOptions):
  Promise<GetCompaniesPublicIDFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCompaniesPublicIDPath(publicID)}`, options, {}) as Promise<GetCompaniesPublicIDFetchResponse>;
}

export type PostCompaniesFetchResponse = 
| FetchResponse<CreateCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postCompaniesPath = () => `/api/v1/companies`;

export const postCompanies = (requestContract: CompanyCreateRequest, options?: FetchArgsOptions):
  Promise<PostCompaniesFetchResponse> => {
    const requestData = getApiRequestData<CompanyCreateRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postCompaniesPath()}`, requestData, options) as Promise<PostCompaniesFetchResponse>;
}

export type PutCompaniesFetchResponse = 
| FetchResponse<UpdateCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putCompaniesPath = () => `/api/v1/companies`;

export const putCompanies = (requestContract: CompanyUpdateRequest, options?: FetchArgsOptions):
  Promise<PutCompaniesFetchResponse> => {
    const requestData = getApiRequestData<CompanyUpdateRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putCompaniesPath()}`, requestData, options) as Promise<PutCompaniesFetchResponse>;
}

export type GetCompaniesUserSupplierCompaniesFetchResponse = 
| FetchResponse<UserSupplierCompanyListItemDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCompaniesUserSupplierCompaniesPath = () => `/api/v1/companies/user-supplier-companies`;

export const getCompaniesUserSupplierCompanies = (options?: FetchArgsOptions):
  Promise<GetCompaniesUserSupplierCompaniesFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCompaniesUserSupplierCompaniesPath()}`, options, {}) as Promise<GetCompaniesUserSupplierCompaniesFetchResponse>;
}

export type PostCompaniesUserSupplierCompanyFetchResponse = 
| FetchResponse<SetUserSupplierCompanyCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postCompaniesUserSupplierCompanyPath = () => `/api/v1/companies/user-supplier-company`;

export const postCompaniesUserSupplierCompany = (requestContract: UserSupplierCompanySetRequest, options?: FetchArgsOptions):
  Promise<PostCompaniesUserSupplierCompanyFetchResponse> => {
    const requestData = getApiRequestData<UserSupplierCompanySetRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postCompaniesUserSupplierCompanyPath()}`, requestData, options) as Promise<PostCompaniesUserSupplierCompanyFetchResponse>;
}

export type GetCompaniesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<CompanyDesignSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCompaniesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/design-settings`;

export const getCompaniesPublicIDDesignSettings = (publicID: string, options?: FetchArgsOptions):
  Promise<GetCompaniesPublicIDDesignSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCompaniesPublicIDDesignSettingsPath(publicID)}`, options, {}) as Promise<GetCompaniesPublicIDDesignSettingsFetchResponse>;
}

export type PutCompaniesPublicIDDesignSettingsFetchResponse = 
| FetchResponse<SaveCompanyDesignSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putCompaniesPublicIDDesignSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/design-settings`;

export const putCompaniesPublicIDDesignSettings = (requestContract: SaveCompanyDesignSettingsRequest, publicID: string, options?: FetchArgsOptions):
  Promise<PutCompaniesPublicIDDesignSettingsFetchResponse> => {
    const requestData = getApiRequestData<SaveCompanyDesignSettingsRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putCompaniesPublicIDDesignSettingsPath(publicID)}`, requestData, options) as Promise<PutCompaniesPublicIDDesignSettingsFetchResponse>;
}

export type GetCompaniesPublicIDFioSettingsFetchResponse = 
| FetchResponse<CompanyFioSettingsDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCompaniesPublicIDFioSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/fio-settings`;

export const getCompaniesPublicIDFioSettings = (publicID: string, options?: FetchArgsOptions):
  Promise<GetCompaniesPublicIDFioSettingsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCompaniesPublicIDFioSettingsPath(publicID)}`, options, {}) as Promise<GetCompaniesPublicIDFioSettingsFetchResponse>;
}

export type PutCompaniesPublicIDFioSettingsFetchResponse = 
| FetchResponse<SaveCompanyFioSettingsCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putCompaniesPublicIDFioSettingsPath = (publicID: string) => `/api/v1/companies/${publicID}/fio-settings`;

export const putCompaniesPublicIDFioSettings = (requestContract: SaveFioSettingsRequest, publicID: string, options?: FetchArgsOptions):
  Promise<PutCompaniesPublicIDFioSettingsFetchResponse> => {
    const requestData = getApiRequestData<SaveFioSettingsRequest>(requestContract, false);

    return apiPut(`${getApiUrl()}${putCompaniesPublicIDFioSettingsPath(publicID)}`, requestData, options) as Promise<PutCompaniesPublicIDFioSettingsFetchResponse>;
}

export type GetCompaniesPublicIDLogoFileFetchResponse = 
| FetchResponse<File, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCompaniesPublicIDLogoFilePath = (publicID: string) => `/api/v1/companies/${publicID}/logo/file`;

export const getCompaniesPublicIDLogoFile = (publicID: string, options?: FetchArgsOptions):
  Promise<GetCompaniesPublicIDLogoFileFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCompaniesPublicIDLogoFilePath(publicID)}`, options, {}) as Promise<GetCompaniesPublicIDLogoFileFetchResponse>;
}

export type GetCodeListsFetchResponse = 
| FetchResponse<GetCodeListCollectionQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getCodeListsPath = () => `/api/v1/code-lists`;

export const getCodeLists = (options?: FetchArgsOptions):
  Promise<GetCodeListsFetchResponse> => {
    return apiGet(`${getApiUrl()}${getCodeListsPath()}`, options, {}) as Promise<GetCodeListsFetchResponse>;
}

export type GetClientsCountFetchResponse = 
| FetchResponse<GetClientsCountQueryResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getClientsCountPath = () => `/api/v1/clients/count`;

export const getClientsCount = (options?: FetchArgsOptions):
  Promise<GetClientsCountFetchResponse> => {
    return apiGet(`${getApiUrl()}${getClientsCountPath()}`, options, {}) as Promise<GetClientsCountFetchResponse>;
}

export type GetClientsSearchFetchResponse = 
| FetchResponse<ClientDto[], 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getClientsSearchPath = () => `/api/v1/clients/search`;

export const getClientsSearch = (query?: string, options?: FetchArgsOptions):
  Promise<GetClientsSearchFetchResponse> => {
    const queryParams = {
      "query": query
    }
    return apiGet(`${getApiUrl()}${getClientsSearchPath()}`, options, queryParams) as Promise<GetClientsSearchFetchResponse>;
}

export type GetClientsSearchPersonalNumberFetchResponse = 
| FetchResponse<ClientDto, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetails, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const getClientsSearchPersonalNumberPath = () => `/api/v1/clients/search/personal-number`;

export const getClientsSearchPersonalNumber = (query?: string, options?: FetchArgsOptions):
  Promise<GetClientsSearchPersonalNumberFetchResponse> => {
    const queryParams = {
      "query": query
    }
    return apiGet(`${getApiUrl()}${getClientsSearchPersonalNumberPath()}`, options, queryParams) as Promise<GetClientsSearchPersonalNumberFetchResponse>;
}

export type PostCacheRefreshFetchResponse = 
| FetchResponse<void, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 403> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postCacheRefreshPath = () => `/api/v1/cache/refresh`;

export const postCacheRefresh = (body: string, options?: FetchArgsOptions):
  Promise<PostCacheRefreshFetchResponse> => {
    const requestData = getApiRequestData<string>(body, false);

    return apiPost(`${getApiUrl()}${postCacheRefreshPath()}`, requestData, options) as Promise<PostCacheRefreshFetchResponse>;
}

export type PostAuthSignUpFetchResponse = 
| FetchResponse<SignUpCommandResult, 201> 
| FetchResponse<ApiProblemDetailsOfPasswordChangeResultStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfSignUpErrorStatus, 409> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postAuthSignUpPath = () => `/api/v1/auth/sign-up`;

export const postAuthSignUp = (requestContract: SignUpCommand, options?: FetchArgsOptions):
  Promise<PostAuthSignUpFetchResponse> => {
    const requestData = getApiRequestData<SignUpCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postAuthSignUpPath()}`, requestData, options) as Promise<PostAuthSignUpFetchResponse>;
}

export type PostAuthSignInFetchResponse = 
| FetchResponse<SignInResult, 200> 
| FetchResponse<ApiProblemDetailsOfAuthError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postAuthSignInPath = () => `/api/v1/auth/sign-in`;

export const postAuthSignIn = (requestContract: SignInCommand, options?: FetchArgsOptions):
  Promise<PostAuthSignInFetchResponse> => {
    const requestData = getApiRequestData<SignInCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postAuthSignInPath()}`, requestData, options) as Promise<PostAuthSignInFetchResponse>;
}

export type PostAuthTokenFetchResponse = 
| FetchResponse<TokenResponse, 200> 
| FetchResponse<ApiProblemDetailsOfAuthError, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postAuthTokenPath = () => `/api/v1/auth/token`;

export const postAuthToken = (options?: FetchArgsOptions):
  Promise<PostAuthTokenFetchResponse> => {
    const requestData = getApiRequestData<object>(undefined, true);

    return apiPost(`${getApiUrl()}${postAuthTokenPath()}`, requestData, options) as Promise<PostAuthTokenFetchResponse>;
}

export type PostAuthEmailVerificationFetchResponse = 
| FetchResponse<EmailVerificationCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfEmailVerificationCommandResultStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postAuthEmailVerificationPath = () => `/api/v1/auth/email-verification`;

export const postAuthEmailVerification = (requestContract: EmailVerificationCommand, options?: FetchArgsOptions):
  Promise<PostAuthEmailVerificationFetchResponse> => {
    const requestData = getApiRequestData<EmailVerificationCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postAuthEmailVerificationPath()}`, requestData, options) as Promise<PostAuthEmailVerificationFetchResponse>;
}

export type PostAuthEmailVerificationSendFetchResponse = 
| FetchResponse<ResendVerificationEmailCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postAuthEmailVerificationSendPath = () => `/api/v1/auth/email-verification/send`;

export const postAuthEmailVerificationSend = (requestContract: ResendVerificationEmailCommand, options?: FetchArgsOptions):
  Promise<PostAuthEmailVerificationSendFetchResponse> => {
    const requestData = getApiRequestData<ResendVerificationEmailCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postAuthEmailVerificationSendPath()}`, requestData, options) as Promise<PostAuthEmailVerificationSendFetchResponse>;
}

export type PostAuthSsoFetchResponse = 
| FetchResponse<SignInResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfAuthError, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postAuthSsoPath = () => `/api/v1/auth/sso`;

export const postAuthSso = (requestContract: SsoSignInRequest, options?: FetchArgsOptions):
  Promise<PostAuthSsoFetchResponse> => {
    const requestData = getApiRequestData<SsoSignInRequest>(requestContract, false);

    return apiPost(`${getApiUrl()}${postAuthSsoPath()}`, requestData, options) as Promise<PostAuthSsoFetchResponse>;
}

export type GetAuthSsoTokenFetchResponse = 
| FetchResponse<RedirectHttpResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ProblemDetails, 500> 
| FetchResponse<ApiProblemDetails, 501> 
| ErrorResponse;

export const getAuthSsoTokenPath = () => `/api/v1/auth/sso-token`;

export const getAuthSsoToken = (IdentityProvider?: IdentityProvider, options?: FetchArgsOptions):
  Promise<GetAuthSsoTokenFetchResponse> => {
    const queryParams = {
      "IdentityProvider": IdentityProvider
    }
    return apiGet(`${getApiUrl()}${getAuthSsoTokenPath()}`, options, queryParams) as Promise<GetAuthSsoTokenFetchResponse>;
}

export type PostAuthPasswordResetFetchResponse = 
| FetchResponse<ResetPasswordCommandResult, 200> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfResetPasswordCommandResultStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const postAuthPasswordResetPath = () => `/api/v1/auth/password-reset`;

export const postAuthPasswordReset = (requestContract: ResetPasswordCommand, options?: FetchArgsOptions):
  Promise<PostAuthPasswordResetFetchResponse> => {
    const requestData = getApiRequestData<ResetPasswordCommand>(requestContract, false);

    return apiPost(`${getApiUrl()}${postAuthPasswordResetPath()}`, requestData, options) as Promise<PostAuthPasswordResetFetchResponse>;
}

export type PutAuthPasswordFetchResponse = 
| FetchResponse<SetPasswordCommandResult, 200> 
| FetchResponse<ApiProblemDetailsOfPasswordChangeResultStatus, 400> 
| FetchResponse<ApiProblemDetails, 401> 
| FetchResponse<ApiProblemDetailsOfSetPasswordCommandStatus, 404> 
| FetchResponse<ProblemDetails, 500> 
| ErrorResponse;

export const putAuthPasswordPath = () => `/api/v1/auth/password`;

export const putAuthPassword = (requestContract: SetPasswordCommand, options?: FetchArgsOptions):
  Promise<PutAuthPasswordFetchResponse> => {
    const requestData = getApiRequestData<SetPasswordCommand>(requestContract, false);

    return apiPut(`${getApiUrl()}${putAuthPasswordPath()}`, requestData, options) as Promise<PutAuthPasswordFetchResponse>;
}
