import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/medication_notification_service.dart';

class MedTrackerScreen extends StatefulWidget {
  const MedTrackerScreen({super.key});

  @override
  State<MedTrackerScreen> createState() => _MedTrackerScreenState();
}

class _MedTrackerScreenState extends State<MedTrackerScreen> {
  final ApiService _api = ApiService();
  final MedicationNotificationService _notifs = MedicationNotificationService();

  bool _loading = false;
  String? _error;
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _reminders = [];

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  Future<void> _refresh() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final courses = await _api.getMedicationCourses();
      final reminders = await _api.getMedicationReminders();
      setState(() {
        _courses = courses;
        _reminders = reminders;
      });
    } catch (e) {
      setState(() => _error = 'Failed to load medicines');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _enableNotifications() async {
    await _notifs.requestPermissions();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Notifications enabled')),
    );
  }

  Future<void> _syncNotificationsFromApi() async {
    await _notifs.cancelAll();

    // Use reminders if present; otherwise fallback to course scheduleTimes
    for (final course in _courses) {
      final courseId = (course['id'] ?? '').toString();
      final name = (course['medicationName'] ?? 'Medicine').toString();
      final strength = (course['strength'] ?? '').toString();
      final form = (course['form'] ?? '').toString();
      final instr = (course['instructions'] ?? '').toString();
      final prn = course['prn'] == true;
      final isActive = course['isActive'] == true;

      if (!isActive || prn) continue;

      final matchingReminders = _reminders.where((r) => r['courseId'] == courseId).toList();
      List<String> times = [];
      if (matchingReminders.isNotEmpty) {
        final first = matchingReminders.first;
        final enabled = first['enabled'] == true;
        if (!enabled) continue;
        final arr = first['timesOfDay'];
        if (arr is List) {
          times = arr.map((e) => e.toString()).toList();
        }
      } else {
        final arr = course['scheduleTimes'];
        if (arr is List) {
          times = arr.map((e) => e.toString()).toList();
        }
      }

      if (times.isEmpty) continue;

      await _notifs.scheduleDailyCourse(
        courseId: courseId,
        title: 'Medicine reminder',
        body: '$name ${strength.isNotEmpty ? strength : ''} ${form.isNotEmpty ? form : ''}\n$instr',
        timesOfDay: times,
      );
    }

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Reminders synced to device')),
    );
  }

  String _todayIso() => DateTime.now().toIso8601String().substring(0, 10);

  String _scheduledAtIso(String hhmm) {
    final today = _todayIso();
    return DateTime.parse('${today}T$hhmm:00').toUtc().toIso8601String();
  }

  Future<void> _markTaken(String courseId, String hhmm) async {
    await _api.upsertIntakeEvent(courseId: courseId, scheduledAtIso: _scheduledAtIso(hhmm), status: 'taken');
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Marked taken ($hhmm)')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Medicines'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active),
            onPressed: _enableNotifications,
            tooltip: 'Enable notifications',
          ),
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: _syncNotificationsFromApi,
            tooltip: 'Sync reminders to device',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refresh,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    const Text(
                      'Track your medicines and sync reminders to your phone notifications.',
                      style: TextStyle(fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    if (_courses.isEmpty)
                      const Text('No medicines yet. Save a plan from the web chat demo.'),
                    ..._courses.map((c) {
                      final id = (c['id'] ?? '').toString();
                      final name = (c['medicationName'] ?? '').toString();
                      final strength = (c['strength'] ?? '').toString();
                      final form = (c['form'] ?? '').toString();
                      final instr = (c['instructions'] ?? '').toString();
                      final prn = c['prn'] == true;
                      final isActive = c['isActive'] == true;
                      final times = (c['scheduleTimes'] is List)
                          ? (c['scheduleTimes'] as List).map((e) => e.toString()).toList()
                          : <String>[];

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '$name ${strength.isNotEmpty ? strength : ''} ${form.isNotEmpty ? form : ''}'.trim(),
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(instr),
                              const SizedBox(height: 6),
                              Text(
                                prn ? 'PRN (as needed)' : 'Times: ${times.join(', ')}',
                                style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                              ),
                              Text(
                                isActive ? 'Active' : 'Inactive',
                                style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                              ),
                              if (!prn && times.isNotEmpty)
                                Wrap(
                                  spacing: 8,
                                  children: times
                                      .map(
                                        (t) => OutlinedButton(
                                          onPressed: () => _markTaken(id, t),
                                          child: Text('Taken $t', style: const TextStyle(fontSize: 12)),
                                        ),
                                      )
                                      .toList(),
                                ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
    );
  }
}


