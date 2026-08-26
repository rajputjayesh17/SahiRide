/**
 * SahiRide - Dynamic Auto & Cab Pooling & Homebound Route Match Engine
 * Sahi Ride, Sahi Price • 100% Free Doorstep Pickup & Drop
 * Google Maps-Style Live Geocoding, Driver Incoming Ride Popups, Driver KYC,
 * First 3 Rides 100% FREE & Every 5th Ride 5% OFF Loyalty Milestone
 * Real-Time Animated Moving Vehicle (Ola/Uber Style) & Complete Theme Management
 */

// Global Application State
const state = {
  currentView: 'onboarding', // Starts with onboarding slides
  currentLang: 'en',
  currentTheme: 'dark',
  currentSlide: 1,
  totalSlides: 4, // 4 Onboarding Slides
  authMode: 'login', // 'login' (existing) | 'signup' (new user)
  simSpeed: 1, // Speed multiplier for real-time live auto simulation (1x, 3x, 10x)
  userSession: {
    isLoggedIn: true, // Active Customer Session by default
    role: 'passenger', // 'passenger' | 'driver'
    isNewUser: true,
    totalRidesTaken: 1, // Tracks completed rides to trigger every 5th ride 5% OFF
    freeRidesRemaining: 3, // First 3 Rides 100% FREE
    phone: '9876543210',
    name: 'Jayesh Sharma',
    email: 'jayesh@example.com',
    emergency: 'Pooja Sharma (+91-98765-00000)',
    kycStatus: 'verified' // 'verified' | 'pending' | 'unsubmitted'
  },
  passenger: {
    pickup: { lat: 18.5204, lng: 73.8567, name: "FC Road, Shivajinagar, Pune" },
    drop: { lat: 18.5074, lng: 73.8077, name: "Kothrud Stand, Pune" },
    vehicle: 'auto', // 'auto' | 'cab'
    mode: 'share',   // 'share' | 'private'
    seatCount: 1,    // 1 to 3 (Auto) or 1 to 4 (Cab)
    freeRidesPromoActive: true, // First 3 Rides 100% Free
    womenOnly: false,
    rideActive: false,
    otp: '5839',
    basePerSeatFare: 0,
    totalFare: 0,
    distanceKm: 8.4
  },
  driver: {
    online: true,
    mode: 'route', // 'normal' | 'route' | 'pool'
    homeDest: { lat: 18.5074, lng: 73.8077, name: "Kothrud Stand, Pune" },
    detourRadiusKm: 1.5,
    currentStep: 1,
    vehicleType: 'auto',
    capacity: 3,
    occupiedSeats: 2,
    todayEarnings: { normal: 360, homebound: 420, pool: 680, fuelSaved: 240, total: 1460 }
  },
  sandbox: {
    passengers: [
      { id: 'A', name: 'Rahul M.', pick: [18.5204, 73.8567], drop: [18.5529, 73.8050], fare: 65, dist: 8.5, picked: true },
      { id: 'B', name: 'Priya S.', pick: [18.5150, 73.8350], drop: [18.5074, 73.8077], fare: 110, dist: 14.2, picked: false }
    ],
    driver: { start: [18.5300, 73.8600], end: [18.5074, 73.8077] }
  }
};

// Comprehensive Searchable Localities & College/Landmark Dataset (Pune, Mumbai, Delhi, Bengaluru)
const PLACES_DATABASE = [
  // Colleges & Institutions
  { name: "PCCOE - Pimpri Chinchwad College of Engineering", lat: 18.6517, lng: 73.7628, desc: "Sector 26, Pradhikaran, Nigdi / Akurdi, Pune", type: "college", keywords: ["pccoe", "pimpri", "chinchwad", "engineering", "akurdi", "nigdi"] },
  { name: "COEP Technological University", lat: 18.5292, lng: 73.8566, desc: "Wellesley Road, Shivajinagar, Pune", type: "college", keywords: ["coep", "shivajinagar", "engineering"] },
  { name: "MIT World Peace University (MIT-WPU)", lat: 18.5180, lng: 73.8153, desc: "Paud Road, Kothrud, Pune", type: "college", keywords: ["mit", "wpu", "kothrud"] },
  { name: "PICT - Pune Institute of Computer Technology", lat: 18.4575, lng: 73.8508, desc: "Dhankawadi, Katraj, Pune", type: "college", keywords: ["pict", "dhankawadi", "katraj"] },
  { name: "DY Patil College of Engineering, Akurdi", lat: 18.6450, lng: 73.7580, desc: "Sector 29, Nigdi Pradhikaran, Akurdi", type: "college", keywords: ["dypatil", "dy patil", "akurdi"] },
  { name: "Symbiosis International University (SIU)", lat: 18.5645, lng: 73.9110, desc: "Viman Nagar & Lavale Campus, Pune", type: "college", keywords: ["symbiosis", "viman nagar", "lavale"] },
  { name: "Bharati Vidyapeeth Deemed University", lat: 18.4570, lng: 73.8510, desc: "Pune-Satara Road, Katraj, Pune", type: "college", keywords: ["bvp", "bharati vidyapeeth", "katraj"] },
  { name: "VIT - Vishwakarma Institute of Technology", lat: 18.4636, lng: 73.8682, desc: "Upper Indira Nagar, Bibwewadi, Pune", type: "college", keywords: ["vit", "bibwewadi"] },
  
  // Popular Urban Hubs & Localities
  { name: "FC Road, Shivajinagar, Pune", lat: 18.5204, lng: 73.8567, desc: "Fergusson College Road, Shivajinagar", type: "place", keywords: ["fc road", "shivajinagar", "deccan"] },
  { name: "Kothrud Stand, Pune", lat: 18.5074, lng: 73.8077, desc: "Karve Road, Kothrud Depot", type: "place", keywords: ["kothrud", "karve road", "stand"] },
  { name: "Hinjewadi Phase 1, Pune", lat: 18.5913, lng: 73.7389, desc: "Rajiv Gandhi Infotech Park", type: "itpark", keywords: ["hinjewadi", "hinjawadi", "phase 1"] },
  { name: "Hinjewadi Phase 2, Pune", lat: 18.5832, lng: 73.7125, desc: "Wipro Circle, Phase 2", type: "itpark", keywords: ["hinjewadi phase 2", "wipro"] },
  { name: "Hinjewadi Phase 3, Pune", lat: 18.5750, lng: 73.6890, desc: "Megapolis Circle, Phase 3", type: "itpark", keywords: ["hinjewadi phase 3", "megapolis"] },
  { name: "Wakad Bridge / Datta Mandir, Pune", lat: 18.5980, lng: 73.7620, desc: "Datta Mandir Road, Wakad", type: "place", keywords: ["wakad", "datta mandir"] },
  { name: "Baner Balewadi High Street, Pune", lat: 18.5679, lng: 73.7769, desc: "High Street, Baner", type: "place", keywords: ["baner", "balewadi", "high street"] },
  { name: "Aundh D-Mart, Pune", lat: 18.5529, lng: 73.8050, desc: "ITI Road, Aundh", type: "place", keywords: ["aundh", "d-mart", "iti road"] },
  { name: "Pune International Airport (PNQ)", lat: 18.5822, lng: 73.9197, desc: "Lohegaon Airport Terminal", type: "transit", keywords: ["airport", "pnq", "lohegaon", "flight"] },
  { name: "Pune Central Railway Station", lat: 18.5284, lng: 73.8744, desc: "Station Road, Agarkar Nagar", type: "transit", keywords: ["railway station", "pune station", "train"] },
  { name: "Swargate Bus Terminus, Pune", lat: 18.5018, lng: 73.8586, desc: "Swargate Chowk, Satara Road", type: "transit", keywords: ["swargate", "bus stand"] },
  { name: "Magarpatta Cybercity, Pune", lat: 18.5529, lng: 73.9349, desc: "Hadapsar, East Pune", type: "itpark", keywords: ["magarpatta", "hadapsar", "cybercity"] },
  { name: "Viman Nagar Phoenix Marketcity, Pune", lat: 18.5620, lng: 73.9167, desc: "Nagar Road, Viman Nagar", type: "place", keywords: ["viman nagar", "phoenix", "mall"] },
  { name: "Deccan Gymkhana, Pune", lat: 18.5167, lng: 73.8417, desc: "JM Road, Deccan", type: "place", keywords: ["deccan", "jm road"] },
  
  // Other Metros
  { name: "Bandra Kurla Complex (BKC), Mumbai", lat: 19.0664, lng: 72.8687, desc: "BKC Commercial Hub, Mumbai", type: "itpark", keywords: ["bkc", "bandra", "mumbai"] },
  { name: "Andheri Metro Station, Mumbai", lat: 19.1197, lng: 72.8464, desc: "Western Suburbs, Mumbai", type: "transit", keywords: ["andheri", "metro", "mumbai"] },
  { name: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167, desc: "Central Business District, Delhi", type: "place", keywords: ["cp", "connaught place", "delhi"] },
  { name: "Indiranagar 100ft Road, Bengaluru", lat: 12.9719, lng: 77.6412, desc: "Indiranagar, East Bengaluru", type: "place", keywords: ["indiranagar", "bengaluru", "bangalore"] }
];

// Leaflet Map Handles & Layers
let passengerMap = null;
let driverMap = null;
let sandboxMap = null;

let passengerTileLayer = null;
let driverTileLayer = null;
let sandboxTileLayer = null;

let passengerRouteLine = null;
let passengerTraveledRouteLine = null;
let passengerDriverMarker = null;
let driverRouteLine = null;
let sandboxRouteLine = null;

// Map click target mode: null, 'pickup', 'drop'
let currentMapPinMode = null;
let adminChartInstance = null;
let autocompleteDebounceTimer = null;

// Real-Time Live Moving Vehicle Animation Timer & State
let liveTripAnimationTimer = null;
let liveTripCurrentStepIndex = 0;
let liveTripWaypoints = [];

// Driver Popup Timer handle
let driverPopupCountdownInterval = null;
let currentPendingRide = null;

