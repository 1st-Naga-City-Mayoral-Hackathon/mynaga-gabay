import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mynaga_gabay/app/app_locator.dart';
import 'package:mynaga_gabay/features/facility/bloc/facility_bloc.dart';
import 'package:mynaga_gabay/features/facility/view/facility_view.dart';

class FacilityPage extends StatelessWidget {
  static const String route = "facility_route";
  const FacilityPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: getIt<FacilityBloc>(),
      child: const FacilityView(),
    );
  }
}
