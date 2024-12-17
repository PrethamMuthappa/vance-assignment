const { Sequelize, Model, DataTypes } = require('sequelize');
const e = require("express");

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


(async()=>{
    try {
       await  sequelize.sync();
        console.log("Database sync done")
    }
    catch (error){
        console.error("Database sync error"+error)
    }
})();

module.exports={User,sequelize};

