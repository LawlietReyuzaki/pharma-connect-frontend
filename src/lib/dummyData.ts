/* ── Dummy data for testing when backend is unavailable ── */

export interface DummyPharmacy {
  id: number;
  name: string;
  slug: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  avg_rating: number;
  review_count: number;
  doctor_count: number;
  pharmacy_photo_path?: string;
  owner_photo_path?: string;
  owner_name: string;
  theme_key: string;
  status: string;
  operating_hours: string;
  license_number: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
}

export interface DummyDoctor {
  id: number;
  name: string;
  specialization: string;
  experience_years: number;
  qualification: string;
  fee: number;
}

export interface DummyReview {
  id: number;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
  owner_reply?: string;
}

export const DUMMY_PHARMACIES: DummyPharmacy[] = [
  {
    id: 1,
    name: "Red Dot Pharmacy",
    slug: "red-dot-pharmacy",
    city: "Islamabad",
    province: "ICT",
    address: "G-11 Markaz, Shop #4",
    phone: "0311-1234567",
    email: "info@reddotpharmacy.pk",
    avg_rating: 4.8,
    review_count: 124,
    doctor_count: 5,
    pharmacy_photo_path: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=70",
    owner_photo_path: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&q=70",
    owner_name: "Dr. Ahmed Khan",
    theme_key: "theme-crimson",
    status: "approved",
    operating_hours: "9:00 AM - 11:00 PM",
    license_number: "PB-ISB-2024-0042",
    latitude: 33.6844,
    longitude: 73.0479,
  },
  {
    id: 2,
    name: "MedCare Plus",
    slug: "medcare-plus",
    city: "Islamabad",
    province: "ICT",
    address: "F-10 Markaz, Plaza 7",
    phone: "0321-9876543",
    email: "contact@medcareplus.pk",
    avg_rating: 4.5,
    review_count: 87,
    doctor_count: 3,
    pharmacy_photo_path: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=70",
    owner_photo_path: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=70",
    owner_name: "Dr. Fatima Noor",
    theme_key: "theme-emerald",
    status: "approved",
    operating_hours: "8:00 AM - 10:00 PM",
    license_number: "PB-ISB-2024-0078",
    latitude: 33.6950,
    longitude: 73.0169,
  },
  {
    id: 3,
    name: "HealthFirst Pharmacy",
    slug: "healthfirst-pharmacy",
    city: "Rawalpindi",
    province: "Punjab",
    address: "Saddar, Commercial Market",
    phone: "0333-5551234",
    email: "hello@healthfirst.pk",
    avg_rating: 4.3,
    review_count: 56,
    doctor_count: 4,
    pharmacy_photo_path: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&q=70",
    owner_photo_path: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&q=70",
    owner_name: "Dr. Usman Ali",
    theme_key: "theme-violet",
    status: "approved",
    operating_hours: "24 Hours",
    license_number: "PB-RWP-2023-0156",
    latitude: 33.5651,
    longitude: 73.0169,
  },
  {
    id: 4,
    name: "City Care Pharmacy",
    slug: "city-care-pharmacy",
    city: "Islamabad",
    province: "ICT",
    address: "Blue Area, Jinnah Avenue",
    phone: "0345-7778899",
    email: "info@citycarepharmacy.pk",
    avg_rating: 4.6,
    review_count: 93,
    doctor_count: 6,
    pharmacy_photo_path: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&q=70",
    owner_photo_path: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&q=70",
    owner_name: "Dr. Bilal Shaikh",
    theme_key: "theme-sky",
    status: "approved",
    operating_hours: "9:00 AM - 12:00 AM",
    license_number: "PB-ISB-2024-0201",
    latitude: 33.7104,
    longitude: 73.0581,
  },
  {
    id: 5,
    name: "Al-Shifa Medical Store",
    slug: "al-shifa-medical",
    city: "Lahore",
    province: "Punjab",
    address: "Gulberg III, Main Boulevard",
    phone: "0300-1112233",
    email: "alshifa@pharmacy.pk",
    avg_rating: 4.2,
    review_count: 45,
    doctor_count: 2,
    pharmacy_photo_path: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=70",
    owner_photo_path: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&q=70",
    owner_name: "Haji Muhammad Aslam",
    theme_key: "theme-amber",
    status: "approved",
    operating_hours: "8:00 AM - 11:00 PM",
    license_number: "PB-LHR-2023-0312",
    latitude: 31.5204,
    longitude: 74.3587,
  },
  {
    id: 6,
    name: "Green Crescent Pharmacy",
    slug: "green-crescent-pharmacy",
    city: "Karachi",
    province: "Sindh",
    address: "Clifton, Block 5",
    phone: "0312-4445566",
    email: "info@greencrescent.pk",
    avg_rating: 4.7,
    review_count: 112,
    doctor_count: 7,
    pharmacy_photo_path: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&q=70",
    owner_photo_path: "https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=150&q=70",
    owner_name: "Dr. Sara Malik",
    theme_key: "theme-teal",
    status: "approved",
    operating_hours: "24 Hours",
    license_number: "PB-KHI-2024-0089",
    latitude: 24.8607,
    longitude: 67.0011,
  },
];

export const DUMMY_DOCTORS: DummyDoctor[] = [
  { id: 1, name: "Dr. Ahmed Khan", specialization: "General Physician", experience_years: 12, qualification: "MBBS, FCPS", fee: 1500 },
  { id: 2, name: "Dr. Ayesha Siddiqui", specialization: "Dermatologist", experience_years: 8, qualification: "MBBS, MCPS Dermatology", fee: 2000 },
  { id: 3, name: "Dr. Hassan Raza", specialization: "Cardiologist", experience_years: 15, qualification: "MBBS, FCPS Cardiology", fee: 2500 },
  { id: 4, name: "Dr. Maryam Nawaz", specialization: "Pediatrician", experience_years: 10, qualification: "MBBS, DCH", fee: 1800 },
  { id: 5, name: "Dr. Faisal Mahmood", specialization: "Orthopedic Surgeon", experience_years: 18, qualification: "MBBS, MS Ortho", fee: 3000 },
];

export const DUMMY_REVIEWS: DummyReview[] = [
  { id: 1, rating: 5, comment: "Excellent pharmacy! Very professional staff and fast delivery. Highly recommended.", user_name: "Ali Hassan", created_at: "2025-12-15T10:30:00Z" },
  { id: 2, rating: 4, comment: "Good service, medicines are always available. The AI assistant was very helpful.", user_name: "Sana Fatima", created_at: "2025-11-20T14:00:00Z" },
  { id: 3, rating: 5, comment: "Best pharmacy in G-11. Dr. Ahmed is very knowledgeable and caring.", user_name: "Muhammad Usman", created_at: "2025-10-05T09:15:00Z", owner_reply: "Thank you for your kind words! We strive to provide the best care." },
  { id: 4, rating: 4, comment: "Quick delivery and genuine medicines. Will use again.", user_name: "Zara Iqbal", created_at: "2025-09-18T16:45:00Z" },
  { id: 5, rating: 3, comment: "Decent pharmacy, but sometimes out of stock on certain medications.", user_name: "Imran Malik", created_at: "2025-08-30T11:20:00Z", owner_reply: "We apologize for the inconvenience. We're working on improving our stock management." },
];

export const DUMMY_CITIES = [
  { name: "Islamabad", count: 3 },
  { name: "Rawalpindi", count: 1 },
  { name: "Lahore", count: 1 },
  { name: "Karachi", count: 1 },
];
