import { welcomeTemplates } from "./temp";
import fitnessVSLTemplates from "./default_template/landing page1.jsx";

export const templates = {
    welcomeTemplates : welcomeTemplates.welcomeTemplates,

  vslTemplates: {

    
    'health_transformation_vsl_coach_page': {
      name: 'Health Transformation VSL Coach page',
      description: 'Complete VSL for weight loss coaching with progressive content unlock.',
      thumbnail: 'https://placehold.co/400x300/10b981/ffffff?text=Health+Transformation+VSL',
      html: `
        <div class="vsl-container">
          <!-- SECTION 1: HEADER -->
          <div class="vsl-header">
            <div class="brand-logo">
              <h2>YouCanTransform</h2>
            </div>
            <div class="trust-indicators">
              <span class="trust-badge">🏆 Award Winning</span>
              <span class="trust-badge">⭐ 4.9/5 Rating</span>
            </div>
          </div>
          
          <!-- TARGET AUDIENCE BAR -->
          <div class="target-audience-bar">
            <p>For Busy Professionals Who Have Tried Multiple Weight Loss Methods Without Long-Term Success</p>
          </div>
          
          <div class="vsl-content">
            <!-- SECTION 2: WELCOME MESSAGE -->
            <div class="welcome-section">
              <h1 class="welcome-headline">Welcome [LEAD NAME], You're About to Discover the Real Reason 97% of Weight Loss Attempts Fail</h1>
            </div>
            
            <!-- SECTION 3: CENTERED VIDEO PLAYER - EDITOR OPTIMIZED -->
            <div class="vsl-main-section">
              <div class="vsl-video-container">
                <div class="vsl-video-wrapper">
                  <video id="vslVideo" class="vsl-video-player" width="100%" height="100%" preload="metadata" disablePictureInPicture>
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div class="vsl-video-overlay" id="videoOverlay">
                  <div class="vsl-play-button">▶</div>
                </div>
                <div class="vsl-video-progress" id="videoProgress">
                  <div class="vsl-progress-bar">
                    <div class="vsl-progress-fill" id="statusFill"></div>
                  </div>
                  <div class="vsl-progress-text" id="progressText">0%</div>
                </div>
              </div>
              <p class="video-title">20-Minute High-Ticket VSL: "The Health Crisis Solution - Why 97% Fail Without Professional Guidance"</p>
            </div>
            
            <!-- SECTION 4: WHAT YOU'LL LEARN DETAILS (UNLOCKS DURING FIRST 50% OF VIDEO) -->
            <div class="learn-section" id="learnSection">
              <h2>What You'll Learn:</h2>
              <div class="learn-grid">
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>The Global Health Emergency</h3>
                    <p>Shocking statistics that reveal why traditional approaches are failing millions</p>
                </div>
              </div>
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>The 4 Failure Points</h3>
                    <p>Why willpower, information overload, healthcare gaps, and DIY disasters guarantee failure</p>
                </div>
              </div>
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>Coach Authority & Proof</h3>
                    <p>Meet the expert community transforming lives across 47 countries</p>
                  </div>
                </div>
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>The 5 Health Secrets</h3>
                    <p>Advanced protocols that doctors don't know (and why 97% can't implement them alone)</p>
                </div>
              </div>
            </div>
            
              <div class="why-different">
                <h3>Why This Training Is Different:</h3>
                <div class="different-grid">
                  <div class="different-item">
                    <span class="different-icon">🎯</span>
                    <span>Evidence-Based - Every claim backed by scientific research and real client results</span>
            </div>
                  <div class="different-item">
                    <span class="different-icon">🌍</span>
                    <span>Global Perspective - Methods tested across different cultures, lifestyles, and health systems</span>
                  </div>
                  <div class="different-item">
                    <span class="different-icon">👥</span>
                    <span>Community Support - Access to 300+ nutrition experts, not just one coach's opinion</span>
                  </div>
                  <div class="different-item">
                    <span class="different-icon">📊</span>
                    <span>Proven Results - 5,000+ professionals transformed with 94% success rate</span>
                  </div>
                  <div class="different-item">
                    <span class="different-icon">⚡</span>
                    <span>Implementation Focus - Not just knowledge - complete guided implementation system</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- SECTION 5: FIRST CTA SECTION (UNLOCKS AT 50% VIDEO COMPLETION) - EDITOR OPTIMIZED -->
            <div class="cta-section first-cta" id="firstCta">
              <h2 class="first-cta-title">Ready to Take Action?</h2>
              <div class="urgency-notice">
                <p class="urgency-text">⚠️ ONLY 3 ASSESSMENT SLOTS REMAINING THIS MONTH</p>
              </div>
              
              <div class="assessment-details">
                <h3 class="assessment-title">What Your FREE Assessment Includes:</h3>
                <div class="assessment-list">
                  <div class="assessment-item">
                    <span class="check-icon">✅</span>
                    <span class="assessment-item-text">Complete Health Factor Analysis - We'll identify the specific factors blocking your transformation</span>
                  </div>
                  <div class="assessment-item">
                    <span class="check-icon">✅</span>
                    <span class="assessment-item-text">Personalized Strategy Session - Discover your unique roadmap to sustainable results</span>
                  </div>
                  <div class="assessment-item">
                    <span class="check-icon">✅</span>
                    <span class="assessment-item-text">Qualification Review - Determine if our coaching system is right for your situation</span>
                  </div>
                </div>
                
                <div class="value-display">
                  <p class="value-text">Assessment Value: ₹2,999 | Your Investment Today: FREE</p>
                </div>
              </div>
              
              <button class="cta-button primary" id="firstCtaButton">BOOK MY FREE ASSESSMENT NOW →</button>
              
              <div class="cta-guarantees">
                <p>🔒 Secure Booking: Your spot is held for 24 hours once reserved</p>
                <p>📱 Instant Confirmation: You'll receive WhatsApp and email confirmation immediately</p>
              </div>
            </div>
            
            <!-- SECTION 6: SOCIAL PROOF (UNLOCKS AT 50% VIDEO COMPLETION) - EDITOR OPTIMIZED -->
            <div class="social-proof-section" id="socialProof">
              <h2>What Our Clients Say:</h2>
              
              <div class="testimonials">
                <div class="testimonial">
                  <h4>"Finally, A System That Works for My Schedule"</h4>
                  <p>"I tried every diet for 5 years. Nothing stuck. The coaching system understood my travel schedule, stress patterns, and family obligations. Lost 12kg in 75 days and it's stayed off for 8 months."</p>
                  <div class="testimonial-author">- Priya Sharma, Software Engineer, Bangalore</div>
                </div>
                
                <div class="testimonial">
                  <h4>"Saved Money While Getting Results"</h4>
                  <p>"I was spending ₹8,000 monthly on failed programs. This system cost less than what I was wasting but gave me actual transformation. 15kg gone while working 12-hour days."</p>
                  <div class="testimonial-author">- Rahul Patel, Marketing Director, Mumbai</div>
                </div>
                
                <div class="testimonial">
                  <h4>"Better Than Medical School Training"</h4>
                  <p>"As a physician, I thought I knew health. But I was 18kg overweight and pre-diabetic. This taught me what medical school missed - how to actually implement sustainable change."</p>
                  <div class="testimonial-author">- Dr. Sneha Reddy, Physician, Delhi</div>
                </div>
              </div>
              
              <div class="results-data">
                <h3>Real Transformation Data:</h3>
                <div class="data-grid">
                  <div class="data-item">
                    <div class="data-icon">📊</div>
                    <div class="data-content">
                      <h4>Average Results in 90 Days:</h4>
                      <ul>
                        <li>Weight Loss: 8-15kg</li>
                        <li>Energy Increase: 73% report significant improvement</li>
                        <li>Medical Marker Improvement: 89% see positive changes</li>
                        <li>Long-term Success: 94% maintain results after 1 year</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- SECTION 7: FINAL CTA SECTION (UNLOCKS AFTER VIDEO COMPLETION) - EDITOR OPTIMIZED -->
            <div class="cta-section final-cta" id="finalCta">
              <h2 class="final-cta-title">Don't Wait - Complete Your Transformation Journey</h2>
              <p class="final-urgency">Book Your Assessment Now - Only 3 Slots Left</p>
              
              <div class="enhanced-package">
                <h3 class="enhanced-package-title">Enhanced Assessment Package for Video Completers:</h3>
                <div class="package-list">
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Everything in standard assessment PLUS:</span>
                  </div>
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Implementation Planning - If qualified, we'll design your 90-day transformation timeline</span>
                  </div>
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Priority Booking - Skip the waitlist for program enrollment</span>
                  </div>
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Bonus Strategy Session - Extended consultation time for serious applicants</span>
                  </div>
                </div>
              </div>
              
              <div class="final-urgency-status">
                <h4>⏰ Current Status:</h4>
                <div class="status-grid">
                  <div class="status-item">Assessments Completed This Month: 47/50</div>
                  <div class="status-item">Remaining Slots: 3</div>
                  <div class="status-item">Next Available Slots: Next month at regular pricing</div>
                  <div class="status-item">Video Completion Bonus: Expires in 24 hours</div>
                </div>
              </div>
              
              <button class="cta-button primary large" id="finalCtaButton">SECURE MY PRIORITY ASSESSMENT →</button>
              
              <div class="final-guarantees">
                <p>🔒 Zero Risk: This assessment is completely complimentary with no obligations</p>
                <p>⚡ Act Fast: Priority bonuses available only for next 24 hours</p>
              </div>
            </div>
            
            <!-- SECTION 8: FINAL VALUE REINFORCEMENT - EDITOR OPTIMIZED -->
            <div class="value-reinforcement" id="valueReinforcement">
              <h2>Why Act Now:</h2>
              
              <div class="options-comparison">
                <div class="option option-bad">
                  <h3>Option 1: Continue the DIY Approach</h3>
                  <ul>
                    <li>❌ 97% failure rate</li>
                    <li>❌ ₹1,03,000+ annual waste on failed programs</li>
                    <li>❌ Years of frustration and health decline</li>
                    <li>❌ Fighting biology and psychology alone</li>
                  </ul>
                </div>
                
                <div class="option option-good">
                  <h3>Option 2: Professional Transformation Partnership</h3>
                  <ul>
                    <li>✅ 94% success rate with expert guidance</li>
                    <li>✅ Complete system addressing all failure points</li>
                    <li>✅ Personalized implementation for your lifestyle</li>
                    <li>✅ Community support from 300+ nutrition experts</li>
                  </ul>
                </div>
              </div>
              
              <div class="zero-risk-guarantee">
                <h3>Zero Risk Guarantee:</h3>
                <p>This assessment is completely complimentary. Even if our program isn't right for you, you'll discover more about your health and transformation blocks in 45 minutes than most people learn in years of trial and error.</p>
              </div>
            </div>
          </div>
          
          <!-- SECTION 9: FOOTER -->
        
        </div>
      `,
      css: `
        /* ==========================================
           HEALTH TRANSFORMATION VSL - EDITOR OPTIMIZED
           All inline styles removed for GrapesJS compatibility
           ========================================== */
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .vsl-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          max-width: 1750px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08);
          margin-top: 20px;
          margin-bottom: 20px;
        }
        
        .vsl-content {
          background: white;
        }
        
        .vsl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30px 0;
          border-bottom: 3px solid #f1f5f9;
          margin-bottom: 30px;
        }
        
        .brand-logo h2 {
          color: #1e293b;
          font-size: 2.2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        
        .trust-indicators {
          display: flex;
          gap: 15px;
        }
        
        .trust-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
          border: none;
        }
        
        .trust-badge:hover {
          transform: translateY(-2px);
          box-shadow?: 0 8px 20px rgba(16, 185, 129, 0.4);
        }
        
        /* Target Audience Bar */
        .target-audience-bar {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          padding: 20px 25px;
          text-align: center;
          margin: 30px 0;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(30, 41, 59, 0.15);
          border: 2px solid #e2e8f0;
        }
        
        .target-audience-bar p {
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
          letter-spacing: 0.3px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .vsl-content {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 24px;
          margin: 40px 0;
          padding: 60px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        
        .vsl-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%);
        }
        
        /* Welcome Section */
        .welcome-section {
          text-align: center;
          margin-bottom: 60px;
          padding: 40px 0;
          background: linear-gradient(135deg, #f0fdf4 0%, #e0f7fa 100%);
          border-radius: 20px;
          border: 1px solid #dcfce7;
          position: relative;
          overflow: hidden;
        }
        
        .welcome-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E") repeat;
          opacity: 0.5;
        }
        
        .welcome-headline {
          font-size: 2.8rem;
          font-weight: 900;
          color: #1e293b;
          line-height: 1.2;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          letter-spacing: -0.8px;
        }
        
        .welcome-headline span {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: #10b981;
        }
        
        /* VSL Video Section - Unique Class Names */
        .vsl-main-section {
          margin-bottom: 70px;
          text-align: center;
          background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
          padding: 50px 40px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
          position: relative;
        }
        
        .vsl-main-section::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #10b981, #059669, #047857, #10b981);
          border-radius: 24px;
          z-index: -1;
          opacity: 0.1;
        }
        
        /* Video Container - Editor Optimized */
        .vsl-video-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
        }
        
        .vsl-video-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          max-height: 500px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        }
        
        .vsl-video-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          border: none;
          outline: none;
          background: transparent;
          transition: all 0.3s ease;
        }
        
        .vsl-video-player:hover {
          transform: scale(1.02);
        }
        
        .video-title {
          margin-top: 25px;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e293b;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.4;
        }
        
        /* Video Overlay - Editor Optimized */
        .vsl-video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15), rgba(4,120,87,0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: all 0.4s ease;
          border-radius: 20px;
          cursor: pointer;
          backdrop-filter: blur(2px);
        }
        
        .vsl-video-overlay:hover {
          background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.25), rgba(4,120,87,0.25));
        }
        
        .vsl-play-button {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: #10b981;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2), 0 0 0 8px rgba(16,185,129,0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 3px solid rgba(16,185,129,0.2);
          position: relative;
        }
        
        .vsl-play-button::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          z-index: -1;
          opacity: 0;
          transition: all 0.4s ease;
        }
        
        .vsl-play-button:hover {
          transform: scale(1.15);
          background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
          box-shadow: 0 12px 35px rgba(16,185,129,0.3), 0 0 0 12px rgba(16,185,129,0.1);
          color: #059669;
        }
        
        .vsl-play-button:hover::before {
          opacity: 0.2;
          transform: scale(1.1);
        }
        
        .vsl-video-progress {
          margin-top: 25px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          padding: 20px 0;
        }
        
        .vsl-progress-bar {
          width: 100%;
          height: 10px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        
        .vsl-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%);
          border-radius: 10px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          width: 0%;
          position: relative;
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }
        
        .vsl-progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          border-radius: 10px;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .vsl-progress-text {
          text-align: center;
          margin-top: 12px;
          font-size: 1rem;
          color: #1e293b;
          font-weight: 700;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .play-button {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #6366f1;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        
        .video-progress {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(0,0,0,0.7);
          border-radius: 10px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          width: 0%;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          min-width: 40px;
        }
        
        .benefits-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .benefit-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .benefit-text h3 {
          font-size: 1.2rem;
          margin-bottom: 5px;
          color: #1e293b;
        }
        
        .benefit-text p {
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .cta-section {
          text-align: center;
        }
        
        .cta-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          color: white;
          border: none;
          padding: 22px 60px;
          font-size: 1.4rem;
          font-weight: 800;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          box-shadow: 0 8px 25px rgba(16,185,129,0.4);
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.2);
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(16,185,129,0.5);
          background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .cta-button:active {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.6);
        }
        
        .cta-subtext {
          margin-top: 15px;
          color: #ef4444;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        /* Learn Section */
        .learn-section {
          margin: 50px 0;
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .learn-section h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .learn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }
        
        .learn-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .learn-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .learn-icon {
          font-size: 1.5rem;
          margin-top: 2px;
        }
        
        .learn-content h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .learn-content p {
          color: #64748b;
          line-height: 1.5;
        }
        
        .why-different {
          background: white;
            padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        
        .why-different h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .different-grid {
          display: grid;
          gap: 15px;
        }
        
        .different-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        
        .different-icon {
          font-size: 1.2rem;
        }
        
        .different-item span:last-child {
          color: #374151;
          font-weight: 500;
        }
        
        /* ==========================================
           FIRST CTA SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .first-cta {
          display: none; /* Hidden until video progress unlocks it */
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 24px;
          padding: 50px 40px;
          border: 3px solid #f59e0b;
          margin: 60px 0;
          box-shadow: 0 15px 35px rgba(245,158,11,0.2);
          position: relative;
          overflow: hidden;
        }
        
        .first-cta-title {
          color: #1e293b;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .assessment-details {
          margin: 30px 0;
          text-align: left;
        }
        
        .assessment-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .assessment-list {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .assessment-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .assessment-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .assessment-item .check-icon {
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .assessment-item-text {
          color: #1e293b;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .first-cta::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #f59e0b, #ea580c, #dc2626, #f59e0b);
          border-radius: 24px;
          z-index: -1;
          opacity: 0.1;
          animation: borderGlow 3s ease-in-out infinite;
        }
        
        @keyframes borderGlow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        .urgency-notice {
          background: #fef2f2;
          border: 2px solid #f87171;
          border-radius: 12px;
          padding: 15px;
          margin: 20px 0;
        }
        
        .urgency-text {
          color: #dc2626;
          font-weight: 700;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .assessment-details {
          margin: 30px 0;
          text-align: left;
        }
        
        .assessment-details h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .assessment-list {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .assessment-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .check-icon {
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .value-display {
          text-align: center;
          margin: 25px 0;
        }
        
        .value-text {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
        }
        
        .cta-guarantees {
          margin-top: 20px;
        }
        
        .cta-guarantees p {
          margin: 8px 0;
          color: #374151;
          font-weight: 500;
        }
        
        /* ==========================================
           SOCIAL PROOF SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .social-proof-section {
          display: none; /* Hidden until video progress unlocks it */
          margin: 50px 0;
          padding: 40px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }
        
        .social-proof-section h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          text-align: center;
          margin-bottom: 40px;
        }
        
        .testimonials {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .testimonial {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }
        
        .testimonial h4 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 15px;
        }
        
        .testimonial p {
          color: #374151;
          line-height: 1.6;
          margin-bottom: 15px;
        }
        
        .testimonial-author {
          font-weight: 600;
          color: #6b7280;
          font-style: italic;
        }
        
        .results-data {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .results-data h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .data-grid {
          display: grid;
          gap: 20px;
        }
        
        .data-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .data-icon {
          font-size: 1.5rem;
          margin-top: 2px;
        }
        
        .data-content h4 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
        }
        
        .data-content ul {
          list-style: none;
          padding: 0;
        }
        
        .data-content li {
          color: #374151;
          margin: 5px 0;
          padding-left: 20px;
          position: relative;
        }
        
        .data-content li:before {
          content: "•";
          color: #10b981;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        /* ==========================================
           FINAL CTA SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .final-cta {
          display: none; /* Hidden until video completes */
          background: linear-gradient(135deg, #dcfdf7 0%, #a7f3d0 100%);
          border-radius: 24px;
          padding: 50px 40px;
          border: 2px solid #10b981;
          margin: 60px 0;
          box-shadow: 0 15px 35px rgba(16,185,129,0.2);
        }
        
        .final-cta-title {
          color: #1e293b;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .final-urgency {
          font-size: 1.3rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .enhanced-package {
          margin: 30px 0;
          text-align: left;
        }
        
        .enhanced-package-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .package-list {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .package-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .package-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .package-item .check-icon {
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .package-item-text {
          color: #1e293b;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .final-urgency-status {
          background: white;
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .final-urgency-status h4 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .status-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-weight: 600;
          color: #374151;
          text-align: center;
        }
        
        .cta-button.large {
          padding: 25px 60px;
          font-size: 1.4rem;
        }
        
        .final-guarantees {
          margin-top: 25px;
        }
        
        .final-guarantees p {
          margin: 10px 0;
          color: #065f46;
          font-weight: 600;
        }
        
        /* ==========================================
           VALUE REINFORCEMENT SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .value-reinforcement {
          display: none; /* Hidden until video completes */
          margin: 50px 0;
          padding: 40px;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-radius: 20px;
          border: 1px solid #f59e0b;
        }
        
        .value-reinforcement h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .options-comparison {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .option {
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .option-bad {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 2px solid #f87171;
        }
        
        .option-good {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #10b981;
        }
        
        .option h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .option-bad h3 {
          color: #dc2626;
        }
        
        .option-good h3 {
          color: #065f46;
        }
        
        .option ul {
          list-style: none;
          padding: 0;
        }
        
        .option li {
          margin: 12px 0;
          padding: 10px;
          border-radius: 8px;
          font-weight: 500;
        }
        
        .option-bad li {
          background: rgba(248, 113, 113, 0.1);
          color: #7f1d1d;
        }
        
        .option-good li {
          background: rgba(16, 185, 129, 0.1);
          color: #064e3b;
        }
        
        .zero-risk-guarantee {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .zero-risk-guarantee h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .zero-risk-guarantee p {
          color: #374151;
          line-height: 1.6;
        }
        
        /* Footer Styles */
        .vsl-footer {
          background: #1f2937;
          color: white;
          padding: 40px 0;
          margin-top: 40px;
        }
        
        .footer-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: 0 20px;
        }
        
        .footer-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .footer-content p {
          margin-bottom: 20px;
          color: #d1d5db;
        }
        
        .footer-links {
          margin-bottom: 30px;
        }
        
        .footer-links a {
          color: #d1d5db;
          text-decoration: none;
          margin: 0 10px;
          transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
          color: #10b981;
        }
        
        .disclaimers {
          text-align: left;
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 10px;
        }
        
        .disclaimers h4 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 15px;
          color: #f9fafb;
        }
        
        .disclaimers p {
          color: #d1d5db;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        /* ==========================================
           RESPONSIVE DESIGN - TABLET & MOBILE
           ========================================== */
        
        @media (max-width: 768px) {
          .vsl-container {
            padding: 15px;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          
          .vsl-content {
            padding: 25px;
          }
          
          .welcome-headline {
            font-size: 1.8rem;
          }
          
          .trust-indicators {
            flex-direction: column;
            gap: 10px;
          }
          
          .target-audience-bar {
            padding: 15px 20px;
          }
          
          .target-audience-bar p {
            font-size: 1rem;
          }
          
          .learn-section {
            padding: 25px;
          }
          
          .learn-grid {
            grid-template-columns: 1fr;
          }
          
          .testimonials {
            grid-template-columns: 1fr;
          }
          
          .options-comparison {
            grid-template-columns: 1fr;
          }
          
          .status-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-section {
            padding: 30px 20px;
          }
          
          .first-cta-title,
          .final-cta-title {
            font-size: 1.6rem;
          }
          
          .assessment-title,
          .enhanced-package-title {
            font-size: 1.3rem;
          }
          
          .cta-button {
            padding: 18px 40px;
            font-size: 1.1rem;
          }
          
          .cta-button.large {
            padding: 20px 45px;
            font-size: 1.2rem;
          }
          
          .first-cta, 
          .final-cta, 
          .value-reinforcement {
            padding: 30px 25px;
          }
          
          .social-proof-section {
            padding: 25px;
          }
          
          .assessment-list,
          .package-list {
            gap: 12px;
          }
          
          .assessment-item,
          .package-item {
            padding: 12px;
          }
          
          .vsl-footer {
            padding: 25px 0;
          }
          
          .footer-content {
            padding: 0 15px;
          }
          
          .disclaimers {
            padding: 15px;
          }
        }
        
        /* Mobile - Ultra Compact */
        @media (max-width: 480px) {
          .vsl-container {
            padding: 12px;
          }
          
          .vsl-content {
            padding: 20px;
          }
          
          .welcome-headline {
            font-size: 1.6rem;
          }
          
          .brand-logo h2 {
            font-size: 1.5rem;
          }
          
          .trust-indicators {
            gap: 8px;
          }
          
          .trust-badge {
            padding: 8px 12px;
            font-size: 0.8rem;
          }
          
          .target-audience-bar {
            padding: 12px 15px;
          }
          
          .target-audience-bar p {
            font-size: 0.9rem;
          }
          
          .first-cta-title,
          .final-cta-title {
            font-size: 1.4rem;
          }
          
          .assessment-title,
          .enhanced-package-title {
            font-size: 1.2rem;
          }
          
          .assessment-item,
          .package-item {
            padding: 10px;
            gap: 10px;
          }
          
          .check-icon {
            font-size: 1rem;
          }
          
          .assessment-item-text,
          .package-item-text {
            font-size: 0.9rem;
          }
          
          .cta-button {
            padding: 16px 30px;
            font-size: 1rem;
          }
          
          .cta-button.large {
            padding: 18px 35px;
            font-size: 1.1rem;
          }
          
          .first-cta, 
          .final-cta, 
          .value-reinforcement {
            padding: 25px 20px;
          }
          
          .social-proof-section {
            padding: 20px;
          }
        }
      `,
      js: `
      /* ==========================================
         VSL VIDEO TRACKING & PROGRESSIVE UNLOCK SYSTEM
         - 50% Progress: Shows First CTA + Social Proof
         - 100% Complete: Shows Final CTA + Value Reinforcement
         ========================================== */
      
      (function() {
        'use strict';
        console.log('🎬 VSL System Starting...');
        
        // State Management
        var vslState = {
          video: null,
          isPlaying: false,
          videoScore: 0,
          lastValidTime: 0,
          firstCtaShown: false,
          finalCtaShown: false,
          lastSentPercent: 0,
          leadId: localStorage.getItem('leadId'),
          coachId: localStorage.getItem('coachId')
        };
        
        // DOM Elements Cache
        var elements = {
          video: null,
          progress: null,
          progressText: null,
          playButton: null,
          videoOverlay: null,
          learnSection: null,
          firstCta: null,
          socialProof: null,
          finalCta: null,
          valueReinforcement: null
        };
        
        // Initialize VSL System
        function initializeVSL() {
          console.log('📹 Initializing VSL System...');
          console.log('👤 Lead ID:', vslState.leadId);
          
          // Cache all elements
          elements.video = document.getElementById('vslVideo');
          elements.progress = document.getElementById('statusFill');
          elements.progressText = document.getElementById('progressText');
          elements.playButton = document.querySelector('.vsl-play-button');
          elements.videoOverlay = document.getElementById('videoOverlay');
          elements.learnSection = document.getElementById('learnSection');
          elements.firstCta = document.getElementById('firstCta');
          elements.socialProof = document.getElementById('socialProof');
          elements.finalCta = document.getElementById('finalCta');
          elements.valueReinforcement = document.getElementById('valueReinforcement');
          
          vslState.video = elements.video;
          
          // Verify video element exists
          if (!elements.video) {
            console.error('❌ Video element not found!');
            return;
          }
          
          console.log('✅ Video element found');
          console.log('📊 Elements status:', {
            progress: !!elements.progress,
            progressText: !!elements.progressText,
            learnSection: !!elements.learnSection,
            firstCta: !!elements.firstCta,
            socialProof: !!elements.socialProof,
            finalCta: !!elements.finalCta,
            valueReinforcement: !!elements.valueReinforcement
          });
          
          // Toggle video play/pause
          function toggleVideo() {
            console.log('🎬 Toggle Video, isPlaying:', vslState.isPlaying);
            if (vslState.isPlaying) {
              vslState.video.pause();
            } else {
              vslState.video.play();
            }
          }
          
          // Video Event Listeners
          elements.video.addEventListener('play', function() {
            console.log('▶️ Video playing');
            vslState.isPlaying = true;
            if (elements.videoOverlay) elements.videoOverlay.style.display = 'none';
          });
          
          elements.video.addEventListener('pause', function() {
            console.log('⏸️ Video paused');
            vslState.isPlaying = false;
            if (elements.videoOverlay) elements.videoOverlay.style.display = 'flex';
          });
          
          elements.video.addEventListener('ended', function() {
            console.log('🏁 Video ended - 100% complete');
            sendProgressToAPI(100);
            if (!vslState.finalCtaShown) {
              showFinalContent();
              vslState.finalCtaShown = true;
            }
            vslState.isPlaying = false;
            if (elements.videoOverlay) elements.videoOverlay.style.display = 'flex';
          });
          
          // Prevent seeking
          elements.video.addEventListener('seeking', function(e) {
            console.log('⚠️ Seeking blocked');
            elements.video.currentTime = vslState.lastValidTime;
            e.preventDefault();
            return false;
          });
          
          elements.video.addEventListener('seeked', function(e) {
            console.log('⚠️ Seeked blocked');
            elements.video.currentTime = vslState.lastValidTime;
            e.preventDefault();
            return false;
          });
          
          // Video click handler
          elements.video.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleVideo();
          });
          
          // Main progress tracking - THIS SENDS API CALLS
          elements.video.addEventListener('timeupdate', function() {
            var currentTime = elements.video.currentTime;
            var duration = elements.video.duration;
            
            if (!duration || isNaN(duration)) return;
            
            var percent = Math.round((currentTime / duration) * 100);
            vslState.videoScore = percent;
            vslState.lastValidTime = currentTime;
            
            // Update progress bar
            if (elements.progress) {
              elements.progress.style.width = percent + '%';
            }
            if (elements.progressText) {
              elements.progressText.textContent = percent + '%';
            }
            
            // Log every 10% for debugging
            if (percent % 10 === 0 && percent !== vslState.lastSentPercent) {
              console.log('📊 Video Progress:', percent + '%');
            }
            
            // 50% Milestone - Show First Content
            if (percent >= 50 && !vslState.firstCtaShown) {
              console.log('🎯 50% MILESTONE REACHED!');
              console.log('└─ Showing First CTA + Social Proof');
              showFirstContent();
              vslState.firstCtaShown = true;
            }
            
            // 100% Milestone - Show Final Content
            if (percent >= 100 && !vslState.finalCtaShown) {
              console.log('🎉 100% MILESTONE REACHED!');
              console.log('└─ Showing Final CTA + Value Reinforcement');
              showFinalContent();
              vslState.finalCtaShown = true;
            }
            
            // 🔥 API CALL: Send progress to backend every 5%
            if (vslState.leadId && percent >= vslState.lastSentPercent + 5 && percent <= 100) {
              console.log('📤 API CALL: Sending ' + percent + '% progress to backend');
              sendProgressToAPI(percent);
              vslState.lastSentPercent = percent;
            }
          });
          
          // Play button handlers
          if (elements.playButton) {
            elements.playButton.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              toggleVideo();
            });
          }
          
          if (elements.videoOverlay) {
            elements.videoOverlay.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              toggleVideo();
            });
          }
          
          // Populate lead name
          populateLeadName();
        }
        
        // Show content at 50% progress
        function showFirstContent() {
          console.log('🚀 Showing First Content (50%)...');
          
          // Hide learn section
          if (elements.learnSection) {
            elements.learnSection.style.display = 'none';
            console.log('  ✅ Hidden learn section');
          }
          
          // Show First CTA
          if (elements.firstCta) {
            elements.firstCta.style.display = 'block';
            elements.firstCta.style.opacity = '0';
            elements.firstCta.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.firstCta.style.opacity = '1';
              setupCTAButtons();
            }, 100);
            console.log('  ✅ Shown first CTA with fade-in');
          } else {
            console.warn('  ⚠️ First CTA element not found');
          }
          
          // Show Social Proof
          if (elements.socialProof) {
            elements.socialProof.style.display = 'block';
            elements.socialProof.style.opacity = '0';
            elements.socialProof.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.socialProof.style.opacity = '1';
            }, 200);
            console.log('  ✅ Shown social proof with fade-in');
          } else {
            console.warn('  ⚠️ Social proof element not found');
          }
        }
        
        // Show content at 100% completion
        function showFinalContent() {
          console.log('🎉 Showing Final Content (100%)...');
          
          // Show Final CTA
          if (elements.finalCta) {
            elements.finalCta.style.display = 'block';
            elements.finalCta.style.opacity = '0';
            elements.finalCta.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.finalCta.style.opacity = '1';
              setupCTAButtons();
            }, 100);
            console.log('  ✅ Shown final CTA with fade-in');
          } else {
            console.warn('  ⚠️ Final CTA element not found');
          }
          
          // Show Value Reinforcement
          if (elements.valueReinforcement) {
            elements.valueReinforcement.style.display = 'block';
            elements.valueReinforcement.style.opacity = '0';
            elements.valueReinforcement.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.valueReinforcement.style.opacity = '1';
            }, 200);
            console.log('  ✅ Shown value reinforcement with fade-in');
          } else {
            console.warn('  ⚠️ Value reinforcement element not found');
          }
        }
        
        // Setup CTA button click handlers
        function setupCTAButtons() {
          var firstBtn = document.getElementById('firstCtaButton');
          var finalBtn = document.getElementById('finalCtaButton');
          
          if (firstBtn) {
            firstBtn.addEventListener('click', function(e) {
              e.preventDefault();
              handleCTAClick('first_assessment');
            });
            console.log('✅ First CTA button initialized');
          }
          
          if (finalBtn) {
            finalBtn.addEventListener('click', function(e) {
              e.preventDefault();
              handleCTAClick('priority_assessment');
            });
            console.log('✅ Final CTA button initialized');
          }
        }
        
        // Handle CTA clicks
        function handleCTAClick(ctaType) {
          console.log('🎯 CTA Clicked:', ctaType, 'Video Score:', vslState.videoScore + '%');
          
          // Navigate to appointment page
          var currentPath = window.location.pathname;
          var pathParts = currentPath.split('/');
          pathParts[pathParts.length - 1] = 'appointment-page';
          var newPath = pathParts.join('/');
          
          // Send CTA click data to API
          if (vslState.leadId) {
            var payload = {
              ctaClicked: ctaType,
              vslWatchPercentage: vslState.videoScore,
              status: 'Video Sales Letter',
              timestamp: new Date().toISOString()
            };
            
            console.log('📤 Sending CTA API Call:', payload);
            
            fetch('https://api.funnelseye.com/api/leads/' + vslState.leadId, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            .then(function(response) {
              console.log('📥 API Response:', response.status);
              return response.json();
            })
            .then(function(data) {
              console.log('✅ API Success:', data);
            })
            .catch(function(error) {
              console.error('❌ API Error:', error);
            });
          }
          
          // Navigate
          window.location.href = newPath;
        }
        
        // Send progress to API - BACKEND TRACKING
        function sendProgressToAPI(percent) {
          if (!vslState.leadId) {
            console.warn('⚠️ No Lead ID - Skipping API call');
            return;
          }
          
          var payload = {
            vslWatchPercentage: percent,
            currentTime: elements.video.currentTime,
            videoDuration: elements.video.duration,
            status: 'Video Sales Letter',
            timestamp: new Date().toISOString(),
            coachId: vslState.coachId
          };
          
          console.log('📤 SENDING TO BACKEND:', {
            leadId: vslState.leadId,
            percent: percent + '%',
            payload: payload
          });
          
          fetch('https://api.funnelseye.com/api/leads/' + vslState.leadId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          .then(function(response) {
            console.log('📥 API Response Status:', response.status);
            return response.json();
          })
          .then(function(data) {
            console.log('✅ API SUCCESS:', {
              percent: percent + '%',
              response: data
            });
          })
          .catch(function(error) {
            console.error('❌ API ERROR:', {
              percent: percent + '%',
              error: error.message
            });
          });
        }
        
        // Populate lead name in headline
        function populateLeadName() {
          var leadName = localStorage.getItem('leadName') || 
                        localStorage.getItem('firstName') || 
                        localStorage.getItem('name');
          
          if (leadName) {
            document.querySelectorAll('h1').forEach(function(el) {
              if (el.textContent.includes('[LEAD NAME]')) {
                el.innerHTML = el.innerHTML.replace('[LEAD NAME]', leadName);
                console.log('✅ Lead name populated:', leadName);
              }
            });
          } else {
            console.log('⚠️ No lead name found in localStorage');
          }
        }
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initializeVSL);
          console.log('⏳ Waiting for DOM...');
        } else {
          initializeVSL();
          console.log('✅ DOM already loaded, initializing...');
        }
        
        console.log('🎬 VSL System Ready!');
      })();
      `
    },
    'health_transformation_vsl': {
      name: 'Health Transformation VSL customar page',
      description: 'Complete VSL for weight loss coaching with progressive content unlock.',
      thumbnail: 'https://placehold.co/400x300/10b981/ffffff?text=Health+Transformation+VSL',
      html: `
        <div class="vsl-container">
          <!-- SECTION 1: HEADER -->
          <div class="vsl-header">
            <div class="brand-logo">
              <h2>YouCanTransform</h2>
            </div>
            <div class="trust-indicators">
              <span class="trust-badge">🏆 Award Winning</span>
              <span class="trust-badge">⭐ 4.9/5 Rating</span>
            </div>
          </div>
          
          <!-- TARGET AUDIENCE BAR -->
          <div class="target-audience-bar">
            <p>For Busy Professionals Who Have Tried Multiple Weight Loss Methods Without Long-Term Success</p>
          </div>
          
          <div class="vsl-content">
            <!-- SECTION 2: WELCOME MESSAGE -->
            <div class="welcome-section">
              <h1 class="welcome-headline">Welcome [LEAD NAME], You're About to Discover the Real Reason 97% of Weight Loss Attempts Fail</h1>
            </div>
            
            <!-- SECTION 3: CENTERED VIDEO PLAYER - EDITOR OPTIMIZED -->
            <div class="vsl-main-section">
              <div class="vsl-video-container">
                <div class="vsl-video-wrapper">
                  <video id="vslVideo" class="vsl-video-player" width="100%" height="100%" preload="metadata" disablePictureInPicture>
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div class="vsl-video-overlay" id="videoOverlay">
                  <div class="vsl-play-button">▶</div>
                </div>
                <div class="vsl-video-progress" id="videoProgress">
                  <div class="vsl-progress-bar">
                    <div class="vsl-progress-fill" id="statusFill"></div>
                  </div>
                  <div class="vsl-progress-text" id="progressText">0%</div>
                </div>
              </div>
              <p class="video-title">20-Minute High-Ticket VSL: "The Health Crisis Solution - Why 97% Fail Without Professional Guidance"</p>
            </div>
            
            <!-- SECTION 4: WHAT YOU'LL LEARN DETAILS (UNLOCKS DURING FIRST 50% OF VIDEO) -->
            <div class="learn-section" id="learnSection">
              <h2>What You'll Learn:</h2>
              <div class="learn-grid">
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>The Global Health Emergency</h3>
                    <p>Shocking statistics that reveal why traditional approaches are failing millions</p>
                </div>
              </div>
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>The 4 Failure Points</h3>
                    <p>Why willpower, information overload, healthcare gaps, and DIY disasters guarantee failure</p>
                </div>
              </div>
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>Coach Authority & Proof</h3>
                    <p>Meet the expert community transforming lives across 47 countries</p>
                  </div>
                </div>
                <div class="learn-item">
                  <div class="learn-icon">✅</div>
                  <div class="learn-content">
                    <h3>The 5 Health Secrets</h3>
                    <p>Advanced protocols that doctors don't know (and why 97% can't implement them alone)</p>
                </div>
              </div>
            </div>
            
              <div class="why-different">
                <h3>Why This Training Is Different:</h3>
                <div class="different-grid">
                  <div class="different-item">
                    <span class="different-icon">🎯</span>
                    <span>Evidence-Based - Every claim backed by scientific research and real client results</span>
            </div>
                  <div class="different-item">
                    <span class="different-icon">🌍</span>
                    <span>Global Perspective - Methods tested across different cultures, lifestyles, and health systems</span>
                  </div>
                  <div class="different-item">
                    <span class="different-icon">👥</span>
                    <span>Community Support - Access to 300+ nutrition experts, not just one coach's opinion</span>
                  </div>
                  <div class="different-item">
                    <span class="different-icon">📊</span>
                    <span>Proven Results - 5,000+ professionals transformed with 94% success rate</span>
                  </div>
                  <div class="different-item">
                    <span class="different-icon">⚡</span>
                    <span>Implementation Focus - Not just knowledge - complete guided implementation system</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- SECTION 5: FIRST CTA SECTION (UNLOCKS AT 50% VIDEO COMPLETION) - EDITOR OPTIMIZED -->
            <div class="cta-section first-cta" id="firstCta">
              <h2 class="first-cta-title">Ready to Take Action?</h2>
              <div class="urgency-notice">
                <p class="urgency-text">⚠️ ONLY 3 ASSESSMENT SLOTS REMAINING THIS MONTH</p>
              </div>
              
              <div class="assessment-details">
                <h3 class="assessment-title">What Your FREE Assessment Includes:</h3>
                <div class="assessment-list">
                  <div class="assessment-item">
                    <span class="check-icon">✅</span>
                    <span class="assessment-item-text">Complete Health Factor Analysis - We'll identify the specific factors blocking your transformation</span>
                  </div>
                  <div class="assessment-item">
                    <span class="check-icon">✅</span>
                    <span class="assessment-item-text">Personalized Strategy Session - Discover your unique roadmap to sustainable results</span>
                  </div>
                  <div class="assessment-item">
                    <span class="check-icon">✅</span>
                    <span class="assessment-item-text">Qualification Review - Determine if our coaching system is right for your situation</span>
                  </div>
                </div>
                
                <div class="value-display">
                  <p class="value-text">Assessment Value: ₹2,999 | Your Investment Today: FREE</p>
                </div>
              </div>
              
              <button class="cta-button primary" id="firstCtaButton">BOOK MY FREE ASSESSMENT NOW →</button>
              
              <div class="cta-guarantees">
                <p>🔒 Secure Booking: Your spot is held for 24 hours once reserved</p>
                <p>📱 Instant Confirmation: You'll receive WhatsApp and email confirmation immediately</p>
              </div>
            </div>
            
            <!-- SECTION 6: SOCIAL PROOF (UNLOCKS AT 50% VIDEO COMPLETION) - EDITOR OPTIMIZED -->
            <div class="social-proof-section" id="socialProof">
              <h2>What Our Clients Say:</h2>
              
              <div class="testimonials">
                <div class="testimonial">
                  <h4>"Finally, A System That Works for My Schedule"</h4>
                  <p>"I tried every diet for 5 years. Nothing stuck. The coaching system understood my travel schedule, stress patterns, and family obligations. Lost 12kg in 75 days and it's stayed off for 8 months."</p>
                  <div class="testimonial-author">- Priya Sharma, Software Engineer, Bangalore</div>
                </div>
                
                <div class="testimonial">
                  <h4>"Saved Money While Getting Results"</h4>
                  <p>"I was spending ₹8,000 monthly on failed programs. This system cost less than what I was wasting but gave me actual transformation. 15kg gone while working 12-hour days."</p>
                  <div class="testimonial-author">- Rahul Patel, Marketing Director, Mumbai</div>
                </div>
                
                <div class="testimonial">
                  <h4>"Better Than Medical School Training"</h4>
                  <p>"As a physician, I thought I knew health. But I was 18kg overweight and pre-diabetic. This taught me what medical school missed - how to actually implement sustainable change."</p>
                  <div class="testimonial-author">- Dr. Sneha Reddy, Physician, Delhi</div>
                </div>
              </div>
              
              <div class="results-data">
                <h3>Real Transformation Data:</h3>
                <div class="data-grid">
                  <div class="data-item">
                    <div class="data-icon">📊</div>
                    <div class="data-content">
                      <h4>Average Results in 90 Days:</h4>
                      <ul>
                        <li>Weight Loss: 8-15kg</li>
                        <li>Energy Increase: 73% report significant improvement</li>
                        <li>Medical Marker Improvement: 89% see positive changes</li>
                        <li>Long-term Success: 94% maintain results after 1 year</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- SECTION 7: FINAL CTA SECTION (UNLOCKS AFTER VIDEO COMPLETION) - EDITOR OPTIMIZED -->
            <div class="cta-section final-cta" id="finalCta">
              <h2 class="final-cta-title">Don't Wait - Complete Your Transformation Journey</h2>
              <p class="final-urgency">Book Your Assessment Now - Only 3 Slots Left</p>
              
              <div class="enhanced-package">
                <h3 class="enhanced-package-title">Enhanced Assessment Package for Video Completers:</h3>
                <div class="package-list">
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Everything in standard assessment PLUS:</span>
                  </div>
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Implementation Planning - If qualified, we'll design your 90-day transformation timeline</span>
                  </div>
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Priority Booking - Skip the waitlist for program enrollment</span>
                  </div>
                  <div class="package-item">
                    <span class="check-icon">✅</span>
                    <span class="package-item-text">Bonus Strategy Session - Extended consultation time for serious applicants</span>
                  </div>
                </div>
              </div>
              
              <div class="final-urgency-status">
                <h4>⏰ Current Status:</h4>
                <div class="status-grid">
                  <div class="status-item">Assessments Completed This Month: 47/50</div>
                  <div class="status-item">Remaining Slots: 3</div>
                  <div class="status-item">Next Available Slots: Next month at regular pricing</div>
                  <div class="status-item">Video Completion Bonus: Expires in 24 hours</div>
                </div>
              </div>
              
              <button class="cta-button primary large" id="finalCtaButton">SECURE MY PRIORITY ASSESSMENT →</button>
              
              <div class="final-guarantees">
                <p>🔒 Zero Risk: This assessment is completely complimentary with no obligations</p>
                <p>⚡ Act Fast: Priority bonuses available only for next 24 hours</p>
              </div>
            </div>
            
            <!-- SECTION 8: FINAL VALUE REINFORCEMENT - EDITOR OPTIMIZED -->
            <div class="value-reinforcement" id="valueReinforcement">
              <h2>Why Act Now:</h2>
              
              <div class="options-comparison">
                <div class="option option-bad">
                  <h3>Option 1: Continue the DIY Approach</h3>
                  <ul>
                    <li>❌ 97% failure rate</li>
                    <li>❌ ₹1,03,000+ annual waste on failed programs</li>
                    <li>❌ Years of frustration and health decline</li>
                    <li>❌ Fighting biology and psychology alone</li>
                  </ul>
                </div>
                
                <div class="option option-good">
                  <h3>Option 2: Professional Transformation Partnership</h3>
                  <ul>
                    <li>✅ 94% success rate with expert guidance</li>
                    <li>✅ Complete system addressing all failure points</li>
                    <li>✅ Personalized implementation for your lifestyle</li>
                    <li>✅ Community support from 300+ nutrition experts</li>
                  </ul>
                </div>
              </div>
              
              <div class="zero-risk-guarantee">
                <h3>Zero Risk Guarantee:</h3>
                <p>This assessment is completely complimentary. Even if our program isn't right for you, you'll discover more about your health and transformation blocks in 45 minutes than most people learn in years of trial and error.</p>
              </div>
            </div>
          </div>
          
          <!-- SECTION 9: FOOTER -->
        
        </div>
      `,
      css: `
        /* ==========================================
           HEALTH TRANSFORMATION VSL - EDITOR OPTIMIZED
           All inline styles removed for GrapesJS compatibility
           ========================================== */
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .vsl-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          max-width: 1750px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08);
          margin-top: 20px;
          margin-bottom: 20px;
        }
        
        .vsl-content {
          background: white;
        }
        
        .vsl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30px 0;
          border-bottom: 3px solid #f1f5f9;
          margin-bottom: 30px;
        }
        
        .brand-logo h2 {
          color: #1e293b;
          font-size: 2.2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        
        .trust-indicators {
          display: flex;
          gap: 15px;
        }
        
        .trust-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
          border: none;
        }
        
        .trust-badge:hover {
          transform: translateY(-2px);
          box-shadow?: 0 8px 20px rgba(16, 185, 129, 0.4);
        }
        
        /* Target Audience Bar */
        .target-audience-bar {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          padding: 20px 25px;
          text-align: center;
          margin: 30px 0;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(30, 41, 59, 0.15);
          border: 2px solid #e2e8f0;
        }
        
        .target-audience-bar p {
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
          letter-spacing: 0.3px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .vsl-content {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 24px;
          margin: 40px 0;
          padding: 60px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        
        .vsl-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%);
        }
        
        /* Welcome Section */
        .welcome-section {
          text-align: center;
          margin-bottom: 60px;
          padding: 40px 0;
          background: linear-gradient(135deg, #f0fdf4 0%, #e0f7fa 100%);
          border-radius: 20px;
          border: 1px solid #dcfce7;
          position: relative;
          overflow: hidden;
        }
        
        .welcome-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310b981' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E") repeat;
          opacity: 0.5;
        }
        
        .welcome-headline {
          font-size: 2.8rem;
          font-weight: 900;
          color: #1e293b;
          line-height: 1.2;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          letter-spacing: -0.8px;
        }
        
        .welcome-headline span {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: #10b981;
        }
        
        /* VSL Video Section - Unique Class Names */
        .vsl-main-section {
          margin-bottom: 70px;
          text-align: center;
          background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
          padding: 50px 40px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
          position: relative;
        }
        
        .vsl-main-section::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #10b981, #059669, #047857, #10b981);
          border-radius: 24px;
          z-index: -1;
          opacity: 0.1;
        }
        
        /* Video Container - Editor Optimized */
        .vsl-video-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
        }
        
        .vsl-video-wrapper {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          max-height: 500px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        }
        
        .vsl-video-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          border: none;
          outline: none;
          background: transparent;
          transition: all 0.3s ease;
        }
        
        .vsl-video-player:hover {
          transform: scale(1.02);
        }
        
        .video-title {
          margin-top: 25px;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e293b;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.4;
        }
        
        /* Video Overlay - Editor Optimized */
        .vsl-video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15), rgba(4,120,87,0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: all 0.4s ease;
          border-radius: 20px;
          cursor: pointer;
          backdrop-filter: blur(2px);
        }
        
        .vsl-video-overlay:hover {
          background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.25), rgba(4,120,87,0.25));
        }
        
        .vsl-play-button {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: #10b981;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2), 0 0 0 8px rgba(16,185,129,0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 3px solid rgba(16,185,129,0.2);
          position: relative;
        }
        
        .vsl-play-button::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          z-index: -1;
          opacity: 0;
          transition: all 0.4s ease;
        }
        
        .vsl-play-button:hover {
          transform: scale(1.15);
          background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
          box-shadow: 0 12px 35px rgba(16,185,129,0.3), 0 0 0 12px rgba(16,185,129,0.1);
          color: #059669;
        }
        
        .vsl-play-button:hover::before {
          opacity: 0.2;
          transform: scale(1.1);
        }
        
        .vsl-video-progress {
          margin-top: 25px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          padding: 20px 0;
        }
        
        .vsl-progress-bar {
          width: 100%;
          height: 10px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        
        .vsl-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%);
          border-radius: 10px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          width: 0%;
          position: relative;
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }
        
        .vsl-progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          border-radius: 10px;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .vsl-progress-text {
          text-align: center;
          margin-top: 12px;
          font-size: 1rem;
          color: #1e293b;
          font-weight: 700;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .play-button {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: #6366f1;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        
        .video-progress {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(0,0,0,0.7);
          border-radius: 10px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          width: 0%;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          min-width: 40px;
        }
        
        .benefits-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .benefit-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .benefit-text h3 {
          font-size: 1.2rem;
          margin-bottom: 5px;
          color: #1e293b;
        }
        
        .benefit-text p {
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .cta-section {
          text-align: center;
        }
        
        .cta-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          color: white;
          border: none;
          padding: 22px 60px;
          font-size: 1.4rem;
          font-weight: 800;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          box-shadow: 0 8px 25px rgba(16,185,129,0.4);
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.2);
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(16,185,129,0.5);
          background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .cta-button:active {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.6);
        }
        
        .cta-subtext {
          margin-top: 15px;
          color: #ef4444;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        /* Learn Section */
        .learn-section {
          margin: 50px 0;
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .learn-section h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .learn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }
        
        .learn-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .learn-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .learn-icon {
          font-size: 1.5rem;
          margin-top: 2px;
        }
        
        .learn-content h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .learn-content p {
          color: #64748b;
          line-height: 1.5;
        }
        
        .why-different {
          background: white;
            padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        
        .why-different h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .different-grid {
          display: grid;
          gap: 15px;
        }
        
        .different-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        
        .different-icon {
          font-size: 1.2rem;
        }
        
        .different-item span:last-child {
          color: #374151;
          font-weight: 500;
        }
        
        /* ==========================================
           FIRST CTA SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .first-cta {
          display: none; /* Hidden until video progress unlocks it */
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 24px;
          padding: 50px 40px;
          border: 3px solid #f59e0b;
          margin: 60px 0;
          box-shadow: 0 15px 35px rgba(245,158,11,0.2);
          position: relative;
          overflow: hidden;
        }
        
        .first-cta-title {
          color: #1e293b;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .assessment-details {
          margin: 30px 0;
          text-align: left;
        }
        
        .assessment-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .assessment-list {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .assessment-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .assessment-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .assessment-item .check-icon {
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .assessment-item-text {
          color: #1e293b;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .first-cta::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #f59e0b, #ea580c, #dc2626, #f59e0b);
          border-radius: 24px;
          z-index: -1;
          opacity: 0.1;
          animation: borderGlow 3s ease-in-out infinite;
        }
        
        @keyframes borderGlow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        .urgency-notice {
          background: #fef2f2;
          border: 2px solid #f87171;
          border-radius: 12px;
          padding: 15px;
          margin: 20px 0;
        }
        
        .urgency-text {
          color: #dc2626;
          font-weight: 700;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .assessment-details {
          margin: 30px 0;
          text-align: left;
        }
        
        .assessment-details h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .assessment-list {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .assessment-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .check-icon {
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .value-display {
          text-align: center;
          margin: 25px 0;
        }
        
        .value-text {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
        }
        
        .cta-guarantees {
          margin-top: 20px;
        }
        
        .cta-guarantees p {
          margin: 8px 0;
          color: #374151;
          font-weight: 500;
        }
        
        /* ==========================================
           SOCIAL PROOF SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .social-proof-section {
          display: none; /* Hidden until video progress unlocks it */
          margin: 50px 0;
          padding: 40px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }
        
        .social-proof-section h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          text-align: center;
          margin-bottom: 40px;
        }
        
        .testimonials {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .testimonial {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }
        
        .testimonial h4 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 15px;
        }
        
        .testimonial p {
          color: #374151;
          line-height: 1.6;
          margin-bottom: 15px;
        }
        
        .testimonial-author {
          font-weight: 600;
          color: #6b7280;
          font-style: italic;
        }
        
        .results-data {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .results-data h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .data-grid {
          display: grid;
          gap: 20px;
        }
        
        .data-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .data-icon {
          font-size: 1.5rem;
          margin-top: 2px;
        }
        
        .data-content h4 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
        }
        
        .data-content ul {
          list-style: none;
          padding: 0;
        }
        
        .data-content li {
          color: #374151;
          margin: 5px 0;
          padding-left: 20px;
          position: relative;
        }
        
        .data-content li:before {
          content: "•";
          color: #10b981;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        /* ==========================================
           FINAL CTA SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .final-cta {
          display: none; /* Hidden until video completes */
          background: linear-gradient(135deg, #dcfdf7 0%, #a7f3d0 100%);
          border-radius: 24px;
          padding: 50px 40px;
          border: 2px solid #10b981;
          margin: 60px 0;
          box-shadow: 0 15px 35px rgba(16,185,129,0.2);
        }
        
        .final-cta-title {
          color: #1e293b;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .final-urgency {
          font-size: 1.3rem;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .enhanced-package {
          margin: 30px 0;
          text-align: left;
        }
        
        .enhanced-package-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .package-list {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .package-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        
        .package-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .package-item .check-icon {
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .package-item-text {
          color: #1e293b;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .final-urgency-status {
          background: white;
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .final-urgency-status h4 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .status-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-weight: 600;
          color: #374151;
          text-align: center;
        }
        
        .cta-button.large {
          padding: 25px 60px;
          font-size: 1.4rem;
        }
        
        .final-guarantees {
          margin-top: 25px;
        }
        
        .final-guarantees p {
          margin: 10px 0;
          color: #065f46;
          font-weight: 600;
        }
        
        /* ==========================================
           VALUE REINFORCEMENT SECTION - EDITOR OPTIMIZED
           ========================================== */
        
        .value-reinforcement {
          display: none; /* Hidden until video completes */
          margin: 50px 0;
          padding: 40px;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-radius: 20px;
          border: 1px solid #f59e0b;
        }
        
        .value-reinforcement h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .options-comparison {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .option {
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .option-bad {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 2px solid #f87171;
        }
        
        .option-good {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #10b981;
        }
        
        .option h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .option-bad h3 {
          color: #dc2626;
        }
        
        .option-good h3 {
          color: #065f46;
        }
        
        .option ul {
          list-style: none;
          padding: 0;
        }
        
        .option li {
          margin: 12px 0;
          padding: 10px;
          border-radius: 8px;
          font-weight: 500;
        }
        
        .option-bad li {
          background: rgba(248, 113, 113, 0.1);
          color: #7f1d1d;
        }
        
        .option-good li {
          background: rgba(16, 185, 129, 0.1);
          color: #064e3b;
        }
        
        .zero-risk-guarantee {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
        }
        
        .zero-risk-guarantee h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .zero-risk-guarantee p {
          color: #374151;
          line-height: 1.6;
        }
        
        /* Footer Styles */
        .vsl-footer {
          background: #1f2937;
          color: white;
          padding: 40px 0;
          margin-top: 40px;
        }
        
        .footer-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: 0 20px;
        }
        
        .footer-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .footer-content p {
          margin-bottom: 20px;
          color: #d1d5db;
        }
        
        .footer-links {
          margin-bottom: 30px;
        }
        
        .footer-links a {
          color: #d1d5db;
          text-decoration: none;
          margin: 0 10px;
          transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
          color: #10b981;
        }
        
        .disclaimers {
          text-align: left;
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 10px;
        }
        
        .disclaimers h4 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 15px;
          color: #f9fafb;
        }
        
        .disclaimers p {
          color: #d1d5db;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        /* ==========================================
           RESPONSIVE DESIGN - TABLET & MOBILE
           ========================================== */
        
        @media (max-width: 768px) {
          .vsl-container {
            padding: 15px;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          
          .vsl-content {
            padding: 25px;
          }
          
          .welcome-headline {
            font-size: 1.8rem;
          }
          
          .trust-indicators {
            flex-direction: column;
            gap: 10px;
          }
          
          .target-audience-bar {
            padding: 15px 20px;
          }
          
          .target-audience-bar p {
            font-size: 1rem;
          }
          
          .learn-section {
            padding: 25px;
          }
          
          .learn-grid {
            grid-template-columns: 1fr;
          }
          
          .testimonials {
            grid-template-columns: 1fr;
          }
          
          .options-comparison {
            grid-template-columns: 1fr;
          }
          
          .status-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-section {
            padding: 30px 20px;
          }
          
          .first-cta-title,
          .final-cta-title {
            font-size: 1.6rem;
          }
          
          .assessment-title,
          .enhanced-package-title {
            font-size: 1.3rem;
          }
          
          .cta-button {
            padding: 18px 40px;
            font-size: 1.1rem;
          }
          
          .cta-button.large {
            padding: 20px 45px;
            font-size: 1.2rem;
          }
          
          .first-cta, 
          .final-cta, 
          .value-reinforcement {
            padding: 30px 25px;
          }
          
          .social-proof-section {
            padding: 25px;
          }
          
          .assessment-list,
          .package-list {
            gap: 12px;
          }
          
          .assessment-item,
          .package-item {
            padding: 12px;
          }
          
          .vsl-footer {
            padding: 25px 0;
          }
          
          .footer-content {
            padding: 0 15px;
          }
          
          .disclaimers {
            padding: 15px;
          }
        }
        
        /* Mobile - Ultra Compact */
        @media (max-width: 480px) {
          .vsl-container {
            padding: 12px;
          }
          
          .vsl-content {
            padding: 20px;
          }
          
          .welcome-headline {
            font-size: 1.6rem;
          }
          
          .brand-logo h2 {
            font-size: 1.5rem;
          }
          
          .trust-indicators {
            gap: 8px;
          }
          
          .trust-badge {
            padding: 8px 12px;
            font-size: 0.8rem;
          }
          
          .target-audience-bar {
            padding: 12px 15px;
          }
          
          .target-audience-bar p {
            font-size: 0.9rem;
          }
          
          .first-cta-title,
          .final-cta-title {
            font-size: 1.4rem;
          }
          
          .assessment-title,
          .enhanced-package-title {
            font-size: 1.2rem;
          }
          
          .assessment-item,
          .package-item {
            padding: 10px;
            gap: 10px;
          }
          
          .check-icon {
            font-size: 1rem;
          }
          
          .assessment-item-text,
          .package-item-text {
            font-size: 0.9rem;
          }
          
          .cta-button {
            padding: 16px 30px;
            font-size: 1rem;
          }
          
          .cta-button.large {
            padding: 18px 35px;
            font-size: 1.1rem;
          }
          
          .first-cta, 
          .final-cta, 
          .value-reinforcement {
            padding: 25px 20px;
          }
          
          .social-proof-section {
            padding: 20px;
          }
        }
      `,
      js: `
      /* ==========================================
         VSL VIDEO TRACKING & PROGRESSIVE UNLOCK SYSTEM
         - 50% Progress: Shows First CTA + Social Proof
         - 100% Complete: Shows Final CTA + Value Reinforcement
         ========================================== */
      
      (function() {
        'use strict';
        console.log('🎬 VSL System Starting...');
        
        // State Management
        var vslState = {
          video: null,
          isPlaying: false,
          videoScore: 0,
          lastValidTime: 0,
          firstCtaShown: false,
          finalCtaShown: false,
          lastSentPercent: 0,
          leadId: localStorage.getItem('leadId'),
          coachId: localStorage.getItem('coachId')
        };
        
        // DOM Elements Cache
        var elements = {
          video: null,
          progress: null,
          progressText: null,
          playButton: null,
          videoOverlay: null,
          learnSection: null,
          firstCta: null,
          socialProof: null,
          finalCta: null,
          valueReinforcement: null
        };
        
        // Initialize VSL System
        function initializeVSL() {
          console.log('📹 Initializing VSL System...');
          console.log('👤 Lead ID:', vslState.leadId);
          
          // Cache all elements
          elements.video = document.getElementById('vslVideo');
          elements.progress = document.getElementById('statusFill');
          elements.progressText = document.getElementById('progressText');
          elements.playButton = document.querySelector('.vsl-play-button');
          elements.videoOverlay = document.getElementById('videoOverlay');
          elements.learnSection = document.getElementById('learnSection');
          elements.firstCta = document.getElementById('firstCta');
          elements.socialProof = document.getElementById('socialProof');
          elements.finalCta = document.getElementById('finalCta');
          elements.valueReinforcement = document.getElementById('valueReinforcement');
          
          vslState.video = elements.video;
          
          // Verify video element exists
          if (!elements.video) {
            console.error('❌ Video element not found!');
            return;
          }
          
          console.log('✅ Video element found');
          console.log('📊 Elements status:', {
            progress: !!elements.progress,
            progressText: !!elements.progressText,
            learnSection: !!elements.learnSection,
            firstCta: !!elements.firstCta,
            socialProof: !!elements.socialProof,
            finalCta: !!elements.finalCta,
            valueReinforcement: !!elements.valueReinforcement
          });
          
          // Toggle video play/pause
          function toggleVideo() {
            console.log('🎬 Toggle Video, isPlaying:', vslState.isPlaying);
            if (vslState.isPlaying) {
              vslState.video.pause();
            } else {
              vslState.video.play();
            }
          }
          
          // Video Event Listeners
          elements.video.addEventListener('play', function() {
            console.log('▶️ Video playing');
            vslState.isPlaying = true;
            if (elements.videoOverlay) elements.videoOverlay.style.display = 'none';
          });
          
          elements.video.addEventListener('pause', function() {
            console.log('⏸️ Video paused');
            vslState.isPlaying = false;
            if (elements.videoOverlay) elements.videoOverlay.style.display = 'flex';
          });
          
          elements.video.addEventListener('ended', function() {
            console.log('🏁 Video ended - 100% complete');
            sendProgressToAPI(100);
            if (!vslState.finalCtaShown) {
              showFinalContent();
              vslState.finalCtaShown = true;
            }
            vslState.isPlaying = false;
            if (elements.videoOverlay) elements.videoOverlay.style.display = 'flex';
          });
          
          // Prevent seeking
          elements.video.addEventListener('seeking', function(e) {
            console.log('⚠️ Seeking blocked');
            elements.video.currentTime = vslState.lastValidTime;
            e.preventDefault();
            return false;
          });
          
          elements.video.addEventListener('seeked', function(e) {
            console.log('⚠️ Seeked blocked');
            elements.video.currentTime = vslState.lastValidTime;
            e.preventDefault();
            return false;
          });
          
          // Video click handler
          elements.video.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleVideo();
          });
          
          // Main progress tracking - THIS SENDS API CALLS
          elements.video.addEventListener('timeupdate', function() {
            var currentTime = elements.video.currentTime;
            var duration = elements.video.duration;
            
            if (!duration || isNaN(duration)) return;
            
            var percent = Math.round((currentTime / duration) * 100);
            vslState.videoScore = percent;
            vslState.lastValidTime = currentTime;
            
            // Update progress bar
            if (elements.progress) {
              elements.progress.style.width = percent + '%';
            }
            if (elements.progressText) {
              elements.progressText.textContent = percent + '%';
            }
            
            // Log every 10% for debugging
            if (percent % 10 === 0 && percent !== vslState.lastSentPercent) {
              console.log('📊 Video Progress:', percent + '%');
            }
            
            // 50% Milestone - Show First Content
            if (percent >= 50 && !vslState.firstCtaShown) {
              console.log('🎯 50% MILESTONE REACHED!');
              console.log('└─ Showing First CTA + Social Proof');
              showFirstContent();
              vslState.firstCtaShown = true;
            }
            
            // 100% Milestone - Show Final Content
            if (percent >= 100 && !vslState.finalCtaShown) {
              console.log('🎉 100% MILESTONE REACHED!');
              console.log('└─ Showing Final CTA + Value Reinforcement');
              showFinalContent();
              vslState.finalCtaShown = true;
            }
            
            // 🔥 API CALL: Send progress to backend every 5%
            if (vslState.leadId && percent >= vslState.lastSentPercent + 5 && percent <= 100) {
              console.log('📤 API CALL: Sending ' + percent + '% progress to backend');
              sendProgressToAPI(percent);
              vslState.lastSentPercent = percent;
            }
          });
          
          // Play button handlers
          if (elements.playButton) {
            elements.playButton.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              toggleVideo();
            });
          }
          
          if (elements.videoOverlay) {
            elements.videoOverlay.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              toggleVideo();
            });
          }
          
          // Populate lead name
          populateLeadName();
        }
        
        // Show content at 50% progress
        function showFirstContent() {
          console.log('🚀 Showing First Content (50%)...');
          
          // Hide learn section
          if (elements.learnSection) {
            elements.learnSection.style.display = 'none';
            console.log('  ✅ Hidden learn section');
          }
          
          // Show First CTA
          if (elements.firstCta) {
            elements.firstCta.style.display = 'block';
            elements.firstCta.style.opacity = '0';
            elements.firstCta.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.firstCta.style.opacity = '1';
              setupCTAButtons();
            }, 100);
            console.log('  ✅ Shown first CTA with fade-in');
          } else {
            console.warn('  ⚠️ First CTA element not found');
          }
          
          // Show Social Proof
          if (elements.socialProof) {
            elements.socialProof.style.display = 'block';
            elements.socialProof.style.opacity = '0';
            elements.socialProof.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.socialProof.style.opacity = '1';
            }, 200);
            console.log('  ✅ Shown social proof with fade-in');
          } else {
            console.warn('  ⚠️ Social proof element not found');
          }
        }
        
        // Show content at 100% completion
        function showFinalContent() {
          console.log('🎉 Showing Final Content (100%)...');
          
          // Show Final CTA
          if (elements.finalCta) {
            elements.finalCta.style.display = 'block';
            elements.finalCta.style.opacity = '0';
            elements.finalCta.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.finalCta.style.opacity = '1';
              setupCTAButtons();
            }, 100);
            console.log('  ✅ Shown final CTA with fade-in');
          } else {
            console.warn('  ⚠️ Final CTA element not found');
          }
          
          // Show Value Reinforcement
          if (elements.valueReinforcement) {
            elements.valueReinforcement.style.display = 'block';
            elements.valueReinforcement.style.opacity = '0';
            elements.valueReinforcement.style.transition = 'all 0.5s ease';
            setTimeout(function() {
              elements.valueReinforcement.style.opacity = '1';
            }, 200);
            console.log('  ✅ Shown value reinforcement with fade-in');
          } else {
            console.warn('  ⚠️ Value reinforcement element not found');
          }
        }
        
        // Setup CTA button click handlers
        function setupCTAButtons() {
          var firstBtn = document.getElementById('firstCtaButton');
          var finalBtn = document.getElementById('finalCtaButton');
          
          if (firstBtn) {
            firstBtn.addEventListener('click', function(e) {
              e.preventDefault();
              handleCTAClick('first_assessment');
            });
            console.log('✅ First CTA button initialized');
          }
          
          if (finalBtn) {
            finalBtn.addEventListener('click', function(e) {
              e.preventDefault();
              handleCTAClick('priority_assessment');
            });
            console.log('✅ Final CTA button initialized');
          }
        }
        
        // Handle CTA clicks
        function handleCTAClick(ctaType) {
          console.log('🎯 CTA Clicked:', ctaType, 'Video Score:', vslState.videoScore + '%');
          
          // Navigate to appointment page
          var currentPath = window.location.pathname;
          var pathParts = currentPath.split('/');
          pathParts[pathParts.length - 1] = 'appointment-page';
          var newPath = pathParts.join('/');
          
          // Send CTA click data to API
          if (vslState.leadId) {
            var payload = {
              ctaClicked: ctaType,
              vslWatchPercentage: vslState.videoScore,
              status: 'Video Sales Letter',
              timestamp: new Date().toISOString()
            };
            
            console.log('📤 Sending CTA API Call:', payload);
            
            fetch('https://api.funnelseye.com/api/leads/' + vslState.leadId, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            .then(function(response) {
              console.log('📥 API Response:', response.status);
              return response.json();
            })
            .then(function(data) {
              console.log('✅ API Success:', data);
            })
            .catch(function(error) {
              console.error('❌ API Error:', error);
            });
          }
          
          // Navigate
          window.location.href = newPath;
        }
        
        // Send progress to API - BACKEND TRACKING
        function sendProgressToAPI(percent) {
          if (!vslState.leadId) {
            console.warn('⚠️ No Lead ID - Skipping API call');
            return;
          }
          
          var payload = {
            vslWatchPercentage: percent,
            currentTime: elements.video.currentTime,
            videoDuration: elements.video.duration,
            status: 'Video Sales Letter',
            timestamp: new Date().toISOString(),
            coachId: vslState.coachId
          };
          
          console.log('📤 SENDING TO BACKEND:', {
            leadId: vslState.leadId,
            percent: percent + '%',
            payload: payload
          });
          
          fetch('https://api.funnelseye.com/api/leads/' + vslState.leadId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          .then(function(response) {
            console.log('📥 API Response Status:', response.status);
            return response.json();
          })
          .then(function(data) {
            console.log('✅ API SUCCESS:', {
              percent: percent + '%',
              response: data
            });
          })
          .catch(function(error) {
            console.error('❌ API ERROR:', {
              percent: percent + '%',
              error: error.message
            });
          });
        }
        
        // Populate lead name in headline
        function populateLeadName() {
          var leadName = localStorage.getItem('leadName') || 
                        localStorage.getItem('firstName') || 
                        localStorage.getItem('name');
          
          if (leadName) {
            document.querySelectorAll('h1').forEach(function(el) {
              if (el.textContent.includes('[LEAD NAME]')) {
                el.innerHTML = el.innerHTML.replace('[LEAD NAME]', leadName);
                console.log('✅ Lead name populated:', leadName);
              }
            });
          } else {
            console.log('⚠️ No lead name found in localStorage');
          }
        }
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initializeVSL);
          console.log('⏳ Waiting for DOM...');
        } else {
          initializeVSL();
          console.log('✅ DOM already loaded, initializing...');
        }
        
        console.log('🎬 VSL System Ready!');
      })();
      `
    },
    
    // Add Fitness VSL Templates (Customer templates)
    ...fitnessVSLTemplates
  },

  thankyouTemplates: {
    'fitness_thankyou': {
  name: 'Fitness Thank You couch page',
  description: 'Professional thank you page for fitness webinar registration with community access.',
  thumbnail: 'https://placehold.co/400x300/FF6B35/ffffff?text=Fitness+Thanks',
  html: `
    <div class="fitness-thankyou">
      <!-- Confetti Animation Container -->
      <div id="confetti-container"></div>
      
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            YouCanTransform
          </div>
        </div>
      </header>

      <!-- Main Confirmation Section -->
      <section class="confirmation-section">
        <div class="container">
          <div class="confirmation-content">
            <!-- Success Animation -->
            <div class="success-animation">
              <div class="success-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>
              <div class="celebration-text">🎉 CONGRATULATIONS! 🎉</div>
            </div>
            
            <h1 class="confirmation-title">
              You're In <span class="highlight-name">[Lead_name]</span>! 
              <br>Welcome to the <span class="highlight">Transformation Revolution</span>
            </h1>
            <p class="confirmation-subtitle">Your Workshop Seat is Confirmed & Secured</p>
            
            <!-- Appointment Details Card -->
            <div class="appointment-card">
              <div class="card-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3>Appointment Details</h3>
              </div>
              
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Date</span>
                    <span class="detail-value" id="appointmentDate">[APPOINTMENT DATE]</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Time</span>
                    <span class="detail-value" id="appointmentTime">[APPOINTMENT TIME]</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value" id="appointmentDuration">[DURATION] Minutes</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Appointment ID</span>
                    <span class="detail-value" id="appointmentId">[APPOINTMENT ID]</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Status</span>
                    <span class="detail-value" id="appointmentStatus">[STATUS]</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
              <h3 class="steps-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3 8-8"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02"/>
                </svg>
                What Happens Next
              </h3>
              
              <div class="steps-list">
                <div class="step-item">
                  <div class="step-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div class="step-content">
                    <strong>Check Your Email</strong>
                    <p>Confirmation details and Zoom link sent to your inbox</p>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div class="step-content">
                    <strong>Join WhatsApp Community</strong>
                    <p>Get instant access to exclusive content and support</p>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div class="step-content">
                    <strong>Mark Your Calendar</strong>
                    <p>Block 2 hours for your transformation journey</p>
                  </div>
                </div>
                
                <div class="step-item">
                  <div class="step-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div class="step-content">
                    <strong>Prepare for Results</strong>
                    <p>Get ready to implement the 5-step transformation system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- WhatsApp Community CTA -->
      <section class="community-section">
        <div class="container">
          <div class="community-content">
            <div class="community-header">
              <h2>Join Our Exclusive WhatsApp Community</h2>
              <p>Get instant access to your Zoom link and exclusive transformation content</p>
            </div>
            
            <div class="whatsapp-cta">
              <div class="whatsapp-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <a href="https://wa.me/1234567890" class="whatsapp-btn" target="_blank">
                <span>Join WhatsApp Community</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="7" y1="17" x2="17" y2="7"/>
                  <polyline points="7,7 17,7 17,17"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Bonus Rewards -->
      <section class="bonus-section">
        <div class="container">
          <div class="bonus-content">
            <div class="bonus-header">
              <div class="bonus-icon">🎁</div>
              <h2 class="bonus-title">Complete the Workshop & Unlock Your <span class="highlight">Bonus Package</span></h2>
              <p class="bonus-value">(Worth ₹4,999)</p>
            </div>

            <div class="rewards-container">
              <h3 class="rewards-title">🏆 Exclusive Rewards for Workshop Completers:</h3>
              <div class="rewards-grid">
                <div class="reward-item">
                  <div class="reward-icon">📋</div>
                  <div class="reward-content">
                    <h4>90-Day Meal Planning Template</h4>
                    <p>Complete nutrition framework for busy professionals (Delivered after workshop)</p>
                  </div>
                </div>
                <div class="reward-item">
                  <div class="reward-icon">🎯</div>
                  <div class="reward-content">
                    <h4>Priority Q&A Access</h4>
                    <p>Your questions answered first during live session</p>
                  </div>
                </div>
                <div class="reward-item">
                  <div class="reward-icon">✅</div>
                  <div class="reward-content">
                    <h4>Implementation Checklist</h4>
                    <p>Step-by-step guide to apply workshop learnings (Delivered after workshop)</p>
                  </div>
                </div>
                <div class="reward-item">
                  <div class="reward-icon">📈</div>
                  <div class="reward-content">
                    <h4>Post-Workshop Success Stories</h4>
                    <p>Real transformations to inspire your journey (Delivered after workshop)</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="claim-instructions">
              <h4 class="claim-title">How to Claim Your Bonuses:</h4>
              <div class="claim-steps">
                <div class="claim-step">
                  <span class="claim-number">1</span>
                  <span>Attend the complete 2-hour workshop</span>
                </div>
                <div class="claim-step">
                  <span class="claim-number">2</span>
                  <span>Stay until the final session ends</span>
                </div>
                <div class="claim-step">
                  <span class="claim-number">3</span>
                  <span>Bonuses automatically sent to your email within 24 hours</span>
                </div>
                <div class="claim-step">
                  <span class="claim-number">4</span>
                  <span>Community members who complete get exclusive access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Workshop Preparation -->
      <section class="preparation-section">
        <div class="container">
          <div class="preparation-content">
            <h2 class="preparation-title">How to Get <span class="highlight">Maximum Value</span> from the Workshop:</h2>
            
            <div class="preparation-phases">
              <div class="phase-card">
                <div class="phase-header">
                  <div class="phase-icon">📝</div>
                  <h3 class="phase-title">Before the Workshop:</h3>
                </div>
                <ul class="phase-list">
                  <li>Join the WhatsApp community for networking</li>
                  <li>Review your bonus materials</li>
                  <li>Think about your transformation goals</li>
                  <li>Prepare questions for the live Q&A</li>
                </ul>
              </div>

              <div class="phase-card">
                <div class="phase-header">
                  <div class="phase-icon">🎯</div>
                  <h3 class="phase-title">During the Workshop:</h3>
                </div>
                <ul class="phase-list">
                  <li>Take notes on each of the 5 steps</li>
                  <li>Participate in live polls and activities</li>
                  <li>Ask questions during Q&A segments</li>
                  <li>Connect with other attendees in chat</li>
                </ul>
              </div>

              <div class="phase-card">
                <div class="phase-header">
                  <div class="phase-icon">🚀</div>
                  <h3 class="phase-title">After the Workshop:</h3>
                </div>
                <ul class="phase-list">
                  <li>Implement Step 1 within 24 hours</li>
                  <li>Use the community for accountability</li>
                  <li>Book optional consultation if interested</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Support Section -->
      <section class="support-section">
        <div class="container">
          <div class="support-content">
            <h2 class="support-title">Need Help Before the Workshop?</h2>
            
            <div class="support-options">
              <div class="support-option">
                <div class="support-icon">📱</div>
                <div class="support-details">
                  <h4>WhatsApp Support:</h4>
                  <p>Available in community</p>
                </div>
              </div>
              <div class="support-option">
                <div class="support-icon">📧</div>
                <div class="support-details">
                  <h4>Email Support:</h4>
                  <p>support@youcantransform.com</p>
                </div>
              </div>
              <div class="support-option">
                <div class="support-icon">⏰</div>
                <div class="support-details">
                  <h4>Response Time:</h4>
                  <p>Within 2 hours during business hours</p>
                </div>
              </div>
            </div>

            <div class="technical-tips">
              <h4 class="tips-title">Technical Issues:</h4>
              <ul class="tips-list">
                <li>Test your Zoom setup beforehand</li>
                <li>Ensure stable internet connection</li>
                <li>Have backup mobile access ready</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-coach">Coach Name</div>
            <a href="mailto:coach@email.com" class="footer-email">📧 Coach Email</a>
            
            <div class="footer-links">
              <a href="#" class="footer-link">Privacy Policy</a>
              <a href="#" class="footer-link">Terms of Service</a>
            </div>
            
            <div class="footer-disclaimer">
              <h5>Workshop Disclaimer:</h5>
              <p>This workshop provides educational information only. Individual results may vary. This is not medical advice. Consult your healthcare provider before starting any health program.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  css: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    :root {
      --primary-color: #FF6B35;
      --primary-dark: #E55A2B; 
      --secondary-color: #4ECDC4;
      --accent-color: #FFD93D;
      --success-color: #10B981;
      --text-dark: #1F2937;
      --text-medium: #6B7280;
      --text-light: #9CA3AF;
      --bg-white: #FFFFFF;
      --bg-gray-50: #F9FAFB;
      --bg-gray-100: #F3F4F6;
      --border-color: #E5E7EB;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      --border-radius-sm: 6px;
      --border-radius-md: 8px;
      --border-radius-lg: 12px;
      --border-radius-xl: 16px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .fitness-thankyou {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-gray-50);
      min-height: 100vh;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Header */
    .header {
      background-color: var(--bg-white);
      border-bottom: 1px solid var(--border-color);
      padding: 20px 0;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    /* Confirmation Section */
    .confirmation-section {
      padding: 80px 0;
      background: linear-gradient(135deg, var(--bg-white) 0%, var(--bg-gray-50) 100%);
    }

    .confirmation-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 24px;
      color: var(--success-color);
    }

    .confirmation-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .confirmation-subtitle {
      font-size: 1.25rem;
      color: var(--text-medium);
      margin-bottom: 48px;
    }

    .highlight {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .workshop-details {
      background-color: var(--bg-white);
      border-radius: var(--border-radius-xl);
      padding: 40px;
      margin-bottom: 48px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
    }

    .details-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 24px;
      text-align: left;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: var(--bg-gray-50);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--border-color);
    }

    .detail-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .detail-label {
      font-weight: 600;
      color: var(--text-dark);
      font-size: 0.9rem;
    }

    .detail-value {
      color: var(--text-medium);
      font-size: 0.9rem;
    }

    .next-steps {
      background-color: var(--bg-white);
      border-radius: var(--border-radius-xl);
      padding: 40px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
    }

    .steps-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 24px;
      text-align: left;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-align: left;
    }

    .step-check {
      color: var(--success-color);
      font-size: 1.2rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .step-content {
      color: var(--text-medium);
      font-size: 1rem;
    }

    /* Community Section */
    .community-section {
      padding: 80px 0;
      background-color: var(--bg-white);
    }

    .community-content {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }

    .community-header {
      margin-bottom: 48px;
    }

    .community-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .community-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .community-subtitle {
      font-size: 1.125rem;
      color: var(--text-medium);
    }

    .community-benefits {
      margin-bottom: 48px;
    }

    .benefits-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 32px;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .benefit-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px;
      background-color: var(--bg-gray-50);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--border-color);
      text-align: left;
      transition: all 0.3s ease;
    }

    .benefit-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .benefit-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .benefit-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .benefit-content strong {
      color: var(--text-dark);
      font-weight: 600;
      font-size: 1rem;
    }

    .benefit-content span {
      color: var(--text-medium);
      font-size: 0.9rem;
    }

    .community-cta {
      margin-bottom: 48px;
    }

    .whatsapp-btn {
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: white;
      border: none;
      padding: 18px 36px;
      font-size: 1.125rem;
      font-weight: 600;
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .whatsapp-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .whatsapp-icon {
      font-size: 1.25rem;
    }

    .community-guidelines {
      background-color: var(--bg-gray-50);
      border-radius: var(--border-radius-lg);
      padding: 32px;
      border: 1px solid var(--border-color);
    }

    .guidelines-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 16px;
    }

    .guidelines-list {
      list-style: none;
      padding: 0;
      text-align: left;
    }

    .guidelines-list li {
      color: var(--text-medium);
      font-size: 0.9rem;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }

    .guidelines-list li::before {
      content: "•";
      color: var(--primary-color);
      position: absolute;
      left: 0;
      font-weight: bold;
    }

    /* Bonus Section */
    .bonus-section {
      padding: 80px 0;
      background: linear-gradient(135deg, var(--bg-gray-50) 0%, var(--bg-white) 100%);
    }

    .bonus-content {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
    }

    .bonus-header {
      margin-bottom: 48px;
    }

    .bonus-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .bonus-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .bonus-value {
      font-size: 1.25rem;
      color: var(--primary-color);
      font-weight: 600;
    }

    .rewards-container {
      margin-bottom: 48px;
    }

    .rewards-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 32px;
    }

    .rewards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .reward-item {
      background-color: var(--bg-white);
      border-radius: var(--border-radius-lg);
      padding: 32px 24px;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-color);
      text-align: left;
      transition: all 0.3s ease;
    }

    .reward-item:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .reward-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
      display: block;
    }

    .reward-content h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 8px;
    }

    .reward-content p {
      color: var(--text-medium);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .claim-instructions {
      background-color: var(--bg-white);
      border-radius: var(--border-radius-xl);
      padding: 40px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
    }

    .claim-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 24px;
    }

    .claim-steps {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .claim-step {
      display: flex;
      align-items: center;
      gap: 16px;
      text-align: left;
    }

    .claim-number {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    /* Preparation Section */
    .preparation-section {
      padding: 80px 0;
      background-color: var(--bg-white);
    }

    .preparation-content {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
    }

    .preparation-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 48px;
      line-height: 1.2;
    }

    .preparation-phases {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
    }

    .phase-card {
      background-color: var(--bg-gray-50);
      border-radius: var(--border-radius-xl);
      padding: 32px;
      border: 1px solid var(--border-color);
      text-align: left;
      transition: all 0.3s ease;
    }

    .phase-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .phase-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .phase-icon {
      font-size: 1.5rem;
    }

    .phase-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-dark);
    }

    .phase-list {
      list-style: none;
      padding: 0;
    }

    .phase-list li {
      color: var(--text-medium);
      font-size: 0.95rem;
      margin-bottom: 12px;
      padding-left: 20px;
      position: relative;
      line-height: 1.5;
    }

    .phase-list li::before {
      content: "✓";
      color: var(--success-color);
      position: absolute;
      left: 0;
      font-weight: bold;
    }

    /* Support Section */
    .support-section {
      padding: 80px 0;
      background-color: var(--bg-gray-50);
    }

    .support-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    .support-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 48px;
    }

    .support-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .support-option {
      display: flex;
      align-items: center;
      gap: 16px;
      background-color: var(--bg-white);
      padding: 24px;
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--border-color);
      text-align: left;
      transition: all 0.3s ease;
    }

    .support-option:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .support-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .support-details h4 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 4px;
    }

    .support-details p {
      color: var(--text-medium);
      font-size: 0.9rem;
    }

    .technical-tips {
      background-color: var(--bg-white);
      border-radius: var(--border-radius-lg);
      padding: 32px;
      border: 1px solid var(--border-color);
    }

    .tips-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 16px;
    }

    .tips-list {
      list-style: none;
      padding: 0;
      text-align: left;
    }

    .tips-list li {
      color: var(--text-medium);
      font-size: 0.9rem;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }

    .tips-list li::before {
      content: "•";
      color: var(--primary-color);
      position: absolute;
      left: 0;
      font-weight: bold;
    }

    /* Footer */
    .footer {
      background-color: var(--text-dark);
      padding: 60px 0 40px;
      color: var(--text-light);
      text-align: center;
    }

    .footer-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .footer-coach {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
    }

    .footer-email {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 1rem;
      margin-bottom: 32px;
      display: block;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .footer-link {
      color: var(--text-light);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .footer-link:hover {
      color: var(--primary-color);
    }

    .footer-disclaimer {
      padding-top: 32px;
      border-top: 1px solid #374151;
    }

    .footer-disclaimer h5 {
      font-size: 1rem;
      font-weight: 600;
      color: white;
      margin-bottom: 12px;
    }

    .footer-disclaimer p {
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--text-light);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        padding: 0 16px;
      }

      .confirmation-title {
        font-size: 2rem;
      }

      .community-title,
      .bonus-title,
      .preparation-title {
        font-size: 1.75rem;
      }

      .support-title {
        font-size: 1.5rem;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
      }

      .rewards-grid {
        grid-template-columns: 1fr;
      }

      .preparation-phases {
        grid-template-columns: 1fr;
      }

      .support-options {
        grid-template-columns: 1fr;
      }

      .footer-links {
        flex-direction: column;
        gap: 16px;
      }

      .whatsapp-btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .confirmation-section,
      .community-section,
      .bonus-section,
      .preparation-section,
      .support-section {
        padding: 60px 0;
      }

      .workshop-details,
      .next-steps,
      .claim-instructions {
        padding: 24px;
      }

      .confirmation-title {
        font-size: 1.75rem;
      }

      .community-title,
      .bonus-title,
      .preparation-title {
        font-size: 1.5rem;
      }
    }
  `,
  js: `(function(){function loadAppointmentDetails(){try{var appointmentData=localStorage.getItem('appointmentDetails');var leadId=localStorage.getItem('leadId');if(appointmentData){var appointment=JSON.parse(appointmentData);var dateEl=document.getElementById('appointmentDate');var timeEl=document.getElementById('appointmentTime');var durationEl=document.getElementById('appointmentDuration');var idEl=document.getElementById('appointmentId');var statusEl=document.getElementById('appointmentStatus');if(dateEl)dateEl.textContent=appointment.date||'[DATE NOT AVAILABLE]';if(timeEl)timeEl.textContent=appointment.time?appointment.time+' ('+appointment.timezone+')':'[TIME NOT AVAILABLE]';if(durationEl)durationEl.textContent=appointment.duration?appointment.duration+' Minutes':'30 Minutes';if(idEl)idEl.textContent=appointment.appointmentId||'[ID NOT AVAILABLE]';if(statusEl)statusEl.textContent=appointment.status||'Confirmed';console.log('Appointment details loaded:',appointment);}else{console.log('No appointment details found in localStorage');var dateEl=document.getElementById('appointmentDate');var timeEl=document.getElementById('appointmentTime');var durationEl=document.getElementById('appointmentDuration');var idEl=document.getElementById('appointmentId');var statusEl=document.getElementById('appointmentStatus');if(dateEl)dateEl.textContent='Please check your email for details';if(timeEl)timeEl.textContent='Please check your email for details';if(durationEl)durationEl.textContent='30 Minutes';if(idEl)idEl.textContent='Check your email confirmation';if(statusEl)statusEl.textContent='Confirmed';}var leadName=localStorage.getItem('leadName')||localStorage.getItem('firstName')||localStorage.getItem('name')||leadId;if(leadName){var titleEl=document.querySelector('.confirmation-title');if(titleEl){titleEl.innerHTML=titleEl.innerHTML.replace('[Lead_name]',leadName);}console.log('✅ Lead name populated in fitness_thankyou:',leadName);}else{console.log('⚠️ No lead name found in localStorage for fitness_thankyou');}}catch(error){console.error('Error loading appointment details:',error);}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',loadAppointmentDetails);}else{loadAppointmentDetails();}})();`
},
    'professional_thankyou': {
      name: 'Professional Thank You customar page',
      description: 'A comprehensive thank you page with next steps.',
      thumbnail: 'https://placehold.co/400x300/10b981/ffffff?text=Professional+Thanks',
      html: `
        <div class="thankyou-container">
          <div class="thankyou-content">
            <div class="success-icon">
              <div class="checkmark">✓</div>
            </div>
            
            <h1 class="main-title">Thank You for Your Purchase!</h1>
            <p class="subtitle">Your order has been successfully processed</p>
            
            <div class="order-details">
              <div class="detail-item">
                <span class="label">Order Number:</span>
                <span class="value">#TY-2024-001</span>
              </div>
              <div class="detail-item">
                <span class="label">Email Sent To:</span>
                <span class="value">your@email.com</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Amount:</span>
                <span class="value">₹2,500</span>
              </div>
            </div>
            
            <div class="next-steps">
              <h3>What Happens Next?</h3>
              <div class="steps-grid">
                <div class="step">
                  <div class="step-number">1</div>
                  <h4>Check Your Email</h4>
                  <p>We've sent your receipt and access details to your email</p>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <h4>Access Your Account</h4>
                  <p>Log in to your dashboard to access your purchase</p>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <h4>Get Support</h4>
                  <p>Our team is ready to help you get started</p>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="btn-primary">Access Dashboard</button>
              <button class="btn-secondary">Download Receipt</button>
            </div>
            
            <div class="support-section">
              <h4>Need Help?</h4>
              <p>Our support team is available 24/7 to assist you</p>
              <div class="support-links">
                <a href="#" class="support-link">📧 Email Support</a>
                <a href="#" class="support-link">💬 Live Chat</a>
                <a href="#" class="support-link">📞 Call Us</a>
              </div>
            </div>
          </div>
        </div>
      `,
      css: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .thankyou-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        
        .thankyou-content {
          background: white;
          border-radius: 20px;
          padding: 60px;
          max-width: 800px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .success-icon {
          margin-bottom: 30px;
        }
        
        .checkmark {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0 auto;
        }
        
        .main-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 40px;
        }
        
        .order-details {
          background: #f8fafc;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 40px;
          border: 1px solid #e2e8f0;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          font-size: 1.1rem;
        }
        
        .detail-item:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: #64748b;
          font-weight: 500;
        }
        
        .value {
          color: #1e293b;
          font-weight: 600;
        }
        
        .next-steps {
          margin-bottom: 40px;
        }
        
        .next-steps h3 {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 30px;
        }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .step {
          text-align: center;
        }
        
        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          margin-bottom: 15px;
        }
        
        .step h4 {
          color: #1e293b;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }
        
        .step p {
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .action-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        
        .btn-secondary {
          background: white;
          color: #10b981;
          border: 2px solid #10b981;
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .btn-secondary:hover {
          background: #10b981;
          color: white;
          transform: translateY(-2px);
        }
        
        .support-section {
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
        }
        
        .support-section h4 {
          color: #1e293b;
          font-size: 1.2rem;
          margin-bottom: 10px;
        }
        
        .support-section p {
          color: #64748b;
          margin-bottom: 20px;
        }
        
        .support-links {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .support-link {
          color: #10b981;
          text-decoration: none;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 25px;
          border: 1px solid #d1fae5;
          transition: all 0.3s ease;
        }
        
        .support-link:hover {
          background: #d1fae5;
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .thankyou-content {
            padding: 40px 20px;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .steps-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-primary, .btn-secondary {
            width: 100%;
            max-width: 300px;
          }
        }
      `
    },
    'minimal_thankyou': {
      name: 'Minimal Thank You',
      description: 'Clean and minimal thank you page design.',
      thumbnail: 'https://placehold.co/400x300/ffffff/1e293b?text=Minimal+Thanks',
      html: `
        <div class="minimal-thankyou">
          <div class="content">
            <div class="icon">✨</div>
            <h1>Thank You</h1>
            <p>Your submission has been received successfully</p>
            <div class="divider"></div>
            <p class="message">We'll get back to you within 24 hours</p>
            <button class="continue-btn">Continue</button>
          </div>
        </div>
      `,
      css: `
        .minimal-thankyou {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
        }
        
        .content {
          background: white;
          border-radius: 16px;
          padding: 80px 60px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        
        .icon {
          font-size: 4rem;
          margin-bottom: 30px;
        }
        
        .content h1 {
          font-size: 2.5rem;
          font-weight: 300;
          color: #1e293b;
          margin-bottom: 20px;
        }
        
        .content p {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 30px;
        }
        
        .divider {
          width: 60px;
          height: 2px;
          background: #e2e8f0;
          margin: 40px auto;
        }
        
        .message {
          font-weight: 500;
          color: #1e293b;
        }
        
        .continue-btn {
          background: #1e293b;
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 40px;
        }
        
        .continue-btn:hover {
          background: #334155;
          transform: translateY(-1px);
        }
      `
    },
    
    'health_thankyou': {
  name: 'Health Assessment Thank You',
  description: 'Professional thank you page for health assessment booking with community integration.',
  thumbnail: 'https://placehold.co/400x300/059669/ffffff?text=Health+Thanks',
  html: `
    <div class="health-thankyou">
      <div class="thankyou-container">
        <!-- Header -->
        <header class="thankyou-header">
          <div class="logo">
            <h2>YouCanTransform</h2>
          </div>
        </header>

        <!-- Booking Confirmation -->
        <section class="confirmation-section">
          <div class="confirmation-icon">✅</div>
          <h1>Congratulations [LEAD NAME]!</h1>
          <p class="confirmation-subtitle">Your FREE Health Assessment Has Been Successfully Booked</p>
          
          <div class="confirmation-details">
            <h3>Confirmation Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-icon">📅</span>
                <div class="detail-content">
                  <strong>Date & Time</strong>
                  <span>[APPOINTMENT DATE/TIME]</span>
                </div>
              </div>
              <div class="detail-item">
                <span class="detail-icon">⏱️</span>
                <div class="detail-content">
                  <strong>Duration</strong>
                  <span>45 minutes</span>
                </div>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📍</span>
                <div class="detail-content">
                  <strong>Platform</strong>
                  <span>Zoom (link will be sent 24 hours before)</span>
                </div>
              </div>
              <div class="detail-item">
                <span class="detail-icon">👤</span>
                <div class="detail-content">
                  <strong>Assessment Coach</strong>
                  <span>[ASSIGNED COACH NAME]</span>
                </div>
              </div>
            </div>
          </div>

          <div class="next-steps">
            <h3>What Happens Next</h3>
            <div class="steps-list">
              <div class="step-item">
                <span class="step-number">1</span>
                <div class="step-content">
                  <strong>Confirmation Email Sent</strong>
                  <p>Check your inbox for appointment details</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-number">2</span>
                <div class="step-content">
                  <strong>Calendar Invite Added</strong>
                  <p>Sync to your preferred calendar app</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-number">3</span>
                <div class="step-content">
                  <strong>24-Hour Reminder</strong>
                  <p>WhatsApp and email reminder before your session</p>
                </div>
              </div>
              <div class="step-item">
                <span class="step-number">4</span>
                <div class="step-content">
                  <strong>Zoom Link Delivered</strong>
                  <p>Secure meeting room link sent day before</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Assessment Preparation -->
        <section class="preparation-section">
          <div class="section-header">
            <h2>Prepare for Maximum Value</h2>
            <p>Get the most out of your assessment with these simple steps</p>
          </div>
          
          <div class="prep-grid">
            <div class="prep-card">
              <div class="prep-header">
                <span class="prep-icon">📝</span>
                <h3>Before Your Assessment</h3>
              </div>
              <ul class="prep-list">
                <li>Complete the Pre-Assessment Form (5 minutes)</li>
                <li>Gather Recent Health Reports if available</li>
                <li>List Your Specific Goals and targets</li>
                <li>Note Past Challenges and obstacles</li>
              </ul>
            </div>

            <div class="prep-card">
              <div class="prep-header">
                <span class="prep-icon">🎯</span>
                <h3>What We'll Cover</h3>
              </div>
              <ul class="prep-list">
                <li>Complete analysis of your current health situation</li>
                <li>Identification of specific factors blocking progress</li>
                <li>Personalized roadmap for your transformation</li>
                <li>Custom implementation strategy for your lifestyle</li>
              </ul>
            </div>

            <div class="prep-card questions-card">
              <div class="prep-header">
                <span class="prep-icon">💭</span>
                <h3>Questions to Consider</h3>
              </div>
              <ul class="prep-list">
                <li>What specific health outcomes do you want to achieve?</li>
                <li>What has prevented success in your previous attempts?</li>
                <li>How much time can you realistically dedicate daily?</li>
                <li>What would transformation mean for your life and career?</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Bonus Resources -->
        <section class="bonus-section">
          <div class="section-header">
            <h2>Exclusive Bonus Resources</h2>
            <p>Access these valuable materials while you wait for your assessment</p>
          </div>
          
          <div class="bonus-grid">
            <div class="bonus-card video-card">
              <div class="bonus-content">
                <div class="bonus-badge">🎥 Training Video</div>
                <h3>The 3 Metabolic Mistakes Sabotaging Your Results</h3>
                <p>15-minute deep-dive training revealing the hidden factors that prevent 87% of professionals from achieving lasting transformation</p>
                
                <div class="video-highlights">
                  <h4>What You'll Discover:</h4>
                  <ul>
                    <li>The cortisol-carb timing mistake costing you 2-3kg monthly</li>
                    <li>Why your exercise routine might be storing fat instead of burning it</li>
                    <li>The supplement timing error that blocks nutrient absorption</li>
                    <li>Simple fixes you can implement before your assessment</li>
                  </ul>
                </div>
              </div>
              <button class="bonus-btn primary-btn">Watch Training Video</button>
            </div>

            <div class="bonus-card calculator-card">
              <div class="bonus-content">
                <div class="bonus-badge">📊 Health Tools</div>
                <h3>Complete Health Analysis Dashboard</h3>
                <p>Professional-grade health calculators used by our coaching team for instant insights</p>
                
                <div class="calculator-highlights">
                  <h4>Includes:</h4>
                  <ul>
                    <li>Advanced BMI calculator with body composition insights</li>
                    <li>Metabolic rate estimator based on lifestyle factors</li>
                    <li>Health risk assessment for busy professionals</li>
                    <li>Transformation timeline predictor</li>
                  </ul>
                </div>
              </div>
              <button class="bonus-btn secondary-btn">Access Health Tools</button>
            </div>
          </div>
        </section>

        <!-- Community Join -->
        <section class="community-section">
          <div class="community-content">
            <div class="community-header">
              <h2>Join Our Exclusive Community</h2>
              <h3>Transformation Champions - Executive Health Circle</h3>
            </div>
            
            <div class="community-stats">
              <div class="stat-card">
                <span class="stat-number">2,847</span>
                <span class="stat-label">Active Members</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">47</span>
                <span class="stat-label">Countries</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">94%</span>
                <span class="stat-label">Improved Motivation</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">4.9/5</span>
                <span class="stat-label">Member Rating</span>
              </div>
            </div>

            <div class="community-benefits">
              <h4>Member Benefits</h4>
              <div class="benefits-grid">
                <div class="benefit-item">
                  <span class="benefit-icon">💪</span>
                  <div class="benefit-text">
                    <strong>Daily Motivation</strong>
                    <p>Success stories and transformation updates</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">⚡</span>
                  <div class="benefit-text">
                    <strong>Quick Health Tips</strong>
                    <p>2-minute health hacks from our coaching team</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">🤝</span>
                  <div class="benefit-text">
                    <strong>Peer Support</strong>
                    <p>Connect with other busy professionals</p>
                  </div>
                </div>
                <div class="benefit-item">
                  <span class="benefit-icon">🎯</span>
                  <div class="benefit-text">
                    <strong>Live Q&A Sessions</strong>
                    <p>Weekly expert sessions with health coaches</p>
                  </div>
                </div>
              </div>
            </div>

            <button class="community-btn">Join WhatsApp Community</button>
          </div>
        </section>

        <!-- Calendar Integration -->
        <section class="calendar-section">
          <div class="calendar-content">
            <h2>Add to Your Calendar</h2>
            <p>Never miss your appointment with automatic calendar integration</p>
            <div class="calendar-buttons">
              <button class="calendar-btn google-cal">
                <span class="cal-icon">📅</span>
                Google Calendar
              </button>
              <button class="calendar-btn outlook-cal">
                <span class="cal-icon">📅</span>
                Outlook Calendar
              </button>
              <button class="calendar-btn ics-cal">
                <span class="cal-icon">💾</span>
                Download ICS File
              </button>
            </div>
          </div>
        </section>

        <!-- Support & FAQ -->
        <section class="support-section">
          <div class="section-header">
            <h2>Need Help or Have Questions?</h2>
            <p>We're here to support you every step of the way</p>
          </div>
          
          <div class="support-content">
            <div class="support-grid">
              <div class="support-card contact-card">
                <h3>Get Immediate Support</h3>
                <div class="contact-methods">
                  <div class="contact-item">
                    <span class="contact-icon">📱</span>
                    <div class="contact-details">
                      <strong>WhatsApp Support</strong>
                      <p>+91-XXXXX-XXXXX</p>
                      <small>Response within 2 hours</small>
                    </div>
                  </div>
                  <div class="contact-item">
                    <span class="contact-icon">✉️</span>
                    <div class="contact-details">
                      <strong>Email Support</strong>
                      <p>support@youcantransform.com</p>
                      <small>Response within 24 hours</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="support-card reschedule-card">
                <h3>Reschedule or Cancel</h3>
                <div class="reschedule-info">
                  <p><strong>Booking Management Portal</strong></p>
                  <p>Make changes up to 4 hours before your appointment</p>
                  <button class="manage-booking-btn">Manage Booking</button>
                </div>
              </div>
            </div>

            <div class="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div class="faq-grid">
                <div class="faq-item">
                  <div class="faq-header">
                    <h4 class="faq-question">What if I need to reschedule my appointment?</h4>
                    <span class="faq-toggle">+</span>
                  </div>
                  <div class="faq-answer">
                    <p>You can easily reschedule using our booking management portal above or by contacting our support team directly. We require at least 4 hours notice for any changes.</p>
                  </div>
                </div>
                
                <div class="faq-item">
                  <div class="faq-header">
                    <h4 class="faq-question">Do I need any special preparation or equipment?</h4>
                    <span class="faq-toggle">+</span>
                  </div>
                  <div class="faq-answer">
                    <p>No special equipment is required - just a stable internet connection and a quiet space for our Zoom call. We recommend completing the pre-assessment form above.</p>
                  </div>
                </div>
                
                <div class="faq-item">
                  <div class="faq-header">
                    <h4 class="faq-question">Will this session involve sales pressure?</h4>
                    <span class="faq-toggle">+</span>
                  </div>
                  <div class="faq-answer">
                    <p>Absolutely not. This is a genuine health assessment focused entirely on understanding your goals and creating a personalized roadmap.</p>
                  </div>
                </div>
                
                <div class="faq-item">
                  <div class="faq-header">
                    <h4 class="faq-question">What if I miss my scheduled appointment?</h4>
                    <span class="faq-toggle">+</span>
                  </div>
                  <div class="faq-answer">
                    <p>Please contact our support team immediately. We'll do our best to reschedule you for the next available slot.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="thankyou-footer">
          <div class="footer-wrapper">
            <div class="footer-main">
              <div class="footer-branding">
                <h4>Your Health Transformation Partner</h4>
                <div class="footer-contact">
                  <span class="contact-icon">📱</span>
                  <span>WhatsApp: +91-XXXXX-XXXXX</span>
                </div>
              </div>
              
              <div class="footer-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#disclaimer">Health Disclaimer</a>
              </div>
            </div>
            
            <div class="footer-disclaimer">
              <p><strong>Medical Disclaimer:</strong> This assessment is for educational and coaching purposes only and is not intended as medical advice. Individual results may vary based on various factors including commitment, lifestyle, and health conditions.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,
  css: `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .health-thankyou {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background: #f7fafc;
      min-height: 100vh;
    }

    .thankyou-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Header */
    .thankyou-header {
      background: white;
      padding: 24px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 32px;
    }

    .logo h2 {
      color: #2b6cb0;
      font-size: 1.75rem;
      font-weight: 700;
      text-align: center;
      letter-spacing: -0.025em;
    }

    /* Section Headers */
    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .section-header h2 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 16px;
      letter-spacing: -0.025em;
    }

    .section-header p {
      font-size: 1.125rem;
      color: #4a5568;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Confirmation Section */
    .confirmation-section {
      background: white;
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 48px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      text-align: center;
    }

    .confirmation-icon {
      font-size: 3.5rem;
      margin-bottom: 24px;
    }

    .confirmation-section h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #2d3748;
      margin-bottom: 16px;
      letter-spacing: -0.025em;
    }

    .confirmation-subtitle {
      font-size: 1.25rem;
      color: #4a5568;
      margin-bottom: 48px;
      font-weight: 500;
    }

    .confirmation-details {
      background: #f0fff4;
      border: 1px solid #9ae6b4;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 48px;
      text-align: left;
    }

    .confirmation-details h3 {
      color: #22543d;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .detail-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .detail-content strong {
      display: block;
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-content span {
      color: #4a5568;
      font-size: 1rem;
    }

    /* Next Steps */
    .next-steps {
      background: #ebf8ff;
      border: 1px solid #90cdf4;
      border-radius: 12px;
      padding: 32px;
      text-align: left;
    }

    .next-steps h3 {
      color: #2c5282;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
    }

    .steps-list {
      display: grid;
      gap: 16px;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .step-number {
      background: #2b6cb0;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .step-content strong {
      display: block;
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .step-content p {
      color: #4a5568;
      font-size: 0.875rem;
      margin: 0;
    }

    /* Preparation Section */
    .preparation-section {
      background: white;
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 48px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .prep-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .prep-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
    }

    .prep-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .questions-card {
      grid-column: 1 / -1;
    }

    .prep-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .prep-icon {
      font-size: 1.5rem;
    }

    .prep-card h3 {
      color: #2d3748;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .prep-list {
      list-style: none;
      padding: 0;
    }

    .prep-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      padding: 8px 0;
      color: #4a5568;
      line-height: 1.5;
    }

    .prep-list li:before {
      content: "•";
      color: #2b6cb0;
      font-weight: bold;
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* Bonus Section */
    .bonus-section {
      background: white;
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 48px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .bonus-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 32px;
    }

    .bonus-card {
      background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
      border: 1px solid #feb2b2;
      border-radius: 12px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .bonus-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .video-card {
      background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
      border-color: #9ae6b4;
    }

    .calculator-card {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border-color: #90cdf4;
    }

    .bonus-content {
      flex: 1;
    }

    .bonus-badge {
      display: inline-block;
      background: rgba(255,255,255,0.8);
      color: #2d3748;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 20px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bonus-card h3 {
      color: #2d3748;
      font-size: 1.375rem;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .bonus-card p {
      color: #4a5568;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .video-highlights,
    .calculator-highlights {
      margin-bottom: 24px;
    }

    .video-highlights h4,
    .calculator-highlights h4 {
      color: #2d3748;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .video-highlights ul,
    .calculator-highlights ul {
      list-style: none;
      padding: 0;
    }

    .video-highlights li,
    .calculator-highlights li {
      color: #4a5568;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .video-highlights li:before,
    .calculator-highlights li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #38a169;
      font-weight: bold;
    }

    .bonus-btn {
      border: none;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: none;
      letter-spacing: 0;
      width: 100%;
      margin-top: auto;
    }

    .primary-btn {
      background: #38a169;
      color: white;
    }

    .primary-btn:hover {
      background: #2f855a;
      transform: translateY(-1px);
    }

    .secondary-btn {
      background: #2b6cb0;
      color: white;
    }

    .secondary-btn:hover {
      background: #2c5282;
      transform: translateY(-1px);
    }

    /* Community Section */
    .community-section {
      background: linear-gradient(135deg, #2b6cb0, #2c5282);
      color: white;
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 48px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .community-content {
      text-align: center;
    }

    .community-header h2 {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.025em;
    }

    .community-header h3 {
      font-size: 1.25rem;
      margin-bottom: 32px;
      opacity: 0.9;
      font-weight: 500;
    }

    .community-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 4px;
      color: rgba(253, 250, 66, 0.9);
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 1;
      font-weight: 500;
      color: #fff;
    }

    .community-benefits {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 32px;
      text-align: left;
      backdrop-filter: blur(10px);
    }

    .community-benefits h4 {
      text-align: center;
      margin-bottom: 24px;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .benefit-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .benefit-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .benefit-text strong {
      display: block;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .benefit-text p {
      font-size: 0.875rem;
      opacity: 0.9;
      margin: 0;
      line-height: 1.4;
    }

    .community-btn {
      background: white;
      color: #2b6cb0;
      border: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: none;
      letter-spacing: 0;
    }

    .community-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    /* Calendar Section */
    .calendar-section {
      background: white;
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 48px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .calendar-content {
      text-align: center;
    }

    .calendar-content h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 12px;
      letter-spacing: -0.025em;
    }

    .calendar-content p {
      color: #4a5568;
      font-size: 1.125rem;
      margin-bottom: 32px;
    }

    .calendar-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .calendar-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #4a5568;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: none;
    }

    .calendar-btn:hover {
      border-color: #2b6cb0;
      color: #2b6cb0;
      transform: translateY(-1px);
    }

    .cal-icon {
      font-size: 1rem;
    }

    .google-cal:hover {
      border-color: #4285f4;
      color: #4285f4;
    }

    .outlook-cal:hover {
      border-color: #0078d4;
      color: #0078d4;
    }

    .ics-cal:hover {
      border-color: #4a5568;
      color: #4a5568;
    }

    /* Support Section */
    .support-section {
      background: white;
      border-radius: 16px;
      padding: 48px;
      margin-bottom: 48px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .support-content {
      max-width: 900px;
      margin: 0 auto;
    }

    .support-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 32px;
      margin-bottom: 24px;
    }

    .support-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
    }

    .support-card h3 {
      color: #2d3748;
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .contact-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .contact-details strong {
      display: block;
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .contact-details p {
      color: #4a5568;
      margin-bottom: 4px;
    }

    .contact-details small {
      color: #718096;
      font-size: 0.875rem;
    }

    .reschedule-info p {
      color: #4a5568;
      margin-bottom: 16px;
    }

    .manage-booking-btn {
      background: #2b6cb0;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .manage-booking-btn:hover {
      background: #2c5282;
      transform: translateY(-1px);
    }

    /* Compact FAQ Section */
    .faq-section {
      margin-top: 24px;
    }

    .faq-section h3 {
      color: #2d3748;
      font-size: 1.375rem;
      font-weight: 700;
      margin-bottom: 20px;
      text-align: center;
      letter-spacing: -0.025em;
    }

    .faq-grid {
      display: grid;
      gap: 10px;
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .faq-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border-color: #cbd5e0;
    }

    .faq-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 18px;
      cursor: pointer;
      background: white;
      transition: all 0.3s ease;
    }

    .faq-header:hover {
      background: #f7fafc;
    }

    .faq-question {
      color: #2d3748;
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
      flex: 1;
      padding-right: 16px;
      line-height: 1.4;
    }

    .faq-toggle {
      color: #2b6cb0;
      font-size: 1.125rem;
      font-weight: 600;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #ebf8ff;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .faq-item.active .faq-toggle {
      transform: rotate(45deg);
      background: #2b6cb0;
      color: white;
    }

    .faq-answer {
      padding: 0 18px 16px 18px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .faq-answer p {
      color: #4a5568;
      margin: 0;
      padding-top: 10px;
      line-height: 1.5;
      font-size: 0.9rem;
    }

    /* Proper Footer Structure */
    .thankyou-footer {
      background: #2d3748;
      color: white;
      padding: 32px 0 20px 0;
    }

    .footer-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .footer-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #4a5568;
    }

    .footer-branding {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .footer-branding h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
      color: white;
      line-height: 1.3;
    }

    .footer-contact {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #a0aec0;
      font-size: 0.875rem;
    }

    .footer-contact .contact-icon {
      font-size: 0.9rem;
    }

    .footer-links {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      align-items: center;
    }

    .footer-links a {
      color: #a0aec0;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.3s ease;
      position: relative;
      white-space: nowrap;
    }

    .footer-links a:hover {
      color: white;
    }

    .footer-links a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: #2b6cb0;
      transition: width 0.3s ease;
    }

    .footer-links a:hover::after {
      width: 100%;
    }

    .footer-disclaimer {
      width: 100%;
      padding-top: 16px;
      border-top: 1px solid #4a5568;
    }

    .footer-disclaimer p {
      margin: 0;
      color: #a0aec0;
      font-size: 0.8rem;
      line-height: 1.4;
      text-align: center;
      max-width: none;
    }

    .footer-disclaimer strong {
      color: #cbd5e0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .thankyou-container {
        padding: 0 16px;
      }

      .confirmation-section,
      .preparation-section,
      .bonus-section,
      .support-section {
        padding: 32px 24px;
      }

      .community-section {
        padding: 40px 24px;
      }

      .calendar-section {
        padding: 32px 24px;
      }

      .section-header h2 {
        font-size: 1.875rem;
      }

      .confirmation-section h1 {
        font-size: 2rem;
      }

      .prep-grid,
      .bonus-grid {
        grid-template-columns: 1fr;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .community-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .benefits-grid {
        grid-template-columns: 1fr;
      }

      .calendar-buttons {
        flex-direction: column;
        align-items: center;
      }

      .calendar-btn {
        width: 100%;
        max-width: 280px;
        justify-content: center;
      }

      .support-grid {
        grid-template-columns: 1fr;
      }

      .faq-section h3 {
        font-size: 1.25rem;
      }

      .faq-question {
        font-size: 0.9rem;
      }

      .footer-main {
        flex-direction: column;
        text-align: center;
        align-items: center;
        gap: 16px;
      }

      .footer-branding {
        text-align: center;
        align-items: center;
      }

      .footer-links {
        justify-content: center;
        gap: 18px;
      }

      .footer-wrapper {
        padding: 0 16px;
      }
    }

    @media (max-width: 480px) {
      .confirmation-section,
      .preparation-section,
      .bonus-section,
      .support-section {
        padding: 24px 20px;
      }

      .community-section {
        padding: 32px 20px;
      }

      .calendar-section {
        padding: 24px 20px;
      }

      .section-header h2 {
        font-size: 1.5rem;
      }

      .confirmation-section h1 {
        font-size: 1.75rem;
      }

      .community-stats {
        grid-template-columns: 1fr;
      }

      .bonus-card {
        padding: 24px;
      }

      .community-benefits {
        padding: 24px;
      }

      .faq-header {
        padding: 14px 16px;
      }

      .faq-answer {
        padding: 0 16px 14px 16px;
      }

      .footer-links {
        flex-direction: column;
        gap: 12px;
      }

      .footer-branding h4 {
        font-size: 1rem;
      }

      .footer-contact {
        font-size: 0.8rem;
      }
    }
  `
},


  },
  whatsappTemplates: {
    'modern_whatsapp': {
      name: 'Modern WhatsApp',
      description: 'Professional WhatsApp contact page with chat preview.',
      thumbnail: 'https://placehold.co/400x300/25D366/ffffff?text=Modern+WhatsApp',
      html: `
        <div class="whatsapp-container">
          <div class="whatsapp-content">
            <div class="header-section">
              <div class="whatsapp-logo">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                </svg>
              </div>
              <h1>Let's Connect on WhatsApp</h1>
              <p>Get instant support and quick responses to your questions</p>
            </div>
            
            <div class="chat-preview">
              <div class="chat-header">
                <div class="profile-info">
                  <div class="profile-avatar">J</div>
                  <div class="profile-details">
                    <h3>Jassi Support</h3>
                    <span class="status">Online now</span>
                  </div>
                </div>
                <div class="chat-actions">
                  <span class="active-indicator"></span>
                </div>
              </div>
              
              <div class="chat-messages">
                <div class="message received">
                  <div class="message-content">
                    <p>Hi there! 👋 How can I help you today?</p>
                    <span class="message-time">2:30 PM</span>
                  </div>
                </div>
                <div class="message sent">
                  <div class="message-content">
                    <p>I need help with my order</p>
                    <span class="message-time">2:31 PM</span>
                  </div>
                </div>
                <div class="message received">
                  <div class="message-content">
                    <p>I'd be happy to help! Let me check that for you right away 🔍</p>
                    <span class="message-time">2:31 PM</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <h3>Instant Replies</h3>
                <p>Get responses within minutes</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🔒</div>
                <h3>Secure Chat</h3>
                <p>End-to-end encrypted messages</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <h3>Mobile Friendly</h3>
                <p>Chat from anywhere, anytime</p>
              </div>
            </div>
            
            <div class="cta-section">
              <a href="https://wa.me/1234567890" class="whatsapp-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                </svg>
                Start WhatsApp Chat
              </a>
              <p class="privacy-note">Your privacy is protected. We don't share your information.</p>
            </div>
          </div>
        </div>
      `,
      css: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .whatsapp-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        
        .whatsapp-content {
          background: white;
          border-radius: 20px;
          padding: 60px;
          max-width: 800px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 50px;
        }
        
        .whatsapp-logo {
          margin-bottom: 20px;
        }
        
        .header-section h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
        }
        
        .header-section p {
          font-size: 1.2rem;
          color: #64748b;
        }
        
        .chat-preview {
          background: #f8fafc;
          border-radius: 16px;
          margin-bottom: 40px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .chat-header {
          background: #25D366;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }
        
        .profile-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .profile-avatar {
          width: 50px;
          height: 50px;
          background: white;
          color: #25D366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .profile-details h3 {
          font-size: 1.1rem;
          margin-bottom: 2px;
        }
        
        .status {
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        .active-indicator {
          width: 12px;
          height: 12px;
          background: #4ade80;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .chat-messages {
          padding: 30px;
        }
        
        .message {
          margin-bottom: 20px;
          display: flex;
        }
        
        .message.received {
          justify-content: flex-start;
        }
        
        .message.sent {
          justify-content: flex-end;
        }
        
        .message-content {
          max-width: 70%;
          padding: 12px 18px;
          border-radius: 18px;
          position: relative;
        }
        
        .message.received .message-content {
          background: #e2e8f0;
          color: #1e293b;
        }
        
        .message.sent .message-content {
          background: #25D366;
          color: white;
        }
        
        .message-content p {
          margin-bottom: 5px;
          font-size: 0.95rem;
        }
        
        .message-time {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .feature-item {
          text-align: center;
          padding: 30px 20px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .feature-icon {
          font-size: 2rem;
          margin-bottom: 15px;
        }
        
        .feature-item h3 {
          color: #1e293b;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }
        
        .feature-item p {
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .cta-section {
          text-align: center;
        }
        
        .whatsapp-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #25D366;
          color: white;
          text-decoration: none;
          padding: 18px 40px;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
        }
        
        .whatsapp-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }
        
        .privacy-note {
          margin-top: 15px;
          color: #64748b;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .whatsapp-content {
            padding: 40px 20px;
          }
          
          .header-section h1 {
            font-size: 2rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .chat-messages {
            padding: 20px;
          }
        }
      `
    },
    'simple_whatsapp': {
      name: 'Simple WhatsApp',
      description: 'Clean and simple WhatsApp redirect page.',
      thumbnail: 'https://placehold.co/400x300/ffffff/25D366?text=Simple+WhatsApp',
      html: `
        <div class="simple-whatsapp">
          <div class="content">
            <div class="icon">💬</div>
            <h1>Let's Chat on WhatsApp</h1>
            <p>Get instant support and quick answers to your questions</p>
            <a href="https://wa.me/1234567890" class="chat-button">
              <span class="button-icon">📱</span>
              Open WhatsApp Chat
            </a>
            <div class="benefits">
              <div class="benefit">✓ Instant responses</div>
              <div class="benefit">✓ Personal support</div>
              <div class="benefit">✓ Available 24/7</div>
            </div>
          </div>
        </div>
      `,
      css: `
        .simple-whatsapp {
          min-height: 100vh;
          background: #f0f9ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 20px;
        }
        
        .content {
          background: white;
          border-radius: 20px;
          padding: 60px;
          text-align: center;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .icon {
          font-size: 4rem;
          margin-bottom: 30px;
        }
        
        .content h1 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
        }
        
        .content p {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        
        .chat-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #25D366;
          color: white;
          text-decoration: none;
          padding: 18px 40px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-bottom: 40px;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
        }
        
        .chat-button:hover {
          background: #22c55e;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }
        
        .button-icon {
          font-size: 1.2rem;
        }
        
        .benefits {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .benefit {
          color: #059669;
          font-weight: 500;
          font-size: 1rem;
        }
        
        @media (max-width: 768px) {
          .content {
            padding: 40px 20px;
          }
          
          .content h1 {
            font-size: 1.8rem;
          }
        }
      `,
      js: `(function(){'use strict';function populateLeadName(){var leadName=localStorage.getItem('leadName')||localStorage.getItem('firstName')||localStorage.getItem('name');if(leadName){var elements=document.querySelectorAll('h1');elements.forEach(function(element){if(element.textContent.includes('[LEAD NAME]')){element.innerHTML=element.innerHTML.replace('[LEAD NAME]',leadName);console.log('✅ Lead name populated in thank you page:',leadName);}});}else{console.log('⚠️ No lead name found in localStorage for thank you page');}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',populateLeadName);}else{populateLeadName();}})();`
    }
  },
    'health_thankyou_simple': {
      name: 'Health Assessment Thank You (Simple)',
      description: 'Visible thank you page for health assessment bookings (simple version).',
      thumbnail: 'https://placehold.co/400x300/059669/ffffff?text=Health+Thanks',
      html: `
        <div class="health-thankyou-simple">
          <div class="thankyou-inner">
            <header class="thankyou-header">
              <h2>YouCanTransform</h2>
            </header>
            <section class="confirmation-section">
              <div class="confirmation-icon">✅</div>
              <h1>Congratulations [LEAD NAME]!</h1>
              <p class="confirmation-subtitle">Your FREE Health Assessment Has Been Successfully Booked</p>
              <div class="confirmation-details">
                <div class="detail-item"><strong>Date & Time:</strong> [APPOINTMENT DATE/TIME]</div>
                <div class="detail-item"><strong>Duration:</strong> 45 minutes</div>
                <div class="detail-item"><strong>Platform:</strong> Zoom (link will be sent)</div>
              </div>
              <div class="next-steps">
                <button class="btn-primary">Add To Calendar</button>
                <button class="btn-secondary">Join WhatsApp Community</button>
              </div>
            </section>
            <footer class="thankyou-footer">
              <p>Questions? 📧 support@youcantransform.com</p>
            </footer>
          </div>
        </div>
      `,
      css: `
        .health-thankyou-simple { font-family: Inter, sans-serif; background: #f7fafc; min-height: 100vh; display:flex; align-items:center; }
        .thankyou-inner { max-width:900px; margin:40px auto; padding:24px; width:100%; }
        .thankyou-header { text-align:center; padding:16px 0; }
        .thankyou-header h2 { color:#2b6cb0; }
        .confirmation-section { background:white; padding:32px; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); text-align:center; }
        .confirmation-icon { font-size:48px; margin-bottom:8px; }
        .confirmation-subtitle { color:#4a5568; margin-bottom:16px; }
        .confirmation-details { margin:16px 0; display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .detail-item { background:#f1f5f9; padding:8px 12px; border-radius:8px; }
        .next-steps { margin-top:20px; display:flex; gap:12px; justify-content:center; }
        .btn-primary { background:#059669; color:white; border:none; padding:10px 18px; border-radius:8px; cursor:pointer; }
        .btn-secondary { background:white; color:#059669; border:1px solid #d1fae5; padding:10px 18px; border-radius:8px; cursor:pointer; }
        @media (max-width:768px) { .confirmation-details { flex-direction:column; align-items:center; } }
      `
    },

  productOfferTemplates: {
    'premium_offer': {
      name: 'Premium Product Offer',
      description: 'High-converting product offer page with pricing and features.',
      thumbnail: 'https://placehold.co/400x300/8b5cf6/ffffff?text=Premium+Offer',
      html: `
        <div class="premium-offer">
          <div class="offer-header">
            <div class="urgency-banner">
              <span class="urgency-icon">🔥</span>
              <span>Limited Time Offer - Only 48 Hours Left!</span>
            </div>
            <h1>Unlock Your Business Potential</h1>
            <p class="subtitle">The complete system that's helped 10,000+ entrepreneurs scale their business</p>
          </div>
          
          <div class="offer-grid">
            <div class="product-showcase">
              <div class="product-image">
                <img src="https://placehold.co/500x400/8b5cf6/ffffff?text=Premium+Product" alt="Premium Product">
                <div class="product-badge">BESTSELLER</div>
              </div>
              
              <div class="product-features">
                <h3>What You Get:</h3>
                <div class="feature-list">
                  <div class="feature">
                    <span class="feature-icon">📚</span>
                    <div class="feature-text">
                      <h4>Complete Training Course</h4>
                      <p>50+ video lessons covering everything you need</p>
                    </div>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🛠️</span>
                    <div class="feature-text">
                      <h4>Premium Tools & Templates</h4>
                      <p>Ready-to-use resources worth $2,000</p>
                    </div>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">👥</span>
                    <div class="feature-text">
                      <h4>Exclusive Community Access</h4>
                      <p>Connect with like-minded entrepreneurs</p>
                    </div>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🎯</span>
                    <div class="feature-text">
                      <h4>1-on-1 Coaching Session</h4>
                      <p>Personal guidance from industry experts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="pricing-section">
              <div class="pricing-card">
                <div class="price-header">
                  <div class="original-price">
                    <span class="price-label">Regular Price:</span>
                    <span class="old-price">₹9,999</span>
                  </div>
                  <div class="current-price">
                    <span class="price-label">Today Only:</span>
                    <span class="new-price">₹2,499</span>
                  </div>
                  <div class="savings">You Save ₹7,500 (75%)</div>
                </div>
                
                <div class="bonus-section">
                  <h4>🎁 Exclusive Bonuses (Worth ₹3,000)</h4>
                  <ul class="bonus-list">
                    <li>✓ 30-Day Money Back Guarantee</li>
                    <li>✓ Lifetime Updates</li>
                    <li>✓ Priority Support</li>
                    <li>✓ Mobile App Access</li>
                  </ul>
                </div>
                
                <div class="countdown-timer">
                  <div class="timer-label">Offer Expires In:</div>
                  <div class="timer-display">
                    <div class="time-unit">
                      <span class="time-number">23</span>
                      <span class="time-label">Hours</span>
                    </div>
                    <div class="time-unit">
                      <span class="time-number">45</span>
                      <span class="time-label">Minutes</span>
                    </div>
                    <div class="time-unit">
                      <span class="time-number">12</span>
                      <span class="time-label">Seconds</span>
                    </div>
                  </div>
                </div>
                
                <button class="buy-button">
                  <span class="button-text">Get Instant Access Now</span>
                  <span class="button-subtext">Secure Payment • 256-bit SSL</span>
                </button>
                
                <div class="guarantee-badge">
                  <span class="badge-icon">🛡️</span>
                  <span>30-Day Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="testimonials-section">
            <h3>What Our Customers Say</h3>
            <div class="testimonials-grid">
              <div class="testimonial">
                <div class="testimonial-content">
                  <p>"This system completely transformed my business. I saw results within the first week!"</p>
                  <div class="testimonial-author">
                    <strong>Sarah Johnson</strong>
                    <span>CEO, TechStart</span>
                  </div>
                </div>
                <div class="testimonial-rating">⭐⭐⭐⭐⭐</div>
              </div>
              <div class="testimonial">
                <div class="testimonial-content">
                  <p>"The best investment I've made for my business. ROI was incredible!"</p>
                  <div class="testimonial-author">
                    <strong>Mike Chen</strong>
                    <span>Founder, GrowthCo</span>
                  </div>
                </div>
                <div class="testimonial-rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
          </div>
        </div>
      `,
      css: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .premium-offer {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .offer-header {
          text-align: center;
          color: white;
          margin-bottom: 50px;
        }
        
        .urgency-banner {
          background: #ef4444;
          color: white;
          padding: 12px 30px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          margin-bottom: 30px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .offer-header h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
          font-size: 1.3rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .offer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .product-showcase {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .product-image {
          position: relative;
          margin-bottom: 30px;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .product-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .product-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f59e0b;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
        }
        
        .product-features h3 {
          color: #1e293b;
          font-size: 1.5rem;
          margin-bottom: 25px;
        }
        
        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .feature {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .feature-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .feature-text h4 {
          color: #1e293b;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }
        
        .feature-text p {
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .pricing-section {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          height: fit-content;
        }
        
        .pricing-card {
          text-align: center;
        }
        
        .price-header {
          margin-bottom: 30px;
        }
        
        .original-price {
          margin-bottom: 10px;
        }
        
        .price-label {
          color: #64748b;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 5px;
        }
        
        .old-price {
          font-size: 1.5rem;
          color: #ef4444;
          text-decoration: line-through;
          font-weight: 500;
        }
        
        .current-price {
          margin-bottom: 15px;
        }
        
        .new-price {
          font-size: 3rem;
          color: #10b981;
          font-weight: 800;
        }
        
        .savings {
          background: #dcfce7;
          color: #166534;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          display: inline-block;
        }
        
        .bonus-section {
          margin: 30px 0;
          padding: 25px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .bonus-section h4 {
          color: #1e293b;
          margin-bottom: 15px;
        }
        
        .bonus-list {
          list-style: none;
          padding: 0;
        }
        
        .bonus-list li {
          color: #059669;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .countdown-timer {
          margin: 30px 0;
          padding: 25px;
          background: #fef3c7;
          border-radius: 16px;
          border: 1px solid #f59e0b;
        }
        
        .timer-label {
          color: #92400e;
          font-weight: 600;
          margin-bottom: 15px;
        }
        
        .timer-display {
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        
        .time-unit {
          background: white;
          padding: 15px;
          border-radius: 12px;
          min-width: 60px;
        }
        
        .time-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
        }
        
        .time-label {
          font-size: 0.8rem;
          color: #64748b;
          text-transform: uppercase;
        }
        
        .buy-button {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .buy-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
        }
        
        .button-text {
          display: block;
          margin-bottom: 5px;
        }
        
        .button-subtext {
          font-size: 0.8rem;
          opacity: 0.9;
          font-weight: 400;
          text-transform: none;
          letter-spacing: 0;
        }
        
        .guarantee-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #059669;
          font-weight: 600;
          font-size: 0.95rem;
        }
        
        .testimonials-section {
          background: white;
          border-radius: 20px;
          padding: 50px;
          margin-top: 50px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .testimonials-section h3 {
          text-align: center;
          color: #1e293b;
          font-size: 2rem;
          margin-bottom: 40px;
        }
        
        .testimonials-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .testimonial {
          background: #f8fafc;
          padding: 30px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        
        .testimonial-content p {
          font-size: 1.1rem;
          color: #1e293b;
          margin-bottom: 20px;
          font-style: italic;
        }
        
        .testimonial-author strong {
          color: #1e293b;
          display: block;
          margin-bottom: 5px;
        }
        
        .testimonial-author span {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .testimonial-rating {
          margin-top: 15px;
          font-size: 1.2rem;
        }
        
        @media (max-width: 1024px) {
          .offer-grid {
            grid-template-columns: 1fr;
          }
          
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .offer-header h1 {
            font-size: 2.5rem;
          }
          
          .product-showcase,
          .pricing-section,
          .testimonials-section {
            padding: 30px 20px;
          }
          
          .timer-display {
            flex-wrap: wrap;
            gap: 10px;
          }
        }
      `
    },
    'simple_offer': {
      name: 'Simple Product Offer',
      description: 'Clean and straightforward product offer page.',
      thumbnail: 'https://placehold.co/400x300/ffffff/1e293b?text=Simple+Offer',
      html: `
        <div class="simple-offer">
          <div class="offer-container">
            <div class="offer-content">
              <h1>Premium Business Course</h1>
              <p class="description">Master the skills that will transform your business and accelerate your success</p>
              
              <div class="product-image">
                <img src="https://placehold.co/600x400/3b82f6/ffffff?text=Premium+Course" alt="Premium Course">
              </div>
              
              <div class="pricing">
                <div class="price-container">
                  <span class="original-price">₹4,999</span>
                  <span class="current-price">₹1,999</span>
                  <span class="discount">60% OFF</span>
                </div>
              </div>
              
              <ul class="features">
                <li>✓ 20+ Hours of Video Content</li>
                <li>✓ Downloadable Resources</li>
                <li>✓ Certificate of Completion</li>
                <li>✓ 30-Day Money Back Guarantee</li>
              </ul>
              
              <button class="purchase-btn">Purchase Now</button>
              
              <div class="trust-indicators">
                <span class="trust-item">🔒 Secure Payment</span>
                <span class="trust-item">⚡ Instant Access</span>
                <span class="trust-item">💯 Satisfaction Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      `,
      css: `
        .simple-offer {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        
        .offer-container {
          background: white;
          border-radius: 20px;
          padding: 60px;
          max-width: 800px;
          width: 100%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .offer-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 20px;
        }
        
        .description {
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        
        .product-image {
          margin-bottom: 40px;
        }
        
        .product-image img {
          width: 100%;
          max-width: 500px;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .pricing {
          margin-bottom: 30px;
        }
        
        .price-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .original-price {
          font-size: 1.5rem;
          color: #ef4444;
          text-decoration: line-through;
          font-weight: 500;
        }
        
        .current-price {
          font-size: 3rem;
          color: #3b82f6;
          font-weight: 800;
        }
        
        .discount {
          background: #ef4444;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
        }
        
        .features {
          list-style: none;
          padding: 0;
          margin: 40px 0;
          text-align: left;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .features li {
          color: #059669;
          font-weight: 500;
          margin-bottom: 12px;
          font-size: 1.1rem;
        }
        
        .purchase-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 18px 50px;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .purchase-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        
        .trust-indicators {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        
        .trust-item {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .offer-container {
            padding: 40px 20px;
          }
          
          .offer-content h1 {
            font-size: 2rem;
          }
          
          .price-container {
            flex-direction: column;
            gap: 10px;
          }
          
          .trust-indicators {
            flex-direction: column;
            gap: 15px;
          }
        }
      `
    }
  },

  miscTemplates: {
    'professional_blank': {
      name: 'Professional Blank',
      description: 'A professional blank canvas with modern design elements.',
      thumbnail: 'https://placehold.co/400x300/6366f1/ffffff?text=Professional+Blank',
      html: `
        <div class="professional-blank">
          <div class="blank-container">
            <div class="content-area">
              <div class="header-section">
                <h1>Welcome to Your Canvas</h1>
                <p>Start building something amazing</p>
              </div>
              
              <div class="feature-grid">
                <div class="feature-card">
                  <div class="feature-icon">🎨</div>
                  <h3>Design</h3>
                  <p>Create beautiful layouts with ease</p>
                </div>
                <div class="feature-card">
                  <div class="feature-icon">⚡</div>
                  <h3>Fast</h3>
                  <p>Lightning fast performance</p>
                </div>
                <div class="feature-card">
                  <div class="feature-icon">📱</div>
                  <h3>Responsive</h3>
                  <p>Works on all devices</p>
                </div>
              </div>
              
              <div class="cta-section">
                <button class="primary-btn">Get Started</button>
                <button class="secondary-btn">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      `,
      css: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .professional-blank {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        
        .blank-container {
          background: white;
          border-radius: 20px;
          padding: 60px;
          max-width: 1000px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .content-area {
          text-align: center;
        }
        
        .header-section {
          margin-bottom: 50px;
        }
        
        .header-section h1 {
          font-size: 3rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 15px;
        }
        
        .header-section p {
          font-size: 1.3rem;
          color: #64748b;
        }
        
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-bottom: 50px;
        }
        
        .feature-card {
          background: #f8fafc;
          padding: 40px 30px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        
        .feature-card h3 {
          color: #1e293b;
          font-size: 1.3rem;
          margin-bottom: 15px;
        }
        
        .feature-card p {
          color: #64748b;
          font-size: 1rem;
        }
        
        .cta-section {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .primary-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }
        
        .secondary-btn {
          background: white;
          color: #6366f1;
          border: 2px solid #6366f1;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .secondary-btn:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .blank-container {
            padding: 40px 20px;
          }
          
          .header-section h1 {
            font-size: 2.2rem;
          }
          
          .feature-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-section {
            flex-direction: column;
            align-items: center;
          }
          
          .primary-btn, .secondary-btn {
            width: 100%;
            max-width: 300px;
          }
        }
      `
    },
    'minimal_blank': {
      name: 'Minimal Blank',
      description: 'A clean, minimal starting point for your content.',
      thumbnail: 'https://placehold.co/400x300/ffffff/1e293b?text=Minimal+Blank',
      html: `
        <div class="minimal-blank">
          <div class="content">
            <h1>Start Here</h1>
            <p>Your journey begins with a single step</p>
            <div class="divider"></div>
            <button class="action-btn">Begin</button>
          </div>
        </div>
      `,
      css: `
        .minimal-blank {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
        }
        
        .content {
          text-align: center;
          padding: 80px 60px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          max-width: 500px;
        }
        
        .content h1 {
          font-size: 2.5rem;
          font-weight: 300;
          color: #1e293b;
          margin-bottom: 20px;
        }
        
        .content p {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 40px;
        }
        
        .divider {
          width: 60px;
          height: 2px;
          background: #e2e8f0;
          margin: 0 auto 40px;
        }
        
        .action-btn {
          background: #1e293b;
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .action-btn:hover {
          background: #334155;
          transform: translateY(-1px);
        }
      `
      
    },
  
    
  },

  appointmentTemplates: {
 
    "Client_appointment_booking_v8_professional": {
      "name": "Professional customar Booking (v8 - Enhanced Design)",
      "description": "Enhanced professional booking system with improved questionnaire design and consolidated 2-step assessment process.",
      "thumbnail": "https://placehold.co/400x300/3B82F6/ffffff?text=Professional+v8",
      "html": "<div class=\"pro-booking-page\"><div class=\"pro-booking-container\"><div class=\"info-panel\"><div class=\"info-content\"><h2>Unlock Your Potential</h2><p>Book a complimentary strategy session to discover our proven system for building a successful, profitable coaching business.</p><div class=\"info-features\"><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z\"/><path d=\"m9 12 2 2 4-4\"/></svg></div><span>Personalized 1-on-1 Strategy</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M3 3v18h18\"/><path d=\"m19 9-5 5-4-4-3 3\"/></svg></div><span>Proven Growth Systems</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"m22 21-2-2\"/></svg></div><span>Elite Community Access</span></div></div><hr class=\"info-divider\"><h4 class=\"info-subtitle\">Coach Settings</h4><div class=\"info-features\"><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg></div><span>Duration: <strong id=\"infoDuration\">--</strong> min</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 2h.01\"></path><path d=\"M6.34 7.34l.01-.01\"></path><path d=\"M17.66 7.34l-.01-.01\"></path><path d=\"M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z\"></path><path d=\"M12 12l-4-4\"></path></svg></div><span>Buffer: <strong id=\"infoBuffer\">--</strong> min</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M2 12h20\"></path><path d=\"M12 2a15.3 15.3 0 0 1 4 18 15.3 15.3 0 0 1-8 0 15.3 15.3 0 0 1 4-18z\"></path></svg></div><span>Timezone: <strong id=\"infoTimezone\">--</strong></span></div></div></div><div class=\"info-footer\"><p>&copy; 2025 Coach Connect</p></div></div><div class=\"booking-panel\"><div class=\"api-status\" id=\"apiStatus\"></div><div class=\"step-indicator\" id=\"stepIndicator\"><div class=\"indicator-line\"></div><div class=\"indicator-item active\" data-step=\"1\"><span>1</span><p>Time</p></div><div class=\"indicator-item\" data-step=\"2\"><span>2</span><p>Details</p></div><div class=\"indicator-item\" data-step=\"3\"><span>3</span><p>Assess</p></div><div class=\"indicator-item\" data-step=\"4\"><span><svg viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"/></svg></span><p>Done</p></div></div><div class=\"step-content\" id=\"step1\" data-step=\"1\"><div class=\"step-header\"><h3>Select a Date & Time</h3><p>Choose a time that works best for you.</p></div><div id=\"dateSelectionView\"><div class=\"calendar-header\"><button class=\"nav-btn\" id=\"prevMonth\">‹</button><span class=\"current-month\" id=\"currentMonth\"></span><button class=\"nav-btn\" id=\"nextMonth\">›</button></div><div class=\"calendar-weekdays\"><div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div></div><div class=\"calendar-days\" id=\"calendarDays\"></div></div><div id=\"timeSelectionView\"><div class=\"time-selection-header\"><h4 id=\"selectedDateDisplay\">Available Times</h4><button class=\"btn-secondary btn-small\" id=\"backToCalendarBtn\">Change Date</button></div><div class=\"slots-container\" id=\"slotsContainer\"><div class=\"placeholder-msg\">Loading times...</div></div><div class=\"form-actions\" style=\"margin-top: 1.5rem; justify-content: center;\"><button type=\"button\" class=\"btn-primary\" id=\"nextFromTimeSelection\" style=\"display: none;\">Next</button></div></div></div><div class=\"step-content\" id=\"step2\" data-step=\"2\"><div class=\"step-header\"><h3>Confirm Your Details</h3><p>Please provide your information to secure your spot.</p></div><div class=\"selected-slot-summary\" id=\"selectedSlotSummary\"></div><form id=\"bookingDetailsForm\"><input type=\"hidden\" id=\"leadId\" required><div class=\"form-group\"><label for=\"notes\">Session Goals (Optional)</label><textarea id=\"notes\" placeholder=\"What's the #1 thing you want to achieve?\" rows=\"4\"></textarea></div><div class=\"form-actions\"><button type=\"button\" class=\"btn-secondary\" id=\"backToStep1\">Back</button><button type=\"button\" class=\"btn-primary\" id=\"bookNowBtn\">Next</button></div></form></div><div class=\"step-content\" id=\"step3\" data-step=\"3\"><div class=\"step-header\"><h3>Pre-Session Assessment</h3><p>This helps us prepare for our call. It will only take a minute.</p></div><div class=\"questionnaire-progress\"><div class=\"progress-bar\"><div class=\"progress-bar-inner\" id=\"qProgress\"></div></div><span id=\"qProgressText\"></span></div><form id=\"coachQuestionnaireForm\"><div class=\"q-step active\" data-qstep=\"1\"><div class=\"q-step-header\"><h5>Fitness & Health Assessment</h5><p>Help us understand your health goals and current situation</p></div><div class=\"question-grid\"><div class=\"question-card\"><div class=\"question-label\"><span class=\"required-star\">*</span> Did you watch the full video before booking this call?</div><div class=\"custom-select-wrapper\"><select id=\"watchedVideo\" name=\"watchedVideo\" required class=\"custom-select\"><option value=\"\">Select your answer</option><option value=\"Yes\">Yes, I watched the complete video</option><option value=\"No\">No, I watched partially or skipped</option></select></div></div><div class=\"question-card\"><div class=\"question-label\"><span class=\"required-star\">*</span> What is your primary health goal?</div><div class=\"custom-select-wrapper\"><select id=\"healthGoal\" name=\"healthGoal\" required class=\"custom-select\"><option value=\"\">Choose your main goal</option><option value=\"Lose Weight (5-15 kg)\">Lose Weight (5-15 kg)</option><option value=\"Lose Weight (15+ kg)\">Lose Weight (15+ kg)</option><option value=\"Gain Weight/Muscle\">Gain Weight/Muscle</option><option value=\"Improve Fitness & Energy\">Improve Fitness & Energy</option><option value=\"Manage Health Condition (Diabetes, PCOS, Thyroid)\">Manage Health Condition</option><option value=\"General Wellness & Lifestyle\">General Wellness & Lifestyle</option><option value=\"Other\">Other Goal</option></select></div></div><div class=\"question-card\"><div class=\"question-label\"><span class=\"required-star\">*</span> What's your timeline for seeing results?</div><div class=\"custom-select-wrapper\"><select id=\"timelineForResults\" name=\"timelineForResults\" required class=\"custom-select\"><option value=\"\">Select your timeline</option><option value=\"1-3 months (Urgent)\">1-3 months (Urgent)</option><option value=\"3-6 months (Moderate)\">3-6 months (Steady Progress)</option><option value=\"6-12 months (Gradual)\">6-12 months (Gradual)</option><option value=\"No specific timeline\">No specific timeline</option></select></div></div></div></div><div class=\"q-step\" data-qstep=\"2\"><div class=\"q-step-header\"><h5>Commitment & Investment</h5><p>Let's understand your commitment level and investment capacity</p></div><div class=\"question-grid\"><div class=\"question-card\"><div class=\"question-label\"><span class=\"required-star\">*</span> How serious are you about achieving your goals?</div><div class=\"custom-select-wrapper\"><select id=\"seriousnessLevel\" name=\"seriousnessLevel\" required class=\"custom-select\"><option value=\"\">Select commitment level</option><option value=\"Very serious - willing to invest time and money\">Very serious - willing to invest time and money</option><option value=\"Serious - depends on the approach\">Serious - depends on the approach</option><option value=\"Somewhat serious - exploring options\">Somewhat serious - exploring options</option><option value=\"Just curious about possibilities\">Just curious about possibilities</option></select></div></div><div class=\"question-card\"><div class=\"question-label\"><span class=\"required-star\">*</span> What investment range works for you?</div><div class=\"custom-select-wrapper\"><select id=\"investmentRange\" name=\"investmentRange\" required class=\"custom-select\"><option value=\"\">Select investment range</option><option value=\"₹10,000 - ₹25,000\">₹10,000 - ₹25,000</option><option value=\"₹25,000 - ₹50,000\">₹25,000 - ₹50,000</option><option value=\"₹50,000 - ₹1,00,000\">₹50,000 - ₹1,00,000</option><option value=\"₹1,00,000+ (Premium programs)\">₹1,00,000+ (Premium programs)</option><option value=\"Need to understand value first\">Need to understand value first</option></select></div></div><div class=\"question-card\"><div class=\"question-label\"><span class=\"required-star\">*</span> When would you like to start?</div><div class=\"custom-select-wrapper\"><select id=\"startTimeline\" name=\"startTimeline\" required class=\"custom-select\"><option value=\"\">Select start timeline</option><option value=\"Immediately (This week)\">Immediately (This week)</option><option value=\"Within 2 weeks\">Within 2 weeks</option><option value=\"Within a month\">Within a month</option><option value=\"In 2-3 months\">In 2-3 months</option><option value=\"Just exploring for now\">Just exploring for now</option></select></div></div><div class=\"question-card full-width\"><div class=\"question-label\">Additional information you'd like to share</div><div class=\"custom-textarea-wrapper\"><textarea id=\"additionalInfo\" name=\"additionalInfo\" rows=\"4\" placeholder=\"Tell us about your fitness journey, challenges, or specific goals...\" class=\"custom-textarea\"></textarea></div></div><div class=\"question-card full-width\"><div class=\"question-label\">How much of our video did you watch? (Optional)</div><div class=\"range-wrapper\"><input type=\"range\" id=\"vslWatchPercentage\" name=\"vslWatchPercentage\" min=\"0\" max=\"100\" value=\"0\" class=\"custom-range\"><div class=\"range-labels\"><span>0%</span><span class=\"range-value\" id=\"vslWatchValue\">0%</span><span>100%</span></div></div></div></div></div><div class=\"form-actions\"><button type=\"button\" class=\"btn-secondary q-back\">Back</button><button type=\"button\" class=\"btn-primary q-next\">Next</button><button type=\"submit\" class=\"btn-primary q-submit\">Submit Assessment</button></div></form></div><div class=\"step-content\" id=\"step4\" data-step=\"4\"><div class=\"success-container\"><div class=\"success-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/><polyline points=\"22 4 12 14.01 9 11.01\"/></svg></div><h3>All Set! Your Session is Booked.</h3><p>Thank you for completing the assessment. We've sent a confirmation and a calendar invite to your email.</p><p class=\"confirmation-note\"><strong>✓ Your booking is confirmed!</strong> You will receive all details via email shortly.</p><div class=\"success-details\" id=\"successDetails\"></div><div class=\"form-actions\"><button type=\"button\" class=\"btn-primary\" id=\"bookAnotherBtn\">Schedule Another Session</button></div></div></div></div></div></div>",
      "css": "/* ==========================================\n   CLIENT APPOINTMENT V8 - EDITOR OPTIMIZED\n   Stage-by-stage visibility control\n   ========================================== */\n\n:root { --primary-color: #3B82F6; --primary-hover: #2563EB; --dark-bg: #111827; --light-bg: #F7F8FA; --text-dark: #1F2937; --text-light: #6B7280; --border-color: #E5E7EB; --white: #FFFFFF; --success: #10B981; --danger-bg: #FEE2E2; --danger-text: #EF4444; --font-family: 'Inter', sans-serif; }\n\n* { margin: 0; padding: 0; box-sizing: border-box; }\n\n/* Initially Hidden Steps - JavaScript Controls Main Step Visibility */\n#step2,\n#step3,\n#step4 {\n  display: none !important;\n}\n\n/* Initially Hidden Questionnaire Buttons - JavaScript Controls Visibility */\n.q-back,\n.q-submit {\n  display: none !important;\n}\n\n.pro-booking-page { font-family: var(--font-family); background-color: var(--light-bg); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; } .pro-booking-container { display: flex; width: 100%; max-width: 1400px; height: 92vh; max-height: 900px; background-color: var(--white); border-radius: 32px; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15); overflow: hidden; } .info-panel { width: 40%; background-color: var(--dark-bg); background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0); background-size: 20px 20px; color: var(--white); padding: 3.5rem; display: flex; flex-direction: column; } .info-content h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; line-height: 1.2; letter-spacing: -0.02em; } .info-content > p { color: #9CA3AF; line-height: 1.6; margin-bottom: 2.5rem; } .info-features { display: flex; flex-direction: column; gap: 1.5rem; } .feature-item { display: flex; align-items: center; gap: 1rem; } .feature-icon { width: 40px; height: 40px; background-color: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); flex-shrink: 0; } .feature-icon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; } .feature-item span { color: #D1D5DB; font-weight: 500; } .feature-item strong { color: var(--white); font-weight: 600; } .info-divider { border: none; border-top: 1px solid #374151; margin: 2rem 0; } .info-subtitle { color: #9CA3AF; font-size: 0.9rem; font-weight: 500; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; } .info-footer { margin-top: auto; font-size: 0.8rem; color: #4B5563; } .booking-panel { width: 60%; padding: 2.5rem; overflow-y: auto; position: relative; } .api-status { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; display: none; } .api-status.loading { display: block; background-color: #EFF6FF; color: #3B82F6; } .api-status.error { display: block; background-color: var(--danger-bg); color: var(--danger-text); } .step-indicator { display: flex; align-items: center; margin-bottom: 2rem; position: relative; } .indicator-line { position: absolute; height: 2px; background-color: var(--border-color); top: 16px; left: 16px; right: 16px; z-index: 0; } .indicator-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex: 1; position: relative; z-index: 1; } .indicator-item span { width: 32px; height: 32px; border-radius: 50%; background-color: var(--white); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--text-light); transition: all 0.3s ease; } .indicator-item span svg { width: 18px; height: 18px; stroke: var(--white); } .indicator-item p { font-size: 0.8rem; font-weight: 500; color: var(--text-light); } .indicator-item.active span { background-color: var(--primary-color); border-color: var(--primary-color); color: var(--white); } .indicator-item.active p { color: var(--text-dark); } .indicator-item.completed span { background-color: var(--success); border-color: var(--success); } .step-content { animation: fadeIn 0.5s ease; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .step-header { text-align: center; margin-bottom: 2rem; } .step-header h3 { font-size: 1.5rem; color: var(--text-dark); margin-bottom: 0.25rem; } .step-header p { color: var(--text-light); } .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 1rem; } .nav-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-light); border-radius: 8px; width: 36px; height: 36px; cursor: pointer; transition: all 0.2s; } .nav-btn:hover { background-color: var(--light-bg); border-color: var(--primary-color); color: var(--primary-color); } .current-month { font-weight: 600; } .calendar-weekdays, .calendar-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; padding: 0 1rem; } .calendar-weekdays div { text-align: center; font-size: 0.8rem; color: var(--text-light); } .calendar-days { margin-top: 0.5rem; } .calendar-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease; font-weight: 600; font-size: 0.9rem; position: relative; } .calendar-day.available:hover { background-color: #EFF6FF; border-color: var(--primary-color); transform: scale(1.1); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2); } .calendar-day.selected { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: scale(1.05); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); } .calendar-day.unavailable { color: #D1D5DB; cursor: not-allowed; position: relative; } .calendar-day.unavailable::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; border: 2px solid var(--white); } .calendar-day.blocked { background-color: var(--danger-bg); color: var(--danger-text); cursor: not-allowed; position: relative; font-weight: 400; } .calendar-day.blocked::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; border: 2px solid var(--white); } .calendar-day.blocked:hover { background-color: var(--danger-bg); } .time-selection-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; } .time-selection-header h4 { font-size: 1rem; font-weight: 600; color: var(--text-dark); } .slots-container { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; max-height: 280px; overflow-y: auto; padding: 0 0.5rem 0.5rem 0; } .slot-btn { width: 100%; padding: 0.875rem 1rem; background-color: var(--white); border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; } .slot-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s; } .slot-btn:hover { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); } .slot-btn:hover::before { left: 100%; } .slot-btn:active { transform: translateY(0); } .slot-btn.selected { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: scale(1.05); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); } .placeholder-msg { grid-column: 1/-1; text-align: center; padding: 2rem; background-color: var(--light-bg); border-radius: 8px; color: var(--text-light); } .selected-slot-summary { background-color: var(--light-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; font-weight: 500; border: 1px solid var(--border-color); } .form-group { margin-bottom: 1rem; } .form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; letter-spacing: 0.025em; text-transform: uppercase; } .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 1rem 1.25rem; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 1rem; background-color: #FFFFFF; color: #1F2937; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); } .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15); transform: translateY(-1px); } .form-group input:hover, .form-group textarea:hover, .form-group select:hover { border-color: #3B82F6; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1); } .form-group select { appearance: none; background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e\"); background-position: right 1rem center; background-repeat: no-repeat; background-size: 1.5rem; padding-right: 3rem; cursor: pointer; } .form-group input::placeholder, .form-group textarea::placeholder { color: #9CA3AF; font-weight: 400; } .form-group textarea { resize: vertical; min-height: 120px; line-height: 1.6; } .form-actions { display: flex; gap: 1.25rem; margin-top: 2rem; justify-content: center; align-items: center; flex-wrap: wrap; } .btn-primary, .btn-secondary, .q-next, .q-back, .q-submit { min-width: 140px; border: none; padding: 1.125rem 2.25rem; border-radius: 14px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.025em; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); text-align: center; position: relative; overflow: hidden; } .btn-primary, .q-next, .q-submit { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; border: 2px solid transparent; } .btn-primary:hover, .q-next:hover, .q-submit:hover { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); transform: translateY(-3px); box-shadow: 0 12px 28px rgba(59, 130, 246, 0.35); scale: 1.02; } .btn-primary:active, .q-next:active, .q-submit:active { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25); } .btn-secondary, .q-back { background-color: #FFFFFF; color: #374151; border: 2px solid #E5E7EB; } .btn-secondary.btn-small { min-width: auto; padding: 0.875rem 1.75rem; font-size: 0.95rem; } .btn-secondary:hover, .q-back:hover { background-color: #F9FAFB; border-color: #3B82F6; color: #3B82F6; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2); } .btn-primary:disabled, .btn-secondary:disabled, .q-next:disabled, .q-back:disabled, .q-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); } #coachQuestionnaireForm .q-step { display: none; } #coachQuestionnaireForm .q-step.active { display: block; animation: fadeIn 0.5s; } #coachQuestionnaireForm .q-step h5 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); } .questionnaire-progress { margin-bottom: 2rem; } .progress-bar { width: 100%; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden; } .progress-bar-inner { height: 100%; width: 0; background-color: var(--primary-color); transition: width 0.3s ease; } #qProgressText { text-align: right; display: block; font-size: 0.8rem; color: var(--text-light); margin-top: 0.5rem; } .success-container { text-align: center; padding-top: 2rem; } .success-icon { width: 64px; height: 64px; background-color: #D1FAE5; color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; } .success-icon svg { width: 32px; height: 32px; } .success-details { background-color: var(--light-bg); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; text-align: left; } .question-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; } .question-card { background-color: var(--white); border: 2px solid var(--border-color); border-radius: 12px; padding: 1.25rem; transition: all 0.3s ease; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }  .question-label { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.95rem; font-weight: 600; color: var(--text-dark); margin-bottom: 1rem; line-height: 1.5; } .required-star { color: #EF4444; font-weight: 700; margin-right: 0.25rem; } .custom-select-wrapper { position: relative; width: 100%; } .custom-select { width: 100%; padding: 0.875rem 3rem 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.95rem; background-color: var(--white); color: var(--text-dark); transition: all 0.3s ease; appearance: none; cursor: pointer; font-family: inherit; font-weight: 500; background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e\"); background-position: right 1rem center; background-repeat: no-repeat; background-size: 1.25rem; } .custom-select:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } .custom-select:hover { border-color: var(--primary-color); } .custom-textarea-wrapper { position: relative; width: 100%; } .custom-textarea { width: 100%; padding: 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.95rem; background-color: var(--white); color: var(--text-dark); transition: all 0.3s ease; resize: vertical; min-height: 120px; font-family: inherit; line-height: 1.6; font-weight: 500; } .custom-textarea:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } .custom-textarea:hover { border-color: var(--primary-color); } .custom-textarea::placeholder { color: #9CA3AF; font-weight: 400; } .range-wrapper { position: relative; margin-top: 0.75rem; padding: 0.5rem; } .custom-range { width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; outline: none; appearance: none; cursor: pointer; transition: all 0.3s ease; } .custom-range::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: var(--primary-color); border-radius: 50%; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); } .custom-range::-webkit-slider-thumb:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4); } .custom-range::-moz-range-thumb { width: 20px; height: 20px; background: var(--primary-color); border-radius: 50%; cursor: pointer; border: none; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); } .custom-range::-moz-range-thumb:hover { transform: scale(1.1); box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4); } .range-labels { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-light); } .range-value { display: inline-block; background: linear-gradient(135deg, var(--primary-color) 0%, #2563EB 100%); color: white; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-align: center; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: all 0.3s ease; } .question-card.full-width { grid-column: 1/-1; } @media (max-width: 768px) { .question-grid { grid-template-columns: 1fr; gap: 1rem; } .question-card { padding: 1rem; } .question-label { font-size: 0.9rem; } .custom-select, .custom-textarea { font-size: 0.9rem; padding: 0.75rem 2.5rem 0.75rem 0.875rem; } .custom-textarea { padding: 0.75rem 0.875rem; } .range-wrapper { padding: 0.25rem; } .form-actions { gap: 0.75rem; flex-direction: column; } .btn-primary, .btn-secondary, .q-next, .q-back, .q-submit { width: 100%; min-width: auto; } } @media (max-width: 900px) { .pro-booking-container { flex-direction: column; height: auto; max-height: none; } .info-panel, .booking-panel { width: 100%; } .booking-panel { padding: 1.5rem; } }",
      "js": "(function() { 'use strict'; console.log('🚀 CLIENT APPOINTMENT V8 STARTING...'); var qStep = 1; window.appointmentState = { currentStep: 1, currentDate: new Date(), selectedDate: null, selectedSlot: null, coachAvailability: null, appointmentDetails: null, coachId: null, blockedDates: new Set() }; var getBaseUrl = function() { var hostname = window.location.hostname; var port = window.location.port; var isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost') || hostname.includes('127.0.0.1'); var isDevPort = port === '5000' || port === '3000' || port === '5173' || port === '8080' || port === ''; var isProduction = window.location.origin.includes('funnelseye.com') && !isLocalhost; var isDev = isLocalhost || isDevPort || !isProduction; var apiUrl = isDev ? 'http://localhost:8080' : 'https://api.funnelseye.com'; console.log('🔍 API URL Detection:', { hostname: hostname, port: port, origin: window.location.origin, isLocalhost: isLocalhost, isDevPort: isDevPort, isProduction: isProduction, isDev: isDev, apiUrl: apiUrl }); return apiUrl; }; var BASE_URL = getBaseUrl(); var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; function safeGetElementById(id) { return document.getElementById(id); } function init() { window.appointmentState.coachId = localStorage.getItem('coachId') || null; var leadId = localStorage.getItem('leadId'); console.log('📋 INIT - CoachID:', window.appointmentState.coachId); console.log('📋 INIT - LeadID:', leadId); var leadIdInput = safeGetElementById('leadId'); if (leadIdInput) { leadIdInput.value = leadId || ''; } setupEventListeners(); fetchCoachAvailability(); renderCalendar(); updateStepUI(); showDateView(); } function setupEventListeners() { var prevMonth = safeGetElementById('prevMonth'); if (prevMonth) prevMonth.addEventListener('click', function() { changeMonth(-1); }); var nextMonth = safeGetElementById('nextMonth'); if (nextMonth) nextMonth.addEventListener('click', function() { changeMonth(1); }); var backToStep1 = safeGetElementById('backToStep1'); if (backToStep1) backToStep1.addEventListener('click', function() { navigateToStep(1); }); var backToCalendarBtn = safeGetElementById('backToCalendarBtn'); if (backToCalendarBtn) backToCalendarBtn.addEventListener('click', showDateView); var bookNowBtn = safeGetElementById('bookNowBtn'); if (bookNowBtn) bookNowBtn.addEventListener('click', function() { navigateToStep(3); }); var nextFromTimeSelection = safeGetElementById('nextFromTimeSelection'); if (nextFromTimeSelection) nextFromTimeSelection.addEventListener('click', function() { if (window.appointmentState.selectedSlot) { navigateToStep(2); } }); var bookAnotherBtn = safeGetElementById('bookAnotherBtn'); if (bookAnotherBtn) bookAnotherBtn.addEventListener('click', resetForm); var qForm = safeGetElementById('coachQuestionnaireForm'); if (qForm) { var qNext = qForm.querySelector('.q-next'); if (qNext) qNext.addEventListener('click', function() { navigateQuestionnaire(1); }); var qBack = qForm.querySelector('.q-back'); if (qBack) qBack.addEventListener('click', function() { navigateQuestionnaire(-1); }); qForm.addEventListener('submit', submitQuestionnaire); } var vslWatchPercentage = safeGetElementById('vslWatchPercentage'); if (vslWatchPercentage) vslWatchPercentage.addEventListener('input', function(e) { var valueDisplay = safeGetElementById('vslWatchValue'); if (valueDisplay) valueDisplay.textContent = e.target.value + '%'; }); } function showDateView() { safeGetElementById('dateSelectionView').style.display = 'block'; safeGetElementById('timeSelectionView').style.display = 'none'; } function showTimeView() { safeGetElementById('dateSelectionView').style.display = 'none'; safeGetElementById('timeSelectionView').style.display = 'block'; } function navigateToStep(step) { document.querySelectorAll('.step-content').forEach(function(el) { el.style.display = 'none'; el.style.setProperty('display', 'none', 'important'); }); var stepEl = safeGetElementById('step' + step); if (stepEl) { stepEl.style.setProperty('display', 'block', 'important'); } window.appointmentState.currentStep = step; updateStepUI(); } function updateStepUI() { var indicators = document.querySelectorAll('.indicator-item'); indicators.forEach(function(item) { var step = parseInt(item.getAttribute('data-step')); if (step < window.appointmentState.currentStep) { item.classList.add('completed'); item.classList.remove('active'); } else if (step === window.appointmentState.currentStep) { item.classList.add('active'); item.classList.remove('completed'); } else { item.classList.remove('active', 'completed'); } }); } function changeMonth(direction) { window.appointmentState.currentDate.setMonth(window.appointmentState.currentDate.getMonth() + direction); renderCalendar(); } function renderCalendar() { var state = window.appointmentState; var year = state.currentDate.getFullYear(); var month = state.currentDate.getMonth(); safeGetElementById('currentMonth').textContent = MONTHS[month] + ' ' + year; var calendarDays = safeGetElementById('calendarDays'); calendarDays.innerHTML = ''; var firstDay = new Date(year, month, 1).getDay(); var daysInMonth = new Date(year, month + 1, 0).getDate(); for (var i = 0; i < firstDay; i++) { calendarDays.insertAdjacentHTML('beforeend', '<div></div>'); } var today = new Date(); today.setHours(0, 0, 0, 0); for (var day = 1; day <= daysInMonth; day++) { (function(day) { var date = new Date(year, month, day); var dateKey = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(); var dayEl = document.createElement('div'); dayEl.className = 'calendar-day'; dayEl.textContent = day; if (state.blockedDates.has(dateKey)) { dayEl.classList.add('blocked'); } else if (date < today) { dayEl.classList.add('unavailable'); } else { dayEl.classList.add('available'); dayEl.onclick = function() { selectDate(date); }; } if (state.selectedDate && date.toDateString() === state.selectedDate.toDateString()) { dayEl.classList.add('selected'); } calendarDays.appendChild(dayEl); })(day); } } function selectDate(date) { window.appointmentState.selectedDate = date; safeGetElementById('selectedDateDisplay').textContent = 'Available times for ' + date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); renderCalendar(); fetchAvailableSlots(date); } function updateInfoPanel(data) { safeGetElementById('infoDuration').textContent = data.defaultAppointmentDuration || '--'; safeGetElementById('infoBuffer').textContent = data.bufferTime || '--'; safeGetElementById('infoTimezone').textContent = data.timeZone || 'Not Set'; } function fetchCoachAvailability() { console.log('📡 API CALL 1: Fetching coach availability...'); showApiStatus('loading', 'Fetching coach availability...'); var apiUrl = BASE_URL + '/api/coach/' + window.appointmentState.coachId + '/availability'; console.log('  └─ URL:', apiUrl); fetch(apiUrl).then(function(response) { console.log('📥 API 1 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 1 SUCCESS - Response Data:', JSON.stringify(result, null, 2)); if (result.success && result.data) { window.appointmentState.coachAvailability = result.data; updateInfoPanel(result.data); window.appointmentState.blockedDates.clear(); if (result.data.unavailableSlots && Array.isArray(result.data.unavailableSlots)) { result.data.unavailableSlots.forEach(function(slot) { var current = new Date(slot.start); var end = new Date(slot.end); while (current <= end) { var key = current.getFullYear() + '-' + current.getMonth() + '-' + current.getDate(); window.appointmentState.blockedDates.add(key); current.setDate(current.getDate() + 1); } }); console.log('  └─ Blocked dates loaded:', window.appointmentState.blockedDates.size); } renderCalendar(); hideApiStatus(); } else { throw new Error('Invalid availability data'); } }).catch(function(error) { console.error('❌ API 1 ERROR:', error); handleApiError(error); }); } function fetchAvailableSlots(date) { console.log('📡 API CALL 2: Fetching available slots...'); showApiStatus('loading', 'Fetching slots...'); showTimeView(); var timezone = (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata'; var year = date.getFullYear(); var month = String(date.getMonth() + 1).padStart(2, '0'); var day = String(date.getDate()).padStart(2, '0'); var dateStringForAPI = year + '-' + month + '-' + day; var dateISO = dateStringForAPI + 'T00:00:00.000Z'; var apiUrl = BASE_URL + '/api/coach/' + window.appointmentState.coachId + '/available-slots?date=' + dateISO + '&timeZone=' + encodeURIComponent(timezone); console.log('  └─ URL:', apiUrl); console.log('  └─ Date:', dateISO); console.log('  └─ TimeZone:', timezone); fetch(apiUrl).then(function(response) { console.log('📥 API 2 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 2 SUCCESS - Response Data:', JSON.stringify(result, null, 2)); var slots = result.success ? result.slots : []; console.log('  └─ Slots found:', slots.length); displayAvailableSlots(slots, timezone); hideApiStatus(); }).catch(function(err) { console.error('❌ API 2 ERROR:', err); handleApiError(err); displayAvailableSlots([], timezone); }); } function displayAvailableSlots(slots, timezone) { var container = safeGetElementById('slotsContainer'); if (slots.length === 0) { container.innerHTML = '<div class=\"placeholder-msg\">No slots available for this day.</div>'; return; } var slotsHtml = ''; for (var i = 0; i < slots.length; i++) { var slot = slots[i]; var timeString = new Date(slot.startTime).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true }); slotsHtml += '<button class=\"slot-btn\" data-starttime=\"' + slot.startTime + '\">' + timeString + '</button>'; } container.innerHTML = slotsHtml; container.querySelectorAll('.slot-btn').forEach(function(btn) { btn.addEventListener('click', selectSlot); }); } function selectSlot(e) { window.appointmentState.selectedSlot = { startTime: e.target.getAttribute('data-starttime'), duration: window.appointmentState.coachAvailability.defaultAppointmentDuration || 30 }; console.log('🎯 Slot Selected:', window.appointmentState.selectedSlot); var timezone = (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata'; var summary = safeGetElementById('selectedSlotSummary'); if (summary) { var dateString = new Date(window.appointmentState.selectedSlot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); var timeString = new Date(window.appointmentState.selectedSlot.startTime).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true }); summary.innerHTML = 'You\\'ve selected: <strong>' + dateString + '</strong> at <strong>' + timeString + '</strong>'; } var nextBtn = safeGetElementById('nextFromTimeSelection'); if (nextBtn) nextBtn.style.display = 'block'; document.querySelectorAll('.slot-btn').forEach(function(btn) { btn.classList.remove('selected'); }); e.target.classList.add('selected'); } function bookAppointment() { var leadIdInput = safeGetElementById('leadId'); if (!leadIdInput || !leadIdInput.value.trim()) { showApiStatus('error', 'Lead ID is missing. Please contact support or try again.'); return; } console.log('📡 API CALL 3: Booking appointment...'); showApiStatus('loading', 'Confirming your booking...'); var payload = { leadId: leadIdInput.value.trim(), startTime: window.appointmentState.selectedSlot.startTime, duration: window.appointmentState.selectedSlot.duration, notes: safeGetElementById('notes').value.trim(), timeZone: (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata' }; var apiUrl = BASE_URL + '/api/coach/' + window.appointmentState.coachId + '/book'; console.log('  └─ URL:', apiUrl); console.log('  └─ Payload:', JSON.stringify(payload, null, 2)); fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(function(response) { console.log('📥 API 3 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 3 SUCCESS - Booking Response:', JSON.stringify(result, null, 2)); if (result.success) { window.appointmentState.appointmentDetails = result.appointmentDetails || result.data; localStorage.setItem('leadId', leadIdInput.value.trim()); var coachTimeZone = (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata'; function formatDateInTimezone(dateString, timezone) { return new Date(dateString).toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long', month: 'long', day: 'numeric' }); } function formatTimeInTimezone(dateString, timezone) { return new Date(dateString).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true }); } var appointmentDetails = window.appointmentState.appointmentDetails; localStorage.setItem('appointmentDetails', JSON.stringify({ appointmentId: appointmentDetails._id || appointmentDetails.id || 'APPT-' + Date.now(), coachId: window.appointmentState.coachId, leadId: leadIdInput.value.trim(), date: formatDateInTimezone(appointmentDetails.startTime, coachTimeZone), time: formatTimeInTimezone(appointmentDetails.startTime, coachTimeZone), duration: appointmentDetails.duration, timezone: coachTimeZone, status: 'Confirmed', notes: appointmentDetails.notes || '', bookedAt: new Date().toISOString() })); console.log('💾 Appointment details saved to localStorage'); updateLeadStatus(leadIdInput.value.trim(), 'Appointment'); hideApiStatus(); displaySuccess(); navigateToStep(4); } else { throw new Error(result.message || 'Booking failed.'); } }).catch(function(error) { console.error('❌ API 3 ERROR:', error); handleApiError(error); }); } function navigateQuestionnaire(direction) { var steps = document.querySelectorAll('.q-step'); var newStep = qStep + direction; if (newStep > 0 && newStep <= steps.length) { qStep = newStep; steps.forEach(function(s) { s.classList.remove('active'); }); document.querySelector('.q-step[data-qstep=\"' + qStep + '\"]').classList.add('active'); updateQuestionnaireUI(steps.length); } } function updateQuestionnaireUI(totalSteps) { var qForm = safeGetElementById('coachQuestionnaireForm'); var backBtn = qForm.querySelector('.q-back'); var nextBtn = qForm.querySelector('.q-next'); var submitBtn = qForm.querySelector('.q-submit'); if (backBtn) backBtn.style.display = qStep > 1 ? 'block' : 'none'; if (nextBtn) nextBtn.style.display = qStep < totalSteps ? 'block' : 'none'; if (submitBtn) submitBtn.style.display = qStep === totalSteps ? 'block' : 'none'; var progress = (qStep / totalSteps) * 100; safeGetElementById('qProgress').style.width = progress + '%'; safeGetElementById('qProgressText').textContent = 'Part ' + qStep + ' of ' + totalSteps; } function submitQuestionnaire(e) { e.preventDefault(); console.log('📡 API CALL 4: Submitting questionnaire...'); showApiStatus('loading', 'Submitting assessment...'); var leadId = localStorage.getItem('leadId'); if (!leadId) { showApiStatus('error', 'Lead ID is missing. Please contact support.'); return; } var formData = new FormData(e.target); var formObject = {}; formData.forEach(function(value, key){ formObject[key] = value; }); var vslWatchPercentage = parseFloat(formObject.vslWatchPercentage) || 0; var clientQuestions = { watchedVideo: formObject.watchedVideo, healthGoal: formObject.healthGoal, timelineForResults: formObject.timelineForResults, seriousnessLevel: formObject.seriousnessLevel, investmentRange: formObject.investmentRange, startTimeline: formObject.startTimeline, additionalInfo: formObject.additionalInfo || '' }; var questionnaireData = { leadId: leadId, questionResponses: { clientQuestions: clientQuestions, vslWatchPercentage: vslWatchPercentage }, appointmentData: { preferredTime: window.appointmentState.selectedSlot ? new Date(window.appointmentState.selectedSlot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '', preferredDate: window.appointmentState.selectedSlot ? new Date(window.appointmentState.selectedSlot.startTime).toLocaleDateString('en-US') : '', timezone: (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata', notes: safeGetElementById('notes').value.trim() || '' } }; var apiUrl = BASE_URL + '/api/leads/question-responses'; console.log('  └─ URL:', apiUrl); console.log('  └─ Payload:', JSON.stringify(questionnaireData, null, 2)); fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questionnaireData) }).then(function(response) { console.log('📥 API 4 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 4 SUCCESS - Questionnaire Response:', JSON.stringify(result, null, 2)); if (result.success) { hideApiStatus(); updateLeadStatus(leadId, 'Thank You Page'); bookAppointment(); } else { throw new Error(result.message || 'Submission failed.'); } }).catch(function(error) { console.error('❌ API 4 ERROR:', error); handleApiError(error); }); } function displaySuccess() { var detailsEl = safeGetElementById('successDetails'); var state = window.appointmentState; if (!state.appointmentDetails) { console.error('❌ No appointment details available'); return; } var timezone = (state.coachAvailability && state.coachAvailability.timeZone) || 'Asia/Kolkata'; var dateString = new Date(state.appointmentDetails.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone }); var timeString = new Date(state.appointmentDetails.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone }); if (detailsEl) { detailsEl.innerHTML = '<p><strong>Date:</strong> ' + dateString + '</p><p><strong>Time:</strong> ' + timeString + '</p>'; } console.log('✅ Success screen displayed'); console.log('⏳ Redirecting to thank-you page in 2 seconds...'); setTimeout(function() { var currentUrl = window.location.pathname; var newUrl = currentUrl.replace('/appointment-page', '/thankyou-page'); console.log('🔀 Redirecting to:', newUrl); window.location.href = newUrl; }, 2000); } function resetForm() { window.appointmentState.currentStep = 1; window.appointmentState.selectedDate = null; window.appointmentState.selectedSlot = null; window.appointmentState.appointmentDetails = null; qStep = 1; safeGetElementById('bookingDetailsForm').reset(); safeGetElementById('coachQuestionnaireForm').reset(); document.querySelectorAll('.q-step').forEach(function(s, i) { s.classList.toggle('active', i === 0); }); updateQuestionnaireUI(document.querySelectorAll('.q-step').length); renderCalendar(); showDateView(); navigateToStep(1); } function showApiStatus(type, message) { var el = safeGetElementById('apiStatus'); el.className = 'api-status ' + type; el.textContent = message; el.style.display = 'block'; } function hideApiStatus() { var el = safeGetElementById('apiStatus'); if (el) el.style.display = 'none'; } function handleResponse(response) { if (!response.ok) { return response.text().then(function(text) { throw new Error(text || 'Network response was not ok'); }); } return response.json(); } function handleApiError(error) { console.error('❌ API ERROR:', error); showApiStatus('error', error.message || 'An unexpected error occurred.'); } function updateLeadStatus(leadId, status) { console.log('📡 API CALL 5: Updating lead status to:', status); var apiUrl = BASE_URL + '/api/leads/' + leadId; console.log('  └─ URL:', apiUrl); console.log('  └─ Payload:', JSON.stringify({ status: status }, null, 2)); fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ status: status }) }).then(function(response) { console.log('📥 API 5 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(data) { console.log('✅ API 5 SUCCESS - Lead status updated:', JSON.stringify(data, null, 2)); }).catch(function(error) { console.error('❌ API 5 ERROR:', error); }); } if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); } console.log('✅ Client Appointment V8 System Ready'); })();"
    },
    
  
      "couch_appointment_booking_v8_professional": {
        "name": "Professional Coach Booking (v8 - Enhanced Design)",
        "description": "Enhanced professional booking system with improved questionnaire design and consolidated 2-step assessment process.",
        "thumbnail": "https://placehold.co/400x300/3B82F6/ffffff?text=Professional+v8",
        "html": "<div class=\"pro-booking-page\"><div class=\"pro-booking-container\"><div class=\"info-panel\"><div class=\"info-content\"><h2>Build Your Coaching Empire</h2><p>Book a complimentary strategy session to discover our proven system for building a successful, profitable coaching business.</p><div class=\"info-features\"><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z\"/><path d=\"m9 12 2 2 4-4\"/></svg></div><span>Personalized Business Strategy</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M3 3v18h18\"/><path d=\"m19 9-5 5-4-4-3 3\"/></svg></div><span>Proven Income Systems</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"m22 21-2-2\"/></svg></div><span>Elite Coach Network</span></div></div><hr class=\"info-divider\"><h4 class=\"info-subtitle\">Coach Settings</h4><div class=\"info-features\"><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg></div><span>Duration: <strong id=\"infoDuration\">--</strong> min</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 2h.01\"></path><path d=\"M6.34 7.34l.01-.01\"></path><path d=\"M17.66 7.34l-.01-.01\"></path><path d=\"M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z\"></path><path d=\"M12 12l-4-4\"></path></svg></div><span>Buffer: <strong id=\"infoBuffer\">--</strong> min</span></div><div class=\"feature-item\"><div class=\"feature-icon\"><svg viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M2 12h20\"></path><path d=\"M12 2a15.3 15.3 0 0 1 4 18 15.3 15.3 0 0 1-8 0 15.3 15.3 0 0 1 4-18z\"></path></svg></div><span>Timezone: <strong id=\"infoTimezone\">--</strong></span></div></div></div><div class=\"info-footer\"><p>&copy; 2025 Coach Connect</p></div></div><div class=\"booking-panel\"><div class=\"api-status\" id=\"apiStatus\"></div><div class=\"step-indicator\" id=\"stepIndicator\"><div class=\"indicator-line\"></div><div class=\"indicator-item active\" data-step=\"1\"><span>1</span><p>Time</p></div><div class=\"indicator-item\" data-step=\"2\"><span>2</span><p>Details</p></div><div class=\"indicator-item\" data-step=\"3\"><span>3</span><p>Assess</p></div><div class=\"indicator-item\" data-step=\"4\"><span><svg viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"/></svg></span><p>Done</p></div></div><div class=\"step-content\" id=\"step1\" data-step=\"1\"><div class=\"step-header\"><h3>Select a Date & Time</h3><p>Choose a time that works best for your business consultation.</p></div><div id=\"dateSelectionView\"><div class=\"calendar-header\"><button class=\"nav-btn\" id=\"prevMonth\">‹</button><span class=\"current-month\" id=\"currentMonth\"></span><button class=\"nav-btn\" id=\"nextMonth\">›</button></div><div class=\"calendar-weekdays\"><div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div></div><div class=\"calendar-days\" id=\"calendarDays\"></div></div><div id=\"timeSelectionView\"><div class=\"time-selection-header\"><h4 id=\"selectedDateDisplay\">Available Times</h4><button class=\"btn-secondary btn-small\" id=\"backToCalendarBtn\">Change Date</button></div><div class=\"slots-container\" id=\"slotsContainer\"><div class=\"placeholder-msg\">Loading times...</div></div><div class=\"form-actions\" style=\"margin-top: 1.5rem; justify-content: center;\"><button type=\"button\" class=\"btn-primary\" id=\"nextFromTimeSelection\" style=\"display: none;\">Next</button></div></div></div><div class=\"step-content\" id=\"step2\" data-step=\"2\"><div class=\"step-header\"><h3>Confirm Your Details</h3><p>Please provide your information to secure your spot.</p></div><div class=\"selected-slot-summary\" id=\"selectedSlotSummary\"></div><form id=\"bookingDetailsForm\"><input type=\"hidden\" id=\"leadId\" required><div class=\"form-group\"><label for=\"notes\">Business Goals (Optional)</label><textarea id=\"notes\" placeholder=\"What's your main business goal or challenge?\" rows=\"4\"></textarea></div><div class=\"form-actions\"><button type=\"button\" class=\"btn-secondary\" id=\"backToStep1\">Back</button><button type=\"button\" class=\"btn-primary\" id=\"bookNowBtn\">Next</button></div></form></div><div class=\"step-content\" id=\"step3\" data-step=\"3\"><div class=\"step-header\"><h3>Business Assessment</h3><p>This helps us understand your goals and prepare a customized strategy for your call.</p></div><div class=\"questionnaire-progress\"><div class=\"progress-bar\"><div class=\"progress-bar-inner\" id=\"qProgress\"></div></div><span id=\"qProgressText\"></span></div><form id=\"coachQuestionnaireForm\"><div class=\"q-step active\" data-qstep=\"1\"><div class=\"step-header-pro\"><h5>Background & Interest Assessment</h5><p>Help us understand your background and goals</p></div><div class=\"form-section\"><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><path d=\"M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z\"/></svg>Did you watch the full video before booking this call? *</label><div class=\"select-wrapper\"><select id=\"watchedVideo\" name=\"watchedVideo\" required><option value=\"\">Select an option</option><option value=\"Yes\">Yes, I watched the complete video</option><option value=\"No\">No, I skipped through it</option></select><svg class=\"select-arrow\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5\"/></svg></div></div><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><path d=\"M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 21H5a2 2 0 0 1-2-2v-4a6 6 0 0 1 12 0v6z\"/></svg>What's your current profession? *</label><div class=\"select-wrapper\"><select id=\"currentProfession\" name=\"currentProfession\" required><option value=\"\">Select your profession</option><option value=\"Fitness Trainer/Gym Instructor\">Fitness Trainer/Gym Instructor</option><option value=\"Nutritionist/Dietitian\">Nutritionist/Dietitian</option><option value=\"Healthcare Professional\">Healthcare Professional</option><option value=\"Sales Professional\">Sales Professional</option><option value=\"Business Owner\">Business Owner</option><option value=\"Corporate Employee\">Corporate Employee</option><option value=\"Homemaker\">Homemaker</option><option value=\"Student\">Student</option><option value=\"Unemployed/Looking for Career Change\">Unemployed/Looking for Career Change</option><option value=\"Other\">Other</option></select><svg class=\"select-arrow\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5\"/></svg></div></div><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><path d=\"M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 1 1.946-.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 1-.806 1.946L12 10.086 8.913 8.913a3.42 3.42 0 0 1-.806-1.946 3.42 3.42 0 0 1 3.138-3.138 3.42 3.42 0 0 1 1.946.806z\"/></svg>Why are you interested in coaching? (Select all that apply) *</label><div class=\"checkbox-grid\"><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Want additional income source\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Want additional income source</span></label><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Passionate about helping people transform\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Passionate about helping people transform</span></label><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Looking for career change\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Looking for career change</span></label><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Want financial freedom\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Want financial freedom</span></label><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Interested in flexible work schedule\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Interested in flexible work schedule</span></label><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Want to build a team/network\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Want to build a team/network</span></label><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Already in fitness, want to scale\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Already in fitness, want to scale</span></label><label class=\"checkbox-card\"><input type=\"checkbox\" name=\"interestReasons\" value=\"Other\"><span class=\"checkmark\"></span><span class=\"checkbox-text\">Other</span></label></div></div><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><path d=\"M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>What's your income goal? *</label><div class=\"select-wrapper\"><select id=\"incomeGoal\" name=\"incomeGoal\" required><option value=\"\">Select income goal</option><option value=\"₹25,000 - ₹50,000/month (Part-time)\">₹25,000 - ₹50,000/month (Part-time)</option><option value=\"₹50,000 - ₹1,00,000/month (Full-time basic)\">₹50,000 - ₹1,00,000/month (Full-time basic)</option><option value=\"₹1,00,000 - ₹2,00,000/month (Professional)\">₹1,00,000 - ₹2,00,000/month (Professional)</option><option value=\"₹2,00,000 - ₹5,00,000/month (Advanced)\">₹2,00,000 - ₹5,00,000/month (Advanced)</option><option value=\"₹5,00,000+/month (Empire building)\">₹5,00,000+/month (Empire building)</option></select><svg class=\"select-arrow\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5\"/></svg></div></div></div></div><div class=\"q-step\" data-qstep=\"2\"><div class=\"step-header-pro\"><h5>Investment & Timeline Planning</h5><p>Let's understand your commitment level and timeline</p></div><div class=\"form-section\"><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><path d=\"M12 1v6l3-3M9 4l3 3M12 1v6l-3-3M12 7v6M4 4l1 1M20 4l-1 1M4 20l1-1M20 20l-1-1M12 12a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z\"/></svg>Investment capacity for business setup? *</label><div class=\"select-wrapper\"><select id=\"investmentCapacity\" name=\"investmentCapacity\" required><option value=\"\">Select investment range</option><option value=\"₹50,000 - ₹1,00,000\">₹50,000 - ₹1,00,000</option><option value=\"₹1,00,000 - ₹2,00,000\">₹1,00,000 - ₹2,00,000</option><option value=\"₹2,00,000 - ₹3,00,000\">₹2,00,000 - ₹3,00,000</option><option value=\"₹3,00,000+\">₹3,00,000+</option><option value=\"Need to understand business model first\">Need to understand business model first</option></select><svg class=\"select-arrow\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5\"/></svg></div></div><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>How much time can you dedicate daily? *</label><div class=\"select-wrapper\"><select id=\"timeAvailability\" name=\"timeAvailability\" required><option value=\"\">Select time availability</option><option value=\"2-4 hours/day (Part-time)\">2-4 hours/day (Part-time)</option><option value=\"4-6 hours/day (Serious part-time)\">4-6 hours/day (Serious part-time)</option><option value=\"6-8 hours/day (Full-time)\">6-8 hours/day (Full-time)</option><option value=\"8+ hours/day (Fully committed)\">8+ hours/day (Fully committed)</option><option value=\"Flexible based on results\">Flexible based on results</option></select><svg class=\"select-arrow\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5\"/></svg></div></div><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><path d=\"M8 2v4M16 2v4M3 10h18M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z\"/></svg>Timeline to achieve your income goal? *</label><div class=\"select-wrapper\"><select id=\"timelineToAchieveGoal\" name=\"timelineToAchieveGoal\" required><option value=\"\">Select timeline</option><option value=\"1-3 months (Very urgent)\">1-3 months (Very urgent)</option><option value=\"3-6 months (Moderate urgency)\">3-6 months (Moderate urgency)</option><option value=\"6-12 months (Gradual building)\">6-12 months (Gradual building)</option><option value=\"1-2 years (Long-term vision)\">1-2 years (Long-term vision)</option></select><svg class=\"select-arrow\" viewBox=\"0 0 24 24\"><path d=\"M7 10l5 5 5-5\"/></svg></div></div><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/></svg>Any additional information you'd like to share?</label><div class=\"textarea-wrapper\"><textarea id=\"additionalInfo\" name=\"additionalInfo\" rows=\"4\" placeholder=\"Tell us about your business experience, goals, or specific challenges...\"></textarea></div></div><div class=\"form-field-group\"><label class=\"field-label\"><svg class=\"field-icon\" viewBox=\"0 0 24 24\"><polygon points=\"23 7 16 12 23 17 23 7\"/><rect width=\"15\" height=\"14\" x=\"1\" y=\"5\" rx=\"2\" ry=\"2\"/></svg>How much of our video did you watch? (Optional)</label><div class=\"range-wrapper\"><input type=\"range\" id=\"vslWatchPercentage\" name=\"vslWatchPercentage\" min=\"0\" max=\"100\" value=\"0\"><div class=\"range-display\"><span class=\"range-value\" id=\"vslWatchValue\">0%</span></div></div></div></div></div><div class=\"form-actions\"><button type=\"button\" class=\"btn-secondary q-back\">Back</button><button type=\"button\" class=\"btn-primary q-next\">Next</button><button type=\"submit\" class=\"btn-primary q-submit\">Submit Assessment</button></div></form></div><div class=\"step-content\" id=\"step4\" data-step=\"4\"><div class=\"success-container\"><div class=\"success-icon\"><svg viewBox=\"0 0 24 24\"><path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/><polyline points=\"22 4 12 14.01 9 11.01\"/></svg></div><h3>Perfect! Your Business Strategy Session is Booked.</h3><p>Thank you for completing the assessment. We've sent a confirmation and calendar invite to your email with all the details.</p><p class=\"confirmation-note\"><strong>✓ Your booking is confirmed!</strong> You will receive all details via email shortly.</p><div class=\"success-details\" id=\"successDetails\"></div><div class=\"form-actions\"><button type=\"button\" class=\"btn-primary\" id=\"bookAnotherBtn\">Schedule Another Session</button></div></div></div></div></div></div>",
        "css": "/* ==========================================\n   COACH APPOINTMENT V8 - EDITOR OPTIMIZED\n   Stage-by-stage visibility control\n   ========================================== */\n\n:root { --primary-color: #3B82F6; --primary-hover: #2563EB; --dark-bg: #111827; --light-bg: #F7F8FA; --text-dark: #1F2937; --text-light: #6B7280; --border-color: #E5E7EB; --white: #FFFFFF; --success: #10B981; --danger-bg: #FEE2E2; --danger-text: #EF4444; --font-family: 'Inter', sans-serif; }\n\n* { margin: 0; padding: 0; box-sizing: border-box; }\n\n/* Initially Hidden Steps - JavaScript Controls Main Step Visibility */\n#step2,\n#step3,\n#step4 {\n  display: none !important;\n}\n\n/* Initially Hidden Questionnaire Buttons - JavaScript Controls Visibility */\n.q-back,\n.q-submit {\n  display: none !important;\n}\n\n.pro-booking-page { font-family: var(--font-family); background-color: var(--light-bg); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; } .pro-booking-container { display: flex; width: 100%; max-width: 1400px; height: 92vh; max-height: 900px; background-color: var(--white); border-radius: 32px; box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15); overflow: hidden; } .info-panel { width: 40%; background-color: var(--dark-bg); background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0); background-size: 20px 20px; color: var(--white); padding: 3.5rem; display: flex; flex-direction: column; } .info-content h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; line-height: 1.2; letter-spacing: -0.02em; } .info-content > p { color: #9CA3AF; line-height: 1.6; margin-bottom: 2.5rem; } .info-features { display: flex; flex-direction: column; gap: 1.5rem; } .feature-item { display: flex; align-items: center; gap: 1rem; } .feature-icon { width: 40px; height: 40px; background-color: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); flex-shrink: 0; } .feature-icon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; } .feature-item span { color: #D1D5DB; font-weight: 500; } .feature-item strong { color: var(--white); font-weight: 600; } .info-divider { border: none; border-top: 1px solid #374151; margin: 2rem 0; } .info-subtitle { color: #9CA3AF; font-size: 0.9rem; font-weight: 500; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; } .info-footer { margin-top: auto; font-size: 0.8rem; color: #4B5563; } .booking-panel { width: 60%; padding: 3.5rem; overflow-y: auto; position: relative; } .api-status { padding: 0.875rem 1.25rem; border-radius: 10px; margin-bottom: 1.25rem; font-weight: 500; display: none; font-size: 1rem; } .api-status.loading { display: block; background-color: #EFF6FF; color: #3B82F6; } .api-status.error { display: block; background-color: var(--danger-bg); color: var(--danger-text); } .step-indicator { display: flex; align-items: center; margin-bottom: 2.5rem; position: relative; } .indicator-line { position: absolute; height: 3px; background-color: var(--border-color); top: 20px; left: 20px; right: 20px; z-index: 0; } .indicator-item { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; flex: 1; position: relative; z-index: 1; } .indicator-item span { width: 40px; height: 40px; border-radius: 50%; background-color: var(--white); border: 3px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--text-light); transition: all 0.3s ease; font-size: 1rem; } .indicator-item span svg { width: 20px; height: 20px; stroke: var(--white); } .indicator-item p { font-size: 0.9rem; font-weight: 500; color: var(--text-light); } .indicator-item.active span { background-color: var(--primary-color); border-color: var(--primary-color); color: var(--white); } .indicator-item.active p { color: var(--text-dark); } .indicator-item.completed span { background-color: var(--success); border-color: var(--success); } .step-content { animation: fadeIn 0.5s ease; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .step-header { text-align: center; margin-bottom: 2.5rem; } .step-header h3 { font-size: 2rem; color: var(--text-dark); margin-bottom: 0.5rem; font-weight: 700; letter-spacing: -0.01em; } .step-header p { color: var(--text-light); font-size: 1.05rem; } .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 1rem; } .nav-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-light); border-radius: 8px; width: 36px; height: 36px; cursor: pointer; transition: all 0.2s; } .nav-btn:hover { background-color: var(--light-bg); border-color: var(--primary-color); color: var(--primary-color); } .current-month { font-weight: 600; } .calendar-weekdays, .calendar-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; padding: 0 1rem; } .calendar-weekdays div { text-align: center; font-size: 0.8rem; color: var(--text-light); } .calendar-days { margin-top: 0.5rem; } .calendar-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease; font-weight: 600; font-size: 0.9rem; position: relative; } .calendar-day.available:hover { background-color: #EFF6FF; border-color: var(--primary-color); transform: scale(1.1); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2); } .calendar-day.selected { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: scale(1.05); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); } .calendar-day.unavailable { color: #D1D5DB; cursor: not-allowed; position: relative; } .calendar-day.unavailable::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; border: 2px solid var(--white); } .calendar-day.blocked { background-color: var(--danger-bg); color: var(--danger-text); cursor: not-allowed; position: relative; font-weight: 400; } .calendar-day.blocked::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; border: 2px solid var(--white); } .calendar-day.blocked:hover { background-color: var(--danger-bg); } .time-selection-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; } .time-selection-header h4 { font-size: 1rem; font-weight: 600; color: var(--text-dark); } .slots-container { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; max-height: 280px; overflow-y: auto; padding: 0 0.5rem 0.5rem 0; } .slot-btn { width: 100%; padding: 0.875rem 1rem; background-color: var(--white); border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; } .slot-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s; } .slot-btn:hover { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); } .slot-btn:hover::before { left: 100%; } .slot-btn:active { transform: translateY(0); } .slot-btn.selected { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: scale(1.05); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); } .placeholder-msg { grid-column: 1/-1; text-align: center; padding: 2rem; background-color: var(--light-bg); border-radius: 8px; color: var(--text-light); } .selected-slot-summary { background-color: var(--light-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; font-weight: 500; border: 1px solid var(--border-color); } .form-group { margin-bottom: 1rem; } .form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; letter-spacing: 0.025em; text-transform: uppercase; } .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 1rem 1.25rem; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 1rem; background-color: #FFFFFF; color: #1F2937; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); } .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15); transform: translateY(-1px); } .form-group input:hover, .form-group textarea:hover, .form-group select:hover { border-color: #3B82F6; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1); } .form-group select { appearance: none; background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e\"); background-position: right 1rem center; background-repeat: no-repeat; background-size: 1.5rem; padding-right: 3rem; cursor: pointer; } .form-group input::placeholder, .form-group textarea::placeholder { color: #9CA3AF; font-weight: 400; } .form-group textarea { resize: vertical; min-height: 120px; line-height: 1.6; } .checkbox-group { display: flex; flex-direction: column; gap: 0.5rem; } .checkbox-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; padding: 0.25rem 0; } .checkbox-item input[type=\"checkbox\"] { margin: 0; } .form-actions { display: flex; gap: 1.5rem; margin-top: 2.5rem; justify-content: center; align-items: center; flex-wrap: wrap; } .btn-primary, .btn-secondary, .q-next, .q-back, .q-submit { min-width: 180px; border: none; padding: 1.375rem 2.75rem; border-radius: 16px; font-size: 1.125rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.025em; text-transform: uppercase; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); text-align: center; position: relative; overflow: hidden; } .btn-primary, .q-next, .q-submit { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; border: 2px solid transparent; } .btn-primary:hover, .q-next:hover, .q-submit:hover { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); transform: translateY(-3px); box-shadow: 0 12px 28px rgba(59, 130, 246, 0.35); scale: 1.02; } .btn-primary:active, .q-next:active, .q-submit:active { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25); } .btn-secondary, .q-back { background-color: #FFFFFF; color: #374151; border: 2px solid #E5E7EB; } .btn-secondary.btn-small { min-width: auto; padding: 0.875rem 1.75rem; font-size: 0.95rem; } .btn-secondary:hover, .q-back:hover { background-color: #F9FAFB; border-color: #3B82F6; color: #3B82F6; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2); } .btn-primary:disabled, .btn-secondary:disabled, .q-next:disabled, .q-back:disabled, .q-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); } #coachQuestionnaireForm .q-step { display: none; } #coachQuestionnaireForm .q-step.active { display: block; animation: fadeIn 0.5s; } #coachQuestionnaireForm .q-step h5 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); } .questionnaire-progress { margin-bottom: 2rem; } .progress-bar { width: 100%; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden; } .progress-bar-inner { height: 100%; width: 0; background-color: var(--primary-color); transition: width 0.3s ease; } #qProgressText { text-align: right; display: block; font-size: 0.8rem; color: var(--text-light); margin-top: 0.5rem; } .range-value { display: block; text-align: center; font-weight: 600; color: var(--primary-color); margin-top: 0.5rem; } .success-container { text-align: center; padding-top: 2rem; } .success-icon { width: 80px; height: 80px; background-color: #D1FAE5; color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; } .success-icon svg { width: 40px; height: 40px; } .success-details { background-color: var(--light-bg); padding: 1.75rem; border-radius: 14px; margin: 1.75rem 0; text-align: left; font-size: 1.05rem; } .confirmation-note { margin-top: 1.5rem; padding: 1.25rem 1.5rem; background-color: #ECFDF5; border-left: 4px solid var(--success); border-radius: 10px; color: var(--text-dark); font-size: 1rem; line-height: 1.6; } .confirmation-note strong { color: var(--success); font-weight: 600; } .step-header-pro { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--light-bg); } .step-header-pro h5 { font-size: 1.4rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.5rem; } .step-header-pro p { color: var(--text-light); font-size: 0.95rem; } .form-section { display: flex; flex-direction: column; gap: 1.5rem; } .form-field-group { position: relative; } .field-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 600; color: var(--text-dark); margin-bottom: 0.75rem; } .field-icon { width: 18px; height: 18px; stroke: var(--primary-color); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; } .select-wrapper { position: relative; } .select-wrapper select { width: 100%; padding: 0.875rem 3rem 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.95rem; background-color: var(--white); color: var(--text-dark); transition: all 0.3s ease; appearance: none; cursor: pointer; } .select-wrapper select:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } .select-wrapper select:hover { border-color: var(--primary-color); } .select-arrow { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; stroke: var(--text-light); fill: none; stroke-width: 2; pointer-events: none; transition: all 0.3s ease; } .select-wrapper:hover .select-arrow { stroke: var(--primary-color); } .textarea-wrapper textarea { width: 100%; padding: 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.95rem; background-color: var(--white); color: var(--text-dark); transition: all 0.3s ease; resize: vertical; min-height: 100px; font-family: inherit; } .textarea-wrapper textarea:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } .textarea-wrapper textarea:hover { border-color: var(--primary-color); } .checkbox-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; margin-top: 0.5rem; } .checkbox-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; background-color: var(--white); } .checkbox-card:hover { border-color: var(--primary-color); background-color: rgba(59, 130, 246, 0.02); } .checkbox-card input[type=\"checkbox\"] { display: none; } .checkmark { width: 20px; height: 20px; border: 2px solid var(--border-color); border-radius: 4px; position: relative; transition: all 0.3s ease; flex-shrink: 0; } .checkbox-card input[type=\"checkbox\"]:checked + .checkmark { background-color: var(--primary-color); border-color: var(--primary-color); } .checkbox-card input[type=\"checkbox\"]:checked + .checkmark::after { content: ''; position: absolute; left: 6px; top: 2px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); } .checkbox-text { font-size: 0.9rem; color: var(--text-dark); font-weight: 500; } .checkbox-card input[type=\"checkbox\"]:checked ~ .checkbox-text { color: var(--primary-color); font-weight: 600; } .range-wrapper { position: relative; margin-top: 0.5rem; } .range-wrapper input[type=\"range\"] { width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; outline: none; appearance: none; cursor: pointer; } .range-wrapper input[type=\"range\"]::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: var(--primary-color); border-radius: 50%; cursor: pointer; } .range-wrapper input[type=\"range\"]::-moz-range-thumb { width: 20px; height: 20px; background: var(--primary-color); border-radius: 50%; cursor: pointer; border: none; } .range-display { text-align: center; margin-top: 0.5rem; } .range-value { display: inline-block; background: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; } @media (max-width: 768px) { .checkbox-grid { grid-template-columns: 1fr; } .field-label { font-size: 0.85rem; } .select-wrapper select, .textarea-wrapper textarea { font-size: 0.9rem; padding: 0.75rem 2.5rem 0.75rem 0.875rem; } .form-actions { gap: 0.75rem; flex-direction: column; } .btn-primary, .btn-secondary, .q-next, .q-back, .q-submit { width: 100%; min-width: auto; } } @media (max-width: 900px) { .pro-booking-container { flex-direction: column; height: auto; max-height: none; } .info-panel, .booking-panel { width: 100%; } .booking-panel { padding: 1.5rem; } }rem; } .pro-booking-container { display: flex; width: 100%; max-width: 1100px; height: 90vh; max-height: 750px; background-color: var(--white); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; } .info-panel { width: 40%; background-color: var(--dark-bg); background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0); background-size: 20px 20px; color: var(--white); padding: 2.5rem; display: flex; flex-direction: column; } .info-content h2 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2; } .info-content > p { color: #9CA3AF; line-height: 1.6; margin-bottom: 2.5rem; } .info-features { display: flex; flex-direction: column; gap: 1.5rem; } .feature-item { display: flex; align-items: center; gap: 1rem; } .feature-icon { width: 40px; height: 40px; background-color: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); flex-shrink: 0; } .feature-icon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; } .feature-item span { color: #D1D5DB; font-weight: 500; } .feature-item strong { color: var(--white); font-weight: 600; } .info-divider { border: none; border-top: 1px solid #374151; margin: 2rem 0; } .info-subtitle { color: #9CA3AF; font-size: 0.9rem; font-weight: 500; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; } .info-footer { margin-top: auto; font-size: 0.8rem; color: #4B5563; } .booking-panel { width: 60%; padding: 2.5rem; overflow-y: auto; position: relative; } .api-status { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; display: none; } .api-status.loading { display: block; background-color: #EFF6FF; color: #3B82F6; } .api-status.error { display: block; background-color: var(--danger-bg); color: var(--danger-text); } .step-indicator { display: flex; align-items: center; margin-bottom: 2rem; position: relative; } .indicator-line { position: absolute; height: 2px; background-color: var(--border-color); top: 16px; left: 16px; right: 16px; z-index: 0; } .indicator-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex: 1; position: relative; z-index: 1; } .indicator-item span { width: 32px; height: 32px; border-radius: 50%; background-color: var(--white); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--text-light); transition: all 0.3s ease; } .indicator-item span svg { width: 18px; height: 18px; stroke: var(--white); } .indicator-item p { font-size: 0.8rem; font-weight: 500; color: var(--text-light); } .indicator-item.active span { background-color: var(--primary-color); border-color: var(--primary-color); color: var(--white); } .indicator-item.active p { color: var(--text-dark); } .indicator-item.completed span { background-color: var(--success); border-color: var(--success); } .step-content { animation: fadeIn 0.5s ease; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .step-header { text-align: center; margin-bottom: 2rem; } .step-header h3 { font-size: 1.5rem; color: var(--text-dark); margin-bottom: 0.25rem; } .step-header p { color: var(--text-light); } .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 1rem; } .nav-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-light); border-radius: 8px; width: 36px; height: 36px; cursor: pointer; transition: all 0.2s; } .nav-btn:hover { background-color: var(--light-bg); border-color: var(--primary-color); color: var(--primary-color); } .current-month { font-weight: 600; } .calendar-weekdays, .calendar-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; padding: 0 1rem; } .calendar-weekdays div { text-align: center; font-size: 0.8rem; color: var(--text-light); } .calendar-days { margin-top: 0.5rem; } .calendar-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease; font-weight: 600; font-size: 0.9rem; position: relative; } .calendar-day.available:hover { background-color: #EFF6FF; border-color: var(--primary-color); transform: scale(1.1); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2); } .calendar-day.selected { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: scale(1.05); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); } .calendar-day.unavailable { color: #D1D5DB; cursor: not-allowed; position: relative; } .calendar-day.unavailable::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; border: 2px solid var(--white); } .calendar-day.blocked { background-color: var(--danger-bg); color: var(--danger-text); cursor: not-allowed; position: relative; font-weight: 400; } .calendar-day.blocked::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; border: 2px solid var(--white); } .calendar-day.blocked:hover { background-color: var(--danger-bg); } .time-selection-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; } .time-selection-header h4 { font-size: 1rem; font-weight: 600; color: var(--text-dark); } .slots-container { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; max-height: 280px; overflow-y: auto; padding: 0 0.5rem 0.5rem 0; } .slot-btn { width: 100%; padding: 0.875rem 1rem; background-color: var(--white); border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; } .slot-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s; } .slot-btn:hover { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); } .slot-btn:hover::before { left: 100%; } .slot-btn:active { transform: translateY(0); } .slot-btn.selected { background-color: var(--primary-color); color: var(--white); border-color: var(--primary-color); transform: scale(1.05); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); } .placeholder-msg { grid-column: 1/-1; text-align: center; padding: 2rem; background-color: var(--light-bg); border-radius: 8px; color: var(--text-light); } .selected-slot-summary { background-color: var(--light-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; font-weight: 500; border: 1px solid var(--border-color); } .form-group { margin-bottom: 1rem; } .form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; letter-spacing: 0.025em; text-transform: uppercase; } .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 1rem 1.25rem; border: 2px solid #E5E7EB; border-radius: 12px; font-size: 1rem; background-color: #FFFFFF; color: #1F2937; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); } .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15); transform: translateY(-1px); } .form-group input:hover, .form-group textarea:hover, .form-group select:hover { border-color: #3B82F6; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1); } .form-group select { appearance: none; background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3e%3c/svg%3e\"); background-position: right 1rem center; background-repeat: no-repeat; background-size: 1.5rem; padding-right: 3rem; cursor: pointer; } .form-group input::placeholder, .form-group textarea::placeholder { color: #9CA3AF; font-weight: 400; } .form-group textarea { resize: vertical; min-height: 120px; line-height: 1.6; } .checkbox-group { display: flex; flex-direction: column; gap: 0.5rem; } .checkbox-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; padding: 0.25rem 0; } .checkbox-item input[type=\"checkbox\"] { margin: 0; } .form-actions { display: flex; gap: 1.25rem; margin-top: 2rem; justify-content: center; align-items: center; flex-wrap: wrap; } .btn-primary, .btn-secondary, .q-next, .q-back, .q-submit { min-width: 140px; border: none; padding: 1.125rem 2.25rem; border-radius: 14px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.025em; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); text-align: center; position: relative; overflow: hidden; } .btn-primary, .q-next, .q-submit { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; border: 2px solid transparent; } .btn-primary:hover, .q-next:hover, .q-submit:hover { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); transform: translateY(-3px); box-shadow: 0 12px 28px rgba(59, 130, 246, 0.35); scale: 1.02; } .btn-primary:active, .q-next:active, .q-submit:active { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25); } .btn-secondary, .q-back { background-color: #FFFFFF; color: #374151; border: 2px solid #E5E7EB; } .btn-secondary.btn-small { min-width: auto; padding: 0.875rem 1.75rem; font-size: 0.95rem; } .btn-secondary:hover, .q-back:hover { background-color: #F9FAFB; border-color: #3B82F6; color: #3B82F6; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2); } .btn-primary:disabled, .btn-secondary:disabled, .q-next:disabled, .q-back:disabled, .q-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); } #coachQuestionnaireForm .q-step { display: none; } #coachQuestionnaireForm .q-step.active { display: block; animation: fadeIn 0.5s; } #coachQuestionnaireForm .q-step h5 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); } .questionnaire-progress { margin-bottom: 2rem; } .progress-bar { width: 100%; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden; } .progress-bar-inner { height: 100%; width: 0; background-color: var(--primary-color); transition: width 0.3s ease; } #qProgressText { text-align: right; display: block; font-size: 0.8rem; color: var(--text-light); margin-top: 0.5rem; } .range-value { display: block; text-align: center; font-weight: 600; color: var(--primary-color); margin-top: 0.5rem; } .success-container { text-align: center; padding-top: 2rem; } .success-icon { width: 64px; height: 64px; background-color: #D1FAE5; color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; } .success-icon svg { width: 32px; height: 32px; } .success-details { background-color: var(--light-bg); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; text-align: left; } .step-header-pro { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--light-bg); } .step-header-pro h5 { font-size: 1.4rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.5rem; } .step-header-pro p { color: var(--text-light); font-size: 0.95rem; } .form-section { display: flex; flex-direction: column; gap: 1.5rem; } .form-field-group { position: relative; } .field-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 600; color: var(--text-dark); margin-bottom: 0.75rem; } .field-icon { width: 18px; height: 18px; stroke: var(--primary-color); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; } .select-wrapper { position: relative; } .select-wrapper select { width: 100%; padding: 0.875rem 3rem 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.95rem; background-color: var(--white); color: var(--text-dark); transition: all 0.3s ease; appearance: none; cursor: pointer; } .select-wrapper select:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } .select-wrapper select:hover { border-color: var(--primary-color); } .select-arrow { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; stroke: var(--text-light); fill: none; stroke-width: 2; pointer-events: none; transition: all 0.3s ease; } .select-wrapper:hover .select-arrow { stroke: var(--primary-color); } .textarea-wrapper textarea { width: 100%; padding: 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; font-size: 0.95rem; background-color: var(--white); color: var(--text-dark); transition: all 0.3s ease; resize: vertical; min-height: 100px; font-family: inherit; } .textarea-wrapper textarea:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } .textarea-wrapper textarea:hover { border-color: var(--primary-color); } .checkbox-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; margin-top: 0.5rem; } .checkbox-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; background-color: var(--white); } .checkbox-card:hover { border-color: var(--primary-color); background-color: rgba(59, 130, 246, 0.02); } .checkbox-card input[type=\"checkbox\"] { display: none; } .checkmark { width: 20px; height: 20px; border: 2px solid var(--border-color); border-radius: 4px; position: relative; transition: all 0.3s ease; flex-shrink: 0; } .checkbox-card input[type=\"checkbox\"]:checked + .checkmark { background-color: var(--primary-color); border-color: var(--primary-color); } .checkbox-card input[type=\"checkbox\"]:checked + .checkmark::after { content: ''; position: absolute; left: 6px; top: 2px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); } .checkbox-text { font-size: 0.9rem; color: var(--text-dark); font-weight: 500; } .checkbox-card input[type=\"checkbox\"]:checked ~ .checkbox-text { color: var(--primary-color); font-weight: 600; } .range-wrapper { position: relative; margin-top: 0.5rem; } .range-wrapper input[type=\"range\"] { width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; outline: none; appearance: none; cursor: pointer; } .range-wrapper input[type=\"range\"]::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: var(--primary-color); border-radius: 50%; cursor: pointer; } .range-wrapper input[type=\"range\"]::-moz-range-thumb { width: 20px; height: 20px; background: var(--primary-color); border-radius: 50%; cursor: pointer; border: none; } .range-display { text-align: center; margin-top: 0.5rem; } .range-value { display: inline-block; background: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; } @media (max-width: 768px) { .checkbox-grid { grid-template-columns: 1fr; } .field-label { font-size: 0.85rem; } .select-wrapper select, .textarea-wrapper textarea { font-size: 0.9rem; padding: 0.75rem 2.5rem 0.75rem 0.875rem; } .form-actions { gap: 0.75rem; flex-direction: column; } .btn-primary, .btn-secondary, .q-next, .q-back, .q-submit { width: 100%; min-width: auto; } } @media (max-width: 900px) { .pro-booking-container { flex-direction: column; height: auto; max-height: none; } .info-panel, .booking-panel { width: 100%; } .booking-panel { padding: 1.5rem; } }",
        "js": "(function() { 'use strict'; console.log('🚀 COACH APPOINTMENT V8 STARTING...'); var qStep = 1; window.appointmentState = { currentStep: 1, currentDate: new Date(), selectedDate: null, selectedSlot: null, coachAvailability: null, appointmentDetails: null, coachId: null, blockedDates: new Set() }; var getBaseUrl = function() { var hostname = window.location.hostname; var port = window.location.port; var isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost') || hostname.includes('127.0.0.1'); var isDevPort = port === '5000' || port === '3000' || port === '5173' || port === '8080' || port === ''; var isProduction = window.location.origin.includes('funnelseye.com') && !isLocalhost; var isDev = isLocalhost || isDevPort || !isProduction; var apiUrl = isDev ? 'http://localhost:8080' : 'https://api.funnelseye.com'; console.log('🔍 API URL Detection:', { hostname: hostname, port: port, origin: window.location.origin, isLocalhost: isLocalhost, isDevPort: isDevPort, isProduction: isProduction, isDev: isDev, apiUrl: apiUrl }); return apiUrl; }; var BASE_URL = getBaseUrl(); var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; function safeGetElementById(id) { return document.getElementById(id); } function init() { window.appointmentState.coachId = localStorage.getItem('coachId') || null; var leadId = localStorage.getItem('leadId'); console.log('📋 INIT - CoachID:', window.appointmentState.coachId); console.log('📋 INIT - LeadID:', leadId); var leadIdInput = safeGetElementById('leadId'); if (leadIdInput) { leadIdInput.value = leadId || ''; } setupEventListeners(); fetchCoachAvailability(); renderCalendar(); updateStepUI(); showDateView(); } function setupEventListeners() { var prevMonth = safeGetElementById('prevMonth'); if (prevMonth) prevMonth.addEventListener('click', function() { changeMonth(-1); }); var nextMonth = safeGetElementById('nextMonth'); if (nextMonth) nextMonth.addEventListener('click', function() { changeMonth(1); }); var backToStep1 = safeGetElementById('backToStep1'); if (backToStep1) backToStep1.addEventListener('click', function() { navigateToStep(1); }); var backToCalendarBtn = safeGetElementById('backToCalendarBtn'); if (backToCalendarBtn) backToCalendarBtn.addEventListener('click', showDateView); var bookNowBtn = safeGetElementById('bookNowBtn'); if (bookNowBtn) bookNowBtn.addEventListener('click', function() { navigateToStep(3); }); var nextFromTimeSelection = safeGetElementById('nextFromTimeSelection'); if (nextFromTimeSelection) nextFromTimeSelection.addEventListener('click', function() { if (window.appointmentState.selectedSlot) { navigateToStep(2); } }); var bookAnotherBtn = safeGetElementById('bookAnotherBtn'); if (bookAnotherBtn) bookAnotherBtn.addEventListener('click', resetForm); var qForm = safeGetElementById('coachQuestionnaireForm'); if (qForm) { var qNext = qForm.querySelector('.q-next'); if (qNext) qNext.addEventListener('click', function() { navigateQuestionnaire(1); }); var qBack = qForm.querySelector('.q-back'); if (qBack) qBack.addEventListener('click', function() { navigateQuestionnaire(-1); }); qForm.addEventListener('submit', submitQuestionnaire); } var vslWatchPercentage = safeGetElementById('vslWatchPercentage'); if (vslWatchPercentage) vslWatchPercentage.addEventListener('input', function(e) { var valueDisplay = safeGetElementById('vslWatchValue'); if (valueDisplay) valueDisplay.textContent = e.target.value + '%'; }); } function showDateView() { safeGetElementById('dateSelectionView').style.display = 'block'; safeGetElementById('timeSelectionView').style.display = 'none'; } function showTimeView() { safeGetElementById('dateSelectionView').style.display = 'none'; safeGetElementById('timeSelectionView').style.display = 'block'; } function navigateToStep(step) { document.querySelectorAll('.step-content').forEach(function(el) { el.style.display = 'none'; el.style.setProperty('display', 'none', 'important'); }); var stepEl = safeGetElementById('step' + step); if (stepEl) { stepEl.style.setProperty('display', 'block', 'important'); } window.appointmentState.currentStep = step; updateStepUI(); } function updateStepUI() { var indicators = document.querySelectorAll('.indicator-item'); indicators.forEach(function(item) { var step = parseInt(item.getAttribute('data-step')); if (step < window.appointmentState.currentStep) { item.classList.add('completed'); item.classList.remove('active'); } else if (step === window.appointmentState.currentStep) { item.classList.add('active'); item.classList.remove('completed'); } else { item.classList.remove('active', 'completed'); } }); } function changeMonth(direction) { window.appointmentState.currentDate.setMonth(window.appointmentState.currentDate.getMonth() + direction); renderCalendar(); } function renderCalendar() { var state = window.appointmentState; var year = state.currentDate.getFullYear(); var month = state.currentDate.getMonth(); safeGetElementById('currentMonth').textContent = MONTHS[month] + ' ' + year; var calendarDays = safeGetElementById('calendarDays'); calendarDays.innerHTML = ''; var firstDay = new Date(year, month, 1).getDay(); var daysInMonth = new Date(year, month + 1, 0).getDate(); for (var i = 0; i < firstDay; i++) { calendarDays.insertAdjacentHTML('beforeend', '<div></div>'); } var today = new Date(); today.setHours(0, 0, 0, 0); for (var day = 1; day <= daysInMonth; day++) { (function(day) { var date = new Date(year, month, day); var dateKey = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(); var dayEl = document.createElement('div'); dayEl.className = 'calendar-day'; dayEl.textContent = day; if (state.blockedDates.has(dateKey)) { dayEl.classList.add('blocked'); } else if (date < today) { dayEl.classList.add('unavailable'); } else { dayEl.classList.add('available'); dayEl.onclick = function() { selectDate(date); }; } if (state.selectedDate && date.toDateString() === state.selectedDate.toDateString()) { dayEl.classList.add('selected'); } calendarDays.appendChild(dayEl); })(day); } } function selectDate(date) { window.appointmentState.selectedDate = date; safeGetElementById('selectedDateDisplay').textContent = 'Available times for ' + date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); renderCalendar(); fetchAvailableSlots(date); } function updateInfoPanel(data) { safeGetElementById('infoDuration').textContent = data.defaultAppointmentDuration || '--'; safeGetElementById('infoBuffer').textContent = data.bufferTime || '--'; safeGetElementById('infoTimezone').textContent = data.timeZone || 'Not Set'; } function fetchCoachAvailability() { console.log('📡 API CALL 1: Fetching coach availability...'); showApiStatus('loading', 'Fetching coach availability...'); var apiUrl = BASE_URL + '/api/coach/' + window.appointmentState.coachId + '/availability'; console.log('  └─ URL:', apiUrl); fetch(apiUrl).then(function(response) { console.log('📥 API 1 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 1 SUCCESS - Response Data:', JSON.stringify(result, null, 2)); if (result.success && result.data) { window.appointmentState.coachAvailability = result.data; updateInfoPanel(result.data); window.appointmentState.blockedDates.clear(); if (result.data.unavailableSlots && Array.isArray(result.data.unavailableSlots)) { result.data.unavailableSlots.forEach(function(slot) { var current = new Date(slot.start); var end = new Date(slot.end); while (current <= end) { var key = current.getFullYear() + '-' + current.getMonth() + '-' + current.getDate(); window.appointmentState.blockedDates.add(key); current.setDate(current.getDate() + 1); } }); console.log('  └─ Blocked dates loaded:', window.appointmentState.blockedDates.size); } renderCalendar(); hideApiStatus(); } else { throw new Error('Invalid availability data'); } }).catch(function(error) { console.error('❌ API 1 ERROR:', error); handleApiError(error); }); } function fetchAvailableSlots(date) { console.log('📡 API CALL 2: Fetching available slots...'); showApiStatus('loading', 'Fetching slots...'); showTimeView(); var timezone = (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata'; var year = date.getFullYear(); var month = String(date.getMonth() + 1).padStart(2, '0'); var day = String(date.getDate()).padStart(2, '0'); var dateStringForAPI = year + '-' + month + '-' + day; var dateISO = dateStringForAPI + 'T00:00:00.000Z'; var apiUrl = BASE_URL + '/api/coach/' + window.appointmentState.coachId + '/available-slots?date=' + dateISO + '&timeZone=' + encodeURIComponent(timezone); console.log('  └─ URL:', apiUrl); console.log('  └─ Date:', dateISO); console.log('  └─ TimeZone:', timezone); fetch(apiUrl).then(function(response) { console.log('📥 API 2 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 2 SUCCESS - Response Data:', JSON.stringify(result, null, 2)); var slots = result.success ? result.slots : []; console.log('  └─ Slots found:', slots.length); displayAvailableSlots(slots, timezone); hideApiStatus(); }).catch(function(err) { console.error('❌ API 2 ERROR:', err); handleApiError(err); displayAvailableSlots([], timezone); }); } function displayAvailableSlots(slots, timezone) { var container = safeGetElementById('slotsContainer'); if (slots.length === 0) { container.innerHTML = '<div class=\"placeholder-msg\">No slots available for this day.</div>'; return; } var slotsHtml = ''; for (var i = 0; i < slots.length; i++) { var slot = slots[i]; var timeString = new Date(slot.startTime).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true }); slotsHtml += '<button class=\"slot-btn\" data-starttime=\"' + slot.startTime + '\">' + timeString + '</button>'; } container.innerHTML = slotsHtml; container.querySelectorAll('.slot-btn').forEach(function(btn) { btn.addEventListener('click', selectSlot); }); } function selectSlot(e) { window.appointmentState.selectedSlot = { startTime: e.target.getAttribute('data-starttime'), duration: window.appointmentState.coachAvailability.defaultAppointmentDuration || 30 }; console.log('🎯 Slot Selected:', window.appointmentState.selectedSlot); var timezone = (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata'; var summary = safeGetElementById('selectedSlotSummary'); if (summary) { var dateString = new Date(window.appointmentState.selectedSlot.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); var timeString = new Date(window.appointmentState.selectedSlot.startTime).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true }); summary.innerHTML = 'You\\'ve selected: <strong>' + dateString + '</strong> at <strong>' + timeString + '</strong>'; } var nextBtn = safeGetElementById('nextFromTimeSelection'); if (nextBtn) nextBtn.style.display = 'block'; document.querySelectorAll('.slot-btn').forEach(function(btn) { btn.classList.remove('selected'); }); e.target.classList.add('selected'); } function bookAppointment() { var leadIdInput = safeGetElementById('leadId'); if (!leadIdInput || !leadIdInput.value.trim()) { showApiStatus('error', 'Lead ID is missing. Please contact support or try again.'); return; } console.log('📡 API CALL 3: Booking appointment...'); showApiStatus('loading', 'Confirming your booking...'); var payload = { leadId: leadIdInput.value.trim(), startTime: window.appointmentState.selectedSlot.startTime, duration: window.appointmentState.selectedSlot.duration, notes: safeGetElementById('notes').value.trim(), timeZone: (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata' }; var apiUrl = BASE_URL + '/api/coach/' + window.appointmentState.coachId + '/book'; console.log('  └─ URL:', apiUrl); console.log('  └─ Payload:', JSON.stringify(payload, null, 2)); fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(function(response) { console.log('📥 API 3 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 3 SUCCESS - Booking Response:', JSON.stringify(result, null, 2)); if (result.success) { window.appointmentState.appointmentDetails = result.appointmentDetails || result.data; localStorage.setItem('leadId', leadIdInput.value.trim()); var coachTimeZone = (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata'; function formatDateInTimezone(dateString, timezone) { return new Date(dateString).toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long', month: 'long', day: 'numeric' }); } function formatTimeInTimezone(dateString, timezone) { return new Date(dateString).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true }); } var appointmentDetails = window.appointmentState.appointmentDetails; localStorage.setItem('appointmentDetails', JSON.stringify({ appointmentId: appointmentDetails._id || appointmentDetails.id || 'APPT-' + Date.now(), coachId: window.appointmentState.coachId, leadId: leadIdInput.value.trim(), date: formatDateInTimezone(appointmentDetails.startTime, coachTimeZone), time: formatTimeInTimezone(appointmentDetails.startTime, coachTimeZone), duration: appointmentDetails.duration, timezone: coachTimeZone, status: 'Confirmed', notes: appointmentDetails.notes || '', bookedAt: new Date().toISOString() })); console.log('💾 Appointment details saved to localStorage'); updateLeadStatus(leadIdInput.value.trim(), 'Appointment'); hideApiStatus(); displaySuccess(); navigateToStep(4); } else { throw new Error(result.message || 'Booking failed.'); } }).catch(function(error) { console.error('❌ API 3 ERROR:', error); handleApiError(error); }); } function navigateQuestionnaire(direction) { var steps = document.querySelectorAll('.q-step'); var newStep = qStep + direction; if (newStep > 0 && newStep <= steps.length) { qStep = newStep; steps.forEach(function(s) { s.classList.remove('active'); }); document.querySelector('.q-step[data-qstep=\"' + qStep + '\"]').classList.add('active'); updateQuestionnaireUI(steps.length); } } function updateQuestionnaireUI(totalSteps) { var qForm = safeGetElementById('coachQuestionnaireForm'); var backBtn = qForm.querySelector('.q-back'); var nextBtn = qForm.querySelector('.q-next'); var submitBtn = qForm.querySelector('.q-submit'); if (backBtn) backBtn.style.display = qStep > 1 ? 'block' : 'none'; if (nextBtn) nextBtn.style.display = qStep < totalSteps ? 'block' : 'none'; if (submitBtn) submitBtn.style.display = qStep === totalSteps ? 'block' : 'none'; var progress = (qStep / totalSteps) * 100; safeGetElementById('qProgress').style.width = progress + '%'; safeGetElementById('qProgressText').textContent = 'Part ' + qStep + ' of ' + totalSteps; } function submitQuestionnaire(e) { e.preventDefault(); console.log('📡 API CALL 4: Submitting questionnaire...'); showApiStatus('loading', 'Submitting assessment...'); var leadId = localStorage.getItem('leadId'); if (!leadId) { showApiStatus('error', 'Lead ID is missing. Please contact support.'); return; } var formData = new FormData(e.target); var formObject = {}; formData.forEach(function(value, key){ if (formObject[key]) { if (Array.isArray(formObject[key])) { formObject[key].push(value); } else { formObject[key] = [formObject[key], value]; } } else { formObject[key] = value; } }); var vslWatchPercentage = parseFloat(formObject.vslWatchPercentage) || 0; var interestReasons = formObject.interestReasons || []; if (typeof interestReasons === 'string') { interestReasons = [interestReasons]; } var coachQuestions = { watchedVideo: formObject.watchedVideo, currentProfession: formObject.currentProfession, interestReasons: interestReasons, incomeGoal: formObject.incomeGoal, investmentCapacity: formObject.investmentCapacity, timeAvailability: formObject.timeAvailability, timelineToAchieveGoal: formObject.timelineToAchieveGoal, additionalInfo: formObject.additionalInfo || '' }; var questionnaireData = { leadId: leadId, questionResponses: { coachQuestions: coachQuestions, vslWatchPercentage: vslWatchPercentage }, appointmentData: { preferredTime: window.appointmentState.selectedSlot ? new Date(window.appointmentState.selectedSlot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '', preferredDate: window.appointmentState.selectedSlot ? new Date(window.appointmentState.selectedSlot.startTime).toLocaleDateString('en-US') : '', timezone: (window.appointmentState.coachAvailability && window.appointmentState.coachAvailability.timeZone) || 'Asia/Kolkata', notes: safeGetElementById('notes').value.trim() || '' } }; var apiUrl = BASE_URL + '/api/leads/question-responses'; console.log('  └─ URL:', apiUrl); console.log('  └─ Payload:', JSON.stringify(questionnaireData, null, 2)); fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(questionnaireData) }).then(function(response) { console.log('📥 API 4 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(result) { console.log('✅ API 4 SUCCESS - Questionnaire Response:', JSON.stringify(result, null, 2)); if (result.success) { hideApiStatus(); updateLeadStatus(leadId, 'Thank You Page'); bookAppointment(); } else { throw new Error(result.message || 'Submission failed.'); } }).catch(function(error) { console.error('❌ API 4 ERROR:', error); handleApiError(error); }); } function displaySuccess() { var detailsEl = safeGetElementById('successDetails'); var state = window.appointmentState; if (!state.appointmentDetails) { console.error('❌ No appointment details available'); return; } var timezone = (state.coachAvailability && state.coachAvailability.timeZone) || 'Asia/Kolkata'; var dateString = new Date(state.appointmentDetails.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone }); var timeString = new Date(state.appointmentDetails.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone }); if (detailsEl) { detailsEl.innerHTML = '<p><strong>Date:</strong> ' + dateString + '</p><p><strong>Time:</strong> ' + timeString + '</p>'; } console.log('✅ Success screen displayed'); console.log('⏳ Redirecting to thank-you page in 2 seconds...'); setTimeout(function() { var currentUrl = window.location.pathname; var newUrl = currentUrl.replace('/appointment-page', '/thankyou-page'); console.log('🔀 Redirecting to:', newUrl); window.location.href = newUrl; }, 2000); } function resetForm() { window.appointmentState.currentStep = 1; window.appointmentState.selectedDate = null; window.appointmentState.selectedSlot = null; window.appointmentState.appointmentDetails = null; qStep = 1; safeGetElementById('bookingDetailsForm').reset(); safeGetElementById('coachQuestionnaireForm').reset(); document.querySelectorAll('.q-step').forEach(function(s, i) { s.classList.toggle('active', i === 0); }); updateQuestionnaireUI(document.querySelectorAll('.q-step').length); renderCalendar(); showDateView(); navigateToStep(1); } function showApiStatus(type, message) { var el = safeGetElementById('apiStatus'); el.className = 'api-status ' + type; el.textContent = message; el.style.display = 'block'; } function hideApiStatus() { var el = safeGetElementById('apiStatus'); if (el) el.style.display = 'none'; } function handleResponse(response) { if (!response.ok) { return response.text().then(function(text) { throw new Error(text || 'Network response was not ok'); }); } return response.json(); } function handleApiError(error) { console.error('❌ API ERROR:', error); showApiStatus('error', error.message || 'An unexpected error occurred.'); } function updateLeadStatus(leadId, status) { console.log('📡 API CALL 5: Updating lead status to:', status); var apiUrl = BASE_URL + '/api/leads/' + leadId; console.log('  └─ URL:', apiUrl); console.log('  └─ Payload:', JSON.stringify({ status: status }, null, 2)); fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ status: status }) }).then(function(response) { console.log('📥 API 5 RESPONSE - Status:', response.status); return handleResponse(response); }).then(function(data) { console.log('✅ API 5 SUCCESS - Lead status updated:', JSON.stringify(data, null, 2)); }).catch(function(error) { console.error('❌ API 5 ERROR:', error); }); } if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); } console.log('✅ Coach Appointment V8 System Ready'); })();"
      },
    
      
      'quick_appointment': {
        name: 'Quick Appointment',
        description: 'Simple and fast appointment booking form with API integration.',
        thumbnail: 'https://placehold.co/400x300/10b981/ffffff?text=Quick+Booking',
        html: `
          <div class="quick-appointment">
            <div class="appointment-container">
              <div class="appointment-header">
                <h1>Book Your Appointment</h1>
                <p>Quick and easy scheduling in just a few clicks</p>
              </div>
              
              <div class="api-status" id="quickApiStatus" style="display: none;">
                <div class="status-message" id="quickStatusMessage"></div>
              </div>
              
              <form class="appointment-form" id="quickAppointmentForm">
                <div class="form-row">
                  <div class="form-group">
                    <label>Select Date</label>
                    <input type="date" id="quickAppointmentDate" required>
                  </div>
                  <div class="form-group">
                    <label>Select Time</label>
                    <select id="quickAppointmentTime" required>
                      <option value="">Choose time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="quickFullName" placeholder="Enter your full name" required>
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="quickEmail" placeholder="Enter your email" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Lead ID</label>
                  <input type="text" id="quickLeadId" placeholder="Enter your Lead ID" required>
                </div>
                
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" id="quickPhone" placeholder="Enter your phone number" required>
                </div>
                
                <div class="form-group">
                  <label>Service Type</label>
                  <select id="quickServiceType" required>
                    <option value="">Choose service</option>
                    <option value="consultation">Consultation</option>
                    <option value="strategy">Strategy Session</option>
                    <option value="analysis">Analysis</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Message (Optional)</label>
                  <textarea id="quickMessage" placeholder="Any specific requirements or questions?"></textarea>
                </div>
                
                <button type="submit" class="submit-button" id="quickSubmitBtn">
                  <span>Book Appointment</span>
                </button>
              </form>
              
              <div class="appointment-info">
                <div class="info-item">
                  <span class="info-icon">📅</span>
                  <span>Flexible rescheduling</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">✉️</span>
                  <span>Email confirmation</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🔔</span>
                  <span>SMS reminders</span>
                </div>
              </div>
    
              <div class="success-screen" id="quickSuccessScreen" style="display: none;">
                <div class="success-icon">✅</div>
                <h2>🎉 Appointment Booked Successfully!</h2>
                <div class="success-details" id="quickSuccessDetails"></div>
                <button class="book-another-btn" id="quickBookAnotherBtn">📅 Book Another Appointment</button>
              </div>
            </div>
          </div>
        `,
        css: `
          .quick-appointment {
            min-height: 100vh;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: 'Inter', sans-serif;
          }
          
          .appointment-container {
            background: white;
            border-radius: 20px;
            padding: 50px;
            max-width: 700px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
          }
          
          .appointment-header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .appointment-header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 15px;
          }
          
          .appointment-header p {
            font-size: 1.2rem;
            color: #64748b;
          }
    
          .api-status {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: none;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
          }
    
          .api-status.loading {
            background-color: #ebf8ff;
            color: #3182ce;
            border: 1px solid #bee3f8;
            display: flex;
          }
    
          .api-status.error {
            background-color: #fff5f5;
            color: #e53e3e;
            border: 1px solid #feb2b2;
            display: flex;
          }
    
          .api-status.success {
            background-color: #f0fff4;
            color: #38a169;
            border: 1px solid #c6f6d5;
            display: flex;
          }
          
          .appointment-form {
            margin-bottom: 40px;
          }
          
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #1e293b;
          }
          
          .form-group input,
          .form-group select,
          .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
          }
          
          .form-group input:focus,
          .form-group select:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #10b981;
          }
          
          .form-group textarea {
            resize: vertical;
            min-height: 100px;
          }
          
          .submit-button {
            width: 100%;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 18px;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          
          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          }
    
          .submit-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          
          .appointment-info {
            display: flex;
            justify-content: space-around;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #64748b;
            font-size: 0.95rem;
          }
          
          .info-icon {
            font-size: 1.2rem;
          }
    
          .success-screen {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 3rem;
            border-radius: 20px;
          }
    
          .success-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
          }
    
          .success-screen h2 {
            font-size: 2rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 2rem;
          }
    
          .success-details {
            background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
            border: 2px solid #c6f6d5;
            border-radius: 15px;
            padding: 2rem;
            text-align: left;
            margin-bottom: 2rem;
            width: 100%;
            max-width: 500px;
          }
    
          .success-details p {
            margin: 0.75rem 0;
            color: #2f855a;
            line-height: 1.6;
            font-size: 0.95rem;
          }
    
          .success-details p strong {
            color: #276749;
            font-weight: 600;
          }
    
          .book-another-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 1.125rem 2rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
    
          .book-another-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
          }
          
          @media (max-width: 768px) {
            .appointment-container {
              padding: 40px 20px;
            }
            
            .appointment-header h1 {
              font-size: 2rem;
            }
            
            .form-row {
              grid-template-columns: 1fr;
            }
            
            .appointment-info {
              flex-direction: column;
              gap: 15px;
              text-align: center;
            }
    
            .success-screen {
              padding: 2rem;
            }
    
            .success-screen h2 {
              font-size: 1.5rem;
            }
          }
        `,
        js: `
          (function() {
            console.log('🚀 Quick appointment system starting...');
            
            var quickCoachId = null;
            var QUICK_BASE_URL = 'https://api.funnelseye.com';
    
            function initializeQuickAppointment() {
              console.log('📅 Initializing quick appointment system...');
              
              quickCoachId = localStorage.getItem('coachId') || null;
              var storedLeadId = localStorage.getItem('leadId') || '';
              
              var leadIdInput = document.getElementById('quickLeadId');
              if (leadIdInput && storedLeadId) {
                leadIdInput.value = storedLeadId;
              }
              
              var dateInput = document.getElementById('quickAppointmentDate');
              if (dateInput) {
                var today = new Date().toISOString().split('T')[0];
                dateInput.min = today;
              }
              
              console.log('Quick Coach ID:', quickCoachId);
              
              var form = document.getElementById('quickAppointmentForm');
              var anotherBtn = document.getElementById('quickBookAnotherBtn');
              
              if (form) form.addEventListener('submit', handleQuickBooking);
              if (anotherBtn) anotherBtn.addEventListener('click', resetQuickForm);
            }
    
            function handleQuickBooking(e) {
              e.preventDefault();
              
              var submitBtn = document.getElementById('quickSubmitBtn');
              
              var appointmentDate = document.getElementById('quickAppointmentDate').value;
              var appointmentTime = document.getElementById('quickAppointmentTime').value;
              var leadId = document.getElementById('quickLeadId').value.trim();
              var fullName = document.getElementById('quickFullName').value.trim();
              var email = document.getElementById('quickEmail').value.trim();
              var phone = document.getElementById('quickPhone').value.trim();
              var serviceType = document.getElementById('quickServiceType').value;
              var message = document.getElementById('quickMessage').value.trim();
              
              if (!appointmentDate || !appointmentTime || !leadId || !fullName || !email || !phone || !serviceType) {
                showQuickStatus('error', 'Please fill in all required fields.');
                return;
              }
              
              if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>⏳ Booking...</span>';
              }
              showQuickStatus('loading', 'Booking your appointment...');
              
              var startDateTime = new Date(appointmentDate + 'T' + appointmentTime + ':00');
              var startTimeUTC = startDateTime.toISOString();
              
              var payload = {
                leadId: leadId,
                startTime: startTimeUTC,
                duration: 30,
                notes: message || serviceType + ' appointment for ' + fullName + '. Contact: ' + email + ', ' + phone,
                timeZone: "Asia/Kolkata",
                customerInfo: {
                  name: fullName,
                  email: email,
                  phone: phone,
                  serviceType: serviceType
                }
              };
    
              console.log('📝 Quick booking request:', payload);
              
              fetch(QUICK_BASE_URL + '/api/coach/' + quickCoachId + '/book', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
              })
              .then(function(response) {
                return response.json().then(function(result) {
                  return { response: response, result: result };
                });
              })
              .then(function(data) {
                console.log('📋 Quick booking response:', data.result);
                
                if (data.response.ok && data.result.success) {
                  var appointmentDetails = data.result.appointmentDetails || data.result.data || data.result;
                  showQuickBookingSuccess(appointmentDetails, {
                    name: fullName,
                    email: email,
                    phone: phone,
                    serviceType: serviceType
                  });
                  
                  localStorage.setItem('leadId', leadId);
                  
                } else {
                  throw new Error(data.result.message || data.result.error || 'Booking failed with status ' + data.response.status);
                }
              })
              .catch(function(error) {
                console.error('❌ Quick booking error:', error);
                showQuickStatus('error', error.message.indexOf('fetch') !== -1
                  ? 'Network error. Please check your connection and try again.' 
                  : error.message);
              })
              .finally(function() {
                if (submitBtn) {
                  submitBtn.disabled = false;
                  submitBtn.innerHTML = '<span>Book Appointment</span>';
                }
              });
            }
    
            function showQuickStatus(type, message) {
              var statusEl = document.getElementById('quickApiStatus');
              var messageEl = document.getElementById('quickStatusMessage');
              
              if (!statusEl || !messageEl) return;
              
              statusEl.className = 'api-status ' + type;
              
              var icon = '';
              if (type === 'loading') icon = '⏳ ';
              if (type === 'error') icon = '❌ ';
              if (type === 'success') icon = '✅ ';
              
              messageEl.innerHTML = icon + message;
              
              if (type !== 'loading') {
                setTimeout(function() {
                  statusEl.style.display = 'none';
                }, 5000);
              }
            }
    
            function showQuickBookingSuccess(appointmentDetails, customerInfo) {
              var successDetails = document.getElementById('quickSuccessDetails');
              var successScreen = document.getElementById('quickSuccessScreen');
              
              if (!successDetails || !successScreen) return;
              
              var successHtml = '';
              successHtml += '<p><strong>Appointment ID:</strong> ' + (appointmentDetails._id || appointmentDetails.id || 'Generated') + '</p>';
              successHtml += '<p><strong>Customer Name:</strong> ' + customerInfo.name + '</p>';
              successHtml += '<p><strong>Email:</strong> ' + customerInfo.email + '</p>';
              successHtml += '<p><strong>Phone:</strong> ' + customerInfo.phone + '</p>';
              successHtml += '<p><strong>Service:</strong> ' + customerInfo.serviceType + '</p>';
              successHtml += '<p><strong>Coach ID:</strong> ' + (appointmentDetails.coachId || quickCoachId) + '</p>';
              successHtml += '<p><strong>Lead ID:</strong> ' + appointmentDetails.leadId + '</p>';
              successHtml += '<p><strong>Date & Time:</strong> ' + new Date(appointmentDetails.startTime).toLocaleString() + '</p>';
              successHtml += '<p><strong>Duration:</strong> ' + appointmentDetails.duration + ' minutes</p>';
              successHtml += '<p><strong>Status:</strong> ✅ Confirmed</p>';
              if (appointmentDetails.notes) {
                successHtml += '<p><strong>Notes:</strong> ' + appointmentDetails.notes + '</p>';
              }
              
              successDetails.innerHTML = successHtml;
              successScreen.style.display = 'flex';
            }
    
            function resetQuickForm() {
              var successScreen = document.getElementById('quickSuccessScreen');
              var form = document.getElementById('quickAppointmentForm');
              var statusEl = document.getElementById('quickApiStatus');
              
              if (successScreen) successScreen.style.display = 'none';
              if (form) form.reset();
              if (statusEl) statusEl.style.display = 'none';
              
              var storedLeadId = localStorage.getItem('leadId') || '';
              var leadIdInput = document.getElementById('quickLeadId');
              if (leadIdInput && storedLeadId) {
                leadIdInput.value = storedLeadId;
              }
              
              var dateInput = document.getElementById('quickAppointmentDate');
              if (dateInput) {
                var today = new Date().toISOString().split('T')[0];
                dateInput.min = today;
              }
            }
    
            window.initializeQuickAppointment = initializeQuickAppointment;
            window.resetQuickForm = resetQuickForm;
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initializeQuickAppointment);
            } else {
              initializeQuickAppointment();
            }
            
            console.log('✅ Quick appointment system initialized');
          })();
        `
      },
    },
  paymentTemplates: {
    'modern_checkout': {
      name: 'Modern Checkout',
      description: 'Sleek and secure checkout page with order summary.',
      thumbnail: 'https://placehold.co/400x300/8b5cf6/ffffff?text=Modern+Checkout',
      html: `
        <div class="modern-checkout">
          <div class="checkout-container">
            <div class="checkout-header">
              <h1>Complete Your Order</h1>
              <p>Secure checkout with 256-bit SSL encryption</p>
            </div>
            
            <div class="checkout-grid">
              <div class="payment-section">
                <div class="section-header">
                  <h2>Payment Information</h2>
                  <div class="security-badge">
                    <span class="security-icon">🔒</span>
                    <span>Secure Payment</span>
                  </div>
                </div>
                
                <div class="payment-methods">
                  <div class="method-tabs">
                    <button class="method-tab active" data-method="card">
                      <span class="tab-icon">💳</span>
                      Card
                    </button>
                    <button class="method-tab" data-method="upi">
                      <span class="tab-icon">📱</span>
                      UPI
                    </button>
                    <button class="method-tab" data-method="wallet">
                      <span class="tab-icon">💰</span>
                      Wallet
                    </button>
                  </div>
                  
                  <div class="method-content active" id="card-method">
                    <form class="payment-form">
                      <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                        <div class="card-icons">
                          <span class="card-icon">💳</span>
                          <span class="card-icon">💳</span>
                          <span class="card-icon">💳</span>
                        </div>
                      </div>
                      
                      <div class="form-row">
                        <div class="form-group">
                          <label>Expiry Date</label>
                          <input type="text" placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="form-group">
                          <label>CVV</label>
                          <input type="text" placeholder="123" maxlength="3">
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" placeholder="John Doe">
                      </div>
                      
                      <div class="form-group">
                        <label>
                          <input type="checkbox" checked>
                          Save this card for future purchases
                        </label>
                      </div>
                    </form>
                  </div>
                  
                  <div class="method-content" id="upi-method">
                    <div class="upi-section">
                      <div class="form-group">
                        <label>UPI ID</label>
                        <input type="text" placeholder="yourname@upi">
                      </div>
                      <div class="qr-section">
                        <div class="qr-code">
                          <div class="qr-placeholder">QR Code</div>
                        </div>
                        <p>Scan QR code with any UPI app</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="method-content" id="wallet-method">
                    <div class="wallet-options">
                      <div class="wallet-option">
                        <span class="wallet-icon">💳</span>
                        <span>Paytm Wallet</span>
                        <span class="wallet-balance">₹5,000</span>
                      </div>
                      <div class="wallet-option">
                        <span class="wallet-icon">💰</span>
                        <span>Amazon Pay</span>
                        <span class="wallet-balance">₹2,500</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="billing-address">
                  <h3>Billing Address</h3>
                  <div class="form-row">
                    <div class="form-group">
                      <label>First Name</label>
                      <input type="text" placeholder="John">
                    </div>
                    <div class="form-group">
                      <label>Last Name</label>
                      <input type="text" placeholder="Doe">
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Address</label>
                    <input type="text" placeholder="123 Main Street">
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>City</label>
                      <input type="text" placeholder="Mumbai">
                    </div>
                    <div class="form-group">
                      <label>PIN Code</label>
                      <input type="text" placeholder="400001">
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="order-summary">
                <div class="summary-header">
                  <h2>Order Summary</h2>
                </div>
                
                <div class="order-items">
                  <div class="order-item">
                    <div class="item-image">
                      <img src="https://placehold.co/80x80/8b5cf6/ffffff?text=Product" alt="Product">
                    </div>
                    <div class="item-details">
                      <h4>Premium Business Course</h4>
                      <p>Digital Product</p>
                      <span class="item-quantity">Qty: 1</span>
                    </div>
                    <div class="item-price">₹2,500</div>
                  </div>
                  
                  <div class="order-item">
                    <div class="item-image">
                      <img src="https://placehold.co/80x80/10b981/ffffff?text=Bonus" alt="Bonus">
                    </div>
                    <div class="item-details">
                      <h4>Bonus Templates</h4>
                      <p>Free with purchase</p>
                      <span class="item-quantity">Qty: 1</span>
                    </div>
                    <div class="item-price">Free</div>
                  </div>
                </div>
                
                <div class="promo-section">
                  <div class="promo-input">
                    <input type="text" placeholder="Enter promo code">
                    <button class="apply-btn">Apply</button>
                  </div>
                </div>
                
                <div class="order-totals">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹2,500</span>
                  </div>
                  <div class="total-row">
                    <span>Discount:</span>
                    <span class="discount">-₹500</span>
                  </div>
                  <div class="total-row">
                    <span>Tax:</span>
                    <span>₹360</span>
                  </div>
                  <div class="total-row final-total">
                    <span>Total:</span>
                    <span>₹2,360</span>
                  </div>
                </div>
                
                <div class="guarantees">
                  <div class="guarantee-item">
                    <span class="guarantee-icon">🛡️</span>
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div class="guarantee-item">
                    <span class="guarantee-icon">🔒</span>
                    <span>SSL secured checkout</span>
                  </div>
                  <div class="guarantee-item">
                    <span class="guarantee-icon">⚡</span>
                    <span>Instant digital delivery</span>
                  </div>
                </div>
                
                <button class="checkout-button">Complete Payment</button>
              </div>
            </div>
          </div>
        </div>
      `,
      css: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .modern-checkout {
          min-height: 100vh;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          font-family: 'Inter', sans-serif;
          padding: 20px;
        }
        
        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .checkout-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .checkout-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 10px;
        }
        
        .checkout-header p {
          color: #64748b;
          font-size: 1.1rem;
        }
        
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .payment-section,
        .order-summary {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .section-header h2 {
          font-size: 1.5rem;
          color: #1e293b;
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #dcfce7;
          color: #166534;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .method-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }
        
        .method-tab {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          padding: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .method-tab:hover {
          background: #f8fafc;
        }
        
        .method-tab.active {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }
        
        .method-content {
          display: none;
        }
        
        .method-content.active {
          display: block;
        }
        
        .form-group {
          margin-bottom: 20px;
          position: relative;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #1e293b;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #8b5cf6;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .card-icons {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 5px;
        }
        
        .billing-address {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
        }
        
        .billing-address h3 {
          color: #1e293b;
          margin-bottom: 20px;
        }
        
        .upi-section {
          text-align: center;
        }
        
        .qr-section {
          margin-top: 30px;
        }
        
        .qr-code {
          width: 150px;
          height: 150px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }
        
        .qr-placeholder {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .wallet-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .wallet-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .wallet-option:hover {
          background: #e0e7ff;
        }
        
        .wallet-balance {
          margin-left: auto;
          font-weight: 600;
          color: #10b981;
        }
        
        .summary-header h2 {
          color: #1e293b;
          font-size: 1.5rem;
          margin-bottom: 30px;
        }
        
        .order-items {
          margin-bottom: 30px;
        }
        
        .order-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .order-item:last-child {
          border-bottom: none;
        }
        
        .item-image img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
        }
        
        .item-details {
          flex: 1;
        }
        
        .item-details h4 {
          color: #1e293b;
          margin-bottom: 5px;
        }
        
        .item-details p {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }
        
        .item-quantity {
          color: #64748b;
          font-size: 0.8rem;
        }
        
        .item-price {
          font-weight: 600;
          color: #1e293b;
        }
        
        .promo-section {
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .promo-input {
          display: flex;
          gap: 10px;
        }
        
        .promo-input input {
          flex: 1;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .apply-btn {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .apply-btn:hover {
          background: #7c3aed;
        }
        
        .order-totals {
          margin-bottom: 30px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 1rem;
        }
        
        .total-row:last-child {
          margin-bottom: 0;
        }
        
        .discount {
          color: #10b981;
        }
        
        .final-total {
          font-weight: 700;
          font-size: 1.2rem;
          color: #1e293b;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }
        
        .guarantees {
          margin-bottom: 30px;
        }
        
        .guarantee-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .checkout-button {
          width: 100%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        
        .checkout-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
        }
        
        @media (max-width: 1024px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .payment-section,
          .order-summary {
            padding: 30px 20px;
          }
          
          .checkout-header h1 {
            font-size: 2rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .method-tabs {
            flex-direction: column;
          }
        }
      `
    },
    'express_payment': {
      name: 'Express Payment',
      description: 'Fast and streamlined payment page for quick transactions.',
      thumbnail: 'https://placehold.co/400x300/059669/ffffff?text=Express+Pay',
      html: `
        <div class="express-payment">
          <div class="payment-container">
            <div class="payment-header">
              <h1>Express Checkout</h1>
              <p>Complete your purchase in seconds</p>
            </div>
            
            <div class="product-summary">
              <div class="product-info">
                <img src="https://placehold.co/100x100/059669/ffffff?text=Product" alt="Product">
                <div class="product-details">
                  <h3>Premium Course Bundle</h3>
                  <p>Digital Download</p>
                </div>
              </div>
              <div class="product-price">₹2,499</div>
            </div>
            
            <div class="express-options">
              <button class="express-btn google-pay">
                <span class="btn-icon">🎯</span>
                <span class="btn-text">Google Pay</span>
              </button>
              <button class="express-btn apple-pay">
                <span class="btn-icon">🍎</span>
                <span class="btn-text">Apple Pay</span>
              </button>
              <button class="express-btn paytm">
                <span class="btn-icon">💳</span>
                <span class="btn-text">Paytm</span>
              </button>
            </div>
            
            <div class="divider">
              <span>or pay with card</span>
            </div>
            
            <form class="payment-form">
              <div class="form-group">
                <input type="email" placeholder="Email address" required>
              </div>
              
              <div class="form-group">
                <input type="text" placeholder="Card number" required>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <input type="text" placeholder="MM/YY" required>
                </div>
                <div class="form-group">
                  <input type="text" placeholder="CVV" required>
                </div>
              </div>
              
              <div class="form-group">
                <input type="text" placeholder="Name on card" required>
              </div>
              
              <button type="submit" class="pay-button">
                <span class="button-text">Pay ₹2,499</span>
                <span class="button-icon">🔒</span>
              </button>
            </form>
            
            <div class="trust-indicators">
              <div class="trust-item">
                <span class="trust-icon">🔒</span>
                <span>SSL Encrypted</span>
              </div>
              <div class="trust-item">
                <span class="trust-icon">🛡️</span>
                <span>Money Back Guarantee</span>
              </div>
              <div class="trust-item">
                <span class="trust-icon">⚡</span>
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      `,
      css: `
        .express-payment {
          min-height: 100vh;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        
        .payment-container {
          background: white;
          border-radius: 20px;
          padding: 50px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .payment-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .payment-header h1 {
          font-size: 2.2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 10px;
        }
        
        .payment-header p {
          color: #64748b;
          font-size: 1.1rem;
        }
        
        .product-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 25px;
          background: #f8fafc;
          border-radius: 16px;
          margin-bottom: 30px;
          border: 1px solid #e2e8f0;
        }
        
        .product-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .product-info img {
          width: 60px;
          height: 60px;
          border-radius: 12px;
        }
        
        .product-details h3 {
          color: #1e293b;
          margin-bottom: 5px;
        }
        
        .product-details p {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .product-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
        }
        
        .express-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }
        
        .express-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          font-weight: 500;
        }
        
        .express-btn:hover {
          background: #f8fafc;
          transform: translateY(-1px);
        }
        
        .express-btn.google-pay:hover {
          border-color: #4285f4;
        }
        
        .express-btn.apple-pay:hover {
          border-color: #000000;
        }
        
        .express-btn.paytm:hover {
          border-color: #00baf2;
        }
        
        .btn-icon {
          font-size: 1.2rem;
        }
        
        .divider {
          text-align: center;
          margin: 30px 0;
          position: relative;
          color: #64748b;
        }
        
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
        }
        
        .divider span {
          background: white;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }
        
        .payment-form {
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group input {
          width: 100%;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #059669;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .pay-button {
          width: 100%;
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        }
        
        .pay-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.5);
        }
        
        .trust-indicators {
          display: flex;
          justify-content: space-around;
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
        }
        
        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        
        .trust-icon {
          font-size: 1.5rem;
        }
        
        .trust-item span:last-child {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .payment-container {
            padding: 40px 20px;
          }
          
          .payment-header h1 {
            font-size: 1.8rem;
          }
          
          .product-summary {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .trust-indicators {
            flex-direction: column;
            gap: 20px;
          }
        }
      `
    }
  }
};

// Template categories for auto-adding related pages
export const templateCategories = {
  customer: {
    vsl: 'fitness_vsl', // Using fitnessVSLTemplates from landing page1.jsx (customer template)
    appointment: 'Client_appointment_booking_v8_professional',
    thankyou: 'fitness_thankyou' // Default customer thank you template
  },
  coach: {
    vsl: 'health_transformation_vsl_coach_page',
    appointment: 'couch_appointment_booking_v8_professional',
    thankyou: 'fitness_thankyou' // Default coach thank you template (can be updated if there's a specific coach one)
  }
};