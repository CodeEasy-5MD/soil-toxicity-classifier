import React, { useState, useEffect } from 'react';

const Recommendations = () => {
  const [selectedToxicity, setSelectedToxicity] = useState('Medium');

  // Function to get URL parameter
  const getURLParameter = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  // Effect to set initial toxicity level from URL parameter
  useEffect(() => {
    const levelFromURL = getURLParameter('level');
    if (levelFromURL) {
      const formattedLevel = levelFromURL.charAt(0).toUpperCase() + levelFromURL.slice(1);
      if (recommendationsData[formattedLevel]) {
        setSelectedToxicity(formattedLevel);
      }
    }
  }, []);

  // Recommendations data structure
  const recommendationsData = {
    Low: {
      status: 'Safe',
      statusColor: 'status-safe',
      icon: '✅',
      description: 'Soil conditions are within acceptable limits. Focus on preventive measures and maintenance.',
      recommendations: {
        immediate: [
          'Continue current land management practices',
          'Maintain organic matter levels through composting',
          'Monitor for any changes in soil conditions'
        ],
        longTerm: [
          'Implement crop rotation to maintain soil health',
          'Add organic amendments annually',
          'Consider cover cropping during off-seasons'
        ],
        safety: [
          'Standard agricultural safety practices apply',
          'No special protective equipment required',
          'Safe for all intended land uses'
        ],
        monitoring: [
          'Annual soil testing recommended',
          'Monitor organic matter and pH levels',
          'Track beneficial organism populations'
        ]
      },
      timeline: [
        'Month 1: Continue current practices',
        'Month 3: Add organic amendments',
        'Month 6: Mid-year soil assessment',
        'Month 12: Annual comprehensive testing'
      ]
    },
    Medium: {
      status: 'Caution',
      statusColor: 'status-caution',
      icon: '⚠️',
      description: 'Moderate contamination detected. Remediation recommended to prevent degradation.',
      recommendations: {
        immediate: [
          'Restrict sensitive crop cultivation',
          'Implement soil pH buffering',
          'Begin organic matter enhancement program'
        ],
        longTerm: [
          'Phytoremediation with hyperaccumulator plants',
          'Soil amendment with biochar and compost',
          'Consider bioremediation techniques'
        ],
        safety: [
          'Use protective equipment during soil handling',
          'Avoid dust generation during cultivation',
          'Test harvested crops for contaminant uptake'
        ],
        monitoring: [
          'Quarterly soil testing required',
          'Monitor plant tissue for contaminant levels',
          'Track remediation progress indicators'
        ]
      },
      timeline: [
        'Month 1: Implement immediate restrictions',
        'Month 2: Begin amendment program',
        'Month 6: First remediation assessment',
        'Month 12: Evaluate treatment effectiveness'
      ]
    },
    High: {
      status: 'Warning',
      statusColor: 'status-warning',
      icon: '🚨',
      description: 'Significant contamination present. Active remediation required before safe use.',
      recommendations: {
        immediate: [
          'Suspend all agricultural activities',
          'Prevent public access to contaminated areas',
          'Contact environmental remediation specialists'
        ],
        longTerm: [
          'Professional soil remediation required',
          'Consider soil excavation and replacement',
          'Implement containment measures'
        ],
        safety: [
          'Full protective equipment mandatory',
          'No direct contact with contaminated soil',
          'Restrict access to authorized personnel only'
        ],
        monitoring: [
          'Monthly professional soil testing',
          'Groundwater monitoring required',
          'Air quality assessment in work areas'
        ]
      },
      timeline: [
        'Week 1: Immediate area restriction',
        'Month 1: Professional assessment',
        'Month 3: Begin remediation program',
        'Month 18-24: Complete treatment cycle'
      ]
    },
    Critical: {
      status: 'Danger',
      statusColor: 'status-danger',
      icon: '☢️',
      description: 'Severe contamination detected. Emergency remediation and containment required.',
      recommendations: {
        immediate: [
          'Emergency site containment required',
          'Notify environmental authorities',
          'Evacuate affected areas immediately'
        ],
        longTerm: [
          'Professional hazardous waste remediation',
          'Possible soil excavation and disposal',
          'Long-term site monitoring program'
        ],
        safety: [
          'Hazmat protocols must be followed',
          'No unauthorized personnel access',
          'Continuous air and water monitoring'
        ],
        monitoring: [
          'Weekly professional monitoring',
          'Continuous environmental surveillance',
          'Regular health assessments for exposed individuals'
        ]
      },
      timeline: [
        'Day 1: Emergency containment',
        'Week 1: Professional hazmat assessment',
        'Month 1: Begin emergency remediation',
        'Year 2-5: Long-term treatment and monitoring'
      ]
    }
  };

  const currentData = recommendationsData[selectedToxicity];

  const renderRecommendationSection = (title, recommendations, priority) => (
    <div className={`recommendation-section ${priority}`}>
      <h4 className="section-header">
        {title}
      </h4>
      <ul className="recommendation-list">
        {recommendations.map((item, index) => (
          <li key={index} className="recommendation-item">{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%);
          min-height: 100vh;
          color: #374151;
          line-height: 1.6;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .leaf-icon {
          color: #16a34a;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #6b7280;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .back-btn:hover {
          background: #e5e7eb;
        }

        .toxicity-selector {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .selector-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .toxicity-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .toxicity-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          border: 2px solid;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .toxicity-low {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }

        .toxicity-low:hover {
          background: #dcfce7;
          border-color: #86efac;
          transform: scale(1.02);
        }

        .toxicity-low.active {
          background: #16a34a;
          color: white;
          border-color: #16a34a;
          transform: scale(1.05);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .toxicity-medium {
          background: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        }

        .toxicity-medium:hover {
          background: #fef3c7;
          border-color: #fbbf24;
          transform: scale(1.02);
        }

        .toxicity-medium.active {
          background: #d97706;
          color: white;
          border-color: #d97706;
          transform: scale(1.05);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .toxicity-high {
          background: #fff7ed;
          color: #c2410c;
          border-color: #fed7aa;
        }

        .toxicity-high:hover {
          background: #ffedd5;
          border-color: #fb923c;
          transform: scale(1.02);
        }

        .toxicity-high.active {
          background: #ea580c;
          color: white;
          border-color: #ea580c;
          transform: scale(1.05);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .toxicity-critical {
          background: #fef2f2;
          color: #991b1b;
          border-color: #fecaca;
        }

        .toxicity-critical:hover {
          background: #fee2e2;
          border-color: #f87171;
          transform: scale(1.02);
        }

        .toxicity-critical.active {
          background: #dc2626;
          color: white;
          border-color: #dc2626;
          transform: scale(1.05);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .recommendations-card {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .card-header {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
        }

        .status-safe { background: #16a34a; }
        .status-caution { background: #eab308; }
        .status-warning { background: #ea580c; }
        .status-danger { background: #dc2626; }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .card-description {
          color: #6b7280;
          font-size: 1.125rem;
        }

        .card-content {
          padding: 1.5rem;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 1024px) {
          .recommendations-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .recommendation-section {
          background: white;
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .recommendation-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
        }

        .priority-high {
          border-left: 4px solid #ef4444;
        }

        .priority-medium {
          border-left: 4px solid #f59e0b;
        }

        .priority-low {
          border-left: 4px solid #10b981;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .recommendation-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .recommendation-item {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
          color: #4b5563;
          position: relative;
          padding-left: 1.25rem;
        }

        .recommendation-item:before {
          content: '•';
          color: #6b7280;
          position: absolute;
          left: 0;
        }

        .recommendation-item:last-child {
          border-bottom: none;
        }

        .timeline-section {
          background: #f9fafb;
          border-radius: 0.5rem;
          padding: 1.5rem;
        }

        .timeline-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .timeline-title .clock-icon {
          color: #2563eb;
        }

        .timeline-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .timeline-dot {
          width: 0.75rem;
          height: 0.75rem;
          background: #2563eb;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .timeline-text {
          color: #374151;
        }

        footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .title {
            font-size: 2rem;
          }

          .toxicity-buttons {
            flex-direction: column;
            align-items: center;
          }

          .toxicity-btn {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1 className="title">
            Soil Remediation Recommendations
          </h1>
          <p className="subtitle">Evidence-based strategies for soil health management</p>
        </div>

        <button className="back-btn" onClick={() => window.history.back()}>
          ← Back to Prediction
        </button>

        <div className="toxicity-selector">
          <h3 className="selector-title">Select Toxicity Level for Recommendations:</h3>
          <div className="toxicity-buttons">
            {Object.keys(recommendationsData).map(level => (
              <button
                key={level}
                className={`toxicity-btn toxicity-${level.toLowerCase()} ${selectedToxicity === level ? 'active' : ''}`}
                onClick={() => setSelectedToxicity(level)}
              >
                {level} Risk
              </button>
            ))}
          </div>
        </div>

        <div className="recommendations-card">
          <div className="card-header">
            <div className={`status-badge ${currentData.statusColor}`}>
              <span style={{ fontSize: '1.125rem' }}>{currentData.icon}</span>
              {currentData.status}
            </div>
            <h2 className="card-title">
              Recommendations for {selectedToxicity} Toxicity Level
            </h2>
            <p className="card-description">{currentData.description}</p>
          </div>

          <div className="card-content">
            <div className="recommendations-grid">
              {renderRecommendationSection(
                'Immediate Actions',
                currentData.recommendations.immediate,
                'priority-high'
              )}
              
              {renderRecommendationSection(
                'Long-term Remediation',
                currentData.recommendations.longTerm,
                'priority-medium'
              )}
              
              {renderRecommendationSection(
                'Safety Precautions',
                currentData.recommendations.safety,
                'priority-high'
              )}
              
              {renderRecommendationSection(
                'Monitoring Protocol',
                currentData.recommendations.monitoring,
                'priority-low'
              )}
            </div>

            <div className="timeline-section">
              <h4 className="timeline-title">
                Recommended Timeline
              </h4>
              <div className="timeline-items">
                {currentData.timeline.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <span className="timeline-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer>
          <p>Consult with environmental professionals for site-specific guidance</p>
        </footer>
      </div>
    </>
  );
};

export default Recommendations;
