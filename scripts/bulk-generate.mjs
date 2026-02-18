/**
 * Offline bulk puzzle generator for GameIQ.
 * Generates 365 puzzles per game from curated data pools.
 * No API key required — runs entirely locally.
 *
 * Usage: node scripts/bulk-generate.mjs [game]
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAMES_DIR = join(__dirname, '..', 'src', 'games');
const TARGET = 365;

// ── Seeded random for reproducibility ────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

// ── PRICECHECK ───────────────────────────────────────────────────

const PRICECHECK_ITEMS = [
  // Rent
  { category: "Rent", item: "Average monthly rent in Manhattan, NY", actualValue: 4500, unit: "$" },
  { category: "Rent", item: "Average monthly rent in San Francisco, CA", actualValue: 3800, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Austin, TX", actualValue: 1750, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Miami, FL", actualValue: 2800, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Chicago, IL", actualValue: 2200, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Denver, CO", actualValue: 2000, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Nashville, TN", actualValue: 1900, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Seattle, WA", actualValue: 2600, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Portland, OR", actualValue: 1800, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Boston, MA", actualValue: 3500, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Los Angeles, CA", actualValue: 3200, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Phoenix, AZ", actualValue: 1600, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Atlanta, GA", actualValue: 1900, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Dallas, TX", actualValue: 1700, unit: "$" },
  { category: "Rent", item: "Average monthly rent in London, UK", actualValue: 3000, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Tokyo, Japan", actualValue: 1500, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Paris, France", actualValue: 2200, unit: "$" },
  { category: "Rent", item: "Average monthly rent in Sydney, Australia", actualValue: 2800, unit: "$" },
  // Salary
  { category: "Salary", item: "Average annual salary of a software engineer in the US", actualValue: 120000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a registered nurse in the US", actualValue: 81000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a teacher in the US", actualValue: 62000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a dentist in the US", actualValue: 170000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a firefighter in the US", actualValue: 56000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a pharmacist in the US", actualValue: 130000, unit: "$" },
  { category: "Salary", item: "Average annual salary of an electrician in the US", actualValue: 61000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a pilot in the US", actualValue: 140000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a lawyer in the US", actualValue: 135000, unit: "$" },
  { category: "Salary", item: "Average annual salary of an accountant in the US", actualValue: 77000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a veterinarian in the US", actualValue: 103000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a data scientist in the US", actualValue: 125000, unit: "$" },
  { category: "Salary", item: "Average annual salary of a plumber in the US", actualValue: 59000, unit: "$" },
  { category: "Salary", item: "Average annual salary of an architect in the US", actualValue: 88000, unit: "$" },
  { category: "Salary", item: "Minimum annual wage working full-time in the US", actualValue: 15080, unit: "$" },
  { category: "Salary", item: "Average annual NFL player salary", actualValue: 3500000, unit: "$" },
  { category: "Salary", item: "Average annual NBA player salary", actualValue: 9700000, unit: "$" },
  // Food
  { category: "Food", item: "Average cost of a dozen eggs in the US", actualValue: 4, unit: "$" },
  { category: "Food", item: "Average cost of a gallon of milk in the US", actualValue: 4, unit: "$" },
  { category: "Food", item: "Average cost of a Big Mac in the US", actualValue: 6, unit: "$" },
  { category: "Food", item: "Calories in a Chipotle burrito", actualValue: 1070, unit: "calories" },
  { category: "Food", item: "Calories in a Krispy Kreme original glazed donut", actualValue: 190, unit: "calories" },
  { category: "Food", item: "Calories in a large McDonald's fries", actualValue: 490, unit: "calories" },
  { category: "Food", item: "Calories in a Starbucks Venti Caramel Frappuccino", actualValue: 470, unit: "calories" },
  { category: "Food", item: "Grams of sugar in a can of Coca-Cola", actualValue: 39, unit: "grams" },
  { category: "Food", item: "Average American annual spending on coffee", actualValue: 1100, unit: "$" },
  { category: "Food", item: "Average cost of Thanksgiving dinner for 10 in the US", actualValue: 65, unit: "$" },
  { category: "Food", item: "Average annual grocery spending per person in the US", actualValue: 5300, unit: "$" },
  { category: "Food", item: "Calories in a Snickers bar", actualValue: 250, unit: "calories" },
  { category: "Food", item: "Average price of a lb of ground beef in the US", actualValue: 5, unit: "$" },
  { category: "Food", item: "Calories in a single Oreo cookie", actualValue: 53, unit: "calories" },
  { category: "Food", item: "Average price of avocado toast at a restaurant", actualValue: 12, unit: "$" },
  // Tech
  { category: "Tech", item: "Original price of the first iPhone (2007)", actualValue: 499, unit: "$" },
  { category: "Tech", item: "Number of apps on the Apple App Store", actualValue: 1800000, unit: "" },
  { category: "Tech", item: "Number of daily active users on Instagram", actualValue: 2000000000, unit: "" },
  { category: "Tech", item: "Cost of the most expensive iPhone 16 Pro Max", actualValue: 1599, unit: "$" },
  { category: "Tech", item: "Average daily screen time for US adults", actualValue: 7, unit: "hours" },
  { category: "Tech", item: "Number of emails sent worldwide per day", actualValue: 350000000000, unit: "" },
  { category: "Tech", item: "Year the first text message was sent", actualValue: 1992, unit: "" },
  { category: "Tech", item: "Storage capacity of the first iPod (GB)", actualValue: 5, unit: "GB" },
  { category: "Tech", item: "Cost of 1 GB of storage in 1980", actualValue: 437500, unit: "$" },
  { category: "Tech", item: "Number of monthly active Wikipedia editors", actualValue: 44000, unit: "" },
  { category: "Tech", item: "Average lifespan of a smartphone", actualValue: 3, unit: "years" },
  { category: "Tech", item: "Percentage of world population with internet access", actualValue: 67, unit: "%" },
  { category: "Tech", item: "Weight of the first portable cell phone (lbs)", actualValue: 2, unit: "lbs" },
  { category: "Tech", item: "Number of YouTube videos uploaded per minute", actualValue: 500, unit: "" },
  // Travel
  { category: "Travel", item: "Distance from New York to Los Angeles (miles)", actualValue: 2451, unit: "miles" },
  { category: "Travel", item: "Flight time from NYC to London (hours)", actualValue: 7, unit: "hours" },
  { category: "Travel", item: "Average cost of a domestic round-trip flight in the US", actualValue: 360, unit: "$" },
  { category: "Travel", item: "Number of countries in the world", actualValue: 195, unit: "" },
  { category: "Travel", item: "Height of the Eiffel Tower (feet)", actualValue: 1083, unit: "ft" },
  { category: "Travel", item: "Depth of the Grand Canyon (feet)", actualValue: 6093, unit: "ft" },
  { category: "Travel", item: "Length of the Great Wall of China (miles)", actualValue: 13171, unit: "miles" },
  { category: "Travel", item: "Average hotel room cost per night in NYC", actualValue: 300, unit: "$" },
  { category: "Travel", item: "Number of passengers at ATL airport per year (millions)", actualValue: 93, unit: "million" },
  { category: "Travel", item: "Speed of a commercial airplane (mph)", actualValue: 575, unit: "mph" },
  { category: "Travel", item: "Distance from Earth to the Moon (miles)", actualValue: 238900, unit: "miles" },
  { category: "Travel", item: "Circumference of the Earth (miles)", actualValue: 24901, unit: "miles" },
  // Sports
  { category: "Sports", item: "Length of a marathon (miles)", actualValue: 26, unit: "miles" },
  { category: "Sports", item: "Weight of an NBA basketball (ounces)", actualValue: 22, unit: "oz" },
  { category: "Sports", item: "Width of an NFL football field (feet)", actualValue: 160, unit: "ft" },
  { category: "Sports", item: "World record for 100m sprint (seconds)", actualValue: 9, unit: "seconds" },
  { category: "Sports", item: "Number of dimples on a golf ball", actualValue: 336, unit: "" },
  { category: "Sports", item: "Height of a basketball hoop (feet)", actualValue: 10, unit: "ft" },
  { category: "Sports", item: "Distance from pitcher's mound to home plate (feet)", actualValue: 60, unit: "ft" },
  { category: "Sports", item: "Average MLB game length (minutes)", actualValue: 165, unit: "minutes" },
  { category: "Sports", item: "Capacity of the largest NFL stadium", actualValue: 105000, unit: "" },
  { category: "Sports", item: "Average speed of a tennis serve (mph)", actualValue: 120, unit: "mph" },
  { category: "Sports", item: "Number of players on an NFL roster", actualValue: 53, unit: "" },
  { category: "Sports", item: "Weight of a bowling ball (max, lbs)", actualValue: 16, unit: "lbs" },
  { category: "Sports", item: "Length of an Olympic swimming pool (meters)", actualValue: 50, unit: "meters" },
  { category: "Sports", item: "Diameter of a soccer ball (inches)", actualValue: 9, unit: "inches" },
  { category: "Sports", item: "Number of World Cup wins by Brazil", actualValue: 5, unit: "" },
  // Science
  { category: "Science", item: "Speed of light (miles per second)", actualValue: 186000, unit: "mi/s" },
  { category: "Science", item: "Temperature of the Sun's surface (°F)", actualValue: 9941, unit: "°F" },
  { category: "Science", item: "Number of bones in the human body", actualValue: 206, unit: "" },
  { category: "Science", item: "Percentage of Earth's surface covered by water", actualValue: 71, unit: "%" },
  { category: "Science", item: "Age of the Earth (billions of years)", actualValue: 4, unit: "billion years" },
  { category: "Science", item: "Average human body temperature (°F)", actualValue: 98, unit: "°F" },
  { category: "Science", item: "Speed of sound in air (mph)", actualValue: 767, unit: "mph" },
  { category: "Science", item: "Number of elements on the periodic table", actualValue: 118, unit: "" },
  { category: "Science", item: "Distance from Earth to Mars at closest (million miles)", actualValue: 34, unit: "million miles" },
  { category: "Science", item: "Deepest point in the ocean (feet)", actualValue: 36070, unit: "ft" },
  { category: "Science", item: "Average lifespan of a human red blood cell (days)", actualValue: 120, unit: "days" },
  { category: "Science", item: "Number of muscles in the human body", actualValue: 600, unit: "" },
  { category: "Science", item: "Boiling point of water at sea level (°F)", actualValue: 212, unit: "°F" },
  { category: "Science", item: "Diameter of Earth (miles)", actualValue: 7918, unit: "miles" },
  // History
  { category: "History", item: "Year the Declaration of Independence was signed", actualValue: 1776, unit: "" },
  { category: "History", item: "Year the Titanic sank", actualValue: 1912, unit: "" },
  { category: "History", item: "Year the Berlin Wall fell", actualValue: 1989, unit: "" },
  { category: "History", item: "Number of US Presidents as of 2025", actualValue: 47, unit: "" },
  { category: "History", item: "Year humans first landed on the Moon", actualValue: 1969, unit: "" },
  { category: "History", item: "Age of the Great Pyramid of Giza (years)", actualValue: 4500, unit: "years" },
  { category: "History", item: "Year the first airplane flight occurred", actualValue: 1903, unit: "" },
  { category: "History", item: "Number of amendments to the US Constitution", actualValue: 27, unit: "" },
  { category: "History", item: "Year World War II ended", actualValue: 1945, unit: "" },
  { category: "History", item: "Year the internet was invented (ARPANET)", actualValue: 1969, unit: "" },
  { category: "History", item: "Length of the Hundred Years' War (years)", actualValue: 116, unit: "years" },
  { category: "History", item: "Population of the world in 1900 (billions)", actualValue: 1, unit: "billion" },
  // Geography
  { category: "Geography", item: "Population of China (billions)", actualValue: 1400000000, unit: "" },
  { category: "Geography", item: "Height of Mount Everest (feet)", actualValue: 29032, unit: "ft" },
  { category: "Geography", item: "Area of Texas (square miles)", actualValue: 268596, unit: "sq mi" },
  { category: "Geography", item: "Length of the Amazon River (miles)", actualValue: 4000, unit: "miles" },
  { category: "Geography", item: "Population of New York City", actualValue: 8300000, unit: "" },
  { category: "Geography", item: "Number of US states", actualValue: 50, unit: "" },
  { category: "Geography", item: "Depth of Lake Baikal, the world's deepest lake (feet)", actualValue: 5387, unit: "ft" },
  { category: "Geography", item: "Area of the Sahara Desert (million sq miles)", actualValue: 3, unit: "million sq mi" },
  { category: "Geography", item: "Population of India (billions)", actualValue: 1400000000, unit: "" },
  { category: "Geography", item: "Number of islands in the Philippines", actualValue: 7641, unit: "" },
  { category: "Geography", item: "Height of Niagara Falls (feet)", actualValue: 167, unit: "ft" },
  { category: "Geography", item: "Width of the English Channel at narrowest (miles)", actualValue: 21, unit: "miles" },
  // Entertainment
  { category: "Entertainment", item: "Worldwide box office gross of Avatar (billions $)", actualValue: 2900000000, unit: "$" },
  { category: "Entertainment", item: "Number of episodes of The Simpsons", actualValue: 770, unit: "" },
  { category: "Entertainment", item: "Year the first Star Wars movie was released", actualValue: 1977, unit: "" },
  { category: "Entertainment", item: "Number of Harry Potter books", actualValue: 7, unit: "" },
  { category: "Entertainment", item: "Cost to make the movie Titanic (millions $)", actualValue: 200, unit: "million $" },
  { category: "Entertainment", item: "Number of Grammys won by Beyoncé", actualValue: 32, unit: "" },
  { category: "Entertainment", item: "Most-watched Super Bowl audience (millions)", actualValue: 123, unit: "million" },
  { category: "Entertainment", item: "Number of Disney animated feature films", actualValue: 62, unit: "" },
  { category: "Entertainment", item: "Total songs on Spotify (millions)", actualValue: 100, unit: "million" },
  { category: "Entertainment", item: "Year Netflix started streaming", actualValue: 2007, unit: "" },
  { category: "Entertainment", item: "Number of James Bond movies", actualValue: 25, unit: "" },
  { category: "Entertainment", item: "Number of seasons of Friends", actualValue: 10, unit: "" },
  // Animals
  { category: "Animals", item: "Top speed of a cheetah (mph)", actualValue: 70, unit: "mph" },
  { category: "Animals", item: "Lifespan of a giant tortoise (years)", actualValue: 150, unit: "years" },
  { category: "Animals", item: "Weight of a blue whale (tons)", actualValue: 150, unit: "tons" },
  { category: "Animals", item: "Number of species of ants worldwide", actualValue: 22000, unit: "" },
  { category: "Animals", item: "Height of a giraffe (feet)", actualValue: 18, unit: "ft" },
  { category: "Animals", item: "Average lifespan of a domestic cat (years)", actualValue: 15, unit: "years" },
  { category: "Animals", item: "Number of teeth a great white shark has", actualValue: 300, unit: "" },
  { category: "Animals", item: "Wingspan of a bald eagle (feet)", actualValue: 7, unit: "ft" },
  { category: "Animals", item: "Speed of a peregrine falcon dive (mph)", actualValue: 240, unit: "mph" },
  { category: "Animals", item: "Weight of an African elephant (lbs)", actualValue: 13000, unit: "lbs" },
  { category: "Animals", item: "Number of hearts an octopus has", actualValue: 3, unit: "" },
  { category: "Animals", item: "Lifespan of a mayfly (hours)", actualValue: 24, unit: "hours" },
  { category: "Animals", item: "Number of legs a lobster has", actualValue: 10, unit: "" },
  { category: "Animals", item: "Average lifespan of a honeybee (days)", actualValue: 40, unit: "days" },
  // Music
  { category: "Music", item: "Year 'Bohemian Rhapsody' by Queen was released", actualValue: 1975, unit: "" },
  { category: "Music", item: "Number of studio albums by The Beatles", actualValue: 13, unit: "" },
  { category: "Music", item: "Length of 'Bohemian Rhapsody' (minutes)", actualValue: 6, unit: "minutes" },
  { category: "Music", item: "Most weeks at #1 on Billboard Hot 100 (single)", actualValue: 19, unit: "weeks" },
  { category: "Music", item: "Cost of a Stradivarius violin ($)", actualValue: 16000000, unit: "$" },
  { category: "Music", item: "Year MTV first aired", actualValue: 1981, unit: "" },
  { category: "Music", item: "Number of keys on a standard piano", actualValue: 88, unit: "" },
  { category: "Music", item: "Number of strings on a standard guitar", actualValue: 6, unit: "" },
  // Space
  { category: "Space", item: "Distance from Sun to Earth (million miles)", actualValue: 93, unit: "million miles" },
  { category: "Space", item: "Temperature on Mars surface (°F, average)", actualValue: -80, unit: "°F" },
  { category: "Space", item: "Number of moons orbiting Jupiter", actualValue: 95, unit: "" },
  { category: "Space", item: "Diameter of the Sun (miles)", actualValue: 865000, unit: "miles" },
  { category: "Space", item: "Year Pluto was reclassified as a dwarf planet", actualValue: 2006, unit: "" },
  { category: "Space", item: "Time for light to travel from Sun to Earth (minutes)", actualValue: 8, unit: "minutes" },
  { category: "Space", item: "Number of planets in our solar system", actualValue: 8, unit: "" },
  { category: "Space", item: "Age of the universe (billion years)", actualValue: 13, unit: "billion years" },
  { category: "Space", item: "Orbital speed of Earth (mph)", actualValue: 67000, unit: "mph" },
  { category: "Space", item: "Number of stars in the Milky Way (billions)", actualValue: 200, unit: "billion" },
  // Health
  { category: "Health", item: "Average resting heart rate (beats per minute)", actualValue: 72, unit: "bpm" },
  { category: "Health", item: "Recommended daily water intake (cups)", actualValue: 8, unit: "cups" },
  { category: "Health", item: "Average hours of sleep needed for adults", actualValue: 7, unit: "hours" },
  { category: "Health", item: "Number of taste buds on the human tongue", actualValue: 10000, unit: "" },
  { category: "Health", item: "Average walking speed of a human (mph)", actualValue: 3, unit: "mph" },
  { category: "Health", item: "Percentage of the human body that is water", actualValue: 60, unit: "%" },
  { category: "Health", item: "Average daily calorie intake for US adults", actualValue: 2100, unit: "calories" },
  { category: "Health", item: "Number of breaths a human takes per day", actualValue: 22000, unit: "" },
  // Architecture / Vehicles / Misc
  { category: "Architecture", item: "Height of the Burj Khalifa (feet)", actualValue: 2717, unit: "ft" },
  { category: "Architecture", item: "Year the Empire State Building was completed", actualValue: 1931, unit: "" },
  { category: "Architecture", item: "Height of the Statue of Liberty (feet, with pedestal)", actualValue: 305, unit: "ft" },
  { category: "Architecture", item: "Length of the Golden Gate Bridge (feet)", actualValue: 8981, unit: "ft" },
  { category: "Vehicles", item: "Top speed of a Tesla Model S Plaid (mph)", actualValue: 200, unit: "mph" },
  { category: "Vehicles", item: "Average price of a new car in the US", actualValue: 48000, unit: "$" },
  { category: "Vehicles", item: "Top speed of a Formula 1 car (mph)", actualValue: 230, unit: "mph" },
  { category: "Vehicles", item: "Fuel capacity of a Boeing 747 (gallons)", actualValue: 57285, unit: "gallons" },
  { category: "Vehicles", item: "Average miles driven per year in the US", actualValue: 13500, unit: "miles" },
  { category: "Vehicles", item: "Cost of a Bugatti Chiron", actualValue: 3000000, unit: "$" },
  { category: "Vehicles", item: "Weight of a school bus (lbs)", actualValue: 24000, unit: "lbs" },
  { category: "Vehicles", item: "Top speed of a Lamborghini Aventador (mph)", actualValue: 217, unit: "mph" },
];

function generatePricecheck(rng) {
  const puzzles = [];
  const allCategories = [...new Set(PRICECHECK_ITEMS.map(i => i.category))];
  const itemsByCategory = {};
  for (const cat of allCategories) {
    itemsByCategory[cat] = PRICECHECK_ITEMS.filter(i => i.category === cat);
  }

  const usedItems = new Set();

  for (let id = 1; id <= TARGET; id++) {
    const rounds = [];
    const usedCats = new Set();
    const shuffledCats = shuffle(allCategories, rng);

    for (let r = 0; r < 5; r++) {
      // Pick a category not yet used in this puzzle
      let cat = shuffledCats[r % shuffledCats.length];
      let attempts = 0;
      while (usedCats.has(cat) && attempts < 50) {
        cat = pick(allCategories, rng);
        attempts++;
      }
      usedCats.add(cat);

      // Pick an item from this category
      const candidates = itemsByCategory[cat];
      const item = candidates[Math.floor(rng() * candidates.length)];

      // Generate a "shown" value that's off by 5-80%
      const marginPct = 0.05 + rng() * 0.75; // 5% to 80%
      const direction = rng() > 0.5 ? 1 : -1; // shown can be higher or lower
      let shownValue;
      if (direction > 0) {
        shownValue = Math.round(item.actualValue * (1 + marginPct));
      } else {
        shownValue = Math.round(item.actualValue * (1 - marginPct));
      }
      // Make sure shown != actual
      if (shownValue === item.actualValue) shownValue += (direction > 0 ? 1 : -1);

      rounds.push({
        category: item.category,
        item: item.item,
        shownValue,
        actualValue: item.actualValue,
        unit: item.unit,
      });
    }
    puzzles.push({ id, rounds });
  }
  return puzzles;
}

// ── TREND ────────────────────────────────────────────────────────

const TREND_CATEGORIES = [
  "Economics", "Technology", "Climate", "Finance", "Energy",
  "Social Media", "Health", "Sports", "Demographics", "Transportation",
  "Education", "Entertainment", "Agriculture", "Space"
];

const TREND_TITLES = [
  "US GDP Growth Rate (%)", "Global Smartphone Shipments (millions)", "Average US Gas Price ($/gallon)",
  "Netflix Subscriber Count (millions)", "US Unemployment Rate (%)", "Bitcoin Price ($)",
  "Global CO2 Emissions (Gt)", "US Housing Starts (thousands)", "S&P 500 Index",
  "US National Debt ($ trillions)", "World Population (billions)", "Average US Home Price ($1000s)",
  "Electric Vehicle Sales (millions)", "Global Internet Users (billions)", "US Inflation Rate (%)",
  "Amazon Revenue ($ billions)", "Tesla Stock Price ($)", "US Immigration (thousands/year)",
  "Global Renewable Energy Capacity (GW)", "US College Enrollment (millions)",
  "Average US Household Income ($)", "World Oil Production (million barrels/day)",
  "US Life Expectancy (years)", "Global Air Travel Passengers (billions)",
  "US Student Loan Debt ($ trillions)", "Instagram Monthly Users (billions)",
  "US Minimum Wage ($)", "Global Smartphone Market Share - Apple (%)",
  "US Healthcare Spending ($ trillions)", "Average MLB Ticket Price ($)",
  "US Solar Panel Installations (GW)", "Global Sea Level Rise (mm/year)",
  "US Average Credit Card Debt ($)", "YouTube Daily Video Uploads (hours)",
  "US Median Age (years)", "Global Electric Car Fleet (millions)",
  "Average US Commute Time (minutes)", "US Organic Food Sales ($ billions)",
  "Global Cybersecurity Spending ($ billions)", "US Average Rent Increase (%/year)",
  "Wind Energy Production (TWh)", "US Restaurant Industry Revenue ($ billions)",
  "Global Podcast Listeners (millions)", "US E-commerce Sales ($ billions)",
  "Average Global Temperature Anomaly (°C)", "US Craft Beer Market ($ billions)",
  "Space Launch Frequency (launches/year)", "Global Lithium Production (tons)",
  "US Pet Industry Spending ($ billions)", "Average US Wedding Cost ($1000s)",
  "Global Data Center Energy Use (TWh)", "US Freelance Workers (millions)",
  "Streaming Music Revenue ($ billions)", "Average NFL Player Career (years)",
  "US Farm Count (millions)", "Global AI Market Size ($ billions)",
  "US Public Transit Ridership (billions)", "Average US Tax Refund ($)",
  "Global Forest Coverage (%)", "US Online Grocery Sales ($ billions)",
  "Average Screen Time - Teens (hours/day)", "Global Coral Reef Coverage (%)",
  "US Clean Energy Jobs (millions)", "Average House Size in US (sq ft)",
  "Global Vaccine Doses Administered (billions)", "US National Park Visits (millions)",
  "Average New Car MPG", "Global Lithium-Ion Battery Prices ($/kWh)",
  "US Child Poverty Rate (%)", "Average College Tuition - Public ($)",
  "Global Meat Consumption (kg/person/year)", "US Digital Ad Spending ($ billions)",
  "Average iPhone Price ($)", "Global Semiconductor Revenue ($ billions)",
  "US Opioid Prescriptions (millions)", "Average US Electricity Bill ($/month)",
  "Global Carbon Capture Capacity (Mt/year)", "US Remote Workers (%)",
  "Average Monthly Gym Membership ($)", "Global Desalination Capacity (billion gallons/day)",
  "US Teacher Starting Salary ($)", "Average Video Game Development Cost ($ millions)",
  "Global EV Charging Stations (thousands)", "US Fast Food Revenue ($ billions)",
  "Average Netflix Subscription Price ($)", "Global Drone Market ($ billions)",
  "US Social Security Trust Fund ($ trillions)", "Average US Savings Rate (%)",
  "Global Hydrogen Production (Mt/year)", "US Cannabis Market ($ billions)",
  "Average Uber Ride Cost ($)", "Global Green Bond Issuance ($ billions)",
];

const TREND_SOURCES = [
  "Bureau of Labor Statistics", "Federal Reserve", "World Bank", "IMF",
  "US Census Bureau", "WHO", "NOAA", "NASA", "EIA", "Statista",
  "Bloomberg", "Reuters", "Pew Research", "Gallup", "UN Data",
];

function generateTrendData(answer, rng) {
  // Generate 5 visible + 3 hidden points
  const baseValue = 10 + rng() * 990;
  const volatility = 0.02 + rng() * 0.08;
  const data = [Math.round(baseValue)];

  // Visible points: slight random walk
  for (let i = 1; i < 5; i++) {
    const prev = data[i - 1];
    const change = prev * volatility * (rng() - 0.5);
    data.push(Math.round(prev + change));
  }

  // Hidden points: trend in the answer direction
  const hidden = [];
  let last = data[4];
  for (let i = 0; i < 3; i++) {
    let delta;
    if (answer === 'up') delta = last * (0.02 + rng() * 0.1);
    else if (answer === 'down') delta = -last * (0.02 + rng() * 0.1);
    else delta = last * (rng() - 0.5) * 0.02; // flat
    last = Math.round(last + delta);
    hidden.push(last);
  }

  return { data, hidden };
}

function generateTrend(rng) {
  const puzzles = [];
  const answers = ['up', 'down', 'flat'];
  const shuffledTitles = shuffle(TREND_TITLES, rng);
  let titleIdx = 0;

  for (let id = 1; id <= TARGET; id++) {
    const rounds = [];
    const usedCats = new Set();

    for (let r = 0; r < 5; r++) {
      const answer = answers[(id * 5 + r) % 3]; // balanced distribution
      const title = shuffledTitles[titleIdx % shuffledTitles.length];
      titleIdx++;

      let cat = pick(TREND_CATEGORIES, rng);
      let attempts = 0;
      while (usedCats.has(cat) && attempts < 30) {
        cat = pick(TREND_CATEGORIES, rng);
        attempts++;
      }
      usedCats.add(cat);

      const { data, hidden } = generateTrendData(answer, rng);

      rounds.push({
        category: cat,
        title,
        data,
        hidden,
        answer,
        source: pick(TREND_SOURCES, rng),
      });
    }
    puzzles.push({ id, rounds });
  }
  return puzzles;
}

// ── RANK ─────────────────────────────────────────────────────────

const RANK_TEMPLATES = [
  { category: "Geography", question: "Order these countries by population (highest first)", items: [
    { name: "India", value: 1430000000 }, { name: "China", value: 1420000000 },
    { name: "United States", value: 335000000 }, { name: "Indonesia", value: 275000000 },
    { name: "Pakistan", value: 230000000 },
  ]},
  { category: "Geography", question: "Order these countries by area (largest first)", items: [
    { name: "Russia", value: 6601668 }, { name: "Canada", value: 3855103 },
    { name: "United States", value: 3796742 }, { name: "China", value: 3705407 },
    { name: "Brazil", value: 3287612 },
  ]},
  { category: "Geography", question: "Order these mountains by height (tallest first)", items: [
    { name: "Mount Everest", value: 29032 }, { name: "K2", value: 28251 },
    { name: "Kangchenjunga", value: 28169 }, { name: "Lhotse", value: 27940 },
    { name: "Makalu", value: 27838 },
  ]},
  { category: "Geography", question: "Order these rivers by length (longest first)", items: [
    { name: "Nile", value: 4132 }, { name: "Amazon", value: 4000 },
    { name: "Yangtze", value: 3917 }, { name: "Mississippi", value: 2340 },
    { name: "Danube", value: 1770 },
  ]},
  { category: "Geography", question: "Order these US states by population (highest first)", items: [
    { name: "California", value: 39500000 }, { name: "Texas", value: 30000000 },
    { name: "Florida", value: 22200000 }, { name: "New York", value: 20200000 },
    { name: "Pennsylvania", value: 13000000 },
  ]},
  { category: "Geography", question: "Order these lakes by surface area (largest first)", items: [
    { name: "Caspian Sea", value: 143000 }, { name: "Lake Superior", value: 31700 },
    { name: "Lake Victoria", value: 26600 }, { name: "Lake Huron", value: 23000 },
    { name: "Lake Michigan", value: 22400 },
  ]},
  { category: "Geography", question: "Order these deserts by area (largest first)", items: [
    { name: "Antarctic", value: 5500000 }, { name: "Sahara", value: 3600000 },
    { name: "Arabian", value: 900000 }, { name: "Gobi", value: 500000 },
    { name: "Kalahari", value: 360000 },
  ]},
  { category: "Geography", question: "Order these islands by area (largest first)", items: [
    { name: "Greenland", value: 836330 }, { name: "New Guinea", value: 317150 },
    { name: "Borneo", value: 288869 }, { name: "Madagascar", value: 226658 },
    { name: "Sumatra", value: 171069 },
  ]},
  { category: "Geography", question: "Order these cities by elevation (highest first)", items: [
    { name: "La Paz, Bolivia", value: 11975 }, { name: "Quito, Ecuador", value: 9350 },
    { name: "Bogotá, Colombia", value: 8660 }, { name: "Addis Ababa, Ethiopia", value: 7726 },
    { name: "Mexico City", value: 7350 },
  ]},
  { category: "Space", question: "Order these planets by diameter (largest first)", items: [
    { name: "Jupiter", value: 86881 }, { name: "Saturn", value: 72367 },
    { name: "Uranus", value: 31518 }, { name: "Neptune", value: 30599 },
    { name: "Earth", value: 7918 },
  ]},
  { category: "Space", question: "Order these planets by distance from the Sun (farthest first)", items: [
    { name: "Neptune", value: 2795 }, { name: "Uranus", value: 1784 },
    { name: "Saturn", value: 886 }, { name: "Jupiter", value: 484 },
    { name: "Mars", value: 142 },
  ]},
  { category: "Space", question: "Order these planets by number of moons (most first)", items: [
    { name: "Saturn", value: 146 }, { name: "Jupiter", value: 95 },
    { name: "Uranus", value: 28 }, { name: "Neptune", value: 16 },
    { name: "Mars", value: 2 },
  ]},
  { category: "Space", question: "Order these celestial bodies by mass (heaviest first)", items: [
    { name: "Sun", value: 1989000 }, { name: "Jupiter", value: 1898 },
    { name: "Saturn", value: 568 }, { name: "Neptune", value: 102 },
    { name: "Earth", value: 6 },
  ]},
  { category: "Movies", question: "Order these movies by worldwide box office (highest first)", items: [
    { name: "Avatar", value: 2923 }, { name: "Avengers: Endgame", value: 2799 },
    { name: "Avatar: The Way of Water", value: 2320 }, { name: "Titanic", value: 2257 },
    { name: "Star Wars: The Force Awakens", value: 2069 },
  ]},
  { category: "Movies", question: "Order these animated films by box office (highest first)", items: [
    { name: "Frozen II", value: 1450 }, { name: "The Lion King (2019)", value: 1423 },
    { name: "Frozen", value: 1281 }, { name: "Incredibles 2", value: 1243 },
    { name: "Toy Story 4", value: 1073 },
  ]},
  { category: "Movies", question: "Order these film franchises by total revenue (highest first)", items: [
    { name: "Marvel Cinematic Universe", value: 30000 }, { name: "Star Wars", value: 10300 },
    { name: "Harry Potter / Wizarding World", value: 9600 }, { name: "James Bond", value: 7800 },
    { name: "Fast & Furious", value: 7300 },
  ]},
  { category: "Movies", question: "Order these Pixar films by worldwide box office in millions (highest first)", items: [
    { name: "Incredibles 2", value: 1243 }, { name: "Toy Story 4", value: 1073 },
    { name: "Finding Dory", value: 1029 }, { name: "Inside Out", value: 857 },
    { name: "Coco", value: 807 },
  ]},
  { category: "Nature", question: "Order these animals by top speed (fastest first)", items: [
    { name: "Peregrine Falcon", value: 240 }, { name: "Golden Eagle", value: 200 },
    { name: "Cheetah", value: 70 }, { name: "Sailfish", value: 68 },
    { name: "Pronghorn Antelope", value: 55 },
  ]},
  { category: "Nature", question: "Order these animals by lifespan (longest first)", items: [
    { name: "Greenland Shark", value: 400 }, { name: "Bowhead Whale", value: 200 },
    { name: "Giant Tortoise", value: 150 }, { name: "Macaw", value: 80 },
    { name: "Elephant", value: 65 },
  ]},
  { category: "Nature", question: "Order these animals by weight (heaviest first)", items: [
    { name: "Blue Whale", value: 300000 }, { name: "African Elephant", value: 13000 },
    { name: "White Rhinoceros", value: 5000 }, { name: "Hippopotamus", value: 4000 },
    { name: "Giraffe", value: 2600 },
  ]},
  { category: "Nature", question: "Order these trees by maximum height (tallest first)", items: [
    { name: "Coast Redwood", value: 380 }, { name: "Mountain Ash", value: 330 },
    { name: "Douglas Fir", value: 327 }, { name: "Sitka Spruce", value: 317 },
    { name: "Giant Sequoia", value: 311 },
  ]},
  { category: "Economics", question: "Order these countries by GDP (highest first)", items: [
    { name: "United States", value: 28000 }, { name: "China", value: 18500 },
    { name: "Germany", value: 4600 }, { name: "Japan", value: 4200 },
    { name: "India", value: 3900 },
  ]},
  { category: "Economics", question: "Order these companies by market cap (highest first, 2024)", items: [
    { name: "Apple", value: 3400 }, { name: "Microsoft", value: 3200 },
    { name: "NVIDIA", value: 3100 }, { name: "Amazon", value: 2400 },
    { name: "Alphabet", value: 2100 },
  ]},
  { category: "Economics", question: "Order these currencies by value vs USD (strongest first)", items: [
    { name: "Kuwaiti Dinar", value: 3.26 }, { name: "Bahraini Dinar", value: 2.65 },
    { name: "Omani Rial", value: 2.60 }, { name: "British Pound", value: 1.27 },
    { name: "Euro", value: 1.09 },
  ]},
  { category: "Sports", question: "Order these athletes by career earnings (highest first)", items: [
    { name: "LeBron James", value: 1200 }, { name: "Cristiano Ronaldo", value: 1100 },
    { name: "Lionel Messi", value: 1050 }, { name: "Roger Federer", value: 900 },
    { name: "Tiger Woods", value: 800 },
  ]},
  { category: "Sports", question: "Order these sports by average player salary (highest first)", items: [
    { name: "NBA", value: 9700000 }, { name: "IPL Cricket", value: 5500000 },
    { name: "MLB", value: 4900000 }, { name: "EPL Soccer", value: 4400000 },
    { name: "NFL", value: 3500000 },
  ]},
  { category: "Sports", question: "Order these stadiums by seating capacity (largest first)", items: [
    { name: "Narendra Modi Stadium", value: 132000 }, { name: "Michigan Stadium", value: 107601 },
    { name: "Beaver Stadium", value: 106572 }, { name: "Ohio Stadium", value: 102780 },
    { name: "Kyle Field", value: 102733 },
  ]},
  { category: "Sports", question: "Order these countries by Olympic gold medals (most first)", items: [
    { name: "United States", value: 1180 }, { name: "Soviet Union", value: 473 },
    { name: "Great Britain", value: 296 }, { name: "Germany (all)", value: 275 },
    { name: "China", value: 263 },
  ]},
  { category: "Music", question: "Order these artists by album sales worldwide (most first)", items: [
    { name: "The Beatles", value: 600 }, { name: "Elvis Presley", value: 500 },
    { name: "Michael Jackson", value: 400 }, { name: "Elton John", value: 375 },
    { name: "Led Zeppelin", value: 300 },
  ]},
  { category: "Music", question: "Order these songs by Spotify streams (most first)", items: [
    { name: "Blinding Lights - The Weeknd", value: 4300 },
    { name: "Shape of You - Ed Sheeran", value: 3800 },
    { name: "Someone You Loved - Lewis Capaldi", value: 3200 },
    { name: "Dance Monkey - Tones and I", value: 3000 },
    { name: "Sunflower - Post Malone", value: 2900 },
  ]},
  { category: "History", question: "Order these empires by peak land area (largest first)", items: [
    { name: "British Empire", value: 13710000 }, { name: "Mongol Empire", value: 9270000 },
    { name: "Russian Empire", value: 8800000 }, { name: "Spanish Empire", value: 7500000 },
    { name: "Qing Dynasty", value: 5680000 },
  ]},
  { category: "History", question: "Order these wars by duration (longest first)", items: [
    { name: "Reconquista", value: 781 }, { name: "Hundred Years' War", value: 116 },
    { name: "Vietnam War", value: 20 }, { name: "World War II", value: 6 },
    { name: "Six-Day War", value: 1 },
  ]},
  { category: "History", question: "Order these ancient wonders by age (oldest first)", items: [
    { name: "Great Pyramid of Giza", value: 4500 }, { name: "Hanging Gardens of Babylon", value: 2600 },
    { name: "Temple of Artemis", value: 2550 }, { name: "Statue of Zeus", value: 2470 },
    { name: "Colossus of Rhodes", value: 2300 },
  ]},
  { category: "Food", question: "Order these countries by coffee consumption per capita (highest first)", items: [
    { name: "Finland", value: 12 }, { name: "Norway", value: 9.9 },
    { name: "Iceland", value: 9 }, { name: "Denmark", value: 8.7 },
    { name: "Netherlands", value: 8.4 },
  ]},
  { category: "Food", question: "Order these fruits by annual global production (highest first)", items: [
    { name: "Bananas", value: 120 }, { name: "Watermelons", value: 100 },
    { name: "Apples", value: 86 }, { name: "Grapes", value: 77 },
    { name: "Oranges", value: 75 },
  ]},
  { category: "Science", question: "Order these elements by atomic number (highest first)", items: [
    { name: "Oganesson", value: 118 }, { name: "Gold", value: 79 },
    { name: "Iron", value: 26 }, { name: "Carbon", value: 6 },
    { name: "Hydrogen", value: 1 },
  ]},
  { category: "Science", question: "Order these materials by melting point (highest first)", items: [
    { name: "Tungsten", value: 6192 }, { name: "Iron", value: 2800 },
    { name: "Gold", value: 1948 }, { name: "Aluminum", value: 1221 },
    { name: "Lead", value: 621 },
  ]},
  { category: "Technology", question: "Order these social media platforms by users (most first)", items: [
    { name: "Facebook", value: 3000 }, { name: "YouTube", value: 2700 },
    { name: "Instagram", value: 2000 }, { name: "TikTok", value: 1500 },
    { name: "Twitter/X", value: 550 },
  ]},
  { category: "Technology", question: "Order these tech companies by founding year (oldest first)", items: [
    { name: "IBM", value: 1 }, { name: "Apple", value: 2 },
    { name: "Microsoft", value: 3 }, { name: "Amazon", value: 4 },
    { name: "Google", value: 5 },
  ]},
  { category: "Architecture", question: "Order these buildings by height (tallest first)", items: [
    { name: "Burj Khalifa", value: 2717 }, { name: "Merdeka 118", value: 2227 },
    { name: "Shanghai Tower", value: 2073 }, { name: "Abraj Al-Bait Clock Tower", value: 1972 },
    { name: "Ping An Finance Centre", value: 1965 },
  ]},
  { category: "Architecture", question: "Order these bridges by length (longest first)", items: [
    { name: "Danyang-Kunshan Grand Bridge", value: 540700 },
    { name: "Changhua-Kaohsiung Viaduct", value: 515700 },
    { name: "Tianjin Grand Bridge", value: 373000 },
    { name: "Weinan Weihe Grand Bridge", value: 261400 },
    { name: "Lake Pontchartrain Causeway", value: 126122 },
  ]},
  { category: "Animals", question: "Order these dogs by average weight (heaviest first)", items: [
    { name: "English Mastiff", value: 200 }, { name: "Saint Bernard", value: 170 },
    { name: "Great Dane", value: 150 }, { name: "Rottweiler", value: 120 },
    { name: "German Shepherd", value: 75 },
  ]},
  { category: "Animals", question: "Order these birds by wingspan (largest first)", items: [
    { name: "Wandering Albatross", value: 138 }, { name: "Andean Condor", value: 126 },
    { name: "Marabou Stork", value: 120 }, { name: "Bald Eagle", value: 90 },
    { name: "Great Horned Owl", value: 57 },
  ]},
  { category: "Health", question: "Order these organs by weight (heaviest first)", items: [
    { name: "Skin", value: 8000 }, { name: "Liver", value: 1500 },
    { name: "Brain", value: 1400 }, { name: "Lungs (both)", value: 1100 },
    { name: "Heart", value: 300 },
  ]},
  { category: "Transportation", question: "Order these vehicles by top speed (fastest first)", items: [
    { name: "Space Shuttle", value: 17500 }, { name: "X-15 Rocket Plane", value: 4520 },
    { name: "SR-71 Blackbird", value: 2193 }, { name: "Bugatti Chiron", value: 304 },
    { name: "Bullet Train (Shinkansen)", value: 200 },
  ]},
  { category: "Geography", question: "Order these waterfalls by height (tallest first)", items: [
    { name: "Angel Falls", value: 3212 }, { name: "Tugela Falls", value: 3110 },
    { name: "Tres Hermanas Falls", value: 2999 }, { name: "Olo'upena Falls", value: 2953 },
    { name: "Yumbilla Falls", value: 2938 },
  ]},
  { category: "Geography", question: "Order these oceans by area (largest first)", items: [
    { name: "Pacific Ocean", value: 63800000 }, { name: "Atlantic Ocean", value: 41100000 },
    { name: "Indian Ocean", value: 27200000 }, { name: "Southern Ocean", value: 7800000 },
    { name: "Arctic Ocean", value: 5400000 },
  ]},
  { category: "Economics", question: "Order these US companies by number of employees (most first)", items: [
    { name: "Walmart", value: 2100000 }, { name: "Amazon", value: 1500000 },
    { name: "UPS", value: 500000 }, { name: "FedEx", value: 480000 },
    { name: "Home Depot", value: 460000 },
  ]},
  { category: "Sports", question: "Order these marathoners by number of major wins (most first)", items: [
    { name: "Eliud Kipchoge", value: 17 }, { name: "Kenenisa Bekele", value: 8 },
    { name: "Wilson Kipsang", value: 6 }, { name: "Dennis Kimetto", value: 4 },
    { name: "Kelvin Kiptum", value: 3 },
  ]},
  { category: "Music", question: "Order these music festivals by attendance (highest first)", items: [
    { name: "Donauinselfest (Vienna)", value: 3000000 },
    { name: "Summerfest (Milwaukee)", value: 800000 },
    { name: "Glastonbury (UK)", value: 210000 },
    { name: "Coachella (California)", value: 125000 },
    { name: "Lollapalooza (Chicago)", value: 100000 },
  ]},
  { category: "Science", question: "Order these inventions by year (oldest first)", items: [
    { name: "Wheel", value: 1 }, { name: "Printing Press", value: 2 },
    { name: "Steam Engine", value: 3 }, { name: "Telephone", value: 4 },
    { name: "Internet", value: 5 },
  ]},
  { category: "Nature", question: "Order these volcanoes by height (tallest first)", items: [
    { name: "Ojos del Salado", value: 22615 }, { name: "Mount Kilimanjaro", value: 19341 },
    { name: "Mount Elbrus", value: 18510 }, { name: "Mount Rainier", value: 14411 },
    { name: "Mount Fuji", value: 12389 },
  ]},
  { category: "Food", question: "Order these foods by calories per serving (most first)", items: [
    { name: "Peanut Butter (2 tbsp)", value: 190 }, { name: "Avocado (whole)", value: 322 },
    { name: "Banana", value: 105 }, { name: "Apple", value: 95 },
    { name: "Cucumber (whole)", value: 45 },
  ]},
  { category: "History", question: "Order these civilizations by founding (oldest first)", items: [
    { name: "Sumerian", value: 1 }, { name: "Egyptian", value: 2 },
    { name: "Indus Valley", value: 3 }, { name: "Chinese (Shang)", value: 4 },
    { name: "Greek (Mycenaean)", value: 5 },
  ]},
  { category: "Technology", question: "Order these programming languages by age (oldest first)", items: [
    { name: "Fortran (1957)", value: 1 }, { name: "C (1972)", value: 2 },
    { name: "Python (1991)", value: 3 }, { name: "Java (1995)", value: 4 },
    { name: "Rust (2010)", value: 5 },
  ]},
  { category: "Geography", question: "Order these African countries by area (largest first)", items: [
    { name: "Algeria", value: 919595 }, { name: "DR Congo", value: 905355 },
    { name: "Sudan", value: 728215 }, { name: "Libya", value: 679362 },
    { name: "Chad", value: 495752 },
  ]},
  { category: "Sports", question: "Order these soccer players by career goals (most first)", items: [
    { name: "Cristiano Ronaldo", value: 900 }, { name: "Lionel Messi", value: 850 },
    { name: "Pelé", value: 767 }, { name: "Romário", value: 755 },
    { name: "Robert Lewandowski", value: 660 },
  ]},
  { category: "Economics", question: "Order these industries by global revenue (highest first)", items: [
    { name: "Financial Services", value: 28000 }, { name: "Technology", value: 5500 },
    { name: "Healthcare", value: 12000 }, { name: "Energy", value: 8000 },
    { name: "Automotive", value: 3500 },
  ]},
  { category: "Animals", question: "Order these insects by number of species (most first)", items: [
    { name: "Beetles", value: 400000 }, { name: "Butterflies & Moths", value: 180000 },
    { name: "Ants, Bees & Wasps", value: 150000 }, { name: "Flies", value: 120000 },
    { name: "Bugs (Hemiptera)", value: 80000 },
  ]},
  { category: "Entertainment", question: "Order these TV shows by total episodes (most first)", items: [
    { name: "The Simpsons", value: 770 }, { name: "Law & Order: SVU", value: 570 },
    { name: "Grey's Anatomy", value: 430 }, { name: "The Office (US)", value: 201 },
    { name: "Breaking Bad", value: 62 },
  ]},
  { category: "Science", question: "Order these planets by surface gravity (highest first)", items: [
    { name: "Jupiter", value: 24.8 }, { name: "Neptune", value: 11.2 },
    { name: "Saturn", value: 10.4 }, { name: "Earth", value: 9.8 },
    { name: "Mars", value: 3.7 },
  ]},
  { category: "History", question: "Order these US Presidents by years served (most first)", items: [
    { name: "Franklin D. Roosevelt", value: 12 }, { name: "Thomas Jefferson", value: 8 },
    { name: "Abraham Lincoln", value: 4 }, { name: "John F. Kennedy", value: 3 },
    { name: "William Henry Harrison", value: 0 },
  ]},
];

function generateRank(rng) {
  const puzzles = [];
  const shuffledTemplates = shuffle(RANK_TEMPLATES, rng);

  for (let id = 1; id <= TARGET; id++) {
    const template = shuffledTemplates[id % shuffledTemplates.length];
    // Deep clone and ensure descending order
    const items = [...template.items]
      .sort((a, b) => b.value - a.value);

    puzzles.push({
      id,
      category: template.category,
      question: template.question,
      items,
    });
  }
  return puzzles;
}

// ── CROSSFIRE ────────────────────────────────────────────────────

const CROSSFIRE_WORDS = [
  { answer: "BARK", clue1: { domain: "Nature", hint: "Outer covering of a tree" }, clue2: { domain: "Animals", hint: "Sound a dog makes" } },
  { answer: "BANK", clue1: { domain: "Finance", hint: "Where you deposit money" }, clue2: { domain: "Geography", hint: "Side of a river" } },
  { answer: "BAT", clue1: { domain: "Sports", hint: "Used to hit a baseball" }, clue2: { domain: "Animals", hint: "Nocturnal flying mammal" } },
  { answer: "BOLT", clue1: { domain: "Construction", hint: "Metal fastener with threads" }, clue2: { domain: "Weather", hint: "Flash of lightning" } },
  { answer: "BOW", clue1: { domain: "Music", hint: "Used to play a violin" }, clue2: { domain: "Fashion", hint: "Decorative knot in a ribbon" } },
  { answer: "BRIDGE", clue1: { domain: "Architecture", hint: "Structure spanning a river" }, clue2: { domain: "Cards", hint: "Popular trick-taking card game" } },
  { answer: "CABINET", clue1: { domain: "Furniture", hint: "Storage unit with shelves" }, clue2: { domain: "Politics", hint: "Group of senior government advisors" } },
  { answer: "CELL", clue1: { domain: "Biology", hint: "Basic unit of life" }, clue2: { domain: "Technology", hint: "Short for mobile phone" } },
  { answer: "CHAIN", clue1: { domain: "Jewelry", hint: "Series of linked metal rings" }, clue2: { domain: "Business", hint: "Group of stores under one brand" } },
  { answer: "CHANGE", clue1: { domain: "Finance", hint: "Coins returned from a purchase" }, clue2: { domain: "Philosophy", hint: "The process of becoming different" } },
  { answer: "CHARGE", clue1: { domain: "Military", hint: "Rush forward to attack" }, clue2: { domain: "Technology", hint: "Replenish a battery" } },
  { answer: "CHECK", clue1: { domain: "Finance", hint: "Written order to a bank" }, clue2: { domain: "Chess", hint: "Threat to the king" } },
  { answer: "CHIP", clue1: { domain: "Food", hint: "Thin crispy snack" }, clue2: { domain: "Technology", hint: "Tiny electronic circuit" } },
  { answer: "CLUB", clue1: { domain: "Sports", hint: "Golf implement" }, clue2: { domain: "Entertainment", hint: "Venue for dancing and music" } },
  { answer: "COACH", clue1: { domain: "Sports", hint: "Person who trains athletes" }, clue2: { domain: "Transportation", hint: "Long-distance bus" } },
  { answer: "COAT", clue1: { domain: "Fashion", hint: "Outerwear for cold weather" }, clue2: { domain: "Painting", hint: "Layer of paint" } },
  { answer: "COLD", clue1: { domain: "Weather", hint: "Low temperature condition" }, clue2: { domain: "Health", hint: "Common viral illness" } },
  { answer: "COLUMN", clue1: { domain: "Architecture", hint: "Tall supporting pillar" }, clue2: { domain: "Journalism", hint: "Regular newspaper article" } },
  { answer: "COMPOUND", clue1: { domain: "Chemistry", hint: "Substance made of two elements" }, clue2: { domain: "Architecture", hint: "Enclosed area with buildings" } },
  { answer: "CORD", clue1: { domain: "Technology", hint: "Electrical wire with plug" }, clue2: { domain: "Anatomy", hint: "Spinal ___" } },
  { answer: "CRANE", clue1: { domain: "Construction", hint: "Machine for lifting heavy loads" }, clue2: { domain: "Animals", hint: "Tall wading bird" } },
  { answer: "CRASH", clue1: { domain: "Transportation", hint: "Vehicle collision" }, clue2: { domain: "Finance", hint: "Sudden market decline" } },
  { answer: "CRICKET", clue1: { domain: "Sports", hint: "Bat-and-ball game popular in the UK" }, clue2: { domain: "Animals", hint: "Chirping insect" } },
  { answer: "CROSS", clue1: { domain: "Religion", hint: "Symbol of Christianity" }, clue2: { domain: "Emotions", hint: "Feeling angry or irritated" } },
  { answer: "CROWN", clue1: { domain: "Royalty", hint: "Headpiece worn by a monarch" }, clue2: { domain: "Dentistry", hint: "Cap placed on a damaged tooth" } },
  { answer: "CURRENT", clue1: { domain: "Science", hint: "Flow of electricity" }, clue2: { domain: "Maritime", hint: "Flow of water in the ocean" } },
  { answer: "CUT", clue1: { domain: "Cooking", hint: "Slice food with a knife" }, clue2: { domain: "Finance", hint: "Reduction in price or rate" } },
  { answer: "DECK", clue1: { domain: "Cards", hint: "Set of 52 playing cards" }, clue2: { domain: "Maritime", hint: "Floor of a ship" } },
  { answer: "DIAMOND", clue1: { domain: "Jewelry", hint: "Precious gemstone" }, clue2: { domain: "Sports", hint: "Baseball playing field" } },
  { answer: "DRAFT", clue1: { domain: "Sports", hint: "Player selection process" }, clue2: { domain: "Writing", hint: "Preliminary version of a document" } },
  { answer: "DRAW", clue1: { domain: "Art", hint: "Create a picture with a pencil" }, clue2: { domain: "Sports", hint: "Game ending in a tie" } },
  { answer: "DRIVE", clue1: { domain: "Transportation", hint: "Operate a vehicle" }, clue2: { domain: "Technology", hint: "Computer storage device" } },
  { answer: "DROP", clue1: { domain: "Nature", hint: "Small amount of liquid" }, clue2: { domain: "Finance", hint: "Sudden decrease in value" } },
  { answer: "DRUM", clue1: { domain: "Music", hint: "Percussion instrument" }, clue2: { domain: "Construction", hint: "Cylindrical container for liquids" } },
  { answer: "FAN", clue1: { domain: "Technology", hint: "Device that circulates air" }, clue2: { domain: "Entertainment", hint: "Enthusiastic supporter" } },
  { answer: "FILE", clue1: { domain: "Technology", hint: "Computer document" }, clue2: { domain: "Tools", hint: "Tool for smoothing surfaces" } },
  { answer: "FIRE", clue1: { domain: "Nature", hint: "Combustion producing flames" }, clue2: { domain: "Business", hint: "Terminate employment" } },
  { answer: "FIT", clue1: { domain: "Health", hint: "In good physical condition" }, clue2: { domain: "Fashion", hint: "How well clothing matches your body" } },
  { answer: "FLAG", clue1: { domain: "Politics", hint: "National symbol on fabric" }, clue2: { domain: "Sports", hint: "Penalty indicator in football" } },
  { answer: "FLAT", clue1: { domain: "Geography", hint: "Level terrain without hills" }, clue2: { domain: "Music", hint: "Half step below a note" } },
  { answer: "FLY", clue1: { domain: "Transportation", hint: "Travel through the air" }, clue2: { domain: "Animals", hint: "Common buzzing insect" } },
  { answer: "FOLD", clue1: { domain: "Crafts", hint: "Bend paper over itself" }, clue2: { domain: "Cards", hint: "Withdraw from a poker hand" } },
  { answer: "FORK", clue1: { domain: "Food", hint: "Eating utensil with tines" }, clue2: { domain: "Technology", hint: "Create a copy of a code repository" } },
  { answer: "FRAME", clue1: { domain: "Art", hint: "Border around a picture" }, clue2: { domain: "Sports", hint: "One turn in bowling" } },
  { answer: "GLOW", clue1: { domain: "Science", hint: "Emit soft light" }, clue2: { domain: "Health", hint: "Healthy skin radiance" } },
  { answer: "GRAVITY", clue1: { domain: "Science", hint: "Force that pulls objects to Earth" }, clue2: { domain: "Philosophy", hint: "Seriousness of a situation" } },
  { answer: "GREEN", clue1: { domain: "Nature", hint: "Color of most plants" }, clue2: { domain: "Sports", hint: "Putting surface in golf" } },
  { answer: "GROUND", clue1: { domain: "Nature", hint: "Surface of the Earth" }, clue2: { domain: "Cooking", hint: "Crushed into tiny pieces" } },
  { answer: "GUARD", clue1: { domain: "Security", hint: "Person who protects" }, clue2: { domain: "Sports", hint: "Basketball position" } },
  { answer: "HAND", clue1: { domain: "Anatomy", hint: "Body part with five fingers" }, clue2: { domain: "Cards", hint: "Cards dealt to a player" } },
  { answer: "HEAD", clue1: { domain: "Anatomy", hint: "Top part of the body" }, clue2: { domain: "Business", hint: "Leader of a department" } },
  { answer: "HORN", clue1: { domain: "Music", hint: "Brass wind instrument" }, clue2: { domain: "Animals", hint: "Hard pointed growth on a rhino" } },
  { answer: "JAM", clue1: { domain: "Food", hint: "Fruit preserve spread on toast" }, clue2: { domain: "Music", hint: "Informal music session" } },
  { answer: "KEY", clue1: { domain: "Security", hint: "Opens a lock" }, clue2: { domain: "Music", hint: "Tonal center of a composition" } },
  { answer: "LEAD", clue1: { domain: "Science", hint: "Heavy metallic element" }, clue2: { domain: "Theater", hint: "Main role in a production" } },
  { answer: "LETTER", clue1: { domain: "Communication", hint: "Written message sent by mail" }, clue2: { domain: "Language", hint: "Single character of the alphabet" } },
  { answer: "LIGHT", clue1: { domain: "Science", hint: "Electromagnetic radiation we see" }, clue2: { domain: "Measurement", hint: "Not heavy in weight" } },
  { answer: "LINE", clue1: { domain: "Mathematics", hint: "Straight path between two points" }, clue2: { domain: "Theater", hint: "Actor's spoken dialogue" } },
  { answer: "LOCK", clue1: { domain: "Security", hint: "Device securing a door" }, clue2: { domain: "Hair", hint: "Curl or strand of hair" } },
  { answer: "LOG", clue1: { domain: "Nature", hint: "Fallen section of a tree" }, clue2: { domain: "Technology", hint: "Record of events or data" } },
  { answer: "MATCH", clue1: { domain: "Sports", hint: "Competitive game" }, clue2: { domain: "Fire", hint: "Thin stick used to start fire" } },
  { answer: "MINE", clue1: { domain: "Industry", hint: "Underground excavation for minerals" }, clue2: { domain: "Military", hint: "Explosive device buried underground" } },
  { answer: "MODEL", clue1: { domain: "Fashion", hint: "Person who displays clothing" }, clue2: { domain: "Science", hint: "Simplified representation of a system" } },
  { answer: "MOLE", clue1: { domain: "Animals", hint: "Small burrowing mammal" }, clue2: { domain: "Chemistry", hint: "Unit of measurement in chemistry" } },
  { answer: "MOUSE", clue1: { domain: "Animals", hint: "Small rodent" }, clue2: { domain: "Technology", hint: "Computer pointing device" } },
  { answer: "NET", clue1: { domain: "Sports", hint: "Mesh barrier in tennis" }, clue2: { domain: "Finance", hint: "Amount after deductions" } },
  { answer: "NOTE", clue1: { domain: "Music", hint: "Single musical tone" }, clue2: { domain: "Writing", hint: "Short written message" } },
  { answer: "ORGAN", clue1: { domain: "Music", hint: "Large keyboard instrument in churches" }, clue2: { domain: "Anatomy", hint: "Body part like the heart or liver" } },
  { answer: "PALM", clue1: { domain: "Anatomy", hint: "Inner surface of the hand" }, clue2: { domain: "Nature", hint: "Tropical tree with fronds" } },
  { answer: "PARK", clue1: { domain: "Nature", hint: "Green recreational area in a city" }, clue2: { domain: "Transportation", hint: "Leave a vehicle stationary" } },
  { answer: "PASS", clue1: { domain: "Sports", hint: "Throw the ball to a teammate" }, clue2: { domain: "Geography", hint: "Route through mountains" } },
  { answer: "PATCH", clue1: { domain: "Fashion", hint: "Piece of fabric sewn over a hole" }, clue2: { domain: "Technology", hint: "Software update that fixes bugs" } },
  { answer: "PEN", clue1: { domain: "Writing", hint: "Instrument for writing with ink" }, clue2: { domain: "Animals", hint: "Enclosure for livestock" } },
  { answer: "PITCH", clue1: { domain: "Sports", hint: "Throw in baseball" }, clue2: { domain: "Music", hint: "Highness or lowness of a sound" } },
  { answer: "PLANT", clue1: { domain: "Nature", hint: "Living organism that photosynthesizes" }, clue2: { domain: "Industry", hint: "Manufacturing factory" } },
  { answer: "PLATE", clue1: { domain: "Food", hint: "Dish for serving food" }, clue2: { domain: "Geology", hint: "Tectonic section of Earth's crust" } },
  { answer: "PLOT", clue1: { domain: "Literature", hint: "Story's sequence of events" }, clue2: { domain: "Real Estate", hint: "Piece of land" } },
  { answer: "POINT", clue1: { domain: "Mathematics", hint: "Exact location with no size" }, clue2: { domain: "Sports", hint: "Unit of scoring" } },
  { answer: "POOL", clue1: { domain: "Sports", hint: "Game played on a billiards table" }, clue2: { domain: "Recreation", hint: "Body of water for swimming" } },
  { answer: "PORT", clue1: { domain: "Maritime", hint: "Harbor for ships" }, clue2: { domain: "Technology", hint: "Connection point on a computer" } },
  { answer: "POST", clue1: { domain: "Communication", hint: "Mail delivery service" }, clue2: { domain: "Social Media", hint: "Shared message online" } },
  { answer: "PRESS", clue1: { domain: "Journalism", hint: "News media collectively" }, clue2: { domain: "Fitness", hint: "Weightlifting exercise" } },
  { answer: "PUPIL", clue1: { domain: "Education", hint: "Student in a school" }, clue2: { domain: "Anatomy", hint: "Dark center of the eye" } },
  { answer: "RACE", clue1: { domain: "Sports", hint: "Speed competition" }, clue2: { domain: "Sociology", hint: "Category of human identity" } },
  { answer: "RANGE", clue1: { domain: "Geography", hint: "Chain of mountains" }, clue2: { domain: "Cooking", hint: "Stovetop appliance" } },
  { answer: "RECORD", clue1: { domain: "Music", hint: "Vinyl disc for playing songs" }, clue2: { domain: "Sports", hint: "Best-ever achievement" } },
  { answer: "RING", clue1: { domain: "Jewelry", hint: "Circular band worn on a finger" }, clue2: { domain: "Sports", hint: "Boxing arena" } },
  { answer: "ROCK", clue1: { domain: "Geology", hint: "Solid mineral formation" }, clue2: { domain: "Music", hint: "Genre with electric guitars" } },
  { answer: "ROOT", clue1: { domain: "Nature", hint: "Underground part of a plant" }, clue2: { domain: "Mathematics", hint: "Solution to an equation" } },
  { answer: "ROUND", clue1: { domain: "Mathematics", hint: "Circular in shape" }, clue2: { domain: "Sports", hint: "Division of a boxing match" } },
  { answer: "RULER", clue1: { domain: "Tools", hint: "Measuring stick" }, clue2: { domain: "Politics", hint: "Person who governs" } },
  { answer: "RUN", clue1: { domain: "Sports", hint: "Move faster than walking" }, clue2: { domain: "Technology", hint: "Execute a program" } },
  { answer: "SAFE", clue1: { domain: "Security", hint: "Fireproof storage box" }, clue2: { domain: "Sports", hint: "Successfully reaching base in baseball" } },
  { answer: "SCALE", clue1: { domain: "Music", hint: "Sequence of ascending notes" }, clue2: { domain: "Animals", hint: "Small plate on a fish" } },
  { answer: "SEAL", clue1: { domain: "Animals", hint: "Marine mammal" }, clue2: { domain: "Security", hint: "Stamp of authentication" } },
  { answer: "SEASON", clue1: { domain: "Nature", hint: "One of four yearly periods" }, clue2: { domain: "Cooking", hint: "Add spices for flavor" } },
  { answer: "SET", clue1: { domain: "Mathematics", hint: "Collection of elements" }, clue2: { domain: "Sports", hint: "Division of a tennis match" } },
  { answer: "SHELL", clue1: { domain: "Animals", hint: "Hard outer covering of a turtle" }, clue2: { domain: "Technology", hint: "Command-line interface" } },
  { answer: "SHOOT", clue1: { domain: "Sports", hint: "Launch a ball toward the goal" }, clue2: { domain: "Photography", hint: "Take pictures with a camera" } },
  { answer: "SOLE", clue1: { domain: "Anatomy", hint: "Bottom of a shoe or foot" }, clue2: { domain: "Food", hint: "Flat ocean fish" } },
  { answer: "SPRING", clue1: { domain: "Nature", hint: "Season between winter and summer" }, clue2: { domain: "Engineering", hint: "Coiled metal that bounces back" } },
  { answer: "STAFF", clue1: { domain: "Business", hint: "Group of employees" }, clue2: { domain: "Music", hint: "Five lines for writing notes" } },
  { answer: "STAGE", clue1: { domain: "Theater", hint: "Platform for performances" }, clue2: { domain: "Science", hint: "Phase of a process" } },
  { answer: "STAR", clue1: { domain: "Space", hint: "Luminous celestial body" }, clue2: { domain: "Entertainment", hint: "Famous celebrity" } },
  { answer: "STICK", clue1: { domain: "Nature", hint: "Thin piece of wood" }, clue2: { domain: "Sports", hint: "Hockey implement" } },
  { answer: "STOCK", clue1: { domain: "Finance", hint: "Share of company ownership" }, clue2: { domain: "Cooking", hint: "Broth made from simmered bones" } },
  { answer: "STORY", clue1: { domain: "Literature", hint: "Narrative tale" }, clue2: { domain: "Architecture", hint: "Floor level of a building" } },
  { answer: "STRIKE", clue1: { domain: "Sports", hint: "Missed swing in baseball" }, clue2: { domain: "Labor", hint: "Workers' organized protest" } },
  { answer: "SUIT", clue1: { domain: "Fashion", hint: "Formal matching jacket and pants" }, clue2: { domain: "Cards", hint: "Hearts, diamonds, clubs, or spades" } },
  { answer: "SWITCH", clue1: { domain: "Technology", hint: "Toggle for controlling electricity" }, clue2: { domain: "Gaming", hint: "Nintendo handheld console" } },
  { answer: "TABLE", clue1: { domain: "Furniture", hint: "Flat surface for eating or working" }, clue2: { domain: "Data", hint: "Organized rows and columns of data" } },
  { answer: "TANK", clue1: { domain: "Military", hint: "Armored combat vehicle" }, clue2: { domain: "Aquatics", hint: "Container for keeping fish" } },
  { answer: "TAP", clue1: { domain: "Plumbing", hint: "Faucet controlling water flow" }, clue2: { domain: "Dance", hint: "Rhythmic shoe dancing style" } },
  { answer: "TIE", clue1: { domain: "Fashion", hint: "Neckwear worn with a suit" }, clue2: { domain: "Sports", hint: "Equal score in a game" } },
  { answer: "TOAST", clue1: { domain: "Food", hint: "Browned bread" }, clue2: { domain: "Celebrations", hint: "Raise a glass in someone's honor" } },
  { answer: "TRACK", clue1: { domain: "Music", hint: "Individual song on an album" }, clue2: { domain: "Sports", hint: "Running oval" } },
  { answer: "TRAIN", clue1: { domain: "Transportation", hint: "Railway vehicle" }, clue2: { domain: "Fitness", hint: "Practice to improve skills" } },
  { answer: "TRIP", clue1: { domain: "Travel", hint: "Journey to a destination" }, clue2: { domain: "Safety", hint: "Stumble and fall" } },
  { answer: "TRUNK", clue1: { domain: "Nature", hint: "Main stem of a tree" }, clue2: { domain: "Transportation", hint: "Storage space in a car" } },
  { answer: "VALVE", clue1: { domain: "Engineering", hint: "Controls flow in a pipe" }, clue2: { domain: "Anatomy", hint: "Flap in the heart" } },
  { answer: "VOLUME", clue1: { domain: "Music", hint: "Loudness level" }, clue2: { domain: "Mathematics", hint: "Space occupied by an object" } },
  { answer: "WATCH", clue1: { domain: "Fashion", hint: "Timepiece worn on the wrist" }, clue2: { domain: "Security", hint: "Observe closely for danger" } },
  { answer: "WAVE", clue1: { domain: "Science", hint: "Oscillation carrying energy" }, clue2: { domain: "Social", hint: "Gesture of greeting" } },
  { answer: "WELL", clue1: { domain: "Industry", hint: "Deep hole for accessing water" }, clue2: { domain: "Health", hint: "In good condition" } },
  { answer: "YARD", clue1: { domain: "Measurement", hint: "Three feet of distance" }, clue2: { domain: "Home", hint: "Grassy area around a house" } },
  // More words to reach 200+
  { answer: "ANCHOR", clue1: { domain: "Maritime", hint: "Heavy device holding a ship in place" }, clue2: { domain: "Journalism", hint: "Main news presenter" } },
  { answer: "BASS", clue1: { domain: "Music", hint: "Low-pitched guitar or voice" }, clue2: { domain: "Animals", hint: "Freshwater game fish" } },
  { answer: "BEAM", clue1: { domain: "Construction", hint: "Horizontal support structure" }, clue2: { domain: "Science", hint: "Ray of light" } },
  { answer: "BILL", clue1: { domain: "Finance", hint: "Invoice for payment" }, clue2: { domain: "Animals", hint: "Beak of a duck" } },
  { answer: "BIT", clue1: { domain: "Technology", hint: "Smallest unit of digital data" }, clue2: { domain: "Equestrian", hint: "Metal piece in a horse's mouth" } },
  { answer: "BLOCK", clue1: { domain: "Sports", hint: "Defensive move preventing a shot" }, clue2: { domain: "Urban", hint: "Section of city streets" } },
  { answer: "BOARD", clue1: { domain: "Business", hint: "Group of directors" }, clue2: { domain: "Games", hint: "Flat surface for chess or checkers" } },
  { answer: "BREAK", clue1: { domain: "Sports", hint: "Winning a serve game in tennis" }, clue2: { domain: "Work", hint: "Period of rest" } },
  { answer: "BRUSH", clue1: { domain: "Art", hint: "Tool for applying paint" }, clue2: { domain: "Nature", hint: "Dense undergrowth" } },
  { answer: "BUCK", clue1: { domain: "Finance", hint: "Slang for one dollar" }, clue2: { domain: "Animals", hint: "Male deer" } },
  { answer: "CALF", clue1: { domain: "Animals", hint: "Young cow" }, clue2: { domain: "Anatomy", hint: "Back of the lower leg" } },
  { answer: "CAP", clue1: { domain: "Fashion", hint: "Hat with a visor" }, clue2: { domain: "Finance", hint: "Upper limit or maximum" } },
  { answer: "CAST", clue1: { domain: "Theater", hint: "Group of actors" }, clue2: { domain: "Medicine", hint: "Rigid covering for a broken bone" } },
  { answer: "CATCH", clue1: { domain: "Sports", hint: "Receive a thrown ball" }, clue2: { domain: "Fishing", hint: "Fish that were caught" } },
  { answer: "CHANNEL", clue1: { domain: "Television", hint: "Broadcasting station" }, clue2: { domain: "Geography", hint: "Narrow body of water" } },
  { answer: "CLEAR", clue1: { domain: "Weather", hint: "Cloudless sky" }, clue2: { domain: "Technology", hint: "Remove stored data" } },
  { answer: "CLIP", clue1: { domain: "Office", hint: "Small device for holding papers" }, clue2: { domain: "Video", hint: "Short excerpt of footage" } },
  { answer: "COVER", clue1: { domain: "Music", hint: "New version of someone else's song" }, clue2: { domain: "Books", hint: "Front page of a publication" } },
  { answer: "DEAL", clue1: { domain: "Business", hint: "Business agreement" }, clue2: { domain: "Cards", hint: "Distribute cards to players" } },
  { answer: "DIP", clue1: { domain: "Food", hint: "Sauce for dipping chips" }, clue2: { domain: "Swimming", hint: "Brief plunge into water" } },
  { answer: "DOCK", clue1: { domain: "Maritime", hint: "Platform for loading ships" }, clue2: { domain: "Technology", hint: "Station for charging devices" } },
  { answer: "DRILL", clue1: { domain: "Tools", hint: "Power tool for making holes" }, clue2: { domain: "Military", hint: "Repetitive training exercise" } },
  { answer: "EDGE", clue1: { domain: "Technology", hint: "Microsoft's web browser" }, clue2: { domain: "Sports", hint: "Slight advantage over competitor" } },
  { answer: "FIELD", clue1: { domain: "Agriculture", hint: "Open area for growing crops" }, clue2: { domain: "Sports", hint: "Playing area for a game" } },
  { answer: "FIGURE", clue1: { domain: "Mathematics", hint: "Numerical digit" }, clue2: { domain: "Art", hint: "Shape of a human body" } },
  { answer: "HARBOR", clue1: { domain: "Maritime", hint: "Sheltered port for ships" }, clue2: { domain: "Emotions", hint: "Hold a feeling secretly" } },
  { answer: "HIT", clue1: { domain: "Music", hint: "Popular chart-topping song" }, clue2: { domain: "Sports", hint: "Strike with a bat" } },
  { answer: "HOOD", clue1: { domain: "Fashion", hint: "Covering attached to a jacket" }, clue2: { domain: "Vehicles", hint: "Cover over a car engine" } },
  { answer: "IRON", clue1: { domain: "Science", hint: "Metallic element, Fe" }, clue2: { domain: "Home", hint: "Appliance for smoothing clothes" } },
  { answer: "JAW", clue1: { domain: "Anatomy", hint: "Bone forming the mouth frame" }, clue2: { domain: "Tools", hint: "Clamping part of a wrench" } },
  { answer: "JOINT", clue1: { domain: "Anatomy", hint: "Where two bones connect" }, clue2: { domain: "Food", hint: "Casual restaurant or establishment" } },
  { answer: "KNOT", clue1: { domain: "Maritime", hint: "Unit of nautical speed" }, clue2: { domain: "Crafts", hint: "Tied loop in rope or string" } },
  { answer: "LAP", clue1: { domain: "Sports", hint: "One circuit of a track" }, clue2: { domain: "Anatomy", hint: "Upper thigh area when sitting" } },
  { answer: "LEMON", clue1: { domain: "Food", hint: "Yellow citrus fruit" }, clue2: { domain: "Business", hint: "Defective product or car" } },
  { answer: "LENS", clue1: { domain: "Science", hint: "Curved glass for focusing light" }, clue2: { domain: "Anatomy", hint: "Transparent part of the eye" } },
  { answer: "LIFT", clue1: { domain: "Fitness", hint: "Raise something heavy" }, clue2: { domain: "Transportation", hint: "British word for elevator" } },
  { answer: "MARGIN", clue1: { domain: "Finance", hint: "Profit above cost" }, clue2: { domain: "Publishing", hint: "Blank border on a page" } },
  { answer: "MASK", clue1: { domain: "Theater", hint: "Covering worn over the face" }, clue2: { domain: "Technology", hint: "Pattern for filtering data" } },
  { answer: "MINT", clue1: { domain: "Food", hint: "Refreshing herb flavor" }, clue2: { domain: "Finance", hint: "Facility that produces coins" } },
  { answer: "NAIL", clue1: { domain: "Construction", hint: "Metal fastener hammered in" }, clue2: { domain: "Anatomy", hint: "Hard covering on fingertips" } },
  { answer: "NOVEL", clue1: { domain: "Literature", hint: "Long fictional book" }, clue2: { domain: "Language", hint: "New and original" } },
  { answer: "OAK", clue1: { domain: "Nature", hint: "Strong hardwood tree" }, clue2: { domain: "Wine", hint: "Barrel material for aging wine" } },
  { answer: "PADDLE", clue1: { domain: "Sports", hint: "Blade for rowing a canoe" }, clue2: { domain: "Games", hint: "Controller in table tennis" } },
  { answer: "PEAK", clue1: { domain: "Geography", hint: "Summit of a mountain" }, clue2: { domain: "Performance", hint: "Highest point of achievement" } },
  { answer: "PILOT", clue1: { domain: "Aviation", hint: "Person who flies aircraft" }, clue2: { domain: "Television", hint: "First episode of a TV series" } },
  { answer: "PIPE", clue1: { domain: "Plumbing", hint: "Tube for transporting water" }, clue2: { domain: "Music", hint: "Tubular wind instrument" } },
  { answer: "PLUG", clue1: { domain: "Technology", hint: "Connector for electrical devices" }, clue2: { domain: "Marketing", hint: "Promotion or endorsement" } },
  { answer: "POUND", clue1: { domain: "Measurement", hint: "Unit of weight" }, clue2: { domain: "Finance", hint: "British currency" } },
  { answer: "PRINT", clue1: { domain: "Technology", hint: "Produce text on paper" }, clue2: { domain: "Art", hint: "Impression made from a block" } },
  { answer: "QUARTER", clue1: { domain: "Finance", hint: "25-cent coin" }, clue2: { domain: "Sports", hint: "One of four game periods" } },
  { answer: "RAFT", clue1: { domain: "Transportation", hint: "Flat floating watercraft" }, clue2: { domain: "Language", hint: "Large number or quantity" } },
  { answer: "RASH", clue1: { domain: "Health", hint: "Red irritation on skin" }, clue2: { domain: "Behavior", hint: "Acting without thinking" } },
  { answer: "RELAY", clue1: { domain: "Sports", hint: "Team racing event" }, clue2: { domain: "Technology", hint: "Device that retransmits a signal" } },
  { answer: "RESERVE", clue1: { domain: "Nature", hint: "Protected wildlife area" }, clue2: { domain: "Finance", hint: "Money set aside for future use" } },
  { answer: "REST", clue1: { domain: "Music", hint: "Period of silence in a score" }, clue2: { domain: "Health", hint: "Relaxation and sleep" } },
  { answer: "ROLL", clue1: { domain: "Food", hint: "Small round bread" }, clue2: { domain: "Games", hint: "Throw dice" } },
  { answer: "SCORE", clue1: { domain: "Sports", hint: "Points earned in a game" }, clue2: { domain: "Music", hint: "Written musical composition" } },
  { answer: "SEED", clue1: { domain: "Nature", hint: "Embryonic plant" }, clue2: { domain: "Sports", hint: "Ranking in a tournament" } },
  { answer: "SERVE", clue1: { domain: "Sports", hint: "Start a rally in tennis" }, clue2: { domain: "Food", hint: "Present food to guests" } },
  { answer: "SHADE", clue1: { domain: "Nature", hint: "Area blocked from sunlight" }, clue2: { domain: "Art", hint: "Variation of a color" } },
  { answer: "SHED", clue1: { domain: "Construction", hint: "Small storage building" }, clue2: { domain: "Animals", hint: "Lose fur or skin naturally" } },
  { answer: "SHIELD", clue1: { domain: "Military", hint: "Defensive armor carried in hand" }, clue2: { domain: "Technology", hint: "Protection against interference" } },
  { answer: "SINK", clue1: { domain: "Home", hint: "Basin for washing hands" }, clue2: { domain: "Maritime", hint: "Go beneath the water surface" } },
  { answer: "SLIDE", clue1: { domain: "Playground", hint: "Children's sloped play equipment" }, clue2: { domain: "Presentation", hint: "Single page in a slideshow" } },
  { answer: "SLIP", clue1: { domain: "Fashion", hint: "Undergarment or petticoat" }, clue2: { domain: "Maritime", hint: "Boat parking space" } },
  { answer: "SNAP", clue1: { domain: "Photography", hint: "Take a quick picture" }, clue2: { domain: "Sports", hint: "Start of a football play" } },
  { answer: "SOLE", clue1: { domain: "Footwear", hint: "Bottom of a shoe" }, clue2: { domain: "Food", hint: "Type of flatfish" } },
  { answer: "SPARE", clue1: { domain: "Bowling", hint: "Knocking all pins in two rolls" }, clue2: { domain: "Vehicles", hint: "Extra tire carried for emergencies" } },
  { answer: "SPOT", clue1: { domain: "Animals", hint: "Circular marking on an animal" }, clue2: { domain: "Advertising", hint: "Short commercial slot" } },
  { answer: "SQUASH", clue1: { domain: "Sports", hint: "Racket game played in a court" }, clue2: { domain: "Food", hint: "Gourd vegetable" } },
  { answer: "STAKE", clue1: { domain: "Gardening", hint: "Post driven into the ground" }, clue2: { domain: "Finance", hint: "Share or interest in a venture" } },
  { answer: "STAMP", clue1: { domain: "Communication", hint: "Postage adhesive for mail" }, clue2: { domain: "Actions", hint: "Strike the ground with your foot" } },
  { answer: "STAND", clue1: { domain: "Furniture", hint: "Rack or support structure" }, clue2: { domain: "Legal", hint: "Witness position in court" } },
  { answer: "STEEP", clue1: { domain: "Geography", hint: "Having a sharp incline" }, clue2: { domain: "Cooking", hint: "Soak in hot water (like tea)" } },
  { answer: "STEM", clue1: { domain: "Nature", hint: "Main stalk of a plant" }, clue2: { domain: "Education", hint: "Science, tech, engineering, and math" } },
  { answer: "STIR", clue1: { domain: "Cooking", hint: "Mix with a circular motion" }, clue2: { domain: "Emotions", hint: "Provoke strong feelings" } },
  { answer: "STREAM", clue1: { domain: "Nature", hint: "Small flowing body of water" }, clue2: { domain: "Technology", hint: "Continuous data broadcast online" } },
  { answer: "STROKE", clue1: { domain: "Sports", hint: "Swimming technique" }, clue2: { domain: "Art", hint: "Single mark made by a brush" } },
  { answer: "SWIFT", clue1: { domain: "Animals", hint: "Fast-flying bird" }, clue2: { domain: "Technology", hint: "Apple's programming language" } },
  { answer: "SWING", clue1: { domain: "Sports", hint: "Motion of hitting a ball" }, clue2: { domain: "Music", hint: "Jazz dance style from the 1930s" } },
  { answer: "TEMPLE", clue1: { domain: "Religion", hint: "Place of worship" }, clue2: { domain: "Anatomy", hint: "Side of the forehead" } },
  { answer: "TENDER", clue1: { domain: "Food", hint: "Soft and easy to chew" }, clue2: { domain: "Finance", hint: "Formal offer or bid" } },
  { answer: "TIDE", clue1: { domain: "Nature", hint: "Rise and fall of ocean water" }, clue2: { domain: "Home", hint: "Laundry detergent brand" } },
  { answer: "TISSUE", clue1: { domain: "Biology", hint: "Group of similar cells" }, clue2: { domain: "Home", hint: "Soft paper for wiping" } },
  { answer: "TONGUE", clue1: { domain: "Anatomy", hint: "Muscular organ for tasting" }, clue2: { domain: "Fashion", hint: "Flap inside a shoe" } },
  { answer: "TOWER", clue1: { domain: "Architecture", hint: "Tall narrow building" }, clue2: { domain: "Games", hint: "Stack blocks in Jenga" } },
  { answer: "TRACE", clue1: { domain: "Art", hint: "Copy by following lines" }, clue2: { domain: "Science", hint: "Very small amount" } },
  { answer: "VESSEL", clue1: { domain: "Maritime", hint: "Ship or boat" }, clue2: { domain: "Anatomy", hint: "Tube carrying blood" } },
  { answer: "WEB", clue1: { domain: "Nature", hint: "Spider's silk structure" }, clue2: { domain: "Technology", hint: "The World Wide ___" } },
  { answer: "WING", clue1: { domain: "Animals", hint: "Appendage for flying" }, clue2: { domain: "Architecture", hint: "Extension of a building" } },
];

function generateCrossfire(rng) {
  const puzzles = [];
  const shuffledWords = shuffle(CROSSFIRE_WORDS, rng);

  for (let id = 1; id <= TARGET; id++) {
    const rounds = [];
    const usedInPuzzle = new Set();

    for (let r = 0; r < 5; r++) {
      // Pick a word not used in this puzzle
      let word;
      let attempts = 0;
      do {
        word = shuffledWords[(id * 5 + r + attempts * 7) % shuffledWords.length];
        attempts++;
      } while (usedInPuzzle.has(word.answer) && attempts < 100);

      usedInPuzzle.add(word.answer);
      rounds.push({
        clue1: word.clue1,
        clue2: word.clue2,
        answer: word.answer,
        acceptedAnswers: [word.answer],
      });
    }
    puzzles.push({ id, rounds });
  }
  return puzzles;
}

// ── MAIN ─────────────────────────────────────────────────────────

const generators = {
  pricecheck: generatePricecheck,
  trend: generateTrend,
  rank: generateRank,
  crossfire: generateCrossfire,
};

const targetGame = process.argv[2];
const games = targetGame ? [targetGame] : Object.keys(generators);

for (const game of games) {
  const rng = mulberry32(42 + game.length); // deterministic seed per game
  console.log(`Generating ${TARGET} ${game} puzzles...`);
  const puzzles = generators[game](rng);
  const filePath = join(GAMES_DIR, game, 'puzzles.json');
  writeFileSync(filePath, JSON.stringify(puzzles, null, 2) + '\n');
  console.log(`  Wrote ${puzzles.length} puzzles to ${filePath}`);
}

console.log('Done!');
