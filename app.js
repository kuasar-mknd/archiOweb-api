import express from 'express';
import createError from 'http-errors';
import logger from 'morgan';
import mongoose from 'mongoose';

// Importez vos routes personnalisées
import indexRouter from './routes/index.js';
import userRoutes from './routes/userRoutes.js';
import gardenRoutes from './routes/gardenRoutes.js';
import plantRoutes from './routes/plantRoutes.js';

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to MongoDB!");
});

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Utilisez vos routes personnalisées
app.use('/', indexRouter);
app.use('/api/users', userRoutes);
app.use('/api/gardens', gardenRoutes);
app.use('/api/plants', plantRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

export default app;
