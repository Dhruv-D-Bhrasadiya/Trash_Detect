from transformers import DetrForObjectDetection, DetrImageProcessor

def get_model(model_name, id2label, label2id):
    """
    Initializes the DETR model and processor.
    """
    processor = DetrImageProcessor.from_pretrained(model_name)
    model = DetrForObjectDetection.from_pretrained(
        model_name, id2label=id2label, label2id=label2id
    )
    return model, processor