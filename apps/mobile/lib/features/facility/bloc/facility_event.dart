part of 'facility_bloc.dart';

class FacilityEvent extends Equatable {
  const FacilityEvent();

  @override
  List<Object> get props => [];
}

class FacilityInitRequested extends FacilityEvent {}

class FacilitySearchRequested extends FacilityEvent {
  final String query;

  const FacilitySearchRequested(this.query);

  @override
  List<Object> get props => [query];
}