// -------------------------------------------------------------
// 1. TRILINGUAL I18N DICTIONARY
// -------------------------------------------------------------
const I18N = {
  en: {
    tagline: "Sahi Ride, Sahi Price • Dynamic Pooling & Route Match",
    nav_home: "Home",
    nav_passenger: "Passenger App",
    nav_driver: "Driver Cockpit",
    nav_algorithm: "Match Sandbox",
    nav_admin: "Admin Fleet",
    hero_badge: "Maximizing Vehicle Capacity • First 3 Rides 100% FREE • Every 5th Ride 5% OFF",
    hero_subtext: "Choose your exact pickup and drop point freely — just like a normal cab. Enjoy your First 3 Rides completely FREE, get 5% OFF on every 5th ride, and save 35% on every daily commute.",
    cta_book_ride: "Claim 3 Free Rides / Share Auto",
    cta_driver_portal: "Driver Portal & Route Match",
    cta_see_algorithm: "See Algorithm in Action",
    diff1_tag: "Differentiator 1 • Driver Homebound Ride",
    diff1_title: "Eliminating Empty Deadhead Returns",
    before_driver_title: "Before: Empty Return Trip",
    before_driver_desc: "Driver drops rider in distant suburb and drives 18 km back home alone. Earns ₹0, wastes ₹95 on fuel/CNG.",
    after_driver_title: "With SahiRide: 'Set My Route'",
    after_driver_desc: "Driver enters home destination. System matches passengers along that corridor. Earns ₹190+ profit on the return trip!",
    diff2_tag: "Differentiator 2 • Dynamic Share Auto",
    diff2_title: "100% Free Pickup/Drop + 3 Free Rides & 5% Milestone",
    before_pass_title: "Before: Paying Full Solo Fares",
    before_pass_desc: "Solo passenger pays full vehicle fare ₹120 for 3 seats in an auto-rickshaw even when travelling alone.",
    after_pass_title: "With SahiRide: 'Share & Save'",
    after_pass_desc: "Passenger picks exact pickup & drop. First 3 Rides cost ₹0 (100% Free) + 5% OFF every 5th ride, driver still earns ₹220!",
    calc_pill: "Real-Time Financial Impact",
    calc_title: "Calculate Your Extra Earnings & Monthly Savings",
    calc_desc: "See exactly how much drivers gain from return routes and how much passengers save by sharing.",
    calc_driver_tab: "Driver Extra Earnings Calculator",
    calc_passenger_tab: "Passenger Commute Savings Calculator",
    calc_veh_type: "Vehicle Type",
    calc_return_trips: "Daily Empty / Return Trips",
    calc_return_dist: "Average Return Distance",
    calc_pool_share: "Share Auto Pool Trips per Day",
    calc_est_extra_income: "Estimated Extra Monthly Income",
    calc_driver_subtext: "Extra pure profit from monetizing empty returns & multi-passenger pooled rides.",
    calc_homebound_gain: "Homebound Ride Payout:",
    calc_pool_gain: "Pooled Rides Uplift:",
    calc_fuel_saved: "Deadhead Fuel Saved:",
    calc_seat_fill: "Capacity Utilization:",
    calc_pass_dist: "One-Way Commute Distance",
    calc_pass_days: "Commute Days per Week",
    calc_pref_veh: "Preferred Vehicle",
    calc_est_monthly_savings: "Estimated Monthly Commute Savings",
    calc_pass_subtext: "Saved compared to booking full private autos/cabs for everyday travel.",
    calc_solo_fare: "Solo Private Fare:",
    calc_shared_fare: "SahiRide Share Fare:",
    calc_discount_rate: "Milestone Reward:",
    calc_annual_savings: "Annual Savings:",
    how_pill: "True Point-To-Point Flexibility",
    how_title: "Why SahiRide Outperforms Traditional Apps",
    how_desc: "Unlike fixed-route shuttles or expensive solo cabs, SahiRide dynamically merges individual journeys on the fly.",
    feat1_title: "100% Free Pickup & Drop",
    feat1_desc: "No fixed bus stops or meeting points. Set your own doorstep pickup and office drop just like a regular taxi booking.",
    feat2_title: "Vector & Corridor Matching",
    feat2_desc: "Algorithms ensure co-passengers are heading in the same general direction (≤ 30° deviation) with minimal detour (< 5 mins).",
    feat3_title: "First 3 Rides FREE & 5th Ride 5% OFF",
    feat3_desc: "New users get 3 complimentary rides on us, plus an automatic 5% loyalty discount on every 5th ride forever.",
    feat4_title: "Women-Only & Safety Shield",
    feat4_desc: "Optional Women-Only pool filter, KYC-verified drivers, real-time OTP handshakes, masked rider contact info, and 24/7 SOS dispatch.",
    p_book_ride_title: "Book Your Ride"
  },
  hi: {
    tagline: "सही राइड, सही दाम • डायनामिक पूलिंग और घर वापसी रूट मैच",
    nav_home: "मुख्य पृष्ठ",
    nav_passenger: "यात्री ऐप",
    nav_driver: "चालक पोर्टल",
    nav_algorithm: "मैचिंग इंजन",
    nav_admin: "एडमिन फ्लीट",
    hero_badge: "वाहन क्षमता का पूरा उपयोग • पहली ३ राइड्स मुफ्त • हर ५वीं राइड पर ५% छूट",
    hero_subtext: "अपनी पसंद का सटीक पिकअप और ड्रॉप चुनें। पहली ३ राइड्स बिल्कुल मुफ्त पाएं, हर ५वीं राइड पर ५% छूट पाएं और रोजाना ३५% बचाएं।",
    cta_book_ride: "३ फ्री राइड्स पाएं / शेयर ऑटो",
    cta_driver_portal: "चालक पोर्टल और रूट मैच",
    cta_see_algorithm: "एल्गोरिदम देखें",
    diff1_tag: "विशेषता 1 • ड्राइवर घर वापसी राइड",
    diff1_title: "खाली वापसी यात्राओं का अंत",
    before_driver_title: "पहले: खाली वापसी यात्रा",
    before_driver_desc: "ड्राइवर सवारी छोड़कर 18 किमी खाली घर लौटता है। ₹0 कमाई, ₹95 का ईंधन बर्बाद।",
    after_driver_title: "SahiRide के साथ: 'रूट सेट करें'",
    after_driver_desc: "ड्राइवर घर का गंतव्य डालता है। सिस्टम उसी रास्ते के यात्रियों को जोड़ता है। वापसी में ₹190+ का शुद्ध मुनाफा!",
    diff2_tag: "विशेषता 2 • डायनामिक शेयर ऑटो",
    diff2_title: "100% मनचाहा पिकअप/ड्रॉप + ३ फ्री राइड्स और ५% छूट",
    before_pass_title: "पहले: खाली सीटों का पूरा किराया",
    before_pass_desc: "अकेला यात्री पूरे ऑटो की 3 सीटों का ₹120 किराया अकेले भरता है।",
    after_pass_title: "SahiRide के साथ: 'शेयर और बचत'",
    after_pass_desc: "यात्री अपना सटीक पिकअप/ड्रॉप चुनता है। पहली ३ राइड्स ₹0 + हर ५वीं राइड पर ५% छूट, ड्राइवर कमाता है ₹220!",
    calc_pill: "वास्तविक आर्थिक लाभ",
    calc_title: "अपनी अतिरिक्त कमाई और मासिक बचत की गणना करें",
    calc_desc: "देखें कि ड्राइवर खाली वापसी से कितना कमाते हैं और यात्री शेयरिंग से कितना बचाते हैं।",
    calc_driver_tab: "ड्राइवर अतिरिक्त कमाई कैलकुलेटर",
    calc_passenger_tab: "यात्री यात्रा बचत कैलकुलेटर",
    calc_veh_type: "वाहन का प्रकार",
    calc_return_trips: "दैनिक खाली / वापसी यात्राएं",
    calc_return_dist: "औसत वापसी दूरी",
    calc_pool_share: "प्रतिदिन शेयर ऑटो पूल यात्राएं",
    calc_est_extra_income: "अनुमानित अतिरिक्त मासिक आय",
    calc_driver_subtext: "खाली वापसी और पूल राइड्स से शुद्ध अतिरिक्त मुनाफा।",
    calc_homebound_gain: "घर वापसी राइड कमाई:",
    calc_pool_gain: "पूल राइड्स से बढ़ोतरी:",
    calc_fuel_saved: "बचाया गया ईंधन:",
    calc_seat_fill: "क्षमता उपयोग:",
    calc_pass_dist: "एक तरफ की दूरी",
    calc_pass_days: "सप्ताह में यात्रा के दिन",
    calc_pref_veh: "पसंदीदा वाहन",
    calc_est_monthly_savings: "अनुमानित मासिक बचत",
    calc_pass_subtext: "रोजाना प्राइवेट ऑटो/कैब बुक करने की तुलना में बचत।",
    calc_solo_fare: "प्राइवेट किराया:",
    calc_shared_fare: "SahiRide शेयर किराया:",
    calc_discount_rate: "माइलस्टोन ऑफर:",
    calc_annual_savings: "सालाना बचत:",
    how_pill: "सच्ची पॉइंट-टू-पॉइंट सुविधा",
    how_title: "SahiRide पारंपरिक ऐप्स से बेहतर क्यों है",
    how_desc: "फिक्स्ड शटल या महंगी प्राइवेट कैब के विपरीत, SahiRide स्वतंत्र यात्राओं को तुरंत जोड़ता है।",
    feat1_title: "100% मनचाहा पिकअप व ड्रॉप",
    feat1_desc: "कोई फिक्स्ड बस स्टॉप नहीं। सामान्य टैक्सी की तरह अपने घर के दरवाजे से पिकअप और गंतव्य पर ड्रॉप सेट करें।",
    feat2_title: "वेक्टर और कॉरिडोर मैचिंग",
    feat2_desc: "एल्गोरिदम सुनिश्चित करता है कि सह-यात्री एक ही दिशा में जा रहे हों और न्यूनतम चक्कर लगे।",
    feat3_title: "३ फ्री राइड्स और हर ५वीं राइड पर ५% छूट",
    feat3_desc: "नए उपयोगकर्ताओं को पहली ३ राइड्स मुफ्त मिलती हैं, और नियमित यात्रियों को हर ५वीं राइड पर ५% लॉयल्टी छूट मिलती है।",
    feat4_title: "महिला-विशेष और सुरक्षा शील्ड",
    feat4_desc: "महिला-विशेष पूल विकल्प, सत्यापित चालक, रीयल-टाइम ओटीपी, सुरक्षित प्रोफाइल और 24/7 एसओएस।",
    p_book_ride_title: "सवारी बुक करें"
  },
  mr: {
    tagline: "सही राईड, सही भाव • डायनॅमिक पूलिंग आणि घरवापसी रूट मॅच",
    nav_home: "मुख्य पान",
    nav_passenger: "प्रवासी ॲप",
    nav_driver: "चालक पोर्टल",
    nav_algorithm: "मॅचिंग इंजिन",
    nav_admin: "ॲडमिन फ्लीट",
    hero_badge: "वाहनांच्या क्षमतेचा पूर्ण वापर • पहिल्या ३ राईड्स मोफत • प्रत्येक ५वी राईड ५% सूट",
    hero_subtext: "तुमचा स्वतःचा पिकअप आणि ड्रॉप पॉईंट निवडा. पहिल्या ३ राईड्स मोफत मिळवा, प्रत्येक ५व्या राईडवर ५% सूट मिळवा आणि दररोज ३५% बचत करा.",
    cta_book_ride: "३ मोफत राईड्स मिळवा / शेअर ऑटो",
    cta_driver_portal: "चालक पोर्टल आणि रूट मॅच",
    cta_see_algorithm: "अल्गोरिदम पहा",
    diff1_tag: "वैशिष्ट्य १ • चालक घरवापसी राईड",
    diff1_title: "रिकाम्या परतीच्या प्रवासांचे निर्मूलन",
    before_driver_title: "आधी: रिकामा परतीचा प्रवास",
    before_driver_desc: "चालक लांब प्रवासी सोडून १८ किमी घरी रिकामा येतो. ₹० कमाई, ₹९५ चे इंधन वाया.",
    after_driver_title: "SahiRide सोबत: 'रूट सेट करा'",
    after_driver_desc: "चालक घराचे ठिकाण टाकतो. सिस्टम त्याच मार्गावरील प्रवासी जोडते. परतीच्या प्रवासात ₹१९०+ चा निव्वळ नफा!",
    diff2_tag: "वैशिष्ट्य २ • डायनॅमिक शेअर ऑटो",
    diff2_title: "१००% स्वतःचा पिकअप/ड्रॉप + ३ मोफत राईड्स आणि ५% सूट",
    before_pass_title: "आधी: रिकाम्या सीट्सचे पूर्ण भाडे",
    before_pass_desc: "एकटा प्रवासी ऑटोच्या ३ जागांचे पूर्ण ₹१२० भाडे एकटाच भरतो.",
    after_pass_title: "SahiRide सोबत: 'शेअर आणि सेव्ह'",
    after_pass_desc: "प्रवासी स्वतःचा पिकअप/ड्रॉप निवडतो. पहिल्या ३ राईड्स मोफत + प्रत्येक ५व्या राईडवर ५% सूट, चालक कमावतो ₹२२०!",
    calc_pill: "थेट आर्थिक फायदा",
    calc_title: "तुमची अतिरिक्त कमाई आणि मासिक बचत मोजा",
    calc_desc: "चालक परतीच्या प्रवासातून किती जास्त कमवू शकतात आणि प्रवासी शेअरिंगने किती वाचवू शकतात ते पहा.",
    calc_driver_tab: "चालक अतिरिक्त कमाई कॅल्क्युलेटर",
    calc_passenger_tab: "प्रवासी बचत कॅल्क्युलेटर",
    calc_veh_type: "वाहनाचा प्रकार",
    calc_return_trips: "दररोजचे परतीचे फेरे",
    calc_return_dist: "सरासरी परतीचे अंतर",
    calc_pool_share: "दररोजचे शेअर ऑटो पूल फेरे",
    calc_est_extra_income: "अंदाजे अतिरिक्त मासिक कमाई",
    calc_driver_subtext: "रिकामे फेरे आणि पूल राईड्समधून अतिरिक्त निव्वळ नफा.",
    calc_homebound_gain: "घरवापसी राईड कमाई:",
    calc_pool_gain: "पूल राईड्समधून वाढ:",
    calc_fuel_saved: "वाचलेले इंधन:",
    calc_seat_fill: "क्षमता वापर:",
    calc_pass_dist: "एका बाजूचे अंतर",
    calc_pass_days: "आठवड्यातील प्रवासाचे दिवस",
    calc_pref_veh: "पसंतीचे वाहन",
    calc_est_monthly_savings: "अंदाजे मासिक बचत",
    calc_pass_subtext: "दररोज खाजगी ऑटो/कॅब बुक करण्याच्या तुलनेत बचत.",
    calc_solo_fare: "खाजगी भाडे:",
    calc_shared_fare: "SahiRide शेअर भाडे:",
    calc_discount_rate: "माईलस्टोन ऑफर:",
    calc_annual_savings: "वार्षिक बचत:",
    how_pill: "पॉईंट-टू-पॉईंट लवचिकता",
    how_title: "SahiRide पारंपारिक ॲप्सपेक्षा श्रेष्ठ का आहे",
    how_desc: "ठरावीक शटल किंवा महागड्या खाजगी कॅब्सऐवजी, SahiRide प्रवाशांचे मार्ग आपोआप एकत्र जोडते.",
    feat1_title: "१००% स्वतःचा पिकअप आणि ड्रॉप",
    feat1_desc: "कोणतेही फिक्स बस स्टॉप नाहीत. सामान्य टॅक्सीप्रमाणे घराच्या दारातून पिकअप आणि इच्छित स्थळी ड्रॉप मिळवा.",
    feat2_title: "व्हेक्टर आणि कॉरिडॉर मॅचिंग",
    feat2_desc: "अल्गोरिदम खात्री करतो की सहप्रवासी एकाच दिशेने जात आहेत आणि कमीतकमी वळण लागेल.",
    feat3_title: "३ मोफत राईड्स आणि प्रत्येक ५व्या राईडवर ५% सूट",
    feat3_desc: "नवीन वापरकर्त्यांना ३ मोफत राईड्स मिळतात, तसेच प्रत्येक ५व्या राईडवर ५% लॉयल्टी सूट मिळते.",
    feat4_title: "महिला-विशेष आणि सुरक्षा शील्ड",
    feat4_desc: "महिलांसाठी स्वतंत्र पूल पर्याय, पडताळणी झालेले चालक, ओटीपी सुरक्षा आणि २४/७ एसओएस सुविधा.",
    p_book_ride_title: "राईड बुक करा"
  }
};

