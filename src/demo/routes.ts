import { APIGatewayEvent } from "aws-lambda";
import { heidi } from "../heidi/heidi";
import { handler } from "./handler";
import { authorisationMiddleware } from "./middleware";

export const getAgents = heidi<APIGatewayEvent>(handler)
  .configure({
    httpMethod: { type: "string", enum: ["GET"] },
    path: { type: "string", enum: ["/agents"] },
  })
  .setMetaData({
    name: "Get Agents"
  })
  .before([authorisationMiddleware]);

export const getStudents = heidi<APIGatewayEvent>(handler)
  .configure({
    httpMethod: { type: "string", enum: ["GET"] },
    path: { type: "string", enum: ["/students"] },
  })
  .setMetaData({
    name: "Get Students"
  })
  .before([authorisationMiddleware]);

export const updateStudents = heidi<APIGatewayEvent>(handler)
  .configure({
    httpMethod: { type: "string", enum: ["POST", "PUT"] },
    path: { type: "string", enum: ["/students"] },
  })
  .setMetaData({
    name: "Update Students",
    description: "Update student information",
    version: "1.0.0",
  })
  .before([authorisationMiddleware]);
