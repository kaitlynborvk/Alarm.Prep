# VS Code Setup Guide for AlarmPrep

## 🚀 Quick Start for Collaborators

### **1. Clone & Setup** (5 minutes)
```bash
git clone https://github.com/kaitlynborvk/Alarm.Prep.git
cd Alarm.Prep
npm install
```

### **2. Environment Variables**
Create `.env.local` file in root directory:
```env
DATABASE_URL="postgresql://postgres:bDEGdEGG5AGb5aA-CfCAGCdAAdCF5b@viaduct.proxy.rlwy.net:50713/railway"
```

### **3. Database Setup**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### **4. Run Development**
```bash
npm run dev
```
Open: http://localhost:3000

---

## 📂 Key Files to Edit

### **🎯 Most Important Files**
- **`src/app/admin/page.tsx`** - Question management interface
- **`src/app/page.tsx`** - Main alarm app 
- **`src/components/AlarmScreen.tsx`** - Quiz modal
- **`src/services/alarmService.ts`** - Core alarm logic

### **🔧 Configuration Files**
- **`prisma/schema.prisma`** - Database schema
- **`src/app/api/questions/route.ts`** - Backend API
- **`capacitor.config.ts`** - Mobile settings

---

## 🛠️ VS Code Extensions (Recommended)

Install these extensions for best experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense** 
3. **Prisma** (for database schema)
4. **TypeScript Importer**
5. **Auto Rename Tag**
6. **Bracket Pair Colorizer**

---

## 🎯 Development Workflow

### **Before Coding**
```bash
git pull origin main  # Get latest changes
npm run dev          # Start dev server
```

### **Testing Your Changes**
- **Web**: http://localhost:3000 (main app)
- **Admin**: http://localhost:3000/admin (question management)
- **Mobile**: `npm run build && npx cap sync ios`

### **After Coding**
```bash
git add .
git commit -m "Your change description"
git push origin main
```

---

## 🧩 Project Structure (VS Code File Explorer)

```
📁 AlarmPrep-main/
├── 📁 src/app/
│   ├── 📄 page.tsx           ← Main alarm interface
│   ├── 📁 admin/
│   │   └── 📄 page.tsx       ← Question management
│   └── 📁 api/questions/
│       └── 📄 route.ts       ← Backend API
├── 📁 src/components/
│   ├── 📄 AlarmScreen.tsx    ← Quiz modal
│   └── 📄 BottomNav.tsx      ← Navigation
├── 📁 src/services/
│   ├── 📄 alarmService.ts    ← Core logic
│   └── 📄 iosService.ts      ← Mobile features
├── 📁 prisma/
│   ├── 📄 schema.prisma      ← Database schema
│   └── 📄 seed.ts            ← Sample data
└── 📄 .env.local             ← Environment variables
```

---

## 🎨 What You're Working On

### **Current Features**
✅ Alarm scheduling with quiz triggers  
✅ GMAT/LSAT question database  
✅ LaTeX math notation support  
✅ iOS mobile app integration  
✅ Admin question management  

### **Recently Added** 
🆕 **LaTeX Preview System** - Real-time math rendering  
🆕 **Enhanced Admin UI** - Better question creation  
🆕 **Mobile Optimization** - Improved iOS experience  

---

## 🔍 Debug & Development

### **VS Code Debug Configuration**
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

### **Terminal Commands**
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production

# Database
npx prisma studio       # Database browser
npx prisma db seed      # Reset sample data

# Mobile
npx cap sync ios        # Sync to iOS
npx cap open ios        # Open Xcode
```

---

## 🎯 Common Tasks

### **Adding New Questions**
1. Go to http://localhost:3000/admin
2. Fill out question form with LaTeX support
3. Preview shows formatted math symbols
4. Save to database

### **Testing Alarms**
1. Use "Test Modal" button on main page
2. Try answering questions correctly/incorrectly
3. Check haptic feedback on mobile

### **Modifying Quiz Logic**
- Edit `src/services/alarmService.ts`
- Update `src/components/AlarmScreen.tsx` for UI
- Test with admin panel questions

---

## 🆘 Troubleshooting

### **Common Issues**
- **Port 3000 in use**: Dev server will use 3001
- **Database connection error**: Check `.env.local` file
- **LaTeX not rendering**: Check browser console
- **iOS build issues**: Update Xcode & iOS SDK

### **Quick Fixes**
```bash
# Reset database
npx prisma db push --force-reset
npx prisma db seed

# Clear Next.js cache
rm -rf .next
npm run dev

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

**Happy Coding! 🚀**
