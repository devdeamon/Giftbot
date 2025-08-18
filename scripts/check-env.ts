import { env } from "@/lib/env"

console.log("🔍 Checking environment variables...")

try {
  console.log("✅ Environment variables validation passed!")
  console.log("\n📋 Current configuration:")
  console.log(`- NODE_ENV: ${env.NODE_ENV}`)
  console.log(`- BOT_TOKEN: ${env.BOT_TOKEN ? "✅ Set" : "❌ Missing"}`)
  console.log(`- WEBAPP_URL: ${env.WEBAPP_URL ? "✅ Set" : "❌ Missing"}`)
  console.log(`- DATABASE_URL: ${env.DATABASE_URL ? "✅ Set" : "⚠️  Optional"}`)

  if (env.NEXT_PUBLIC_STACK_PROJECT_ID) {
    console.log(`- Stack Auth: ✅ Configured`)
  } else {
    console.log(`- Stack Auth: ⚠️  Not configured (optional)`)
  }

  console.log("\n🚀 Ready to start the application!")
} catch (error) {
  console.error("❌ Environment validation failed:")
  console.error(error.message)
  process.exit(1)
}
