# StayAI product film — step-by-step cut

## Objective

Explain and showcase the working StayAI demo as one coherent walkthrough without increasing the existing 84-second runtime.

The viewer should always know:

1. Which step they are watching.
2. What the guest does.
3. What StayAI does next.
4. What result the step produces.

## Continuous walkthrough

The opening establishes that one guest will be followed through seven steps. A roadmap previews the journey, and one persistent progress marker then stays visible across the complete product flow.

| Step | Guest action | StayAI/system response | Result |
| --- | --- | --- | --- |
| 1. Enter the experience | Scroll through the property | Plays the cinematic property journey | A memorable first interaction before forms or filters |
| 2. Sign in securely | Enter the demo account | Supabase Auth restores the session and RLS scopes records | A private workspace that survives reloads |
| 3. Describe the stay | Ask naturally and add missing details | Converts the conversation into an editable brief | Destination, dates, party and preferences are ready |
| 4. StayAI searches safely | Submit the completed brief | OpenRouter chooses authenticated server tools | Current hotel and rate facts enter a structured response |
| 5. Compare current stays | Review, save or reserve a match | Combines Xotelo data with concise match reasoning | Comparable and actionable hotel cards |
| 6. Confirm the demo stay | Review every detail and confirm | Stores an explicit demo reservation snapshot | A reference that remains available across sessions |
| 7. Manage My Stay | Inspect, cancel or reactivate | Synchronizes the change with Supabase | Upcoming, cancelled and saved records stay organized |

After the seven product steps, a short “Under the hood” section explains the authenticated API, OpenRouter model fallback, Xotelo data, Supabase/RLS, GitHub CI and Vercel deployment.

## Runtime

- 1920×1080 at 30 fps.
- 2,530 frames, approximately 84 seconds.
- Same runtime as the previous explanatory cut.
- Eleven scenes with fourteen-frame overlaps.

## Visual system

- A persistent top progress marker shows `STEP N OF 7` and the current action.
- Every lower explanation uses the same `YOU → STAYAI → RESULT` language.
- Newsreader supplies the editorial display voice; Instrument Sans handles product and system information.
- Deep forest, warm paper and restrained lime remain the only dominant colours.
- Motion is deterministic and frame-driven; transitions are short and preserve continuity.

## Product boundaries

- Hotel details and rates come from Xotelo.
- AI selects actions, while authenticated tools provide hotel, rate and reservation facts.
- Supabase stores owner-scoped bookmarks and demo reservation snapshots under RLS.
- Reservations remain explicitly demonstrational: no payment, inventory hold or OTA confirmation.

## Review checklist

- Inspect the roadmap plus one representative frame from every product step.
- Check progress-marker changes at every transition.
- Confirm that the action/result explanations remain readable without pausing.
- Verify the final recap matches the seven steps shown.
- Run TypeScript validation and scan rendered copy for credentials or false booking claims.
