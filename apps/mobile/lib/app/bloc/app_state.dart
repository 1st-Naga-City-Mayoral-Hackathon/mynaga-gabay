part of 'app_bloc.dart';

@immutable
class AppState extends Equatable {
  final String? localeCode;

  const AppState({
    this.localeCode = "en",
  });

  AppState copyWith({
    String? localeCode,
  }) {
    return AppState(
      localeCode: localeCode ?? this.localeCode,
    );
  }

  @override
  List<Object?> get props => [
        localeCode,
      ];
}
