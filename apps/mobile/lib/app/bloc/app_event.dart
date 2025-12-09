part of 'app_bloc.dart';

@immutable
sealed class AppEvent {}

class AppLocaleChanged extends AppEvent {
  final String localeCode;

  AppLocaleChanged({required this.localeCode});
}
