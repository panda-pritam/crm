import {DataTypes} from "sequelize";
import {sequelize} from "../config/database.js";

const Lead = sequelize.define(
  "Lead",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name cannot be empty",
        },
        len: {
          args: [2, 100],
          msg: "Name must be between 2 and 100 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Email already exists in our system",
      },
      validate: {
        isEmail: {
          msg: "Please provide a valid email address",
        },
        notEmpty: {
          msg: "Email cannot be empty",
        },
      },
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Company name cannot be empty",
        },
        len: {
          args: [2, 100],
          msg: "Company name must be between 2 and 100 characters",
        },
      },
    },
    status: {
      type: DataTypes.ENUM("new", "contacted", "converted"),
      defaultValue: "new",
      allowNull: false,
      validate: {
        isIn: {
          args: [["new", "contacted", "converted"]],
          msg: "Status must be either new, contacted, or converted",
        },
      },
    },
  },
  {
    underscored: true,
    tableName: "leads",
  }
);

export default Lead;
