# BCU Design Studio

A powerful AI-powered design tool that transforms wireframes into high-fidelity banking interfaces using ChatGPT API integration. Built specifically for BCU Credit Union to streamline the design process and maintain brand consistency.

## 🚀 Features

### Wireframe Editor
- **Interactive Canvas**: Draw wireframes directly in the browser
- **Drawing Tools**: Pen and eraser with adjustable brush sizes
- **Import/Export**: Upload existing wireframes or download your creations
- **Real-time Preview**: See your wireframe as you create it

### Design Generator
- **AI-Powered**: Uses ChatGPT API to transform rough wireframes into polished designs
- **Context-Aware**: Input titles, body copy, and detailed descriptions
- **BCU Design System**: Built-in components matching BCU brand guidelines
- **Multiple Formats**: Generate designs for different use cases and audiences

### BCU Design System
- **Consistent Branding**: Follows BCU's color palette and design principles
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Clean, modern interface inspired by banking best practices

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Custom CSS with BCU design tokens
- **Icons**: Lucide React
- **Routing**: React Router v6
- **AI Integration**: ChatGPT API (configurable)
- **Canvas**: HTML5 Canvas API for wireframe drawing

## 📱 Design Philosophy

The app follows BCU's design principles:
- **Trust & Security**: Professional, banking-grade interface
- **Accessibility**: Clear navigation and readable typography
- **Modern UX**: Intuitive tools and smooth interactions
- **Brand Consistency**: Unified color scheme and component library

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- ChatGPT API key (for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/egoscicki/BCU-UI-Generator.git
   cd BCU-UI-Generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_OPENAI_API_KEY=your_chatgpt_api_key_here
REACT_APP_OPENAI_MODEL=gpt-4
```

## 🎨 How to Use

### 1. Create Wireframes
- Navigate to the **Wireframe Editor**
- Use the pen tool to draw your interface layout
- Adjust brush size for different line weights
- Import existing wireframes if available

### 2. Generate Designs
- Go to the **Design Generator**
- Fill in design requirements:
  - **Title**: Name of your interface
  - **Body Copy**: Main text content
  - **Description**: Detailed design vision
  - **Design Type**: Banking interface, mobile app, etc.
  - **Target Audience**: User demographics
- Upload your wireframe (optional)
- Click "Generate Design"

### 3. Export & Share
- Download generated designs as HTML
- Share designs with your team
- Iterate and regenerate as needed

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx     # Navigation header
│   └── Footer.tsx     # App footer
├── pages/              # Main application pages
│   ├── Home.tsx       # Landing page
│   ├── WireframeEditor.tsx  # Wireframe creation tool
│   └── DesignGenerator.tsx  # AI design generation
├── styles/             # CSS and design tokens
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🎯 Use Cases

### For Designers
- Rapid prototyping of banking interfaces
- Consistent design system implementation
- Quick iteration and testing

### For Product Managers
- Visualize design requirements
- Communicate design concepts to stakeholders
- Maintain design consistency across projects

### For Developers
- Generate HTML/CSS code from wireframes
- Understand design specifications
- Implement consistent UI components

## 🔧 Configuration

### Customizing the Design System

The app uses CSS custom properties for easy customization:

```css
:root {
  --bcu-primary: #1E3A8A;        /* Primary brand color */
  --bcu-secondary: #10B981;      /* Secondary color */
  --bcu-accent: #F59E0B;         /* Accent color */
  /* ... more variables */
}
```

### ChatGPT API Integration

To enable full AI functionality:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env` file
3. The app will automatically use it for design generation

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

### Deploy to Other Platforms
The app can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for BCU Credit Union.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the BCU development team
- Check the documentation in the `/docs` folder

## 🔮 Future Enhancements

- **Real-time Collaboration**: Multiple users working on wireframes
- **Design Templates**: Pre-built banking interface templates
- **Advanced AI Models**: Integration with additional AI services
- **Export Options**: More file formats (Figma, Sketch, etc.)
- **Version Control**: Track design iterations and changes
- **Analytics**: Usage insights and design performance metrics

---

**Built with ❤️ for BCU Credit Union**

Transform your wireframes into stunning banking interfaces with the power of AI!
