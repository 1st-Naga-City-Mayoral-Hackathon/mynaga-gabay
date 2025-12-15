// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'facility.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Facility _$FacilityFromJson(Map<String, dynamic> json) => Facility(
      id: json['id'] as String?,
      name: json['name'] as String?,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      services: (json['services'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      category: json['category'] as String?,
    );

Map<String, dynamic> _$FacilityToJson(Facility instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'address': instance.address,
      'phone': instance.phone,
      'services': instance.services,
      'category': instance.category,
    };
