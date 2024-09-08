const express = require("express");
const Docker = require("dockerode");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const docker = new Docker();

app.use(express.json());

const PORT_TO_CONTAINER = {};
const CONTAINER_TO_PORT = {};

// Swagger set up
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Docker Orchestration API",
      version: "1.0.0",
      description: "API documentation for Docker Orchestration",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./index.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns a message directing to the /containers endpoint.
 *     responses:
 *       200:
 *         description: A message directing to the /containers endpoint.
 */
app.get("/", (req, res) => {
  res.send("Go to /containers to see all containers");
});

/**
 * @swagger
 * /containers:
 *   get:
 *     summary: List all Docker containers
 *     description: Returns a list of all Docker containers.
 *     responses:
 *       200:
 *         description: A JSON object containing a list of all containers.
 */
app.get("/containers", async (req, res) => {
  const containers = await docker.listContainers({ all: true });
  res.json({
    containers: containers.map((container) => {
      return {
        id: container.Id,
        name: container.Names[0],
        image: container.Image,
        status: container.State,
      };
    }),
  });
});

/**
 * @swagger
 * /containers/:
 *   post:
 *     summary: Create a new Docker container
 *     description: Creates a new Docker container from the specified image.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 example: "nginx"
 *     responses:
 *       200:
 *         description: A JSON object containing the ID of the created container.
 *       500:
 *         description: An error message.
 */
app.post("/containers/", async (req, res) => {
  const { image } = req.body;

  try {
    await docker.pull(image);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  const availablePort = (() => {
    for (let i = 8000; i <= 9000; i++) {
      if (!PORT_TO_CONTAINER[i]) {
        return `${i}`;
      }
    }
  })();

  if (!availablePort) {
    return res.status(500).json({ error: "No available ports" });
  }

  const container = await docker.createContainer({
    Image: image,
    HostConfig: {
      PortBindings: {
        "80/tcp": [
          {
            HostPort: availablePort,
          },
        ],
      },
    },
    Cmd: ["sh"],
    Tty: true,
    AttachStdout: true,
  });

  PORT_TO_CONTAINER[availablePort] = container.id;
  CONTAINER_TO_PORT[container.id] = availablePort;

  await container.start();
  return res.json({ container: container.id });
});

/**
 * Starts the server on port 3000.
 */
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
