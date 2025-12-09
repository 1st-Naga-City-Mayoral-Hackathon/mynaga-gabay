import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:mynaga_gabay/app/app_router.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';
import 'package:mynaga_gabay/l10n/app_localizations.dart';

class AppView extends StatefulWidget {
  const AppView({super.key});

  @override
  State<AppView> createState() => _AppViewState();
}

class _AppViewState extends State<AppView> {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AppBloc, AppState>(
      buildWhen: (previous, current) =>
          previous.localeCode != current.localeCode,
      builder: (context, state) {
        return MaterialApp.router(
          key: ValueKey(state.localeCode),
          locale: Locale(state.localeCode ?? "bcl", ""),
          title: 'MyNaga Gabay',
          debugShowCheckedModeBanner: false,
          // Add the localeResolutionCallback
          localeResolutionCallback: (currentLocale, supportedLocales) {
            // currentLocale will be the user's desired locale, e.g., Locale('bcl')

            // Check if Flutter's *built-in* delegates support this locale.
            // The supportedLocales list passed here are your defined supportedLocales: [en, fil, bcl]

            if (currentLocale != null) {
              // If the language code is 'bcl', we force it to use 'fil' or 'en'
              // for Material/Cupertino strings, but keep 'bcl' active so your
              // AppLocalizations.delegate still works for your custom strings.
              if (currentLocale.languageCode == 'bcl') {
                // Return 'fil' or 'en' as the *resolved* locale for standard widgets
                // This is the common fix for unsupported Material/Cupertino locales.
                return const Locale(
                    'fil', ''); // Or 'en' if you prefer English fallback
              }
            }
            // Otherwise, use the system default or the provided locale
            return currentLocale;
          },
          // themeMode: themeProvider.themeMode,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en', ""), // English
            Locale('fil', ""), // Filipino
            Locale('bcl', ""), // Bikol
          ],
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF0D9488), // Gabay teal
              brightness: Brightness.light,
            ),
            useMaterial3: true,
            appBarTheme: const AppBarTheme(
              centerTitle: false,
              elevation: 0,
            ),
          ),
          darkTheme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF0D9488),
              brightness: Brightness.dark,
            ),
            useMaterial3: true,
            appBarTheme: const AppBarTheme(
              centerTitle: false,
              elevation: 0,
            ),
          ),
          // home: const HomeScreen(),
          routerConfig: AppRouter.config,
        );
      },
    );
  }
}
