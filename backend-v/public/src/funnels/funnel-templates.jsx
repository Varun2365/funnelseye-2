// Funnel Templates Configuration
export const templates = {
  // Welcome Page Templates
  'welcome-page': {
    'modern-hero': {
      name: 'Modern Hero',
      category: 'welcome-page',
      html: `
        <div class="hero-section">
          <div class="container">
            <div class="hero-content">
              <h1 class="hero-title">Welcome to Your Journey</h1>
              <p class="hero-subtitle">Transform your business with our proven system</p>
              <button class="cta-button">Get Started Now</button>
            </div>
          </div>
        </div>
      `,
      css: `
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 100px 0;
          text-align: center;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        .cta-button {
          background: white;
          color: #667eea;
          padding: 15px 30px;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
      `
    },
    'minimal-welcome': {
      name: 'Minimal Welcome',
      category: 'welcome-page',
      html: `
        <div class="welcome-section">
          <div class="container">
            <h1 class="welcome-title">Hello & Welcome</h1>
            <p class="welcome-text">We're excited to have you here. Let's get started on your transformation journey.</p>
            <div class="action-buttons">
              <button class="primary-btn">Start Your Journey</button>
              <button class="secondary-btn">Learn More</button>
            </div>
          </div>
        </div>
      `,
      css: `
        .welcome-section {
          background: #f8f9fa;
          padding: 80px 0;
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .welcome-title {
          font-size: 2.5rem;
          color: #2d3748;
          margin-bottom: 1rem;
          font-weight: 300;
        }
        .welcome-text {
          font-size: 1.1rem;
          color: #718096;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .primary-btn, .secondary-btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .primary-btn {
          background: #3182ce;
          color: white;
          border: none;
        }
        .primary-btn:hover {
          background: #2c5282;
        }
        .secondary-btn {
          background: white;
          color: #3182ce;
          border: 1px solid #3182ce;
        }
        .secondary-btn:hover {
          background: #3182ce;
          color: white;
        }
      `
    }
  },

  // Product Offer Templates
  'product-offer': {
    'sales-page': {
      name: 'Sales Page',
      category: 'product-offer',
      html: `
        <div class="sales-page">
          <div class="container">
            <div class="sales-header">
              <h1 class="sales-title">The Ultimate Solution</h1>
              <p class="sales-subtitle">Everything you need to achieve your goals</p>
            </div>

            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">🚀</div>
                <h3>Fast Results</h3>
                <p>See improvements in just 30 days</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">💰</div>
                <h3>Save Money</h3>
                <p>Reduce costs by up to 50%</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <h3>Easy to Use</h3>
                <p>Get started in minutes</p>
              </div>
            </div>

            <div class="pricing-section">
              <div class="price-card">
                <div class="price">$97</div>
                <div class="price-description">One-time payment</div>
                <button class="buy-button">Get Instant Access</button>
              </div>
            </div>
          </div>
        </div>
      `,
      css: `
        .sales-page {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background: white;
          color: #2d3748;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .sales-header {
          text-align: center;
          padding: 60px 0;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border-radius: 12px;
          margin-bottom: 40px;
        }
        .sales-title {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .sales-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 40px;
        }
        .feature-item {
          text-align: center;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .feature-item h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }
        .feature-item p {
          color: #718096;
        }
        .pricing-section {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }
        .price-card {
          background: white;
          border: 2px solid #3182ce;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 10px 25px rgba(49, 130, 206, 0.1);
        }
        .price {
          font-size: 3rem;
          font-weight: bold;
          color: #3182ce;
          margin-bottom: 0.5rem;
        }
        .price-description {
          color: #718096;
          margin-bottom: 1.5rem;
        }
        .buy-button {
          background: #3182ce;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .buy-button:hover {
          background: #2c5282;
          transform: translateY(-2px);
        }
      `
    }
  },

  // Thank You Page Templates
  'thank-you': {
    'thank-you-page': {
      name: 'Thank You Page',
      category: 'thank-you',
      html: `
        <div class="thank-you-section">
          <div class="container">
            <div class="success-icon">✓</div>
            <h1 class="thank-you-title">Thank You!</h1>
            <p class="thank-you-text">
              Your purchase was successful. Welcome to the community!
            </p>

            <div class="next-steps">
              <h3>What happens next?</h3>
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>Check your email</h4>
                    <p>You'll receive access instructions within 5 minutes.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>Join our community</h4>
                    <p>Connect with other successful members.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>Start your journey</h4>
                    <p>Begin implementing what you've learned.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <button class="primary-btn">Access Your Content</button>
              <button class="secondary-btn">Join Community</button>
            </div>
          </div>
        </div>
      `,
      css: `
        .thank-you-section {
          background: #f0f9ff;
          min-height: 100vh;
          padding: 60px 0;
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .success-icon {
          font-size: 4rem;
          color: #38a169;
          margin-bottom: 2rem;
          display: inline-block;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: white;
          line-height: 80px;
          box-shadow: 0 4px 12px rgba(56, 161, 105, 0.2);
        }
        .thank-you-title {
          font-size: 3rem;
          color: #2d3748;
          margin-bottom: 1rem;
          font-weight: bold;
        }
        .thank-you-text {
          font-size: 1.2rem;
          color: #718096;
          margin-bottom: 3rem;
          line-height: 1.6;
        }
        .next-steps {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .next-steps h3 {
          color: #2d3748;
          margin-bottom: 2rem;
          font-size: 1.5rem;
        }
        .steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          text-align: left;
        }
        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #3182ce;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .step-content h4 {
          color: #2d3748;
          margin-bottom: 0.25rem;
          font-size: 1.1rem;
        }
        .step-content p {
          color: #718096;
          font-size: 0.9rem;
        }
        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .primary-btn, .secondary-btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .primary-btn {
          background: #38a169;
          color: white;
          border: none;
        }
        .primary-btn:hover {
          background: #2f855a;
        }
        .secondary-btn {
          background: white;
          color: #3182ce;
          border: 1px solid #3182ce;
        }
        .secondary-btn:hover {
          background: #3182ce;
          color: white;
        }
      `
    }
  }
};

// Template categories for the selector
export const templateCategories = [
  {
    id: 'welcome-page',
    name: 'Welcome Pages',
    description: 'First impression pages that introduce your offer',
    icon: '👋'
  },
  {
    id: 'product-offer',
    name: 'Product Offers',
    description: 'Sales pages and product presentation pages',
    icon: '🛍️'
  },
  {
    id: 'thank-you',
    name: 'Thank You Pages',
    description: 'Confirmation and next steps after purchase',
    icon: '🙏'
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'Pages designed to collect email addresses',
    icon: '📧'
  },
  {
    id: 'video-sales-letter',
    name: 'Video Sales Letters',
    description: 'VSL pages with embedded videos',
    icon: '🎥'
  },
  {
    id: 'webinar',
    name: 'Webinar Pages',
    description: 'Webinar registration and replay pages',
    icon: '🎤'
  }
];