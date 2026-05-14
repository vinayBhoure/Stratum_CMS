const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const healthRouter = require('./routes/health');
const errorHandler = require('./middlewares/error-handler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/health', healthRouter);

// Error handling (must be after all routes)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
