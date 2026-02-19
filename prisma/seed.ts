import { PrismaClient, Role, AdProvider } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// ── Timezones ─────────────────────────────────────────
const TIMEZONES = [
  { ianaName: 'America/New_York', label: 'Eastern Time', region: 'North America' },
  { ianaName: 'America/Chicago', label: 'Central Time', region: 'North America' },
  { ianaName: 'America/Denver', label: 'Mountain Time', region: 'North America' },
  { ianaName: 'America/Los_Angeles', label: 'Pacific Time', region: 'North America' },
  { ianaName: 'America/Anchorage', label: 'Alaska Time', region: 'North America' },
  { ianaName: 'Pacific/Honolulu', label: 'Hawaii Time', region: 'North America' },
  { ianaName: 'America/Phoenix', label: 'Arizona Time', region: 'North America' },
  { ianaName: 'America/Toronto', label: 'Eastern Time (Canada)', region: 'North America' },
  { ianaName: 'America/Vancouver', label: 'Pacific Time (Canada)', region: 'North America' },
  { ianaName: 'America/Edmonton', label: 'Mountain Time (Canada)', region: 'North America' },
  { ianaName: 'America/Winnipeg', label: 'Central Time (Canada)', region: 'North America' },
  { ianaName: 'America/Halifax', label: 'Atlantic Time (Canada)', region: 'North America' },
  { ianaName: 'America/St_Johns', label: 'Newfoundland Time', region: 'North America' },
  { ianaName: 'America/Mexico_City', label: 'Central Time (Mexico)', region: 'North America' },
  { ianaName: 'America/Bogota', label: 'Colombia Time', region: 'South America' },
  { ianaName: 'America/Lima', label: 'Peru Time', region: 'South America' },
  { ianaName: 'America/Santiago', label: 'Chile Time', region: 'South America' },
  { ianaName: 'America/Sao_Paulo', label: 'Brasilia Time', region: 'South America' },
  { ianaName: 'America/Argentina/Buenos_Aires', label: 'Argentina Time', region: 'South America' },
  { ianaName: 'America/Caracas', label: 'Venezuela Time', region: 'South America' },
  { ianaName: 'Europe/London', label: 'Greenwich Mean Time', region: 'Europe' },
  { ianaName: 'Europe/Dublin', label: 'Irish Standard Time', region: 'Europe' },
  { ianaName: 'Europe/Lisbon', label: 'Western European Time', region: 'Europe' },
  { ianaName: 'Europe/Paris', label: 'Central European Time', region: 'Europe' },
  { ianaName: 'Europe/Berlin', label: 'Central European Time (DE)', region: 'Europe' },
  { ianaName: 'Europe/Madrid', label: 'Central European Time (ES)', region: 'Europe' },
  { ianaName: 'Europe/Rome', label: 'Central European Time (IT)', region: 'Europe' },
  { ianaName: 'Europe/Amsterdam', label: 'Central European Time (NL)', region: 'Europe' },
  { ianaName: 'Europe/Brussels', label: 'Central European Time (BE)', region: 'Europe' },
  { ianaName: 'Europe/Zurich', label: 'Central European Time (CH)', region: 'Europe' },
  { ianaName: 'Europe/Vienna', label: 'Central European Time (AT)', region: 'Europe' },
  { ianaName: 'Europe/Warsaw', label: 'Central European Time (PL)', region: 'Europe' },
  { ianaName: 'Europe/Prague', label: 'Central European Time (CZ)', region: 'Europe' },
  { ianaName: 'Europe/Budapest', label: 'Central European Time (HU)', region: 'Europe' },
  { ianaName: 'Europe/Stockholm', label: 'Central European Time (SE)', region: 'Europe' },
  { ianaName: 'Europe/Oslo', label: 'Central European Time (NO)', region: 'Europe' },
  { ianaName: 'Europe/Copenhagen', label: 'Central European Time (DK)', region: 'Europe' },
  { ianaName: 'Europe/Helsinki', label: 'Eastern European Time', region: 'Europe' },
  { ianaName: 'Europe/Athens', label: 'Eastern European Time (GR)', region: 'Europe' },
  { ianaName: 'Europe/Bucharest', label: 'Eastern European Time (RO)', region: 'Europe' },
  { ianaName: 'Europe/Sofia', label: 'Eastern European Time (BG)', region: 'Europe' },
  { ianaName: 'Europe/Istanbul', label: 'Turkey Time', region: 'Europe' },
  { ianaName: 'Europe/Moscow', label: 'Moscow Time', region: 'Europe' },
  { ianaName: 'Europe/Kiev', label: 'Eastern European Time (UA)', region: 'Europe' },
  { ianaName: 'Asia/Dubai', label: 'Gulf Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Riyadh', label: 'Arabian Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Tehran', label: 'Iran Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Karachi', label: 'Pakistan Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Kolkata', label: 'India Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Dhaka', label: 'Bangladesh Time', region: 'Asia' },
  { ianaName: 'Asia/Bangkok', label: 'Indochina Time', region: 'Asia' },
  { ianaName: 'Asia/Singapore', label: 'Singapore Time', region: 'Asia' },
  { ianaName: 'Asia/Hong_Kong', label: 'Hong Kong Time', region: 'Asia' },
  { ianaName: 'Asia/Shanghai', label: 'China Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Tokyo', label: 'Japan Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Seoul', label: 'Korea Standard Time', region: 'Asia' },
  { ianaName: 'Asia/Taipei', label: 'Taipei Time', region: 'Asia' },
  { ianaName: 'Asia/Manila', label: 'Philippine Time', region: 'Asia' },
  { ianaName: 'Asia/Jakarta', label: 'Western Indonesia Time', region: 'Asia' },
  { ianaName: 'Asia/Kuala_Lumpur', label: 'Malaysia Time', region: 'Asia' },
  { ianaName: 'Asia/Colombo', label: 'Sri Lanka Time', region: 'Asia' },
  { ianaName: 'Asia/Kathmandu', label: 'Nepal Time', region: 'Asia' },
  { ianaName: 'Asia/Almaty', label: 'Almaty Time', region: 'Asia' },
  { ianaName: 'Asia/Tashkent', label: 'Uzbekistan Time', region: 'Asia' },
  { ianaName: 'Australia/Sydney', label: 'Australian Eastern Time', region: 'Oceania' },
  { ianaName: 'Australia/Melbourne', label: 'Australian Eastern Time (VIC)', region: 'Oceania' },
  { ianaName: 'Australia/Brisbane', label: 'Australian Eastern Std Time', region: 'Oceania' },
  { ianaName: 'Australia/Perth', label: 'Australian Western Time', region: 'Oceania' },
  { ianaName: 'Australia/Adelaide', label: 'Australian Central Time', region: 'Oceania' },
  { ianaName: 'Pacific/Auckland', label: 'New Zealand Time', region: 'Oceania' },
  { ianaName: 'Pacific/Fiji', label: 'Fiji Time', region: 'Oceania' },
  { ianaName: 'Africa/Cairo', label: 'Eastern European Time (EG)', region: 'Africa' },
  { ianaName: 'Africa/Lagos', label: 'West Africa Time', region: 'Africa' },
  { ianaName: 'Africa/Johannesburg', label: 'South Africa Time', region: 'Africa' },
  { ianaName: 'Africa/Nairobi', label: 'East Africa Time', region: 'Africa' },
  { ianaName: 'Africa/Casablanca', label: 'Western European Time (MA)', region: 'Africa' },
];

// ── Cities ────────────────────────────────────────────
interface CityDef {
  name: string;
  countryCode: string;
  countryName: string;
  slug: string;
  timezone: string;
  lat: number;
  lng: number;
  population: number;
  isActive: boolean;
}

