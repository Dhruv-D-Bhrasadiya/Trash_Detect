import argparse
from pathlib import Path
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 for TrashDetect")
    parser.add_argument("--data", default="datasets/yolo_trashdetect/data.yaml", help="Path to data.yaml")
    parser.add_argument("--model", default="yolov8n.pt", help="Base model to fine-tune")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--project", default="runs/train", help="Ultralytics project dir")
    parser.add_argument("--name", default="trashdetect-yolov8")
    parser.add_argument("--device", default="")
    args = parser.parse_args()

    save_dir = Path("weights")
    save_dir.mkdir(parents=True, exist_ok=True)

    model = YOLO(args.model)
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
        device=args.device,
        exist_ok=True,
        verbose=True,
    )

    # Save final weights copy
    last = Path(results.save_dir) / "weights" / "best.pt"
    if last.exists():
        target = save_dir / "trashdetect-best.pt"
        target.write_bytes(last.read_bytes())
        print(f"Saved weights to {target}")


if __name__ == "__main__":
    main()
