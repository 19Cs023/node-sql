import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

dotenv.config();

// import routes (You need to implement these similarly to the MongoDB ones but using Sequelize models)
// import userRoutes from './routes/user.route.js';
// import authRoutes from './routes/auth.route.js';
// ... (others)

const app = express();
app.use(cors());
app.use(express.json());

// app.use('/', userRoutes);
// app.use('/', authRoutes);
// ... Mount routes

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(() => {
  console.log('MySQL Database synced successfully');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to sync database:', err);
});
