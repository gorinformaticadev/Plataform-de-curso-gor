@echo off
echo 🚀 Setting up Platform de Cursos Database...

REM Check if PostgreSQL is running
echo Checking PostgreSQL...
psql -h localhost -U postgres -c "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not running or not configured
    echo Please ensure PostgreSQL is installed and running on port 5432
    echo Then create database: createdb plataform_cursos
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Run Prisma migrations
echo 🗄️ Setting up database schema...
call npx prisma migrate dev --name init

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

REM Seed database
echo 🌱 Seeding database...
call npx prisma db seed

echo ✅ Database setup complete!
echo 📝 You can now start the application with: npm run start:dev
pause
