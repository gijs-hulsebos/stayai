# StayAI

StayAI is a first-party hotel discovery and demo-reservation assistant. It uses OpenRouter for the conversation, Xotelo as the only hotel/rate source, and Supabase Auth/Postgres for the fixed demo account, reservations, and saved stays.

## Local configuration

Copy `.env.example` to `.env.local`, provide the Supabase publishable values, `OPENROUTER_API_KEY`, and a RapidAPI key subscribed to Xotelo, then run:

```powershell
npm install
npm run dev -- --port 3001
```

The visible login is `IO-DEMO` / `IO-DEMO1`. The UI never displays the internal Supabase email.

## One-time demo user provisioning

Provision the fixed Auth user from the Supabase dashboard, or temporarily expose the project's service-role key to one shell and run:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "temporary-service-role-key"
npm run provision:demo-user
Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
```

The service-role key is never used by the application and must not be added to `.env.local`.

## Data model

The checked-in Supabase migrations create `reservations` and `bookmarks` with owner-only RLS. Reservations are immutable after creation except for a confirmed-to-cancelled transition. These records are explicitly demonstrations: no payment, OTA write-back, inventory hold, or hotel confirmation occurs.
