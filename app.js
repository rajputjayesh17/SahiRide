/**
 * RouteSetu / SafarShare - Dynamic Auto & Cab Pooling & Homebound Route Match Engine
 * Full SPA Controller: i18n, Leaflet Maps, Calculators, Matching Engine, Driver Cockpit, Admin Dashboard
 */

// Global State
const state = {
  currentView: 'onboarding',
  isAuthenticated: false,
  onboardingSlide: 1,
  currentLang: 'en',
  currentTheme: 'dark',
  passenger: {
    pickup: null,
    drop: null,
    vehicle: 'auto', // 'auto' | 'cab'
    passengers: 1,
    mode: 'share',   // 'share' | 'private'
    womenOnly: false,
    rideActive: false,
    otp: '5839',
    fare: 75,
    distanceKm: 14.5
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
    todayEarnings: { normal: 360, homebound: 420, pool: 680, fuelSaved: 240 }
  },
  sandbox: {
    passengers: [
      { id: 'A', name: 'Rahul M.', pick: [18.5913, 73.7389], drop: [18.5529, 73.8050], fare: 65, dist: 8.5, picked: true },
      { id: 'B', name: 'Priya S.', pick: [18.5980, 73.7620], drop: [18.5204, 73.8567], fare: 110, dist: 14.2, picked: false }
    ],
    driver: { start: [18.6010, 73.7290], end: [18.5074, 73.8077] }
  }
};

// Map Instances
let passengerMap = null;
let driverMap = null;
let sandboxMap = null;

let passengerRouteLine = null;
let passengerDriverMarker = null;
let driverRouteLine = null;
let driverCorridorCircle = null;
let sandboxRouteLine = null;

// Map click mode: null, 'pickup', 'drop'
let currentMapPinMode = null;

// Chart Instance
let adminChartInstance = null;

