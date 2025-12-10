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

  static const Map<String, dynamic> EN = {
    "title": "MyNaga Gabay",
    "subtitle": "Your Health Assistant",
  };

  static const Map<String, dynamic> FIL = {
    "title": "MyNaga Gabay",
    "subtitle": "Ang Iyong Katulong sa Kalusugan",
  };

  static const Map<String, dynamic> BCL = {
    "title": "MyNaga Gabay",
    "subtitle": "An Saimong Katabang sa Salud",
  };
}
