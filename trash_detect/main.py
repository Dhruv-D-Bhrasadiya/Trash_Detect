import torch
from torch.optim import AdamW

from Trash_Detect.download_prepare_dataset import download_and_prepare_dataset
from utils import DEVICE, MODEL_NAME, EPOCHS, LEARNING_RATE
from model import get_model
from train import train_model
from save_model import save_trained_model

def main():
    dataset, id2label, label2id = download_and_prepare_dataset()
    model, processor = get_model(MODEL_NAME, id2label, label2id)
    
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    trained_model = train_model(model, dataset["train"], processor, optimizer, DEVICE, EPOCHS)
    
    save_trained_model(trained_model, processor)

if __name__ == "__main__":
    main()
