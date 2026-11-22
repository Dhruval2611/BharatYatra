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

// First, let's see what packages we have
db.all('SELECT id, title, imageUrls FROM packages', [], (err, rows) => {
    if (err) {
        console.error('Error fetching packages:', err.message);
        db.close();
        return;
    }

    console.log('\n=== Current Packages ===\n');
    rows.forEach(row => {
        const images = JSON.parse(row.imageUrls || '[]');
        console.log(`ID: ${row.id}`);
        console.log(`Title: ${row.title}`);
        console.log(`Images (${images.length}):`, images);
        console.log('---');
    });

    // Now update each package with multiple images
    const updates = [
        {
            id: 1,
            imageUrls: [
                '/images/Himalaya/manali.jpg',
                '/images/Himalaya/shimla.jpg',
                '/images/Himalaya/kasol.jpg',
                '/images/Himalaya/kullu2.jpg'
            ]
        },
        {
            id: 2,
            imageUrls: [
                '/images/Kerala/Alleppey.jpeg',
                '/images/Kerala/munnar.jpg',
                '/images/Kerala/kochi.avif',
                '/images/Kerala/thekkady.avif'
            ]
        },
        {
            id: 3,
            imageUrls: [
                '/images/Rajasthan/jaipur.jpg',
                '/images/Rajasthan/udaipur.jpg',
                '/images/Rajasthan/jodhpur.jpg',
                '/images/Rajasthan/jaisalmer.jpg'
            ]
        },
        {
            id: 4,
            imageUrls: [
                '/images/Goa/1370.jpg',
                '/images/Goa/2584.jpg',
                '/images/Goa/3681.jpg',
                '/images/Goa/panjim-church.jpg'
            ]
        },
        {
            id: 5,
            imageUrls: [
                '/images/Himalaya/shimla.jpg',
                '/images/Himalaya/manali.jpg',
                '/images/Himalaya/kullu2.jpg',
                '/images/Himalaya/kasol.jpg'
            ]
        },
        {
            id: 6,
            imageUrls: [
                '/images/Kerala/kochi.avif',
                '/images/Kerala/munnar.jpg',
                '/images/Kerala/thekkady.avif',
                '/images/Kerala/Alleppey.jpeg'
            ]
        }
    ];

    console.log('\n=== Updating Packages ===\n');

    const stmt = db.prepare("UPDATE packages SET imageUrls = ? WHERE id = ?");

    updates.forEach(update => {
        stmt.run([JSON.stringify(update.imageUrls), update.id], function (err) {
            if (err) {
                console.error(`Error updating package ${update.id}:`, err.message);
            } else {
                console.log(`Updated package ${update.id}: ${this.changes} rows affected.`);
            }
        });
    });

    stmt.finalize(() => {
        console.log('\n=== Updates completed ===');

        // Verify the updates
        db.all('SELECT id, title, imageUrls FROM packages', [], (err, rows) => {
            if (err) {
                console.error('Error fetching updated packages:', err.message);
            } else {
                console.log('\n=== Updated Packages ===\n');
                rows.forEach(row => {
                    const images = JSON.parse(row.imageUrls || '[]');
                    console.log(`ID: ${row.id}`);
                    console.log(`Title: ${row.title}`);
                    console.log(`Images (${images.length}):`, images);
                    console.log('---');
                });
            }
            db.close();
        });
    });
});
