# Trash Detect

This repository contains a trash detection project with web and model training components.

## Structure

- **bin-detect-reward-main/**  
  Main web application for trash detection and reward system.
  - `src/` — React frontend source code
  - `public/` — Static assets
  - `supabase/` — Supabase integration files
  - Configuration files: `.env`, `package.json`, `vite.config.ts`, etc.

- **model_train/Trash_Detect/**  
  Model training scripts and resources.

- **supabase/**  
  Database migrations and temporary files.

## Getting Started

1. **Install dependencies**  
   Navigate to `bin-detect-reward-main/` and run:
   ```sh
   npm install
   ```

2. **Run the web app**  
   ```sh
   npm run dev
   ```

3. **Model Training**  
   See [model_train/Trash_Detect/](model_train/Trash_Detect/) for training scripts.

## License

See individual folders for license details.