// -------------------------------------------------------------
// 1. TRILINGUAL I18N DICTIONARY (English, Hindi, Marathi)
// -------------------------------------------------------------
const I18N = {
  en: {
    tagline: "Dynamic Pooling & Homebound Route Match",
    nav_home: "Home",
    nav_passenger: "Passenger App",
    nav_driver: "Driver Cockpit",
    nav_algorithm: "Match Sandbox",
    nav_admin: "Admin Fleet",
    hero_badge: "Maximizing Vehicle Capacity • Zero Fixed Stops",
    hero_subtext: "Choose your exact pickup and drop point freely — just like a normal cab. Our dynamic engine clubs co-passengers heading your way for 35% cheaper fares, while drivers turn empty return journeys into paid trips.",
    cta_book_ride: "Book a Ride / Share Auto",
    cta_driver_portal: "Driver Portal & Route Match",
    cta_see_algorithm: "See Algorithm in Action",
    diff1_tag: "Differentiator 1 • Driver Homebound Ride",
    diff1_title: "Eliminating Empty Deadhead Returns",
    before_driver_title: "Before: Empty Return Trip",
    before_driver_desc: "Driver drops rider in Hinjewadi and drives 18 km back to Kothrud alone. Earns ₹0, wastes ₹95 on fuel/CNG.",
    after_driver_title: "With RouteSetu: 'Set My Route'",
    after_driver_desc: "Driver enters home destination. System matches passengers along that corridor. Earns ₹190+ profit on the return trip!",
    diff2_tag: "Differentiator 2 • Dynamic Share Auto",
    diff2_title: "100% Free Pickup/Drop + 35% Savings",
    before_pass_title: "Before: Paying for Empty Seats",
    before_pass_desc: "Solo passenger pays full vehicle fare ₹120 for 3 seats in an auto-rickshaw even when travelling alone.",
    after_pass_title: "With RouteSetu: 'Share & Save'",
    after_pass_desc: "Passenger picks exact pickup & drop. System clubs 2-3 riders seamlessly. Pays only ₹75, driver earns combined ₹220!",
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
    calc_shared_fare: "RouteSetu Share Fare:",
    calc_discount_rate: "Discount Per Trip:",
    calc_annual_savings: "Annual Savings:",
    how_pill: "True Point-To-Point Flexibility",
    how_title: "Why RouteSetu Outperforms Traditional Apps",
    how_desc: "Unlike fixed-route shuttles or expensive solo cabs, RouteSetu dynamically merges individual journeys on the fly.",
    feat1_title: "100% Free Pickup & Drop",
    feat1_desc: "No fixed bus stops or meeting points. Set your own doorstep pickup and office drop just like a regular taxi booking.",
    feat2_title: "Vector & Corridor Matching",
    feat2_desc: "Algorithms ensure co-passengers are heading in the same general direction (≤ 30° deviation) with minimal detour (< 5 mins).",
    feat3_title: "Fair Segment Fare Splitting",
    feat3_desc: "You only pay for the exact distance of your trip segment with an automated 35% pool discount applied upfront.",
    feat4_title: "Women-Only & Safety Shield",
    feat4_desc: "Optional Women-Only pool filter, KYC-verified drivers, real-time OTP handshakes, masked rider contact info, and 24/7 SOS dispatch.",
    p_book_ride_title: "Book Your Ride"
  },
  hi: {
    tagline: "डायनामिक पूलिंग और घर वापसी रूट मैच",
    nav_home: "मुख्य पृष्ठ",
    nav_passenger: "यात्री ऐप",
    nav_driver: "चालक पोर्टल",
    nav_algorithm: "मैचिंग इंजन",
    nav_admin: "एडमिन फ्लीट",
    hero_badge: "वाहन क्षमता का पूरा उपयोग • कोई फिक्स्ड स्टॉप नहीं",
    hero_subtext: "अपनी पसंद का सटीक पिकअप और ड्रॉप चुनें। हमारा डायनामिक इंजन आपकी दिशा में जाने वाले यात्रियों को मिलाता है जिससे आपको 35% कम किराया मिलता है और ड्राइवर खाली वापसी को कमाई में बदलते हैं।",
    cta_book_ride: "सवारी बुक करें / शेयर ऑटो",
    cta_driver_portal: "चालक पोर्टल और रूट मैच",
    cta_see_algorithm: "एल्गोरिदम देखें",
    diff1_tag: "विशेषता 1 • ड्राइवर घर वापसी राइड",
    diff1_title: "खाली वापसी यात्राओं का अंत",
    before_driver_title: "पहले: खाली वापसी यात्रा",
    before_driver_desc: "ड्राइवर हिंजेवाड़ी में सवारी छोड़कर 18 किमी कोथरुड खाली लौटता है। ₹0 कमाई, ₹95 का ईंधन बर्बाद।",
    after_driver_title: "RouteSetu के साथ: 'रूट सेट करें'",
    after_driver_desc: "ड्राइवर घर का गंतव्य डालता है। सिस्टम उसी रास्ते के यात्रियों को जोड़ता है। वापसी में ₹190+ का शुद्ध मुनाफा!",
    diff2_tag: "विशेषता 2 • डायनामिक शेयर ऑटो",
    diff2_title: "100% मनचाहा पिकअप/ड्रॉप + 35% बचत",
    before_pass_title: "पहले: खाली सीटों का पूरा किराया",
    before_pass_desc: "अकेला यात्री पूरे ऑटो की 3 सीटों का ₹120 किराया अकेले भरता है।",
    after_pass_title: "RouteSetu के साथ: 'शेयर और बचत'",
    after_pass_desc: "यात्री अपना सटीक पिकअप/ड्रॉप चुनता है। 2-3 सवारियां जुड़ती हैं। यात्री देता है सिर्फ ₹75, ड्राइवर कमाता है ₹220!",
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
    calc_shared_fare: "RouteSetu शेयर किराया:",
    calc_discount_rate: "प्रति ट्रिप छूट:",
    calc_annual_savings: "सालाना बचत:",
    how_pill: "सच्ची पॉइंट-टू-पॉइंट सुविधा",
    how_title: "RouteSetu पारंपरिक ऐप्स से बेहतर क्यों है",
    how_desc: "फिक्स्ड शटल या महंगी प्राइवेट कैब के विपरीत, RouteSetu स्वतंत्र यात्राओं को तुरंत जोड़ता है।",
    feat1_title: "100% मनचाहा पिकअप व ड्रॉप",
    feat1_desc: "कोई फिक्स्ड बस स्टॉप नहीं। सामान्य टैक्सी की तरह अपने घर के दरवाजे से पिकअप और गंतव्य पर ड्रॉप सेट करें।",
    feat2_title: "वेक्टर और कॉरिडोर मैचिंग",
    feat2_desc: "एल्गोरिदम सुनिश्चित करता है कि सह-यात्री एक ही दिशा में जा रहे हों (≤ 30° झुकाव) और न्यूनतम चक्कर (< 5 मिनट) लगे।",
    feat3_title: "सटीक दूरी के अनुसार किराया",
    feat3_desc: "आप केवल अपनी व्यक्तिगत दूरी का भुगतान करते हैं जिस पर 35% पूल छूट तुरंत लागू होती है।",
    feat4_title: "महिला-विशेष और सुरक्षा शील्ड",
    feat4_desc: "महिला-विशेष पूल विकल्प, सत्यापित चालक, रीयल-टाइम ओटीपी, सुरक्षित राइडर प्रोफाइल और 24/7 एसओएस सुविधा।",
    p_book_ride_title: "सवारी बुक करें"
  },
  mr: {
    tagline: "डायनॅमिक पूलिंग आणि घरवापसी रूट मॅच",
    nav_home: "मुख्य पान",
    nav_passenger: "प्रवासी ॲप",
    nav_driver: "चालक पोर्टल",
    nav_algorithm: "मॅचिंग इंजिन",
    nav_admin: "ॲडमिन फ्लीट",
    hero_badge: "वाहनांच्या क्षमतेचा पूर्ण वापर • कोणतेही ठरावीक स्टॉप नाही",
    hero_subtext: "तुमचा स्वतःचा पिकअप आणि ड्रॉप पॉईंट निवडा. आमचे डायनॅमिक इंजिन एकाच दिशेने जाणाऱ्या प्रवाशांना एकत्र आणते, ज्यामुळे ३५% स्वस्त भाडे मिळते आणि चालकांना परतीच्या प्रवासात कमाई होते.",
    cta_book_ride: "राईड बुक करा / शेअर ऑटो",
    cta_driver_portal: "चालक पोर्टल आणि रूट मॅच",
    cta_see_algorithm: "अल्गोरिदम पहा",
    diff1_tag: "वैशिष्ट्य १ • चालक घरवापसी राईड",
    diff1_title: "रिकाम्या परतीच्या प्रवासांचे निर्मूलन",
    before_driver_title: "आधी: रिकामा परतीचा प्रवास",
    before_driver_desc: "चालक हिंजेवडीत प्रवासी सोडून १८ किमी कोथरूडला रिकामा येतो. ₹० कमाई, ₹९५ चे इंधन वाया जाते.",
    after_driver_title: "RouteSetu सोबत: 'रूट सेट करा'",
    after_driver_desc: "चालक घराचे ठिकाण टाकतो. सिस्टम त्याच मार्गावरील प्रवासी जोडते. परतीच्या प्रवासात ₹१९०+ चा निव्वळ नफा!",
    diff2_tag: "वैशिष्ट्य २ • डायनॅमिक शेअर ऑटो",
    diff2_title: "१००% स्वतःचा पिकअप/ड्रॉप + ३५% बचत",
    before_pass_title: "आधी: रिकाम्या सीट्सचे पूर्ण भाडे",
    before_pass_desc: "एकटा प्रवासी ऑटोच्या ३ जागांचे पूर्ण ₹१२० भाडे एकटाच भरतो.",
    after_pass_title: "RouteSetu सोबत: 'शेअर आणि सेव्ह'",
    after_pass_desc: "प्रवासी स्वतःचा पिकअप/ड्रॉप निवडतो. २-३ प्रवासी एकत्र येतात. प्रवासी देतो फक्त ₹७५, चालक कमावतो ₹२२०!",
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
    calc_shared_fare: "RouteSetu शेअर भाडे:",
    calc_discount_rate: "प्रत्येक ट्रिपवर सूट:",
    calc_annual_savings: "वार्षिक बचत:",
    how_pill: "पॉईंट-टू-पॉईंट लवचिकता",
    how_title: "RouteSetu पारंपारिक ॲप्सपेक्षा श्रेष्ठ का आहे",
    how_desc: "ठरावीक शटल किंवा महागड्या खाजगी कॅब्सऐवजी, RouteSetu प्रवाशांचे मार्ग आपोआप एकत्र जोडते.",
    feat1_title: "१००% स्वतःचा पिकअप आणि ड्रॉप",
    feat1_desc: "कोणतेही फिक्स बस स्टॉप नाहीत. सामान्य टॅक्सीप्रमाणे घराच्या दारातून पिकअप आणि इच्छित स्थळी ड्रॉप मिळवा.",
    feat2_title: "व्हेक्टर आणि कॉरिडॉर मॅचिंग",
    feat2_desc: "अल्गोरिदम खात्री करतो की सहप्रवासी एकाच दिशेने जात आहेत (≤ ३०° कोन) आणि कमीतकमी वळण (< ५ मिनिटे) लागेल.",
    feat3_title: "योग्य अंतरावर आधारित भाडे",
    feat3_desc: "तुम्ही फक्त तुमच्या अंतराचे भाडे देता, ज्यावर ३५% पूल सूट आधीच लागू केली जाते.",
    feat4_title: "महिला-विशेष आणि सुरक्षा शील्ड",
    feat4_desc: "महिलांसाठी स्वतंत्र पूल पर्याय, पडताळणी झालेले चालक, ओटीपी सुरक्षा आणि २४/७ एसओएस सुविधा.",
    p_book_ride_title: "राईड बुक करा"
  }
};

