CREATE UNIQUE INDEX IF NOT EXISTS "rate_limits_action_key_unique" ON "rate_limits" ("action","key");
