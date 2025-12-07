---
description: Complete guide to deploy the NTRO-VOTE application
---

# NTRO-VOTE Application Deployment Guide

This guide covers multiple deployment strategies for the NTRO-VOTE voting system (Spring Boot + React).

---

## Table of Contents
1. [Local Development Deployment](#local-development-deployment)
2. [Production Deployment (Cloud Platforms)](#production-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Local Development Deployment

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven (included via wrapper)

### Step 1: Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE ntrovote;

# Exit MySQL
exit;
```

### Step 2: Configure Backend
1. Navigate to `backend/src/main/resources/application.properties`
2. Update database credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ntrovote?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Configure Twilio (for SMS OTP):
   ```properties
   twilio.account_sid=YOUR_TWILIO_ACCOUNT_SID
   twilio.auth_token=YOUR_TWILIO_AUTH_TOKEN
   twilio.phone_number=YOUR_TWILIO_PHONE_NUMBER
   ```

### Step 3: Start Backend
```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
```
Backend will run on `http://localhost:8080`

### Step 4: Configure Frontend
1. Navigate to `frontend/src` and check API configuration
2. Ensure API calls point to correct backend URL (default: `http://localhost:8080`)

### Step 5: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

### Default Credentials
- **Admin Username**: `admin`
- **Admin Password**: `admin123`

---

## Production Deployment

### Option 1: Railway (Recommended - Easiest)

#### Backend Deployment
1. **Sign up** at [Railway.app](https://railway.app)
2. **Create New Project** → **Deploy from GitHub repo**
3. **Select your repository** and choose the `backend` folder
4. **Add MySQL Database**:
   - Click "New" → "Database" → "MySQL"
   - Railway will automatically create a database
5. **Configure Environment Variables**:
   ```
   SPRING_DATASOURCE_URL=${MYSQLURL}
   SPRING_DATASOURCE_USERNAME=${MYSQLUSER}
   SPRING_DATASOURCE_PASSWORD=${MYSQLPASSWORD}
   JWT_SECRET=your-secure-jwt-secret-key-min-32-chars
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   SPRING_PROFILES_ACTIVE=prod
   ```
6. **Configure Build Settings**:
   - Root Directory: `/backend`
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
7. **Deploy** - Railway will build and deploy automatically
8. **Note your backend URL**: `https://your-app.railway.app`

#### Frontend Deployment
1. **Create another Railway service** for frontend
2. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
3. **Update Frontend API Configuration**:
   - Create `frontend/.env.production`:
     ```
     VITE_API_URL=https://your-backend.railway.app
     ```
   - Update API calls to use `import.meta.env.VITE_API_URL`
4. **Configure Build Settings**:
   - Root Directory: `/frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` or use a static server
5. **Deploy**

#### Alternative: Use Vercel/Netlify for Frontend
1. **Build frontend locally**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Deploy to Vercel**:
   ```bash
   npm i -g vercel
   vercel --prod
   ```
3. **Configure Environment Variables** in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

---

### Option 2: Render.com

#### Backend Deployment
1. **Sign up** at [Render.com](https://render.com)
2. **Create New** → **Web Service**
3. **Connect GitHub repository**
4. **Configure**:
   - Environment: `Java`
   - Build Command: `cd backend && mvn clean package -DskipTests`
   - Start Command: `cd backend && java -jar target/backend-0.0.1-SNAPSHOT.jar`
5. **Add PostgreSQL Database** (Render's free tier) OR **External MySQL**:
   - Create → Database → PostgreSQL
   - Update `pom.xml` to include PostgreSQL driver:
     ```xml
     <dependency>
         <groupId>org.postgresql</groupId>
         <artifactId>postgresql</artifactId>
     </dependency>
     ```
   - Update application.properties for PostgreSQL:
     ```properties
     spring.datasource.url=${DATABASE_URL}
     spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
     ```
6. **Add Environment Variables** (same as Railway)
7. **Deploy**

#### Frontend Deployment
1. **Create Static Site** on Render
2. **Configure**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
3. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. **Deploy**

---

### Option 3: AWS (Advanced)

#### Backend: Elastic Beanstalk
1. **Package application**:
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
2. **Install AWS CLI and EB CLI**:
   ```bash
   pip install awsebcli
   ```
3. **Initialize Elastic Beanstalk**:
   ```bash
   eb init -p java-17 ntro-vote-backend
   ```
4. **Create RDS MySQL instance** via AWS Console
5. **Configure environment variables** in EB:
   ```bash
   eb setenv SPRING_DATASOURCE_URL=jdbc:mysql://your-rds-endpoint:3306/ntrovote \
             SPRING_DATASOURCE_USERNAME=admin \
             SPRING_DATASOURCE_PASSWORD=yourpassword \
             JWT_SECRET=your-jwt-secret \
             TWILIO_ACCOUNT_SID=your_sid \
             TWILIO_AUTH_TOKEN=your_token \
             TWILIO_PHONE_NUMBER=your_number
   ```
6. **Deploy**:
   ```bash
   eb create ntro-vote-env
   eb deploy
   ```

#### Frontend: S3 + CloudFront
1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Create S3 bucket** and enable static website hosting
3. **Upload build files**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```
4. **Create CloudFront distribution** pointing to S3 bucket
5. **Update bucket policy** for CloudFront access

---

## Docker Deployment

### Create Dockerfiles

#### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Compose
Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ntrovote
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - ntro-network

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ntrovote?useSSL=false&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: rootpassword
      JWT_SECRET: your-jwt-secret-key-here
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER}
    depends_on:
      - mysql
    networks:
      - ntro-network

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - ntro-network

volumes:
  mysql-data:

networks:
  ntro-network:
    driver: bridge
```

### Deploy with Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Environment Configuration

### Backend Environment Variables

Create `backend/src/main/resources/application-prod.properties`:
```properties
# Production profile
spring.application.name=ntro-vote-backend

# Database (use environment variables)
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# Server
server.port=${PORT:8080}

# Twilio
twilio.account_sid=${TWILIO_ACCOUNT_SID}
twilio.auth_token=${TWILIO_AUTH_TOKEN}
twilio.phone_number=${TWILIO_PHONE_NUMBER}

# CORS (update with your frontend URL)
cors.allowed.origins=${CORS_ORIGINS:http://localhost:5173}
```

### Frontend Environment Configuration

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

Update frontend API configuration to use environment variables:
```javascript
// frontend/src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export default API_BASE_URL;
```

Update all API calls to use this configuration:
```javascript
import API_BASE_URL from './config/api';

axios.post(`${API_BASE_URL}/auth/send-otp`, data);
```

---

## Post-Deployment Checklist

### Security
- [ ] Change default admin credentials
- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Store sensitive credentials in environment variables, never in code
- [ ] Enable HTTPS/SSL for production
- [ ] Configure CORS to allow only your frontend domain
- [ ] Set secure cookie flags if using session-based auth
- [ ] Review and restrict database access
- [ ] Enable database backups

### Database
- [ ] Database is created and accessible
- [ ] Connection string is correct
- [ ] Tables are created automatically (check JPA logs)
- [ ] Default admin user is created
- [ ] Database has proper indexes for performance
- [ ] Set up automated backups

### Application
- [ ] Backend is accessible and returns 200 OK on health check
- [ ] Frontend loads correctly
- [ ] API calls from frontend to backend work
- [ ] File uploads work (test nominee image upload)
- [ ] SMS OTP is sending correctly (verify Twilio credits)
- [ ] JWT authentication works
- [ ] Admin can login and create elections
- [ ] Users can login with OTP
- [ ] Voting functionality works end-to-end
- [ ] Real-time results update correctly

### Monitoring
- [ ] Set up application logging
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Configure alerts for critical errors

### Performance
- [ ] Frontend assets are minified
- [ ] Images are optimized
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Database queries are optimized
- [ ] Connection pooling is configured

---

## Troubleshooting

### Backend Issues

**Database Connection Failed**
```bash
# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Verify connection string
echo $SPRING_DATASOURCE_URL
```

**Port Already in Use**
```bash
# Find process using port 8080
lsof -i :8080
# Kill the process
kill -9 <PID>
```

**Build Fails**
```bash
# Clean Maven cache
./mvnw clean
rm -rf ~/.m2/repository
./mvnw clean install
```

### Frontend Issues

**API Calls Failing (CORS)**
- Update backend CORS configuration to allow frontend domain
- Check if API_BASE_URL is correctly set

**Build Fails**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment Variables Not Working**
- Ensure `.env.production` file exists
- Variables must start with `VITE_`
- Rebuild after changing env variables

### Twilio Issues
- Verify Twilio credentials are correct
- Check Twilio account balance
- Ensure phone number is verified
- Check Twilio logs in dashboard

---

## Recommended Production Setup

For a production-ready deployment, I recommend:

1. **Backend**: Railway or Render (easy, affordable)
2. **Frontend**: Vercel or Netlify (best for React/Vite apps)
3. **Database**: Railway MySQL or AWS RDS
4. **Monitoring**: Sentry for error tracking
5. **Analytics**: Google Analytics or Plausible

### Estimated Monthly Costs (Small Scale)
- **Railway**: $5-20/month (backend + database)
- **Vercel/Netlify**: Free for most use cases
- **Twilio**: Pay-as-you-go (~ $0.0075/SMS)
- **Total**: ~$10-30/month for small to medium usage

---

## Additional Resources

- [Spring Boot Deployment Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Vite Deployment Documentation](https://vitejs.dev/guide/static-deploy.html)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)