// -------------------------------------------------------------
// 2. INITIALIZATION ON DOM LOAD
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initTheme();
  updateDriverCalc();
  updatePassengerCalc();
  initAdminChart();
  
  // Start with onboarding -> login. Main navigation stays hidden until login.
  setLanguage('en');
  showUnauthenticatedShell();
  goToSlide(1);
  initIcons();
  setupOtpBoxes();
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// -------------------------------------------------------------
// 3. NAVIGATION & VIEW SWITCHING
// -------------------------------------------------------------
function switchView(viewName) {
  if (!state.isAuthenticated && !['onboarding', 'login'].includes(viewName)) {
    viewName = 'login';
  }
  state.currentView = viewName;

  document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.classList.add('active');

  document.querySelectorAll('.view-tab-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById(`tabBtn-${viewName}`);
  if (targetBtn) targetBtn.classList.add('active');

  document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.remove('active'));
  const targetMobileBtn = document.getElementById(`mTab-${viewName}`);
  if (targetMobileBtn) targetMobileBtn.classList.add('active');

  setTimeout(() => {
    if (viewName === 'passenger') initPassengerMap();
    else if (viewName === 'driver') initDriverMap();
    else if (viewName === 'matching') initSandboxMap();
    else if (viewName === 'admin' && adminChartInstance) adminChartInstance.resize();
  }, 100);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// -------------------------------------------------------------
// 3.5 ONBOARDING + LOGIN FLOW
// -------------------------------------------------------------
function showUnauthenticatedShell() {
  const header = document.getElementById('mainSiteHeader');
  const nav = document.getElementById('mainMobileNav');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';
  switchView('onboarding');
}

function showAuthenticatedShell() {
  const header = document.getElementById('mainSiteHeader');
  const nav = document.getElementById('mainMobileNav');
  if (header) header.style.display = '';
  if (nav) nav.style.display = 'flex';
}

function goToSlide(slide) {
  state.onboardingSlide = Math.max(1, Math.min(3, slide));
  document.querySelectorAll('.onboarding-slide-content').forEach((el, index) => {
    el.style.display = (index + 1 === state.onboardingSlide) ? 'flex' : 'none';
  });
  document.querySelectorAll('.onboarding-dots .dot').forEach((dot, index) => {
    dot.classList.toggle('active', index + 1 === state.onboardingSlide);
  });
  const badge = document.getElementById('slideBadgeText');
  const next = document.getElementById('onboardingNextBtn');
  if (badge) badge.textContent = `Feature ${state.onboardingSlide} of 3`;
  if (next) next.querySelector('span').textContent = state.onboardingSlide === 3 ? 'Continue to Login →' : 'Next →';
}

function nextSlide() {
  if (state.onboardingSlide < 3) goToSlide(state.onboardingSlide + 1);
  else {
    switchView('login');
    initIcons();
  }
}

function skipOnboarding() {
  switchView('login');
  initIcons();
}

let selectedLoginRole = 'passenger';

function selectLoginRole(role) {
  selectedLoginRole = role;
  document.getElementById('loginRolePassenger')?.classList.toggle('active', role === 'passenger');
  document.getElementById('loginRoleDriver')?.classList.toggle('active', role === 'driver');
}

function requestLoginOtp() {
  const input = document.getElementById('loginPhoneInput');
  const phone = (input?.value || '').replace(/\D/g, '');
  if (phone.length !== 10) {
    alert('Please enter a valid 10-digit mobile number.');
    input?.focus();
    return;
  }
  document.getElementById('loginStepPhone').style.display = 'none';
  document.getElementById('loginStepOtp').style.display = 'block';
  document.querySelectorAll('.otp-box').forEach((box, i) => {
    box.value = i < 4 ? ['5','8','3','9'][i] : '';
  });
  initIcons();
}

function autoFillDemoOtp() {
  ['5','8','3','9'].forEach((v,i) => {
    const box = document.getElementById(`otp-${i+1}`);
    if (box) box.value = v;
  });
}

function verifyLoginOtp() {
  const otp = ['1','2','3','4','5','6'].map((_,i) => document.getElementById(`otp-${i+1}`)?.value || '').join('');
  const demo = ['1','2','3','4'].map((_,i) => document.getElementById(`otp-${i+1}`)?.value || '').join('');
  if (demo !== '5839') {
    alert('For this demo, use OTP 5839.');
    return;
  }
  state.isAuthenticated = true;
  showAuthenticatedShell();
  switchView(selectedLoginRole === 'driver' ? 'driver' : 'landing');
  initIcons();
}

function setupOtpBoxes() {
  document.querySelectorAll('.otp-box').forEach((box, index, boxes) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g, '').slice(0,1);
      if (box.value && boxes[index + 1]) boxes[index + 1].focus();
    });
  });
}

