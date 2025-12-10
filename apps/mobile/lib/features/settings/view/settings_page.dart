import 'package:flutter/material.dart';
import 'package:mynaga_gabay/features/settings/view/settings_view.dart';

class SettingsPage extends StatelessWidget {
  static const String route = "settings_route";
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SettingsView();
  }
}