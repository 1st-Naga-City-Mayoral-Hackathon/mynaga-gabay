import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mynaga_gabay/app/app_locator.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';
import 'package:mynaga_gabay/features/settings/view/settings_view.dart';

class SettingsPage extends StatelessWidget {
  static const String route = "settings_route";
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: getIt<AppBloc>(),
      child: const SettingsView(),
    );
  }
}
