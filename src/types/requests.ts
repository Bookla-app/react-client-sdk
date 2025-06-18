export interface RequestBookingRequest {
  companyID: string; // ID of the company to book with
  resourceID: string; // ID of the resource to book
  serviceID: string; // ID of the service to book
  startTime: string; // Start time of the booking in RFC3339 format
  spots?: number; // Number of spots to book. Required for group services
  duration?: string; // Duration of the booking in ISO8601 format (eg. PT1H)
  metaData?: {
    [key: string]: any;
  }; // Set of key-value pairs that you can attach to an object.
  pluginData?: {
    [key: string]: any;
  }; // Set of key-value pairs that can be used to send data from plugins to the booking handler.
  customPurchaseDescription?: string; // Optional purchase description that can be passed to payment provider. Otherwise, it will be generated automatically.
  client?: {
    id?: string; // Unique identifier for the client
    firstName?: string; // First name of the client
    lastName?: string; // Last name of the client
    email: string; // Email address of the client
  }; // Optional client data. Can be used if you want to create a booking for a guest client without authentication.
  code?: string; // Optional code to apply to the booking. This can be used for discounts, subscriptions or promotions.
}

export interface CancelBookingRequest {
  reason: string;
  notifyCustomer?: boolean;
}

export interface GetTimesRequest {
  from: string; // Start of the time range in RFC3339 format
  to: string; // End of the time range in RFC3339 format
  duration?: string; // Duration of the timeslot in ISO8601 format (eg. PT1H)
  resourceIDs?: string[]; // List of resource IDs to get times for
  spots?: number; // Number of spots that will be requested. Required for group services
  tickets?: {
    [ticketID: string]: number;
  }; // A key-value pair of ticket IDs and the number of spots that will be requested. Required for ticket services
}

export interface GetDatesRequest {
  from: string; // Start of the date range in RFC3339 format
  to: string; // End of the date range in RFC3339 format
  duration?: string; // Duration of the timeslot in ISO8601 format (eg. PT1H)
  resourceIDs?: string[]; // List of resource IDs to get dates for
  spots?: number; // Number of spots that will be requested. Required for group services
  tickets?: {
    [ticketID: string]: number;
  }; // A key-value pair of ticket IDs and the number of spots that will be requested. Required for ticket services
}

export interface AddToCartRequest {
  items: Array<{ subscriptionID: string }>;
}

export interface RenewPurchasesRequest {
  ids: string[];
}

export interface CodeValidateRequest {
  companyID: string;
  serviceID: string;
  resourceID: string;
  startTime: string;
  duration?: string;
  spots: number;
  tickets?: Record<string, number>;
}
