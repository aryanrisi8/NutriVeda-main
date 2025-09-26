# Food Detection Feature Setup

This document explains how to set up and use the AI Food Detection feature in NutriVeda.

## Prerequisites

1. **Python Environment**: Make sure Python 3.8+ is installed on your system
2. **Required Python Packages**: Install the required packages using pip

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

The required packages are:
- tensorflow==2.15.0
- opencv-python==4.8.1.78
- numpy==1.24.3
- pandas==2.0.3
- Pillow==10.0.1

### 2. Verify Model Files

Ensure the following files are present in the `CV/` directory:
- `food_classifier_final.h5` - The trained food classification model
- `class_indices.pkl` - Class index mappings
- `indian_food_nutrition.csv` - Nutrition database

## Usage

### Accessing the Feature

1. **From Dashboard**: Click the "AI Food Detection" button in the main dashboard
2. **From Quick Tools**: Use the "AI Food Detection" button in the right sidebar

### How to Use

1. **Start Camera**: Click "Start Camera" to activate your webcam
2. **Position Food**: Point your camera at a food item
3. **Detect**: Click "Detect Food" to analyze the image
4. **View Results**: See the detected food name and nutritional information
5. **Stop Camera**: Click "Stop Camera" when finished

### Supported Foods

The system can detect the following Indian food items:
- Biriyani
- Bisibelebath
- Butter Naan
- Chaat
- Chappati
- Dhokla
- Dosa
- Gulab Jamun
- Halwa
- Idly
- Kathi Roll
- Meduvadai
- Noodles
- Paniyaram
- Poori
- Samosa
- Tandoori Chicken
- Upma
- Vada Pav
- Ven Pongal

### Nutrition Information

For each detected food, the system displays:
- **Primary Nutrients**: Calories, Protein, Fat, Carbohydrates, Fiber, Sodium
- **Additional Nutrients**: Vitamins, Minerals, and other nutritional components

## Technical Details

### Architecture

- **Frontend**: React component with webcam access
- **Backend**: Next.js API route that spawns Python process
- **AI Model**: TensorFlow/Keras model for food classification
- **Data**: CSV-based nutrition database

### API Endpoint

The food detection API is available at:
```
POST /api/food-detection
```

**Request**: FormData with image file
**Response**: JSON with food name, confidence, and nutrition info

### File Structure

```
NutriVeda-main/
├── app/
│   ├── api/food-detection/route.ts
│   └── protected/food-detection/page.tsx
├── components/
│   └── food-detection.tsx
├── CV/
│   ├── food_classifier_final.h5
│   ├── class_indices.pkl
│   └── indian_food_nutrition.csv
├── scripts/
│   └── detect_food.py (auto-generated)
└── requirements.txt
```

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure browser has camera permissions
   - Try refreshing the page and granting permissions again

2. **Python Script Errors**
   - Verify Python dependencies are installed
   - Check that model files exist in CV/ directory
   - Ensure Python is accessible from command line

3. **Low Detection Confidence**
   - Ensure good lighting
   - Position food item clearly in frame
   - Try different angles or distances

4. **No Nutrition Data**
   - Some foods may not have complete nutrition information
   - Check that indian_food_nutrition.csv is properly formatted

### Performance Tips

- Detection works best with good lighting
- Clear, unobstructed view of food items
- Avoid blurry or dark images
- For best results, show single food items rather than mixed dishes

## Development

### Adding New Foods

To add support for new food items:

1. **Retrain Model**: Add new food images to training data and retrain the model
2. **Update Class Indices**: Regenerate class_indices.pkl with new classes
3. **Add Nutrition Data**: Add nutrition information to indian_food_nutrition.csv
4. **Test**: Verify detection works for new food items

### Customizing Nutrition Display

Modify the `formatNutritionValue` function in `food-detection.tsx` to customize how nutrition values are displayed.

## Security Notes

- Camera access is only active when explicitly started by user
- Images are processed locally and not stored permanently
- Temporary files are cleaned up after processing
- No personal data is transmitted to external services