const CITIES: CityDef[] = [
  // === USA (100 cities) ===
  { name: 'New York', countryCode: 'US', countryName: 'United States', slug: 'new-york', timezone: 'America/New_York', lat: 40.7128, lng: -74.006, population: 8336817, isActive: true },
  { name: 'Los Angeles', countryCode: 'US', countryName: 'United States', slug: 'los-angeles', timezone: 'America/Los_Angeles', lat: 34.0522, lng: -118.2437, population: 3979576, isActive: true },
  { name: 'Chicago', countryCode: 'US', countryName: 'United States', slug: 'chicago', timezone: 'America/Chicago', lat: 41.8781, lng: -87.6298, population: 2693976, isActive: true },
  { name: 'Houston', countryCode: 'US', countryName: 'United States', slug: 'houston', timezone: 'America/Chicago', lat: 29.7604, lng: -95.3698, population: 2320268, isActive: true },
  { name: 'Phoenix', countryCode: 'US', countryName: 'United States', slug: 'phoenix', timezone: 'America/Phoenix', lat: 33.4484, lng: -112.074, population: 1680992, isActive: true },
  { name: 'Philadelphia', countryCode: 'US', countryName: 'United States', slug: 'philadelphia', timezone: 'America/New_York', lat: 39.9526, lng: -75.1652, population: 1603797, isActive: true },
  { name: 'San Antonio', countryCode: 'US', countryName: 'United States', slug: 'san-antonio', timezone: 'America/Chicago', lat: 29.4241, lng: -98.4936, population: 1547253, isActive: false },
  { name: 'San Diego', countryCode: 'US', countryName: 'United States', slug: 'san-diego', timezone: 'America/Los_Angeles', lat: 32.7157, lng: -117.1611, population: 1423851, isActive: true },
  { name: 'Dallas', countryCode: 'US', countryName: 'United States', slug: 'dallas', timezone: 'America/Chicago', lat: 32.7767, lng: -96.797, population: 1343573, isActive: true },
  { name: 'San Jose', countryCode: 'US', countryName: 'United States', slug: 'san-jose', timezone: 'America/Los_Angeles', lat: 37.3382, lng: -121.8863, population: 1021795, isActive: false },
  { name: 'Austin', countryCode: 'US', countryName: 'United States', slug: 'austin', timezone: 'America/Chicago', lat: 30.2672, lng: -97.7431, population: 978908, isActive: true },
  { name: 'Jacksonville', countryCode: 'US', countryName: 'United States', slug: 'jacksonville', timezone: 'America/New_York', lat: 30.3322, lng: -81.6557, population: 949611, isActive: false },
  { name: 'Fort Worth', countryCode: 'US', countryName: 'United States', slug: 'fort-worth', timezone: 'America/Chicago', lat: 32.7555, lng: -97.3308, population: 918915, isActive: false },
  { name: 'Columbus', countryCode: 'US', countryName: 'United States', slug: 'columbus', timezone: 'America/New_York', lat: 39.9612, lng: -82.9988, population: 905748, isActive: false },
  { name: 'Charlotte', countryCode: 'US', countryName: 'United States', slug: 'charlotte', timezone: 'America/New_York', lat: 35.2271, lng: -80.8431, population: 874579, isActive: false },
  { name: 'San Francisco', countryCode: 'US', countryName: 'United States', slug: 'san-francisco', timezone: 'America/Los_Angeles', lat: 37.7749, lng: -122.4194, population: 873965, isActive: true },
  { name: 'Indianapolis', countryCode: 'US', countryName: 'United States', slug: 'indianapolis', timezone: 'America/New_York', lat: 39.7684, lng: -86.1581, population: 876384, isActive: false },
  { name: 'Seattle', countryCode: 'US', countryName: 'United States', slug: 'seattle', timezone: 'America/Los_Angeles', lat: 47.6062, lng: -122.3321, population: 737015, isActive: true },
  { name: 'Denver', countryCode: 'US', countryName: 'United States', slug: 'denver', timezone: 'America/Denver', lat: 39.7392, lng: -104.9903, population: 715522, isActive: true },
  { name: 'Washington', countryCode: 'US', countryName: 'United States', slug: 'washington-dc', timezone: 'America/New_York', lat: 38.9072, lng: -77.0369, population: 689545, isActive: true },
  { name: 'Nashville', countryCode: 'US', countryName: 'United States', slug: 'nashville', timezone: 'America/Chicago', lat: 36.1627, lng: -86.7816, population: 689447, isActive: false },
  { name: 'Oklahoma City', countryCode: 'US', countryName: 'United States', slug: 'oklahoma-city', timezone: 'America/Chicago', lat: 35.4676, lng: -97.5164, population: 681054, isActive: false },
  { name: 'El Paso', countryCode: 'US', countryName: 'United States', slug: 'el-paso', timezone: 'America/Denver', lat: 31.7619, lng: -106.485, population: 681728, isActive: false },
  { name: 'Boston', countryCode: 'US', countryName: 'United States', slug: 'boston', timezone: 'America/New_York', lat: 42.3601, lng: -71.0589, population: 675647, isActive: true },
  { name: 'Portland', countryCode: 'US', countryName: 'United States', slug: 'portland', timezone: 'America/Los_Angeles', lat: 45.5152, lng: -122.6784, population: 652503, isActive: false },
  { name: 'Las Vegas', countryCode: 'US', countryName: 'United States', slug: 'las-vegas', timezone: 'America/Los_Angeles', lat: 36.1699, lng: -115.1398, population: 641903, isActive: true },
  { name: 'Memphis', countryCode: 'US', countryName: 'United States', slug: 'memphis', timezone: 'America/Chicago', lat: 35.1495, lng: -90.049, population: 633104, isActive: false },
  { name: 'Louisville', countryCode: 'US', countryName: 'United States', slug: 'louisville', timezone: 'America/New_York', lat: 38.2527, lng: -85.7585, population: 633045, isActive: false },
  { name: 'Baltimore', countryCode: 'US', countryName: 'United States', slug: 'baltimore', timezone: 'America/New_York', lat: 39.2904, lng: -76.6122, population: 585708, isActive: false },
  { name: 'Milwaukee', countryCode: 'US', countryName: 'United States', slug: 'milwaukee', timezone: 'America/Chicago', lat: 43.0389, lng: -87.9065, population: 577222, isActive: false },
  { name: 'Albuquerque', countryCode: 'US', countryName: 'United States', slug: 'albuquerque', timezone: 'America/Denver', lat: 35.0844, lng: -106.6504, population: 564559, isActive: false },
  { name: 'Tucson', countryCode: 'US', countryName: 'United States', slug: 'tucson', timezone: 'America/Phoenix', lat: 32.2226, lng: -110.9747, population: 542629, isActive: false },
  { name: 'Fresno', countryCode: 'US', countryName: 'United States', slug: 'fresno', timezone: 'America/Los_Angeles', lat: 36.7378, lng: -119.7871, population: 542107, isActive: false },
  { name: 'Sacramento', countryCode: 'US', countryName: 'United States', slug: 'sacramento', timezone: 'America/Los_Angeles', lat: 38.5816, lng: -121.4944, population: 524943, isActive: false },
  { name: 'Mesa', countryCode: 'US', countryName: 'United States', slug: 'mesa', timezone: 'America/Phoenix', lat: 33.4152, lng: -111.8315, population: 504258, isActive: false },
  { name: 'Kansas City', countryCode: 'US', countryName: 'United States', slug: 'kansas-city', timezone: 'America/Chicago', lat: 39.0997, lng: -94.5786, population: 508090, isActive: false },
  { name: 'Atlanta', countryCode: 'US', countryName: 'United States', slug: 'atlanta', timezone: 'America/New_York', lat: 33.749, lng: -84.388, population: 498715, isActive: true },
  { name: 'Omaha', countryCode: 'US', countryName: 'United States', slug: 'omaha', timezone: 'America/Chicago', lat: 41.2565, lng: -95.9345, population: 486051, isActive: false },
  { name: 'Colorado Springs', countryCode: 'US', countryName: 'United States', slug: 'colorado-springs', timezone: 'America/Denver', lat: 38.8339, lng: -104.8214, population: 478961, isActive: false },
  { name: 'Raleigh', countryCode: 'US', countryName: 'United States', slug: 'raleigh', timezone: 'America/New_York', lat: 35.7796, lng: -78.6382, population: 474069, isActive: false },
  { name: 'Miami', countryCode: 'US', countryName: 'United States', slug: 'miami', timezone: 'America/New_York', lat: 25.7617, lng: -80.1918, population: 467963, isActive: true },
  { name: 'Minneapolis', countryCode: 'US', countryName: 'United States', slug: 'minneapolis', timezone: 'America/Chicago', lat: 44.9778, lng: -93.265, population: 429954, isActive: false },
  { name: 'Tampa', countryCode: 'US', countryName: 'United States', slug: 'tampa', timezone: 'America/New_York', lat: 27.9506, lng: -82.4572, population: 399700, isActive: false },
  { name: 'New Orleans', countryCode: 'US', countryName: 'United States', slug: 'new-orleans', timezone: 'America/Chicago', lat: 29.9511, lng: -90.0715, population: 390144, isActive: false },
  { name: 'Cleveland', countryCode: 'US', countryName: 'United States', slug: 'cleveland', timezone: 'America/New_York', lat: 41.4993, lng: -81.6944, population: 372624, isActive: false },
  { name: 'Honolulu', countryCode: 'US', countryName: 'United States', slug: 'honolulu', timezone: 'Pacific/Honolulu', lat: 21.3069, lng: -157.8583, population: 350964, isActive: true },
  { name: 'Anchorage', countryCode: 'US', countryName: 'United States', slug: 'anchorage', timezone: 'America/Anchorage', lat: 61.2181, lng: -149.9003, population: 291247, isActive: false },
  { name: 'Pittsburgh', countryCode: 'US', countryName: 'United States', slug: 'pittsburgh', timezone: 'America/New_York', lat: 40.4406, lng: -79.9959, population: 302971, isActive: false },
  { name: 'Cincinnati', countryCode: 'US', countryName: 'United States', slug: 'cincinnati', timezone: 'America/New_York', lat: 39.1031, lng: -84.512, population: 309317, isActive: false },
  { name: 'Orlando', countryCode: 'US', countryName: 'United States', slug: 'orlando', timezone: 'America/New_York', lat: 28.5383, lng: -81.3792, population: 307573, isActive: false },
  { name: 'Salt Lake City', countryCode: 'US', countryName: 'United States', slug: 'salt-lake-city', timezone: 'America/Denver', lat: 40.7608, lng: -111.891, population: 200133, isActive: false },
  { name: 'Detroit', countryCode: 'US', countryName: 'United States', slug: 'detroit', timezone: 'America/New_York', lat: 42.3314, lng: -83.0458, population: 639111, isActive: false },
  { name: 'St. Louis', countryCode: 'US', countryName: 'United States', slug: 'st-louis', timezone: 'America/Chicago', lat: 38.627, lng: -90.1994, population: 301578, isActive: false },
  { name: 'Boise', countryCode: 'US', countryName: 'United States', slug: 'boise', timezone: 'America/Boise', lat: 43.615, lng: -116.2023, population: 235684, isActive: false },

  // === UK ===
  { name: 'London', countryCode: 'GB', countryName: 'United Kingdom', slug: 'london', timezone: 'Europe/London', lat: 51.5074, lng: -0.1278, population: 8982000, isActive: true },
  { name: 'Manchester', countryCode: 'GB', countryName: 'United Kingdom', slug: 'manchester', timezone: 'Europe/London', lat: 53.4808, lng: -2.2426, population: 553230, isActive: false },
  { name: 'Birmingham', countryCode: 'GB', countryName: 'United Kingdom', slug: 'birmingham-uk', timezone: 'Europe/London', lat: 52.4862, lng: -1.8904, population: 1141816, isActive: false },
  { name: 'Edinburgh', countryCode: 'GB', countryName: 'United Kingdom', slug: 'edinburgh', timezone: 'Europe/London', lat: 55.9533, lng: -3.1883, population: 524930, isActive: false },
  { name: 'Glasgow', countryCode: 'GB', countryName: 'United Kingdom', slug: 'glasgow', timezone: 'Europe/London', lat: 55.8642, lng: -4.2518, population: 633120, isActive: false },
  { name: 'Liverpool', countryCode: 'GB', countryName: 'United Kingdom', slug: 'liverpool', timezone: 'Europe/London', lat: 53.4084, lng: -2.9916, population: 496784, isActive: false },
  { name: 'Bristol', countryCode: 'GB', countryName: 'United Kingdom', slug: 'bristol', timezone: 'Europe/London', lat: 51.4545, lng: -2.5879, population: 467099, isActive: false },
  { name: 'Leeds', countryCode: 'GB', countryName: 'United Kingdom', slug: 'leeds', timezone: 'Europe/London', lat: 53.8008, lng: -1.5491, population: 789194, isActive: false },

  // === Ireland ===
  { name: 'Dublin', countryCode: 'IE', countryName: 'Ireland', slug: 'dublin', timezone: 'Europe/Dublin', lat: 53.3498, lng: -6.2603, population: 1173179, isActive: true },

  // === France ===
  { name: 'Paris', countryCode: 'FR', countryName: 'France', slug: 'paris', timezone: 'Europe/Paris', lat: 48.8566, lng: 2.3522, population: 2161000, isActive: true },
  { name: 'Marseille', countryCode: 'FR', countryName: 'France', slug: 'marseille', timezone: 'Europe/Paris', lat: 43.2965, lng: 5.3698, population: 870018, isActive: false },
  { name: 'Lyon', countryCode: 'FR', countryName: 'France', slug: 'lyon', timezone: 'Europe/Paris', lat: 45.764, lng: 4.8357, population: 516092, isActive: false },
  { name: 'Toulouse', countryCode: 'FR', countryName: 'France', slug: 'toulouse', timezone: 'Europe/Paris', lat: 43.6047, lng: 1.4442, population: 479553, isActive: false },
  { name: 'Nice', countryCode: 'FR', countryName: 'France', slug: 'nice', timezone: 'Europe/Paris', lat: 43.7102, lng: 7.262, population: 340017, isActive: false },

  // === Germany ===
  { name: 'Berlin', countryCode: 'DE', countryName: 'Germany', slug: 'berlin', timezone: 'Europe/Berlin', lat: 52.52, lng: 13.405, population: 3644826, isActive: true },
  { name: 'Munich', countryCode: 'DE', countryName: 'Germany', slug: 'munich', timezone: 'Europe/Berlin', lat: 48.1351, lng: 11.582, population: 1471508, isActive: true },
  { name: 'Frankfurt', countryCode: 'DE', countryName: 'Germany', slug: 'frankfurt', timezone: 'Europe/Berlin', lat: 50.1109, lng: 8.6821, population: 753056, isActive: true },
  { name: 'Hamburg', countryCode: 'DE', countryName: 'Germany', slug: 'hamburg', timezone: 'Europe/Berlin', lat: 53.5511, lng: 9.9937, population: 1841179, isActive: false },
  { name: 'Cologne', countryCode: 'DE', countryName: 'Germany', slug: 'cologne', timezone: 'Europe/Berlin', lat: 50.9375, lng: 6.9603, population: 1085664, isActive: false },
  { name: 'Stuttgart', countryCode: 'DE', countryName: 'Germany', slug: 'stuttgart', timezone: 'Europe/Berlin', lat: 48.7758, lng: 9.1829, population: 634830, isActive: false },
  { name: 'Düsseldorf', countryCode: 'DE', countryName: 'Germany', slug: 'dusseldorf', timezone: 'Europe/Berlin', lat: 51.2277, lng: 6.7735, population: 619294, isActive: false },

  // === Spain ===
  { name: 'Madrid', countryCode: 'ES', countryName: 'Spain', slug: 'madrid', timezone: 'Europe/Madrid', lat: 40.4168, lng: -3.7038, population: 3223334, isActive: true },
  { name: 'Barcelona', countryCode: 'ES', countryName: 'Spain', slug: 'barcelona', timezone: 'Europe/Madrid', lat: 41.3874, lng: 2.1686, population: 1620343, isActive: true },
  { name: 'Valencia', countryCode: 'ES', countryName: 'Spain', slug: 'valencia', timezone: 'Europe/Madrid', lat: 39.4699, lng: -0.3763, population: 791413, isActive: false },
  { name: 'Seville', countryCode: 'ES', countryName: 'Spain', slug: 'seville', timezone: 'Europe/Madrid', lat: 37.3891, lng: -5.9845, population: 688711, isActive: false },

  // === Italy ===
  { name: 'Rome', countryCode: 'IT', countryName: 'Italy', slug: 'rome', timezone: 'Europe/Rome', lat: 41.9028, lng: 12.4964, population: 2873000, isActive: true },
  { name: 'Milan', countryCode: 'IT', countryName: 'Italy', slug: 'milan', timezone: 'Europe/Rome', lat: 45.4642, lng: 9.19, population: 1378689, isActive: true },
  { name: 'Naples', countryCode: 'IT', countryName: 'Italy', slug: 'naples', timezone: 'Europe/Rome', lat: 40.8518, lng: 14.2681, population: 967069, isActive: false },
  { name: 'Turin', countryCode: 'IT', countryName: 'Italy', slug: 'turin', timezone: 'Europe/Rome', lat: 45.0703, lng: 7.6869, population: 870952, isActive: false },
  { name: 'Florence', countryCode: 'IT', countryName: 'Italy', slug: 'florence', timezone: 'Europe/Rome', lat: 43.7696, lng: 11.2558, population: 382258, isActive: false },

  // === Netherlands ===
  { name: 'Amsterdam', countryCode: 'NL', countryName: 'Netherlands', slug: 'amsterdam', timezone: 'Europe/Amsterdam', lat: 52.3676, lng: 4.9041, population: 821752, isActive: true },
  { name: 'Rotterdam', countryCode: 'NL', countryName: 'Netherlands', slug: 'rotterdam', timezone: 'Europe/Amsterdam', lat: 51.9244, lng: 4.4777, population: 651446, isActive: false },

  // === Belgium ===
  { name: 'Brussels', countryCode: 'BE', countryName: 'Belgium', slug: 'brussels', timezone: 'Europe/Brussels', lat: 50.8503, lng: 4.3517, population: 1209000, isActive: true },

  // === Switzerland ===
  { name: 'Zurich', countryCode: 'CH', countryName: 'Switzerland', slug: 'zurich', timezone: 'Europe/Zurich', lat: 47.3769, lng: 8.5417, population: 402762, isActive: true },
  { name: 'Geneva', countryCode: 'CH', countryName: 'Switzerland', slug: 'geneva', timezone: 'Europe/Zurich', lat: 46.2044, lng: 6.1432, population: 201818, isActive: false },

  // === Austria ===
  { name: 'Vienna', countryCode: 'AT', countryName: 'Austria', slug: 'vienna', timezone: 'Europe/Vienna', lat: 48.2082, lng: 16.3738, population: 1911191, isActive: true },

  // === Portugal ===
  { name: 'Lisbon', countryCode: 'PT', countryName: 'Portugal', slug: 'lisbon', timezone: 'Europe/Lisbon', lat: 38.7223, lng: -9.1393, population: 504718, isActive: true },
  { name: 'Porto', countryCode: 'PT', countryName: 'Portugal', slug: 'porto', timezone: 'Europe/Lisbon', lat: 41.1579, lng: -8.6291, population: 249633, isActive: false },

  // === Scandinavia ===
  { name: 'Stockholm', countryCode: 'SE', countryName: 'Sweden', slug: 'stockholm', timezone: 'Europe/Stockholm', lat: 59.3293, lng: 18.0686, population: 975551, isActive: true },
  { name: 'Gothenburg', countryCode: 'SE', countryName: 'Sweden', slug: 'gothenburg', timezone: 'Europe/Stockholm', lat: 57.7089, lng: 11.9746, population: 583056, isActive: false },
  { name: 'Oslo', countryCode: 'NO', countryName: 'Norway', slug: 'oslo', timezone: 'Europe/Oslo', lat: 59.9139, lng: 10.7522, population: 693494, isActive: true },
  { name: 'Copenhagen', countryCode: 'DK', countryName: 'Denmark', slug: 'copenhagen', timezone: 'Europe/Copenhagen', lat: 55.6761, lng: 12.5683, population: 794128, isActive: true },
  { name: 'Helsinki', countryCode: 'FI', countryName: 'Finland', slug: 'helsinki', timezone: 'Europe/Helsinki', lat: 60.1699, lng: 24.9384, population: 656229, isActive: true },

  // === Eastern Europe ===
  { name: 'Warsaw', countryCode: 'PL', countryName: 'Poland', slug: 'warsaw', timezone: 'Europe/Warsaw', lat: 52.2297, lng: 21.0122, population: 1790658, isActive: true },
  { name: 'Krakow', countryCode: 'PL', countryName: 'Poland', slug: 'krakow', timezone: 'Europe/Warsaw', lat: 50.0647, lng: 19.945, population: 779115, isActive: false },
  { name: 'Prague', countryCode: 'CZ', countryName: 'Czech Republic', slug: 'prague', timezone: 'Europe/Prague', lat: 50.0755, lng: 14.4378, population: 1309000, isActive: true },
  { name: 'Budapest', countryCode: 'HU', countryName: 'Hungary', slug: 'budapest', timezone: 'Europe/Budapest', lat: 47.4979, lng: 19.0402, population: 1752286, isActive: true },
  { name: 'Bucharest', countryCode: 'RO', countryName: 'Romania', slug: 'bucharest', timezone: 'Europe/Bucharest', lat: 44.4268, lng: 26.1025, population: 1883425, isActive: false },
  { name: 'Sofia', countryCode: 'BG', countryName: 'Bulgaria', slug: 'sofia', timezone: 'Europe/Sofia', lat: 42.6977, lng: 23.3219, population: 1236000, isActive: false },
  { name: 'Athens', countryCode: 'GR', countryName: 'Greece', slug: 'athens', timezone: 'Europe/Athens', lat: 37.9838, lng: 23.7275, population: 664046, isActive: true },

  // === Turkey ===
  { name: 'Istanbul', countryCode: 'TR', countryName: 'Turkey', slug: 'istanbul', timezone: 'Europe/Istanbul', lat: 41.0082, lng: 28.9784, population: 15462452, isActive: true },
  { name: 'Ankara', countryCode: 'TR', countryName: 'Turkey', slug: 'ankara', timezone: 'Europe/Istanbul', lat: 39.9334, lng: 32.8597, population: 5663322, isActive: false },

  // === Russia ===
  { name: 'Moscow', countryCode: 'RU', countryName: 'Russia', slug: 'moscow', timezone: 'Europe/Moscow', lat: 55.7558, lng: 37.6173, population: 12506468, isActive: true },
  { name: 'Saint Petersburg', countryCode: 'RU', countryName: 'Russia', slug: 'saint-petersburg', timezone: 'Europe/Moscow', lat: 59.9311, lng: 30.3609, population: 5351935, isActive: false },

  // === Canada ===
  { name: 'Toronto', countryCode: 'CA', countryName: 'Canada', slug: 'toronto', timezone: 'America/Toronto', lat: 43.6532, lng: -79.3832, population: 2731571, isActive: true },
  { name: 'Montreal', countryCode: 'CA', countryName: 'Canada', slug: 'montreal', timezone: 'America/Toronto', lat: 45.5017, lng: -73.5673, population: 1762949, isActive: true },
  { name: 'Vancouver', countryCode: 'CA', countryName: 'Canada', slug: 'vancouver', timezone: 'America/Vancouver', lat: 49.2827, lng: -123.1207, population: 631486, isActive: true },
  { name: 'Calgary', countryCode: 'CA', countryName: 'Canada', slug: 'calgary', timezone: 'America/Edmonton', lat: 51.0447, lng: -114.0719, population: 1239220, isActive: false },
  { name: 'Ottawa', countryCode: 'CA', countryName: 'Canada', slug: 'ottawa', timezone: 'America/Toronto', lat: 45.4215, lng: -75.6972, population: 934243, isActive: false },
  { name: 'Edmonton', countryCode: 'CA', countryName: 'Canada', slug: 'edmonton', timezone: 'America/Edmonton', lat: 53.5461, lng: -113.4938, population: 981280, isActive: false },
  { name: 'Winnipeg', countryCode: 'CA', countryName: 'Canada', slug: 'winnipeg', timezone: 'America/Winnipeg', lat: 49.8951, lng: -97.1384, population: 749534, isActive: false },
  { name: 'Halifax', countryCode: 'CA', countryName: 'Canada', slug: 'halifax', timezone: 'America/Halifax', lat: 44.6488, lng: -63.5752, population: 403131, isActive: false },

  // === Mexico ===
  { name: 'Mexico City', countryCode: 'MX', countryName: 'Mexico', slug: 'mexico-city', timezone: 'America/Mexico_City', lat: 19.4326, lng: -99.1332, population: 9209944, isActive: true },

  // === South America ===
  { name: 'São Paulo', countryCode: 'BR', countryName: 'Brazil', slug: 'sao-paulo', timezone: 'America/Sao_Paulo', lat: -23.5505, lng: -46.6333, population: 12325232, isActive: true },
  { name: 'Rio de Janeiro', countryCode: 'BR', countryName: 'Brazil', slug: 'rio-de-janeiro', timezone: 'America/Sao_Paulo', lat: -22.9068, lng: -43.1729, population: 6748000, isActive: false },
  { name: 'Buenos Aires', countryCode: 'AR', countryName: 'Argentina', slug: 'buenos-aires', timezone: 'America/Argentina/Buenos_Aires', lat: -34.6037, lng: -58.3816, population: 3054300, isActive: true },
  { name: 'Santiago', countryCode: 'CL', countryName: 'Chile', slug: 'santiago', timezone: 'America/Santiago', lat: -33.4489, lng: -70.6693, population: 6158080, isActive: false },
  { name: 'Lima', countryCode: 'PE', countryName: 'Peru', slug: 'lima', timezone: 'America/Lima', lat: -12.0464, lng: -77.0428, population: 9751717, isActive: false },
  { name: 'Bogotá', countryCode: 'CO', countryName: 'Colombia', slug: 'bogota', timezone: 'America/Bogota', lat: 4.711, lng: -74.0721, population: 7181469, isActive: false },

  // === Middle East ===
  { name: 'Dubai', countryCode: 'AE', countryName: 'United Arab Emirates', slug: 'dubai', timezone: 'Asia/Dubai', lat: 25.2048, lng: 55.2708, population: 3331420, isActive: true },
  { name: 'Abu Dhabi', countryCode: 'AE', countryName: 'United Arab Emirates', slug: 'abu-dhabi', timezone: 'Asia/Dubai', lat: 24.4539, lng: 54.3773, population: 1483000, isActive: false },
  { name: 'Riyadh', countryCode: 'SA', countryName: 'Saudi Arabia', slug: 'riyadh', timezone: 'Asia/Riyadh', lat: 24.7136, lng: 46.6753, population: 7676654, isActive: false },
  { name: 'Tehran', countryCode: 'IR', countryName: 'Iran', slug: 'tehran', timezone: 'Asia/Tehran', lat: 35.6892, lng: 51.389, population: 8693706, isActive: false },

  // === South Asia ===
  { name: 'Mumbai', countryCode: 'IN', countryName: 'India', slug: 'mumbai', timezone: 'Asia/Kolkata', lat: 19.076, lng: 72.8777, population: 12478447, isActive: true },
  { name: 'Delhi', countryCode: 'IN', countryName: 'India', slug: 'delhi', timezone: 'Asia/Kolkata', lat: 28.7041, lng: 77.1025, population: 11034555, isActive: true },
  { name: 'Bangalore', countryCode: 'IN', countryName: 'India', slug: 'bangalore', timezone: 'Asia/Kolkata', lat: 12.9716, lng: 77.5946, population: 8443675, isActive: true },
  { name: 'Chennai', countryCode: 'IN', countryName: 'India', slug: 'chennai', timezone: 'Asia/Kolkata', lat: 13.0827, lng: 80.2707, population: 4681087, isActive: false },
  { name: 'Hyderabad', countryCode: 'IN', countryName: 'India', slug: 'hyderabad', timezone: 'Asia/Kolkata', lat: 17.385, lng: 78.4867, population: 6809970, isActive: false },
  { name: 'Kolkata', countryCode: 'IN', countryName: 'India', slug: 'kolkata', timezone: 'Asia/Kolkata', lat: 22.5726, lng: 88.3639, population: 4496694, isActive: false },
  { name: 'Pune', countryCode: 'IN', countryName: 'India', slug: 'pune', timezone: 'Asia/Kolkata', lat: 18.5204, lng: 73.8567, population: 3124458, isActive: false },
  { name: 'Karachi', countryCode: 'PK', countryName: 'Pakistan', slug: 'karachi', timezone: 'Asia/Karachi', lat: 24.8607, lng: 67.0011, population: 14910352, isActive: false },
  { name: 'Lahore', countryCode: 'PK', countryName: 'Pakistan', slug: 'lahore', timezone: 'Asia/Karachi', lat: 31.5204, lng: 74.3587, population: 11126285, isActive: false },
  { name: 'Dhaka', countryCode: 'BD', countryName: 'Bangladesh', slug: 'dhaka', timezone: 'Asia/Dhaka', lat: 23.8103, lng: 90.4125, population: 8906039, isActive: false },
  { name: 'Colombo', countryCode: 'LK', countryName: 'Sri Lanka', slug: 'colombo', timezone: 'Asia/Colombo', lat: 6.9271, lng: 79.8612, population: 752993, isActive: false },

  // === Southeast Asia ===
  { name: 'Singapore', countryCode: 'SG', countryName: 'Singapore', slug: 'singapore', timezone: 'Asia/Singapore', lat: 1.3521, lng: 103.8198, population: 5850342, isActive: true },
  { name: 'Bangkok', countryCode: 'TH', countryName: 'Thailand', slug: 'bangkok', timezone: 'Asia/Bangkok', lat: 13.7563, lng: 100.5018, population: 8280925, isActive: true },
  { name: 'Jakarta', countryCode: 'ID', countryName: 'Indonesia', slug: 'jakarta', timezone: 'Asia/Jakarta', lat: -6.2088, lng: 106.8456, population: 10562088, isActive: false },
  { name: 'Kuala Lumpur', countryCode: 'MY', countryName: 'Malaysia', slug: 'kuala-lumpur', timezone: 'Asia/Kuala_Lumpur', lat: 3.139, lng: 101.6869, population: 1808000, isActive: false },
  { name: 'Manila', countryCode: 'PH', countryName: 'Philippines', slug: 'manila', timezone: 'Asia/Manila', lat: 14.5995, lng: 120.9842, population: 1780148, isActive: false },
  { name: 'Ho Chi Minh City', countryCode: 'VN', countryName: 'Vietnam', slug: 'ho-chi-minh-city', timezone: 'Asia/Bangkok', lat: 10.8231, lng: 106.6297, population: 8993082, isActive: false },

  // === East Asia ===
  { name: 'Tokyo', countryCode: 'JP', countryName: 'Japan', slug: 'tokyo', timezone: 'Asia/Tokyo', lat: 35.6762, lng: 139.6503, population: 13960000, isActive: true },
  { name: 'Osaka', countryCode: 'JP', countryName: 'Japan', slug: 'osaka', timezone: 'Asia/Tokyo', lat: 34.6937, lng: 135.5023, population: 2753862, isActive: false },
  { name: 'Seoul', countryCode: 'KR', countryName: 'South Korea', slug: 'seoul', timezone: 'Asia/Seoul', lat: 37.5665, lng: 126.978, population: 9776000, isActive: true },
  { name: 'Beijing', countryCode: 'CN', countryName: 'China', slug: 'beijing', timezone: 'Asia/Shanghai', lat: 39.9042, lng: 116.4074, population: 21542000, isActive: true },
  { name: 'Shanghai', countryCode: 'CN', countryName: 'China', slug: 'shanghai', timezone: 'Asia/Shanghai', lat: 31.2304, lng: 121.4737, population: 26317000, isActive: true },
  { name: 'Hong Kong', countryCode: 'HK', countryName: 'Hong Kong', slug: 'hong-kong', timezone: 'Asia/Hong_Kong', lat: 22.3193, lng: 114.1694, population: 7481800, isActive: true },
  { name: 'Taipei', countryCode: 'TW', countryName: 'Taiwan', slug: 'taipei', timezone: 'Asia/Taipei', lat: 25.033, lng: 121.5654, population: 2602418, isActive: false },
  { name: 'Shenzhen', countryCode: 'CN', countryName: 'China', slug: 'shenzhen', timezone: 'Asia/Shanghai', lat: 22.5431, lng: 114.0579, population: 12528300, isActive: false },

  // === Oceania ===
  { name: 'Sydney', countryCode: 'AU', countryName: 'Australia', slug: 'sydney', timezone: 'Australia/Sydney', lat: -33.8688, lng: 151.2093, population: 5312000, isActive: true },
  { name: 'Melbourne', countryCode: 'AU', countryName: 'Australia', slug: 'melbourne', timezone: 'Australia/Melbourne', lat: -37.8136, lng: 144.9631, population: 5078000, isActive: true },
  { name: 'Brisbane', countryCode: 'AU', countryName: 'Australia', slug: 'brisbane', timezone: 'Australia/Brisbane', lat: -27.4698, lng: 153.0251, population: 2462637, isActive: false },
  { name: 'Perth', countryCode: 'AU', countryName: 'Australia', slug: 'perth', timezone: 'Australia/Perth', lat: -31.9505, lng: 115.8605, population: 2059484, isActive: false },
  { name: 'Adelaide', countryCode: 'AU', countryName: 'Australia', slug: 'adelaide', timezone: 'Australia/Adelaide', lat: -34.9285, lng: 138.6007, population: 1345777, isActive: false },
  { name: 'Auckland', countryCode: 'NZ', countryName: 'New Zealand', slug: 'auckland', timezone: 'Pacific/Auckland', lat: -36.8485, lng: 174.7633, population: 1571718, isActive: true },
  { name: 'Wellington', countryCode: 'NZ', countryName: 'New Zealand', slug: 'wellington', timezone: 'Pacific/Auckland', lat: -41.2865, lng: 174.7762, population: 215400, isActive: false },

  // === Africa ===
  { name: 'Cairo', countryCode: 'EG', countryName: 'Egypt', slug: 'cairo', timezone: 'Africa/Cairo', lat: 30.0444, lng: 31.2357, population: 9540000, isActive: true },
  { name: 'Lagos', countryCode: 'NG', countryName: 'Nigeria', slug: 'lagos', timezone: 'Africa/Lagos', lat: 6.5244, lng: 3.3792, population: 14368000, isActive: false },
  { name: 'Johannesburg', countryCode: 'ZA', countryName: 'South Africa', slug: 'johannesburg', timezone: 'Africa/Johannesburg', lat: -26.2041, lng: 28.0473, population: 5635127, isActive: true },
  { name: 'Cape Town', countryCode: 'ZA', countryName: 'South Africa', slug: 'cape-town', timezone: 'Africa/Johannesburg', lat: -33.9249, lng: 18.4241, population: 4618000, isActive: false },
  { name: 'Nairobi', countryCode: 'KE', countryName: 'Kenya', slug: 'nairobi', timezone: 'Africa/Nairobi', lat: -1.2921, lng: 36.8219, population: 4397073, isActive: false },
  { name: 'Casablanca', countryCode: 'MA', countryName: 'Morocco', slug: 'casablanca', timezone: 'Africa/Casablanca', lat: 33.5731, lng: -7.5898, population: 3359000, isActive: false },

  // Additional US cities to reach 300+
  { name: 'Virginia Beach', countryCode: 'US', countryName: 'United States', slug: 'virginia-beach', timezone: 'America/New_York', lat: 36.8529, lng: -75.978, population: 459470, isActive: false },
  { name: 'Tulsa', countryCode: 'US', countryName: 'United States', slug: 'tulsa', timezone: 'America/Chicago', lat: 36.154, lng: -95.9928, population: 413066, isActive: false },
  { name: 'Arlington', countryCode: 'US', countryName: 'United States', slug: 'arlington-tx', timezone: 'America/Chicago', lat: 32.7357, lng: -97.1081, population: 394266, isActive: false },
  { name: 'Aurora', countryCode: 'US', countryName: 'United States', slug: 'aurora', timezone: 'America/Denver', lat: 39.7294, lng: -104.8319, population: 386261, isActive: false },
  { name: 'Tampa Bay', countryCode: 'US', countryName: 'United States', slug: 'tampa-bay', timezone: 'America/New_York', lat: 27.9506, lng: -82.4572, population: 384959, isActive: false },
  { name: 'Bakersfield', countryCode: 'US', countryName: 'United States', slug: 'bakersfield', timezone: 'America/Los_Angeles', lat: 35.3733, lng: -119.0187, population: 384145, isActive: false },
  { name: 'Wichita', countryCode: 'US', countryName: 'United States', slug: 'wichita', timezone: 'America/Chicago', lat: 37.6872, lng: -97.3301, population: 397532, isActive: false },
  { name: 'Anaheim', countryCode: 'US', countryName: 'United States', slug: 'anaheim', timezone: 'America/Los_Angeles', lat: 33.8366, lng: -117.9143, population: 350742, isActive: false },
  { name: 'Santa Ana', countryCode: 'US', countryName: 'United States', slug: 'santa-ana', timezone: 'America/Los_Angeles', lat: 33.7455, lng: -117.8677, population: 310227, isActive: false },
  { name: 'Henderson', countryCode: 'US', countryName: 'United States', slug: 'henderson', timezone: 'America/Los_Angeles', lat: 36.0395, lng: -114.9817, population: 320189, isActive: false },
  { name: 'Stockton', countryCode: 'US', countryName: 'United States', slug: 'stockton', timezone: 'America/Los_Angeles', lat: 37.9577, lng: -121.2908, population: 320804, isActive: false },
  { name: 'Irvine', countryCode: 'US', countryName: 'United States', slug: 'irvine', timezone: 'America/Los_Angeles', lat: 33.6846, lng: -117.8265, population: 307670, isActive: false },
  { name: 'Chula Vista', countryCode: 'US', countryName: 'United States', slug: 'chula-vista', timezone: 'America/Los_Angeles', lat: 32.6401, lng: -117.0842, population: 275487, isActive: false },
  { name: 'Lexington', countryCode: 'US', countryName: 'United States', slug: 'lexington', timezone: 'America/New_York', lat: 38.0406, lng: -84.5037, population: 323152, isActive: false },
  { name: 'Greensboro', countryCode: 'US', countryName: 'United States', slug: 'greensboro', timezone: 'America/New_York', lat: 36.0726, lng: -79.792, population: 299035, isActive: false },
  { name: 'Buffalo', countryCode: 'US', countryName: 'United States', slug: 'buffalo', timezone: 'America/New_York', lat: 42.8864, lng: -78.8784, population: 278349, isActive: false },
  { name: 'Chandler', countryCode: 'US', countryName: 'United States', slug: 'chandler', timezone: 'America/Phoenix', lat: 33.3062, lng: -111.8413, population: 275987, isActive: false },
  { name: 'Scottsdale', countryCode: 'US', countryName: 'United States', slug: 'scottsdale', timezone: 'America/Phoenix', lat: 33.4942, lng: -111.9261, population: 258069, isActive: false },
  { name: 'Reno', countryCode: 'US', countryName: 'United States', slug: 'reno', timezone: 'America/Los_Angeles', lat: 39.5296, lng: -119.8138, population: 264165, isActive: false },
  { name: 'Norfolk', countryCode: 'US', countryName: 'United States', slug: 'norfolk', timezone: 'America/New_York', lat: 36.8508, lng: -76.2859, population: 244703, isActive: false },
  { name: 'Madison', countryCode: 'US', countryName: 'United States', slug: 'madison', timezone: 'America/Chicago', lat: 43.0731, lng: -89.4012, population: 269840, isActive: false },
  { name: 'Des Moines', countryCode: 'US', countryName: 'United States', slug: 'des-moines', timezone: 'America/Chicago', lat: 41.5868, lng: -93.625, population: 214237, isActive: false },
  { name: 'Richmond', countryCode: 'US', countryName: 'United States', slug: 'richmond', timezone: 'America/New_York', lat: 37.5407, lng: -77.436, population: 226610, isActive: false },
  { name: 'Knoxville', countryCode: 'US', countryName: 'United States', slug: 'knoxville', timezone: 'America/New_York', lat: 35.9606, lng: -83.9207, population: 190740, isActive: false },
  { name: 'Baton Rouge', countryCode: 'US', countryName: 'United States', slug: 'baton-rouge', timezone: 'America/Chicago', lat: 30.4515, lng: -91.1871, population: 227470, isActive: false },
  { name: 'Birmingham', countryCode: 'US', countryName: 'United States', slug: 'birmingham-us', timezone: 'America/Chicago', lat: 33.5207, lng: -86.8025, population: 200733, isActive: false },

  // === Additional European cities ===
  { name: 'Bratislava', countryCode: 'SK', countryName: 'Slovakia', slug: 'bratislava', timezone: 'Europe/Prague', lat: 48.1486, lng: 17.1077, population: 432864, isActive: false },
  { name: 'Ljubljana', countryCode: 'SI', countryName: 'Slovenia', slug: 'ljubljana', timezone: 'Europe/Berlin', lat: 46.0569, lng: 14.5058, population: 295504, isActive: false },
  { name: 'Zagreb', countryCode: 'HR', countryName: 'Croatia', slug: 'zagreb', timezone: 'Europe/Berlin', lat: 45.815, lng: 15.9819, population: 806341, isActive: false },
  { name: 'Belgrade', countryCode: 'RS', countryName: 'Serbia', slug: 'belgrade', timezone: 'Europe/Berlin', lat: 44.7866, lng: 20.4489, population: 1397939, isActive: false },
  { name: 'Tallinn', countryCode: 'EE', countryName: 'Estonia', slug: 'tallinn', timezone: 'Europe/Helsinki', lat: 59.437, lng: 24.7536, population: 437619, isActive: false },
  { name: 'Riga', countryCode: 'LV', countryName: 'Latvia', slug: 'riga', timezone: 'Europe/Helsinki', lat: 56.9496, lng: 24.1052, population: 614618, isActive: false },
  { name: 'Vilnius', countryCode: 'LT', countryName: 'Lithuania', slug: 'vilnius', timezone: 'Europe/Helsinki', lat: 54.6872, lng: 25.2797, population: 580020, isActive: false },
  { name: 'Reykjavik', countryCode: 'IS', countryName: 'Iceland', slug: 'reykjavik', timezone: 'Atlantic/Reykjavik', lat: 64.1466, lng: -21.9426, population: 131136, isActive: false },
  { name: 'Luxembourg', countryCode: 'LU', countryName: 'Luxembourg', slug: 'luxembourg', timezone: 'Europe/Brussels', lat: 49.6117, lng: 6.13, population: 124528, isActive: false },

  // Additional Asian cities
  { name: 'Hanoi', countryCode: 'VN', countryName: 'Vietnam', slug: 'hanoi', timezone: 'Asia/Bangkok', lat: 21.0285, lng: 105.8542, population: 8053663, isActive: false },
  { name: 'Doha', countryCode: 'QA', countryName: 'Qatar', slug: 'doha', timezone: 'Asia/Riyadh', lat: 25.2854, lng: 51.531, population: 1850000, isActive: false },
  { name: 'Kuwait City', countryCode: 'KW', countryName: 'Kuwait', slug: 'kuwait-city', timezone: 'Asia/Riyadh', lat: 29.3759, lng: 47.9774, population: 2989000, isActive: false },
  { name: 'Muscat', countryCode: 'OM', countryName: 'Oman', slug: 'muscat', timezone: 'Asia/Dubai', lat: 23.588, lng: 58.3829, population: 1421409, isActive: false },
  { name: 'Bahrain', countryCode: 'BH', countryName: 'Bahrain', slug: 'bahrain', timezone: 'Asia/Riyadh', lat: 26.0667, lng: 50.5577, population: 1501635, isActive: false },
];

