import 'package:flutter_localization/flutter_localization.dart';
import 'package:get_it/get_it.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';
import 'package:mynaga_gabay/features/chat/bloc/chat_bloc.dart';

final getIt = GetIt.instance;
final FlutterLocalization localization = FlutterLocalization.instance;

class AppLocator {
  static Future<void> init() async {
    getIt.registerLazySingleton<AppBloc>(() => AppBloc());
    getIt.registerLazySingleton<ChatBloc>(() => ChatBloc());
  }
}