// -------------------------------------------------------------
// 2. AUDIO CHIME SYNTHESIZER (WEB AUDIO API)
// -------------------------------------------------------------
function playSoundAlert(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'incoming') {
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } else if (type === 'accept' || type === 'milestone') {
      [523.25, 659.25, 783.99, 1046.50].forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      });
    }
  } catch (e) {
    console.log('Audio chime error:', e);
  }
}

// -------------------------------------------------------------
// 3. THEME & LANGUAGE MANAGEMENT
// -------------------------------------------------------------
function initTheme() {
  const saved = localStorage.getItem('sahiride_theme') || 'dark';
  setTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const target = (current === 'dark') ? 'light' : 'dark';
  setTheme(target);
}

function setTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sahiride_theme', theme);

  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
  }

  updateMapTilesTheme(theme);
  initIcons();
}

function updateMapTilesTheme(theme) {
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  [passengerMap, driverMap, sandboxMap].forEach(m => {
    if (m) m.invalidateSize();
  });
}

function toggleLanguageMenu() {
  const menu = document.getElementById('langMenu');
  if (menu) menu.classList.toggle('open');
}

function setLanguage(lang) {
  state.currentLang = lang;
  const label = document.getElementById('currentLangLabel');
  if (label) {
    if (lang === 'hi') label.textContent = 'हिन्दी';
    else if (lang === 'mr') label.textContent = 'मराठी';
    else label.textContent = 'English';
  }

  const dict = I18N[lang] || I18N['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const menu = document.getElementById('langMenu');
  if (menu) menu.classList.remove('open');
  initIcons();
}

// -------------------------------------------------------------
// 4. DOM INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initTheme();
  updateDriverCalc();
  updatePassengerCalc();
  initAdminChart();
  updateAuthUI();
  updateLoyaltyMilestoneUI();

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-container')) {
      closeAllAutocomplete();
    }
    if (!e.target.closest('.lang-selector')) {
      const menu = document.getElementById('langMenu');
      if (menu) menu.classList.remove('open');
    }
  });

  setLanguage('en');
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// -------------------------------------------------------------
// 5. ONBOARDING CAROUSEL ENGINE (4 SLIDES INCLUDING 5% 5TH RIDE)
// -------------------------------------------------------------
function goToSlide(slideNum) {
  state.currentSlide = slideNum;
  for (let i = 1; i <= state.totalSlides; i++) {
    const slide = document.getElementById(`slide-${i}`);
    if (slide) slide.style.display = i === slideNum ? 'flex' : 'none';
  }

  const dots = document.querySelectorAll('.onboarding-dots .dot');
  dots.forEach((d, idx) => {
    d.classList.toggle('active', idx + 1 === slideNum);
  });

  const badge = document.getElementById('slideBadgeText');
  if (badge) badge.textContent = `Feature ${slideNum} of ${state.totalSlides}`;

  const nextBtn = document.getElementById('onboardingNextBtn');
  if (nextBtn) {
    nextBtn.innerHTML = slideNum === state.totalSlides ? '<span>Get Started &rarr; Login</span>' : '<span>Next &rarr;</span>';
  }

  initIcons();
}

function nextSlide() {
  if (state.currentSlide < state.totalSlides) {
    goToSlide(state.currentSlide + 1);
  } else {
    skipOnboarding();
  }
}

function skipOnboarding() {
  switchView('login');
}

// -------------------------------------------------------------
// 6. AUTHENTICATION & DRIVER KYC
// -------------------------------------------------------------
function setAuthMode(mode) {
  state.authMode = mode;
  state.userSession.isNewUser = (mode === 'signup');

  document.getElementById('btnAuthModeLogin').classList.toggle('active', mode === 'login');
  document.getElementById('btnAuthModeSignup').classList.toggle('active', mode === 'signup');

  const title = document.getElementById('authHeaderTitle');
  const sub = document.getElementById('authHeaderSubtitle');
  const btnText = document.getElementById('btnGetOtpText');
  const btnVerify = document.getElementById('btnVerifyAuthText');

  if (mode === 'signup') {
    if (title) title.textContent = 'Create New SahiRide Account';
    if (sub) sub.textContent = 'Join India’s smartest pooling & route match platform';
    if (btnText) btnText.textContent = 'Verify Mobile & Submit Registration';
    if (btnVerify) btnVerify.textContent = 'Verify OTP & Claim 3 Free Rides';
  } else {
    if (title) title.textContent = 'Welcome to SahiRide';
    if (sub) sub.textContent = 'Sign in to book pooled rides or accept homebound passengers';
    if (btnText) btnText.textContent = 'Get Verification Code (OTP)';
    if (btnVerify) btnVerify.textContent = 'Verify OTP & Start SahiRide';
  }

  updateAuthFormVisibility();
}

function selectLoginRole(role) {
  state.userSession.role = role;
  document.getElementById('loginRolePassenger').classList.toggle('active', role === 'passenger');
  document.getElementById('loginRoleDriver').classList.toggle('active', role === 'driver');
  updateAuthFormVisibility();
}

function updateAuthFormVisibility() {
  const isSignup = state.authMode === 'signup';
  const isDriver = state.userSession.role === 'driver';

  const passFields = document.getElementById('signupPassengerFields');
  const driverFields = document.getElementById('signupDriverKYCFields');

  if (passFields) passFields.style.display = (isSignup && !isDriver) ? 'block' : 'none';
  if (driverFields) driverFields.style.display = (isSignup && isDriver) ? 'block' : 'none';

  initIcons();
}

function requestLoginOtp() {
  const phone = document.getElementById('loginPhoneInput').value.trim();
  if (phone.length < 10) {
    alert('Please enter a valid 10-digit mobile phone number.');
    return;
  }
  state.userSession.phone = phone;

  if (state.authMode === 'signup' && state.userSession.role === 'driver') {
    const dl = document.getElementById('signupDriverDL').value.trim();
    const aadhaar = document.getElementById('signupDriverAadhaar').value.trim();
    if (!dl || !aadhaar) {
      alert('Please fill Driving License (DL) and Aadhaar numbers for mandatory Driver KYC.');
      return;
    }
  }

  document.getElementById('loginStepPhone').style.display = 'none';
  document.getElementById('loginStepOtp').style.display = 'block';
  initIcons();
}

function autoFillDemoOtp() {
  const digits = ['5', '8', '3', '9', '2', '1'];
  for (let i = 1; i <= 6; i++) {
    const box = document.getElementById(`otp-${i}`);
    if (box) box.value = digits[i - 1];
  }
}

function verifyLoginOtp() {
  state.userSession.isLoggedIn = true;

  if (state.authMode === 'signup') {
    state.userSession.isNewUser = true;
    state.userSession.freeRidesRemaining = 3;
    state.passenger.freeRidesPromoActive = true;
    if (state.userSession.role === 'driver') {
      const name = document.getElementById('signupDriverName').value.trim();
      state.userSession.name = name || 'Ramesh Shinde';
      state.userSession.kycStatus = 'verified';
    } else {
      const name = document.getElementById('signupPassName').value.trim();
      state.userSession.name = name || 'Jayesh Sharma';
    }
  } else {
    state.userSession.name = state.userSession.role === 'driver' ? 'Ramesh Shinde' : 'Jayesh Sharma';
  }
  
  updateAuthUI();

  if (state.userSession.isNewUser && state.userSession.role === 'passenger') {
    alert(`🎉 Welcome to SahiRide, ${state.userSession.name}!\nYou have unlocked your FIRST 3 RIDES 100% FREE! Plus 5% OFF on every 5th ride!`);
  } else if (state.userSession.isNewUser && state.userSession.role === 'driver') {
    alert(`🎉 Welcome Captain ${state.userSession.name}!\nDriver KYC Verification Approved ✓. You can now accept homebound & pooled rides!`);
  } else {
    alert(`Welcome back to SahiRide, ${state.userSession.name}!`);
  }

  if (state.userSession.role === 'driver') {
    switchView('driver');
    setTimeout(() => { triggerDriverRidePopup(); }, 3500);
  } else {
    switchView('passenger');
  }
}

function backToPhoneStep() {
  document.getElementById('loginStepPhone').style.display = 'block';
  document.getElementById('loginStepOtp').style.display = 'none';
}

function openProfileModal() {
  if (!state.userSession.isLoggedIn) {
    switchView('login');
    return;
  }

  const nameInput = document.getElementById('profInputName');
  const phoneInput = document.getElementById('profInputPhone');
  const emailInput = document.getElementById('profInputEmail');
  const emergencyInput = document.getElementById('profInputEmergency');
  const roleSelect = document.getElementById('profSelectRole');
  const statusSelect = document.getElementById('profSelectUserStatus');
  const tripsInput = document.getElementById('profInputLifetimeTrips');

  if (nameInput) nameInput.value = state.userSession.name;
  if (phoneInput) phoneInput.value = state.userSession.phone;
  if (emailInput) emailInput.value = state.userSession.email || 'jayesh@example.com';
  if (emergencyInput) emergencyInput.value = state.userSession.emergency || 'Pooja Sharma (+91-98765-00000)';
  if (roleSelect) roleSelect.value = state.userSession.role;
  if (statusSelect) statusSelect.value = state.userSession.isNewUser ? 'new' : 'regular';
  if (tripsInput) tripsInput.value = state.userSession.totalRidesTaken;

  const modalName = document.getElementById('profileModalNameDisplay');
  if (modalName) modalName.textContent = state.userSession.name;
  
  const modalRole = document.getElementById('profileModalRoleDisplay');
  if (modalRole) modalRole.innerHTML = `Verified SahiRide ${state.userSession.role === 'driver' ? 'Captain / Driver' : 'Passenger'}`;

  const avatar = document.getElementById('profileModalAvatar');
  if (avatar) {
    const initials = state.userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JS';
    avatar.textContent = initials;
  }

  toggleUserNewStatus(state.userSession.isNewUser ? 'new' : 'regular');
  openModal('profileModal');
}

function updateLifetimeTripsSim(val) {
  const num = parseInt(val) || 1;
  state.userSession.totalRidesTaken = num;
  updateLoyaltyMilestoneUI();
  recalcPassengerFares();
}

function setSimTrips(n) {
  state.userSession.totalRidesTaken = n;
  const input = document.getElementById('profInputLifetimeTrips');
  if (input) input.value = n;
  updateLoyaltyMilestoneUI();
  recalcPassengerFares();
  alert(`Simulated trip count updated to ${n}! Milestone status recalculated.`);
}

function toggleUserNewStatus(status) {
  state.userSession.isNewUser = (status === 'new');
  state.passenger.freeRidesPromoActive = (status === 'new');
  
  const badge = document.getElementById('profileNewUserBadge');
  const headerBadge = document.getElementById('headerNewUserBadge');
  const tripsStat = document.getElementById('profStatsTrips');
  const savedStat = document.getElementById('profStatsSaved');

  if (badge) badge.style.display = state.userSession.isNewUser ? 'inline-flex' : 'none';
  if (headerBadge) headerBadge.style.display = state.userSession.isNewUser ? 'inline-flex' : 'none';

  if (state.userSession.isNewUser) {
    if (tripsStat) tripsStat.textContent = `Ride #${state.userSession.totalRidesTaken}`;
    if (savedStat) savedStat.textContent = `${state.userSession.freeRidesRemaining} / 3 FREE`;
  } else {
    if (tripsStat) tripsStat.textContent = `${state.userSession.totalRidesTaken} Rides`;
    if (savedStat) savedStat.textContent = '₹3,420 Saved';
  }

  updateLoyaltyMilestoneUI();
  recalcPassengerFares();
}

