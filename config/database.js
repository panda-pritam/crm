import {Sequelize} from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({force: true});
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Unable to connect to database:", error);
    process.exit(1);
  }
};

// sequelize.sync({force: true}).then(() => {
//   console.log("Database tables created");
// });
