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
app.use(limiter)
app.use(mongoSanitize())
app.use(helmet())
app.use(express.json({ limit: '10kb' })) // Body limit is 10
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Utilisez vos routes personnalisées
app.use('/', indexRouter)
app.use('/api/users', userRoutes)
app.use('/api/gardens', gardenRoutes)
app.use('/api/plants', plantRoutes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send('error')
})

export default app
