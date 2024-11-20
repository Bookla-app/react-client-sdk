export const ENDPOINTS = {
    bookings: {
        list: { path: '/v1/client/bookings', auth: 'bearer' as const },
        get: { path: '/v1/client/bookings/{id}', auth: 'bearer' as const },
        create: { path: '/v1/client/bookings', auth: 'bearer' as const },
        cancel: { path: '/v1/client/bookings/{id}/cancel', auth: 'bearer' as const },
    },
    services: {
        list: { path: '/v1/client/companies/{companyId}/services', auth: 'apiKey' as const },
        get: { path: '/v1/client/companies/{companyId}/services/{id}', auth: 'apiKey' as const },
        getTimes: { path: '/v1/client/companies/{companyId}/services/{id}/times', auth: 'apiKey' as const },
    },
    resources: {
        list: { path: '/v1/client/companies/{companyId}/resources', auth: 'apiKey' as const },
        get: { path: '/v1/client/companies/{companyId}/resources/{id}', auth: 'apiKey' as const },
    }
} as const;