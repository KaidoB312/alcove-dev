// init-db.js – rebuilds database from scratch (for use with new schema)
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

(async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        multipleStatements: true,
    });

    console.log('Connected to MySQL. Dropping database if exists...');
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log('Database dropped.');

    console.log('Creating new database...');
    await connection.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log('Database created.');

    console.log('Switching to database...');
    await connection.query(`USE ${process.env.DB_NAME}`);

    console.log('Reading SQL file...');
    const sql = fs.readFileSync('database.sql', 'utf8');

    console.log('Executing SQL...');
    await connection.query(sql);
    console.log('Import completed successfully!');
    await connection.end();
    process.exit(0);
})().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});