#CRM ticket system API

This api is for my final year project. implemented using MERN stack, with the help of the following github repo and youtube tutorial

https://www.youtube.com/playlist?list=PLtPNAX49WUFN8yq2vEuAY6AhM5EJOXQQ0

https://github.com/DentedCode/client-api

## how to use

- run 'git clone ...'
- run 'npm start'

Note: start uses nodemon to run node

## API Resources

### Client-User API Resources

all routes for client-users API '/v1/user/'

| #   | Routers                   | Verbs | Progress | Is Private | Description                                  |
| --- | ------------------------- | ----- | -------- | ---------- | -------------------------------------------- |
| 1   | '/v1/user/login'          | POST  | Done     | No         | Verify user auth and return JWT              |
| 2   | 'v1/user/reset-password'  | POST  | TODO     | No         | Verify email and email pin to reset password |
| 3   | '/v1/user/reset-password' | PATCH | TODO     | NO         | Replace with new password                    |
| 4   | '/v1/user'                | GET   | Done     | Yes        | Get user info                                |

### Ticket API Resources

all user API routes for '/v1/ticket/'

| #   | Routers           | Verbs | Progress | Is Private | Description                       |
| --- | ----------------- | ----- | -------- | ---------- | --------------------------------- |
| 1   | '/v1/ticket'      | GET   | TODO     | Yes        | Get all ticket for logged in user |
| 2   | '/v1/ticket/{id}' | GET   | TODO     | Yes        | Get a ticket details              |

### Tokens API Resources

all token API routes follows '/v1/tokens'

| #   | Routers      | Verbs | Progress | Is Private | Description            |
| --- | ------------ | ----- | -------- | ---------- | ---------------------- |
| 1   | '/v1/tokens' | GET   | Done     | No         | Get a fresh access JWT |