function saveUserProfile() {
  const name = document.getElementById('profInputName').value.trim();
  const phone = document.getElementById('profInputPhone').value.trim();
  const email = document.getElementById('profInputEmail').value.trim();
  const emergency = document.getElementById('profInputEmergency').value.trim();
  const role = document.getElementById('profSelectRole').value;
  const status = document.getElementById('profSelectUserStatus').value;
  const trips = parseInt(document.getElementById('profInputLifetimeTrips').value) || 1;

  if (!name || !phone) {
    alert('Name and Phone Number cannot be blank.');
    return;
  }

  state.userSession.name = name;
  state.userSession.phone = phone;
  state.userSession.email = email;
  state.userSession.emergency = emergency;
  state.userSession.role = role;
  state.userSession.totalRidesTaken = trips;
  state.userSession.isNewUser = (status === 'new');
  state.passenger.freeRidesPromoActive = (status === 'new');

  updateAuthUI();
  updateLoyaltyMilestoneUI();
  recalcPassengerFares();
  closeModal('profileModal');
  alert('Your profile details and ride settings have been saved!');

  if (role === 'driver' && state.currentView === 'passenger') {
    switchView('driver');
  } else if (role === 'passenger' && state.currentView === 'driver') {
    switchView('passenger');
  }
}

function confirmLogout() {
  if (confirm('Are you sure you want to log out of SahiRide?')) {
    closeModal('profileModal');
    logout();
  }
}

function logout() {
  state.userSession.isLoggedIn = false;
  updateAuthUI();
  switchView('login');
}

function updateAuthUI() {
  const label = document.getElementById('userProfileLabel');
  const dot = document.getElementById('userStatusDot');
  const headerBadge = document.getElementById('headerNewUserBadge');

  if (state.userSession.isLoggedIn) {
    const shortName = state.userSession.name.split(' ')[0];
    if (label) label.textContent = `${shortName} (${state.userSession.role === 'driver' ? 'Driver' : 'Passenger'})`;
    if (dot) dot.style.background = 'var(--brand-secondary)';
    if (headerBadge) headerBadge.style.display = (state.passenger.freeRidesPromoActive && state.userSession.freeRidesRemaining > 0) ? 'inline-flex' : 'none';
  } else {
    if (label) label.textContent = 'Login / Sign Up';
    if (dot) dot.style.background = 'var(--brand-primary)';
    if (headerBadge) headerBadge.style.display = 'none';
  }

  updateRoleAccessUI();
}

function updateRoleAccessUI() {
  const role = state.userSession.role; // 'passenger' | 'driver'

  const tabPassenger = document.getElementById('tabBtn-passenger');
  const tabDriver = document.getElementById('tabBtn-driver');
  const tabMatching = document.getElementById('tabBtn-matching');
  const tabAdmin = document.getElementById('tabBtn-admin');

  const mTabPassenger = document.getElementById('mTab-passenger');
  const mTabDriver = document.getElementById('mTab-driver');
  const mTabMatching = document.getElementById('mTab-matching');
  const mTabAdmin = document.getElementById('mTab-admin');

  const heroBtnPassenger = document.getElementById('heroBtnPassenger');
  const heroBtnDriver = document.getElementById('heroBtnDriver');
  const heroBtnSandbox = document.getElementById('heroBtnSandbox');

  // Internal developer / admin tabs are always hidden from main view
  if (tabMatching) tabMatching.style.display = 'none';
  if (tabAdmin) tabAdmin.style.display = 'none';
  if (mTabMatching) mTabMatching.style.display = 'none';
  if (mTabAdmin) mTabAdmin.style.display = 'none';
  if (heroBtnSandbox) heroBtnSandbox.style.display = 'none';

  if (role === 'passenger') {
    // ==========================================
    // 👤 CUSTOMER / PASSENGER MODE:
    // User sees ONLY Customer / Passenger Window
    // ==========================================
    if (tabPassenger) tabPassenger.style.display = 'inline-flex';
    if (tabDriver) tabDriver.style.display = 'none';

    if (mTabPassenger) mTabPassenger.style.display = 'flex';
    if (mTabDriver) mTabDriver.style.display = 'none';

    if (heroBtnPassenger) heroBtnPassenger.style.display = 'inline-flex';
    if (heroBtnDriver) heroBtnDriver.style.display = 'none';

    // Show Passenger Savings Calculator Tab
    setCalcTab('passenger');
    const calcDriverTab = document.getElementById('calcTabDriver');
    if (calcDriverTab) calcDriverTab.style.display = 'none';
  } else {
    // ==========================================
    // 🚖 DRIVER / CAPTAIN MODE:
    // User sees ONLY Driver Window
    // ==========================================
    if (tabPassenger) tabPassenger.style.display = 'none';
    if (tabDriver) tabDriver.style.display = 'inline-flex';

    if (mTabPassenger) mTabPassenger.style.display = 'none';
    if (mTabDriver) mTabDriver.style.display = 'flex';

    if (heroBtnPassenger) heroBtnPassenger.style.display = 'none';
    if (heroBtnDriver) heroBtnDriver.style.display = 'inline-flex';

    // Show Driver Earnings Calculator Tab
    setCalcTab('driver');
    const calcPassTab = document.getElementById('calcTabPassenger');
    if (calcPassTab) calcPassTab.style.display = 'none';
  }
}

// -------------------------------------------------------------
// 7. VIEW NAVIGATION & MANAGEMENT
// -------------------------------------------------------------
function switchView(viewName) {
  // Strict Role-Based View Guard:
  if (state.userSession.role === 'passenger') {
    if (viewName === 'driver' || viewName === 'admin' || viewName === 'matching') {
      viewName = 'passenger';
    }
  } else if (state.userSession.role === 'driver') {
    if (viewName === 'passenger' || viewName === 'admin' || viewName === 'matching') {
      viewName = 'driver';
    }
  }

  state.currentView = viewName;

  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.classList.add('active');

  document.querySelectorAll('.view-tab-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById(`tabBtn-${viewName}`);
  if (targetBtn) targetBtn.classList.add('active');

  document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.remove('active'));
  const targetMobileBtn = document.getElementById(`mTab-${viewName}`);
  if (targetMobileBtn) targetMobileBtn.classList.add('active');

  setTimeout(() => {
    if (viewName === 'passenger') {
      initPassengerMap();
    } else if (viewName === 'driver') {
      initDriverMap();
    } else if (viewName === 'matching') {
      initSandboxMap();
    } else if (viewName === 'admin') {
      if (adminChartInstance) adminChartInstance.resize();
    }
  }, 120);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------
// 8. DRIVER INCOMING RIDE REQUEST POPUP ENGINE
// -------------------------------------------------------------
function triggerDriverRidePopup(rideData) {
  if (!state.driver.online) {
    state.driver.online = true;
    toggleDriverOnline();
  }

  currentPendingRide = rideData || {
    name: "Priya Sharma",
    rating: "4.9",
    trips: "142",
    isNew: false,
    seats: 1,
    pickup: { name: "PCCOE Akurdi / Nigdi", lat: 18.6517, lng: 73.7628 },
    drop: { name: "FC Road, Shivajinagar", lat: 18.5204, lng: 73.8567 },
    detourMins: "+3.2 mins",
    addedPayout: 75,
    totalTrip: 195
  };

  playSoundAlert('incoming');

  const pName = document.getElementById('popupPassengerName');
  if (pName) pName.textContent = `New Passenger: ${currentPendingRide.name}`;

  const pMeta = document.getElementById('popupPassengerMeta');
  if (pMeta) {
    pMeta.textContent = currentPendingRide.isNew 
      ? `🌱 New Passenger (First Ride) • ${currentPendingRide.seats} Seat (Share Auto)`
      : `★ ${currentPendingRide.rating} (${currentPendingRide.trips} rides) • ${currentPendingRide.seats} Seat (Share Auto)`;
  }

  const pPick = document.getElementById('popupPickupName');
  if (pPick) pPick.textContent = currentPendingRide.pickup.name;

  const pDrop = document.getElementById('popupDropName');
  if (pDrop) pDrop.textContent = currentPendingRide.drop.name;

  const pDetour = document.getElementById('popupDetourTime');
  if (pDetour) pDetour.textContent = currentPendingRide.detourMins;

  const pAdded = document.getElementById('popupAddedPayout');
  if (pAdded) pAdded.textContent = `+₹${currentPendingRide.addedPayout}.00`;

  const pTotal = document.getElementById('popupTotalEarnings');
  if (pTotal) pTotal.textContent = `₹${currentPendingRide.totalTrip}.00`;

  const pBtnAccept = document.getElementById('popupAcceptBtnText');
  if (pBtnAccept) pBtnAccept.textContent = `ACCEPT (+₹${currentPendingRide.addedPayout})`;

  let seconds = 15;
  const countEl = document.getElementById('popupCountdownText');
  if (countEl) countEl.textContent = seconds;

  clearInterval(driverPopupCountdownInterval);
  driverPopupCountdownInterval = setInterval(() => {
    seconds--;
    if (countEl) countEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(driverPopupCountdownInterval);
      closeModal('driverRideRequestModal');
    }
  }, 1000);

  openModal('driverRideRequestModal');
  initIcons();
}

function acceptIncomingRidePopup() {
  clearInterval(driverPopupCountdownInterval);
  closeModal('driverRideRequestModal');
  playSoundAlert('accept');

  const list = document.getElementById('driverManifestList');
  if (list && currentPendingRide) {
    list.innerHTML = `
      <div class="manifest-step">
        <div class="step-num pickup">1</div>
        <div class="step-details">
          <strong>Pick Up: Rahul M. (OTP: 5839)</strong>
          <p>Origin Pickup Point • <span style="color:var(--brand-secondary);">Boarded ✓</span></p>
        </div>
      </div>
      <div class="manifest-step" style="background:rgba(16,185,129,0.1); border-radius:var(--radius-sm); padding:0.6rem;">
        <div class="step-num pickup" style="background:var(--brand-secondary); color:#fff;">2</div>
        <div class="step-details">
          <strong>Pick Up: ${currentPendingRide.name} (OTP: 7421)</strong>
          <p>${currentPendingRide.pickup.name} • <span style="color:var(--brand-secondary); font-weight:700;">NEW MATCH ACCEPTED (+₹${currentPendingRide.addedPayout})</span></p>
        </div>
      </div>
      <div class="manifest-step">
        <div class="step-num drop">3</div>
        <div class="step-details">
          <strong>Drop Off: Rahul M.</strong>
          <p>Intermediate Dropoff • Payout: ₹75 (SahiRide Subsidized)</p>
        </div>
      </div>
      <div class="manifest-step">
        <div class="step-num drop">4</div>
        <div class="step-details">
          <strong>Drop Off: ${currentPendingRide.name}</strong>
          <p>${currentPendingRide.drop.name} • Payout: ₹${currentPendingRide.addedPayout}</p>
        </div>
      </div>
    `;
  }

  document.getElementById('driverSeatCount').textContent = 'Seats: 3/3 (Full Capacity)';
  state.driver.todayEarnings.total += (currentPendingRide ? currentPendingRide.addedPayout : 75);
  state.driver.todayEarnings.pool += (currentPendingRide ? currentPendingRide.addedPayout : 75);

  const earningsTotal = document.getElementById('driverEarningsTotal');
  if (earningsTotal) earningsTotal.textContent = `₹${state.driver.todayEarnings.total}`;
  
  const poolEarnings = document.getElementById('driverPoolEarnings');
  if (poolEarnings) poolEarnings.textContent = `₹${state.driver.todayEarnings.pool}`;

  renderDriverCockpitRoute();
  alert(`✓ Ride Accepted!\nAdded ${currentPendingRide.name} to route. Next stop: ${currentPendingRide.pickup.name}. Guaranteed driver earnings: +₹${currentPendingRide.addedPayout}.`);
  initIcons();
}

function declineIncomingRidePopup() {
  clearInterval(driverPopupCountdownInterval);
  closeModal('driverRideRequestModal');
}

// -------------------------------------------------------------
// 9. FIRST 3 RIDES 100% FREE & EVERY 5TH RIDE 5% OFF CONTROLLER
// -------------------------------------------------------------
function toggleFreeRidesPromo() {
  state.passenger.freeRidesPromoActive = !state.passenger.freeRidesPromoActive;
  const btn = document.getElementById('btnToggleFirstRideDiscount');
  const banner = document.getElementById('firstRidePromoBanner');

  if (state.passenger.freeRidesPromoActive && state.userSession.freeRidesRemaining > 0) {
    if (btn) {
      btn.textContent = 'FREE RIDE (₹0) ✓';
      btn.style.background = 'var(--brand-secondary)';
    }
    if (banner) banner.style.opacity = '1';
    alert(`🎉 First 3 Rides FREE Offer (Code: FREE3RIDES) is ACTIVE!\nRemaining Free Rides: ${state.userSession.freeRidesRemaining} of 3.`);
  } else {
    if (btn) {
      btn.textContent = 'APPLY FREE RIDE';
      btn.style.background = 'var(--brand-primary)';
    }
    if (banner) banner.style.opacity = '0.7';
    alert('Free Ride promo paused. Standard pooling / milestone rate applied.');
  }

  recalcPassengerFares();
}

