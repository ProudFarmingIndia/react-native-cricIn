// const SCREEN_HEADERS = {
//   QuickScoreScreen: "Match Setup",
//   TeamSelectionScreen: "Select Teams",
//   SquadSelectionScreen: "Select Squad",
//   TossScreen: "Toss Session",
//   PlayingXISelectionScreen: "Playing XI",
//   LiveScoringScreen: "CricIn Live",
//   OverSummaryScreen: "Over Summary",
//   InningsSummaryScreen: "Innings Summary",
//   SecondInningsScreen: "Second Innings",
//   MatchResultScreen: "Match Result",
//   MatchCenterScreen: "Match Center"
// }

export const HEADER_CONFIG = {
  HomeScreen: {
    title: "CricIn",
    showMenu: true,
    ShowCricInICon: true,
    showBack: false,
    showSearch: true,
    showChat: true,
    showNotification: true,
  },

  ProfileScreen: {
    title: "Profile",
    showMenu: true,
    ShowCricInICon: false,
    showBack: false,
    showSearch: true,
    showChat: true,
    showNotification: true,
  },

  EditProfileScreen: {
    title: "Edit Profile",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  NotificationScreen: {
    title: "Notifications",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  CreateTeamScreen: {
    title: "Create Team",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  AddPlayerScreen: {
    title: "Add Players",
    showBack: true,
  },

  TeamPreviewScreen: {
    title: "Team Preview",
    showBack: true,
  },
  InvitePlayerScreen: {
    title: "Invite Player",
    showBack: true,
  },
  InviteByMobileScreen: {
    title: "Invite by Mobile",
    showBack: true,
  },
  AddLocalPlayerScreen: {
    title: "Add Local Player",
    showBack: true,
  },

  MatchesScreen: {
    title: "Matches",
    showMenu: true,
    ShowCricInICon: false,
    showBack: false,
    showSearch: true,

    /*
    | Switched on when the duplicate MatchesHeader was removed from
    | MatchesScreen. That component drew a bell, but it had no onPress -
    | this one actually opens the notification list and carries the
    | unread badge.
    */
    showNotification: true,
  },

  GroundsScreen: {
    title: "Grounds",
    showMenu: true,
    ShowCricInICon: false,
    showBack: false,
    showSearch: true,
  },

  ShopScreen: {
    title: "Explore Shops",
    showMenu: true,
    ShowCricInICon: false,
    showBack: false,
    showSearch: true,
    showNotification: true,
  },

  TeamDetailsScreen: {
    title: "Team Details",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  /*
  | These had no entry at all, so NavigationHeader fell back to {} and
  | rendered a blank bar with no title and no back button - on screens you
  | can only ever reach by navigating into them. EditTeamScreen was the
  | worst of it: an untitled header above a form identical to Create Team
  | made it read as the wrong screen entirely.
  */

  NotificationDetailScreen: {
    title: "Notification",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  LiveScoringListScreen: {
    title: "Live Scoring",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  FollowListScreen: {
    title: "Followers",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  PlayerProfileScreen: {
    title: "Player Profile",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  EditTeamScreen: {
    title: "Edit Team",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  ManageViceCaptainScreen: {
    title: "Vice-Captain",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  TeamAvailabilityScreen: {
    title: "Availability",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  SquadSelectionScreen: {
    title: "Select Squad",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  ChallengeInboxScreen : {
    title: "Challenge Inbox",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  TossScreen: {
    title: "Toss Session",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  MatchLineUpScreen: {
    title: "Playing XI",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  MatchApprovalPendingScreen: {
    title: "Match Scheduled",
    showMenu: false,
    ShowCricInICon: false,
    showBack: false,
  },

  MatchApprovalScreen: {
    title: "Match Approval",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  OverSummaryScreen: {
    title: "Over Summary",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  InningsSummaryScreen: {
    title: "Innings Summary",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  SecondInningsScreen: {
    title: "Second Innings",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  MatchResultScreen: {
    title: "Match Result",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  MatchCenterScreen: {
    title: "Match Center",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  /*
  |--------------------------------------------------------------------------
  | MatchDetailsScreen - Same Header As HomeScreen (Per Request)
  |--------------------------------------------------------------------------
  |
  | NOTE: this mirrors HomeScreen exactly, which means showBack is false -
  | same as Home, there's no back arrow. The bottom tab bar (Home/Matches/
  | Grounds/Shop/Profile) is still visible/usable from here since this
  | screen lives inside the "Matches" tab's stack, so switching tabs still
  | works fine as a way out. Android hardware back button also still
  | navigates back regardless of what the header shows. If a visible way
  | back via the header itself turns out to be wanted after testing, the
  | fix is just flipping showBack to true here - flagging this now since
  | it's a real trade-off of matching Home's config exactly.
  |
  */
  MatchDetailsScreen: {
    title: "Match Details",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showSearch: false,
    showChat: false,
    showNotification: false,
  },

  QuickScoreScreen: {
    title: "Match Setup",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  TeamSelectionScreen: {
    title: "Select Teams",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  LiveScoringScreen: {
    title: "CricIn Live",
    showMenu: true,
    ShowCricInICon: true,
    showBack: true,
    showSearch: true,
    showChat: true,
    showNotification: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Live Streaming
  |--------------------------------------------------------------------------
  |
  | Every one of these needs an entry. NavigationHeader falls back to {}
  | for an unknown route, which renders a blank bar with no title AND no
  | back button - on screens you can only reach by navigating into them.
  | That is the single most common way a new screen ends up feeling like a
  | dead end.
  |
  | WatchLiveScreen is deliberately absent: it is registered with
  | headerShown: false because it draws its own black video stage, and a
  | light-green app bar above that looks like a bug.
  |
  */

  LiveStreamingListScreen: {
    title: "Live Streaming",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showSearch: true,
    showNotification: true,
  },

  GoLiveScreen: {
    title: "Cameras",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  AssignBroadcasterScreen: {
    title: "Assign Camera",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  BroadcastInviteScreen: {
    title: "Camera Invite",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  BroadcastSetupScreen: {
    title: "Start Broadcasting",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Tournaments
  |--------------------------------------------------------------------------
  |
  | A screen missing from this map gets a header with no title and - the
  | part that actually breaks things - no back button, because showBack
  | defaults to false. On Android the hardware button still works, so it
  | reads as a design choice rather than a bug; on iOS it is a dead end.
  |
  | So every tournament route registered in RootNavigator has an entry
  | here, including the ones that are only reached from one place.
  |
  */

  TournamentListScreen: {
    title: "Tournaments",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showSearch: true,
    showNotification: true,
  },

  CreateTournamentScreen: {
    title: "Create Tournament",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  /*
  | No title of its own - the screen draws the tournament's name in its
  | own hero, and repeating it in the bar wastes the only line a long
  | tournament name has to fit into.
  */

  TournamentDetailScreen: {
    title: "Tournament",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showNotification: true,
  },

  ManageTournamentScreen: {
    title: "Manage Tournament",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  InviteTeamsScreen: {
    title: "Invite Teams",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  TournamentInviteScreen: {
    title: "Tournament Invite",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  TournamentSquadScreen: {
    title: "Register Squad",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Series
  |--------------------------------------------------------------------------
  |
  | Same rule as the tournament block above: a screen missing from this
  | map gets a header with no title and no back button, which on iOS is a
  | dead end. Every series route registered in RootNavigator has an entry.
  |
  */

  SeriesListScreen: {
    title: "Series",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showSearch: true,
    showNotification: true,
  },

  CreateSeriesScreen: {
    title: "Create Series",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  SeriesDetailScreen: {
    title: "Series",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showNotification: true,
  },

  ManageSeriesScreen: {
    title: "Manage Series",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Grounds
  |--------------------------------------------------------------------------
  |
  | NavigationHeader reads its title from THIS map keyed on the route name -
  | not from the navigator's `options.title`. A route missing from here shows
  | its own route name across the top, so "GroundSlotPickerScreen" would
  | appear as the heading of the slot picker.
  |
  | Every grounds route is listed below for that reason. `showBack: true`
  | everywhere except the tab root, which gets the menu instead.
  |
  */

  GroundDetailScreen: {
    title: "Ground",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  GroundSlotPickerScreen: {
    title: "Slot chuno",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  BookGroundScreen: {
    title: "Booking details",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  MyBookingsScreen: {
    title: "Meri Bookings",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showNotification: true,
  },

  /* Shared by the team and the ground owner - one screen, one route. */
  BookingDetailScreen: {
    title: "Booking",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  RateGroundScreen: {
    title: "Ground Rating",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  GroundReviewsScreen: {
    title: "Reviews",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  OwnerDashboardScreen: {
    title: "Ground Owner",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
    showNotification: true,
  },

  MyGroundsScreen: {
    title: "Mere Grounds",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  GroundFormScreen: {
    title: "Ground Details",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  GroundUnitsScreen: {
    title: "Pitches aur Nets",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  UnitFormScreen: {
    title: "Timing aur Rate",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  GroundPoliciesScreen: {
    title: "Booking ke Rules",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  OwnerBookingsScreen: {
    title: "Bookings",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  OwnerCalendarScreen: {
    title: "Calendar",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

  OwnerEarningsScreen: {
    title: "Earnings",
    showMenu: false,
    ShowCricInICon: false,
    showBack: true,
  },

};