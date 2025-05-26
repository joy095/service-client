// src/lib/server/db.ts
import pg from 'pg';



const { Pool } = pg;

// Ensure DATABASE_URL is set
const databaseUrl = import.meta.env.VITE_DATABASE_URL;


if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables');
}

// Create a new PostgreSQL connection pool
// This pool manages multiple connections to the database,
// making it efficient for handling concurrent requests.
const pool = new Pool({
    connectionString: databaseUrl,
    // Optional: Add SSL settings if connecting to a remote database like Neon, Supabase, etc.
    ssl: {
        rejectUnauthorized: false // Use with caution in production if you don't verify certs
    }
});

// Test the database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Error connecting to PostgreSQL database:', err);
    // You might want to implement more robust error handling or graceful shutdown here
});

export default pool;