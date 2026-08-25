const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'trips.json');

function normalizeKey(name) {
  return String(name || '').trim().toLowerCase();
}

function readTrips() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to read trips:', e);
    return {};
  }
}

function writeTrips(trips) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(trips, null, 2));
}

function publicTrip(trip) {
  // never send the password back to the client
  const { password, ...rest } = trip;
  return rest;
}

app.use(express.json());
app.set('etag', false);
app.use(express.static(path.join(__dirname, 'public')));

// Create a new trip. Fails if the name is already taken.
app.post('/api/trip/create', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { tripName, password } = req.body || {};
  if (!tripName || !tripName.trim() || !password) {
    return res.status(400).json({ error: 'Trip name and password are required' });
  }
  const key = normalizeKey(tripName);
  const trips = readTrips();
  if (trips[key]) {
    return res.status(409).json({ error: 'A trip with that name already exists. Try logging in instead.' });
  }
  trips[key] = {
    tripName: tripName.trim(),
    password: String(password),
    friends: [],
    expenses: [],
  };
  writeTrips(trips);
  res.json({ tripKey: key, trip: publicTrip(trips[key]) });
});

// Log into an existing trip.
app.post('/api/trip/login', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { tripName, password } = req.body || {};
  if (!tripName || !password) {
    return res.status(400).json({ error: 'Trip name and password are required' });
  }
  const key = normalizeKey(tripName);
  const trips = readTrips();
  const trip = trips[key];
  if (!trip) {
    return res.status(404).json({ error: 'No trip found with that name' });
  }
  if (trip.password !== String(password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  res.json({ tripKey: key, trip: publicTrip(trip) });
});

function checkAuth(req, res, trips) {
  const key = normalizeKey(req.params.tripKey);
  const trip = trips[key];
  const password = req.get('x-trip-password');
  if (!trip) {
    res.status(404).json({ error: 'Trip not found' });
    return null;
  }
  if (trip.password !== String(password || '')) {
    res.status(401).json({ error: 'Incorrect password' });
    return null;
  }
  return key;
}

// Get the current state of a specific trip (requires password header).
app.get('/api/trip/:tripKey', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const trips = readTrips();
  const key = checkAuth(req, res, trips);
  if (!key) return;
  res.json(publicTrip(trips[key]));
});

// Save the current state of a specific trip (requires password header).
app.put('/api/trip/:tripKey', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const trips = readTrips();
  const key = checkAuth(req, res, trips);
  if (!key) return;
  const body = req.body || {};
  if (typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  trips[key] = {
    ...trips[key],
    tripName: body.tripName || trips[key].tripName,
    friends: Array.isArray(body.friends) ? body.friends : trips[key].friends,
    expenses: Array.isArray(body.expenses) ? body.expenses : trips[key].expenses,
  };
  writeTrips(trips);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Trip ledger running on port ${PORT}`);
});
