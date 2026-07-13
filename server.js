const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const gamificationRoutes = require('./routes/gamificationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const linkRoutes = require('./routes/linkRoutes');
const symptomLogRoutes = require('./routes/symptomLogRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

// Initialize database connection
connectDB();

const app = express();

// ==========================================
// Global Middlewares
// ==========================================

// Security headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Basic Rate Limiting to prevent abuse
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });
// Apply rate limiter to all api routes
// app.use('/api/', apiLimiter);

// ==========================================
// Routes
// ==========================================

// Global request logger (temporary)
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Gamification endpoints
app.use('/api/v1/gamification', gamificationRoutes);

// Health tracking endpoints
app.use('/api/v1/health', healthRoutes);

// Prescription endpoints
app.use('/api/v1/prescriptions', prescriptionRoutes);

// Patient-Doctor link endpoints
app.use('/api/v1/links', linkRoutes);

// Daily symptom log endpoints
app.use('/api/v1/logs/symptoms', symptomLogRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Brain Care API is running...');
});

// ==========================================
// Error Handling
// ==========================================
// Apply the global error-handling middleware last
app.use(errorHandler);

// ==========================================
// Server Initialization
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
