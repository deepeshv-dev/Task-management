# Taskflow

Taskflow is a private task-management workspace built with React, Vite, Express, and MongoDB. Each account sees only its own tasks. It includes account registration and login, a database-backed overview, task search/filter/sort, and editable profile details.

## What you need

- Node.js 20 LTS or newer
- npm
- MongoDB Community Server running locally, or a MongoDB connection string

## Run locally

1. Install the API dependencies:

   ```sh
   npm install --prefix server
   ```

2. Create `server/.env` by copying `server/.env.example`. Set `MONGODB_URI` to your database and replace `JWT_SECRET` with a random value of at least 32 characters. For example, generate a secret with:

   ```sh
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. Install frontend dependencies:

   ```sh
   npm install --prefix client
   ```

4. (Optional) Create `client/.env` from `client/.env.example` if the API is not at `http://localhost:4000/api`.

5. In one terminal, start the API:

   ```sh
   npm run dev --prefix server
   ```

6. In another terminal, start the Vite frontend:

   ```sh
   npm run dev --prefix client
   ```

7. Open the local URL Vite prints (normally `http://localhost:5173`) and create an account. There are no demo accounts or seeded tasks.

Alternatively, run `npm install` and then `npm run install:all` at the project root; after setting up the environment files, `npm run dev` starts both services together.

To run a production frontend build, use `npm run build --prefix client`. To start the API without nodemon, use `npm start --prefix server`. Copy `.env.example` files rather than committing real `.env` configuration.

## Configuration

### API (`server/.env`)

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Express listening port | `4000` |
| `NODE_ENV` | Set to `production` for secure cookies | `development` |
| `MONGODB_URI` | MongoDB connection URI | Local database URI in example |
| `JWT_SECRET` | Private signing secret (minimum 32 characters) | Required |
| `JWT_EXPIRES_IN` | JWT lifetime | `7d` |
| `CLIENT_ORIGIN` | Exact allowed browser origin for credentialed CORS | `http://localhost:5173` |

### Frontend (`client/.env`)

`VITE_API_URL` sets the API base URL. It defaults to `http://localhost:4000/api`. The API uses an HTTP-only `session` cookie, so the browser sends credentials automatically; do not put JWTs in local storage.

## REST API

All endpoints are prefixed with `/api`. JSON request bodies are used where applicable. Authenticated endpoints require the HTTP-only session cookie issued at login or registration. Task data is scoped to the signed-in user.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | API health check |
| `POST` | `/auth/register` | No | Create account (`name`, `email`, `password`; password 8–128 chars) |
| `POST` | `/auth/login` | No | Sign in (`email`, `password`) |
| `GET` | `/auth/me` | Yes | Get current user |
| `POST` | `/auth/logout` | No | Clear session cookie |
| `GET` | `/users/profile` | Yes | Get account details and task count |
| `PUT` | `/users/profile` | Yes | Update `name` and `email` |
| `GET` | `/dashboard` | Yes | Database-derived task counts, overdue count, and five recent tasks |
| `GET` | `/tasks` | Yes | List tasks; optional `search`, `status`, `priority`, and `sort=dueDate` query parameters |
| `GET` | `/tasks/:id` | Yes | Get one task owned by the signed-in user |
| `POST` | `/tasks` | Yes | Create task (`title`, `description`, `priority`, `status`, `dueDate`) |
| `PUT` | `/tasks/:id` | Yes | Update task fields |
| `DELETE` | `/tasks/:id` | Yes | Delete task |

Task status values: `todo`, `in-progress`, `completed`. Priorities: `low`, `medium`, `high`. Due dates may be omitted or set to `null`.

## Project layout

```text
client/       React application and Vite configuration
server/       Express API, Mongoose models, auth, and REST routes
```

## Notes

- Passwords are hashed with bcrypt; the signed JWT is kept in an HTTP-only cookie.
- Cookies are marked `Secure` in production. Use HTTPS when deploying.
- Configure `CLIENT_ORIGIN` to the exact frontend origin when using a different host.
- This project does not create seed records. Dashboard statistics are calculated from the signed-in user's MongoDB tasks.
- MongoDB connectivity and full account/task workflows need a configured running database and have not been verified by the frontend build alone.
