// create and export express app
const express = require('express');
const app = express();
module.exports = app;

// require needed custom middlewares
const bodyParser = require('body-parser');
const morgan = require('morgan');

// use custom middlewares
app.use(bodyParser.json({limit:'50mb'}));
app.use(morgan('dev'));
app.use(express.static('public'));

// require routers
const loginRouter = require('./routers/LoginRouter.js');
const signupRouter = require('./routers/SignupRouter.js');
const infoRouter = require('./routers/InfoRouter.js');
const tripRouter = require('./routers/TripRouter.js');
const userRouter = require('./routers/UserRouter.js');
const imageRouter = require('./routers/ImageRouter.js');

// use routers
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/info', infoRouter);
app.use('/trips', tripRouter);
app.use('/user', userRouter);
app.use('/image', imageRouter);

// run server
const PORT = process.env.PORT || 8080;

app.listen(PORT, function(){
	console.log("Server is listening on port " + PORT);
});
