import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Zap, Download, Palette, FileText, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bcu-page">
      <div className="bcu-page-header">
        <h1 className="bcu-page-title">BCU Design Studio</h1>
        <p className="bcu-page-subtitle">
          Transform your wireframes into stunning, high-fidelity banking interfaces using AI-powered design generation
        </p>
      </div>

      <section className="bcu-hero">
        <h2 className="bcu-hero-title">Design Banking Apps in Minutes</h2>
        <p className="bcu-hero-subtitle">
          Upload wireframes, describe your vision, and let AI create professional banking interfaces that match BCU's design standards
        </p>
        <div className="bcu-hero-actions">
          <Link to="/wireframe" className="bcu-button bcu-button-secondary">
            <PenTool size={20} />
            Start Wireframing
          </Link>
          <Link to="/generate" className="bcu-button bcu-button-outline">
            <Zap size={20} />
            Generate Design
          </Link>
        </div>
      </section>

      <section className="bcu-features">
        <div className="bcu-feature-card">
          <div className="bcu-feature-icon">
            <PenTool size={40} />
          </div>
          <h3 className="bcu-feature-title">Wireframe Editor</h3>
          <p className="bcu-feature-description">
            Create wireframes directly in the browser or import existing designs. 
            Use our intuitive drawing tools to sketch out your banking interface ideas.
          </p>
        </div>

        <div className="bcu-feature-card">
          <div className="bcu-feature-icon">
            <FileText size={40} />
          </div>
          <h3 className="bcu-feature-title">Design Context</h3>
          <p className="bcu-feature-description">
            Provide titles, body copy, and detailed descriptions to guide the AI 
            in understanding your design requirements and user experience goals.
          </p>
        </div>

        <div className="bcu-feature-card">
          <div className="bcu-feature-icon">
            <Sparkles size={40} />
          </div>
          <h3 className="bcu-feature-title">AI Generation</h3>
          <p className="bcu-feature-description">
            Leverage ChatGPT API to transform rough wireframes into polished, 
            high-fidelity designs that follow BCU's design system and banking best practices.
          </p>
        </div>

        <div className="bcu-feature-card">
          <div className="bcu-feature-icon">
            <Palette size={40} />
          </div>
          <h3 className="bcu-feature-title">BCU Design System</h3>
          <p className="bcu-feature-description">
            Built-in components and styles that match BCU's brand guidelines, 
            ensuring consistency across all generated designs.
          </p>
        </div>

        <div className="bcu-feature-card">
          <div className="bcu-feature-icon">
            <Download size={40} />
          </div>
          <h3 className="bcu-feature-title">Export & Share</h3>
          <p className="bcu-feature-description">
            Download your generated designs in multiple formats, 
            or share them directly with your team for collaboration and feedback.
          </p>
        </div>

        <div className="bcu-feature-card">
          <div className="bcu-feature-icon">
            <Zap size={40} />
          </div>
          <h3 className="bcu-feature-title">Rapid Iteration</h3>
          <p className="bcu-feature-description">
            Quickly iterate on designs by modifying inputs and regenerating. 
            Perfect for rapid prototyping and design exploration.
          </p>
        </div>
      </section>

      <section className="bcu-cta">
        <div className="bcu-card bcu-text-center">
          <h2 className="bcu-text-primary" style={{ fontSize: 'var(--bcu-font-size-3xl)', marginBottom: 'var(--bcu-spacing-6)' }}>
            Ready to Transform Your Wireframes?
          </h2>
          <p className="bcu-text-gray" style={{ fontSize: 'var(--bcu-font-size-lg)', marginBottom: 'var(--bcu-spacing-8)' }}>
            Join the future of banking design with AI-powered tools that understand your vision
          </p>
          <div className="bcu-hero-actions">
            <Link to="/wireframe" className="bcu-button bcu-button-primary">
              <PenTool size={20} />
              Get Started Now
            </Link>
            <Link to="/generate" className="bcu-button bcu-button-outline">
              <Zap size={20} />
              Try Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
