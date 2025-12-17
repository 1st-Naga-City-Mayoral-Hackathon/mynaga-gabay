import 'package:go_router/go_router.dart';
import 'package:mynaga_gabay/features/chat/view/chat_page.dart';
import 'package:mynaga_gabay/features/facility/view/facility_page.dart';
import 'package:mynaga_gabay/features/layout/view/layout_page.dart';
import 'package:mynaga_gabay/features/medicine/view/medicine_page.dart';
import 'package:mynaga_gabay/features/philhealth/view/philhealth_page.dart';
import 'package:mynaga_gabay/features/settings/view/settings_page.dart';

class AppRouter {
  static GoRouter config = GoRouter(
    initialLocation: "/",
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => LayoutPage(
          shell: navigationShell,
        ),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/facility',
                name: FacilityPage.route,
                builder: (context, state) => const FacilityPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/medicine',
                name: MedicinePage.route,
                builder: (context, state) => const MedicinePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                name: ChatPage.route,
                builder: (context, state) => const ChatPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/philhealth',
                name: PhilhealthPage.route,
                builder: (context, state) => const PhilhealthPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/settings',
                name: SettingsPage.route,
                builder: (context, state) => const SettingsPage(),
              ),
            ],
          )
        ],
      ),
    ],
  );
}
