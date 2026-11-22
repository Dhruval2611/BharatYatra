import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for large data
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  next(err);
});

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Initial packages data
const initialPackages = [
  {
    title: 'Mystical Ladakh Adventure',
    description: 'Experience the breathtaking landscapes of Ladakh, from the high-altitude passes to the serene lakes. This adventure takes you through the heart of the Himalayas, offering a blend of culture, nature, and thrill.',
    duration: '7 Days / 6 Nights',
    days: 7,
    price: 25000,
    imageUrls: [
      '/images/Himalaya/manali.jpg',
      '/images/Himalaya/shimla.jpg',
      '/images/Himalaya/kasol.jpg'
    ],
    itineraries: [
      { day: 1, description: 'Arrival in Leh, acclimatization.' },
      { day: 2, description: 'Leh local sightseeing: Shanti Stupa, Leh Palace.' },
      { day: 3, description: 'Trip to Nubra Valley via Khardung La.' },
      { day: 4, description: 'Explore Diskit Monastery and Hunder sand dunes.' },
      { day: 5, description: 'Journey to Pangong Tso lake.' },
      { day: 6, description: 'Return to Leh.' },
      { day: 7, description: 'Departure from Leh.' },
    ],
    category: ['Adventure', 'Trekking'],
    placeTags: ['Leh', 'Nubra Valley', 'Pangong Tso'],
    attractionTags: ['Mountains', 'Monasteries', 'High-altitude Lakes'],
  },
  {
    title: 'Kerala Backwaters Bliss',
    description: 'Relax and rejuvenate in the lap of nature with our Kerala Backwaters Bliss package. Cruise through the tranquil backwaters, explore lush tea gardens, and experience the rich culture of God\'s Own Country.',
    duration: '5 Days / 4 Nights',
    days: 5,
    price: 18000,
    imageUrls: [
      '/images/Kerala/Alleppey.jpeg',
      '/images/Kerala/munnar.jpg',
      '/images/Kerala/kochi.avif',
      '/images/Kerala/thekkady.avif'
    ],
    itineraries: [
      { day: 1, description: 'Arrival in Cochin, transfer to Munnar.' },
      { day: 2, description: 'Munnar sightseeing: Tea gardens, Mattupetty Dam.' },
      { day: 3, description: 'Transfer to Alleppey, check into houseboat.' },
      { day: 4, description: 'Full day cruise on the backwaters.' },
      { day: 5, description: 'Departure from Cochin.' },
    ],
    category: ['Relaxation', 'Nature'],
    placeTags: ['Munnar', 'Alleppey', 'Cochin'],
    attractionTags: ['Backwaters', 'Houseboat', 'Tea Gardens'],
  },
  {
    title: 'Royal Rajasthan Heritage Tour',
    description: 'Step back in time and experience the grandeur of Rajasthan. Visit majestic forts, opulent palaces, and vibrant markets. This tour covers the Golden Triangle of Rajasthan: Jaipur, Jodhpur, and Udaipur.',
    duration: '8 Days / 7 Nights',
    days: 8,
    price: 35000,
    imageUrls: [
      '/images/Rajasthan/jaipur.jpg',
      '/images/Rajasthan/udaipur.jpg',
      '/images/Rajasthan/jodhpur.jpg',
      '/images/Rajasthan/jaisalmer.jpg'
    ],
    itineraries: [
      { day: 1, description: 'Arrival in Jaipur, the Pink City.' },
      { day: 2, description: 'Jaipur sightseeing: Amer Fort, Hawa Mahal.' },
      { day: 3, description: 'Drive to Jodhpur, the Blue City.' },
      { day: 4, description: 'Jodhpur sightseeing: Mehrangrah Fort, Jaswant Thada.' },
      { day: 5, description: 'Drive to Udaipur, the City of Lakes.' },
      { day: 6, description: 'Udaipur sightseeing: City Palace, Lake Pichola boat ride.' },
      { day: 7, description: 'Explore local markets of Udaipur.' },
      { day: 8, description: 'Departure from Udaipur.' },
    ],
    category: ['Royal', 'Cultural', 'Historical'],
    placeTags: ['Jaipur', 'Jodhpur', 'Udaipur'],
    attractionTags: ['Forts', 'Palaces', 'Culture'],
  },
  {
    title: 'Goa Beach Paradise',
    description: 'Soak up the sun and sand with our Goa Beach Paradise package. Enjoy the vibrant nightlife, pristine beaches, and thrilling water sports. Perfect for a relaxing getaway or a fun-filled vacation.',
    duration: '4 Days / 3 Nights',
    days: 4,
    price: 15000,
    imageUrls: [
      '/images/Goa/1370.jpg',
      '/images/Goa/2584.jpg',
      '/images/Goa/3681.jpg',
      '/images/Goa/panjim-church.jpg'
    ],
    itineraries: [
      { day: 1, description: 'Arrival in Goa, check into beach resort.' },
      { day: 2, description: 'North Goa tour: Calangute, Baga, Anjuna beaches.' },
      { day: 3, description: 'South Goa tour: Palolem, Colva beaches and Old Goa churches.' },
      { day: 4, description: 'Departure from Goa.' },
    ],
    category: ['Beach', 'Relaxation'],
    placeTags: ['North Goa', 'South Goa'],
    attractionTags: ['Beaches', 'Nightlife', 'Water Sports'],
  }
];

