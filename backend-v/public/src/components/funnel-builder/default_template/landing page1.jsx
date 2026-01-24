/**
 * ====================================================================
 * GRAPESJS EDITOR TEMPLATE FORMAT
 * ====================================================================
 * 
 * ✅ TEMPLATE STRUCTURE (Required by Editor):
 * {
 *   name: string,           // Template display name
 *   description: string,    // Template description
 *   thumbnail: string,      // Preview image URL
 *   html: string,          // Page HTML content
 *   css: string,           // Page-specific CSS (NO GLOBAL CSS)
 *   js: string|function    // Page-specific JavaScript
 * }
 * 
 * 📌 KEY POINTS:
 * - Each template is INDEPENDENT (no shared/global CSS)
 * - All CSS must be in the template's css property
 * - HTML should be complete page structure
 * - JS can be string or function (editor handles both)
 * - Template key (e.g., 'fitness_vsl') must be unique
 * 
 * 🔄 HOW IT WORKS IN EDITOR:
 * 1. Template selected → html goes to page.component
 * 2. CSS injected → page.styles (page-specific only)
 * 3. JS executed → page.script
 * 4. No global CSS sharing between pages
 * 
 * ====================================================================
 */

export const fitnessVSLTemplates = {
  'fitness_vsl': {
      name: 'Fitness VSL - Complete Professional Landing Page with Auto-Scroll couch_page',
      description: 'Professional fitness VSL landing page with ReactBit components, auto-scrolling testimonials, before/after transformations, and enhanced UI layout',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=300',
      css: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    :root {
      --primary-gradient: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
      --secondary-gradient: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      --accent-gradient: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
      --card-gradient: linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
      --hero-gradient: radial-gradient(ellipse at center, rgba(0, 212, 170, 0.1) 0%, transparent 70%);
      
      --grid-pattern: 
        linear-gradient(rgba(0, 212, 170, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 212, 170, 0.15) 1px, transparent 1px),
        radial-gradient(circle at 20% 20%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(0, 212, 170, 0.06) 0%, transparent 50%),
        linear-gradient(45deg, rgba(0, 212, 170, 0.02) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(0, 212, 170, 0.02) 25%, transparent 25%);
      
      --primary-color: #00d4aa;
      --primary-dark: #00b894;
      --secondary-color: #2d3748;
      --accent-color: #00d4aa;
      --success-color: #00d4aa;
      --warning-color: #ffd93d;
      --danger-color: #ff6b6b;
      --text-primary: #ffffff;
      --text-secondary: #e2e8f0;
      --text-muted: #a0aec0;
      --text-inverse: #1a202c;
      --text-dark: #2d3748;
      --bg-primary: #0d1117;
      --bg-secondary: #161b22;
      --bg-tertiary: #21262d;
      --bg-card: rgba(33, 38, 45, 0.95);
      --bg-glass: rgba(33, 38, 45, 0.8);
      --bg-light: #f7fafc;
      --border-color: rgba(255, 255, 255, 0.1);
      --border-hover: rgba(0, 212, 170, 0.5);
      --border-light: rgba(45, 55, 72, 0.2);
      
      --font-primary: 'Inter', sans-serif;
      --font-display: 'Playfair Display', serif;
      --font-mono: 'Space Grotesk', monospace;
      
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);
      --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.5);
      --shadow-glow: 0 0 30px rgba(0, 212, 170, 0.4);
      
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 24px;
      --radius-full: 9999px;
      
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-bounce: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      font-size: 16px;
      scroll-behavior: smooth;
    }
    
    body {
      font-family: var(--font-primary);
      background: var(--bg-primary);
      color: var(--text-secondary);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
      font-size: 16px;
      position: relative;
    }
    
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--grid-pattern);
      background-size: 80px 80px, 80px 80px, 200px 200px, 300px 300px, 60px 60px, 60px 60px;
      opacity: 0.4;
      z-index: -2;
      pointer-events: none;
      animation: gridFloat 20s ease-in-out infinite;
    }
    
    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        conic-gradient(from 0deg at 25% 25%, transparent 0deg, rgba(0, 212, 170, 0.05) 90deg, transparent 180deg),
        conic-gradient(from 180deg at 75% 75%, transparent 0deg, rgba(0, 212, 170, 0.03) 90deg, transparent 180deg),
        radial-gradient(circle at 10% 20%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, rgba(0, 212, 170, 0.06) 0%, transparent 50%);
      z-index: -1;
      pointer-events: none;
      animation: backgroundShift 30s linear infinite;
    }
    
    @keyframes gridFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
      33% { transform: translateY(-10px) rotate(1deg); opacity: 0.5; }
      66% { transform: translateY(5px) rotate(-0.5deg); opacity: 0.3; }
    }
    
    @keyframes backgroundShift {
      0% { transform: rotate(0deg) scale(1); }
      33% { transform: rotate(120deg) scale(1.1); }
      66% { transform: rotate(240deg) scale(0.9); }
      100% { transform: rotate(360deg) scale(1); }
    }
    
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .page-wrapper {
      position: relative;
      min-height: 100vh;
      width: 100%;
      z-index: 1;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px;
      width: 100%;
    }
    
    .container-narrow {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
      width: 100%;
    }
    
    .section-padding {
      padding: 100px 0;
    }
    
    .text-gradient {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .text-shimmer {
      background: linear-gradient(90deg, #ffffff 0%, var(--primary-color) 50%, #ffffff 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      0%, 100% { background-position: 200% 0; }
      50% { background-position: -200% 0; }
    }
    
    .text-glow {
      color: var(--text-primary);
      text-shadow: 0 0 20px rgba(0, 212, 170, 0.5), 0 0 40px rgba(0, 212, 170, 0.3);
    }
    
    .text-bounce {
      animation: bounce 2s ease-in-out infinite;
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
    
    .text-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .target-audience-bar {
      background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
      padding: 20px 0;
      text-align: center;
      font-weight: 700;
      color: white;
      width: 100vw;
      position: relative;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
      box-shadow: 0 4px 20px rgba(0, 212, 170, 0.3);
      backdrop-filter: blur(20px);
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 14px;
    }

    .target-audience-bar svg {
      width: 20px;
      height: 20px;
      stroke: white;
    }
    
    .rb-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 18px 36px;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 16px;
      text-decoration: none;
      cursor: pointer;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
      min-width: 200px;
      font-family: var(--font-primary);
      text-transform: none;
      letter-spacing: 0.3px;
      box-shadow: var(--shadow-md);
    }

    .rb-btn svg {
      width: 1.2em;
      height: 1.2em;
    }
    
    .rb-btn--primary {
      background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
      color: white;
      border: 3px solid rgba(255, 255, 255, 0.3);
      box-shadow: 
        0 25px 50px rgba(0, 212, 170, 0.4),
        0 0 0 2px rgba(0, 212, 170, 0.2);
      position: relative;
      overflow: hidden;
      border-radius: 18px;
    }
    
    .rb-btn--primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }
    
    .rb-btn--primary:hover::before {
      left: 100%;
    }
    
    .rb-btn--primary:hover {
      transform: translateY(-6px) scale(1.08);
      box-shadow: 
        0 40px 80px rgba(0, 212, 170, 0.5),
        0 0 0 3px rgba(0, 212, 170, 0.3);
      border-color: rgba(255, 255, 255, 0.4);
      background: linear-gradient(135deg, #00e6b8 0%, #00c9a7 100%);
    }
    
    .rb-btn--secondary {
      background: transparent;
      color: var(--primary-color);
      border: 2px solid var(--primary-color);
    }
    
    .rb-btn--secondary:hover {
      background: var(--primary-gradient);
      color: var(--text-primary);
    }
    
    .rb-btn--large {
      padding: 28px 52px;
      font-size: 22px;
      min-width: 360px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
      text-transform: uppercase;
      border-radius: 20px;
    }
    
    .rb-card {
      background: var(--card-gradient);
      backdrop-filter: blur(30px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      transition: var(--transition);
      padding: 32px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      width: 100%;
      position: relative;
    }
    
    .rb-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary-gradient);
      opacity: 0;
      transition: var(--transition);
    }
    
    .rb-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-glow);
      border-color: var(--border-hover);
    }
    
    .rb-card:hover::before {
      opacity: 1;
    }
    
    .rb-card--feature {
      text-align: center;
      min-height: 320px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 24px;
    }
    
    .rb-card--testimonial {
      padding: 28px;
      background: var(--card-gradient);
      position: relative;
    }
    
    .rb-card--testimonial::before {
      content: '"';
      position: absolute;
      top: -5px;
      left: 24px;
      font-size: 4rem;
      color: var(--primary-color);
      opacity: 0.3;
      font-family: var(--font-display);
      line-height: 1;
    }
    
    .rb-input-group {
      margin-bottom: 24px;
      width: 100%;
    }
    
    .rb-input-label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 10px;
      font-size: 15px;
    }
    
    .rb-input {
      width: 100%;
      padding: 18px 20px;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-primary);
      font-size: 16px;
      transition: var(--transition);
      font-family: var(--font-primary);
    }
    
    .rb-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
      background: var(--bg-card);
    }
    
    .rb-input::placeholder {
      color: var(--text-muted);
    }
    
    .rb-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      font-size: 14px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      transition: var(--transition-bounce);
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .rb-badge svg {
      width: 16px;
      height: 16px;
    }
    
    .rb-badge:hover {
      transform: translateY(-2px) scale(1.05);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-glow);
    }
    
    .rb-badge--success {
      background: var(--primary-gradient);
      color: var(--text-primary);
      border: none;
    }
    
    .success-stories-section {
      background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0a0e1a 100%);
      padding: 100px 0;
      position: relative;
      overflow: hidden;
    }

    .success-stories-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(0, 212, 170, 0.08) 0%, transparent 60%),
        radial-gradient(circle at 80% 70%, rgba(0, 212, 170, 0.06) 0%, transparent 60%);
      pointer-events: none;
    }

    .stories-container {
      position: relative;
      z-index: 2;
    }

    .stories-top-row {
      display: flex;
      overflow-x: hidden;
      margin-bottom: 40px;
      position: relative;
      padding: 0;
      width: 100vw;
      margin-left: calc(-50vw + 50%);
    }

    .stories-top-track {
      display: flex;
      gap: 24px;
      animation: slideLeftToRight 25s linear infinite;
      will-change: transform;
      padding: 0 60px;
    }

    .stories-top-track:hover {
      animation-play-state: paused;
    }

    .stories-bottom-row {
      display: flex;
      overflow-x: hidden;
      position: relative;
      padding: 0;
      width: 100vw;
      margin-left: calc(-50vw + 50%);
    }

    .stories-bottom-track {
      display: flex;
      gap: 24px;
      animation: slideRightToLeft 25s linear infinite;
      will-change: transform;
      padding: 0 60px;
    }

    .stories-bottom-track:hover {
      animation-play-state: paused;
    }

    @keyframes slideRight {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-100%); }
    }

    @keyframes slideLeft {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(0%); }
    }

    .story-card {
      flex: 0 0 380px;
      height: 280px;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .story-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .story-card--blue {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .story-card--red {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
    }

    .story-card--gray {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1a202c;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .story-card--image {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }

    .story-card--image::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
      z-index: 1;
    }

    .story-card--image .story-content {
      position: relative;
      z-index: 2;
      color: white;
      padding: 32px 28px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .story-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .story-quote {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
      font-style: italic;
      flex: 1;
    }

    .story-author {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .story-role {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 4px;
    }

    .story-location {
      font-size: 13px;
      opacity: 0.7;
    }

    .story-stars {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .story-stats {
      text-align: center;
    }

    .story-stat-number {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 8px;
      display: block;
    }

    .story-stat-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .story-profile {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255, 255, 255, 0.3);
      position: absolute;
      bottom: 20px;
      right: 20px;
    }

    @media (max-width: 1024px) {
      .stories-top-track, .stories-bottom-track {
        padding: 0 40px;
      }
      
      .story-card {
        flex: 0 0 320px;
        height: 250px;
      }
    }

    @media (max-width: 768px) {
      .success-stories-section {
        padding: 60px 0;
      }
      
      .stories-top-track, .stories-bottom-track {
        padding: 0 20px;
      }
      
      .story-card {
        flex: 0 0 280px;
        height: 220px;
      }
      
      .story-quote {
        font-size: 14px;
      }
      
      .story-author {
        font-size: 14px;
      }
      
      .story-role, .story-location {
        font-size: 12px;
      }
      
      .story-stat-number {
        font-size: 24px;
      }
      
      .story-nav-arrow {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .stories-top-track, .stories-bottom-track {
        padding: 0 10px;
      }
      
      .story-card {
        flex: 0 0 250px;
        height: 200px;
      }
      
      .story-content {
        padding: 20px 16px;
      }
      
      .story-quote {
        font-size: 13px;
        margin-bottom: 15px;
      }
      
      .story-profile {
        width: 40px;
        height: 40px;
        bottom: 15px;
        right: 15px;
      }
    }
    
    .transformations-section {
      background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0a0e1a 100%);
      position: relative;
      overflow: hidden;
      padding: 100px 0;
    }

    .transformations-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 30% 20%, rgba(0, 212, 170, 0.08) 0%, transparent 60%),
        radial-gradient(circle at 70% 80%, rgba(0, 212, 170, 0.06) 0%, transparent 60%);
      pointer-events: none;
      animation: backgroundFloat 20s ease-in-out infinite;
    }

    @keyframes backgroundFloat {
      0%, 100% { transform: translateY(0px); opacity: 0.8; }
      50% { transform: translateY(-20px); opacity: 1; }
    }
    
    .transformations-container {
      position: relative;
      z-index: 2;
    }

    .transformations-top-row {
      display: flex;
      overflow-x: hidden;
      margin-bottom: 40px;
      position: relative;
      padding: 0;
      width: 100vw;
      margin-left: calc(-50vw + 50%);
    }

    .transformations-top-track {
      display: flex;
      gap: 24px;
      animation: slideRightToLeft 20s linear infinite;
      will-change: transform;
      padding: 0 60px;
    }

    .transformations-top-track:hover {
      animation-play-state: paused;
    }

    .transformations-bottom-row {
      display: flex;
      overflow-x: hidden;
      position: relative;
      padding: 0;
      width: 100vw;
      margin-left: calc(-50vw + 50%);
    }

    .transformations-bottom-track {
      display: flex;
      gap: 24px;
      animation: slideLeftToRight 20s linear infinite;
      will-change: transform;
      padding: 0 60px;
    }

    .transformations-bottom-track:hover {
      animation-play-state: paused;
    }

    .transformation-slide-card {
      flex: 0 0 420px;
      height: 520px;
      border-radius: 24px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
      background: linear-gradient(145deg, rgba(26, 32, 44, 0.95) 0%, rgba(33, 38, 45, 0.9) 100%);
      border: 2px solid rgba(0, 212, 170, 0.15);
      backdrop-filter: blur(25px);
      display: flex;
      flex-direction: column;
    }

    .transformation-slide-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 60px rgba(0, 212, 170, 0.25);
      border-color: rgba(0, 212, 170, 0.4);
    }

    .transformation-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .transformation-header {
      text-align: center;
      padding: 24px 20px 20px;
      background: linear-gradient(145deg, rgba(20, 25, 35, 0.95) 0%, rgba(26, 32, 44, 0.9) 100%);
      border-bottom: 1px solid rgba(0, 212, 170, 0.1);
      flex-shrink: 0;
    }

    .transformation-name {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .transformation-role {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
    }

    .before-after-images {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 30px 24px;
      position: relative;
      flex: 1;
      align-items: center;
    }

    .before-image, .after-image {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      height: 220px;
    }

    .before-image:hover, .after-image:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    }

    .before-image img, .after-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.95) contrast(1.05);
      transition: all 0.3s ease;
    }

    .before-image:hover img, .after-image:hover img {
      transform: scale(1.05);
      filter: brightness(1.05) contrast(1.1);
    }

    .image-label {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      padding: 6px 16px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 700;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .before-image .image-label {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    }

    .after-image .image-label {
      background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
    }

    .transformation-arrow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      z-index: 10;
      box-shadow: 
        0 6px 20px rgba(0, 212, 170, 0.4),
        0 0 0 3px rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      animation: pulse 2s ease-in-out infinite;
      backdrop-filter: blur(10px);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .transformation-arrow svg {
      width: 24px;
      height: 24px;
      stroke: white;
      stroke-width: 3;
    }

    .transformation-arrow:hover {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 
        0 8px 25px rgba(0, 212, 170, 0.5),
        0 0 0 4px rgba(255, 255, 255, 0.15);
    }

    .transformation-quote {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
      font-style: italic;
      text-align: center;
      padding: 24px 20px;
      background: linear-gradient(145deg, rgba(15, 20, 30, 0.95) 0%, rgba(22, 28, 40, 0.9) 100%);
      border-top: 1px solid rgba(0, 212, 170, 0.1);
      flex-shrink: 0;
    }
    
    /* ========================================
       NO EXPERIENCE NEEDED SECTION - EDITOR OPTIMIZED
       ======================================== */
    
    .no-experience-section {
      background: var(--bg-secondary);
      padding: 100px 0;
      position: relative;
      overflow: hidden;
    }
    
    .no-experience-header {
      text-align: center;
      margin-bottom: 80px;
    }
    
    .no-experience-header .section-title {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    
    .no-experience-header .section-subtitle {
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }
    
    /* Grid Layout - Editor Friendly (No Absolute Positioning) */
    .no-experience-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
      align-items: center;
      justify-items: center;
    }
    
    /* Central Circle - Grid Position */
    .no-exp-center-circle {
      grid-column: 3 / 4;
      grid-row: 2 / 3;
      position: relative;
      width: 240px;
      height: 240px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .circle-outer {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg, 
        rgba(0, 212, 170, 0.3) 0deg, 
        rgba(0, 212, 170, 0.1) 90deg, 
        rgba(0, 212, 170, 0.3) 180deg, 
        rgba(0, 212, 170, 0.1) 270deg, 
        rgba(0, 212, 170, 0.3) 360deg
      );
      border: 2px solid rgba(0, 212, 170, 0.6);
      box-shadow: 
        0 0 30px rgba(0, 212, 170, 0.4), 
        inset 0 0 30px rgba(0, 212, 170, 0.1);
      animation: rotate 20s linear infinite;
    }
    
    .circle-middle {
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: var(--bg-primary);
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
    }
    
    .circle-inner {
      position: absolute;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: conic-gradient(
        from 45deg, 
        rgba(0, 212, 170, 0.2) 0deg, 
        rgba(0, 212, 170, 0.1) 180deg, 
        rgba(0, 212, 170, 0.2) 360deg
      );
      border: 1px solid rgba(0, 212, 170, 0.4);
    }
    
    /* Benefit Cards - Grid Positioning */
    .no-exp-card {
      background: var(--card-gradient);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px 20px;
      box-shadow: var(--shadow-lg);
      transition: var(--transition);
      text-align: center;
      width: 220px;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .no-exp-card:hover {
      transform: translateY(-8px) scale(1.05);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-glow);
    }
    
    /* Card Positions in Grid */
    .no-exp-card-1 {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
    }
    
    .no-exp-card-2 {
      grid-column: 4 / 5;
      grid-row: 1 / 2;
    }
    
    .no-exp-card-3 {
      grid-column: 1 / 2;
      grid-row: 2 / 3;
    }
    
    .no-exp-card-4 {
      grid-column: 5 / 6;
      grid-row: 2 / 3;
    }
    
    .no-exp-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
      font-size: 16px;
    }
    
    .no-exp-title {
      color: var(--text-primary);
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .no-exp-text {
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }
    
    /* CTA Section */
    .no-experience-cta {
      text-align: center;
      margin-top: 80px;
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    /* ========================================
       VERIFICATION SECTION - EDITOR OPTIMIZED
       ======================================== */
    
    .verification-section {
      background: var(--bg-primary);
      padding: 100px 0;
      position: relative;
    }
    
    .verification-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .verification-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 900px;
      margin: 40px auto 0;
    }
    
    .verification-card {
      background: var(--card-gradient);
      backdrop-filter: blur(30px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 32px 24px;
      text-align: center;
      transition: var(--transition);
      box-shadow: var(--shadow-md);
      cursor: pointer;
    }
    
    .verification-card:hover {
      transform: translateY(-8px);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-glow);
    }
    
    .verification-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: var(--primary-gradient);
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      box-shadow: 0 8px 20px rgba(0, 212, 170, 0.3);
      transition: var(--transition);
    }
    
    .verification-card:hover .verification-icon {
      transform: scale(1.15) rotate(5deg);
      box-shadow: 0 12px 30px rgba(0, 212, 170, 0.5);
    }
    
    .verification-role {
      color: var(--text-primary);
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
      font-family: var(--font-display);
    }
    
    .verification-result {
      color: var(--text-muted);
      font-size: 15px;
      margin: 0;
      line-height: 1.5;
    }
    
    /* ========================================
       SIMPLE SYSTEM SECTION - EDITOR OPTIMIZED
       ======================================== */
    
    .simple-system-section {
      background: var(--bg-secondary);
      padding: 100px 0;
      position: relative;
    }
    
    .simple-system-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    /* ========================================
       COMMON SECTION HEADERS - EDITOR OPTIMIZED
       ======================================== */
    
    .features-section-header,
    .success-stories-header,
    .transformations-section-header {
      text-align: center;
      margin-bottom: 80px;
    }
    
    .service-features {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 24px;
      margin: 60px 0;
    }
    
    .service-feature {
      background: var(--card-gradient);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 32px 20px;
      text-align: center;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }
    
    .service-feature::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.1), transparent);
      transition: left 0.6s;
    }
    
    .service-feature:hover::before {
      left: 100%;
    }
    
    .service-feature:hover {
      transform: translateY(-8px);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-glow);
    }
    
    .service-feature-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
      display: block;
    }
    
    .service-feature-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .service-feature-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    /* ========================================
       FAQ SECTION - EDITOR OPTIMIZED
       ======================================== */
    
    .faq-section {
      background: var(--bg-primary);
      padding: 100px 0;
      position: relative;
    }
    
    .faq-section-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .faq-container {
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
    
    .faq-item {
      background: var(--card-gradient);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      margin-bottom: 20px;
      overflow: hidden;
      transition: var(--transition);
      box-shadow: var(--shadow-md);
    }
    
    .faq-item:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-lg);
    }
    
    .faq-item.active {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-glow);
    }
    
    .faq-question {
      width: 100%;
      background: none;
      border: none;
      padding: 24px 28px;
      text-align: left;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: var(--transition);
      font-family: var(--font-primary);
      line-height: 1.4;
    }
    
    .faq-question:hover {
      color: var(--primary-color);
      background: rgba(0, 212, 170, 0.03);
    }
    
    .faq-question-text {
      flex: 1;
      text-align: left;
      padding-right: 20px;
    }
    
    .faq-icon {
      font-size: 20px;
      color: var(--primary-color);
      transition: var(--transition);
      transform: rotate(0deg);
      flex-shrink: 0;
      line-height: 1;
      font-weight: 300;
    }

    .faq-icon svg {
      width: 24px;
      height: 24px;
      stroke: var(--primary-color);
      stroke-width: 2;
    }
    
    .faq-item.active .faq-icon {
      transform: rotate(45deg);
    }
    
    .faq-answer {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      margin-top: 0;
      transition: max-height 0.4s ease-out, opacity 0.3s ease, margin-top 0.3s ease;
      background: rgba(13, 17, 23, 0.6);
      border-radius: 0 0 12px 12px;
    }
    
    .faq-item.active .faq-answer {
      max-height: 300px;
      opacity: 1;
      margin-top: 12px;
    }
    
    .faq-answer-content {
      color: var(--text-secondary);
      line-height: 1.7;
      font-size: 16px;
      padding-top: 4px;
    }
    
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 25%, #0f1419 50%, #1a1f2e 75%, #0a0e1a 100%);
    }
    
    .hero-content-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      position: relative;
      z-index: 5;
      width: 100%;
    }
    
    /* Premium Background System */
    .hero-bg-premium {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .bg-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
    }
    
    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }
    
    /* Floating Particles */
    .floating-particles {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--primary-color);
      border-radius: 50%;
      opacity: 0.6;
      animation: particleFloat 15s ease-in-out infinite;
    }
    
    .particle-1 { top: 20%; left: 10%; animation-delay: 0s; }
    .particle-2 { top: 40%; left: 80%; animation-delay: -3s; }
    .particle-3 { top: 70%; left: 20%; animation-delay: -6s; }
    .particle-4 { top: 30%; left: 70%; animation-delay: -9s; }
    .particle-5 { top: 80%; left: 60%; animation-delay: -12s; }
    .particle-6 { top: 10%; left: 50%; animation-delay: -15s; }
    
    @keyframes particleFloat {
      0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
      25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
      50% { transform: translateY(-10px) translateX(-15px); opacity: 0.8; }
      75% { transform: translateY(-30px) translateX(5px); opacity: 0.9; }
    }
    
    /* Gradient Blobs */
    .gradient-blobs {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      animation: blobFloat 25s ease-in-out infinite;
    }
    
    .blob-1 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(0, 212, 170, 0.15) 0%, transparent 70%);
      top: -150px;
      left: -150px;
      animation-delay: 0s;
    }
    
    .blob-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(0, 212, 170, 0.1) 0%, transparent 70%);
      bottom: -200px;
      right: -200px;
      animation-delay: -8s;
    }
    
    .blob-3 {
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -16s;
    }
    
    @keyframes blobFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
    
    /* Light Rays */
    .light-rays {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    
    .ray {
      position: absolute;
      background: linear-gradient(45deg, transparent, rgba(0, 212, 170, 0.1), transparent);
      animation: raySweep 30s linear infinite;
    }
    
    .ray-1 {
      width: 200px;
      height: 2px;
      top: 30%;
      left: -200px;
      animation-delay: 0s;
    }
    
    .ray-2 {
      width: 150px;
      height: 2px;
      top: 60%;
      left: -150px;
      animation-delay: -10s;
    }
    
    .ray-3 {
      width: 250px;
      height: 2px;
      top: 80%;
      left: -250px;
      animation-delay: -20s;
    }
    
    @keyframes raySweep {
      0% { transform: translateX(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateX(calc(100vw + 300px)); opacity: 0; }
    }
    
    /* Animated Background Elements */
    
    .hero-content-premium {
      display: flex;
      flex-direction: column;
      gap: 60px;
      align-items: stretch;
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }
    
    /* Premium Badge */
    .premium-badge {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 212, 170, 0.3);
      border-radius: 20px;
      padding: 16px 28px;
      margin-bottom: 40px;
      backdrop-filter: blur(30px);
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(0, 212, 170, 0.1);
      animation: badgeFloat 6s ease-in-out infinite;
      overflow: hidden;
    }
    
    .badge-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.1), transparent);
      animation: badgeGlow 3s ease-in-out infinite;
    }
    
    .badge-content {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 2;
    }
    
    .badge-icon-premium {
      width: 32px;
      height: 32px;
      color: var(--primary-color);
      filter: drop-shadow(0 4px 8px rgba(0, 212, 170, 0.3));
      animation: iconPulse 2s ease-in-out infinite;
    }
    
    .badge-text-premium {
      display: flex;
      flex-direction: column;
    }
    
    .badge-title {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-primary);
      line-height: 1.2;
    }
    
    .badge-subtitle {
      font-weight: 500;
      font-size: 12px;
      color: var(--primary-color);
      line-height: 1.2;
    }
    
    @keyframes badgeFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    
    @keyframes badgeGlow {
      0% { left: -100%; }
      50% { left: 100%; }
      100% { left: 100%; }
    }
    
    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    /* Premium Hero Title */
    .hero-title-premium {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 4.5vw, 3.2rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 24px;
      text-align: left;
    }
    
    .title-line-1 {
      display: block;
      color: var(--text-primary);
      margin-bottom: 6px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      font-size: 0.9em;
    }
    
    .title-line-2 {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      font-size: 1.1em;
    }
    
    .gradient-text-premium {
      background: linear-gradient(135deg, #00d4aa 0%, #00b894 50%, #00d4aa 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 4s ease-in-out infinite;
      filter: drop-shadow(0 4px 8px rgba(0, 212, 170, 0.3));
    }
    
    .title-highlight {
      color: var(--text-primary);
      position: relative;
      display: inline-block;
    }
    
    .title-highlight::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 4px;
      background: var(--primary-gradient);
      border-radius: 2px;
      animation: underlineGlow 2s ease-in-out infinite;
    }
    
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    @keyframes underlineGlow {
      0%, 100% { box-shadow: 0 0 5px rgba(0, 212, 170, 0.5); }
      50% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.8); }
    }
    
    /* Premium Subtitle */
    .hero-subtitle-premium {
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: var(--text-secondary);
      margin-bottom: 36px;
      line-height: 1.6;
      max-width: 580px;
    }
    
    .hero-subtitle-premium strong {
      color: var(--primary-color);
      font-weight: 700;
    }
    
    .highlight-number {
      color: var(--primary-color);
      font-weight: 800;
      font-size: 1.1em;
      text-shadow: 0 2px 4px rgba(0, 212, 170, 0.3);
    }
    
    
    
    /* Premium Features Grid */
    /* Features and Video Layout */
    .features-video-layout {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 60px;
      align-items: center;
      margin-bottom: 32px;
      width: 100%;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .features-grid-premium {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .feature-item-premium {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0, 212, 170, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      min-height: 60px;
    }
    
    .feature-item-premium::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.1), transparent);
      transition: left 0.6s ease;
    }
    
    .feature-item-premium:hover::before {
      left: 100%;
    }
    
    .feature-item-premium:hover {
      transform: translateY(-3px) scale(1.02);
      border-color: rgba(0, 212, 170, 0.4);
      box-shadow: 0 8px 20px rgba(0, 212, 170, 0.15);
    }
    
    .feature-icon-premium {
      width: 20px;
      height: 20px;
      color: var(--primary-color);
      filter: drop-shadow(0 1px 2px rgba(0, 212, 170, 0.3));
      flex-shrink: 0;
      font-size: 16px;
    }
    
    .feature-item-premium:nth-child(1) .feature-icon-premium { animation-delay: 0s; }
    .feature-item-premium:nth-child(2) .feature-icon-premium { animation-delay: -0.5s; }
    .feature-item-premium:nth-child(3) .feature-icon-premium { animation-delay: -1s; }
    .feature-item-premium:nth-child(4) .feature-icon-premium { animation-delay: -1.5s; }
    
    .feature-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .feature-title {
      font-weight: 700;
      font-size: 14px;
      color: white;
      line-height: 1.2;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.2px;
    }
    
    .feature-desc {
      font-weight: 500;
      font-size: 12px;
      color: rgba(0, 212, 170, 0.8);
      line-height: 1.3;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    @keyframes iconFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3px); }
    }
    
    /* Premium CTA Section */
    .cta-section-premium {
      text-align: center;
      margin: 60px 0 40px;
      position: relative;
      z-index: 10;
    }
    
    .cta-primary {
      margin-bottom: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .btn-premium-primary {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      border: none;
      border-radius: 16px;
      padding: 0;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      min-width: 320px;
      font-family: var(--font-primary);
      margin: 0 auto;
      box-shadow: 0 8px 25px rgba(0, 212, 170, 0.2);
    }
    
    .btn-bg-premium {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #00d4aa 0%, #00b894 50%, #00a085 100%);
      border-radius: 16px;
      transition: all 0.3s ease;
      box-shadow: 
        0 8px 25px rgba(0, 212, 170, 0.3),
        0 0 0 2px rgba(255, 255, 255, 0.1),
        inset 0 2px 0 rgba(255, 255, 255, 0.3);
    }
    
    .btn-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 36px;
      width: 100%;
      justify-content: center;
    }
    
    .btn-icon-premium {
      width: 22px;
      height: 22px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn-icon-premium svg {
      width: 16px;
      height: 16px;
    }
    
    .btn-text-premium {
      color: white;
      font-weight: 700;
      font-size: 17px;
      letter-spacing: 0.4px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      text-transform: uppercase;
    }
    
    .btn-arrow {
      color: white;
      font-size: 18px;
      font-weight: 800;
      transition: transform 0.3s ease;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      margin-left: 4px;
    }
    
    .btn-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
      transition: left 0.6s ease;
      border-radius: 16px;
    }
    
    .btn-premium-primary:hover .btn-bg-premium {
      transform: translateY(-3px);
      box-shadow: 
        0 15px 40px rgba(0, 212, 170, 0.4),
        0 0 0 3px rgba(255, 255, 255, 0.2),
        inset 0 2px 0 rgba(255, 255, 255, 0.4);
    }
    
    .btn-premium-primary:hover .btn-arrow {
      transform: translateX(5px);
    }
    
    .btn-premium-primary:hover .btn-shine {
      left: 100%;
    }
    
    .btn-premium-primary:active {
      transform: translateY(2px);
    }
    
    @keyframes gradientFlow {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    /* Trust Indicators */
    .trust-indicators {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      padding: 24px 32px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .trust-item {
      text-align: center;
    }
    
    .trust-number {
      display: block;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 800;
      color: var(--primary-color);
      line-height: 1;
      margin-bottom: 4px;
      text-shadow: 0 2px 4px rgba(0, 212, 170, 0.3);
    }
    
    .trust-label {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    
    .trust-divider {
      width: 1px;
      height: 32px;
      background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
    }
    
    
    /* Premium Video Showcase */
    .hero-right-premium {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .video-showcase-premium {
      position: relative;
      max-width: 600px;
      width: 100%;
    }
    
    .video-container-premium {
      position: relative;
      margin-bottom: 40px;
    }
    
    .video-frame-premium {
      position: relative;
      border-radius: 32px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(0, 212, 170, 0.2);
      box-shadow: 
        0 40px 80px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(0, 212, 170, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(30px);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      animation: frameGlow 4s ease-in-out infinite;
    }
    
    .video-frame-premium:hover {
      transform: translateY(-12px) scale(1.02);
      border-color: rgba(0, 212, 170, 0.4);
      box-shadow: 
        0 60px 120px rgba(0, 212, 170, 0.2),
        0 0 0 2px rgba(0, 212, 170, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    
    @keyframes frameGlow {
      0%, 100% { 
        box-shadow: 
          0 40px 80px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(0, 212, 170, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      50% { 
        box-shadow: 
          0 50px 100px rgba(0, 212, 170, 0.1),
          0 0 0 1px rgba(0, 212, 170, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }
    }
    
    .video-overlay-premium {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
      z-index: 1;
    }
    
    .video-image-premium {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.5s ease;
    }
    
    .video-frame-premium:hover .video-image-premium {
      transform: scale(1.05);
    }
    
    /* Premium Video Badge */
    .video-badge-premium {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(0, 212, 170, 0.4);
      border-radius: 16px;
      padding: 12px 20px;
      z-index: 10;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(0, 212, 170, 0.2);
      animation: glowPulse 3s ease-in-out infinite;
    }
    
    .badge-glow-premium {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 212, 170, 0.1), transparent);
      border-radius: 16px;
      animation: glowPulse 3s ease-in-out infinite;
    }
    
    .video-badge-premium .badge-text-premium {
      position: relative;
      z-index: 2;
      color: white;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    @keyframes glowPulse {
      0%, 100% { 
        transform: scale(1); 
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(0, 212, 170, 0.2);
      }
      50% { 
        transform: scale(1.05); 
        box-shadow: 
          0 25px 50px rgba(0, 0, 0, 0.5),
          0 0 0 2px rgba(0, 212, 170, 0.4);
      }
    }
    
    /* Premium Play Button */
    .play-button-premium {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      cursor: pointer;
      z-index: 4;
    }
    
    .play-ring-1, .play-ring-2, .play-ring-3 {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(0, 212, 170, 0.3);
      border-radius: 50%;
      animation: ringPulse 2s ease-in-out infinite;
    }
    
    .play-ring-1 {
      width: 100%;
      height: 100%;
      animation-delay: 0s;
    }
    
    .play-ring-2 {
      width: 120%;
      height: 120%;
      animation-delay: -0.5s;
      opacity: 0.6;
    }
    
    .play-ring-3 {
      width: 140%;
      height: 140%;
      animation-delay: -1s;
      opacity: 0.3;
    }
    
    .play-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background: rgba(0, 212, 170, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 20px 40px rgba(0, 212, 170, 0.4),
        0 0 0 4px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.4s ease;
      z-index: 5;
    }
    
    .play-core svg {
      width: 32px;
      height: 32px;
      fill: white;
      margin-left: 4px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    
    .play-button-premium:hover .play-core {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 
        0 25px 50px rgba(0, 212, 170, 0.5),
        0 0 0 6px rgba(255, 255, 255, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      background: rgba(0, 212, 170, 1);
    }
    
    @keyframes ringPulse {
      0% { 
        transform: translate(-50%, -50%) scale(1); 
        opacity: 0.7; 
      }
      50% { 
        transform: translate(-50%, -50%) scale(1.2); 
        opacity: 0.3; 
      }
      100% { 
        transform: translate(-50%, -50%) scale(1.4); 
        opacity: 0; 
      }
    }
    
    /* Video Stats Premium */
    .video-stats-premium {
      position: absolute;
      bottom: 24px;
      right: 24px;
      display: flex;
      gap: 12px;
      z-index: 3;
    }
    
    .stat-card-premium {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 212, 170, 0.2);
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      animation: statFloat 4s ease-in-out infinite;
    }
    
    .stat-card-premium:nth-child(2) {
      animation-delay: -2s;
    }
    
    .stat-icon-premium {
      font-size: 16px;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
    }
    
    .stat-content-premium {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value-premium {
      font-size: 12px;
      font-weight: 700;
      color: var(--primary-color);
      line-height: 1;
    }
    
    .stat-label-premium {
      font-size: 10px;
      color: var(--text-muted);
      line-height: 1;
    }
    
    @keyframes statFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    
    /* Feature Badges Inside Video */
    .video-feature-badges {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 8;
    }
    
    .feature-badge {
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid rgba(0, 212, 170, 0.4);
      border-radius: 12px;
      padding: 8px 12px;
      backdrop-filter: blur(20px);
      box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(0, 212, 170, 0.1);
      animation: featureBadgeFloat 6s ease-in-out infinite;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    }
    
    .feature-badge-1 {
      top: 15%;
      right: 15%;
      animation-delay: 0s;
    }
    
    .feature-badge-2 {
      bottom: 35%;
      left: 15%;
      animation-delay: -2s;
    }
    
    .feature-badge-3 {
      top: 50%;
      right: 10%;
      animation-delay: -4s;
    }
    
    .feature-badge-icon {
      font-size: 16px;
      filter: drop-shadow(0 2px 4px rgba(0, 212, 170, 0.4));
    }
    
    .feature-badge-text {
      color: white;
      font-size: 12px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      letter-spacing: 0.3px;
    }
    
    @keyframes featureBadgeFloat {
      0%, 100% { 
        transform: translateY(0px) scale(1); 
        opacity: 0.9; 
        box-shadow: 
          0 8px 24px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(0, 212, 170, 0.1);
      }
      50% { 
        transform: translateY(-3px) scale(1.02); 
        opacity: 1; 
        box-shadow: 
          0 12px 32px rgba(0, 212, 170, 0.2),
          0 0 0 2px rgba(0, 212, 170, 0.2);
      }
    }
    
    /* Our Program Seen On Section */
    .program-seen-on-section {
      text-align: center;
      margin: 60px 0;
      padding: 40px 0;
      background: rgba(0, 212, 170, 0.05);
      border-radius: 20px;
      border: 1px solid rgba(0, 212, 170, 0.2);
      overflow: hidden;
      position: relative;
    }
    
    .seen-on-title {
      font-size: 1.2rem;
      color: var(--text-secondary);
      margin-bottom: 30px;
      font-weight: 500;
    }
    
    .logos-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 100%;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
      padding: 0 20px;
    }
    
    .logo-line {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 30px;
      overflow: hidden;
      white-space: nowrap;
      width: 100%;
      height: 60px;
      position: relative;
    }
    
    .logo-line-1 {
      animation: slideRightToLeft 25s linear infinite;
    }
    
    .logo-line-2 {
      animation: slideLeftToRight 25s linear infinite;
    }
    
    .logo-item {
      background: rgba(255, 255, 255, 0.08);
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid rgba(0, 212, 170, 0.2);
      color: var(--text-secondary);
      font-weight: 600;
      white-space: nowrap;
      min-width: 100px;
      text-align: center;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .logo-item:hover {
      background: rgba(0, 212, 170, 0.1);
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    
    @keyframes slideRightToLeft {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    
    @keyframes slideLeftToRight {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    /* Pain Points Section */
    .pain-points-section {
      padding: 80px 0;
      background: transparent;
      position: relative;
    }
    
    .pain-points-content {
      position: relative;
      z-index: 2;
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }
    
    .pain-points-headline {
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 40px;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* Lifestyle Icons */
    .lifestyle-icons {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 50px;
      flex-wrap: wrap;
    }
    
    .lifestyle-icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 212, 170, 0.2);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      min-width: 100px;
    }
    
    .lifestyle-icon-item:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 212, 170, 0.4);
      box-shadow: 0 10px 20px rgba(0, 212, 170, 0.15);
    }
    
    .lifestyle-icon-item .icon {
      font-size: 2rem;
      margin-bottom: 4px;
    }
    
    .lifestyle-icon-item span {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 600;
    }
    
    /* Pain Points List */
    .pain-points-list {
      margin-bottom: 50px;
    }
    
    .pain-point-item {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 25px 30px;
      margin-bottom: 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(0, 212, 170, 0.15);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      text-align: left;
    }
    
    .pain-point-item:hover {
      transform: translateX(10px);
      border-color: rgba(0, 212, 170, 0.3);
      box-shadow: 0 8px 20px rgba(0, 212, 170, 0.1);
    }
    
    .pain-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .pain-text {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.6;
      font-weight: 500;
    }
    
    /* Transition Text */
    .transition-text {
      margin-bottom: 40px;
      text-align: center;
    }
    
    .transition-main {
      font-size: clamp(1.2rem, 2.5vw, 1.6rem);
      color: var(--text-primary);
      margin-bottom: 20px;
      font-weight: 600;
      line-height: 1.4;
    }
    
    .transition-sub {
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: var(--text-secondary);
      margin-bottom: 20px;
      line-height: 1.6;
    }
    
    .transition-cta-text {
      font-size: 16px;
      color: var(--primary-color);
      font-weight: 600;
      margin-bottom: 0;
    }
    
    .highlight-text {
      color: var(--primary-color);
      font-weight: 800;
      text-shadow: 0 2px 4px rgba(0, 212, 170, 0.3);
    }
    
    .highlight-number {
      color: var(--primary-color);
      font-weight: 800;
      font-size: 1.1em;
      text-shadow: 0 2px 4px rgba(0, 212, 170, 0.3);
    }
    
    /* Pain Points CTA Button */
    .pain-points-cta {
      text-align: center;
    }
    
    .btn-pain-points {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 18px 36px;
      background: var(--primary-gradient);
      border: none;
      border-radius: 50px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 20px rgba(0, 212, 170, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .btn-pain-points::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.6s ease;
    }
    
    .btn-pain-points:hover::before {
      left: 100%;
    }
    
    .btn-pain-points:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 30px rgba(0, 212, 170, 0.4);
    }
    
    .btn-pain-points:active {
      transform: translateY(-1px) scale(1.02);
    }
    
    .btn-icon {
      font-size: 14px;
    }
    
    .btn-text {
      font-weight: 700;
    }
    
    /* What You'll Discover Section */
    .discover-section {
      padding: 80px 0;
      background: transparent;
      position: relative;
    }
    
    .discover-content {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
    }
    
    .discover-headline {
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 50px;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* Discovery Bullets */
    .discovery-bullets {
      display: grid;
      grid-template-columns: 1fr;
      gap: 25px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    .discovery-item {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 30px 35px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 212, 170, 0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      text-align: left;
      position: relative;
      overflow: hidden;
    }
    
    .discovery-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.05), transparent);
      transition: left 0.6s ease;
    }
    
    .discovery-item:hover::before {
      left: 100%;
    }
    
    .discovery-item:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 212, 170, 0.4);
      box-shadow: 0 15px 30px rgba(0, 212, 170, 0.15);
    }
    
    .discovery-icon {
      width: 24px;
      height: 24px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
    }
    
    .discovery-icon svg {
      width: 14px;
      height: 14px;
      color: white;
    }
    
    .discovery-text {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.6;
      font-weight: 500;
    }
    
    .discovery-highlight {
      color: var(--primary-color);
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 212, 170, 0.3);
    }
    
    .discovery-number {
      color: var(--primary-color);
      font-weight: 800;
      font-size: 1.05em;
      text-shadow: 0 1px 2px rgba(0, 212, 170, 0.3);
    }
    
    /* Coach Bio Section */
    .coach-bio-section {
      padding: 80px 0;
      background: transparent;
      position: relative;
    }
    
    .coach-bio-content {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
    }
    
    .coach-bio-headline {
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 60px;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* Coach Profile */
    .coach-profile {
      margin-bottom: 50px;
    }
    
    .coach-photo-container {
      margin-bottom: 30px;
    }
    
    .coach-photo-frame {
      position: relative;
      display: inline-block;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .coach-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    
    .photo-border {
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 50%;
      background: var(--primary-gradient);
      z-index: -1;
      animation: borderGlow 3s ease-in-out infinite;
    }
    
    @keyframes borderGlow {
      0%, 100% { 
        box-shadow: 0 0 20px rgba(0, 212, 170, 0.4);
      }
      50% { 
        box-shadow: 0 0 30px rgba(0, 212, 170, 0.6);
      }
    }
    
    .coach-info {
      text-align: center;
    }
    
    .coach-name {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 10px;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .coach-tagline {
      font-size: 18px;
      color: var(--primary-color);
      font-weight: 600;
      margin-bottom: 0;
      text-shadow: 0 1px 2px rgba(0, 212, 170, 0.3);
    }
    
    /* Bio Text */
    .coach-bio-text {
      max-width: 700px;
      margin: 0 auto 50px;
      text-align: center;
    }
    
    .bio-paragraph {
      font-size: 16px;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .bio-highlight {
      color: var(--primary-color);
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 212, 170, 0.3);
    }
    
    /* What Makes This Different */
    .what-makes-different {
      margin-top: 50px;
    }
    
    .different-headline {
      font-size: clamp(1.3rem, 2.5vw, 1.8rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 30px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .different-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .different-card {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 25px 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 212, 170, 0.2);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      text-align: left;
    }
    
    .different-card:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 212, 170, 0.4);
      box-shadow: 0 15px 30px rgba(0, 212, 170, 0.15);
    }
    
    .card-icon {
      width: 24px;
      height: 24px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
    }
    
    .card-icon svg {
      width: 14px;
      height: 14px;
      color: white;
    }
    
    .card-content {
      flex: 1;
    }
    
    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
      line-height: 1.2;
    }
    
    .card-text {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 0;
      line-height: 1.3;
    }
    
    /* Benefits/Features Icon Grid Section */
    .benefits-grid-section {
      padding: 80px 0;
      background: transparent;
      position: relative;
    }
    
    .benefits-grid-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    
    .benefits-grid-headline {
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 60px;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* Benefits Icon Grid */
    .benefits-icon-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .benefit-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 30px 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 212, 170, 0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .benefit-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.05), transparent);
      transition: left 0.6s ease;
    }
    
    .benefit-item:hover::before {
      left: 100%;
    }
    
    .benefit-item:hover {
      transform: translateY(-10px);
      border-color: rgba(0, 212, 170, 0.4);
      box-shadow: 0 20px 40px rgba(0, 212, 170, 0.15);
    }
    
    .benefit-icon {
      width: 80px;
      height: 80px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 25px;
      box-shadow: 0 10px 20px rgba(0, 212, 170, 0.3);
      position: relative;
      z-index: 2;
    }
    
    .icon-emoji {
      font-size: 2.5rem;
      line-height: 1;
    }
    
    .benefit-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 15px;
      line-height: 1.3;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .benefit-description {
      font-size: 15px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 0;
      font-weight: 500;
    }
    
    /* Background Feature Badges */
    .background-feature-badges {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 3;
    }
    
    .bg-feature-badge {
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(0, 212, 170, 0.3);
      border-radius: 16px;
      padding: 12px 16px;
      backdrop-filter: blur(20px);
      box-shadow: 
        0 15px 35px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(0, 212, 170, 0.1);
      animation: bgFeatureFloat 8s ease-in-out infinite;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 140px;
      transition: all 0.3s ease;
    }
    
    .bg-feature-badge:hover {
      transform: translateY(-5px) scale(1.05);
      border-color: rgba(0, 212, 170, 0.5);
      box-shadow: 
        0 20px 45px rgba(0, 212, 170, 0.2),
        0 0 0 2px rgba(0, 212, 170, 0.2);
    }
    
    .bg-feature-badge-1 {
      top: 20%;
      right: 8%;
      animation-delay: 0s;
    }
    
    .bg-feature-badge-2 {
      bottom: 30%;
      left: 8%;
      animation-delay: -3s;
    }
    
    .bg-feature-badge-3 {
      top: 55%;
      right: 12%;
      animation-delay: -6s;
    }
    
    .bg-feature-icon {
      font-size: 20px;
      filter: drop-shadow(0 2px 4px rgba(0, 212, 170, 0.4));
    }
    
    .bg-feature-text {
      color: white;
      font-size: 14px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      letter-spacing: 0.5px;
    }
    
    @keyframes bgFeatureFloat {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
        opacity: 0.8; 
        box-shadow: 
          0 15px 35px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(0, 212, 170, 0.1);
      }
      25% { 
        transform: translateY(-8px) rotate(1deg); 
        opacity: 1; 
        box-shadow: 
          0 20px 45px rgba(0, 212, 170, 0.15),
          0 0 0 2px rgba(0, 212, 170, 0.15);
      }
      50% { 
        transform: translateY(-4px) rotate(-0.5deg); 
        opacity: 0.9; 
        box-shadow: 
          0 18px 40px rgba(0, 0, 0, 0.45),
          0 0 0 1px rgba(0, 212, 170, 0.12);
      }
      75% { 
        transform: translateY(-12px) rotate(0.5deg); 
        opacity: 1; 
        box-shadow: 
          0 25px 50px rgba(0, 212, 170, 0.1),
          0 0 0 2px rgba(0, 212, 170, 0.18);
      }
    }
    
    /* Floating Elements */
    .floating-elements {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    
    
    
    .features-section {
      background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #0a0e1a 100%);
      padding: 120px 0;
      position: relative;
      overflow: hidden;
    }

    .features-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 25% 25%, rgba(0, 212, 170, 0.06) 0%, transparent 60%),
        radial-gradient(circle at 75% 75%, rgba(0, 212, 170, 0.04) 0%, transparent 60%);
      pointer-events: none;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }
    
    .feature-card {
      background: linear-gradient(145deg, rgba(26, 32, 44, 0.95) 0%, rgba(33, 38, 45, 0.9) 100%);
      border: 2px solid rgba(0, 212, 170, 0.15);
      border-radius: 24px;
      padding: 48px 32px;
      text-align: center;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      min-height: 380px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(0, 212, 170, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(25px);
    }
    
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.1), transparent);
      transition: left 0.6s ease;
      z-index: 1;
    }
    
    .feature-card:hover::before {
      left: 100%;
    }
    
    .feature-card:hover {
      transform: translateY(-15px) scale(1.02);
      border-color: rgba(0, 212, 170, 0.4);
      box-shadow: 
        0 30px 60px rgba(0, 212, 170, 0.25),
        0 0 0 2px rgba(0, 212, 170, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
    
    .feature-icon {
      margin-bottom: 28px;
      display: inline-block;
      filter: drop-shadow(0 6px 12px rgba(0, 212, 170, 0.4));
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 2;
      color: var(--primary-color);
    }

    .feature-icon svg {
      width: 4rem;
      height: 4rem;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.5;
    }

    .feature-card:hover .feature-icon {
      transform: scale(1.15) translateY(-5px);
      filter: drop-shadow(0 8px 16px rgba(0, 212, 170, 0.6));
    }
    
    .feature-title {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 20px;
      line-height: 1.3;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 2;
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .feature-card:hover .feature-title {
      background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 8px rgba(0, 212, 170, 0.4);
    }
    
    .feature-description {
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.7;
      font-weight: 500;
      position: relative;
      z-index: 2;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .feature-card:hover .feature-description {
      color: var(--text-primary);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .process-steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .process-card {
      background: var(--card-gradient);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 40px 32px;
      text-align: center;
      position: relative;
      transition: var(--transition);
      min-height: 280px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .process-card:hover {
      transform: translateY(-6px);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-lg);
    }
    
    .process-number {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 30px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      box-shadow: var(--shadow-md);
    }
    
    .process-icon {
      display: inline-block;
      margin-bottom: 20px;
      color: var(--primary-color);
    }

    .process-icon svg {
      width: 3rem;
      height: 3rem;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.5;
    }
    
    .process-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    .process-description {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
    }
    
    .section-title {
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      text-align: center;
      margin-bottom: 24px;
      line-height: 1.2;
      color: var(--text-primary);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: var(--primary-gradient);
      border-radius: 2px;
    }
    
    .section-subtitle {
      font-size: clamp(1.1rem, 2vw, 1.3rem);
      color: var(--text-muted);
      text-align: center;
      max-width: 700px;
      margin: 0 auto 60px auto;
      font-weight: 400;
      line-height: 1.6;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .access-form-section {
      background: var(--bg-secondary);
      position: relative;
    }
    
    .access-form-container {
      max-width: 600px;
      margin: 0 auto;
      background: var(--card-gradient);
      backdrop-filter: blur(30px);
      border: 2px solid var(--primary-color);
      border-radius: var(--radius-xl);
      padding: 48px 40px;
      box-shadow: var(--shadow-glow);
      text-align: center;
    }
    
    .form-title {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
      line-height: 1.2;
    }
    
    .form-subtitle {
      font-size: 1rem;
      color: var(--warning-color);
      margin-bottom: 32px;
      font-weight: 600;
    }
    
    .form-benefits {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
      text-align: left;
    }
    
    .form-benefit {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.4;
      gap: 12px;
    }
    
    .form-benefit svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
    
    .authority-section {
      background: var(--bg-secondary);
      position: relative;
    }
    
    .authority-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 60px;
      align-items: center;
    }
    
    .coach-profile {
      text-align: center;
    }
    
    .coach-image {
      width: 250px;
      height: 250px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid var(--primary-color);
      box-shadow: var(--shadow-glow);
      margin: 0 auto 24px auto;
    }
    
    .coach-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .coach-name {
      font-family: var(--font-display);
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .coach-title {
      color: var(--primary-color);
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 24px;
    }
    
    .authority-content {
      padding-left: 20px;
    }
    
    .authority-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      margin-top: 40px;
      text-align: center;
    }
    
    .authority-stat {
      padding: 24px;
      background: var(--card-gradient);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      transition: var(--transition);
    }
    
    .authority-stat:hover {
      transform: translateY(-4px);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
    }
    
    .authority-stat-number {
      font-family: var(--font-display);
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--primary-color);
      display: block;
      margin-bottom: 8px;
    }
    
    .authority-stat-label {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 500;
      line-height: 1.4;
    }

    .authority-content ul li {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }

    .authority-content ul li svg {
      width: 18px;
      height: 18px;
      stroke: var(--primary-color);
      flex-shrink: 0;
    }
    
    .footer {
      background: var(--bg-tertiary);
      padding: 80px 0 40px 0;
      text-align: center;
      border-top: 1px solid var(--border-color);
    }
    
    .footer-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .footer-title {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 20px;
    }
    
    .footer-email {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      margin-bottom: 32px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
    }

    .footer-email svg {
      width: 24px;
      height: 24px;
      stroke: var(--primary-color);
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }
    
    .footer-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 15px;
      transition: var(--transition);
    }
    
    .footer-link:hover {
      color: var(--primary-color);
    }
    
    .disclaimers {
      background: var(--card-gradient);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 40px 32px;
      margin-top: 40px;
      text-align: left;
      max-width: 1000px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .disclaimer-section {
      margin-bottom: 24px;
    }
    
    .disclaimer-title {
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      font-size: 15px;
    }
    
    .disclaimer-text {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
    }
    
    /* Laptop optimization */
    @media (min-width: 1024px) and (max-width: 1440px) {
      .container {
        max-width: 1000px;
        padding: 0 30px;
      }
      
      .hero-content-premium {
        gap: 40px;
      }
      
      .authority-grid {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
      }
      
      .authority-content {
        padding-left: 0;
      }
    }
    
    @media (max-width: 1200px) {
      .container {
        padding: 0 20px;
      }
      
      .hero-content-premium {
        gap: 40px;
      }
      
      .hero-content-container {
        padding: 35px 0;
      }
      
      .hero-content-premium {
        padding: 35px 0;
      }
      
      .features-grid {
        gap: 24px;
      }
      
      .authority-grid {
        gap: 40px;
      }
      
      .video-showcase-premium {
        max-width: 500px;
      }
      
      .service-features {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .benefits-circle {
        width: 350px;
        height: 350px;
      }
      
      .benefit-point {
        width: 160px;
        height: 100px;
        font-size: 13px;
      }
      
      .transformations-grid {
        grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
        gap: 50px;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 350px;
      }
      
      /* Large tablet/small desktop optimizations */
      .authority-section {
        padding: 100px 0;
      }
      
      .authority-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 35px;
      }
      
      .authority-card {
        padding: 35px 25px;
      }
      
      .authority-image {
        width: 130px;
        height: 130px;
        margin-bottom: 20px;
      }
      
      .authority-name {
        font-size: 1.7rem;
        margin-bottom: 10px;
      }
      
      .authority-title {
        font-size: 1rem;
        margin-bottom: 18px;
      }
      
      .authority-stats {
        gap: 25px;
      }
      
      .authority-stat-number {
        font-size: 1.8rem;
      }
      
      .authority-stat-label {
        font-size: 0.85rem;
      }
      
      .features-section {
        padding: 100px 0;
      }
      
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 25px;
      }
      
      .feature-card {
        padding: 35px 25px;
        min-height: 300px;
      }
      
      .feature-title {
        font-size: 1.4rem;
        margin-bottom: 18px;
      }
      
      .feature-description {
        font-size: 1rem;
        line-height: 1.6;
      }
      
      .benefits-section {
        padding: 100px 0;
      }
      
      /* Desktop/Laptop - No Experience Section */
      .no-experience-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 28px;
      }
      
      .no-exp-card {
        width: 200px;
        min-height: 130px;
      }
      
      .no-exp-center-circle {
        width: 220px;
        height: 220px;
      }
      
      .circle-middle {
        width: 165px;
        height: 165px;
      }
      
      .circle-inner {
        width: 120px;
        height: 120px;
      }
      
      /* Verification Section - Desktop */
      .verification-section {
        padding: 90px 0;
      }
      
      .verification-cards-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      
      /* Simple System Section - Desktop */
      .simple-system-section {
        padding: 90px 0;
      }
      
      /* FAQ Section - Desktop */
      .faq-section {
        padding: 90px 0;
      }
      
      .transformations-section {
        padding: 100px 0;
      }
      
      .transformations-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 35px;
      }
      
      .transformation-image {
        height: 280px;
      }
      
      .transformation-content {
        padding: 25px;
      }
      
      .transformation-title {
        font-size: 1.3rem;
        margin-bottom: 12px;
      }
      
      .transformation-description {
        font-size: 1rem;
        line-height: 1.6;
      }
      
      .testimonials-section {
        padding: 100px 0;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 380px;
        margin-right: 25px;
      }
      
      .testimonial-scroll-video {
        height: 240px;
      }
      
      .testimonial-scroll-content {
        padding: 30px;
      }
      
      .testimonial-scroll-text {
        font-size: 1rem;
        line-height: 1.6;
      }
      
      .testimonial-scroll-author {
        font-size: 0.95rem;
      }
      
      .testimonial-scroll-role {
        font-size: 0.85rem;
      }
      
      .faq-section {
        padding: 100px 0;
      }
      
      .faq-container {
        max-width: 900px;
        margin: 0 auto;
      }
      
      .faq-question {
        padding: 22px 18px;
        font-size: 17px;
      }
      
      .faq-answer-content {
        font-size: 15px;
        line-height: 1.6;
      }
      
      .footer {
        padding: 70px 0;
      }
      
      .footer-content {
        gap: 50px;
      }
      
      .footer-links {
        gap: 35px;
      }
      
      .footer-bottom {
        gap: 35px;
      }
    }
    
    @media (max-width: 991.98px) {
      .hero-content-premium {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 50px;
      }
      
      .hero-content-container {
        padding: 25px 0;
      }
      
      .hero-content-premium {
        padding: 25px 0;
      }
      
      .hero-left-premium {
        text-align: center;
      }
      
      .video-showcase-premium {
        max-width: 500px;
        margin: 0 auto;
      }
      
      .features-video-layout {
        grid-template-columns: 1fr;
        gap: 40px;
        max-width: 100%;
      }
      
      .features-grid-premium {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .feature-item-premium {
        padding: 16px 20px;
        justify-content: center;
      }
      
      .btn-premium-primary {
        min-width: 280px;
        margin: 0 auto;
      }
      
      .btn-content {
        padding: 18px 32px;
        gap: 10px;
      }
      
      .btn-text-premium {
        font-size: 15px;
        letter-spacing: 0.3px;
      }
      
      .btn-icon-premium {
        width: 20px;
        height: 20px;
      }
      
      .btn-icon-premium svg {
        width: 14px;
        height: 14px;
      }
      
      .btn-arrow {
        font-size: 16px;
      }
      
      .trust-indicators {
        gap: 24px;
        padding: 20px 24px;
      }
      
      .trust-number {
        font-size: 18px;
      }
      
      .trust-label {
        font-size: 10px;
      }
      
      .video-frame-premium {
        border-radius: 24px;
      }
      
      .play-button-premium {
        width: 80px;
        height: 80px;
      }
      
      .play-core {
        width: 60px;
        height: 60px;
      }
      
      .play-core svg {
        width: 24px;
        height: 24px;
      }
      
      .background-feature-badges {
        display: block;
      }
      
      .bg-feature-badge {
        padding: 8px 12px;
        min-width: 120px;
      }
      
      .bg-feature-badge-1 {
        top: 15%;
        right: 5%;
      }
      
      .bg-feature-badge-2 {
        bottom: 25%;
        left: 5%;
      }
      
      .bg-feature-badge-3 {
        top: 50%;
        right: 8%;
      }
      
      .bg-feature-icon {
        font-size: 16px;
      }
      
      .bg-feature-text {
        font-size: 12px;
      }
      
      .video-showcase-premium {
        margin: 0 auto;
      }
      
      /* Tablet-specific optimizations */
      .authority-section {
        padding: 80px 0;
      }
      
      .authority-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
      }
      
      .authority-card {
        padding: 40px 30px;
        text-align: center;
      }
      
      .authority-image {
        width: 140px;
        height: 140px;
        margin: 0 auto 25px;
      }
      
      .authority-name {
        font-size: 1.8rem;
        margin-bottom: 12px;
      }
      
      .authority-title {
        font-size: 1.1rem;
        margin-bottom: 20px;
      }
      
      .authority-stats {
        gap: 30px;
        justify-content: center;
      }
      
      .authority-stat-number {
        font-size: 2rem;
      }
      
      .authority-stat-label {
        font-size: 0.9rem;
      }
      
      .features-section {
        padding: 80px 0;
      }
      
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
      }
      
      .feature-card {
        padding: 40px 30px;
        text-align: center;
        min-height: 320px;
      }
      
      .feature-icon {
        margin: 0 auto 25px;
      }
      
      .feature-title {
        font-size: 1.5rem;
        margin-bottom: 20px;
      }
      
      .feature-description {
        font-size: 1.1rem;
        line-height: 1.7;
      }
      
      .benefits-section {
        padding: 80px 0;
      }
      
      .benefits-circle {
        width: 300px;
        height: 300px;
        margin: 0 auto;
      }
      
      .benefit-point {
        width: 140px;
        height: 90px;
        font-size: 13px;
        padding: 12px;
      }
      
      .benefit-point h4 {
        font-size: 14px;
        margin-bottom: 6px;
      }
      
      .benefit-point p {
        font-size: 11px;
      }
      
      .transformations-section {
        padding: 80px 0;
      }
      
      .transformations-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
      }
      
      .transformation-card {
        text-align: center;
      }
      
      .transformation-image {
        height: 300px;
        margin: 0 auto;
      }
      
      .transformation-content {
        padding: 30px;
      }
      
      .transformation-title {
        font-size: 1.4rem;
        margin-bottom: 15px;
      }
      
      .transformation-description {
        font-size: 1.1rem;
        line-height: 1.6;
      }
      
      .testimonials-section {
        padding: 80px 0;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 400px;
        margin-right: 30px;
      }
      
      .testimonial-scroll-video {
        height: 250px;
      }
      
      .testimonial-scroll-content {
        padding: 35px;
      }
      
      .testimonial-scroll-text {
        font-size: 1.1rem;
        line-height: 1.7;
      }
      
      .testimonial-scroll-author {
        font-size: 1rem;
      }
      
      .testimonial-scroll-role {
        font-size: 0.9rem;
      }
      
      .faq-section {
        padding: 80px 0;
      }
      
      .faq-container {
        max-width: 800px;
        margin: 0 auto;
      }
      
      .faq-question {
        padding: 25px 20px;
        font-size: 18px;
      }
      
      .faq-answer-content {
        font-size: 16px;
        line-height: 1.7;
      }
      
      .footer {
        padding: 60px 0;
      }
      
      .footer-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        gap: 40px;
      }
      
      .footer-links {
        flex-direction: row;
        gap: 30px;
      }
      
      .footer-bottom {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 30px;
      }
      
      
      
      
      
      .stat-number {
        font-size: 20px;
      }
      
      .stat-label {
        font-size: 11px;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 30px;
        max-width: 400px;
      }

      .feature-card {
        min-height: 320px;
        padding: 40px 28px;
      }

      .feature-icon svg {
        width: 3.5rem;
        height: 3.5rem;
      }

      .feature-title {
        font-size: 1.4rem;
        margin-bottom: 16px;
      }

      .feature-description {
        font-size: 15px;
      }
      
      .process-steps {
        grid-template-columns: 1fr;
        gap: 30px;
      }
      
      .authority-grid {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .authority-content {
        padding-left: 0;
      }
      
      .section-padding {
        padding: 80px 0;
      }
      

      
      .hero-content-container {
        padding: 30px 0;
      }
      
      .hero-content-premium {
        padding: 30px 0;
      }
      
      .authority-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }
      
      .service-features {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
      
      /* Tablet - No Experience Section */
      .no-experience-grid {
        grid-template-columns: 1fr 1fr 1fr;
        gap: 25px;
      }
      
      .no-exp-card-1 {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
      }
      
      .no-exp-card-2 {
        grid-column: 3 / 4;
        grid-row: 1 / 2;
      }
      
      .no-exp-center-circle {
        grid-column: 2 / 3;
        grid-row: 2 / 3;
        width: 200px;
        height: 200px;
      }
      
      .no-exp-card-3 {
        grid-column: 1 / 2;
        grid-row: 2 / 3;
      }
      
      .no-exp-card-4 {
        grid-column: 3 / 4;
        grid-row: 2 / 3;
      }
      
      .no-exp-card {
        width: 100%;
        max-width: 240px;
      }
      
      /* Verification Section - Tablet */
      .verification-cards-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 22px;
      }
      
      .verification-icon {
        width: 65px;
        height: 65px;
        font-size: 30px;
      }
      
      /* Simple System Section - Tablet */
      .simple-system-section {
        padding: 90px 0;
      }
      
      .transformations-top-track, .transformations-bottom-track {
        padding: 0 20px;
      }
      
      .transformation-slide-card {
        flex: 0 0 300px;
        height: 400px;
      }
      
      .transformation-header {
        padding: 20px 16px 16px;
      }
      
      .transformation-name {
        font-size: 1.3rem;
      }
      
      .transformation-role {
        font-size: 13px;
      }
      
      .before-after-images {
        gap: 12px;
        padding: 24px 20px;
      }
      
      .before-image, .after-image {
        height: 160px;
      }
      
      .transformation-arrow {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }
      
      .transformation-quote {
        font-size: 13px;
        padding: 20px 16px;
      }
      
      .image-label {
        font-size: 11px;
        padding: 4px 12px;
      }
    }
    
    @media (max-width: 1024px) {
      .benefits-icon-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 25px;
      }
      
      .benefit-item {
        padding: 35px 25px;
      }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 0 16px;
      }
      
      .target-audience-bar {
        font-size: 12px;
        padding: 12px 0;
        line-height: 1.3;
        text-align: center;
      }
      
      .section-padding {
        padding: 60px 0;
      }
      
      .premium-badge {
        padding: 12px 20px;
        margin-bottom: 24px;
      }
      
      .badge-icon-premium {
        width: 24px;
        height: 24px;
      }
      
      .badge-title {
        font-size: 12px;
      }
      
      .badge-subtitle {
        font-size: 10px;
      }
      
      .hero-title-premium {
        font-size: clamp(1.5rem, 6vw, 2.5rem);
        margin-bottom: 20px;
        line-height: 1.2;
      }
      
      .title-line-2 {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .hero-subtitle-premium {
        font-size: clamp(0.9rem, 3.5vw, 1.1rem);
        margin-bottom: 28px;
        line-height: 1.5;
      }
      
      .features-grid-premium {
        gap: 12px;
        margin-bottom: 32px;
      }
      
      .feature-item-premium {
        padding: 12px 16px;
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
      
      .feature-icon-premium {
        width: 20px;
        height: 20px;
      }
      
      .feature-title {
        font-size: 13px;
      }
      
      .feature-desc {
        font-size: 11px;
      }
      
      .btn-premium-primary {
        min-width: 100%;
        margin: 0 auto;
      }
      
      .btn-content {
        padding: 16px 28px;
        gap: 8px;
      }
      
      .btn-text-premium {
        font-size: 14px;
        letter-spacing: 0.2px;
      }
      
      .btn-icon-premium {
        width: 18px;
        height: 18px;
      }
      
      .btn-icon-premium svg {
        width: 12px;
        height: 12px;
      }
      
      .btn-arrow {
        font-size: 14px;
      }
      
      .trust-indicators {
        gap: 16px;
        padding: 16px 20px;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .trust-number {
        font-size: 16px;
      }
      
      .trust-label {
        font-size: 9px;
      }
      
      .trust-divider {
        height: 24px;
      }
      
      .video-showcase-premium {
        max-width: 100%;
        margin: 0 auto;
      }
      
      .video-frame-premium {
        border-radius: 20px;
      }
      
      .video-badge-premium {
        top: 16px;
        left: 16px;
        padding: 10px 16px;
        border-width: 1px;
      }
      
      .video-badge-premium .badge-text-premium {
        font-size: 12px;
      }
      
      .play-button-premium {
        width: 70px;
        height: 70px;
      }
      
      .play-core {
        width: 50px;
        height: 50px;
      }
      
      .play-core svg {
        width: 20px;
        height: 20px;
      }
      
      .video-stats-premium {
        bottom: 16px;
        right: 16px;
        gap: 8px;
      }
      
      /* Additional mobile optimizations */
      .hero-content-premium {
        padding: 20px 0;
      }
      
      .hero-content-container {
        padding: 20px 0;
      }
      
      .bg-feature-badge {
        padding: 6px 10px;
        min-width: 110px;
      }
      
      .bg-feature-badge-1 {
        top: 20%;
        right: 10%;
      }
      
      .bg-feature-badge-2 {
        bottom: 30%;
        left: 10%;
      }
      
      .bg-feature-badge-3 {
        top: 50%;
        right: 15%;
      }
      
      .bg-feature-icon {
        font-size: 15px;
      }
      
      .bg-feature-text {
        font-size: 11px;
      }
      
      .authority-section {
        padding: 60px 0;
      }
      
      .authority-grid {
        grid-template-columns: 1fr;
        gap: 30px;
      }
      
      .authority-card {
        text-align: center;
        padding: 30px 20px;
      }
      
      .authority-image {
        width: 120px;
        height: 120px;
        margin: 0 auto 20px;
      }
      
      .authority-name {
        font-size: 1.5rem;
        margin-bottom: 10px;
      }
      
      .authority-title {
        font-size: 1rem;
        margin-bottom: 15px;
      }
      
      .authority-stats {
        gap: 20px;
        justify-content: center;
      }
      
      .authority-stat {
        text-align: center;
      }
      
      .authority-stat-number {
        font-size: 1.5rem;
      }
      
      .authority-stat-label {
        font-size: 0.8rem;
      }
      
      .features-section {
        padding: 60px 0;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .feature-card {
        padding: 30px 20px;
        text-align: center;
      }
      
      .feature-icon {
        margin: 0 auto 20px;
      }
      
      .feature-title {
        font-size: 1.3rem;
        margin-bottom: 15px;
      }
      
      .feature-description {
        font-size: 1rem;
        line-height: 1.6;
      }
      
      .benefits-section {
        padding: 40px 0;
      }
      
      .benefits-circle {
        width: 200px;
        height: 200px;
        margin: 0 auto;
      }
      
      .benefit-point {
        width: 100px;
        height: 70px;
        font-size: 11px;
        padding: 8px;
      }
      
      .benefit-point h4 {
        font-size: 12px;
        margin-bottom: 4px;
      }
      
      .benefit-point p {
        font-size: 10px;
      }
      
      .transformations-section {
        padding: 60px 0;
      }
      
      .transformations-grid {
        grid-template-columns: 1fr;
        gap: 30px;
      }
      
      .transformation-card {
        text-align: center;
      }
      
      .transformation-image {
        height: 250px;
        margin: 0 auto;
      }
      
      .transformation-content {
        padding: 20px;
      }
      
      .transformation-title {
        font-size: 1.2rem;
        margin-bottom: 10px;
      }
      
      .transformation-description {
        font-size: 1rem;
      }
      
      .testimonials-section {
        padding: 60px 0;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 300px;
        margin-right: 20px;
      }
      
      .testimonial-scroll-video {
        height: 200px;
      }
      
      .testimonial-scroll-content {
        padding: 25px;
      }
      
      .testimonial-scroll-text {
        font-size: 1rem;
        line-height: 1.6;
      }
      
      .testimonial-scroll-author {
        font-size: 0.9rem;
      }
      
      .testimonial-scroll-role {
        font-size: 0.8rem;
      }
      
      .faq-section {
        padding: 60px 0;
      }
      
      .faq-section-header {
        margin-bottom: 40px;
      }
      
      .faq-container {
        max-width: 100%;
      }
      
      .faq-item {
        margin-bottom: 15px;
      }
      
      .faq-question {
        padding: 20px 16px;
        font-size: 16px;
      }
      
      .faq-answer-content {
        font-size: 15px;
        line-height: 1.6;
      }
      
      /* Verification Section - Mobile (768px) */
      .verification-section {
        padding: 60px 0;
      }
      
      .verification-cards-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      /* Simple System Section - Mobile (768px) */
      .simple-system-section {
        padding: 60px 0;
      }
      
      .footer {
        padding: 40px 0;
      }
      
      .footer-content {
        flex-direction: column;
        gap: 30px;
        text-align: center;
      }
      
      .footer-links {
        flex-direction: column;
        gap: 20px;
      }
      
      .footer-bottom {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }
      
      .stat-card-premium {
        padding: 6px 8px;
      }
      
      .stat-icon-premium {
        font-size: 14px;
      }
      
      .stat-value-premium {
        font-size: 10px;
      }
      
      .stat-label-premium {
        font-size: 8px;
      }
      
      
      
      
      
      
      
      .stat-number {
        font-size: 18px;
      }
      
      .stat-label {
        font-size: 10px;
      }
      
      .stat-divider {
        height: 30px;
      }
      
      .access-form-container {
        padding: 32px 24px;
      }
      

      .hero-content-container {
        padding: 15px 0;
      }
      
      .hero-content-premium {
        padding: 15px 0;
      }
      
      
      
      
      .rb-btn {
        min-width: 160px;
        padding: 16px 32px;
        font-size: 15px;
      }
      
      .rb-btn--large {
        min-width: 100%;
        padding: 18px 36px;
        font-size: 16px;
      }
      
      .faq-question {
        padding: 20px 20px;
        font-size: 16px;
      }
      
      .faq-question-text {
        padding-right: 16px;
      }
      
      .faq-item.active .faq-answer {
        padding: 0 20px 20px 20px;
        max-height: 250px;
      }
      
      .faq-answer-content {
        font-size: 15px;
      }
      
      .authority-stats {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .coach-image {
        width: 200px;
        height: 200px;
      }
      
      .feature-card {
        min-height: 280px;
        padding: 32px 20px;
      }
      
      .feature-icon svg {
        width: 3rem;
        height: 3rem;
      }
      
      .process-card {
        min-height: 240px;
        padding: 32px 20px;
      }
      
      .process-icon svg {
        width: 2.5rem;
        height: 2.5rem;
      }
      
      .service-features {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 320px;
        margin-right: 20px;
      }
      
      .testimonials-scroll-container {
        margin: 0 -16px;
        padding: 0 16px;
      }
      
      .circular-benefits {
        min-height: 400px;
        margin: 60px 0;
      }
      
      .benefits-circle {
        width: 250px;
        height: 250px;
      }
      
      .benefit-point {
        width: 120px;
        height: 80px;
        font-size: 11px;
        padding: 12px;
      }
      
      .benefit-point-1 {
        top: -40px;
      }
      
      .benefit-point-2 {
        right: -60px;
      }
      
      .benefit-point-3 {
        bottom: -40px;
      }
      
      .benefit-point-4 {
        left: -60px;
      }
      
      .transformations-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .transformation-image {
        height: 250px;
        width: 100%;
        object-fit: cover;
      }

      .transformation-card {
        border-radius: 24px;
      }

      .transformation-divider {
        width: 60px;
        height: 60px;
        font-size: 1.6rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }

      .transformation-header {
        padding: 24px 28px 20px;
      }

      .transformation-stats {
        padding: 28px 24px 24px;
      }


      .transformation-divider {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .achievement-badges {
        gap: 6px;
      }

      .achievement-badge {
        padding: 6px 12px;
        font-size: 11px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 0 12px;
      }
      
      .target-audience-bar {
        font-size: 11px;
        padding: 10px 0;
        text-align: center;
      }
      
      .section-padding {
        padding: 50px 0;
      }
      
      .rb-btn {
        padding: 14px 28px;
        font-size: 14px;
        min-width: auto;
        width: 100%;
      }
      
      .rb-btn--large {
        padding: 16px 32px;
        font-size: 15px;
        min-width: auto;
        width: 100%;
      }
      
      .access-form-container {
        padding: 24px 20px;
      }
      
      .form-title {
        font-size: 1.8rem;
      }
      

      
      .hero-content-container {
        padding: 10px 0;
      }
      
      .hero-content-premium {
        padding: 10px 0;
      }
      
      .bg-feature-badge {
        padding: 6px 10px;
        min-width: 100px;
      }
      
      .bg-feature-badge-1 {
        top: 15%;
        right: 5%;
      }
      
      .bg-feature-badge-2 {
        bottom: 25%;
        left: 5%;
      }
      
      .bg-feature-badge-3 {
        top: 45%;
        right: 8%;
      }
      
      .bg-feature-icon {
        font-size: 14px;
      }
      
      .bg-feature-text {
        font-size: 10px;
      }
      
      .rb-badge {
        font-size: 12px;
        padding: 8px 14px;
      }
      
      .disclaimers {
        padding: 32px 20px;
      }
      
      .faq-question {
        padding: 18px 16px;
        font-size: 15px;
      }
      
      .faq-question-text {
        padding-right: 12px;
      }
      
      .faq-icon {
        font-size: 18px;
      }
      
      .faq-item.active .faq-answer {
        padding: 0 16px 16px 16px;
        max-height: 200px;
      }
      
      .faq-answer-content {
        font-size: 14px;
      }
      
      .coach-image {
        width: 180px;
        height: 180px;
      }
      
      .feature-card {
        min-height: 260px;
        padding: 28px 16px;
      }
      
      .feature-icon svg {
        width: 2.5rem;
        height: 2.5rem;
      }
      
      .feature-title {
        font-size: 1.3rem;
      }
      
      .process-card {
        min-height: 220px;
        padding: 28px 16px;
      }
      
      .process-icon svg {
        width: 2.2rem;
        height: 2.2rem;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 280px;
        margin-right: 16px;
      }
      
      .testimonial-scroll-video {
        height: 180px;
      }
      
      .testimonial-scroll-content {
        padding: 20px;
      }
      
      .footer-links {
        gap: 20px;
        flex-direction: column;
      }
      
      .circular-benefits {
        min-height: 300px;
        margin: 30px 0;
      }
      
      .benefits-circle {
        width: 180px;
        height: 180px;
      }
      
      .benefit-point {
        width: 90px;
        height: 65px;
        font-size: 9px;
        padding: 6px;
      }
      
      /* Mobile responsive - No Experience Section */
      .no-experience-section {
        padding: 60px 0;
      }
      
      .no-experience-grid {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
        gap: 20px;
        padding: 0 20px;
      }
      
      .no-exp-card {
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
      }
      
      .no-exp-card-1,
      .no-exp-card-2,
      .no-exp-card-3,
      .no-exp-card-4 {
        grid-column: 1 / 2;
        grid-row: auto;
      }
      
      .no-exp-center-circle {
        grid-column: 1 / 2;
        grid-row: auto;
        width: 200px;
        height: 200px;
        margin: 20px 0;
      }
      
      .circle-middle {
        width: 150px;
        height: 150px;
      }
      
      .circle-inner {
        width: 110px;
        height: 110px;
      }
      
      .no-experience-cta {
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin-top: 40px;
      }
      
      .no-experience-cta .rb-btn {
        width: 100%;
        max-width: 320px;
      }
      
      /* Verification Section - Mobile */
      .verification-cards-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .verification-icon {
        width: 60px;
        height: 60px;
        font-size: 28px;
      }
      
      .verification-role {
        font-size: 16px;
      }
      
      .verification-result {
        font-size: 14px;
      }
      
      /* Tablet responsive styles for No Experience Needed section */
      @media (max-width: 768px) and (min-width: 481px) {
        .no-experience-section {
          padding: 70px 0;
        }
        
        .no-experience-grid {
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        
        .no-exp-card {
          max-width: 260px;
        }
        
        .no-exp-center-circle {
          grid-column: 1 / 3;
          width: 220px;
          height: 220px;
        }
        
        .circle-middle {
          width: 170px;
          height: 170px;
        }
        
        .circle-inner {
          width: 125px;
          height: 125px;
        }
      }
      
      /* Enhanced mobile optimizations for small screens */
      .hero-title-premium {
        font-size: clamp(1.8rem, 7vw, 2.5rem);
        line-height: 1.1;
      }
      
      .hero-subtitle-premium {
        font-size: clamp(0.9rem, 3.5vw, 1.1rem);
        line-height: 1.4;
      }
      
      .premium-badge {
        padding: 10px 16px;
        margin-bottom: 20px;
      }
      
      .badge-title {
        font-size: 11px;
      }
      
      .badge-subtitle {
        font-size: 9px;
      }
      
      .features-grid-premium {
        gap: 10px;
        margin-bottom: 28px;
      }
      
      .feature-item-premium {
        padding: 10px 14px;
        gap: 6px;
      }
      
      .feature-icon-premium {
        width: 18px;
        height: 18px;
      }
      
      .feature-title {
        font-size: 12px;
      }
      
      .feature-desc {
        font-size: 10px;
      }
      
      .btn-content {
        padding: 16px 24px;
        gap: 10px;
      }
      
      .btn-text-premium {
        font-size: 14px;
      }
      
      .btn-icon-premium {
        width: 18px;
        height: 18px;
      }
      
      .trust-indicators {
        gap: 12px;
        padding: 14px 16px;
      }
      
      .trust-number {
        font-size: 14px;
      }
      
      .trust-label {
        font-size: 8px;
      }
      
      .video-showcase-premium {
        max-width: 100%;
      }
      
      .video-frame-premium {
        border-radius: 16px;
      }
      
      .play-button-premium {
        width: 60px;
        height: 60px;
      }
      
      .play-core {
        width: 44px;
        height: 44px;
      }
      
      .play-core svg {
        width: 18px;
        height: 18px;
      }
      
      .video-badge-premium {
        top: 12px;
        left: 12px;
        padding: 8px 12px;
      }
      
      .video-badge-premium .badge-text-premium {
        font-size: 11px;
      }
      
      .video-stats-premium {
        bottom: 12px;
        right: 12px;
        gap: 6px;
      }
      
      .authority-section {
        padding: 50px 0;
      }
      
      .authority-card {
        padding: 25px 16px;
      }
      
      .authority-image {
        width: 100px;
        height: 100px;
        margin-bottom: 15px;
      }
      
      .authority-name {
        font-size: 1.3rem;
        margin-bottom: 8px;
      }
      
      .authority-title {
        font-size: 0.9rem;
        margin-bottom: 12px;
      }
      
      .authority-stats {
        gap: 15px;
      }
      
      .authority-stat-number {
        font-size: 1.3rem;
      }
      
      .authority-stat-label {
        font-size: 0.7rem;
      }
      
      .features-section {
        padding: 50px 0;
      }
      
      .feature-card {
        padding: 25px 16px;
        min-height: 240px;
      }
      
      .feature-title {
        font-size: 1.2rem;
        margin-bottom: 12px;
      }
      
      .feature-description {
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .benefits-section {
        padding: 35px 0;
      }
      
      .benefits-circle {
        width: 180px;
        height: 180px;
      }
      
      .benefit-point {
        width: 85px;
        height: 60px;
        font-size: 10px;
        padding: 5px;
      }
      
      .benefit-point h4 {
        font-size: 11px;
        margin-bottom: 2px;
      }
      
      .benefit-point p {
        font-size: 9px;
      }
      
      .transformations-section {
        padding: 50px 0;
      }
      
      .transformation-image {
        height: 220px;
      }
      
      .transformation-content {
        padding: 16px;
      }
      
      .transformation-title {
        font-size: 1.1rem;
        margin-bottom: 8px;
      }
      
      .transformation-description {
        font-size: 0.9rem;
      }
      
      .testimonials-section {
        padding: 50px 0;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 260px;
        margin-right: 12px;
      }
      
      .testimonial-scroll-video {
        height: 160px;
      }
      
      .testimonial-scroll-content {
        padding: 18px;
      }
      
      .testimonial-scroll-text {
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .testimonial-scroll-author {
        font-size: 0.8rem;
      }
      
      .testimonial-scroll-role {
        font-size: 0.7rem;
      }
      
      .faq-section {
        padding: 50px 0;
      }
      
      .faq-section-header {
        margin-bottom: 35px;
      }
      
      .faq-question {
        padding: 16px 14px;
        font-size: 14px;
      }
      
      .faq-answer-content {
        font-size: 13px;
        line-height: 1.5;
      }
      
      /* Verification Section - Mobile (480px) */
      .verification-section {
        padding: 50px 0;
      }
      
      .verification-cards-grid {
        gap: 18px;
      }
      
      .verification-icon {
        width: 56px;
        height: 56px;
        font-size: 26px;
        margin-bottom: 16px;
      }
      
      .verification-role {
        font-size: 15px;
      }
      
      .verification-result {
        font-size: 13px;
      }
      
      /* Simple System Section - Mobile (480px) */
      .simple-system-section {
        padding: 50px 0;
      }
      
      .simple-system-header {
        margin-bottom: 40px;
      }
      
      .footer {
        padding: 35px 0;
      }
      
      .footer-content {
        gap: 25px;
      }
      
      .footer-links {
        gap: 16px;
      }
      
      .footer-bottom {
        gap: 16px;
      }
      
      .benefit-point-1 {
        top: -30px;
      }
      
      .benefit-point-2 {
        right: -40px;
      }
      
      .benefit-point-3 {
        bottom: -30px;
      }
      
      .benefit-point-4 {
        left: -40px;
      }
      
      .transformation-image {
        height: 220px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .achievement-badge {
        padding: 6px 12px;
        font-size: 11px;
      }
      
      .transformation-divider {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }
      
      .client-name {
        font-size: 1rem;
      }
      
      .stat-value {
        font-size: 1.05rem;
      }
    }
    
    @media (max-width: 360px) {
      .container {
        padding: 0 10px;
      }
      
      .rb-badge {
        font-size: 11px;
        padding: 6px 12px;
      }
      
      .testimonial-scroll-card {
        flex: 0 0 240px;
        margin-right: 10px;
      }
      
      .transformation-image {
        height: 180px;
      }
      
      /* Ultra-small screen optimizations */
      .hero-title-premium {
        font-size: clamp(1.6rem, 6vw, 2.2rem);
        line-height: 1.1;
      }
      
      .hero-subtitle-premium {
        font-size: clamp(0.8rem, 3vw, 1rem);
        line-height: 1.3;
      }
      
      .premium-badge {
        padding: 8px 14px;
        margin-bottom: 18px;
      }
      
      .badge-title {
        font-size: 10px;
      }
      
      .badge-subtitle {
        font-size: 8px;
      }
      
      .features-grid-premium {
        gap: 8px;
        margin-bottom: 24px;
      }
      
      .feature-item-premium {
        padding: 8px 12px;
        gap: 4px;
      }
      
      .feature-icon-premium {
        width: 16px;
        height: 16px;
      }
      
      .feature-title {
        font-size: 11px;
      }
      
      .feature-desc {
        font-size: 9px;
      }
      
      .btn-content {
        padding: 14px 20px;
        gap: 8px;
      }
      
      .btn-text-premium {
        font-size: 13px;
      }
      
      .btn-icon-premium {
        width: 16px;
        height: 16px;
      }
      
      .trust-indicators {
        gap: 10px;
        padding: 12px 14px;
      }
      
      .trust-number {
        font-size: 13px;
      }
      
      .trust-label {
        font-size: 7px;
      }
      
      .video-showcase-premium {
        max-width: 100%;
      }
      
      /* Mobile styles for Our Program Seen On section */
      .program-seen-on-section {
        margin: 40px 0;
        padding: 30px 0;
      }
      
      .seen-on-title {
        font-size: 1rem;
        margin-bottom: 20px;
      }
      
      .logos-container {
        gap: 15px;
      }
      
      .logo-line {
        gap: 10px;
      }
      
      .logo-item {
        padding: 10px 15px;
        min-width: 80px;
        font-size: 0.8rem;
      }
      
      /* Mobile styles for Pain Points section */
      .pain-points-section {
        padding: 60px 0;
      }
      
      .pain-points-headline {
        font-size: clamp(1.8rem, 6vw, 2.5rem);
        margin-bottom: 30px;
      }
      
      .lifestyle-icons {
        gap: 20px;
        margin-bottom: 40px;
      }
      
      .lifestyle-icon-item {
        padding: 15px;
        min-width: 80px;
      }
      
      .lifestyle-icon-item .icon {
        font-size: 1.5rem;
      }
      
      .lifestyle-icon-item span {
        font-size: 12px;
      }
      
      .pain-point-item {
        padding: 20px;
        gap: 15px;
        margin-bottom: 15px;
      }
      
      .pain-text {
        font-size: 14px;
      }
      
      .transition-main {
        font-size: clamp(1.1rem, 4vw, 1.4rem);
      }
      
      .transition-sub {
        font-size: clamp(0.9rem, 3vw, 1.1rem);
      }
      
      .btn-pain-points {
        padding: 16px 28px;
        font-size: 15px;
      }
      
      /* Mobile styles for Discover section */
      .discover-section {
        padding: 60px 0;
      }
      
      .discover-headline {
        font-size: clamp(1.8rem, 6vw, 2.5rem);
        margin-bottom: 40px;
      }
      
      .discovery-bullets {
        gap: 20px;
      }
      
      .discovery-item {
        padding: 25px;
        gap: 15px;
      }
      
      .discovery-icon {
        width: 20px;
        height: 20px;
      }
      
      .discovery-icon svg {
        width: 12px;
        height: 12px;
      }
      
      .discovery-text {
        font-size: 14px;
        line-height: 1.5;
      }
      
      /* Mobile styles for Coach Bio section */
      .coach-bio-section {
        padding: 60px 0;
      }
      
      .coach-bio-headline {
        font-size: clamp(1.8rem, 6vw, 2.5rem);
        margin-bottom: 40px;
      }
      
      .coach-photo-frame {
        width: 150px;
        height: 150px;
      }
      
      .coach-name {
        font-size: clamp(1.5rem, 5vw, 2rem);
      }
      
      .coach-tagline {
        font-size: 16px;
      }
      
      .coach-bio-text {
        margin-bottom: 40px;
      }
      
      .bio-paragraph {
        font-size: 15px;
        line-height: 1.6;
      }
      
      .different-headline {
        font-size: clamp(1.2rem, 4vw, 1.5rem);
        margin-bottom: 25px;
      }
      
      .different-cards {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .different-card {
        padding: 20px;
        gap: 12px;
      }
      
      .card-icon {
        width: 20px;
        height: 20px;
      }
      
      .card-icon svg {
        width: 12px;
        height: 12px;
      }
      
      .card-title {
        font-size: 15px;
      }
      
      .card-text {
        font-size: 13px;
      }
      
      /* Mobile styles for Benefits Grid section */
      .benefits-grid-section {
        padding: 60px 0;
      }
      
      .benefits-grid-headline {
        font-size: clamp(1.8rem, 6vw, 2.5rem);
        margin-bottom: 40px;
      }
      
      .benefits-icon-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      
      .benefit-item {
        padding: 25px 15px;
      }
      
      .benefit-icon {
        width: 70px;
        height: 70px;
        margin-bottom: 20px;
      }
      
      .icon-emoji {
        font-size: 2rem;
      }
      
      .benefit-title {
        font-size: 18px;
        margin-bottom: 12px;
      }
      
      .benefit-description {
        font-size: 14px;
        line-height: 1.5;
      }
      
      .play-button-premium {
        width: 50px;
        height: 50px;
      }
      
      .play-core {
        width: 38px;
        height: 38px;
      }
      
      .play-core svg {
        width: 16px;
        height: 16px;
      }
      
      .video-badge-premium {
        top: 10px;
        left: 10px;
        padding: 6px 10px;
      }
      
      .video-badge-premium .badge-text-premium {
        font-size: 10px;
      }
      
      .video-stats-premium {
        bottom: 10px;
        right: 10px;
        gap: 4px;
      }
      
      .authority-section {
        padding: 45px 0;
      }
      
      .authority-card {
        padding: 20px 14px;
      }
      
      .authority-image {
        width: 90px;
        height: 90px;
        margin-bottom: 12px;
      }
      
      .authority-name {
        font-size: 1.2rem;
        margin-bottom: 6px;
      }
      
      .authority-title {
        font-size: 0.8rem;
        margin-bottom: 10px;
      }
      
      .authority-stats {
        gap: 12px;
      }
      
      .authority-stat-number {
        font-size: 1.2rem;
      }
      
      .authority-stat-label {
        font-size: 0.6rem;
      }
      
      .features-section {
        padding: 45px 0;
      }
      
      .feature-card {
        padding: 20px 14px;
        min-height: 220px;
      }
      
      .feature-title {
        font-size: 1.1rem;
        margin-bottom: 10px;
      }
      
      .feature-description {
        font-size: 0.8rem;
        line-height: 1.4;
      }
      
      .benefits-section {
        padding: 30px 0;
      }
      
      .benefits-circle {
        width: 160px;
        height: 160px;
      }
      
      .benefit-point {
        width: 80px;
        height: 55px;
        font-size: 9px;
        padding: 4px;
      }
      
      .benefit-point h4 {
        font-size: 10px;
        margin-bottom: 1px;
      }
      
      .benefit-point p {
        font-size: 8px;
      }
      
      .transformations-section {
        padding: 45px 0;
      }
      
      .transformation-image {
        height: 200px;
      }
      
      .transformation-content {
        padding: 14px;
      }
      
      .transformation-title {
        font-size: 1rem;
        margin-bottom: 6px;
      }
      
      .transformation-description {
        font-size: 0.8rem;
      }
      
      .testimonials-section {
        padding: 45px 0;
      }
      
      .testimonial-scroll-video {
        height: 140px;
      }
      
      .testimonial-scroll-content {
        padding: 16px;
      }
      
      .testimonial-scroll-text {
        font-size: 0.8rem;
        line-height: 1.4;
      }
      
      .testimonial-scroll-author {
        font-size: 0.7rem;
      }
      
      .testimonial-scroll-role {
        font-size: 0.6rem;
      }
      
      .faq-section {
        padding: 45px 0;
      }
      
      .faq-section-header {
        margin-bottom: 30px;
      }
      
      .faq-question {
        padding: 14px 12px;
        font-size: 13px;
      }
      
      .faq-answer-content {
        font-size: 12px;
        line-height: 1.4;
      }
      
      /* Verification Section - Mobile (360px) */
      .verification-section {
        padding: 45px 0;
      }
      
      .verification-icon {
        width: 52px;
        height: 52px;
        font-size: 24px;
        margin-bottom: 14px;
      }
      
      .verification-role {
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .verification-result {
        font-size: 12px;
      }
      
      /* Simple System Section - Mobile (360px) */
      .simple-system-section {
        padding: 45px 0;
      }
      
      .simple-system-header {
        margin-bottom: 35px;
      }
      
      .footer {
        padding: 30px 0;
      }
      
      .footer-content {
        gap: 20px;
      }
      
      .footer-links {
        gap: 14px;
      }
      
      .footer-bottom {
        gap: 14px;
      }
    }
    
    @media (hover: none) and (pointer: coarse) {
      .rb-card:hover,
      .rb-btn:hover,
      .feature-card:hover,
      .testimonial-scroll-card:hover,
      .authority-stat:hover,
      .service-feature:hover,
      .benefit-point:hover,
      .transformation-card:hover {
        transform: none;
      }
      
      .feature-card::after,
      .service-feature::before {
        display: none;
      }
      
      .play-button:hover {
        transform: translate(-50%, -50%) scale(1);
      }
      
      .testimonials-scroll-track:hover {
        animation-play-state: running;
      }
      
      /* Touch device optimizations */
      .rb-btn,
      .btn-premium-primary,
      .faq-question,
      .play-button-premium {
        -webkit-tap-highlight-color: rgba(0, 212, 170, 0.2);
        tap-highlight-color: rgba(0, 212, 170, 0.2);
      }
      
      .rb-btn:active,
      .btn-premium-primary:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
      
      .faq-question:active {
        background: rgba(0, 212, 170, 0.1);
      }
      
      .play-button-premium:active {
        transform: translate(-50%, -50%) scale(0.95);
      }
    }
    
    @supports (-webkit-touch-callout: none) {
      .rb-input {
        font-size: 16px !important;
      }
      
      .faq-question {
        -webkit-tap-highlight-color: transparent;
      }
      
      .rb-btn {
        -webkit-tap-highlight-color: transparent;
      }
      
      /* iOS Safari specific optimizations */
      .hero-content-premium {
        -webkit-overflow-scrolling: touch;
      }
      
      .testimonials-scroll-track {
        -webkit-overflow-scrolling: touch;
      }
      
      .video-showcase-premium {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .text-shimmer,
      .text-bounce,
      .text-pulse,
      body::before,
      body::after,
      .testimonials-scroll-track,
      .borderGlow,
      .circleGlow {
        animation: none;
      }
      
      .rb-btn,
      .rb-card,
      .feature-card,
      .service-feature,
      .transformation-card {
        transition: none;
      }
    }
    `,
    html: `
    <div class="page-wrapper">
      <section id="home" class="hero">
      <div class="target-audience-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
        <span>For Busy Professionals Who Want to Transform Their Health Without Sacrificing Career Success</span>
      </div>
        <!-- Hero Content Container -->
        <div class="hero-content-container">
        <div class="container">
            <div class="hero-content-premium">
              <div class="hero-left-premium">
              <!-- Premium Badge -->
              <div class="premium-badge">
                <div class="badge-glow"></div>
                <div class="badge-content">
                  <div class="badge-icon-premium">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div class="badge-text-premium">
                    <span class="badge-title">Premium Fitness System</span>
                    <span class="badge-subtitle">For Busy Executives</span>
                  </div>
                </div>
              </div>
              
              <!-- Hero Title with Advanced Effects -->
              <h1 class="hero-title-premium">
                <span class="title-line-1">The Only 15-Minute Health System That Works Anywhere —</span>
                <span class="title-line-2">
                  <span class="gradient-text-premium">Proven by 18,900+ Busy Professionals</span>
                  <span class="title-highlight">Who Lost Weight & Built Energy in 90 Days</span>
                </span>
              </h1>
              
              <!-- Premium Subtitle -->
              <p class="hero-subtitle-premium">
                In this free 27-minute training video, discover the exact 3-step system that helped thousands transform their health without gym, meal restrictions, or sacrificing their careers and families.
              </p>
              
              <!-- Features and Video Layout -->
              <div class="features-video-layout">
                <!-- Premium Features Grid -->
                <div class="features-grid-premium">
                  <div class="feature-item-premium">
                    <div class="feature-icon-premium">
                      🌍
                    </div>
                    <div class="feature-content">
                      <span class="feature-title">Works Anywhere</span>
                      <span class="feature-desc">No Gym Required</span>
            </div>
                </div>
                  
                  <div class="feature-item-premium">
                    <div class="feature-icon-premium">
                      ⏱️
                    </div>
                    <div class="feature-content">
                      <span class="feature-title">Just 15 Minutes Daily</span>
                      <span class="feature-desc">Maximum Efficiency</span>
                    </div>
                  </div>
                  
                  <div class="feature-item-premium">
                    <div class="feature-icon-premium">
                      ♾️
                    </div>
                    <div class="feature-content">
                      <span class="feature-title">Lasts Forever</span>
                      <span class="feature-desc">Sustainable Results</span>
                    </div>
                  </div>
                </div>
                
                <!-- Video on Right Side -->
                <div class="hero-right-premium">
                  <div class="video-showcase-premium">
                    <!-- Video Container with Premium Effects -->
                    <div class="video-container-premium">
                      <div class="video-frame-premium">
                        <div class="video-overlay-premium"></div>
                        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80" alt="Professional Fitness Training" class="video-image-premium">
                        
                        <!-- Premium Video Badge -->
                        <div class="video-badge-premium">
                          <div class="badge-glow-premium"></div>
                          <span class="badge-text-premium">Professional Fitness Training</span>
                        </div>
                        
                        <!-- Premium Play Button -->
                        <div class="play-button-premium" onclick="scrollToForm()">
                          <div class="play-ring-1"></div>
                          <div class="play-ring-2"></div>
                          <div class="play-ring-3"></div>
                          <div class="play-core">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                        
                        <!-- Video Stats Overlay -->
                        <div class="video-stats-premium">
                          <div class="stat-card-premium">
                            <div class="stat-icon-premium">👥</div>
                            <div class="stat-content-premium">
                              <span class="stat-value-premium">5,000+</span>
                              <span class="stat-label-premium">Professionals</span>
                            </div>
                          </div>
                          <div class="stat-card-premium">
                            <div class="stat-icon-premium">📈</div>
                            <div class="stat-content-premium">
                              <span class="stat-value-premium">94%</span>
                              <span class="stat-label-premium">Success Rate</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
           
                
                <div class="trust-indicators">
                  <div class="trust-item">
                    <span class="trust-number">5,000+</span>
                    <span class="trust-label">Professionals</span>
            </div>
                  <div class="trust-divider"></div>
                  <div class="trust-item">
                    <span class="trust-number">94%</span>
                    <span class="trust-label">Success Rate</span>
                  </div>
                  <div class="trust-divider"></div>
                  <div class="trust-item">
                    <span class="trust-number">15min</span>
                    <span class="trust-label">Daily</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Our Program Seen On Section -->
            <div class="program-seen-on-section">
              <div class="seen-on-title">Our Program seen on-</div>
              <div class="logos-container">
                <div class="logo-line logo-line-1">
                  <div class="logo-item">Forbes</div>
                  <div class="logo-item">CNN</div>
                  <div class="logo-item">BBC</div>
                  <div class="logo-item">TechCrunch</div>
                  <div class="logo-item">Entrepreneur</div>
                  <div class="logo-item">Forbes</div>
                  <div class="logo-item">CNN</div>
                  <div class="logo-item">BBC</div>
                  <div class="logo-item">TechCrunch</div>
                  <div class="logo-item">Entrepreneur</div>
                </div>
                <div class="logo-line logo-line-2">
                  <div class="logo-item">Harvard</div>
                  <div class="logo-item">MIT</div>
                  <div class="logo-item">Stanford</div>
                  <div class="logo-item">Yale</div>
                  <div class="logo-item">Oxford</div>
                  <div class="logo-item">Harvard</div>
                  <div class="logo-item">MIT</div>
                  <div class="logo-item">Stanford</div>
                 
                  <div class="logo-item">Oxford</div>
                </div>
              </div>
            </div>
            
            <!-- Pain Points Section -->
            <div class="pain-points-section">
              <div class="container">
                <div class="pain-points-content">
                  <!-- Section Headline -->
                  <h2 class="pain-points-headline">Does This Sound Familiar?</h2>
                  
                  <!-- Visual Lifestyle Icons -->
                  <div class="lifestyle-icons">
                    <div class="lifestyle-icon-item">
                      <div class="icon">💼</div>
                      <span>Laptop</span>
                    </div>
                    <div class="lifestyle-icon-item">
                      <div class="icon">☕</div>
                      <span>Coffee</span>
                    </div>
                    <div class="lifestyle-icon-item">
                      <div class="icon">⏰</div>
                      <span>Clock</span>
                    </div>
                    <div class="lifestyle-icon-item">
                      <div class="icon">🍔</div>
                      <span>Fast Food</span>
                    </div>
                  </div>
                  
                  <!-- Pain Points List -->
                  <div class="pain-points-list">
                    <div class="pain-point-item">
                      <div class="pain-icon">❌</div>
                      <div class="pain-text">Long workdays leave no time for gym or meal prep — by the time you get home, you're exhausted</div>
                    </div>
                    
                    <div class="pain-point-item">
                      <div class="pain-icon">❌</div>
                      <div class="pain-text">Energy crashes hit before the day even ends — you survive on coffee and willpower, then collapse by 3 PM</div>
                    </div>
                    
                    <div class="pain-point-item">
                      <div class="pain-icon">❌</div>
                      <div class="pain-text">Every Monday starts with fitness motivation, but Friday kills the streak — you can't stay consistent for more than a few days</div>
                    </div>
                    
                    <div class="pain-point-item">
                      <div class="pain-icon">❌</div>
                      <div class="pain-text">Generic apps & diets don't match your work-travel-social life — they work in theory, but fail in real life</div>
                    </div>
                    
                    <div class="pain-point-item">
                      <div class="pain-icon">❌</div>
                      <div class="pain-text">No one keeping you accountable when you slip — you're on your own, and it's too easy to quit when no one's watching</div>
                    </div>
                  </div>
                  
                  <!-- Transition Text -->
                  <div class="transition-text">
                    <p class="transition-main">If you nodded your head to even <span class="highlight-text">ONE</span> of these... you're in the right place.</p>
                    
                    <p class="transition-sub">Because <span class="highlight-number">18,900+</span> busy professionals just like you faced the exact same struggles — until they discovered a system that actually works with their lifestyle, not against it.</p>
                    
                    <p class="transition-cta-text">Enter your details below to watch the free training and see how they did it 👇</p>
                  </div>
                  
                  <!-- CTA Button -->
                  <div class="pain-points-cta">
                    <button class="btn-pain-points" onclick="scrollToForm()">
                      <span class="btn-icon">▶</span>
                      <span class="btn-text">Watch the Free Training</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- What You'll Discover Section -->
            <div class="discover-section">
              <div class="container">
                <div class="discover-content">
                  <!-- Section Headline -->
                  <h2 class="discover-headline">In This FREE Training, You'll Discover:</h2>
                  
                  <!-- Discovery Bullets -->
                  <div class="discovery-bullets">
                    <div class="discovery-item">
                      <div class="discovery-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div class="discovery-text">
                        <span class="discovery-highlight">Why 90% of diets fail</span> (and the #1 mistake keeping you stuck in the weight loss cycle)
                      </div>
                    </div>
                    
                    <div class="discovery-item">
                      <div class="discovery-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div class="discovery-text">
                        The <span class="discovery-highlight">3-step system</span> that makes transformation effortless and automatic — used by <span class="discovery-number">18,900+</span> people
                      </div>
                    </div>
                    
                    <div class="discovery-item">
                      <div class="discovery-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div class="discovery-text">
                        How busy professionals achieve their ideal weight (lose, gain, or maintain) in <span class="discovery-highlight">90 days</span> without gym torture or giving up favorite foods
                      </div>
                    </div>
                    
                    <div class="discovery-item">
                      <div class="discovery-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div class="discovery-text">
                        The science-backed framework proven across <span class="discovery-number">90+ countries</span> with a <span class="discovery-highlight">97% success rate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Coach Bio Section -->
            <div class="coach-bio-section">
              <div class="container">
                <div class="coach-bio-content">
                  <!-- Section Headline -->
                  <h2 class="coach-bio-headline">Meet Your Transformation Guide</h2>
                  
                  <!-- Coach Profile -->
                  <div class="coach-profile">
                    <!-- Coach Photo -->
                    <div class="coach-photo-container">
                      <div class="coach-photo-frame">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Professional Fitness Coach" class="coach-photo">
                        <div class="photo-border"></div>
                      </div>
                    </div>
                    
                    <!-- Coach Info -->
                    <div class="coach-info">
                      <h3 class="coach-name">[COACH NAME]</h3>
                      <p class="coach-tagline">Certified Health Coach | Transformation Specialist</p>
                    </div>
                  </div>
                  
                  <!-- Bio Text -->
                  <div class="coach-bio-text">
                    <p class="bio-paragraph">
                      I'm here to guide you through a transformation system backed by 
                      <span class="bio-highlight">300+ scientists</span>, <span class="bio-highlight">40+ years of research</span>, and proven across 
                      <span class="bio-highlight">12+ countries</span> with <span class="bio-highlight">18,900+ real transformations</span>.
                    </p>
                    
                    <p class="bio-paragraph">
                      This isn't just another program — it's a science-backed framework 
                      rooted in global nutrition philosophy. My role is to simplify the 
                      science, adapt it to your lifestyle, and walk with you every step 
                      of your <span class="bio-highlight">90-day journey</span>.
                    </p>
                  </div>
                  
                  <!-- What Makes This Different -->
                  <div class="what-makes-different">
                    <h4 class="different-headline">What Makes This Different:</h4>
                    <div class="different-cards">
                      <div class="different-card">
                        <div class="card-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div class="card-content">
                          <h5 class="card-title">Science-Backed</h5>
                          <p class="card-text">by 300+ Researchers</p>
                        </div>
                      </div>
                      
                      <div class="different-card">
                        <div class="card-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div class="card-content">
                          <h5 class="card-title">40+ Years</h5>
                          <p class="card-text">of Proven Results</p>
                        </div>
                      </div>
                      
                      <div class="different-card">
                        <div class="card-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div class="card-content">
                          <h5 class="card-title">18,900+</h5>
                          <p class="card-text">Transformations (97% Success Rate)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Feature Badges in Background -->
          <div class="background-feature-badges">
            <div class="bg-feature-badge bg-feature-badge-1">
              <div class="bg-feature-icon">💪</div>
              <div class="bg-feature-text">Strength Training</div>
            </div>
            <div class="bg-feature-badge bg-feature-badge-2">
              <div class="bg-feature-icon">⚡</div>
              <div class="bg-feature-text">Quick Workouts</div>
            </div>
            <div class="bg-feature-badge bg-feature-badge-3">
              <div class="bg-feature-icon">🍎</div>
              <div class="bg-feature-text">Smart Nutrition</div>
            </div>
          </div>
        </div>
        <!-- Premium Animated Background -->
        <div class="hero-bg-premium">
          <div class="bg-grid"></div>
          <div class="floating-particles">
            <div class="particle particle-1"></div>
            <div class="particle particle-2"></div>
            <div class="particle particle-3"></div>
            <div class="particle particle-4"></div>
            <div class="particle particle-5"></div>
            <div class="particle particle-6"></div>
          </div>
          <div class="gradient-blobs">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
          </div>
          <div class="light-rays">
            <div class="ray ray-1"></div>
            <div class="ray ray-2"></div>
            <div class="ray ray-3"></div>
          </div>
        </div>
      </section>
     <!-- Transformations Section - FIXED FOR EDITOR -->
<section class="transformations-section">
<div class="container">
  <div class="transformations-container">
    <div class="transformations-section-header">
      <h2 class="section-title text-glow">
        Real <span class="text-gradient text-shimmer">Transformations</span>
      </h2>
      <p class="section-subtitle">
        👥 18,900+ Transformations | ⚖️ 1,00,000+ kg Lost | ✅ 97% Success Rate
      </p>
    </div>
    
    <div class="transformations-top-row">
      <div class="transformations-top-track">
        <!-- Transformation 1: Pooja Lamba -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Pooja Lamba</h3>
              <p class="transformation-role">Teacher</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/0202bb2051f99ae9d3103d43dce00ec8" alt="Pooja Lamba Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/f3de3d35634276453f2297cf32562d1a" alt="Pooja Lamba After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "As a teacher with zero time for gym, I thought transformation was impossible. Lost 22kg, dropped 3 dress sizes. Finally confident in photos again!"
            </div>
          </div>
        </div>

        <!-- Transformation 2: Sourabh Soni -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Sourabh Soni</h3>
              <p class="transformation-role">Entrepreneur</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/b0a06ed170764f942791a8edb497f6f9" alt="Sourabh Soni Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/62b5228492f92ecf9de70f0f1b10d2ca" alt="Sourabh Soni After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Running a business 12 hours daily, I was too skinny and exhausted. Gained 8kg of muscle, energy tripled. Finally look how I feel!"
            </div>
          </div>
        </div>

        <!-- Transformation 3: Pooja Jindal -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Pooja Jindal</h3>
              <p class="transformation-role">Working Mom (Post-Pregnancy)</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/eaecc83ce400df534cded85768e9e666" alt="Pooja Jindal Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/33ae2b212a131e9b3be9228d649698bc" alt="Pooja Jindal After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Post-pregnancy, I felt invisible. As a working mom, time was zero. Lost 28kg, dropped 3 sizes. Finally feel like myself again!"
            </div>
          </div>
        </div>

        <!-- Transformation 4: Fany Patel - Franchisee Owner -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Fany Patel</h3>
              <p class="transformation-role">Franchisee Owner</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/c4e3038b9f6ef7b3e169dbe58c6c97c3" alt="Fany Patel Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/610bb5afbded936e9d14bc381da24a30" alt="Fany Patel After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Business owner at 90kg, hiding behind work. Lost 16kg while managing franchise operations. Best ROI ever—health impacts everything in business."
            </div>
          </div>
        </div>

        <!-- Transformation 5: Vishal Singh - Couple Transformation -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Vishal Singh</h3>
              <p class="transformation-role">Corporate Couple</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/35239085e97847335e1cdca2dfd68387" alt="Vishal Singh Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/c5703af2cbaa472fbafc8f1c893e952f" alt="Vishal Singh After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Corporate couple with opposite goals. I lost 23kg, she gained 10kg muscle. Same system worked for both. Transformed together while working."
            </div>
          </div>
        </div>

        <!-- Transformation 6: Kirti Madan - CA -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Kirti Madan</h3>
              <p class="transformation-role">CA (Chartered Accountant)</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/8cb03a4c4bda5fc196459acbb9a2bef4" alt="Kirti Madan Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/72c668942a70241c974d860fdf8d6dda" alt="Kirti Madan After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "CA life destroyed my skin and health. Tried everything medically. This holistic system cleared my skin, lost 7kg. Wish doctors recommended this."
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="transformations-bottom-row">
      <div class="transformations-bottom-track">
        <!-- Transformation 7: Meenu - Hormonal -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Meenu</h3>
              <p class="transformation-role">Hormonal Transformation</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/f8fa3b73e9f689d836c7f9bd9983b74a" alt="Meenu Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/ae18f32553797a50692788b1735055d6" alt="Meenu After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Spent thousands on dermatology treatments for hormonal acne. Nothing worked. This nutrition-based system cleared everything naturally. Wish I'd found this years ago."
            </div>
          </div>
        </div>

        <!-- Transformation 8: Reena Kumari - HomeMaker -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Reena Kumari</h3>
              <p class="transformation-role">Stay-at-Home Mom</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/793ae78d8e8ec45b586c0de33deceb05" alt="Reena Kumari Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/e2058e4f633bb1200ca2655bf12d7b56" alt="Reena Kumari After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Stay-at-home mom, 95kg, exhausted and invisible. Lost 28kg without separate meal prep. My kids asked 'Mom, why are you so happy now?'"
            </div>
          </div>
        </div>

        <!-- Transformation 9: Sumir Singh -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Sumir Singh</h3>
              <p class="transformation-role">Gym Personal Trainer</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/769e2295e19398766d5caa4813a390d3" alt="Sumir Singh Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/4c914a132efc360465cfb363438e514b" alt="Sumir Singh After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "As a gym trainer, I knew workouts but struggled to gain weight. This system taught me what I was missing. 50kg to 65kg!"
            </div>
          </div>
        </div>

        <!-- Transformation 10: Prince -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Prince</h3>
              <p class="transformation-role">Student</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/385c048756d168953f165105433fb23c" alt="Prince Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/a6c0563f869f1607002f248c60c8fdb3" alt="Prince After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Studying full-time, snacking constantly, thought fitness was impossible. Lost 26kg without leaving my room. This system actually fits student life."
            </div>
          </div>
        </div>

        <!-- Transformation 11: Nishant Mohan -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Nishant Mohan</h3>
              <p class="transformation-role">Teacher</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/4852a3637a3227b02e641865b7691b60" alt="Nishant Mohan Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/6d9bdf46853769d2ac6058ba27719368" alt="Nishant Mohan After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Exhausted after school, comfort eating at night. This system broke that cycle. 95kg to 70kg. My energy and confidence completely transformed teaching."
            </div>
          </div>
        </div>

        <!-- Transformation 12: Sonal Goyal -->
        <div class="transformation-slide-card">
          <div class="transformation-content">
            <div class="transformation-header">
              <h3 class="transformation-name">Sonal Goyal</h3>
              <p class="transformation-role">Bank Officer (Post-Pregnancy)</p>
            </div>
            <div class="before-after-images">
              <div class="before-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/0db7b380db49318280752bed96db5555" alt="Sonal Goyal Before">
                <span class="image-label">Before</span>
              </div>
              <div class="after-image">
                <img src="https://page.gensparksite.com/v1/base64_upload/3a164a734cd46e98bc229e6bfd9735e9" alt="Sonal Goyal After">
                <span class="image-label">After</span>
              </div>
              <div class="transformation-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
            <div class="transformation-quote">
              "Banking job plus motherhood left no time for myself. Lost 27kg without gym torture. Energy restored, confidence back. Best decision ever."
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</section>
    
      <!-- Benefits/Features Icon Grid Section -->
      <section class="benefits-grid-section">
        <div class="container">
          <div class="benefits-grid-content">
            <!-- Section Headline -->
            <h2 class="benefits-grid-headline">Why This System Works When Everything Else Failed</h2>
            
            <!-- 4-Column Icon Grid -->
            <div class="benefits-icon-grid">
              <div class="benefit-item">
                <div class="benefit-icon">
                  <span class="icon-emoji">🌍</span>
                </div>
                <h3 class="benefit-title">Works Everywhere</h3>
                <p class="benefit-description">
                  Follow the system at home, office, parties, or while traveling — 
                  zero location limits.
                </p>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">
                  <span class="icon-emoji">⏱️</span>
                </div>
                <h3 class="benefit-title">Just 15 Minutes Daily</h3>
                <p class="benefit-description">
                  Minimal time investment that fits even the busiest schedule 
                  without sacrifice.
                </p>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">
                  <span class="icon-emoji">🚫🏋️</span>
                </div>
                <h3 class="benefit-title">No Gym Required</h3>
                <p class="benefit-description">
                  No equipment, no membership, no special setup — works with 
                  what you already have.
                </p>
              </div>
              
              <div class="benefit-item">
                <div class="benefit-icon">
                  <span class="icon-emoji">♾️</span>
                </div>
                <h3 class="benefit-title">Results That Last</h3>
                <p class="benefit-description">
                  Build habits that stick forever — not another temporary diet 
                  that rebounds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- No Experience Needed Section - FIXED FOR GRAPESJS EDITOR -->
      <section class="no-experience-section">
        <div class="container">
          <!-- Section Header -->
          <div class="no-experience-header">
            <h2 class="section-title">
              <span class="text-gradient text-pulse">No Experience Needed</span>
            </h2>
            <p class="section-subtitle">
              Our system works regardless of your current fitness level or available time.
            </p>
          </div>
          
          <!-- Benefits Grid Layout (Editor-Friendly) -->
          <div class="no-experience-grid">
            <!-- Benefit Card 1 -->
            <div class="no-exp-card no-exp-card-1">
              <div class="no-exp-icon">⚡</div>
              <h4 class="no-exp-title">No Gym Required</h4>
              <p class="no-exp-text">Work out from home or office without any equipment needed.</p>
            </div>
            
            <!-- Benefit Card 2 -->
            <div class="no-exp-card no-exp-card-2">
              <div class="no-exp-icon">⚡</div>
              <h4 class="no-exp-title">No Special Diet</h4>
              <p class="no-exp-text">Flexible nutrition that fits your lifestyle and preferences.</p>
            </div>
            
            <!-- Central Circle -->
            <div class="no-exp-center-circle">
              <div class="circle-outer"></div>
              <div class="circle-middle"></div>
              <div class="circle-inner"></div>
            </div>
            
            <!-- Benefit Card 3 -->
            <div class="no-exp-card no-exp-card-3">
              <div class="no-exp-icon">⚡</div>
              <h4 class="no-exp-title">No Time Wasted</h4>
              <p class="no-exp-text">Maximum results in minimum time with our efficient system.</p>
            </div>
            
            <!-- Benefit Card 4 -->
            <div class="no-exp-card no-exp-card-4">
              <div class="no-exp-icon">⚡</div>
              <h4 class="no-exp-title">No Guesswork</h4>
              <p class="no-exp-text">Everything planned and tracked for you with clear guidance.</p>
            </div>
          </div>
          
          <!-- Call-to-Action Buttons -->
          <div class="no-experience-cta">
            <button class="rb-btn rb-btn--primary" onclick="scrollToForm()">
              Get Instant Access
            </button>
            <button class="rb-btn rb-btn--secondary" onclick="scrollToForm()">
              Book a Call
            </button>
          </div>
        </div>
      </section>
    
      <!-- Professional Features Section - FIXED FOR EDITOR -->
      <section class="features-section">
        <div class="container">
          <div class="features-section-header">
            <h2 class="section-title">
              What You'll Get <span class="text-gradient text-shimmer">Inside</span>
            </h2>
            <p class="section-subtitle">
              Everything you need to transform your health and fitness as a busy professional.
            </p>
          </div>
          <div class="features-grid">
            <div class="feature-card">
              <div>
                <span class="feature-icon">🎯</span>
                <h3 class="feature-title text-glow">Personalized Health Assessment</h3>
                <p class="feature-description">
                  Get a complete health analysis tailored to your busy schedule, lifestyle, and fitness goals.
                </p>
              </div>
            </div>
            <div class="feature-card">
              <div>
                <span class="feature-icon">⚡</span>
                <h3 class="feature-title text-glow">15-Minute Daily System</h3>
                <p class="feature-description">
                  Science-backed workouts and nutrition plans that fit into your demanding professional schedule.
                </p>
              </div>
            </div>
            <div class="feature-card">
              <div>
                <span class="feature-icon">📊</span>
                <h3 class="feature-title text-glow">Real-Time Progress Tracking</h3>
                <p class="feature-description">
                  Monitor your transformation with advanced metrics and get personalized adjustments weekly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Professional Success Stories Section - FIXED FOR EDITOR -->
      <section class="success-stories-section">
        <div class="container">
          <div class="stories-container">
            <div class="success-stories-header">
              <h2 class="section-title text-glow">
                Success <span class="text-gradient text-shimmer">Stories</span>
              </h2>
              <p class="section-subtitle">
                Real professionals achieving real results with our proven system.
              </p>
            </div>
            
            <!-- Top Row - Slides Right -->
            <div class="stories-top-row">
              <div class="stories-top-track">
                <!-- Blue Testimonial Card -->
                <div class="story-card story-card--blue">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"This playbook alone helped us increase webinar attendance by 340% and generated $47K in new revenue within 6 weeks."</p>
                    <div>
                      <div class="story-author">Raj Joshi</div>
                      <div class="story-role">Growth Strategist, ScaleEdge</div>
                      <div class="story-location">Mumbai, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Raj Joshi" class="story-profile">
                  </div>
                </div>

                <!-- Red Stats Card -->
                <div class="story-card story-card--red">
                  <div class="story-content">
                    <div class="story-stats">
                      <span class="story-stat-number">847%</span>
                      <div class="story-stat-label">lead generation increase</div>
                    </div>
                    <div class="story-stats">
                      <span class="story-stat-number">$127,500</span>
                      <div class="story-stat-label">revenue generated in 90 days</div>
                    </div>
                  </div>
                  <div style="background-image: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop&crop=face'); background-size: cover; background-position: center; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;"></div>
                </div>

                <!-- Gray Testimonial Card -->
                <div class="story-card story-card--gray">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"We increased our email list by 2,400% in just 8 weeks using the funnel strategies from this program. Game-changer!"</p>
                    <div>
                      <div class="story-author">Priya Sharma</div>
                      <div class="story-role">Marketing Director, TechFlow Solutions</div>
                      <div class="story-location">Bangalore, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face" alt="Priya Sharma" class="story-profile">
                  </div>
                </div>

                <!-- Gray Testimonial Card 2 -->
                <div class="story-card story-card--gray">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"Our conversion rate jumped from 2.3% to 18.7% in 4 weeks. This system is pure gold for any business serious about growth."</p>
                    <div>
                      <div class="story-author">Arjun Mehta</div>
                      <div class="story-role">CEO, Digital Innovations Hub</div>
                      <div class="story-location">Delhi NCR, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Arjun Mehta" class="story-profile">
                  </div>
                </div>

                <!-- Blue Testimonial Card 2 -->
                <div class="story-card story-card--blue">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"We scaled from $15K to $89K monthly revenue in 12 weeks using these funnel frameworks. The ROI is incredible!"</p>
                    <div>
                      <div class="story-author">Kavya Reddy</div>
                      <div class="story-role">Founder, GrowthMax Agency</div>
                      <div class="story-location">Hyderabad, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" alt="Kavya Reddy" class="story-profile">
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Row - Slides Left -->
            <div class="stories-bottom-row">
              <div class="stories-bottom-track">
                <!-- Gray Testimonial Card 3 -->
                <div class="story-card story-card--gray">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"Our customer acquisition cost dropped by 67% while our lifetime value increased by 340%. This system pays for itself!"</p>
                    <div>
                      <div class="story-author">Rohit Agarwal</div>
                      <div class="story-role">VP Marketing, CloudTech Solutions</div>
                      <div class="story-location">Pune, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" alt="Rohit Agarwal" class="story-profile">
                  </div>
                </div>

                <!-- Gray Testimonial Card 4 -->
                <div class="story-card story-card--gray">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"We generated 3,200 qualified leads in 60 days and closed our biggest deal worth $250K using these strategies."</p>
                    <div>
                      <div class="story-author">Anita Singh</div>
                      <div class="story-role">Sales Director, Enterprise Solutions</div>
                      <div class="story-location">Chennai, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" alt="Anita Singh" class="story-profile">
                  </div>
                </div>

                <!-- Blue Testimonial Card 3 -->
                <div class="story-card story-card--blue">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"We went from 50 leads per month to 1,400 leads per month in just 10 weeks. This funnel system is absolutely revolutionary!"</p>
                    <div>
                      <div class="story-author">Vikram Nair</div>
                      <div class="story-role">Head of Growth, FinTech Innovations</div>
                      <div class="story-location">Bangalore, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Vikram Nair" class="story-profile">
                  </div>
                </div>

                <!-- Image Background Stats Card -->
                <div class="story-card story-card--image" style="background-image: url('https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=280&fit=crop&crop=face');">
                  <div class="story-content">
                    <div class="story-stats">
                      <span class="story-stat-number">1,240%</span>
                      <div class="story-stat-label">ROI improvement</div>
                    </div>
                    <div class="story-stats">
                      <span class="story-stat-number">$2.1M</span>
                      <div class="story-stat-label">additional revenue generated</div>
                    </div>
                  </div>
                </div>

                <!-- Duplicate Cards for Smooth Sliding -->
                <!-- Gray Testimonial Card 3 Duplicate -->
                <div class="story-card story-card--gray">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"Our customer acquisition cost dropped by 67% while our lifetime value increased by 340%. This system pays for itself!"</p>
                    <div>
                      <div class="story-author">Rohit Agarwal</div>
                      <div class="story-role">VP Marketing, CloudTech Solutions</div>
                      <div class="story-location">Pune, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" alt="Rohit Agarwal" class="story-profile">
                  </div>
                </div>

                <!-- Gray Testimonial Card 4 Duplicate -->
                <div class="story-card story-card--gray">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"We generated 3,200 qualified leads in 60 days and closed our biggest deal worth $250K using these strategies."</p>
                    <div>
                      <div class="story-author">Anita Singh</div>
                      <div class="story-role">Sales Director, Enterprise Solutions</div>
                      <div class="story-location">Chennai, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" alt="Anita Singh" class="story-profile">
                  </div>
                </div>

                <!-- Blue Testimonial Card 3 Duplicate -->
                <div class="story-card story-card--blue">
                  <div class="story-content">
                    <div class="story-stars">⭐⭐⭐⭐⭐</div>
                    <p class="story-quote">"We went from 50 leads per month to 1,400 leads per month in just 10 weeks. This funnel system is absolutely revolutionary!"</p>
                    <div>
                      <div class="story-author">Vikram Nair</div>
                      <div class="story-role">Head of Growth, FinTech Innovations</div>
                      <div class="story-location">Bangalore, India</div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Vikram Nair" class="story-profile">
                  </div>
                </div>

                <!-- Image Background Stats Card Duplicate -->
                <div class="story-card story-card--image" style="background-image: url('https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=280&fit=crop&crop=face');">
                  <div class="story-content">
                    <div class="story-stats">
                      <span class="story-stat-number">1,240%</span>
                      <div class="story-stat-label">ROI improvement</div>
                    </div>
                    <div class="story-stats">
                      <span class="story-stat-number">$2.1M</span>
                      <div class="story-stat-label">additional revenue generated</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Verification Section - FIXED FOR EDITOR -->
      <section class="verification-section">
        <div class="container">
          <div class="verification-header">
            <h2 class="section-title">
              <span class="text-gradient text-pulse">5,000+</span> Professionals<br>
              <span class="text-shimmer">Already Transformed</span>
            </h2>
            <p class="section-subtitle">
              Join executives, entrepreneurs, and busy professionals who've already transformed their health without sacrificing their career success.
            </p>
            <button class="rb-btn rb-btn--primary" onclick="scrollToForm()">Join The Community</button>
          </div>
          
          <!-- Success Stories Grid -->
          <div class="verification-cards-grid">
            <div class="verification-card">
              <div class="verification-icon">👨‍💼</div>
              <h4 class="verification-role">CEO</h4>
              <p class="verification-result">Lost 35 lbs in 12 weeks</p>
            </div>
            <div class="verification-card">
              <div class="verification-icon">👩‍💻</div>
              <h4 class="verification-role">Tech Executive</h4>
              <p class="verification-result">Gained 15 lbs muscle</p>
            </div>
            <div class="verification-card">
              <div class="verification-icon">👨‍⚖️</div>
              <h4 class="verification-role">Lawyer</h4>
              <p class="verification-result">Improved energy 200%</p>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Simple 3-Step System - FIXED FOR EDITOR -->
      <section class="simple-system-section">
        <div class="container">
          <div class="simple-system-header">
            <h2 class="section-title text-glow">Simple 3-Step System</h2>
            <p class="section-subtitle">
              Our proven method that's helped over 5,000 busy professionals transform their health without disrupting their career momentum.
            </p>
          </div>
          
          <!-- Process Steps Grid -->
          <div class="process-steps">
            <!-- Step 1 -->
            <div class="process-card">
              <div class="process-number">1</div>
              <div>
                <span class="process-icon">📋</span>
                <h3 class="process-title text-shimmer">Assessment</h3>
                <p class="process-description">Complete a 5-minute health assessment that analyzes your schedule, goals, and current fitness level.</p>
              </div>
            </div>
            
            <!-- Step 2 -->
            <div class="process-card">
              <div class="process-number">2</div>
              <div>
                <span class="process-icon">🎯</span>
                <h3 class="process-title text-shimmer">Custom Plan</h3>
                <p class="process-description">Receive your personalized 15-minute daily system designed specifically for your busy lifestyle.</p>
              </div>
            </div>
            
            <!-- Step 3 -->
            <div class="process-card">
              <div class="process-number">3</div>
              <div>
                <span class="process-icon">🚀</span>
                <h3 class="process-title text-shimmer">Transform</h3>
                <p class="process-description">Follow your plan with weekly coaching support and see measurable results in just 2 weeks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      <!-- FAQ Section - FIXED FOR EDITOR -->
      <section class="faq-section">
        <div class="container">
          <div class="faq-section-header">
            <h2 class="section-title text-glow">Quick Questions</h2>
            <p class="section-subtitle">
              Get instant answers to the most important questions about our system.
            </p>
          </div>
          
          <div class="faq-container">
            <div class="faq-item" id="faq-1">
              <div class="faq-question" onclick="toggleFAQ('faq-1')">
                <span class="faq-question-text">Is this really free?</span>
                <span class="faq-icon">+</span>
              </div>
              <div class="faq-answer">
                <div class="faq-answer-content">
                  Yes, 100% free. No credit card required.
                </div>
              </div>
            </div>
            
            <div class="faq-item" id="faq-2">
              <div class="faq-question" onclick="toggleFAQ('faq-2')">
                <span class="faq-question-text">Who is this for?</span>
                <span class="faq-icon">+</span>
              </div>
              <div class="faq-answer">
                <div class="faq-answer-content">
                  Busy People who want real results without gym torture, meal prep or Time Restrictions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        
      <!-- Final CTA Section -->
      <section class="access-form-section section-padding" id="access-form">
        <div class="container">
          <div class="access-form-container">
            <h2 class="form-title text-shimmer">
              Ready to Discover the System That Actually Works?
            </h2>
            <p class="form-subtitle">Enter your details below to watch the free training now.</p>
            
            <form id="accessForm">
              <div class="rb-input-group">
                <label for="fullName" class="rb-input-label">Full Name *</label>
                <input type="text" id="fullName" name="fullName" class="rb-input" placeholder="Enter your full name" required>
              </div>
              
              <div class="rb-input-group">
                <label for="email" class="rb-input-label">Email Address *</label>
                <input type="email" id="email" name="email" class="rb-input" placeholder="your@email.com" required>
              </div>
              
              <div class="rb-input-group">
                <label for="phone" class="rb-input-label">Phone Number *</label>
                <input type="tel" id="phone" name="phone" class="rb-input" placeholder="Your phone number" required>
              </div>
              
              <div class="rb-input-group">
                <label for="position" class="rb-input-label">Professional Role *</label>
                <input type="text" id="position" name="position" class="rb-input" placeholder="e.g., CEO, Executive, Lawyer" required>
              </div>
              
              <button type="submit" class="rb-btn rb-btn--primary rb-btn--large" style="width: 100%; margin-bottom: 24px;">
                YES, SHOW ME THE FREE TRAINING →
              </button>
              
              <div class="form-benefits">
                <div class="form-benefit">🔒 Join 18,900+ people who've already transformed their lives</div>
              </div>
            </form>
          </div>
        </div>
      </section>
    
      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <h3 class="footer-title text-glow">[COACH NAME]</h3>
            <a href="mailto:coach@email.com" class="footer-email">📧 10x Shape Coach</a>
            <div class="footer-links">
              <a href="#" class="footer-link">Privacy Policy</a>
              <a href="#" class="footer-link">Terms of Service</a>
              <a href="#" class="footer-link">Disclaimer</a>
            </div>
          </div>
          
          <div class="disclaimers">
            <div class="disclaimer-section">
              <div class="disclaimer-title">Medical Disclaimer:</div>
              <div class="disclaimer-text">This information is for educational purposes only and is not intended as medical advice. Individual results may vary. The testimonials and examples used are not typical results and do not guarantee similar outcomes. Always consult with your healthcare provider before making any dietary changes or starting any health program, especially if you have existing medical conditions, take medications, or are pregnant or nursing.</div>
            </div>
            
            <div class="disclaimer-section">
              <div class="disclaimer-title">Results Disclaimer:</div>
              <div class="disclaimer-text">Success stories and testimonials represent individual experiences and are not typical results. Your results may vary depending on your starting point, commitment level, health status, and other factors beyond our control. We make no guarantee that you will achieve similar results.</div>
            </div>
            
            <div class="disclaimer-section">
              <div class="disclaimer-title">Professional Disclaimer:</div>
              <div class="disclaimer-text">Our coaches and program are not licensed medical professionals unless specifically stated. We provide lifestyle coaching and educational information only. This program is not intended to diagnose, treat, cure, or prevent any disease.</div>
            </div>
            
            <div class="disclaimer-section">
              <div class="disclaimer-title">Earnings Disclaimer:</div>
              <div class="disclaimer-text">Any references to cost savings or investment returns are based on individual client experiences and are not guaranteed. Your experience may differ.</div>
            </div>
            
            <div class="disclaimer-section">
              <div class="disclaimer-title">Liability Disclaimer:</div>
              <div class="disclaimer-text">By accessing this information, you acknowledge that you participate in any suggested activities at your own risk and assume full responsibility for your health and safety.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    `,
    
      js: `
(function() {
  'use strict';
  
  // FAQ Toggle Function
  window.toggleFAQ = function(faqId) {
    console.log('Toggling FAQ:', faqId);
    
    const faqItem = document.getElementById(faqId);
    if (!faqItem) {
      console.error('FAQ item not found:', faqId);
      return;
    }
    
    const answer = faqItem.querySelector('.faq-answer');
    const icon = faqItem.querySelector('.faq-icon');
    
    if (!answer) {
      console.error('FAQ answer not found in:', faqId);
      return;
    }
    
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
      if (item.id !== faqId && item.classList.contains('active')) {
        item.classList.remove('active');
        const otherAnswer = item.querySelector('.faq-answer');
        const otherIcon = item.querySelector('.faq-icon');
        if (otherAnswer) {
          otherAnswer.style.maxHeight = '0';
          otherAnswer.style.opacity = '0';
          otherAnswer.style.marginTop = '0';
        }
        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
      }
    });
    
    // Toggle current FAQ
    if (isActive) {
      faqItem.classList.remove('active');
      answer.style.maxHeight = '0';
      answer.style.opacity = '0';
      answer.style.marginTop = '0';
      if (icon) icon.style.transform = 'rotate(0deg)';
    } else {
      faqItem.classList.add('active');
      const content = answer.querySelector('.faq-answer-content');
      const contentHeight = content ? content.scrollHeight : answer.scrollHeight;
      answer.style.maxHeight = (contentHeight + 40) + 'px';
      answer.style.opacity = '1';
      answer.style.marginTop = '12px';
      if (icon) icon.style.transform = 'rotate(45deg)';
    }
  };
  
  // Play Button Handler
  window.handlePlayButtonClick = function() {
    const videoWrapper = document.querySelector('.video-placeholder-wrapper');
    const playButton = document.querySelector('.play-button-overlay');
    const overlayText = document.querySelector('.video-placeholder-overlay-text');
    
    if (playButton) playButton.style.display = 'none';
    if (overlayText) overlayText.style.display = 'none';
    
    const video = document.createElement('video');
    video.className = 'active-video-player';
    video.controls = true;
    video.autoplay = true;
    video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;';
    video.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    const placeholder = document.querySelector('.video-placeholder');
    if (placeholder) {
      placeholder.innerHTML = '';
      placeholder.appendChild(video);
    }
  };
  
  // Testimonial Slider
  let currentTestimonialSlide = 0;
  const totalTestimonials = 3;
  
  function updateTestimonialSlider() {
    const track = document.querySelector('.testimonial-slider-track');
    if (track) {
      const cardWidth = 350;
      const gap = 30;
      const translateX = -currentTestimonialSlide * (cardWidth + gap);
      track.style.transform = 'translateX(' + translateX + 'px)';
    }
  }
  
  window.nextTestimonial = function() {
    currentTestimonialSlide = (currentTestimonialSlide === totalTestimonials - 1) ? 0 : currentTestimonialSlide + 1;
    updateTestimonialSlider();
  };
  
  window.prevTestimonial = function() {
    currentTestimonialSlide = (currentTestimonialSlide === 0) ? totalTestimonials - 1 : currentTestimonialSlide - 1;
    updateTestimonialSlider();
  };
  
  // Scroll to Form Function - CRITICAL for CTAs
  window.scrollToForm = function() {
    console.log('📍 Scrolling to form...');
    
    // Try multiple selectors to find the form
    const formSelectors = [
      '.bss-direct-form-container',
      '.bss-direct-form-v2-container',
      '.access-form-container',
      '#access-form',
      '#accessForm',
      'form'
    ];
    
    let formElement = null;
    for (const selector of formSelectors) {
      formElement = document.querySelector(selector);
      if (formElement) {
        console.log('✅ Found form with selector:', selector);
        break;
      }
    }
    
    if (formElement) {
      // Smooth scroll to form
      formElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight effect
      formElement.style.transition = 'box-shadow 0.3s ease';
      formElement.style.boxShadow = '0 0 30px rgba(0, 212, 170, 0.6)';
      
      setTimeout(() => {
        formElement.style.boxShadow = '';
      }, 2000);
      
      console.log('✅ Scrolled to form successfully');
    } else {
      console.warn('⚠️ No form found on page');
      // Fallback: scroll to bottom
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  
  // Smooth Scrolling for Anchor Links
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  // Setup Button Click Handlers
  function setupEnrollButtons() {
    const enrollButtons = document.querySelectorAll('.enroll-button, .floating-cta-bar__button');
    enrollButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Scroll to form or trigger form action
        const formSection = document.querySelector('.bss-direct-form-container, .bss-direct-form-v2-container');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          alert('Form will be added here for enrollment!');
        }
      });
    });
  }
  
  // Setup Testimonial Slider Controls
  function setupTestimonialControls() {
    const prevBtn = document.querySelectorAll('.testimonial-slider-arrow')[0];
    const nextBtn = document.querySelectorAll('.testimonial-slider-arrow')[1];
    
    if (prevBtn) {
      prevBtn.addEventListener('click', window.prevTestimonial);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', window.nextTestimonial);
    }
  }
  
  // Setup Play Button
  function setupPlayButton() {
    const playButton = document.querySelector('.play-button-overlay');
    if (playButton) {
      playButton.addEventListener('click', window.handlePlayButtonClick);
    }
  }
  
  // Initialize FAQ System
  function initializeFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('Initializing', faqItems.length, 'FAQ items');
    
    faqItems.forEach(item => {
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');
      
      if (answer) {
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.4s ease, opacity 0.3s ease, margin-top 0.3s ease';
        answer.style.marginTop = '0';
      }
      
      if (icon) {
        icon.style.transition = 'transform 0.3s ease';
        icon.style.transform = 'rotate(0deg)';
      }
    });
  }
  
  // Animation on Scroll
  function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .client-card, .funnel-step, .testimonial-card, .agenda-sprint-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
  
  // Update Deadline
  function updateDeadline() {
    const deadlineElement = document.querySelector('.floating-cta-bar__deadline');
    if (deadlineElement) {
      const deadlineDate = new Date('2025-06-30');
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = deadlineDate.toLocaleDateString('en-US', options);
      deadlineElement.textContent = 'Offer ends ' + formattedDate;
    }
  }
  
  // Initialize Everything
  function init() {
    console.log('🚀 Initializing Fitness VSL Page...');
    
    setupSmoothScroll();
    setupEnrollButtons();
    setupTestimonialControls();
    setupPlayButton();
    initializeFAQs();
    setupScrollAnimations();
    updateDeadline();
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    console.log('✅ Fitness VSL Page initialized successfully!');
  }
  
  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
`,
      // Optional: Basic Info for template configuration
      basicInfo: {
        templateKey: 'fitness_vsl',
        category: 'vsl-page',
        targetAudience: 'Busy Professionals',
        isComplete: true,
        hasForm: true,
        hasCTA: true
      },
      // Optional: Default redirect page (can be overridden)
      redirectPage: ''
  }
}

// Also export as default for backward compatibility
export default fitnessVSLTemplates;
