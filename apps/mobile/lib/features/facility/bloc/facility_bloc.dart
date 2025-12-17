import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mynaga_gabay/features/facility/data/model/facility.dart';

part 'facility_event.dart';
part 'facility_state.dart';

class FacilityBloc extends Bloc<FacilityEvent, FacilityState> {
  FacilityBloc() : super(const FacilityState()) {
    on<FacilityInitRequested>(_onInitRequested);
    on<FacilitySearchRequested>(_onSearchRequested);
  }

  void _onInitRequested(
      FacilityInitRequested event, Emitter<FacilityState> emit) async {
    emit(state.copyWith(status: FacilityStatus.loading));
    try {
      await Future.delayed(const Duration(seconds: 2), () {
        emit(state.copyWith(
            status: FacilityStatus.success,
            facilities: Facility.facilities,
            allFacilities: Facility.facilities));
      });
    } catch (e) {
      emit(state.copyWith(status: FacilityStatus.failed, error: e.toString()));
    }
  }

  void _onSearchRequested(
      FacilitySearchRequested event, Emitter<FacilityState> emit) {
    final query = event.query.toLowerCase().trim();

    if (query.isEmpty) {
      emit(state.copyWith(
        facilities: state.allFacilities,
        searchQuery: query,
      ));
      return;
    }

    final filtered = state.allFacilities.where((facility) {
      final name = facility.name?.toLowerCase() ?? '';
      final address = facility.address?.toLowerCase() ?? '';
      final category = facility.category?.toLowerCase() ?? '';
      final services =
          facility.services?.map((s) => s.toLowerCase()).join(' ') ?? '';

      return name.contains(query) ||
          address.contains(query) ||
          category.contains(query) ||
          services.contains(query);
    }).toList();

    emit(state.copyWith(
      facilities: filtered,
      searchQuery: query,
    ));
  }
}
