import 'package:flutter/material.dart';
import 'package:mynaga_gabay/shared/color.dart';
import 'package:mynaga_gabay/widgets/primary_text_search_field.dart';

class Medicine {
  final String name;
  final String genericName;
  final String dosage;
  final List<String> sideEffects;
  final String warning;

  const Medicine({
    required this.name,
    required this.genericName,
    required this.dosage,
    required this.sideEffects,
    required this.warning,
  });
}

class MedicineView extends StatefulWidget {
  const MedicineView({super.key});

  @override
  State<MedicineView> createState() => _MedicineViewState();
}

class _MedicineViewState extends State<MedicineView> {
  final String _searchQuery = '';

  final List<Medicine> _medicines = const [
    Medicine(
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      dosage: '500mg every 6 hours',
      sideEffects: ['Nausea', 'Stomach pain', 'Loss of appetite'],
      warning:
          'Do not exceed 4000mg per day. Overdose can cause serious liver damage.',
    ),
    Medicine(
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      dosage: '500mg every 8 hours',
      sideEffects: ['Diarrhea', 'Nausea', 'Skin rash', 'Vomiting'],
      warning:
          'Complete the full course of antibiotics. Do not use if allergic to penicillin.',
    ),
    Medicine(
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      dosage: '400mg every 6-8 hours',
      sideEffects: ['Upset stomach', 'Heartburn', 'Dizziness', 'Headache'],
      warning:
          'Take with food. May increase risk of heart attack or stroke with long-term use.',
    ),
    Medicine(
      name: 'Cetirizine',
      genericName: 'Cetirizine HCl',
      dosage: '10mg once daily',
      sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'],
      warning: 'May cause drowsiness. Avoid driving or operating machinery.',
    ),
    Medicine(
      name: 'Omeprazole',
      genericName: 'Omeprazole',
      dosage: '20mg once daily before meal',
      sideEffects: ['Headache', 'Stomach pain', 'Diarrhea', 'Nausea'],
      warning:
          'Take at least 30 minutes before a meal. Long-term use may cause vitamin B12 deficiency.',
    ),
    Medicine(
      name: 'Metformin',
      genericName: 'Metformin HCl',
      dosage: '500mg twice daily with meals',
      sideEffects: ['Diarrhea', 'Nausea', 'Stomach upset', 'Metallic taste'],
      warning:
          'For diabetes management. Take with meals to reduce stomach upset.',
    ),
    Medicine(
      name: 'Losartan',
      genericName: 'Losartan Potassium',
      dosage: '50mg once daily',
      sideEffects: ['Dizziness', 'Fatigue', 'Low blood pressure'],
      warning:
          'For high blood pressure. Avoid during pregnancy. Monitor blood pressure regularly.',
    ),
    Medicine(
      name: 'Salbutamol',
      genericName: 'Salbutamol',
      dosage: '2 puffs as needed',
      sideEffects: ['Tremor', 'Nervousness', 'Headache', 'Fast heartbeat'],
      warning:
          'For asthma relief. If no improvement after use, seek immediate medical attention.',
    ),
  ];

  List<Medicine> get _filteredMedicines {
    if (_searchQuery.isEmpty) return _medicines;
    return _medicines.where((medicine) {
      final query = _searchQuery.toLowerCase();
      return medicine.name.toLowerCase().contains(query) ||
          medicine.genericName.toLowerCase().contains(query);
    }).toList();
  }

  void _showWarningDialog(Medicine medicine) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.orange,
                  size: 28,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Important Warning',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 12),
              Text(
                medicine.name,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColor.primary,
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.orange.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  medicine.warning,
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColor.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('I Understand'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
                    'Medicines',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const PrimaryTextSearchField(
                    name: 'medicine_search',
                    hintText: 'Search medicines...',
                  ),
                ],
              ),
            ),
            Expanded(
              child: _filteredMedicines.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: AppColor.border, width: 2),
                            ),
                            child: const Icon(
                              Icons.search_off,
                              size: 32,
                              color: AppColor.grey,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No medicines found',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: AppColor.grey,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      itemCount: _filteredMedicines.length,
                      itemBuilder: (context, index) {
                        final medicine = _filteredMedicines[index];
                        return _MedicineCard(
                          medicine: medicine,
                          onWarningTap: () => _showWarningDialog(medicine),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MedicineCard extends StatelessWidget {
  final Medicine medicine;
  final VoidCallback onWarningTap;

  const _MedicineCard({
    required this.medicine,
    required this.onWarningTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        border: Border.all(color: AppColor.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
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
                        medicine.name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        medicine.genericName,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColor.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                InkWell(
                  onTap: onWarningTap,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.orange.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.orange,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(
                  Icons.medication_outlined,
                  size: 16,
                  color: AppColor.grey,
                ),
                const SizedBox(width: 8),
                Text(
                  'Dosage: ',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColor.grey,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Expanded(
                  child: Text(
                    medicine.dosage,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColor.grey,
                    ),
                  ),
                ),
              ],
            ),
            if (medicine.sideEffects.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Text(
                'Common Side Effects',
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: medicine.sideEffects.map((effect) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColor.border),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      effect,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: AppColor.grey,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
