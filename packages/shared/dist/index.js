"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_ENDPOINTS: () => API_ENDPOINTS,
  APP_CONFIG: () => APP_CONFIG,
  DEFAULT_LANGUAGE: () => DEFAULT_LANGUAGE,
  LANGUAGE_GREETINGS: () => LANGUAGE_GREETINGS,
  LANGUAGE_NAMES: () => LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES: () => SUPPORTED_LANGUAGES,
  VOICE_CONFIG: () => VOICE_CONFIG,
  detectRedFlags: () => detectRedFlags,
  detectSymptoms: () => detectSymptoms,
  determineUrgency: () => determineUrgency,
  getFollowUpQuestions: () => getFollowUpQuestions,
  getFollowUpQuestionsLocalized: () => getFollowUpQuestionsLocalized,
  getMedicationCard: () => getMedicationCard,
  isAssistantEnvelope: () => isAssistantEnvelope,
  isBookingCard: () => isBookingCard,
  isFacilityCard: () => isFacilityCard,
  isHealthRelated: () => isHealthRelated,
  isMedicationCard: () => isMedicationCard,
  isMedicationPlanCard: () => isMedicationPlanCard,
  isPrescriptionCard: () => isPrescriptionCard,
  isRouteCard: () => isRouteCard,
  isScheduleCard: () => isScheduleCard,
  triageMessage: () => triageMessage
});
module.exports = __toCommonJS(index_exports);

// src/types/assistant.ts
function isAssistantEnvelope(obj) {
  if (!obj || typeof obj !== "object") return false;
  const candidate = obj;
  return typeof candidate.text === "string" && typeof candidate.language === "string" && typeof candidate.safety === "object" && Array.isArray(candidate.cards);
}
function isMedicationCard(card) {
  return card.cardType === "medication";
}
function isFacilityCard(card) {
  return card.cardType === "facility";
}
function isRouteCard(card) {
  return card.cardType === "route";
}
function isScheduleCard(card) {
  return card.cardType === "schedule";
}
function isBookingCard(card) {
  return card.cardType === "booking";
}
function isPrescriptionCard(card) {
  return card.cardType === "prescription";
}
function isMedicationPlanCard(card) {
  return card.cardType === "medication_plan";
}

// src/constants/languages.ts
var SUPPORTED_LANGUAGES = ["en", "fil", "bcl"];
var LANGUAGE_NAMES = {
  en: "English",
  fil: "Filipino",
  bcl: "Bikol"
};
var DEFAULT_LANGUAGE = "fil";
var LANGUAGE_GREETINGS = {
  en: "Hello! I am Gabay, your health assistant. How can I help you today?",
  fil: "Kamusta! Ako si Gabay, ang iyong katulong sa kalusugan. Paano kita matutulungan ngayon?",
  bcl: "Kumusta! Ako si Gabay, an saimong katabang sa salud. Paano taka matabangan ngunyan?"
};

// src/constants/config.ts
var APP_CONFIG = {
  name: "MyNaga Gabay",
  version: "0.1.0",
  description: "Bikolano Health Assistant for Naga City"
};
var API_ENDPOINTS = {
  chat: "/api/chat",
  voice: "/api/voice",
  prescription: "/api/prescription",
  facilities: "/api/facilities",
  health: "/api/health"
};
var VOICE_CONFIG = {
  maxDurationSeconds: 60,
  sampleRate: 16e3,
  mimeType: "audio/webm"
};

