import {
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUS,
} from "../constants/notificationTypes";

export const mockNotifications = [

  /*
  |--------------------------------------------------------------------------
  | Invitation Received
  |--------------------------------------------------------------------------
  */

  {
    id: "1",

    category: "INVITATION",

    type:
      NOTIFICATION_TYPES.INVITATION_RECEIVED,

    status:
      NOTIFICATION_STATUS.PENDING,

    isRead: false,

    title:
      "Babes invited you",

    message:
      "Join Team Babes as a player.",

    senderName: "Babes",

    teamName: "Babes",

    createdAt:
      "2 min ago",
  },

  /*
  |--------------------------------------------------------------------------
  | Invitation Accepted
  |--------------------------------------------------------------------------
  */

  {
    id: "2",

    category: "INVITATION",

    type:
      NOTIFICATION_TYPES.INVITATION_ACCEPTED,

    status:
      NOTIFICATION_STATUS.ACCEPTED,

    isRead: false,

    title:
      "Invitation Accepted",

    message:
      "Eddy Nagar accepted your invitation.",

    playerName:
      "Eddy Nagar",

    createdAt:
      "18 min ago",
  },

  /*
  |--------------------------------------------------------------------------
  | Invitation Rejected
  |--------------------------------------------------------------------------
  */

  {
    id: "3",

    category: "INVITATION",

    type:
      NOTIFICATION_TYPES.INVITATION_REJECTED,

    status:
      NOTIFICATION_STATUS.REJECTED,

    isRead: true,

    title:
      "Invitation Rejected",

    message:
      "Rahul rejected your invitation.",

    playerName:
      "Rahul",

    createdAt:
      "1 hour ago",
  },

  /*
  |--------------------------------------------------------------------------
  | Team Created
  |--------------------------------------------------------------------------
  */

  {
    id: "4",

    category: "TEAM",

    type:
      NOTIFICATION_TYPES.TEAM_CREATED,

    isRead: true,

    title:
      "Team Created",

    message:
      "Your team Babes was created successfully.",

    createdAt:
      "Yesterday",
  },

  /*
  |--------------------------------------------------------------------------
  | Captain Assigned
  |--------------------------------------------------------------------------
  */

  {
    id: "5",

    category: "TEAM",

    type:
      NOTIFICATION_TYPES.CAPTAIN_ASSIGNED,

    isRead: true,

    title:
      "Captain Assigned",

    message:
      "You have been assigned as Captain of Babes.",

    createdAt:
      "Yesterday",
  },

  /*
  |--------------------------------------------------------------------------
  | Vice Captain Assigned
  |--------------------------------------------------------------------------
  */

  {
    id: "6",

    category: "TEAM",

    type:
      NOTIFICATION_TYPES.VICE_CAPTAIN_ASSIGNED,

    isRead: true,

    title:
      "Vice Captain Assigned",

    message:
      "Rohit Sharma is now Vice Captain.",

    createdAt:
      "Yesterday",
  },

  /*
  |--------------------------------------------------------------------------
  | Player Joined
  |--------------------------------------------------------------------------
  */

  {
    id: "7",

    category: "TEAM",

    type:
      NOTIFICATION_TYPES.PLAYER_JOINED,

    isRead: false,

    title:
      "Player Joined",

    message:
      "Virat Kohli joined Team Babes.",

    createdAt:
      "Today",
  },

  /*
  |--------------------------------------------------------------------------
  | Player Left
  |--------------------------------------------------------------------------
  */

  {
    id: "8",

    category: "TEAM",

    type:
      NOTIFICATION_TYPES.PLAYER_LEFT,

    isRead: true,

    title:
      "Player Left",

    message:
      "Rahul left Team Babes.",

    createdAt:
      "Yesterday",
  },

  /*
  |--------------------------------------------------------------------------
  | Match Created
  |--------------------------------------------------------------------------
  */

  {
    id: "9",

    category: "MATCH",

    type:
      NOTIFICATION_TYPES.MATCH_CREATED,

    isRead: false,

    title:
      "Match Created",

    message:
      "Babes vs Kings scheduled for tomorrow.",

    createdAt:
      "Today",
  },

  /*
  |--------------------------------------------------------------------------
  | Match Reminder
  |--------------------------------------------------------------------------
  */

  {
    id: "10",

    category: "MATCH",

    type:
      NOTIFICATION_TYPES.MATCH_REMINDER,

    isRead: false,

    title:
      "Match Reminder",

    message:
      "Your match starts in 30 minutes.",

    createdAt:
      "30 min ago",
  },

  /*
  |--------------------------------------------------------------------------
  | Ground Booking
  |--------------------------------------------------------------------------
  */

  {
    id: "11",

    category: "GROUND",

    type:
      NOTIFICATION_TYPES.GROUND_BOOKED,

    isRead: true,

    title:
      "Ground Booked",

    message:
      "Sector 24 Ground booked successfully.",

    createdAt:
      "Yesterday",
  },

  /*
  |--------------------------------------------------------------------------
  | Tournament Update
  |--------------------------------------------------------------------------
  */

  {
    id: "12",

    category: "TOURNAMENT",

    type:
      NOTIFICATION_TYPES.TOURNAMENT_UPDATED,

    isRead: false,

    title:
      "Tournament Updated",

    message:
      "Summer Cup fixtures have been updated.",

    createdAt:
      "2 days ago",
  },

  /*
  |--------------------------------------------------------------------------
  | System Update
  |--------------------------------------------------------------------------
  */

  {
    id: "13",

    category: "SYSTEM",

    type:
      NOTIFICATION_TYPES.SYSTEM,

    isRead: true,

    title:
      "Welcome to CricIn",

    message:
      "Complete your profile to unlock all features.",

    createdAt:
      "3 days ago",
  },
];