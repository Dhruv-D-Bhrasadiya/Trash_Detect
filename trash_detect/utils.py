# Hyperparameters and constants
DEVICE = "cuda"
MODEL_NAME = "facebook/detr-resnet-50"
BATCH_SIZE = 4
EPOCHS = 5
LEARNING_RATE = 5e-5
OUTPUT_DIR = "./trained_model"

# Other utilities
from PIL import Image, ImageDraw
import torch

def visualize_predictions(image: Image.Image, results, id2label):
    draw = ImageDraw.Draw(image)
    for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
        box = [round(i, 2) for i in box.tolist()]
        draw.rectangle(box, outline="red", width=3)
        draw.text((box[0], box[1]), f"{id2label[label.item()]}: {round(score.item(), 2)}", fill="white")
    return image
