import tensorflow.keras as keras
import io
import numpy
import cv2

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from typing import List

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

classes = { 1:'Speed limit (20km/h)',
            2:'Speed limit (30km/h)', 
            3:'Speed limit (50km/h)', 
            4:'Speed limit (60km/h)', 
            5:'Speed limit (70km/h)', 
            6:'Speed limit (80km/h)', 
            7:'End of speed limit (80km/h)', 
            8:'Speed limit (100km/h)', 
            9:'Speed limit (120km/h)', 
            10:'No passing', 
            11:'No passing veh over 3.5 tons', 
            12:'Right-of-way at intersection', 
            13:'Priority road', 
            14:'Yield', 
            15:'Stop', 
            16:'No vehicles', 
            17:'Veh > 3.5 tons prohibited', 
            18:'No entry', 
            19:'General caution', 
            20:'Dangerous curve left', 
            21:'Dangerous curve right', 
            22:'Double curve', 
            23:'Bumpy road', 
            24:'Slippery road', 
            25:'Road narrows on the right', 
            26:'Road work', 
            27:'Traffic signals', 
            28:'Pedestrians', 
            29:'Children crossing', 
            30:'Bicycles crossing', 
            31:'Beware of ice/snow',
            32:'Wild animals crossing', 
            33:'End speed + passing limits', 
            34:'Turn right ahead', 
            35:'Turn left ahead', 
            36:'Ahead only', 
            37:'Go straight or right', 
            38:'Go straight or left', 
            39:'Keep right', 
            40:'Keep left', 
            41:'Roundabout mandatory', 
            42:'End of no passing', 
            43:'End no passing veh > 3.5 tons' }

# Load the pre-trained Keras model
model = keras.models.load_model('traffic_classifier.h5')

def get_bounding_box(img, model):
    # Convert image to numpy array
    img = cv2.cvtColor(numpy.array(img), cv2.COLOR_RGB2BGR)

    # Convert image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply adaptive thresholding to isolate the traffic sign
    thresh = cv2.adaptiveThreshold(gray,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY,11,2)

    # Find contours in the thresholded image
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Loop over the contours and find the one with the largest area
    max_area = 0
    max_contour = None
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > max_area:
            max_area = area
            max_contour = contour

    # Get the bounding box for the contour with the largest area
    x,y,w,h = cv2.boundingRect(max_contour)

    # Expand the bounding box to include some extra margin
    margin = 10
    x -= margin
    y -= margin
    w += 2 * margin
    h += 2 * margin

    # Clamp the bounding box to be within the image bounds
    x = max(x, 0)
    y = max(y, 0)
    w = min(w, img.shape[1] - x)
    h = min(h, img.shape[0] - y)

    # Return the bounding box as a tuple of (left, upper, right, lower) coordinates
    return (x, y, x + w, y + h)

@app.get('/')
async def Home():
  return "Status OK"

@app.post('/predict')
async def predict_image(files: List[UploadFile] = File(...)):
  predictions = []
  for file in files:
    # Read the image file and convert it to a PIL image object
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    # Resize the image to the required input size for the model
    img = img.resize((30, 30))
    img = numpy.expand_dims(img, axis=0)
    img = numpy.array(img)

    pred = model.predict([img])[0]
    sign = classes[(pred.argmax()+1)]
    predictions.append({"class": sign})

  return predictions
  