// ── Popular Pairs (200+) ──────────────────────────────
const POPULAR_PAIRS: [string, string][] = [
  // Top worldwide popular conversions (diverse first)
  ['new-york', 'london'], ['london', 'tokyo'], ['sydney', 'london'],
  ['tokyo', 'singapore'], ['new-york', 'paris'], ['dubai', 'london'],
  ['los-angeles', 'tokyo'], ['london', 'mumbai'], ['singapore', 'sydney'],
  ['hong-kong', 'london'], ['new-york', 'tokyo'], ['paris', 'berlin'],
  ['seoul', 'tokyo'], ['dubai', 'mumbai'], ['new-york', 'dubai'],
  ['toronto', 'london'], ['sao-paulo', 'new-york'], ['auckland', 'sydney'],
  ['london', 'istanbul'], ['mexico-city', 'new-york'],
  // More US to Europe
  ['new-york', 'berlin'], ['new-york', 'madrid'],
  ['new-york', 'rome'], ['new-york', 'amsterdam'], ['new-york', 'dublin'], ['new-york', 'zurich'],
  ['new-york', 'brussels'], ['new-york', 'vienna'], ['new-york', 'stockholm'], ['new-york', 'oslo'],
  ['new-york', 'copenhagen'], ['new-york', 'helsinki'], ['new-york', 'warsaw'], ['new-york', 'prague'],
  ['new-york', 'budapest'], ['new-york', 'athens'], ['new-york', 'lisbon'], ['new-york', 'barcelona'],
  ['los-angeles', 'london'], ['los-angeles', 'paris'], ['los-angeles', 'berlin'],
  ['los-angeles', 'sydney'], ['los-angeles', 'new-york'], ['los-angeles', 'chicago'], ['los-angeles', 'dubai'],
  ['chicago', 'london'], ['chicago', 'paris'], ['chicago', 'berlin'], ['chicago', 'new-york'],
  ['chicago', 'los-angeles'], ['chicago', 'tokyo'], ['chicago', 'toronto'],
  ['san-francisco', 'london'], ['san-francisco', 'paris'], ['san-francisco', 'berlin'], ['san-francisco', 'tokyo'],
  ['san-francisco', 'new-york'], ['san-francisco', 'singapore'], ['san-francisco', 'sydney'],
  ['seattle', 'london'], ['seattle', 'paris'], ['seattle', 'tokyo'], ['seattle', 'berlin'],
  ['boston', 'london'], ['boston', 'paris'], ['boston', 'dublin'], ['boston', 'berlin'],
  ['miami', 'london'], ['miami', 'paris'], ['miami', 'madrid'], ['miami', 'sao-paulo'],
  ['washington-dc', 'london'], ['washington-dc', 'paris'], ['washington-dc', 'berlin'],
  ['denver', 'london'], ['denver', 'new-york'], ['denver', 'los-angeles'],
  ['atlanta', 'london'], ['atlanta', 'paris'], ['atlanta', 'new-york'],
  ['dallas', 'london'], ['dallas', 'new-york'], ['dallas', 'tokyo'],
  ['houston', 'london'], ['houston', 'mexico-city'], ['houston', 'dubai'],
  ['phoenix', 'new-york'], ['phoenix', 'london'], ['phoenix', 'los-angeles'],
  ['las-vegas', 'new-york'], ['las-vegas', 'london'], ['las-vegas', 'tokyo'],
  ['honolulu', 'new-york'], ['honolulu', 'london'], ['honolulu', 'tokyo'], ['honolulu', 'los-angeles'],
  ['austin', 'london'], ['austin', 'new-york'], ['austin', 'san-francisco'],

  // Europe internal
  ['london', 'paris'], ['london', 'berlin'], ['london', 'amsterdam'], ['london', 'dublin'],
  ['london', 'madrid'], ['london', 'rome'], ['london', 'zurich'], ['london', 'brussels'],
  ['london', 'vienna'], ['london', 'stockholm'], ['london', 'oslo'], ['london', 'copenhagen'],
  ['london', 'helsinki'], ['london', 'warsaw'], ['london', 'prague'], ['london', 'budapest'],
  ['london', 'athens'], ['london', 'lisbon'], ['london', 'barcelona'], ['london', 'istanbul'],
  ['london', 'moscow'], ['london', 'munich'], ['london', 'frankfurt'],
  ['paris', 'berlin'], ['paris', 'amsterdam'], ['paris', 'madrid'], ['paris', 'rome'],
  ['paris', 'zurich'], ['paris', 'brussels'], ['paris', 'lisbon'], ['paris', 'barcelona'],
  ['paris', 'vienna'], ['paris', 'munich'], ['paris', 'frankfurt'],
  ['berlin', 'amsterdam'], ['berlin', 'madrid'], ['berlin', 'rome'], ['berlin', 'zurich'],
  ['berlin', 'vienna'], ['berlin', 'warsaw'], ['berlin', 'prague'], ['berlin', 'stockholm'],
  ['berlin', 'copenhagen'], ['berlin', 'helsinki'], ['berlin', 'munich'],
  ['amsterdam', 'paris'], ['amsterdam', 'berlin'], ['amsterdam', 'brussels'], ['amsterdam', 'london'],
  ['madrid', 'barcelona'], ['madrid', 'lisbon'], ['madrid', 'rome'],
  ['rome', 'milan'], ['rome', 'paris'], ['rome', 'berlin'],

  // US to Asia
  ['new-york', 'tokyo'], ['new-york', 'singapore'], ['new-york', 'hong-kong'], ['new-york', 'shanghai'],
  ['new-york', 'seoul'], ['new-york', 'mumbai'], ['new-york', 'bangalore'], ['new-york', 'delhi'],
  ['new-york', 'dubai'], ['new-york', 'sydney'], ['new-york', 'melbourne'],
  ['los-angeles', 'singapore'], ['los-angeles', 'hong-kong'], ['los-angeles', 'seoul'],
  ['los-angeles', 'mumbai'], ['los-angeles', 'bangalore'], ['los-angeles', 'shanghai'],
  ['san-francisco', 'bangalore'], ['san-francisco', 'mumbai'], ['san-francisco', 'hong-kong'],
  ['san-francisco', 'seoul'], ['san-francisco', 'shanghai'],
  ['chicago', 'mumbai'], ['chicago', 'shanghai'], ['chicago', 'singapore'],
  ['seattle', 'singapore'], ['seattle', 'mumbai'], ['seattle', 'bangalore'],

  // Europe to Asia
  ['london', 'tokyo'], ['london', 'singapore'], ['london', 'hong-kong'], ['london', 'shanghai'],
  ['london', 'seoul'], ['london', 'mumbai'], ['london', 'bangalore'], ['london', 'delhi'],
  ['london', 'dubai'], ['london', 'sydney'], ['london', 'melbourne'], ['london', 'auckland'],
  ['paris', 'tokyo'], ['paris', 'singapore'], ['paris', 'hong-kong'], ['paris', 'dubai'],
  ['berlin', 'tokyo'], ['berlin', 'singapore'], ['berlin', 'hong-kong'],
  ['amsterdam', 'tokyo'], ['amsterdam', 'singapore'],
  ['munich', 'tokyo'], ['frankfurt', 'tokyo'], ['frankfurt', 'singapore'],
  ['zurich', 'singapore'], ['zurich', 'hong-kong'],

  // Asia internal
  ['tokyo', 'singapore'], ['tokyo', 'hong-kong'], ['tokyo', 'seoul'], ['tokyo', 'shanghai'],
  ['tokyo', 'sydney'], ['tokyo', 'mumbai'], ['tokyo', 'bangalore'], ['tokyo', 'dubai'],
  ['singapore', 'hong-kong'], ['singapore', 'tokyo'], ['singapore', 'sydney'],
  ['singapore', 'mumbai'], ['singapore', 'bangalore'], ['singapore', 'kuala-lumpur'],
  ['hong-kong', 'singapore'], ['hong-kong', 'tokyo'], ['hong-kong', 'shanghai'],
  ['hong-kong', 'sydney'], ['hong-kong', 'taipei'],
  ['shanghai', 'tokyo'], ['shanghai', 'singapore'], ['shanghai', 'hong-kong'],
  ['seoul', 'tokyo'], ['seoul', 'shanghai'], ['seoul', 'singapore'],
  ['mumbai', 'singapore'], ['mumbai', 'dubai'], ['mumbai', 'london'],
  ['bangalore', 'singapore'], ['bangalore', 'london'], ['bangalore', 'san-francisco'],
  ['delhi', 'dubai'], ['delhi', 'london'], ['delhi', 'singapore'],
  ['dubai', 'london'], ['dubai', 'singapore'], ['dubai', 'mumbai'], ['dubai', 'tokyo'],
  ['dubai', 'new-york'],

  // Americas
  ['new-york', 'toronto'], ['new-york', 'montreal'], ['new-york', 'vancouver'],
  ['new-york', 'mexico-city'], ['new-york', 'sao-paulo'], ['new-york', 'buenos-aires'],
  ['los-angeles', 'toronto'], ['los-angeles', 'vancouver'], ['los-angeles', 'mexico-city'],
  ['chicago', 'mexico-city'], ['miami', 'buenos-aires'], ['miami', 'mexico-city'],
  ['toronto', 'london'], ['toronto', 'paris'], ['toronto', 'vancouver'],
  ['vancouver', 'toronto'], ['vancouver', 'london'], ['vancouver', 'tokyo'],
  ['montreal', 'paris'], ['montreal', 'london'],

  // Oceania
  ['sydney', 'london'], ['sydney', 'new-york'], ['sydney', 'auckland'], ['sydney', 'melbourne'],
  ['sydney', 'singapore'], ['sydney', 'tokyo'], ['sydney', 'hong-kong'],
  ['melbourne', 'london'], ['melbourne', 'new-york'], ['melbourne', 'auckland'],
  ['melbourne', 'singapore'], ['melbourne', 'tokyo'],
  ['auckland', 'london'], ['auckland', 'new-york'], ['auckland', 'sydney'],
];

