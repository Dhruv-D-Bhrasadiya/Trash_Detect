# Trash Detection Model Training

This folder contains scripts and resources for training a machine learning model to detect trash in images.

## Folder Structure

- **data/**  
  Directory for training and validation datasets.  
  - `images/` — Raw image files  
  - `labels/` — Annotation files (e.g., in YOLO or COCO format)

- **models/**  
  Saved model checkpoints and exported models.

- **notebooks/**  
  Jupyter notebooks for exploratory data analysis, model prototyping, and visualization.

- **scripts/**  
  Python scripts for data preprocessing, training, evaluation, and inference.  
  - `train.py` — Main training script  
  - `evaluate.py` — Model evaluation  
  - `predict.py` — Run inference on new images  
  - `preprocess.py` — Data cleaning and augmentation

- **requirements.txt**  
  Python dependencies for the project.

## Setup

1. **Clone the repository**  
   ```sh
   git clone https://github.com/Dhruv-D-Bhrasadiya/Trash_Detect.git
   cd Trash_Detect/model_train/Trash_Detect
   ```

2. **Install dependencies**  
   It is recommended to use a virtual environment:
   ```sh
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Prepare the data**  
   Place your images and annotation files in the `data/` directory. Update paths in scripts as needed.

## Training

Run the main training script:
```sh
python scripts/train.py --config configs/config.yaml
```
- Adjust hyperparameters and paths in `configs/config.yaml` as needed.

## Evaluation

Evaluate the trained model:
```sh
python scripts/evaluate.py --model models/best_model.pth --data data/validation/
```

## Inference

Run inference on new images:
```sh
python scripts/predict.py --model models/best_model.pth --input data/test/image1.jpg
```

## Notebooks

Explore the `notebooks/` folder for step-by-step guides on data analysis and model development.

## Customization

- Modify `preprocess.py` for custom data augmentation.
- Update `train.py` for different architectures or training strategies.

## License

See the main repository for license information.

## Contact

For questions or contributions, please open an issue or pull request.