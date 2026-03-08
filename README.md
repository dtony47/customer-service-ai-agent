# Customer Service AI Agent - SaaS Platform

A production-ready, multi-tenant SaaS platform for intelligent customer service automation. Deploy white-label customer service agents that automatically respond across multiple channels (Slack, WhatsApp, Email, Voice) using AI and company-specific knowledge bases.

## ✨ Features

### Core Platform
- 🤖 **AI-Powered Responses**: Google Gemini AI integration for intelligent responses
- 📱 **Multi-Channel Support**: Slack, WhatsApp, Email, Voice (Twilio)
- 🔄 **Multi-Tenancy**: True SaaS architecture with complete tenant isolation
- 💳 **Billing & Subscriptions**: Stripe integration with 3 tiers (Starter, Pro, Enterprise)
- 📊 **Usage Metering**: Track API calls, messages, conversations per tenant
- 🔐 **Enterprise Security**: JWT auth, API keys, tenant isolation, role-based access
- 📚 **Knowledge Base Management**: FAQs, Policies, SOPs per tenant
- 📈 **Admin Dashboard**: Tenant metrics, usage stats, channel management

### Developer Features
- 🛠️ **Comprehensive API**: RESTful endpoints for all functionality
- 🧪 **Full Test Suite**: 3,500+ tests for reliability
- 🐳 **Docker Ready**: docker-compose for local development
- 📦 **Render Deployment**: Blueprint config for 1-click deployment
- 📚 **Complete Documentation**: Architecture, API, deployment guides

## Tech Stack

### Backend
- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL for data persistence
- **Supabase** (optional): Cloud PostgreSQL, Auth, Real-time, Storage
- Google Gemini API for AI
- Socket.io for real-time updates

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- React Query for state management
- Shadcn UI components
- **Supabase** (optional): Real-time subscriptions, Storage

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Google API Key (from Google Cloud Console)
- Docker (optional, for PostgreSQL)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dtony47/customer-service-ai-agent.git
cd customer-service-ai-agent
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend (in separate terminal)
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your credentials
```

4. **Set up database**
```bash
cd backend
npm run db:setup
npm run db:migrate
```

5. **Start the application**
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory, new terminal)
npm run dev
```

Backend: http://localhost:3000
Frontend: http://localhost:5173

## Configuration

### Channel Setup

#### Slack
1. Create a Slack App at https://api.slack.com/apps
2. Enable Socket Mode and add the required scopes
3. Get your Bot Token and Signing Secret
4. Add to .env: `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET`

#### WhatsApp (Evolution API)
1. Start Evolution API: `docker compose up -d` (if using Docker)
2. Create instance and get API key
3. Add to .env: `WHATSAPP_API_URL` and `WHATSAPP_API_KEY`

#### Email
1. Configure SMTP settings (Gmail, Outlook, or custom SMTP)
2. Add credentials to .env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

#### Voice (Twilio)
1. Create Twilio account at https://www.twilio.com
2. Get Account SID, Auth Token, and phone number
3. Add to .env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### Knowledge Base Setup

1. Access the dashboard at http://localhost:5173
2. Navigate to "Knowledge Base" section
3. Add:
   - **Policies**: Company rules and guidelines
   - **SOPs**: Standard Operating Procedures
   - **FAQs**: Frequently Asked Questions

## API Endpoints

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create new message
- `GET /api/messages/:id` - Get message details

### Knowledge Base
- `GET /api/kb/policies` - Get all policies
- `POST /api/kb/policies` - Create policy
- `PUT /api/kb/policies/:id` - Update policy
- `DELETE /api/kb/policies/:id` - Delete policy

Similar endpoints for `/api/kb/faqs` and `/api/kb/sops`

### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations/:id/messages` - Add message to conversation

## Project Structure

```
customer-service-ai-agent/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── integrations/
│   │   │   ├── slack.ts
│   │   │   ├── whatsapp.ts
│   │   │   ├── email.ts
│   │   │   └── twilio.ts
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── db/
│   │   │   └── migrations/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
└── docs/
    ├── SETUP.md
    ├── API.md
    ├── DEPLOYMENT.md
    └── TROUBLESHOOTING.md
```

## Development

### Running Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Linting & Formatting
```bash
cd backend
npm run lint
npm run format

cd ../frontend
npm run lint
npm run format
```

### Database Migrations
```bash
cd backend
npm run db:migrate
npm run db:rollback
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## Documentation

- **[Supabase Integration](docs/SUPABASE_SETUP.md)** - Cloud PostgreSQL, Auth, Real-time, and Storage
- **[Architecture](docs/ARCHITECTURE.md)** - System design and multi-tenancy model
- **[Render Deployment](docs/RENDER_DEPLOYMENT.md)** - Step-by-step Render.com deployment
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Pre/post-deployment QA

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact the development team.

## Roadmap

- [ ] WhatsApp media support (images, documents)
- [ ] Multi-language support
- [ ] Sentiment analysis
- [ ] Performance analytics dashboard
- [ ] Integration with CRM systems (Salesforce, HubSpot)
- [ ] A/B testing for responses
- [ ] Chatbot training interface
