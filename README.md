# Encephalon.
Encephalon (anatomical term for the vertebrate brain) is a vision-based model made for the YSWS from Hack Club called <a href="buddy.hackclub.com"><b>Buddy</b></a>. Currently it only detects if there's power bank, AC Remote or MP3 Player is in sight and it also tells. It will be lated connected with an arm.

## How it works
- The browser captures video from the user's camera.
- The video is send to Roboflow via WebRTC for real-time inference.
- Roboflow returns predictions over the same WebRTC channel.
- The app draws detection boxes over the video.
- When it detects a stable change, it announces and updates the status panel.

![working](/Pasted%20image.png)

## Encephalon V1.0
**Capability:** Added my ECO AC Remotes Picture and made a set of 89 images. It didn't work as it should have, because the picture's weren't tuned fine enough.

**Model Used to Train**: **YOLO26 Object Detection (Nano)**

**Metrics:**
```
mAP@50: 96.6%
Precision: 81.8%
Recall: 100%
F1: 90.0%
```
**Dataset Details:**
```
Total Images: 89 Images
Train Set(88%): 78 Images
Valid Set(8%): 7 Images
Test Set(4%): 4 Images
```
**Preprocessing:**
```
Auto-Orient: Applied
Resize: Stretch to 640x640
```
**Augmentations:**
```
Outputs per training example: 3
Flip: Horizontal
Brightness: Between -15% and +15%
```
## Encephalon V1.1
**Capability:** Added more ECO AC's remotes picture and fine-tuned it and it was working as it should have.

**Model Used to Train**: **Roboflow RF-DETR Object Detection (Small)**

**Metrics:**
```
mAP@50: 99.4%
Precision: 90.0%
Recall: 100%
F1: 94.7%
```
**Dataset Details:**
```
Total Images: 189 Images
Train Set(88%): 165 Images
Valid Set(8%): 16 Images
Test Set(4%): 8 Images
```
**Preprocessing:**
```
Auto-Orient: Applied
Resize: Stretch to 640x640
```
**Augmentations:**
```
Outputs per training example: 3
Flip: Horizontal
Rotation: Between -15° and +15°
Brightness: Between -15% and +15%
Blur: Up to 2px
Noise: Up to 1.45% of pixels
```
## Encephalon V2.0
**Capability:** Added Retro MP3 Players pic and was working fine.

**Model Used to Train**: **Roboflow RF-DETR Object Detection (Medium)**

**Metrics:**
```
mAP@50: 91.6%
Precision: 83.0%
Recall: 94.0%
F1: 88.2%
```
**Dataset Details:**
```
Total Images: 398 Images
Train Set(88%): 348 Images
Valid Set(8%): 33 Images
Test Set(4%): 17 Images
```
**Preprocessing:**
```
Auto-Orient: Applied
Resize: Stretch to 640x640
```
**Augmentations:**
```
Outputs per training example: 3
Flip: Horizontal
Rotation: Between -15° and +15°
Brightness: Between -15% and +15%
Blur: Up to 2px
Noise: Up to 1.45% of pixels
```
## Encephalon 3.0
**Capability:** Added power banks picture and was working fine.

**Model Used to Train**: **Roboflow RF-DETR Object Detection (Nano)**

**Metrics:**
```
mAP@50: 94.1%
Precision: 96.5%
Recall: 90.6%
F1: 93.5%
```
**Dataset Details:**
```
Total Images: 785 Images
Train Set(88%): 690 Images
Valid Set(8%): 62 Images
Test Set(4%): 33 Images
```
**Preprocessing:**
```
Auto-Orient: Applied
Resize: Stretch to 640x640
```
**Augmentations:**
```
Outputs per training example: 3
Flip: Horizontal
Rotation: Between -15° and +15°
Brightness: Between -15% and +15%
Blur: Up to 2px
Noise: Up to 1.45% of pixels
```
## Thanks to Hack Club
Special Thanks to <a href="hackclub.com"><b>Hack Club</b></a> for funding this project, with <a href="buddy.hackclub.com"><b>Buddy</b></a>.

**Note: it is trained to work with my custom model/tools.**