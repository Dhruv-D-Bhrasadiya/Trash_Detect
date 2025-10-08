# 🗑️ Trash Detection and Incentive System

A comprehensive web application that uses AI to detect trash and bins in images, rewarding users with points for proper waste management practices.

## 🌟 Features

### User Features
- **Image Upload & Detection**: Upload images to detect trash and bins using AI
- **Point System**: Earn points based on detection results:
  - +1 point: Both trash and bin detected
  - -1 point: Trash detected but no bin
  - 0 points: Bin only or nothing detected
- **Dashboard**: View personal statistics and recent submissions
- **Leaderboard**: See rankings and compete with other users
- **User Authentication**: Secure login and registration system

### Admin Features
- **User Management**: Activate/deactivate users and grant admin privileges
- **System Analytics**: View global statistics and user activity
- **Submission Monitoring**: Track all user submissions and detections
- **Admin Dashboard**: Comprehensive overview of system performance

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite (easily configurable for PostgreSQL/MySQL)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **AI Model**: Hugging Face transformers with fine-tuned trash detection model
- **File Upload**: Secure image upload and processing
- **Admin Controls**: Role-based access control for admin functions

### Frontend (React)
- **Framework**: React 18 with Material-UI (MUI)
- **Routing**: React Router for navigation
- **State Management**: Context API for authentication
- **UI Components**: Modern, responsive Material Design components
- **File Upload**: Drag-and-drop image upload with preview
- **Real-time Updates**: Dynamic leaderboard and statistics

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create admin user**:
   ```bash
   python -m backend.create_admin
   ```

5. **Start the server**:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your_super_secret_key_here
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Configuration

The system uses SQLite by default. To use PostgreSQL or MySQL:

1. Update `backend/database.py`:
   ```python
   DATABASE_URL = "postgresql://user:password@localhost/dbname"
   ```

2. Install additional dependencies:
   ```bash
   pip install psycopg2-binary  # For PostgreSQL
   # or
   pip install mysqlclient      # For MySQL
   ```

## 🎯 Usage

### For Users

1. **Register**: Create an account with username and password
2. **Login**: Access your dashboard
3. **Upload**: Go to Upload page and drag/drop or select an image
4. **View Results**: See detection results and earned points
5. **Track Progress**: Check your stats and ranking on the leaderboard

### For Admins

1. **Login**: Use admin credentials (created via create_admin script)
2. **Dashboard**: View system overview and statistics
3. **User Management**: Activate/deactivate users or grant admin privileges
4. **Analytics**: Monitor system performance and user activity

## 🔍 API Endpoints

### Authentication
- `POST /users/` - Register new user
- `POST /token` - Login and get access token
- `GET /users/me/` - Get current user info

### User Operations
- `POST /uploadfile/` - Upload image for detection
- `GET /submissions/` - Get user's submissions
- `GET /leaderboard/` - Get leaderboard
- `GET /stats/` - Get user statistics

### Admin Operations
- `GET /admin/users/` - Get all users
- `GET /admin/submissions/` - Get all submissions
- `GET /admin/stats/` - Get global statistics
- `POST /admin/users/{user_id}/toggle-active` - Toggle user status
- `POST /admin/users/{user_id}/make-admin` - Make user admin

## 🧠 AI Model

The system uses a fine-tuned object detection model:
- **Model**: `mrdbourke/rt_detrv2_finetuned_trashify_box_detector_v1`
- **Capabilities**: Detects trash items and bins in images
- **Framework**: Hugging Face Transformers
- **Performance**: Optimized for real-time inference

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-based Access**: Admin and user role separation
- **File Upload Security**: Validated image file types
- **CORS Protection**: Configured for secure cross-origin requests

## 📊 Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `hashed_password`: Bcrypt hashed password
- `points`: User's total points
- `is_active`: Account status
- `is_superuser`: Admin privilege flag

### Submissions Table
- `id`: Primary key
- `image_path`: Path to uploaded image
- `score`: Points earned from detection
- `timestamp`: Submission time
- `owner_id`: Foreign key to users

### Detections Table
- `id`: Primary key
- `label`: Detected object label
- `confidence`: Detection confidence score
- `xmin`, `ymin`, `xmax`, `ymax`: Bounding box coordinates
- `submission_id`: Foreign key to submissions

## 🚀 Deployment

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./test.db
    volumes:
      - ./uploads:/app/uploads
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Production Considerations

1. **Use PostgreSQL**: Replace SQLite with PostgreSQL for production
2. **Environment Variables**: Set proper SECRET_KEY and database credentials
3. **File Storage**: Use cloud storage (AWS S3, Google Cloud) for uploaded images
4. **HTTPS**: Enable SSL certificates
5. **Load Balancing**: Use nginx for reverse proxy
6. **Monitoring**: Add logging and monitoring tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Hugging Face for the AI model
- FastAPI for the excellent web framework
- Material-UI for the beautiful React components
- The open-source community for various dependencies

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs` endpoint
- Review the code comments for implementation details

---

**Happy Trash Detecting! 🌱**
