<p align="center">
  <img src="https://raw.githubusercontent.com/gijs-hulsebos/gijs-hulsebos/main/GijsHulsebos.banner.png" alt="Gijs Hulsebos AI Automation" width="100%" />
</p>

<p align="center">
  <a href="https://gijshulsebos.com">
    <img src="https://img.shields.io/badge/gijshulsebos.com-121212?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website" />
  </a>
  &nbsp;
  <a href="https://www.linkedin.com/in/gijs-hulsebos">
    <img src="https://img.shields.io/badge/LinkedIn-121212?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
</p>

---

# StayAI

### 🤖 An AI concierge for discovering your next stay

StayAI brings **conversational hotel discovery**, live hotel data, and saved stays into one accommodation experience. Built by **Gijs Hulsebos**, it connects LLM reasoning with API tools and explicit confirmation flows—a practical example of the agentic systems I build.

Describe where you want to go and what matters to you. StayAI gathers missing details, searches Xotelo, and helps you explore hotels and manage demo reservations through a conversational interface.

> [!NOTE]
> StayAI is a **portfolio product demo**. Reservations are internal demonstration records: no payment, inventory hold, hotel confirmation, or booking-platform write-back occurs. Hotel and rate results depend on the connected provider's coverage and availability.

---

### 🚀 What StayAI Does

- **Conversational discovery:** Search by destination, dates, guests, and stay preferences, with clarification when information is missing.
- **Provider-backed results:** Hotel and rate data comes from Xotelo, with search results supplied to the interface from server-side tool data.
- **Saved stays:** Bookmark hotels and revisit them in your personal stay overview.
- **Demo reservation management:** Create and cancel demonstration reservations, and prepare reactivation through the assistant.
- **Explicit confirmation:** The assistant prepares reservation actions; the interface performs writes after confirmation.
- **Visible progress:** Status updates keep the conversation informed while the assistant works.

---

### 🛠️ Technical Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Application** | Next.js, React, TypeScript | Pages, interactive UI, and server API routes |
| **Interface** | Tailwind CSS, Motion, Lucide | Styling, animation, and icons |
| **AI orchestration** | OpenRouter | Tool calling, structured responses, and model fallback |
| **Hotel data** | Xotelo via RapidAPI | Hotel discovery and rate lookup |
| **Auth & persistence** | Supabase Auth, Postgres | Demo account, saved hotels, and reservation records |

### ⚙️ How It Works

1. The signed-in user sends a request to the StayAI assistant.
2. The server runs the OpenRouter conversation and calls the appropriate search or record-reading tools.
3. Xotelo provides hotel data; Supabase provides the user's saved records.
4. The assistant returns a structured response for the interface to display.
5. Reservation actions require confirmation before the application writes a demo record.

The model does not directly mutate stored data. Checked-in database migrations define owner-scoped row-level security for saved stays and reservations.

---

### 💻 Run Locally

**You will need:** Node.js and npm, a Supabase project, an OpenRouter API key, and a RapidAPI key subscribed to Xotelo.

#### 1. Install and configure

```powershell
npm install
Copy-Item .env.example .env.local
```

Fill in `.env.local` using the variables documented in [`.env.example`](.env.example). Add your Supabase URL and publishable key, OpenRouter key, and Xotelo RapidAPI key. Keep private API keys out of version control.

#### 2. Prepare the database and demo account

Apply the checked-in [Supabase migrations](supabase/migrations) to your project. Provision the fixed demo Auth user through the Supabase dashboard or the included helper.

For the helper, set the project URL and a temporary service-role key in the current PowerShell session:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "temporary-service-role-key"
try {
  npm run provision:demo-user
} finally {
  Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
}
```

The helper creates `io-demo@stayai.local` with the demo password below. The service-role key is only for provisioning; the application does not use it, and it must not be added to `.env.local`.

#### 3. Start StayAI

```powershell
npm run dev -- --port 3001
```

Open [localhost:3001](http://localhost:3001) and sign in with **`IO-DEMO` / `IO-DEMO1`**. The interface uses this demo username rather than displaying the internal Auth email.

#### Project checks

```powershell
npm run typecheck
npm run build
```

`npm run lint` also runs the TypeScript checker in this repository.

---

### 📂 Project Map

| Path | Contents |
| :--- | :--- |
| [`app/`](app) | Application pages and API routes |
| [`components/`](components) | Assistant, hotel exploration, saved stays, and UI components |
| [`lib/openrouter.ts`](lib/openrouter.ts) | Agent instructions, tools, and structured responses |
| [`lib/xotelo.ts`](lib/xotelo.ts) | Destination resolution, hotel search, and rate integration |
| [`lib/supabase/`](lib/supabase) | Browser and server database clients |
| [`supabase/migrations/`](supabase/migrations) | Database schema and access policies |
| [`scripts/`](scripts) | Demo account provisioning helper |
| [`video-demo/`](video-demo) | Video demo project |

---

### 📈 Engineering Focus

I build **autonomous agentic workflows** that connect LLMs with business logic. StayAI demonstrates that approach through:

- **Grounded tool use:** Connecting reasoning to external hotel data and stored records.
- **Controlled actions:** Keeping model suggestions and confirmed application writes separate.
- **Error recovery:** Using model fallback and surfacing failures to the interface.
- **Maintainable delivery:** Typed application code, versioned database migrations, and documented setup.

Explore more of my work in the [n8n Automation Hub](https://github.com/gijs-hulsebos/n8n-automation), or view my [AI & Technical Credentials](https://github.com/gijs-hulsebos/Certificates).

### 🌐 Let's Connect

Open for new opportunities and high-impact collaborations in AI automation and agentic systems.

- **Website:** [gijshulsebos.com](https://gijshulsebos.com)
- **LinkedIn:** [Gijs Hulsebos](https://www.linkedin.com/in/gijs-hulsebos)
- **Email:** [gijs@gijshulsebos.com](mailto:gijs@gijshulsebos.com)

---

<p align="center">
  <img src="https://raw.githubusercontent.com/gijs-hulsebos/gijs-hulsebos/main/readme.md.banner.png" alt="Gijs Hulsebos AI Automation Footer" width="100%" />
</p>