function updateLoyaltyMilestoneUI() {
  const rides = state.userSession.totalRidesTaken;
  const stepInCycle = ((rides - 1) % 5) + 1; // 1 to 5
  const isMilestone = (rides % 5 === 0);
  const remaining = isMilestone ? 0 : (5 - (rides % 5));

  const progressPercent = (stepInCycle / 5) * 100;
  const fill = document.getElementById('loyaltyProgressFill');
  if (fill) fill.style.width = `${progressPercent}%`;

  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById(`ldot-${i}`);
    if (dot) {
      dot.classList.toggle('active', i <= stepInCycle);
    }
  }

  const lblProgress = document.getElementById('lblMilestoneProgressText');
  const lblStatus = document.getElementById('lblMilestoneStatusTag');
  const lblTitle = document.getElementById('lblLoyaltyMilestoneTitle');
  const profMilestone = document.getElementById('profStatsMilestone');
  const bookingReminder = document.getElementById('lblBookingReminderText');

  if (isMilestone) {
    if (lblProgress) lblProgress.textContent = `🎉 Current: Ride #${rides} • 5% LOYALTY DISCOUNT ACTIVE!`;
    if (lblStatus) {
      lblStatus.textContent = '5% OFF APPLIED ✓';
      lblStatus.style.color = 'var(--brand-primary)';
    }
    if (lblTitle) lblTitle.textContent = '🎖️ 5th Ride Milestone: 5% OFF Applied!';
    if (profMilestone) profMilestone.textContent = '5% OFF Active!';
    if (bookingReminder) {
      bookingReminder.innerHTML = `🎉 <strong>Milestone Active:</strong> You're saving an extra <strong>5% OFF</strong> on this 5th ride!`;
    }
  } else {
    if (lblProgress) lblProgress.textContent = `Current: Ride #${rides} • ${remaining} ride${remaining > 1 ? 's' : ''} to 5% OFF milestone`;
    if (lblStatus) {
      lblStatus.textContent = `Milestone in ${remaining}`;
      lblStatus.style.color = 'var(--brand-accent)';
    }
    if (lblTitle) lblTitle.textContent = 'Every 5th Ride: 5% OFF!';
    if (profMilestone) profMilestone.textContent = `${remaining} to 5% OFF`;
    if (bookingReminder) {
      if (remaining === 1) {
        bookingReminder.innerHTML = `🔥 <strong>Almost there!</strong> Travel <strong>1 more ride</strong> to unlock your <strong>5% OFF Milestone Ride</strong>!`;
      } else {
        bookingReminder.innerHTML = `💡 <strong>Commuter Perk:</strong> Travel <strong>${remaining} more rides</strong> to unlock <strong>5% OFF</strong> on your 5th ride!`;
      }
    }
  }

  const btnSim = document.getElementById('btnSimulateFifthRide');
  if (btnSim) {
    btnSim.textContent = isMilestone ? 'Reset to Ride 1' : 'Simulate 5th Ride';
  }
}

function simulateFifthRideMilestone() {
  if (state.userSession.totalRidesTaken % 5 === 0) {
    state.userSession.totalRidesTaken = 1;
  } else {
    state.userSession.totalRidesTaken = 5;
    playSoundAlert('milestone');
  }

  updateLoyaltyMilestoneUI();
  recalcPassengerFares();
}

// -------------------------------------------------------------
// 10. PASSENGER COUNT / SEATS CONTROLLER
// -------------------------------------------------------------
function adjustPassengerCount(delta) {
  const maxSeats = state.passenger.vehicle === 'auto' ? 3 : 4;
  let newCount = state.passenger.seatCount + delta;

  if (newCount < 1) newCount = 1;
  if (newCount > maxSeats) {
    alert(`Maximum passenger capacity for ${state.passenger.vehicle === 'auto' ? 'Auto-Rickshaw is 3 seats' : 'Mini Cab is 4 seats'}.`);
    return;
  }

  state.passenger.seatCount = newCount;
  document.getElementById('passengerCountVal').textContent = newCount;
  
  const lblPassenger = document.getElementById('lblPassengerCount');
  if (lblPassenger) {
    lblPassenger.textContent = `${newCount} Passenger${newCount > 1 ? 's' : ''} (${newCount} Seat${newCount > 1 ? 's' : ''})`;
  }

  recalcPassengerFares();
}

// -------------------------------------------------------------
// 11. GOOGLE MAPS-STYLE REAL-TIME LIVE GEOCODING & AUTOCOMPLETE
// -------------------------------------------------------------
function handleLocationInput(type, query) {
  clearTimeout(autocompleteDebounceTimer);
  const dropdown = document.getElementById(type === 'pickup' ? 'pickupAutocompleteDropdown' : 'dropAutocompleteDropdown');
  if (!dropdown) return;

  if (!query || query.trim().length < 2) {
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    return;
  }

  renderFastLocalSuggestions(type, query.trim(), dropdown);

  autocompleteDebounceTimer = setTimeout(() => {
    fetchLiveGeocodedPlaces(type, query.trim(), dropdown);
  }, 350);
}

function handleDriverDestInput(query) {
  clearTimeout(autocompleteDebounceTimer);
  const dropdown = document.getElementById('driverDestAutocompleteDropdown');
  if (!dropdown) return;

  if (!query || query.trim().length < 2) {
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    return;
  }

  renderFastLocalSuggestions('driverDest', query.trim(), dropdown);

  autocompleteDebounceTimer = setTimeout(() => {
    fetchLiveGeocodedPlaces('driverDest', query.trim(), dropdown);
  }, 350);
}

function renderFastLocalSuggestions(targetField, query, dropdownEl) {
  const lowerQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const localMatches = PLACES_DATABASE.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(query.toLowerCase());
    const descMatch = p.desc.toLowerCase().includes(query.toLowerCase());
    const kwMatch = p.keywords && p.keywords.some(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(lowerQuery) || lowerQuery.includes(k));
    return nameMatch || descMatch || kwMatch;
  });

  dropdownEl.innerHTML = '';

  if (localMatches.length > 0) {
    localMatches.slice(0, 4).forEach(place => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      
      let iconName = 'map-pin';
      let badgeHtml = '';
      if (place.type === 'college') {
        iconName = 'graduation-cap';
        badgeHtml = '<span class="autocomplete-badge">COLLEGE / CAMPUS</span>';
      } else if (place.type === 'transit') {
        iconName = 'train';
        badgeHtml = '<span class="autocomplete-badge" style="color:var(--brand-accent); background:var(--brand-accent-light);">TRANSIT</span>';
      } else if (place.type === 'itpark') {
        iconName = 'building';
        badgeHtml = '<span class="autocomplete-badge" style="color:var(--brand-secondary); background:var(--brand-secondary-light);">TECH PARK</span>';
      }

      item.innerHTML = `
        <i data-lucide="${iconName}" class="autocomplete-icon"></i>
        <div class="autocomplete-text">
          <strong>${place.name} ${badgeHtml}</strong>
          <span>${place.desc}</span>
        </div>
      `;
      item.onclick = () => selectAutocompletePlace(targetField, place);
      dropdownEl.appendChild(item);
    });

    dropdownEl.classList.add('open');
    initIcons();
  }
}

async function fetchLiveGeocodedPlaces(targetField, query, dropdownEl) {
  try {
    if (dropdownEl.children.length === 0) {
      dropdownEl.innerHTML = `
        <div style="padding:0.75rem 1rem; display:flex; align-items:center; gap:0.5rem; color:var(--text-muted); font-size:0.85rem;">
          <span class="search-spinner"></span> Searching locations via Google Maps / OpenStreetMap...
        </div>
      `;
      dropdownEl.classList.add('open');
    }

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    
    if (!res.ok) throw new Error('Geocoding network error');
    const results = await res.json();

    if (results && results.length > 0) {
      dropdownEl.innerHTML = '';
      results.forEach(r => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        const mainTitle = r.display_name.split(',')[0];
        const secondarySubtitle = r.display_name.split(',').slice(1).join(',').trim();

        item.innerHTML = `
          <i data-lucide="map-pin" class="autocomplete-icon"></i>
          <div class="autocomplete-text">
            <strong>${mainTitle} <span class="autocomplete-badge" style="color:var(--brand-info); background:rgba(14,165,233,0.15);">LIVE MAP</span></strong>
            <span>${secondarySubtitle || r.display_name}</span>
          </div>
        `;

        const placeObj = {
          name: `${mainTitle}, ${secondarySubtitle ? secondarySubtitle.split(',')[0] : ''}`,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          desc: r.display_name
        };

        item.onclick = () => selectAutocompletePlace(targetField, placeObj);
        dropdownEl.appendChild(item);
      });
      dropdownEl.classList.add('open');
      initIcons();
    }
  } catch (err) {
    console.log('Live geocode fallback triggered:', err);
  }
}

function selectAutocompletePlace(targetField, place) {
  if (targetField === 'pickup') {
    state.passenger.pickup = { lat: place.lat, lng: place.lng, name: place.name };
    document.getElementById('passPickupInput').value = place.name;
    renderPassengerRoute();
    recalcPassengerFares();
  } else if (targetField === 'drop') {
    state.passenger.drop = { lat: place.lat, lng: place.lng, name: place.name };
    document.getElementById('passDropInput').value = place.name;
    renderPassengerRoute();
    recalcPassengerFares();
  } else if (targetField === 'driverDest') {
    state.driver.homeDest = { lat: place.lat, lng: place.lng, name: place.name };
    document.getElementById('driverHomeDestInput').value = place.name;
    renderDriverCockpitRoute();
  }

  closeAllAutocomplete();
}

function closeAllAutocomplete() {
  document.querySelectorAll('.autocomplete-dropdown').forEach(d => {
    d.classList.remove('open');
  });
}

// -------------------------------------------------------------
// 12. GPS CURRENT LOCATION INTEGRATION
// -------------------------------------------------------------
async function useCurrentGpsLocation() {
  const pickupInput = document.getElementById('passPickupInput');
  pickupInput.value = 'Locating GPS position with high accuracy...';

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        let placeName = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        try {
          const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          if (rev.ok) {
            const data = await rev.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              placeName = `${parts[0]}, ${parts[1] || ''} (GPS)`;
            }
          }
        } catch (e) {
          console.log('Reverse geocoding error:', e);
        }

        state.passenger.pickup = { lat, lng, name: placeName };
        pickupInput.value = placeName;
        renderPassengerRoute();
        recalcPassengerFares();
      },
      (err) => {
        state.passenger.pickup = { lat: 18.5204, lng: 73.8567, name: "FC Road, Shivajinagar, Pune (GPS Detected)" };
        pickupInput.value = state.passenger.pickup.name;
        renderPassengerRoute();
        recalcPassengerFares();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  } else {
    state.passenger.pickup = { lat: 18.5204, lng: 73.8567, name: "Shivajinagar, Pune (GPS)" };
    pickupInput.value = state.passenger.pickup.name;
    renderPassengerRoute();
    recalcPassengerFares();
  }
}

// -------------------------------------------------------------
// 13. PASSENGER MAP & FARE CALCULATION
// -------------------------------------------------------------
function initPassengerMap() {
  if (passengerMap) {
    passengerMap.invalidateSize();
    return;
  }

  const el = document.getElementById('passengerMap');
  if (!el) return;

  passengerMap = L.map('passengerMap', { zoomControl: false }).setView([18.5200, 73.8300], 13);
  L.control.zoom({ position: 'topright' }).addTo(passengerMap);

  passengerTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  }).addTo(passengerMap);

  passengerMap.on('click', (e) => {
    if (currentMapPinMode === 'pickup') {
      state.passenger.pickup = { lat: e.latlng.lat, lng: e.latlng.lng, name: `Custom Pickup (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})` };
      document.getElementById('passPickupInput').value = state.passenger.pickup.name;
      currentMapPinMode = null;
      document.getElementById('btnPinPickup').classList.remove('active');
      renderPassengerRoute();
      recalcPassengerFares();
    } else if (currentMapPinMode === 'drop') {
      state.passenger.drop = { lat: e.latlng.lat, lng: e.latlng.lng, name: `Custom Dropoff (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})` };
      document.getElementById('passDropInput').value = state.passenger.drop.name;
      currentMapPinMode = null;
      document.getElementById('btnPinDrop').classList.remove('active');
      renderPassengerRoute();
      recalcPassengerFares();
    }
  });

  renderPassengerRoute();
  recalcPassengerFares();
}

