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
  // New Fruits
  { id: "26", name: "Papaya", localName: "ಪಪ್ಪಾಯಿ", category: "Fruits", unit: "Quintal", image: "🍈" },
  { id: "27", name: "Guava", localName: "ಸೀಬೆ", category: "Fruits", unit: "Quintal", image: "🍐" },
  { id: "28", name: "Pomegranate", localName: "ದಾಳಿಂಬೆ", category: "Fruits", unit: "Quintal", image: "🍎" },
  { id: "29", name: "Watermelon", localName: "ಕಲ್ಲಂಗಡಿ", category: "Fruits", unit: "Quintal", image: "🍉" },
  { id: "30", name: "Sapota (Chikoo)", localName: "ಸಪೋಟ", category: "Fruits", unit: "Quintal", image: "🟤" },
  { id: "31", name: "Grapes", localName: "ದ್ರಾಕ್ಷಿ", category: "Fruits", unit: "Quintal", image: "🍇" },
  { id: "32", name: "Jackfruit", localName: "ಹಲಸು", category: "Fruits", unit: "Quintal", image: "🟡" },
  { id: "33", name: "Orange", localName: "ಕಿತ್ತಳೆ", category: "Fruits", unit: "Quintal", image: "🍊" },
  { id: "34", name: "Pineapple", localName: "ಅನಾನಸ್", category: "Fruits", unit: "Quintal", image: "🍍" },
  { id: "35", name: "Lime", localName: "ನಿಂಬೆ", category: "Fruits", unit: "Quintal", image: "🍋" },
  // New Vegetables
  { id: "36", name: "Brinjal", localName: "ಬದನೆಕಾಯಿ", category: "Vegetables", unit: "Quintal", image: "🍆" },
  { id: "37", name: "Okra (Lady's Finger)", localName: "ಬೆಂಡೆಕಾಯಿ", category: "Vegetables", unit: "Quintal", image: "🌿" },
  { id: "38", name: "Bitter Gourd", localName: "ಹಾಗಲಕಾಯಿ", category: "Vegetables", unit: "Quintal", image: "🥒" },
  { id: "39", name: "Ridge Gourd", localName: "ಹೀರೆಕಾಯಿ", category: "Vegetables", unit: "Quintal", image: "🥬" },
  { id: "40", name: "Bottle Gourd", localName: "ಸೋರೆಕಾಯಿ", category: "Vegetables", unit: "Quintal", image: "🫑" },
  { id: "41", name: "Capsicum", localName: "ದೊಡ್ಡ ಮೆಣಸು", category: "Vegetables", unit: "Quintal", image: "🫑" },
  { id: "42", name: "Cauliflower", localName: "ಹೂಕೋಸು", category: "Vegetables", unit: "Quintal", image: "🥦" },
  { id: "43", name: "Cabbage", localName: "ಎಲೆಕೋಸು", category: "Vegetables", unit: "Quintal", image: "🥬" },
  { id: "44", name: "Carrot", localName: "ಗಾಜರು", category: "Vegetables", unit: "Quintal", image: "🥕" },
  { id: "45", name: "Drumstick", localName: "ನುಗ್ಗೆಕಾಯಿ", category: "Vegetables", unit: "Quintal", image: "🌱" },
  // New Spices
  { id: "46", name: "Coriander", localName: "ಕೊತ್ತಂಬರಿ", category: "Spices", unit: "Quintal", image: "🌿" },
  { id: "47", name: "Cumin (Jeera)", localName: "ಜೀರಿಗೆ", category: "Spices", unit: "Quintal", image: "🌾" },
  { id: "48", name: "Fenugreek (Methi)", localName: "ಮೆಂತ್ಯ", category: "Spices", unit: "Quintal", image: "🟤" },
  { id: "49", name: "Mustard", localName: "ಸಾಸಿವೆ", category: "Spices", unit: "Quintal", image: "🟡" },
  { id: "50", name: "Ginger", localName: "ಶುಂಠಿ", category: "Spices", unit: "Quintal", image: "🫚" },
  { id: "51", name: "Garlic", localName: "ಬೆಳ್ಳುಳ್ಳಿ", category: "Spices", unit: "Quintal", image: "🧄" },
  { id: "52", name: "Dry Chilli", localName: "ಒಣ ಮೆಣಸು", category: "Spices", unit: "Quintal", image: "🌶️" },
  { id: "53", name: "Tamarind", localName: "ಹುಣಸೆ", category: "Spices", unit: "Quintal", image: "🟫" },
  { id: "54", name: "Asafoetida (Hing)", localName: "ಇಂಗು", category: "Spices", unit: "Kg", image: "⚪" },
  { id: "55", name: "Sesame (Til)", localName: "ಎಳ್ಳು", category: "Spices", unit: "Quintal", image: "⚪" },
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

