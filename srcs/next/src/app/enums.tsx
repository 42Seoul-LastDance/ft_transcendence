export const enum Emoji {
  NONE = -1,
  HI = 0,
  THUMBUP = 1,
  SUNGLASSES = 2,
  FANFARE = 3,
  TONGUE = 4,
  BADWORDS = 5,
  WITCH = 6,
}

export const enum PlayerSide {
  NONE = -1,
  LEFT = 0,
  RIGHT = 1,
}

export const enum GameMode {
  NONE = -1,
  NORMAL = 0,
  HARD = 1,
}

export const enum GameJoinMode {
  NONE = -1,
  MATCH = 0,
  CUSTOM_SEND = 1,
  CUSTOM_RECV = 2,
}

export const enum RoomStatus {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export const enum UserPermission {
  OWNER = 0,
  ADMIN = 1,
  MEMBER = 2,
  NONE = 3,
}

export const enum TokenType {
  Access = 0,
  Refresh = 1,
}

export const enum FriendStatus {
  FRIEND = 0,
  LAGGING = 1,
  REQUESTED = 2,
  UNKNOWN = 3,
}

export const enum JoinStatus {
  NONE,
  CHAT,
  DM,
}

export const enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  GAME = 'game',
}

export const enum InviteType {
  NONE = -1,
  CHAT = 0,
  GAME = 1,
}

export const enum GameEndStatus {
  NONE = -1,
  NORMAL = 0,
  CHEATING = 1,
  DISCONNECT = 2,
  OUTGAME = 3,
}

export const enum GameType {
  NONE = -1,
  MATCH = 0,
  FRIEND = 1,
}
