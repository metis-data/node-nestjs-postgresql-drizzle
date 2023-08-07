<a href="https://www.metisdata.io/"><img src="https://static-asserts-public.s3.eu-central-1.amazonaws.com/metis-min-logo.png" width="605" height="163" alt="Metis"></a>

# Node.js, NestJS, Drizzle, and PostgreSQL

A simple backend REST API for IMDb database built with Node.js, NestJS, Drizzle, PostgreSQL.

# Environment configuration

`.env` file in the root directory of this package contains the connection string to the database:

```
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/demo?schema=imdb"
```

The connection string is of the form:

```
postgres://USERNAME:PASSWORD@SERVER:PORT/DATABASE_NAME?schema=SCHEMA
```

If you use your different PostgreSQL instance, then change this key accordingly.

The `.env` file has the setting for Metis API:

```
METIS_API_KEY=YOUR_API_KEY
```

Replace this key accordingly if you want to use Metis. This is optional, the application will work without the key as well.

# Run the application using Docker

Run the command:

```
./start-service.sh
```

This will create the Docker container and start it.

If you want to remove the image after you're done, run this:

```
./remove-container.sh
```

This script will prune the images as well. It will ask for confirmation.

# Run the application directly

Make sure you have the Node.js installed (version 16+).

Run the build script:

```
./build-and-run.sh
```

# You're all set! 🎉 
Fore more info visit our - [Documentation](https://docs.metisdata.io)