import {prisma} from "../config/db.js";


const addToWatchlist = async (req, res) => {
    const { movieId, status, rating, notes } = req.body;

//     verify if the movie exists in the database
    const movie = await prisma.movie.findUnique({
        where: { id: movieId },
    })

    if (!movie) {
        return res.status(400).json({ error: "Movie does not exist" });
    }

//     check if the movie exists in watchlist
    const existingInWatchlist = await prisma.watchlistItem.findUnique({
        where: {
            userId_movieId: {
                userId: req.user.id,
                movieId: movieId,
            }
        }
    });

    if (existingInWatchlist) {
        return res.status(400).json({ error: "Movie already exists in watchlist" });
    }

    const watchlistItem = await prisma.watchlistItem.create({
        data: {
            userId: req.user.id,
            movieId,
            status: status || "PLANNED",
            rating,
            notes,
        },
    });

    res.status(201).json({
        status: "success",
        data: {
            watchlistItem,
        }
    });
}

/**
 *Update watchlist item
 * Updates status, rating, or notes
 * Ensures only owner can update
 * Requires protect middleware
 **/

const updateWatchlistItem = async (req, res) => {
    const { status, rating, notes } = req.body;

//     find watchlist item and verify ownership
    const watchlistItem = await prisma.watchlistItem.findUnique({
        where: { id: req.params.id },
    });

    if (!watchlistItem) {
        return res.status(404).json({ error: "Watchlist item not found" });
    }

//     ensure only owner can update
    if (watchlistItem.userId !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to update this Watchlist item" });
    }

//     Build update data
    const updateData = {};

    if (status !== undefined) updateData.status = status.toUpperCase();
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;

//     update watchlist item
    const updatedItem = await prisma.watchlistItem.update({
        where: {
            id: req.params.id,
        },
        data: updateData
    });

    res.status(200).json({
        status: "success",
        data: {
            watchlistItem: updatedItem,
        }
    });
}

/**
 * Remove movie from watchlist
 * Deletes watchlist item
 * Ensures only owner can delete
 * Requires protect middleware
 */

const removeFromWatchlist = async (req, res) => {
    // Find watchlist item and verify ownership
    const watchlistItem = await prisma.watchlistItem.findUnique({
        where: { id: req.params.id },
    });

    if (!watchlistItem) {
        return res.status(404).json({ error: "Watchlist item not found" });
    }

    // Ensure only owner can delete
    if (watchlistItem.userId !== req.user.id) {
        return res
            .status(403)
            .json({ error: "Not allowed to update this watchlist item" });
    }

    await prisma.watchlistItem.delete({
        where: { id: req.params.id },
    });

    res.status(200).json({
        status: "success",
        message: "Movie removed from watchlist",
    });
};


export { addToWatchlist, updateWatchlistItem, removeFromWatchlist };