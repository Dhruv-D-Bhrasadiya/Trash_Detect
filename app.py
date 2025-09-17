import io
from typing import Optional

import cv2
import numpy as np
import streamlit as st
from PIL import Image

from trashdetect.infer import TrashDetectModel, assess_disposal, draw_annotations


st.set_page_config(page_title="TrashDetect", layout="wide")

st.title("TrashDetect: Proper Trash Disposal Detection and Rating")

with st.sidebar:
    weights_path = st.text_input("Model weights path", value="weights/trashdetect-best.pt")
    imgsz = st.number_input("Image size", value=640, step=32, min_value=256, max_value=1280)
    conf = st.slider("Confidence threshold", 0.05, 0.95, 0.25, 0.05)

model: Optional[TrashDetectModel] = None
load_btn = st.sidebar.button("Load/Reload model")
if load_btn or 'model' not in st.session_state:
    try:
        st.session_state['model'] = TrashDetectModel(weights_path)
        st.sidebar.success("Model loaded")
    except Exception as e:
        st.sidebar.error(f"Failed to load model: {e}")

model = st.session_state.get('model')

mode = st.tabs(["Image", "Video (file)"])

with mode[0]:
    file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])
    if file and model:
        image = Image.open(file).convert("RGB")
        img_bgr = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        detections = model.predict(img_bgr, imgsz=int(imgsz), conf=float(conf))
        assessment = assess_disposal(detections, img_bgr.shape)
        vis = draw_annotations(img_bgr, detections, assessment)
        vis_rgb = cv2.cvtColor(vis, cv2.COLOR_BGR2RGB)
        st.image(vis_rgb, caption=f"Rating: {assessment['rating']}/5", use_column_width=True)

with mode[1]:
    vfile = st.file_uploader("Upload a video", type=["mp4", "mov", "avi", "mkv"])
    if vfile and model:
        # Read video into memory and decode with OpenCV
        data = vfile.read()
        tmp_path = "_tmp_upload.mp4"
        with open(tmp_path, "wb") as f:
            f.write(data)
        cap = cv2.VideoCapture(tmp_path)
        frames = []
        frame_count = 0
        rating_accum = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            if frame_count % 2 == 1:  # simple frame skipping
                continue
            detections = model.predict(frame, imgsz=int(imgsz), conf=float(conf))
            assessment = assess_disposal(detections, frame.shape)
            rating_accum.append(assessment['rating'])
            vis = draw_annotations(frame, detections, assessment)
            frames.append(cv2.cvtColor(vis, cv2.COLOR_BGR2RGB))
        cap.release()
        if frames:
            st.write(f"Average rating: {np.mean(rating_accum):.2f}/5 over {len(frames)} frames")
            st.image(frames, caption=None, use_column_width=True)
