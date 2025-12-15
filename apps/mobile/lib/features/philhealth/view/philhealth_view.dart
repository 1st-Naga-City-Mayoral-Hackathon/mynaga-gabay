import 'package:flutter/material.dart';
import 'package:mynaga_gabay/shared/color.dart';

class PhilhealthView extends StatelessWidget {
  const PhilhealthView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                Text(
                  'PhilHealth Coverage',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Learn about your health insurance benefits',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: AppColor.grey,
                  ),
                ),
                const SizedBox(height: 32),
                _buildSection(
                  context,
                  title: 'Coverage Types',
                  children: [
                    _buildCoverageItem(
                      context,
                      title: 'Inpatient Care',
                      description:
                          'Hospital room and board, doctor fees, laboratory and diagnostic tests',
                      icon: Icons.local_hospital_outlined,
                    ),
                    _buildCoverageItem(
                      context,
                      title: 'Outpatient Care',
                      description:
                          'Consultations, medicines, and diagnostic procedures',
                      icon: Icons.medical_services_outlined,
                    ),
                    _buildCoverageItem(
                      context,
                      title: 'Z Benefits Package',
                      description:
                          'Catastrophic illnesses including dialysis, cancer treatment',
                      icon: Icons.favorite_outline,
                    ),
                    _buildCoverageItem(
                      context,
                      title: 'Primary Care Benefit',
                      description:
                          'Annual health assessment and preventive care',
                      icon: Icons.health_and_safety_outlined,
                      isLast: true,
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                _buildSection(
                  context,
                  title: 'How to Avail',
                  children: [
                    _buildStepItem(context,
                        step: '1',
                        text:
                            'Present your PhilHealth ID or Member Data Record (MDR)'),
                    _buildStepItem(context,
                        step: '2',
                        text:
                            'Submit requirements to the hospital or facility'),
                    _buildStepItem(context,
                        step: '3',
                        text: 'Wait for the facility to process your claim'),
                    _buildStepItem(context,
                        step: '4',
                        text: 'Pay only the balance after PhilHealth coverage',
                        isLast: true),
                  ],
                ),
                const SizedBox(height: 32),
                _buildSection(
                  context,
                  title: 'Requirements Checklist',
                  children: [
                    _buildChecklistItem(context, text: 'PhilHealth ID or MDR'),
                    _buildChecklistItem(context,
                        text: 'Valid Government-issued ID'),
                    _buildChecklistItem(context,
                        text:
                            'PhilHealth Member Data Form (if first availment)'),
                    _buildChecklistItem(context,
                        text: 'Medical Certificate (if applicable)'),
                    _buildChecklistItem(context,
                        text: 'Member Contribution (must be updated)',
                        isLast: true),
                  ],
                ),
                const SizedBox(height: 32),
                _buildContactCard(context),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 16),
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

  Widget _buildCoverageItem(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    bool isLast = false,
  }) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(
                bottom: BorderSide(
                  color: AppColor.border.withValues(alpha: 0.5),
                  width: 0.5,
                ),
              ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColor.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: AppColor.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColor.grey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepItem(
    BuildContext context, {
    required String step,
    required String text,
    bool isLast = false,
  }) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(
                bottom: BorderSide(
                  color: AppColor.border.withValues(alpha: 0.5),
                  width: 0.5,
                ),
              ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColor.primary,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                step,
                style: theme.textTheme.titleSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                text,
                style: theme.textTheme.bodyMedium,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChecklistItem(
    BuildContext context, {
    required String text,
    bool isLast = false,
  }) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(
                bottom: BorderSide(
                  color: AppColor.border.withValues(alpha: 0.5),
                  width: 0.5,
                ),
              ),
      ),
      child: Row(
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              border: Border.all(color: AppColor.border, width: 2),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: theme.textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border.all(color: AppColor.primary, width: 1.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColor.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.business_outlined,
                  color: AppColor.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'PhilHealth Naga Office',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildContactRow(
            context,
            icon: Icons.location_on_outlined,
            text: 'Panganiban Drive, Naga City, Camarines Sur',
          ),
          const SizedBox(height: 12),
          _buildContactRow(
            context,
            icon: Icons.phone_outlined,
            text: '(054) 473-3344',
          ),
          const SizedBox(height: 12),
          _buildContactRow(
            context,
            icon: Icons.access_time_outlined,
            text: 'Mon-Fri, 8:00 AM - 5:00 PM',
          ),
        ],
      ),
    );
  }

  Widget _buildContactRow(
    BuildContext context, {
    required IconData icon,
    required String text,
  }) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 18,
          color: AppColor.grey,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AppColor.grey,
            ),
          ),
        ),
      ],
    );
  }
}
