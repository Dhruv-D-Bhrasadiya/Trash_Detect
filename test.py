import argparse
from pathlib import Path
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description="Validate/Test YOLOv8 TrashDetect model")
    parser.add_argument("--weights", default="weights/trashdetect-best.pt", help="Path to trained weights")
    parser.add_argument("--data", default="datasets/yolo_trashdetect/data.yaml", help="Path to data.yaml")
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--split", default="val", choices=["val", "test"], help="Dataset split to evaluate")
    parser.add_argument("--project", default="runs/val", help="Ultralytics project dir")
    parser.add_argument("--name", default="trashdetect-eval")
    parser.add_argument("--device", default="")
    args = parser.parse_args()

    model = YOLO(args.weights)
    metrics = model.val(
        data=args.data,
        imgsz=args.imgsz,
        split=args.split,
        project=args.project,
        name=args.name,
        device=args.device,
        save_json=True,
        save_hybrid=True,
        plots=True,
    )

    print("mAP50-95:", float(metrics.box.map))
    print("mAP50:", float(metrics.box.map50))
    print("mAP75:", float(metrics.box.map75))


if __name__ == "__main__":
    main()
