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
export {
  API_ENDPOINTS,
  APP_CONFIG,
  DEFAULT_LANGUAGE,
  LANGUAGE_GREETINGS,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  VOICE_CONFIG
};
