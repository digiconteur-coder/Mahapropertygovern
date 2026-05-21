import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "en" | "hi" | "mr" | "ta" | "te";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी",
  ta: "தமிழ்",
  te: "తెలుగు",
};

const T: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    properties: "Properties",
    transactions: "Transactions",
    profile: "Profile",
    transfer: "Transfer Property",
    applyLoan: "Apply Loan",
    dispute: "Raise Dispute",
    greeting: "Namaste",
    totalAssets: "Total Property Assets",
    myProperties: "My Properties",
    myTransactions: "My Transactions",
    liveActivity: "Live Activity Feed",
    govtSchemes: "Government Schemes",
    support: "24×7 Support",
    saveId: "Please save your BPCS ID",
    saveIdDesc: "Your unique BPCS ID is required for all property transactions, just like Aadhaar. Write it down safely.",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    properties: "संपत्तियां",
    transactions: "लेनदेन",
    profile: "प्रोफ़ाइल",
    transfer: "संपत्ति हस्तांतरण",
    applyLoan: "ऋण आवेदन",
    dispute: "विवाद दर्ज",
    greeting: "नमस्ते",
    totalAssets: "कुल संपत्ति मूल्य",
    myProperties: "मेरी संपत्तियां",
    myTransactions: "मेरे लेनदेन",
    liveActivity: "लाइव गतिविधि",
    govtSchemes: "सरकारी योजनाएं",
    support: "24×7 सहायता",
    saveId: "अपना BPCS ID सुरक्षित करें",
    saveIdDesc: "आपका BPCS ID सभी संपत्ति लेनदेन के लिए आवश्यक है, जैसे आधार। इसे सुरक्षित नोट करें।",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    properties: "मालमत्ता",
    transactions: "व्यवहार",
    profile: "प्रोफाइल",
    transfer: "मालमत्ता हस्तांतरण",
    applyLoan: "कर्ज अर्ज",
    dispute: "वाद दाखल करा",
    greeting: "नमस्कार",
    totalAssets: "एकूण मालमत्ता मूल्य",
    myProperties: "माझ्या मालमत्ता",
    myTransactions: "माझे व्यवहार",
    liveActivity: "थेट क्रियाकलाप",
    govtSchemes: "सरकारी योजना",
    support: "24×7 सहाय्य",
    saveId: "तुमचा BPCS ID जतन करा",
    saveIdDesc: "तुमचा BPCS ID सर्व मालमत्ता व्यवहारांसाठी आवश्यक आहे. तो सुरक्षित ठेवा.",
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    properties: "சொத்துகள்",
    transactions: "பரிவர்த்தனைகள்",
    profile: "சுயவிவரம்",
    transfer: "சொத்து பரிமாற்றம்",
    applyLoan: "கடன் விண்ணப்பிக்க",
    dispute: "தகராறு தெரிவிக்க",
    greeting: "வணக்கம்",
    totalAssets: "மொத்த சொத்து மதிப்பு",
    myProperties: "என் சொத்துகள்",
    myTransactions: "என் பரிவர்த்தனைகள்",
    liveActivity: "நேரடி செயல்பாடு",
    govtSchemes: "அரசு திட்டங்கள்",
    support: "24×7 ஆதரவு",
    saveId: "உங்கள் BPCS ID சேமிக்கவும்",
    saveIdDesc: "உங்கள் BPCS ID அனைத்து சொத்து பரிவர்த்தனைகளுக்கும் தேவை. பாதுகாப்பாக எழுதி வையுங்கள்.",
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    properties: "ఆస్తులు",
    transactions: "లావాదేవీలు",
    profile: "ప్రొఫైల్",
    transfer: "ఆస్తి బదిలీ",
    applyLoan: "రుణం దరఖాస్తు",
    dispute: "వివాదం నమోదు",
    greeting: "నమస్కారం",
    totalAssets: "మొత్తం ఆస్తి విలువ",
    myProperties: "నా ఆస్తులు",
    myTransactions: "నా లావాదేవీలు",
    liveActivity: "లైవ్ కార్యాచరణ",
    govtSchemes: "ప్రభుత్వ పథకాలు",
    support: "24×7 మద్దతు",
    saveId: "మీ BPCS ID సేవ్ చేయండి",
    saveIdDesc: "మీ BPCS ID అన్ని ఆస్తి లావాదేవీలకు అవసరం. దాన్ని సురక్షితంగా నమోదు చేయండి.",
  },
};

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    AsyncStorage.getItem("bpcs_lang").then((v) => { if (v) setLangState(v as Lang); });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem("bpcs_lang", l);
  }, []);

  const t = useCallback((key: string) => {
    return T[lang]?.[key] ?? T.en[key] ?? key;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