// Create tables
// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password TEXT NOT NULL,
      profileImageUrl TEXT,
      likedPackages TEXT -- JSON string
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created or already exists.');

      // Check if likedPackages column exists, if not add it
      db.all("PRAGMA table_info(users)", [], (err, columns) => {
        if (err) {
          console.error('Error checking users table info:', err);
        } else {
          const hasLikedPackages = columns.some(col => col.name === 'likedPackages');
          const hasPasswordResetOtp = columns.some(col => col.name === 'password_reset_otp');
          const hasOtpExpiry = columns.some(col => col.name === 'otp_expiry');
          const hasResetToken = columns.some(col => col.name === 'reset_token');

          if (!hasLikedPackages) {
            db.run("ALTER TABLE users ADD COLUMN likedPackages TEXT", (err) => {
              if (err) {
                console.error('Error adding likedPackages column to users:', err);
              } else {
                console.log('Added likedPackages column to users table.');
              }
            });
          }

          if (!hasPasswordResetOtp) {
            db.run("ALTER TABLE users ADD COLUMN password_reset_otp TEXT", (err) => {
              if (err) {
                console.error('Error adding password_reset_otp column:', err);
              } else {
                console.log('Added password_reset_otp column to users table.');
              }
            });
          }

          if (!hasOtpExpiry) {
            db.run("ALTER TABLE users ADD COLUMN otp_expiry TEXT", (err) => {
              if (err) {
                console.error('Error adding otp_expiry column:', err);
              } else {
                console.log('Added otp_expiry column to users table.');
              }
            });
          }

          if (!hasResetToken) {
            db.run("ALTER TABLE users ADD COLUMN reset_token TEXT", (err) => {
              if (err) {
                console.error('Error adding reset_token column:', err);
              } else {
                console.log('Added reset_token column to users table.');
              }
            });
          }
        }
      });
    }
  });

  // Packages table
  db.run(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      duration TEXT NOT NULL,
      days INTEGER NOT NULL,
      price REAL NOT NULL,
      imageUrls TEXT, -- JSON string
      itineraries TEXT, -- JSON string
      category TEXT NOT NULL,
      placeTags TEXT, -- JSON string
      attractionTags TEXT -- JSON string
    )
  `, (err) => {
    if (err) {
      console.error('Error creating packages table:', err.message);
    } else {
      console.log('Packages table created or already exists.');

      // Check if description column exists, if not add it
      db.all("PRAGMA table_info(packages)", [], (err, columns) => {
        if (err) {
          console.error('Error checking packages table info:', err);
        } else {
          const hasDescription = columns.some(col => col.name === 'description');
          if (!hasDescription) {
            db.run("ALTER TABLE packages ADD COLUMN description TEXT", (err) => {
              if (err) {
                console.error('Error adding description column to packages:', err);
              } else {
                console.log('Added description column to packages table.');
              }
            });
          }
        }
      });

      // Check if packages table is empty and insert initial data
      db.get('SELECT COUNT(*) as count FROM packages', [], (err, row) => {
        if (err) {
          console.error('Error checking packages count:', err.message);
        } else if (row.count === 0) {
          console.log('Inserting initial packages...');
          const stmt = db.prepare(`
            INSERT INTO packages (title, description, duration, days, price, imageUrls, itineraries, category, placeTags, attractionTags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          initialPackages.forEach(pkg => {
            stmt.run([
              pkg.title,
              pkg.description,
              pkg.duration,
              pkg.days,
              pkg.price,
              JSON.stringify(pkg.imageUrls),
              JSON.stringify(pkg.itineraries),
              JSON.stringify(pkg.category),
              JSON.stringify(pkg.placeTags),
              JSON.stringify(pkg.attractionTags)
            ]);
          });
          stmt.finalize(() => {
            console.log('Initial packages inserted.');
          });
        } else {
          console.log('Packages table already has data.');
        }
      });
    }
  });

  // Bookings table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      packageId TEXT NOT NULL,
      packageName TEXT NOT NULL,
      userEmail TEXT NOT NULL,
      userName TEXT NOT NULL,
      userMobile TEXT,
      travelers INTEGER NOT NULL,
      totalPrice REAL NOT NULL,
      bookingDate TEXT NOT NULL,
      status TEXT NOT NULL,
      userAddress TEXT,
      travelDate TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating bookings table:', err.message);
    } else {
      console.log('Bookings table created or already exists.');
      // Check if travelDate column exists, if not add it
      db.all("PRAGMA table_info(bookings)", [], (err, columns) => {
        if (err) {
          console.error('Error checking table info:', err);
        } else {
          const hasTravelDate = columns.some(col => col.name === 'travelDate');
          if (!hasTravelDate) {
            db.run("ALTER TABLE bookings ADD COLUMN travelDate TEXT", (err) => {
              if (err) {
                console.error('Error adding travelDate column:', err);
              } else {
                console.log('Added travelDate column to bookings table.');
              }
            });
          }
        }
      });
    }
  });
});

