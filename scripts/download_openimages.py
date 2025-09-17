import argparse
import os
from typing import List

import fiftyone as fo
import fiftyone.zoo as foz


TRASH_LABEL_CANDIDATES: List[str] = [
    "Bottle",
    "Cup",
    "Can",
    "Plastic bag",
    "Paper",
    "Banana",
    "Box",
    # Possible bin/container classes (coverage via synonyms)
    "Waste container",
    "Trash can",
    "Recycling bin",
    "Wheelie bin",
]

PERSON_LABELS: List[str] = ["Person"]


def main():
    parser = argparse.ArgumentParser(description="Download Open Images subset for trash/person/bin classes")
    parser.add_argument("--split", default="train", choices=["train", "validation", "test"], help="Open Images split")
    parser.add_argument("--max_samples", type=int, default=3000, help="Max samples to fetch")
    parser.add_argument("--dataset_name", default="trashdetect-openimages", help="FiftyOne dataset name")
    parser.add_argument("--classes", nargs="*", default=None, help="Override classes to download")
    parser.add_argument("--include_person", action="store_true", help="Also include Person class")
    args = parser.parse_args()

    classes: List[str] = args.classes if args.classes else TRASH_LABEL_CANDIDATES.copy()
    if args.include_person:
        classes = list(dict.fromkeys(PERSON_LABELS + classes))

    print("Requesting Open Images with classes:", classes)

    dataset = foz.load_zoo_dataset(
        "open-images-v7",
        split=args.split,
        dataset_name=args.dataset_name + f"-{args.split}",
        label_types=["detections"],
        classes=classes,
        max_samples=args.max_samples,
        only_matching=True,
    )

    export_dir = os.path.join("datasets", "openimages", args.dataset_name, args.split)
    os.makedirs(export_dir, exist_ok=True)

    # Export COCO-style for transparency and conversion flexibility
    dataset.export(
        export_dir=export_dir,
        dataset_type=fo.types.COCODetectionDataset,
        label_field="detections",
    )

    print(f"Exported to {export_dir}")


if __name__ == "__main__":
    main()
