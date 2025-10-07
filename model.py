import matplotlib.pyplot as plt
from PIL import Image
from transformers import pipeline
import json  # for pretty-printing the output

# Initialize the object detection pipeline with the model
pipe = pipeline("object-detection", model="mrdbourke/rt_detrv2_finetuned_trashify_box_detector_v1")

# Path to the image
image_path = "/content/trash_images/image2.jpg"
results = pipe(image_path)

# Open image for plotting
image = Image.open(image_path)
fig, ax = plt.subplots(figsize=(10, 10))
ax.imshow(image)

# List to store the detected items
detected_items = []

for result in results:
    label = result['label']
    score = float(result['score'])  # ensure float
    box = result['box']

    x_min = float(box['xmin'])
    y_min = float(box['ymin'])
    x_max = float(box['xmax'])
    y_max = float(box['ymax'])

    rect = plt.Rectangle(
        (x_min, y_min),
        x_max - x_min,
        y_max - y_min,
        linewidth=2,
        edgecolor='red',
        facecolor='none'
    )
    ax.add_patch(rect)

    ax.text(
        x_min,
        y_min - 10,
        f"{label}: {score:.2f}",
        color='red',
        fontsize=12,
        bbox=dict(facecolor='white', alpha=0.7, edgecolor='red', boxstyle='round,pad=0.3')
    )

    detected_items.append({
        "label": label,
        "confidence": round(score, 4),
        "box": {
            "xmin": round(x_min, 2),
            "ymin": round(y_min, 2),
            "xmax": round(x_max, 2),
            "ymax": round(y_max, 2)
        }
    })

plt.axis('off')
plt.show()

# Get unique labels
found_labels = sorted(list(set(item["label"] for item in detected_items)))

# Check if "trash bin" detected
if "bin" and "trash" in found_labels:
    score_msg = "+1! Found the following items: "
    score_value = 1
elif "trash" and not "bin" in found_labels:
    score_msg = "Trash detected but no trash bin detected, -1 point! Found the following items: "
    score_value = -1
elif "bin" and not "trash" in found_labels:
    score_msg = "Trash bin detected but no trash detected, 0 points! Found the following items: "
    score_value = 0
else:
    score_msg = "No trash or trash bin detected, 0 points! Found the following items: "
    score_value = 0

output = {
    "detections": detected_items,
    "summary": f"{score_msg} {found_labels}" if score_value == 1 else score_msg
}

print(json.dumps(output, indent=2))
