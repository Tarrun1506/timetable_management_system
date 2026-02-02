# Smart Timetable Maker

An AI-powered timetable generation system with responsive design for educational institutions.

## Features

- 🤖 AI-powered timetable generation
- 📱 Fully responsive design (mobile, tablet, desktop)
- 👥 User management (Admin, Teachers, Students)
- 📊 Analytics and reporting
- 🔍 Query resolution system
- 🎨 Modern UI with dark mode support
- 📱 Mobile hamburger menu navigation

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Node.js + Express
- MongoDB
- JWT Authentication
- Gemini AI Integration

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VibuthiV/smart_timetable_maker.git
   cd smart_timetable_maker
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Client**
   ```bash
   cd client
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## Environment Variables

### Server (.env)
```
MONGODB_URI=your_mongodb_connection_string
PORT=8000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

### Client (.env.local)
```
VITE_API_URL=http://localhost:8000
```

## Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly interactions
- Mobile hamburger menu
- Responsive tables and forms

## Documentation

- [Responsive Design Guide](./RESPONSIVE_DESIGN.md)
- [Mobile Menu Guide](./MOBILE_MENU_GUIDE.md)
- [Testing Guide](./RESPONSIVE_TESTING.md)

## Project Structure

```
smart_timetable_maker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── services/      # API services
│   └── public/            # Static assets
├── server/                # Backend Node.js application
│   ├── routes/           # API routes
│   ├── models/           # MongoDB models
│   ├── middleware/       # Express middleware
│   └── algorithms/       # Timetable generation logic
└── docs/                 # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Authors

- VibuthiV - [GitHub](https://github.com/VibuthiV)

## Acknowledgments

- Built with React and Node.js
- UI components from Lucide Icons
- Styling with Tailwind CSS
- AI integration with Google Gemini