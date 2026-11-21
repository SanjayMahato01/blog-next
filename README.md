# Blog App — Complete Setup (DVertex)

## 1. Clone the Repository

```bash
git clone https://github.com/SanjayMahato01/blog-next.git
cd blog-next
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create the `.env` File

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="replace_with_a_long_random_string"
NODE_ENV="development"
```

**Windows PowerShell:**

```powershell
@"
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="replace_with_a_long_random_string"
NODE_ENV="development"
"@ | Out-File -Encoding utf8 .env
```

## 4. Generate a Strong JWT Secret

Run the following command and copy the generated value into your `.env` file.

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 5. Prisma Setup

Generate the Prisma client and synchronize your database schema.

```bash
npx prisma generate
npx prisma db push
```

## 6. Open Prisma Studio (Optional)

```bash
npx prisma studio
```

## 7. Run the Application

```bash
npm run dev
```

Open your browser and visit:

http://localhost:3000

---

## Production Build

```bash
npm run build
npm start
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Synchronize database schema |
| `npx prisma studio` | Open database GUI |
| `npm run build` | Build for production |
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon / Supabase / Local) |
| `JWT_SECRET` | Secret key used to sign JWTs |
| `NODE_ENV` | Application environment (`development` or `production`) |

---

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Visit [Vercel](https://vercel.com).
3. Import your GitHub repository.
4. Add the following environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Deploy your application.

---

## Troubleshooting

| Error | Solution |
|---|---|
| `PrismaClientInitializationError` | Check your `DATABASE_URL`. For Neon, use `?sslmode=require`. |
| Invalid JWT / Login fails | Ensure `JWT_SECRET` remains consistent across deployments. |
| Vercel build fails | Verify that all environment variables are configured in Vercel. |
| Prisma types are outdated | Run `npx prisma generate`. |
| Module not found | Run `npm install`. |
| Database schema missing | Run `npx prisma db push`. |

---

**Developed as part of the DVertex Blog App Assignment.**