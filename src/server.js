const app = require("./app");
const env = require("./config/env");
const { connectToDatabase } = require("./config/db");

async function bootstrap() {
  await connectToDatabase(env.MONGO_URI);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`
    );
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
