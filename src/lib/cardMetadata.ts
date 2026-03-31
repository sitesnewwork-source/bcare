export type CardBrandKey = "visa" | "mastercard" | "mada" | "amex" | "unionpay" | "unknown";

export type CardMetadata = {
  bankName: string;
  brandKey: CardBrandKey;
  brandLabel: string;
  classificationLabel: string;
  isDetected: boolean;
};

type IssuerRule = {
  bankName: string;
  brandKey: Exclude<CardBrandKey, "unknown">;
  classificationLabel: string;
  prefix: string;
};

const issuerRules: IssuerRule[] = [
  // مصرف الراجحي
  { prefix: "458393", bankName: "مصرف الراجحي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "468540", bankName: "مصرف الراجحي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "468541", bankName: "مصرف الراجحي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "468542", bankName: "مصرف الراجحي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "468543", bankName: "مصرف الراجحي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "417633", bankName: "مصرف الراجحي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "446393", bankName: "مصرف الراجحي", brandKey: "visa", classificationLabel: "مسبقة الدفع" },
  { prefix: "403024", bankName: "مصرف الراجحي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "406136", bankName: "مصرف الراجحي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "419514", bankName: "مصرف الراجحي", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "432328", bankName: "مصرف الراجحي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "529415", bankName: "مصرف الراجحي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "543357", bankName: "مصرف الراجحي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "549760", bankName: "مصرف الراجحي", brandKey: "mastercard", classificationLabel: "بلاتينية" },
  // البنك الأهلي السعودي
  { prefix: "440647", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "440795", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "445564", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "446404", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "457865", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "457997", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "489317", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "489318", bankName: "البنك الأهلي السعودي", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "431361", bankName: "البنك الأهلي السعودي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "411111", bankName: "البنك الأهلي السعودي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "428671", bankName: "البنك الأهلي السعودي", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "428672", bankName: "البنك الأهلي السعودي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "420132", bankName: "البنك الأهلي السعودي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "410685", bankName: "البنك الأهلي السعودي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "455036", bankName: "البنك الأهلي السعودي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "524514", bankName: "البنك الأهلي السعودي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "537767", bankName: "البنك الأهلي السعودي", brandKey: "mastercard", classificationLabel: "بلاتينية" },
  { prefix: "535825", bankName: "البنك الأهلي السعودي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك الرياض
  { prefix: "513213", bankName: "بنك الرياض", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "968209", bankName: "بنك الرياض", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "532013", bankName: "بنك الرياض", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "543085", bankName: "بنك الرياض", brandKey: "mastercard", classificationLabel: "مسبقة الدفع" },
  { prefix: "450046", bankName: "بنك الرياض", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "421141", bankName: "بنك الرياض", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "450661", bankName: "بنك الرياض", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "407197", bankName: "بنك الرياض", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "455647", bankName: "بنك الرياض", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "456996", bankName: "بنك الرياض", brandKey: "mada", classificationLabel: "خصم مباشر" },
  // مصرف الإنماء
  { prefix: "42689700", bankName: "مصرف الإنماء", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "636120", bankName: "مصرف الإنماء", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "422817", bankName: "مصرف الإنماء", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "428331", bankName: "مصرف الإنماء", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "440533", bankName: "مصرف الإنماء", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "440534", bankName: "مصرف الإنماء", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "542160", bankName: "مصرف الإنماء", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك الجزيرة
  { prefix: "489319", bankName: "بنك الجزيرة", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "504300", bankName: "بنك الجزيرة", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "968211", bankName: "بنك الجزيرة", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "434886", bankName: "بنك الجزيرة", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "427015", bankName: "بنك الجزيرة", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "542024", bankName: "بنك الجزيرة", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // البنك السعودي الفرنسي (بنك ساب حالياً)
  { prefix: "968208", bankName: "بنك ساب", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "485740", bankName: "بنك ساب", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "402208", bankName: "بنك ساب", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "431202", bankName: "بنك ساب", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "456515", bankName: "بنك ساب", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "524130", bankName: "بنك ساب", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "536023", bankName: "بنك ساب", brandKey: "mastercard", classificationLabel: "بلاتينية" },
  // بنك البلاد
  { prefix: "588845", bankName: "بنك البلاد", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "588848", bankName: "بنك البلاد", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "588846", bankName: "بنك البلاد", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "588847", bankName: "بنك البلاد", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "468544", bankName: "بنك البلاد", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "558563", bankName: "بنك البلاد", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "457954", bankName: "بنك البلاد", brandKey: "visa", classificationLabel: "ائتمانية" },
  // البنك السعودي للاستثمار
  { prefix: "508160", bankName: "البنك السعودي للاستثمار", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "419593", bankName: "البنك السعودي للاستثمار", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "439954", bankName: "البنك السعودي للاستثمار", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "407215", bankName: "البنك السعودي للاستثمار", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "543210", bankName: "البنك السعودي للاستثمار", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك الإمارات دبي الوطني (السعودية)
  { prefix: "455708", bankName: "بنك الإمارات دبي الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "410621", bankName: "بنك الإمارات دبي الوطني", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "431313", bankName: "بنك الإمارات دبي الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "526590", bankName: "بنك الإمارات دبي الوطني", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // البنك العربي الوطني
  { prefix: "431957", bankName: "البنك العربي الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "968210", bankName: "البنك العربي الوطني", brandKey: "mada", classificationLabel: "خصم مباشر" },
  { prefix: "409201", bankName: "البنك العربي الوطني", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "458456", bankName: "البنك العربي الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "521076", bankName: "البنك العربي الوطني", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك الخليج الدولي
  { prefix: "403010", bankName: "بنك الخليج الدولي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "435949", bankName: "بنك الخليج الدولي", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "521241", bankName: "بنك الخليج الدولي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك الأول (First Abu Dhabi Bank - السعودية)
  { prefix: "426095", bankName: "بنك الأول", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "435671", bankName: "بنك الأول", brandKey: "visa", classificationLabel: "بلاتينية" },
  // STC Pay
  { prefix: "636180", bankName: "STC Pay", brandKey: "mada", classificationLabel: "مسبقة الدفع" },
  { prefix: "539931", bankName: "STC Pay", brandKey: "mastercard", classificationLabel: "مسبقة الدفع" },
  // بنك التنمية الاجتماعية
  { prefix: "407395", bankName: "بنك التنمية الاجتماعية", brandKey: "visa", classificationLabel: "مسبقة الدفع" },

  // ========== بنوك خليجية ==========

  // بنك الكويت الوطني (NBK)
  { prefix: "415268", bankName: "بنك الكويت الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "431940", bankName: "بنك الكويت الوطني", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "525280", bankName: "بنك الكويت الوطني", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  { prefix: "547002", bankName: "بنك الكويت الوطني", brandKey: "mastercard", classificationLabel: "بلاتينية" },
  // بيت التمويل الكويتي (KFH)
  { prefix: "409076", bankName: "بيت التمويل الكويتي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "432232", bankName: "بيت التمويل الكويتي", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "537125", bankName: "بيت التمويل الكويتي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك بوبيان (الكويت)
  { prefix: "432271", bankName: "بنك بوبيان", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "543700", bankName: "بنك بوبيان", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك الخليج (الكويت)
  { prefix: "400360", bankName: "بنك الخليج - الكويت", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "527483", bankName: "بنك الخليج - الكويت", brandKey: "mastercard", classificationLabel: "ائتمانية" },

  // بنك الإمارات دبي الوطني (الإمارات)
  { prefix: "431565", bankName: "الإمارات دبي الوطني - الإمارات", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "457862", bankName: "الإمارات دبي الوطني - الإمارات", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "524940", bankName: "الإمارات دبي الوطني - الإمارات", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك أبوظبي الأول (FAB)
  { prefix: "423535", bankName: "بنك أبوظبي الأول", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "446288", bankName: "بنك أبوظبي الأول", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "521093", bankName: "بنك أبوظبي الأول", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // مصرف أبوظبي الإسلامي (ADIB)
  { prefix: "410520", bankName: "مصرف أبوظبي الإسلامي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "542418", bankName: "مصرف أبوظبي الإسلامي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك دبي الإسلامي (DIB)
  { prefix: "422218", bankName: "بنك دبي الإسلامي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "455401", bankName: "بنك دبي الإسلامي", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "526233", bankName: "بنك دبي الإسلامي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك المشرق (الإمارات)
  { prefix: "422071", bankName: "بنك المشرق", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "544066", bankName: "بنك المشرق", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك رأس الخيمة الوطني (RAKBANK)
  { prefix: "426090", bankName: "بنك رأس الخيمة الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "540012", bankName: "بنك رأس الخيمة الوطني", brandKey: "mastercard", classificationLabel: "ائتمانية" },

  // بنك قطر الوطني (QNB)
  { prefix: "428900", bankName: "بنك قطر الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "457680", bankName: "بنك قطر الوطني", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "521268", bankName: "بنك قطر الوطني", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // مصرف قطر الإسلامي (QIB)
  { prefix: "421091", bankName: "مصرف قطر الإسلامي", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "537033", bankName: "مصرف قطر الإسلامي", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // البنك التجاري القطري
  { prefix: "440584", bankName: "البنك التجاري القطري", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "535316", bankName: "البنك التجاري القطري", brandKey: "mastercard", classificationLabel: "ائتمانية" },

  // بنك البحرين الوطني (NBB)
  { prefix: "423825", bankName: "بنك البحرين الوطني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "543095", bankName: "بنك البحرين الوطني", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // بنك ABC (البحرين)
  { prefix: "422059", bankName: "بنك ABC", brandKey: "visa", classificationLabel: "ائتمانية" },

  // بنك مسقط (عمان)
  { prefix: "418810", bankName: "بنك مسقط", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "439334", bankName: "بنك مسقط", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "526644", bankName: "بنك مسقط", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // البنك الوطني العماني
  { prefix: "410070", bankName: "البنك الوطني العماني", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "541350", bankName: "البنك الوطني العماني", brandKey: "mastercard", classificationLabel: "ائتمانية" },

  // ========== بنوك دولية ==========

  // HSBC
  { prefix: "421572", bankName: "HSBC", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "426395", bankName: "HSBC", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "535420", bankName: "HSBC", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // Citibank
  { prefix: "415928", bankName: "Citibank", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "438857", bankName: "Citibank", brandKey: "visa", classificationLabel: "بلاتينية" },
  { prefix: "540735", bankName: "Citibank", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // Standard Chartered
  { prefix: "411762", bankName: "Standard Chartered", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "527530", bankName: "Standard Chartered", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // Barclays
  { prefix: "431940", bankName: "Barclays", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "559900", bankName: "Barclays", brandKey: "mastercard", classificationLabel: "ائتمانية" },
  // JPMorgan Chase
  { prefix: "414709", bankName: "JPMorgan Chase", brandKey: "visa", classificationLabel: "ائتمانية" },
  { prefix: "528209", bankName: "JPMorgan Chase", brandKey: "mastercard", classificationLabel: "ائتمانية" },
];

const madaPrefixes = [
  "440647", "440795", "445564", "446404", "457865", "457997",
  "458393", "468540", "468541", "468542", "468543", "468544",
  "489317", "489318", "489319", "504300", "508160",
  "455647", "456996",
  "588845", "588846", "588847", "588848",
  "636120", "636180",
  "968208", "968209", "968210", "968211",
];

const brandLabels: Record<CardBrandKey, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  mada: "مدى",
  amex: "American Express",
  unionpay: "UnionPay",
  unknown: "غير معروف",
};

const getBrandKey = (digits: string): CardBrandKey => {
  if (!digits) return "unknown";

  if (madaPrefixes.some((prefix) => digits.startsWith(prefix))) {
    return "mada";
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(digits)) {
    return "amex";
  }

  if (/^4/.test(digits)) {
    return "visa";
  }

  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));

  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return "mastercard";
  }

  // UnionPay: starts with 62
  if (/^62/.test(digits)) {
    return "unionpay";
  }

  return "unknown";
};

export const getCardMetadata = (cardNumber: string): CardMetadata => {
  const digits = cardNumber.replace(/\D/g, "");

  if (!digits) {
    return {
      bankName: "سيظهر بعد إدخال رقم البطاقة",
      brandKey: "unknown",
      brandLabel: brandLabels.unknown,
      classificationLabel: "—",
      isDetected: false,
    };
  }

  const matchedRule = issuerRules.find((rule) => digits.startsWith(rule.prefix));

  if (matchedRule) {
    return {
      bankName: matchedRule.bankName,
      brandKey: matchedRule.brandKey,
      brandLabel: brandLabels[matchedRule.brandKey],
      classificationLabel: matchedRule.classificationLabel,
      isDetected: true,
    };
  }

  const brandKey = getBrandKey(digits);
  const hasBin = digits.length >= 6;

  return {
    bankName: hasBin ? "البنك المصدر غير محدد" : "أدخل أول 6 أرقام لإظهار البنك",
    brandKey,
    brandLabel: brandLabels[brandKey],
    classificationLabel:
      brandKey === "mada"
        ? "خصم مباشر"
        : brandKey === "unknown"
          ? hasBin
            ? "غير محدد"
            : "—"
          : "غير محدد",
    isDetected: brandKey !== "unknown" || hasBin,
  };
};