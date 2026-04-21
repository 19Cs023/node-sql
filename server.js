import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

dotenv.config();

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import commentRoutes from './routes/comments.route.js';
import orderRoutes from './routes/order.route.js';
import productRoutes from './routes/product.route.js';
import shopRoutes from './routes/shop.route.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', userRoutes);
app.use('/', authRoutes);
app.use('/', commentRoutes);
app.use('/', orderRoutes);
app.use('/', productRoutes);
app.use('/', shopRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(() => {
  console.log('MySQL Database synced successfully');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to sync database:', err);
});