// -------------------------------------------------------------
// 4. LANGUAGE SWITCHER
// -------------------------------------------------------------
function toggleLanguageMenu() {
  const menu = document.getElementById('langMenu');
  menu.classList.toggle('open');
}

function setLanguage(lang) {
  state.currentLang = lang;
  const dict = I18N[lang] || I18N.en;

  // Update labels
  const langLabel = document.getElementById('currentLangLabel');
  if (langLabel) {
    langLabel.textContent = lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'English';
  }

  // Update text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Close dropdown
  const menu = document.getElementById('langMenu');
  if (menu) menu.classList.remove('open');

  // Refresh icons
  initIcons();
}

// -------------------------------------------------------------
// 5. THEME TOGGLE (Dark vs Clean Light)
// -------------------------------------------------------------
function initTheme() {
  const saved = localStorage.getItem('routesetu_theme') || 'dark';
  applyTheme(saved);
}

function toggleTheme() {
  const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function applyTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('routesetu_theme', theme);

  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    initIcons();
  }

  // Update map tile filters
  updateMapStyles();
}

function updateMapStyles() {
  const isDark = state.currentTheme === 'dark';
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  [passengerMap, driverMap, sandboxMap].forEach(m => {
    if (m) {
      m.invalidateSize();
    }
  });
}

