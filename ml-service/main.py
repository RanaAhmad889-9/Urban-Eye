"""
UrbanEye ML Microservice
- POST /analyze  → classify + UNet + highlighted overlay
- GET  /health   → status

Port: 7860 on HF Spaces (Dockerfile), 8000 locally.
"""

import os, io, base64, logging
import numpy as np
from PIL import Image, ImageFilter
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tensorflow as tf

from huggingface_hub import hf_hub_download

HF_REPO_ID = "ahmad8989rana/urban-eye-models"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="UrbanEye ML", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

classifier_model = None
unet_model = None
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def load_models():
    global classifier_model, unet_model

    try:
        classifier_path = os.path.join(MODELS_DIR, "classifier.h5")
        unet_path = os.path.join(MODELS_DIR, "unet.keras")

        classifier_model = tf.keras.models.load_model(classifier_path)
        unet_model = tf.keras.models.load_model(unet_path)

        logger.info(f"✅ Classifier input shape: {classifier_model.input_shape}")
        logger.info(f"✅ UNet input shape: {unet_model.input_shape}")
        logger.info("✅ Models loaded successfully")

    except Exception as e:
        logger.warning(f"⚠️ Could not load models: {e}")


def preprocess_classifier(image: Image.Image) -> np.ndarray:
    img = image.convert("RGB").resize((224, 224), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, 0)


def preprocess_unet(image: Image.Image) -> np.ndarray:
    img = image.convert("RGB").resize((256, 256), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, 0)




def run_classifier(arr: np.ndarray) -> bool:
    global classifier_model

    if classifier_model is None:
        logger.warning("Classifier model not loaded")
        return False

    try:
        prob = classifier_model.predict(arr, verbose=0)[0][0]
        return float(prob) > 0.5

    except Exception as e:
        logger.error(f"Classifier inference failed: {e}")
        raise


def run_unet(arr: np.ndarray) -> np.ndarray:
    """
    Returns binary mask (H,W) uint8
    """

    global unet_model

    if unet_model is None:
        logger.warning("UNet model not loaded")
        raise Exception("UNet model missing")

    try:
        # Predict segmentation mask
        mask = unet_model.predict(arr, verbose=0)[0, :, :, 0]

        # Convert to binary mask
        binary_mask = (mask > 0.5).astype(np.uint8)

        return binary_mask

    except Exception as e:
        logger.error(f"UNet inference failed: {e}")
        raise


def count_buildings(mask: np.ndarray) -> int:
    try:
        from scipy.ndimage import label
        _, n = label(mask); return int(n)
    except ImportError:
        return max(1, int(mask.sum() // 120))


def build_overlay(original: Image.Image, mask: np.ndarray) -> str:
    ow, oh = original.size
    mh, mw = mask.shape
    base = original.convert("RGBA").resize((mw, mh), Image.LANCZOS)
    ov = np.zeros((mh, mw, 4), dtype=np.uint8)
    ov[mask == 1] = [34, 197, 94, 90]                     # green fill
    mp = Image.fromarray((mask * 255).astype(np.uint8), "L")
    edge = (np.array(mp.filter(ImageFilter.MaxFilter(3))) > 0) & \
           ~(np.array(mp.filter(ImageFilter.MinFilter(3))) > 0)
    ov[edge] = [239, 68, 68, 220]                          # red outline
    result = Image.alpha_composite(base, Image.fromarray(ov, "RGBA"))
    result = result.resize((ow, oh), Image.LANCZOS)
    buf = io.BytesIO()
    result.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


@app.on_event("startup")
async def startup(): load_models()


@app.get("/health")
def health():
    return {"status":"ok","classifier":classifier_model is not None,"unet":unet_model is not None,"mock":classifier_model is None}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg","image/jpg","image/png","image/webp","image/tiff"}:
        raise HTTPException(400, "Invalid file type")
    try:
        original = Image.open(io.BytesIO(await file.read()))
        classifier_arr = preprocess_classifier(original)
        logger.info(f"Classifier input shape: {classifier_arr.shape}")

        is_sat = run_classifier(classifier_arr)
        
        if not is_sat:
            return {
            "isSatellite": False,
            "buildingCount": 0,
            "highlightedImage": None
            }
        
        unet_arr = preprocess_unet(original)
        logger.info(f"UNet input shape: {unet_arr.shape}")
        mask = run_unet(unet_arr)
        count = count_buildings(mask)
        highlighted = build_overlay(original, mask)
        return {"isSatellite": True, "buildingCount": count, "highlightedImage": highlighted}
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
