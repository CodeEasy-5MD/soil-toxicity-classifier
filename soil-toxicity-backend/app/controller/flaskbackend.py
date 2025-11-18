from flask import Flask,Blueprint, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity,jwt_required
import os
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from app.model.prediction import Prediction
from app import db,create_app
import joblib

# Import your custom modules
try:
    from model import XGBoostSoilDataProcessor, SoilToxicityXGBoost, get_df, show_predictions_real
except ImportError as e:
    print(f"Warning: Could not import custom modules: {e}")

# Initialize Flask app
app = Flask(__name__)
CORS(app,origins="*")  # Enable CORS for frontend communication
predict_bp = Blueprint('predict', __name__) #send frontend parameters to backend

# Global variables for model and processor
model = None
processor = None
label_encoders = {}
scaler = None

# Define categorical columns
CATEGORICAL_COLUMNS = ['soil_type', 'land_use', 'climate_zone']

# Define default mappings for categorical variables
DEFAULT_CATEGORICAL_MAPPINGS = {
    'soil_type': ['clay', 'loam', 'sand', 'silt', 'peat', 'chalk', 'unknown'],
    'land_use': ['agricultural', 'residential', 'industrial', 'forest', 'grassland', 'urban', 'unknown'],
    'climate_zone': ['tropical', 'temperate', 'arid', 'polar', 'mediterranean', 'continental', 'unknown']
}

def initialize_encoders():
    """Initialize label encoders for categorical variables"""
    global label_encoders
    
    for column, categories in DEFAULT_CATEGORICAL_MAPPINGS.items():
        encoder = LabelEncoder()
        encoder.fit(categories)
        label_encoders[column] = encoder
        print(f"Initialized encoder for {column} with categories: {categories}")

def load_encoders():
    """Load saved encoders or initialize new ones"""
    global label_encoders, scaler
    
    try:
        if os.path.exists('label_encoders.pkl'):
            with open('label_encoders.pkl', 'rb') as f:
                label_encoders = pickle.load(f)
            print("Label encoders loaded successfully!")
        else:
            initialize_encoders()
            
        if os.path.exists('scaler.pkl'):
            with open('scaler.pkl', 'rb') as f:
                scaler = pickle.load(f)
            print("Scaler loaded successfully!")
        else:
            scaler = StandardScaler()
            print("Scaler initialized!")
            
    except Exception as e:
        print(f"Error loading encoders: {e}")
        initialize_encoders()

def save_encoders():
    """Save encoders and scaler"""
    try:
        with open('label_encoders.pkl', 'wb') as f:
            pickle.dump(label_encoders, f)
        
        if scaler is not None:
            with open('scaler.pkl', 'wb') as f:
                pickle.dump(scaler, f)
        
        print("Encoders and scaler saved successfully!")
    except Exception as e:
        print(f"Error saving encoders: {e}")

def encode_categorical_data(data):
    """Encode categorical columns in the data"""
    global label_encoders
    
    encoded_data = data.copy()
    
    for column in CATEGORICAL_COLUMNS:
        if column in encoded_data.columns:
            values = encoded_data[column].fillna('unknown').astype(str).str.lower()
            
            # Handle unknown categories
            encoder = label_encoders[column]
            encoded_values = []
            
            for value in values:
                try:
                    # Try to encode the value
                    encoded_value = encoder.transform([value])[0]
                except ValueError:
                    # If value is not in encoder's classes, use 'unknown'
                    print(f"Unknown value '{value}' for {column}, using 'unknown'")
                    encoded_value = encoder.transform(['unknown'])[0]
                
                encoded_values.append(encoded_value)
            
            encoded_data[column] = encoded_values
            print(f"Encoded {column}: {dict(zip(values, encoded_values))}")
    
    return encoded_data
def load_model():
    """Load the trained model and processor"""
    global model, processor
    
    try:
        if os.path.exists('xgb_model.pkl'):
            with open('xgb_model.pkl', 'rb') as f:
                model = pickle.load(f)
            print("Model loaded successfully!")
            
        if os.path.exists('processor.pkl'):
            with open('processor.pkl', 'rb') as f:
                processor = pickle.load(f)
            print("Processor loaded successfully!")
        else:
            # Initialize processor if file doesn't exist
            processor = XGBoostSoilDataProcessor()
            print("Processor initialized!")
            
    except Exception as e:
        print(f"Error loading model/processor: {e}")

