/*
 * Hindi / common Indian names -> English, used to find product photos
 * (e.g. "Aloo" -> "potato", "Bhindi Cut" -> "okra").
 */

// Devanagari names (when the product name is written in Hindi)
const HINDI: [string, string][] = [
  ["आलू", "potato"], ["प्याज", "onion"], ["टमाटर", "tomato"], ["भिंडी", "okra"], ["करेला", "bitter gourd"],
  ["लौकी", "bottle gourd"], ["टिंडा", "round gourd tinda"], ["तोरई", "ridge gourd"], ["तुरई", "ridge gourd"],
  ["पत्ता गोभी", "cabbage"], ["बंद गोभी", "cabbage"], ["फूल गोभी", "cauliflower"], ["गोभी", "cauliflower"],
  ["मटर", "green peas"], ["शिमला मिर्च", "green capsicum"], ["हरी मिर्च", "green chili pepper"], ["पालक", "spinach"],
  ["मेथी", "fenugreek leaves"], ["धनिया", "coriander leaves"], ["पुदीना", "mint leaves"], ["अदरक", "ginger root"],
  ["लहसुन", "garlic"], ["गाजर", "carrot"], ["मूली", "white radish"], ["बैंगन", "eggplant brinjal"], ["कद्दू", "pumpkin"],
  ["अरबी", "taro root"], ["शकरकंद", "sweet potato"], ["खीरा", "cucumber"], ["नींबू", "lemon"], ["चुकंदर", "beetroot"],
  ["बीन्स", "green beans"], ["परवल", "pointed gourd"], ["केला", "banana"], ["सेब", "apple"], ["आम", "mango"],
];

const NAMES: [string[], string][] = [
  [["aloo", "alu", "aaloo"], "potato"],
  [["pyaz", "pyaaz", "onion", "kanda"], "onion"],
  [["tamatar", "tomato"], "tomato"],
  [["bhindi", "lady finger", "ladyfinger"], "okra"],
  [["karela"], "bitter gourd"],
  [["lauki", "ghiya", "dudhi"], "bottle gourd"],
  [["tinda"], "round gourd tinda"],
  [["turai", "tori", "torai", "tauri"], "ridge gourd"],
  [["band gobi", "patta gobi", "bandh gobi", "cabbage"], "cabbage"],
  [["phool gobi", "gobi", "gobhi", "cauliflower"], "cauliflower"],
  [["matar", "mattar", "peas"], "green peas"],
  [["shimla mirch", "simla mirch", "capsicum"], "green capsicum"],
  [["hari mirch", "green chilli", "green chillies", "mirchi"], "green chili pepper"],
  [["palak"], "spinach"],
  [["methi"], "fenugreek leaves"],
  [["dhaniya", "dhania", "coriander"], "coriander leaves"],
  [["pudina", "mint"], "mint leaves"],
  [["adrak", "ginger"], "ginger root"],
  [["lehsun", "lahsun", "garlic"], "garlic"],
  [["gajar", "carrot"], "carrot"],
  [["mooli", "radish"], "white radish"],
  [["baingan", "brinjal", "bengan"], "eggplant brinjal"],
  [["kaddu", "sitaphal", "pumpkin"], "pumpkin"],
  [["arbi", "colocasia"], "taro root"],
  [["shakarkandi", "sweet potato"], "sweet potato"],
  [["kheera", "khira", "cucumber"], "cucumber"],
  [["nimbu", "lemon"], "lemon"],
  [["salad patta", "lettuce"], "lettuce"],
  [["sem", "beans", "french beans"], "green beans"],
  [["chukandar", "beetroot"], "beetroot"],
  [["shalgam", "turnip"], "turnip"],
  [["kathal", "jackfruit"], "jackfruit"],
  [["parwal", "parval"], "pointed gourd"],
  [["kela", "banana"], "banana"],
  [["seb", "apple"], "apple"],
  [["aam", "mango"], "mango"],
  [["santra", "narangi", "orange"], "orange fruit"],
  [["angoor", "grapes"], "grapes"],
  [["anar", "pomegranate"], "pomegranate"],
  [["papita", "papaya"], "papaya"],
  [["tarbooj", "watermelon"], "watermelon"],
  [["amrood", "guava"], "guava"],
  [["mushroom", "khumb"], "mushroom"],
  [["corn", "makka", "bhutta"], "sweet corn"],
  [["broccoli"], "broccoli"],
  [["sprouts", "ankurit"], "sprouts"],
];

// words that describe the cut, not the vegetable
const FILLER = new Set(["fresh", "cut", "chopped", "cubes", "cube", "diced", "sticks", "slices", "sliced", "leaves", "leaf", "peeled", "clean", "washed", "pack", "combo", "mix", "the", "and", "with", "ready", "to", "cook"]);

export function englishName(name: string): string {
  for (const [hi, en] of HINDI) if (name.includes(hi)) return en;
  const n = ` ${name.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ")} `;
  for (const [keys, en] of NAMES) {
    if (keys.some((k) => n.includes(` ${k} `)) || n.includes(` ${en} `)) return en;
  }
  return "";
}

/** Words to look for in file names / search queries */
export function nameTokens(name: string): string[] {
  const words = `${name} ${englishName(name)}`
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !FILLER.has(w));
  return Array.from(new Set(words));
}

export function searchQuery(name: string): string {
  const en = englishName(name);
  if (en) return en;
  const words = name.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length >= 3 && !FILLER.has(w));
  return words.join(" ") || name;
}
