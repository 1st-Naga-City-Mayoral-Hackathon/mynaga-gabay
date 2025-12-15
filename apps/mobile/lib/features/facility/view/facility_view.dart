import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:mynaga_gabay/features/facility/bloc/facility_bloc.dart';
import 'package:mynaga_gabay/localization/locales.dart';
import 'package:mynaga_gabay/shared/color.dart';
import 'package:mynaga_gabay/widgets/primary_text_search_field.dart';

class FacilityView extends StatefulWidget {
  const FacilityView({super.key});

  @override
  State<FacilityView> createState() => _FacilityViewState();
}

class _FacilityViewState extends State<FacilityView> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    init();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void init() {
    context.read<FacilityBloc>().add(FacilityInitRequested());
  }

  void _onSearchChanged(String? query) {
    context.read<FacilityBloc>().add(FacilitySearchRequested(query ?? ""));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return BlocBuilder<FacilityBloc, FacilityState>(
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: Text(
              LocaleData.navFacilitiesKey.getString(context),
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            elevation: 0,
          ),
          body: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16.0),
                color: theme.scaffoldBackgroundColor,
                child: PrimaryTextSearchField(
                  name: "search",
                  controller: _searchController,
                  hintText: LocaleData.facilitySearchPlaceholderKey
                      .getString(context),
                  onChanged: _onSearchChanged,
                ),
              ),
              Expanded(
                child: _buildBody(context, state, theme),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBody(
      BuildContext context, FacilityState state, ThemeData theme) {
    if (state.status == FacilityStatus.loading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(
              LocaleData.facilityLoadingKey.getString(context),
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
      );
    }

    if (state.status == FacilityStatus.failed) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: theme.colorScheme.error),
            const SizedBox(height: 16),
            Text(
              state.error,
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    if (state.facilities.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: theme.disabledColor),
            const SizedBox(height: 16),
            Text(
              LocaleData.facilityNoResultsKey.getString(context),
              style: theme.textTheme.bodyLarge,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: state.facilities.length,
      itemBuilder: (context, index) {
        final facility = state.facilities[index];
        return _FacilityCard(facility: facility);
      },
    );
  }
}

class _FacilityCard extends StatelessWidget {
  final dynamic facility;

  const _FacilityCard({required this.facility});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColor.border, width: 1),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          // TODO: Navigate to facility details
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      facility.name ?? "",
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (facility.category != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColor.primary,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColor.border),
                      ),
                      child: Text(
                        facility.category!,
                        style: theme.textTheme.labelSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              if (facility.address != null)
                _InfoRow(
                  icon: Icons.location_on_outlined,
                  label: LocaleData.facilityAddressKey.getString(context),
                  value: facility.address!,
                  theme: theme,
                ),
              if (facility.phone != null) ...[
                const SizedBox(height: 8),
                _InfoRow(
                  icon: Icons.phone_outlined,
                  label: LocaleData.facilityPhoneKey.getString(context),
                  value: facility.phone!,
                  theme: theme,
                ),
              ],
              if (facility.services != null &&
                  facility.services!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  LocaleData.facilityServicesKey.getString(context),
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: facility.services!
                      .map<Widget>(
                        (service) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primaryContainer,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            service,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: theme.colorScheme.onPrimaryContainer,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final ThemeData theme;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: theme.colorScheme.primary),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.textTheme.bodySmall?.color,
                ),
              ),
              Text(
                value,
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
