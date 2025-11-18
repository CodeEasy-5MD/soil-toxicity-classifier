from app import db, bcrypt
from datetime import datetime
from sqlalchemy.dialects.mysql import JSON  # Use appropriate type for your DB

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) 
    
    # Soil Fauna (organisms per sample)
    earthworms = db.Column(db.Integer, nullable=True)
    springtails = db.Column(db.Integer, nullable=True)
    mites = db.Column(db.Integer, nullable=True)
    nematodes = db.Column(db.Integer, nullable=True)
    
    # Chemical Properties
    ph = db.Column(db.Float, nullable=True)
    organic_matter = db.Column(db.Float, nullable=True)
    lead_concentration = db.Column(db.Float, nullable=True)
    cadmium_concentration = db.Column(db.Float, nullable=True)
    nitrogen = db.Column(db.Float, nullable=True)
    phosphorus = db.Column(db.Float, nullable=True)
    potassium = db.Column(db.Float, nullable=True)
    
    # Environmental Conditions
    temperature = db.Column(db.Float, nullable=True)
    moisture = db.Column(db.Float, nullable=True)
    
    # Categorical Features
    soil_type = db.Column(db.String(20), nullable=True)  # loam, clay, sand, silt
    land_use = db.Column(db.String(20), nullable=True)   # agricultural, forest, urban, industrial
    climate_zone = db.Column(db.String(20), nullable=True)  # temperate, tropical, arid, continental
    
    # Prediction Results
    toxicity_level = db.Column(db.String(50), nullable=True)  # e.g., "Low", "Moderate", "High"
    confidence = db.Column(db.Float, nullable=True)  # Confidence percentage
    prediction_details = db.Column(JSON, nullable=True)  # Store full prediction details if needed
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, **kwargs):
        # Initialize with any provided keyword arguments
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self):
        """Convert the soil sample to a dictionary for easy JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'earthworms': self.earthworms,
            'springtails': self.springtails,
            'mites': self.mites,
            'nematodes': self.nematodes,
            'ph': self.ph,
            'organic_matter': self.organic_matter,
            'lead_concentration': self.lead_concentration,
            'cadmium_concentration': self.cadmium_concentration,
            'nitrogen': self.nitrogen,
            'phosphorus': self.phosphorus,
            'potassium': self.potassium,
            'temperature': self.temperature,
            'moisture': self.moisture,
            'soil_type': self.soil_type,
            'land_use': self.land_use,
            'climate_zone': self.climate_zone,
            'toxicity_level': self.toxicity_level,
            'confidence': self.confidence,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Prediction {self.id}>'