// -------------------------------------------------------------
// 6. FINANCIAL CALCULATORS ENGINE
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

  // Monthly 26 working days
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
  const shareTripFare = Math.round(soloTripFare * 0.62); // 38% discount

  const monthlyTrips = daysPerWeek * 2 * 4.3; // 2 trips/day (to & fro)
  const monthlySavings = Math.round((soloTripFare - shareTripFare) * monthlyTrips);
  const annualSavings = Math.round(monthlySavings * 12);

  document.getElementById('passResultSavings').textContent = `₹${monthlySavings.toLocaleString('en-IN')}`;
  document.getElementById('passBreakdownSolo').textContent = `₹${soloTripFare} / trip`;
  document.getElementById('passBreakdownShare').textContent = `₹${shareTripFare} / trip`;
  document.getElementById('passBreakdownAnnual').textContent = `₹${annualSavings.toLocaleString('en-IN')} / yr`;
}

// -------------------------------------------------------------
// 7. PASSENGER MAP & BOOKING FLOW
// -------------------------------------------------------------
function initPassengerMap() {
  if (passengerMap) {
    passengerMap.invalidateSize();
    return;
  }

  const el = document.getElementById('passengerMap');
  if (!el) return;

  passengerMap = L.map('passengerMap', { zoomControl: false }).setView([18.5500, 73.7800], 12);
  L.control.zoom({ position: 'topright' }).addTo(passengerMap);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  }).addTo(passengerMap);

  // Add click listener for pinning pickup/drop
  passengerMap.on('click', (e) => {
    if (currentMapPinMode === 'pickup') {
      state.passenger.pickup = { lat: e.latlng.lat, lng: e.latlng.lng, name: `Custom Location (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})` };
      document.getElementById('passPickupInput').value = state.passenger.pickup.name;
      currentMapPinMode = null;
      document.getElementById('btnPinPickup').classList.remove('active');
      renderPassengerRoute();
    } else if (currentMapPinMode === 'drop') {
      state.passenger.drop = { lat: e.latlng.lat, lng: e.latlng.lng, name: `Custom Dropoff (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})` };
      document.getElementById('passDropInput').value = state.passenger.drop.name;
      currentMapPinMode = null;
      document.getElementById('btnPinDrop').classList.remove('active');
      renderPassengerRoute();
    }
  });

  renderPassengerRoute();
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
  adjustPassengerCount(0);
  recalcPassengerFares();
}

function selectRideMode(mode) {
  state.passenger.mode = mode;
  document.getElementById('optShareRide').classList.toggle('selected', mode === 'share');
  document.getElementById('optPrivateRide').classList.toggle('selected', mode === 'private');

  const btnText = document.getElementById('btnConfirmRideText');
  const fare = mode === 'share' ? state.passenger.fare : Math.round(state.passenger.fare / 0.62);
  btnText.textContent = `Confirm & ${mode === 'share' ? 'Match Share Ride' : 'Book Private'} (₹${fare})`;
}

