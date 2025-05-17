# CRM System

A Customer Relationship Management (CRM) system built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Sequelize ORM
- **AI Integration**: OpenAI API
- **Development**: Nodemon for hot reloading

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- OpenAI API key But (not Free so not working)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/panda-pritam/crm.git
   cd crm
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL=postgres://username:password@localhost:5432/crm_db
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Set up the database:
   ```
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   ```

## Running the Application

Development mode with hot reloading:

```
npm run dev
```

Production mode:

```
npm start
```

## Project Structure

```
crm/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── migrations/         # Sequelize migrations
├── models/             # Sequelize models
├── routes/             # Express routes
├── services/           # Business logic
├── utils/              # Utility functions
├── .env                # Environment variables (not in repo)
├── index.js            # Application entry point
└── package.json        # Project dependencies
```

## API Documentation

GET /api/leads - Get all leads

GET /api/leads/:id - Get a specific lead

POST /api/leads - Create a new lead
body-
{
"name": "Pritam mondal",
"email": "john@company.com",
"company": "Acme Inc",
"status": "new"
}

PUT /api/leads/:id - Update a lead

DELETE /api/leads/:id - Delete a lead

GET /api/leads/:id/score - Score a lead

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

https://documenter.getpostman.com/view/22913290/2sB2qXj2nk
