# TrashDetect: Streamlit UI + YOLOv8 model for proper trash disposal

TrashDetect detects a `person`, the `trash` they are holding (e.g., bottle, cup, can, plastic bag, paper, banana, box), and `bins` (waste container / trash can / recycling bin). It estimates whether trash is disposed properly and outputs a 0–5 rating.

## Features
- Open Images V7 subset downloader (configurable classes) using FiftyOne
- Dataset preparation to YOLO format with class normalization
- YOLOv8 training and validation scripts
- Inference utilities with a simple disposal heuristic and visualization
- Streamlit app for images and videos with rating display

## Project Structure
```
.
├── app.py                       # Streamlit UI
├── train.py                     # YOLOv8 training
├── test.py                      # Validation/testing
├── trashdetect/
│   ├── __init__.py
│   └── infer.py                 # Inference + assessment + drawing
├── scripts/
│   ├── download_openimages.py   # Download Open Images subset
│   └── prepare_dataset.py       # Convert/export to YOLO format
├── datasets/                    # (generated) raw/exported datasets
├── weights/                     # (generated) trained weights
├── runs/                        # (generated) YOLO runs
├── requirements.txt
└── .gitignore
```

## 1) Dataset choice and download
We use Open Images V7 via FiftyOne. Recommended classes:
- People: `Person`
- Trash: `Bottle`, `Cup`, `Can`, `Plastic bag`, `Paper`, `Banana`, `Box`
- Bins: `Waste container`, `Trash can`, `Recycling bin` (plus synonyms handled)

Download examples (no need to execute now):
```bash
# Install deps (once)
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Download train split with person + trash + bins
python scripts/download_openimages.py --split train --max_samples 4000 --dataset_name trashdetect-openimages --include_person

# Download validation split
python scripts/download_openimages.py --split validation --max_samples 800 --dataset_name trashdetect-openimages --include_person
```
Exports are written under `datasets/openimages/<name>/<split>/` in COCO format.

## 2) Prepare the dataset (YOLO format)
Convert exported COCO to YOLOv8 format and normalize class names:
```bash
python scripts/prepare_dataset.py --in_root datasets/openimages/trashdetect-openimages --out_root datasets/yolo_trashdetect
```
This produces:
- `datasets/yolo_trashdetect/images/{train,val}`
- `datasets/yolo_trashdetect/labels/{train,val}`
- `datasets/yolo_trashdetect/data.yaml`

You can override class order/names with `--classes` if needed.

## 3) Model and outputs
We fine-tune YOLOv8. The model detects:
- person
- trash types: bottle, cup, can, plastic bag, paper, banana, box
- bins: waste container, trash can, recycling bin

The inference heuristic marks a trash item as properly disposed if its center lies within a bin box and proximity is sensible; it aggregates a 0–5 rating across detected events.

## 4) Training
```bash
python train.py --data datasets/yolo_trashdetect/data.yaml --model yolov8n.pt --epochs 50 --imgsz 640 --batch 16
```
After training, best weights are copied to `weights/trashdetect-best.pt`.

## 5) Testing / Validation
```bash
python test.py --weights weights/trashdetect-best.pt --data datasets/yolo_trashdetect/data.yaml
```
This prints mAP metrics and saves plots in `runs/val/...`.

## 6) Streamlit app
```bash
streamlit run app.py
```
- Load weights (defaults to `weights/trashdetect-best.pt`).
- Upload an image or a video. The app draws detections, shows per-trash proper/score lines, and an overall rating.

## Notes and limitations
- Open Images class names may vary; scripts normalize common synonyms (e.g., `Wheelie bin` → `trash can`). If a chosen class is scarce, reduce or adjust the class list.
- The “proper disposal” logic is heuristic and may mislabel without temporal cues. Improve by adding pose estimation and temporal tracking.
- For production, consider training a small action head or using multi-frame models.

## Repro tips
- If you add more trash classes, include them in both the download script and `TARGET_CLASSES` in `scripts/prepare_dataset.py`.
- Start with `yolov8n.pt` for speed; switch to `yolov8s.pt` or larger for accuracy.
- Balance samples per class to avoid bias.

## License
This template uses Open Images; comply with its terms. Code under MIT.
