const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const apiRouter = require('./routes/index');
const errorHandler = require('./middlewares/error-handler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1', apiRouter);

// Dev-only: serve token helper page from HTTP origin (Clerk blocks file://)
if (process.env.NODE_ENV !== 'production') {
  app.get('/test-token', (_req, res) => res.sendFile(__dirname + '/test-phase1.html'));
}

// Error handling (must be after all routes)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
