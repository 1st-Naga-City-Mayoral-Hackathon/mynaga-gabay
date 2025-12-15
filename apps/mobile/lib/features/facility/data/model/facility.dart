import 'package:json_annotation/json_annotation.dart';

part 'facility.g.dart';

@JsonSerializable(explicitToJson: true)
class Facility {
  final String? id;
  final String? name;
  final String? address;
  final String? phone;
  final List<String>? services;
  final String? category;

  Facility({
    this.id,
    this.name,
    this.address,
    this.phone,
    this.services,
    this.category,
  });

  factory Facility.fromJson(Map<String, dynamic> json) =>
      _$FacilityFromJson(json);
  Map<String, dynamic> toJson() => _$FacilityToJson(this);

  static List<Facility> facilities = [
    Facility(
      id: 'fac_001',
      name: 'Metropolis General Hospital',
      address: '123 Healing Blvd, Metropolis, NY',
      phone: '(212) 555-0199',
      services: ['Emergency Room', 'Pediatrics', 'Radiology', 'Pharmacy'],
      category: 'Healthcare',
    ),
    Facility(
      id: 'fac_002',
      name: 'Iron Pump Fitness',
      address: '45 Strong Ave, Gotham City, NJ',
      phone: '(609) 555-0200',
      services: ['Personal Training', 'Cardio Zone', 'Sauna', 'Yoga Classes'],
      category: 'Fitness',
    ),
    Facility(
      id: 'fac_003',
      name: 'QuickFix Auto Repair',
      address: '88 Motor Way, Detroit, MI',
      phone: '(313) 555-0300',
      services: ['Oil Change', 'Tire Rotation', 'Brake Inspection'],
      category: 'Automotive',
    ),
    Facility(
      id: 'fac_004',
      name: 'Central City Public Library',
      address: '101 Knowledge Ln, Central City, CA',
      phone: '(415) 555-0400',
      services: ['Book Lending', 'Free Wi-Fi', 'Study Rooms', 'Printing'],
      category: 'Education',
    ),
    Facility(
      id: 'fac_005',
      name: 'The Golden Spoon',
      address: '500 Flavor Street, Austin, TX',
      phone: null,
      services: ['Dine-in', 'Takeout', 'Catering'],
      category: 'Restaurant',
    ),
  ];
}
