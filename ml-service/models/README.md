# models/

Place your trained model files in this directory:
 
- `classifier.pt` / `classifier.h5` / `classifier.pkl`  — satellite vs non-satellite classifier
- `unet.pt` / `unet.h5` / `unet.pkl`  — UNet building segmentation model

Then update `main.py`:
1. `load_models()` — load your model files
2. `run_classifier()` — replace mock with real inference
3. `run_unet()` — replace mock with real inference

The service runs with mock predictions if no models are found (useful for frontend development).
