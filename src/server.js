import express from 'express';
import { config } from 'dotenv';
import { connectDB, disconnectDB } from "./config/db.js";


// Import Routes
import movieRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

config();


// API Routes
app.use('/api/movies', movieRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection: ", err.message);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    })
});

//Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception: ", err.message);
    await disconnectDB();
    process.exit(1);
});

//Graceful Shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    })
})