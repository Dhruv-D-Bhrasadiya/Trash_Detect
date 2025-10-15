# Trash Detect

Trash Detect is a comprehensive project for detecting trash using machine learning and providing a web-based reward system. It consists of a React web application, model training scripts, and database integration.

## Project Structure

- **bin-detect-reward-main/**  
  Main web application for trash detection and reward system.
  - `src/` — React frontend source code, including UI components, pages, and logic for interacting with the backend and Supabase.
  - `public/` — Static assets such as images, icons, and the main HTML file.
  - `supabase/` — Supabase integration files for authentication, database, and storage.
  - Configuration files:  
    - `.env` — Environment variables for API keys and configuration.  
    - `package.json` — Project dependencies and scripts.  
    - `vite.config.ts` — Vite configuration for building and serving the app.

- **model_train/Trash_Detect/**  
  Model training scripts and resources for trash detection.
  - `data/` — Datasets for training and validation (images and annotations).
  - `models/` — Saved model checkpoints and exported models.
  - `notebooks/` — Jupyter notebooks for data analysis and model prototyping.
  - `scripts/` — Python scripts for preprocessing, training, evaluation, and inference.
  - `requirements.txt` — Python dependencies for model training.

- **supabase/**  
  Database migrations, configuration files, and temporary files for Supabase integration.

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/Dhruv-D-Bhrasadiya/Trash_Detect.git
cd Trash_Detect
```

### 2. Set Up the Web Application

Navigate to the web app folder and install dependencies:

```sh
cd bin-detect-reward-main
npm install
```

Start the development server:

```sh
npm run dev
```

### 3. Set Up Model Training

Navigate to the model training folder:

```sh
cd model_train/Trash_Detect
```

Create and activate a Python virtual environment (recommended):

```sh
python -m venv venv
venv\Scripts\activate
```

Install Python dependencies:

```sh
pip install -r requirements.txt
```

Prepare your dataset by placing images and annotation files in the `data/` directory.

### 4. Train the Model

Run the training script (adjust config and paths as needed):

```sh
python scripts/train.py --config configs/config.yaml
```

### 5. Evaluate and Use the Model

Evaluate the trained model:

```sh
python scripts/evaluate.py --model models/best_model.pth --data data/validation/
```

Run inference on new images:

```sh
python scripts/predict.py --model models/best_model.pth --input data/test/image1.jpg
```

## Supabase Integration

- Configure Supabase credentials in `.env` files.
- Use the `supabase/` folder for database migrations and setup.

## License

See individual folders for license details.

## Contributing

Feel free to open issues or submit pull requests for improvements or bug fixes.

## Contact

For questions or support, please open an issue in the repository.