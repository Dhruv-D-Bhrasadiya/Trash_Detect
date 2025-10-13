import os

def save_trained_model(model, processor, output_dir="./trained_model"):
    """
    Saves model and processor locally.
    """
    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir)
    processor.save_pretrained(output_dir)
    print(f"[INFO] Model saved to {output_dir}")