function enableMapPinMode(mode) {
  currentMapPinMode = mode;
  document.getElementById('btnPinPickup').classList.toggle('active', mode === 'pickup');
  document.getElementById('btnPinDrop').classList.toggle('active', mode === 'drop');
}

function selectPassengerVehicle(type) {
  state.passenger.vehicle = type;
  document.getElementById('pvehSelectAuto').classList.toggle('active', type === 'auto');
  document.getElementById('pvehSelectCab').classList.toggle('active', type === 'cab');

  const sub = document.getElementById('lblSeatCapacitySub');
  if (sub) {
    sub.textContent = type === 'auto' ? 'Auto Capacity: 3 Seats Max' : 'Cab Capacity: 4 Seats Max';
  }

  if (type === 'auto' && state.passenger.seatCount > 3) {
    state.passenger.seatCount = 3;
    document.getElementById('passengerCountVal').textContent = 3;
  }

  recalcPassengerFares();
}

function selectRideMode(mode) {
  state.passenger.mode = mode;
  document.getElementById('optShareRide').classList.toggle('selected', mode === 'share');
  document.getElementById('optPrivateRide').classList.toggle('selected', mode === 'private');
  recalcPassengerFares();
}

function recalcPassengerFares() {
  const dist = calculateHaversineKm(
    state.passenger.pickup.lat, state.passenger.pickup.lng,
    state.passenger.drop.lat, state.passenger.drop.lng
  );
  state.passenger.distanceKm = Math.max(2, Math.round(dist * 10) / 10);

  const base = state.passenger.vehicle === 'auto' ? 30 : 50;
  const rate = state.passenger.vehicle === 'auto' ? 10 : 15;
  
  const standardSoloFare = Math.round(base + state.passenger.distanceKm * rate);
  const standardSharePerSeat = Math.round(standardSoloFare * 0.62); // 38% pool discount

  const isFreeRide = state.passenger.freeRidesPromoActive && state.userSession.freeRidesRemaining > 0;
  const isMilestoneRide = !isFreeRide && (state.userSession.totalRidesTaken % 5 === 0);
  
  const seats = state.passenger.seatCount;
  let standardTotalShare = standardSharePerSeat * seats;
  let standardTotalPrivate = standardSoloFare;

  let totalFare = 0;
  let perSeatFare = 0;
  let milestoneDiscountAmount = 0;

  if (isFreeRide) {
    totalFare = 0;
    perSeatFare = 0;
  } else if (isMilestoneRide) {
    const rawTotal = state.passenger.mode === 'share' ? standardTotalShare : standardTotalPrivate;
    milestoneDiscountAmount = Math.round(rawTotal * 0.05 * 100) / 100; // 5% discount
    totalFare = Math.max(10, Math.round((rawTotal - milestoneDiscountAmount) * 100) / 100);
    perSeatFare = Math.round((standardSharePerSeat * 0.95) * 100) / 100;
  } else {
    totalFare = state.passenger.mode === 'share' ? standardTotalShare : standardTotalPrivate;
    perSeatFare = standardSharePerSeat;
  }

  state.passenger.basePerSeatFare = perSeatFare;
  state.passenger.totalFare = totalFare;

  // Update UI pricing elements
  const passPrivateFare = document.getElementById('passPrivateFare');
  const passPrivateStrike = document.getElementById('passPrivateStrike');
  const passShareFare = document.getElementById('passShareFare');
  const passShareStrike = document.getElementById('passShareStrike');
  const badgeShareDiscount = document.getElementById('badgeShareDiscount');
  const badgePrivateDiscount = document.getElementById('badgePrivateDiscount');
  const remainingLabel = document.getElementById('lblPromoFreeRidesRemaining');

  if (remainingLabel) {
    remainingLabel.textContent = `Active: ${state.userSession.freeRidesRemaining} of 3 Free Rides Remaining (Coupon: FREE3RIDES)`;
  }

  if (isFreeRide) {
    if (passPrivateFare) passPrivateFare.textContent = `FREE (₹0)`;
    if (passPrivateStrike) {
      passPrivateStrike.textContent = `₹${standardSoloFare}`;
      passPrivateStrike.style.display = 'block';
    }
    if (badgePrivateDiscount) {
      badgePrivateDiscount.textContent = '100% FREE';
      badgePrivateDiscount.style.display = 'inline-block';
    }

    if (passShareFare) passShareFare.textContent = `FREE (₹0)`;
    if (passShareStrike) {
      passShareStrike.textContent = `₹${standardTotalShare}`;
      passShareStrike.style.display = 'block';
    }
    if (badgeShareDiscount) {
      badgeShareDiscount.textContent = '100% FREE';
    }
  } else if (isMilestoneRide) {
    const discountedSolo = Math.round(standardSoloFare * 0.95);
    const discountedShare = Math.round(standardTotalShare * 0.95);

    if (passPrivateFare) passPrivateFare.textContent = `₹${discountedSolo}`;
    if (passPrivateStrike) {
      passPrivateStrike.textContent = `₹${standardSoloFare}`;
      passPrivateStrike.style.display = 'block';
    }
    if (badgePrivateDiscount) {
      badgePrivateDiscount.textContent = '5% MILESTONE';
      badgePrivateDiscount.style.display = 'inline-block';
    }

    if (passShareFare) passShareFare.textContent = `₹${discountedShare}`;
    if (passShareStrike) {
      passShareStrike.textContent = `₹${standardTotalShare}`;
      passShareStrike.style.display = 'block';
    }
    if (badgeShareDiscount) {
      badgeShareDiscount.textContent = '38% + 5% OFF';
    }
  } else {
    if (passPrivateFare) passPrivateFare.textContent = `₹${standardSoloFare}`;
    if (passPrivateStrike) passPrivateStrike.style.display = 'none';
    if (badgePrivateDiscount) badgePrivateDiscount.style.display = 'none';

    if (passShareFare) passShareFare.textContent = `₹${standardTotalShare}`;
    if (passShareStrike) {
      passShareStrike.textContent = `₹${standardSoloFare * seats}`;
      passShareStrike.style.display = 'block';
    }
    if (badgeShareDiscount) {
      badgeShareDiscount.textContent = 'Save 38%';
    }
  }

  const btnText = document.getElementById('btnConfirmRideText');
  if (btnText) {
    if (isFreeRide) {
      const freeRideNum = 4 - state.userSession.freeRidesRemaining;
      btnText.textContent = `Confirm & Start Free Ride (₹0.00 • Free ${freeRideNum} of 3)`;
    } else if (isMilestoneRide) {
      btnText.textContent = `Confirm & Match Ride (₹${state.passenger.totalFare} • 5% OFF Milestone!)`;
    } else {
      btnText.textContent = `Confirm & ${state.passenger.mode === 'share' ? `Match Share Ride (${seats} Seat${seats > 1 ? 's' : ''})` : 'Book Private'} (₹${state.passenger.totalFare})`;
    }
  }

  // Payment Modal updates
  const modalSeats = document.getElementById('modalSeatsCount');
  if (modalSeats) modalSeats.textContent = `${seats} Seat${seats > 1 ? 's' : ''}`;
  const modalDist = document.getElementById('modalSegmentDist');
  if (modalDist) modalDist.textContent = `${state.passenger.distanceKm} km`;
  const modalSoloRate = document.getElementById('modalSoloRate');
  if (modalSoloRate) modalSoloRate.textContent = `₹${standardSoloFare}.00`;
  const modalDiscountRate = document.getElementById('modalDiscountRate');
  if (modalDiscountRate) modalDiscountRate.textContent = `-₹${standardSoloFare - standardSharePerSeat}.00`;

  // First 3 free promo row
  const promoRow = document.getElementById('modalFirstRidePromoRow');
  const promoVal = document.getElementById('modalFirstRideDiscountVal');
  if (promoRow) promoRow.style.display = isFreeRide ? 'flex' : 'none';
  if (promoVal) {
    const freeDiscount = (state.passenger.mode === 'share' ? standardTotalShare : standardSoloFare);
    promoVal.textContent = `-₹${freeDiscount}.00 (100% OFF)`;
  }

  // 5th Ride loyalty milestone row
  const milestoneRow = document.getElementById('modalLoyaltyMilestoneRow');
  const milestoneVal = document.getElementById('modalLoyaltyMilestoneVal');
  if (milestoneRow) milestoneRow.style.display = isMilestoneRide ? 'flex' : 'none';
  if (milestoneVal) milestoneVal.textContent = `-₹${milestoneDiscountAmount.toFixed(2)} (5% OFF)`;

  const modalPayable = document.getElementById('modalPayableAmount');
  if (modalPayable) {
    modalPayable.textContent = isFreeRide ? '₹0.00 (FREE RIDE)' : `₹${state.passenger.totalFare.toFixed(2)}`;
  }
  
  const btnPayModal = document.getElementById('btnPayModalActionText');
  if (btnPayModal) {
    if (isFreeRide) {
      btnPayModal.textContent = 'Confirm Booking (₹0.00 - 100% FREE)';
    } else if (isMilestoneRide) {
      btnPayModal.textContent = `Pay ₹${state.passenger.totalFare.toFixed(2)} (5% Milestone Discount Applied)`;
    } else {
      btnPayModal.textContent = `Pay ₹${state.passenger.totalFare.toFixed(2)} (Instant UPI Handshake)`;
    }
  }

  const btnPayModalText = document.getElementById('btnPayModalText');
  if (btnPayModalText) {
    btnPayModalText.textContent = isFreeRide ? 'View Receipt (₹0.00 Free Ride)' : `View Fare Split / Pay ₹${state.passenger.totalFare}`;
  }
}

function renderPassengerRoute() {
  if (!passengerMap) return;

  passengerMap.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
      passengerMap.removeLayer(layer);
    }
  });

  const pPick = state.passenger.pickup;
  const pDrop = state.passenger.drop;

  L.circleMarker([pPick.lat, pPick.lng], {
    radius: 9,
    fillColor: '#10B981',
    color: '#ffffff',
    weight: 2,
    fillOpacity: 1
  }).addTo(passengerMap).bindPopup(`<strong>Pickup Point:</strong><br>${pPick.name}`).openPopup();

  L.circleMarker([pDrop.lat, pDrop.lng], {
    radius: 9,
    fillColor: '#EF4444',
    color: '#ffffff',
    weight: 2,
    fillOpacity: 1
  }).addTo(passengerMap).bindPopup(`<strong>Dropoff Point:</strong><br>${pDrop.name}`);

  // Build realistic multi-segment road coordinates
  generateSmoothRouteWaypoints(pPick, pDrop);

  passengerRouteLine = L.polyline(liveTripWaypoints, {
    color: '#F59E0B',
    weight: 6,
    opacity: 0.85,
    dashArray: '8, 8'
  }).addTo(passengerMap);

  // Traveled portion layer (solid emerald green)
  passengerTraveledRouteLine = L.polyline([], {
    color: '#10B981',
    weight: 6,
    opacity: 0.95
  }).addTo(passengerMap);

  // Custom Real-Time Live Moving Vehicle Marker (Ola/Uber style)
  const vehicleHtml = `
    <div class="live-moving-vehicle-marker" id="liveMovingAutoMarker">
      <div class="vehicle-radar-pulse"></div>
      <div class="moving-vehicle-icon-box" id="movingVehicleIconBox">
        <i data-lucide="${state.passenger.vehicle === 'auto' ? 'zap' : 'car'}"></i>
      </div>
    </div>
  `;

  const driverIcon = L.divIcon({
    className: 'custom-moving-icon-wrapper',
    html: vehicleHtml,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  passengerDriverMarker = L.marker([pPick.lat, pPick.lng], { icon: driverIcon }).addTo(passengerMap)
    .bindPopup("<strong>Ramesh Shinde (Bajaj RE Auto)</strong><br><span style='color:#10B981;'>Live Real-Time GPS Tracking ✓</span> • Moving along corridor");

  passengerMap.fitBounds(passengerRouteLine.getBounds(), { padding: [40, 40] });
  initIcons();
}

// -------------------------------------------------------------
// 14. REAL-TIME MOVING VEHICLE GPS SIMULATION ENGINE (OLA/UBER STYLE)
// -------------------------------------------------------------
function generateSmoothRouteWaypoints(start, end) {
  const points = [];
  const steps = 30; // 30 high-resolution GPS steps

  const midLat1 = start.lat + (end.lat - start.lat) * 0.35 + 0.003;
  const midLng1 = start.lng + (end.lng - start.lng) * 0.35 - 0.002;

  const midLat2 = start.lat + (end.lat - start.lat) * 0.70 - 0.002;
  const midLng2 = start.lng + (end.lng - start.lng) * 0.70 + 0.001;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic bezier interpolation
    const lat = Math.pow(1 - t, 3) * start.lat +
                3 * Math.pow(1 - t, 2) * t * midLat1 +
                3 * (1 - t) * Math.pow(t, 2) * midLat2 +
                Math.pow(t, 3) * end.lat;

    const lng = Math.pow(1 - t, 3) * start.lng +
                3 * Math.pow(1 - t, 2) * t * midLng1 +
                3 * (1 - t) * Math.pow(t, 2) * midLng2 +
                Math.pow(t, 3) * end.lng;

    points.push([lat, lng]);
  }

  liveTripWaypoints = points;
  return points;
}

