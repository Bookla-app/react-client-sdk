export const ENDPOINTS = {
  bookings: {
    list: { path: "/v1/client/bookings", auth: "bearer" as const },
    get: { path: "/v1/client/bookings/{id}", auth: "bearer" as const },
    create: { path: "/v1/client/bookings", auth: "apiKeyOrBearer" as const },
    cancel: {
      path: "/v1/client/bookings/{id}/cancel",
      auth: "bearer" as const,
    },
  },
  services: {
    list: {
      path: "/v1/client/companies/{companyId}/services",
      auth: "apiKey" as const,
    },
    get: {
      path: "/v1/client/companies/{companyId}/services/{id}",
      auth: "apiKey" as const,
    },
    getTimes: {
      path: "/v1/client/companies/{companyId}/services/{id}/times",
      auth: "apiKey" as const,
    },
    getDates: {
      path: "/v1/client/companies/{companyId}/services/{id}/dates",
      auth: "apiKey" as const,
    },
  },
  resources: {
    list: {
      path: "/v1/client/companies/{companyId}/resources",
      auth: "apiKey" as const,
    },
    get: {
      path: "/v1/client/companies/{companyId}/resources/{id}",
      auth: "apiKey" as const,
    },
  },
  subscriptions: {
    cart: {
      get: {
        path: "/client/companies/{companyId}/plugins/subscription/client/cart",
        auth: "bearer" as const,
      },
      add: {
        path: "/client/companies/{companyId}/plugins/subscription/client/cart",
        auth: "bearer" as const,
      },
      remove: {
        path: "/client/companies/{companyId}/plugins/subscription/client/cart/{itemId}",
        auth: "bearer" as const,
      },
      checkout: {
        path: "/client/companies/{companyId}/plugins/subscription/client/cart/checkout",
        auth: "bearer" as const,
      },
    },
    purchases: {
      list: {
        path: "/client/companies/{companyId}/plugins/subscription/client/purchases",
        auth: "bearer" as const,
      },
      get: {
        path: "/client/companies/{companyId}/plugins/subscription/client/purchases/{itemId}",
        auth: "bearer" as const,
      },
      renew: {
        path: "/client/companies/{companyId}/plugins/subscription/client/purchases/renew",
        auth: "bearer" as const,
      },
    },
    available: {
      path: "/client/companies/{companyId}/plugins/subscription/client/subscriptions",
      auth: "apiKey" as const,
    },
  },
  codes: {
    validate: {
      path: "/client/codes/{code}/validate",
      auth: "apiKeyOrBearer" as const,
    },
  },
} as const;
