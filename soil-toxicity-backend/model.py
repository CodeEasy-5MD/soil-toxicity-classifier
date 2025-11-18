# Import necessary libraries
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.impute import SimpleImputer
import xgboost as xgb
from xgboost import XGBClassifier
import warnings
#warnings.filterwarnings('ignore')

# Data generation code (same as original)
np.random.seed(42)

# Number of samples
n_samples = 10000

print(f"Generating {n_samples} synthetic soil samples...")

# Create synthetic data
data = {
    'site_id': range(n_samples),
    'earthworms': np.random.poisson(10, n_samples),
    'springtails': np.random.poisson(15, n_samples),
    'mites': np.random.poisson(20, n_samples),
    'nematodes': np.random.poisson(50, n_samples),
    'ph': np.random.normal(6.5, 1.5, n_samples),
    'organic_matter': np.random.gamma(2, 2, n_samples),
    'lead_concentration': np.random.exponential(2, n_samples),
    'cadmium_concentration': np.random.exponential(0.5, n_samples),
    'nitrogen': np.random.normal(20, 5, n_samples),
    'phosphorus': np.random.normal(15, 3, n_samples),
    'potassium': np.random.normal(25, 6, n_samples),
    'temperature': np.random.normal(15, 5, n_samples),
    'moisture': np.random.beta(2, 3, n_samples) * 100,
    'soil_type': np.random.choice(['clay', 'sand', 'loam', 'silt'], n_samples,
                                 p=[0.25, 0.3, 0.35, 0.1]),
    'land_use': np.random.choice(['agricultural', 'forest', 'urban', 'industrial'], n_samples,
                                p=[0.4, 0.3, 0.2, 0.1]),
    'climate_zone': np.random.choice(['temperate', 'tropical', 'arid', 'continental'], n_samples,
                                   p=[0.3, 0.25, 0.2, 0.25])
}

# Convert to DataFrame
df = pd.DataFrame(data)

# create this function in order to import to main.py file
def get_df():
    return df

# Ensure realistic bounds
df['ph'] = np.clip(df['ph'], 3.0, 10.0)
df['organic_matter'] = np.clip(df['organic_matter'], 0.1, 15.0)
df['nitrogen'] = np.clip(df['nitrogen'], 5, 50)
df['phosphorus'] = np.clip(df['phosphorus'], 5, 40)
df['potassium'] = np.clip(df['potassium'], 10, 60)
df['temperature'] = np.clip(df['temperature'], -5, 35)
df['moisture'] = np.clip(df['moisture'], 5, 95)

# Create toxicity score calculation function
def calculate_toxicity_score(row):
    base_score = (
        row['lead_concentration'] * 2 + 
        row['cadmium_concentration'] * 5 + 
        np.maximum(0, 8 - row['ph']) * 3 + 
        (row['earthworms'] < 5) * 4 + 
        (row['organic_matter'] < 2) * 3 
    )
    
    additional_factors = (
        (row['nitrogen'] > 35) * 2 +
        (row['phosphorus'] < 8) * 1.5 +
        (abs(row['temperature'] - 15) > 15) * 1 +
        ((row['moisture'] < 15) or (row['moisture'] > 80)) * 1.5 +
        (row['land_use'] == 'industrial') * 3 +
        (row['land_use'] == 'urban') * 1.5 +
        (row['soil_type'] == 'clay') * 1 +
        (row['climate_zone'] == 'arid') * 1
    )
    
    noise = np.random.normal(0, 1.5)
    total_score = base_score + additional_factors + noise
    return max(0, total_score)

# Calculate toxicity scores and create target
print("Calculating toxicity scores based on environmental factors...")
df['toxicity_score'] = df.apply(calculate_toxicity_score, axis=1)

toxicity_bins = [0, 6, 12, 20, np.inf]
toxicity_labels = ['Low', 'Medium', 'High', 'Critical']
df['target_column'] = pd.cut(df['toxicity_score'], 
                            bins=toxicity_bins,
                            labels=toxicity_labels,
                            include_lowest=True)

df = df.drop('toxicity_score', axis=1)

print("\nData Generation Summary:")
print(f"Total samples: {len(df)}")
print(f"Features: {len(df.columns) - 1}")

print("\nTarget column distribution:")
target_counts = df['target_column'].value_counts().sort_index()
for level, count in target_counts.items():
    percentage = (count / len(df)) * 100
    print(f"{level}: {count} samples ({percentage:.1f}%)")

