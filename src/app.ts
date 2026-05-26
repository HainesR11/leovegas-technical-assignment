import express from "express";
import cors from "cors";
import { createServer } from "http";
import useRouter from "./useRoutes";
import dotenv from "dotenv";
import requestLogger from "./middleware/requestLogger";
import authenticationMiddleware from "./middleware/authentication";
import errorHandlingMiddleware from "./middleware/errorHandling";

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors());
app.use(express.json());

// Custom Middleware
app.use(requestLogger);
app.use(authenticationMiddleware);
app.use(errorHandlingMiddleware);

const httpServer = createServer(app);

httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});

app.get("/", (_, res) => {
  res.status(200).json({
    AppName: "Dev-Notion Node Service",
  });
});

useRouter(app);

export default app;
