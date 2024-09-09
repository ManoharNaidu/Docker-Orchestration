# Docker Orchestration API

This is a simple Docker orchestration server using Express and Dockerode. The server provides endpoints to list all Docker containers and create new containers. The API documentation is generated using Swagger UI.

## Prerequisites

- Node.js
- Docker

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/ManoharNaidu/Docker-Orchestration.git
   cd Docker-Orchestration
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Start the server:

   ```sh
   npm run dev
   ```

## API Endpoints

1.  Root Endpoint:
    GET /
    Returns a message directing to the /containers endpoint.

    Responses:

          200 OK: A message directing to the /containers endpoint.

2.  List All Containers:
    GET /containers
    Returns a list of all Docker containers.

    Responses:

             200 OK: A JSON object containing a list of all containers.

3.  Create a New Container:
    POST /containers/
    Creates a new Docker container from the specified image.

    Request Body:

             image (string): The Docker image to use for the new container. Example: "nginx"

    Responses:

            200 OK: A JSON object containing the ID of the created container.

500 Internal Server Error: An error message.
