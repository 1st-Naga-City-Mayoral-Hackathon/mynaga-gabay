import 'package:get_it/get_it.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';

final getIt = GetIt.instance;

class AppLocator {
  static Future<void> init() async {
    getIt.registerLazySingleton<AppBloc>(() => AppBloc());
  }
}
