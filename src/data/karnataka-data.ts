export const karnatakaDistricts = [
  "Bagalkot",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Yadgir",
  "Vijayanagara"
];

export interface Crop {
  id: string;
  name: string;
  localName: string;
  category: string;
  unit: string;
  image: string;
}

export const crops: Crop[] = [
  { id: "1", name: "Rice (Paddy)", localName: "ಭತ್ತ", category: "Cereals", unit: "Quintal", image: "🌾" },
  { id: "2", name: "Wheat", localName: "ಗೋಧಿ", category: "Cereals", unit: "Quintal", image: "🌾" },
  { id: "3", name: "Ragi (Finger Millet)", localName: "ರಾಗಿ", category: "Millets", unit: "Quintal", image: "🌿" },
  { id: "4", name: "Jowar (Sorghum)", localName: "ಜೋಳ", category: "Millets", unit: "Quintal", image: "🌿" },
  { id: "5", name: "Maize", localName: "ಮೆಕ್ಕೆಜೋಳ", category: "Cereals", unit: "Quintal", image: "🌽" },
  { id: "6", name: "Tur (Arhar)", localName: "ತೊಗರಿ", category: "Pulses", unit: "Quintal", image: "🫘" },
  { id: "7", name: "Groundnut", localName: "ಕಡಲೆಕಾಯಿ", category: "Oilseeds", unit: "Quintal", image: "🥜" },
  { id: "8", name: "Sunflower", localName: "ಸೂರ್ಯಕಾಂತಿ", category: "Oilseeds", unit: "Quintal", image: "🌻" },
  { id: "9", name: "Cotton", localName: "ಹತ್ತಿ", category: "Cash Crops", unit: "Quintal", image: "☁️" },
  { id: "10", name: "Sugarcane", localName: "ಕಬ್ಬು", category: "Cash Crops", unit: "Tonne", image: "🎋" },
  { id: "11", name: "Tomato", localName: "ಟೊಮೇಟೊ", category: "Vegetables", unit: "Quintal", image: "🍅" },
  { id: "12", name: "Onion", localName: "ಈರುಳ್ಳಿ", category: "Vegetables", unit: "Quintal", image: "🧅" },
  { id: "13", name: "Potato", localName: "ಆಲೂಗಡ್ಡೆ", category: "Vegetables", unit: "Quintal", image: "🥔" },
  { id: "14", name: "Green Chilli", localName: "ಹಸಿ ಮೆಣಸು", category: "Vegetables", unit: "Quintal", image: "🌶️" },
  { id: "15", name: "Banana", localName: "ಬಾಳೆಹಣ್ಣು", category: "Fruits", unit: "Quintal", image: "🍌" },
  { id: "16", name: "Mango", localName: "ಮಾವು", category: "Fruits", unit: "Quintal", image: "🥭" },
  { id: "17", name: "Coconut", localName: "ತೆಂಗಿನಕಾಯಿ", category: "Plantation", unit: "1000 Nuts", image: "🥥" },
  { id: "18", name: "Arecanut", localName: "ಅಡಿಕೆ", category: "Plantation", unit: "Quintal", image: "🌴" },
  { id: "19", name: "Coffee", localName: "ಕಾಫಿ", category: "Plantation", unit: "Quintal", image: "☕" },
  { id: "20", name: "Black Pepper", localName: "ಕಾಳು ಮೆಣಸು", category: "Spices", unit: "Quintal", image: "⚫" },
  { id: "21", name: "Cardamom", localName: "ಏಲಕ್ಕಿ", category: "Spices", unit: "Kg", image: "🫛" },
  { id: "22", name: "Turmeric", localName: "ಅರಿಶಿನ", category: "Spices", unit: "Quintal", image: "🟡" },
  { id: "23", name: "Bengal Gram", localName: "ಕಡಲೆ", category: "Pulses", unit: "Quintal", image: "🫘" },
  { id: "24", name: "Green Gram", localName: "ಹೆಸರು", category: "Pulses", unit: "Quintal", image: "🫛" },
  { id: "25", name: "Soybean", localName: "ಸೋಯಾಬೀನ್", category: "Oilseeds", unit: "Quintal", image: "🫘" },
];

export interface PriceData {
  cropId: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  previousPrice: number;
  date: string;
  market: string;
}

// Generate mock price data
const generatePriceData = (): PriceData[] => {
  const today = new Date().toISOString().split('T')[0];
  const data: PriceData[] = [];
  
  const basePrices: Record<string, { min: number; max: number }> = {
    "1": { min: 2200, max: 2800 },
    "2": { min: 2400, max: 3000 },
    "3": { min: 3200, max: 3800 },
    "4": { min: 2800, max: 3400 },
    "5": { min: 1800, max: 2400 },
    "6": { min: 6500, max: 7500 },
    "7": { min: 5500, max: 6500 },
    "8": { min: 5000, max: 6000 },
    "9": { min: 6800, max: 7800 },
    "10": { min: 320, max: 380 },
    "11": { min: 1500, max: 3500 },
    "12": { min: 1200, max: 2800 },
    "13": { min: 1800, max: 2600 },
    "14": { min: 2500, max: 4500 },
    "15": { min: 1800, max: 2800 },
    "16": { min: 3500, max: 8000 },
    "17": { min: 22000, max: 28000 },
    "18": { min: 42000, max: 48000 },
    "19": { min: 18000, max: 24000 },
    "20": { min: 45000, max: 55000 },
    "21": { min: 1200, max: 1800 },
    "22": { min: 12000, max: 16000 },
    "23": { min: 5500, max: 6500 },
    "24": { min: 7500, max: 8500 },
    "25": { min: 4500, max: 5500 },
  };

  karnatakaDistricts.forEach(district => {
    crops.forEach(crop => {
      const base = basePrices[crop.id] || { min: 2000, max: 3000 };
      const variation = Math.random() * 0.2 - 0.1;
      const minPrice = Math.round(base.min * (1 + variation));
      const maxPrice = Math.round(base.max * (1 + variation));
      const modalPrice = Math.round((minPrice + maxPrice) / 2);
      const prevVariation = Math.random() * 0.1 - 0.05;
      const previousPrice = Math.round(modalPrice * (1 + prevVariation));

      data.push({
        cropId: crop.id,
        district,
        minPrice,
        maxPrice,
        modalPrice,
        previousPrice,
        date: today,
        market: `${district} APMC`
      });
    });
  });

  return data;
};

export const priceData = generatePriceData();

export const categories = [...new Set(crops.map(c => c.category))];
