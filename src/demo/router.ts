import { APIGatewayEvent, Context } from "aws-lambda";
import { heidiRouter } from "../heidi/router";
import { loggingMiddleware } from "./middleware";
import { getAgents, getStudents, updateStudents } from "./routes";

export const router = heidiRouter<APIGatewayEvent, any, Context>([
  { name: "GetAgents", route: getAgents },
  { name: "GetStudents", route: getStudents },
  { name: "UpdateStudents", route: updateStudents },
]).before([loggingMiddleware]);

export const handler = router.handleRequest;