def prepare_features_for_prediction(data):
    """Prepare features in the correct order and format for prediction"""
    # Define the expected feature order (adjust based on your model)
    expected_features = [
        # Numeric features
        'earthworms', 'springtails', 'mites', 'nematodes',
        'ph', 'organic_matter', 'lead_concentration', 'cadmium_concentration',
        'nitrogen', 'phosphorus', 'potassium', 'temperature', 'moisture',
        # Categorical features (will be encoded)
        'soil_type', 'land_use', 'climate_zone'
    ]
    
    # Create DataFrame with expected columns
    feature_data = {}
    for feature in expected_features:
        if feature in data.columns:
            feature_data[feature] = data[feature].iloc[0] if len(data) > 0 else 0
        else:
            # Set default values
            if feature in CATEGORICAL_COLUMNS:
                feature_data[feature] = 'unknown'
            else:
                feature_data[feature] = 0
    
    # Create DataFrame
    df = pd.DataFrame([feature_data])
    
    # Encode categorical columns
    df_encoded = encode_categorical_data(df)
    
    # Ensure all numeric columns are float type
    numeric_columns = [col for col in df_encoded.columns if col not in CATEGORICAL_COLUMNS]
    for col in numeric_columns:
        df_encoded[col] = pd.to_numeric(df_encoded[col], errors='coerce').fillna(0)
    
    # Ensure categorical columns are int type after encoding
    for col in CATEGORICAL_COLUMNS:
        if col in df_encoded.columns:
            df_encoded[col] = df_encoded[col].astype(int)
    
    return df_encoded

def validate_soil_data(data):
    """Validate incoming soil data"""
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
    
    # Convert string numbers to float where appropriate
    numeric_fields = {
        'earthworms', 'springtails', 'mites', 'nematodes',
        'ph', 'organic_matter', 'lead_concentration', 'cadmium_concentration',
        'nitrogen', 'phosphorus', 'potassium', 'temperature', 'moisture'
    }
    
    for field in numeric_fields:
        if field in filtered_data and filtered_data[field] is not None:
            try:
                filtered_data[field] = float(filtered_data[field])
            except (ValueError, TypeError):
                filtered_data[field] = None
    
    return filtered_data

def train_new_model():
    """Train a new model if none exists"""
    global scaler
    
    try:
        # Get sample data for training (you'll need to implement this)
        df = get_df()  # Assuming this function returns your training data
        
        # Encode categorical columns in training data
        df_encoded = encode_categorical_data(df)
        
        # Process data
        X_train, X_val, X_test, y_train, y_val, y_test = processor.clean_and_prepare_data(
            df_encoded, 'target_column', test_size=0.2, val_size=0.2
        )
        
        # Fit scaler on training data
        scaler.fit(X_train)
        
        # Initialize XGBoost model
        xgb_model = SoilToxicityXGBoost(n_classes=processor.n_classes)
        
        # Train with default parameters
        print("\n" + "="*50)
        print("TRAINING WITH DEFAULT PARAMETERS")
        print("="*50)
        
        thismodel = xgb_model.create_model()
        thismodel = xgb_model.train(X_train, y_train, X_val, y_val)
        
        # Save the trained model
        with open('xgb_model.pkl', 'wb') as f:
            pickle.dump(thismodel, f)
        
        # Save the processor
        with open('processor.pkl', 'wb') as f:
            pickle.dump(processor, f)
            
        # Save encoders and scaler
        save_encoders()
            
        return thismodel
        
    except Exception as e:
        print(f"Error training model: {e}")
        return None

# Load model and encoders on startup
load_model()
load_encoders()

@predict_bp.route('/', methods=['GET'])
def read_root():
    """Health check endpoint"""
    return jsonify({"message": "Soil Toxicity Classifier Backend Running!"})