function recalcPassengerFares() {
  const p = state.passenger.pickup;
  const d = state.passenger.drop;
  const btnText = document.getElementById('btnConfirmRideText');

  if (!p || !d) {
    state.passenger.distanceKm = 0;
    state.passenger.fare = 0;
    document.getElementById('passPrivateFare').textContent = '—';
    document.getElementById('passShareStrike').textContent = '—';
    document.getElementById('passShareFare').textContent = '—';
    if (btnText) btnText.textContent = 'Enter pickup & destination';
    return;
  }

  const dist = calculateHaversineKm(p.lat, p.lng, d.lat, d.lng);
  state.passenger.distanceKm = Math.max(1, Math.round(dist * 10) / 10);

  const base = state.passenger.vehicle === 'auto' ? 30 : 50;
  const rate = state.passenger.vehicle === 'auto' ? 10 : 15;
  const privateFare = Math.round(base + state.passenger.distanceKm * rate);
  const shareFare = Math.round(privateFare * 0.62);
  state.passenger.fare = shareFare;

  document.getElementById('passPrivateFare').textContent = `₹${privateFare}`;
  document.getElementById('passShareStrike').textContent = `₹${privateFare}`;
  document.getElementById('passShareFare').textContent = `₹${shareFare}`;
  if (btnText) btnText.textContent = `Confirm & ${state.passenger.mode === 'share' ? 'Match Share Ride' : 'Book Private'} (₹${state.passenger.mode === 'share' ? shareFare : privateFare})`;
}

function renderPassengerRoute() {
  if (!passengerMap) return;

  passengerMap.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle || layer instanceof L.CircleMarker) {
      passengerMap.removeLayer(layer);
    }
  });

  const pPick = state.passenger.pickup;
  const pDrop = state.passenger.drop;
  if (!pPick && !pDrop) {
    passengerMap.setView([18.5204, 73.8567], 12);
    recalcPassengerFares();
    return;
  }

  const points = [];
  if (pPick) {
    L.circleMarker([pPick.lat, pPick.lng], {radius:9, fillColor:'#10B981', color:'#fff', weight:2, fillOpacity:1})
      .addTo(passengerMap).bindPopup(`<strong>Your Pickup:</strong><br>${pPick.name}`);
    points.push([pPick.lat,pPick.lng]);
  }
  if (pDrop) {
    L.circleMarker([pDrop.lat, pDrop.lng], {radius:9, fillColor:'#EF4444', color:'#fff', weight:2, fillOpacity:1})
      .addTo(passengerMap).bindPopup(`<strong>Your Destination:</strong><br>${pDrop.name}`);
    points.push([pDrop.lat,pDrop.lng]);
  }

  if (points.length === 2) {
    const p1=points[0], p2=points[1];
    const midLat=(p1[0]+p2[0])/2 + 0.008;
    const midLng=(p1[1]+p2[1])/2 - 0.006;
    passengerRouteLine=L.polyline([p1,[midLat,midLng],p2],{color:'#F59E0B',weight:5,opacity:.85,dashArray:'8, 8'}).addTo(passengerMap);
    passengerMap.fitBounds(passengerRouteLine.getBounds(),{padding:[40,40]});
  } else if (points.length === 1) {
    passengerMap.setView(points[0],14);
  }
  recalcPassengerFares();
  initIcons();
}

// -------------------------------------------------------------
// DYNAMIC LOCATION SEARCH + LIVE GPS
// -------------------------------------------------------------
let locationSearchTimer = null;

async function handleLocationInput(type, value) {
  const query = value.trim();
  const dropdown = document.getElementById(type === 'pickup' ? 'pickupAutocompleteDropdown' : 'dropAutocompleteDropdown');
  if (!dropdown) return;
  clearTimeout(locationSearchTimer);

  if (query.length < 3) {
    dropdown.innerHTML = '';
    return;
  }

  dropdown.innerHTML = '<div class="autocomplete-item"><i data-lucide="loader-circle"></i><span>Searching places…</span></div>';
  initIcons();

  locationSearchTimer = setTimeout(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {headers:{'Accept':'application/json'}});
      if (!response.ok) throw new Error('Location search failed');
      const results = await response.json();

      dropdown.innerHTML = '';
      if (!results.length) {
        dropdown.innerHTML = '<div class="autocomplete-item"><i data-lucide="map-pin-off"></i><span>No matching place found.<small>Try a nearby landmark, area or city.</small></span></div>';
        initIcons();
        return;
      }

      results.forEach(result => {
        const button=document.createElement('button');
        button.type='button';
        button.className='autocomplete-item';
        button.innerHTML=`<i data-lucide="map-pin"></i><span>${escapeHtml(result.display_name.split(',').slice(0,2).join(', '))}<small>${escapeHtml(result.display_name)}</small></span>`;
        button.onclick=()=>selectLocationResult(type,result);
        dropdown.appendChild(button);
      });
      initIcons();
    } catch (error) {
      dropdown.innerHTML='<div class="autocomplete-item"><i data-lucide="wifi-off"></i><span>Could not search right now.<small>You can pin the location directly on the map.</small></span></div>';
      initIcons();
    }
  }, 350);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function selectLocationResult(type, result) {
  const location = {lat:parseFloat(result.lat), lng:parseFloat(result.lon), name:result.display_name};
  state.passenger[type] = location;
  const input=document.getElementById(type === 'pickup' ? 'passPickupInput' : 'passDropInput');
  const dropdown=document.getElementById(type === 'pickup' ? 'pickupAutocompleteDropdown' : 'dropAutocompleteDropdown');
  if (input) input.value=location.name;
  if (dropdown) dropdown.innerHTML='';
  renderPassengerRoute();
}

