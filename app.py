import gradio as gr
from PIL import Image
import torch
from transformers import DetrForObjectDetection, DetrImageProcessor
from utils import visualize_predictions

MODEL_DIR = "./trained_model"

model = DetrForObjectDetection.from_pretrained(MODEL_DIR)
processor = DetrImageProcessor.from_pretrained(MODEL_DIR)
id2label = model.config.id2label

def detect_objects(image):
    inputs = processor(images=image, return_tensors="pt")
    outputs = model(**inputs)
    target_sizes = torch.tensor([image.size[::-1]])
    results = processor.post_process_object_detection(outputs, target_sizes=target_sizes, threshold=0.9)[0]
    return visualize_predictions(image, results, id2label)

demo = gr.Interface(fn=detect_objects, inputs=gr.Image(type="pil"), outputs="image", title="Object Detection Demo")
demo.launch()
