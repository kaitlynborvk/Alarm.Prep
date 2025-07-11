# Collaborator Setup Guide

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kaitlynborvk/Alarm.Prep.git
   cd Alarm.Prep
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Ask Kaitlyn for the Railway PostgreSQL credentials
   - Update the `DATABASE_URL` in `.env.local`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the app:**
   - Main app: http://localhost:3000
   - Admin page: http://localhost:3000/admin

## Development Workflow

### Before Making Changes:
```bash
git pull origin main
```

### After Making Changes:
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

## Key Files to Edit:

- **Admin Interface**: `src/app/admin/page.tsx`
- **Main App**: `src/app/page.tsx` 
- **Alarm/Quiz UI**: `src/components/AlarmScreen.tsx`
- **Alarm Logic**: `src/services/alarmService.ts`
- **Database Schema**: `prisma/schema.prisma`

## Recent Features:

✅ LaTeX preview system with Unicode symbol conversion
✅ Live previews for all admin form fields
✅ LaTeX helper buttons for math symbols
✅ Real-time mathematical symbol rendering (x², π, √, etc.)

## Need Help?

Contact Kaitlyn for:
- Database credentials
- GitHub repository access
- Technical questions
