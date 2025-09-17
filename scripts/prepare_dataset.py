import argparse
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple

from tqdm import tqdm


# Default target classes in desired order for YOLO
TARGET_CLASSES: List[str] = [
    "person",
    "bottle",
    "cup",
    "can",
    "plastic bag",
    "paper",
    "banana",
    "waste container",
    "trash can",
    "recycling bin",
]


def load_coco_categories(annotations_path: str) -> Dict[int, str]:
    with open(annotations_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    categories = {c["id"]: c["name"].lower() for c in data["categories"]}
    return categories


def compute_yolo_bbox(img_w: int, img_h: int, bbox_xywh: Tuple[float, float, float, float]):
    x, y, w, h = bbox_xywh
    x_c = (x + w / 2.0) / img_w
    y_c = (y + h / 2.0) / img_h
    w_n = w / img_w
    h_n = h / img_h
    return x_c, y_c, w_n, h_n


def ensure_dirs(root: Path):
    (root / "images" / "train").mkdir(parents=True, exist_ok=True)
    (root / "images" / "val").mkdir(parents=True, exist_ok=True)
    (root / "labels" / "train").mkdir(parents=True, exist_ok=True)
    (root / "labels" / "val").mkdir(parents=True, exist_ok=True)


def map_label(name: str) -> str:
    name = name.lower()
    # normalize synonyms
    synonym_map = {
        "waste container": "waste container",
        "trash can": "trash can",
        "recycling bin": "recycling bin",
        "wheelie bin": "trash can",
        "plastic bag": "plastic bag",
    }
    return synonym_map.get(name, name)


def prepare_split(coco_dir: Path, split: str, out_root: Path, class_list: List[str]):
    ann_path = coco_dir / "labels.json"
    if not ann_path.exists():
        raise FileNotFoundError(f"Expected COCO labels.json at {ann_path}")

    with open(ann_path, "r", encoding="utf-8") as f:
        coco = json.load(f)

    categories = {c["id"]: map_label(c["name"]) for c in coco["categories"]}
    class_to_id: Dict[str, int] = {name: i for i, name in enumerate(class_list)}

    images = {im["id"]: im for im in coco["images"]}
    anns_by_image: Dict[int, List[dict]] = {}
    for ann in coco["annotations"]:
        anns_by_image.setdefault(ann["image_id"], []).append(ann)

    out_img_dir = out_root / "images" / ("train" if split == "train" else "val")
    out_lbl_dir = out_root / "labels" / ("train" if split == "train" else "val")

    num_kept = 0
    for image_id, image in tqdm(images.items(), desc=f"{split} images"):
        file_name = image["file_name"]
        img_w = image["width"]
        img_h = image["height"]

        in_img_path = coco_dir / "data" / file_name
        if not in_img_path.exists():
            # Alternate structure used by FiftyOne exporter
            in_img_path = coco_dir / file_name
        if not in_img_path.exists():
            continue

        out_img_path = out_img_dir / file_name
        out_img_path.parent.mkdir(parents=True, exist_ok=True)
        # Copy image
        with open(in_img_path, "rb") as src, open(out_img_path, "wb") as dst:
            dst.write(src.read())

        yolo_lines: List[str] = []
        for ann in anns_by_image.get(image_id, []):
            cat_name = categories.get(ann["category_id"], "").lower()
            cat_name = map_label(cat_name)
            if cat_name not in class_to_id:
                continue
            x, y, w, h = ann["bbox"]
            x_c, y_c, w_n, h_n = compute_yolo_bbox(img_w, img_h, (x, y, w, h))
            class_id = class_to_id[cat_name]
            yolo_lines.append(f"{class_id} {x_c:.6f} {y_c:.6f} {w_n:.6f} {h_n:.6f}")

        if yolo_lines:
            num_kept += 1
            out_lbl_path = out_lbl_dir / (Path(file_name).stem + ".txt")
            with open(out_lbl_path, "w", encoding="utf-8") as f:
                f.write("\n".join(yolo_lines))

    print(f"Kept {num_kept} labeled images for split {split}")


def write_data_yaml(out_root: Path, class_list: List[str]):
    yaml_path = out_root / "data.yaml"
    content = (
        f"path: {out_root.as_posix()}\n"
        f"train: images/train\n"
        f"val: images/val\n"
        f"names:\n" + "\n".join([f"  - {n}" for n in class_list]) + "\n"
    )
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {yaml_path}")


def main():
    parser = argparse.ArgumentParser(description="Prepare YOLO dataset from exported COCO splits")
    parser.add_argument("--in_root", default="datasets/openimages/trashdetect-openimages", help="Input root that contains train/ and validation/")
    parser.add_argument("--out_root", default="datasets/yolo_trashdetect", help="Output root for YOLO dataset")
    parser.add_argument("--classes", nargs="*", default=None, help="Override class list order/names")
    args = parser.parse_args()

    class_list = [c for c in TARGET_CLASSES]
    if args.classes:
        class_list = [c.lower() for c in args.classes]

    out_root = Path(args.out_root)
    ensure_dirs(out_root)

    for split in ["train", "validation"]:
        split_dir = Path(args.in_root) / split
        if not split_dir.exists():
            print(f"WARNING: split directory missing: {split_dir}")
            continue
        try:
            prepare_split(split_dir, "train" if split == "train" else "validation", out_root, class_list)
        except FileNotFoundError as e:
            print(f"Skipping {split}: {e}")

    write_data_yaml(out_root, class_list)


if __name__ == "__main__":
    main()
