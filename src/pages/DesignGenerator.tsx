import React, { useState, useEffect } from 'react';
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
  timestamp: Date;
  aiResponse?: string;
  previewUrl?: string;
  uiAssets?: {
    icons?: string[];
    background?: string;
  };
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
  const [apiKey, setApiKey] = useState<string>(''); // State for API key input
  const [wireframeData, setWireframeData] = useState<any>(null); // State for wireframe data
  
  const hasValidAPIKey = apiKey && apiKey.startsWith('sk-');

  // Load wireframe data from localStorage if available
  useEffect(() => {
    const savedWireframe = localStorage.getItem('bcu-wireframe-data');
    if (savedWireframe) {
      try {
        const data = JSON.parse(savedWireframe);
        setWireframeData(data);
      } catch (error) {
        console.error('Failed to load wireframe data:', error);
      }
    }
  }, []);

  const loadWireframeData = () => {
    const savedWireframe = localStorage.getItem('bcu-wireframe-data');
    if (savedWireframe) {
      try {
        const data = JSON.parse(savedWireframe);
        setWireframeData(data);
        alert('Wireframe loaded successfully! The AI will now use your wireframe as a guide.');
      } catch (error) {
        setError('Failed to load wireframe data. Please try again.');
      }
    } else {
      setError('No wireframe data found. Please create a wireframe first in the Wireframe Editor.');
    }
  };

  const clearWireframeData = () => {
    setWireframeData(null);
    localStorage.removeItem('bcu-wireframe-data');
  };

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
      // Generate design specifications with ChatGPT
      const designPrompt = createDesignPrompt();
      const aiResponse = await callChatGPTAPI(designPrompt, apiKey);
      
      // Generate UI assets with DALL-E (icons, backgrounds, etc.)
      let uiAssets = {};
      try {
        uiAssets = await generateUIAssets(formData.title, formData.description, apiKey);
      } catch (dalleError) {
        console.log('DALL-E asset generation failed, continuing with default assets');
      }
      
      // Generate the actual HTML prototype
      const htmlPrototype = await generateHTMLPrototype(aiResponse, formData, uiAssets);
      
      const newDesign: GeneratedDesign = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        designCode: htmlPrototype,
        timestamp: new Date(),
        aiResponse: aiResponse,
        previewUrl: undefined, // We'll show live HTML preview instead
        uiAssets: uiAssets
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
    let prompt = `You are a professional UI/UX designer specializing in banking and financial applications. 

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

    if (wireframeData) {
      prompt += `\n\n**Wireframe Information:**\n`;
      prompt += `- Wireframe Title: ${wireframeData.title || 'N/A'}\n`;
      prompt += `- Wireframe Description: ${wireframeData.description || 'N/A'}\n`;
      prompt += `- Wireframe Type: ${wireframeData.type || 'N/A'}\n`;
      prompt += `- Wireframe Target Audience: ${wireframeData.targetAudience || 'N/A'}\n`;
      prompt += `- Wireframe Image: ${wireframeData.imageUrl || 'N/A'}\n`;
      prompt += `- Wireframe Components: ${wireframeData.components || 'N/A'}\n`;
      prompt += `- Wireframe Color Scheme: ${wireframeData.colorScheme || 'N/A'}\n`;
      prompt += `- Wireframe Typography: ${wireframeData.typography || 'N/A'}\n`;
      prompt += `- Wireframe Interaction Flow: ${wireframeData.interactionFlow || 'N/A'}\n`;
      prompt += `- Wireframe Accessibility: ${wireframeData.accessibility || 'N/A'}\n`;
      prompt += `- Wireframe Mobile Responsiveness: ${wireframeData.mobileResponsiveness || 'N/A'}\n`;
    }

    return prompt;
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

  const generateUIAssets = async (title: string, description: string, apiKey: string): Promise<{
    icons?: string[];
    background?: string;
  }> => {
    console.log('Starting DALL-E 3 asset generation...');
    console.log('Using latest DALL-E 3 model for superior quality');

    let assets: {
      icons?: string[];
      background?: string;
    } = {};

    // Generate icons
    let iconPrompt = `Create a set of high-fidelity, realistic banking icons for a mobile application called "${title}". 

Requirements: ${description}

