# Instashots

Instashots is an Instagram like clone social media platform that allows users to post and share photos and stories, as well as like and comment on other users' posts. This repository contains the code for the frontend and backend of the application.

## Getting Started

To run the application, you will need to set up a Prisma database and install the necessary dependencies. Here is a step-by-step guide to setting up the application:

### Install dependencies

Install the dependencies for the frontend and backend by running the following commands in the terminal:

    yarn install
    cd client && yarn install && cd ..

You will also need to add the following environment variables to your .env file:

MONGO_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
CLOUDINARY_UPLOAD_PRESET=
JWT_SECRET=
JWT_REFRESH_SECRET=
NODE_ENV=
EMAIL=
EMAIL_PASSWORD=
CLIENT_URL=
JWT_ACCESS_TOKEN_EXPIRY=
JWT_REFRESH_TOKEN_EXPIRY=
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

### Start the application

Start the application by running the following commands in the terminal:

    yarn dev
    cd client && yarn dev && cd ..

This will start the frontend and backend servers.
