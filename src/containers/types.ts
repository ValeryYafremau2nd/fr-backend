const TYPES = {
  ConfigService: Symbol.for('ConfigService'),
  ProtectMiddleware: Symbol.for('ProtectMiddleware'),
  CompetitionService: Symbol.for('CompetitionService'),
  FavoritesService: Symbol.for('FavoritesService'),
  UserService: Symbol.for('UserService'),
  AuthController: Symbol.for('AuthController'),
  NotificationController: Symbol.for('NotificationController'),
  DBConnection: Symbol.for('DBConnection'),
  // CachingService: Symbol.for('CachingService'),
  NotificationService: Symbol.for('NotificationService')
};

export { TYPES };
