# PTO Planner

A comprehensive vacation planning application featuring AI-powered chat assistance, weather data integration, and intelligent trip optimization.

## Features

- **Calendar Management**: Interactive calendar for planning PTO days
- **Event System**: Track holidays, work events, and personal commitments
- **Weather Explorer**: Browse weather data for all 50 US states by month
- **PTO Optimizer**: AI-powered suggestions for optimal vacation timing
- **Claude AI Chat**: Conversational assistant for vacation planning
- **Sharing & Export**: Share trip plans and export to various formats
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- Server-Sent Events (SSE) for AI streaming

### Infrastructure
- Docker multi-stage builds
- nginx as reverse proxy
- Alpine Linux base image
- Portainer-compatible deployment

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

### Docker Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd pto-planner

# Set environment variables
cp .env.example .env
# Edit .env and set JWT_SECRET

# Build and start
docker-compose up -d

# Access the application
open http://localhost:8090
```

### Local Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start development servers
# Terminal 1 - Frontend
cd client && npm run dev

# Terminal 2 - Backend
cd server && npm run dev

# Access the application
open http://localhost:5173
```

## Environment Configuration

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-secure-random-string-here
NODE_ENV=production
DB_PATH=/data/pto-planner.db
PORT=3000
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Docker Compose deployment
- Portainer stack deployment
- Production best practices
- Backup and restore procedures
- Troubleshooting guide

## Project Structure

```
pto-planner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── data/             # Weather data generation
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── utils/            # Server utilities
│   ├── db.js             # Database setup
│   └── server.js         # Main server file
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Production compose configuration
├── docker-compose.dev.yml # Development compose override
├── nginx.conf            # nginx reverse proxy config
└── DEPLOYMENT.md         # Deployment documentation
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Calendar & Events
- `GET /api/events` - List user events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Weather
- `GET /api/weather/states` - List all states
- `GET /api/weather/:state` - Get state weather data
- `GET /api/weather/:state/:month` - Get month-specific data

### AI Chat
- `POST /api/ai/chat` - Stream AI chat responses (SSE)

### Trips & Sharing
- `GET /api/trips` - List user trips
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `GET /api/share/:shareToken` - Get shared trip

## Development

### Frontend Development
```bash
cd client
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd server
npm run dev          # Start with nodemon
npm start            # Production start
```

### Building Docker Image
```bash
# Production build
docker build -t pto-planner:latest .

# Development build
docker build --target server-build -t pto-planner:dev .
```

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `events` - Calendar events (holidays, work, personal)
- `trips` - Planned trips and vacations
- `chat_history` - AI chat conversation history

Database migrations are handled automatically on startup.

## Weather Data

Weather data is generated at build time and includes:
- All 50 US states
- Monthly averages (temperature, precipitation, humidity)
- Seasonal descriptions
- Sunny days per month

Data source: Algorithmically generated based on regional climate patterns.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Secure HTTP headers (nginx)
- Non-root container user
- Environment-based secrets
- Input validation and sanitization

## Performance

- Multi-stage Docker builds for minimal image size
- nginx with gzip compression
- Static asset caching (1 year)
- Optimized bundle splitting (Vite)
- Connection pooling (SQLite)
- Efficient SSE streaming for AI chat

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Your License Here]

## Acknowledgments

- Weather data algorithm inspired by NOAA climate data
- UI components built with Tailwind CSS
- Icons from Lucide React
- AI chat powered by Claude (via Anthropic SDK)

## Support

For issues and questions:
- GitHub Issues: [Repository Issues]
- Documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Roadmap

- [ ] Multi-user trip collaboration
- [ ] Integration with calendar services (Google Calendar, iCal)
- [ ] Weather API integration for real-time data
- [ ] Mobile app (React Native)
- [ ] Trip budget tracking
- [ ] Photo upload and gallery
- [ ] Flight and hotel search integration

---

Built with ❤️ using React, Node.js, and Docker
