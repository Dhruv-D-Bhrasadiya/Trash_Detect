from dataclasses import dataclass
from typing import List, Tuple, Optional, Dict

import cv2
import numpy as np
from ultralytics import YOLO


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox_xyxy: Tuple[int, int, int, int]


class TrashDetectModel:
    def __init__(self, weights_path: str, class_names: Optional[List[str]] = None, device: str = ""):
        self.model = YOLO(weights_path)
        self.class_names = class_names or self.model.names
        self.device = device

    def predict(self, image_bgr: np.ndarray, imgsz: int = 640, conf: float = 0.25) -> List[Detection]:
        results = self.model.predict(source=image_bgr, imgsz=imgsz, conf=conf, device=self.device, verbose=False)
        detections: List[Detection] = []
        if not results:
            return detections
        res = results[0]
        for b in res.boxes:
            cls_id = int(b.cls)
            conf = float(b.conf)
            xyxy = b.xyxy.cpu().numpy().astype(int).ravel().tolist()
            detections.append(Detection(self.class_names[cls_id], conf, tuple(xyxy)))
        return detections


TRASH_CLASS_SET = {"bottle", "cup", "can", "plastic bag", "paper", "banana", "box"}
BIN_CLASS_SET = {"waste container", "trash can", "recycling bin"}
PERSON_CLASS = "person"


def _center_point(bxyxy: Tuple[int, int, int, int]) -> Tuple[float, float]:
    x1, y1, x2, y2 = bxyxy
    return (x1 + x2) / 2.0, (y1 + y2) / 2.0


def _iou(a: Tuple[int, int, int, int], b: Tuple[int, int, int, int]) -> float:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)
    iw = max(0, inter_x2 - inter_x1)
    ih = max(0, inter_y2 - inter_y1)
    inter = iw * ih
    if inter == 0:
        return 0.0
    a_area = (ax2 - ax1) * (ay2 - ay1)
    b_area = (bx2 - bx1) * (by2 - by1)
    return inter / float(a_area + b_area - inter + 1e-6)


def assess_disposal(detections: List[Detection], image_shape: Tuple[int, int, int]) -> Dict:
    h, w = image_shape[:2]
    persons = [d for d in detections if d.class_name.lower() == PERSON_CLASS]
    trashes = [d for d in detections if d.class_name.lower() in TRASH_CLASS_SET]
    bins = [d for d in detections if d.class_name.lower() in BIN_CLASS_SET]

    assessment = {
        "persons": persons,
        "trashes": trashes,
        "bins": bins,
        "events": [],  # list of dicts per trash: {trash, bin, proper: bool, score: float}
        "rating": 0.0,
    }

    if not trashes:
        return assessment

    # For each trash, find nearest bin and person, compute a score
    for trash in trashes:
        tx, ty = _center_point(trash.bbox_xyxy)
        nearest_bin: Optional[Detection] = None
        nearest_bin_dist = 1e9
        for b in bins:
            bx, by = _center_point(b.bbox_xyxy)
            d = (tx - bx) ** 2 + (ty - by) ** 2
            if d < nearest_bin_dist:
                nearest_bin = b
                nearest_bin_dist = d

        nearest_person: Optional[Detection] = None
        nearest_person_dist = 1e9
        for p in persons:
            px, py = _center_point(p.bbox_xyxy)
            d = (tx - px) ** 2 + (ty - py) ** 2
            if d < nearest_person_dist:
                nearest_person = p
                nearest_person_dist = d

        iou_bin = _iou(trash.bbox_xyxy, nearest_bin.bbox_xyxy) if nearest_bin else 0.0
        # Heuristic features
        # - If trash center is inside bin box → strong evidence of proper disposal
        proper_center = False
        if nearest_bin:
            bx1, by1, bx2, by2 = nearest_bin.bbox_xyxy
            proper_center = (tx >= bx1) and (tx <= bx2) and (ty >= by1) and (ty <= by2)

        # - Distance to bin normalized by image diagonal
        diag = (w ** 2 + h ** 2) ** 0.5
        dist_to_bin = (nearest_bin_dist ** 0.5) / (diag + 1e-6) if nearest_bin else 1.0
        dist_to_person = (nearest_person_dist ** 0.5) / (diag + 1e-6) if nearest_person else 1.0

        # Score composition
        score = 0.0
        score += 0.6 * (1.0 if proper_center else 0.0)
        score += 0.3 * min(1.0, iou_bin * 2.0)
        score += 0.1 * (1.0 - min(1.0, dist_to_bin * 3.0))
        # Encourage presence of a nearby person to relate context
        score *= (1.0 if nearest_person and dist_to_person < 0.2 else 0.8)
        score = float(np.clip(score, 0.0, 1.0))

        assessment["events"].append({
            "trash": trash,
            "bin": nearest_bin,
            "person": nearest_person,
            "proper": score >= 0.5,
            "score": score,
        })

    # Aggregate rating (0-5 stars)
    if assessment["events"]:
        mean_score = float(np.mean([e["score"] for e in assessment["events"]]))
        assessment["rating"] = round(5.0 * mean_score, 2)

    return assessment


def draw_annotations(image_bgr: np.ndarray, detections: List[Detection], assessment: Optional[Dict] = None) -> np.ndarray:
    img = image_bgr.copy()
    # Draw detections
    for det in detections:
        x1, y1, x2, y2 = det.bbox_xyxy
        color = (0, 200, 0)
        name_l = det.class_name.lower()
        if name_l in TRASH_CLASS_SET:
            color = (0, 165, 255)  # orange
        elif name_l in BIN_CLASS_SET:
            color = (255, 0, 0)  # blue-ish
        elif name_l == PERSON_CLASS:
            color = (0, 255, 0)
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        label = f"{det.class_name} {det.confidence:.2f}"
        cv2.putText(img, label, (x1, max(0, y1 - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)

    if assessment and assessment.get("events"):
        y = 30
        for e in assessment["events"]:
            text = f"{e['trash'].class_name} -> proper={e['proper']} score={e['score']:.2f}"
            cv2.putText(img, text, (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
            y += 22
        cv2.putText(img, f"Rating: {assessment['rating']}/5", (10, y + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)

    return img
