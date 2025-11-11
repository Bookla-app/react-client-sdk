export type ServiceType = "fixed" | "flexible" | "group" | "ticket" | "days";
export type BookingStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "finished"
  | "no_show"
  | "rejected";

export interface ServiceResponse {
  id: string;
  companyID: string;
  name: string;
  type: ServiceType;
  color: string;
  createdAt: string;
  updatedAt: string;
  timeZone?: string;
  settings?: ServiceSettings;
  resources?: ResourceResponse[];
  tickets?: TicketResponse[];
}

export interface ServiceSettings {
  currency?: string;
  bookingPolicy?: string;
  duration?: string;
  timeInterval?: string;
  bufferBefore?: string;
  bufferAfter?: string;
  tax?: {
    rate: number;
    inclusive: boolean;
  };
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

export interface TicketResponse {
  id: string;
  name: string;
}

export interface TimesResponse {
  times: {
    [resourceId: string]: TimeSlot[];
  };
}

export interface DatesResponse {
  dates: {
    [resourceId: string]: string[];
  };
  timeZone: string;
}

export interface TimeSlot {
  startTime: string;
  duration: string;
  price: {
    amount: number;
    comparedAmount: number;
    currency: string;
  };
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
    };
  }; // A key-value pair of ticket IDs and the number of spots booked and price for each ticket. Only present for ticket services.
  metaData?: {
    [key: string]: any;
  }; // Set of key-value pairs that you can attach to an object.
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

export interface CodeValidateResponse {
  canApply: boolean;
  clientID: string;
  clientEmail: string;
  price: number;
  pluginNameSpace: string;
  pluginResponse?: Record<string, any>;
}

export interface ClientAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Gift Cards
export interface CompanyGiftCard {
  id: string;
  title: string;
  amount: number; // in cents
  currency: string; // ISO 4217 currency code
  taxRate: number; // e.g. 20 for 20%
  taxInclusive: boolean; // true if tax is included in the amount
  availableFrom: string; // RFC3339 format
  availableTo?: string; // RFC3339 format
  validityDuration: string; // ISO 8601 duration format, e.g. P365D for 1 year
  metaData?: Record<string, any>;
}

export interface PurchaseGiftCardResponse {
  item: GiftCardContract;
  expiresAt: string; // RFC3339 format
  price: number; // in cents
  currency: string; // ISO 4217 currency code
  tax: number; // in cents
  taxRate: number; // e.g. 20 for 20%
  taxInclusive: boolean; // true if tax is included in the price
  paymentURL: string; // URL to complete the payment
}

export interface GiftCardUsage {
  id: string; // Unique identifier for the usage
  createdAt: string; // RFC3339 format
  companyID: string; // ID of the company
  purchaseID: string; // ID of the gift card purchase
  giftCardID: string; // ID of the gift card
  clientID: string; // ID of the client who used the gift card
  status: string; // e.g. used, cancelled
  amount: number; // in cents
  currency: string; // ISO 4217 currency code
  reservationID?: string; // ID of the reservation associated with the usage, if any
  metaData?: Record<string, any>;
}

export interface GiftCardContract {
  id: string; // Unique identifier for the purchase
  createdAt: string; // RFC3339 format
  companyID: string; // ID of the company
  giftCardID: string; // ID of the gift card
  giftCardName: string; // Name of the gift card
  clientID: string; // ID of the client who purchased the gift card
  code: string; // Unique code for the gift card
  amount: number; // in cents
  currency: string; // ISO 4217 currency code
  validUntil?: string; // RFC3339 format
  status: string; // e.g. active, redeemed, expired, cancelled
  usages?: GiftCardUsage[]; // List of usages of the gift card
  metaData?: Record<string, any>;
}

// Addons
export interface ClientAddonResponse {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  taxPercent: number;
  taxInclusive: boolean;
  minQuantity: number;
  maxQuantity: number;
  sortOrder: number;
  isRequired: boolean;
  durationMultiplierEnabled?: boolean;
  durationMultiplierUnit?: string;
  durationMultiplierRounding?: "up" | "down" | "nearest";
  metadata?: Record<string, any>;
}

export interface ClientAddonGroupResponse {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isRequired: boolean;
  members: ClientAddonResponse[];
}

export interface ClientServiceAddonItem {
  type: "addon" | "group";
  serviceAddonId: string;
  isRequired: boolean;
  sortOrder: number;
  addon?: ClientAddonResponse;
  group?: ClientAddonGroupResponse;
}

export interface DiscoverAddonsResponse {
  items: ClientServiceAddonItem[];
}

export interface ValidatedAddonItem {
  addonId: string;
  addonName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  total: number;
  taxPercent: number;
  taxInclusive: boolean;
}

export interface ValidateAddonsResponse {
  valid: boolean;
  errors?: string[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  items: ValidatedAddonItem[];
}
