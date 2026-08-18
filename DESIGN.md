# StayAI Design System

## Visual thesis

Premium European hospitality × cinematic editorial direction × calm AI-native guest service. The public experience is composed as a sequence of full-viewport scenes; precise spacing, quiet surfaces, and native action components take over only when the guest enters the product.

The signature interaction is the **booking transformation**: a natural-language request visibly resolves into agent activity, a large date comparison, explicit approval, and a confirmed stay without changing spatial context.

## Experience architecture

The brand and product are intentionally distinct layers:

1. **Homepage** — four meaningful sections only: a 380svh spring-smoothed cinematic arrival, concise explanation, interactive date-change preview, and product portal.
2. **My Stay** (`/stay`) — the primary guest dashboard for booking, arrival, accommodation, journey, and useful actions.
3. **Assistant** (`/assistant`) — a persistent conversation workspace with contextual booking data and a sticky composer.
4. **Explore** (`/explore`) — a compact collection of curated experiences with accessible detail dialogs.

All destinations are real App Router routes. The root provider preserves booking, conversation, preferences, and approval state across client-side navigation.

## Principles

1. AI appears through useful guest-service outcomes, never decorative technology language.
2. Photography carries place, material, and mood; UI carries state and action.
3. Cards are reserved for real objects or states: stays, recommendations, changes, approvals, and confirmations.
4. Marketing composition may be asymmetric and expressive. Product screens are quieter and more operational.
5. Every interaction is keyboard-accessible, clearly focused, and understandable without color alone.

## Typography

| Role | Face | Use |
| --- | --- | --- |
| Display | Newsreader Variable 400–500 | Hero, page and major section headings |
| Product | Instrument Sans Variable 400–700 | Navigation, controls, body copy and assistant UI |
| Data | Instrument Sans with tabular numerals | Dates, prices, references and comparisons |

Scale: cinematic display `clamp(5.25rem, 13.6vw, 13.625rem)`; scene `clamp(4.125rem, 10vw, 10.125rem)`; product page `clamp(2.625rem, 5vw, 3.875rem)`; card `1.25–2rem`; body `0.875–1.0625rem`; utility `0.5625–0.75rem`.

## Colour

- Forest 950 `#0c2822`: immersive surfaces and primary action
- Cinematic forest `#08211b`: public experience ground
- Electric lichen `#c9ff76`: sparse active/confirmed signal only
- Forest 900 `#123a31`: interactive emphasis
- Forest 700 `#476f63`: secondary state and iconography
- Mineral mist `#f2f3ee`: page ground
- Natural stone `#e9ebe4`: section and secondary surface
- Charcoal `#17221f`: primary text
- Warm review accent `#a66c45`: controlled actions only

Status meaning is always paired with text or an icon.

## Layout and spacing

- Content shell: `min(1240px, 100% - 64px)`; mobile `100% - 30px`
- Section rhythm: `clamp(88px, 10vw, 154px)`
- Product spacing steps: 8, 12, 16, 24, 32, 48, 72 px
- Marketing may break the shell for immersive dark or image sections
- Line lengths stay below roughly 60–70 characters

## Surfaces

- Radius small: 3 px; radius medium: 8 px
- Hairline green-tinted borders
- Shadows only for floating or changing state, using low-opacity layered depth
- No generic card grids; grouping defaults to typography, rules, and whitespace

## Controls

- Minimum touch target: 44 px on mobile
- Primary: forest fill, explicit verb, visible hover/press/focus/loading states
- Secondary: hairline border or text treatment
- Icon-only controls always have an accessible name
- Navigation uses native links and URL-backed view state

## Motion

- The arrival uses native browser scrolling with Motion values and a damped visual spring. It never intercepts wheel, touch, keyboard, or scrollbar input; only the image and typography layers are smoothed.
- The arrival is a silent 15-second Higgsfield walkthrough generated from five spatially matched reference frames. It begins beside the lake, follows the approach, crosses the glass threshold, moves through the living room, and finishes in the private suite as one continuous camera shot.
- The video never autoplays on a clock. It remains paused and its `currentTime` is mapped to spring-smoothed native scroll progress, making forward and reverse movement deterministic while preserving normal wheel, touch, keyboard, and scrollbar behavior.
- Desktop receives a 1920×1080 60 fps scrub master; mobile receives a lighter 1280×720 60 fps source. Both use frame blending, no B-frames, fast-start metadata, and keyframes every six frames. Scroll time is quantized to 1/60 second and queued behind completed seeks, preventing redundant 120 Hz updates from overwhelming the decoder.
- Desktop uses 380svh and mobile 290svh, giving the five-position walkthrough enough room while preserving native scrolling. Reduced motion collapses it to one static viewport.
- Motion for React remains responsible for short product and teaser transitions.
- Editorial entrances use `cubic-bezier(.16, 1, .3, 1)`; product UI retains the quieter `.22, 1, .36, 1` family.
- Magnetic pointer response is limited to primary desktop CTAs and moves at most 14–18% of cursor distance.
- Scene motion is transform/opacity based; images use stable `fill` geometry and explicit responsive sizes.
- Product motion is limited to feedback, message entry, state progression, and dialogs; routine interactions stay below 500 ms.
- `prefers-reduced-motion` removes homepage parallax and all non-essential transitions.

## Responsive behaviour

- Homepage becomes image-led single-column storytelling, not a compressed desktop grid
- Product context moves below the main workspace; assistant context hides on narrow mobile
- Composer remains visible, uses 16 px input text, and respects safe-area insets
- Navigation becomes a 44 px minimum-target menu
