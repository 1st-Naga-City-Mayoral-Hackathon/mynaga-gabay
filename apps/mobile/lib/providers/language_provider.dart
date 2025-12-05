import 'package:flutter/material.dart';

enum AppLanguage { en, fil, bcl }

class LanguageProvider extends ChangeNotifier {
  AppLanguage _language = AppLanguage.fil;

  AppLanguage get language => _language;
  String get languageCode => _language.name;

  String get languageName {
    switch (_language) {
      case AppLanguage.en:
        return 'English';
      case AppLanguage.fil:
        return 'Filipino';
      case AppLanguage.bcl:
        return 'Bikol';
    }
  }

  String get languageFlag {
    switch (_language) {
      case AppLanguage.en:
        return '🇺🇸';
      case AppLanguage.fil:
        return '🇵🇭';
      case AppLanguage.bcl:
        return '🏝️';
    }
  }

  void setLanguage(AppLanguage lang) {
    _language = lang;
    notifyListeners();
  }

  // Translations
  String t(String key) {
    return _translations[_language]?[key] ?? key;
  }

  static final Map<AppLanguage, Map<String, String>> _translations = {
    AppLanguage.en: {
      'app.title': 'MyNaga Gabay',
      'app.subtitle': 'Your Health Assistant',
      'chat.greeting': 'Hello! I am Gabay, your health assistant.',
      'chat.placeholder': 'Type here...',
      'chat.error': 'Sorry, there was a connection problem. Please try again.',
      'nav.chat': 'Chat',
      'nav.facilities': 'Facilities',
      'nav.medications': 'Medications',
      'nav.philhealth': 'PhilHealth',
      'nav.settings': 'Settings',
      'settings.title': 'Settings',
      'settings.theme': 'Theme',
      'settings.language': 'Language',
      'settings.theme.light': 'Light',
      'settings.theme.dark': 'Dark',
      'settings.theme.system': 'System',
      'settings.about': 'About',
      'settings.version': 'Version',
    },
    AppLanguage.fil: {
      'app.title': 'MyNaga Gabay',
      'app.subtitle': 'Ang Iyong Katulong sa Kalusugan',
      'chat.greeting': 'Kamusta! Ako si Gabay, ang iyong katulong sa kalusugan.',
      'chat.placeholder': 'Mag-type dito...',
      'chat.error': 'Pasensya, may problema sa koneksyon. Subukan muli.',
      'nav.chat': 'Chat',
      'nav.facilities': 'Pasilidad',
      'nav.medications': 'Gamot',
      'nav.philhealth': 'PhilHealth',
      'nav.settings': 'Settings',
      'settings.title': 'Settings',
      'settings.theme': 'Tema',
      'settings.language': 'Wika',
      'settings.theme.light': 'Maliwanag',
      'settings.theme.dark': 'Madilim',
      'settings.theme.system': 'System',
      'settings.about': 'Tungkol',
      'settings.version': 'Bersyon',
    },
    AppLanguage.bcl: {
      'app.title': 'MyNaga Gabay',
      'app.subtitle': 'An Saimong Katabang sa Salud',
      'chat.greeting': 'Kumusta! Ako si Gabay, an saimong katabang sa salud.',
      'chat.placeholder': 'Mag-type digdi...',
      'chat.error': 'Pasensya, may problema sa koneksyon. Subukan giraray.',
      'nav.chat': 'Chat',
      'nav.facilities': 'Pasilidad',
      'nav.medications': 'Bulong',
      'nav.philhealth': 'PhilHealth',
      'nav.settings': 'Settings',
      'settings.title': 'Settings',
      'settings.theme': 'Tema',
      'settings.language': 'Tataramon',
      'settings.theme.light': 'Maliwanag',
      'settings.theme.dark': 'Madiklom',
      'settings.theme.system': 'System',
      'settings.about': 'Manungod',
      'settings.version': 'Bersyon',
    },
  };
}