# XGBoost Data Processor Class
class XGBoostSoilDataProcessor:
    def __init__(self):
        self.label_encoder = LabelEncoder()
        self.feature_names = None
        self.n_classes = None
        self.categorical_mappings = {}

    def clean_and_prepare_data(self, df, target_column, test_size=0.2, val_size=0.2):
        """
        Data preparation optimized for XGBoost
        """
        print("=== DATA PREPROCESSING FOR XGBOOST ===")
        
        # Data cleaning
        df_clean = df.drop_duplicates().dropna(how='all')
        print(f"Dataset shape after cleaning: {df_clean.shape}")
        
        # Handle missing values
        df_clean = self._check_missing_values(df_clean, target_column)
        print(f"Dataset shape after missing values: {df_clean.shape}")
        
        # Separate features and target
        X = df_clean.drop([target_column], axis=1)
        y = df_clean[target_column]
        
        # Remove site_id if it exists
        if 'site_id' in X.columns:
            X = X.drop('site_id', axis=1)
        
        # Handle categorical features - XGBoost can handle them directly
        # But we'll encode them for better performance
        numeric_columns = X.select_dtypes(include=[np.number]).columns
        categorical_columns = X.select_dtypes(include=['object']).columns
        
        print(f"Numeric features: {len(numeric_columns)}")
        print(f"Categorical features: {len(categorical_columns)}")
        
        # Encode categorical features using label encoding (XGBoost friendly)
        X_processed = X.copy()
        for col in categorical_columns:
            le = LabelEncoder()
            X_processed[col] = le.fit_transform(X_processed[col])
            self.categorical_mappings[col] = le
            
        self.feature_names = X_processed.columns.tolist()
        
        # Encode target variable
        y_encoded = self.label_encoder.fit_transform(y)
        self.n_classes = len(np.unique(y_encoded))
        
        print(f"Number of classes: {self.n_classes}")
        
        # Show class distribution
        unique, counts = np.unique(y_encoded, return_counts=True)
        for i, (class_idx, count) in enumerate(zip(unique, counts)):
            class_name = self.label_encoder.classes_[class_idx]
            percentage = (count / len(y_encoded)) * 100
            print(f"  {class_name}: {count} samples ({percentage:.1f}%)")
        
        # Split the data
        X_train, X_temp, y_train, y_temp = train_test_split(
            X_processed, y_encoded, test_size=test_size + val_size,
            random_state=42, stratify=y_encoded
        )
        
        val_size_adjusted = val_size / (test_size + val_size)
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=1 - val_size_adjusted,
            random_state=42, stratify=y_temp
        )
        
        print(f"Training set: {X_train.shape}")
        print(f"Validation set: {X_val.shape}")
        print(f"Test set: {X_test.shape}")
        
        # XGBoost doesn't require scaling, but we return the data as-is
        return (X_train, X_val, X_test, y_train, y_val, y_test)

    def _check_missing_values(self, df, target_column):
        """Handle missing values""" 
        cols_with_missing = df.columns[df.isnull().any()].tolist()
        if target_column in cols_with_missing:
            cols_with_missing.remove(target_column)
        
        if not cols_with_missing:
            print("No missing values to handle.")
            return df
        
        print(f"Handling missing values in columns: {cols_with_missing}")
        
        numeric_cols_missing = df[cols_with_missing].select_dtypes(include=np.number).columns
        categorical_cols_missing = df[cols_with_missing].select_dtypes(include='object').columns
        
        if len(numeric_cols_missing) > 0:
            numeric_imputer = SimpleImputer(strategy='median')
            df[numeric_cols_missing] = numeric_imputer.fit_transform(df[numeric_cols_missing])
            print(f"  Imputed numeric missing values with median.")
        
        if len(categorical_cols_missing) > 0:
            categorical_imputer = SimpleImputer(strategy='most_frequent')
            df[categorical_cols_missing] = categorical_imputer.fit_transform(df[categorical_cols_missing])
            print(f"  Imputed categorical missing values with most frequent.")
        
        return df

