import React, { useState } from 'react';
import { Zap, Download, Share2, RotateCcw, Upload, FileText, AlertCircle } from 'lucide-react';

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
  aiResponse?: string;
}

interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
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
  const [apiKey, setApiKey] = useState<string>('');
  
  // Check if we have an API key
  const hasValidAPIKey = apiKey && apiKey.startsWith('sk-');

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

    if (!hasValidAPIKey) {
      setError('Please enter a valid OpenAI API key starting with "sk-"');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Real API mode - call ChatGPT
      const designPrompt = createDesignPrompt();
      const aiResponse = await callChatGPTAPI(designPrompt, apiKey);
      
      // Try to generate a DALL-E mockup
      let mockupUrl = '';
      try {
        console.log('Starting DALL-E generation...');
        mockupUrl = await generateDALLEMockup(formData.title, formData.description, apiKey);
        console.log('DALL-E generation successful:', mockupUrl);
      } catch (dalleError: any) {
        console.error('DALL-E generation failed:', dalleError);
        // Don't fail the entire process, just continue without the image
        setError(`Design generated successfully, but image creation failed: ${dalleError.message}. You can still download the HTML design.`);
      }
      
      const newDesign: GeneratedDesign = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        designCode: generateDesignCode(aiResponse, formData),
        timestamp: new Date(),
        aiResponse: aiResponse,
        previewUrl: mockupUrl
      };

      setGeneratedDesign(newDesign);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to generate design. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createDesignPrompt = (): string => {
    return `You are a professional UI/UX designer specializing in banking and financial applications. 

Based on the following requirements, generate a detailed design specification for a high-fidelity banking interface:

**Design Title:** ${formData.title}
**Design Type:** ${formData.designType}
**Target Audience:** ${formData.targetAudience}
**Main Content:** ${formData.bodyCopy}
**Detailed Description:** ${formData.description}

Please provide:
1. A detailed layout structure with specific component recommendations
2. Color scheme suggestions that align with professional banking aesthetics
3. Typography hierarchy and sizing recommendations
4. Specific UI components and their placement
5. User interaction patterns and flow
6. Accessibility considerations
7. Mobile responsiveness guidelines

Focus on creating a design that conveys trust, security, and professionalism while maintaining excellent usability. The design should follow modern banking UI/UX best practices.`;
  };

  const callChatGPTAPI = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert UI/UX designer specializing in banking applications. Provide detailed, actionable design specifications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else {
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }
    }

    const data: ChatGPTResponse = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI';
  };

  const generateDALLEMockup = async (title: string, description: string, apiKey: string): Promise<string> => {
    console.log('Starting DALL-E image generation...');
    console.log('Using updated DALL-E API format (no invalid parameters)');
    
    let dallePrompt = `Create a high-fidelity, realistic UI mockup for a mobile banking application called "${title}". 

Requirements: ${description}

Style: Modern, professional banking interface with clean design, proper spacing, realistic UI elements like buttons, forms, cards, and navigation. Use a light color scheme with blue accents (#1E3A8A), professional typography, and realistic banking app components.

Make it look like a real, functional mobile banking application screenshot with:
- Clean, modern interface design
- Professional banking color scheme
- Realistic UI components (buttons, forms, cards)
- Proper spacing and typography
- Mobile app layout and proportions
- Banking-specific elements (account info, balances, transactions)

The image should look like a professional mobile banking app screenshot that could be used in a real application.`;

    // DALL-E has a 1000 character limit for prompts
    if (dallePrompt.length > 1000) {
      dallePrompt = dallePrompt.substring(0, 997) + '...';
      console.log('DALL-E prompt was too long, trimmed to:', dallePrompt.length, 'characters');
    }
    
    console.log('DALL-E Prompt:', dallePrompt);
    console.log('DALL-E Prompt Length:', dallePrompt.length, 'characters');
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: dallePrompt,
          n: 1,
          size: '1024x1024'
        })
      });

      console.log('DALL-E Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('DALL-E API Error:', errorData);
        console.error('DALL-E Response Status:', response.status);
        console.error('DALL-E Response Headers:', response.headers);
        throw new Error(`DALL-E Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('DALL-E Response Data:', data);
      
      const imageUrl = data.data[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }
      
      console.log('DALL-E Image URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('DALL-E Generation Error:', error);
      throw error;
    }
  };

  const generateDesignCode = (aiResponse: string, formData: DesignForm): string => {
    // Extract key design elements from AI response
    const hasCards = aiResponse.toLowerCase().includes('card') || aiResponse.toLowerCase().includes('grid');
    const hasNavigation = aiResponse.toLowerCase().includes('navigation') || aiResponse.toLowerCase().includes('menu');
    const hasForms = aiResponse.toLowerCase().includes('form') || aiResponse.toLowerCase().includes('input');
    
    return `
      <!-- Generated by BCU Design Studio with AI -->
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${formData.title}</title>
          <style>
              :root {
                  --bcu-primary: #1E3A8A;
                  --bcu-primary-light: #3B82F6;
                  --bcu-secondary: #10B981;
                  --bcu-white: #FFFFFF;
                  --bcu-gray-50: #F9FAFB;
                  --bcu-gray-200: #E5E7EB;
                  --bcu-gray-600: #4B5563;
                  --bcu-gray-900: #111827;
              }
              
              * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
              }
              
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, var(--bcu-gray-50) 0%, var(--bcu-white) 100%);
                  color: var(--bcu-gray-900);
                  line-height: 1.6;
              }
              
              .bcu-container {
                  max-width: 1200px;
                  margin: 0 auto;
                  padding: 20px;
              }
              
              .bcu-header {
                  background: var(--bcu-primary);
                  color: var(--bcu-white);
                  padding: 2rem;
                  border-radius: 12px;
                  margin-bottom: 2rem;
                  text-align: center;
              }
              
              .bcu-header h1 {
                  font-size: 2.5rem;
                  margin-bottom: 1rem;
              }
              
              .bcu-header p {
                  font-size: 1.2rem;
                  opacity: 0.9;
              }
              
              .bcu-main-content {
                  display: grid;
                  gap: 2rem;
                  margin-bottom: 2rem;
              }
              
              ${hasCards ? `
              .bcu-card-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                  gap: 1.5rem;
              }
              
              .bcu-card {
                  background: var(--bcu-white);
                  padding: 2rem;
                  border-radius: 12px;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  border: 1px solid var(--bcu-gray-200);
              }
              
              .bcu-card h3 {
                  color: var(--bcu-primary);
                  margin-bottom: 1rem;
                  font-size: 1.5rem;
              }
              ` : ''}
              
              ${hasNavigation ? `
              .bcu-navigation {
                  background: var(--bcu-white);
                  padding: 1rem;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  margin-bottom: 2rem;
              }
              
              .bcu-nav-list {
                  display: flex;
                  list-style: none;
                  gap: 2rem;
                  justify-content: center;
              }
              
              .bcu-nav-item a {
                  color: var(--bcu-primary);
                  text-decoration: none;
                  font-weight: 500;
                  padding: 0.5rem 1rem;
                  border-radius: 6px;
                  transition: background-color 0.2s;
              }
              
              .bcu-nav-item a:hover {
                  background: var(--bcu-gray-50);
              }
              ` : ''}
              
              ${hasForms ? `
              .bcu-form {
                  background: var(--bcu-white);
                  padding: 2rem;
                  border-radius: 12px;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              
              .bcu-form-group {
                  margin-bottom: 1.5rem;
              }
              
              .bcu-label {
                  display: block;
                  margin-bottom: 0.5rem;
                  font-weight: 600;
                  color: var(--bcu-gray-700);
              }
              
              .bcu-input {
                  width: 100%;
                  padding: 0.75rem;
                  border: 2px solid var(--bcu-gray-200);
                  border-radius: 8px;
                  font-size: 1rem;
                  transition: border-color 0.2s;
              }
              
              .bcu-input:focus {
                  outline: none;
                  border-color: var(--bcu-primary);
              }
              
              .bcu-button {
                  background: var(--bcu-primary);
                  color: var(--bcu-white);
                  padding: 0.75rem 1.5rem;
                  border: none;
                  border-radius: 8px;
                  font-size: 1rem;
                  font-weight: 600;
                  cursor: pointer;
                  transition: background-color 0.2s;
              }
              
              .bcu-button:hover {
                  background: var(--bcu-primary-light);
              }
              ` : ''}
              
              .bcu-ai-insights {
                  background: var(--bcu-gray-50);
                  padding: 2rem;
                  border-radius: 12px;
                  border-left: 4px solid var(--bcu-secondary);
                  margin-top: 2rem;
              }
              
              .bcu-ai-insights h3 {
                  color: var(--bcu-secondary);
                  margin-bottom: 1rem;
              }
              
              .bcu-ai-insights pre {
                  background: var(--bcu-white);
                  padding: 1rem;
                  border-radius: 8px;
                  overflow-x: auto;
                  white-space: pre-wrap;
                  font-size: 0.9rem;
                  line-height: 1.5;
              }
              
              @media (max-width: 768px) {
                  .bcu-container {
                      padding: 15px;
                  }
                  
                  .bcu-header h1 {
                      font-size: 2rem;
                  }
                  
                  .bcu-card-grid {
                      grid-template-columns: 1fr;
                  }
                  
                  .bcu-nav-list {
                      flex-direction: column;
                      gap: 1rem;
                  }
              }
          </style>
      </head>
      <body>
          <div class="bcu-container">
              <header class="bcu-header">
                  <h1>${formData.title}</h1>
                  <p>${formData.bodyCopy || 'Professional banking interface designed with AI assistance'}</p>
              </header>
              
              <main class="bcu-main-content">
                  ${hasNavigation ? `
                  <nav class="bcu-navigation">
                      <ul class="bcu-nav-list">
                          <li class="bcu-nav-item"><a href="#overview">Overview</a></li>
                          <li class="bcu-nav-item"><a href="#accounts">Accounts</a></li>
                          <li class="bcu-nav-item"><a href="#transactions">Transactions</a></li>
                          <li class="bcu-nav-item"><a href="#settings">Settings</a></li>
                      </ul>
                  </nav>
                  ` : ''}
                  
                  ${hasCards ? `
                  <div class="bcu-card-grid">
                      <div class="bcu-card">
                          <h3>Account Overview</h3>
                          <p>Manage your finances with ease and security</p>
                      </div>
                      <div class="bcu-card">
                          <h3>Quick Actions</h3>
                          <p>Transfer funds, pay bills, and more</p>
                      </div>
                      <div class="bcu-card">
                          <h3>Financial Insights</h3>
                          <p>Track your spending and savings goals</p>
                      </div>
                  </div>
                  ` : ''}
                  
                  ${hasForms ? `
                  <div class="bcu-form">
                      <h3>Quick Transfer</h3>
                      <form>
                          <div class="bcu-form-group">
                              <label class="bcu-label">From Account</label>
                              <select class="bcu-input">
                                  <option>Checking Account</option>
                                  <option>Savings Account</option>
                              </select>
                          </div>
                          <div class="bcu-form-group">
                              <label class="bcu-label">To Account</label>
                              <input type="text" class="bcu-input" placeholder="Enter account number">
                          </div>
                          <div class="bcu-form-group">
                              <label class="bcu-label">Amount</label>
                              <input type="number" class="bcu-input" placeholder="0.00">
                          </div>
                          <button type="submit" class="bcu-button">Transfer Funds</button>
                      </form>
                  </div>
                  ` : ''}
              </main>
              
              <div class="bcu-ai-insights">
                  <h3>AI Design Recommendations</h3>
                  <pre>${aiResponse}</pre>
              </div>
          </div>
      </body>
      </html>
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

          <div className="bcu-form-group">
            <label className="bcu-label" htmlFor="apiKey">
              OpenAI API Key * <span style={{ color: 'var(--bcu-error)' }}>(Required for AI generation)</span>
            </label>
            <input
              type="password"
              id="apiKey"
              className="bcu-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              required
            />
            <p className="bcu-text-gray" style={{ fontSize: 'var(--bcu-font-size-sm)', marginTop: 'var(--bcu-spacing-2)' }}>
              Your API key is stored locally and never sent to our servers. Get your key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" 
                 style={{ color: 'var(--bcu-primary)' }}>
                OpenAI Platform
              </a>
            </p>
          </div>

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
              marginBottom: 'var(--bcu-spacing-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--bcu-spacing-2)'
            }}>
              <AlertCircle size={20} />
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
              This may take a few moments. ChatGPT is analyzing your requirements and DALL-E is creating a visual mockup.
            </p>
            <div style={{ 
              backgroundColor: 'var(--bcu-primary)', 
              color: 'white', 
              padding: 'var(--bcu-spacing-3)', 
              borderRadius: 'var(--bcu-radius-md)',
              marginTop: 'var(--bcu-spacing-4)',
              fontSize: 'var(--bcu-font-size-sm)',
              textAlign: 'center'
            }}>
              🔄 <strong>Processing:</strong> ChatGPT → Design Specs → DALL-E → Visual Mockup
            </div>
          </div>
        )}

        {generatedDesign && !isGenerating && (
          <div className="bcu-preview-container">
            <div className="bcu-generated-design">
              <h3>Generated Design: {generatedDesign.title}</h3>
              <p className="bcu-text-gray" style={{ marginBottom: 'var(--bcu-spacing-4)' }}>
                {generatedDesign.description}
              </p>
              
              {generatedDesign.previewUrl && (
                <div className="bcu-design-preview" style={{ 
                  backgroundColor: 'var(--bcu-white)', 
                  padding: 'var(--bcu-spacing-6)', 
                  borderRadius: 'var(--bcu-radius-md)',
                  border: '1px solid var(--bcu-gray-200)',
                  marginBottom: 'var(--bcu-spacing-6)'
                }}>
                  <h4 style={{ color: 'var(--bcu-primary)', marginBottom: 'var(--bcu-spacing-4)' }}>
                    🎨 AI-Generated Visual Mockup
                  </h4>
                  <img 
                    src={generatedDesign.previewUrl} 
                    alt="AI-generated design mockup"
                    style={{
                      width: '100%',
                      maxWidth: '600px',
                      height: 'auto',
                      borderRadius: 'var(--bcu-radius-md)',
                      boxShadow: 'var(--bcu-shadow-md)'
                    }}
                  />
                  <p className="bcu-text-gray" style={{ 
                    fontSize: 'var(--bcu-font-size-sm)', 
                    marginTop: 'var(--bcu-spacing-3)',
                    textAlign: 'center'
                  }}>
                    Generated by DALL-E AI
                  </p>
                </div>
              )}
              
              <div className="bcu-design-preview" style={{ 
                backgroundColor: 'var(--bcu-white)', 
                padding: 'var(--bcu-spacing-6)', 
                borderRadius: 'var(--bcu-radius-md)',
                border: '1px solid var(--bcu-gray-200)',
                marginBottom: 'var(--bcu-spacing-6)'
              }}>
                <h4 style={{ color: 'var(--bcu-primary)', marginBottom: 'var(--bcu-spacing-4)' }}>
                  AI Design Recommendations
                </h4>
                <div style={{ 
                  backgroundColor: 'var(--bcu-gray-50)', 
                  padding: 'var(--bcu-spacing-4)', 
                  borderRadius: 'var(--bcu-radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: 'var(--bcu-font-size-sm)',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {generatedDesign.aiResponse}
                </div>
              </div>

              <div className="bcu-design-preview" style={{ 
                backgroundColor: 'var(--bcu-white)', 
                padding: 'var(--bcu-spacing-6)', 
                borderRadius: 'var(--bcu-radius-md)',
                border: '1px solid var(--bcu-gray-200)',
                marginBottom: 'var(--bcu-spacing-6)'
              }}>
                <h4 style={{ color: 'var(--bcu-primary)', marginBottom: 'var(--bcu-spacing-4)' }}>
                  Generated HTML Code
                </h4>
                <div style={{ 
                  backgroundColor: 'var(--bcu-gray-50)', 
                  padding: 'var(--bcu-spacing-4)', 
                  borderRadius: 'var(--bcu-radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: 'var(--bcu-font-size-sm)',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {generatedDesign.designCode.substring(0, 500)}...
                  <br />
                  <em style={{ color: 'var(--bcu-gray-500)' }}>
                    (HTML code truncated for preview. Download to see full code.)
                  </em>
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
                Enter your OpenAI API key above, fill out the form, and click "Generate Design" to create your high-fidelity banking interface.
                Our AI will analyze your requirements and produce a professional design with HTML code and visual mockups.
              </p>
              <div style={{ 
                backgroundColor: 'var(--bcu-primary)', 
                color: 'white', 
                padding: 'var(--bcu-spacing-3)', 
                borderRadius: 'var(--bcu-radius-md)',
                marginTop: 'var(--bcu-spacing-4)',
                fontSize: 'var(--bcu-font-size-sm)'
              }}>
                🚀 <strong>Real AI Integration</strong> - Uses ChatGPT for design specs and DALL-E for visual mockups
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignGenerator;
