import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Sequelize({
  database: process.env.DB_DATABASE as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string, 10),
  dialect: 'mysql',
  timezone: '-05:00',

  models: [__dirname + '/../models/**/*.ts'],  // Ruta de tus modelos
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,  // Aquí es donde habilitas el manejo automático de createdAt y updatedAt
  }
});
