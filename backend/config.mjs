import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optionalBoolean(name, fallback = false) {
  const value = process.env[name]
  if (value == null) return fallback
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

const nodeEnv = process.env.NODE_ENV ?? 'development'
const appEnv = process.env.APP_ENV ?? nodeEnv
const isProduction = appEnv === 'production'

export const config = {
  nodeEnv,
  appEnv,
  isProduction,
  port: Number(process.env.PORT || 4000),
  databaseUrl: required('DATABASE_URL'),
  pgDisableSsl: process.env.PGSSLMODE === 'disable',
  allowAdminReset: !isProduction && optionalBoolean('ALLOW_ADMIN_RESET', true),
}

if (!Number.isFinite(config.port) || config.port <= 0) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`)
}
