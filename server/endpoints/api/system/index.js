const { EventLogs } = require("../../../models/eventLogs");
const { SystemSettings } = require("../../../models/systemSettings");
const { purgeDocument } = require("../../../utils/files/purgeDocument");
const { getVectorDbClass } = require("../../../utils/helpers");
const { exportChatsAsType } = require("../../../utils/helpers/chat/convertTo");
const { dumpENV, updateENV } = require("../../../utils/helpers/updateENV");
const { reqBody } = require("../../../utils/http");
const { validApiKey } = require("../../../utils/middleware/validApiKey");

function apiSystemEndpoints(app) {
  if (!app) return;

  app.get("/v1/system/env-dump", async (_, response) => {
    /*
   #swagger.tags = ['System Settings']
   #swagger.description = 'Dump all settings to file storage'
   #swagger.responses[403] = {
     schema: {
       "$ref": "#/definitions/InvalidAPIKey"
     }
   }
   */
    try {
      if (process.env.NODE_ENV !== "production")
        return response.sendStatus(200).end();
      dumpENV();
      response.sendStatus(200).end();
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/v1/system", [validApiKey], async (_, response) => {
    /*
    #swagger.tags = ['System Settings']
    #swagger.description = 'Get all current system settings that are defined.'
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
             "settings": {
                "VectorDB": "pinecone",
                "PineConeKey": true,
                "PineConeIndex": "my-pinecone-index",
                "LLMProvider": "azure",
                "[KEY_NAME]": "KEY_VALUE",
              }
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
    try {
      const settings = await SystemSettings.currentSettings();
      response.status(200).json({ settings });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/v1/system/vector-count", [validApiKey], async (_, response) => {
    /*
    #swagger.tags = ['System Settings']
    #swagger.description = 'Number of all vectors in connected vector database'
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
             "vectorCount": 5450
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
    try {
      const VectorDb = getVectorDbClass();
      const vectorCount = await VectorDb.totalVectors();
      response.status(200).json({ vectorCount });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.post(
    "/v1/system/update-env",
    [validApiKey],
    async (request, response) => {
      /*
      #swagger.tags = ['System Settings']
      #swagger.description = 'Update a system setting or preference.'
      #swagger.requestBody = {
        description: 'Key pair object that matches a valid setting and value. Get keys from GET /v1/system or refer to codebase.',
        required: true,
        content: {
          "application/json": {
            example: {
              VectorDB: "lancedb",
              AnotherKey: "updatedValue"
            }
          }
        }
      }
      #swagger.responses[200] = {
        content: {
          "application/json": {
            schema: {
              type: 'object',
              example: {
                newValues: {"[ENV_KEY]": 'Value'},
                error: 'error goes here, otherwise null'
              }
            }
          }
        }
      }
      #swagger.responses[403] = {
        schema: {
          "$ref": "#/definitions/InvalidAPIKey"
        }
      }
      */
      try {
        const body = reqBody(request);
        const { newValues, error } = await updateENV(body);
        response.status(200).json({ newValues, error });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/v1/system/export-chats",
    [validApiKey],
    async (request, response) => {
      /*
    #swagger.tags = ['System Settings']
    #swagger.description = 'Export all of the chats from the system in a known format. Output depends on the type sent. Will be send with the correct header for the output.'
   #swagger.parameters['type'] = {
      in: 'query',
      description: "Export format jsonl, json, csv, jsonAlpaca",
      required: false,
      type: 'string'
    }
    #swagger.responses[200] = {
      content: {process.env.NODE_ENV === "development"
  ? require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
  : require("dotenv").config();

require("./utils/logger")();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const { reqBody } = require("./utils/http");
const { systemEndpoints } = require("./endpoints/system");
const { workspaceEndpoints } = require("./endpoints/workspaces");
const { chatEndpoints } = require("./endpoints/chat");
const { embeddedEndpoints } = require("./endpoints/embed");
const { embedManagementEndpoints } = require("./endpoints/embedManagement");
const { getVectorDbClass } = require("./utils/helpers");
const { adminEndpoints } = require("./endpoints/admin");
const { inviteEndpoints } = require("./endpoints/invite");
const { utilEndpoints } = require("./endpoints/utils");
const { developerEndpoints } = require("./endpoints/api");
const { extensionEndpoints } = require("./endpoints/extensions");
const { bootHTTP, bootSSL } = require("./utils/boot");
const { workspaceThreadEndpoints } = require("./endpoints/workspaceThreads");
const { documentEndpoints } = require("./endpoints/document");
const { agentWebsocket } = require("./endpoints/agentWebsocket");
const { experimentalEndpoints } = require("./endpoints/experimental");
const { browserExtensionEndpoints } = require("./endpoints/browserExtension");
const { communityHubEndpoints } = require("./endpoints/communityHub");
const { agentFlowEndpoints } = require("./endpoints/agentFlows");
const { mcpServersEndpoints } = require("./endpoints/mcpServers");
const { mobileEndpoints } = require("./endpoints/mobile");
const { httpLogger } = require("./middleware/httpLogger");

const app = express();
const apiRouter = express.Router();
const FILE_LIMIT = "3GB";

// ✅ Make sure app.ws exists (WebSocket support)
require("@mintplex-labs/express-ws").default(app);

// Optional HTTP request logging in development
if (
  process.env.NODE_ENV === "development" &&
  !!process.env.ENABLE_HTTP_LOGGER
) {
  app.use(
    httpLogger({
      enableTimestamps: !!process.env.ENABLE_HTTP_LOGGER_TIMESTAMPS,
    })
  );
}

// Core middlewares
app.use(cors({ origin: true }));
app.use(bodyParser.text({ limit: FILE_LIMIT }));
app.use(bodyParser.json({ limit: FILE_LIMIT }));
app.use(
  bodyParser.urlencoded({
    limit: FILE_LIMIT,
    extended: true,
  })
);

// Mount API router
app.use("/api", apiRouter);

// Register API endpoints on /api
systemEndpoints(apiRouter);
extensionEndpoints(apiRouter);
workspaceEndpoints(apiRouter);
workspaceThreadEndpoints(apiRouter);
chatEndpoints(apiRouter);
adminEndpoints(apiRouter);
inviteEndpoints(apiRouter);
embedManagementEndpoints(apiRouter);
utilEndpoints(apiRouter);
documentEndpoints(apiRouter);
experimentalEndpoints(apiRouter);
developerEndpoints(app, apiRouter);
communityHubEndpoints(apiRouter);
agentFlowEndpoints(apiRouter);
mcpServersEndpoints(apiRouter);
mobileEndpoints(apiRouter);

// Externally facing embedder endpoints
embeddedEndpoints(apiRouter);

// Externally facing browser extension endpoints
browserExtensionEndpoints(apiRouter);

// ✅ WebSocket endpoints – use the main app (which now has app.ws)
agentWebsocket(app);

if (process.env.NODE_ENV !== "development") {
  const { MetaGenerator } = require("./utils/boot/MetaGenerator");
  const IndexPage = new MetaGenerator();

  app.use(
    express.static(path.resolve(__dirname, "public"), {
      extensions: ["js"],
      setHeaders: (res) => {
        // Disable I-framing of entire site UI
        res.removeHeader("X-Powered-By");
        res.setHeader("X-Frame-Options", "DENY");
      },
    })
  );

  app.use("/", function (_, response) {
    IndexPage.generate(response);
    return;
  });

  app.get("/robots.txt", function (_, response) {
    response.type("text/plain");
    response.send("User-agent: *\nDisallow: /").end();
  });
} else {
  // Debug route for development connections to vectorDBs
  apiRouter.post("/v/:command", async (request, response) => {
    try {
      const VectorDb = getVectorDbClass();
      const { command } = request.params;

      if (!Object.getOwnPropertyNames(VectorDb).includes(command)) {
        response.status(500).json({
          message: "invalid interface command",
          commands: Object.getOwnPropertyNames(VectorDb),
        });
        return;
      }

      try {
        const body = reqBody(request);
        const resBody = await VectorDb[command](body);
        response.status(200).json({ ...resBody });
      } catch (e) {
        console.error(JSON.stringify(e));
        response.status(500).json({ error: e.message });
      }

      return;
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });
}

// Catch-all 404 for anything that didn't match above routes
app.all("*", function (_, response) {
  response.sendStatus(404);
});

// ✅ Decide which port to use.
// On Railway, PORT is injected by the platform.
const port = process.env.PORT || process.env.SERVER_PORT || 3001;

// ✅ Start the server (HTTP or HTTPS)
if (!!process.env.ENABLE_HTTPS) {
  bootSSL(app, port);
} else {
  bootHTTP(app, port);
}

        "application/json": {
          schema: {
            type: 'object',
            example: [
              {
                "role": "user",
                "content": "What is AnythinglLM?"
              },
              {
                "role": "assistant",
                "content": "AnythingLLM is a knowledge graph and vector database management system built using NodeJS express server. It provides an interface for handling all interactions, including vectorDB management and LLM (Language Model) interactions."
              },
            ]
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
      try {
        const { type = "jsonl" } = request.query;
        const { contentType, data } = await exportChatsAsType(
          type,
          "workspace"
        );
        await EventLogs.logEvent("exported_chats", {
          type,
        });
        response.setHeader("Content-Type", contentType);
        response.status(200).send(data);
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
  app.delete(
    "/v1/system/remove-documents",
    [validApiKey],
    async (request, response) => {
      /*
      #swagger.tags = ['System Settings']
      #swagger.description = 'Permanently remove documents from the system.'
      #swagger.requestBody = {
        description: 'Array of document names to be removed permanently.',
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                names: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: [
                    "custom-documents/file.txt-fc4beeeb-e436-454d-8bb4-e5b8979cb48f.json"
                  ]
                }
              }
            }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'Documents removed successfully.',
        content: {
          "application/json": {
            schema: {
              type: 'object',
              example: {
                success: true,
                message: 'Documents removed successfully'
              }
            }
          }
        }
      }
      #swagger.responses[403] = {
        description: 'Forbidden',
        schema: {
          "$ref": "#/definitions/InvalidAPIKey"
        }
      }
      #swagger.responses[500] = {
        description: 'Internal Server Error'
      }
      */
      try {
        const { names } = reqBody(request);
        for await (const name of names) await purgeDocument(name);
        response
          .status(200)
          .json({ success: true, message: "Documents removed successfully" })
          .end();
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = { apiSystemEndpoints };