function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

function setSimulationSpeed(mult) {
  state.simSpeed = mult;
  document.getElementById('btnSimSpeed1x')?.classList.toggle('active', mult === 1);
  document.getElementById('btnSimSpeed3x')?.classList.toggle('active', mult === 3);
  document.getElementById('btnSimSpeed10x')?.classList.toggle('active', mult === 10);
  
  if (state.passenger.rideActive) {
    startLiveMovingVehicleAnimation();
  }
}

function startLiveMovingVehicleAnimation() {
  clearInterval(liveTripAnimationTimer);
  if (!liveTripWaypoints || liveTripWaypoints.length === 0) {
    generateSmoothRouteWaypoints(state.passenger.pickup, state.passenger.drop);
  }

  const totalSteps = liveTripWaypoints.length;
  const totalDist = state.passenger.distanceKm;
  const totalDurationMins = Math.max(8, Math.round(totalDist * 2.2));

  // Interval speed adjusted by multiplier
  const tickInterval = Math.max(80, Math.round(450 / state.simSpeed));

  liveTripAnimationTimer = setInterval(() => {
    if (!state.passenger.rideActive) {
      clearInterval(liveTripAnimationTimer);
      return;
    }

    liveTripCurrentStepIndex++;
    if (liveTripCurrentStepIndex >= totalSteps) {
      liveTripCurrentStepIndex = totalSteps - 1;
      clearInterval(liveTripAnimationTimer);
      onLiveTripCompleted();
      return;
    }

    const currentCoord = liveTripWaypoints[liveTripCurrentStepIndex];
    const nextCoord = liveTripWaypoints[Math.min(liveTripCurrentStepIndex + 1, totalSteps - 1)];

    // 1. Move vehicle marker smoothly on map
    if (passengerDriverMarker) {
      passengerDriverMarker.setLatLng(currentCoord);
    }

    // 2. Rotate auto icon to face direction of travel (Bearing angle)
    const bearing = calculateBearing(currentCoord[0], currentCoord[1], nextCoord[0], nextCoord[1]);
    const iconBox = document.getElementById('movingVehicleIconBox');
    if (iconBox) {
      iconBox.style.transform = `rotate(${Math.round(bearing)}deg)`;
    }

    // 3. Update Traveled Path line
    const traveledPoints = liveTripWaypoints.slice(0, liveTripCurrentStepIndex + 1);
    if (passengerTraveledRouteLine) {
      passengerTraveledRouteLine.setLatLngs(traveledPoints);
    }

    // 4. Update Remaining Distance & ETA
    const progressFrac = liveTripCurrentStepIndex / (totalSteps - 1);
    const progressPercent = Math.round(progressFrac * 100);
    const remainingKm = Math.max(0, (totalDist * (1 - progressFrac))).toFixed(1);
    const remainingMins = Math.max(1, Math.ceil(totalDurationMins * (1 - progressFrac)));

    const liveEtaCountdown = document.getElementById('liveEtaCountdown');
    if (liveEtaCountdown) {
      liveEtaCountdown.textContent = `${remainingMins} mins (${remainingKm} km)`;
    }

    const progressBar = document.getElementById('liveTripProgressBar');
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    // 5. Update Speed & Turn-by-Turn Telemetry HUD
    const speed = Math.round(28 + Math.sin(liveTripCurrentStepIndex * 0.5) * 8 + Math.random() * 4);
    const liveSpeedVal = document.getElementById('liveSpeedVal');
    if (liveSpeedVal) {
      liveSpeedVal.innerHTML = `<i data-lucide="gauge" style="width:0.85rem; height:0.85rem;"></i> ${speed} km/h`;
    }

    const turnInstruction = document.getElementById('liveTurnInstruction');
    if (turnInstruction) {
      if (progressPercent < 25) {
        turnInstruction.textContent = "Boarded • En-route via FC Road";
      } else if (progressPercent < 60) {
        turnInstruction.textContent = "Corridor Flow • Karve Road Junction";
      } else if (progressPercent < 85) {
        turnInstruction.textContent = "Approaching Kothrud Depot Corridor";
      } else {
        turnInstruction.textContent = "Arriving at Destination in 200m";
      }
    }

    // Keep map centered on vehicle smoothly
    if (passengerMap && liveTripCurrentStepIndex % 4 === 0) {
      passengerMap.panTo(currentCoord, { animate: true, duration: 0.4 });
    }

    initIcons();
  }, tickInterval);
}

function onLiveTripCompleted() {
  playSoundAlert('accept');
  const statusPill = document.getElementById('liveMovingStatusPill');
  if (statusPill) {
    statusPill.innerHTML = '<span class="badge-dot" style="background:var(--brand-secondary);"></span> Arrived at Destination';
  }

  const liveEtaCountdown = document.getElementById('liveEtaCountdown');
  if (liveEtaCountdown) {
    liveEtaCountdown.textContent = 'Arrived (0 km)';
  }

  const turnInstruction = document.getElementById('liveTurnInstruction');
  if (turnInstruction) {
    turnInstruction.textContent = '🏁 Reached Destination!';
  }

  alert(`🏁 You have arrived at your destination!\nThank you for choosing SahiRide.\nTotal Fare: ₹${state.passenger.totalFare}.00.`);
  openPaymentModal();
}

function requestPassengerRide() {
  document.getElementById('passBookingPanel').style.display = 'none';
  document.getElementById('passTrackingPanel').style.display = 'block';

  const otp = Math.floor(1000 + Math.random() * 9000);
  document.getElementById('tripOtpCode').textContent = otp;
  state.passenger.otp = otp;
  state.passenger.rideActive = true;
  liveTripCurrentStepIndex = 0;

  if (state.passenger.freeRidesPromoActive && state.userSession.freeRidesRemaining > 0) {
    const usedRideNum = 4 - state.userSession.freeRidesRemaining;
    state.userSession.freeRidesRemaining--;
    alert(`🎉 Free Ride ${usedRideNum} of 3 Confirmed!\nYou have ${state.userSession.freeRidesRemaining} Free Rides remaining.`);
  } else if (state.userSession.totalRidesTaken % 5 === 0) {
    alert(`🎖️ Congratulations! This is your 5th Ride Milestone! A flat 5% discount was applied to your trip.`);
  }

  state.userSession.totalRidesTaken++;
  updateLoyaltyMilestoneUI();

  const coLabel = document.getElementById('coPassengersCountLabel');
  if (coLabel) {
    coLabel.textContent = `Matched Co-Passengers (${state.passenger.seatCount}/3 Seats)`;
  }

  // Render fresh route and launch real-time moving auto animation
  renderPassengerRoute();
  startLiveMovingVehicleAnimation();

  initIcons();
}

function cancelOrResetRide() {
  state.passenger.rideActive = false;
  clearInterval(liveTripAnimationTimer);
  liveTripCurrentStepIndex = 0;

  document.getElementById('passBookingPanel').style.display = 'block';
  document.getElementById('passTrackingPanel').style.display = 'none';

  recalcPassengerFares();
  renderPassengerRoute();
}

// -------------------------------------------------------------
// 15. DRIVER COCKPIT & HOMEBOUND ROUTE MATCH
// -------------------------------------------------------------
function initDriverMap() {
  if (driverMap) {
    driverMap.invalidateSize();
    return;
  }

  const el = document.getElementById('driverMap');
  if (!el) return;

  driverMap = L.map('driverMap', { zoomControl: false }).setView([18.5200, 73.8300], 13);
  L.control.zoom({ position: 'topright' }).addTo(driverMap);

  driverTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  }).addTo(driverMap);

  renderDriverCockpitRoute();
}

function toggleDriverOnline() {
  state.driver.online = !state.driver.online;
  const btn = document.getElementById('driverOnlineToggleBtn');
  const text = document.getElementById('driverOnlineStatusText');

  if (state.driver.online) {
    btn.className = 'online-pill online';
    text.textContent = 'Online (Ready)';
    setTimeout(() => { triggerDriverRidePopup(); }, 3500);
  } else {
    btn.className = 'online-pill offline';
    text.textContent = 'Offline (Paused)';
  }
}

function setDriverMode(mode) {
  state.driver.mode = mode;
  document.getElementById('dmode-normal').classList.toggle('active', mode === 'normal');
  document.getElementById('dmode-route').classList.toggle('active', mode === 'route');
  document.getElementById('dmode-pool').classList.toggle('active', mode === 'pool');

  const routeConfig = document.getElementById('driverRouteMatchConfig');
  if (routeConfig) {
    routeConfig.style.display = (mode === 'route') ? 'block' : 'none';
  }

  // Update manifest and seat capacity based on selected mode
  const seatCount = document.getElementById('driverSeatCount');
  const manifest = document.getElementById('driverManifestList');

  if (mode === 'normal') {
    if (seatCount) seatCount.textContent = 'Seats: 1/3 (Solo Ride)';
    if (manifest) {
      manifest.innerHTML = `
        <div class="manifest-step">
          <div class="step-num pickup">1</div>
          <div class="step-details">
            <strong>Pick Up: Rahul M. (OTP: 5839)</strong>
            <p>FC Road, Shivajinagar • <span style="color:var(--brand-secondary);">Boarded ✓</span></p>
          </div>
        </div>
        <div class="manifest-step">
          <div class="step-num drop">2</div>
          <div class="step-details">
            <strong>Drop Off: Rahul M.</strong>
            <p>Kothrud Stand, Pune • Standard Solo Fare: ₹120.00</p>
          </div>
        </div>
      `;
    }
  } else if (mode === 'route') {
    if (seatCount) seatCount.textContent = 'Seats: 2/3 (Home Corridor)';
    if (manifest) {
      manifest.innerHTML = `
        <div class="manifest-step" style="background:rgba(99,102,241,0.08); border-radius:var(--radius-sm); padding:0.5rem;">
          <div class="step-num pickup" style="background:var(--brand-accent); color:#fff; border-color:var(--brand-accent);">1</div>
          <div class="step-details">
            <strong>Pick Up: Pooja T. (OTP: 3184)</strong>
            <p>Deccan Gymkhana • <span style="color:var(--brand-accent); font-weight:700;">Homebound Match (+₹95)</span></p>
          </div>
        </div>
        <div class="manifest-step">
          <div class="step-num drop">2</div>
          <div class="step-details">
            <strong>Drop Off: Pooja T.</strong>
            <p>Karve Road (Near Kothrud) • Detour: +1.2 km</p>
          </div>
        </div>
        <div class="manifest-step">
          <div class="step-num" style="background:var(--brand-secondary); color:#fff;">3</div>
          <div class="step-details">
            <strong>Driver Final Stop: Home Destination</strong>
            <p>${state.driver.homeDest.name} • <span style="color:var(--brand-secondary); font-weight:700;">Empty Trip Eliminated (₹190 Profit)</span></p>
          </div>
        </div>
      `;
    }
  } else if (mode === 'pool') {
    if (seatCount) seatCount.textContent = 'Seats: 3/3 (Full Pool Capacity)';
    if (manifest) {
      manifest.innerHTML = `
        <div class="manifest-step">
          <div class="step-num pickup">1</div>
          <div class="step-details">
            <strong>Pick Up: Rahul M. (OTP: 5839)</strong>
            <p>FC Road, Shivajinagar • <span style="color:var(--brand-secondary);">Boarded ✓</span></p>
          </div>
        </div>
        <div class="manifest-step">
          <div class="step-num pickup">2</div>
          <div class="step-details">
            <strong>Pick Up: Priya S. (OTP: 9142)</strong>
            <p>Deccan Corridor Stop • <span style="color:var(--brand-primary);">Next Pickup (300m)</span></p>
          </div>
        </div>
        <div class="manifest-step">
          <div class="step-num drop">3</div>
          <div class="step-details">
            <strong>Drop Off: Rahul M.</strong>
            <p>Aundh D-Mart • Shared Payout: ₹75.00</p>
          </div>
        </div>
        <div class="manifest-step">
          <div class="step-num drop">4</div>
          <div class="step-details">
            <strong>Drop Off: Priya S.</strong>
            <p>Kothrud Stand • Shared Payout: ₹120.00</p>
          </div>
        </div>
      `;
    }
  }

  renderDriverCockpitRoute();
  initIcons();
}

function updateDriverDetourRadius() {
  const val = parseFloat(document.getElementById('slider-driver-detour').value);
  state.driver.detourRadiusKm = val;
  document.getElementById('lbl-driver-detour').textContent = `${val.toFixed(1)} km`;
  renderDriverCockpitRoute();
}

