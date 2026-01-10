import { z } from 'zod';
import { 
  insertUserSchema, 
  insertPeriodLogSchema, 
  insertArticleSchema, 
  insertRoomSchema, 
  insertChatMessageSchema,
  users,
  periodLogs,
  articles,
  rooms,
  messages,
  predictions
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  user: {
    update: {
      method: 'PUT' as const,
      path: '/api/user',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof periodLogs.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertPeriodLogSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof periodLogs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/logs/:id',
      input: insertPeriodLogSchema.partial().omit({ userId: true }),
      responses: {
        200: z.custom<typeof periodLogs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/logs/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  predictions: {
    list: {
      method: 'GET' as const,
      path: '/api/predictions',
      responses: {
        200: z.array(z.custom<typeof predictions.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/predictions/generate',
      responses: {
        201: z.custom<typeof predictions.$inferSelect>(),
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal,
      },
    }
  },
  articles: {
    list: {
      method: 'GET' as const,
      path: '/api/articles',
      responses: {
        200: z.array(z.custom<typeof articles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/articles/:id',
      responses: {
        200: z.custom<typeof articles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  rooms: {
    list: {
      method: 'GET' as const,
      path: '/api/rooms',
      responses: {
        200: z.array(z.custom<typeof rooms.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    messages: {
      list: {
        method: 'GET' as const,
        path: '/api/rooms/:roomId/messages',
        responses: {
          200: z.array(z.custom<typeof messages.$inferSelect>()),
          401: errorSchemas.unauthorized,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/rooms/:roomId/messages',
        input: z.object({ content: z.string() }),
        responses: {
          201: z.custom<typeof messages.$inferSelect>(),
          400: errorSchemas.validation, // Rate limit or validation
          401: errorSchemas.unauthorized,
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