// Default SEO templates
const SEO_TEMPLATES = [
  {
    scope: 'pair',
    titleTpl: '{fromCity} to {toCity} Time Converter | MeetZone',
    metaTpl: 'Convert time between {fromCity}, {fromCountry} and {toCity}, {toCountry}. Current time difference, DST info, and meeting planner.',
    introTpl: 'Easily convert time between {fromCity} ({fromZone}) and {toCity} ({toZone}). See the current time difference, DST information, and find the best meeting times.',
    faqTplJson: JSON.stringify([
      { q: 'What is the time difference between {fromCity} and {toCity}?', a: 'The time difference between {fromCity} and {toCity} varies depending on DST. Check our converter for the exact current difference.' },
      { q: 'When is the best time to call from {fromCity} to {toCity}?', a: 'The best time to call is during overlapping business hours, typically between 9 AM and 5 PM in both cities.' },
      { q: 'Does {fromCity} observe Daylight Saving Time?', a: 'Check the DST section above for current DST status of {fromCity}.' },
      { q: 'Does {toCity} observe Daylight Saving Time?', a: 'Check the DST section above for current DST status of {toCity}.' },
      { q: 'How do I schedule a meeting between {fromCity} and {toCity}?', a: 'Use our meeting planner to find overlapping work hours between the two cities.' },
      { q: 'What timezone is {fromCity} in?', a: '{fromCity} is in the {fromZone} timezone.' },
    ]),
  },
  {
    scope: 'global',
    titleTpl: 'MeetZone — Time Zone Converter & Meeting Planner',
    metaTpl: 'Convert time between any two cities worldwide. Plan meetings across timezones with DST support.',
    introTpl: 'MeetZone helps you convert time between cities and plan meetings across timezones.',
    faqTplJson: '[]',
  },
  {
    scope: 'meeting',
    titleTpl: 'Meeting Planner | MeetZone',
    metaTpl: 'Plan your next meeting across multiple timezones. Find the best time that works for everyone.',
    introTpl: 'Use MeetZone Meeting Planner to find the perfect meeting time across different timezones.',
    faqTplJson: '[]',
  },
];

