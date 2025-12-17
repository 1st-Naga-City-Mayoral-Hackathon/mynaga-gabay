part of 'app_bloc.dart';

@immutable
sealed class AppEvent {}

class AppLocaleChanged extends AppEvent {
  final String localeCode;

  AppLocaleChanged({required this.localeCode});
}

class AppThemeModeChanged extends AppEvent {
  final ThemeMode themeMode;

  AppThemeModeChanged({required this.themeMode});
}
