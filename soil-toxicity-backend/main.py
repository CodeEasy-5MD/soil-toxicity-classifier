from fastapi import FastAPI
from model import XGBoostSoilDataProcessor, SoilToxicityXGBoost, get_df, show_predictions_real
import os
import pickle
import pandas as pd

#name of our app
app = FastAPI()

#get base pass of server
#return what gets exposed
@app.get("/")
def read_root():
    return {"message": "Soil Toxicity Classifier Backend Running!"}

#receive data from UI for prediction
@app.post("/predict")
def predict_soil(data: dict):
    # Later: load your trained model here
    # For now, just return dummy response
    # Define allowed fields (matching your frontend exactly)
    allowed_fields = {
            # Soil Fauna
            'earthworms', 'springtails', 'mites', 'nematodes',
            # Chemical Properties  
            'ph', 'organic_matter', 'lead_concentration', 'cadmium_concentration',
            'nitrogen', 'phosphorus', 'potassium',
            # Environmental Conditions
            'temperature', 'moisture',
            # Site Characteristics
            'soil_type', 'land_use', 'climate_zone'
        }
        
    # Filter data to only include allowed fields
    filtered_data = {key: value for key, value in data.items() if key in allowed_fields}
     
    print(f"Filtered data: {filtered_data}")

    # Initialize processor
    processor = XGBoostSoilDataProcessor()

    # get dataframe
    # Convert to DataFrame using only filtered data
    df = pd.DataFrame([filtered_data])

    #check for data after user input
    print(f"The data is {data}")
    data = pd.Series(data=data)

    # Check if file exists
    if os.path.exists('xgb_model.pkl'):
       print("File exists!")

       # Load your model

       with open('xgb_model.pkl', 'rb') as f:
          model = pickle.load(f)
          #if model exists, make predictions
          y_pred = model.predict(data)
          y_pred_proba = model.predict_proba(data)

          toxicity_level, confidence = show_predictions_real(data, y_pred_proba, processor)

          return {
            "toxicity_level": toxicity_level,
            "confidence": round(confidence, 1)
             }

    else:
       print("File does not exist")
       # Train a new model or handle the missing file
    
       # Process data
       X_train, X_val, X_test, y_train, y_val, y_test = processor.clean_and_prepare_data(
       df, 'target_column', test_size=0.2, val_size=0.2
       )
    
       # Initialize XGBoost model
       xgb_model = SoilToxicityXGBoost(n_classes=processor.n_classes)
    
       # Option 1: Train with default parameters
       print("\n" + "="*50)
       print("TRAINING WITH DEFAULT PARAMETERS")
       print("="*50)
    
       xgb_model.create_model()
       xgb_model.train(X_train, y_train, X_val, y_val)
    
       # Evaluate
       accuracy, y_pred, y_pred_proba = xgb_model.evaluate(X_test, y_test, processor)
    
    
       # Show real predictions
       toxicity_level, confidence = show_predictions_real(X_test, y_pred_proba, processor)
       return {
            "toxicity_level": toxicity_level,
            "confidence": round(confidence, 1)
             }
    
