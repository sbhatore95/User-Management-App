const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            },
            unique: {
                args: true,
                msg: 'Email address already in use!'
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        noConsFailed: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lastLockOut: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('NOW'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('NOW'),
        }
    });
    return User;
};