Style: Clean, modern, and professional banking icons. Use a color scheme that includes blue accents (#1E3A8A) and professional typography. Icons should be easily recognizable and scalable.

Icons to include:
- Account icon (bank account, credit card, savings)
- Transaction icon (transfer, deposit, withdraw)
- Settings icon (gear, user, lock)
- Notification icon (bell, info)
- Back icon (arrow-left)
- Menu icon (hamburger)

The icons should look like they could be used in a real banking application.`;

    if (iconPrompt.length > 4000) {
      iconPrompt = iconPrompt.substring(0, 3997) + '...';
    }
    console.log('DALL-E 3 Icon Prompt:', iconPrompt);
    console.log('DALL-E 3 Icon Prompt Length:', iconPrompt.length, 'characters');

    try {
      const iconResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: iconPrompt,
          n: 10, // Generate multiple icons
          size: '512x512',
          quality: 'hd',
          style: 'natural'
        })
      });

      if (!iconResponse.ok) {
        const errorData = await iconResponse.json().catch(() => ({}));
        console.error('DALL-E 3 Icon API Error:', errorData);
        console.error('DALL-E 3 Icon Response Status:', iconResponse.status);
        throw new Error(`DALL-E 3 Icon Error (${iconResponse.status}): ${errorData.error?.message || iconResponse.statusText}`);
      }

      const iconData = await iconResponse.json();
      assets.icons = iconData.data.map((item: any) => item.url);
      console.log('DALL-E 3 Icons:', assets.icons);
    } catch (error) {
      console.error('DALL-E 3 Icon Generation Error:', error);
      assets.icons = []; // Fallback to empty array
    }

    // Generate background images
    let backgroundPrompt = `Create a high-fidelity, realistic background image for a mobile banking application called "${title}". 

Requirements: ${description}

Style: Clean, modern, and professional banking background. Use a color scheme that includes blue accents (#1E3A8A) and professional typography. The background should be visually appealing and suitable for a banking application.

The background should look like a professional banking app screenshot that could be used in a real application.`;

    if (backgroundPrompt.length > 4000) {
      backgroundPrompt = backgroundPrompt.substring(0, 3997) + '...';
    }
    console.log('DALL-E 3 Background Prompt:', backgroundPrompt);
    console.log('DALL-E 3 Background Prompt Length:', backgroundPrompt.length, 'characters');

    try {
      const backgroundResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: backgroundPrompt,
          n: 1,
          size: '1024x768', // Larger background
          quality: 'hd',
          style: 'natural'
        })
      });

      if (!backgroundResponse.ok) {
        const errorData = await backgroundResponse.json().catch(() => ({}));
        console.error('DALL-E 3 Background API Error:', errorData);
        console.error('DALL-E 3 Background Response Status:', backgroundResponse.status);
        throw new Error(`DALL-E 3 Background Error (${backgroundResponse.status}): ${errorData.error?.message || backgroundResponse.statusText}`);
      }

      const backgroundData = await backgroundResponse.json();
      assets.background = backgroundData.data[0].url;
      console.log('DALL-E 3 Background:', assets.background);
    } catch (error) {
      console.error('DALL-E 3 Background Generation Error:', error);
      assets.background = undefined; // Fallback to undefined
    }

    return assets;
  };

  const generateHTMLPrototype = async (aiResponse: string, formData: DesignForm, uiAssets: {
    icons?: string[];
    background?: string;
  }): Promise<string> => {
    console.log('Using AI to generate real HTML code based on wireframe and requirements...');
    
    // Analyze wireframe data if available
    let wireframeAnalysis = '';
    if (wireframeData && wireframeData.elements) {
      wireframeAnalysis = analyzeWireframeForAI(wireframeData.elements);
      console.log('Wireframe analysis for AI:', wireframeAnalysis);
    }
    
    // Create a comprehensive prompt for ChatGPT to generate real HTML code
    const codeGenerationPrompt = `You are an expert web developer specializing in banking applications. 

Generate complete, functional HTML code for a banking interface based on these requirements:

**Title:** ${formData.title}
**Description:** ${formData.description}
**Design Type:** ${formData.designType}
**Target Audience:** ${formData.targetAudience}

${wireframeAnalysis ? `**Wireframe Analysis:**\n${wireframeAnalysis}` : ''}

**AI Design Recommendations:** ${aiResponse}

**Requirements:**
- Generate COMPLETE HTML code including <!DOCTYPE html>, <head>, <body>
- Include all necessary CSS within <style> tags
- Include JavaScript for interactivity within <script> tags
- Use BCU brand colors: primary #1E3A8A, secondary #10B981
- Make it responsive and mobile-friendly
- Include realistic banking content (account balances, transactions, forms)
- Use modern CSS Grid/Flexbox for layout
- Include hover effects and smooth transitions
- Make forms functional with validation
- Use semantic HTML5 elements

**Important:** Generate ONLY the HTML code. Do not include explanations or markdown. Start with <!DOCTYPE html> and end with </html>.`;

    try {
      console.log('Sending code generation request to ChatGPT...');
      const generatedCode = await callChatGPTAPI(codeGenerationPrompt, apiKey);
      
      // Clean up the response to extract just the HTML code
      let cleanHTML = generatedCode;
      
      // Remove markdown code blocks if present
      if (cleanHTML.includes('```html')) {
        cleanHTML = cleanHTML.split('```html')[1] || cleanHTML;
      }
      if (cleanHTML.includes('```')) {
        cleanHTML = cleanHTML.split('```')[0] || cleanHTML;
      }
      
      // Remove any explanatory text before <!DOCTYPE html>
      const doctypeIndex = cleanHTML.indexOf('<!DOCTYPE html>');
      if (doctypeIndex > 0) {
        cleanHTML = cleanHTML.substring(doctypeIndex);
      }
      
      // Remove any text after </html>
      const htmlEndIndex = cleanHTML.lastIndexOf('</html>');
      if (htmlEndIndex > 0) {
        cleanHTML = cleanHTML.substring(0, htmlEndIndex + 7);
      }
      
      console.log('Generated HTML code length:', cleanHTML.length);
      console.log('Generated HTML preview:', cleanHTML.substring(0, 200) + '...');
      
      return cleanHTML;
    } catch (error) {
      console.error('Failed to generate HTML with AI:', error);
      // Fallback to a basic template if AI fails
      return generateFallbackHTML(formData);
    }
  };

  const analyzeWireframeForAI = (elements: any[]): string => {
    let analysis = 'Wireframe contains:\n';
    
    const elementCounts = {
      rectangles: 0,
      circles: 0,
      text: 0,
      drawings: 0,
      lines: 0
    };
    
    let layoutInfo = {
      hasHeader: false,
      hasNavigation: false,
      hasSidebar: false,
      hasMainContent: false,
      hasFooter: false
    };
    
    elements.forEach(element => {
      elementCounts[element.type as keyof typeof elementCounts]++;
      
      // Analyze positioning for layout
      if (element.y < 100) layoutInfo.hasHeader = true;
      if (element.y > 500) layoutInfo.hasFooter = true;
      if (element.x < 200 && element.y > 100 && element.y < 500) layoutInfo.hasSidebar = true;
      if (element.x > 200 && element.y > 100 && element.y < 500) layoutInfo.hasMainContent = true;
      
      // Check for horizontal lines that might be navigation
      if (element.type === 'drawing' && element.points && element.points.length > 2) {
        const isHorizontal = Math.abs(element.points[element.points.length - 1].x - element.points[0].x) > 
                            Math.abs(element.points[element.points.length - 1].y - element.points[0].y);
        if (isHorizontal && element.y < 150) layoutInfo.hasNavigation = true;
      }
    });
    
    analysis += `- ${elementCounts.rectangles} rectangles (likely content areas/cards)\n`;
    analysis += `- ${elementCounts.circles} circles (likely buttons/icons)\n`;
    analysis += `- ${elementCounts.text} text elements\n`;
    analysis += `- ${elementCounts.drawings} drawing elements\n`;
    analysis += `- ${elementCounts.lines} line elements\n\n`;
    
    analysis += 'Layout structure:\n';
    if (layoutInfo.hasHeader) analysis += '- Header area detected\n';
    if (layoutInfo.hasNavigation) analysis += '- Navigation bar detected\n';
    if (layoutInfo.hasSidebar) analysis += '- Sidebar detected\n';
    if (layoutInfo.hasMainContent) analysis += '- Main content area detected\n';
    if (layoutInfo.hasFooter) analysis += '- Footer area detected\n';
    
    return analysis;
  };

  const generateFallbackHTML = (formData: DesignForm): string => {
    return `<!DOCTYPE html>
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
            min-height: 100vh;
        }
        
        .bcu-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .bcu-header {
            background: var(--bcu-white);
            color: var(--bcu-primary);
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .bcu-header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            color: var(--bcu-primary);
        }
        
        .bcu-header p {
            font-size: 1.1rem;
            color: var(--bcu-gray-600);
        }
        
        .bcu-main-content {
            display: grid;
            gap: 2rem;
        }
        
        .bcu-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .bcu-card {
            background: var(--bcu-white);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
        }
        
        .bcu-card:hover {
            transform: translateY(-2px);
        }
        
        .bcu-card h3 {
            color: var(--bcu-primary);
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        .bcu-form {
            background: var(--bcu-white);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .bcu-form h3 {
            color: var(--bcu-primary);
            margin-bottom: 1.5rem;
        }
        
        .bcu-form-group {
            margin-bottom: 1.5rem;
        }
        
        .bcu-form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--bcu-gray-700);
        }
        
        .bcu-form-group input,
        .bcu-form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid var(--bcu-gray-200);
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s ease;
        }
        
        .bcu-form-group input:focus,
        .bcu-form-group select:focus {
            outline: none;
            border-color: var(--bcu-primary);
        }
        
        .bcu-button {
            background: var(--bcu-primary);
            color: var(--bcu-white);
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .bcu-button:hover {
            background: var(--bcu-primary-light);
        }
        
        @media (max-width: 768px) {
            .bcu-container {
                padding: 15px;
            }
            
            .bcu-header {
                padding: 1.5rem;
            }
            
            .bcu-header h1 {
                font-size: 2rem;
            }
            
            .bcu-card-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="bcu-container">
        <header class="bcu-header">
            <h1>${formData.title}</h1>
            <p>${formData.description}</p>
        </header>
        
        <main class="bcu-main-content">
            <div class="bcu-card-grid">
                <div class="bcu-card">
                    <h3>Account Balance</h3>
                    <p style="font-size: 2rem; font-weight: bold; color: var(--bcu-primary);">$12,450.67</p>
                    <p style="color: var(--bcu-gray-600);">Available Balance</p>
                </div>
                <div class="bcu-card">
                    <h3>Recent Transactions</h3>
                    <p style="color: var(--bcu-gray-600);">5 transactions this week</p>
                    <p style="color: var(--bcu-secondary); font-weight: 600;">+$250.00</p>
                </div>
                <div class="bcu-card">
                    <h3>Quick Actions</h3>
                    <p style="color: var(--bcu-gray-600);">Transfer • Pay • Deposit</p>
                </div>
            </div>
            
            <div class="bcu-form">
                <h3>Quick Transfer</h3>
                <form>
                    <div class="bcu-form-group">
                        <label for="to-account">To Account</label>
                        <select id="to-account">
                            <option>Select Account</option>
                            <option>Checking Account</option>
                            <option>Savings Account</option>
                        </select>
                    </div>
                    <div class="bcu-form-group">
                        <label for="amount">Amount</label>
                        <input type="number" id="amount" placeholder="Enter amount" min="0" step="0.01">
                    </div>
                    <button type="submit" class="bcu-button">Send Transfer</button>
                </form>
            </div>
        </main>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    alert('Transfer submitted! (This is a prototype)');
                });
            });
            
            const cards = document.querySelectorAll('.bcu-card');
            cards.forEach(card => {
                card.addEventListener('click', function() {
                    this.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                });
            });
        });
    </script>
</body>
</html>`;
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

          {/* Wireframe Integration Section */}
          <div className="bcu-form-group">
            <label className="bcu-label">
              Wireframe Integration
            </label>
            <div style={{ 
              backgroundColor: 'var(--bcu-gray-50)', 
              padding: 'var(--bcu-spacing-4)', 
              borderRadius: 'var(--bcu-radius-md)',
              border: '1px solid var(--bcu-gray-200)'
            }}>
              {wireframeData ? (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--bcu-spacing-3)',
                    marginBottom: 'var(--bcu-spacing-3)'
                  }}>
                    <div style={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: 'var(--bcu-success)', 
                      borderRadius: '50%' 
                    }} />
                    <strong style={{ color: 'var(--bcu-success)' }}>
                      Wireframe Loaded
                    </strong>
                  </div>
                  <p className="bcu-text-gray" style={{ marginBottom: 'var(--bcu-spacing-3)' }}>
                    Your wireframe will be used as a guide for AI design generation.
                  </p>
                  <button 
                    className="bcu-button bcu-button-outline" 
                    onClick={clearWireframeData}
                    style={{ fontSize: 'var(--bcu-font-size-sm)' }}
                  >
                    Remove Wireframe
                  </button>
                </div>
              ) : (
                <div>
                  <p className="bcu-text-gray" style={{ marginBottom: 'var(--bcu-spacing-3)' }}>
                    No wireframe loaded. Create one in the Wireframe Editor first, then load it here for better AI results.
                  </p>
                  <button 
                    className="bcu-button bcu-button-outline" 
                    onClick={loadWireframeData}
                    style={{ fontSize: 'var(--bcu-font-size-sm)' }}
                  >
                    Load Wireframe
                  </button>
                </div>
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
              This may take a few moments. ChatGPT is analyzing your requirements and generating a complete HTML prototype with DALL-E 3 assets.
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
              🔄 <strong>Processing:</strong> ChatGPT → Design Specs → DALL-E 3 Assets → HTML Prototype
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
              
              {/* Live HTML Preview */}
              <div className="bcu-design-preview" style={{ 
                backgroundColor: 'var(--bcu-white)', 
                padding: 'var(--bcu-spacing-6)', 
                borderRadius: 'var(--bcu-radius-md)',
                border: '1px solid var(--bcu-gray-200)',
                marginBottom: 'var(--bcu-spacing-6)'
              }}>
                <h4 style={{ color: 'var(--bcu-primary)', marginBottom: 'var(--bcu-spacing-4)' }}>
                  🚀 Live HTML Prototype Preview
                </h4>
                <div style={{ 
                  border: '1px solid var(--bcu-gray-200)',
                  borderRadius: 'var(--bcu-radius-md)',
                  overflow: 'hidden',
                  marginBottom: 'var(--bcu-spacing-4)'
                }}>
                  <iframe
                    srcDoc={generatedDesign.designCode}
                    style={{
                      width: '100%',
                      height: '600px',
                      border: 'none',
                      backgroundColor: 'white'
                    }}
                    title="Generated HTML Prototype"
                  />
                </div>
                <p className="bcu-text-gray" style={{ 
                  fontSize: 'var(--bcu-font-size-sm)', 
                  marginTop: 'var(--bcu-spacing-3)',
                  textAlign: 'center'
                }}>
                  Interactive HTML Prototype - Click and interact with the elements above!
                </p>
              </div>
              
              {/* AI Design Recommendations */}
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

              {/* Generated HTML Code */}
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

              {/* Design Actions */}
              <div className="bcu-design-actions">
                <button className="bcu-button bcu-button-outline" onClick={downloadDesign}>
                  <Download size={20} />
                  Download HTML
                </button>
                <button className="bcu-button bcu-button-outline" onClick={shareDesign}>
                  <Share2 size={20} />
                  Share Design
                </button>
                <button className="bcu-button bcu-button-primary" onClick={resetForm}>
                  <RotateCcw size={20} />
                  Generate New Design
                </button>
              </div>
            </div>
          </div>
        )}

        {!isGenerating && !generatedDesign && (
          <div className="bcu-preview-container">
            <div className="bcu-preview-placeholder">
              <FileText size={64} style={{ color: 'var(--bcu-gray-400)', marginBottom: 'var(--bcu-spacing-4)' }} />
              <h3>Ready to Generate Your HTML Prototype</h3>
              <p className="bcu-text-gray">
                Enter your OpenAI API key above, fill out the form, and click "Generate Design" to create your interactive banking interface.
                Our AI will analyze your requirements and produce a complete HTML prototype with working components and DALL-E 3 generated assets.
              </p>
              <div style={{ 
                backgroundColor: 'var(--bcu-primary)', 
                color: 'white', 
                padding: 'var(--bcu-spacing-3)', 
                borderRadius: 'var(--bcu-radius-md)',
                marginTop: 'var(--bcu-spacing-4)',
                fontSize: 'var(--bcu-font-size-sm)'
              }}>
                🚀 <strong>Real AI Integration</strong> - Uses ChatGPT for design specs and DALL-E 3 for UI assets, then generates complete HTML prototypes
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignGenerator;