// API Routes
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }

    // Parse likedPackages JSON string
    const users = rows.map(user => ({
      ...user,
      likedPackages: user.likedPackages ? JSON.parse(user.likedPackages) : []
    }));

    res.json(users);
  });
});

app.post('/api/users', (req, res) => {
  const { username, email, phone, password, profileImageUrl } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const stmt = db.prepare(`
    INSERT INTO users (username, email, phone, password, profileImageUrl, likedPackages)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([username, email, phone, password, profileImageUrl, '[]'], function (err) {
    if (err) {
      console.error('Error inserting user:', err.message);
      return res.status(500).json({ error: 'Failed to create user.' });
    }

    res.status(201).json({
      id: this.lastID,
      username,
      email,
      phone,
      profileImageUrl,
      likedPackages: []
    });
  });

  stmt.finalize();
});

// Packages API Routes
app.get('/api/packages', (req, res) => {
  db.all('SELECT * FROM packages', [], (err, rows) => {
    if (err) {
      console.error('Error fetching packages:', err.message);
      return res.status(500).json({ error: 'Failed to fetch packages.' });
    }
    // Parse JSON strings back to objects
    const packages = rows.map(pkg => {
      let category = pkg.category;
      // Migration: Convert old single-category strings to arrays
      try {
        category = JSON.parse(pkg.category);
      } catch (e) {
        // If parsing fails, it's a string, convert to array
        category = [pkg.category];
      }

      return {
        ...pkg,
        id: pkg.id.toString(),
        // Optimize: Only send the first image for the list view to reduce payload size
        imageUrls: JSON.parse(pkg.imageUrls || '[]'),
        itineraries: JSON.parse(pkg.itineraries || '[]'),
        category: Array.isArray(category) ? category : [category],
        placeTags: JSON.parse(pkg.placeTags || '[]'),
        attractionTags: JSON.parse(pkg.attractionTags || '[]'),
      };
    });
    res.json(packages);
  });
});

app.get('/api/packages/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM packages WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching package:', err.message);
      return res.status(500).json({ error: 'Failed to fetch package.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    // Parse JSON strings back to objects
    let category = row.category;
    // Migration: Convert old single-category strings to arrays
    try {
      category = JSON.parse(row.category);
    } catch (e) {
      category = [row.category];
    }

    const pkg = {
      ...row,
      id: row.id.toString(),
      imageUrls: JSON.parse(row.imageUrls || '[]'),
      itineraries: JSON.parse(row.itineraries || '[]'),
      category: Array.isArray(category) ? category : [category],
      placeTags: JSON.parse(row.placeTags || '[]'),
      attractionTags: JSON.parse(row.attractionTags || '[]'),
    };

    res.json(pkg);
  });
});

app.post('/api/packages', (req, res) => {
  const { title, description, duration, days, price, imageUrls, itineraries, category, placeTags, attractionTags } = req.body;

  if (!title || !duration || !days || !price || !category) {
    return res.status(400).json({ error: 'Title, duration, days, price, and category are required.' });
  }

  // Validate category is an array and has max 3 items
  if (!Array.isArray(category)) {
    return res.status(400).json({ error: 'Category must be an array.' });
  }

  if (category.length === 0 || category.length > 3) {
    return res.status(400).json({ error: 'Category must have between 1 and 3 items.' });
  }

  const stmt = db.prepare(`
    INSERT INTO packages(title, description, duration, days, price, imageUrls, itineraries, category, placeTags, attractionTags)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

  stmt.run([
    title,
    description || '',
    duration,
    days,
    price,
    JSON.stringify(imageUrls || []),
    JSON.stringify(itineraries || []),
    JSON.stringify(category),
    JSON.stringify(placeTags || []),
    JSON.stringify(attractionTags || [])
  ], function (err) {
    if (err) {
      console.error('Error inserting package:', err.message);
      return res.status(500).json({ error: 'Failed to create package.' });
    }

    res.status(201).json({
      id: this.lastID,
      title,
      description,
      duration,
      days,
      price,
      imageUrls,
      itineraries,
      category,
      placeTags,
      attractionTags
    });
  });

  stmt.finalize();
});

// Bookings API Routes
app.get('/api/bookings', (req, res) => {
  db.all('SELECT * FROM bookings', [], (err, rows) => {
    if (err) {
      console.error('Error fetching bookings:', err.message);
      return res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
    // Parse userAddress JSON strings back to objects
    const bookings = rows.map(booking => ({
      ...booking,
      userAddress: JSON.parse(booking.userAddress || '{}'),
    }));
    res.json(bookings);
  });
});

app.post('/api/bookings', (req, res) => {
  const { packageId, packageName, userEmail, userName, userMobile, travelers, totalPrice, userAddress, travelDate } = req.body;

  if (!packageId || !packageName || !userEmail || !userName || !travelers || !totalPrice) {
    return res.status(400).json({ error: 'Package ID, name, user email, name, travelers, and total price are required.' });
  }

  const bookingId = `B - ${Date.now()}`;
  const bookingDate = new Date().toISOString();
  const status = 'Pending';

  const stmt = db.prepare(`
    INSERT INTO bookings(id, packageId, packageName, userEmail, userName, userMobile, travelers, totalPrice, bookingDate, status, userAddress, travelDate)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

  stmt.run([
    bookingId,
    packageId,
    packageName,
    userEmail,
    userName,
    userMobile,
    travelers,
    totalPrice,
    bookingDate,
    status,
    JSON.stringify(userAddress || {}),
    travelDate
  ], function (err) {
    if (err) {
      console.error('Error inserting booking:', err.message);
      return res.status(500).json({ error: 'Failed to create booking.' });
    }

    res.status(201).json({
      id: bookingId,
      packageId,
      packageName,
      userEmail,
      userName,
      userMobile,
      travelers,
      totalPrice,
      bookingDate,
      status,
      userAddress,
      travelDate
    });
  });

  stmt.finalize();
});

app.put('/api/packages/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, duration, days, price, imageUrls, itineraries, category, placeTags, attractionTags } = req.body;

  if (!title || !duration || !days || !price || !category) {
    return res.status(400).json({ error: 'Title, duration, days, price, and category are required.' });
  }

  // Validate category is an array and has max 3 items
  if (!Array.isArray(category)) {
    return res.status(400).json({ error: 'Category must be an array.' });
  }

  if (category.length === 0 || category.length > 3) {
    return res.status(400).json({ error: 'Category must have between 1 and 3 items.' });
  }

  const stmt = db.prepare(`
    UPDATE packages SET
      title = ?,
      description = ?,
      duration = ?,
      days = ?,
      price = ?,
      imageUrls = ?,
      itineraries = ?,
      category = ?,
      placeTags = ?,
      attractionTags = ?
    WHERE id = ?
  `);

  stmt.run([
    title,
    description || '',
    duration,
    days,
    price,
    JSON.stringify(imageUrls || []),
    JSON.stringify(itineraries || []),
    JSON.stringify(category),
    JSON.stringify(placeTags || []),
    JSON.stringify(attractionTags || []),
    id
  ], function (err) {
    if (err) {
      console.error('Error updating package:', err.message);
      return res.status(500).json({ error: 'Failed to update package.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    res.json({
      id: id.toString(),
      title,
      description,
      duration,
      days,
      price,
      imageUrls,
      itineraries,
      category,
      placeTags,
      attractionTags
    });
  });

  stmt.finalize();
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, phone, password, profileImageUrl, likedPackages } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const stmt = db.prepare(`
    UPDATE users SET
      username = ?,
      email = ?,
      phone = ?,
      password = ?,
      profileImageUrl = ?,
      likedPackages = ?
    WHERE id = ?
  `);

  stmt.run([username, email, phone, password, profileImageUrl, JSON.stringify(likedPackages || []), id], function (err) {
    if (err) {
      console.error('Error updating user:', err.message);
      return res.status(500).json({ error: 'Failed to update user.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      id: id.toString(),
      username,
      email,
      phone,
      profileImageUrl,
      likedPackages: likedPackages || []
    });
  });

  stmt.finalize();
});

app.delete('/api/packages/:id', (req, res) => {
  const { id } = req.params;

  // First, delete all bookings associated with this package
  const deleteBookingsStmt = db.prepare('DELETE FROM bookings WHERE packageId = ?');
  deleteBookingsStmt.run([id], function (err) {
    if (err) {
      console.error('Error deleting bookings for package:', err.message);
      return res.status(500).json({ error: 'Failed to delete associated bookings.' });
    }

    // Now delete the package
    const deletePackageStmt = db.prepare('DELETE FROM packages WHERE id = ?');
    deletePackageStmt.run([id], function (err) {
      if (err) {
        console.error('Error deleting package:', err.message);
        return res.status(500).json({ error: 'Failed to delete package.' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Package not found.' });
      }

      res.json({ message: 'Package and associated bookings deleted successfully.' });
    });

    deletePackageStmt.finalize();
  });

  deleteBookingsStmt.finalize();
});

app.put('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const stmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');

  stmt.run([status, id], function (err) {
    if (err) {
      console.error('Error updating booking status:', err.message);
      return res.status(500).json({ error: 'Failed to update booking status.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ message: 'Booking status updated successfully.' });
  });

  stmt.finalize();
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');

  stmt.run([id], function (err) {
    if (err) {
      console.error('Error deleting booking:', err.message);
      return res.status(500).json({ error: 'Failed to delete booking.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ message: 'Booking deleted successfully.' });
  });

  stmt.finalize();
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  // First, delete all bookings associated with this user
  const deleteBookingsStmt = db.prepare('DELETE FROM bookings WHERE userEmail = (SELECT email FROM users WHERE id = ?)');
  deleteBookingsStmt.run([id], function (err) {
    if (err) {
      console.error('Error deleting bookings for user:', err.message);
      return res.status(500).json({ error: 'Failed to delete associated bookings.' });
    }

    // Now delete the user
    const deleteUserStmt = db.prepare('DELETE FROM users WHERE id = ?');
    deleteUserStmt.run([id], function (err) {
      if (err) {
        console.error('Error deleting user:', err.message);
        return res.status(500).json({ error: 'Failed to delete user.' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json({ message: 'User and associated bookings deleted successfully.' });
    });

    deleteUserStmt.finalize();
  });

  deleteBookingsStmt.finalize();
});

// Forgot Password API Endpoints

// 1. Request Password Reset (Send OTP)
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please enter your email address' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Check if email exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'This email is not registered with us' });
    }

    // Generate temporary OTP (123456 for testing)
    const otp = '123456';
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Store OTP in database
    const stmt = db.prepare('UPDATE users SET password_reset_otp = ?, otp_expiry = ? WHERE email = ?');
    stmt.run([otp, otpExpiry, email], function (err) {
      if (err) {
        console.error('Error storing OTP:', err);
        return res.status(500).json({ error: 'Failed to send OTP' });
      }

      // Fake email sent message
      res.json({
        message: 'OTP sent to your email! (Check inbox/spam)',
        email: email
      });
    });
    stmt.finalize();
  });
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP matches
    if (user.password_reset_otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again' });
    }

    // Check if OTP has expired
    const now = new Date();
    const expiry = new Date(user.otp_expiry);
    if (now > expiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one' });
    }

    // Generate reset token
    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store reset token
    const stmt = db.prepare('UPDATE users SET reset_token = ?, otp_expiry = ? WHERE email = ?');
    stmt.run([resetToken, tokenExpiry, email], function (err) {
      if (err) {
        console.error('Error storing reset token:', err);
        return res.status(500).json({ error: 'Verification failed' });
      }

      res.json({
        message: 'OTP verified successfully!',
        resetToken: resetToken
      });
    });
    stmt.finalize();
  });
});

// 3. Reset Password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify reset token
    if (user.reset_token !== resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token has expired
    const now = new Date();
    const expiry = new Date(user.otp_expiry);
    if (now > expiry) {
      return res.status(400).json({ error: 'Reset token has expired. Please start over' });
    }

    // Update password and clear OTP/token
    const stmt = db.prepare('UPDATE users SET password = ?, password_reset_otp = NULL, otp_expiry = NULL, reset_token = NULL WHERE email = ?');
    stmt.run([newPassword, email], function (err) {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ error: 'Failed to reset password' });
      }

      res.json({
        message: 'Password reset successful! Please login with your new password'
      });
    });
    stmt.finalize();
  });
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDSJLFdgYvQSJbTCUXBRWHHBWOSJnPKKfg');

// Initialize OpenAI (ChatGPT)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// AI Trip Planner Endpoint
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('AI Request received:', prompt);

    // Fetch all packages
    db.all('SELECT * FROM packages', async (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch packages' });
      }

      const packages = rows.map(pkg => {
        let category = pkg.category;
        try {
          category = JSON.parse(pkg.category);
        } catch (e) {
          category = [pkg.category];
        }

        return {
          id: pkg.id.toString(),
          title: pkg.title,
          description: pkg.description,
          price: pkg.price,
          days: pkg.days,
          category: Array.isArray(category) ? category : [category],
          imageUrls: JSON.parse(pkg.imageUrls || '[]'),
          imageUrl: pkg.imageUrl || '',
          itineraries: JSON.parse(pkg.itineraries || '[]'),
          placeTags: JSON.parse(pkg.placeTags || '[]'),
          attractionTags: JSON.parse(pkg.attractionTags || '[]'),
        };
      });

      console.log('Total packages:', packages.length);

      try {
        // Use OpenAI ChatGPT-4 for superior conversational accuracy
        const historyText = req.body.history
          ? req.body.history.map(msg => `${msg.type.toUpperCase()}: ${msg.content}`).join('\n')
          : '';

        const systemPrompt = `You are an expert travel assistant for BharatYatra with COMPLETE knowledge of all package details.

COMPLETE PACKAGE DATABASE:
${packages.map(p => {
          const itinerary = p.itineraries.map(day => `Day ${day.day}: ${day.description}`).join('; ');
          return `[ID: ${p.id}] "${p.title}"
  - Price: ₹${p.price} | Duration: ${p.days} days
  - Description: ${p.description}
  - Categories: ${p.category.join(', ')}
  - Places: ${p.placeTags.join(', ')}
  - Attractions: ${p.attractionTags.join(', ')}
  - Full Itinerary: ${itinerary}`;
        }).join('\n\n')}

CRITICAL RULE - READ CAREFULLY:
You must distinguish between INFORMATIONAL QUESTIONS and PACKAGE REQUESTS.

**INFORMATIONAL QUESTIONS** (Answer WITHOUT showing packages):
- "Tell me about Goa" → Answer about Goa + Ask "Would you like to see packages?" + recommendedPackageIds: []
- "What's the best time to visit Kerala?" → Answer + Ask if they want packages + recommendedPackageIds: []
- "Is Rajasthan good for families?" → Answer + Offer to show packages + recommendedPackageIds: []

**PACKAGE REQUESTS** (NOW show packages):
- "Show me Goa packages" → Show packages + recommendedPackageIds: ["1", "2"]
- "Yes, show me" (after you offered) → Show packages + recommendedPackageIds: ["1", "2"]
- "I want to see Kerala trips" → Show packages + recommendedPackageIds: ["1"]

CONVERSATION FLOW:
Step 1: User asks "Tell me about X" → You answer about X + offer packages
Step 2: User says "Yes" or "Show me" → You show packages

DO NOT SKIP STEP 1. Always answer the question FIRST before showing packages.

JSON FORMAT:
{
  "response": "Your answer...",
  "recommendedPackageIds": [] // ONLY add IDs if user EXPLICITLY asks to see/show packages
}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `CONVERSATION HISTORY:\n${historyText}\n\nUSER: "${prompt}"` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const text = completion.choices[0].message.content;
        console.log('ChatGPT raw response:', text);

        const aiResponse = JSON.parse(text);

        // Get full package details for recommended IDs
        const recommendedPackages = packages.filter(p =>
          aiResponse.recommendedPackageIds && aiResponse.recommendedPackageIds.includes(p.id)
        );

        res.json({
          response: aiResponse.response,
          packages: recommendedPackages
        });

      } catch (aiError) {
        console.error('ChatGPT API error, using Gemini fallback:', aiError);

        // FALLBACK: Use Gemini 2.0 Flash - Most accurate Gemini model
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

          const historyText = req.body.history
            ? req.body.history.map(msg => `${msg.type.toUpperCase()}: ${msg.content}`).join('\n')
            : '';

          const geminiPrompt = `You are an expert travel assistant for BharatYatra. You have COMPLETE knowledge of all packages.

PACKAGE DATABASE:
${packages.map(p => {
            const itinerary = p.itineraries.map(day => `Day ${day.day}: ${day.description}`).join('; ');
            return `[ID: ${p.id}] "${p.title}" - ₹${p.price} (${p.days} days)
Categories: ${p.category.join(', ')} | Places: ${p.placeTags.join(', ')}
Itinerary: ${itinerary}`;
          }).join('\n\n')}

CONVERSATION HISTORY:
${historyText}

USER: "${prompt}"

CRITICAL INSTRUCTIONS:
1. If user asks INFORMATIONAL question ("Tell me about Goa", "What's Kerala like?"):
   - Answer the question
   - Then ask: "Would you like to see our packages?"
   - Return recommendedPackageIds: []

2. If user REQUESTS packages ("Show me packages", "Yes show me", "I want to see trips"):
   - Return package IDs in recommendedPackageIds

3. NEVER show packages for informational questions
4. Keep responses 2-3 sentences

Return ONLY valid JSON:
{
  "response": "Your answer here",
  "recommendedPackageIds": []
}`;

          const result = await model.generateContent(geminiPrompt);
          const text = result.response.text();

          console.log('Gemini fallback response:', text);

          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('Invalid Gemini response');
          }

          const aiResponse = JSON.parse(jsonMatch[0]);
          const recommendedPackages = packages.filter(p =>
            aiResponse.recommendedPackageIds && aiResponse.recommendedPackageIds.includes(p.id)
          );

          return res.json({
            response: aiResponse.response,
            packages: recommendedPackages
          });

        } catch (geminiError) {
          console.error('Gemini also failed, using keyword fallback:', geminiError);

          // SMART FALLBACK: Handle Greetings Locally if AI Fails
          const lowerPrompt = prompt.toLowerCase().trim();
          const greetings = ["hi", "hello", "hey", "greetings", "good morning", "good evening", "namaste"];

          if (greetings.some(w => lowerPrompt.startsWith(w)) && lowerPrompt.split(' ').length < 3) {
            return res.json({
              response: "Namaste! 🙏 Welcome to BharatYatra. I'm your AI travel companion. Tell me, where does your heart want to go today? (Mountains, Beaches, Temple run...?)",
              packages: []
            });
          }

          // Standard Keyword Fallback
          const keywords = lowerPrompt
            .replace(/zdventure/g, 'adventure')
            .replace(/beech/g, 'beach')
            .replace(/mountin/g, 'mountain')
            .replace(/famly/g, 'family');

          const matchedPackages = packages.filter(p => {
            const searchText = `${p.title} ${p.description} ${p.category.join(' ')} `.toLowerCase();
            const keywordList = keywords.split(' ');
            return keywordList.some(keyword =>
              keyword.length > 2 && searchText.includes(keyword)
            );
          }).slice(0, 5);

          res.json({
            response: matchedPackages.length > 0
              ? `I found ${matchedPackages.length} packages that might interest you!`
              : "I can help you plan the perfect trip! Could you tell me a bit more about what you're looking for? (e.g., 'Honeymoon in Kerala' or 'Budget trip to Goa')",
            packages: matchedPackages.length > 0 ? matchedPackages : []
          });
        }
      }
    });

  } catch (error) {
    console.error('Error in AI recommendation:', error);
    res.status(500).json({ error: 'Failed to process AI recommendation' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
