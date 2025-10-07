from PIL import Image
from transformers import pipeline
import os

# Initialize the object detection pipeline
pipe = pipeline("object-detection", model="mrdbourke/rt_detrv2_finetuned_trashify_box_detector_v1")

def detect_trash(image_path: str):
    """
    Performs trash detection on an image.
    
    Args:
        image_path: The path to the image file.
        
    Returns:
        A dictionary containing the detection results.
    """
    if not os.path.exists(image_path):
        return {"error": "Image not found."}

    results = pipe(image_path)
    
    detected_items = []
    for result in results:
        label = result['label']
        score = float(result['score'])
        box = result['box']
        
        detected_items.append({
            "label": label,
            "confidence": round(score, 4),
            "box": {
                "xmin": round(float(box['xmin']), 2),
                "ymin": round(float(box['ymin']), 2),
                "xmax": round(float(box['xmax']), 2),
                "ymax": round(float(box['ymax']), 2)
            }
        })

    found_labels = sorted(list(set(item["label"] for item in detected_items)))

    score_value = 0
    if "bin" in found_labels and "trash" in found_labels:
        score_msg = "Trash and bin detected. +1 point!"
        score_value = 1
    elif "trash" in found_labels and "bin" not in found_labels:
        score_msg = "Trash detected but no bin. -1 point."
        score_value = -1
    elif "bin" in found_labels and "trash" not in found_labels:
        score_msg = "Bin detected but no trash. 0 points."
        score_value = 0
    else:
        score_msg = "No trash or bin detected. 0 points."
        score_value = 0

    output = {
        "detections": detected_items,
        "summary": score_msg,
        "score": score_value,
        "labels": found_labels
    }
    
    return output
