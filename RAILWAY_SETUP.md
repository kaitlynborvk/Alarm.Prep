# Railway PostgreSQL Setup Guide

This guide will help you connect your AlarmPrep application to a Railway PostgreSQL database.

## 1. Setting up Railway PostgreSQL

### Create a Railway Account and Project
1. Go to [Railway](https://railway.app) and sign up/login
2. Create a new project
3. Add a PostgreSQL database service

### Get Database Connection URL
1. In your Railway project dashboard, click on your PostgreSQL service
2. Go to the "Variables" tab
3. Copy the `DATABASE_URL` value

## 2. Configure Your Local Environment

### Set Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Replace the `DATABASE_URL` in `.env.local` with your Railway PostgreSQL URL:
   ```
   DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:6543/railway"
   ```

## 3. Set up the Database

### Generate Prisma Client
```bash
npm run db:generate
```

### Push the Database Schema
```bash
npm run db:push
```

### Seed the Database (Optional)
```bash
npm run db:seed
```

## 4. Railway Deployment Setup

### Environment Variables in Railway
1. In your Railway project dashboard, go to your app service
2. Click on the "Variables" tab
3. Add the following environment variables:
   - `DATABASE_URL`: Use the PostgreSQL connection URL from step 1
   - `NODE_ENV`: Set to `production`

### Automatic Deployments
Railway will automatically deploy when you push to your connected Git repository.

## 5. Useful Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio to view/edit data
- `npm run db:seed` - Populate database with sample data

## 6. Troubleshooting

### Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure your Railway PostgreSQL service is running
- Check that your IP is not blocked (Railway typically allows all connections)

### Migration Issues
- If you have schema changes, run `npm run db:push` for development
- For production, use `npm run db:migrate` to create proper migrations

### Local Development
- Use `.env.local` for local environment variables
- Never commit `.env.local` to version control
- The `.env.example` file shows the required format

## 7. Production Checklist

- [ ] Railway PostgreSQL service is running
- [ ] `DATABASE_URL` is set in Railway environment variables
- [ ] Database schema is pushed/migrated
- [ ] Application builds successfully
- [ ] API endpoints are accessible
