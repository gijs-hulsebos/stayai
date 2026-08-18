# StayAI delivery setup

The repository now contains a GitHub Actions verification workflow and a minimal Vercel project configuration. No deployment credentials are stored in source control.

## GitHub CI

Add these repository secrets under **Settings → Secrets and variables → Actions**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_SITE_URL`
- `XOTELO_RAPIDAPI_KEY`

Every pull request and push to `main` runs a clean install, TypeScript validation, and a production Next.js build.

## Vercel hosting

1. Import the GitHub repository into Vercel.
2. Keep the framework preset on **Next.js** and the root directory on the repository root.
3. Add the same environment values in Vercel for Preview and Production. Also add `OPENROUTER_APP_NAME=StayAI`, `XOTELO_BASE_URL=https://data.xotelo.com/api`, and `XOTELO_RAPIDAPI_HOST=xotelo-hotel-prices.p.rapidapi.com`.
4. Require the **StayAI CI / verify** check before merging to `main` in GitHub branch protection.
5. Let Vercel create preview deployments for pull requests and production deployments from `main`.

This gives the workflow shown in the product film: branch → GitHub CI → Vercel preview → reviewed merge → production deployment.

## Supabase

Supabase remains an external managed service. Apply checked-in migrations to the intended project before production deployment and keep row-level security enabled. The service-role key is only for one-time administration and must never be added to GitHub or Vercel client-facing variables.
