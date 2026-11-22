import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

const updates = [
    {
        title: 'Mystical Ladakh Adventure',
        imageUrls: [
            '/images/Himalaya/manali.jpg',
            '/images/Himalaya/shimla.jpg',
            '/images/Himalaya/kasol.jpg'
        ]
    },
    {
        title: 'Kerala Backwaters Bliss',
        imageUrls: [
            '/images/Kerala/Alleppey.jpeg',
            '/images/Kerala/munnar.jpg',
            '/images/Kerala/kochi.avif',
            '/images/Kerala/thekkady.avif'
        ]
    },
    {
        title: 'Royal Rajasthan Heritage Tour',
        imageUrls: [
            '/images/Rajasthan/jaipur.jpg',
            '/images/Rajasthan/udaipur.jpg',
            '/images/Rajasthan/jodhpur.jpg',
            '/images/Rajasthan/jaisalmer.jpg'
        ]
    },
    {
        title: 'Goa Beach Paradise',
        imageUrls: [
            '/images/Goa/1370.jpg',
            '/images/Goa/2584.jpg',
            '/images/Goa/3681.jpg',
            '/images/Goa/panjim-church.jpg'
        ]
    },
    {
        title: 'Himalayan Escape (Shimla – Manali – Kullu – Kasol)',
        imageUrls: [
            '/images/Himalaya/shimla.jpg',
            '/images/Himalaya/manali.jpg',
            '/images/Himalaya/kullu2.jpg',
            '/images/Himalaya/kasol.jpg'
        ]
    },
    {
        title: 'Kerala Paradise (Kochi – Munnar – Thekkady – Alleppey)',
        imageUrls: [
            '/images/Kerala/kochi.avif',
            '/images/Kerala/munnar.jpg',
            '/images/Kerala/thekkady.avif',
            '/images/Kerala/Alleppey.jpeg'
        ]
    }
];

db.serialize(() => {
    const stmt = db.prepare("UPDATE packages SET imageUrls = ? WHERE title LIKE ?");

    updates.forEach(update => {
        // Use LIKE with wildcards to match titles more flexibly if needed, or exact match
        // Using exact match for now but with % just in case of minor diffs, or just exact.
        // Let's try exact match first.
        stmt.run([JSON.stringify(update.imageUrls), `%${update.title}%`], function (err) {
            if (err) {
                console.error(`Error updating ${update.title}:`, err.message);
            } else {
                console.log(`Updated ${update.title}: ${this.changes} rows affected.`);
            }
        });
    });

    stmt.finalize(() => {
        console.log('Updates completed.');
        db.close();
    });
});
