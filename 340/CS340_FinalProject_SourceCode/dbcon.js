
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_xxxxxxxx'	,
  password		  : 'xxxx',
  database        : 'cs340_mccarrom'
});
module.exports.pool = pool;
