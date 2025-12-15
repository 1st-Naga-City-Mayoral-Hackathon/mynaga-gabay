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
          body: SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        LocaleData.navFacilitiesKey.getString(context),
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      PrimaryTextSearchField(
                        name: "search",
                        hintText: LocaleData.facilitySearchPlaceholderKey
                            .getString(context),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _buildBody(context, state, theme),
                ),
              ],
            ),
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
            const CircularProgressIndicator(
              strokeWidth: 2,
            ),
            const SizedBox(height: 16),
            Text(
              LocaleData.facilityLoadingKey.getString(context),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColor.grey,
              ),
            ),
          ],
        ),
      );
    }

    if (state.status == FacilityStatus.failed) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColor.border, width: 2),
                ),
                child: const Icon(
                  Icons.error_outline,
                  size: 32,
                  color: AppColor.grey,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                state.error,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AppColor.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (state.facilities.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColor.border, width: 2),
              ),
              child: const Icon(
                Icons.search_off,
                size: 32,
                color: AppColor.grey,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              LocaleData.facilityNoResultsKey.getString(context),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColor.grey,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
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

    return Container(
      margin: const EdgeInsets.only(bottom: 12.0),
      decoration: BoxDecoration(
        border: Border.all(color: AppColor.border),
        borderRadius: BorderRadius.circular(12),
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          facility.name ?? "",
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (facility.category != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            facility.category!,
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: AppColor.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right,
                    color: AppColor.grey,
                    size: 20,
                  ),
                ],
              ),
              if (facility.address != null) ...[
                const SizedBox(height: 12),
                _InfoRow(
                  icon: Icons.location_on_outlined,
                  value: facility.address!,
                  theme: theme,
                ),
              ],
              if (facility.phone != null) ...[
                const SizedBox(height: 8),
                _InfoRow(
                  icon: Icons.phone_outlined,
                  value: facility.phone!,
                  theme: theme,
                ),
              ],
              if (facility.services != null &&
                  facility.services!.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: facility.services!
                      .map<Widget>(
                        (service) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColor.border),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            service,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: AppColor.grey,
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
  final String value;
  final ThemeData theme;

  const _InfoRow({
    required this.icon,
    required this.value,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppColor.grey),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColor.grey,
            ),
          ),
        ),
      ],
    );
  }
}
