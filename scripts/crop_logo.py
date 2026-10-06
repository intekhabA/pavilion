import os
from PIL import Image

def crop_transparent_padding(image_path, output_path, padding=8):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist.")
        return False
    
    img = Image.open(image_path)
    print(f"Opening: {image_path} (Format: {img.format}, Size: {img.size}, Mode: {img.mode})")
    
    # Convert or check alpha channel
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    
    if not bbox:
        print(f"No non-transparent content found in {image_path}")
        return False
    
    print(f"Content bounding box: {bbox}")
    
    # Add minimal padding around the emblem for smooth edges
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(img.width, bbox[2] + padding)
    bottom = min(img.height, bbox[3] + padding)
    
    crop_box = (left, top, right, bottom)
    print(f"Cropping to: {crop_box} (Dimensions: {right - left}x{bottom - top})")
    
    cropped = img.crop(crop_box)
    cropped.save(output_path, format="PNG", optimize=True)
    print(f"Saved cropped image to {output_path}")
    return True

if __name__ == "__main__":
    src_file = "frontend/public/logo2.png"
    if not os.path.exists(src_file):
        src_file = "frontend/public/logo.png"
    
    # Crop logo2.png
    crop_transparent_padding(src_file, "frontend/public/logo2.png", padding=8)
    
    # Also update logo.png with the same cropped version
    crop_transparent_padding("frontend/public/logo2.png", "frontend/public/logo.png", padding=0)
