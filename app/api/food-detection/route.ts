import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Create a temporary file for the uploaded image
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempImagePath = path.join(tempDir, `temp_${Date.now()}.jpg`)
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    fs.writeFileSync(tempImagePath, buffer)

    // Path to the Python detection script
    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'detect_food.py')
    
    // Check if the Python script exists, if not create it
    if (!fs.existsSync(pythonScriptPath)) {
      await createDetectionScript(pythonScriptPath)
    }

    // Run the Python detection script
    const result = await runDetectionScript(pythonScriptPath, tempImagePath)

    // Clean up temporary file
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Food detection error:', error)
    return NextResponse.json(
      { 
        error: 'Detection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function createDetectionScript(scriptPath: string) {
  const scriptDir = path.dirname(scriptPath)
  if (!fs.existsSync(scriptDir)) {
    fs.mkdirSync(scriptDir, { recursive: true })
  }

  const scriptContent = `import sys
import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import pickle
import pandas as pd
import json

# Get the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
cv_dir = os.path.join(project_root, 'CV')

class FoodDetector:
    def __init__(self):
        # Paths to model files
        model_path = os.path.join(cv_dir, 'food_classifier_final.h5')
        class_indices_path = os.path.join(cv_dir, 'class_indices.pkl')
        nutrition_csv = os.path.join(cv_dir, 'indian_food_nutrition.csv')
        
        # Check if files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        if not os.path.exists(class_indices_path):
            raise FileNotFoundError(f"Class indices file not found: {class_indices_path}")
        if not os.path.exists(nutrition_csv):
            raise FileNotFoundError(f"Nutrition CSV file not found: {nutrition_csv}")
        
        # Load the trained model
        self.model = keras.models.load_model(model_path)
        
        # Load class indices
        with open(class_indices_path, 'rb') as f:
            class_indices = pickle.load(f)
        
        # Create reverse mapping (index to class name)
        self.class_names = {v: k for k, v in class_indices.items()}
        
        # Load nutrition data
        self.nutrition_df = pd.read_csv(nutrition_csv)
        self.nutrition_df['Item_clean'] = self.nutrition_df['Item'].str.lower().str.strip()
        
        self.img_size = 224
        self.confidence_threshold = 0.7
    
    def get_nutrition_info(self, food_name):
        food_name_clean = food_name.lower().strip()
        
        # Try exact match first
        match = self.nutrition_df[self.nutrition_df['Item_clean'] == food_name_clean]
        
        # If no exact match, try partial matching
        if match.empty:
            match = self.nutrition_df[self.nutrition_df['Item_clean'].str.contains(food_name_clean, na=False)]
        
        # If still no match, try reverse partial matching
        if match.empty:
            for idx, row in self.nutrition_df.iterrows():
                if row['Item_clean'] in food_name_clean:
                    match = self.nutrition_df.iloc[[idx]]
                    break
        
        if not match.empty:
            nutrition_info = match.iloc[0]
            nutrition_dict = {}
            for col in self.nutrition_df.columns:
                if col not in ['Item', 'Item_clean']:
                    value = nutrition_info[col]
                    if pd.notna(value):
                        # Convert numpy types to Python native types for JSON serialization
                        if hasattr(value, 'item'):
                            value = value.item()
                        nutrition_dict[col] = value
            return nutrition_dict
        
        return None
    
    def preprocess_image(self, image_path):
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read image")
        
        # Resize image to model input size
        resized = cv2.resize(image, (self.img_size, self.img_size))
        
        # Normalize pixel values
        normalized = resized.astype('float32') / 255.0
        
        # Add batch dimension
        batch = np.expand_dims(normalized, axis=0)
        
        return batch
    
    def predict_food(self, image_path):
        # Preprocess image
        processed_image = self.preprocess_image(image_path)
        
        # Make prediction
        predictions = self.model.predict(processed_image, verbose=0)
        
        # Get class with highest probability
        class_idx = np.argmax(predictions[0])
        confidence = predictions[0][class_idx]
        
        # Get class name
        food_name = self.class_names[class_idx]
        
        return food_name, confidence

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python detect_food.py <image_path>"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        detector = FoodDetector()
        food_name, confidence = detector.predict_food(image_path)
        nutrition_info = detector.get_nutrition_info(food_name)
        
        result = {
            "foodName": food_name,
            "confidence": float(confidence),
            "nutritionInfo": nutrition_info
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "traceback": str(e.__traceback__) if hasattr(e, '__traceback__') else None
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
`

  fs.writeFileSync(scriptPath, scriptContent)
}

async function runDetectionScript(scriptPath: string, imagePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Try different Python commands for different systems
    const pythonCommands = ['python', 'python3', 'py']
    let pythonCommand = pythonCommands[0]
    
    // On Windows, try 'py' first
    if (process.platform === 'win32') {
      pythonCommand = 'py'
    }
    
    const python = spawn(pythonCommand, [scriptPath, imagePath], {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONPATH: process.cwd() }
    })
    
    let output = ''
    let errorOutput = ''
    
    python.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    python.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (parseError) {
          reject(new Error(`Failed to parse output: ${output}. Parse error: ${parseError}`))
        }
      } else {
        reject(new Error(`Python script failed with code ${code}. Error: ${errorOutput}. Output: ${output}`))
      }
    })
    
    python.on('error', (error) => {
      reject(new Error(`Failed to start Python script with command '${pythonCommand}': ${error.message}. Make sure Python is installed and accessible.`))
    })
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      python.kill()
      reject(new Error('Python script timed out after 30 seconds'))
    }, 30000)
  })
}
