# Bookla React SDK

React SDK for integrating with Bookla's booking system.

## Installation

```bash
npm install @bookla/react-client-sdk
```

## Usage

```jsx
import { BooklaSDK } from '@bookla-app/react-client-sdk';

const bookla = new BooklaSDK({
    apiUrl: 'https://us.bookla.com/api',
    apiKey: 'your-api-key',
    debug: true,
    retry: {
        maxAttempts: 3,
        delayMs: 1000,
        statusCodesToRetry: [408, 429, 500, 502, 503, 504]
    }
});

// Get services
const services = await bookla.services.list('company-id');

// Create booking
const booking = await bookla.bookings.request({
    companyID: 'company-id',
    serviceID: 'service-id',
    resourceID: 'resource-id',
    startTime: '2024-01-01T10:00:00Z'
});
```

## Documentation
- [Check out Bookla official docs](https://docs.bookla.com/docs/intro)

## License
MIT