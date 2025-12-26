import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../providers/language_provider.dart';
import 'med_tracker_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final langProvider = Provider.of<LanguageProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(langProvider.t('settings.title')),
      ),
      body: ListView(
        children: [
          // Medication Tracker
          _buildSectionHeader(context, 'Medication'),
          ListTile(
            leading: const Icon(Icons.medication),
            title: const Text('My Medicines'),
            subtitle: const Text('Reminders and intake tracking'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const MedTrackerScreen()),
              );
            },
          ),

          const Divider(height: 32),

          // Theme Section
          _buildSectionHeader(context, langProvider.t('settings.theme')),
          _buildThemeTile(
            context,
            icon: Icons.light_mode,
            title: langProvider.t('settings.theme.light'),
            isSelected: themeProvider.themeMode == ThemeMode.light,
            onTap: () => themeProvider.setThemeMode(ThemeMode.light),
          ),
          _buildThemeTile(
            context,
            icon: Icons.dark_mode,
            title: langProvider.t('settings.theme.dark'),
            isSelected: themeProvider.themeMode == ThemeMode.dark,
            onTap: () => themeProvider.setThemeMode(ThemeMode.dark),
          ),
          _buildThemeTile(
            context,
            icon: Icons.brightness_auto,
            title: langProvider.t('settings.theme.system'),
            isSelected: themeProvider.themeMode == ThemeMode.system,
            onTap: () => themeProvider.setThemeMode(ThemeMode.system),
          ),

          const Divider(height: 32),

          // Language Section
          _buildSectionHeader(context, langProvider.t('settings.language')),
          _buildLanguageTile(
            context,
            flag: '🇺🇸',
            title: 'English',
            isSelected: langProvider.language == AppLanguage.en,
            onTap: () => langProvider.setLanguage(AppLanguage.en),
          ),
          _buildLanguageTile(
            context,
            flag: '🇵🇭',
            title: 'Filipino',
            isSelected: langProvider.language == AppLanguage.fil,
            onTap: () => langProvider.setLanguage(AppLanguage.fil),
          ),
          _buildLanguageTile(
            context,
            flag: '🏝️',
            title: 'Bikol',
            isSelected: langProvider.language == AppLanguage.bcl,
            onTap: () => langProvider.setLanguage(AppLanguage.bcl),
          ),

          const Divider(height: 32),

          // About Section
          _buildSectionHeader(context, langProvider.t('settings.about')),
          ListTile(
            leading: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D9488), Color(0xFF2563EB)],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.local_hospital, color: Colors.white),
            ),
            title: const Text('MyNaga Gabay'),
            subtitle: Text(langProvider.t('app.subtitle')),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text(langProvider.t('settings.version')),
            subtitle: const Text('0.1.0'),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.bold,
            ),
      ),
    );
  }

  Widget _buildThemeTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? theme.colorScheme.primary : null,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : null,
          color: isSelected ? theme.colorScheme.primary : null,
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check, color: theme.colorScheme.primary)
          : null,
      onTap: onTap,
    );
  }

  Widget _buildLanguageTile(
    BuildContext context, {
    required String flag,
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    return ListTile(
      leading: Text(flag, style: const TextStyle(fontSize: 24)),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : null,
          color: isSelected ? theme.colorScheme.primary : null,
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check, color: theme.colorScheme.primary)
          : null,
      onTap: onTap,
    );
  }
}
