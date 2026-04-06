/**
 * @param {string} baseUrl
 */
function buildOpenApiSpec(baseUrl) {
  return {
    openapi: "3.0.3",
    info: {
      title: "Zorvyn Finance Backend API",
      version: "1.0.0",
      description: "Finance Data Processing and Access Control Backend",
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string", example: "Invalid request payload" },
                details: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Users" },
      { name: "Records" },
      { name: "Dashboard" },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: { description: "Service health status" },
          },
        },
      },
      "/auth/bootstrap-admin": {
        post: {
          tags: ["Auth"],
          summary: "Bootstrap first admin (only when DB has no users)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", example: "System Admin" },
                    email: { type: "string", format: "email", example: "admin@zovryn.local" },
                    password: { type: "string", example: "Password@123" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Admin bootstrapped" }, 409: { description: "Already bootstrapped" } },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and get JWT token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "admin@zovryn.local" },
                    password: { type: "string", example: "Password@123" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Login success" }, 401: { description: "Invalid credentials" } },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Current user" }, 401: { description: "Unauthorized" } },
        },
      },
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user (admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                    role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                    status: { type: "string", enum: ["active", "inactive"] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "User registered" }, 403: { description: "Forbidden" } },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "List users (admin only)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Users list" } },
        },
        post: {
          tags: ["Users"],
          summary: "Create user (admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                    role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                    status: { type: "string", enum: ["active", "inactive"] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "User created" } },
        },
      },
      "/users/{userId}": {
        patch: {
          tags: ["Users"],
          summary: "Update user role/status/name (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                    status: { type: "string", enum: ["active", "inactive"] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "User updated" } },
        },
      },
      "/records": {
        get: {
          tags: ["Records"],
          summary: "List financial records",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "type", schema: { type: "string", enum: ["income", "expense"] } },
            { in: "query", name: "category", schema: { type: "string" } },
            { in: "query", name: "startDate", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "endDate", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
            { in: "query", name: "sortBy", schema: { type: "string", enum: ["date", "amount", "createdAt"] } },
            { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] } },
          ],
          responses: { 200: { description: "Paginated records" } },
        },
        post: {
          tags: ["Records"],
          summary: "Create financial record (admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount", "type", "category", "date"],
                  properties: {
                    amount: { type: "number", example: 1200 },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string", example: "Sales" },
                    date: { type: "string", format: "date-time", example: "2026-04-04T00:00:00.000Z" },
                    note: { type: "string", example: "Invoice #A-201" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Record created" } },
        },
      },
      "/records/{recordId}": {
        get: {
          tags: ["Records"],
          summary: "Get record by id",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "recordId", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Record" }, 404: { description: "Record not found" } },
        },
        patch: {
          tags: ["Records"],
          summary: "Update record (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "recordId", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    amount: { type: "number" },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string" },
                    date: { type: "string", format: "date-time" },
                    note: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Record updated" } },
        },
        delete: {
          tags: ["Records"],
          summary: "Delete record (admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "recordId", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Record deleted" } },
        },
      },
      "/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Summary totals",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "startDate", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "endDate", schema: { type: "string", format: "date-time" } },
          ],
          responses: { 200: { description: "Summary totals" } },
        },
      },
      "/dashboard/category-totals": {
        get: {
          tags: ["Dashboard"],
          summary: "Category-wise income/expense/net totals",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "startDate", schema: { type: "string", format: "date-time" } },
            { in: "query", name: "endDate", schema: { type: "string", format: "date-time" } },
          ],
          responses: { 200: { description: "Category totals" } },
        },
      },
      "/dashboard/recent-activity": {
        get: {
          tags: ["Dashboard"],
          summary: "Recent activity list",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "query", name: "limit", schema: { type: "integer", default: 10 } }],
          responses: { 200: { description: "Recent records" } },
        },
      },
      "/dashboard/trends": {
        get: {
          tags: ["Dashboard"],
          summary: "Weekly or monthly trend points",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "period", schema: { type: "string", enum: ["weekly", "monthly"], default: "monthly" } },
            { in: "query", name: "months", schema: { type: "integer", default: 6 } },
          ],
          responses: { 200: { description: "Trend points" } },
        },
      },
    },
  };
}

module.exports = {
  buildOpenApiSpec,
};
