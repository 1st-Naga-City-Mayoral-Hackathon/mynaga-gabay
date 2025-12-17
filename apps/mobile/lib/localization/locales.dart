// ignore_for_file: constant_identifier_names

import 'package:flutter_localization/flutter_localization.dart';

const List<MapLocale> LOCALES = [
  MapLocale("en", LocaleData.EN),
  MapLocale("fil", LocaleData.FIL),
  MapLocale("bcl", LocaleData.BCL)
];

mixin LocaleData {
  static const String titleKey = "title";
  static const String subtitleKey = "subtitle";
  static const String chatGreetingKey = "chat_greeting";
  static const String chatPlaceholderKey = "chat_placeholder";
  static const String chatTypingKey = "chat_typing";
  static const String chatErrorKey = "chat_error";
  static const String chatNoMessagesKey = "chat_no_messages";
  static const String navChatKey = "nav_chat";
  static const String navFacilitiesKey = "nav_facilities";
  static const String navMedicationsKey = "nav_medications";
  static const String navPhilhealthKey = "nav_philhealth";
  static const String navSettingsKey = "nav_settings";
  static const String settingsTitleKey = "settings_title";
  static const String settingsThemeKey = "settings_theme";
  static const String settingsLanguageKey = "settings_language";
  static const String settingsThemeLightKey = "settings_theme_light";
  static const String settingsThemeDarkKey = "settings_theme_dark";
  static const String settingsThemeSystemKey = "settings_theme_system";
  static const String settingsAboutKey = "settings_about";
  static const String settingsVersionKey = "settings_version";
  static const String facilitySearchPlaceholderKey =
      "facility_search_placeholder";
  static const String facilityNoResultsKey = "facility_no_results";
  static const String facilityLoadingKey = "facility_loading";
  static const String facilityServicesKey = "facility_services";
  static const String facilityPhoneKey = "facility_phone";
  static const String facilityAddressKey = "facility_address";

  static const Map<String, dynamic> EN = {
    "title": "MyNaga Gabay",
    "subtitle": "Your Health Assistant",
    "chat_greeting": "Hello! I am Gabay, your health assistant.",
    "chat_placeholder": "Type here...",
    "chat_typing": "Gabay is typing...",
    "chat_error": "Sorry, there was a connection problem. Please try again.",
    "chat_no_messages": "No messages yet. Start a conversation with Gabay.",
    "nav_chat": "Chat",
    "nav_facilities": "Facilities",
    "nav_medications": "Medications",
    "nav_philhealth": "PhilHealth",
    "nav_settings": "Settings",
    "settings_title": "Settings",
    "settings_theme": "Theme",
    "settings_language": "Language",
    "settings_theme_light": "Light",
    "settings_theme_dark": "Dark",
    "settings_theme_system": "System",
    "settings_about": "About",
    "settings_version": "Version",
    "facility_search_placeholder": "Search by name, address, or service...",
    "facility_no_results": "No facilities found",
    "facility_loading": "Loading facilities...",
    "facility_services": "Services",
    "facility_phone": "Phone",
    "facility_address": "Address",
  };

  static const Map<String, dynamic> FIL = {
    "title": "MyNaga Gabay",
    "subtitle": "Ang Iyong Katulong sa Kalusugan",
    "chat_greeting": "Kamusta! Ako si Gabay, ang iyong katulong sa kalusugan.",
    "chat_placeholder": "Mag-type dito...",
    "chat_typing": "Gabay ay nag-tatype...",
    "chat_error": "Pasensya, may problema sa koneksyon. Subukan muli.",
    "chat_no_messages":
        "Walang mensahe yet. Mag-start ng isang konversasyon sa Gabay.",
    "nav_chat": "Chat",
    "nav_facilities": "Pasilidad",
    "nav_medications": "Gamot",
    "nav_philhealth": "PhilHealth",
    "nav_settings": "Settings",
    "settings_title": "Settings",
    "settings_theme": "Tema",
    "settings_language": "Wika",
    "settings_theme_light": "Maliwanag",
    "settings_theme_dark": "Madilim",
    "settings_theme_system": "System",
    "settings_about": "Tungkol",
    "settings_version": "Bersyon",
    "facility_search_placeholder":
        "Maghanap gamit ang pangalan, address, o serbisyo...",
    "facility_no_results": "Walang nahanap na pasilidad",
    "facility_loading": "Naglo-load ng mga pasilidad...",
    "facility_services": "Serbisyo",
    "facility_phone": "Telepono",
    "facility_address": "Address",
  };

  static const Map<String, dynamic> BCL = {
    "title": "MyNaga Gabay",
    "subtitle": "An Saimong Katabang sa Salud",
    "chat_greeting": "Kumusta! Ako si Gabay, an saimong katabang sa salud.",
    "chat_placeholder": "Mag-type digdi...",
    "chat_typing": "Gabay ay nag-tatype...",
    "chat_error": "Pasensya, may problema sa koneksyon. Subukan giraray.",
    "chat_no_messages":
        "Iyo pa man may mensahe. Magpoon nin sarong istorya sa Gabay.",
    "nav_chat": "Chat",
    "nav_facilities": "Pasilidad",
    "nav_medications": "Bulong",
    "nav_philhealth": "PhilHealth",
    "nav_settings": "Settings",
    "settings_title": "Settings",
    "settings_theme": "Tema",
    "settings_language": "Tataramon",
    "settings_theme_light": "Maliwanag",
    "settings_theme_dark": "Madiklom",
    "settings_theme_system": "System",
    "settings_about": "Manungod",
    "settings_version": "Bersyon",
    "facility_search_placeholder":
        "Maghanap gamit an ngaran, address, o serbisyo...",
    "facility_no_results": "Mayo nang nahanap na pasilidad",
    "facility_loading": "Naglo-load nin mga pasilidad...",
    "facility_services": "Serbisyo",
    "facility_phone": "Telepono",
    "facility_address": "Address",
  };
}
