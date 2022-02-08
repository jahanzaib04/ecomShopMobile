const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());

const api = process.env.API_URL;

//Product Router
const productsRouter = require('./routers/products');
const categoriesRoutes = require('./routers/categories');
const usersRoutes = require('./routers/users');
const orderRoutes = require('./routers/orders');

// Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

//Routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, orderRoutes);

mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ecomshop',
  })
  .then(() => console.log('Mongodb is connected'))
  .catch((err) => console.log(err));

// Development
// app.listen(3000, () => {
//   console.log(`server is running http://localhost:3000`);
// });

// Production
const server = app.listen(process.env.PORT || 3000, () => {
  const port = server.address().port;
  console.log('Express is working on port ' + port);
});
