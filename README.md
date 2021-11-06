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

all routes for client-users API '/v1/user/' to either login, reset & update new password, and display users page

| #   | Routers                   | Verbs  | Progress | Is Private | Description                                        |
| --- | ------------------------- | ------ | -------- | ---------- | -------------------------------------------------- |
| 1   | '/v1/user'                | GET    | Done     | Yes        | Auth & Get user info                               |
| 2   | '/v1/user'                | POST   | Done     | No         | Create a user                                      |
| 3   | '/v1/user/login'          | POST   | Done     | Yes        | Verify user auth and return JWT                    |
| 4   | 'v1/user/reset-password'  | POST   | Done     | No         | Verify email to receive pin(OTP) to reset password |
| 5   | '/v1/user/reset-password' | PATCH  | Done     | NO         | Verify pin and update new password                 |
| 6   | 'v1/user/logout'          | DELETE | Done     | Yes        | Delete user JWT                                    |

### Ticket API Resources

all user API routes for '/v1/ticket/'

| #   | Routers                        | Verbs  | Progress | Is Private | Description                       |
| --- | ------------------------------ | ------ | -------- | ---------- | --------------------------------- |
| 1   | '/v1/ticket'                   | GET    | Done     | Yes        | Get all ticket for logged in user |
| 2   | '/v1/ticket/{id}'              | GET    | Done     | Yes        | Get a ticket details              |
| 3   | '/v1/ticket'                   | POST   | Done     | Yes        | Create a new ticket               |
| 4   | '/v1/ticket/{id}'              | PUT    | Done     | Yes        | Update ticket details             |
| 5   | '/v1/ticket/close-ticket/{id}' | PATCH  | Done     | Yes        | Update ticket status to close     |
| 6   | '/v1/ticket/{id}'              | DELETE | Done     | Yes        | Delete a ticket                   |

### Tokens API Resources

all token API routes follows '/v1/tokens' for existing logged user authentication

| #   | Routers      | Verbs | Progress | Is Private | Description                                 |
| --- | ------------ | ----- | -------- | ---------- | ------------------------------------------- |
| 1   | '/v1/tokens' | GET   | Done     | No         | Verify refresh JWT & Get a fresh access JWT |

### Employee API Resources

---

### Admin API Resources
