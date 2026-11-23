import { Injectable, signal, computed } from '@angular/core';

export type SupportedLang = 'en' | 'ta' | 'hi' | 'ml';

export interface LangOption {
  code: SupportedLang;
  label: string;
  native: string;
}

export const SUPPORTED_LANGS: LangOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<SupportedLang>('en');

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('wf_lang') as SupportedLang;
      if (saved && ['en', 'ta', 'hi', 'ml'].includes(saved)) {
        this.currentLang.set(saved);
      }
    }
  }

  setLanguage(lang: SupportedLang) {
    this.currentLang.set(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('wf_lang', lang);
    }
  }

  private translations: Record<string, Record<SupportedLang, string>> = {
    // Brand & Hero
    'brand.name': {
      en: 'Wedding Feast',
      ta: 'வெட்டிங் பீஸ்ட்',
      hi: 'वेडिंग फीस्ट',
      ml: 'വെഡ്ഡിംഗ് ഫീസ്റ്റ്',
    },
    'brand.tagline': {
      en: 'Royal Wedding Catering & Food Estimation',
      ta: 'அரச திருமண விருந்து உபசரிப்பு & மதிப்பீடு',
      hi: 'शाही विवाह खानपान एवं लागत अनुमान',
      ml: 'രാജകീയ വിവാഹ കാറ്ററിംഗും വിരുന്ന് എസ്റ്റിമേഷനും',
    },
    'hero.title': {
      en: 'Curate Your Wedding Feast',
      ta: 'உங்கள் திருமண விருந்தை தேர்ந்தெடுங்கள்',
      hi: 'अपनी शादी की शाही दावत संजोएं',
      ml: 'നിങ്ങളുടെ വിവാഹ വിരുന്ന് തിരഞ്ഞെടുക്കൂ',
    },
    'hero.subtitle': {
      en: 'A perfect blend of tradition and taste. Handpick artisanal dishes, tailor portions, and observe real-time catering cost estimation.',
      ta: 'பாரம்பரியமும் சுவையும் இணைந்த அரச விருந்து. பாரம்பரிய உணவுகள், அளவுகள் மற்றும் நிகழ்நேர விலை மதிப்பீடு.',
      hi: 'परंपरा और स्वाद का अनूठा संगम। प्रामाणिक व्यंजन चुनें, मात्रा तय करें और वास्तविक समय का बजट देखें।',
      ml: 'പാരമ്പര്യവും രുചിയും സമന്വയിച്ച രാജകീയ വിരുന്ന്. നിങ്ങളുടെ ഇഷ്‌ടവിഭവങ്ങൾ തിരഞ്ഞെടുത്ത് ബജറ്റ് തിട്ടപ്പെടുത്തൂ.',
    },
    'hero.readMore': {
      en: 'Read More',
      ta: 'மேலும் அறிய',
      hi: 'और पढ़ें',
      ml: 'കൂടുതലറിയാൻ',
    },

    // Navigation
    'nav.browseMenu': {
      en: 'Curate Feast',
      ta: 'விருந்து பட்டியல்',
      hi: 'मेन्यू संजोएं',
      ml: 'വിരുന്ന് മെനു',
    },
    'nav.eventDetails': {
      en: 'Event Details',
      ta: 'நிகழ்வு விவரம்',
      hi: 'समारोह विवरण',
      ml: 'ഇവന്റ് വിവരങ്ങൾ',
    },
    'nav.reviewBooking': {
      en: 'Final Feast Proposal',
      ta: 'இறுதி விருந்து மதிப்பீடு',
      hi: 'अंतिम प्रस्ताव',
      ml: 'വിരുന്ന് പ്രൊപ്പോസൽ',
    },
    'nav.adminStudio': {
      en: 'Culinary Studio',
      ta: 'சமையல் ஸ்டுடியோ',
      hi: 'कुलिनरी स्टूडियो',
      ml: 'കുലിനറി സ്റ്റുഡിയോ',
    },
    'nav.adminLogin': {
      en: 'Admin Login',
      ta: 'நிர்வாக உள்நுழைவு',
      hi: 'व्यवस्थापक प्रवेश',
      ml: 'അഡ്മിൻ ലോഗിൻ',
    },

    // Courses / Categories
    'cat.all': {
      en: 'All Courses',
      ta: 'அனைத்து வகைகள்',
      hi: 'सभी व्यंजन',
      ml: 'എല്ലാ വിഭവങ്ങളും',
    },
    'cat.starters': {
      en: 'Starters',
      ta: 'தொடக்க உணவுகள்',
      hi: 'स्टार्टर्स (शुरुआती व्यंजन)',
      ml: 'സ്റ്റാർട്ടറുകൾ',
    },
    'cat.mainCourse': {
      en: 'Main Course',
      ta: 'பிரதான உணவுகள்',
      hi: 'मुख्य भोजन (मेन कोर्स)',
      ml: 'മെയിൻ കോഴ്സ്',
    },
    'cat.tiffin': {
      en: 'Traditional Tiffin & Breakfast',
      ta: 'பாரம்பரிய சிற்றுண்டி & டிபன்',
      hi: 'पारंपरिक नाश्ता एवं टिफिन',
      ml: 'പരമ്പരാഗത പ്രഭാതഭക്ഷണം',
    },
    'cat.biryani': {
      en: 'Rice & Biryani',
      ta: 'சாதம் & பிரியாணி',
      hi: 'चावल एवं बिरयानी',
      ml: 'റൈസ് & ബിരിയാണി',
    },
    'cat.breads': {
      en: 'Breads & Rotis',
      ta: 'ரொட்டி & நாண்',
      hi: 'रोटी एवं नान',
      ml: 'റൊട്ടി & ബ്രെഡ്സ്',
    },
    'cat.liveCounters': {
      en: 'Live Counters',
      ta: 'லைவ் கவுண்டர்கள்',
      hi: 'लाइव फूड काउंटर्स',
      ml: 'ലൈവ് കൗണ്ടറുകൾ',
    },
    'cat.desserts': {
      en: 'Desserts & Sweets',
      ta: 'இனிப்புகள் & டெசர்ட்ஸ்',
      hi: 'मिठाइयाँ एवं डेसर्ट',
      ml: 'മധുരപലഹാരങ്ങൾ',
    },
    'cat.beverages': {
      en: 'Beverages',
      ta: 'பானங்கள்',
      hi: 'शीतल पेय एवं कावा',
      ml: 'പാനീയങ്ങൾ',
    },

    // Dietary
    'diet.all': {
      en: 'All Diets',
      ta: 'அனைத்தும்',
      hi: 'सभी आहार',
      ml: 'എല്ലാം',
    },
    'diet.veg': {
      en: 'Pure Veg',
      ta: 'சைவம்',
      hi: 'शुद्ध शाकाहारी',
      ml: 'ശുദ്ധ സസ്യാഹാരം',
    },
    'diet.nonveg': {
      en: 'Non-Veg',
      ta: 'அசைவம்',
      hi: 'मांसाहारी',
      ml: 'മാംസാഹാരം',
    },
    'diet.vegan': {
      en: 'Vegan',
      ta: 'வீகன்',
      hi: 'वीगन',
      ml: 'വീഗൻ',
    },
    'diet.jain': {
      en: 'Jain Friendly',
      ta: 'ஜெயின் உணவு',
      hi: 'जैन अनुकूल',
      ml: 'ജൈൻ ഫ്രണ്ട്ലി',
    },

    // Spices
    'spice.mild': {
      en: 'Mild',
      ta: 'மிதமான காரம்',
      hi: 'हल्का तीखा',
      ml: 'നേരിയ എരിവ്',
    },
    'spice.medium': {
      en: 'Medium Spicy',
      ta: 'நடுத்தர காரம்',
      hi: 'मध्यम मसालेदार',
      ml: 'ഇടത്തരം എരിവ്',
    },
    'spice.spicy': {
      en: 'Spicy',
      ta: 'காரசாரமான',
      hi: 'तीखा चटपटा',
      ml: 'നല്ല എരിവ്',
    },

    // Units
    'unit.person': {
      en: '/ person',
      ta: '/ நபருக்கு',
      hi: '/ व्यक्ति',
      ml: '/ ഒരാൾക്ക്',
    },
    'unit.guest': {
      en: 'guest',
      ta: 'விருந்தினர்',
      hi: 'अतिथि',
      ml: 'അതിഥി',
    },
    'unit.guests': {
      en: 'Guests',
      ta: 'விருந்தினர்கள்',
      hi: 'अतिथि',
      ml: 'അതിഥികൾ',
    },
    'unit.portion': {
      en: 'Portion',
      ta: 'அளவு',
      hi: 'मात्रा',
      ml: 'അളവ്',
    },
    'unit.pcs': {
      en: 'pcs',
      ta: 'எண்ணிக்கை',
      hi: 'पीस',
      ml: 'എണ്ണം',
    },
    'unit.g': {
      en: 'g',
      ta: 'கிராம்',
      hi: 'ग्राम',
      ml: 'ഗ്രാം',
    },
    'unit.kg': {
      en: 'kg',
      ta: 'கிலோ',
      hi: 'किलो',
      ml: 'കിലോ',
    },
    'unit.ml': {
      en: 'ml',
      ta: 'மி.லி',
      hi: 'मिली',
      ml: 'മില്ലി',
    },
    'unit.l': {
      en: 'L',
      ta: 'லிட்டர்',
      hi: 'लीटर',
      ml: 'ലിറ്റർ',
    },

    // Actions & Buttons
    'action.addToFeast': {
      en: 'Add to Feast',
      ta: 'விருந்தில் சேர்',
      hi: 'थाली में जोड़ें',
      ml: 'മെനുവിൽ ചേർക്കുക',
    },
    'action.added': {
      en: 'Added',
      ta: 'சேர்க்கப்பட்டது',
      hi: 'जोड़ दिया गया',
      ml: 'ചേർത്തു',
    },
    'action.reviewMenu': {
      en: 'Review Menu',
      ta: 'மெனுவை சரிபார்க்க',
      hi: 'मेन्यू समीक्षा करें',
      ml: 'മെനു കാണുക',
    },
    'action.confirmFeast': {
      en: 'Confirm Feast',
      ta: 'விருந்தை உறுதிசெய்',
      hi: 'दावत पक्की करें',
      ml: 'വിരുന്ന് ഉറപ്പാക്കുക',
    },
    'action.downloadPdf': {
      en: 'Download Editorial PDF',
      ta: 'மதிப்பீடு PDF பதிவிறக்கு',
      hi: 'पीडीएफ डाउनलोड करें',
      ml: 'പി.ഡി.എഫ് ഡൗൺലോഡ്',
    },
    'action.saveSettings': {
      en: 'Save & Update Dish',
      ta: 'சேமி & புதுப்பி',
      hi: 'सहेजें और अद्यतन करें',
      ml: 'സേവ് ചെയ്യുക',
    },
    'action.clearAll': {
      en: 'Clear All',
      ta: 'அனைத்தையும் நீக்கு',
      hi: 'सब हटाएं',
      ml: 'എല്ലാം ഒഴിവാക്കുക',
    },

    // Dish Detail & Carousel Modal
    'dishModal.title': {
      en: 'Culinary Composition & Presentation',
      ta: 'சமையல் கலை & பரிமாறும் முறை',
      hi: 'व्यंजन प्रस्तुति और सामग्री',
      ml: 'വിഭവ വിവരങ്ങളും ചേരുവകളും',
    },
    'dishModal.ingredients': {
      en: 'Curated Ingredients & Proportions',
      ta: 'தேர்ந்தெடுக்கப்பட்ட மூலப்பொருட்கள்',
      hi: 'विशिष्ट सामग्री और मात्रा',
      ml: 'ചേരുവകളും അളവുകളും',
    },
    'dishModal.chefNotes': {
      en: 'Royal Culinary Notes',
      ta: 'சமையல் குறிப்புகள்',
      hi: 'विशेष रसोइया सुझाव',
      ml: 'പാചകക്കുറിപ്പുകൾ',
    },
    'dishModal.viewPlating': {
      en: 'View Plating & Ingredients',
      ta: 'பரிமாறும் முறை & பொருட்கள் காண்க',
      hi: 'प्रस्तुति और सामग्री देखें',
      ml: 'വിശദാംശങ്ങൾ കാണുക',
    },
    'dishModal.updatePortion': {
      en: 'Update Feast Portion',
      ta: 'அளவை புதுப்பி',
      hi: 'मात्रा अद्यतन करें',
      ml: 'അളവ് മാറ്റുക',
    },
    'dishModal.portionPerGuest': {
      en: 'Serving Portion Per Guest',
      ta: 'விருந்தினருக்கான பரிமாறும் அளவு',
      hi: 'प्रति अतिथि परोसने की मात्रा',
      ml: 'ഒരാൾക്കുള്ള അളവ്',
    },

    // Event Configuration
    'event.title': {
      en: 'Your Celebration Configuration',
      ta: 'உங்கள் திருமண நிகழ்வு விவரம்',
      hi: 'आपके समारोह की जानकारी',
      ml: 'നിങ്ങളുടെ വിവാഹ വിവരങ്ങൾ',
    },
    'event.hostName': {
      en: 'Couple / Host Name',
      ta: 'மணமக்கள் / விருந்தோம்பல் பெயர்',
      hi: 'वर-वधू / यजमान का नाम',
      ml: 'ദമ്പതികൾ / ആതിഥേയന്റെ പേര്',
    },
    'event.type': {
      en: 'Celebration Type',
      ta: 'நிகழ்வின் வகை',
      hi: 'समारोह का प्रकार',
      ml: 'ചടങ്ങിന്റെ ഇനം',
    },
    'event.date': {
      en: 'Celebration Date',
      ta: 'திருமண தேதி',
      hi: 'समारोह की तिथि',
      ml: 'വിവാഹ തീയതി',
    },
    'event.guestsCount': {
      en: 'Number of Guests',
      ta: 'விருந்தினர் எண்ணிக்கை',
      hi: 'अतिथियों की संख्या',
      ml: 'അതിഥികളുടെ എണ്ണം',
    },
    'event.venue': {
      en: 'Venue Location',
      ta: 'திருமண மண்டபம் / இடம்',
      hi: 'स्थान / विवाह स्थल',
      ml: 'വേദി / ലൊക്കേഷൻ',
    },

    // Financial / Receipt
    'calc.heading': {
      en: 'Live Catering Estimate',
      ta: 'நேரலை விசேஷ மதிப்பீடு',
      hi: 'वास्तविक समय कैटरिंग बजट',
      ml: 'തത്സമയ വിരുന്ന് എസ്റ്റിമേഷൻ',
    },
    'calc.subtotal': {
      en: 'Food Subtotal',
      ta: 'உணவு கூட்டுத்தொகை',
      hi: 'व्यंजन उप-योग',
      ml: 'ഭക്ഷണ ഉപതുക',
    },
    'calc.serviceCharges': {
      en: 'Catering Service Charges',
      ta: 'பரிமாறுதல் கட்டணம்',
      hi: 'सेवा एवं कैटरिंग शुल्क',
      ml: 'സർവീസ് ചാർജുകൾ',
    },
    'calc.transportation': {
      en: 'Transportation & Logistics',
      ta: 'போக்குவரத்து & ஏற்றி இறக்குதல்',
      hi: 'परिवहन एवं व्यवस्था',
      ml: 'ഗതാഗത ചെലവുകൾ',
    },
    'calc.gst': {
      en: 'GST Taxes',
      ta: 'ஜிஎസ്ടி வரி',
      hi: 'जीएसटी कर',
      ml: 'ജി.എസ്.ടി നികുതി',
    },
    'calc.grandTotal': {
      en: 'Grand Total',
      ta: 'மொத்த மதிப்பு',
      hi: 'कुल राशि',
      ml: 'ആകെ തുക',
    },
    'calc.costPerGuest': {
      en: 'Estimated Cost per Guest',
      ta: 'ஒரு விருந்தினருக்கான செலவு',
      hi: 'प्रति अतिथि अनुमानित खर्च',
      ml: 'ഒരാൾക്ക് വരുന്ന ചെലവ്',
    },
    'calc.allInclusive': {
      en: 'All culinary charges & logistics included',
      ta: 'அனைத்து வரி மற்றும் போக்குவரத்து கட்டணங்களுடன்',
      hi: 'सभी टैक्स व कैटरिंग व्यवस्थाएं सम्मिलित',
      ml: 'എല്ലാ ചാർജുകളും നികുതികളും ഉൾപ്പെടെ',
    },
    'receipt.yourEstimation': {
      en: 'Your Estimation',
      ta: 'உங்கள் மதிப்பீடு',
      hi: 'आपका अनुमान',
      ml: 'നിങ്ങളുടെ എസ്റ്റിമേഷൻ',
    },
    'receipt.foodSubtotal': {
      en: 'Food Subtotal',
      ta: 'உணவு கூட்டுத்தொகை',
      hi: 'व्यंजन उप-योग',
      ml: 'ഭക്ഷണ ഉപതുക',
    },
    'receipt.cateringCharges': {
      en: 'Catering Service Charges',
      ta: 'பரிமாறுதல் கட்டணம்',
      hi: 'सेवा एवं कैटरिंग शुल्क',
      ml: 'സർവീസ് ചാർജുകൾ',
    },
    'receipt.transportation': {
      en: 'Transportation & Logistics',
      ta: 'போக்குவரத்து & ஏற்றி இறக்குதல்',
      hi: 'परिवहन एवं व्यवस्था',
      ml: 'ഗതാഗത ചെലവുകൾ',
    },
    'receipt.gst': {
      en: 'GST Taxes',
      ta: 'ஜிஎസ്ടி வரி',
      hi: 'जीएसटी कर',
      ml: 'ജി.എസ്.ടി നികുതി',
    },
    'receipt.grandTotal': {
      en: 'Grand Total',
      ta: 'மொத்த மதிப்பு',
      hi: 'कुल राशि',
      ml: 'ആകെ തുക',
    },

    // Proposal Screen
    'proposal.title': {
      en: 'Final Feast Proposal',
      ta: 'இறுதி திருமண விருந்து திட்டம்',
      hi: 'अंतिम शाही दावत प्रस्ताव',
      ml: 'അന്തിമ വിരുന്ന് പ്രൊപ്പോസൽ',
    },
    'proposal.lead': {
      en: 'Your custom culinary journey, tailored for a celebration of taste and tradition.',
      ta: 'பாரம்பரியமும் கௌரவமும் நிறைந்த உங்கள் பிரத்யேக திருமண விருந்து தயாரிப்பு.',
      hi: 'आपकी पसंद अनुसार तैयार की गई प्रामाणिक शाही खानपान यात्रा।',
      ml: 'നിങ്ങളുടെ അഭിരുചിക്കിണങ്ങിയ രാജകീയ രുചിക്കൂട്ട്.',
    },
    'proposal.viewEstimate': {
      en: 'Digital Estimate View',
      ta: 'டிஜிட்டல் மதிப்பீடு',
      hi: 'डिजिटल बिलिंग दृश्य',
      ml: 'ഡിജിറ്റൽ എസ്റ്റിമേറ്റ്',
    },
    'proposal.viewCard3D': {
      en: '3D Gold-Foil Menu Card',
      ta: '3D தங்க அச்சு அழைப்பிதழ் மெனு',
      hi: '3D स्वर्ण-पत्र मेन्यू कार्ड',
      ml: '3D ഗോൾഡ് മെനു കാർഡ്',
    },
    'proposal.totalPrep': {
      en: 'Total Kitchen Prep Qty',
      ta: 'மொத்த சமையல் அளவு',
      hi: 'कुल तैयारी मात्रा',
      ml: 'ആകെ തയാറാക്കേണ്ട അളവ്',
    },

    // Admin Culinary Studio
    'admin.studio': {
      en: 'Culinary Studio & Dish Editor',
      ta: 'சமையல் ஸ்டுடியோ & உணவு தொகுப்பு',
      hi: 'कुलिनरी स्टूडियो एवं व्यंजन संपादक',
      ml: 'കുലിനറി സ്റ്റുഡിയോ',
    },
    'admin.targetPrice': {
      en: 'Target Price per Plate',
      ta: 'இலக்கு தட்டு விலை',
      hi: 'प्रति थाली लक्षित मूल्य',
      ml: 'ഒരു പ്ലേറ്റിന് ലക്ഷ്യമിടുന്ന വില',
    },
    'admin.rawCost': {
      en: 'Estimated Raw Ingredient Cost',
      ta: 'மூலப்பொருள் உத்தேச செலவு',
      hi: 'कच्ची सामग्री की अनुमानित लागत',
      ml: 'അസംസ്കൃത വസ്തുക്കളുടെ ചെലവ്',
    },
    'admin.prepLabor': {
      en: 'Prep & Labor Margin',
      ta: 'சமையல் & பணியாளர் கட்டணம்',
      hi: 'श्रम एवं निर्माण लागत',
      ml: 'തൊഴിൽ ചെലവ്',
    },
    'admin.profitMargin': {
      en: 'Calculated Profit Margin',
      ta: 'கணக்கிடப்பட்ட லாப வரம்பு',
      hi: 'लाभ प्रतिशत',
      ml: 'ലാഭ ശതമാനം',
    },
    'admin.interactiveScaling': {
      en: 'Interactive Kitchen Scaling for',
      ta: 'சமையலறை அளவு கணக்கீடு -',
      hi: 'अतिथियों के अनुसार सामग्री पैमाना -',
      ml: 'പാചകശാലാ സ്കെയിലിംഗ് -',
    },
    'admin.overviewTitle': {
      en: 'Good Morning, Director',
      ta: 'இனிய காலை வணக்கம், இயக்குனர்',
      hi: 'सुप्रभात, निर्देशक महोदय',
      ml: 'സുപ്രഭാതം, ഡയറക്ടർ',
    },
    'admin.overviewLead': {
      en: 'Here is the celebration landscape for the upcoming months.',
      ta: 'எதிர்வரும் திருமண மாதங்களுக்கான முழுமையான கண்ணோட்டம்.',
      hi: 'आगामी महीनों के वैवाहिक समारोहों का विस्तृत दृश्य।',
      ml: 'വരാനിരിക്കുന്ന മാസങ്ങളിലെ ആഘോഷങ്ങളുടെ വിവരങ്ങൾ.',
    },

    // Admin Sidebar & Header
    'admin.sidebar.overview': {
      en: 'Overview',
      ta: 'கண்ணோட்டம்',
      hi: 'अवलोकन',
      ml: 'അവലോകനം',
    },
    'admin.sidebar.events': {
      en: 'Events',
      ta: 'நிகழ்வுகள்',
      hi: 'समारोह',
      ml: 'ഇവന്റുകൾ',
    },
    'admin.sidebar.studio': {
      en: 'Studio',
      ta: 'ஸ்டுடியோ',
      hi: 'स्टूडियो',
      ml: 'സ്റ്റുഡിയോ',
    },
    'admin.sidebar.recipes': {
      en: 'Recipes',
      ta: 'சமையல் குறிப்பு',
      hi: 'रेसिपी',
      ml: 'റെസിപ്പികൾ',
    },
    'admin.sidebar.pricing': {
      en: 'Pricing',
      ta: 'விலை நிர்ணயம்',
      hi: 'मूल्य निर्धारण',
      ml: 'വിലവിവരം',
    },
    'admin.sidebar.categories': {
      en: 'Categories',
      ta: 'வகைகள்',
      hi: 'श्रेणियां',
      ml: 'വിഭാഗങ്ങൾ',
    },
    'admin.sidebar.store': {
      en: 'Store',
      ta: 'வாடிக்கையாளர் தளம்',
      hi: 'ग्राहक स्टोर',
      ml: 'സ്റ്റോർ',
    },

    // Admin KPIs
    'admin.kpi.activeEvents': {
      en: 'Active Wedding Events',
      ta: 'செயலில் உள்ள திருமண நிகழ்வுகள்',
      hi: 'सक्रिय विवाह समारोह',
      ml: 'സജീവ വിവാഹ ഇവന്റുകൾ',
    },
    'admin.kpi.expectedGuests': {
      en: 'Expected Guests',
      ta: 'எதிர்பார்க்கப்படும் விருந்தினர்கள்',
      hi: 'अपेक्षित अतिथि',
      ml: 'പ്രതീക്ഷിക്കുന്ന അതിഥികൾ',
    },
    'admin.kpi.monthlyRevenue': {
      en: 'Monthly Revenue',
      ta: 'மாத வருவாய்',
      hi: 'मासिक राजस्व',
      ml: 'പ്രതിമാസ വരുമാനം',
    },
    'admin.chart.revenueOverview': {
      en: 'Revenue Overview',
      ta: 'வருவாய் வரைபடம்',
      hi: 'राजस्व अवलोकन',
      ml: 'വരുമാന അവലോകനം',
    },
    'admin.timeline.title': {
      en: 'Upcoming Wedding Events Timeline',
      ta: 'வரவிருக்கும் திருமண நிகழ்வுகள்',
      hi: 'आगामी विवाह समारोह समयरेखा',
      ml: 'വരാനിരിക്കുന്ന വിവാഹ ഇവന്റുകൾ',
    },
    'admin.dishes.topPerforming': {
      en: 'Top Performing Dishes',
      ta: 'அதிகம் விரும்பப்படும் உணவுகள்',
      hi: 'सर्वाधिक लोकप्रिय व्यंजन',
      ml: 'ജനപ്രിയ വിഭവങ്ങൾ',
    },
    'admin.actions.title': {
      en: 'Quick Actions',
      ta: 'விரைவு நடவடிக்கைகள்',
      hi: 'त्वरित कार्य',
      ml: 'ദ്രുത നടപടികൾ',
    },
    'admin.actions.scheduleEvent': {
      en: 'Schedule New Event',
      ta: 'புதிய நிகழ்வை திட்டமிடு',
      hi: 'नया समारोह तय करें',
      ml: 'പുതിയ ഇവന്റ് ഷെഡ്യൂൾ ചെയ്യുക',
    },
    'admin.actions.reviewPO': {
      en: 'Review Purchase Orders',
      ta: 'கொள்முதல் ஆணைகள்',
      hi: 'खरीद आदेश समीक्षा',
      ml: 'പർച്ചേസ് ഓർഡറുകൾ',
    },
    'admin.actions.exportFinancials': {
      en: 'Export Financials',
      ta: 'நிதி அறிக்கை பதிவிறக்கு',
      hi: 'वित्तीय रिपोर्ट निर्यात',
      ml: 'സാമ്പത്തിക റിപ്പോർട്ട്',
    },

    // Admin Culinary Studio & Story
    'admin.story.title': {
      en: 'The Story',
      ta: 'சுவை கதை',
      hi: 'व्यंजन कथा',
      ml: 'രുചിക്കൂട്ട് കഥ',
    },
    'admin.story.subtitle': {
      en: 'Narrative & Culinary Profile',
      ta: 'விவரம் & சுயவிவரம்',
      hi: 'विवरण एवं प्रोफ़ाइल',
      ml: 'വിവരണം',
    },
    'admin.story.dishTitle': {
      en: 'Dish Title',
      ta: 'உணவு பெயர்',
      hi: 'व्यंजन का नाम',
      ml: 'വിഭവത്തിന്റെ പേര്',
    },
    'admin.story.description': {
      en: 'Culinary Description',
      ta: 'சமையல் செய்முறை விளக்கம்',
      hi: 'व्यंजन विवरण',
      ml: 'പാചക വിവരണം',
    },
    'admin.story.category': {
      en: 'Category',
      ta: 'பிரிவு',
      hi: 'श्रेणी',
      ml: 'വിഭാഗം',
    },
    'admin.story.baseUnit': {
      en: 'Base Serving Unit',
      ta: 'அடிப்படை பரிமாறும் அளவு',
      hi: 'मूल परोसने की इकाई',
      ml: 'വിളമ്പുന്ന അളവ്',
    },
    'admin.story.diet': {
      en: 'Dietary Designation',
      ta: 'உணவு வகைப்பாடு',
      hi: 'आहार प्रकार',
      ml: 'ഭക്ഷണ രീതി',
    },
    'admin.story.prepTime': {
      en: 'Preparation Time',
      ta: 'தயாரிப்பு நேரம்',
      hi: 'तैयारी का समय',
      ml: 'തയ്യാറാക്കൽ സമയം',
    },
    'admin.story.minOrder': {
      en: 'Minimum Order Quantity',
      ta: 'குறைந்தபட்ச ஆர்டர் அளவு',
      hi: 'न्यूनतम आदेश मात्रा',
      ml: 'കുറഞ്ഞ ഓർഡർ അളവ്',
    },
    'admin.story.status': {
      en: 'Status',
      ta: 'நிலை',
      hi: 'स्थिति',
      ml: 'സ്റ്റാറ്റസ്',
    },

    // Categories Modal
    'admin.cat.addNew': {
      en: 'Add New Category',
      ta: 'புதிய வகை சேர்க்க',
      hi: 'नई श्रेणी जोड़ें',
      ml: 'പുതിയ കാറ്റഗറി ചേർക്കുക',
    },
    'admin.cat.edit': {
      en: 'Edit Category',
      ta: 'வகையை திருத்த',
      hi: 'श्रेणी संपादित करें',
      ml: 'കാറ്റഗറി എഡിറ്റ് ചെയ്യുക',
    },
    'admin.cat.name': {
      en: 'Category Name',
      ta: 'வகைப் பெயர்',
      hi: 'श्रेणी का नाम',
      ml: 'കാറ്റഗറി പേര്',
    },
    'admin.cat.desc': {
      en: 'Description',
      ta: 'விளக்கம்',
      hi: 'विवरण',
      ml: 'വിവരണം',
    },
    'admin.cat.order': {
      en: 'Display Order',
      ta: 'வரிசை எண்',
      hi: 'प्रदर्शन क्रम',
      ml: 'ക്രമം',
    },
    'admin.cat.image': {
      en: 'Category Image (Cloudflare R2)',
      ta: 'வகை படம் (கிளவுட்பிளேர் R2)',
      hi: 'श्रेणी चित्र (क्लाउडफ्लेयर R2)',
      ml: 'കാറ്റഗറി ചിത്രം',
    },
    'admin.cat.create': {
      en: 'Create Category',
      ta: 'வகை உருவாக்க',
      hi: 'श्रेणी बनाएं',
      ml: 'കാറ്റഗറി ഉണ്ടാക്കുക',
    },
    'admin.cat.update': {
      en: 'Update Category',
      ta: 'வகை புதுப்பிக்க',
      hi: 'श्रेणी अद्यतन करें',
      ml: 'കാറ്റഗറി പുതുക്കുക',
    },
  };

  t(key: string): string {
    const entry = this.translations[key];
    if (!entry) return key;
    return entry[this.currentLang()] || entry['en'] || key;
  }
}
