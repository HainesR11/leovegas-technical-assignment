import { createLogger, format, transports } from "winston";
const { combine, prettyPrint } = format;

export const useLogger = () =>
  createLogger({
    transports: [new transports.Console()],
    format: combine(prettyPrint()),
  });
