# Inisialisasi Git
git init
git branch -M main

# Konfigurasi sementara jika user belum punya git config
if (-not (git config user.name)) { git config user.name "Rangga Mukti" }
if (-not (git config user.email)) { git config user.email "rangga@example.com" }

# 1. Base Laravel Setup
git add app/Console/ app/Exceptions/ app/Providers/ bootstrap/ config/ public/ resources/css/ resources/views/ storage/ tests/ artisan composer.json composer.lock package.json package-lock.json postcss.config.js tailwind.config.js vite.config.js .editorconfig .gitattributes .gitignore
git commit -m "init: Laravel & React boilerplate setup"

# 2. Database & Models
git add database/ app/Models/
git commit -m "feat(db): Initial database schema and models"

# 3. Controllers & Routes
git add app/Http/ routes/
git commit -m "feat(api): Base controllers and application routes"

# 4. Base UI & Layouts
git add resources/js/app.jsx resources/js/bootstrap.js resources/js/Layouts/ resources/js/Components/
git commit -m "feat(ui): Base Layouts, Components, and Tailwind setup"

# 5. Core Features (Reports, Maps, AI)
git add resources/js/Pages/Reports/ resources/js/Pages/Welcome.jsx resources/js/Pages/Dashboard.jsx
git commit -m "feat(reports): Implement report creation, maps, and feed"

# 6. Admin Dashboard & Analytics
git add resources/js/Pages/Admin/
git commit -m "feat(admin): Create Admin Dashboard and Analytics views"

# 7. AI & Services
git add app/Services/
git commit -m "feat(ai): Integrate Gemini Vision AI for damage detection"

# 8. Events & Realtime
git add app/Events/
git commit -m "feat(realtime): Integrate Laravel Reverb & WebSockets"

# 9. Everything else
git add .
git commit -m "chore: Final configurations, styles, and build artifacts"