// Fixed fallback price data (used when API is unavailable)
const generateFixedPriceData = (): PriceData[] => {
  const today = new Date().toISOString().split('T')[0];
  const data: PriceData[] = [];
  
  // Fixed base prices per quintal (in INR) - realistic Karnataka APMC prices
  const fixedPrices: Record<string, { min: number; max: number; modal: number; prev: number }> = {
    "1": { min: 2250, max: 2750, modal: 2500, prev: 2480 },    // Rice (Paddy)
    "2": { min: 2450, max: 2950, modal: 2700, prev: 2720 },    // Wheat
    "3": { min: 3350, max: 3750, modal: 3550, prev: 3500 },    // Ragi
    "4": { min: 2950, max: 3350, modal: 3150, prev: 3100 },    // Jowar
    "5": { min: 1950, max: 2350, modal: 2150, prev: 2180 },    // Maize
    "6": { min: 6750, max: 7350, modal: 7050, prev: 6950 },    // Tur
    "7": { min: 5750, max: 6350, modal: 6050, prev: 5980 },    // Groundnut
    "8": { min: 5250, max: 5850, modal: 5550, prev: 5600 },    // Sunflower
    "9": { min: 7050, max: 7650, modal: 7350, prev: 7280 },    // Cotton
    "10": { min: 340, max: 370, modal: 355, prev: 350 },       // Sugarcane
    "11": { min: 1800, max: 3200, modal: 2500, prev: 2650 },   // Tomato
    "12": { min: 1450, max: 2550, modal: 2000, prev: 1850 },   // Onion
    "13": { min: 2050, max: 2450, modal: 2250, prev: 2200 },   // Potato
    "14": { min: 2850, max: 4250, modal: 3550, prev: 3700 },   // Green Chilli
    "15": { min: 2050, max: 2650, modal: 2350, prev: 2300 },   // Banana
    "16": { min: 4250, max: 7250, modal: 5750, prev: 5500 },   // Mango
    "17": { min: 23500, max: 27500, modal: 25500, prev: 25000 }, // Coconut
    "18": { min: 43500, max: 47500, modal: 45500, prev: 44800 }, // Arecanut
    "19": { min: 19500, max: 23500, modal: 21500, prev: 21000 }, // Coffee
    "20": { min: 47500, max: 53500, modal: 50500, prev: 49500 }, // Black Pepper
    "21": { min: 1350, max: 1650, modal: 1500, prev: 1480 },   // Cardamom
    "22": { min: 13500, max: 15500, modal: 14500, prev: 14200 }, // Turmeric
    "23": { min: 5750, max: 6350, modal: 6050, prev: 5980 },   // Bengal Gram
    "24": { min: 7750, max: 8350, modal: 8050, prev: 7950 },   // Green Gram
    "25": { min: 4750, max: 5350, modal: 5050, prev: 4980 },   // Soybean
    // New Fruits
    "26": { min: 1200, max: 2200, modal: 1700, prev: 1650 },   // Papaya
    "27": { min: 1500, max: 2500, modal: 2000, prev: 1950 },   // Guava
    "28": { min: 4500, max: 7500, modal: 6000, prev: 5800 },   // Pomegranate
    "29": { min: 800, max: 1800, modal: 1300, prev: 1250 },    // Watermelon
    "30": { min: 2000, max: 3500, modal: 2750, prev: 2700 },   // Sapota
    "31": { min: 3500, max: 6500, modal: 5000, prev: 4800 },   // Grapes
    "32": { min: 1500, max: 3000, modal: 2250, prev: 2200 },   // Jackfruit
    "33": { min: 2500, max: 4500, modal: 3500, prev: 3400 },   // Orange
    "34": { min: 2000, max: 3500, modal: 2750, prev: 2700 },   // Pineapple
    "35": { min: 3000, max: 6000, modal: 4500, prev: 4300 },   // Lime
    // New Vegetables
    "36": { min: 1000, max: 2500, modal: 1750, prev: 1700 },   // Brinjal
    "37": { min: 1500, max: 3000, modal: 2250, prev: 2200 },   // Okra
    "38": { min: 1200, max: 2800, modal: 2000, prev: 1950 },   // Bitter Gourd
    "39": { min: 800, max: 1800, modal: 1300, prev: 1250 },    // Ridge Gourd
    "40": { min: 600, max: 1500, modal: 1050, prev: 1000 },    // Bottle Gourd
    "41": { min: 2000, max: 4500, modal: 3250, prev: 3100 },   // Capsicum
    "42": { min: 1500, max: 3000, modal: 2250, prev: 2200 },   // Cauliflower
    "43": { min: 800, max: 2000, modal: 1400, prev: 1350 },    // Cabbage
    "44": { min: 1500, max: 3000, modal: 2250, prev: 2200 },   // Carrot
    "45": { min: 2000, max: 4000, modal: 3000, prev: 2900 },   // Drumstick
    // New Spices
    "46": { min: 5500, max: 8500, modal: 7000, prev: 6800 },   // Coriander
    "47": { min: 12000, max: 18000, modal: 15000, prev: 14500 }, // Cumin
    "48": { min: 4500, max: 7000, modal: 5750, prev: 5600 },   // Fenugreek
    "49": { min: 4000, max: 6000, modal: 5000, prev: 4900 },   // Mustard
    "50": { min: 6000, max: 10000, modal: 8000, prev: 7800 },  // Ginger
    "51": { min: 8000, max: 14000, modal: 11000, prev: 10500 }, // Garlic
    "52": { min: 8000, max: 14000, modal: 11000, prev: 10800 }, // Dry Chilli
    "53": { min: 5000, max: 8000, modal: 6500, prev: 6300 },   // Tamarind
    "54": { min: 250000, max: 350000, modal: 300000, prev: 295000 }, // Asafoetida
    "55": { min: 9000, max: 13000, modal: 11000, prev: 10700 }, // Sesame
  };

  karnatakaDistricts.forEach(district => {
    crops.forEach(crop => {
      const prices = fixedPrices[crop.id] || { min: 2500, max: 3000, modal: 2750, prev: 2700 };

      data.push({
        cropId: crop.id,
        district,
        minPrice: prices.min,
        maxPrice: prices.max,
        modalPrice: prices.modal,
        previousPrice: prices.prev,
        date: today,
        market: `${district} APMC`
      });
    });
  });

  return data;
};

export const priceData = generateFixedPriceData();

export const categories = [...new Set(crops.map(c => c.category))];
