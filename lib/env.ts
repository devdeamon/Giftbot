import { z } from "zod"

const envSchema = z.object({
  // Required variables
  BOT_TOKEN: z.string().min(1, "BOT_TOKEN is required"),
  WEBAPP_URL: z.string().url("WEBAPP_URL must be a valid URL"),

  // Database variables (optional for development)
  DATABASE_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Stack Auth (optional)
  NEXT_PUBLIC_STACK_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().optional(),
  STACK_SECRET_SERVER_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let env: Env

try {
  env = envSchema.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingVars = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n")
    throw new Error(`Environment validation failed:\n${missingVars}`)
  }
  throw error
}

export { env }

// Helper function to check if we're in development
export const isDevelopment = env.NODE_ENV === "development"
export const isProduction = env.NODE_ENV === "production"

// Helper function to get required env vars with fallbacks
export const getEnvVar = (key: keyof Env, fallback?: string): string => {
  const value = env[key]
  if (value === undefined || value === "") {
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value as string
}
