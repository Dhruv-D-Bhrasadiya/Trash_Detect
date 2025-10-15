from datasets import load_dataset

def download_and_prepare_dataset(dataset_name="mrdbourke/trashify_manual_labelled_images"):
    """
    Downloads and prepares the dataset for object detection.
    Returns train/test splits and label mappings.
    """
    dataset = load_dataset(dataset_name)
    categories = dataset["train"].features["annotations"]["category_id"]
    
    id2label = {i: class_name for i, class_name in enumerate(categories.feature.names)}
    label2id = {value: key for key, value in id2label.items()}

    print(f"[INFO] Dataset '{dataset_name}' loaded successfully!")
    print(f"[INFO] Number of training samples: {len(dataset['train'])}")
    
    return dataset, id2label, label2id