# XGBoost Soil Toxicity Classifier
class SoilToxicityXGBoost:
    def __init__(self, n_classes):
        self.n_classes = n_classes
        self.model = None
        self.best_params = None
        self.feature_importance = None
        
    def create_model(self, **params):
        """
        Create XGBoost classifier with default or custom parameters
        """
        default_params = {
            'objective': 'multi:softprob',
            'num_class': self.n_classes,
            'max_depth': 6,
            'learning_rate': 0.1,
            'n_estimators': 100,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'random_state': 42,
            'eval_metric': 'mlogloss'
        }
        
        # Update with any provided parameters
        default_params.update(params)
        
        self.model = XGBClassifier(**default_params)
        return self.model
    
    
    def train(self, X_train, y_train, X_val=None, y_val=None, early_stopping_rounds=50):
        """
        Train XGBoost model
        """
        print("=== TRAINING XGBOOST MODEL ===")
        
        if self.model is None:
            self.create_model()
        
        # Setup evaluation set for early stopping
        eval_set = [(X_train, y_train)]
        if X_val is not None and y_val is not None:
            eval_set.append((X_val, y_val))
        
        # Train the model
        self.model.fit(
            X_train, y_train,
            eval_set=eval_set,
            #early_stopping_rounds=early_stopping_rounds,
            verbose=True
        )

        # Save to .pkl file
        with open('xgb_model.pkl', 'wb') as f:
          pickle.dump(self.model, f)
        
        # Store feature importance
        self.feature_importance = self.model.feature_importances_
        
        return self.model
    
    def evaluate(self, X_test, y_test, processor):
        """
        Evaluate the model and generate comprehensive reports
        """
        print("=== MODEL EVALUATION ===")
        
        # Get predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Test Accuracy: {accuracy:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred,
                                  target_names=processor.label_encoder.classes_))
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=processor.label_encoder.classes_,
                   yticklabels=processor.label_encoder.classes_)
        plt.title('Confusion Matrix - XGBoost Soil Toxicity Classification')
        plt.ylabel('Actual')
        plt.xlabel('Predicted')
        plt.show()
        
        return accuracy, y_pred, y_pred_proba
    
    def plot_feature_importance(self, processor, top_n=15):
        """
        Plot feature importance
        """
        if self.feature_importance is None:
            print("Model hasn't been trained yet.")
            return
        
        # Create feature importance dataframe
        importance_df = pd.DataFrame({
            'feature': processor.feature_names,
            'importance': self.feature_importance
        }).sort_values('importance', ascending=False)
        
        # Plot top N features
        plt.figure(figsize=(10, 8))
        top_features = importance_df.head(top_n)
        sns.barplot(data=top_features, x='importance', y='feature', palette='viridis')
        plt.title(f'Top {top_n} Feature Importance - XGBoost')
        plt.xlabel('Feature Importance')
        plt.tight_layout()
        plt.show()
        
        return importance_df
    
    def cross_validate(self, X_train, y_train, cv=5):
        """
        Perform cross-validation
        """
        print("=== CROSS-VALIDATION ===")
        
        if self.model is None:
            self.create_model()
        
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=cv, scoring='accuracy')
        
        print(f"Cross-validation scores: {cv_scores}")
        print(f"Mean CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        return cv_scores
    
    def show_predictions_sample(self, X_test, y_test, y_pred_proba, processor, n_samples=10):
        """
        Show sample predictions with probabilities
        """
        print(f"\n=== SAMPLE PREDICTIONS ===")
        
        for i in range(min(n_samples, len(X_test))):
            predicted_class_idx = np.argmax(y_pred_proba[i])
            predicted_class = processor.label_encoder.classes_[predicted_class_idx]
            actual_class = processor.label_encoder.classes_[y_test[i]]
            confidence = y_pred_proba[i][predicted_class_idx]
            
            status = "✓" if predicted_class == actual_class else "✗"
            
            print(f"Sample {i+1}: {status} Predicted: {predicted_class} (conf: {confidence:.3f}), "
                  f"Actual: {actual_class}")
            
def show_predictions_real( X_test, y_pred_proba, processor, n_samples=10):
        """
        Show sample predictions with probabilities
        """
        print(f"\n=== REAL PREDICTIONS ===")
        
        #iterates through the number of predictions to be made
        for i in range(min(n_samples, len(X_test))):
            predicted_class_idx = np.argmax(y_pred_proba[i])
            predicted_class = processor.label_encoder.classes_[predicted_class_idx]
            #actual_class = processor.label_encoder.classes_[y_test[i]]
            confidence = y_pred_proba[i][predicted_class_idx]
            
            #status = "✓" if predicted_class == actual_class else "✗"
            
            print(f"Predicted: {predicted_class} (conf: {confidence:.3f}), ")
            return predicted_class, confidence

# MAIN EXECUTION
if __name__ == "__main__":
    # Initialize processor
    processor = XGBoostSoilDataProcessor()
    
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
    
    # Show feature importance
    importance_df = xgb_model.plot_feature_importance(processor)
    
    # Cross-validation
    cv_scores = xgb_model.cross_validate(X_train, y_train)
    
    # Show sample predictions
    xgb_model.show_predictions_sample(X_test, y_test, y_pred_proba, processor)
    
    