import time
import requests
import json
import os
import cv2

try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False
    print("WARNING: ultralytics is not installed. running in DUMMY MODE.")
    print("To run with real AI, `pip install ultralytics opencv-python requests`")

# Use a fast Nano model
if HAS_YOLO:
    print("Loading YOLO model...")
    model = YOLO("yolov8n.pt") # downloads on first run
    print("Model loaded.")

BASE_URL = "http://localhost:5000"

def process_video(job_id, video_path):
    print(f"--- Processing Job: {job_id} ---")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error opening video {video_path}")
        return []

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30 # Default

    results_data = [] # Store coordinates per frame
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_data = {
            "frame": frame_idx,
            "timestamp": frame_idx / fps,
            "boxes": []
        }

        if HAS_YOLO:
            # Run inference
            results = model(frame, verbose=False)
            
            # Extract boxes
            for r in results:
                for box in r.boxes:
                    # check if class is car/truck (classes 2, 5, 7 in COCO)
                    # For demo, keeping all or filtering to vehicles
                    cls_id = int(box.cls[0])
                    
                    # 2: car, 3: motorcycle, 5: bus, 7: truck
                    val = box.xywh[0].tolist() # [x_center, y_center, w, h]
                    conf = float(box.conf[0])
                    # Store as x_min, y_min, w, h
                    x_center, y_center, w, h = val
                    x_min = x_center - (w/2)
                    y_min = y_center - (h/2)
                    
                    frame_data["boxes"].append({
                        "class": cls_id,
                        "confidence": conf,
                        "x": x_min,
                        "y": y_min,
                        "w": w,
                        "h": h
                    })
        else:
            # DUMMY MODE: Just fake some boxes that move across the screen
            if frame_idx % 2 == 0:
                # Add one fake car moving right
                frame_data["boxes"].append({
                    "class": 2, 
                    "confidence": 0.9, 
                    "x": (frame_idx * 5) % 600, 
                    "y": 200, 
                    "w": 50, 
                    "h": 30
                })

        results_data.append(frame_data)
        frame_idx += 1
        
        # Give some console feedback
        if frame_idx % 30 == 0:
            print(f"Processed {frame_idx} frames...")

    cap.release()
    print("Finished inference.")
    return results_data
    

def worker_loop():
    print(f"Worker polling {BASE_URL} for jobs...")
    while True:
        try:
            resp = requests.get(f"{BASE_URL}/jobs/next")
            if resp.status_code == 200:
                job = resp.json()
                if job.get("jobId"):
                    job_id = job["jobId"]
                    video_path = job["videoPath"]
                    
                    # 1. Process
                    start_t = time.time()
                    results = process_video(job_id, video_path)
                    
                    # 2. Upload Results
                    requests.post(f"{BASE_URL}/jobs/{job_id}/complete", json=results)
                    print(f"Job {job_id} uploaded complete! Took {round(time.time()-start_t, 2)}s")
                else:
                    # No job in queue
                    time.sleep(2)
        except Exception as e:
            print("Failed to connect to queue Server. Retrying in 5s... Error:", e)
            time.sleep(5)

if __name__ == "__main__":
    worker_loop()
