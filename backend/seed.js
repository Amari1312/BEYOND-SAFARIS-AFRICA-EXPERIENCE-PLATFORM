const admin = require('firebase-admin');

// Initialize admin SDK. It will use GOOGLE_APPLICATION_CREDENTIALS if set,
// otherwise it will try Application Default Credentials.
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS))
    });
  } else {
    admin.initializeApp();
  }
} catch (e) {
  console.error('Failed to initialize Firebase Admin:', e.message);
  process.exit(1);
}

const db = admin.firestore();

async function seed() {
  try {
    // Users
    const users = [
      {
        id: 'user_tourist_1',
        fullName: 'Alice Tourist',
        email: 'alice.tourist@example.com',
        role: 'tourist',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'user_owner_1',
        fullName: 'Bob Owner',
        email: 'bob.owner@example.com',
        role: 'businessOwner',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 'user_admin_1',
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const u of users) {
      await db.collection('users').doc(u.id).set(u);
    }

    // Businesses
    const businesses = [
      {
        id: 'business_1',
        ownerId: 'user_owner_1',
        name: 'Safari Adventures Ltd',
        verified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const b of businesses) {
      await db.collection('businesses').doc(b.id).set(b);
    }

    // Experiences
    const experiences = [
      {
        id: 'experience_1',
        businessId: 'business_1',
        title: 'Masai Mara Day Trip',
        category: 'wildlife',
        county: 'Nairobi',
        geoPoint: new admin.firestore.GeoPoint(-1.2921, 36.8219),
        price: 120.0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const e of experiences) {
      await db.collection('experiences').doc(e.id).set(e);
    }

    // Events
    const events = [
      {
        id: 'event_1',
        experienceId: 'experience_1',
        name: 'Full Moon Night Safari',
        eventDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 3600 * 1000))
      }
    ];

    for (const ev of events) {
      await db.collection('events').doc(ev.id).set(ev);
    }

    // Trips
    const trips = [
      {
        id: 'trip_1',
        userId: 'user_tourist_1',
        title: 'Weekend Wildlife',
        startDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 3600 * 1000)),
        stops: ['experience_1']
      }
    ];

    for (const t of trips) await db.collection('trips').doc(t.id).set(t);

    // Bookings
    const bookings = [
      {
        id: 'booking_1',
        userId: 'user_tourist_1',
        experienceId: 'experience_1',
        status: 'pending',
        totalAmount: 120.0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const b of bookings) await db.collection('bookings').doc(b.id).set(b);

    // Payments
    const payments = [
      {
        id: 'payment_1',
        bookingId: 'booking_1',
        userId: 'user_tourist_1',
        amount: 120.0,
        method: 'mpesa',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const p of payments) await db.collection('payments').doc(p.id).set(p);

    // Reviews
    const reviews = [
      {
        id: 'review_1',
        userId: 'user_tourist_1',
        experienceId: 'experience_1',
        rating: 5,
        comment: 'Amazing experience!',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const r of reviews) await db.collection('reviews').doc(r.id).set(r);

    // Ratings (separate collection if needed)
    const ratings = [
      {
        id: 'rating_1',
        userId: 'user_tourist_1',
        experienceId: 'experience_1',
        value: 5,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const r of ratings) await db.collection('ratings').doc(r.id).set(r);

    // Notifications
    const notifications = [
      {
        id: 'notif_1',
        userId: 'user_tourist_1',
        title: 'Booking pending',
        message: 'Your booking booking_1 is pending confirmation.',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const n of notifications) await db.collection('notifications').doc(n.id).set(n);

    // AI Recommendations
    const recs = [
      {
        id: 'rec_1',
        userId: 'user_tourist_1',
        recommendations: ['experience_1'],
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const r of recs) await db.collection('aiRecommendations').doc(r.id).set(r);

    // Visits
    const visits = [
      {
        id: 'visit_1',
        userId: 'user_tourist_1',
        experienceId: 'experience_1',
        visitedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const v of visits) await db.collection('visits').doc(v.id).set(v);

    // Badges
    const badges = [
      {
        id: 'badge_1',
        name: 'First Booking',
        criteria: 'make_first_booking'
      }
    ];

    for (const b of badges) await db.collection('badges').doc(b.id).set(b);

    // Wishlists
    const wishlists = [
      {
        id: 'wishlist_1',
        userId: 'user_tourist_1',
        items: ['experience_1'],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const w of wishlists) await db.collection('wishlists').doc(w.id).set(w);

    // ChatSessions
    const chats = [
      {
        id: 'chat_1',
        participants: ['user_tourist_1', 'user_owner_1'],
        messages: [
          {
            sender: 'user_tourist_1',
            text: 'Hello, is this experience available?',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const c of chats) await db.collection('chatSessions').doc(c.id).set(c);

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(2);
  }
}

seed();
