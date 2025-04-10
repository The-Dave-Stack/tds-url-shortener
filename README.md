
# URL Shortener

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

<p align="center">
  <img src="https://lovable.dev/opengraph-image-p98pqg.png" alt="URL Shortener Preview" width="600">
</p>

A modern URL shortener application with analytics capabilities. Shorten long URLs, track click metrics, and gain insights into how your links are performing.

## ✨ Features

- 🔗 URL shortening with custom aliases
- 📊 Detailed analytics and tracking
- 👤 User authentication with roles (Admin & User)
- 🔒 Admin panel for user management and app settings
- 🔔 In-app notifications system
- 🌐 Multilingual support (English & Spanish)
- 🌓 Dark/Light theme
- 📱 Responsive design
- 🔒 Secure link management

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **State Management**: React Query, Context API
- **i18n**: React-i18next
- **Deployment**: Docker

## 📋 Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose (for containerized deployment)
- Supabase account for backend services

## 🚀 Getting Started

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

### Docker Deployment

1. **Set up environment variables**

Create a `.env` file with your Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. **Build and run with Docker Compose**

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8080`.

## 🗂️ Project Structure

```
url-shortener/
├── src/                  # Source files
│   ├── components/       # Reusable components
│   │   └── admin/        # Admin panel components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── context/          # Context providers
│   ├── utils/            # Utility functions
│   ├── locales/          # i18n translations
│   ├── integrations/     # Third-party service integrations
│   └── lib/              # Library code and helpers
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── README.md             # Project documentation
└── package.json          # Project dependencies and scripts
```

## 📝 Database Schema

The application uses the following database tables in Supabase:

- **urls**: Stores shortened URLs and their metadata
  - `id`: UUID, primary key
  - `original_url`: Text, the original long URL
  - `short_code`: Text, auto-generated short code
  - `custom_alias`: Text, optional user-defined alias
  - `created_at`: Timestamp, when the URL was created
  - `user_id`: UUID, foreign key to auth.users
  - `clicks`: Integer, number of times the URL was accessed

- **analytics**: Stores URL access analytics
  - `id`: UUID, primary key
  - `url_id`: UUID, foreign key to urls
  - `timestamp`: Timestamp, when the URL was accessed
  - `user_agent`: Text, the browser/device info
  - `ip`: Text, visitor IP address (hashed)
  - `country`: Text, visitor country based on IP

- **profiles**: Stores user profiles and roles
  - `id`: UUID, primary key, foreign key to auth.users
  - `username`: Text, optional username
  - `role`: Enum ('USER', 'ADMIN'), user role
  - `is_active`: Boolean, whether user account is active
  - `created_at`: Timestamp, when the profile was created

- **notifications**: Stores user notifications
  - `id`: UUID, primary key
  - `user_id`: UUID, foreign key to auth.users
  - `title`: Text, notification title
  - `message`: Text, notification content
  - `read`: Boolean, whether notification has been read
  - `created_at`: Timestamp, when the notification was created

- **app_settings**: Stores application settings
  - `id`: UUID, primary key
  - `key`: Text, setting key
  - `value`: JSONB, setting value
  - `updated_at`: Timestamp, when the setting was last updated
  - `updated_by`: UUID, foreign key to auth.users

## 👥 User Roles and Administration

- **USER**: Can create and manage their own shortened URLs
  - Access to personal dashboard with URL statistics
  - Cannot access admin features
  - Cannot see other users' data

- **ADMIN**: Full system access
  - All USER permissions
  - Access to Admin Panel
  - View and manage all users (enable/disable, change roles)
  - Send notifications to users
  - Configure application settings

## 🌐 Multilingual Support

The application supports multiple languages:
- English (default)
- Spanish

Users can switch languages via the language selector in the navbar.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Project Link: [https://github.com/your-username/url-shortener](https://github.com/your-username/url-shortener)

## 🙏 Acknowledgements

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [i18next](https://www.i18next.com/)

