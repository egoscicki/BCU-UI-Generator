import React, { useState } from 'react';
import { Zap, Download, Share2, RotateCcw, Upload, FileText } from 'lucide-react';

interface DesignForm {
  title: string;
  bodyCopy: string;
  description: string;
  wireframeImage?: File;
  designType: string;
  targetAudience: string;
}

interface GeneratedDesign {
  id: string;
  title: string;
  description: string;
  designCode: string;
  previewUrl?: string;
  timestamp: Date;
}

const DesignGenerator: React.FC = () => {
  const [formData, setFormData] = useState<DesignForm>({
    title: '',
    bodyCopy: '',
    description: '',
    designType: 'banking-interface',
    targetAudience: 'general-users'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        wireframeImage: file
      }));
    }
  };

  const generateDesign = async () => {
    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // This would be replaced with actual ChatGPT API call
      // For now, we'll simulate the API response
      await simulateChatGPTCall();
      
      const newDesign: GeneratedDesign = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        designCode: generateMockDesignCode(),
        timestamp: new Date()
      };

      setGeneratedDesign(newDesign);
    } catch (err) {
      setError('Failed to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateChatGPTCall = (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000); // Simulate 3 second API call
    });
  };

  const generateMockDesignCode = (): string => {
    return `
      <div class="bcu-banking-interface">
        <header class="bcu-header">
          <h1>${formData.title}</h1>
          <p>${formData.bodyCopy}</p>
        </header>
        
        <main class="bcu-main-content">
          <div class="bcu-card-grid">
            <div class="bcu-card">
              <h3>Account Overview</h3>
              <p>Manage your finances with ease</p>
            </div>
            <div class="bcu-card">
              <h3>Quick Actions</h3>
              <p>Transfer, pay bills, and more</p>
            </div>
          </div>
        </main>
      </div>
    `;
  };

  const downloadDesign = () => {
    if (!generatedDesign) return;
    
    const element = document.createElement('a');
    const file = new Blob([generatedDesign.designCode], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${generatedDesign.title.toLowerCase().replace(/\s+/g, '-')}-design.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareDesign = () => {
    if (!generatedDesign) return;
    
    if (navigator.share) {
      navigator.share({
        title: generatedDesign.title,
        text: generatedDesign.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      bodyCopy: '',
      description: '',
      designType: 'banking-interface',
      targetAudience: 'general-users'
    });
    setGeneratedDesign(null);
    setError(null);
  };

  return (
    <div className="bcu-page">
      <div className="bcu-page-header">
        <h1 className="bcu-page-title">Design Generator</h1>
        <p className="bcu-page-subtitle">
          Transform your wireframes and descriptions into high-fidelity banking interfaces using AI
        </p>
      </div>

      <div className="bcu-design-form">
        <div className="bcu-card">
          <h2 className="bcu-text-primary" style={{ marginBottom: 'var(--bcu-spacing-6)' }}>
            Design Requirements
          </h2>

          <div className="bcu-form-row">
            <div className="bcu-form-group">
              <label className="bcu-label" htmlFor="title">Design Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="bcu-input"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Mobile Banking Dashboard"
                required
              />
            </div>

            <div className="bcu-form-group">
              <label className="bcu-label" htmlFor="designType">Design Type</label>
              <select
                id="designType"
                name="designType"
                className="bcu-input"
                value={formData.designType}
                onChange={handleInputChange}
              >
                <option value="banking-interface">Banking Interface</option>
                <option value="mobile-app">Mobile App</option>
                <option value="dashboard">Dashboard</option>
                <option value="form">Form/Input</option>
                <option value="landing-page">Landing Page</option>
              </select>
            </div>
          </div>

          <div className="bcu-form-row">
            <div className="bcu-form-group">
              <label className="bcu-label" htmlFor="targetAudience">Target Audience</label>
              <select
                id="targetAudience"
                name="targetAudience"
                className="bcu-input"
                value={formData.targetAudience}
                onChange={handleInputChange}
              >
                <option value="general-users">General Users</option>
                <option value="business-users">Business Users</option>
                <option value="seniors">Senior Citizens</option>
                <option value="young-professionals">Young Professionals</option>
                <option value="students">Students</option>
              </select>
            </div>

            <div className="bcu-form-group">
              <label className="bcu-label" htmlFor="wireframeImage">Wireframe Image (Optional)</label>
              <label className="bcu-button bcu-button-outline" style={{ width: '100%', justifyContent: 'center' }}>
                <Upload size={20} />
                Choose File
                <input
                  type="file"
                  id="wireframeImage"
                  name="wireframeImage"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {formData.wireframeImage && (
                <p className="bcu-text-gray" style={{ marginTop: 'var(--bcu-spacing-2)', fontSize: 'var(--bcu-font-size-sm)' }}>
                  Selected: {formData.wireframeImage.name}
                </p>
              )}
            </div>
          </div>

          <div className="bcu-form-row full-width">
            <div className="bcu-form-group">
              <label className="bcu-label" htmlFor="bodyCopy">Main Content/Copy</label>
              <textarea
                id="bodyCopy"
                name="bodyCopy"
                className="bcu-input bcu-textarea"
                value={formData.bodyCopy}
                onChange={handleInputChange}
                placeholder="Enter the main text content for your design..."
              />
            </div>
          </div>

          <div className="bcu-form-row full-width">
            <div className="bcu-form-group">
              <label className="bcu-label" htmlFor="description">Detailed Description *</label>
              <textarea
                id="description"
                name="description"
                className="bcu-input bcu-textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your design vision, layout preferences, color schemes, and any specific requirements..."
                required
              />
            </div>
          </div>

          {error && (
            <div className="bcu-error" style={{ 
              color: 'var(--bcu-error)', 
              backgroundColor: 'rgba(220, 38, 38, 0.1)', 
              padding: 'var(--bcu-spacing-3)', 
              borderRadius: 'var(--bcu-radius-md)',
              marginBottom: 'var(--bcu-spacing-4)'
            }}>
              {error}
            </div>
          )}

          <div className="bcu-form-actions" style={{ display: 'flex', gap: 'var(--bcu-spacing-4)', justifyContent: 'center' }}>
            <button className="bcu-button bcu-button-outline" onClick={resetForm}>
              <RotateCcw size={20} />
              Reset
            </button>
            <button 
              className="bcu-button bcu-button-primary" 
              onClick={generateDesign}
              disabled={isGenerating}
            >
              <Zap size={20} />
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </button>
          </div>
        </div>

        {isGenerating && (
          <div className="bcu-preview-container">
            <div className="bcu-loading">
              <div className="bcu-loading-spinner"></div>
              <span>AI is generating your design...</span>
            </div>
            <p className="bcu-text-gray" style={{ textAlign: 'center', marginTop: 'var(--bcu-spacing-4)' }}>
              This may take a few moments. Our AI is analyzing your requirements and creating a high-fidelity design.
            </p>
          </div>
        )}

        {generatedDesign && !isGenerating && (
          <div className="bcu-preview-container">
            <div className="bcu-generated-design">
              <h3>Generated Design: {generatedDesign.title}</h3>
              <p className="bcu-text-gray" style={{ marginBottom: 'var(--bcu-spacing-4)' }}>
                {generatedDesign.description}
              </p>
              
              <div className="bcu-design-preview" style={{ 
                backgroundColor: 'var(--bcu-white)', 
                padding: 'var(--bcu-spacing-6)', 
                borderRadius: 'var(--bcu-radius-md)',
                border: '1px solid var(--bcu-gray-200)',
                marginBottom: 'var(--bcu-spacing-6)'
              }}>
                <h4 style={{ color: 'var(--bcu-primary)', marginBottom: 'var(--bcu-spacing-4)' }}>
                  Design Preview
                </h4>
                <div style={{ 
                  backgroundColor: 'var(--bcu-gray-50)', 
                  padding: 'var(--bcu-spacing-4)', 
                  borderRadius: 'var(--bcu-radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: 'var(--bcu-font-size-sm)',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto'
                }}>
                  {generatedDesign.designCode}
                </div>
              </div>

              <div className="bcu-design-actions">
                <button className="bcu-button bcu-button-primary" onClick={downloadDesign}>
                  <Download size={20} />
                  Download HTML
                </button>
                <button className="bcu-button bcu-button-outline" onClick={shareDesign}>
                  <Share2 size={20} />
                  Share Design
                </button>
                <button className="bcu-button bcu-button-outline" onClick={resetForm}>
                  <RotateCcw size={20} />
                  Generate New
                </button>
              </div>
            </div>
          </div>
        )}

        {!isGenerating && !generatedDesign && (
          <div className="bcu-preview-container">
            <div className="bcu-preview-placeholder">
              <FileText size={64} style={{ color: 'var(--bcu-gray-400)', marginBottom: 'var(--bcu-spacing-4)' }} />
              <h3>Ready to Generate Your Design</h3>
              <p className="bcu-text-gray">
                Fill out the form above and click "Generate Design" to create your high-fidelity banking interface.
                Our AI will analyze your requirements and wireframe to produce a professional design.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignGenerator;
