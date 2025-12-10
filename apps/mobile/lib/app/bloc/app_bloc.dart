import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:meta/meta.dart';
import 'package:mynaga_gabay/app/app_locator.dart';

part 'app_event.dart';
part 'app_state.dart';

class AppBloc extends Bloc<AppEvent, AppState> {
  AppBloc() : super(const AppState()) {
    on<AppLocaleChanged>(_onLocaleChanged);
  }

  void _onLocaleChanged(AppLocaleChanged event, Emitter<AppState> emit) {
    localization.translate(event.localeCode);
    emit(state.copyWith(localeCode: event.localeCode));
  }
}
