export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