function useCurrentGpsLocation() {
  if (!navigator.geolocation) {
    alert('Live location is not supported by this browser.');
    return;
  }
  const input=document.getElementById('passPickupInput');
  if (input) input.value='Getting your live location…';

  navigator.geolocation.getCurrentPosition(async position => {
    const lat=position.coords.latitude;
    const lng=position.coords.longitude;
    let name=`Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    try {
      const response=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      if (response.ok) {
        const result=await response.json();
        name=result.display_name || name;
      }
    } catch (_) {}
    selectLocationResult('pickup',{lat,lng,display_name:name});
  }, error => {
    if (input) input.value='';
    alert(error.code === 1 ? 'Please allow location access to use live GPS.' : 'Unable to get your current location.');
  }, {enableHighAccuracy:true,timeout:10000,maximumAge:30000});
}

function adjustPassengerCount(delta) {
  const vehicleCapacity=state.passenger.vehicle === 'auto' ? 3 : 4;
  const next=Math.max(1,Math.min(vehicleCapacity,(state.passenger.passengers || 1)+delta));
  state.passenger.passengers=next;
  const val=document.getElementById('passengerCountVal');
  const label=document.getElementById('lblPassengerCount');
  const sub=document.getElementById('lblSeatCapacitySub');
  if (val) val.textContent=next;
  if (label) label.textContent=`${next} Passenger${next === 1 ? '' : 's'}`;
  if (sub) sub.textContent=`${state.passenger.vehicle === 'auto' ? 3 : 4} seats maximum`;
}

function requestPassengerRide() {
  if (!state.passenger.pickup || !state.passenger.drop) {
    alert('Please select both pickup and destination.');
    return;
  }
  if (state.passenger.passengers < 1) {
    alert('Please select at least 1 passenger.');
    return;
  }
  document.getElementById('passBookingPanel').style.display = 'none';
  document.getElementById('passTrackingPanel').style.display = 'block';

  // Generate random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000);
  document.getElementById('tripOtpCode').textContent = otp;
  state.passenger.otp = otp;
  state.passenger.rideActive = true;

  // Animate progress bar
  let progress = 25;
  const bar = document.getElementById('liveTripProgressBar');
  const timer = setInterval(() => {
    if (!state.passenger.rideActive) {
      clearInterval(timer);
      return;
    }
    progress = (progress + 10) % 100;
    if (bar) bar.style.width = `${progress}%`;
  }, 2000);

  initIcons();
}

function cancelOrResetRide() {
  state.passenger.rideActive = false;
  document.getElementById('passBookingPanel').style.display = 'block';
  document.getElementById('passTrackingPanel').style.display = 'none';
  renderPassengerRoute();
}

// -------------------------------------------------------------
// 8. DRIVER COCKPIT ENGINE & MANIFEST
// -------------------------------------------------------------
function initDriverMap() {
  if (driverMap) {
    driverMap.invalidateSize();
    return;
  }

  const el = document.getElementById('driverMap');
  if (!el) return;

  driverMap = L.map('driverMap', { zoomControl: false }).setView([18.5500, 73.7800], 12);
  L.control.zoom({ position: 'topright' }).addTo(driverMap);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
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
    routeConfig.style.display = (mode === 'route' || mode === 'pool') ? 'block' : 'none';
  }

  renderDriverCockpitRoute();
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

  const dStart = [18.5913, 73.7389]; // Hinjewadi
  const dEnd = [18.5074, 73.8077];   // Kothrud

  // Multi-stop route sequence: Hinjewadi -> Wakad (Pick Priya) -> Aundh (Drop Rahul) -> Kothrud (Drop Priya / Home)
  const stops = [
    { pos: [18.5913, 73.7389], label: "1. Rahul M. (Pickup Hinjewadi)", type: 'pick' },
    { pos: [18.5980, 73.7620], label: "2. Priya S. (Pickup Wakad)", type: 'pick' },
    { pos: [18.5529, 73.8050], label: "3. Rahul M. (Dropoff Aundh)", type: 'drop' },
    { pos: [18.5074, 73.8077], label: "4. Homebound Final Drop (Kothrud)", type: 'home' }
  ];

  const latlngs = stops.map(s => s.pos);

  // Corridor Buffer Circle
  if (state.driver.mode === 'route' || state.driver.mode === 'pool') {
    stops.forEach(s => {
      L.circle(s.pos, {
        radius: state.driver.detourRadiusKm * 800,
        color: '#6366F1',
        weight: 1,
        fillColor: '#6366F1',
        fillOpacity: 0.08
      }).addTo(driverMap);
    });
  }

  driverRouteLine = L.polyline(latlngs, {
    color: '#10B981',
    weight: 5,
    opacity: 0.9
  }).addTo(driverMap);

  stops.forEach((s, idx) => {
    const isPick = s.type === 'pick';
    const marker = L.circleMarker(s.pos, {
      radius: 10,
      fillColor: isPick ? '#F59E0B' : '#EF4444',
      color: '#fff',
      weight: 2,
      fillOpacity: 1
    }).addTo(driverMap).bindPopup(`<strong>${s.label}</strong>`);
    if (idx === 0) marker.openPopup();
  });

  driverMap.fitBounds(driverRouteLine.getBounds(), { padding: [30, 30] });
  initIcons();
}

function simulateIncomingRequest() {
  const card = document.getElementById('incomingOfferCard');
  if (!card) return;
  card.style.display = 'block';

  let countdown = 15;
  const timerLbl = document.getElementById('offerTimer');
  const timer = setInterval(() => {
    countdown--;
    if (timerLbl) timerLbl.textContent = `00:${countdown < 10 ? '0' + countdown : countdown}`;
    if (countdown <= 0) {
      clearInterval(timer);
      card.style.display = 'none';
    }
  }, 1000);
}

function acceptDriverOffer() {
  document.getElementById('incomingOfferCard').style.display = 'none';
  document.getElementById('driverSeatCount').textContent = 'Seats: 3/3 (Full)';
  alert('Ride offer accepted! Priya S. added to manifest with +₹75.00 extra earnings.');
}

function declineDriverOffer() {
  document.getElementById('incomingOfferCard').style.display = 'none';
}

function triggerSimulatedDriverStep() {
  state.driver.currentStep = (state.driver.currentStep % 4) + 1;
  alert(`Driver navigation updated to Step ${state.driver.currentStep}.`);
}

// -------------------------------------------------------------
// 9. DYNAMIC MATCHING ALGORITHM SANDBOX
// -------------------------------------------------------------
function initSandboxMap() {
  if (sandboxMap) {
    sandboxMap.invalidateSize();
    return;
  }

  const el = document.getElementById('sandboxMap');
  if (!el) return;

  sandboxMap = L.map('sandboxMap', { zoomControl: false }).setView([18.5500, 73.7900], 12);
  L.control.zoom({ position: 'topright' }).addTo(sandboxMap);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
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

  // Add pickups
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

  // Add drops
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
    alert('Maximum legal capacity reached (3 in Auto, 4 in Cab).');
    return;
  }
  const id = String.fromCharCode(65 + state.sandbox.passengers.length);
  const newPass = {
    id: id,
    name: `Passenger ${id}`,
    pick: [18.5600 + (Math.random() - 0.5) * 0.04, 73.7800 + (Math.random() - 0.5) * 0.04],
    drop: [18.5200 + (Math.random() - 0.5) * 0.04, 73.8400 + (Math.random() - 0.5) * 0.04],
    fare: 85,
    dist: 10.2,
    picked: false
  };
  state.sandbox.passengers.push(newPass);
  runSandboxMatchSimulation();
}

function resetSandboxSimulation() {
  state.sandbox.passengers = [
    { id: 'A', name: 'Rahul M.', pick: [18.5913, 73.7389], drop: [18.5529, 73.8050], fare: 65, dist: 8.5, picked: true },
    { id: 'B', name: 'Priya S.', pick: [18.5980, 73.7620], drop: [18.5204, 73.8567], fare: 110, dist: 14.2, picked: false }
  ];
  runSandboxMatchSimulation();
}

// -------------------------------------------------------------
// 10. ADMIN DASHBOARD & CHART.JS
// -------------------------------------------------------------
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
  alert('Driver KYC approved! Driver activated for live pooling.');
}

// -------------------------------------------------------------
// 11. MODALS & UTILITY FUNCTIONS
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
  navigator.clipboard?.writeText(window.location.href);
  alert('Live trip tracking link copied to clipboard! Share with family or friends.');
}

function completePaymentSimulation() {
  closeModal('paymentModal');
  alert('Payment of ₹75.00 successful via UPI! Digital receipt & carbon offset certificate generated.');
}

function submitKYC() {
  closeModal('kycModal');
  alert('Driver documents uploaded successfully. Background verification completed.');
}

function triggerSOSCall() {
  alert('EMERGENCY SOS: Dialing 112... Live vehicle location and audio telemetry dispatched to city emergency response unit.');
  closeModal('sosModal');
}

// Math Utility: Haversine distance in km
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
