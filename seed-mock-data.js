import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data from mock.ts
const experiences = [
  {
    id: "diani-beach",
    title: "Diani Beach Paradise",
    location: "Diani Beach, Kenya",
    category: "Beaches",
    price: 145,
    rating: 4.9,
    reviews: 184,
    duration: "6 hours",
    image: "/images/beach.jfif",
    tags: ["Sunset", "Photography", "Local guide"],
    description: "Relax on powdery shores, enjoy a guided beach walk, and watch the coastline glow at golden hour.",
    host: "Diani Coast Guides",
    capacity: 8,
  },
  {
    id: "lamu-swahili-heritage",
    title: "Lamu Swahili Heritage Walk",
    location: "Lamu Old Town, Kenya",
    category: "Culture",
    price: 48,
    rating: 4.8,
    reviews: 96,
    duration: "3 hours",
    image: "/images/shanga.jfif",
    tags: ["UNESCO", "Architecture", "Food tasting"],
    description: "Explore carved doors, seafront markets, old mosques, and family-run food stops through the living history of Lamu.",
    host: "Lamu Story Guides",
    capacity: 10,
  },
  {
    id: "amboseli-elephant-hide",
    title: "Amboseli Elephant Hideout",
    location: "Kajiado County, Kenya",
    category: "Wildlife",
    price: 210,
    rating: 4.95,
    reviews: 121,
    duration: "Full day",
    image: "/images/sea.jfif",
    tags: ["Elephants", "Kilimanjaro views", "Conservation"],
    description: "Spend a day near Amboseli's wetlands learning elephant behavior and conservation practices from field researchers.",
    host: "Savanna Research Camp",
    capacity: 8,
  },
  {
    id: "diani-reef-kayak",
    title: "Diani Reef Kayak and Snorkel",
    location: "Kwale County, Kenya",
    category: "Coast",
    price: 86,
    rating: 4.7,
    reviews: 73,
    duration: "4 hours",
    image: "/images/snorkeling-underwater-diver-ocean.avif",
    tags: ["Ocean", "Beginner friendly", "Marine life"],
    description: "Paddle calm reef channels, snorkel protected coral gardens, and return for a fresh coastal lunch.",
    host: "Diani Blue Guides",
    capacity: 12,
  },
  {
    id: "thompson-falls-escape",
    title: "Thompson Falls Escape",
    location: "Nyahururu, Kenya",
    category: "Adventure",
    price: 74,
    rating: 4.8,
    reviews: 67,
    duration: "5 hours",
    image: "/images/thompson water falls.jfif",
    tags: ["Waterfalls", "Hiking", "Nature"],
    description: "Take a scenic walk to the waterfall lookout, enjoy picnic views, and capture dramatic landscapes with your guide.",
    host: "Highland Trails Kenya",
    capacity: 10,
  },
];

const events = [
  {
    id: "sunset-beach-bonfire",
    title: "Sunset Beach Bonfire",
    date: "Aug 16, 2026",
    location: "Diani Beach",
    image: "/images/beach.jfif",
    description: "Live acoustic sets, lantern-lit dining, and coastal stargazing.",
  },
  {
    id: "museum-night-tour",
    title: "Museum Night Tour",
    date: "Aug 22, 2026",
    location: "Nairobi",
    image: "/images/museum.jfif",
    description: "Evening entry to heritage halls, local storytellers, and guided exhibits.",
  },
  {
    id: "swahili-evening-market",
    title: "Swahili Evening Market",
    date: "Aug 29, 2026",
    location: "Lamu",
    image: "/images/shanga.jfif",
    description: "Street food, artisan stalls, and music along the old harbor.",
  },
];

async function seedData() {
  console.log("Starting seed process...");

  // Try to write to firestore directly. If rules block it, we will catch the error.
  try {
    for (const exp of experiences) {
      await setDoc(doc(db, "experiences", exp.id), exp);
      console.log("Added experience: " + exp.title);
    }
    for (const ev of events) {
      await setDoc(doc(db, "events", ev.id), ev);
      console.log("Added event: " + ev.title);
    }
    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err.message);
    console.log("You might need to temporarily change Firestore rules to allow writes or run this using Firebase Admin SDK.");
    process.exit(1);
  }
}

seedData();