const GLOBAL_FAQS = [
  { q: 'What is MeetZone?', a: 'MeetZone is a free online tool for converting time between cities and planning meetings across timezones. We support 300+ cities worldwide with accurate DST handling.' },
  { q: 'Is MeetZone free to use?', a: 'Yes, MeetZone is completely free. We provide time zone conversion, meeting planning, and world clock features at no cost.' },
  { q: 'Does MeetZone handle Daylight Saving Time?', a: 'Yes, MeetZone automatically accounts for DST (Daylight Saving Time) transitions using IANA timezone data, so you always get accurate time conversions.' },
  { q: 'How many cities does MeetZone support?', a: 'MeetZone supports 300+ major cities across all continents, covering all major timezones.' },
  { q: 'Can I share meeting times?', a: 'Yes! Use our Meeting Planner to create a shareable link with meeting details across multiple timezones.' },
  { q: 'How do I add a city to the world clock?', a: 'Visit the World Clock page and use the search to add up to 12 cities to your personalized world clock.' },
];

const BLOG_POSTS = [
  {
    slug: 'understanding-time-zones',
    title: 'Understanding Time Zones: A Complete Guide',
    excerpt: 'Learn how time zones work, why they exist, and how they affect global communication.',
    contentHtml: `# Understanding Time Zones: A Complete Guide

Time zones are regions of the Earth that have the same standard time. There are 24 primary time zones, each roughly 15 degrees of longitude wide.

## Why Do We Have Time Zones?

Before the advent of railways and telecommunications, cities set their clocks based on the local position of the sun. As transportation and communication improved, this became increasingly impractical. In 1884, the International Meridian Conference established a system of time zones based on the Prime Meridian at Greenwich, England.

## How Time Zones Work

The Earth rotates 360° in approximately 24 hours, meaning it rotates 15° per hour. Time zones are generally defined by these 15° intervals, though political boundaries often modify the exact borders.

## UTC: The Reference Point

Coordinated Universal Time (UTC) is the primary time standard by which the world regulates clocks. It is within about 1 second of mean solar time at 0° longitude.

## Tips for Working Across Time Zones

1. **Use IANA timezone names** (like "America/New_York") rather than abbreviations
2. **Always consider DST** when scheduling future events
3. **Use tools like MeetZone** to automatically handle conversions
4. **Schedule meetings during overlapping business hours** when possible`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'daylight-saving-time-guide',
    title: 'Daylight Saving Time Explained: When, Where, and Why',
    excerpt: 'Everything you need to know about DST, including which countries observe it and when clocks change.',
    contentHtml: `# Daylight Saving Time Explained

Daylight Saving Time (DST) is the practice of setting clocks forward by one hour during warmer months so that darkness falls at a later time. Not all countries observe DST, and the dates of transition vary.

## Who Observes DST?

- **United States & Canada**: Most states/provinces (except Arizona, Hawaii, Saskatchewan)
- **European Union**: All member states
- **Australia**: New South Wales, Victoria, South Australia, Tasmania, ACT
- **Not observed**: Most of Asia, Africa, and South America

## When Do Clocks Change?

- **US/Canada**: Spring forward 2nd Sunday March; Fall back 1st Sunday November
- **EU**: Spring forward last Sunday March; Fall back last Sunday October
- **Australia**: Spring forward 1st Sunday October; Fall back 1st Sunday April

## Impact on Time Differences

DST can change the time difference between cities. For example, New York to London is normally 5 hours, but during the weeks when only one has changed clocks, it can be 4 or 6 hours.

## Tips for Managing DST

1. Always use timezone-aware datetime libraries
2. Store dates in UTC and convert for display
3. Use MeetZone to automatically handle DST transitions`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'best-meeting-times-across-timezones',
    title: 'How to Find the Best Meeting Times Across Time Zones',
    excerpt: 'Tips and strategies for scheduling meetings with teams across multiple time zones.',
    contentHtml: `# How to Find the Best Meeting Times Across Time Zones

Scheduling meetings across time zones is one of the biggest challenges for global teams. Here are proven strategies to make it easier.

## The Golden Rule: Overlap Hours

The key is finding hours where all participants are within reasonable working hours (typically 8 AM to 6 PM local time).

## Strategy 1: Rotating Meeting Times

Instead of always favoring one timezone, rotate the meeting time so the inconvenience is shared equally among all team members.

## Strategy 2: Core Overlap Hours

For US East Coast to Central Europe:
- 9 AM - 12 PM ET = 3 PM - 6 PM CET (good overlap)
- 8 AM ET = 2 PM CET (early but acceptable for both)

For US West Coast to Asia:
- Evening PST = Morning Asia (the next day)
- Consider async communication for non-urgent matters

## Strategy 3: Use Tools

MeetZone's Meeting Planner helps you visualize overlap between multiple cities and find the best times automatically.

## Best Practices

1. Send calendar invites with timezone info
2. Use a consistent timezone reference (UTC) in written communication
3. Be mindful of DST transitions
4. Consider recording meetings for those who can't attend`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'world-clock-productivity',
    title: 'How a World Clock Boosts Productivity for Remote Teams',
    excerpt: 'Why every remote worker needs a world clock and how to set one up effectively.',
    contentHtml: `# How a World Clock Boosts Productivity

For remote workers and global teams, a world clock is an essential productivity tool. Here's why and how to use one effectively.

## Why You Need a World Clock

1. **Instant awareness** of team members' local times
2. **Better communication** - know when to send messages vs. emails
3. **Meeting planning** becomes faster
4. **Avoid social faux pas** - don't call someone at 3 AM

## Setting Up Your World Clock

Add cities where your key contacts are located:
- Your own city
- Your manager's city
- Key client cities
- Team member locations

## Pro Tips

- Group related timezones together
- Note which cities observe DST
- Check the clock before sending "urgent" messages
- Use MeetZone's World Clock feature for a clean, always-updated display`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'iana-timezone-database',
    title: 'The IANA Time Zone Database: What It Is and Why It Matters',
    excerpt: 'Understanding the authoritative source for timezone data used by computers worldwide.',
    contentHtml: `# The IANA Time Zone Database

The IANA (Internet Assigned Numbers Authority) Time Zone Database, also known as the tz database or zoneinfo, is the most widely used timezone reference in computing.

## What Is It?

The tz database contains the history of local time for many representative locations around the globe. It is updated regularly to reflect changes in timezone rules made by governments.

## IANA Timezone Names

IANA uses the format "Area/Location", for example:
- America/New_York
- Europe/London
- Asia/Tokyo
- Australia/Sydney

## Why Use IANA Names?

1. **Unambiguous**: "EST" could mean Eastern US or Eastern Australia
2. **DST-aware**: The database knows when DST transitions occur
3. **Historical accuracy**: Contains historical timezone data
4. **Widely supported**: Used by all major operating systems and programming languages

## How MeetZone Uses IANA Data

MeetZone uses IANA timezone identifiers to ensure accurate conversions, including proper handling of DST transitions throughout the year.`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'time-zone-etiquette',
    title: 'Time Zone Etiquette: Do\'s and Don\'ts for Global Communication',
    excerpt: 'Essential etiquette tips for communicating across time zones in professional settings.',
    contentHtml: `# Time Zone Etiquette

Working across time zones requires thoughtfulness and respect. Here are essential do's and don'ts.

## Do's

1. **Always mention the timezone** when proposing meeting times
2. **Use the recipient's local time** in communications
3. **Set "Do Not Disturb" hours** in your messaging apps
4. **Be flexible** about meeting times
5. **Send agendas in advance** so people can prepare async

## Don'ts

1. **Don't assume everyone is in your timezone**
2. **Don't schedule meetings outside 8 AM - 7 PM** local time without asking
3. **Don't use timezone abbreviations** (they can be ambiguous)
4. **Don't forget about DST changes** when scheduling recurring meetings
5. **Don't expect immediate responses** from people in different time zones

## The Async-First Approach

For global teams, defaulting to asynchronous communication reduces timezone friction:
- Use shared documents instead of live meetings for updates
- Record video messages instead of requiring live attendance
- Set realistic response time expectations (24 hours, not 1 hour)`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'utc-explained',
    title: 'UTC vs GMT: What\'s the Difference?',
    excerpt: 'Understand the difference between UTC and GMT, and when to use each.',
    contentHtml: `# UTC vs GMT: What's the Difference?

UTC (Coordinated Universal Time) and GMT (Greenwich Mean Time) are often used interchangeably, but there are important differences.

## GMT (Greenwich Mean Time)

GMT is the mean solar time at the Royal Observatory in Greenwich, London. It was the world time standard before UTC.

## UTC (Coordinated Universal Time)

UTC is the primary time standard used worldwide. It is based on International Atomic Time (TAI) with occasional leap seconds to stay synchronized with Earth's rotation.

## Key Differences

| Feature | UTC | GMT |
|---------|-----|-----|
| Basis | Atomic clocks | Earth's rotation |
| Precision | Extremely precise | Less precise |
| Leap seconds | Yes | N/A |
| Usage | Technical standard | Common reference |

## Which Should You Use?

For technical purposes (programming, databases), always use UTC. For casual conversation, both are acceptable. MeetZone uses UTC as the internal reference and converts to local times for display.`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'international-date-line',
    title: 'The International Date Line: Where Today Becomes Tomorrow',
    excerpt: 'Learn about the International Date Line and how it affects time when traveling.',
    contentHtml: `# The International Date Line

The International Date Line (IDL) is an imaginary line on the surface of the Earth roughly following the 180° meridian, where the date changes by one day when crossing it.

## How It Works

- Traveling **west** across the IDL: advance one day (Monday becomes Tuesday)
- Traveling **east** across the IDL: go back one day (Tuesday becomes Monday)

## Why It's Not Straight

The IDL zigzags to avoid splitting countries or island groups into two different calendar days. Notable deviations include:
- Russia (to keep all of eastern Russia on the same date)
- Kiribati (moved the line east in 1995 to be all on the same date)
- Samoa (switched sides in 2011)

## Practical Impact

When scheduling meetings between cities on opposite sides of the IDL (e.g., Tokyo and Los Angeles), be extra careful with dates. MeetZone handles this automatically, showing both the time and the date difference.`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'remote-work-time-management',
    title: '10 Time Management Tips for Remote Workers in Different Time Zones',
    excerpt: 'Practical time management strategies for remote teams spread across the globe.',
    contentHtml: `# 10 Time Management Tips for Remote Workers

Managing your time effectively across time zones is crucial for remote work success.

## 1. Block Your Calendar

Reserve focused work time and mark it clearly. Others can see when you're available.

## 2. Establish Core Hours

Agree on 2-4 hours of daily overlap with your team for real-time communication.

## 3. Front-load Communication

Start your day by responding to messages from other timezones that arrived overnight.

## 4. Use Status Indicators

Set your status in Slack/Teams to show your current availability and local time.

## 5. Batch Meetings

Group meetings together to preserve large blocks of uninterrupted work time.

## 6. Document Everything

Write down decisions and updates so team members in other timezones stay informed.

## 7. Set Boundaries

Establish and communicate your working hours clearly. Stick to them.

## 8. Leverage Time Zone Differences

Use "follow-the-sun" workflows where work progresses across timezones.

## 9. Use MeetZone

Keep a world clock visible and use the meeting planner for scheduling.

## 10. Be Patient

Working across time zones means slower communication. Embrace async work and plan accordingly.`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'time-zone-converter-tips',
    title: 'How to Use a Time Zone Converter Like a Pro',
    excerpt: 'Master the art of time zone conversion with these practical tips and common pitfalls to avoid.',
    contentHtml: `# How to Use a Time Zone Converter Like a Pro

Time zone converters are simple tools, but knowing how to use them effectively can save you a lot of headaches.

## Common Mistakes

1. **Forgetting DST**: A conversion that's correct today might be wrong next month
2. **Using abbreviations**: CST could be Central Standard (US), China Standard, or Cuba Standard
3. **Ignoring the date**: The date might change when converting across many timezones
4. **Not double-checking**: Always verify important meetings with a reliable tool

## Pro Tips

1. **Bookmark your frequent conversions** on MeetZone
2. **Check the DST indicator** before scheduling future events
3. **Use the meeting planner** for multi-city coordination
4. **Share conversion links** with meeting participants
5. **Set reminders** accounting for timezone differences

## When Precision Matters

For critical events (flights, live broadcasts, trading), always:
- Convert using IANA timezone names
- Verify DST status for both locations
- Include the date with the time
- Use a trusted converter like MeetZone`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'countries-without-dst',
    title: 'Countries That Don\'t Observe Daylight Saving Time',
    excerpt: 'A complete list of countries and regions that don\'t change their clocks for DST.',
    contentHtml: `# Countries Without Daylight Saving Time

While DST is common in North America and Europe, most of the world doesn't observe it.

## Regions That DON'T Use DST

### Asia
Most Asian countries don't observe DST, including China, Japan, India, South Korea, and Southeast Asian nations.

### Africa
Most African countries don't observe DST. Morocco is a notable exception.

### South America
Most South American countries have abandoned DST. Brazil stopped in 2019.

## Notable US Exceptions

- **Arizona** (except the Navajo Nation)
- **Hawaii**

## Why Some Countries Stopped

Many countries have abandoned DST citing:
- Health concerns (sleep disruption)
- Minimal energy savings
- Confusion in international business
- Public opposition

## The Global Trend

The trend is moving away from DST. The European Union considered ending DST in 2021, and many countries have abolished it in recent years.

## How This Affects You

When converting time to/from countries without DST, the time difference may change seasonally if YOUR country observes DST. Use MeetZone to always get the correct current difference.`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
  {
    slug: 'scheduling-across-pacific',
    title: 'Scheduling Meetings Across the Pacific: US, Asia & Australia',
    excerpt: 'Navigate the challenge of scheduling meetings spanning the Pacific time zones.',
    contentHtml: `# Scheduling Across the Pacific

The Pacific spans the largest time differences, making scheduling particularly challenging.

## The Challenge

- New York to Tokyo: 14 hours difference
- Los Angeles to Sydney: 17-19 hours (varies with DST)
- San Francisco to Singapore: 15-16 hours

## Finding Overlap

### US West Coast ↔ East Asia
- 5 PM PST = 10 AM JST (next day) — End of US day, start of Japan day
- 7 AM PST = 12 AM JST (midnight) — Not ideal for Japan

### US East Coast ↔ Australia
- 7 PM EST = 11 AM AEDT (next day) — Evening US, morning Australia
- 8 AM EST = 12 AM AEDT — Midnight in Australia

## Best Strategies

1. **Alternate meeting times** between favorable slots for each region
2. **Record all meetings** for async viewing
3. **Use a middle-ground timezone** (e.g., Hawaii) as a reference
4. **Consider splitting into regional pods** with async handoffs

## Use MeetZone

Our meeting planner visually shows overlap windows, making it easy to find the rare sweet spots for trans-Pacific meetings.`,
    isPublished: true,
    publishedAt: new Date(),
    tags: [],
  },
];

// ── SEED FUNCTION ─────────────────────────────────────
async function main() {
  console.log('🌱 Starting seed...');

  // 1. Admin user
  const email = process.env.ADMIN_EMAIL || 'admin@meetzone.es';
  const password = process.env.ADMIN_PASSWORD || 'Anonymous263';
  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: { email, passwordHash, role: 'ADMIN' },
  });
  console.log(`✅ Admin user: ${email}`);

  // 2. Site settings
  const siteUrl = process.env.SITE_URL || 'https://meetzone.es';
  const defaultSettings: Record<string, string> = {
    siteUrl,
    siteName: 'MeetZone',
    siteDescription: 'Time Zone Converter & Meeting Planner',
    socialTwitter: '',
    socialFacebook: '',
    analyticsGa4: '',
    canonicalPolicy: 'enforce',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log('✅ Site settings seeded');

  // 3. Timezones
  // Add Boise timezone if not in list (for the city)
  const allTimezones = [...TIMEZONES, { ianaName: 'America/Boise', label: 'Mountain Time (Boise)', region: 'North America' }, { ianaName: 'Atlantic/Reykjavik', label: 'Greenwich Mean Time (Iceland)', region: 'Europe' }];
  
  const tzMap = new Map<string, string>();
  for (const tz of allTimezones) {
    const result = await prisma.timezone.upsert({
      where: { ianaName: tz.ianaName },
      update: { label: tz.label, region: tz.region },
      create: tz,
    });
    tzMap.set(tz.ianaName, result.id);
  }
  console.log(`✅ ${allTimezones.length} timezones seeded`);

  // 4. Cities
  const cityMap = new Map<string, string>();
  for (const city of CITIES) {
    const timezoneId = tzMap.get(city.timezone);
    if (!timezoneId) {
      console.warn(`⚠️ Timezone ${city.timezone} not found for ${city.name}, skipping`);
      continue;
    }
    const result = await prisma.city.upsert({
      where: { slug: city.slug },
      update: {
        name: city.name,
        countryCode: city.countryCode,
        countryName: city.countryName,
        lat: city.lat,
        lng: city.lng,
        population: city.population,
        isActive: city.isActive,
        timezoneId,
      },
      create: {
        name: city.name,
        countryCode: city.countryCode,
        countryName: city.countryName,
        slug: city.slug,
        lat: city.lat,
        lng: city.lng,
        population: city.population,
        isActive: city.isActive,
        timezoneId,
      },
    });
    cityMap.set(city.slug, result.id);
  }
  console.log(`✅ ${CITIES.length} cities seeded`);

  // 5. Popular pairs
  // Clear existing pairs for clean re-seed with correct priorities
  await prisma.popularPair.deleteMany({});
  let pairCount = 0;
  for (let i = 0; i < POPULAR_PAIRS.length; i++) {
    const [fromSlug, toSlug] = POPULAR_PAIRS[i];
    const fromCityId = cityMap.get(fromSlug);
    const toCityId = cityMap.get(toSlug);
    if (!fromCityId || !toCityId) continue;

    try {
      await prisma.popularPair.create({
        data: {
          fromCityId,
          toCityId,
          slug: `${fromSlug}-to-${toSlug}`,
          priority: i,
        },
      });
      pairCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`✅ ${pairCount} popular pairs seeded`);

  // 6. SEO templates
  for (const tpl of SEO_TEMPLATES) {
    const existing = await prisma.seoTemplate.findFirst({ where: { scope: tpl.scope } });
    if (!existing) {
      await prisma.seoTemplate.create({ data: tpl });
    }
  }
  console.log('✅ SEO templates seeded');

  // 7. Global FAQs
  for (let i = 0; i < GLOBAL_FAQS.length; i++) {
    const faq = GLOBAL_FAQS[i];
    const existing = await prisma.fAQ.findFirst({
      where: { scope: 'global', question: faq.q },
    });
    if (!existing) {
      await prisma.fAQ.create({
        data: {
          scope: 'global',
          question: faq.q,
          answer: faq.a,
          sortOrder: i,
          published: true,
        },
      });
    }
  }
  console.log('✅ Global FAQs seeded');

  // 8. Default AdsSetting
  const existingAds = await prisma.adsSetting.findFirst();
  if (!existingAds) {
    await prisma.adsSetting.create({
      data: {
        provider: 'custom',
        slotsJson: JSON.stringify({
          header: { enabled: false, code: '' },
          sidebar: { enabled: false, code: '' },
          inContent1: { enabled: false, code: '' },
          inContent2: { enabled: false, code: '' },
          footer: { enabled: false, code: '' },
          mobileSticky: { enabled: false, code: '' },
        }),
      },
    });
  }
  console.log('✅ Ads settings seeded');

  // 9. Internal link blocks
  const blocks = ['related_pairs', 'popular_in_country', 'nearby_timezones'];
  for (const blockKey of blocks) {
    const existing = await prisma.internalLinkBlock.findFirst({ where: { blockKey } });
    if (!existing) {
      await prisma.internalLinkBlock.create({
        data: { blockKey, linksJson: JSON.stringify({ enabled: true, maxLinks: 10 }) },
      });
    }
  }
  console.log('✅ Internal link blocks seeded');

  // 10. Blog posts
  for (const post of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`✅ ${BLOG_POSTS.length} blog posts seeded`);

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