// src/triage/index.ts
var SYMPTOM_PATTERNS = {
  cough: [
    /\b(cough|coughing|ubo|nag-?ubo|inuubo)\b/i,
    /\b(masakit.*lalamunan|sore.*throat)\b/i
  ],
  fever: [
    /\b(fever|lagnat|init.*katawan|nininitaykos|mainit)\b/i,
    /\b(temperature|temp|sukat.*init)\b/i
  ],
  headache: [
    /\b(headache|sakit.*ulo|masakit.*ulo|head.*pain)\b/i,
    /\b(migraine|migrain)\b/i
  ],
  stomachache: [
    /\b(stomach.*ache|sakit.*tiyan|masakit.*tiyan|tummy.*ache)\b/i,
    /\b(abdominal.*pain|cramps)\b/i
  ],
  diarrhea: [
    /\b(diarrhea|diarrhoea|loose.*bowel|pagtatae|lbm)\b/i
  ],
  cold: [
    /\b(cold|sipon|runny.*nose|nasal.*congestion|ubo.*at.*sipon)\b/i
  ]
};
var RED_FLAG_PATTERNS = {
  cough: [
    { pattern: /\b(blood|dugo|may.*dugo|duguan|hemoptysis)\b/i, message: "Blood in sputum/coughing blood" },
    { pattern: /\b(chest.*pain|sakit.*dibdib|masakit.*dibdib)\b/i, message: "Chest pain with cough" },
    { pattern: /\b(breathing|difficulty|hirap.*huminga|shortness.*breath|di.*makahinga)\b/i, message: "Difficulty breathing" },
    { pattern: /\b(high.*fever|mataas.*lagnat|39|40|41)\b/i, message: "High fever (39\xB0C or above)" },
    { pattern: /\b(more.*than.*2.*weeks|2\+.*weeks|matagal.*na|ilang.*linggo)\b/i, message: "Cough lasting more than 2 weeks" }
  ],
  fever: [
    { pattern: /\b(very.*high|mataas.*mataas|40|41|42)\b/i, message: "Very high fever (40\xB0C or above)" },
    { pattern: /\b(seizure|convulsion|kombulsyon|nanginginig)\b/i, message: "Seizure/convulsion with fever" },
    { pattern: /\b(stiff.*neck|masakit.*leeg|hindi.*maka.*tingin)\b/i, message: "Stiff neck with fever" },
    { pattern: /\b(confused|disoriented|lito|ligaw)\b/i, message: "Confusion/disorientation" }
  ],
  general: [
    { pattern: /\b(pregnant|buntis|nagbubuntis)\b/i, message: "Pregnant - requires medical consultation" },
    { pattern: /\b(baby|infant|sanggol|under.*2|below.*2)\b/i, message: "Infant/child under 2 years" },
    { pattern: /\b(emergency|emergency|emergency)\b/i, message: "Emergency situation mentioned" },
    { pattern: /\b(unconscious|nawalan.*malay|hindi.*maka.*respond)\b/i, message: "Loss of consciousness" }
  ]
};
var OTC_MEDICATIONS = {
  cough: [
    {
      genericName: "Dextromethorphan",
      brandExamples: ["Robitussin DM", "Delsym"],
      why: "Suppresses dry cough reflex",
      howToUseGeneral: "Follow package directions. Usually 10-20mg every 4-6 hours. Do not exceed maximum daily dose.",
      cautions: ["May cause drowsiness", "Do not use with other cough suppressants"],
      avoidIf: ["Chronic cough with mucus", "Currently taking MAO inhibitors", "Liver disease"],
      whenToSeeDoctor: "If cough persists more than 7 days, or is accompanied by fever, rash, or persistent headache"
    },
    {
      genericName: "Guaifenesin",
      brandExamples: ["Mucinex", "Robitussin Expectorant"],
      why: "Helps loosen and thin mucus for productive (wet) cough",
      howToUseGeneral: "Take with plenty of water. Usually 200-400mg every 4 hours.",
      cautions: ["Drink plenty of fluids", "May cause nausea if taken without water"],
      avoidIf: ["Kidney problems", "Currently taking blood thinners"],
      whenToSeeDoctor: "If symptoms do not improve within 7 days or worsen"
    },
    {
      genericName: "Honey and Lemon",
      brandExamples: ["Natural remedy"],
      why: "Soothes throat and provides temporary relief for mild cough",
      howToUseGeneral: "Mix 1 tablespoon honey with warm water and lemon. Take as needed.",
      cautions: ["Safe for most adults"],
      avoidIf: ["Children under 1 year (honey)", "Diabetics (limit honey intake)"],
      whenToSeeDoctor: "If cough persists more than a week"
    }
  ],
  fever: [
    {
      genericName: "Paracetamol (Acetaminophen)",
      brandExamples: ["Biogesic", "Tempra", "Tylenol"],
      why: "Reduces fever and provides pain relief",
      howToUseGeneral: "Adults: 500-1000mg every 4-6 hours. Max 4000mg/day.",
      cautions: ["Do not exceed maximum dose", "Avoid alcohol while taking"],
      avoidIf: ["Liver disease", "Already taking other paracetamol-containing medicines"],
      whenToSeeDoctor: "If fever exceeds 39\xB0C, lasts more than 3 days, or is accompanied by severe symptoms"
    },
    {
      genericName: "Ibuprofen",
      brandExamples: ["Advil", "Medicol", "Flanax"],
      why: "Reduces fever and inflammation",
      howToUseGeneral: "Adults: 200-400mg every 4-6 hours with food. Max 1200mg/day for OTC use.",
      cautions: ["Take with food to reduce stomach upset", "May increase blood pressure"],
      avoidIf: ["Stomach ulcers", "Kidney disease", "Heart conditions", "Pregnant (3rd trimester)"],
      whenToSeeDoctor: "If fever persists more than 3 days or symptoms worsen"
    }
  ],
  headache: [
    {
      genericName: "Paracetamol (Acetaminophen)",
      brandExamples: ["Biogesic", "Tempra", "Tylenol"],
      why: "Effective for mild to moderate headache",
      howToUseGeneral: "Adults: 500-1000mg every 4-6 hours. Max 4000mg/day.",
      cautions: ["Do not exceed maximum dose"],
      avoidIf: ["Liver disease"],
      whenToSeeDoctor: "If headaches are severe, frequent, or accompanied by vision changes, neck stiffness, or confusion"
    }
  ],
  stomachache: [
    {
      genericName: "Antacid (Aluminum/Magnesium Hydroxide)",
      brandExamples: ["Kremil-S", "Maalox", "Mylanta"],
      why: "Neutralizes stomach acid for heartburn and indigestion",
      howToUseGeneral: "Chew or dissolve in mouth 1-2 tablets after meals or as needed.",
      cautions: ["May affect absorption of other medications"],
      avoidIf: ["Kidney disease", "Taking antibiotics (wait 2 hours)"],
      whenToSeeDoctor: "If pain is severe, persistent, or accompanied by vomiting, bloody stool, or fever"
    }
  ],
  diarrhea: [
    {
      genericName: "Loperamide",
      brandExamples: ["Imodium", "Diatabs"],
      why: "Slows intestinal movement to reduce diarrhea",
      howToUseGeneral: "Adults: 4mg initially, then 2mg after each loose stool. Max 16mg/day.",
      cautions: ["Stay hydrated", "Do not use for more than 2 days without medical advice"],
      avoidIf: ["Bloody diarrhea", "High fever", "Bacterial infection suspected"],
      whenToSeeDoctor: "If diarrhea persists more than 2 days, contains blood, or is accompanied by high fever"
    },
    {
      genericName: "Oral Rehydration Salts (ORS)",
      brandExamples: ["Hydrite", "Oresol", "Pedialyte"],
      why: "Replaces lost fluids and electrolytes",
      howToUseGeneral: "Dissolve in clean water as directed. Drink small amounts frequently.",
      cautions: ["Use clean water only"],
      avoidIf: ["Vomiting (take small sips)"],
      whenToSeeDoctor: "If unable to keep fluids down or signs of severe dehydration"
    }
  ],
  cold: [
    {
      genericName: "Phenylephrine",
      brandExamples: ["Neozep", "Sudafed PE"],
      why: "Relieves nasal congestion",
      howToUseGeneral: "Follow package directions. Usually every 4-6 hours.",
      cautions: ["May increase blood pressure", "May cause insomnia if taken at night"],
      avoidIf: ["High blood pressure", "Heart disease", "Taking MAO inhibitors"],
      whenToSeeDoctor: "If symptoms persist more than 7 days or worsen"
    },
    {
      genericName: "Loratadine",
      brandExamples: ["Claritin", "Allerta"],
      why: "Relieves runny nose and sneezing (antihistamine)",
      howToUseGeneral: "10mg once daily.",
      cautions: ["Usually non-drowsy but may affect some people"],
      avoidIf: ["Severe liver or kidney disease"],
      whenToSeeDoctor: "If symptoms persist or worsen"
    }
  ]
};
function detectSymptoms(message) {
  const results = [];
  for (const [symptom, patterns] of Object.entries(SYMPTOM_PATTERNS)) {
    const matched = patterns.some((pattern) => pattern.test(message));
    results.push({
      symptom,
      keywords: patterns.map((p) => p.source),
      matched
    });
  }
  return results;
}
function detectRedFlags(message, symptoms) {
  const flags = [];
  for (const { pattern, message: flagMessage } of RED_FLAG_PATTERNS.general) {
    if (pattern.test(message)) {
      flags.push(flagMessage);
    }
  }
  for (const symptom of symptoms) {
    const symptomFlags = RED_FLAG_PATTERNS[symptom];
    if (symptomFlags) {
      for (const { pattern, message: flagMessage } of symptomFlags) {
        if (pattern.test(message)) {
          flags.push(flagMessage);
        }
      }
    }
  }
  const erIndicators = [
    "Blood in sputum",
    "Chest pain",
    "Difficulty breathing",
    "Very high fever",
    "Seizure",
    "Loss of consciousness",
    "Stiff neck with fever"
  ];
  const requiresER = flags.some(
    (flag) => erIndicators.some((indicator) => flag.toLowerCase().includes(indicator.toLowerCase()))
  );
  return { flags, requiresER };
}
function determineUrgency(symptoms, redFlags, requiresER) {
  if (requiresER) {
    return "er";
  }
  if (redFlags.length > 0) {
    return "clinic";
  }
  if (symptoms.length > 0) {
    return "self_care";
  }
  return "self_care";
}
function getMedicationCard(symptoms) {
  const items = [];
  for (const symptom of symptoms) {
    const meds = OTC_MEDICATIONS[symptom];
    if (meds) {
      items.push(...meds.slice(0, 2));
    }
  }
  if (items.length === 0) {
    return void 0;
  }
  return {
    cardType: "medication",
    title: "Over-the-Counter Medicine Options",
    items,
    generalDisclaimer: "This is general information only. Always read the label carefully, follow dosage instructions, and consult a pharmacist or doctor before taking any medication, especially if you have other health conditions or are taking other medicines."
  };
}
function getFollowUpQuestions(symptoms) {
  const questions = [];
  if (symptoms.includes("cough")) {
    questions.push("Gaano na katagal ang iyong pag-uubo? (How long have you been coughing?)");
    questions.push("May lagnat ka ba? (Do you have a fever?)");
    questions.push("Nahihirapan ka bang huminga? (Do you have difficulty breathing?)");
  }
  if (symptoms.includes("fever")) {
    questions.push("Gaano kataas ang iyong lagnat? (How high is your temperature?)");
    questions.push("May iba pa bang sintomas tulad ng sakit ng ulo o pananakit ng katawan? (Do you have other symptoms like headache or body pain?)");
  }
  return questions.slice(0, 3);
}
function getFollowUpQuestionsLocalized(symptoms, language) {
  const questions = [];
  if (symptoms.includes("cough")) {
    if (language === "english") {
      questions.push("How long have you been coughing?");
      questions.push("Do you have a fever?");
      questions.push("Are you having difficulty breathing?");
    } else if (language === "bikol") {
      questions.push("Pirmi na kadakul an imo ubo?");
      questions.push("May hilanat ka?");
      questions.push("Nahihirapan ka maghawa?");
    } else {
      questions.push("Gaano na katagal ang iyong pag-uubo?");
      questions.push("May lagnat ka ba?");
      questions.push("Nahihirapan ka bang huminga?");
    }
  }
  if (symptoms.includes("fever")) {
    if (language === "english") {
      questions.push("How high is your temperature?");
      questions.push("Do you have other symptoms like headache or body pain?");
    } else if (language === "bikol") {
      questions.push("Gurano kataas an imo hilanat?");
      questions.push("May iba pa ka pang sintomas, arog kan hapdos sa ulo o hararom an lawas?");
    } else {
      questions.push("Gaano kataas ang iyong lagnat?");
      questions.push("May iba pa bang sintomas tulad ng sakit ng ulo o pananakit ng katawan?");
    }
  }
  return questions.slice(0, 3);
}
function triageMessage(message, language = "tagalog") {
  const symptomMatches = detectSymptoms(message);
  const detectedSymptoms = symptomMatches.filter((s) => s.matched).map((s) => s.symptom);
  const { flags: redFlags, requiresER } = detectRedFlags(message, detectedSymptoms);
  const urgency = determineUrgency(detectedSymptoms, redFlags, requiresER);
  const medicationCard = urgency === "self_care" ? getMedicationCard(detectedSymptoms) : void 0;
  const followUpQuestions = detectedSymptoms.length > 0 && urgency !== "er" ? getFollowUpQuestionsLocalized(detectedSymptoms, language) : void 0;
  let facilityType = "none";
  if (requiresER) {
    facilityType = "er";
  } else if (redFlags.length > 0) {
    facilityType = "hospital";
  } else if (detectedSymptoms.length > 0) {
    facilityType = "clinic";
  }
  const safety = {
    urgency,
    redFlags: redFlags.length > 0 ? redFlags : void 0,
    disclaimer: buildDisclaimer(urgency, redFlags.length > 0, language)
  };
  return {
    detectedSymptoms,
    safety,
    medicationCard,
    followUpQuestions,
    facilityType
  };
}
function buildDisclaimer(urgency, hasRedFlags, language) {
  if (urgency === "er") {
    if (language === "english") {
      return "WARNING: Your symptoms may be serious. Please go to the nearest emergency room immediately or call emergency services.";
    }
    if (language === "bikol") {
      return "BABALA: Pwedeng seryoso an imo mga sintomas. Paki-adto sa pinakamalapit na emergency room ngunyan o tumawag sa emergency services.";
    }
    return "BABALA: Ang iyong mga sintomas ay maaaring seryoso. Mangyaring pumunta sa pinakamalapit na emergency room kaagad o tumawag sa emergency services.";
  }
  if (hasRedFlags) {
    if (language === "english") {
      return "Important: Some symptoms may need medical attention. We recommend consulting a healthcare professional soon.";
    }
    if (language === "bikol") {
      return "Importante: May mga sintomas na pwedeng kailangang makita nin doktor. Irekomenda namon na kumonsulta sa healthcare professional sa pinakadali.";
    }
    return "Mahalaga: May ilang sintomas na maaaring kailangang tingnan ng doktor. Inirerekomenda naming kumonsulta sa isang healthcare professional sa lalong madaling panahon.";
  }
  if (language === "english") {
    return "Reminder: This information is general guidance only and not a substitute for professional medical advice. Consult a doctor or pharmacist if unsure.";
  }
  if (language === "bikol") {
    return "Pahiling: Ini pangkalahatang gabay sana, bako kapalit nin propesyonal na medikal na payo. Kumonsulta sa doktor o pharmacist kun dae ka sigurado.";
  }
  return "Paalala: Ang impormasyong ito ay pangkalahatang gabay lamang at hindi kapalit ng propesyonal na medikal na payo. Kumonsulta sa doktor o pharmacist kung hindi ka sigurado.";
}
function isHealthRelated(message) {
  const healthKeywords = [
    // English
    /\b(symptom|symptoms|pain|ache|sick|ill|fever|cough\w*|cold|flu|medicine|medication|drug|drugs|doctor|hospital|clinic|health|hurt|injury|breath\w*|shortness\s+of\s+breath|chest\s+pain|bleed\w*|blood)\b/i,
    // Filipino
    /\b(sakit|masakit|lagnat|ubo|inuubo|sipon|trangkaso|gamot|doktor|ospital|klinika|kalusugan|sugat|hinga|huminga|hirap\s*huminga|dugo)\b/i,
    // Bikol
    /\b(hapdos|kulog|hilanat|ubo|sipon|trangkaso|bulong|doktor|ospital|maghawa|hawa|dugo)\b/i
  ];
  return healthKeywords.some((pattern) => pattern.test(message));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_ENDPOINTS,
  APP_CONFIG,
  DEFAULT_LANGUAGE,
  LANGUAGE_GREETINGS,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  VOICE_CONFIG,
  detectRedFlags,
  detectSymptoms,
  determineUrgency,
  getFollowUpQuestions,
  getFollowUpQuestionsLocalized,
  getMedicationCard,
  isAssistantEnvelope,
  isBookingCard,
  isFacilityCard,
  isHealthRelated,
  isMedicationCard,
  isMedicationPlanCard,
  isPrescriptionCard,
  isRouteCard,
  isScheduleCard,
  triageMessage
});
