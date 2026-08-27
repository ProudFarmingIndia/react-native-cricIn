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
    title: "CricIn",
    showMenu: true,
    ShowCricInICon: true,
    showBack: false,
    showSearch: true,
    showChat: true,
    showNotification: true,
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

};