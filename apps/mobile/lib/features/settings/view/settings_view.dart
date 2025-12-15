import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';
import 'package:mynaga_gabay/localization/locales.dart';
import '../../../shared/color.dart';

class SettingsView extends StatelessWidget {
  const SettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 32),
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColor.primary,
                    border: Border.all(
                      color: AppColor.primary,
                      width: 2,
                    ),
                  ),
                  child: const Icon(
                    Icons.person,
                    size: 48,
                    color: AppColor.primary,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Juan Dela Cruz',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'juan.delacruz@email.com',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColor.grey,
                      ),
                ),
                const SizedBox(height: 40),
                _buildSettingsSection(
                  context,
                  title: LocaleData.settingsThemeKey.getString(context),
                  children: [
                    _buildSettingTile(
                      context,
                      title:
                          LocaleData.settingsThemeLightKey.getString(context),
                      icon: Icons.light_mode_outlined,
                      isSelected: false,
                      onTap: () => context
                          .read<AppBloc>()
                          .add(AppThemeModeChanged(themeMode: ThemeMode.light)),
                    ),
                    _buildSettingTile(
                      context,
                      title: LocaleData.settingsThemeDarkKey.getString(context),
                      icon: Icons.dark_mode_outlined,
                      isSelected: false,
                      onTap: () => context
                          .read<AppBloc>()
                          .add(AppThemeModeChanged(themeMode: ThemeMode.dark)),
                    ),
                    _buildSettingTile(
                      context,
                      title:
                          LocaleData.settingsThemeSystemKey.getString(context),
                      icon: Icons.brightness_auto_outlined,
                      isSelected: false,
                      onTap: () => context.read<AppBloc>().add(
                          AppThemeModeChanged(themeMode: ThemeMode.system)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildSettingsSection(
                  context,
                  title: LocaleData.settingsLanguageKey.getString(context),
                  children: [
                    _buildSettingTile(
                      context,
                      title: 'English',
                      icon: Icons.language,
                      trailing: '🇺🇸',
                      isSelected: false,
                      onTap: () => context
                          .read<AppBloc>()
                          .add(AppLocaleChanged(localeCode: 'en')),
                    ),
                    _buildSettingTile(
                      context,
                      title: 'Filipino',
                      icon: Icons.language,
                      trailing: '🇵🇭',
                      isSelected: false,
                      onTap: () => context
                          .read<AppBloc>()
                          .add(AppLocaleChanged(localeCode: 'fil')),
                    ),
                    _buildSettingTile(
                      context,
                      title: 'Bikol',
                      icon: Icons.language,
                      trailing: '🏝️',
                      isSelected: false,
                      onTap: () => context
                          .read<AppBloc>()
                          .add(AppLocaleChanged(localeCode: 'bcl')),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildSettingsSection(
                  context,
                  title: LocaleData.settingsAboutKey.getString(context),
                  children: [
                    _buildSettingTile(
                      context,
                      title: LocaleData.settingsVersionKey.getString(context),
                      icon: Icons.info_outline,
                      trailing: '1.0.0',
                      onTap: null,
                    ),
                  ],
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: AppColor.grey,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: AppColor.border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildSettingTile(
    BuildContext context, {
    required String title,
    required IconData icon,
    String? trailing,
    bool isSelected = false,
    required VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? AppColor.primary.withOpacity(0.05) : null,
          border: Border(
            bottom: BorderSide(
              color: AppColor.border.withOpacity(0.5),
              width: 0.5,
            ),
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? AppColor.primary : AppColor.grey,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w400,
                      color: isSelected ? AppColor.primary : null,
                    ),
              ),
            ),
            if (trailing != null) ...[
              Text(
                trailing,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColor.grey,
                    ),
              ),
            ],
            if (isSelected) ...[
              const SizedBox(width: 8),
              const Icon(
                Icons.check_circle,
                size: 20,
                color: AppColor.primary,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