function renderDriverCockpitRoute() {
  if (!driverMap) return;

  driverMap.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
      driverMap.removeLayer(layer);
    }
  });

  let stops = [];

  if (state.driver.mode === 'normal') {
    stops = [
      { pos: [18.5204, 73.8567], label: "1. Rahul M. (Pickup FC Road)", type: 'pick' },
      { pos: [18.5074, 73.8077], label: "2. Rahul M. (Dropoff Kothrud)", type: 'drop' }
    ];
  } else if (state.driver.mode === 'route') {
    stops = [
      { pos: [18.5204, 73.8567], label: "1. Rahul M. (Pickup FC Road)", type: 'pick' },
      { pos: [18.5150, 73.8350], label: "2. Pooja T. (Pickup Deccan Corridor)", type: 'pick' },
      { pos: [18.5090, 73.8180], label: "3. Pooja T. (Dropoff Karve Road)", type: 'drop' },
      { pos: [state.driver.homeDest.lat, state.driver.homeDest.lng], label: `4. Driver Home (${state.driver.homeDest.name})`, type: 'home' }
    ];
  } else {
    // pool mode
    stops = [
      { pos: [18.5204, 73.8567], label: "1. Rahul M. (Pickup FC Road)", type: 'pick' },
      { pos: [18.5150, 73.8350], label: "2. Priya S. (Pickup Deccan)", type: 'pick' },
      { pos: [18.5529, 73.8050], label: "3. Rahul M. (Dropoff Aundh)", type: 'drop' },
      { pos: [state.driver.homeDest.lat, state.driver.homeDest.lng], label: `4. Priya S. (${state.driver.homeDest.name})`, type: 'home' }
    ];
  }

  const latlngs = stops.map(s => s.pos);

  if (state.driver.mode === 'route') {
    stops.forEach(s => {
      L.circle(s.pos, {
        radius: state.driver.detourRadiusKm * 800,
        color: '#6366F1',
        weight: 1.5,
        fillColor: '#6366F1',
        fillOpacity: 0.1
      }).addTo(driverMap);
    });
  }

  driverRouteLine = L.polyline(latlngs, {
    color: state.driver.mode === 'route' ? '#6366F1' : '#10B981',
    weight: 5,
    opacity: 0.9
  }).addTo(driverMap);

  stops.forEach((s, idx) => {
    const isPick = s.type === 'pick';
    const isHome = s.type === 'home';
    const fillColor = isHome ? '#6366F1' : (isPick ? '#F59E0B' : '#EF4444');
    
    const marker = L.circleMarker(s.pos, {
      radius: 10,
      fillColor: fillColor,
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).addTo(driverMap).bindPopup(`<strong>${s.label}</strong>`);
    if (idx === 0) marker.openPopup();
  });

  driverMap.fitBounds(driverRouteLine.getBounds(), { padding: [30, 30] });
  initIcons();
}

function triggerSimulatedDriverStep() {
  state.driver.currentStep = (state.driver.currentStep % 4) + 1;
  alert(`Driver navigation advanced to Step ${state.driver.currentStep}. Navigation GPS synced.`);
}

// -------------------------------------------------------------
// 16. MATCHING ENGINE SANDBOX
// -------------------------------------------------------------
function initSandboxMap() {
  if (sandboxMap) {
    sandboxMap.invalidateSize();
    return;
  }

  const el = document.getElementById('sandboxMap');
  if (!el) return;

  sandboxMap = L.map('sandboxMap', { zoomControl: false }).setView([18.5300, 73.8300], 13);
  L.control.zoom({ position: 'topright' }).addTo(sandboxMap);

  sandboxTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  }).addTo(sandboxMap);

  runSandboxMatchSimulation();
}

function runSandboxMatchSimulation() {
  if (!sandboxMap) return;

  sandboxMap.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
      sandboxMap.removeLayer(layer);
    }
  });

  const passengers = state.sandbox.passengers;
  const routePoints = [];

  passengers.forEach((p, idx) => {
    routePoints.push(p.pick);
    L.circleMarker(p.pick, {
      radius: 9,
      fillColor: '#10B981',
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).addTo(sandboxMap).bindPopup(`<strong>Step ${idx + 1}: Pickup ${p.name}</strong><br>Origin Point`);
  });

  passengers.forEach((p, idx) => {
    routePoints.push(p.drop);
    L.circleMarker(p.drop, {
      radius: 9,
      fillColor: '#EF4444',
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).addTo(sandboxMap).bindPopup(`<strong>Step ${passengers.length + idx + 1}: Drop ${p.name}</strong><br>Fare: ₹${p.fare}`);
  });

  sandboxRouteLine = L.polyline(routePoints, {
    color: '#6366F1',
    weight: 5,
    opacity: 0.9,
    dashArray: '6, 6'
  }).addTo(sandboxMap);

  sandboxMap.fitBounds(sandboxRouteLine.getBounds(), { padding: [30, 30] });
  initIcons();
}

function addSandboxRandomPassenger() {
  if (state.sandbox.passengers.length >= 4) {
    alert('Maximum capacity reached (3 in Auto, 4 in Cab).');
    return;
  }
  const id = String.fromCharCode(65 + state.sandbox.passengers.length);
  const newPass = {
    id: id,
    name: `Passenger ${id}`,
    pick: [18.5200 + (Math.random() - 0.5) * 0.03, 73.8300 + (Math.random() - 0.5) * 0.03],
    drop: [18.5500 + (Math.random() - 0.5) * 0.03, 73.8000 + (Math.random() - 0.5) * 0.03],
    fare: 85,
    dist: 10.2,
    picked: false
  };
  state.sandbox.passengers.push(newPass);
  runSandboxMatchSimulation();
}

function resetSandboxSimulation() {
  state.sandbox.passengers = [
    { id: 'A', name: 'Rahul M.', pick: [18.5204, 73.8567], drop: [18.5529, 73.8050], fare: 65, dist: 8.5, picked: true },
    { id: 'B', name: 'Priya S.', pick: [18.5150, 73.8350], drop: [18.5074, 73.8077], fare: 110, dist: 14.2, picked: false }
  ];
  runSandboxMatchSimulation();
}

// -------------------------------------------------------------
// 17. CALCULATORS & ADMIN ENGINE
// -------------------------------------------------------------
let driverCalcVehType = 'auto';
let passCalcVehType = 'auto';

function setCalcTab(tab) {
  const driverTabBtn = document.getElementById('calcTabDriver');
  const passTabBtn = document.getElementById('calcTabPassenger');
  const driverView = document.getElementById('driverCalcView');
  const passView = document.getElementById('passengerCalcView');

  if (tab === 'driver') {
    driverTabBtn.classList.add('active');
    passTabBtn.classList.remove('active');
    driverView.style.display = 'grid';
    passView.style.display = 'none';
  } else {
    passTabBtn.classList.add('active');
    driverTabBtn.classList.remove('active');
    passView.style.display = 'grid';
    driverView.style.display = 'none';
  }
}

function setDriverCalcVeh(type) {
  driverCalcVehType = type;
  document.getElementById('dveh-auto').classList.toggle('active', type === 'auto');
  document.getElementById('dveh-cab').classList.toggle('active', type === 'cab');
  updateDriverCalc();
}

function updateDriverCalc() {
  const returnTrips = parseInt(document.getElementById('slider-return-trips').value);
  const returnDist = parseInt(document.getElementById('slider-return-dist').value);
  const poolTrips = parseInt(document.getElementById('slider-pool-trips').value);

  document.getElementById('lbl-return-trips').textContent = `${returnTrips} Trips / Day`;
  document.getElementById('lbl-return-dist').textContent = `${returnDist} km / Trip`;
  document.getElementById('lbl-pool-trips').textContent = `${poolTrips} Pooled Trips`;

  const perKmRate = driverCalcVehType === 'auto' ? 12 : 18;
  const poolUpliftPerTrip = driverCalcVehType === 'auto' ? 65 : 110;
  const fuelCostPerKm = driverCalcVehType === 'auto' ? 3.2 : 5.5;

  const homeboundEarnings = returnTrips * returnDist * perKmRate * 0.85 * 26;
  const poolEarnings = poolTrips * poolUpliftPerTrip * 26;
  const fuelSaved = returnTrips * returnDist * fuelCostPerKm * 26;
  const totalExtraMonthly = Math.round(homeboundEarnings + poolEarnings);

  document.getElementById('driverResultIncome').textContent = `₹${totalExtraMonthly.toLocaleString('en-IN')}`;
  document.getElementById('driverBreakdownHomebound').textContent = `₹${Math.round(homeboundEarnings).toLocaleString('en-IN')} / mo`;
  document.getElementById('driverBreakdownPool').textContent = `₹${Math.round(poolEarnings).toLocaleString('en-IN')} / mo`;
  document.getElementById('driverBreakdownFuel').textContent = `₹${Math.round(fuelSaved).toLocaleString('en-IN')} / mo`;
}

function setPassCalcVeh(type) {
  passCalcVehType = type;
  document.getElementById('pveh-auto').classList.toggle('active', type === 'auto');
  document.getElementById('pveh-cab').classList.toggle('active', type === 'cab');
  updatePassengerCalc();
}

function updatePassengerCalc() {
  const dist = parseInt(document.getElementById('slider-pass-dist').value);
  const daysPerWeek = parseInt(document.getElementById('slider-pass-days').value);

  document.getElementById('lbl-pass-dist').textContent = `${dist} km`;
  document.getElementById('lbl-pass-days').textContent = `${daysPerWeek} Days / Week`;

  const baseFare = passCalcVehType === 'auto' ? 30 : 50;
  const perKm = passCalcVehType === 'auto' ? 10 : 16;
  const soloTripFare = Math.round(baseFare + dist * perKm);
  const shareTripFare = Math.round(soloTripFare * 0.62);

  const monthlyTrips = daysPerWeek * 2 * 4.3;
  const monthlySavings = Math.round((soloTripFare - shareTripFare) * monthlyTrips);
  const annualSavings = Math.round(monthlySavings * 12);

  document.getElementById('passResultSavings').textContent = `₹${monthlySavings.toLocaleString('en-IN')}`;
  document.getElementById('passBreakdownSolo').textContent = `₹${soloTripFare} / trip`;
  document.getElementById('passBreakdownShare').textContent = `₹${shareTripFare} / trip`;
  document.getElementById('passBreakdownAnnual').textContent = `₹${annualSavings.toLocaleString('en-IN')} / yr`;
}

function initAdminChart() {
  const ctx = document.getElementById('adminRevenueChart');
  if (!ctx) return;

  adminChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      datasets: [
        {
          label: 'Shared Pool Rides (₹)',
          data: [14200, 16800, 18500, 19200, 24500, 28400, 22100],
          backgroundColor: '#10B981',
          borderRadius: 6
        },
        {
          label: 'Homebound Route Matches (₹)',
          data: [8200, 9400, 10800, 11500, 14200, 16800, 13400],
          backgroundColor: '#6366F1',
          borderRadius: 6
        },
        {
          label: 'Normal Solo Rides (₹)',
          data: [9800, 10200, 11400, 10900, 13100, 14500, 12000],
          backgroundColor: '#F59E0B',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' } }
      },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans' } } }
      }
    }
  });
}

function approveKYC(btn) {
  const row = btn.closest('tr');
  const statusCell = row.cells[3];
  statusCell.innerHTML = '<span class="input-val-badge" style="background:rgba(16,185,129,0.2); color:var(--brand-secondary);">Approved ✓</span>';
  btn.remove();
  alert('Driver KYC approved! Driver activated for live pooling on SahiRide.');
}

// -------------------------------------------------------------
// 18. MODALS & UTILITIES
// -------------------------------------------------------------
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
}

function openPaymentModal() { openModal('paymentModal'); }
function openKYCModal() { openModal('kycModal'); }
function openSOSModal() { openModal('sosModal'); }

function openShareTripModal() {
  const shareUrl = `${window.location.origin}/#live-track?otp=${state.passenger.otp}&lat=${state.passenger.pickup.lat}&lng=${state.passenger.pickup.lng}`;
  navigator.clipboard?.writeText(shareUrl);
  alert(`SahiRide Live Location Link copied to clipboard!\nShare with family: ${shareUrl}`);
}

function completePaymentSimulation() {
  closeModal('paymentModal');
  alert(`Payment Confirmed! Digital pass applied. SahiRide compensated driver Ramesh Shinde in full.`);
}

function submitKYC() {
  closeModal('kycModal');
  alert('Driver documents re-verified successfully via Traffic Police records.');
}

function triggerSOSCall() {
  alert('EMERGENCY SOS: Dialing 112... Live vehicle location and audio telemetry dispatched to city emergency response unit.');
  closeModal('sosModal');
}

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
