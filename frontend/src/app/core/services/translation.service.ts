import { Injectable, signal, computed } from '@angular/core';

export type SupportedLang = 'en' | 'ta' | 'hi' | 'ml';

export interface LangOption {
  code: SupportedLang;
  label: string;
  native: string;
}

export const SUPPORTED_LANGS: LangOption[] = [
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<SupportedLang>('ta');

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('wf_lang') as SupportedLang;
      if (saved && ['en', 'ta', 'hi', 'ml'].includes(saved)) {
        this.currentLang.set(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      } else {
        this.currentLang.set('ta');
        if (typeof document !== 'undefined') {
          document.documentElement.lang = 'ta';
        }
      }
    }
  }

  setLanguage(lang: SupportedLang) {
    this.currentLang.set(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('wf_lang', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  private translations: Record<string, Record<SupportedLang, string>> = {
    // Brand & Hero
    'brand.name': {
      en: 'Thirumala Catering Service',
      ta: 'திருமலா கேட்டரிங் சர்வீஸ்',
      hi: 'तिरुमाला कैटरिंग सर्विस',
      ml: 'തിരുമല കാറ്ററിംഗ് സർവീസ്',
    },
    'brand.tagline': {
      en: 'Royal Wedding & Banquet Catering Excellence',
      ta: 'அரச திருமண விருந்து உபசரிப்பு & மதிப்பீடு',
      hi: 'शाही विवाह खानपान एवं लागत अनुमान',
      ml: 'രാജകീയ വിവാഹ കാറ്ററിംഗും വിരുന്ന് എസ്റ്റിമേഷനും',
    },
    // Footer & Headquarters Addresses
    'footer.addressHeading': {
      en: 'Culinary Headquarters & Catering Contact:',
      ta: 'தலைமையகம் & கேட்டரிங் தொடர்பு முகவரி:',
      hi: 'प्रधान कार्यालय एवं खानपान संपर्क:',
      ml: 'ഹെഡ്ക്വാർട്ടേഴ്സ് & കാറ്ററിംഗ് കോൺടാക്ട്:',
    },
    'footer.branch1Title': {
      en: 'Headquarters (Tirukoilur)',
      ta: 'தலைமையகம் (திருக்கோவிலூர்)',
      hi: 'प्रधान कार्यालय (तिरुकोइलूर)',
      ml: 'ഹെഡ്ക്വാർട്ടേഴ്സ് (തിരുക്കോയിലൂർ)',
    },
    'footer.address1': {
      en: 'No. 73, Mandhaikaara Street, Tirukoilur - 607201',
      ta: 'எண். 73, மந்தைக்காரத் தெரு, திருக்கோவிலூர் - 607201',
      hi: 'नं. 73, मंधैकारा स्ट्रीट, तिरुकोइलूर - 607201',
      ml: 'നം. 73, മന്ദൈക്കാര സ്ട്രീറ്റ്, തിരുക്കോയിലൂർ - 607201',
    },
    'footer.branch2Title': {
      en: 'Chennai Branch (Sowcarpet)',
      ta: 'சென்னை கிளை (சௌகார்பேட்டை)',
      hi: 'चेन्नई शाखा (साहुकारपेट)',
      ml: 'ചെന്നൈ ശാഖ (സൗകാർപേട്ട്)',
    },
    'footer.address2': {
      en: 'No. 5, Krishnappa Agraharam Street, Sowcarpet, Chennai - 600079',
      ta: 'எண். 5, கிருஷ்ணப்பா அக்ரஹாரம் தெரு, சௌகார்பேட்டை, சென்னை - 600079',
      hi: 'नं. 5, कृष्णप्पा अग्रहारम स्ट्रीट, साहुकारपेट, चेन्नई - 600079',
      ml: 'നം. 5, കൃഷ്ണപ്പ അഗ്രഹാരം സ്ട്രീറ്റ്, സൗകാർപേട്ട്, ചെന്നൈ - 600079',
    },
    'footer.tagline': {
      en: 'Royal Wedding Catering, Heirloom Cuisine & Real-Time Estimation Platform.',
      ta: 'பாரம்பரிய அரச திருமண விருந்து உபசரிப்பு மற்றும் நிகழ்நேர மதிப்பீட்டு தளம்.',
      hi: 'शाही विवाह खानपान, पारंपरिक व्यंजन और वास्तविक समय लागत अनुमान प्लेटफ़ॉर्म।',
      ml: 'രാജകീയ വിവാഹ കാറ്ററിംഗും വിരുന്ന് എസ്റ്റിമേഷൻ പ്ലാറ്റ്‌ഫോമും.',
    },
    'footer.conciergeTitle': {
      en: 'Direct Catering Concierge',
      ta: 'நேரடி கேட்டரிங் உதவி மையம்',
      hi: 'प्रत्यक्ष खानपान सहायता केंद्र',
      ml: 'ഡയറക്ട് കാറ്ററിംഗ് ഹെൽപ്പ് ഡെസ്ക്',
    },
    'footer.conciergeDesc': {
      en: 'Have custom menu queries, tasting session requests, or live counter suggestions?',
      ta: 'சிறப்பு மெனு, உணவு சுவைத்தல் அல்லது நேரலை கவுண்ட்டர்கள் பற்றிய சந்தேகங்களுக்கு வாட்ஸ்அப்பில் அழைக்கவும்.',
      hi: 'कस्टम मेन्यू, चखने का सत्र या लाइव काउंटर संबंधी पूछताछ के लिए व्हाट्सएप करें।',
      ml: 'കസ്റ്റം മെനു, ടേസ്റ്റിംഗ് സെഷൻ, ലൈവ് കൗണ്ടറുകൾ എന്നിവയെക്കുറിച്ചുള്ള അന്വേഷണങ്ങൾക്ക് വാട്സാപ്പിൽ ബന്ധപ്പെടുക.',
    },
    'footer.conciergeHours': {
      en: 'Available 7 Days • 9:00 AM – 10:00 PM IST',
      ta: 'வாரத்தின் 7 நாட்களும் • காலை 9:00 – இரவு 10:00 மணி',
      hi: 'सप्ताह के 7 दिन • सुबह 9:00 – रात 10:00 बजे',
      ml: 'എല്ലാ ദിവസവും • രാവിലെ 9:00 – രാത്രി 10:00 വരെ',
    },
    'footer.navTitle': {
      en: 'Platform Navigation',
      ta: 'தள வழிசெலுத்தல்',
      hi: 'प्लेटफ़ॉर्म नेविगेशन',
      ml: 'പ്ലാറ്റ്ഫോം നാവിഗേഷൻ',
    },
    'footer.navMenu': {
      en: 'Curate Catering Feast',
      ta: 'விருந்தை தேர்ந்தெடுக்க',
      hi: 'शाही मेन्यू चुनें',
      ml: 'വിരുന്ന് തിരഞ്ഞെടുക്കുക',
    },
    'footer.navReview': {
      en: 'Review Feast Estimation',
      ta: 'மதிப்பீட்டை சரிபார்க்க',
      hi: 'अनुमानित लागत देखें',
      ml: 'എസ്റ്റിമേഷൻ പരിശോധിക്കുക',
    },
    'footer.navAdmin': {
      en: 'Admin Culinary Studio',
      ta: 'நிர்வாக ஸ்டுடியோ',
      hi: 'एडमिन स्टूडियो',
      ml: 'അഡ്മിൻ സ്റ്റുഡിയോ',
    },
    'footer.copyright': {
      en: '© 2026 Thirumala Catering Service Platform. Built on Cloudflare Workers, Cloudflare D1 & R2 Object Storage.',
      ta: '© 2026 திருமலா கேட்டரிங் சர்வீஸ் தளம். Cloudflare Workers, Cloudflare D1 & R2-ல் உருவாக்கப்பட்டது.',
      hi: '© 2026 तिरुमाला कैटरिंग सर्विस प्लेटफ़ॉर्म। Cloudflare Workers, Cloudflare D1 & R2 पर आधारित।',
      ml: '© 2026 തിരുമല കാറ്ററിംഗ് സർവീസ് പ്ലാറ്റ്‌ഫോം. Cloudflare Workers, D1 & R2-ൽ നിർമ്മിച്ചത്.',
    },
    'hero.title': {
      en: 'Curate Your Banquet Feast',
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
      ta: 'மெனு பார்க்க',
      hi: 'मेन्यू देखें',
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
    'event.intro': {
      en: 'Tailor your guest count, celebration dates, and banquet venue for accurate real-time catering estimations.',
      ta: 'துல்லியமான நேரலை திருமண உணவு மதிப்பீட்டிற்கு உங்கள் விருந்தினர் எண்ணிக்கை, தேதி மற்றும் மண்டபத்தை பதிவு செய்க.',
      hi: 'सटीक वास्तविक समय कैटरिंग बजट के लिए अपने अतिथियों की संख्या, तिथि और विवाह स्थल दर्ज करें।',
      ml: 'കൃത്യമായ എസ്റ്റിമേറ്റിനായി അതിഥികളുടെ എണ്ണവും തീയതിയും വേദിയും നൽകുക.',
    },
    'event.saveBtn': {
      en: 'Update Celebration Details',
      ta: 'நிகழ்வு விவரங்களைச் சேமி',
      hi: 'समारोह विवरण सहेजें',
      ml: 'വിവരങ്ങൾ സേവ് ചെയ്യുക',
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
    'menu.searchPlaceholder': {
      en: 'Search appetizers, idly, vada, gravies, biryani, desserts...',
      ta: 'உணவுகள், இட்லி, வடை, பிரியாணி, இனிப்புகளை தேடுக...',
      hi: 'व्यंजन, इडली, वड़ा, बिरयानी, मिठाइयां खोजें...',
      ml: 'വിഭവങ്ങൾ, ഇഡ്ഡലി, വട, ബിരിയാണി, മധുരപലഹാരങ്ങൾ തിരയുക...',
    },
    'receipt.dishesSelected': {
      en: 'Dishes Selected',
      ta: 'உணவுகள் தேர்ந்தெடுக்கப்பட்டுள்ளன',
      hi: 'व्यंजन चुने गए',
      ml: 'വിഭവങ്ങൾ തിരഞ്ഞെടുത്തു',
    },
    'receipt.clearAll': {
      en: 'Clear All',
      ta: 'அனைத்தையும் நீக்கு',
      hi: 'सभी हटाएं',
      ml: 'എല്ലാം മാറ്റുക',
    },
    'receipt.emptyTrayTitle': {
      en: 'Your feast tray is currently empty.',
      ta: 'உங்கள் விருந்துத் தட்டு காலியாக உள்ளது.',
      hi: 'आपकी थाली अभी खाली है।',
      ml: 'നിങ്ങളുടെ വിരുന്ന് തട്ട് ഇപ്പോൾ ശൂന്യമാണ്.',
    },
    'receipt.emptyTrayDesc': {
      en: 'Tap + Add to Feast on any dish to generate your live wedding estimate.',
      ta: 'நேரடி விலை மதிப்பீட்டைக் காண ஏதேனும் உணவில் + விருந்தில் சேர் என்பதை அழுத்தவும்.',
      hi: 'अनुमानित लागत देखने के लिए किसी भी व्यंजन को थाली में जोड़ें।',
      ml: 'തത്സമയ ബജറ്റ് കണക്കാക്കാൻ വിഭവങ്ങൾ ചേർക്കുക.',
    },
    'menu.noMatches': {
      en: 'No matching dishes found',
      ta: 'பொருந்தும் உணவுகள் எதுவும் கிடைக்கவில்லை',
      hi: 'कोई मेल खाता व्यंजन नहीं मिला',
      ml: 'യോജിച്ച വിഭവങ്ങളൊന്നും കണ്ടെത്തിയില്ല',
    },
    'menu.noMatchesHint': {
      en: 'Try clearing your dietary filter or search query.',
      ta: 'தேடல் அல்லது உணவு வகை வடிப்பானை மாற்றி முயற்சிக்கவும்.',
      hi: 'फ़िल्टर या खोज बदलकर पुनः प्रयास करें।',
      ml: 'ഫിൽട്ടറോ തിരയലോ മാറ്റി ശ്രമിക്കുക.',
    },
    'dishModal.ratePerGuest': {
      en: 'Rate Per Guest',
      ta: 'ஒரு விருந்தினருக்கான விலை',
      hi: 'प्रति अतिथि दर',
      ml: 'ഒരാൾക്കുള്ള നിരക്ക്',
    },
    'dishModal.loadingIngredients': {
      en: 'Retrieving culinary composition...',
      ta: 'சமையல் பொருட்கள் ஏற்றப்படுகிறது...',
      hi: 'सामग्री विवरण लाया जा रहा है...',
      ml: 'ചേരുവകൾ ശേഖരിക്കുന്നു...',
    },
    'dishModal.heirloomNote': {
      en: 'Authentic heirloom preparation with organic farm spices and desi ghee.',
      ta: 'தூய பசு நெய் மற்றும் நறுமண மசாலாக்களுடன் பாரம்பரிய முறையில் தயாரிக்கப்பட்டது.',
      hi: 'शुद्ध देशी घी और प्रामाणिक मसालों से तैयार पारंपरिक व्यंजन।',
      ml: 'ശുദ്ധമായ നെയ്യും സുഗന്ധവ്യഞ്ജനങ്ങളും ചേർത്ത പരമ്പരാഗത വിഭവം.',
    },
    'proposal.crestTitle': {
      en: 'Thirumala Catering Service Menu',
      ta: 'திருமலா கேட்டரிங் திருமண மெனு',
      hi: 'तिरुमाला कैटरिंग मेन्यू',
      ml: 'തിരുമല കാറ്ററിംഗ് മെനു',
    },
    'proposal.crestQuote': {
      en: '"May this celebration of culinary mastery nourish eternal love and joy."',
      ta: '"அன்பும் சுவையும் நிறைந்து வாழ்வு வளம்பெற எங்கள் மனமார்ந்த நல்வாழ்த்துகள்."',
      hi: '"यह स्वाद और परंपरा का उत्सव आपके जीवन में प्रेम और खुशियाँ लाए।"',
      ml: '"സ്നേഹവും സന്തോഷവും നിറഞ്ഞ നല്ലൊരു വിവാഹ ജീവിതം ആശംസിക്കുന്നു."',
    },
    'proposal.emptyTitle': {
      en: 'No dishes selected yet',
      ta: 'உணவுகள் எதுவும் இன்னும் தேர்ந்தெடுக்கப்படவில்லை',
      hi: 'अभी कोई व्यंजन नहीं चुना गया',
      ml: 'വിഭവങ്ങളൊന്നും തിരഞ്ഞെടുത്തിട്ടില്ല',
    },
    'proposal.emptyDesc': {
      en: 'Please return to our menu curation and select your favorite royal feast items.',
      ta: 'மெனு பக்கத்திற்கு சென்று உங்களுக்கு பிடித்த உணவு வகைகளைத் தேர்ந்தெடுக்கவும்.',
      hi: 'कृपया मेन्यू में जाकर अपने पसंदीदा शाही व्यंजन चुनें।',
      ml: 'ദയവായി മെനുവിൽ പോയി നിങ്ങളുടെ പ്രിയപ്പെട്ട വിഭവങ്ങൾ തിരഞ്ഞെടുക്കുക.',
    },
    'proposal.curateBtn': {
      en: 'Curate Menu Now',
      ta: 'மெனுவைத் தேர்ந்தெடுக்கவும்',
      hi: 'अभी मेन्यू चुनें',
      ml: 'മെനു തിരഞ്ഞെടുക്കുക',
    },
    'proposal.tastingNotes': {
      en: 'Tasting Notes:',
      ta: 'சுவை குறிப்பு:',
      hi: 'स्वाद विवरण:',
      ml: 'വിഭവ വിവരണം:',
    },
    'proposal.portionPerGuest': {
      en: 'Portion per Guest',
      ta: 'ஒரு விருந்தினருக்கான அளவு',
      hi: 'प्रति अतिथि मात्रा',
      ml: 'ഒരാൾക്കുള്ള അളവ്',
    },
    'proposal.specialInstructionsTitle': {
      en: 'Special Culinary Instructions',
      ta: 'சிறப்பு சமையல் & உபசரிப்பு குறிப்புகள்',
      hi: 'विशेष खानपान निर्देश',
      ml: 'പ്രത്യേക പാചക നിർദ്ദേശങ്ങൾ',
    },
    'proposal.specialInstructionsPlaceholder': {
      en: 'Mention specific spice requirements, Jain portions, live counter arrangements or custom dietary requirements...',
      ta: 'கார அளவு, ஜெயின் உணவுகள், லைவ் கவுண்டர் அல்லது பிற தனிப்பட்ட தேவைகளைக் குறிப்பிடவும்...',
      hi: 'मसाले की मात्रा, जैन भोजन, लाइव काउंटर या अन्य विशेष आवश्यकताएं यहाँ लिखें...',
      ml: 'എരിവിന്റെ അളവ്, ജൈൻ ഭക്ഷണം, ലൈവ് കൗണ്ടർ എന്നിവ ഇവിടെ വ്യക്തമാക്കുക...',
    },
    'proposal.yourEstimation': {
      en: 'Your Estimation',
      ta: 'உங்கள் கட்டண மதிப்பீடு',
      hi: 'आपका अनुमानित बजट',
      ml: 'നിങ്ങളുടെ എസ്റ്റിമേറ്റ്',
    },
    'proposal.interactiveAction': {
      en: 'Interactive Primary Action',
      ta: 'முக்கிய நடவடிக்கை',
      hi: 'प्राथमिक कार्रवाई',
      ml: 'പ്രധാന നടപടി',
    },
    'proposal.waTitle': {
      en: 'Have Queries or Suggestions?',
      ta: 'ஏதேனும் கேள்விகள் அல்லது தேவைகள் உள்ளதா?',
      hi: 'कोई सवाल या सुझाव?',
      ml: 'എന്തെങ്കിലും സംശയങ്ങളുണ്ടോ?',
    },
    'proposal.waSubtitle': {
      en: 'Chat directly with Banquet Concierge',
      ta: 'எங்கள் சமையல் மேலாளருடன் நேரடியாக பேசவும்',
      hi: 'बैंक्वेट प्रबंधक से सीधे चैट करें',
      ml: 'വിരുന്ന് മാനേജരുമായി സംസാരിക്കുക',
    },
    'proposal.waDesc': {
      en: 'Need live counters, custom heirloom recipes, or dietary accommodations? Connect on WhatsApp.',
      ta: 'நேரடி சமையல் மேடை, பாரம்பரிய சமையல் குறிப்புகள் அல்லது உணவு தேவைகளுக்கு வாட்ஸ்அப்பில் தொடர்பு கொள்ளவும்.',
      hi: 'लाइव काउंटर, पारंपरिक रेसिपी या विशेष व्यवस्था के लिए व्हाट्सएप पर संपर्क करें।',
      ml: 'ലൈവ് കൗണ്ടറുകൾ, പ്രത്യേക വിഭവങ്ങൾ എന്നിവയ്ക്കായി വാട്സാപ്പിൽ ബന്ധപ്പെടുക.',
    },
    'proposal.waBtn': {
      en: 'Chat on WhatsApp (+91 72998 87725)',
      ta: 'வாட்ஸ்அப்பில் தொடர்புகொள்ள (+91 72998 87725)',
      hi: 'व्हाट्सएप पर चैट करें (+91 72998 87725)',
      ml: 'വാട്സാപ്പിൽ ചാറ്റ് ചെയ്യുക (+91 72998 87725)',
    },
    'calc.costForGuests': {
      en: 'Cost',
      ta: 'செலவு',
      hi: 'लागत',
      ml: 'ചെലവ്',
    },
    'dialog.regalTitle': {
      en: '✦ Regal Feast Catering Reservation ✦',
      ta: '✦ பிரம்மாண்ட திருமண விருந்து முன்பதிவு ✦',
      hi: '✦ शाही विवाह दावत आरक्षण ✦',
      ml: '✦ രാജകീയ വിവാഹ വിരുന്ന് ബുക്കിംഗ് ✦',
    },
    'dialog.venueTitle': {
      en: 'Provide Contact & Banquet Venue Address',
      ta: 'தொடர்பு விவரங்கள் & மண்டப முகவரியை பதிவு செய்க',
      hi: 'संपर्क एवं विवाह स्थल का पता दर्ज करें',
      ml: 'ബന്ധപ്പെടേണ്ട വിവരങ്ങളും വിലാസവും നൽകുക',
    },
    'dialog.venueIntro': {
      en: 'Please confirm your contact details and banquet venue address so our catering service fleet and culinary team can coordinate your feast flawlessly.',
      ta: 'எங்கள் சமையல் குழுவினர் விருந்தை சிறப்புடன் வழங்க உங்கள் தொடர்பு விவரங்களையும் திருமண மண்டப முகவரியையும் சரிபார்க்கவும்.',
      hi: 'कृपया अपना संपर्क विवरण और स्थल का पता सत्यापित करें ताकि हमारी टीम समय पर उत्कृष्ट सेवा दे सके।',
      ml: 'നിങ്ങളുടെ ബന്ധപ്പെടേണ്ട വിവരങ്ങളും കല്യാണ മണ്ഡപ വിലാസവും നൽകുക.',
    },
    'dialog.fullName': {
      en: 'Customer / Host Full Name *',
      ta: 'வாடிக்கையாளர் / விழா அமைப்பாளர் பெயர் *',
      hi: 'ग्राहक / मेज़बान का पूरा नाम *',
      ml: 'ഉപഭോക്താവിന്റെ / ആതിഥേയന്റെ പേര് *',
    },
    'dialog.phone': {
      en: 'Contact Phone Number *',
      ta: 'தொடர்பு தொலைபேசி எண் *',
      hi: 'संपर्क फ़ोन नंबर *',
      ml: 'ഫോൺ നമ്പർ *',
    },
    'dialog.email': {
      en: 'Email Address',
      ta: 'மின்னஞ்சல் முகவரி',
      hi: 'ईमेल पता',
      ml: 'ഇമെയിൽ വിലാസം',
    },
    'dialog.eventType': {
      en: 'Celebration Event Type',
      ta: 'விழா வகை',
      hi: 'समारोह का प्रकार',
      ml: 'വിശേഷ പരിപാടിയുടെ തരം',
    },
    'dialog.eventDate': {
      en: 'Event Date',
      ta: 'விழா தேதி',
      hi: 'समारोह की तारीख',
      ml: 'പരിപാടിയുടെ തീയതി',
    },
    'dialog.guestCount': {
      en: 'Guest Count',
      ta: 'விருந்தினர் எண்ணிக்கை',
      hi: 'अतिथियों की संख्या',
      ml: 'അതിഥികളുടെ എണ്ണം',
    },
    'dialog.venueAddress': {
      en: 'Banquet Venue & Full Delivery Street Address *',
      ta: 'மண்டபத்தின் பெயர் மற்றும் முழு முகவரி *',
      hi: 'विवाह स्थल एवं डिलीवरी का पूरा पता *',
      ml: 'കല്യാണ മണ്ഡപത്തിന്റെ പേരും വിലാസവും *',
    },
    'dialog.dietNotes': {
      en: 'Special Culinary Requests / Dietary Notes (Optional)',
      ta: 'சிறப்பு சமையல் குறிப்புகள் / உணவு கட்டுப்பாடுகள் (விருப்பத்திற்கேற்ப)',
      hi: 'विशेष खानपान अनुरोध (वैकल्पिक)',
      ml: 'പ്രത്യേക പാചക നിർദ്ദേശങ്ങൾ (വേണമെങ്കിൽ)',
    },
    'dialog.backToReview': {
      en: 'Back to Review',
      ta: 'மீண்டும் சரிபார்க்க',
      hi: 'समीक्षा पर वापस जाएँ',
      ml: 'തിരികെ പോവുക',
    },
    'dialog.confirmBtn': {
      en: 'Confirm & Lock Feast Booking',
      ta: 'விருந்து முன்பதிவை உறுதி செய்க',
      hi: 'दावत बुकिंग पक्की करें',
      ml: 'വിരുന്ന് ബുക്കിംഗ് ഉറപ്പാക്കുക',
    },
    'dialog.confirming': {
      en: 'Confirming Feast...',
      ta: 'உறுதி செய்யப்படுகிறது...',
      hi: 'पुष्टि की जा रही है...',
      ml: 'സ്ഥിരീകരിക്കുന്നു...',
    },
    'success.title': {
      en: 'Regal Feast Reserved',
      ta: 'அரச திருமண விருந்து முன்பதிவு செய்யப்பட்டது',
      hi: 'शाही दावत आरक्षित हो गई',
      ml: 'വിരുന്ന് ബുക്കിംഗ് വിജയകരം',
    },
    'success.refIntro': {
      en: 'Your wedding catering order has been registered in the database with reference ID:',
      ta: 'உங்கள் திருமண உணவு முன்பதிவு வெற்றிகரமாக பதிவு செய்யப்பட்டது. குறிப்பு எண்:',
      hi: 'आपका ऑर्डर संदर्भ आईडी के साथ सफलतापूर्वक दर्ज कर लिया गया है:',
      ml: 'നിങ്ങളുടെ ഓർഡർ റഫറൻസ് ഐഡി:',
    },
    'success.host': {
      en: 'Host',
      ta: 'விழா அமைப்பாளர்',
      hi: 'मेज़बान',
      ml: 'ആതിഥേയൻ',
    },
    'success.venue': {
      en: 'Venue',
      ta: 'மண்டபம்',
      hi: 'स्थल',
      ml: 'സ്ഥലം',
    },
    'success.notifyWa': {
      en: 'Notify Concierge on WhatsApp',
      ta: 'வாட்ஸ்அப்பில் மேலாளருக்கு தெரிவிக்கவும்',
      hi: 'व्हाट्सएप पर सूचित करें',
      ml: 'വാട്സാപ്പിൽ അറിയിക്കുക',
    },
    'success.curateAnother': {
      en: 'Curate Another Feast',
      ta: 'மற்றொரு விருந்தை தேர்ந்தெடுக்க',
      hi: 'एक और मेन्यू बनाएं',
      ml: 'മറ്റൊരു വിരുന്ന് തിരഞ്ഞെടുക്കുക',
    },
    'eventType.reception': {
      en: 'Wedding Reception',
      ta: 'திருமண வரவேற்பு',
      hi: 'विवाह रिसेप्शन',
      ml: 'വിവാഹ സൽക്കാരം',
    },
    'eventType.muhurtham': {
      en: 'Traditional Muhurtham',
      ta: 'பாரம்பரிய முகூர்த்தம்',
      hi: 'पारंपरिक मुहूर्त',
      ml: 'പരമ്പരാഗത മുഹൂർത്തം',
    },
    'eventType.sangeet': {
      en: 'Sangeet & Mehendi',
      ta: 'சங்கீத் & மெஹந்தி',
      hi: 'संगीत एवं मेहंदी',
      ml: 'സംഗീത് & മെഹന്ദി',
    },
    'eventType.engagement': {
      en: 'Engagement Feast',
      ta: 'நிச்சயதார்த்த விருந்து',
      hi: 'சगाई भोज',
      ml: 'വിവാഹനിശ്ചയ സദ്യ',
    },
    'eventType.anniversary': {
      en: 'Anniversary Gala',
      ta: 'திருமண நாள் விழா',
      hi: 'वर्षगांठ समारोह',
      ml: 'വിവാഹ വാർഷികം',
    },
    'event.name': {
      en: 'Celebration / Event Name',
      ta: 'விழா / நிகழ்வின் பெயர்',
      hi: 'समारोह का नाम',
      ml: 'ചടങ്ങിന്റെ പേര്',
    },
    'event.cityPincode': {
      en: 'City & Pincode',
      ta: 'நகரம் & அஞ்சல் குறியீடு',
      hi: 'शहर एवं पिनकोड',
      ml: 'നഗരവും പിൻകോഡും',
    },
    'event.waConciergeText': {
      en: 'Our Culinary Concierge is available on WhatsApp at',
      ta: 'எங்கள் சமையல் மேலாளர் வாட்ஸ்அப்பில் தொடர்பில் உள்ளார்:',
      hi: 'हमारे बैंक्वेट प्रबंधक व्हाट्सएप पर उपलब्ध हैं:',
      ml: 'ഞങ്ങളുടെ മാനേജർ വാട്സാപ്പിൽ ലഭ്യമാണ്:',
    },
    'dishModal.ingredientsSubtitle': {
      en: 'Authentic composition scaled for wedding banquet guests',
      ta: 'திருமண விருந்தினர்களுக்கான பிரத்யேக சமையல் சேர்க்கை அளவு',
      hi: 'विवाह भोज के अतिथियों के लिए प्रामाणिक सामग्री संरचना',
      ml: 'വിവാഹ വിരുന്നിനായി കണക്കാക്കിയ ചേരുവകൾ',
    },
    'dishModal.minutes': {
      en: 'mins',
      ta: 'நிமிடங்கள்',
      hi: 'मिनट',
      ml: 'മിനിറ്റ്',
    },
  };

  // Dish Name Translations (mapped by ID and English Name)
  private dishNameMap: Record<string, Record<SupportedLang, string>> = {
    'dish_paneer_tikka': { en: 'Paneer Tikka', ta: 'பன்னீர் டிக்கா', hi: 'पनीर टिक्का', ml: 'പനീർ ടിക്ക' },
    'paneer tikka': { en: 'Paneer Tikka', ta: 'பன்னீர் டிக்கா', hi: 'पनीर टिक्का', ml: 'പനീർ ടിക്ക' },

    'dish_gobi_65': { en: 'Gobi 65', ta: 'கோபி 65', hi: 'गोभी 65', ml: 'ഗോബി 65' },
    'gobi 65': { en: 'Gobi 65', ta: 'கோபி 65', hi: 'गोभी 65', ml: 'ഗോബി 65' },

    'dish_chicken_65': { en: 'Chicken 65', ta: 'சிக்கன் 65', hi: 'चिकन 65', ml: 'ചിക്കൻ 65' },
    'chicken 65': { en: 'Chicken 65', ta: 'சிக்கன் 65', hi: 'चिकन 65', ml: 'ചിക്കൻ 65' },

    'dish_paneer_butter_masala': { en: 'Paneer Butter Masala', ta: 'பன்னீர் பட்டர் மசாலா', hi: 'पनीर बटर मसाला', ml: 'പനീർ ബട്ടർ മസാല' },
    'paneer butter masala': { en: 'Paneer Butter Masala', ta: 'பன்னீர் பட்டர் மசாலா', hi: 'पनीर बटर मसाला', ml: 'പനീർ ബട്ടർ മസാല' },

    'dish_dal_makhani': { en: 'Dal Makhani', ta: 'தால் மக்கானி', hi: 'दाल मखनी', ml: 'ദാൽ മഖ്നി' },
    'dal makhani': { en: 'Dal Makhani', ta: 'தால் மக்கானி', hi: 'दाल मखनी', ml: 'ദാൽ മഖ്നി' },

    'dish_mutton_rogan_josh': { en: 'Mutton Rogan Josh', ta: 'மட்டன் ரோகன் ஜோஷ்', hi: 'मटन रोगन जोश', ml: 'മട്ടൻ റോഗൻ ജോഷ്' },
    'mutton rogan josh': { en: 'Mutton Rogan Josh', ta: 'மட்டன் ரோகன் ஜோஷ்', hi: 'मटन रोगन जोश', ml: 'മട്ടൻ റോഗൻ ജോഷ്' },

    'dish_veg_biryani': { en: 'Vegetable Biryani', ta: 'காய்கறி பிரியாணி', hi: 'वेजिटेबल बिरयानी', ml: 'വെജിറ്റബിൾ ബിരിയാണി' },
    'vegetable biryani': { en: 'Vegetable Biryani', ta: 'காய்கறி பிரியாணி', hi: 'वेजिटेबल बिरयानी', ml: 'വെജിറ്റബിൾ ബിരിയാണി' },

    'dish_chicken_biryani': { en: 'Dum Chicken Biryani', ta: 'தம் சிக்கன் பிரியாணி', hi: 'दम चिकन बिरयानी', ml: 'ദം ചിക്കൻ ബിരിയാണി' },
    'dum chicken biryani': { en: 'Dum Chicken Biryani', ta: 'தம் சிக்கன் பிரியாணி', hi: 'दम चिकन बिरयानी', ml: 'ദം ചിക്കൻ ബിരിയാണി' },

    'dish_butter_naan': { en: 'Butter Naan', ta: 'பட்டர் நான்', hi: 'बटर नान', ml: 'ബട്ടർ നാൻ' },
    'butter naan': { en: 'Butter Naan', ta: 'பட்டர் நான்', hi: 'बटर नान', ml: 'ബട്ടർ നാൻ' },

    'dish_tandoori_roti': { en: 'Tandoori Roti', ta: 'தந்தூரி ரொட்டி', hi: 'तंदूरी रोटी', ml: 'തന്തൂരി റൊട്ടി' },
    'tandoori roti': { en: 'Tandoori Roti', ta: 'தந்தூரி ரொட்டி', hi: 'तंदूरी रोटी', ml: 'തന്തൂരി റൊട്ടി' },

    'dish_gulab_jamun': { en: 'Gulab Jamun', ta: 'குலாப் ஜாமூன்', hi: 'गुलाब जामुन', ml: 'ഗുലാബ് ജാമുൻ' },
    'gulab jamun': { en: 'Gulab Jamun', ta: 'குலாப் ஜாமூன்', hi: 'गुलाब जामुन', ml: 'ഗുലാബ് ജാമുൻ' },

    'dish_rasmalai': { en: 'Rasmalai', ta: 'ரஸ்மலாய்', hi: 'रसमलाई', ml: 'രസമലായ്' },
    'rasmalai': { en: 'Rasmalai', ta: 'ரஸ்மலாய்', hi: 'रसमलाई', ml: 'രസമലായ്' },

    'dish_mango_lassi': { en: 'Mango Lassi', ta: 'மாம்பழ லஸ்ஸி', hi: 'मैंगो लस्सी', ml: 'മാമ്പഴ ലസ്സി' },
    'mango lassi': { en: 'Mango Lassi', ta: 'மாம்பழ லஸ்ஸி', hi: 'मैंगो लस्सी', ml: 'മാമ്പഴ ലസ്സി' },

    'dish_live_chaat': { en: 'Live Chaat Counter', ta: 'நேரடி சாட் கவுண்டர்', hi: 'लाइव चाट काउंटर', ml: 'ലൈവ് ചാറ്റ് കൗണ്ടർ' },
    'live chaat counter': { en: 'Live Chaat Counter', ta: 'நேரடி சாட் கவுண்டர்', hi: 'लाइव चाट काउंटर', ml: 'ലൈവ് ചാറ്റ് കൗണ്ടർ' },

    'dish_kulfi_falooda': { en: 'Kulfi Falooda', ta: 'குல்பி பலூடா', hi: 'कुल्फी फालूदा', ml: 'കുൽഫി ഫലൂദ' },
    'kulfi falooda': { en: 'Kulfi Falooda', ta: 'குல்பி பலூடா', hi: 'कुल्फी फालूदा', ml: 'കുൽഫി ഫലൂദ' },

    'dish_idly': { en: 'Steamed Ghee Podi Idly', ta: 'நெய் பொடி இட்லி', hi: 'घी पोड़ी इडली', ml: 'നെയ്യ് പൊടി ഇഡ്ഡലി' },
    'steamed ghee podi idly': { en: 'Steamed Ghee Podi Idly', ta: 'நெய் பொடி இட்லி', hi: 'घी पोड़ी इडली', ml: 'നെയ്യ് പൊടി ഇഡ്ഡലി' },

    'dish_vada': { en: 'Crisp Medu Vada', ta: 'மெது வடை', hi: 'क्रिस्पी मेदु वड़ा', ml: 'മേദു വട' },
    'crisp medu vada': { en: 'Crisp Medu Vada', ta: 'மெது வடை', hi: 'क्रिस्पी मेदु वड़ा', ml: 'മേദു വട' },

    'dish_dosa': { en: 'Live Ghee Roast Masala Dosa', ta: 'நேரடி நெய் ரோஸ்ட் மசாலா தோசை', hi: 'लाइव घी रोस्ट मसाला डोसा', ml: 'ലൈവ് നെയ്യ് റോസ്റ്റ് ദോശ' },
    'live ghee roast masala dosa': { en: 'Live Ghee Roast Masala Dosa', ta: 'நேரடி நெய் ரோஸ்ட் மசாலா தோசை', hi: 'लाइव घी रोस्ट मसाला डोसा', ml: 'ലൈവ് നെയ്യ് റോസ്റ്റ് ദോശ' },

    'dish_filter_coffee': { en: 'Kumbakonam Degree Filter Coffee', ta: 'கும்பகோணம் டிகிரி பில்டர் காபி', hi: 'कुंभकोणम डिग्री फिल्टर कॉफी', ml: 'കുംഭകോണം ഡിഗ്രി ഫിൽട്ടർ കോഫി' },
    'kumbakonam degree filter coffee': { en: 'Kumbakonam Degree Filter Coffee', ta: 'கும்பகோணம் டிகிரி பில்டர் காபி', hi: 'कुंभकोणम डिग्री फिल्टर कॉफी', ml: 'കുംഭകോണം ഡിഗ്രി ഫിൽട്ടർ കോഫി' },

    'dish_tender_coconut_punch': { en: 'Elaneer Payasam & Tender Coconut Cooler', ta: 'இளநீர் பாயாசம் குளிர் பானம்', hi: 'इलानीर पायसम कूलर', ml: 'ഇളനീർ പായസം കൂളർ' },
    'elaneer payasam & tender coconut cooler': { en: 'Elaneer Payasam & Tender Coconut Cooler', ta: 'இளநீர் பாயாசம் குளிர் பானம்', hi: 'इलानीर पायसम कूलर', ml: 'ഇളനീർ പായസം കൂളർ' },

    'dish_rose_sharbat': { en: 'Shahi Gulab Saffron Sherbat', ta: 'ரோஸ் குங்குமப்பூ சர்பத்', hi: 'शाही गुलाब केसर शरबत', ml: 'റോസ് കുങ്കുമപ്പൂ സർബത്ത്' },
    'shahi gulab saffron sherbat': { en: 'Shahi Gulab Saffron Sherbat', ta: 'ரோஸ் குங்குமப்பூ சர்பத்', hi: 'शाही गुलाब केसर शरबत', ml: 'റോസ് കുങ്കുമപ്പൂ സർബത്ത്' },

    'dish_kokum_cooler': { en: 'Spiced Kokum & Cumin Cooler', ta: 'கோகம் சீரக கூலர்', hi: 'कोकम जीरा कूलर', ml: 'കൊകം ജീരക കൂളർ' },
    'spiced kokum & cumin cooler': { en: 'Spiced Kokum & Cumin Cooler', ta: 'கோகம் சீரக கூலர்', hi: 'कोकम जीरा कूलर', ml: 'കൊകം ജീരക കൂളർ' },

    'dish_hara_bhara_kabab': { en: 'Shahi Hara Bhara Kabab', ta: 'ஹரா பரா கபாப்', hi: 'शाही हरा भरा कबाब', ml: 'ഹരാ ഭരാ കബാബ്' },
    'shahi hara bhara kabab': { en: 'Shahi Hara Bhara Kabab', ta: 'ஹரா பரா கபாப்', hi: 'शाही हरा भरा कबाब', ml: 'ഹരാ ഭരാ കബാബ്' },

    'dish_spring_rolls': { en: 'Crisp Vegetable Gold Spring Rolls', ta: 'காய்கறி ஸ்பிரிங் ரோல்ஸ்', hi: 'वेजिटेबल स्प्रिंग रोल्स', ml: 'വെജിറ്റബിൾ സ്പ്രിംഗ് റോൾസ്' },
    'crisp vegetable gold spring rolls': { en: 'Crisp Vegetable Gold Spring Rolls', ta: 'காய்கறி ஸ்பிரிங் ரோல்ஸ்', hi: 'वेजिटेबल स्प्रिंग रोल्स', ml: 'വെജിറ്റബിൾ സ്പ്രിംഗ് റോൾസ്' },

    'dish_malai_tikka': { en: 'Murgh Malai Tikka', ta: 'முர்க் மலை டிக்கா', hi: 'मुर्ग मलाई टिक्का', ml: 'മുർഗ് മലായ് ടിക്ക' },
    'murgh malai tikka': { en: 'Murgh Malai Tikka', ta: 'முர்க் மலை டிக்கா', hi: 'मुर्ग मलाई टिक्का', ml: 'മുർഗ് മലായ് ടിക്ക' },

    'dish_fish_amritsari': { en: 'Crispy Amritsari Fish Fry', ta: 'அமிர்தசரஸ் மீன் வறுவல்', hi: 'अमृतसरी फिश फ्राई', ml: 'അമൃത്സറി ഫിഷ് ഫ്രൈ' },
    'crispy amritsari fish fry': { en: 'Crispy Amritsari Fish Fry', ta: 'அமிர்தசரஸ் மீன் வறுவல்', hi: 'अमृतसरी फिश फ्राई', ml: 'അമൃത്സറി ഫിഷ് ഫ്രൈ' },

    'dish_bisibelebath': { en: 'Mysore Ghee Bisibelebath', ta: 'மைசூர் நெய் பிசிபேளேபாத்', hi: 'मैसूर घी बिसीबेलेभात', ml: 'മൈസൂർ നെയ്യ് ബിസിബെളെബാത്ത്' },
    'mysore ghee bisibelebath': { en: 'Mysore Ghee Bisibelebath', ta: 'மைசூர் நெய் பிசிபேளேபாத்', hi: 'मैसूर घी बिसीबेलेभात', ml: 'മൈസൂർ നെയ്യ് ബിസിബെളെബാത്ത്' },

    'dish_avial': { en: 'Malabar Coconut Milk Avial', ta: 'மலபார் தேங்காய்ப்பால் அவியல்', hi: 'मालाबार नारियल अवियल', ml: 'മലബാർ തേങ്ങാപ്പാൽ അവിയൽ' },
    'malabar coconut milk avial': { en: 'Malabar Coconut Milk Avial', ta: 'மலபார் தேங்காய்ப்பால் அவியல்', hi: 'मालाबार नारियल अवियल', ml: 'മലബാർ തേങ്ങാപ്പാൽ അവിയൽ' },

    'dish_chettinad_chicken': { en: 'Chettinad Pepper Chicken Fry', ta: 'செட்டிநாடு பெப்பர் சிக்கன் வறுவல்', hi: 'चेत्तिनाड पेपर चिकन फ्राई', ml: 'ചെട്ടിനാട് പെപ്പർ ചിക്കൻ ഫ്രൈ' },
    'chettinad pepper chicken fry': { en: 'Chettinad Pepper Chicken Fry', ta: 'செட்டிநாடு பெப்பர் சிக்கன் வறுவல்', hi: 'चेत्तिनाड पेपर चिकन फ्राई', ml: 'ചെട്ടിനാട് പെപ്പർ ചിക്കൻ ഫ്രൈ' },

    'dish_mutton_sukka': { en: 'Madurai Mutton Chukka Varuval', ta: 'மதுரை மட்டன் சுக்கா வறுவல்', hi: 'मदुरै मटन चुक्का', ml: 'മധുര മട്ടൻ ചുക്ക വറുവൽ' },
    'madurai mutton chukka varuval': { en: 'Madurai Mutton Chukka Varuval', ta: 'மதுரை மட்டன் சுக்கா வறுவல்', hi: 'मदुरै मटन चुक्का', ml: 'മധുര മട്ടൻ ചുക്ക വറുവൽ' },

    'dish_live_jalebi': { en: 'Live Crisp Kesar Jalebi with Rabdi', ta: 'சூடான நேரடி ரப்ரி ஜிலேபி', hi: 'लाइव क्रिस्प केसर जलेबी', ml: 'ലൈവ് ക്രിസ്പ് ജിലേബി റബ്ഡി' },
    'live crisp kesar jalebi with rabdi': { en: 'Live Crisp Kesar Jalebi with Rabdi', ta: 'சூடான நேரடி ரப்ரி ஜிலேபி', hi: 'लाइव क्रिस्प केसर जलेबी', ml: 'ലൈവ് ക്രിസ്പ് ജിലേബി റബ്ഡി' },

    'dish_live_pasta': { en: 'Live Gourmet Pasta Counter', ta: 'நேரடி பாஸ்தா அரங்கு', hi: 'लाइव पास्ता काउंटर', ml: 'ലൈവ് പാസ്ത കൗണ്ടർ' },
    'live gourmet pasta counter': { en: 'Live Gourmet Pasta Counter', ta: 'நேரடி பாஸ்தா அரங்கு', hi: 'लाइव पास्ता काउंटर', ml: 'ലൈവ് പാസ്ത കൗണ്ടർ' },

    'dish_kadhai_paneer': { en: 'Kadhai Paneer Peshawari', ta: 'கடாய் பன்னீர்', hi: 'कड़ाही पनीर', ml: 'കടായ് പനീർ' },
    'kadhai paneer peshawari': { en: 'Kadhai Paneer Peshawari', ta: 'கடாய் பன்னீர்', hi: 'कड़ाही पनीर', ml: 'കടായ് പനീർ' },

    'dish_methi_malai_mutter': { en: 'Methi Malai Mutter', ta: 'மேத்தி மலை மட்டர்', hi: 'मेथी मलाई मटर', ml: 'മേഥി മലായ് മട്ടർ' },
    'methi malai mutter': { en: 'Methi Malai Mutter', ta: 'மேத்தி மலை மட்டர்', hi: 'मेथी मलाई मटर', ml: 'മേഥി മലായ് മട്ടർ' },

    'dish_garlic_naan': { en: 'Charred Garlic & Herb Naan', ta: 'பூண்டு பட்டர் நான்', hi: 'गार्लिक नान', ml: 'ഗാർലിക് നാൻ' },
    'charred garlic & herb naan': { en: 'Charred Garlic & Herb Naan', ta: 'பூண்டு பட்டர் நான்', hi: 'गार्लिक नान', ml: 'ഗാർലിക് നാൻ' },

    'dish_laccha_paratha': { en: 'Crispy Laccha Paratha', ta: 'லச்சா பரோட்டா', hi: 'लच्छा पराठा', ml: 'ലച്ച പൊറോട്ട' },
    'crispy laccha paratha': { en: 'Crispy Laccha Paratha', ta: 'லச்சா பரோட்டா', hi: 'लच्छा पराठा', ml: 'ലച്ച പൊറോട്ട' },

    'dish_shahi_tukda': { en: 'Royal Awadhi Shahi Tukda', ta: 'அவாதி ஷாஹி துக்டா', hi: 'शाही टुकड़ा', ml: 'ഷാഹി തുക്ഡ' },
    'royal awadhi shahi tukda': { en: 'Royal Awadhi Shahi Tukda', ta: 'அவாதி ஷாஹி துக்டா', hi: 'शाही टुकड़ा', ml: 'ഷാഹി തുക്ഡ' },

    'dish_moong_dal_halwa': { en: 'Pure Ghee Moong Dal Halwa', ta: 'தூய நெய் பாசிப்பருப்பு அல்வா', hi: 'मूँग दाल हलवा', ml: 'മൂങ് ദാൽ ഹൽവ' },
    'pure ghee moong dal halwa': { en: 'Pure Ghee Moong Dal Halwa', ta: 'தூய நெய் பாசிப்பருப்பு அல்வா', hi: 'मूँग दाल हलवा', ml: 'മൂങ് ദാൽ ഹൽവ' },

    'dish_mysore_pak': { en: 'Royal Melt-in-Mouth Ghee Mysore Pak', ta: 'நெய் மைசூர் பாக்', hi: 'शाही मैसूर पाक', ml: 'നെയ്യ് മൈസൂർ പാക്ക്' },
    'royal melt-in-mouth ghee mysore pak': { en: 'Royal Melt-in-Mouth Ghee Mysore Pak', ta: 'நெய் மைசூர் பாக்', hi: 'शाही मैसूर पाक', ml: 'നെയ്യ് മൈസൂർ പാക്ക്' },

    'dish_banarasi_paan': { en: 'Shahi Banarasi Meetha Paan', ta: 'பனாரசி மீத்தா பான்', hi: 'शाही बनारसी मीठा पान', ml: 'ബനാറസി മീഠാ പാൻ' },
    'shahi banarasi meetha paan': { en: 'Shahi Banarasi Meetha Paan', ta: 'பனாரசி மீத்தா பான்', hi: 'शाही बनारसी मीठा पान', ml: 'ബനാറസി മീഠാ പാൻ' },
  };

  // Dish Description Translations
  private dishDescMap: Record<string, Record<SupportedLang, string>> = {
    'dish_paneer_tikka': {
      en: 'Tender cubes of malai paneer marinated in royal tandoori spices and charred over charcoal.',
      ta: 'தந்தூரி மசாலா தடவி அடுப்பில் சுடப்பட்ட மிருதுவான பாலாடைக்கட்டி துண்டுகள்.',
      hi: 'शाही तंदूरी मसालों में मैरीनेट किया हुआ कोयले पर भुना ताज़ा मलाई पनीर।',
      ml: 'തന്തൂരി മസാലയിൽ പാകപ്പെടുത്തി ചുട്ടെടുത്ത സോഫ്റ്റ് പനീർ കഷണങ്ങൾ.',
    },
    'paneer tikka': {
      en: 'Tender cubes of malai paneer marinated in royal tandoori spices and charred over charcoal.',
      ta: 'தந்தூரி மசாலா தடவி அடுப்பில் சுடப்பட்ட மிருதுவான பாலாடைக்கட்டி துண்டுகள்.',
      hi: 'शाही तंदूरी मसालों में मैरीनेट किया हुआ कोयले पर भुना ताज़ा मलाई पनीर।',
      ml: 'തന്തൂരി മസാലയിൽ പാകപ്പെടുത്തി ചുട്ടെടുത്ത സോഫ്റ്റ് പനീർ കഷണങ്ങൾ.',
    },
    'dish_gobi_65': {
      en: 'Crispy cauliflower florets tossed with curry leaves, crushed pepper and southern spices.',
      ta: 'கருவேப்பிலை மற்றும் நறுமண மசாலாக்களுடன் பொன்னிறமாக வறுத்த காலிஃபிளவர்.',
      hi: 'कढ़ी पत्ता और दक्षिणी मसालों के साथ कुरकुरा तला हुआ गोभी।',
      ml: 'കറിവേപ്പിലയും കുരുമുളകും ചേർത്ത് മൊരിയിച്ച കോളിഫ്ലവർ.',
    },
    'dish_chicken_65': {
      en: 'Spicy, deep-fried chicken cubes bursting with red chili, ginger, garlic and fragrant curry leaves.',
      ta: 'காரசாரமான தென்னிந்திய சுவையில் பொறிக்கப்பட்ட கோழித் துண்டுகள்.',
      hi: 'लाल मिर्च, अदरक-लहसुन और कढ़ी पत्ते से भरपूर मसालेदार चिकन 65।',
      ml: 'എരിവും രുചിയും നിറഞ്ഞ തെക്കൻ രീതിയിലുള്ള ചിക്കൻ 65.',
    },
    'dish_paneer_butter_masala': {
      en: 'Rich and creamy paneer cooked in velvety tomato gravy with cashews, butter and kasuri methi.',
      ta: 'வெண்ணெய், முந்திரி மற்றும் தக்காளி கிரேவியில் சமைக்கப்பட்ட மென்மையான பன்னீர்.',
      hi: 'मक्खन, काजू और टमाटर की मखमली ग्रेवी में पका हुआ शाही पनीर।',
      ml: 'വെണ്ണയും കശുവണ്ടിയും തക്കാളി ഗ്രേവിയും ചേർത്ത സ്വാദിഷ്ടമായ പനീർ കറി.',
    },
    'dish_veg_biryani': {
      en: 'Fragrant aged Basmati rice layered with garden fresh vegetables, saffron milk and shahi spices.',
      ta: 'குங்குமப்பூ பால் மற்றும் நறுமண மசாலாக்கள் நிறைந்த பாரம்பரிய காய்கறி பாஸ்மதி பிரியாணி.',
      hi: 'ताज़ी सब्जियों, केसरिया दूध और शाही मसालों से बनी सुगंधित बासमती बिरयानी।',
      ml: 'പച്ചക്കറികളും കുങ്കുമപ്പൂവും സുഗന്ധവ്യഞ്ജനങ്ങളും ചേർത്ത ബാസ്മതി ബിരിയാണി.',
    },
    'dish_chicken_biryani': {
      en: 'Royal Awadhi-style dum biryani with succulent bone-in chicken marinated in yogurt and saffron.',
      ta: 'அரச முறையில் தம் செய்யப்பட்ட சுவையான கோழி பிரியாணி.',
      hi: 'दही और केसर में मैरीनेट किए रसीले चिकन से बनी लजीज अवधी दम बिरयानी।',
      ml: 'തൈരിലും കുങ്കുമപ്പൂവിലും മാരിനേറ്റ് ചെയ്ത ചിക്കൻ കൊണ്ടുള്ള അവധി ദം ബിരിയാണി.',
    },
    'dum chicken biryani': {
      en: 'Royal Awadhi-style dum biryani with succulent bone-in chicken marinated in yogurt and saffron.',
      ta: 'அரச முறையில் தம் செய்யப்பட்ட சுவையான கோழி பிரியாணி.',
      hi: 'दही और केसर में मैरीनेट किए रसीले चिकन से बनी लजीज अवधी दम बिरयानी।',
      ml: 'തൈരിലും കുങ്കുമപ്പൂവിലും മാരിനേറ്റ് ചെയ്ത ചിക്കൻ കൊണ്ടുള്ള അവധി ദം ബിരിയാണി.',
    },
    'dish_dal_makhani': {
      en: 'Slow-cooked black lentils simmered overnight with butter, cream, and aromatic Kashmiri spices.',
      ta: 'வெண்ணெய் மற்றும் கிரீம் சேர்த்து மெதுவாக சமைக்கப்பட்ட பாரம்பரிய கருப்பு உளுந்து தால்.',
      hi: 'मक्खन और मलाई के साथ रात भर धीमी आंच पर पकी कश्मीरी दाल मखनी।',
      ml: 'വെണ്ണയും ക്രീമും ചേർത്ത് പാകം ചെയ്ത രുചികരമായ ദാൽ മഖ്നി.',
    },
    'dal makhani': {
      en: 'Slow-cooked black lentils simmered overnight with butter, cream, and aromatic Kashmiri spices.',
      ta: 'வெண்ணெய் மற்றும் கிரீம் சேர்த்து மெதுவாக சமைக்கப்பட்ட பாரம்பரிய கருப்பு உளுந்து தால்.',
      hi: 'मक्खन और मलाई के साथ रात भर धीमी आंच पर पकी कश्मीरी दाल मखनी।',
      ml: 'വെണ്ണയും ക്രീമും ചേർത്ത് പാകം ചെയ്ത രുചികരമായ ദാൽ മഖ്നി.',
    },
    'dish_mutton_rogan_josh': {
      en: 'Tender lamb cuts slow-braised in a Persian-Kashmiri aromatic gravy of ratan jot, fennel and curd.',
      ta: 'காஷ்மீரி மசாலாக்கள் மற்றும் தயிரில் மெதுவாக வேகவைக்கப்பட்ட மென்மையான ஆட்டிறைச்சி.',
      hi: 'सौंफ, रतनजोत और दही की सुगंधित कश्मीरी ग्रेवी में पका हुआ मटन रोगन जोश।',
      ml: 'കാശ്മീരി മസാലകളിൽ പാകം ചെയ്ത മൃദുവായ മട്ടൻ റോഗൻ ജോഷ്.',
    },
    'mutton rogan josh': {
      en: 'Tender lamb cuts slow-braised in a Persian-Kashmiri aromatic gravy of ratan jot, fennel and curd.',
      ta: 'காஷ்மீரி மசாலாக்கள் மற்றும் தயிரில் மெதுவாக வேகவைக்கப்பட்ட மென்மையான ஆட்டிறைச்சி.',
      hi: 'सौंफ, रतनजोत और दही की सुगंधित कश्मीरी ग्रेवी में पका हुआ मटन रोगन जोश।',
      ml: 'കാശ്മീരി മസാലകളിൽ പാകം ചെയ്ത മൃദുവായ മട്ടൻ റോഗൻ ജോഷ്.',
    },
    'dish_butter_naan': {
      en: 'Traditional leavened clay oven bread brushed generously with pure butter.',
      ta: 'தந்தூரி அடுப்பில் சுடப்பட்டு தூய வெண்ணெய் பூசப்பட்ட மென்மையான நான்.',
      hi: 'मिट्टी के तंदूर में सिंकी और मक्खन लगी मुलायम पारंपरिक रोटी।',
      ml: 'തന്തൂരിൽ ചുട്ടെടുത്ത വെണ്ണ പുരട്ടിയ ബട്ടർ നാൻ.',
    },
    'butter naan': {
      en: 'Traditional leavened clay oven bread brushed generously with pure butter.',
      ta: 'தந்தூரி அடுப்பில் சுடப்பட்டு தூய வெண்ணெய் பூசப்பட்ட மென்மையான நான்.',
      hi: 'मिट्टी के तंदूर में सिंकी और मक्खन लगी मुलायम पारंपरिक रोटी।',
      ml: 'തന്തൂരിൽ ചുട്ടെടുത്ത വെണ്ണ പുരട്ടിയ ബട്ടർ നാൻ.',
    },
    'dish_tandoori_roti': {
      en: 'Whole wheat flatbread blistered crisp and soft directly on clay oven walls.',
      ta: 'பாரம்பரிய களிமண் அடுப்பில் மிருதுவாக சுடப்பட்ட முழு கோதுமை ரொட்டி.',
      hi: 'तंदूर की भट्टी में सिंकी गेहूं की कुरकुरी एवं मुलायम रोटी।',
      ml: 'തന്തൂരിൽ ചുട്ടെടുത്ത ഗോതമ്പ് റൊട്ടി.',
    },
    'tandoori roti': {
      en: 'Whole wheat flatbread blistered crisp and soft directly on clay oven walls.',
      ta: 'பாரம்பரிய களிமண் அடுப்பில் மிருதுவாக சுடப்பட்ட முழு கோதுமை ரொட்டி.',
      hi: 'तंदूर की भट्टी में सिंकी गेहूं की कुरकुरी एवं मुलायम रोटी।',
      ml: 'തന്തൂരിൽ ചുട്ടെടുത്ത ഗോതമ്പ് റൊട്ടി.',
    },
    'dish_gulab_jamun': {
      en: 'Golden fried khoya milk spheres soaked in cardamom and rose water infused sugar syrup.',
      ta: 'ஏலக்காய் மற்றும் ரோஸ் வாட்டர் சர்க்கரை பாகில் ஊறவைத்த பொன்னிற கோவா ஜாமூன்.',
      hi: 'इलायची और गुलाब जल की चाशनी में डूबा शाही खोया गुलाब जामुन।',
      ml: 'ഏലക്കായ് റോസ് സിറപ്പിൽ കുതിർത്ത ഗുലാബ് ജാമുൻ.',
    },
    'gulab jamun': {
      en: 'Golden fried khoya milk spheres soaked in cardamom and rose water infused sugar syrup.',
      ta: 'ஏலக்காய் மற்றும் ரோஸ் வாட்டர் சர்க்கரை பாகில் ஊறவைத்த பொன்னிற கோவா ஜாமூன்.',
      hi: 'इलायची और गुलाब जल की चाशनी में डूबा शाही खोया गुलाब जामुन।',
      ml: 'ഏലക്കായ് റോസ് സിറപ്പിൽ കുതിർത്ത ഗുലാബ് ജാമുൻ.',
    },
    'dish_rasmalai': {
      en: 'Spongy chhena dumplings soaked in thickened saffron-infused pistachio milk.',
      ta: 'குங்குமப்பூ, ஏலக்காய் மற்றும் பிஸ்தா கலந்த கெட்டி பாலில் ஊறவைத்த மென்மையான பன்னீர் உருண்டைகள்.',
      hi: 'केसर, इलायची और पिस्ता युक्त गाढ़े दूध में डूबी स्पंजी रसमलाई।',
      ml: 'കുങ്കുമപ്പൂ പാലിൽ മുക്കിയ സോഫ്റ്റ് രസമലായ്.',
    },
    'rasmalai': {
      en: 'Spongy chhena dumplings soaked in thickened saffron-infused pistachio milk.',
      ta: 'குங்குமப்பூ, ஏலக்காய் மற்றும் பிஸ்தா கலந்த கெட்டி பாலில் ஊறவைத்த மென்மையான பன்னீர் உருண்டைகள்.',
      hi: 'केसर, इलायची और पिस्ता युक्त गाढ़े दूध में डूबी स्पंजी रसमलाई।',
      ml: 'കുങ്കുമപ്പൂ പാലിൽ മുക്കിയ സോഫ്റ്റ് രസമലായ്.',
    },
    'dish_mango_lassi': {
      en: 'Smooth, refreshing blend of sweet Alphonso mangoes and hung curd topped with cardamom.',
      ta: 'அல்போன்சா மாம்பழக்கூழ் மற்றும் கெட்டி தயிர் கொண்டு தயாரிக்கப்பட்ட இனிப்பு லஸ்ஸி.',
      hi: 'अलफांसो आम और गाढ़े दही से बनी ताज़गी भरी मैंगो लस्सी।',
      ml: 'അൽഫോൻസോ മാമ്പഴവും തൈരും ചേർത്ത സ്വാദിഷ്ടമായ ലസ്സി.',
    },
    'mango lassi': {
      en: 'Smooth, refreshing blend of sweet Alphonso mangoes and hung curd topped with cardamom.',
      ta: 'அல்போன்சா மாம்பழக்கூழ் மற்றும் கெட்டி தயிர் கொண்டு தயாரிக்கப்பட்ட இனிப்பு லஸ்ஸி.',
      hi: 'अलफांसो आम और गाढ़े दही से बनी ताज़गी भरी मैंगो लस्सी।',
      ml: 'അൽഫോൻസോ മാമ്പഴവും തൈരും ചേർത്ത സ്വാദിഷ്ടമായ ലസ്സി.',
    },
    'dish_live_chaat': {
      en: 'Fresh Pani Puri, Sev Puri, Dahi Bhalla and Papdi Chaat assembled live before guests.',
      ta: 'பானி பூரி, சேவ் பூரி மற்றும் தயிர் வடை நேரலையாக விருந்தினர்களுக்கு தயாரித்து வழங்கப்படும்.',
      hi: 'मेहमानों के सामने ताज़ा तैयार पानी पूरी, सेव पूरी और दही भल्ला लाइव काउंटर।',
      ml: 'തത്സമയം തയാറാക്കുന്ന പാനിപൂരി, ചാറ്റ് വിഭവങ്ങൾ.',
    },
    'live chaat counter': {
      en: 'Fresh Pani Puri, Sev Puri, Dahi Bhalla and Papdi Chaat assembled live before guests.',
      ta: 'பானி பூரி, சேவ் பூரி மற்றும் தயிர் வடை நேரலையாக விருந்தினர்களுக்கு தயாரித்து வழங்கப்படும்.',
      hi: 'मेहमानों के सामने ताज़ा तैयार पानी पूरी, सेव पूरी और दही भल्ला लाइव काउंटर।',
      ml: 'തത്സമയം തയാറാക്കുന്ന പാനിപൂരി, ചാറ്റ് വിഭവങ്ങൾ.',
    },
    'dish_kulfi_falooda': {
      en: 'Matka malai kulfi sliced with rose falooda noodles, sabja seeds and rose syrup.',
      ta: 'மட்கா குல்பி, சப்ஜா விதைகள் மற்றும் ரோஸ் சிரப் கலந்த சுவையான பலூடா.',
      hi: 'मटका मलाई कुल्फी, फालूदा सेव, सब्ज़ा बीज और गुलाब शरबत।',
      ml: 'മട്ക കുൽഫിയും ഫലൂദ നൂഡിൽസും റോസ് സിറപ്പും.',
    },
    'kulfi falooda': {
      en: 'Matka malai kulfi sliced with rose falooda noodles, sabja seeds and rose syrup.',
      ta: 'மட்கா குல்பி, சப்ஜா விதைகள் மற்றும் ரோஸ் சிரப் கலந்த சுவையான பலூடா.',
      hi: 'मटका मलाई कुल्फी, फालूदा सेव, सब्ज़ा बीज और गुलाब शरबत।',
      ml: 'മട്ക കുൽഫിയും ഫലൂദ നൂഡിൽസും റോസ് സിറപ്പും.',
    },
    'dish_idly': {
      en: 'Steamed melt-in-mouth button rice cakes tossed in aromatic gunpowder podi and pure cow ghee.',
      ta: 'தூய நெய் மற்றும் மணமணக்கும் இட்லி பொடி தடவிய பஞ்சு போன்ற மல்லிகைப்பூ இட்லி.',
      hi: 'देशी घी और सुगंधित पोड़ी मसाले में लिपटी भाप से पकी नरम इडली।',
      ml: 'നെയ്യും പൊടിയും ചേർത്ത പഞ്ഞിപോലുള്ള ഇഡ്ഡലി.',
    },
    'steamed ghee podi idly': {
      en: 'Steamed melt-in-mouth button rice cakes tossed in aromatic gunpowder podi and pure cow ghee.',
      ta: 'தூய நெய் மற்றும் மணமணக்கும் இட்லி பொடி தடவிய பஞ்சு போன்ற மல்லிகைப்பூ இட்லி.',
      hi: 'देशी घी और सुगंधित पोड़ी मसाले में लिपटी भाप से पकी नरम इडली।',
      ml: 'നെയ്യും പൊടിയും ചേർത്ത പഞ്ഞിപോലുള്ള ഇഡ്ഡലി.',
    },
    'dish_vada': {
      en: 'Golden-fried spiced lentil fritters with crispy golden crust and fluffy interior, served with coconut chutney.',
      ta: 'மொறுமொறுப்பான உளுந்து வடை, நறுமணமிக்க தேங்காய் சட்னியுடன் வழங்கப்படும்.',
      hi: 'बाहर से कुरकुरा और अंदर से स्पंजी गर्मागर्म मेदु वड़ा।',
      ml: 'മൊരിഞ്ഞ മേദു വടയും തേങ്ങാ ചമ്മന്തിയും.',
    },
    'crisp medu vada': {
      en: 'Golden-fried spiced lentil fritters with crispy golden crust and fluffy interior, served with coconut chutney.',
      ta: 'மொறுமொறுப்பான உளுந்து வடை, நறுமணமிக்க தேங்காய் சட்னியுடன் வழங்கப்படும்.',
      hi: 'बाहर से कुरकुरा और अंदर से स्पंजी गर्मागर्म मेदु वड़ा।',
      ml: 'മൊരിഞ്ഞ മേദു വടയും തേങ്ങാ ചമ്മന്തിയും.',
    },
    'dish_dosa': {
      en: 'Crisp fermented crepe roasted in golden ghee, folded with mildly spiced potato masala, crafted live.',
      ta: 'பொன்னிறமாக மொறுமொறுப்பாக நெய்யில் சுடப்பட்டு உருளைக்கிழங்கு மசாலா வைத்த நேரடி தோசை.',
      hi: 'शुद्ध घी में सिंकी कुरकुरी मसाला डोसा, लाइव काउंटर पर ताज़ा तैयार।',
      ml: 'തത്സമയം നെയ്യിൽ ചുട്ടെടുത്ത ക്രിസ്പി മസാല ദോശ.',
    },
    'live ghee roast masala dosa': {
      en: 'Crisp fermented crepe roasted in golden ghee, folded with mildly spiced potato masala, crafted live.',
      ta: 'பொன்னிறமாக மொறுமொறுப்பாக நெய்யில் சுடப்பட்டு உருளைக்கிழங்கு மசாலா வைத்த நேரடி தோசை.',
      hi: 'शुद्ध घी में सिंकी कुरकुरी मसाला डोसा, लाइव काउंटर पर ताज़ा तैयार।',
      ml: 'തത്സമയം നെയ്യിൽ ചുട്ടെടുത്ത ക്രിസ്പി മസാല ദോശ.',
    },
    'dish_filter_coffee': {
      en: 'Traditional decoction brewed dark with chicory-infused Arabica beans, frothed in brass dabarah-tumbler.',
      ta: 'அசல் கும்பகோணம் முறையில் பித்தளை டபரா-டம்ளரில் மணக்க மணக்க வழங்கப்படும் டிகிரி காபி.',
      hi: 'पारंपरिक पीतल के पात्र में परोसी गई असली कुंभकोणम डिग्री फिल्टर कॉफी।',
      ml: 'കുംഭകോണം ഡിഗ്രി ഫിൽട്ടർ കോഫി.',
    },
    'kumbakonam degree filter coffee': {
      en: 'Traditional decoction brewed dark with chicory-infused Arabica beans, frothed in brass dabarah-tumbler.',
      ta: 'அசல் கும்பகோணம் முறையில் பித்தளை டபரா-டம்ளரில் மணக்க மணக்க வழங்கப்படும் டிகிரி காபி.',
      hi: 'पारंपरिक पीतल के पात्र में परोसी गई असली कुंभकोणम डिग्री फिल्टर कॉफी।',
      ml: 'കുംഭകോണം ഡിഗ്രി ഫിൽട്ടർ കോഫി.',
    },
    'dish_tender_coconut_punch': {
      en: 'Fresh tender coconut water blended with soft coconut pulp, cardamom and a touch of condensed milk.',
      ta: 'புத்துணர்ச்சியூட்டும் இளநீர் வழுக்கையுடன் ஏலக்காய் மற்றும் பால் கலந்த ஆரோக்கிய பானம்.',
      hi: 'ताज़ा नारियल पानी और मलाई से बना स्वादिष्ट इलानीर पायसम कूलर।',
      ml: 'ഇളനീരും കുഴമ്പ് പാലും ചേർത്ത സ്വാദിഷ്ടമായ കൂളർ.',
    },
    'elaneer payasam & tender coconut cooler': {
      en: 'Fresh tender coconut water blended with soft coconut pulp, cardamom and a touch of condensed milk.',
      ta: 'புத்துணர்ச்சியூட்டும் இளநீர் வழுக்கையுடன் ஏலக்காய் மற்றும் பால் கலந்த ஆரோக்கிய பானம்.',
      hi: 'ताज़ा नारियल पानी और मलाई से बना स्वादिष्ट इलानीर पायसम कूलर।',
      ml: 'ഇളനീരും കുഴമ്പ് പാലും ചേർത്ത സ്വാദിഷ്ടമായ കൂളർ.',
    },
    'dish_rose_sharbat': {
      en: 'Chilled Damascus rose distillate infused with Kashmiri saffron strands, basil seeds and fresh mint.',
      ta: 'காஷ்மீரி குங்குமப்பூ மற்றும் ரோஜா இதழ்களின் சாறு கலந்த அரச குளிர் பானம்.',
      hi: 'केसर, तुलसी के बीज और गुलाब जल से युक्त शाही शरबत।',
      ml: 'കുങ്കുമപ്പൂവും റോസ് സിറപ്പും ചേർത്ത റോയൽ സർബത്ത്.',
    },
    'shahi gulab saffron sherbat': {
      en: 'Chilled Damascus rose distillate infused with Kashmiri saffron strands, basil seeds and fresh mint.',
      ta: 'காஷ்மீரி குங்குமப்பூ மற்றும் ரோஜா இதழ்களின் சாறு கலந்த அரச குளிர் பானம்.',
      hi: 'केसर, तुलसी के बीज और गुलाब जल से युक्त शाही शरबत।',
      ml: 'കുങ്കുമപ്പൂവും റോസ് സിറപ്പും ചേർത്ത റോയൽ സർബത്ത്.',
    },
    'dish_kokum_cooler': {
      en: 'Zesty coastal kokum fruit extract infused with roasted cumin, rock salt, mint sprigs and sparkling water.',
      ta: 'வறுத்த சீரகம் மற்றும் புத்துணர்ச்சியூட்டும் கொக்கும் சாறு கலந்த குளிர் பானம்.',
      hi: 'भुना जीरा और कोकम से बना ताजगी भरा पाचक पेय।',
      ml: 'ജീരകവും കൊകവും ചേർത്ത ദാഹശമനി.',
    },
    'spiced kokum & cumin cooler': {
      en: 'Zesty coastal kokum fruit extract infused with roasted cumin, rock salt, mint sprigs and sparkling water.',
      ta: 'வறுத்த சீரகம் மற்றும் புத்துணர்ச்சியூட்டும் கொக்கும் சாறு கலந்த குளிர் பானம்.',
      hi: 'भुना जीरा और कोकम से बना ताजगी भरा पाचक पेय।',
      ml: 'ജീരകവും കൊകവും ചേർത്ത ദാഹശമനി.',
    },
    'dish_hara_bhara_kabab': {
      en: 'Pan-seared spinach, green pea and potato patties centered with spiced cashew nuts, served with mint chutney.',
      ta: 'பசலைக்கீரை, பச்சை பட்டாணி மற்றும் முந்திரி கலந்த சத்தான தவா கபாப்.',
      hi: 'पालक, मटर और काजू से बना पौष्टिक एवं स्वादिष्ट हरा भरा कबाब।',
      ml: 'ചീരയും പച്ചപ്പട്ടാണിയും കശുവണ്ടിയും ചേർത്ത ഹരാ ഭരാ കബാബ്.',
    },
    'shahi hara bhara kabab': {
      en: 'Pan-seared spinach, green pea and potato patties centered with spiced cashew nuts, served with mint chutney.',
      ta: 'பசலைக்கீரை, பச்சை பட்டாணி மற்றும் முந்திரி கலந்த சத்தான தவா கபாப்.',
      hi: 'पालक, मटर और काजू से बना पौष्टिक एवं स्वादिष्ट हरा भरा कबाब।',
      ml: 'ചീരയും പച്ചപ്പട്ടാണിയും കശുവണ്ടിയും ചേർത്ത ഹരാ ഭരാ കബാബ്.',
    },
    'dish_spring_rolls': {
      en: 'Crispy hand-rolled wanton crepes stuffed with shredded wok-tossed cabbage, carrots and bell peppers with sweet chili dip.',
      ta: 'காய்கறிகள் நிரப்பப்பட்டு பொன்னிறமாக வறுக்கப்பட்ட மொறுமொறு ஸ்பிரிங் ரோல்ஸ்.',
      hi: 'कुरकुरी शीट में ताज़ी सब्जियों से भरे लजीज स्प्रिंग रोल्स।',
      ml: 'പച്ചക്കറികൾ നിറഞ്ഞ ക്രിസ്പി സ്പ്രിംഗ് റോൾസ്.',
    },
    'crisp vegetable gold spring rolls': {
      en: 'Crispy hand-rolled wanton crepes stuffed with shredded wok-tossed cabbage, carrots and bell peppers with sweet chili dip.',
      ta: 'காய்கறிகள் நிரப்பப்பட்டு பொன்னிறமாக வறுக்கப்பட்ட மொறுமொறு ஸ்பிரிங் ரோல்ஸ்.',
      hi: 'कुरकुरी शीट में ताज़ी सब्जियों से भरे लजीज स्प्रिंग रोल्स।',
      ml: 'പച്ചക്കറികൾ നിറഞ്ഞ ക്രിസ്പി സ്പ്രിംഗ് റോൾസ്.',
    },
    'dish_malai_tikka': {
      en: 'Boneless chicken chunks marinated in cream cheese, green cardamom, white pepper and garlic, charred in tandoor.',
      ta: 'கிரீம், சீஸ் மற்றும் வெள்ளை மிளகு தடவி தந்தூரில் சுடப்பட்ட மென்மையான கோழி கபாப்.',
      hi: 'मलाई, पनीर और इलायची में मैरीनेट किया हुआ तंदूरी मुर्ग मलाई टिक्का।',
      ml: 'ക്രീമിലും വെളുത്തുള്ളിയിലും ചുട്ടെടുത്ത ചിക്കൻ മലായ് ടിക്ക.',
    },
    'murgh malai tikka': {
      en: 'Boneless chicken chunks marinated in cream cheese, green cardamom, white pepper and garlic, charred in tandoor.',
      ta: 'கிரீம், சீஸ் மற்றும் வெள்ளை மிளகு தடவி தந்தூரில் சுடப்பட்ட மென்மையான கோழி கபாப்.',
      hi: 'मलाई, पनीर और इलायची में मैरीनेट किया हुआ तंदूरी मुर्ग मलाई टिक्का।',
      ml: 'ക്രീമിലും വെളുത്തുള്ളിയിലും ചുട്ടെടുത്ത ചിക്കൻ മലായ് ടിക്ക.',
    },
    'dish_fish_amritsari': {
      en: 'Delicate freshwater fish fillets coated in carom seed spiced gram flour batter, fried crisp and sprinkled with chaat masala.',
      ta: 'அஜ்வைன் மசாலா மாவில் முக்கி பொன்னிறமாக வறுத்த சுவையான மீன் வறுவல்.',
      hi: 'अजवाइन और बेसन के घोल में कुरकुरी तली हुई अमृतसरी मछली।',
      ml: 'മസാലയിൽ പൊരിച്ചെടുത്ത മൊരിഞ്ഞ മീൻ വറുത്തത്.',
    },
    'crispy amritsari fish fry': {
      en: 'Delicate freshwater fish fillets coated in carom seed spiced gram flour batter, fried crisp and sprinkled with chaat masala.',
      ta: 'அஜ்வைன் மசாலா மாவில் முக்கி பொன்னிறமாக வறுத்த சுவையான மீன் வறுவல்.',
      hi: 'अजवाइन और बेसन के घोल में कुरकुरी तली हुई अमृतसरी मछली।',
      ml: 'മസാലയിൽ പൊരിച്ചെടുത്ത മൊരിഞ്ഞ മീൻ വറുത്തത്.',
    },
    'dish_bisibelebath': {
      en: 'Classic Karnataka rice, toor dal and assorted vegetables simmered in hand-ground aromatic spice blend, finished with ghee-roasted cashews and boondi.',
      ta: 'நெய்யில் வறுத்த முந்திரி மற்றும் காய்கறிகளுடன் பாரம்பரிய முறையில் சமைக்கப்பட்ட சாம்பார் சாதம்.',
      hi: 'शुद्ध घी, भुने काजू और मसालों से बना कर्नाटक का प्रसिद्ध बिसीबेलेभात।',
      ml: 'നെയ്യും പച്ചക്കറികളും ചേർത്ത സ്വാദിഷ്ടമായ ബിസിബെളെബാത്ത്.',
    },
    'mysore ghee bisibelebath': {
      en: 'Classic Karnataka rice, toor dal and assorted vegetables simmered in hand-ground aromatic spice blend, finished with ghee-roasted cashews and boondi.',
      ta: 'நெய்யில் வறுத்த முந்திரி மற்றும் காய்கறிகளுடன் பாரம்பரிய முறையில் சமைக்கப்பட்ட சாம்பார் சாதம்.',
      hi: 'शुद्ध घी, भुने काजू और मसालों से बना कर्नाटक का प्रसिद्ध बिसीबेलेभात।',
      ml: 'നെയ്യും പച്ചക്കറികളും ചേർത്ത സ്വാദിഷ്ടമായ ബിസിബെളെബാത്ത്.',
    },
    'dish_avial': {
      en: 'Traditional melange of 9 garden vegetables simmered gently in thick coconut paste, green chilies, yogurt and curry leaves drizzled with virgin coconut oil.',
      ta: 'நாட்டு காய்கறிகள், தேங்காய்ப்பால் மற்றும் தேங்காய் எண்ணெய் மணத்துடன் கூடிய பாரம்பரிய அவியல்.',
      hi: 'नारियल के पेस्ट और ताज़ा सब्जियों से बनी पारंपरिक दक्षिण भारतीय अवियल।',
      ml: 'പച്ചക്കറികളും തേങ്ങാപ്പാലും വെളിച്ചെണ്ണയും ചേർത്ത പരമ്പരാഗത അവിയൽ.',
    },
    'malabar coconut milk avial': {
      en: 'Traditional melange of 9 garden vegetables simmered gently in thick coconut paste, green chilies, yogurt and curry leaves drizzled with virgin coconut oil.',
      ta: 'நாட்டு காய்கறிகள், தேங்காய்ப்பால் மற்றும் தேங்காய் எண்ணெய் மணத்துடன் கூடிய பாரம்பரிய அவியல்.',
      hi: 'नारियल के पेस्ट और ताज़ा सब्जियों से बनी पारंपरिक दक्षिण भारतीय अवियल।',
      ml: 'പച്ചക്കറികളും തേങ്ങാപ്പാലും വെളിച്ചെണ്ണയും ചേർത്ത പരമ്പരാഗത അവിയൽ.',
    },
    'dish_chettinad_chicken': {
      en: 'Tender chicken braised with stone-ground kalpasi, fennel, star anise and fresh tellicherry black peppercorns.',
      ta: 'செட்டிநாடு கல்பாசி மற்றும் கருமிளகு மணத்துடன் வறுத்த காரசாரமான நாட்டுக்கோழி வறுவல்.',
      hi: 'काली मिर्च और चेत्तिनाड मसालों में भुना हुआ स्वादिष्ट चिकन फ्राई।',
      ml: 'ചെട്ടിനാട് കുരുമുളക് മസാലയിൽ വറുത്തെടുത്ത ചിക്കൻ ഫ്രൈ.',
    },
    'chettinad pepper chicken fry': {
      en: 'Tender chicken braised with stone-ground kalpasi, fennel, star anise and fresh tellicherry black peppercorns.',
      ta: 'செட்டிநாடு கல்பாசி மற்றும் கருமிளகு மணத்துடன் வறுத்த காரசாரமான நாட்டுக்கோழி வறுவல்.',
      hi: 'काली मिर्च और चेत्तिनाड मसालों में भुना हुआ स्वादिष्ट चिकन फ्राई।',
      ml: 'ചെട്ടിനാട് കുരുമുളക് മസാലയിൽ വറുത്തെടുത്ത ചിക്കൻ ഫ്രൈ.',
    },
    'dish_mutton_sukka': {
      en: 'Baby lamb chunks slow-roasted with shallots, crushed dry red chilies, curry leaves and country ghee until succulent and caramelized.',
      ta: 'சின்ன வெங்காயம், கறிவேப்பிலை மற்றும் நறுமண மசாலாக்களுடன் சுருள வதக்கிய மதுரை மட்டன் சுக்கா.',
      hi: 'छोटे प्याज और देशी घी में भुना हुआ मदुरै का प्रसिद्ध मटन चुक्का।',
      ml: 'ചെറിയ ഉള്ളിയും നെയ്യും ചേർത്ത് വറ്റിച്ചെടുത്ത മധുര മട്ടൻ ചുക്ക.',
    },
    'madurai mutton chukka varuval': {
      en: 'Baby lamb chunks slow-roasted with shallots, crushed dry red chilies, curry leaves and country ghee until succulent and caramelized.',
      ta: 'சின்ன வெங்காயம், கறிவேப்பிலை மற்றும் நறுமண மசாலாக்களுடன் சுருள வதக்கிய மதுரை மட்டன் சுக்கா.',
      hi: 'छोटे प्याज और देशी घी में भुना हुआ मदुरै का प्रसिद्ध मटन चुक्का।',
      ml: 'ചെറിയ ഉള്ളിയും നെയ്യും ചേർത്ത് വറ്റിച്ചെടുത്ത മധുര മട്ടൻ ചുക്ക.',
    },
    'dish_live_jalebi': {
      en: 'Spirals of fermented batter fried golden crisp live before guests, dipped in hot saffron syrup and topped with chilled creamy rabdi.',
      ta: 'சுடச்சுட பொரித்து குங்குமப்பூ பாகில் ஊறவைத்து கிரீமி ரப்ரியுடன் பரிமாறப்படும் நேரடி ஜிலேபி.',
      hi: 'केसरिया चाशनी में डूबी कुरकुरी गर्मागर्म जलेबी और रबड़ी।',
      ml: 'കുങ്കുമപ്പൂ സിറപ്പിൽ മുക്കിയ ചൂടുള്ള ജിലേബിയും റബ്ഡിയും.',
    },
    'live crisp kesar jalebi with rabdi': {
      en: 'Spirals of fermented batter fried golden crisp live before guests, dipped in hot saffron syrup and topped with chilled creamy rabdi.',
      ta: 'சுடச்சுட பொரித்து குங்குமப்பூ பாகில் ஊறவைத்து கிரீமி ரப்ரியுடன் பரிமாறப்படும் நேரடி ஜிலேபி.',
      hi: 'केसरिया चाशनी में डूबी कुरकुरी गर्मागर्म जलेबी और रबड़ी।',
      ml: 'കുങ്കുമപ്പൂ സിറപ്പിൽ മുക്കിയ ചൂടുള്ള ജിലേബിയും റബ്ഡിയും.',
    },
    'dish_live_pasta': {
      en: 'Penne and fusilli tossed to order in rich Alfredo cheese sauce, zesty Arrabbiata, or basil pesto with gourmet veggies.',
      ta: 'விருந்தினர் விருப்பப்படி கிரீமி வெள்ளை சாஸ் அல்லது தக்காளி சாஸில் தயாரித்து வழங்கப்படும் நேரடி பாஸ்தா.',
      hi: 'चीज़ सॉस और ताज़ी सब्जियों के साथ लाइव तैयार स्वादिष्ट पास्ता।',
      ml: 'തത്സമയം തയാറാക്കുന്ന സ്വാദിഷ്ടമായ പാസ്ത.',
    },
    'live gourmet pasta counter': {
      en: 'Penne and fusilli tossed to order in rich Alfredo cheese sauce, zesty Arrabbiata, or basil pesto with gourmet veggies.',
      ta: 'விருந்தினர் விருப்பப்படி கிரீமி வெள்ளை சாஸ் அல்லது தக்காளி சாஸில் தயாரித்து வழங்கப்படும் நேரடி பாஸ்தா.',
      hi: 'चीज़ सॉस और ताज़ी सब्जियों के साथ लाइव तैयार स्वादिष्ट पास्ता।',
      ml: 'തത്സമയം തയാറാക്കുന്ന സ്വാദിഷ്ടമായ പാസ്ത.',
    },
    'dish_kadhai_paneer': {
      en: 'Fresh cottage cheese cubes and crunchy bell peppers tossed in a rustic mortar-crushed coriander and Kashmiri chili masala.',
      ta: 'குடைமிளகாய் மற்றும் வறுத்த மல்லி மசாலாவுடன் கடாயில் வதக்கிய பன்னீர் கிரேவி.',
      hi: 'शिमला मिर्च और ताज़ा कुटे मसालों के साथ कड़ाही में भुना पनीर।',
      ml: 'ക്യാപ്സിക്കവും മസാലകളും ചേർത്ത് തയാറാക്കിയ കടായ് പനീർ.',
    },
    'kadhai paneer peshawari': {
      en: 'Fresh cottage cheese cubes and crunchy bell peppers tossed in a rustic mortar-crushed coriander and Kashmiri chili masala.',
      ta: 'குடைமிளகாய் மற்றும் வறுத்த மல்லி மசாலாவுடன் கடாயில் வதக்கிய பன்னீர் கிரேவி.',
      hi: 'शिमला मिर्च और ताज़ा कुटे मसालों के साथ कड़ाही में भुना पनीर।',
      ml: 'ക്യാപ്സിക്കവും മസാലകളും ചേർത്ത് തയാറാക്കിയ കടായ് പനീർ.',
    },
    'dish_methi_malai_mutter': {
      en: 'Tender green peas and fresh fenugreek greens bathed in a creamy, velvety cashew-almond sauce seasoned with white pepper.',
      ta: 'வெந்தயக்கீரை மற்றும் பச்சை பட்டாணி கிரீமி முந்திரி கிரேவியில் சமைக்கப்பட்டது.',
      hi: 'मेथी, हरी मटर और मलाई की समृद्ध मखमली ग्रेवी।',
      ml: 'മേഥിയും പച്ചപ്പട്ടാണിയും ക്രീമും ചേർത്ത മേഥി മലായ് മട്ടർ.',
    },
    'methi malai mutter': {
      en: 'Tender green peas and fresh fenugreek greens bathed in a creamy, velvety cashew-almond sauce seasoned with white pepper.',
      ta: 'வெந்தயக்கீரை மற்றும் பச்சை பட்டாணி கிரீமி முந்திரி கிரேவியில் சமைக்கப்பட்டது.',
      hi: 'मेथी, हरी मटर और मलाई की समृद्ध मखमली ग्रेवी।',
      ml: 'മേഥിയും പച്ചപ്പട്ടാണിയും ക്രീമും ചേർത്ത മേഥി മലായ് മട്ടർ.',
    },
    'dish_garlic_naan': {
      en: 'Hand-stretched leavened flatbread brushed with roasted minced garlic, fresh coriander and molten farm butter.',
      ta: 'பொடியாக நறுக்கிய பூண்டு மற்றும் வெண்ணெய் தடவி தந்தூரில் சுடப்பட்ட மெல்லிய நான்.',
      hi: 'बारीक कटे लहसुन और मक्खन से युक्त तंदूरी गार्लिक नान।',
      ml: 'വെളുത്തുള്ളിയും വെണ്ണയും ചേർത്ത ഗാർലിക് നാൻ.',
    },
    'charred garlic & herb naan': {
      en: 'Hand-stretched leavened flatbread brushed with roasted minced garlic, fresh coriander and molten farm butter.',
      ta: 'பொடியாக நறுக்கிய பூண்டு மற்றும் வெண்ணெய் தடவி தந்தூரில் சுடப்பட்ட மெல்லிய நான்.',
      hi: 'बारीक कटे लहसुन और मक्खन से युक्त तंदूरी गार्लिक नान।',
      ml: 'വെളുത്തുള്ളിയും വെണ്ണയും ചേർത്ത ഗാർലിക് നാൻ.',
    },
    'dish_laccha_paratha': {
      en: 'Multi-layered, flaky whole wheat flatbread layered with ghee and pan-baked until golden and crisp.',
      ta: 'நெய் தடவி பல அடுக்குகளாக மொறுமொறுப்பாக சுடப்பட்ட கோதுமை பரோட்டா.',
      hi: 'परतदार, खस्ता और शुद्ध घी में सिंकी गेहूं की लच्छा रोटी।',
      ml: 'നെയ്യ് പുരട്ടി ചുട്ടെടുത്ത മൊരിഞ്ഞ ലച്ച പൊറോട്ട.',
    },
    'crispy laccha paratha': {
      en: 'Multi-layered, flaky whole wheat flatbread layered with ghee and pan-baked until golden and crisp.',
      ta: 'நெய் தடவி பல அடுக்குகளாக மொறுமொறுப்பாக சுடப்பட்ட கோதுமை பரோட்டா.',
      hi: 'परतदार, खस्ता और शुद्ध घी में सिंकी गेहूं की लच्छा रोटी।',
      ml: 'നെയ്യ് പുരട്ടി ചുട്ടെടുത്ത മൊരിഞ്ഞ ലച്ച പൊറോട്ട.',
    },
    'dish_shahi_tukda': {
      en: 'Ghee-crisped brioche bread soaked in saffron-cardamom syrup, crowned with dense malai rabdi, silver leaf and chopped pistachio.',
      ta: 'நெய்யில் வறுத்த பிரெட், குங்குமப்பூ பால் மற்றும் ரப்ரி கலந்த லக்னோவி இனிப்பு.',
      hi: 'चाशनी में डूबा, रबड़ी और मेवों से सजा शाही टुकड़ा।',
      ml: 'നെയ്യിൽ വറുത്ത ബ്രെഡും റബ്ഡിയും ചേർത്ത ഷാഹി തുക്ഡ.',
    },
    'royal awadhi shahi tukda': {
      en: 'Ghee-crisped brioche bread soaked in saffron-cardamom syrup, crowned with dense malai rabdi, silver leaf and chopped pistachio.',
      ta: 'நெய்யில் வறுத்த பிரெட், குங்குமப்பூ பால் மற்றும் ரப்ரி கலந்த லக்னோவி இனிப்பு.',
      hi: 'चाशनी में डूबा, रबड़ी और मेवों से सजा शाही टुकड़ा।',
      ml: 'നെയ്യിൽ വറുത്ത ബ്രെഡും റബ്ഡിയും ചേർത്ത ഷാഹി തുക്ഡ.',
    },
    'dish_moong_dal_halwa': {
      en: 'Slow-roasted golden yellow lentils continuously stirred with A2 cow ghee, whole mawa, saffron and golden raisins.',
      ta: 'தூய நெய்யில் வறுத்த பாசிப்பருப்பு மற்றும் முந்திரி கொண்டு செய்யப்பட்ட நல்மண அல்வா.',
      hi: 'देशी घी, मावा और मेवों से धीमी आंच पर भुना पारंपरिक मूंग दाल हलवा।',
      ml: 'നെയ്യിൽ വറുത്തെടുത്ത രുചികരമായ മൂങ് ദാൽ ഹൽവ.',
    },
    'pure ghee moong dal halwa': {
      en: 'Slow-roasted golden yellow lentils continuously stirred with A2 cow ghee, whole mawa, saffron and golden raisins.',
      ta: 'தூய நெய்யில் வறுத்த பாசிப்பருப்பு மற்றும் முந்திரி கொண்டு செய்யப்பட்ட நல்மண அல்வா.',
      hi: 'देशी घी, मावा और मेवों से धीमी आंच पर भुना पारंपरिक मूंग दाल हलवा।',
      ml: 'നെയ്യിൽ വറുത്തെടുത്ത രുചികരമായ മൂങ് ദാൽ ഹൽവ.',
    },
    'dish_mysore_pak': {
      en: 'A regal royal palace delicacy crafted from roasted gram flour, sugar syrup and continuous folds of sizzling hot pure ghee.',
      ta: 'கடலை மாவு மற்றும் நறுமண தூய நெய்யில் நாவில் கரையும் வகையில் செய்யப்பட்ட பாரம்பரிய மைசூர் பாக்.',
      hi: 'शुद्ध देशी घी और बेसन से बना मुँह में घुल जाने वाला मैसूर पाक।',
      ml: 'നെയ്യിൽ തയാറാക്കിയ വായിലലിയുന്ന മൈസൂർ പാക്ക്.',
    },
    'royal melt-in-mouth ghee mysore pak': {
      en: 'A regal royal palace delicacy crafted from roasted gram flour, sugar syrup and continuous folds of sizzling hot pure ghee.',
      ta: 'கடலை மாவு மற்றும் நறுமண தூய நெய்யில் நாவில் கரையும் வகையில் செய்யப்பட்ட பாரம்பரிய மைசூர் பாக்.',
      hi: 'शुद्ध देशी घी और बेसन से बना मुँह में घुल जाने वाला मैसूर पाक।',
      ml: 'നെയ്യിൽ തയാറാക്കിയ വായിലലിയുന്ന മൈസൂർ പാക്ക്.',
    },
    'dish_banarasi_paan': {
      en: 'Fresh betel leaf rolled with sweet gulkand, tutti-frutti, menthol, fennel seeds, dry dates and coated with edible silver vark.',
      ta: 'குல்கந்து, நறுமண சோம்பு மற்றும் வெள்ளி வர்க்குடன் சுற்றப்பட்ட அரச விருந்து தாம்பூலம்.',
      hi: 'गुलकंद, सौंफ और चांदी के वर्क से लिपटा शाही बनारसी मीठा पान।',
      ml: 'ഗുൽക്കന്തും പെരുംജീരകവും ചേർത്ത ബനാറസി മീഠാ പാൻ.',
    },
    'shahi banarasi meetha paan': {
      en: 'Fresh betel leaf rolled with sweet gulkand, tutti-frutti, menthol, fennel seeds, dry dates and coated with edible silver vark.',
      ta: 'குல்கந்து, நறுமண சோம்பு மற்றும் வெள்ளி வர்க்குடன் சுற்றப்பட்ட அரச விருந்து தாம்பூலம்.',
      hi: 'गुलकंद, सौंफ और चांदी के वर्क से लिपटा शाही बनारसी मीठा पान।',
      ml: 'ഗുൽക്കന്തും പെരുംജീരകവും ചേർത്ത ബനാറസി മീഠാ പാൻ.',
    },
  };

  // Category Translations Map
  private categoryMap: Record<string, Record<SupportedLang, string>> = {
    'cat_tiffin': { en: 'Traditional Tiffin & Breakfast', ta: 'பாரம்பரிய காலை சிற்றுண்டி', hi: 'पारंपरिक नाश्ता (टिफिन)', ml: 'പാരമ്പര്യ പ്രഭാതഭക്ഷണം' },
    'traditional tiffin & breakfast': { en: 'Traditional Tiffin & Breakfast', ta: 'பாரம்பரிய காலை சிற்றுண்டி', hi: 'पारंपरिक नाश्ता (टिफिन)', ml: 'പാരമ്പര്യ പ്രഭാതഭക്ഷണം' },

    'cat_starters': { en: 'Starters', ta: 'தொடக்க உணவுகள் & கபாப்', hi: 'स्टार्टर्स (शुरुआती व्यंजन)', ml: 'സ്റ്റാർട്ടറുകൾ' },
    'starters': { en: 'Starters', ta: 'தொடக்க உணவுகள் & கபாப்', hi: 'स्टार्टर्स (शुरुआती व्यंजन)', ml: 'സ്റ്റാർട്ടറുകൾ' },
    'royal appetizers & starters': { en: 'Royal Appetizers & Starters', ta: 'அரச தொடக்க உணவுகள்', hi: 'शाही स्टार्टर्स', ml: 'രാജകീയ സ്റ്റാർട്ടറുകൾ' },

    'cat_main_course': { en: 'Main Course', ta: 'முக்கிய உணவுகள் & கிரேவி', hi: 'मुख्य भोजन (मेन कोर्स)', ml: 'പ്രധാന വിഭവങ്ങൾ' },
    'main course': { en: 'Main Course', ta: 'முக்கிய உணவுகள் & கிரேவி', hi: 'मुख्य भोजन (मेन कोर्स)', ml: 'പ്രധാന വിഭവങ്ങൾ' },
    'grand curries & gravies': { en: 'Grand Curries & Gravies', ta: 'அரச குழம்பு & கிரேவிகள்', hi: 'शाही करी और ग्रेवी', ml: 'കറികളും ഗ്രേവിയും' },

    'cat_biryani': { en: 'Rice & Biryani', ta: 'பிரியாணி & சாத வகைகள்', hi: 'चावल और बिरयानी', ml: 'റൈസും ബിരിയാണിയും' },
    'rice & biryani': { en: 'Rice & Biryani', ta: 'பிரியாணி & சாத வகைகள்', hi: 'चावल और बिरयानी', ml: 'റൈസും ബിരിയാണിയും' },
    'royal rice & dum biryanis': { en: 'Royal Rice & Dum Biryanis', ta: 'அரச பிரியாணி & சாத வகைகள்', hi: 'शाही दम बिरयानी', ml: 'ദം ബിരിയാണി' },

    'cat_breads': { en: 'Breads', ta: 'ரொட்டி & நான் வகைகள்', hi: 'रोटी और नान', ml: 'റൊട്ടിയും നാനും' },
    'breads': { en: 'Breads', ta: 'ரொட்டி & நான் வகைகள்', hi: 'रोटी और नान', ml: 'റൊട്ടിയും നാനും' },
    'tandoori breads & naans': { en: 'Tandoori Breads & Naans', ta: 'தந்தூரி ரொட்டி & நான்', hi: 'तंदूरी रोटी और नान', ml: 'തന്തൂരി റൊട്ടികൾ' },

    'cat_desserts': { en: 'Desserts', ta: 'இனிப்புகள் & அல்வா', hi: 'मिठाइयां (डेजर्ट्स)', ml: 'ഡെസേർട്ടുകൾ' },
    'desserts': { en: 'Desserts', ta: 'இனிப்புகள் & அல்வா', hi: 'मिठाइयां (डेजर्ट्स)', ml: 'ഡെസേർട്ടുകൾ' },
    'heritage sweets & halwas': { en: 'Heritage Sweets & Halwas', ta: 'பாரம்பரிய இனிப்புகள் & அல்வா', hi: 'पारंपरिक मिठाइयां और हलवा', ml: 'ഹൽവകളും മധുരങ്ങളും' },

    'cat_sweets': { en: 'Traditional Sweets', ta: 'அரச மிட்டாய் & ரஸ்மலாய்', hi: 'पारंपरिक मिठाइयां', ml: 'പാരമ്പര്യ മധുരപലഹാരങ്ങൾ' },
    'traditional sweets': { en: 'Traditional Sweets', ta: 'அரச மிட்டாய் & ரஸ்மலாய்', hi: 'पारंपरिक मिठाइयां', ml: 'പാരമ്പര്യ മധുരപലഹാരങ്ങൾ' },
    'artisanal mithais & rasmalai': { en: 'Artisanal Mithais & Rasmalai', ta: 'கைவினை மிட்டாய் & ரஸ்மலாய்', hi: 'रसमलाई और शाही मिठाई', ml: 'രസമലായ് മധുരങ്ങൾ' },

    'cat_beverages': { en: 'Beverages', ta: 'குளிர் பானங்கள் & காபி', hi: 'पेय पदार्थ (बेवरेजेज)', ml: 'പാനീയങ്ങൾ' },
    'beverages': { en: 'Beverages', ta: 'குளிர் பானங்கள் & காபி', hi: 'पेय पदार्थ (बेवरेजेज)', ml: 'പാനീയങ്ങൾ' },

    'cat_live_counters': { en: 'Live Counters', ta: 'நேரடி சமையல் அரங்குகள்', hi: 'लाइव फूड काउंटर्स', ml: 'ലൈവ് കൗണ്ടറുകൾ' },
    'live counters': { en: 'Live Counters', ta: 'நேரடி சமையல் அரங்குகள்', hi: 'लाइव फूड काउंटर्स', ml: 'ലൈവ് കൗണ്ടറുകൾ' },
    'interactive live stations': { en: 'Interactive Live Stations', ta: 'நேரடி சமையல் அரங்குகள்', hi: 'लाइव स्टेशन्स', ml: 'ലൈവ് സ്റ്റേഷനുകൾ' },

    'cat_ice_creams': { en: 'Ice Creams', ta: 'குல்பி & ஐஸ்கிரீம்', hi: 'आइसक्रीम और फालूदा', ml: 'ഐസ്ക്രീമുകൾ' },
    'ice creams': { en: 'Ice Creams', ta: 'குல்பி & ஐஸ்கிரீம்', hi: 'आइसक्रीम और फालूदा', ml: 'ഐസ്ക്രീമുകൾ' },
    'kulfi, ice creams & falooda': { en: 'Kulfi, Ice Creams & Falooda', ta: 'குல்பி, ஐஸ்கிரீம் & பலூடா', hi: 'कुल्फी, आइसक्रीम और फालूदा', ml: 'കുൽഫിയും ഐസ്ക്രീമും' },

    'cat_welcome_drinks': { en: 'Welcome Drinks & Coolers', ta: 'வரவேற்பு குளிர்பானங்கள்', hi: 'वेलकम ड्रिंक्स', ml: 'വെൽകം ഡ്രിങ്ക്സ്' },
    'welcome drinks & coolers': { en: 'Welcome Drinks & Coolers', ta: 'வரவேற்பு குளிர்பானங்கள்', hi: 'वेलकम ड्रिंक्स', ml: 'വെൽകം ഡ്രിങ്ക്സ്' },

    'cat_south_feasts': { en: 'Traditional Sadya & South Specialties', ta: 'தென்னிந்திய விருந்து & சாப்பாடு', hi: 'दक्षिण भारतीय दावत', ml: 'ദക്ഷിണേന്ത്യൻ സദ്യ' },
    'traditional sadya & south specialties': { en: 'Traditional Sadya & South Specialties', ta: 'தென்னிந்திய விருந்து & சாப்பாடு', hi: 'दक्षिण भारतीय दावत', ml: 'ദക്ഷിണേന്ത്യൻ സദ്യ' },

    'cat_paan_digestives': { en: 'Royal Paan & Digestives', ta: 'அரச பான் & செரிமானம்', hi: 'शाही पान और मुखवास', ml: 'രാജകീയ പാൻ' },
    'royal paan & digestives': { en: 'Royal Paan & Digestives', ta: 'அரச பான் & செரிமானம்', hi: 'शाही पान और मुखवास', ml: 'രാജകീയ പാൻ' },
  };

  // Ingredient Name Translations
  private ingredientNameMap: Record<string, Record<SupportedLang, string>> = {
    'farm fresh primary ingredients': { en: 'Farm Fresh Primary Ingredients', ta: 'பண்ணை பசுமை மூலப்பொருட்கள்', hi: 'ताज़ी खेत की सामग्री', ml: 'ഫ്രഷ് ചേരുവകൾ' },
    'desi cow ghee & cold pressed oils': { en: 'Desi Cow Ghee & Cold Pressed Oils', ta: 'தூய பசு நெய் & மரச்செக்கு எண்ணெய்', hi: 'देशी गाय का घी एवं तेल', ml: 'നെയ്യും എണ്ണയും' },
    'hand-ground royal spices': { en: 'Hand-Ground Royal Spices', ta: 'கை அரைத்த மணமணக்கும் மசாலாக்கள்', hi: 'हाथ से पिसे शाही मसाले', ml: 'കൈകൊണ്ട് പൊടിച്ച മസാലകൾ' },
    'fermented idly rice batter': { en: 'Fermented Idly Rice Batter', ta: 'அரைத்த இட்லி மாவு', hi: 'इडली का खमीर उठा बैटर', ml: 'ഇഡ്ഡലി മാവ്' },
    'pure desi cow ghee': { en: 'Pure Desi Cow Ghee', ta: 'தூய பசு நெய்', hi: 'शुद्ध देशी गाय का घी', ml: 'ശുദ്ധമായ പശുവിൻ നെയ്യ്' },
    'desi cow ghee': { en: 'Desi Cow Ghee', ta: 'நாட்டுப்பசு நெய்', hi: 'देशी गाय का घी', ml: 'പശുവിൻ നെയ്യ്' },
    'gunpowder molagapodi': { en: 'Gunpowder Molagapodi', ta: 'மணமணக்கும் இட்லி பொடி', hi: 'सुगंधित इडली पोड़ी', ml: 'ഇഡ്ഡലി പൊടി' },
    'crisp curry leaves': { en: 'Crisp Curry Leaves', ta: 'தாளித்த கறிவேப்பிலை', hi: 'कढ़ी पत्ता', ml: 'കറിവേപ്പില' },
    'curry leaves & hing': { en: 'Curry Leaves & Hing', ta: 'கறிவேப்பிலை & பெருங்காயம்', hi: 'कढ़ी पत्ता और हींग', ml: 'കറിവേപ്പിലയും കായവും' },
    'whole urad gota batter': { en: 'Whole Urad Gota Batter', ta: 'ஊறவைத்த முழு உளுந்து மாவு', hi: 'उड़द दाल बैटर', ml: 'ഉഴുന്ന് മാവ്' },
    'cracked malabar black pepper': { en: 'Cracked Malabar Black Pepper', ta: 'மிளகு & நற்சீரகம்', hi: 'कुटी हुई काली मिर्च', ml: 'കുരുമുളക്' },
    'cracked black pepper & cumin': { en: 'Cracked Black Pepper & Cumin', ta: 'மிளகு & சீரகப்பொடி', hi: 'काली मिर्च और जीरा', ml: 'കുരുമുളകും ജീരകവും' },
    'fresh coconut bits & ginger': { en: 'Fresh Coconut Bits & Ginger', ta: 'தேங்காய் துண்டுகள் & இஞ்சி', hi: 'नारियल और अदरक', ml: 'തേങ്ങാക്കൊത്തും ഇഞ്ചിയും' },
    'aged crisp dosa batter': { en: 'Aged Crisp Dosa Batter', ta: 'பாரம்பரிய தோசை மாவு', hi: 'डोसा बैटर', ml: 'ദോശ മാവ്' },
    'pure desi ghee': { en: 'Pure Desi Ghee', ta: 'தூய நாட்டு நெய்', hi: 'शुद्ध देशी घी', ml: 'ശുദ്ധമായ നെയ്യ്' },
    'spiced potato masala': { en: 'Spiced Potato Masala', ta: 'உருளைக்கிழங்கு மசாலா', hi: 'मसालेदार आलू मसाला', ml: 'കിഴങ്ങ് മസാല' },
    'mysore red chilli chutney': { en: 'Mysore Red Chilli Chutney', ta: 'சிவப்பு மிளகாய் சட்னி', hi: 'मैसूर लाल चटनी', ml: 'ചുവന്ന ചമ്മന്തി' },
    '2-year aged basmati rice': { en: '2-Year Aged Basmati Rice', ta: 'நீள பாஸ்மதி அரிசி', hi: 'पुराना बासमती चावल', ml: 'ബാസ്മതി റൈസ്' },
    'kashmiri saffron & desi ghee': { en: 'Kashmiri Saffron & Desi Ghee', ta: 'காஷ்மீரி குங்குமப்பூ & நெய்', hi: 'केसर और देशी घी', ml: 'കുങ്കുമപ്പൂവും നെയ്യും' },
    'golden fried onions (birista)': { en: 'Golden Fried Onions (Birista)', ta: 'பொன்னிற வறுத்த வெங்காயம்', hi: 'तले हुए प्याज (बिरिस्ता)', ml: 'വറുത്ത ഉള്ളി' },
    'shahi garam masala blend': { en: 'Shahi Garam Masala Blend', ta: 'அரச கரம் மசாலா', hi: 'शाही गरम मसाला', ml: 'ഗരം മസാല' },
    'malai cottage cheese (paneer)': { en: 'Malai Cottage Cheese (Paneer)', ta: 'பசுமை மில்க் பன்னீர்', hi: 'मलाई पनीर', ml: 'പനീർ' },
    'cultured hung curd': { en: 'Cultured Hung Curd', ta: 'கெட்டி தயிர் மசாலா', hi: 'गाढ़ा दही', ml: 'കട്ടത്തൈര്' },
    'vine-ripe tomato makhani': { en: 'Vine-Ripe Tomato Makhani', ta: 'தக்காளி முந்திரி மசாலா', hi: 'टमाटर मखनी ग्रेवी', ml: 'തക്കാളി മഖ്നി' },
    'fresh cream & kasuri methi': { en: 'Fresh Cream & Kasuri Methi', ta: 'பிரெஷ் கிரீம் & கசூரி மேத்தி', hi: 'मलाई और कसूरी मेथी', ml: 'ക്രീമും മേഥിയും' },
    'fine flour dough (maida)': { en: 'Fine Flour Dough (Maida)', ta: 'நல் மைதா மாவு', hi: 'मैदा डो', ml: 'മൈദ മാവ്' },
    'white farm butter': { en: 'White Farm Butter', ta: 'தூய வெண்ணெய்', hi: 'ताज़ा सफेद मक्खन', ml: 'വെണ്ണ' },
    'nigella seeds & cilantro': { en: 'Nigella Seeds & Cilantro', ta: 'கருஞ்சீரகம் & கொத்தமல்லி', hi: 'कलौंजी और धनिया', ml: 'കരിഞ്ചീരകം മല്ലിയില' },
    'haryali mawa / khoya': { en: 'Haryali Mawa / Khoya', ta: 'பால் கோவா / மாவா', hi: 'मावा / खोया', ml: 'പാൽ കോവ' },
    'fresh chenna (paneer)': { en: 'Fresh Chenna (Paneer)', ta: 'மென்மையான பன்னீர்', hi: 'ताज़ा छेना', ml: 'ഫ്രഷ് പനീർ' },
    'saffron & rose sugar nectar': { en: 'Saffron & Rose Sugar Nectar', ta: 'குங்குமப்பூ ரோஸ் பாகு', hi: 'केसरिया गुलाब चाशनी', ml: 'റോസ് ഷുഗർ സിറപ്പ്' },
    'slivered pistachios & almonds': { en: 'Slivered Pistachios & Almonds', ta: 'பிஸ்தா & பாதாம் பருப்பு', hi: 'पिस्ता और बादाम', ml: 'പിസ്തയും ബദാമും' },
  };

  // Ingredient Note Translations
  private ingredientNoteMap: Record<string, Record<SupportedLang, string>> = {
    'hand-selected farm produce': { en: 'Hand-selected farm produce', ta: 'நேரடியாக தோட்டத்திலிருந்து பெறப்பட்டது', hi: 'ताज़ा चुना हुआ उत्पाद', ml: 'തോട്ടത്തിൽ നിന്ന് നേരിട്ടെടുത്തത്' },
    'traditional cooking medium': { en: 'Traditional cooking medium', ta: 'பாரம்பரிய ஆரோக்கிய சமையல் முறை', hi: 'पारंपरिक पकाने का माध्यम', ml: 'പരമ്പരാഗത പാചക രീതി' },
    'artisanal spice blend': { en: 'Artisanal spice blend', ta: 'அரச விருந்து நறுமண கலவை', hi: 'कारीगरी मसाला मिश्रण', ml: 'സ്പെഷ്യൽ മസാലക്കൂട്ട്' },
    'stone-ground parboiled rice & urad dal': { en: 'Stone-ground parboiled rice & urad dal', ta: 'பாரம்பரிய புழுங்கல் அரிசி & உளுந்து', hi: 'पत्थर पर पिसी दाल और चावल', ml: 'അരിയും ഉഴുന്നും' },
    'a2 cow ghee from grass-fed churn': { en: 'A2 cow ghee from grass-fed churn', ta: 'நாட்டுப்பசு ஆவின் நெய்', hi: 'A2 गाय का शुद्ध घी', ml: 'A2 പശുവിൻ നെയ്യ്' },
    'roasted lentils, red chillies & asafoetida': { en: 'Roasted lentils, red chillies & asafoetida', ta: 'வறுத்த பருப்பு, மிளகாய் & பெருங்காயம்', hi: 'भुनी दालें और मिर्च', ml: 'വറുത്ത പരിപ്പും മുളകും' },
    'tempered in pure ghee': { en: 'Tempered in pure ghee', ta: 'நெய்யில் வறுத்த நறுமணம்', hi: 'शुद्ध घी में तड़का', ml: 'നെയ്യിൽ താളിച്ചത്' },
    'fluffy stone-ground batter': { en: 'Fluffy stone-ground batter', ta: 'கெட்டி உளுந்து மாவு', hi: 'हल्का पिसा हुआ बैटर', ml: 'നല്ല മയമുള്ള മാവ്' },
    'whole peppercorns & cumin': { en: 'Whole peppercorns & cumin', ta: 'கருமிளகு & சீரகப்பொடி', hi: 'काली मिर्च और जीरा', ml: 'കുരുമുളകും ജീരകവും' },
    'diced for crisp crunch': { en: 'Diced for crisp crunch', ta: 'சுவையான நறுமண சேர்க்கை', hi: 'कुरकुरापन देने के लिए', ml: 'മൊരിവിനായി ചേർത്തത്' },
    'stone-ground fermented batter': { en: 'Stone-ground fermented batter', ta: 'அரைத்து புளித்த மாவு', hi: 'खमीर उठा पारंपरिक बैटर', ml: 'അരച്ചെടുത്ത മാവ്' },
    'drizzled on red-hot cast iron': { en: 'Drizzled on red-hot cast iron', ta: 'பொன்னிறமாக மொறுமொறுப்பாக வார்க்க', hi: 'गर्म तवे पर घी के साथ', ml: 'ചൂടുള്ള തട്ടിൽ നെയ്യിൽ ചുട്ടത്' },
    'yukon potatoes tempered with mustard & onions': { en: 'Yukon potatoes tempered with mustard & onions', ta: 'தாளித்த வெங்காயம் மற்றும் உருளைக்கிழங்கு', hi: 'राई और प्याज का तड़का', ml: 'കടുക് താളിച്ച കിഴങ്ങ്' },
    'roasted garlic and dried chillies': { en: 'Roasted garlic and dried chillies', ta: 'பூண்டு & காய்ந்த மிளகாய் சாந்து', hi: 'भुना लहसुन और लाल मिर्च', ml: 'വെളുത്തുള്ളിയും വറ്റൽമുളകും' },
    'extra-long fragrant grains': { en: 'Extra-long fragrant grains', ta: 'நறுமணமிக்க பிரியாணி அரிசி', hi: 'लंबे सुगंधित दाने', ml: 'നല്ല സുഗന്ധമുള്ള അരി' },
    'infused in warm buffalo milk': { en: 'Infused in warm buffalo milk', ta: 'சூடான பாலில் கலந்தது', hi: 'गुनगुने दूध में केसर', ml: 'പാലിൽ ചേർത്ത കുങ്കുമപ്പൂവ്' },
    'crispy caramelized shallots': { en: 'Crispy caramelized shallots', ta: 'மொறுமொறுப்பான வெங்காயம்', hi: 'कुरकुरी तली प्याज', ml: 'മൊരിഞ്ഞ ഉള്ളി' },
    'star anise, mace, green cardamom, cloves': { en: 'Star anise, mace, green cardamom, cloves', ta: 'ஏலக்காய், கிராம்பு, பட்டை, அன்னாசிப்பூ', hi: 'लौंग, इलायची और दालचीनी', ml: 'ഏലക്ക, ഗ്രാമ്പൂ, കറുവാപ്പട്ട' },
    'fresh soft cubes': { en: 'Fresh soft cubes', ta: 'மிருதுவான நல் பன்னீர் துண்டுகள்', hi: 'नरम ताज़ा पनीर के टुकड़े', ml: 'സോഫ്റ്റ് പനീർ' },
    'whisked with roasted gram flour': { en: 'Whisked with roasted gram flour', ta: 'வறுத்த கடலை மாவு மற்றும் மசாலா', hi: 'भुने बेसन के साथ फेंटा दही', ml: 'കടലപ്പൊടി ചേർത്ത തൈര്' },
    'silky cashew and tomato gravy': { en: 'Silky cashew and tomato gravy', ta: 'கிரீமி தக்காளி விழுது', hi: 'मखमली काजू-टमाटर ग्रेवी', ml: 'കശുവണ്ടി തക്കാളി ഗ്രേവി' },
    'sun-dried fenugreek leaves': { en: 'Sun-dried fenugreek leaves', ta: 'நறுமண வெந்தயக்கீரை', hi: 'सुगंधित कसूरी मेथी', ml: 'കസൂരി മേഥി' },
    'enriched with milk and yogurt': { en: 'Enriched with milk and yogurt', ta: 'பால் மற்றும் தயிர் சேர்த்தது', hi: 'दूध और दही से गुंथा आटा', ml: 'പാലും തൈരും ചേർത്തത്' },
    'brushed fresh out of the clay tandoor': { en: 'Brushed fresh out of the clay tandoor', ta: 'தந்தூரிலிருந்து எடுத்தவுடன் பூசப்பட்டது', hi: 'तंदूर से निकलते ही मक्खन', ml: 'ചൂടോടെ വെണ്ണ പുരട്ടിയത്' },
    'pressed on crust': { en: 'Pressed on crust', ta: 'மேல்புறம் தூவப்பட்டது', hi: 'नान पर चिपकाए गए', ml: 'മുകളിൽ വിതറിയത്' },
    'slow-reduced buffalo milk solids': { en: 'Slow-reduced buffalo milk solids', ta: 'மெதுவாக காய்ச்சிய பால் கெட்டி', hi: 'धीमी आंच पर पका मावा', ml: 'പാൽ കുറുക്കിയത്' },
    'hand-kneaded for melt-in-mouth soft texture': { en: 'Hand-kneaded for melt-in-mouth soft texture', ta: 'நாவில் கரையும் பாலாடைக்கட்டி', hi: 'नरम बनावट के लिए मसला हुआ', ml: 'മൃദുവായ പനീർ' },
    'infused with green cardamom': { en: 'Infused with green cardamom', ta: 'ஏலக்காய் மணத்துடன்', hi: 'इलायची की महक के साथ', ml: 'ഏലക്കായുടെ സുഗന്ധം' },
    'royal wedding garnish': { en: 'Royal wedding garnish', ta: 'அரச திருமண அலங்காரம்', hi: 'शाही विवाह गार्निश', ml: 'വിവാഹ സ്പെഷ്യൽ' },
  };

  t(key: string): string {
    const entry = this.translations[key];
    if (!entry) return key;
    return entry[this.currentLang()] || entry['en'] || key;
  }

  getDishName(dish: { id?: string; name: string } | null | undefined): string {
    if (!dish) return '';
    if (this.currentLang() === 'en') return dish.name;
    const idKey = (dish.id || '').toLowerCase();
    const nameKey = (dish.name || '').trim().toLowerCase();
    const match = this.dishNameMap[idKey] || this.dishNameMap[nameKey];
    if (match) {
      return match[this.currentLang()] || match['en'] || dish.name;
    }
    return dish.name;
  }

  getDishDesc(dish: { id?: string; description?: string | null; name?: string } | null | undefined): string {
    if (!dish) return '';
    if (this.currentLang() === 'en') return dish.description || '';
    const idKey = (dish.id || '').toLowerCase();
    const nameKey = (dish.name || '').trim().toLowerCase();
    const match = (idKey ? this.dishDescMap[idKey] : null) || (nameKey ? this.dishDescMap[nameKey] : null);
    if (match) {
      return match[this.currentLang()] || match['en'] || dish.description || '';
    }
    return dish.description || '';
  }

  getCategoryName(cat: { id?: string; name: string } | null | undefined): string {
    if (!cat) return '';
    if (this.currentLang() === 'en') return cat.name;
    const idKey = (cat.id || '').toLowerCase();
    const nameKey = (cat.name || '').trim().toLowerCase();
    const match = this.categoryMap[idKey] || this.categoryMap[nameKey];
    if (match) {
      return match[this.currentLang()] || match['en'] || cat.name;
    }
    return cat.name;
  }

  getIngredientName(name: string | null | undefined): string {
    if (!name) return '';
    if (this.currentLang() === 'en') return name;
    const key = name.trim().toLowerCase();
    const match = this.ingredientNameMap[key];
    if (match) {
      return match[this.currentLang()] || match['en'] || name;
    }
    return name;
  }

  getIngredientNote(note: string | null | undefined): string {
    if (!note) return '';
    if (this.currentLang() === 'en') return note;
    const key = note.trim().toLowerCase();
    const match = this.ingredientNoteMap[key];
    if (match) {
      return match[this.currentLang()] || match['en'] || note;
    }
    return note;
  }

  formatUnit(unit: string | null | undefined): string {
    if (!unit) return '';
    const u = unit.toLowerCase().trim();
    if (['g', 'gram', 'grams'].includes(u)) {
      return this.t('unit.g');
    }
    if (['pcs', 'piece', 'pieces'].includes(u)) {
      return this.t('unit.pcs');
    }
    if (['ml', 'milli'].includes(u)) {
      return this.t('unit.ml');
    }
    if (['kg', 'kilo', 'kilogram'].includes(u)) {
      return this.t('unit.kg');
    }
    if (['l', 'liter', 'litre'].includes(u)) {
      return this.t('unit.l');
    }
    return unit;
  }

  formatPrepTime(time: string | null | undefined): string {
    if (!time) {
      return this.currentLang() === 'ta' ? '15 நிமிடங்கள்' : '15 mins';
    }
    if (this.currentLang() === 'ta') {
      return time
        .replace(/mins?/gi, 'நிமிடங்கள்')
        .replace(/hours?/gi, 'மணிநேரம்');
    }
    return time;
  }

  getEventTypeName(type: string | null | undefined): string {
    if (!type) return '';
    const t = type.toLowerCase().trim();
    if (t.includes('reception')) return this.t('eventType.reception');
    if (t.includes('muhurtham')) return this.t('eventType.muhurtham');
    if (t.includes('sangeet')) return this.t('eventType.sangeet');
    if (t.includes('engagement')) return this.t('eventType.engagement');
    if (t.includes('anniversary')) return this.t('eventType.anniversary');
    return type;
  }
}
