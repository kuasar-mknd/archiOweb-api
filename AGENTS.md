# Project Overview

This is a Node.js/Express API project utilizing MongoDB for data persistence. It follows a standard MVC architecture.

## Setup & Build

- **Install Dependencies**: `npm install`
- **Start Development Server**: `npm run dev` (uses nodemon)
- **Start Production Server**: `npm start`
- **Client Websocket**: `npm run clientWS`

## Testing

- **Run Tests**: `npm test`
- **Test Framework**: Mocha & Chai
- **Environment**: Tests run with `NODE_ENV=test` and a mock JWT secret.

## Quality Assurance

- **Linting**: `npm run lint` (ESLint)
- **Formatting**: `npm run format` (Prettier)
- **Security Check**: `npm run security-check` (npm audit)
- **Coverage**: `npm run coverage` (c8)

## Project Structure

- `models/`: Mongoose schemas and models.
- `controllers/`: Request handling logic.
- `routes/`: API route definitions.
- `services/`: Business logic layer.
- `middlewares/`: Custom Express middlewares (auth, validation, etc.).
- `utils/`: Utility functions and classes.
- `lib/`: WebSocket and other library code.
- `tests/`: Unit and integration tests.

## Coding Conventions

- **Module System**: ES Modules (`type: "module"` in package.json).
- **Style**: Standard JavaScript style enforced by ESLint and Prettier.
- **Async/Await**: Preferred over callbacks for asynchronous operations.
