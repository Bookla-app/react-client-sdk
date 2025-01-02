export type ServiceType = 'fixed' | 'flexible' | 'group' | 'ticket' | 'days';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'finished' | 'no_show' | 'rejected';

export interface ServiceResponse {
  id: string;
  companyID: string;
  name: string;
  type: ServiceType;
  color: string;
  createdAt: string;
  updatedAt: string;
  timeZone?: string;
  resources?: ResourceResponse[];
}

export interface ResourceResponse {
  id: string;
  companyID: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  services?: ServiceResponse[];
}

export interface TimesResponse {
  times: {
    [resourceId: string]: TimeSlot[];
  }
}

export interface TimeSlot {
  startTime: string;
  duration: string;
  price: {
    amount: number;
    comparedAmount: number;
    currency: string;
  }
}

export interface BookingListResponse {
    bookings: BookingResponse[];
    limit: number;
    offset: number;
    total: number;
}

export interface BookingResponse {
    id: string; // Unique identifier for the booking.
    companyID: string; // Identifier for the company this booking is associated with.
    resourceID: string; // Identifier for the resource this booking is associated with.
    serviceID: string; // Identifier for the service this booking is associated with.
    startTime: string; // Start time of the booking in RFC3339 format.
    endTime: string; // End time of the booking in RFC3339 format.
    duration: string; // In ISO8601 format, e.g. PT1H for 1 hour
    spots: number; // Number of spots booked. It can be greater than 1 for services with type group and ticket
    price?: number; // In fractional units, e.g. 1000 for $10.00
    currency?: string; // ISO 4217 currency code
    type: ServiceType;
    status: BookingStatus;
    paymentURL?: string; // Payment URL for the booking. Only present if the booking requires payment.
    tickets?: {
        [ticketID: string]: {
        spots: number;
        price: number;
        comparedPrice?: number;
        }
    } // A key-value pair of ticket IDs and the number of spots booked and price for each ticket. Only present for ticket services.
    metaData?: {
        [key: string]: any;
    } // Set of key-value pairs that you can attach to an object.
    createdAt: string; // Date and time when the object was created in RFC3339 format.
}

// subscriptions
export interface SubscriptionContract {
    id: string;
    clientID: string;
    subscriptionID: string;
    status: string;
    activeFrom: string;
    duration: string;
    limitations: {
        bookingsCount?: number;
        daysOfWeek?: number;
        maxDuration?: string;
        maxSpotsPerBooking?: number;
        maxTicketsPerBooking?: Record<string, number>;
        times?: Array<{ startTime: string; endTime: string }>;
    };
    metaData?: Record<string, any>;
}

export interface SubscriptionCartResponse {
    expiresAt: string;
    items: SubscriptionContract[];
}

export interface PurchaseSubscriptionsResponse {
    items: SubscriptionContract[];
    price: number;
    currency: string;
    tax: number;
    taxRate: number;
    taxInclusive: boolean;
    expiresAt: string;
    paymentURL?: string;
}

export interface CompanySubscription {
    id: string;
    title: string;
    price: number;
    comparedPrice?: number;
    currency: string;
    duration: string;
    availableFrom: string;
    availableTo: string;
    rRule?: string;
    resourceIDs: string[];
    serviceIDs: string[];
    limitations: {
        bookingsCount?: number;
        daysOfWeek?: number;
        maxDuration?: string;
        maxSpotsPerBooking?: number;
        maxTicketsPerBooking?: Record<string, number>;
        times?: Array<{ startTime: string; endTime: string }>;
    };
    metaData?: Record<string, any>;
}