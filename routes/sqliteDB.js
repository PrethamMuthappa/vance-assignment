const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize=new Sequelize({
    dialect:'sqlite',
    storage:'./database.sqlite',
});

class User extends Model {}
User.init({
    date:DataTypes.STRING,
    open:DataTypes.STRING,
    high:DataTypes.STRING,
    low:DataTypes.STRING,
    close:DataTypes.STRING,
    adj_close:DataTypes.STRING,
},{sequelize,modelName:'User'});

sequelize.sync();

module.exports={User,sequelize};

