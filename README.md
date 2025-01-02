# Bookla SDK

A TypeScript/JavaScript SDK for integrating with the Bookla Platform API. This SDK provides a simple and intuitive way to interact with Bookla's booking system, services, resources, and subscription management.

## Table of Contents

- [Installation](#installation)
- [Initialization](#initialization)
- [Authentication](#authentication)
- [Services](#services)
- [Resources](#resources)
- [Bookings](#bookings)
- [Subscriptions](#subscriptions)
- [Request Cancellation](#request-cancellation)
- [Interceptors](#interceptors)
- [Error Handling](#error-handling)
- [Types](#types)
- [License](#license)

## Installation

```bash
npm install @bookla/sdk
```

## Initialization

```typescript
import { BooklaSDK } from '@bookla/sdk';

const sdk = new BooklaSDK({
    apiUrl: 'https://eu.bookla.com',
    apiKey: 'your-api-key',
    // Optional configurations
    timeout: 30000, // Request timeout in milliseconds
    debug: false,   // Enable debug logging
    retry: {
        maxAttempts: 3,
        delayMs: 1000,
        statusCodesToRetry: [408, 429, 500, 502, 503, 504]
    }
});
```

## Authentication

The SDK supports both API key and bearer token authentication. For client-specific operations that require authentication:

```typescript
// Set authentication tokens
sdk.setAuthTokens({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAt: '2024-01-02T12:00:00Z'
});

// Check authentication status
const authState = sdk.isAuthenticated();
if (authState.isAuthenticated) {
    console.log('Token expires at:', new Date(authState.expiresAt!));
}

// Clear authentication
sdk.clearAuth();
```

## Services

### Bookings

```typescript
// Create a booking
const booking = await sdk.bookings.request({
    companyID: 'company-id',
    serviceID: 'service-id',
    resourceID: 'resource-id',
    startTime: '2024-01-02T10:00:00Z',
    spots: 1,
    client: {
        email: 'client@example.com',
        firstName: 'John',
        lastName: 'Doe'
    }
});

// Get booking list
const bookings = await sdk.bookings.list();

// Get specific booking
const aBooking = await sdk.bookings.get('booking-id');

// Cancel booking
await sdk.bookings.cancel('booking-id', 'Cancellation reason');
```

### Services

```typescript
// List available services
const services = await sdk.services.list('company-id');

// Get specific service
const service = await sdk.services.get('company-id', 'service-id');

// Get available times
const times = await sdk.services.getTimes('company-id', 'service-id', {
    from: '2024-01-02T00:00:00Z',
    to: '2024-01-02T23:59:59Z',
    duration: 'PT1H',
    spots: 1
});
```

### Resources

```typescript
// List resources
const resources = await sdk.resources.list('company-id');

// Get specific resource
const resource = await sdk.resources.get('company-id', 'resource-id');
```

### Subscriptions

```typescript
// Get available subscriptions
const subscriptions = await sdk.subscriptions.getAvailableSubscriptions('company-id');

// Add to cart
await sdk.subscriptions.addToCart('company-id', {
    items: [{ subscriptionID: 'subscription-id' }]
});

// Get cart
const cart = await sdk.subscriptions.getCart('company-id');

// Checkout
const purchase = await sdk.subscriptions.checkout('company-id');

// Get purchases
const purchases = await sdk.subscriptions.getPurchases('company-id');
```

## Request Cancellation

The SDK supports request cancellation:

```typescript
// Create a cancel token
const cancelToken = sdk.createCancelToken();

// Use it in a request
const bookings = await sdk.bookings.list({ cancelToken });

// Cancel the request
cancelToken.cancel();

// Check if an error is due to cancellation
try {
    await sdk.bookings.list({ cancelToken });
} catch (error) {
    if (sdk.isCancelledError(error)) {
        console.log('Request was cancelled');
    }
}
```

## Interceptors

The SDK provides request and response interceptors for custom logic:

```typescript
// Add request interceptor
const removeRequestInterceptor = sdk.interceptors.request.use(async (config) => {
    // Modify request config
    return config;
});

// Add response interceptor
const removeResponseInterceptor = sdk.interceptors.response.use(async (response) => {
    // Modify response data
    return response;
});

// Remove interceptors when needed
removeRequestInterceptor();
removeResponseInterceptor();
```

## Error Handling

The SDK throws `BooklaError` for API-related errors and `BooklaValidationError` for validation errors:

```typescript
try {
    await sdk.bookings.request({
        // Invalid booking request
    });
} catch (error) {
    if (error instanceof BooklaValidationError) {
        console.error('Validation error:', error.details);
    } else if (error instanceof BooklaError) {
        console.error('API error:', error.message, error.code, error.status);
    }
}
```

## Types

The SDK provides TypeScript types for all requests and responses. Import them as needed:

```typescript
import {
    RequestBookingRequest,
    BookingResponse,
    ServiceType,
    BookingStatus
} from '@bookla/sdk';
```

## License

MIT

---

For more information about the Bookla Platform API, visit [Bookla API Documentation](https://docs.bookla.com).