@predict_bp.route('/health', methods=['GET'])
def health_check():
    """Detailed health check"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "processor_loaded": processor is not None
    })

@predict_bp.route('/', methods=['POST'])
@jwt_required()
def predict_soil():
    """Predict soil toxicity level and store results"""
    global model, processor
    
    try:
        # Get JSON data from request
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract and validate data according to frontend structure
        soil_data = {
            # Soil Fauna
            'earthworms': data.get('earthworms', 0),
            'springtails': data.get('springtails', 0),
            'mites': data.get('mites', 0),
            'nematodes': data.get('nematodes', 0),
            
            # Chemical Properties
            'ph': data.get('ph', 6.5),
            'organic_matter': data.get('organic_matter', 0),
            'lead_concentration': data.get('lead_concentration', 0),
            'cadmium_concentration': data.get('cadmium_concentration', 0),
            'nitrogen': data.get('nitrogen', 20),
            'phosphorus': data.get('phosphorus', 15),
            'potassium': data.get('potassium', 25),
            
            # Environmental Conditions
            'temperature': data.get('temperature', 15),
            'moisture': data.get('moisture', 50),
            
            # Categorical Features
            'soil_type': data.get('soil_type', 'loam'),
            'land_use': data.get('land_use', 'agricultural'),
            'climate_zone': data.get('climate_zone', 'temperate')
        }
        
        # Validate and filter data
        filtered_data = validate_soil_data(soil_data)
        
        # Convert to DataFrame and make prediction
        df = pd.DataFrame([filtered_data])
        processed_df = prepare_features_for_prediction(df)
        
        # Check if model exists
        if model is None:
            if os.path.exists('xgb_model.pkl'):
                with open('xgb_model.pkl', 'rb') as f:
                    model = pickle.load(f)
            else:
                model = train_new_model()
                if model is None:
                    return jsonify({"error": "Could not load or train model"}), 500
        
        # Make predictions
        y_pred = model.predict(processed_df)
        y_pred_proba = model.predict_proba(processed_df)
        
        # Get toxicity level and confidence
        toxicity_level, confidence = show_predictions_real(processed_df, y_pred_proba, processor)
        
        # Create and save SoilSample record (similar to User creation pattern)
        soil_sample = Prediction(
            user_id = get_jwt_identity(),
            # Soil Fauna
            earthworms=data.get('earthworms', 0),
            springtails=data.get('springtails', 0),
            mites=data.get('mites', 0),
            nematodes=data.get('nematodes', 0),
            
            # Chemical Properties
            ph=data.get('ph', 6.5),
            organic_matter=data.get('organic_matter', 0),
            lead_concentration=data.get('lead_concentration', 0),
            cadmium_concentration=data.get('cadmium_concentration', 0),
            nitrogen=data.get('nitrogen', 20),
            phosphorus=data.get('phosphorus', 15),
            potassium=data.get('potassium', 25),
            
            # Environmental Conditions
            temperature=data.get('temperature', 15),
            moisture=data.get('moisture', 50),
            
            # Categorical Features
            soil_type=data.get('soil_type', 'loam'),
            land_use=data.get('land_use', 'agricultural'),
            climate_zone=data.get('climate_zone', 'temperate'),
            
            # Prediction Results
            toxicity_level=toxicity_level,
            confidence=float(confidence * 100)
        )
        
        db.session.add(soil_sample)
        db.session.commit()
        print(f"Successfully saved prediction with ID: {soil_sample.id}")
        
        return jsonify({
            "toxicity_level": toxicity_level,
            "confidence": float(confidence * 100),
            "sample_id": soil_sample.id,  # Return the ID of the created record
            "status": "success"
        })
        
    except Exception as e:
        print(f"Database error details: {e}")
        db.session.rollback()
        print(f"Error in predict_soil: {e}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500
    
def validate_soil_data(data):
    """Validate and ensure all required fields are present with proper types"""
    validated_data = {}
    
    # Soil Fauna validation
    for field in ['earthworms', 'springtails', 'mites', 'nematodes']:
        validated_data[field] = int(data.get(field, 0))
    
    # Chemical Properties validation
    for field in ['ph', 'organic_matter', 'lead_concentration', 'cadmium_concentration', 
                 'nitrogen', 'phosphorus', 'potassium']:
        validated_data[field] = float(data.get(field, 0))
    
    # Environmental Conditions validation
    validated_data['temperature'] = float(data.get('temperature', 15))
    validated_data['moisture'] = float(data.get('moisture', 50))
    
    # Categorical Features validation
    validated_data['soil_type'] = data.get('soil_type', 'loam')
    validated_data['land_use'] = data.get('land_use', 'agricultural')
    validated_data['climate_zone'] = data.get('climate_zone', 'temperate')
    
    return validated_data
@predict_bp.route('/features', methods=['GET'])
def get_features():
    """Return the list of expected features"""
    features = {
        "soil_fauna": ['earthworms', 'springtails', 'mites', 'nematodes'],
        "chemical_properties": [
            'ph', 'organic_matter', 'lead_concentration', 'cadmium_concentration',
            'nitrogen', 'phosphorus', 'potassium'
        ],
        "environmental_conditions": ['temperature', 'moisture'],
        "site_characteristics": ['soil_type', 'land_use', 'climate_zone']
    }
    return jsonify(features)

@predict_bp.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the loaded model"""
    global model, processor
    
    info = {
        "model_loaded": model is not None,
        "processor_loaded": processor is not None,
        "model_file_exists": os.path.exists('xgb_model.pkl'),
        "processor_file_exists": os.path.exists('processor.pkl')
    }
    
    if model is not None:
        try:
            # Try to get model information
            if hasattr(model, 'feature_names_in_'):
                info["feature_names"] = list(model.feature_names_in_)
            if hasattr(model, 'n_classes_'):
                info["n_classes"] = model.n_classes_
        except:
            pass
    
    return jsonify(info)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# if __name__ == '__main__':
#     # Load model and encoders on startup
#     load_model()
#     load_encoders()
#     create_app()

    
#     # Run the Flask app
#     app.run(
#         host='0.0.0.0',  # Allow external connections
#         port=8000,       # Same port as FastAPI default
#         debug=True       # Enable debug mode for development
#     )