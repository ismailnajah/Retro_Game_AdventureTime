import cv2
import numpy as np
import os

def get_hitbox_from_frame(image):
    """Compute bounding box (x, y, w, h) around visible character pixels."""
    if image.shape[2] == 4:
        alpha = image[:, :, 3]
        mask = cv2.threshold(alpha, 1, 255, cv2.THRESH_BINARY)[1]
    else:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        mask = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)[1]

    # Clean mask to remove noise
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # Find main contour
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    c = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(c)
    return {'x' : x, 'y' : y, 'width': w, 'height': h}

def draw_hitbox(image, hitbox, color=(0, 255, 0, 255)):
    """Draw hitbox rectangle on the sprite image."""
    x, y, w, h = hitbox
    img_copy = image.copy()
    if img_copy.shape[2] == 4:
        img_copy = cv2.cvtColor(img_copy, cv2.COLOR_BGRA2BGR)
    cv2.rectangle(img_copy, (x, y), (x + w, y + h), color, 2)
    return img_copy

def extract_frames(spritesheet, frame_width, frame_height):
    """Slice the spritesheet into frames horizontally."""
    sheet_h, sheet_w = spritesheet.shape[:2]
    num_frames = sheet_w // frame_width
    frames = []

    for i in range(num_frames):
        x_start = i * frame_width
        frame = spritesheet[0:frame_height, x_start:x_start + frame_width]
        frames.append(frame)
    return frames

def process_spritesheet(image_path, frame_width, frame_height):
    sheet = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

    if sheet is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")

    frames = extract_frames(sheet, frame_width, frame_height)

    all_boxes = []
    for i, frame in enumerate(frames):
        hitbox = get_hitbox_from_frame(frame)
        if hitbox:
            all_boxes.append(hitbox)
    return {
        "path": image_path,
        "frame_w": frame_width,
        "frame_h": frame_height,
        "frames": len(frames),
        "hitboxes": all_boxes
    }  

def isNumber(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

def getSpriteName(filename):
    name = ''
    for x in filename.split('_'):
        if isNumber(x):
            break
        if name != '':
            name += '_'
        name += x
    return name

def process_sprites(folder_path):
    data = {}
    for filename in os.listdir(folder_path):
        if filename.endswith(".png"):
            image_path = os.path.join(folder_path, filename)
            sprite_name = getSpriteName(filename)
            frame_width = [int(x) for x in filename.split('_') if isNumber(x)][0]
            frame_height = frame_width  # Assuming square frames for simplicity
            # print(f"\n---\nProcessing file: {filename} --- frame width {frame_width}")
            data[sprite_name] = process_spritesheet(image_path, frame_width, frame_height)
    return data

if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Generate JSON data for spritesheets {path, frame_w, frame_h, hitboxes[]}.")
    parser.add_argument("--path", required=True, help="Path to spritesheets folder.")
    args = parser.parse_args()
    outfile = "".join([str.capitalize(s) for s in args.path.split("/")[-1].split("_")]) + "Metadata.json"
    print(f"Writing output to {outfile}")
    json.dump(process_sprites(args.path), open(outfile, "w"), indent=4)