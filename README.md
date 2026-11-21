# ============================================
# BLOG APP — COMPLETE SETUP (DVertex)
# ============================================

# 1. Clone the repo
git clone https://github.com/SanjayMahato01/blog-next.git
cd blog-next

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << 'EOF'
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="replace_with_a_long_random_string"
NODE_ENV="development"
EOF

# (Windows PowerShell — use this instead of step 3 if on Windows)
# @"
# DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
# JWT_SECRET="replace_with_a_long_random_string"
# NODE_ENV="development"
# "@ | Out-File -Encoding utf8 .env

# 4. Generate a strong JWT secret (copy output into .env)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 5. Prisma setup
npx prisma generate
npx prisma db push

# 6. (Optional) Open Prisma Studio DB GUI
# npx prisma studio

# 7. Run the app
npm run dev

# Open http://localhost:3000

# ============================================
# PRODUCTION BUILD
# ============================================
# npm run build
# npm start

# ============================================
# SCRIPTS REFERENCE
# ============================================
# npm install            -> Install dependencies
# npx prisma generate    -> Generate Prisma client
# npx prisma db push     -> Sync schema to database
# npx prisma studio      -> Open DB GUI
# npm run build          -> Build for production
# npm run dev            -> Start dev server (Turbopack)
# npm start              -> Start production server
# npm run lint           -> Run ESLint

# ============================================
# ENV VARIABLES
# ============================================
# DATABASE_URL  -> PostgreSQL connection string (Neon/Supabase/local)
# JWT_SECRET    -> Long random string used to sign JWTs
# NODE_ENV      -> development | production

# ============================================
# DEPLOY (Vercel)
# ============================================
# 1. Push repo to GitHub
# 2. Import on https://vercel.com
# 3. Add env vars: DATABASE_URL, JWT_SECRET, NODE_ENV=production
# 4. Deploy (Vercel runs `npm run build`)

# ============================================
# TROUBLESHOOTING
# ============================================
# PrismaClientInitializationError -> Check DATABASE_URL (?sslmode=require for Neon)
# Invalid JWT / login fails       -> JWT_SECRET must stay same across restarts
# Vercel build fails              -> Add env vars in Vercel dashboard
# Prisma types out of date        -> Re-run `npx prisma generate`
# Module not found after clone    -> Run `npm install`
# DB schema missing               -> Run `npx prisma db push`