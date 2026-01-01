import express from 'express'
import createError from 'http-errors'
import logger from 'morgan'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'

// Importez vos routes personnalisées
import indexRouter from './routes/index.js'
import userRoutes from './routes/userRoutes.js'
import gardenRoutes from './routes/gardenRoutes.js'
import plantRoutes from './routes/plantRoutes.js'

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 350, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again after a break'
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('Connected to MongoDB!')
})

const app = express()
// Apply to all requests & sanitize req.body
app.use(cors())
if (process.env.NODE_ENV !== 'test') {
  app.use(limiter)
}
app.use(helmet())

// Sentinel: Database Maintenance Mode Middleware
// If DB is not connected (readyState !== 1), return 503 to prevent hanging/crashes
app.use((req, res, next) => {
  // 1 = connected. If we are in 'test' env, we might be using memory server which is managed differently,
  // but typically readyState should still be valid.
  // We skip this check for static assets or documentation if needed, but for API it's critical.
  if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
    return res.status(503).json({
      success: false,
      message: 'Service Unavailable: Database connection is down. Please check server logs and configuration.',
      maintenance: true
    })
  }
  next()
})

app.use(express.json({ limit: '10kb' })) // Body limit is 10kb
app.use(express.urlencoded({ extended: false }))
// Custom mongoSanitize to avoid assigning to read-only req.query in Express 5
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body)
  if (req.query) mongoSanitize.sanitize(req.query)
  if (req.params) mongoSanitize.sanitize(req.params)
  next()
})
// Disable CSP *only* for Swagger UI docs route
app.use('/api-docs', helmet({
  contentSecurityPolicy: false // Required for Swagger UI to work correctly
}), swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(compression())

if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'))
}


// Utilisez vos routes personnalisées
app.use('/', indexRouter)
app.use('/api/users', userRoutes)
app.use('/api/gardens', gardenRoutes)
app.use('/api/plants', plantRoutes)

import errorHandler from './middlewares/errorHandler.js'
import AppError from './utils/AppError.js'

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

// Global Error Handler
app.use(errorHandler)

export default app
