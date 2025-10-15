import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

def train_model(model, train_dataset, processor, optimizer, device, epochs=5):
    """
    Basic training loop for fine-tuning DETR.
    """
    model.to(device)
    model.train()
    
    train_loader = DataLoader(train_dataset, batch_size=2, shuffle=True)
    
    for epoch in range(epochs):
        print(f"\n[INFO] Epoch {epoch+1}/{epochs}")
        total_loss = 0
        
        for batch in tqdm(train_loader):
            pixel_values = torch.stack([processor(images=x["image"], return_tensors="pt")["pixel_values"][0] for x in batch])
            pixel_values = pixel_values.to(device)
            
            labels = [{k: v.to(device) for k, v in t["annotations"].items()} for t in batch]
            
            outputs = model(pixel_values=pixel_values, labels=labels)
            loss = outputs.loss
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        print(f"Epoch Loss: {total_loss / len(train_loader):.4f}")
    
    return model
