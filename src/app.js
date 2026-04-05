const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const routes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const { createRateLimiter } = require("./middlewares/rateLimit");
const env = require("./config/env");
const { buildOpenApiSpec } = require("./docs/openapi");

const app = express();
const openApiSpec = buildOpenApiSpec(env.APP_BASE_URL);

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(
  createRateLimiter({
    windowMs: env.GLOBAL_RATE_LIMIT_WINDOW_MS,
    max: env.GLOBAL_RATE_LIMIT_MAX,
  })
);
app.get("/openapi.json", (req, res) => {
  res.status(200).json(openApiSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
