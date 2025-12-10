import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';
import 'package:mynaga_gabay/localization/locales.dart';
import 'package:mynaga_gabay/shared/color.dart';
import 'package:mynaga_gabay/shared/images.dart';

class ChatView extends StatelessWidget {
  const ChatView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    String selectedFlag(String? localeCode) {
      switch (localeCode) {
        case 'en':
          return AppImages.americanFlag;
        case 'fil':
          return AppImages.philippinesFlag;
        case 'bcl':
          return AppImages.bicolFlag;
        default:
          return AppImages.philippinesFlag;
      }
    }

    return BlocBuilder<AppBloc, AppState>(
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            leadingWidth: 70,
            leading: Padding(
              padding: const EdgeInsets.only(left: 12.0),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColor.primary, AppColor.secondary],
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.local_hospital,
                    color: Colors.white, size: 20),
              ),
            ),
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  LocaleData.titleKey.getString(context),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  LocaleData.subtitleKey.getString(context),
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
            actions: [
              // Theme toggle
              // IconButton(
              //   icon: Icon(
              //     themeProvider.isDark ? Icons.light_mode : Icons.dark_mode,
              //   ),
              //   onPressed: () => themeProvider.toggleTheme(),
              //   tooltip: themeProvider.isDark ? 'Light mode' : 'Dark mode',
              // ),
              // Language selector
              PopupMenuButton<String>(
                onSelected: (lang) {
                  context
                      .read<AppBloc>()
                      .add(AppLocaleChanged(localeCode: lang));
                },
                itemBuilder: (context) => [
                  _buildLanguageItem(
                    flag: AppImages.americanFlag,
                    name: 'English',
                    value: 'en',
                    isSelected: state.localeCode == 'en',
                  ),
                  _buildLanguageItem(
                    flag: AppImages.philippinesFlag,
                    name: 'Filipino',
                    value: 'fil',
                    isSelected: state.localeCode == 'fil',
                  ),
                  _buildLanguageItem(
                    flag: AppImages.bicolFlag,
                    name: 'Bikol',
                    value: 'bcl',
                    isSelected: state.localeCode == 'bcl',
                  ),
                ],
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Row(
                    children: [
                      Image.asset(
                        selectedFlag(state.localeCode),
                        width: 24,
                        height: 24,
                      ),
                      const Icon(Icons.arrow_drop_down),
                    ],
                  ),
                ),
              ),
              // Settings
            ],
          ),
        );
      },
    );
  }

  PopupMenuItem<String> _buildLanguageItem({
    required String flag,
    required String name,
    required String value,
    required bool isSelected,
  }) {
    return PopupMenuItem(
      value: value,
      child: Row(
        children: [
          Image.asset(flag, width: 24, height: 24),
          const SizedBox(width: 8),
          Text(
            name,
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.bold : null,
            ),
          ),
          if (isSelected) ...[
            const Spacer(),
            const Icon(Icons.check, size: 18),
          ],
        ],
      ),
    );
  }
}
