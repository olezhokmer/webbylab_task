const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const operatorsAliases = {
  $like: Op.like,
  $not: Op.not
}
const sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
        host: process.env.PGHOST,
        dialect: 'postgres',
        operatorsAliases
    }
)

module.exports = sequelize;