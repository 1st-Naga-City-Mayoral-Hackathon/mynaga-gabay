part of 'facility_bloc.dart';

enum FacilityStatus {
  initial,
  loading,
  success,
  failed,
}

class FacilityState extends Equatable {
  final List<Facility> facilities;
  final List<Facility> allFacilities;
  final FacilityStatus status;
  final String error;
  final String searchQuery;

  const FacilityState({
    this.facilities = const [],
    this.allFacilities = const [],
    this.status = FacilityStatus.initial,
    this.error = "",
    this.searchQuery = "",
  });

  FacilityState copyWith({
    List<Facility>? facilities,
    List<Facility>? allFacilities,
    FacilityStatus? status,
    String? error,
    String? searchQuery,
  }) {
    return FacilityState(
      facilities: facilities ?? this.facilities,
      allFacilities: allFacilities ?? this.allFacilities,
      status: status ?? this.status,
      error: error ?? this.error,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  @override
  List<Object> get props => [
        facilities,
        allFacilities,
        status,
        error,
        searchQuery,
      ];
}
