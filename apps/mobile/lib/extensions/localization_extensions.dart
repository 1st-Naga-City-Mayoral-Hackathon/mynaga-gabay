import 'package:flutter/material.dart';
import 'package:mynaga_gabay/l10n/app_localizations.dart';

extension LocalizationExt on BuildContext {
  AppLocalizations get loc => AppLocalizations.of(this)!;

  // Shortcut getters
  String get title => loc.title;
  String get subtitle => loc.subtitle;
}
