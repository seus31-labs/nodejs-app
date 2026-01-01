const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
  return sequelize.define('Task', {
    task_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });
};
