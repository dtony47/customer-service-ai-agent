# Customer Service AI Agent

## Project Structure

```
customer-service-ai-agent/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── integrations/      # Channel integrations
│   │   │   ├── slack.ts       # Slack integration
│   │   │   ├── whatsapp.ts    # WhatsApp/Evolution API
│   │   │   ├── email.ts       # Email integration
│   │   │   └── twilio.ts      # Voice/Twilio integration
│   │   ├── services/          # Business logic
│   │   │   ├── ai-service.ts  # Google Gemini AI service
│   │   │   └── channel-manager.ts # Channel management
│   │   ├── routes/            # API routes
│   │   │   ├── messages.ts
│   │   │   ├── conversations.ts
│   │   │   ├── knowledge-base.ts
│   │   │   └── channels.ts
│   │   ├── middleware/        # Express middleware
│   │   ├── db/                # Database setup & migrations
│   │   └── types/             # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # React + TypeScript dashboard
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Conversations.tsx
│   │   │   ├── KnowledgeBase.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API client services
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   └── .env.example
│
└── docs/                       # Documentation
    ├── SETUP.md               # Detailed setup guide
    ├── API.md                 # API documentation
    ├── DEPLOYMENT.md          # Deployment guide
    └── TROUBLESHOOTING.md     # Troubleshooting
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 12+ (for production)
- Google API Key (from Google Cloud Console)

### Quick Start

1. **Clone and navigate to project**
```bash
cd customer-service-ai-agent
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup** (new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health

## Configuration

### Required Environment Variables

**Backend (.env)**
- `GOOGLE_API_KEY` - Google Gemini API key
- `DATABASE_URL` - PostgreSQL connection string
- `SLACK_BOT_TOKEN` - Slack bot token
- `SLACK_SIGNING_SECRET` - Slack signing secret
- `WHATSAPP_API_URL` - Evolution API URL
- `WHATSAPP_API_KEY` - Evolution API key
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - Email configuration
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - Voice

**Frontend (.env)**
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket URL

## Channel Integration

### Slack
1. Create app at https://api.slack.com/apps
2. Enable Socket Mode
3. Add Messaging scopes
4. Copy Bot Token and Signing Secret to .env

### WhatsApp (Evolution API)
1. Run Evolution API with Docker
2. Create instance and get API key
3. Set webhook for message receiving

### Email
1. Configure SMTP settings (Gmail, Outlook, etc.)
2. Use app passwords (not main password)

### Voice (Twilio)
1. Create Twilio account
2. Get Account SID and Auth Token
3. Provision a phone number

## Development

### Backend Commands
```bash
npm run dev           # Start dev server with hot reload
npm run build         # Build TypeScript
npm run lint          # Run ESLint
npm run format        # Format with Prettier
npm test              # Run tests
npm run db:setup      # Initialize database
npm run db:migrate    # Run migrations
```

### Frontend Commands
```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

## API Endpoints

### Messages
- `GET /api/messages` - List messages
- `POST /api/messages` - Create message
- `GET /api/messages/:id` - Get message

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get conversation
- `POST /api/conversations/:id/messages` - Add message

### Knowledge Base
- `GET /api/kb/faqs` - List FAQs
- `POST /api/kb/faqs` - Create FAQ
- `GET /api/kb/policies` - List policies
- `POST /api/kb/policies` - Create policy
- `GET /api/kb/sops` - List SOPs
- `POST /api/kb/sops` - Create SOP

### Channels
- `GET /api/channels` - List channels
- `GET /api/channels/:id/status` - Channel status

## Technology Stack

### Backend
- **Framework**: Express.js 4.19 with TypeScript 5.5
- **AI**: Google Generative AI (Gemini)
- **Database**: PostgreSQL with pg
- **Integrations**:
  - Slack: @slack/bolt & @slack/web-api
  - WhatsApp: Evolution API via axios
  - Email: nodemailer
  - Voice: Twilio SDK
- **Real-time**: Socket.io
- **Logging**: Winston

### Frontend
- **Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 5.1
- **Routing**: React Router v6
- **State**: Zustand + React Query
- **Styling**: TailwindCSS 3.4 + PostCSS
- **HTTP Client**: Axios

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Docker containerization
- Heroku deployment
- AWS deployment
- Environment setup for production

## Troubleshooting

Common issues and solutions in [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Create pull request

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
