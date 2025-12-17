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
  VOICE_CONFIG: () => VOICE_CONFIG
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_ENDPOINTS,
  APP_CONFIG,
  DEFAULT_LANGUAGE,
  LANGUAGE_GREETINGS,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  VOICE_CONFIG
});
