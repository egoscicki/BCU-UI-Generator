# BCU Design Studio - Deployment Guide

This guide covers deploying the BCU Design Studio app to various platforms and environments.

## 🚀 Quick Start

### 1. Build the Application
```bash
npm run build
```

This creates a `build/` folder with optimized production files.

### 2. Test the Build Locally
```bash
npx serve -s build
```

Visit `http://localhost:3000` to verify everything works.

## 🌐 Deployment Options

### GitHub Pages (Recommended for Demo)

1. **Install gh-pages** (already included)
2. **Deploy**:
   ```bash
   npm run deploy
   ```
3. **Configure**:
   - Go to your GitHub repository settings
   - Enable GitHub Pages
   - Set source to "gh-pages" branch

Your app will be available at: `https://egoscicki.github.io/BCU-UI-Generator`

### Netlify

1. **Drag & Drop**:
   - Drag the `build/` folder to [Netlify](https://netlify.com)
   - Your app is live instantly

2. **Git Integration**:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts** to connect your GitHub repo

### AWS S3 + CloudFront

1. **Upload to S3**:
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

2. **Configure CloudFront** for CDN distribution

3. **Set up custom domain** (optional)

### Azure Static Web Apps

1. **Install Azure CLI**
2. **Create Static Web App**:
   ```bash
   az staticwebapp create --name bcu-design-studio --source .
   ```

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
REACT_APP_OPENAI_API_KEY=your_production_api_key
REACT_APP_APP_ENVIRONMENT=production
REACT_APP_APP_VERSION=1.0.0
```

### Build-time Configuration

```bash
REACT_APP_OPENAI_API_KEY=your_key npm run build
```

## 📱 Performance Optimization

### 1. Enable Compression
- **Netlify**: Automatic
- **Vercel**: Automatic
- **Custom Server**: Use gzip/brotli

### 2. Cache Headers
```nginx
# Nginx example
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN Configuration
- Enable caching for static assets
- Set appropriate TTL values
- Use edge locations close to users

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use build-time injection for production
- Rotate API keys regularly

### 2. Content Security Policy
Add to your HTML:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

### 3. HTTPS Only
- Force HTTPS redirects
- Use HSTS headers
- Validate SSL certificates

## 📊 Monitoring & Analytics

### 1. Performance Monitoring
- **Web Vitals**: Built-in React metrics
- **Lighthouse**: Regular performance audits
- **Real User Monitoring**: Track actual user experience

### 2. Error Tracking
- **Sentry**: Error monitoring and alerting
- **LogRocket**: Session replay and debugging
- **Custom logging**: Track user interactions

### 3. Analytics
- **Google Analytics**: User behavior insights
- **Mixpanel**: Event tracking
- **Custom metrics**: Business-specific KPIs

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   npm run build --verbose
   ```

2. **Environment Variables Not Working**:
   - Ensure they start with `REACT_APP_`
   - Rebuild after changes
   - Check deployment platform settings

3. **Routing Issues**:
   - Configure 404 redirects to `index.html`
   - Set up proper base paths

4. **Performance Issues**:
   - Run Lighthouse audit
   - Check bundle size with `npm run build --analyze`
   - Optimize images and assets

### Debug Commands

```bash
# Check bundle size
npm run build --analyze

# Test production build locally
npx serve -s build

# Check for unused dependencies
npx depcheck

# Audit security vulnerabilities
npm audit
```

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

### Automated Testing

```bash
# Run tests before deployment
npm test

# Check code quality
npm run lint

# Type checking
npm run type-check
```

## 📈 Scaling Considerations

### 1. Static Assets
- Use CDN for global distribution
- Implement asset versioning
- Optimize image formats (WebP, AVIF)

### 2. API Integration
- Implement rate limiting
- Use API gateways
- Monitor API usage and costs

### 3. User Management
- Consider authentication systems
- Implement user quotas
- Track usage patterns

## 🎯 Next Steps

1. **Deploy to GitHub Pages** for initial demo
2. **Set up monitoring** and analytics
3. **Configure custom domain** if needed
4. **Implement CI/CD** pipeline
5. **Add performance monitoring**
6. **Set up error tracking**

---

**Need Help?** Create an issue in the repository or contact the BCU development team.
