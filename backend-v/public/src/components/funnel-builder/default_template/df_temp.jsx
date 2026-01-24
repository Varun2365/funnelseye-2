import fitnessVSLTemplates from "./default_template/landing page1";
export const welcomeTemplates = {
      welcomeTemplates: {
        'warm_welcome': {
            name: '1 Funnel landing page',
            description: 'A friendly welcome page with a clean design and clear CTA',
            thumbnail: 'https://placehold.co/400x300/4f46e5/ffffff?text=Warm+Welcome&font=playfair-display&style=gradient',
            css: `
        /* Font Imports */
        /* Font Imports */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;500;600;700&family=Shadows+Into+Light&display=swap');

        /* CSS Variables - Dark Theme */
        :root {
            --primary-color: #6B8DD6;
            --primary-dark-color: #5A7BC4;
            --secondary-color: #6B8DD6;
            --accent-color: #FFB347;
            --cta-color: #5A7BC4;
            --cta-hover-color: #6B8DD6;
            --text-dark: #E5E5E5;
            --text-medium: #B8B8B8;
            --text-light: #9A9A9A;
            --text-white: #FFFFFF;
            --bg-white: #1A1A1A;
            --bg-light-gray: #2D2D2D;
            --bg-dark-blue: #0F0F0F;
            --border-color: #404040;
            --highlight-bg: rgba(255, 179, 71, 0.2);
            --highlight-red-bg: rgba(255, 107, 107, 0.1);
            --highlight-red-text: #FF6B6B;
            --highlight-blue-bg: rgba(107, 141, 214, 0.1);
            --highlight-blue-text: #6B8DD6;
            --font-family-headings: 'Playfair Display', serif;
            --font-family-body: 'Poppins', sans-serif;
            --font-family-handwritten: 'Shadows Into Light', cursive;
            --font-weight-light: 300;
            --font-weight-normal: 400;
            --font-weight-medium: 500;
            --font-weight-semibold: 600;
            --font-weight-bold: 700;
            --border-radius-sm: 6px;
            --border-radius-md: 10px;
            --border-radius-lg: 18px;
            --border-radius-xl: 28px;
            --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
            --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.4);
            --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
            --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family-body);
            background-color: var(--bg-white);
            color: var(--text-medium);
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .page-wrapper {
            overflow-x: hidden;
            overflow-y: visible;
            min-height: 100vh;
            background-color: var(--bg-white);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .section-padding {
            padding: 80px 0;
        }

        .top-bar {
            text-align: center;
            padding: 15px 20px;
            font-size: 1rem;
            font-weight: var(--font-weight-medium);
            background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%);
            color: var(--text-white);
            box-shadow: var(--shadow-sm);
            position: relative;
            z-index: 999;
        }

        .top-bar-text {
            letter-spacing: 0.5px;
        }

        .hero-section {
            position: relative;
            background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%);
            text-align: center;
            padding-top: 100px;
            padding-bottom: 120px;
            color: var(--text-dark);
            z-index: 1;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
            background-size: 30px 30px;
            pointer-events: none;
            z-index: 0;
        }

        .hero-section::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 80px;
            background-size: cover;
            background-repeat: no-repeat;
            z-index: 10;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C200,150 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z' style='fill:%232D2D2D;'%3E%3C/path%3E%3C/svg%3E");
        }

        .hero-content {
            position: relative;
            z-index: 3;
        }

        .hero-title {
            font-family: var(--font-family-headings);
            font-size: 3.2rem;
            font-weight: var(--font-weight-bold);
            line-height: 1.3;
            margin-bottom: 25px;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
            letter-spacing: 0.5px;
        }

        .sub-headline {
            font-size: 1.3rem;
            font-style: italic;
            font-weight: var(--font-weight-light);
            margin-bottom: 35px;
        }

        .hero-pills {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 45px;
            flex-wrap: wrap;
        }

        .hero-pill {
            padding: 12px 25px;
            border-radius: var(--border-radius-xl);
            font-size: 0.95rem;
            font-weight: var(--font-weight-medium);
            box-shadow: var(--shadow-sm);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-dark);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-pill:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
        }

        .highlight {
            background-color: var(--highlight-bg);
            padding: 0.15em 0.5em;
            border-radius: var(--border-radius-sm);
            font-weight: var(--font-weight-semibold);
            color: var(--accent-color);
            box-shadow: 0 0 15px var(--highlight-bg);
        }

        .ai-agents {
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Video and Agenda Container */
        .video-agenda-container {
            display: flex;
            flex-direction: column;
            gap: 40px;
            align-items: center;
            margin-top: 50px;
        }

        .video-section {
            flex: 1 1 550px;
            max-width: 600px;
            width: 100%;
        }

        .video-placeholder-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            margin-bottom: 35px;
            background-color: #000;
        }

        .video-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80') center/cover no-repeat;
        }

        .active-video-player {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .play-button-overlay {
            position: absolute;
            width: 90px;
            height: 90px;
            background-color: rgba(255, 255, 255, 0.25);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.5s ease;
            backdrop-filter: blur(8px);
            overflow: hidden;
            animation: pulse 2s infinite;
        }

        .play-button-overlay:hover {
            background-color: rgba(255, 255, 255, 0.45);
            transform: scale(1.1);
            box-shadow: 0 0 20px 8px rgba(255, 255, 255, 0.35);
            animation: none;
        }

        .play-icon {
            width: 45px;
            height: 45px;
            fill: var(--text-white);
        }

        .video-placeholder-overlay-text {
            position: absolute;
            bottom: 20px;
            left: 20px;
            text-align: left;
            color: var(--text-white);
        }

        .video-placeholder-overlay-text h3 {
            font-family: var(--font-family-headings);
            margin: 0;
            font-size: 1.6rem;
            font-weight: var(--font-weight-bold);
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.6);
            color: var(--text-white);
        }

        .video-placeholder-overlay-text p {
            margin: 5px 0 0;
            font-size: 0.9rem;
            opacity: 0.9;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
        }

        @keyframes pulse {

            0%,
            100% {
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
            }

            50% {
                box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
            }
        }

        /* Event Details Grid */
        .event-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
        }

        .event-detail-box {
            background-color: var(--bg-white);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-md);
            padding: 15px;
            text-align: center;
            box-shadow: var(--shadow-sm);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .event-detail-box:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: var(--shadow-md);
        }

        .event-detail-icon {
            font-size: 1.5rem;
            margin-bottom: 8px;
            color: var(--primary-color);
        }

        .event-detail-label {
            font-size: 0.75rem;
            color: var(--text-light);
            font-weight: var(--font-weight-medium);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .event-detail-value {
            font-size: 0.9rem;
            font-weight: var(--font-weight-semibold);
            color: var(--text-dark);
        }

        /* Implementation Agenda */
        .implementation-agenda-wrapper {
            flex: 1 1 500px;
            max-width: 550px;
            width: 100%;
        }

        .implementation-agenda {
            background-color: var(--bg-white);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            padding: 35px;
            box-shadow: var(--shadow-xl);
        }

        .implementation-agenda h3 {
            font-family: var(--font-family-headings);
            margin-top: 0;
            margin-bottom: 30px;
            color: var(--text-dark);
            font-size: 1.8rem;
            font-weight: var(--font-weight-semibold);
            text-align: center;
            text-decoration: underline;
            text-underline-offset: 10px;
            text-decoration-color: var(--primary-color);
        }

        .agenda-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .agenda-list-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            font-size: 1rem;
            line-height: 1.6;
            color: var(--text-medium);
        }

        .agenda-list-item:last-child {
            margin-bottom: 0;
        }

        .agenda-list-icon {
            color: var(--secondary-color);
            margin-right: 12px;
            margin-top: 3px;
            flex-shrink: 0;
        }

        /* Enroll Button */
        .enroll-button-container {
            text-align: center;
            padding: 25px 0;
        }

        .enroll-button {
            background: linear-gradient(90deg, var(--cta-color), var(--cta-hover-color));
            color: var(--text-white);
            border: none;
            padding: 20px 40px;
            font-size: 1.3rem;
            font-weight: var(--font-weight-bold);
            border-radius: var(--border-radius-xl);
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(90, 123, 196, 0.35);
            position: relative;
            min-width: 320px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .enroll-button:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 12px 25px rgba(90, 123, 196, 0.45);
            background: linear-gradient(90deg, var(--cta-hover-color), var(--cta-color));
        }

        .enroll-button s {
            font-weight: var(--font-weight-normal);
            opacity: 0.8;
            margin-left: 10px;
        }

        .hurry-message {
            margin-top: 20px;
            font-size: 0.95rem;
            color: var(--text-medium);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: var(--font-weight-medium);
        }

        .red-check {
            color: var(--text-white);
            background-color: var(--secondary-color);
            padding: 3px 6px;
            border-radius: var(--border-radius-sm);
            margin-right: 8px;
            font-size: 0.85em;
            font-weight: var(--font-weight-bold);
        }

        /* Section Titles */
        .section-title {
            font-family: var(--font-family-headings);
            font-size: 2.8rem;
            font-weight: var(--font-weight-bold);
            text-align: center;
            margin-bottom: 50px;
            line-height: 1.3;
            letter-spacing: 0.2px;
            color: var(--text-dark);
        }

        .section-title-light {
            color: var(--text-white);
        }

        .section-subtitle {
            font-size: 1.15rem;
            color: var(--text-light);
            text-align: center;
            max-width: 750px;
            margin: -30px auto 50px auto;
            font-weight: var(--font-weight-light);
        }

        /* Client Showcase */
        .client-showcase-section {
            background-color: var(--bg-light-gray);
        }

        .client-carousel-container {
            width: 100%;
            overflow: hidden;
            position: relative;
            padding: 20px 0;
            mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }

        .client-carousel {
            display: flex;
            gap: 30px;
            animation: scrollClients 60s linear infinite;
            width: fit-content;
        }

        .client-carousel:hover {
            animation-play-state: paused;
        }

        @keyframes scrollClients {
            0% {
                transform: translateX(0);
            }

            100% {
                transform: translateX(-50%);
            }
        }

        .client-card {
            background: var(--bg-white);
            border-radius: var(--border-radius-lg);
            padding: 35px;
            box-shadow: var(--shadow-lg);
            min-width: 330px;
            max-width: 330px;
            text-align: center;
            border: 1px solid var(--border-color);
            transition: transform 0.35s ease, box-shadow 0.35s ease;
            flex-shrink: 0;
        }

        .client-card:hover {
            transform: translateY(-10px) scale(1.03);
            box-shadow: var(--shadow-xl);
        }

        .client-image-container {
            width: 130px;
            height: 130px;
            margin: 0 auto 25px;
            border-radius: 50%;
            overflow: hidden;
            border: 5px solid var(--primary-color);
            box-shadow: var(--shadow-md);
        }

        .client-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .client-name {
            font-size: 1.3rem;
            font-weight: var(--font-weight-semibold);
            color: var(--text-dark);
            margin: 0 0 8px 0;
        }

        .client-position {
            font-size: 0.95rem;
            color: var(--text-light);
            margin: 0 0 15px 0;
            min-height: 40px;
        }

        .client-following {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: var(--bg-light-gray);
            padding: 8px 15px;
            border-radius: var(--border-radius-xl);
            border: 1px solid var(--border-color);
        }

        .instagram-icon {
            color: #E1306C;
            width: 20px;
            height: 20px;
        }

        .following-text {
            font-size: 0.9rem;
            font-weight: var(--font-weight-medium);
            color: var(--text-medium);
        }

        /* Social Proof */
        .social-proof-section {
            background-color: var(--bg-white);
        }

        .screenshots-flex-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin-bottom: 40px;
        }

        .phone-with-annotations {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 60px;
            width: 500px;
            margin-left: 100px;
        }

        .bottom-annotation {
            position: absolute;
            max-width: 320px;
            left: -200px;
            top: 70%;
            transform: translateY(-50%);
        }

        .phone-container {
            position: relative;
            z-index: 2;
        }

        .arrow-container {
            position: relative;
            display: inline-block;
            z-index: 3;
        }

        .arrow-top-to-phone {
            margin-top: 15px;
            margin-left: 50px;
        }

        .arrow-bottom-to-phone {
            margin-top: 10px;
            margin-left: -20px;
        }

        .curved-arrow {
            width: 60px;
            height: 60px;
            opacity: 0.8;
            filter: hue-rotate(20deg) saturate(1.2);
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .curved-arrow:hover {
            transform: scale(1.1);
            opacity: 1;
        }

        .handwritten-text {
            font-family: var(--font-family-handwritten);
            font-size: 1.5rem;
            line-height: 1.5;
            color: var(--text-medium);
            margin: 0;
            text-align: center;
            transform: rotate(-1.5deg);
        }

        .handwritten-text-top {
            transform: rotate(3.5deg);
            color: #6B8DD6;
        }

        .handwritten-text-bottom {
            transform: rotate(-2.5deg);
            color: #6B8DD6;
        }

        .highlight-red-handwritten {
            color: #FF6B6B;
            font-weight: bold;
        }

        .highlight-blue-handwritten {
            color: #6B8DD6;
            font-weight: bold;
        }

        .highlight-green-handwritten {
            color: #6BC96B;
            font-weight: bold;
        }

        .arrow-container {
            position: absolute;
            width: 80px;
            height: 80px;
            z-index: 1;
        }

        .arrow-top-to-phone {
            bottom: -80px;
            left: 100px;
            transform: rotate(250deg) scale(0.8);
        }

        .arrow-bottom-to-phone {
            top: -30%;
            right: -10px;
            transform: translateY(-50%) rotate(90deg) scale(0.8);
        }

        .handwritten-arrow {
            width: 100%;
            height: 100%;
            opacity: 1;
            filter: hue-rotate(180deg);
            transition: filter 0.3s ease;
        }

        .screenshot-item {
            flex: 0 0 auto;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-xl);
            box-shadow: var(--shadow-lg);
            display: inline-block;
        }

        .screenshot-item-no-shadow {
            flex: 0 0 auto;
            padding: 10px;
            border-radius: var(--border-radius-xl);
            display: inline-block;
            scale: 1;
            position: relative;
            top: 150px;
        }

        .top-annotation {
            position: relative;
            margin-bottom: -30px;
            max-width: 320px;
            align-self: flex-end;
            margin-right: -40px;
        }

        .screenshot-itemgg {
            flex: 0 0 auto;
            padding: 10px;
            border-radius: var(--border-radius-xl);
            display: inline-block;
            position: relative;
            z-index: 2;
            scale: 0.8;
            margin-top: -20px;
        }

        .screenshot-item-gif {
            transform: scale(1.05);
        }

        .simple-screenshot {
            max-width: 280px;
            height: auto;
            border-radius: var(--border-radius-md);
            display: block;
        }

        /* Reverse Funnel */
        .reverse-funnel-section {
            background-color: var(--bg-light-gray);
            padding-top: 100px;
            padding-bottom: 100px;
        }

        .reverse-funnel-subtitle {
            font-size: 2rem !important;
            font-weight: var(--font-weight-bold) !important;
            color: var(--primary-color) !important;
            margin-top: -20px;
            margin-bottom: 60px !important;
            font-family: var(--font-family-headings);
        }

        .funnel-diagram {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .funnel-step {
            background: linear-gradient(145deg, var(--bg-white), var(--bg-light-gray));
            border-radius: var(--border-radius-lg);
            padding: 25px;
            text-align: center;
            color: var(--text-dark);
            font-size: 0.95rem;
            box-shadow: var(--shadow-lg);
            width: 100%;
            max-width: 230px;
            border: 1px solid var(--border-color);
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 220px;
            justify-content: flex-start;
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .funnel-step:hover {
            transform: translateY(-10px) scale(1.03);
            box-shadow: var(--shadow-xl);
            border-color: var(--accent-color);
        }

        .funnel-step-icon-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            margin: 0 auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--primary-color);
            color: var(--text-white);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease;
        }

        .funnel-step:hover .funnel-step-icon-wrapper {
            background-color: var(--accent-color);
        }

        .funnel-step-icon-wrapper svg {
            width: 32px;
            height: 32px;
            fill: currentColor;
        }

        .funnel-step-1 .funnel-step-icon-wrapper {
            background-color: #4A69BB;
        }

        .funnel-step-2 .funnel-step-icon-wrapper {
            background-color: #5DADE2;
        }

        .funnel-step-3 .funnel-step-icon-wrapper {
            background-color: #48C9B0;
        }

        .funnel-step-4 .funnel-step-icon-wrapper {
            background-color: #F4D03F;
        }

        .funnel-step-5 .funnel-step-icon-wrapper {
            background-color: #E74C3C;
        }

        .funnel-step-number {
            font-size: 0.8rem;
            color: var(--text-light);
            font-weight: var(--font-weight-bold);
            margin-bottom: 10px;
            background-color: rgba(255, 255, 255, 0.1);
            display: inline-block;
            padding: 4px 10px;
            border-radius: var(--border-radius-sm);
        }

        .funnel-step p {
            font-weight: var(--font-weight-medium);
            line-height: 1.5;
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-medium);
        }

        /* Testimonials */
        .testimonials-section {
            background-color: var(--bg-white);
        }

        .testimonial-slider-container {
            position: relative;
            max-width: 1000px;
            margin: 0 auto;
            overflow: hidden;
        }

        .testimonial-slider-track {
            display: flex;
            transition: transform 0.5s ease-in-out;
            gap: 30px;
            padding: 10px;
        }

        .testimonial-card {
            background-color: var(--bg-light-gray);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.35s ease, box-shadow 0.35s ease;
            border: 1px solid var(--border-color);
            min-width: 320px;
            max-width: 350px;
            flex-shrink: 0;
        }

        .testimonial-card:hover {
            transform: translateY(-10px) scale(1.03);
            box-shadow: var(--shadow-xl);
        }

        .testimonial-image-wrapper {
            width: 100%;
            height: 200px;
            overflow: hidden;
            background-color: var(--bg-light-gray);
        }

        .testimonial-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .testimonial-content {
            padding: 25px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .testimonial-text {
            font-size: 1rem;
            color: var(--text-medium);
            font-style: italic;
            margin-bottom: 20px;
            line-height: 1.6;
            position: relative;
            padding-left: 30px;
        }

        .testimonial-text::before {
            content: '"';
            font-family: 'Georgia', serif;
            font-size: 3rem;
            color: var(--primary-color);
            opacity: 0.5;
            position: absolute;
            left: 0px;
            top: -10px;
        }

        .testimonial-author {
            font-size: 0.9rem;
            font-weight: var(--font-weight-semibold);
            color: var(--primary-color);
            text-align: right;
            margin-top: auto;
        }

        .testimonial-author span {
            display: block;
            font-size: 0.8rem;
            font-weight: var(--font-weight-normal);
            color: var(--text-light);
        }

        .testimonial-slider-controls {
            text-align: center;
            margin-top: 30px;
        }

        .testimonial-slider-arrow {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            margin: 0 10px;
            transition: background-color 0.3s ease, transform 0.2s ease;
            box-shadow: var(--shadow-sm);
        }

        .testimonial-slider-arrow:hover {
            background-color: var(--primary-dark-color);
            transform: scale(1.1);
        }

        .testimonial-slider-arrow:disabled {
            background-color: var(--border-color);
            cursor: not-allowed;
        }

        /* Tsunami Section */
        .tsunami-section {
            background-color: var(--bg-light-gray);
        }

        .tsunami-header .section-title {
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
        }

        .tsunami-content-wrapper {
            display: grid;
            grid-template-columns: 1fr;
            gap: 50px;
            align-items: flex-start;
        }

        .tsunami-left {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .group-photo-container {
            width: 100%;
            border-radius: var(--border-radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }

        .group-photo {
            width: 100%;
            height: auto;
            display: block;
        }

        .tsunami-description p {
            font-size: 1.05rem;
            line-height: 1.8;
            color: var(--text-medium);
            margin-bottom: 18px;
        }

        .tsunami-description strong {
            color: var(--text-dark);
            font-weight: var(--font-weight-semibold);
        }

        .tsunami-right {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        .what-if-section {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark-color));
            padding: 35px;
            border-radius: var(--border-radius-lg);
            color: var(--text-white);
            box-shadow: var(--shadow-lg);
        }

        .what-if-title {
            font-family: var(--font-family-headings);
            font-size: 1.8rem;
            margin: 0 0 25px 0;
            color: var(--text-white);
            font-weight: var(--font-weight-bold);
        }

        .what-if-steps {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .what-if-step {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }

        .step-number-badge {
            background: rgba(255, 255, 255, 0.2);
            color: var(--text-white);
            min-width: 32px;
            height: 32px;
            border-radius: 50%;
            font-weight: var(--font-weight-bold);
            font-size: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .step-text {
            flex: 1;
            line-height: 1.6;
            font-size: 1.05rem;
            font-weight: var(--font-weight-medium);
        }

        .comparison-container {
            background: var(--bg-white);
            border-radius: var(--border-radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }

        .comparison-table {
            display: grid;
            grid-template-columns: 1fr;
        }

        .comparison-column {
            display: flex;
            flex-direction: column;
        }

        .column-header {
            padding: 25px 20px;
            text-align: center;
            font-weight: var(--font-weight-bold);
        }

        .column-header h4 {
            font-family: var(--font-family-headings);
            margin: 0 0 5px 0;
            font-size: 1.6rem;
        }

        .column-header p {
            margin: 0;
            font-size: 0.9rem;
            font-weight: var(--font-weight-medium);
            opacity: 0.9;
        }

        .old-way {
            background-color: rgba(255, 107, 107, 0.1);
        }

        .old-way .column-header {
            background-color: rgba(255, 107, 107, 0.2);
            color: #FF6B6B;
        }

        .new-way {
            background-color: rgba(107, 201, 107, 0.1);
        }

        .new-way .column-header {
            background-color: rgba(107, 201, 107, 0.2);
            color: #6BC96B;
        }

        .comparison-items {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding: 20px;
        }

        .comparison-item {
            display: flex;
            align-items: flex-start;
            padding: 12px 0;
            gap: 12px;
            border-bottom: 1px solid var(--border-color);
            min-height: 70px;
        }

        .comparison-item:last-child {
            border-bottom: none;
        }

        .item-icon {
            font-weight: var(--font-weight-bold);
            font-size: 1.3rem;
            margin-top: 2px;
            flex-shrink: 0;
            width: 24px;
            text-align: center;
        }

        .item-icon.cross {
            color: #FF6B6B;
        }

        .item-icon.check {
            color: #6BC96B;
        }

        .item-content {
            flex: 1;
        }

        .item-label {
            font-size: 0.7rem;
            font-weight: var(--font-weight-bold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
            display: block;
            opacity: 0.8;
        }

        .old-way .item-label {
            color: #FF6B6B;
        }

        .new-way .item-label {
            color: #6BC96B;
        }

        .item-text {
            font-size: 0.95rem;
            line-height: 1.5;
            color: var(--text-medium);
            font-weight: var(--font-weight-medium);
        }

        /* Results Agenda */
        .results-agenda-section {
            background-color: var(--bg-white);
        }

        .agenda-sprint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
        }

        .agenda-sprint-card {
            background-color: var(--bg-light-gray);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.35s ease, box-shadow 0.35s ease;
            border: 1px solid var(--border-color);
        }

        .agenda-sprint-card:hover {
            transform: translateY(-10px) scale(1.03);
            box-shadow: var(--shadow-xl);
        }

        .agenda-sprint-card .card-header {
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            color: var(--text-white);
            position: relative;
        }

        .agenda-icon-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .agenda-icon {
            width: 40px;
            height: 40px;
            object-fit: contain;
            filter: brightness(0) invert(1);
        }

        .day-label {
            font-family: var(--font-family-headings);
            font-size: 1.5rem;
            font-weight: var(--font-weight-bold);
        }

        .agenda-sprint-card .card-content {
            padding: 30px;
            flex-grow: 1;
        }

        .agenda-card-title {
            font-family: var(--font-family-headings);
            font-size: 1.6rem;
            color: var(--text-dark);
            margin-top: 0;
            margin-bottom: 20px;
            font-weight: var(--font-weight-semibold);
        }

        .agenda-sprint-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .agenda-sprint-list-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-size: 0.95rem;
            color: var(--text-medium);
            line-height: 1.6;
        }

        .agenda-sprint-list-item:last-child {
            margin-bottom: 0;
        }

        .agenda-sprint-list-icon {
            color: var(--primary-color);
            margin-right: 10px;
            font-size: 1.1em;
            margin-top: 3px;
            flex-shrink: 0;
        }

        /* Pricing */
        .pricing-section {
            background: linear-gradient(135deg, 
                rgba(74, 105, 187, 0.08) 0%, 
                rgba(59, 82, 138, 0.12) 50%,
                rgba(74, 105, 187, 0.08) 100%);
            position: relative;
            overflow: hidden;
            padding: 80px 0;
        }
        
        .pricing-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 20%, rgba(74, 105, 187, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(59, 82, 138, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(74, 105, 187, 0.08) 0%, transparent 50%);
            pointer-events: none;
            animation: backgroundFloat 20s ease-in-out infinite;
        }
        
        @keyframes backgroundFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(1deg); }
        }
        .pricing-table-wrapper {
            max-width: 700px;
            margin: 0 auto 30px auto;
            background-color: var(--bg-white);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            padding: 20px;
        }
        .pricing-table {
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-md);
            overflow: hidden;
        }

        .pricing-row {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            border-bottom: 1px solid var(--border-color);
            padding: 20px;
            position: relative;
            transition: background-color 0.2s ease;
        }

        .pricing-row:last-child {
            border-bottom: none;
        }

        .pricing-row:hover {
            background-color: rgba(107, 141, 214, 0.1);
        }

        .pricing-row-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            width: 100%;
        }

        .pricing-row.recommended {
            background-color: var(--primary-color);
            color: var(--text-white);
            border-color: var(--primary-dark-color);
            border-width: 2px;
            border-style: solid;
            margin: -1px;
            border-radius: var(--border-radius-md);
        }

        .pricing-row.recommended .seats,
        .pricing-row.recommended .price,
        .pricing-row.recommended .bonus {
            color: var(--text-white);
        }

        .pricing-row.recommended .last-few-badge {
            background-color: var(--accent-color);
            color: var(--text-dark);
        }

        .current-offer-tag {
            position: absolute;
            top: -1px;
            right: 20px;
            background-color: var(--accent-color);
            color: var(--text-white);
            padding: 4px 10px;
            font-size: 0.75rem;
            font-weight: bold;
            border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
            text-transform: uppercase;
        }

        .seats {
            font-weight: var(--font-weight-semibold);
            color: var(--text-dark);
            font-size: 1rem;
            flex-basis: 40%;
            text-align: left;
        }

        .last-few-badge {
            background-color: var(--accent-color);
            color: var(--text-white);
            padding: 3px 8px;
            border-radius: var(--border-radius-sm);
            font-size: 0.75rem;
            font-weight: var(--font-weight-bold);
            margin-right: 8px;
            display: inline-block;
        }

        .price {
            font-size: 1.5rem;
            font-weight: var(--font-weight-bold);
            color: var(--primary-color);
            flex-basis: 20%;
            text-align: center;
        }

        .bonus {
            font-size: 0.9rem;
            color: var(--text-light);
            flex-basis: 40%;
            text-align: right;
        }

        .current-price-display {
            text-align: center;
            font-size: 1.2rem;
            font-weight: var(--font-weight-medium);
            color: var(--text-medium);
            margin-bottom: 30px;
        }

        .original-price {
            text-decoration: line-through;
            color: var(--text-light);
            margin-right: 8px;
            font-size: 1rem;
        }

        .discounted-price {
            font-size: 1.8rem;
            font-weight: var(--font-weight-bold);
            color: var(--cta-color);
        }

        /* Who Is Shubh */
        .who-is-shubh-section-wrapper {
            background-color: var(--bg-dark-blue);
            padding: 80px 0;
            margin-bottom: 0;
            overflow: visible;
        }

        .who-is-shubh-section {
            border-radius: var(--border-radius-xl);
            width: 90%;
            max-width: 1000px;
            background-color: var(--bg-dark-blue);
            color: var(--text-white);
            margin: 0 auto;
            box-shadow: var(--shadow-xl);
            position: relative;
            z-index: 1;
            min-height: 400px;
        }

        .who-is-shubh-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
            padding: 50px 40px;
            box-sizing: border-box;
        }

        .shubh-photo-container {
            flex-shrink: 0;
            position: relative;
        }

        .shubh-photo {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            object-fit: cover;
            border: 6px solid var(--primary-color);
            box-shadow: 0 0 30px rgba(74, 105, 187, 0.4), 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .shubh-details {
            flex: 1;
            text-align: center;
        }

        .shubh-details .section-title-light {
            font-size: 2.2rem;
            margin-bottom: 30px;
        }

        .shubh-details-list {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        }

        .shubh-details-list-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-size: 1rem;
            line-height: 1.6;
            background-color: rgba(255, 255, 255, 0.05);
            padding: 10px 15px;
            border-radius: var(--border-radius-md);
            transition: background-color 0.3s ease;
        }

        .shubh-details-list-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .shubh-details-icon {
            color: var(--secondary-color);
            margin-right: 15px;
            flex-shrink: 0;
            font-size: 1.2rem;
        }

        /* FAQ */
        .faq-section {
            background-color: var(--bg-white);
        }

        .faq-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .faq-item {
            border-bottom: 1px solid var(--border-color);
        }

        .faq-item:last-child {
            border-bottom: none;
        }

        .faq-question {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 0;
            cursor: pointer;
            font-weight: var(--font-weight-semibold);
            font-size: 1.2rem;
            color: var(--text-dark);
            transition: color 0.2s ease;
        }

        .faq-question:hover {
            color: #6B8DD6;
        }

        .faq-arrow {
            color: var(--primary-color);
            transition: transform 0.3s ease;
        }

        .faq-arrow.open {
            transform: rotate(180deg);
        }

        .faq-answer {
            padding: 0 0 25px 0;
            animation: fadeInAnswer 0.4s ease-in-out;
            color: var(--text-medium);
            line-height: 1.7;
            font-size: 1rem;
        }

        .faq-answer p {
            margin: 0;
        }

        @keyframes fadeInAnswer {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .footer {
            background-color: var(--bg-dark-blue);
            padding: 60px 0 50px;
            border-top: 1px solid var(--primary-dark-color);
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 0;
            position: relative;
            z-index: 2;
        }

        .footer-copyright p {
            font-size: 0.9rem;
            color: var(--text-white);
            font-weight: var(--font-weight-medium);
            margin: 0 0 15px 0;
        }

        .footer-disclaimer p {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.6;
            margin: 0;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }

        .footer-link {
            color: var(--accent-color);
            text-decoration: none;
            font-weight: var(--font-weight-medium);
        }

        .footer-link:hover {
            text-decoration: underline;
            color: #FFD700;
        }

        .floating-cta-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(10px);
            padding: 15px 0;
            box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            border-top: 1px solid var(--border-color);
        }

        .floating-cta-bar__container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .floating-cta-bar__content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        }

        .floating-cta-bar__info-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .floating-cta-bar__price-details {
            display: flex;
            align-items: baseline;
            gap: 8px;
        }

        .floating-cta-bar__price-current {
            font-size: 2.1rem;
            font-weight: var(--font-weight-bold);
            color: var(--secondary-color);
            line-height: 1;
        }

        .floating-cta-bar__price-original {
            font-size: 1.2rem;
            color: var(--cta-color);
            text-decoration: line-through;
            font-weight: var(--font-weight-normal);
            line-height: 1;
        }

        .floating-cta-bar__deadline {
            font-size: 0.85rem;
            color: var(--text-medium);
            margin-top: 5px;
            font-weight: var(--font-weight-medium);
        }

        .floating-cta-bar__action-section {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .floating-cta-bar__button {
            background-color: var(--cta-color);
            color: var(--text-white);
            border: none;
            padding: 15px 32px;
            font-size: 1.1rem;
            font-weight: var(--font-weight-bold);
            border-radius: var(--border-radius-md);
            cursor: pointer;
            position: relative;
            transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }

        .floating-cta-bar__button:hover {
            background-color: var(--cta-hover-color);
            box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
        }

        .floating-cta-bar__bonus-text {
            font-size: 0.8rem;
            color: var(--text-medium);
            margin-top: 6px;
            font-weight: var(--font-weight-medium);
        }

        @media (min-width: 992px) {
            .video-agenda-container {
                flex-direction: row;
                justify-content: space-between;
                align-items: flex-start;
                gap: 60px;
            }

            .funnel-diagram {
                flex-direction: row;
                justify-content: center;
                gap: 0;
                align-items: stretch;
            }

            .funnel-connector {
                display: block;
                width: 40px;
                height: 2px;
                background-color: var(--primary-color);
                position: relative;
                margin: auto 15px;
            }

            .funnel-connector::after {
                content: '';
                position: absolute;
                right: -6px;
                top: -4px;
                width: 0;
                height: 0;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
                border-left: 8px solid var(--primary-color);
            }

            .screenshots-flex-container {
                flex-direction: row;
                gap: 120px;
                align-items: flex-start;
                justify-content: center;
            }

            .tsunami-content-wrapper {
                grid-template-columns: 1fr 1.2fr;
                gap: 60px;
            }

            .comparison-table {
                grid-template-columns: 1fr 1fr;
            }

            .pricing-row-content {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }
        }

        @media (max-width: 991.98px) {
            .phone-with-annotations {
                gap: 30px;
                width: auto;
                margin-left: 0;
            }

            .top-annotation,
            .bottom-annotation {
                position: relative;
                align-self: center;
                margin: 20px 0 0 0;
                left: auto;
                top: auto;
                transform: none;
                max-width: 90%;
            }

            .arrow-container {
                display: none;
            }

            .arrow-top-to-phone {
                margin-left: 20px;
                margin-top: 20px;
            }

            .arrow-bottom-to-phone {
                margin-left: 10px;
                margin-top: 15px;
            }

            .curved-arrow {
                width: 50px;
                height: 50px;
            }
        }

        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.5rem;
            }

            .section-title {
                font-size: 2.2rem;
            }

            .enroll-button {
                min-width: 280px;
            }

            .handwritten-text {
                font-size: 1.2rem;
            }

            .arrow-top-to-phone,
            .arrow-bottom-to-phone {
                margin-left: 0;
                text-align: center;
            }

            .curved-arrow {
                width: 40px;
                height: 40px;
            }
        }

        @media (max-width: 520px) {
            .floating-cta-bar__content {
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .floating-cta-bar__info-section {
                align-items: center;
                text-align: center;
            }

            .floating-cta-bar__action-section {
                width: 100%;
            }

            .floating-cta-bar__button {
                width: 90%;
                max-width: 280px;
                margin: 0 auto;
            }

            .testimonial-card {
                min-width: calc(100% - 20px);
                max-width: calc(100% - 20px);
            }
        }

        /* Professional Testimonials Section */
        .testimonials-section {
            background: var(--bg-dark-blue);
            padding: 80px 0;
            overflow: hidden;
        }

        .testimonials-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .testimonials-title {
            text-align: center;
            margin-bottom: 50px;
        }

        .testimonials-title h2 {
            font-family: var(--font-family-headings);
            font-size: 2.5rem;
            font-weight: var(--font-weight-bold);
            color: var(--text-white);
            margin-bottom: 15px;
        }

        .testimonials-title p {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.8);
            max-width: 600px;
            margin: 0 auto;
        }

        .testimonials-scroll-container {
            display: flex;
            overflow-x: auto;
            gap: 20px;
            padding: 20px 0;
            scroll-behavior: smooth;
        }

        .testimonials-scroll-container::-webkit-scrollbar {
            height: 6px;
        }

        .testimonials-scroll-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        .testimonials-scroll-container::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 3px;
        }

        .story-card {
            flex: 0 0 320px;
            min-height: 280px;
            max-height: 380px;
            background: white;
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            margin: 0;
        }

        .story-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .story-card--blue {
            background: linear-gradient(135deg, #4A69BB 0%, #3B528A 100%);
            color: white;
        }

        .story-card--blue .story-quote {
            color: white;
        }

        .story-card--blue .story-author {
            color: white;
        }

        .story-card--blue .story-role {
            color: rgba(255, 255, 255, 0.9);
        }

        .story-card--blue .story-location {
            color: rgba(255, 255, 255, 0.8);
        }

        .story-card--blue .story-stars {
            color: #FFD700;
        }

        .story-card--gray {
            background: #f8f9fa;
            color: var(--text-dark);
        }

        .story-card--image {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            color: white;
            position: relative;
        }

        .story-card--image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 16px;
        }

        .story-card--image .story-content {
            position: relative;
            z-index: 2;
        }

        .story-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex: 1;
        }

        .story-stars {
            font-size: 1.2rem;
            margin-bottom: 20px;
            color: #FFD700;
        }

        .story-quote {
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 20px;
            font-style: italic;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .story-author {
            font-weight: var(--font-weight-bold);
            font-size: 1.1rem;
            margin-bottom: -3px;
        }

        .story-role {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 3px;
        }

        .story-card--gray .story-role {
            color: var(--text-medium);
        }

        .story-location {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .story-card--gray .story-location {
            color: var(--text-light);
        }

        .story-profile {
            position: absolute;
            bottom: 15px;
            right: 15px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .story-card--blue .story-profile {
            border-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .story-card--gray .story-profile {
            border-color: rgba(74, 105, 187, 0.3);
            box-shadow: 0 4px 15px rgba(74, 105, 187, 0.2);
        }

        .story-stats {
            text-align: center;
            margin-bottom: 20px;
        }

        .story-stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: var(--font-weight-bold);
            color: white;
            margin-bottom: 5px;
        }

        .story-stat-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.8);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        @media (max-width: 480px) {
            .container {
                padding: 0 15px;
            }

            .section-padding {
                padding: 50px 0;
            }

            .hero-title {
                font-size: 2rem;
            }

            .section-title {
                font-size: 1.9rem;
            }

            .hero-pills {
                gap: 10px;
            }

            .hero-pill {
                padding: 10px 18px;
                font-size: 0.85rem;
            }

            .pricing-row-content {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }

            `,
            html: `
  <div class="page-wrapper">
        <!-- Top Bar -->
        <div class="top-bar">
            <span class="top-bar-text">🔥 Limited Time Offer - Scale Your Coaching Business To 5 Lakhs/Month!</span>
        </div>

        <!-- Hero Section -->
        <section class="hero-section section-padding">
            <div class="container hero-content">
                <h1 class="hero-title">Scale your Coaching Business To the <span class="highlight">5 Lakhs/Month
                        PROFIT</span> Using Army Of <span class="ai-agents">A.I. Agents</span></h1>
                <p class="sub-headline">Zero Tech Method & Complete Time Freedom.</p>
                <div class="hero-pills">
                    <span class="hero-pill">NO Sales Calls</span>
                    <span class="hero-pill">NO Endless Content</span>
                    <span class="hero-pill">NO Begging in DMs</span>
                </div>
                <div class="video-agenda-container">
                    <div class="video-section">
                        <div class="video-placeholder-wrapper">
                            <div class="video-placeholder">
                                <div class="play-button-overlay" onclick="handlePlayButtonClick()">
                                    <svg class="play-icon" viewBox="0 0 100 100">
                                        <path d="M 30,20 L 30,80 L 80,50 Z" />
                                    </svg>
                                </div>
                                <div class="video-placeholder-overlay-text">
                                    <h3>SHUBH JAIN</h3>
                                    <p>From Employee to 40 CR+ Empire Builder</p>
                                </div>
                            </div>
                        </div>
                        <div class="event-details-grid">
                            <div class="event-detail-box">
                                <div class="event-detail-icon">📅</div>
                                <div class="event-detail-label">DATE</div>
                                <div class="event-detail-value">June 28th - 30th</div>
                            </div>
                            <div class="event-detail-box">
                                <div class="event-detail-icon">🕰️</div>
                                <div class="event-detail-label">TIME</div>
                                <div class="event-detail-value">7 PM - 9 PM</div>
                            </div>
                            <div class="event-detail-box">
                                <div class="event-detail-icon">📍</div>
                                <div class="event-detail-label">WHERE</div>
                                <div class="event-detail-value">Zoom</div>
                            </div>
                            <div class="event-detail-box">
                                <div class="event-detail-icon">🌐</div>
                                <div class="event-detail-label">LANGUAGE</div>
                                <div class="event-detail-value">English</div>
                            </div>
                        </div>
                    </div>
                    <div class="implementation-agenda-wrapper">
                        <div class="implementation-agenda">
                            <h3>🎁 REGISTER IN NEXT 24 HOURS & GET:</h3>
                            <ul class="agenda-list">
                                <li class="agenda-list-item">
                                    <span class="agenda-list-icon">✅</span>
                                    <span class="agenda-item-text">Complete 90-Day Meal Planning Template (Worth ₹2,999)</span>
                                </li>
                                <li class="agenda-list-item">
                                    <span class="agenda-list-icon">✅</span>
                                    <span class="agenda-item-text">Priority Q&A Access During Live Session</span>
                                </li>
                                <li class="agenda-list-item">
                                    <span class="agenda-list-icon">✅</span>
                                    <span class="agenda-item-text">Exclusive Implementation Checklist</span>
                                </li>
                                <li class="agenda-list-item">
                                    <span class="agenda-list-icon">✅</span>
                                    <span class="agenda-item-text">Post-Workshop Private Community Access</span>
                                </li>
                            </ul>
                        </div>
                        <div class="agenda-enroll-section">
                            <div class="enroll-button-container">
                                <button class="enroll-button">
                                    RESERVE MY SPOT - FREE →
                                </button>
                                <p class="hurry-message">
                                    <span class="red-check">✔</span>
                                    <span class="red-check">✔</span> Hurry! Limited Seats Available!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Client Showcase Section -->
        <section class="client-showcase-section section-padding">
            <div class="container">
                <h2 class="section-title">🏆 SECTION 4: SUCCESS STORIES FROM <span class="highlight">COMMUNITY</span></h2>
                <p class="section-subtitle">Real Transformations From Busy Professionals:</p>
                <div class="client-carousel-container">
                    <div class="client-carousel">
                        <div class="client-card">
                            <div class="client-image-container">
                                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                                    alt="Priya Sharma" class="client-image">
                            </div>
                            <h3 class="client-name">Priya Sharma</h3>
                            <p class="client-position">Sales Director, Mumbai</p>
                            <div class="testimonial-text">"Lost 12kg While Traveling 3 Weeks a Month"</div>
                            <div class="testimonial-quote">"As a sales director, I'm constantly on the road. This system worked with my lifestyle instead of against it. Down 12kg and more energetic than I've been in years."</div>
                        </div>
                        <div class="client-card">
                            <div class="client-image-container">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Rajesh Patel"
                                    class="client-image">
                            </div>
                            <h3 class="client-name">Rajesh Patel</h3>
                            <p class="client-position">Software Architect, Bangalore</p>
                            <div class="testimonial-text">"Finally Broke My 5-Year Weight Plateau"</div>
                            <div class="testimonial-quote">"Tried everything for 5 years - nothing stuck. This 5-step system was different. Lost 15kg in 90 days while working 60-hour weeks and raising two kids."</div>
                            <div class="client-following">
                                <svg class="instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                <span class="following-text">Following: 24.3K+</span>
                            </div>
                        </div>
                        <div class="client-card">
                            <div class="client-image-container">
                                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Dr. Meera Singh"
                                    class="client-image">
                            </div>
                            <h3 class="client-name">Dr. Meera Singh</h3>
                            <p class="client-position">Surgeon, Delhi</p>
                            <div class="testimonial-text">"My Doctor Was Amazed at My Blood Work"</div>
                            <div class="testimonial-quote">"Not just weight loss - my diabetes markers improved, blood pressure normalized, and energy levels soared. All while maintaining my demanding surgery schedule."</div>
                            <div class="client-following">
                                <svg class="instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                <span class="following-text">Following: 9.1K+</span>
                            </div>
                        </div>
                        <div class="client-card">
                            <div class="client-image-container">
                                <img src="https://antux-react.vercel.app/assets/img/projects/1.jpg" alt="Priya Sharma"
                                    class="client-image">
                            </div>
                            <h3 class="client-name">Priya Sharma</h3>
                            <p class="client-position">Life Transformation Coach</p>
                            <div class="client-following">
                                <svg class="instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                                </svg>
                                <span class="following-text">Following: 32.5K+</span>
                            </div>
                        </div>
                        <div class="client-card">
                            <div class="client-image-container">
                                <img src="https://antux-react.vercel.app/assets/img/projects/2.jpg" alt="Rahul Mehta"
                                    class="client-image">
                            </div>
                            <h3 class="client-name">Rahul Mehta</h3>
                            <p class="client-position">Mindset & Success Coach</p>
                            <div class="client-following">
                                <svg class="instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                <span class="following-text">Following: 18.9K+</span>
                            </div>
                        </div>
                        <div class="client-card">
                            <div class="client-image-container">
                                <img src="https://antux-react.vercel.app/assets/img/projects/3.jpg" alt="Kavita Singh"
                                    class="client-image">
                            </div>
                            <h3 class="client-name">Kavita Singh</h3>
                            <p class="client-position">Health & Wellness Coach</p>
                            <div class="client-following">
                                <svg class="instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                                </svg>
                                <span class="following-text">Following: 27.2K+</span>
                            </div>
                        </div>
                        <!-- Duplicate cards for infinite scroll effect -->
                        <div class="client-card">
                            <div class="client-image-container">
                                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                                    alt="Priya Sharma" class="client-image">
                            </div>
                            <h3 class="client-name">Priya Sharma</h3>
                            <p class="client-position">Sales Director, Mumbai</p>
                            <div class="testimonial-text">"Lost 12kg While Traveling 3 Weeks a Month"</div>
                            <div class="testimonial-quote">"As a sales director, I'm constantly on the road. This system worked with my lifestyle instead of against it. Down 12kg and more energetic than I've been in years."</div>
                            <div class="client-following">
                                <svg class="instagram-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                                </svg>
                                <span class="following-text">Following: 44.7K+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Social Proof Section -->
        <!-- Social Proof Section -->
        <section class="social-proof-section section-padding">
            <div class="container">
                <h2 class="section-title">
                    In Just 90 Days... You Can Start Getting <span class="highlight">Ready To Transform</span> Your Health & Energy!!
                </h2>
                <p class="section-subtitle">
                    This is the ultimate black-book of <span class="highlight">TOP 1% health professionals</span> (they won't reveal
                    it to you...)
                </p>
                <div class="screenshots-flex-container">
                    <div class="screenshot-item-no-shadow">
                        <img src="assets/img/iphone/iphone.png" alt="Payment Notifications" class="simple-screenshot">
                    </div>
                    <div class="phone-with-annotations">
                        <div class="top-annotation">
                            <p class="handwritten-text handwritten-text-top">
                                And when you start applying these <span
                                    class="highlight-blue-handwritten">principles</span>... your inbox could start
                                looking <span class="highlight-green-handwritten">like this</span>.
                            </p>
                            <div class="arrow-container arrow-top-to-phone">
                                <img style="filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);" src="https://img.icons8.com/ios-filled/50/curly-arrow.png" alt="curved arrow"
                                    class="curved-arrow">
                            </div>
                        </div>
                        <div class="phone-container">
                            <div class="screenshot-itemgg screenshot-item-gif">
                                <img src="assets/img/iphone/iphoness.gif" alt="More Payment Notifications in phone"
                                    style="box-shadow: none" class="simple-screenshot">
                            </div>
                        </div>
                        <div class="bottom-annotation">
                            <p class="handwritten-text handwritten-text-bottom">
                                Hundreds of sales @ <span class="highlight-red-handwritten">High Ticket</span> Through
                                this <span class="highlight-blue-handwritten">Reverse Funnel</span> in a span of 2 hours
                                -
                            </p>
                            <div class="arrow-container arrow-bottom-to-phone">
                                <img style="filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);" src="https://img.icons8.com/ios-filled/50/curly-arrow.png" alt="curved arrow"
                                    class="curved-arrow">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="enroll-button-container social-proof-enroll">
                    <button class="enroll-button">
                        RESERVE MY SPOT - FREE →
                    </button>
                    <p class="hurry-message">
                        <span class="red-check">✔</span>
                        <span class="red-check">✔</span> Hurry! Limited Seats Available!
                    </p>
                </div>
            </div>
        </section>
        <!-- Reverse Funnel Section -->
        <section class="reverse-funnel-section section-padding">
            <div class="container">
                <h2 class="section-title">The 5-Step <span class="highlight">Health Transformation Blueprint</span></h2>
                <p class="section-subtitle reverse-funnel-subtitle">Follow this exact process that helped 5,000+ busy professionals
                    transform their health</p>
                <div class="funnel-diagram">
                    <div class="funnel-step funnel-step-1">
                        <div class="funnel-step-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <div class="funnel-step-number">01</div>
                        <p>The Metabolic Reset Protocol</p>
                    </div>
                    <div class="funnel-connector"></div>
                    <div class="funnel-step funnel-step-2">
                        <div class="funnel-step-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                            </svg>
                        </div>
                        <div class="funnel-step-number">02</div>
                        <p>The Busy Professional's Nutrition Framework</p>
                    </div>
                    <div class="funnel-connector"></div>
                    <div class="funnel-step funnel-step-3">
                        <div class="funnel-step-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                        </div>
                        <div class="funnel-step-number">03</div>
                        <p>The 20-Minute Movement Method</p>
                    </div>
                    <div class="funnel-connector"></div>
                    <div class="funnel-step funnel-step-4">
                        <div class="funnel-step-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                            </svg>
                        </div>
                        <div class="funnel-step-number">04</div>
                        <p>The Stress-Proof System</p>
                    </div>
                    <div class="funnel-connector"></div>
                    <div class="funnel-step funnel-step-5">
                        <div class="funnel-step-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.83 0-1.5-.67-1.5-1.5S11.17 14 12 14s1.5.67 1.5 1.5S12.83 17 12 17zm4-4H8V7h8v6z" />
                            </svg>
                        </div>
                        <div class="funnel-step-number">05</div>
                        <p>The Sustainability Formula</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section class="testimonials-section section-padding">
            <div class="container">
                <h2 class="section-title">What My <span class="highlight">Workshop Attendees Say</span></h2>
                <div class="testimonial-slider-container">
                    <div class="testimonial-slider-track">
                        <div class="testimonial-card">
                            <div class="testimonial-image-wrapper">
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                    alt="Testimonial by Test Author 1" class="testimonial-image">
                            </div>
                            <div class="testimonial-content">
                                <p class="testimonial-text">Best 2 Hours I've Invested in My Health. Packed with actionable insights. Implemented Step 1 the next morning and felt the difference immediately. Worth every minute.</p>
                                <p class="testimonial-author">- Ankit Sharma <br><span>Entrepreneur</span></p>
                            </div>
                        </div>
                        <div class="testimonial-card">
                            <div class="testimonial-image-wrapper">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                    alt="Testimonial by Test Author 2" class="testimonial-image">
                            </div>
                            <div class="testimonial-content">
                                <p class="testimonial-text">Finally, Someone Who Understands My Schedule. Every health program assumes you have unlimited time. This actually works for real working professionals with real constraints.</p>
                                <p class="testimonial-author">- Neha Gupta <br><span>Investment Banker</span></p>
                            </div>
                        </div>
                        <div class="testimonial-card">
                            <div class="testimonial-image-wrapper">
                                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                    alt="Testimonial by Test Author 3" class="testimonial-image">
                            </div>
                            <div class="testimonial-content">
                                <p class="testimonial-text">Wish I'd Found This Years Ago. Would have saved me thousands on failed programs and years of frustration. This system just makes sense.</p>
                                <p class="testimonial-author">- Vikram Modi <br><span>Consultant</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="testimonial-slider-controls">
                    <button class="testimonial-slider-arrow" onclick="prevTestimonial()"
                        aria-label="Previous testimonial">‹</button>
                    <button class="testimonial-slider-arrow" onclick="nextTestimonial()"
                        aria-label="Next testimonial">›</button>
                </div>
                <div class="enroll-button-container testimonial-enroll">
                    <button class="enroll-button">
                        RESERVE MY SPOT - FREE →
                    </button>
                    <p class="hurry-message">
                        <span class="red-check">✔</span>
                        <span class="red-check">✔</span> Hurry! Limited Seats Available!
                    </p>
                </div>
            </div>
        </section>

        <!-- Tsunami Section -->
        <section class="tsunami-section section-padding">
            <div class="container">
                <div class="tsunami-header">
                    <h2 class="section-title">Join The Health Transformation <span class="highlight">Revolution</span></h2>
                </div>
                <div class="tsunami-content-wrapper">
                    <div class="tsunami-left">
                        <div class="group-photo-container">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                alt="Group Photo - Shubh Jain with Students" class="group-photo">
                        </div>
                        <div class="tsunami-description">
                            <p>Over <strong>5,000+ busy professionals</strong> have transformed their health using my proven
                                methods and strategies.</p>
                            <p>This isn't just another fitness program - it's a <strong>complete health transformation
                                    system</strong> that works with your schedule.</p>
                            <p>Join the community of successful professionals who took action and transformed their health
                                while maintaining their careers.</p>
                        </div>
                    </div>
                    <div class="tsunami-right">
                        <div class="what-if-section">
                            <h3 class="what-if-title">What if you could transform your health in just 90 days?</h3>
                            <div class="what-if-steps">
                                <div class="what-if-step">
                                    <span class="step-number-badge">1</span>
                                    <span class="step-text">Master the metabolic principles of highly successful professionals</span>
                                </div>
                                <div class="what-if-step">
                                    <span class="step-number-badge">2</span>
                                    <span class="step-text">Build your sustainable nutrition system that fits your busy
                                        schedule</span>
                                </div>
                                <div class="what-if-step">
                                    <span class="step-number-badge">3</span>
                                    <span class="step-text">Create your movement routine that delivers maximum results
                                        in minimal time</span>
                                </div>
                                <div class="what-if-step">
                                    <span class="step-number-badge">4</span>
                                    <span class="step-text">Generate consistent energy and vitality while maintaining your
                                        demanding career</span>
                                </div>
                            </div>
                        </div>
                        <div class="comparison-container">
                            <div class="comparison-table">
                                <div class="comparison-column old-way">
                                    <div class="column-header">
                                        <h4>The Old Way</h4>
                                        <p>Struggling alone without guidance</p>
                                    </div>
                                    <div class="comparison-items">
                                        <div class="comparison-item">
                                            <span class="item-icon cross">✖</span>
                                            <div class="item-content">
                                                <span class="item-label">Manual</span>
                                                <span class="item-text">Trial and error approach wasting precious
                                                    time</span>
                                            </div>
                                        </div>
                                        <div class="comparison-item">
                                            <span class="item-icon cross">✖</span>
                                            <div class="item-content">
                                                <span class="item-label">Manual</span>
                                                <span class="item-text">No clear direction or proven roadmap to
                                                    follow</span>
                                            </div>
                                        </div>
                                        <div class="comparison-item">
                                            <span class="item-icon cross">✖</span>
                                            <div class="item-content">
                                                <span class="item-label">Manual</span>
                                                <span class="item-text">Inconsistent results that frustrate and
                                                    demotivate</span>
                                            </div>
                                        </div>
                                        <div class="comparison-item">
                                            <span class="item-icon cross">✖</span>
                                            <div class="item-content">
                                                <span class="item-label">Manual</span>
                                                <span class="item-text">Wasted money on courses that don't deliver
                                                    results</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="comparison-column new-way">
                                    <div class="column-header">
                                        <h4>The New Way</h4>
                                        <p>With my proven system and guidance</p>
                                    </div>
                                    <div class="comparison-items">
                                        <div class="comparison-item">
                                            <span class="item-icon check">✔</span>
                                            <div class="item-content">
                                                <span class="item-label">Automated</span>
                                                <span class="item-text">Proven step-by-step system that guarantees
                                                    results</span>
                                            </div>
                                        </div>
                                        <div class="comparison-item">
                                            <span class="item-icon check">✔</span>
                                            <div class="item-content">
                                                <span class="item-label">Automated</span>
                                                <span class="item-text">Clear roadmap to success with exact action
                                                    steps</span>
                                            </div>
                                        </div>
                                        <div class="comparison-item">
                                            <span class="item-icon check">✔</span>
                                            <div class="item-content">
                                                <span class="item-label">Automated</span>
                                                <span class="item-text">Consistent, predictable results within 90
                                                    days</span>
                                            </div>
                                        </div>
                                        <div class="comparison-item">
                                            <span class="item-icon check">✔</span>
                                            <div class="item-content">
                                                <span class="item-label">Automated</span>
                                                <span class="item-text">Investment that pays for itself within first
                                                    month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="enroll-button-container tsunami-enroll">
                    <button class="enroll-button">
                        RESERVE MY SPOT - FREE →
                    </button>
                    <p class="hurry-message">
                        <span class="red-check">✔</span>
                        <span class="red-check">✔</span> Hurry! Limited Seats Available!
                    </p>
                </div>
            </div>
        </section>

        <!-- Results Agenda Section -->
        <section class="results-agenda-section section-padding">
            <div class="container">
                <div class="results-agenda-header">
                    <h2 class="section-title">Your 90-Day <span class="highlight">Health Transformation Journey</span></h2>
                </div>
                <div class="agenda-sprint-grid">
                    <div class="agenda-sprint-card">
                        <div class="card-header">
                            <div class="agenda-icon-wrapper">
                                <img src="https://via.placeholder.com/40x40/ffffff/000000?text=Build" alt="Build Icon"
                                    class="agenda-icon">
                            </div>
                            <span class="day-label">Week 1-4</span>
                        </div>
                        <div class="card-content">
                            <h3 class="agenda-card-title">Foundation</h3>
                            <ul class="agenda-sprint-list">
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    EXACT 4-Step Metabolic Reset Protocol that only TOP 1% health professionals know.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    An ancient metabolic 'law' that 99.8% people MISS out, which stops them from achieving
                                    lasting transformation.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    An old-school nutrition strategy that works with your busy schedule and makes it almost
                                    neurologically impossible for you to not stick to your health goals.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    Once you know this - creating sustainable health habits & routines will be cake-walk!
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    And so much more...
                                </li>
                                <li class="agenda-list-item">
                                    <span class="agenda-list-icon">✅</span>
                                    <span class="agenda-item-text">Post-Workshop Private Community Access</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="agenda-sprint-card">
                        <div class="card-header">
                            <div class="agenda-icon-wrapper">
                                <img src="https://via.placeholder.com/40x40/ffffff/000000?text=Sell" alt="Sell Icon"
                                    class="agenda-icon">
                            </div>
                            <span class="day-label">Week 5-8</span>
                        </div>
                        <div class="card-content">
                            <h3 class="agenda-card-title">Acceleration</h3>
                            <ul class="agenda-sprint-list">
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    Your 'Reverse-math' to your NEXT 10 lakh payday.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    7-Figure Launch Checklist used behind every BIG launch.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    How to get your dream high-ticket clients lining up to work with you before you even
                                    pitch them.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    Battle-tested 5 Hour Engine that makes you the most money and sales in a shorter
                                    duration.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    The TOP SECRET *** technique to CRUSH your launch the very first time.
                                </li>
                                <li class="agenda-list-item">
                                    <span class="agenda-list-icon">✅</span>
                                    <span class="agenda-item-text">Post-Workshop Private Community Access</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="agenda-sprint-card">
                        <div class="card-header">
                            <div class="agenda-icon-wrapper">
                                <img src="https://via.placeholder.com/40x40/ffffff/000000?text=Scale" alt="Scale Icon"
                                    class="agenda-icon">
                            </div>
                            <span class="day-label">Week 9-12</span>
                        </div>
                        <div class="card-content">
                            <h3 class="agenda-card-title">Mastery</h3>
                            <ul class="agenda-sprint-list">
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    My 40 crores 'Signature-Talk' Framework.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    This #1 thing that absolutely EXTREME FEW PEOPLE do, but pulls in 60% more sales.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    How do I create presentations that are guaranteed to CRUSH.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    How to persuade the whole crowd without selling or talking about your product.
                                </li>
                                <li class="agenda-sprint-list-item">
                                    <span class="agenda-sprint-list-icon">🔹</span>
                                    The #1 strategy you can use to make any offer SELL AT ANY PRICE.
                                </li>
                                <li class="agenda-list-item">
                                    <span class="agenda-list-icon">✅</span>
                                    <span class="agenda-item-text">Post-Workshop Private Community Access</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="enroll-button-container results-agenda-enroll">
                    <button class="enroll-button">
                        RESERVE MY SPOT - FREE →
                    </button>
                    <p class="hurry-message">
                        <span class="red-check">✔</span>
                        <span class="red-check">✔</span> Hurry! Limited Seats Available!
                    </p>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section class="pricing-section section-padding">
            <div class="container">
                <h2 class="section-title">Choose Your <span class="highlight">Health Transformation Package</span></h2>
                <div class="pricing-table-wrapper">
                    <div class="pricing-table">
                        <div class="pricing-row">
                            <div class="pricing-row-content">
                                <span class="seats">Regular Price</span>
                                <span class="price">₹4,999</span>
                                <span class="bonus">Basic Workshop Access Only</span>
                            </div>
                        </div>
                        <div class="pricing-row recommended">
                            <div class="pricing-row-content">
                                <span class="seats"><span class="last-few-badge">ONLY 47 SEATS</span> Early Bird
                                    Special</span>
                                <span class="price">₹99</span>
                                <span class="bonus">+ ₹4,999 Worth of Exclusive Bonuses</span>
                            </div>
                            <div class="current-offer-tag">Current Offer</div>
                        </div>
                        <div class="pricing-row">
                            <div class="pricing-row-content">
                                <span class="seats">Last Minute</span>
                                <span class="price">₹1,999</span>
                                <span class="bonus">Standard Workshop Access</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="current-price-display">
                    Today Only Special Price: <span class="original-price">₹4,999</span> <span
                        class="original-price">₹1,999</span> <span class="discounted-price">FREE</span>
                </div>
                <div class="enroll-button-container pricing-enroll">
                    <button class="enroll-button">
                        RESERVE MY SPOT - FREE →
                    </button>
                    <p class="hurry-message">
                        <span class="red-check">✔</span>
                        <span class="red-check">✔</span> Hurry! Limited Seats Available!
                    </p>
                </div>
            </div>
        </section>

        <!-- Who Is Shubh Section -->
        <div class="who-is-shubh-section-wrapper">
            <section class="who-is-shubh-section">
                <div class="who-is-shubh-content">
                    <div class="expert-header">
                        <h2 class="section-title-light">👨‍⚕️ SECTION 10: MEET YOUR <span class="highlight">TRANSFORMATION EXPERT</span></h2>
                        <p class="expert-subtitle">Your Guide to Sustainable Health Transformation</p>
                    </div>
                    <div class="expert-main-content">
                        <div class="shubh-photo-container">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                                alt="Shubh Jain" class="shubh-photo">
                        </div>
                        <div class="shubh-details">
                            <div class="expert-intro">
                                <p class="expert-description">I'm excited to help you achieve your transformation goals - whether that's losing 3-5 kgs or completely transforming your lifestyle.</p>
                                <p class="expert-description">My team and I are backed by a global network of 300+ certified health specialists who've refined science-based protocols across 47 countries. Together, we've coached thousands of people to achieve sustainable results using evidence-based methods.</p>
                                <p class="expert-description">I'll personally help you customize your plan based on proven principles, stay on track with expert support, and keep you motivated throughout your transformation journey.</p>
                            </div>
                            <ul class="shubh-details-list">
                                <li class="shubh-details-list-item">
                                    <span class="shubh-details-icon">✓</span>
                                    Certified Health Transformation Specialist with 15+ years experience
                                </li>
                                <li class="shubh-details-list-item">
                                    <span class="shubh-details-icon">✓</span>
                                    Helped 5,000+ busy professionals transform their health
                                </li>
                                <li class="shubh-details-list-item">
                                    <span class="shubh-details-icon">✓</span>
                                    Backed by a global network of 300+ certified health specialists
                                </li>
                                <li class="shubh-details-list-item">
                                    <span class="shubh-details-icon">✓</span>
                                    Refined science-based protocols across 47 countries
                                </li>
                                <li class="shubh-details-list-item">
                                    <span class="shubh-details-icon">✓</span>
                                    Expert in sustainable results using evidence-based methods
                                </li>
                            </ul>
                            <div class="combined-results">
                                <h3>Combined Community Results:</h3>
                                <ul class="results-list">
                                    <li>5,000+ working professionals transformed</li>
                                    <li>94% success rate in sustainable results</li>
                                    <li>15 Min Daily System</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <!-- FAQ Section -->
        <section class="faq-section section-padding">
            <div class="container">
                <h2 class="section-title">Frequently Asked <span class="highlight">Questions</span></h2>
                <div class="faq-container">
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(0)">
                            <span>Is this really free?</span>
                            <span class="faq-arrow" id="arrow-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        <div class="faq-answer" id="answer-0" style="display: none;">
                            <p>Yes, the live workshop is completely free. The only cost is the optional VIP upgrade for additional resources.</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(1)">
                            <span>What if I can't attend live?</span>
                            <span class="faq-arrow" id="arrow-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        <div class="faq-answer" id="answer-1" style="display: none;">
                            <p>The session will be recorded, but live attendees get priority for Q&A and bonuses. VIP members get immediate recording access.</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(2)">
                            <span>Will this work with my crazy schedule?</span>
                            <span class="faq-arrow" id="arrow-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        <div class="faq-answer" id="answer-2" style="display: none;">
                            <p>This system was specifically designed for professionals working 50+ hours per week. Every strategy accounts for time constraints.</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(3)">
                            <span>I've tried everything. How is this different?</span>
                            <span class="faq-arrow" id="arrow-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        <div class="faq-answer" id="answer-3" style="display: none;">
                            <p>Most programs force you to fit your life around their system. This 5-step method fits transformation around your existing schedule and responsibilities.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="container">
                <div class="footer-copyright">
                    <p>© 2024 Success Academy. All rights reserved.</p>
                </div>
                <div class="footer-disclaimer">
                    <p>Results shown are not typical and may vary. Success requires dedication, hard work, and
                        consistent action. This is an educational program and individual results depend on individual
                        effort and circumstances.</p>
                </div>
            </div>
        </footer>

        <!-- Floating CTA Bar -->
        <div class="floating-cta-bar">
            <div class="floating-cta-bar__container">
                <div class="floating-cta-bar__content">
                    <div class="floating-cta-bar__info-section">
                        <div class="floating-cta-bar__price-details">
                            <span class="floating-cta-bar__price-current">free</span>
                            <span class="floating-cta-bar__price-original">₹999</span>
                        </div>
                        <div class="floating-cta-bar__deadline">Offer ends June 30, 2025</div>
                    </div>
                    <div class="floating-cta-bar__action-section">
                        <button class="floating-cta-bar__button">ENROLL NOW</button>
                        <div class="floating-cta-bar__bonus-text">+ Unbelievable Bonuses</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Professional Testimonials Section -->
        <section class="testimonials-section">
            <div class="testimonials-container">
                <div class="testimonials-title">
                    <h2>What Our Clients Say</h2>
                    <p>Real results from real people who transformed their health with our system</p>
                </div>
                
                <div class="testimonials-scroll-container">
                    <!-- Testimonial Card 1 -->
                    <div class="story-card story-card--gray">
                        <div class="story-content">
                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                            <p class="story-quote">"Lost 8 kgs in 60 days despite a crazy travel schedule. This system is pure magic for busy people like me."</p>
                            <div>
                                <div class="story-author">Priya S.</div>
                                <div class="story-role">Marketing Head, Mumbai</div>
                                <div class="story-location">Mumbai, India</div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face" alt="Priya S." class="story-profile">
                        </div>
                    </div>

                    <!-- Testimonial Card 2 -->
                    <div class="story-card story-card--gray">
                        <div class="story-content">
                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                            <p class="story-quote">"My energy levels are through the roof. I am more productive at work and finally have energy for my kids in the evening."</p>
                            <div>
                                <div class="story-author">Amit K.</div>
                                <div class="story-role">IT Project Manager, Bangalore</div>
                                <div class="story-location">Bangalore, India</div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Amit K." class="story-profile">
                        </div>
                    </div>

                    <!-- Testimonial Card 3 - Blue -->
                    <div class="story-card story-card--blue">
                        <div class="story-content">
                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                            <p class="story-quote">"I thought I had to choose between my business and my health. This proved me wrong. Best investment I have ever made."</p>
                            <div>
                                <div class="story-author">Sunita M.</div>
                                <div class="story-role">Entrepreneur, Delhi</div>
                                <div class="story-location">Delhi, India</div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" alt="Sunita M." class="story-profile">
                        </div>
                    </div>

                    <!-- Stats Card -->
                    <div class="story-card story-card--image" style="background-image: url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=280&fit=crop&crop=face');">
                        <div class="story-content">
                            <div class="story-stats">
                                <span class="story-stat-number">94%</span>
                                <div class="story-stat-label">Success Rate</div>
                            </div>
                            <div class="story-stats">
                                <span class="story-stat-number">5,000+</span>
                                <div class="story-stat-label">Professionals Transformed</div>
                            </div>
                        </div>
                    </div>

                    <!-- Testimonial Card 4 -->
                    <div class="story-card story-card--gray">
                        <div class="story-content">
                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                            <p class="story-quote">"From 3 PM energy crashes to all-day productivity. This system transformed my entire lifestyle and career."</p>
                            <div>
                                <div class="story-author">Rajesh P.</div>
                                <div class="story-role">Software Engineer, Pune</div>
                                <div class="story-location">Pune, India</div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Rajesh P." class="story-profile">
                        </div>
                    </div>

                    <!-- Testimonial Card 5 -->
                    <div class="story-card story-card--blue">
                        <div class="story-content">
                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                            <p class="story-quote">"Finally found a system that works with my hectic schedule. Lost weight without compromising my family time."</p>
                            <div>
                                <div class="story-author">Kavita R.</div>
                                <div class="story-role">HR Manager, Chennai</div>
                                <div class="story-location">Chennai, India</div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" alt="Kavita R." class="story-profile">
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
            `,
            js: `let videoPlaying=false;function handlePlayButtonClick(){const videoWrapper=document.querySelector('.video-placeholder-wrapper');const playButton=document.querySelector('.play-button-overlay');const overlayText=document.querySelector('.video-placeholder-overlay-text');if(playButton){playButton.style.display='none';}if(overlayText){overlayText.style.display='none';}const video=document.createElement('video');video.className='active-video-player';video.controls=true;video.autoplay=true;video.style.width='100%';video.style.height='100%';video.style.objectFit='cover';video.src='https://www.w3schools.com/html/mov_bbb.mp4';const placeholder=document.querySelector('.video-placeholder');if(placeholder){placeholder.innerHTML='';placeholder.appendChild(video);}videoPlaying=true;}const openFAQs={};function toggleFAQ(index){const answer=document.getElementById('answer-'+index);const arrow=document.getElementById('arrow-'+index);if(openFAQs[index]){answer.style.display='none';arrow.classList.remove('open');openFAQs[index]=false;}else{answer.style.display='block';arrow.classList.add('open');openFAQs[index]=true;}}let currentTestimonialSlide=0;const totalTestimonials=3;function nextTestimonial(){currentTestimonialSlide=(currentTestimonialSlide===totalTestimonials-1)?0:currentTestimonialSlide+1;updateTestimonialSlider();}function prevTestimonial(){currentTestimonialSlide=(currentTestimonialSlide===0)?totalTestimonials-1:currentTestimonialSlide-1;updateTestimonialSlider();}function updateTestimonialSlider(){const track=document.querySelector('.testimonial-slider-track');if(track){const cardWidth=350;const gap=30;const translateX=-currentTestimonialSlide*(cardWidth+gap);track.style.transform='translateX('+translateX+'px)';}}function updateDeadline(){const deadlineElement=document.querySelector('.floating-cta-bar__deadline');if(deadlineElement){const deadlineDate=new Date("2025-06-30");const options={year:'numeric',month:'long',day:'numeric'};const formattedDate=deadlineDate.toLocaleDateString('en-US',options);deadlineElement.textContent='Offer ends '+formattedDate;}}function generateTransformations(){const testimonials=[{name:'Priya S.',role:'Marketing Head, Mumbai',quote:'Lost 8 kgs in 60 days despite a crazy travel schedule. This system is pure magic for busy people like me.',badges:['Lost 8 kgs','Energy Boost','60 Days']},{name:'Amit K.',role:'IT Project Manager, Bangalore',quote:'My energy levels are through the roof. I am more productive at work and finally have energy for my kids in the evening.',badges:['15 kgs Lost','Better Sleep','90 Days']},{name:'Sunita M.',role:'Entrepreneur, Delhi',quote:'I thought I had to choose between my business and my health. This proved me wrong. Best investment I have ever made.',badges:['12 kgs Lost','Business Growth','75 Days']},{name:'Rajesh P.',role:'Software Engineer, Pune',quote:'From 3 PM energy crashes to all-day productivity. This system transformed my entire lifestyle and career.',badges:['18 kgs Lost','No Energy Crashes','45 Days']},{name:'Kavita R.',role:'HR Manager, Chennai',quote:'Finally found a system that works with my hectic schedule. Lost weight without compromising my family time.',badges:['10 kgs Lost','Family Time','60 Days']},{name:'Vikram S.',role:'Sales Director, Hyderabad',quote:'This system saved my life. Diabetes under control, energy restored, and confidence back. Thank you!',badges:['20 kgs Lost','Diabetes Control','90 Days']},{name:'Meera J.',role:'Banking Professional, Kolkata',quote:'Never thought I could transform at 45. This system proved age is just a number. Feeling 25 again!',badges:['14 kgs Lost','Youthful Energy','75 Days']},{name:'Arjun M.',role:'Startup Founder, Gurgaon',quote:'From startup stress eating to healthy habits. This system helped me build discipline that reflects in my business too.',badges:['16 kgs Lost','Better Focus','60 Days']},{name:'Rohit K.',role:'Consultant, Mumbai',quote:'Travel-friendly system that works in hotels, airports, anywhere. Finally, a solution for frequent travelers!',badges:['11 kgs Lost','Travel Friendly','50 Days']},{name:'Neha T.',role:'Corporate Lawyer, Delhi',quote:'High-pressure job, irregular hours, but this system adapted to my life. Lost weight without losing my edge.',badges:['13 kgs Lost','High Performance','65 Days']}];const track=document.querySelector('.transformations-top-track');if(track){track.innerHTML='';testimonials.forEach((testimonial,index)=>{const card=document.createElement('div');card.className='transformation-slide-card';card.style.cssText='flex: 0 0 420px; height: 520px; border-radius: 24px; overflow: hidden; position: relative; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); background: linear-gradient(145deg, var(--primary-dark-color) 0%, var(--primary-color) 50%, var(--bg-dark-blue) 100%); border: 2px solid var(--accent-color); backdrop-filter: blur(25px); display: flex; flex-direction: column;';card.innerHTML='<div class="transformation-content" style="height: 100%; display: flex; flex-direction: column;"><div class="transformation-header" style="text-align: center; padding: 24px 20px 20px; background: linear-gradient(145deg, rgba(74, 105, 187, 0.9) 0%, rgba(59, 82, 138, 0.8) 100%); border-bottom: 2px solid var(--accent-color); flex-shrink: 0;"><div class="transformation-name" style="font-family: Playfair Display, serif; font-size: 1.5rem; font-weight: 700; color: var(--text-white); margin-bottom: 6px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">'+testimonial.name+'</div><div class="transformation-role" style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">'+testimonial.role+'</div></div><div class="before-after-images" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 30px 24px; position: relative; flex: 1; align-items: center;"><div class="before-image" style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); transition: all 0.3s ease; height: 220px;"><img src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=400&fit=crop&crop=face" alt="Before" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.95) contrast(1.05); transition: all 0.3s ease;"><div class="image-label" style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); color: white; padding: 6px 16px; border-radius: 16px; font-size: 12px; font-weight: 700; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);">Before</div></div><div class="after-image" style="position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); transition: all 0.3s ease; height: 220px;"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face" alt="After" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.95) contrast(1.05); transition: all 0.3s ease;"><div class="image-label" style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); color: white; padding: 6px 16px; border-radius: 16px; font-size: 12px; font-weight: 700; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); background: linear-gradient(135deg, var(--accent-color) 0%, #e67e22 100%);">After</div></div></div><div class="transformation-quote" style="color: rgba(255, 255, 255, 0.95); font-size: 14px; line-height: 1.6; font-style: italic; text-align: center; padding: 24px 20px; background: linear-gradient(145deg, rgba(59, 82, 138, 0.9) 0%, rgba(74, 105, 187, 0.8) 100%); border-top: 2px solid var(--accent-color); flex-shrink: 0;">'+testimonial.quote+'<div style="margin-top: 16px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">'+testimonial.badges.map(badge=>'<span style="background: linear-gradient(135deg, var(--accent-color) 0%, #e67e22 100%); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);">✅ '+badge+'</span>').join('')+'</div></div></div>';track.appendChild(card);});}}document.addEventListener('DOMContentLoaded',function(){updateDeadline();generateTransformations();const animatedElements=document.querySelectorAll('.animate-on-scroll');const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');}});},{threshold:0.1,rootMargin:"0px 0px -50px 0px"});animatedElements.forEach(el=>observer.observe(el));});document.addEventListener('DOMContentLoaded',function(){const enrollButtons=document.querySelectorAll('.enroll-button, .floating-cta-bar__button');enrollButtons.forEach(button=>{button.addEventListener('click',function(){alert('Enrollment functionality would be implemented here!');});});});document.addEventListener('DOMContentLoaded',function(){document.documentElement.style.scrollBehavior='smooth';});`
        },
 'second_template': {
            name: 'FITNESS WEBINAR DAY 1',
            description: 'A friendly welcome page with a clean design and clear CTA, updated with new webinar content.',
            thumbnail: 'https://placehold.co/400x300/10b981/ffffff?text=Sales+VSL&font=montserrat&style=illustration',
            css: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;500;600;700&family=Shadows+Into+Light&display=swap');
        :root {
            --primary-color: #4A69BB;
            --primary-dark-color: #3B528A;
            --secondary-color: #4A69BB;
            --accent-color: #F39C12;
            --cta-color: #3B528A;
            --cta-hover-color: #4A69BB;
            --text-dark: #2C3E50;
            --text-medium: #34495E;
            --text-light: #7F8C8D;
            --text-white: #FFFFFF;
            --bg-white: #FFFFFF;
            --bg-light-gray: #F8F9FA;
            --bg-dark-blue: #283747;
            --border-color: #DEE2E6;
            --highlight-bg: rgba(243, 156, 18, 0.2);
            --highlight-red-bg: rgba(231, 76, 60, 0.1);
            --highlight-red-text: #C0392B;
            --highlight-blue-bg: rgba(74, 105, 187, 0.1);
            --highlight-blue-text: #3B528A;
            --font-family-headings: 'Playfair Display', serif;
            --font-family-body: 'Poppins', sans-serif;
            --font-family-handwritten: 'Shadows Into Light', cursive;
            --font-weight-light: 300;
            --font-weight-normal: 400;
            --font-weight-medium: 500;
            --font-weight-semibold: 600;
            --font-weight-bold: 700;
            --border-radius-sm: 6px;
            --border-radius-md: 10px;
            --border-radius-lg: 18px;
            --border-radius-xl: 28px;
            --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
            --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.08);
            --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
            --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family-body);
            background-color: var(--bg-white);
            color: var(--text-medium);
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .page-wrapper {
            overflow-x: hidden;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .section-padding {
            padding: 80px 0;
        }

        .top-bar {
            text-align: center;
            padding: 15px 20px;
            font-size: 1rem;
            font-weight: var(--font-weight-medium);
            background: linear-gradient(90deg, var(--accent-color), #FFD700);
            color: var(--text-dark);
            box-shadow: var(--shadow-sm);
            animation: topBarPulse 4s ease-in-out infinite;
        }
        @keyframes topBarPulse {
            0%, 100% { 
                background: linear-gradient(90deg, var(--accent-color), #FFD700);
            }
            50% { 
                background: linear-gradient(90deg, #FFD700, var(--accent-color));
            }
        }

        .hero-pricing-section {
            background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #F8F9FA 100%);
            text-align: center;
            padding: 60px 0 80px;
            color: var(--text-dark);
            position: relative;
            overflow: hidden;
            animation: heroGlow 8s ease-in-out infinite;
        }
        .hero-pricing-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(74, 105, 187, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(243, 156, 18, 0.12) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(74, 105, 187, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 90% 20%, rgba(243, 156, 18, 0.15) 0%, transparent 50%);
            z-index: 1;
            animation: backgroundFloat 20s ease-in-out infinite;
        }
        @keyframes heroGlow {
            0%, 100% { 
                box-shadow: 0 0 0 0 rgba(74, 105, 187, 0.1);
            }
            50% { 
                box-shadow: 0 0 40px 20px rgba(74, 105, 187, 0.05);
            }
        }
        .matrix-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(20, 1fr);
            grid-template-rows: repeat(15, 1fr);
            gap: 8px;
            padding: 20px;
            z-index: 0;
            opacity: 0.12;
        }
        .matrix-box {
            background: linear-gradient(135deg, 
                rgba(74, 105, 187, 0.3), 
                rgba(243, 156, 18, 0.2), 
                rgba(74, 105, 187, 0.3));
            border-radius: 6px;
            animation: matrixFloat 6s ease-in-out infinite;
            border: 1px solid rgba(74, 105, 187, 0.2);
            box-shadow: 0 2px 8px rgba(74, 105, 187, 0.08);
        }
        .matrix-box:nth-child(odd) {
            animation-delay: 0s;
            background: linear-gradient(135deg, 
                rgba(243, 156, 18, 0.25), 
                rgba(74, 105, 187, 0.2), 
                rgba(243, 156, 18, 0.25));
            border-color: rgba(243, 156, 18, 0.2);
        }
        .matrix-box:nth-child(even) {
            animation-delay: 2s;
        }
        .matrix-box:nth-child(3n) {
            animation-delay: 4s;
        }
        .matrix-box:nth-child(5n) {
            animation-delay: 1s;
        }
        .matrix-box:nth-child(7n) {
            animation-delay: 3s;
        }
        @keyframes matrixFloat {
            0%, 100% { 
                transform: translateY(0px) rotate(0deg);
                opacity: 0.12;
            }
            50% { 
                transform: translateY(-5px) rotate(1deg);
                opacity: 0.2;
            }
        }
        .hero-pricing-section .container {
            position: relative;
            z-index: 3;
        }

        .hero-title {
            font-family: var(--font-family-headings);
            font-size: 3rem;
            font-weight: var(--font-weight-bold);
            line-height: 1.3;
            margin-bottom: 20px;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
        }

        .sub-headline {
            font-size: 1.2rem;
            font-style: italic;
            font-weight: var(--font-weight-light);
            margin-bottom: 20px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .hero-description {
            font-size: 1.1rem;
            color: var(--text-medium);
            margin-bottom: 40px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }

        .hero-pills {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
            flex-wrap: wrap;
        }

        .hero-pill {
            padding: 12px 25px;
            border-radius: var(--border-radius-xl);
            font-size: 1rem;
            font-weight: var(--font-weight-semibold);
            box-shadow: var(--shadow-sm);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background-color: var(--bg-white);
            color: var(--text-dark);
            border: 1px solid var(--border-color);
        }

        .hero-pill:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
        }
        
        .video-registration-container {
            display: flex;
            flex-direction: column;
            gap: 40px;
            align-items: center;
            margin-top: 50px;
        }

        .video-section {
            flex: 1 1 550px;
            max-width: 600px;
            width: 100%;
        }

        .video-placeholder-wrapper {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            margin-bottom: 25px;
            background-color: #000;
        }

        .video-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80') center/cover no-repeat;
        }
        
        .video-placeholder-overlay-text {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            color: var(--text-white);
            font-size: 1.4rem;
            font-weight: var(--font-weight-semibold);
            text-shadow: 2px 2px 5px rgba(0,0,0,0.7);
        }

        .play-button-overlay {
            position: absolute;
            width: 90px;
            height: 90px;
            background-color: rgba(255, 255, 255, 0.25);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.5s ease;
            backdrop-filter: blur(8px);
            animation: pulse 2s infinite;
        }
        .play-icon { width: 45px; height: 45px; fill: var(--text-white); }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
            50% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
        }

        .event-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
        }

        .event-detail-box {
            background-color: var(--bg-white);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-md);
            padding: 15px;
            text-align: center;
            box-shadow: var(--shadow-sm);
        }
        .event-detail-icon { font-size: 1.5rem; margin-bottom: 8px; color: var(--primary-color); }
        .event-detail-label { font-size: 0.75rem; color: var(--text-light); text-transform: uppercase; margin-bottom: 4px; }
        .event-detail-value { font-size: 0.9rem; font-weight: var(--font-weight-semibold); color: var(--text-dark); }
        
        .registration-form-wrapper {
            flex: 1 1 500px;
            max-width: 550px;
            width: 100%;
        }

        .registration-form-card {
            background-color: var(--bg-white);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            padding: 35px;
            box-shadow: var(--shadow-xl);
        }
        .registration-form-card h3 {
            font-family: var(--font-family-body);
            margin: 0 0 20px 0;
            color: var(--text-dark);
            font-size: 1.4rem;
            font-weight: var(--font-weight-semibold);
            text-align: center;
        }

        .bonus-list {
            list-style: none;
            padding: 0;
            margin: 0 0 25px 0;
        }
        .bonus-list-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            font-size: 1rem;
            line-height: 1.6;
        }
        .bonus-list-item span:first-child { margin-right: 10px; color: var(--primary-color); }

        .form-subheadline {
            text-align: center;
            font-size: 1.2rem;
            font-weight: var(--font-weight-medium);
            color: var(--text-dark);
            margin-bottom: 20px;
        }
        
        .enroll-button-container { text-align: center; }
        .enroll-button {
            background: linear-gradient(90deg, var(--cta-color), var(--cta-hover-color));
            color: var(--text-white);
            border: none;
            padding: 18px 35px;
            font-size: 1.3rem;
            font-weight: var(--font-weight-bold);
            border-radius: var(--border-radius-xl);
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(59, 82, 138, 0.35);
            width: 100%;
            transition: all 0.3s ease;
            text-transform: uppercase;
        }
        .enroll-button:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 12px 25px rgba(74, 105, 187, 0.45);
            animation: buttonGlow 2s ease-in-out infinite;
        }
        @keyframes buttonGlow {
            0%, 100% { 
                box-shadow: 0 12px 25px rgba(74, 105, 187, 0.45);
            }
            50% { 
                box-shadow: 0 12px 25px rgba(74, 105, 187, 0.6), 0 0 30px rgba(243, 156, 18, 0.4);
            }
        }
        .hurry-message {
            margin-top: 15px;
            font-size: 1rem;
            font-weight: var(--font-weight-medium);
        }

        .section-title {
            font-family: var(--font-family-headings);
            font-size: 2.8rem;
            font-weight: var(--font-weight-bold);
            text-align: center;
            margin-bottom: 20px;
            line-height: 1.3;
            color: var(--text-dark);
        }

        .section-subtitle {
            font-size: 1.15rem;
            color: var(--text-light);
            text-align: center;
            max-width: 800px;
            margin: 0 auto 50px auto;
        }

        .benefits-section { background-color: var(--bg-light-gray); }
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
        }
        .benefit-item {
            background-color: var(--bg-white);
            border-radius: var(--border-radius-lg);
            padding: 30px;
            text-align: center;
            box-shadow: var(--shadow-md);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .benefit-item:hover {
            transform: translateY(-10px) rotateY(5deg);
            box-shadow: var(--shadow-lg);
            animation: benefitFloat 3s ease-in-out infinite;
        }
        @keyframes benefitFloat {
            0%, 100% { 
                transform: translateY(-10px) rotateY(5deg);
            }
            50% { 
                transform: translateY(-15px) rotateY(-5deg);
            }
        }
        .benefit-icon { font-size: 2.5rem; margin-bottom: 20px; color: var(--primary-color); }
        .benefit-text { font-size: 1rem; color: var(--text-medium); line-height: 1.6; }

        .pain-point-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 40px;
            align-items: flex-start;
        }
        .pain-point-left p { font-size: 1.1rem; line-height: 1.8; margin-bottom: 20px; }
        .pain-point-right {
            background-color: var(--highlight-red-bg);
            border: 1px solid #FECACA;
            border-radius: var(--border-radius-lg);
            padding: 30px;
        }
        .pain-point-list { list-style: none; padding: 0; margin: 0; }
        .pain-point-list li {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            font-size: 1rem;
        }
        .pain-point-list li::before { content: '❌'; margin-right: 12px; font-size: 1.1rem; margin-top: 2px; }
        .transition-text {
            text-align: center;
            font-size: 1.3rem;
            font-weight: var(--font-weight-bold);
            color: var(--text-dark);
            margin-top: 50px;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        }

        .reverse-funnel-section { background-color: var(--bg-light-gray); }
        .funnel-diagram {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .funnel-step {
            background: var(--bg-white);
            border-radius: var(--border-radius-lg);
            padding: 30px;
            text-align: center;
            box-shadow: var(--shadow-lg);
            width: 100%;
            max-width: 340px;
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .funnel-step:hover { transform: translateY(-10px); box-shadow: var(--shadow-xl); }
        .funnel-step-icon-wrapper { font-size: 2.5rem; margin-bottom: 15px; }
        .funnel-step-number {
            font-size: 0.8rem;
            color: var(--text-light);
            font-weight: var(--font-weight-bold);
            margin-bottom: 10px;
            background-color: rgba(0, 0, 0, 0.05);
            display: inline-block;
            padding: 4px 10px;
            border-radius: var(--border-radius-sm);
        }
        .funnel-step p { line-height: 1.5; margin: 0; font-size: 1rem; }

        .social-proof-marquee-section { 
            padding: 80px 0; 
            background: linear-gradient(145deg, 
                rgba(255, 255, 255, 0.98) 0%, 
                rgba(248, 250, 252, 0.95) 100%);
            position: relative;
            overflow: hidden;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
        }
        .stats-bar {
            background: linear-gradient(90deg, var(--primary-dark-color), var(--primary-color));
            color: var(--text-white);
            padding: 25px;
            text-align: center;
            font-size: 1.3rem;
            font-weight: var(--font-weight-semibold);
            margin-bottom: 60px;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
        }
        .stories-container {
            position: relative;
            z-index: 2;
            overflow: hidden;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
        }
        .stories-top-row {
            display: flex;
            overflow-x: hidden;
            margin-bottom: 50px;
            position: relative;
            padding: 20px 0;
            width: 100%;
            background: linear-gradient(135deg, rgba(74, 105, 187, 0.03) 0%, rgba(243, 156, 18, 0.03) 100%);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(74, 105, 187, 0.1);
        }
        .stories-top-track {
            display: flex;
            gap: 0px;
            animation: slideRightSeamless 30s linear infinite;
            will-change: transform;
            padding: 0;
            width: max-content;
            animation-fill-mode: both;
            transform: translateZ(0);
            min-width: 200%;
        }
        .transformations-top-row {
            display: flex;
            overflow-x: hidden;
            margin-bottom: 50px;
            position: relative;
            padding: 30px 0;
            width: 100%;
            background: linear-gradient(135deg, 
                rgba(74, 105, 187, 0.05) 0%, 
                rgba(243, 156, 18, 0.03) 50%,
                rgba(74, 105, 187, 0.05) 100%);
            border-radius: 24px;
            box-shadow: 
                0 12px 40px rgba(74, 105, 187, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(74, 105, 187, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .transformations-top-track {
            display: flex;
            gap: 35px;
            animation: slideRightSeamless 20s linear infinite;
            will-change: transform;
            padding: 0 40px;
            width: max-content;
            animation-fill-mode: both;
            transform: translateZ(0);
            min-width: 200%;
        }
        
        .transformations-top-track:hover {
            animation-play-state: paused;
        }
        .transformations-bottom-row {
            display: flex;
            overflow-x: hidden;
            margin-bottom: 50px;
            position: relative;
            padding: 30px 0;
            width: 100%;
            background: linear-gradient(135deg, 
                rgba(243, 156, 18, 0.05) 0%, 
                rgba(74, 105, 187, 0.03) 50%,
                rgba(243, 156, 18, 0.05) 100%);
            border-radius: 24px;
            box-shadow: 
                0 12px 40px rgba(243, 156, 18, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(243, 156, 18, 0.1);
            backdrop-filter: blur(10px);
        }
        .transformations-bottom-track {
            display: flex;
            gap: 35px;
            animation: slideRightSeamless 20s linear infinite;
            will-change: transform;
            padding: 0 40px;
            width: max-content;
            animation-fill-mode: both;
            transform: translateZ(0);
            min-width: 200%;
        }

        .transformations-bottom-track:hover {
            animation-play-state: paused;
        }
        @keyframes slideRight {
            0% {
                transform: translateX(0%);
            }
            100% {
                transform: translateX(-50%);
            }
        }
        
        @keyframes slideRightSeamless {
            0% {
                transform: translateX(0);
            }
            100% {
                transform: translateX(-50%);
            }
        }

        @keyframes slideLeftSeamless {
            0% {
                transform: translateX(-50%);
            }
            100% {
                transform: translateX(0);
            }
        }
        
        @keyframes slideLeft {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(0%);
            }
        }
        
        .stories-top-row:hover .stories-top-track {
            animation-play-state: paused;
        }
        
        .stories-bottom-row:hover .stories-bottom-track {
            animation-play-state: paused;
        }
        
        .stories-top-row, .stories-bottom-row {
            width: 100%;
            overflow: hidden;
            position: relative;
        }
        
        .stories-top-track, .stories-bottom-track {
            display: flex;
            width: max-content;
            animation-fill-mode: both;
            transform: translateZ(0);
            min-width: 200%;
        }
        .story-card {
            flex: 0 0 380px;
            min-height: 300px;
            max-height: 400px;
            border-radius: var(--border-radius-lg);
            overflow: hidden;
            position: relative;
            background: linear-gradient(145deg, #ffffff 0%, rgba(74, 105, 187, 0.05) 100%);
            box-shadow: 0 10px 30px rgba(74, 105, 187, 0.15);
            border: 2px solid rgba(74, 105, 187, 0.2);
            transition: all 0.4s ease;
            cursor: pointer;
            margin: 0 15px;
            display: flex;
            flex-direction: column;
        }
        
        .story-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(74, 105, 187, 0.25);
        }
        
        .story-card-content {
            padding: 30px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            z-index: 2;
        }
        
        .story-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .story-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary-color);
        }
        
        .story-author-info h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-dark);
        }
        
        .story-author-info p {
            margin: 0;
            font-size: 14px;
            color: var(--text-light);
        }
        
        .story-quote {
            font-style: italic;
            font-size: 15px;
            line-height: 1.5;
            color: var(--text-dark);
            margin-bottom: 20px;
            flex-grow: 1;
        }
        
        .story-results-text {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-color);
            margin: 0;
        }
        @keyframes cardPulse {
            0%, 100% { 
                box-shadow: 0 25px 60px rgba(74, 105, 187, 0.25);
            }
            50% { 
                box-shadow: 0 25px 60px rgba(74, 105, 187, 0.4), 0 0 20px rgba(243, 156, 18, 0.3);
            }
        }
        .story-card-content {
            padding: 30px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            z-index: 2;
        }
        .story-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .story-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 15px;
            border: 3px solid var(--primary-color);
            box-shadow: 0 4px 12px rgba(74, 105, 187, 0.2);
        }
        .story-author-info h4 {
            margin: 0;
            font-size: 1.2rem;
            color: var(--text-dark);
            font-weight: var(--font-weight-semibold);
        }
        .story-author-info p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-light);
        }
        .story-quote {
            font-size: 1rem;
            line-height: 1.6;
            color: var(--text-medium);
            font-style: italic;
            margin-bottom: 20px;
            flex-grow: 1;
        }
        .story-results {
            background: var(--highlight-blue-bg);
            padding: 15px;
            border-radius: var(--border-radius-md);
            border-left: 4px solid var(--primary-color);
        }
        .story-results-text {
            font-size: 0.9rem;
            font-weight: var(--font-weight-semibold);
            color: var(--highlight-blue-text);
            margin: 0;
        }

        .tsunami-section { background-color: var(--bg-light-gray); }
        .tsunami-content-wrapper { display: grid; grid-template-columns: 1fr; gap: 50px; align-items: flex-start; }
        .tsunami-left { display: flex; flex-direction: column; gap: 20px; }
        .group-photo-container { width: 100%; border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-xl); }
        .group-photo { width: 100%; height: auto; display: block; }
        .tsunami-description p { font-size: 1.05rem; line-height: 1.8; margin-bottom: 18px; }
        .tsunami-right { display: flex; flex-direction: column; gap: 40px; }
        .what-if-section {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark-color));
            padding: 35px;
            border-radius: var(--border-radius-lg);
            color: var(--text-white);
            box-shadow: var(--shadow-lg);
        }
        .what-if-title { font-size: 1.8rem; margin: 0 0 25px 0; font-weight: var(--font-weight-bold); }
        .what-if-steps { display: flex; flex-direction: column; gap: 20px; }
        .what-if-step { display: flex; align-items: flex-start; gap: 15px; }
        .step-number-badge {
            background: rgba(255, 255, 255, 0.2);
            min-width: 32px; height: 32px; border-radius: 50%;
            font-weight: var(--font-weight-bold);
            display: inline-flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .step-text { flex: 1; line-height: 1.6; font-size: 1.05rem; }
        .comparison-container { background: var(--bg-white); border-radius: var(--border-radius-lg); overflow: hidden; box-shadow: var(--shadow-xl); }
        .comparison-table { display: grid; grid-template-columns: 1fr; }
        .comparison-column { display: flex; flex-direction: column; }
        .column-header { padding: 25px 20px; text-align: center; font-weight: var(--font-weight-bold); }
        .column-header h4 { font-family: var(--font-family-headings); margin: 0 0 5px 0; font-size: 1.6rem; }
        .column-header p { margin: 0; font-size: 0.9rem; opacity: 0.9; }
        .old-way { background-color: #FFF1F2; }
        .old-way .column-header { background-color: #FECACA; color: #991B1B; }
        .new-way { background-color: #F0FDF4; }
        .new-way .column-header { background-color: #BBF7D0; color: #14532D; }
        .comparison-items { padding: 20px; }
        .comparison-item { display: flex; align-items: flex-start; padding: 12px 0; gap: 12px; border-bottom: 1px solid var(--border-color); }
        .comparison-item:last-child { border-bottom: none; }
        .item-label { font-size: 0.7rem; font-weight: var(--font-weight-bold); text-transform: uppercase; margin-bottom: 3px; display: block; }
        .old-way .item-label { color: #B91C1C; }
        .new-way .item-label { color: #166534; }
        .item-text { font-size: 0.95rem; line-height: 1.5; }

        .results-agenda-section { background-color: var(--bg-white); }
        .agenda-sprint-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .agenda-sprint-card {
            background-color: var(--bg-light-gray);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
            transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .agenda-sprint-card:hover { transform: translateY(-10px); box-shadow: var(--shadow-xl); }
        .agenda-sprint-card .card-header { padding: 20px; background: linear-gradient(45deg, var(--primary-color), var(--secondary-color)); color: var(--text-white); }
        .day-label { font-family: var(--font-family-body); font-size: 1.2rem; font-weight: var(--font-weight-bold); text-align: center; }
        .agenda-sprint-card .card-content { padding: 30px; }
        .agenda-card-title { font-family: var(--font-family-headings); font-size: 1.6rem; color: var(--text-dark); margin: 0 0 20px 0; }
        .agenda-sprint-list { list-style: none; padding: 0; margin: 0; }
        .agenda-sprint-list-item { display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 0.95rem; line-height: 1.6; }
        .agenda-sprint-list-item::before { content: '✅'; color: #16A34A; margin-right: 10px; margin-top: 3px; }

        .who-is-shubh-section-wrapper { background-color: var(--bg-dark-blue); padding: 80px 0; color: var(--text-white); }
        .who-is-shubh-content { display: flex; flex-direction: column; align-items: center; gap: 40px; }
        .shubh-photo-container { position: relative; }
        .shubh-photo {
            width: 250px;
            height: 250px;
            border-radius: 50%;
            object-fit: cover;
            border: 6px solid var(--primary-color);
            box-shadow: 0 0 30px rgba(74, 105, 187, 0.4);
        }
        .shubh-details { text-align: center; max-width: 800px; }
        .coach-name { font-family: var(--font-family-headings); font-size: 2.5rem; margin-bottom: 10px; }
        .coach-tagline { font-size: 1.2rem; font-weight: var(--font-weight-medium); color: var(--accent-color); margin-bottom: 25px; }
        .coach-bio-text { font-size: 1.1rem; line-height: 1.8; margin-bottom: 40px; color: rgba(255, 255, 255, 0.9); }
        .coach-differentiators {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            text-align: left;
        }
        .differentiator-card {
            background-color: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: var(--border-radius-md);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .differentiator-card p { margin: 0; font-size: 1rem; font-weight: var(--font-weight-medium); }
        .differentiator-card p::before { content: '✅'; margin-right: 10px; color: var(--accent-color); }

        .faq-section { background-color: var(--bg-white); }
        .faq-container { max-width: 800px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid var(--border-color); }
        .faq-item:last-child { border-bottom: none; }
        .faq-question {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 0;
            cursor: pointer;
            font-weight: var(--font-weight-semibold);
            font-size: 1.2rem;
            color: var(--text-dark);
        }
        .faq-question:hover { color: var(--primary-color); }
        .faq-arrow { color: var(--primary-color); transition: transform 0.3s ease; flex-shrink: 0; margin-left: 20px; }
        .faq-arrow.open { transform: rotate(180deg); }
        .faq-answer { padding: 0 0 25px 0; line-height: 1.7; font-size: 1rem; display: none; }
        
        .pricing-section .section-title {
            font-family: var(--font-family-headings);
            font-size: 3.2rem;
            font-weight: var(--font-weight-bold);
            text-align: center;
            margin: 0 0 60px 0;
            line-height: 1.2;
            color: var(--text-dark);
            position: relative;
            z-index: 3;
            background: linear-gradient(135deg, var(--text-dark) 0%, var(--primary-color) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .pricing-section .section-title::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            border-radius: 2px;
        }
        .pricing-container {
            max-width: 600px;
            margin: 0 auto;
            position: relative;
            z-index: 3;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            animation: fadeInUp 1s ease-out;
        }
        
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(50px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .pricing-card {
            background: linear-gradient(145deg, 
                rgba(255, 255, 255, 0.98) 0%, 
                rgba(248, 250, 252, 0.95) 100%);
            border-radius: 28px;
            box-shadow: 
                0 30px 70px rgba(74, 105, 187, 0.2),
                0 15px 35px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8);
            overflow: hidden;
            border: 3px solid rgba(74, 105, 187, 0.15);
            backdrop-filter: blur(25px);
            position: relative;
            width: 100%;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            animation: slideInLeft 0.8s ease-out;
        }
        
        .pricing-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 
                0 40px 90px rgba(74, 105, 187, 0.25),
                0 20px 45px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
            border-color: rgba(74, 105, 187, 0.25);
        }
        
        @keyframes slideInLeft {
            0% {
                opacity: 0;
                transform: translateX(-50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .pricing-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, 
                var(--primary-color), 
                var(--accent-color), 
                var(--primary-color));
            border-radius: 24px 24px 0 0;
        }
        .special-offer-card {
            background: linear-gradient(145deg, 
                rgba(255, 255, 255, 0.98) 0%, 
                rgba(248, 250, 252, 0.95) 100%);
            border-radius: 28px;
            padding: 45px;
            box-shadow: 
                0 30px 70px rgba(74, 105, 187, 0.2),
                0 15px 35px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8);
            border: 3px solid rgba(74, 105, 187, 0.15);
            backdrop-filter: blur(25px);
            position: relative;
            width: 100%;
            height: fit-content;
            text-align: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            animation: slideInRight 0.8s ease-out 0.2s both;
        }
        
        .special-offer-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 
                0 40px 90px rgba(74, 105, 187, 0.25),
                0 20px 45px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
            border-color: rgba(74, 105, 187, 0.25);
        }
        
        @keyframes slideInRight {
            0% {
                opacity: 0;
                transform: translateX(50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .special-offer-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, 
                var(--accent-color), 
                var(--primary-color), 
                var(--accent-color));
            border-radius: 24px 24px 0 0;
        }
        
        .special-price-display {
            margin-bottom: 20px;
        }
        
        .strikethrough-prices {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .strikethrough {
            font-size: 1.5rem;
            font-weight: var(--font-weight-semibold);
            color: var(--text-light);
            text-decoration: line-through;
            text-decoration-color: #e74c3c;
            text-decoration-thickness: 2px;
        }
        
        .free-highlight {
            font-size: 4rem;
            font-weight: var(--font-weight-bold);
            color: var(--primary-color);
            text-shadow: 0 4px 8px rgba(74, 105, 187, 0.4);
            margin-bottom: 10px;
            animation: pulseGlow 2s ease-in-out infinite;
            position: relative;
        }
        
        @keyframes pulseGlow {
            0%, 100% {
                transform: scale(1);
                text-shadow: 0 4px 8px rgba(74, 105, 187, 0.4);
            }
            50% {
                transform: scale(1.05);
                text-shadow: 0 6px 12px rgba(74, 105, 187, 0.6);
            }
        }
        
        .special-offer-text {
            font-size: 1.2rem;
            font-weight: var(--font-weight-semibold);
            color: var(--text-medium);
            margin-bottom: 30px;
        }
        
        .cta-button-container {
            margin-bottom: 25px;
        }
        
        .main-cta-button {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark-color), var(--accent-color));
            color: white;
            border: none;
            padding: 20px 40px;
            font-size: 1.4rem;
            font-weight: var(--font-weight-bold);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
                0 10px 30px rgba(74, 105, 187, 0.4),
                0 4px 15px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.8px;
            position: relative;
            overflow: hidden;
        }
        
        .main-cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .main-cta-button:hover::before {
            left: 100%;
        }
        
        .main-cta-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 
                0 15px 40px rgba(74, 105, 187, 0.5),
                0 8px 25px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        
        .main-cta-button:active {
            transform: translateY(-2px) scale(1.02);
        }
        
        .urgency-message {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 1.1rem;
            color: var(--text-medium);
            animation: bounceIn 1s ease-out 0.5s both;
        }
        
        @keyframes bounceIn {
            0% {
                opacity: 0;
                transform: scale(0.3);
            }
            50% {
                opacity: 1;
                transform: scale(1.05);
            }
            70% {
                transform: scale(0.9);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .checkmarks {
            font-size: 1.3rem;
            animation: checkmarkPulse 2s ease-in-out infinite;
        }
        
        @keyframes checkmarkPulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
            }
        }
        
        .urgency-text {
            font-weight: var(--font-weight-semibold);
            color: var(--primary-color);
        }
        
        .pricing-benefits h3 {
            font-family: var(--font-family-headings);
            font-size: 1.8rem;
            font-weight: var(--font-weight-bold);
            color: var(--primary-color);
            margin-bottom: 25px;
            text-align: center;
            position: relative;
        }
        
        .pricing-benefits h3::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            border-radius: 2px;
        }
        
        .benefits-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .benefits-list li {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            font-size: 1.1rem;
            color: var(--text-dark);
            line-height: 1.6;
            padding: 15px 0;
            border-bottom: 1px solid rgba(74, 105, 187, 0.1);
            position: relative;
            transition: all 0.3s ease;
        }
        
        .benefits-list li:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .benefits-list li:hover {
            transform: translateX(10px);
            color: var(--primary-color);
        }
        
        .benefits-list li::before {
            content: '✓';
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark-color));
            color: white;
            border-radius: 50%;
            margin-right: 15px;
            font-weight: bold;
            font-size: 1.2rem;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(74, 105, 187, 0.3);
        }

        .pricing-row {
            padding: 25px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border-color);
            position: relative;
            min-height: 80px;
        }
        .pricing-row:last-child {
            border-bottom: none;
        }
        .regular-price {
            background: var(--bg-white);
        }
        .early-bird {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark-color));
            color: var(--text-white);
            text-align: center;
            padding: 25px 30px;
            min-height: auto;
        }
        .last-minute {
            background: var(--bg-white);
        }
        .price-label, .offer-label {
            font-size: 1.1rem;
            font-weight: var(--font-weight-semibold);
            color: var(--text-dark);
        }
        .early-bird .offer-label {
            color: var(--text-white);
            margin: 10px 0;
        }
        .price-value {
            font-size: 2.2rem;
            font-weight: var(--font-weight-bold);
            color: var(--primary-color);
        }
        .early-bird .price-value {
            color: var(--text-white);
            font-size: 3rem;
            margin: 15px 0;
        }
        .price-description {
            font-size: 0.9rem;
            color: var(--text-light);
        }
        .offer-badge {
            position: absolute;
            background: var(--accent-color);
            color: var(--text-dark);
            padding: 8px 15px;
            border-radius: var(--border-radius-sm);
            font-size: 0.8rem;
            font-weight: var(--font-weight-bold);
            text-transform: uppercase;
        }
        .offer-badge.left {
            top: 15px;
            left: 20px;
        }
        .offer-badge.right {
            top: 15px;
            right: 20px;
        }
        .bonus-text {
            font-size: 1rem;
            color: var(--text-white);
            margin-top: 10px;
            font-weight: var(--font-weight-medium);
        }
        .special-price-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .today-only-price {
            font-size: 1.2rem;
            margin-bottom: 10px;
        }
        .strikethrough {
            text-decoration: line-through;
            color: var(--text-light);
            margin: 0 10px;
        }
        .free-text {
            font-size: 3rem;
            font-weight: var(--font-weight-bold);
            color: var(--primary-color);
            margin: 0 10px;
        }
        .special-offer-text {
            font-size: 1rem;
            color: var(--text-medium);
            font-weight: var(--font-weight-medium);
        }
        .special-button {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark-color), var(--accent-color));
            box-shadow: 
                0 10px 30px rgba(74, 105, 187, 0.4),
                0 4px 15px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            font-size: 1.4rem;
            padding: 20px 40px;
            max-width: 500px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
        }
        
        .special-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .special-button:hover::before {
            left: 100%;
        }
        .special-button:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 
                0 15px 40px rgba(74, 105, 187, 0.5),
                0 8px 25px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        
        .special-button:active {
            transform: translateY(-2px) scale(1.02);
        }
        
        .final-cta-section {
            background: var(--bg-dark-blue);
            padding: 80px 0;
            text-align: center;
            color: var(--text-white);
        }
        .final-cta-section h2 { font-size: 3rem; font-family: var(--font-family-headings); margin-bottom: 20px; }
        .final-cta-section p { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9; }
        .trust-line { margin-top: 20px !important; font-size: 1rem !important; opacity: 0.8 !important; }

        .footer { background-color: #1D2A38; padding: 60px 0 30px; color: rgba(255, 255, 255, 0.7); }
        .footer-content { display: grid; grid-template-columns: 1fr; gap: 40px; text-align: center; margin-bottom: 40px; }
        .footer-column h4 { color: var(--text-white); font-size: 1.1rem; margin-bottom: 15px; text-transform: uppercase; }
        .footer-column ul { list-style: none; padding: 0; margin: 0; }
        .footer-column li { margin-bottom: 10px; }
        .footer-link { color: rgba(255, 255, 255, 0.7); text-decoration: none; transition: color 0.3s ease; }
        .footer-link:hover { color: var(--accent-color); text-decoration: underline; }
        .footer-copyright { text-align: center; padding-top: 30px; border-top: 1px solid var(--primary-dark-color); font-size: 0.9rem; }

        .floating-cta-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px 24px;
            box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            border-top: 1px solid var(--border-color);
        }
        .floating-cta-bar__content { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            max-width: 1200px; 
            margin: 0 auto; 
        }
        .floating-price-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .floating-price {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .current-price {
            font-size: 2rem;
            font-weight: var(--font-weight-bold);
            color: var(--primary-color);
        }
        .strikethrough-price {
            font-size: 1.2rem;
            color: var(--text-light);
            text-decoration: line-through;
        }
        .offer-end-date {
            font-size: 0.9rem;
            color: var(--text-medium);
            margin-top: 5px;
        }
        .floating-button-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        .floating-enroll-button {
            background: linear-gradient(90deg, var(--primary-color), var(--primary-dark-color));
            color: var(--text-white);
            border: none;
            padding: 15px 30px;
            font-size: 1.1rem;
            font-weight: var(--font-weight-bold);
            border-radius: var(--border-radius-md);
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(74, 105, 187, 0.3);
            transition: all 0.3s ease;
            text-transform: uppercase;
        }
        .floating-enroll-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(74, 105, 187, 0.4);
        }
        .floating-button-section .bonus-text {
            font-size: 0.8rem;
            color: var(--text-light);
            margin-top: 5px;
            text-align: right;
        }

        /* Footer Styles */
        .footer {
            background: var(--bg-light-gray);
            padding: 80px 0 40px 0;
            text-align: center;
            border-top: 1px solid var(--border-color);
        }
        
        .footer-content {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .footer-title {
            font-family: var(--font-family-headings);
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-dark);
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
            color: var(--text-light);
            text-decoration: none;
            font-size: 15px;
            transition: color 0.3s ease;
        }
        
        .footer-link:hover {
            color: var(--primary-color);
        }
        
        .disclaimers {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
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
            color: var(--text-dark);
            margin-bottom: 8px;
            font-size: 15px;
        }
        
        .disclaimer-text {
            color: var(--text-light);
            font-size: 14px;
            line-height: 1.6;
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
            0%, 100% { 
                transform: translateY(0px); 
                opacity: 0.8; 
            }
            50% { 
                transform: translateY(-20px); 
                opacity: 1; 
            }
        }

        .transformation-slide-card {
            flex: 0 0 450px;
            height: 580px;
            border-radius: 28px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
                0 20px 50px rgba(74, 105, 187, 0.2),
                0 8px 25px rgba(0, 0, 0, 0.1);
            background: linear-gradient(145deg, 
                rgba(255, 255, 255, 0.95) 0%, 
                rgba(248, 250, 252, 0.9) 100%);
            border: 2px solid rgba(74, 105, 187, 0.15);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
        }

        .transformation-content {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .transformation-header {
            text-align: center;
            padding: 28px 24px 24px;
            background: linear-gradient(145deg, 
                rgba(255, 255, 255, 0.9) 0%, 
                rgba(248, 250, 252, 0.8) 100%);
            border-bottom: 1px solid rgba(74, 105, 187, 0.1);
            flex-shrink: 0;
            position: relative;
        }

        .transformation-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: var(--primary-color);
            border-radius: 2px;
        }

        .transformation-name {
            font-family: var(--font-family-headings);
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 8px;
            background: var(--primary-color);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .transformation-role {
            color: var(--text-light);
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.8;
        }

        .before-after-images {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 35px 28px;
            position: relative;
            flex: 1;
            align-items: center;
        }

        .before-image, .after-image {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 
                0 12px 30px rgba(0, 0, 0, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            height: 240px;
            border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .before-image:hover, .after-image:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.2),
                0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .before-image img, .after-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: brightness(0.95) contrast(1.05) saturate(1.1);
            transition: all 0.4s ease;
        }

        .before-image:hover img, .after-image:hover img {
            transform: scale(1.05);
            filter: brightness(1.05) contrast(1.1) saturate(1.2);
        }

        .image-label {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 
                0 6px 20px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .before-image .image-label {
            background: linear-gradient(135deg, 
                #ff6b6b 0%, 
                #ee5a52 100%);
        }

        .after-image .image-label {
            background: linear-gradient(135deg, 
                #00d4aa 0%, 
                #00b894 100%);
        }

        .transformation-arrow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            z-index: 10;
            box-shadow: 
                0 8px 25px rgba(74, 105, 187, 0.4),
                0 0 0 4px rgba(255, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.3);
            animation: pulse 3s ease-in-out infinite;
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .transformation-arrow svg {
            width: 28px;
            height: 28px;
            stroke: white;
            stroke-width: 3;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .transformation-arrow:hover {
            transform: translate(-50%, -50%) scale(1.15);
            box-shadow: 
                0 12px 35px rgba(74, 105, 187, 0.5),
                0 0 0 6px rgba(255, 255, 255, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        @keyframes pulse {
            0%, 100% { 
                box-shadow: 
                    0 8px 25px rgba(74, 105, 187, 0.4),
                    0 0 0 4px rgba(255, 255, 255, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            50% { 
                box-shadow: 
                    0 12px 35px rgba(74, 105, 187, 0.6),
                    0 0 0 8px rgba(255, 255, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4);
            }
        }

        .transformation-quote {
            color: var(--text-medium);
            font-size: 15px;
            line-height: 1.7;
            font-style: italic;
            text-align: center;
            padding: 35px 24px 40px;
            background: linear-gradient(145deg, 
                rgba(248, 250, 252, 0.9) 0%, 
                rgba(255, 255, 255, 0.8) 100%);
            border-top: 1px solid rgba(74, 105, 187, 0.1);
            flex-shrink: 0;
            position: relative;
        }

        .transformation-quote::before {
            content: '"';
            font-family: var(--font-family-headings);
            font-size: 3rem;
            color: var(--primary-color);
            opacity: 0.3;
            position: absolute;
            top: 10px;
            left: 20px;
            line-height: 1;
        }

        .transformation-quote::after {
            content: '"';
            font-family: var(--font-family-headings);
            font-size: 3rem;
            color: var(--primary-color);
            opacity: 0.3;
            position: absolute;
            bottom: 10px;
            right: 20px;
            line-height: 1;
        }

        .transformations-top-track:hover {
            animation-play-state: paused;
        }

        @media (min-width: 992px) {
            .video-registration-container { flex-direction: row; align-items: flex-start; gap: 60px; }
            .pain-point-container { grid-template-columns: 1fr 1fr; }
            .funnel-diagram { flex-direction: row; justify-content: center; gap: 30px; align-items: stretch; }
            .tsunami-content-wrapper { grid-template-columns: 1fr 1.2fr; gap: 60px; }
            .comparison-table { grid-template-columns: 1fr 1fr; }
            .who-is-shubh-content { flex-direction: row; gap: 60px; text-align: left; }
            .shubh-details { text-align: left; }
            .footer-content { grid-template-columns: repeat(3, 1fr); text-align: left; }
        }
        @media (max-width: 768px) {
            .hero-title { font-size: 2.5rem; }
            .section-title { font-size: 2.2rem; }
            .pricing-section .section-title { font-size: 2.5rem; }
            .pricing-container {
                max-width: 600px;
                padding: 0 15px;
            }
            .stats-bar { font-size: 1rem; }
            .final-cta-section h2 { font-size: 2.2rem; }
            .matrix-background {
                grid-template-columns: repeat(12, 1fr);
                grid-template-rows: repeat(20, 1fr);
                gap: 6px;
                padding: 15px;
            }
            
            /* Transformation Responsive Design */
            .transformations-top-row, .transformations-bottom-row {
                padding: 20px 0;
                margin-bottom: 30px;
            }
            
            .transformations-top-track, .transformations-bottom-track {
                gap: 20px;
                padding: 0 20px;
            }
            
            .transformation-slide-card {
                flex: 0 0 320px;
                height: 480px;
                border-radius: 20px;
            }
            
            .transformation-header {
                padding: 20px 16px 16px;
            }
            
            .transformation-name {
                font-size: 1.3rem;
            }
            
            .transformation-role {
                font-size: 12px;
            }
            
            .before-after-images {
                gap: 15px;
                padding: 25px 20px;
            }
            
            .before-image, .after-image {
                height: 180px;
                border-radius: 16px;
            }
            
            .image-label {
                bottom: 12px;
                padding: 6px 16px;
                font-size: 11px;
                border-radius: 16px;
            }
            
            .transformation-arrow {
                width: 50px;
                height: 50px;
            }
            
            .transformation-arrow svg {
                width: 24px;
                height: 24px;
            }
            
            .transformation-quote {
                font-size: 13px;
                padding: 25px 16px 30px;
            }
            
            .transformation-quote::before,
            .transformation-quote::after {
                font-size: 2rem;
            }
            .hero-pills {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 8px;
                overflow-x: visible;
                padding: 0;
                flex-wrap: nowrap;
            }
            
            .hero-pill {
                flex: 1;
                min-width: 0;
                text-align: center;
                padding: 8px 6px;
                font-size: 11px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .footer {
                padding: 60px 0;
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
        }
        @media (max-width: 480px) {
            .section-padding { padding: 60px 0; }
            .hero-title { font-size: 2rem; }
            .pricing-section .section-title { font-size: 2rem; }
            .pricing-container {
                gap: 30px;
                max-width: 100%;
                padding: 0 10px;
            }
            .special-offer-card {
                padding: 30px 20px;
            }
            .free-highlight {
                font-size: 2.8rem;
            }
            .strikethrough {
                font-size: 1.2rem;
            }
            .strikethrough-prices {
                gap: 15px;
            }
            .main-cta-button {
                padding: 16px 30px;
                font-size: 1.1rem;
            }
            .special-offer-text {
                font-size: 1.1rem;
            }
            .matrix-background {
                grid-template-columns: repeat(10, 1fr);
                grid-template-rows: repeat(30, 1fr);
                gap: 4px;
                padding: 10px;
            }
            
            /* Transformation Mobile Design */
            .transformations-top-row, .transformations-bottom-row {
                padding: 15px 0;
                margin-bottom: 20px;
            }
            
            .transformations-top-track, .transformations-bottom-track {
                gap: 15px;
                padding: 0 15px;
            }
            
            .transformation-slide-card {
                flex: 0 0 280px;
                height: 420px;
                border-radius: 16px;
            }
            
            .transformation-header {
                padding: 16px 12px 12px;
            }
            
            .transformation-name {
                font-size: 1.1rem;
            }
            
            .transformation-role {
                font-size: 11px;
            }
            
            .before-after-images {
                gap: 12px;
                padding: 20px 16px;
            }
            
            .before-image, .after-image {
                height: 150px;
                border-radius: 12px;
            }
            
            .image-label {
                bottom: 8px;
                padding: 4px 12px;
                font-size: 10px;
                border-radius: 12px;
            }
            
            .transformation-arrow {
                width: 40px;
                height: 40px;
            }
            
            .transformation-arrow svg {
                width: 20px;
                height: 20px;
            }
            
            .transformation-quote {
                font-size: 12px;
                padding: 20px 12px 25px;
            }
            
            .transformation-quote::before,
            .transformation-quote::after {
                font-size: 1.5rem;
            }
        }
        
        body {
            position: relative;
            overflow-x: hidden;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(74, 105, 187, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(243, 156, 18, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(74, 105, 187, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 90% 20%, rgba(243, 156, 18, 0.1) 0%, transparent 50%);
            z-index: -2;
            animation: backgroundFloat 20s ease-in-out infinite;
        }
        .floating-boxes {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        }
        .floating-box {
            position: absolute;
            background: linear-gradient(45deg, rgba(74, 105, 187, 0.1), rgba(243, 156, 18, 0.08));
            border-radius: 8px;
            animation: floatBox 15s linear infinite;
        }
        .floating-box:nth-child(1) { width: 20px; height: 20px; top: 10%; left: 10%; animation-delay: 0s; animation-duration: 12s; }
        .floating-box:nth-child(2) { width: 15px; height: 15px; top: 20%; left: 80%; animation-delay: 2s; animation-duration: 18s; }
        .floating-box:nth-child(3) { width: 25px; height: 25px; top: 60%; left: 15%; animation-delay: 4s; animation-duration: 16s; }
        .floating-box:nth-child(4) { width: 18px; height: 18px; top: 80%; left: 70%; animation-delay: 6s; animation-duration: 14s; }
        .floating-box:nth-child(5) { width: 22px; height: 22px; top: 30%; left: 50%; animation-delay: 8s; animation-duration: 20s; }
        .floating-box:nth-child(6) { width: 16px; height: 16px; top: 70%; left: 85%; animation-delay: 10s; animation-duration: 13s; }
        .floating-box:nth-child(7) { width: 24px; height: 24px; top: 15%; left: 60%; animation-delay: 12s; animation-duration: 17s; }
        .floating-box:nth-child(8) { width: 19px; height: 19px; top: 45%; left: 25%; animation-delay: 14s; animation-duration: 15s; }
        @keyframes backgroundFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.8; }
            33% { transform: translateY(-20px) rotate(2deg); opacity: 1; }
            66% { transform: translateY(10px) rotate(-1deg); opacity: 0.9; }
        }
        @keyframes floatBox {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        
        /* Premium Badge Styles */
        .premium-badge {
            position: relative;
            display: flex;
            justify-content: center;
            margin: 0 auto;
            background: linear-gradient(145deg, #4A69BB 0%, #3B528A 100%);
            border-radius: 50px;
            padding: 12px 24px;
            box-shadow: 0 10px 30px rgba(74, 105, 187, 0.4);
            border: 2px solid #F39C12;
            backdrop-filter: blur(10px);
            animation: badgeFloat 3s ease-in-out infinite;
            width: fit-content;
            max-width: 400px;
            transform-origin: center;
        }
        
        @media (max-width: 768px) {
            .premium-badge {
                max-width: 280px;
                padding: 10px 20px;
                border: none;
                box-shadow: 0 8px 25px rgba(74, 105, 187, 0.3);
            }
            
            .badge-title {
                font-size: 12px;
                line-height: 1.1;
            }
            
            .badge-subtitle {
                font-size: 10px;
            }
        }
        
        .badge-glow {
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #F39C12, #E67E22, #F39C12);
            border-radius: 50px;
            z-index: -1;
            opacity: 0.7;
            animation: glowPulse 3s ease-in-out infinite;
        }
        
        .badge-content {
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            z-index: 1;
        }
        
        .badge-icon-premium {
            width: 24px;
            height: 24px;
            color: #F39C12;
            animation: iconRotate 3s linear infinite;
        }
        
        .badge-text-premium {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .badge-title {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 14px;
            color: #FFFFFF;
            line-height: 1.2;
            animation: textGlow 3s ease-in-out infinite;
        }
        
        .badge-subtitle {
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.2;
        }
        
        @keyframes badgeFloat {
            0%, 100% {
                transform: translateY(0px) scale(1);
                box-shadow: 0 10px 30px rgba(74, 105, 187, 0.4);
            }
            25% {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 15px 40px rgba(74, 105, 187, 0.5);
            }
            50% {
                transform: translateY(-12px) scale(1.03);
                box-shadow: 0 20px 50px rgba(74, 105, 187, 0.6);
            }
            75% {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 15px 40px rgba(74, 105, 187, 0.5);
            }
        }
        
        @keyframes glowPulse {
            0%, 100% {
                opacity: 0.7;
                transform: scale(1);
            }
            25% {
                opacity: 0.8;
                transform: scale(1.02);
            }
            50% {
                opacity: 1;
                transform: scale(1.05);
            }
            75% {
                opacity: 0.8;
                transform: scale(1.02);
            }
        }
        
        @keyframes iconRotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        @keyframes textGlow {
            0%, 100% {
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
            }
            50% {
                text-shadow: 0 0 15px rgba(255, 255, 255, 0.6), 0 0 25px rgba(243, 156, 18, 0.4);
            }
        }
        
        @keyframes arrowPulse {
            0%, 100% {
                transform: scale(1);
                opacity: 0.8;
            }
            50% {
                transform: scale(1.2);
                opacity: 1;
            }
        }

        /* Success Stories Section Styles from Landing Page1 */
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
                radial-gradient(circle at 20% 30%, rgba(74, 105, 187, 0.08) 0%, transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(243, 156, 18, 0.06) 0%, transparent 60%);
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
            animation: slideRight 25s linear infinite;
            will-change: transform;
            padding: 0 60px;
        }

        .stories-top-track:hover {
            animation-play-state: paused;
        }
        
        .transformations-top-track:hover {
            animation-play-state: paused;
        }
        
        .transformations-bottom-track:hover {
            animation-play-state: paused;
        }
        
        .stories-bottom-track:hover {
            animation-play-state: paused;
        }

        /* Custom Row 2 Animation - Left to Right */
        #custom-row-2 {
            display: flex;
            overflow-x: hidden;
            margin-bottom: 50px;
            position: relative;
            padding: 20px 0;
            width: 100%;
            background: linear-gradient(135deg, rgba(74, 105, 187, 0.03) 0%, rgba(243, 156, 18, 0.03) 100%);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(74, 105, 187, 0.1);
        }

        #custom-track-2 {
            display: flex;
            gap: 0px;
            animation: slideLeftToRight 25s linear infinite;
            will-change: transform;
            padding: 0;
            flex-direction: row;
        }

        #custom-track-2:hover {
            animation-play-state: paused;
        }

        @keyframes slideLeftToRight {
            0% {
                transform: translateX(-100%);
            }
            100% {
                transform: translateX(100%);
            }
        }

        /* Custom Row 3 Animation - Right to Left */
        #custom-row-3 {
            display: flex;
            overflow-x: hidden;
            margin-bottom: 50px;
            position: relative;
            padding: 20px 0;
            width: 100%;
            background: linear-gradient(135deg, rgba(243, 156, 18, 0.03) 0%, rgba(74, 105, 187, 0.03) 100%);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(243, 156, 18, 0.1);
        }

        #custom-track-3 {
            display: flex;
            gap: 30px;
            animation: slideRightToLeft 25s linear infinite;
            will-change: transform;
            padding: 0 30px;
            flex-direction: row-reverse;
        }

        #custom-track-3:hover {
            animation-play-state: paused;
        }

        @keyframes slideRightToLeft {
            0% {
                transform: translateX(100%);
            }
            100% {
                transform: translateX(-100%);
            }
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
            gap: 0px;
            animation: slideLeftSeamless 35s linear infinite;
            will-change: transform;
            padding: 0;
            width: max-content;
            animation-fill-mode: both;
            transform: translateZ(0);
            min-width: 200%;
        }

        .stories-bottom-track:hover {
            animation-play-state: paused;
        }

        .story-card {
            flex: 0 0 340px;
            min-height: 300px;
            max-height: 400px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            margin: 0 15px;
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

        .story-card--blue .story-quote {
            color: white;
        }

        .story-card--blue .story-author {
            color: white;
        }

        .story-card--blue .story-role {
            color: rgba(255, 255, 255, 0.9);
        }

        .story-card--blue .story-location {
            color: rgba(255, 255, 255, 0.8);
        }

        .story-card--blue .story-stars {
            color: #FFD700;
        }

        .story-card--red {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 32px 28px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
        }

        .story-card--black {
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            color: white;
            padding: 32px 28px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
        }

        .story-stat-big {
            font-size: 2.5rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .story-stat-desc {
            font-size: 0.9rem;
            opacity: 0.9;
            font-weight: 500;
            line-height: 1.2;
        }

        .story-stat-currency {
            font-size: 2.2rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
            flex: 1;
        }

        .story-stars {
            font-size: 18px;
            margin-bottom: 15px;
        }

        .story-quote {
            font-size: 15px;
            line-height: 1.5;
            margin-bottom: 18px;
            font-style: italic;
            flex: 1;
            overflow: hidden;
        }

        .story-author {
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 5px;
        }

        .story-role {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 3px;
        }

        .story-location {
            font-size: 12px;
            opacity: 0.7;
        }

        .story-profile {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .story-stats {
            text-align: center;
            margin-bottom: 20px;
        }

        .story-stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .story-stat-label {
            font-size: 14px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        @keyframes slideRight {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
        }

        @keyframes slideLeft {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
        }

        @media (max-width: 1024px) {
            .stories-top-track, .stories-bottom-track {
                padding: 0 40px;
            }
            
            .story-card {
                flex: 0 0 300px;
                min-height: 240px;
                max-height: 320px;
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
                min-height: 220px;
                max-height: 280px;
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
        }

        @media (max-width: 480px) {
            .stories-top-track, .stories-bottom-track {
                padding: 0 10px;
            }
            
            .story-card {
                flex: 0 0 260px;
                min-height: 200px;
                max-height: 260px;
            }
            
            .story-content {
                padding: 20px 16px;
            }
            
            .story-quote {
                font-size: 13px;
                margin-bottom: 15px;
            }
            
            .story-profile {
                width: 50px;
                height: 50px;
                bottom: 15px;
                right: 15px;
            }
        }
            @keyframes slideLeftToRightTransform {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(0%);
    }
}

/* Transformations Section Unique Styles */
.transformations-section-unique {
    background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #F8F9FA 100%);
    position: relative;
    overflow: hidden;
    padding: 100px 0;
}

.transformations-section-unique::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 30% 20%, rgba(74, 105, 187, 0.08) 0%, transparent 60%),
        radial-gradient(circle at 70% 80%, rgba(243, 156, 18, 0.06) 0%, transparent 60%);
    pointer-events: none;
    animation: backgroundFloatUnique 20s ease-in-out infinite;
}

@keyframes backgroundFloatUnique {
    0%, 100% { transform: translateY(0px); opacity: 0.8; }
    50% { transform: translateY(-20px); opacity: 1; }
}

.transformations-container-unique {
    position: relative;
    z-index: 2;
}

.section-title-unique {
    font-family: var(--font-family-headings);
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: var(--font-weight-bold);
    color: var(--text-dark);
    margin-bottom: 20px;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-gradient-unique {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section-subtitle-unique {
    font-size: clamp(1rem, 2vw, 1.3rem);
    color: var(--text-medium);
    font-weight: var(--font-weight-medium);
    margin-bottom: 0;
}

.transformations-top-row-unique {
    display: flex;
    overflow-x: hidden;
    margin-bottom: 0;
    position: relative;
    padding: 40px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    background: linear-gradient(145deg, 
        rgba(255, 255, 255, 0.98) 0%, 
        rgba(248, 250, 252, 0.95) 100%);
    border-radius: 28px 28px 0 0;
    box-shadow: 
        0 25px 60px rgba(74, 105, 187, 0.15),
        0 10px 30px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    border: none;
    backdrop-filter: blur(20px);
}

.transformations-top-track-unique {
    display: flex;
    gap: 24px;
    animation: slideRightToLeftUnique 20s linear infinite;
    will-change: transform;
    padding: 0 60px;
}

.transformations-top-track-unique:hover {
    animation-play-state: paused;
}

.transformations-bottom-row-unique {
    display: flex;
    overflow-x: hidden;
    position: relative;
    padding: 40px 0;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    background: linear-gradient(145deg, 
        rgba(255, 255, 255, 0.98) 0%, 
        rgba(248, 250, 252, 0.95) 100%);
    border-radius: 0 0 28px 28px;
    box-shadow: 
        0 25px 60px rgba(74, 105, 187, 0.15),
        0 10px 30px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    border: none;
    backdrop-filter: blur(20px);
}

.transformations-bottom-track-unique {
    display: flex;
    gap: 24px;
    animation: slideLeftToRightUnique 20s linear infinite;
    will-change: transform;
    padding: 0 60px;
}

.transformations-bottom-track-unique:hover {
    animation-play-state: paused;
}

@keyframes slideRightToLeftUnique {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}

@keyframes slideLeftToRightUnique {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.transformation-slide-card-unique {
    flex: 0 0 420px;
    height: 520px;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
    border: 2px solid rgba(74, 105, 187, 0.15);
    backdrop-filter: blur(25px);
    display: flex;
    flex-direction: column;
}

.transformation-slide-card-unique:hover {
    transform: translateY(-10px);
    box-shadow: 0 25px 60px rgba(74, 105, 187, 0.25);
    border-color: rgba(74, 105, 187, 0.4);
}

.transformation-content-unique {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.transformation-header-unique {
    text-align: center;
    padding: 24px 20px 20px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
    border-bottom: 1px solid rgba(74, 105, 187, 0.1);
    flex-shrink: 0;
}

.transformation-name-unique {
    font-family: var(--font-family-headings);
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-dark);
    margin-bottom: 6px;
    background: linear-gradient(135deg, var(--text-dark) 0%, var(--text-medium) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.transformation-role-unique {
    color: var(--text-medium);
    font-size: 14px;
    font-weight: var(--font-weight-medium);
}

.before-after-images-unique {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 30px 24px;
    position: relative;
    flex: 1;
    align-items: center;
}

.before-image-unique, .after-image-unique {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.before-image-unique:hover, .after-image-unique:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.before-image-unique img, .after-image-unique img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

.image-label-unique {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: var(--font-weight-semibold);
    backdrop-filter: blur(10px);
}

.before-image-unique .image-label-unique {
    background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);
}

.after-image-unique .image-label-unique {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark-color) 100%);
}

.transformation-quote-unique {
    color: var(--text-medium);
    font-size: 14px;
    line-height: 1.6;
    font-style: italic;
    text-align: center;
    padding: 24px 20px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
    border-top: 1px solid rgba(74, 105, 187, 0.1);
    flex-shrink: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .transformations-section-unique {
        padding: 60px 0;
    }
    
    .section-title-unique {
        font-size: clamp(1.8rem, 6vw, 2.5rem);
        margin-bottom: 15px;
    }
    
    .section-subtitle-unique {
        font-size: clamp(0.9rem, 3vw, 1.1rem);
    }
    
    .transformation-slide-card-unique {
        flex: 0 0 300px;
        height: 450px;
    }
    
    .transformation-name-unique {
        font-size: 1.2rem;
    }
    
    .before-image-unique img, .after-image-unique img {
        height: 150px;
    }
    
    .transformation-quote-unique {
        font-size: 13px;
        padding: 20px 15px;
    }
}
        `,
            html: `
            <div class="page-wrapper">
                <div class="floating-boxes">
                    <div class="floating-box"></div>
                    <div class="floating-box"></div>
                    <div class="floating-box"></div>
                    <div class="floating-box"></div>
                    <div class="floating-box"></div>
                    <div class="floating-box"></div>
                    <div class="floating-box"></div>
                    <div class="floating-box"></div>
                </div>
                <div class="top-bar">
                    <span class="top-bar-text">For Busy Professionals Who Want to Transform Their Health Without Sacrificing Career Success
</span>
                </div>
                <section class="hero-pricing-section section-padding">
                    <div class="matrix-background">
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                        <div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div><div class="matrix-box"></div>
                    </div>
                    <div class="container">
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
                              <span class="badge-title">Premium Fitness Workshop
</span>
                              <span class="badge-subtitle">For Busy people</span>
                            </div>
                          </div>
                        </div>
                        <h1 class="hero-title">"The Only 15-Minute Health System That Works Anywhere — Home, Work, Parties, Travel"</h1>
                        <p class="sub-headline">(18,900+ People Lost Weight, Built Energy & Made It Their Forever Habit in 90 Days — Even If They'd Failed Before)</p>
                        <p class="hero-description">You're not broken. You just haven't found the RIGHT system yet. In this free 90-minute live webinar, discover the exact framework that's changing lives — without willpower, restrictions, or temporary fixes.</p>
                        <div class="hero-pills">
                            <span class="hero-pill">🌍 Works Anywhere</span>
                            <span class="hero-pill">⏱️ Just 15 Minutes Daily</span>
                            <span class="hero-pill">♾️ Lasts Forever</span>
                        </div>
                        
                        <div class="video-registration-container">
                            <div class="video-section">
                                <div class="video-placeholder-wrapper">
                                    <div class="video-placeholder">
                                        <div class="play-button-overlay" onclick="handlePlayButtonClick()">
                                            <svg class="play-icon" viewBox="0 0 100 100"><path d="M 30,20 L 30,80 L 80,50 Z" /></svg>
                                        </div>
                                        <div class="video-placeholder-overlay-text">
                                            <h3>Real Transformations. Real Results. Real People.</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="event-details-grid">
                                    <div class="event-detail-box">
                                        <div class="event-detail-icon">📅</div>
                                        <div class="event-detail-label">DATE</div>
                                        <div class="event-detail-value">[webinar_date]</div>
                                    </div>
                                    <div class="event-detail-box">
                                        <div class="event-detail-icon">🕐</div>
                                        <div class="event-detail-label">TIME</div>
                                        <div class="event-detail-value">[webinar_time]</div>
                                    </div>
                                    <div class="event-detail-box">
                                        <div class="event-detail-icon">📍</div>
                                        <div class="event-detail-label">WHERE</div>
                                        <div class="event-detail-value">Zoom</div>
                                    </div>
                                    <div class="event-detail-box">
                                        <div class="event-detail-icon">🌐</div>
                                        <div class="event-detail-label">LANGUAGE</div>
                                        <div class="event-detail-value">English</div>
                                    </div>
                                </div>
                            </div>
                            <div class="registration-form-wrapper">
                                <div class="registration-form-card">
                                    <h3>🎁 REGISTER IN NEXT 24 HOURS & GET:</h3>
                                    <ul class="bonus-list">
                                        <li class="bonus-list-item"><span>✅</span><span>Complete 90-Day Meal Planning Template (Worth ₹8,999)</span></li>
                                        <li class="bonus-list-item"><span>✅</span><span>Priority Q&A Access During Live Session</span></li>
                                        <li class="bonus-list-item"><span>✅</span><span>Exclusive Implementation Checklist</span></li>
                                        <li class="bonus-list-item"><span>✅</span><span>Post-Workshop Private Community Access</span></li>
                                    </ul>
                                    <div class="form-subheadline">Reserve Your Free Seat Now</div>
                                    <div class="enroll-button-container">
                                        <button class="enroll-button">RESERVE MY SPOT - FREE →</button>
                                        <p class="hurry-message">✅ ✅ Hurry! Limited Seats Available!</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section class="benefits-section section-padding">
                    <div class="container">
                        <h2 class="section-title">Why 18,900+ Busy Professionals Choose This System</h2>
                        <div class="benefits-grid">
                            <div class="benefit-item">
                                <div class="benefit-icon">🌍</div>
                                <p class="benefit-text">Follow the system at home, office, parties, or while traveling — zero location limits.</p>
                            </div>
                            <div class="benefit-item">
                                <div class="benefit-icon">⏱️</div>
                                <p class="benefit-text">Minimal time investment that fits even the busiest schedule without sacrifice.</p>
                            </div>
                            <div class="benefit-item">
                                <div class="benefit-icon">🚫🏋️</div>
                                <p class="benefit-text">No equipment, no membership, no special setup — works with what you already have.</p>
                            </div>
                            <div class="benefit-item">
                                <div class="benefit-icon">♾️</div>
                                <p class="benefit-text">Build habits that stick forever — not another temporary diet that rebounds.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="pain-point-section section-padding">
                    <div class="container">
                        <h2 class="section-title">In Just 90 Days... You Can Start Getting Results In Transforming Your Health & Energy</h2>
                        <p class="section-subtitle">If you've been struggling with your health, you're not alone. Here's what most busy professionals face every single day:</p>
                        <div class="pain-point-container">
                            <div class="pain-point-left">
                                <p>You wake up tired. You drag through the day fueled by coffee and sugar crashes. You look in the mirror and don't recognize the person staring back.</p>
                                <p>You've tried the diets. The gym memberships. The meal plans. The supplements. Maybe you even lost weight... temporarily. But it always comes back.</p>
                                <p>Your health reports worry you. Your energy is gone by 3 PM. Your clothes don't fit. And deep down, you feel like you're failing at the one thing you should be able to control — your own body.</p>
                                <p><strong>But here's the truth: It's not your fault. You don't lack willpower. You don't lack discipline. You lack the RIGHT SYSTEM.</strong></p>
                            </div>
                            <div class="pain-point-right">
                                <ul class="pain-point-list">
                                    <li>Starting strong but losing steam within 2-3 weeks</li>
                                    <li>Trying diets that work temporarily, but weight rebounds</li>
                                    <li>Wasting money on programs that don't fit your real life</li>
                                    <li>Feeling exhausted, bloated, and low on energy daily</li>
                                    <li>Sacrificing your health because work and family come first</li>
                                    <li>Avoiding social events because you don't feel confident</li>
                                    <li>Staring at alarming health reports and feeling helpless</li>
                                    <li>Thinking "nothing works for me" after repeated failures</li>
                                </ul>
                            </div>
                        </div>
                        <p class="transition-text">The problem isn't YOU. The problem is the SYSTEM you've been following.</p>
                    </div>
                </section>

                <section class="reverse-funnel-section section-padding">
                    <div class="container">
                        <h2 class="section-title">The 3-Step Health Transformation Blueprint</h2>
                        <p class="section-subtitle">This is the exact framework 18,900+ people used to transform in 90 days — and make it last forever.</p>
                        <div class="funnel-diagram">
                            <div class="funnel-step">
                                <div class="funnel-step-icon-wrapper">🍽️</div>
                                <div class="funnel-step-number">STEP 1</div>
                                <p><strong>Nutrition Reset:</strong> Build a personalized meal system that fits your lifestyle, tastes, and goals — no restrictions, no guilt, no meal torture.</p>
                            </div>
                            <div class="funnel-step">
                                <div class="funnel-step-icon-wrapper">🏃</div>
                                <div class="funnel-step-number">STEP 2</div>
                                <p><strong>Movement Blueprint:</strong> Create a 15-minute daily routine that delivers maximum results without gym, equipment, or hours of exhausting effort.</p>
                            </div>
                            <div class="funnel-step">
                                <div class="funnel-step-icon-wrapper">🧠</div>
                                <div class="funnel-step-number">STEP 3</div>
                                <p><strong>Mindset Mastery:</strong> Install the psychological triggers that make healthy choices automatic — no willpower battles, just lasting habits.</p>
                            </div>
                        </div>
                    </div>
                </section>

           

                <section class="social-proof-marquee-section">
                    <div class="container" style="max-width: 100%; padding: 0; margin: 0;">
                        <div class="stats-bar">👥 18,900+ Transformations | ⚖️ 1,00,000+ kg Lost | ✅ 97% Success Rate</div>
                        <div class="stories-container">
                     <!-- Top Row - Slides Right to Left -->
                        <div class="transformations-top-row-unique" id="transformation-row-1-unique">
                            <div class="transformations-top-track-unique" id="transformation-track-1-unique">
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

        <!-- DUPLICATE CONTENT FOR SEAMLESS LOOP -->
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
                 

                         
                         <!-- Bottom Row - Slides Left to Right -->
                        <div class="transformations-bottom-row-unique" id="transformation-row-2-unique">
                            <div class="transformations-bottom-track-unique" id="transformation-track-2-unique">
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

        <!-- DUPLICATE CONTENT FOR SEAMLESS LOOP -->
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
      </div></div>
                         

                                
                         </div>
                            
                        </div>
                    </div>
                </section>

                <section class="tsunami-section section-padding">
                    <div class="container">
                        <h2 class="section-title">Join The Health Transformation Revolution</h2>
                        <div class="tsunami-content-wrapper">
                            <div class="tsunami-left">
                                <div class="group-photo-container"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Group of professionals" class="group-photo"></div>
                                <div class="tsunami-description">
                                    <p>Over 5,000+ busy professionals have transformed their health using my proven methods and strategies.</p>
                                    <p>This isn't just another fitness program — it's a complete health transformation system that works with your schedule, not against it.</p>
                                    <p>Join the community of successful professionals who took action and transformed their health while maintaining their demanding careers and family commitments.</p>
                                </div>
                            </div>
                            <div class="tsunami-right">
                                <div class="what-if-section">
                                    <h3 class="what-if-title">What if you could transform your health in just 90 days?</h3>
                                    <div class="what-if-steps">
                                        <div class="what-if-step"><span class="step-number-badge">1</span><span class="step-text">Master the metabolic principles of highly successful professionals</span></div>
                                        <div class="what-if-step"><span class="step-number-badge">2</span><span class="step-text">Build your sustainable nutrition system that fits your busy schedule</span></div>
                                        <div class="what-if-step"><span class="step-number-badge">3</span><span class="step-text">Create your movement routine that delivers maximum results in minimal time</span></div>
                                        <div class="what-if-step"><span class="step-number-badge">4</span><span class="step-text">Generate consistent energy and vitality while maintaining your demanding career</span></div>
                                    </div>
                                </div>
                                <div class="comparison-container">
                                    <div class="comparison-table">
                                        <div class="comparison-column old-way">
                                            <div class="column-header"><h4>The Old Way</h4><p>Struggling alone without guidance</p></div>
                                            <div class="comparison-items">
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">❌ MANUAL</span><span class="item-text">Trial and error approach wasting precious time</span></div></div>
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">❌ MANUAL</span><span class="item-text">No clear direction or proven roadmap to follow</span></div></div>
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">❌ MANUAL</span><span class="item-text">Inconsistent results that frustrate and demotivate</span></div></div>
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">❌ MANUAL</span><span class="item-text">Wasted money on courses that don't deliver results</span></div></div>
                                            </div>
                                        </div>
                                        <div class="comparison-column new-way">
                                            <div class="column-header"><h4>The New Way</h4><p>With my proven system and guidance</p></div>
                                            <div class="comparison-items">
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">✅ AUTOMATED</span><span class="item-text">Proven step-by-step system that guarantees results</span></div></div>
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">✅ AUTOMATED</span><span class="item-text">Clear roadmap to success with exact action steps</span></div></div>
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">✅ AUTOMATED</span><span class="item-text">Consistent, predictable results within 90 days</span></div></div>
                                                <div class="comparison-item"><div class="item-content"><span class="item-label">✅ AUTOMATED</span><span class="item-text">Investment that pays for itself within first month</span></div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="enroll-button-container" style="margin-top: 40px;"><button class="enroll-button">YES, I WANT THE NEW WAY →</button></div>
                    </div>
<br><br>
  <div class="stories-bottom-row">
                                   
                                 <!-- Row 2 - Slides Left to Right -->
                               <div class="stories-top-row" id="custom-row-2">
                                <div class="stories-top-track" id="custom-track-2">
                                    <!-- Arjun Mehta -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Investment banker, 80-hour weeks. This 3-step system transformed my body in 90 days. Lost 19kg without gym. Energy tripled instantly."</p>
                                            <div>
                                                <div class="story-author">Arjun Mehta</div>
                                                <div class="story-role">Goldman Sachs, VP Mergers & Acquisitions</div>
                                                <div class="story-location">Mumbai, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Priya Sharma -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"McKinsey consultant traveling constantly. The nutrition reset fixed my metabolism. Lost 16kg across 4 continents. System works anywhere universally."</p>
                                            <div>
                                                <div class="story-author">Priya Sharma</div>
                                                <div class="story-role">McKinsey & Company, Senior Engagement Manager</div>
                                                <div class="story-location">Singapore</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Vikram Patel -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Google engineer coding 12 hours daily. Movement blueprint required only 15 minutes. Gained 12kg muscle without gym membership ever."</p>
                                            <div>
                                                <div class="story-author">Vikram Patel</div>
                                                <div class="story-role">Google, Senior Software Engineer</div>
                                                <div class="story-location">Bangalore, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Statistics Card - Red -->
                                    <div class="story-card story-card--red">
                                        <div class="story-stat-big">847%</div>
                                        <div class="story-stat-desc">Lead Generation Increase</div>
                                        <div class="story-stat-currency">$127,500</div>
                                        <div class="story-stat-desc">Revenue Generated in 90 Days</div>
                                    </div>

                                    <!-- Dr. Anil Kumar -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Cardiac surgeon performing back-to-back surgeries. Mindset mastery eliminated stress eating. Lost 21kg while saving lives. System actually works."</p>
                                            <div>
                                                <div class="story-author">Dr. Anil Kumar</div>
                                                <div class="story-role">Apollo Hospitals, Chief Cardiac Surgeon</div>
                                                <div class="story-location">Chennai, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Neha Gupta -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Corporate lawyer billing 2800 hours yearly. This system fit my chaotic schedule. Lost 18kg in courtrooms. Clients noticed confidence first."</p>
                                            <div>
                                                <div class="story-author">Neha Gupta</div>
                                                <div class="story-role">Amarchand Mangaldas, Senior Partner</div>
                                                <div class="story-location">New Delhi, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Statistics Card - Black -->
                                    <div class="story-card story-card--black">
                                        <div class="story-stat-big">1,240%</div>
                                        <div class="story-stat-desc">ROI Improvement</div>
                                        <div class="story-stat-currency">$2.1M</div>
                                        <div class="story-stat-desc">Additional Revenue Generated</div>
                                    </div>

                                    <!-- Captain Sameer Shah -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Emirates pilot flying 18-hour routes. Nutrition principles worked at 40,000 feet. Lost 14kg across time zones. Energy stabilized completely."</p>
                                            <div>
                                                <div class="story-author">Captain Sameer Shah</div>
                                                <div class="story-role">Emirates Airlines, Senior Captain A380</div>
                                                <div class="story-location">Dubai, UAE</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Rahul Khanna -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Managing director closing billion-dollar deals. The 90-day system delivered permanent results. Lost 22kg leading boardrooms. Leadership presence transformed dramatically."</p>
                                            <div>
                                                <div class="story-author">Rahul Khanna</div>
                                                <div class="story-role">Citibank, Managing Director Investment Banking</div>
                                                <div class="story-location">Hong Kong</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- DUPLICATE CONTENT FOR SEAMLESS LOOP -->
                                    <!-- Arjun Mehta -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Investment banker, 80-hour weeks. This 3-step system transformed my body in 90 days. Lost 19kg without gym. Energy tripled instantly."</p>
                                            <div>
                                                <div class="story-author">Arjun Mehta</div>
                                                <div class="story-role">Goldman Sachs, VP Mergers & Acquisitions</div>
                                                <div class="story-location">Mumbai, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Priya Sharma -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"McKinsey consultant traveling constantly. The nutrition reset fixed my metabolism. Lost 16kg across 4 continents. System works anywhere universally."</p>
                                            <div>
                                                <div class="story-author">Priya Sharma</div>
                                                <div class="story-role">McKinsey & Company, Senior Associate</div>
                                                <div class="story-location">Singapore</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Vikram Patel -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Tech startup CEO, stress eating, 3am coding sessions. This system taught me sustainable habits. Lost 23kg while scaling to Series A. Confidence through the roof."</p>
                                            <div>
                                                <div class="story-author">Vikram Patel</div>
                                                <div class="story-role">TechCorp, CEO & Founder</div>
                                                <div class="story-location">Bangalore, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Rahul Khanna -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Investment banker in Hong Kong, client dinners every night. This system broke my food addiction. Lost 28kg without missing any deals. Energy and focus completely transformed."</p>
                                            <div>
                                                <div class="story-author">Rahul Khanna</div>
                                                <div class="story-role">Citibank, Managing Director Investment Banking</div>
                                                <div class="story-location">Hong Kong</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
</div>
                            <!-- Row 3 - Slides Left -->
                            <div class="stories-bottom-row" id="custom-row-3">
                                <div class="stories-bottom-track" id="custom-track-3">
                                    <!-- Kavita Reddy -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Architect managing global projects remotely. Movement blueprint needs zero equipment. Lost 17kg designing skyscrapers. Productivity increased 40 percent significantly."</p>
                                            <div>
                                                <div class="story-author">Kavita Reddy</div>
                                                <div class="story-role">Foster + Partners, Senior Architect</div>
                                                <div class="story-location">London, UK</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Rohan Kapoor -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Bollywood producer working nights constantly. Mindset mastery changed my relationship with food. Lost 20kg on film sets. Industry noticed immediately."</p>
                                            <div>
                                                <div class="story-author">Rohan Kapoor</div>
                                                <div class="story-role">Dharma Productions, Executive Producer</div>
                                                <div class="story-location">Mumbai, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Statistics Card - Red -->
                                    <div class="story-card story-card--red">
                                        <div class="story-stat-big">567%</div>
                                        <div class="story-stat-desc">Conversion Rate Increase</div>
                                        <div class="story-stat-currency">$89,300</div>
                                        <div class="story-stat-desc">Additional Revenue in 60 Days</div>
                                    </div>

                                    <!-- Dr. Anjali Desai -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"MIT professor researching artificial intelligence. This system uses behavioral science brilliantly. Lost 15kg teaching doctoral students. Cognitive performance improved."</p>
                                            <div>
                                                <div class="story-author">Dr. Anjali Desai</div>
                                                <div class="story-role">MIT, Associate Professor Computer Science</div>
                                                <div class="story-location">Boston, USA</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Karan Malhotra -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Real estate developer building luxury townships. The nutrition reset worked despite constant client dinners. Lost 19kg closing deals everywhere."</p>
                                            <div>
                                                <div class="story-author">Karan Malhotra</div>
                                                <div class="story-role">DLF Limited, Vice President Luxury Projects</div>
                                                <div class="story-location">Gurgaon, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Statistics Card - Black -->
                                    <div class="story-card story-card--black">
                                        <div class="story-stat-big">934%</div>
                                        <div class="story-stat-desc">Customer Satisfaction Increase</div>
                                        <div class="story-stat-currency">$156,800</div>
                                        <div class="story-stat-desc">Revenue Boost in 45 Days</div>
                                    </div>

                                    <!-- Dr. Pooja Iyer -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Pharmaceutical executive leading clinical trials. Science-backed system aligned with my training. Lost 16kg managing FDA approvals. Evidence-based transformation delivered."</p>
                                            <div>
                                                <div class="story-author">Dr. Pooja Iyer</div>
                                                <div class="story-role">Pfizer, Director Clinical Development</div>
                                                <div class="story-location">New York, USA</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Aditi Joshi -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Marriott GM managing 500-room property. System worked despite hospitality industry chaos. Lost 18kg serving global guests. Energy transformation was remarkable."</p>
                                            <div>
                                                <div class="story-author">Aditi Joshi</div>
                                                <div class="story-role">Marriott International, General Manager</div>
                                                <div class="story-location">Goa, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Simran Bhatia -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Luxury retail director traveling for fashion weeks. The 15-minute movement system saved my sanity. Lost 14kg between Milan and Paris."</p>
                                            <div>
                                                <div class="story-author">Simran Bhatia</div>
                                                <div class="story-role">Louis Vuitton, Regional Director Asia Pacific</div>
                                                <div class="story-location">Hong Kong</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Neeraj Agarwal -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Hedge fund manager analyzing markets 16 hours daily. Nutrition principles optimized brain performance. Lost 17kg trading billions. Mental clarity doubled."</p>
                                            <div>
                                                <div class="story-author">Neeraj Agarwal</div>
                                                <div class="story-role">Blackstone, Portfolio Manager Hedge Fund</div>
                                                <div class="story-location">Mumbai, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Ravi Krishnan -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Aerospace engineer designing satellite systems. The systematic approach matched engineering mindset perfectly. Lost 15kg launching missions. Physical transformation mirrored career."</p>
                                            <div>
                                                <div class="story-author">Ravi Krishnan</div>
                                                <div class="story-role">ISRO, Lead Systems Engineer Chandrayaan</div>
                                                <div class="story-location">Bangalore, India</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- DUPLICATE CONTENT FOR SEAMLESS LOOP -->
                                    <!-- Kavita Reddy -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Architect managing global projects remotely. Movement blueprint needs zero equipment. Lost 17kg designing skyscrapers. Productivity increased 40 percent significantly."</p>
                                            <div>
                                                <div class="story-author">Kavita Reddy</div>
                                                <div class="story-role">Foster + Partners, Senior Architect</div>
                                                <div class="story-location">London, UK</div>
                                            </div>
                                            <img src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face" alt="Kavita Reddy" class="story-profile">
                                        </div>
                                    </div>

                                    <!-- Sarah Chen -->
                                    <div class="story-card story-card--blue">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Pharmaceutical executive managing 3 time zones. This system adapted to my travel schedule perfectly. Lost 21kg across 12 countries. Energy and focus completely transformed."</p>
                                            <div>
                                                <div class="story-author">Sarah Chen</div>
                                                <div class="story-role">Pfizer, VP Global Operations</div>
                                                <div class="story-location">New York, USA</div>
                                            </div>
                                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Sarah Chen" class="story-profile">
                                        </div>
                                    </div>

                                    <!-- Michael Thompson -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Investment banker, 80-hour weeks. This 3-step system transformed my body in 90 days. Lost 19kg without gym. Energy tripled instantly."</p>
                                            <div>
                                                <div class="story-author">Michael Thompson</div>
                                                <div class="story-role">Morgan Stanley, Managing Director</div>
                                                <div class="story-location">London, UK</div>
                                            </div>
                                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face" alt="Michael Thompson" class="story-profile">
                                        </div>
                                    </div>

                                    <!-- Ravi Krishnan -->
                                    <div class="story-card story-card--gray">
                                        <div class="story-content">
                                            <div class="story-stars">⭐⭐⭐⭐⭐</div>
                                            <p class="story-quote">"Aerospace engineer designing satellite systems. The systematic approach matched engineering mindset perfectly. Lost 15kg launching missions. Physical transformation mirrored career."</p>
                                            <div>
                                                <div class="story-author">Ravi Krishnan</div>
                                                <div class="story-role">ISRO, Lead Systems Engineer Chandrayaan</div>
                                                <div class="story-location">Bangalore, India</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                                
                         </div>
                            
                        </div>


                </section>

                <section class="pricing-section section-padding">
                    <div class="container">
                        <h2 class="section-title">Choose Your Health Transformation Workshop</h2><br>
                        <div class="pricing-container">
                            <div class="pricing-card">
                                <div class="pricing-row regular-price">
                                    <div class="price-label">Regular Price</div>
                                    <div class="price-value">₹4,999</div>
                                    <div class="price-description">Basic Workshop Access Only</div>
                                </div>
                                <div class="pricing-row early-bird current-offer">
                                    <div class="offer-badge left">ONLY 47 SEATS</div>
                                    <div class="offer-label">Early Bird Special</div>
                                    <div class="price-value">Free</div>
                                    <div class="offer-badge right">CURRENT OFFER</div>
                                    <div class="bonus-text">+ ₹4,999 Worth of Exclusive Bonuses</div>
                                </div>
                                <div class="pricing-row last-minute">
                                    <div class="price-label">Last Minute</div>
                                    <div class="price-value">₹1,999</div>
                                    <div class="price-description">Standard Workshop Access</div>
                                </div>
                                <div class="special-price-section">
                                    <div class="today-only-price">
                                        <span class="strikethrough">₹4,999</span>
                                        <span class="strikethrough">₹1,999</span>
                                        <span class="free-text">FREE</span>
                                    </div>
                                    <div class="special-offer-text">Today Only Special Price</div>
                                </div>
                                <div class="enroll-button-container">
                                    <button class="enroll-button special-button">RESERVE MY SPOT - FREE →</button>
                                    <p class="hurry-message">✅ ✅ Hurry! Limited Seats Available!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="results-agenda-section section-padding">
                    <div class="container">
                        <h2 class="section-title">Your 90-Day Health Transformation Journey</h2>
                        <p class="section-subtitle">Here's exactly what happens when you follow the system:</p>
                        <div class="agenda-sprint-grid">
                            <div class="agenda-sprint-card">
                                <div class="card-header"><span class="day-label">PHASE 1: DAYS 1-30</span></div>
                                <div class="card-content">
                                    <h3 class="agenda-card-title">🌱 Foundation Phase</h3>
                                    <ul class="agenda-sprint-list">
                                        <li class="agenda-sprint-list-item">Set up your personalized meal system</li>
                                        <li class="agenda-sprint-list-item">Establish your 15-minute daily routine</li>
                                        <li class="agenda-sprint-list-item">Notice energy boost within first week</li>
                                        <li class="agenda-sprint-list-item">Drop first 2-4 kg (water + fat loss)</li>
                                        <li class="agenda-sprint-list-item">Build initial habit momentum</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="agenda-sprint-card">
                                <div class="card-header"><span class="day-label">PHASE 2: DAYS 31-60</span></div>
                                <div class="card-content">
                                    <h3 class="agenda-card-title">🔥 Acceleration Phase</h3>
                                    <ul class="agenda-sprint-list">
                                        <li class="agenda-sprint-list-item">Hit your stride with automated habits</li>
                                        <li class="agenda-sprint-list-item">Body adapts — fat loss accelerates</li>
                                        <li class="agenda-sprint-list-item">Lose 4-6 kg more (total: 6-10 kg)</li>
                                        <li class="agenda-sprint-list-item">Friends & family notice your transformation</li>
                                        <li class="agenda-sprint-list-item">Energy levels peak — no afternoon crashes</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="agenda-sprint-card">
                                <div class="card-header"><span class="day-label">PHASE 3: DAYS 61-90</span></div>
                                <div class="card-content">
                                    <h3 class="agenda-card-title">🏆 Mastery Phase</h3>
                                    <ul class="agenda-sprint-list">
                                        <li class="agenda-sprint-list-item">Achieve transformation goal (8-12 kg total)</li>
                                        <li class="agenda-sprint-list-item">Habits become second nature — no thinking</li>
                                        <li class="agenda-sprint-list-item">Fit into clothes from 5 years ago</li>
                                        <li class="agenda-sprint-list-item">Health markers improve dramatically</li>
                                        <li class="agenda-sprint-list-item">System locked in — lifelong sustainability</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="transition-text" style="font-size: 1.1rem; margin-top: 40px;">This isn't a quick fix. This is a forever solution.</p>
                    </div>
                </section>

                <div class="who-is-shubh-section-wrapper">
                    <section class="container section-padding">
                        <h2 class="section-title" style="color: white;">Meet Your Transformation Guide</h2>
                        <div class="who-is-shubh-content">
                            <div class="shubh-photo-container"><img src="[coach_photo]" alt="[coach_name]" class="shubh-photo"></div>
                            <div class="shubh-details">
                                <h3 class="coach-name">[coach_name]</h3>
                                <p class="coach-tagline">Certified Health Coach | Transformation Specialist</p>
                                <p class="coach-bio-text">I'm here to guide you through a transformation system backed by 300+ scientists, 40+ years of research, and proven across 12+ countries with 18,900+ real transformations. This isn't just another program — it's a science-backed framework rooted in global nutrition philosophy. My role is to simplify the science, adapt it to your lifestyle, and walk with you every step of your 90-day journey.</p>
                                <div class="coach-differentiators">
                                    <div class="differentiator-card"><p>Science-Backed by 300+ Researchers</p></div>
                                    <div class="differentiator-card"><p>40+ Years of Proven Results</p></div>
                                    <div class="differentiator-card"><p>18,900+ Transformations (97% Success Rate)</p></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section class="faq-section section-padding">
                    <div class="container">
                        <h2 class="section-title">Frequently Asked Questions</h2>
                        <div class="faq-container">
                            <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(0)"><span>Is this webinar really free?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-0"><p>Yes, 100% free. No hidden costs, no credit card required. Just register with your name, email, and phone — that's it.</p></div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(1)"><span>How long is the webinar?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-1"><p>90 minutes of pure value. We'll cover the complete 3-step system, answer your questions live, and reveal the exact roadmap you need to transform in 90 days.</p></div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(2)"><span>What if I can't attend live?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-2"><p>We highly recommend attending live for the Q&A session and exclusive bonuses. However, no recordings available.</p></div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(3)"><span>Who is this for?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-3"><p>Busy professionals — job holders, Entrepreneurs, Parents, Busy moms — who want to transform their health without sacrificing their career, family, or social life. If you're tired of diets that don't stick, this is for you.</p></div>
                            </div>
                            <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(4)"><span>Do I need any equipment or gym membership?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-4"><p>No. The system works anywhere — home, office, hotel room, park. No gym, no equipment, no special setup required.</p></div>
                            </div>
                             <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(5)"><span>What if I've tried everything and failed before?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-5"><p>That's exactly why this system exists. It's designed for people who've tried diets, programs, and challenges — and failed. The problem wasn't you. It was the system. We fix that.</p></div>
                            </div>
                             <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(6)"><span>Will this work for my specific health condition?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-6"><p>This system has helped people with diabetes, thyroid issues, PCOS, high cholesterol, and more. However, always consult your doctor before starting any health program.</p></div>
                            </div>
                             <div class="faq-item">
                                <div class="faq-question" onclick="toggleFAQ(7)"><span>How is this different from other programs?</span><span class="faq-arrow"></span></div>
                                <div class="faq-answer" id="answer-7"><p>Most programs give you a meal plan and workout routine — then leave you alone. We teach you a SYSTEM that adapts to your life, travels with you, and lasts forever. It's not a diet. It's a lifestyle operating system.</p></div>
                            </div>
                        </div>
                    </div>
                </section>


                <section class="final-cta-section">
                    <div class="container">
                        <h2>Ready To Transform Your Health in 90 Days?</h2>
                        <p>Join 18,900+ people who made the decision to stop struggling and start winning.</p>
                        <button class="enroll-button" style="max-width: 500px;">YES, I'M READY — REGISTER NOW →</button>
                        <p class="trust-line">🔒 100% Free. No Credit Card Required. Limited Seats Available.</p>
                    </div>
                </section>

            

                <footer class="footer" style="background: #F8F9FA; padding: 80px 0 40px 0; text-align: center; border-top: 1px solid #DEE2E6;">
                    <div class="container">
                        <div class="footer-content" style="max-width: 800px; margin: 0 auto;">
                            <h3 class="footer-title text-glow" style="font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: #2C3E50; margin-bottom: 20px;">10xshap Couch</h3>
                            <a href="mailto:support@professionalsolutions.com" class="footer-email" style="color: #4A69BB; text-decoration: none; font-weight: 600; margin-bottom: 32px; display: inline-flex; align-items: center; gap: 10px; font-size: 18px;">📧 support@professionalsolutions.com</a>
                            <div class="footer-links" style="display: flex; justify-content: center; gap: 32px; margin-bottom: 40px; flex-wrap: wrap;">
                                <a href="#" class="footer-link" style="color: #7F8C8D; text-decoration: none; font-size: 15px; transition: color 0.3s ease;">Privacy Policy</a>
                                <a href="#" class="footer-link" style="color: #7F8C8D; text-decoration: none; font-size: 15px; transition: color 0.3s ease;">Terms of Service</a>
                                <a href="#" class="footer-link" style="color: #7F8C8D; text-decoration: none; font-size: 15px; transition: color 0.3s ease;">Medical Disclaimer</a>
                            </div>
                        </div>
                        
                        <div class="disclaimers" style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid #DEE2E6; border-radius: 18px; padding: 40px 32px; margin-top: 40px; text-align: left; max-width: 1000px; margin-left: auto; margin-right: auto;">
                            <div class="disclaimer-section" style="margin-bottom: 24px;">
                                <div class="disclaimer-title" style="font-weight: 700; color: #2C3E50; margin-bottom: 8px; font-size: 15px;">Medical Disclaimer:</div>
                                <div class="disclaimer-text" style="color: #7F8C8D; font-size: 14px; line-height: 1.6;">This program is for educational purposes only and is not intended as medical advice. Individual results may vary based on starting point, commitment level, health status, and other factors. Always consult with your healthcare provider before making any dietary changes or starting any health program, especially if you have existing medical conditions or take medications.</div>
                            </div>
                            
                            <div class="disclaimer-section" style="margin-bottom: 24px;">
                                <div class="disclaimer-title" style="font-weight: 700; color: #2C3E50; margin-bottom: 8px; font-size: 15px;">Results Disclaimer:</div>
                                <div class="disclaimer-text" style="color: #7F8C8D; font-size: 14px; line-height: 1.6;">Success stories and testimonials represent individual experiences and are not typical results. Your results may vary depending on your starting point, commitment level, consistency with the program, and other factors beyond our control. We make no guarantee that you will achieve similar results.</div>
                            </div>
                            
                            <div class="disclaimer-section" style="margin-bottom: 24px;">
                                <div class="disclaimer-title" style="font-weight: 700; color: #2C3E50; margin-bottom: 8px; font-size: 15px;">Professional Disclaimer:</div>
                                <div class="disclaimer-text" style="color: #7F8C8D; font-size: 14px; line-height: 1.6;">Our coaches provide lifestyle and fitness coaching based on their training and experience. Unless specifically stated, they are not licensed medical professionals. This program is designed for healthy adults and is not intended to diagnose, treat, cure, or prevent any disease or medical condition.</div>
                            </div>
                        </div>
                    </div>
                </footer>

                <div class="floating-cta-bar">
                    <div class="floating-cta-bar__content">
                        <div class="floating-price-info">
                            <div class="floating-price">
                                <span class="current-price">Free</span>
                                <span class="strikethrough-price">₹999</span>
                            </div>
                            <div class="offer-end-date">Offer ends June 30, 2025</div>
                        </div>
                        <div class="floating-button-section">
                            <button class="floating-enroll-button">ENROLL NOW</button>
                            <div class="bonus-text">+ Unbelievable Bonuses</div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            js: `function setupTransformationRow1Unique(){const r=document.getElementById("transformation-row-1-unique"),t=document.getElementById("transformation-track-1-unique");if(r){Object.assign(r.style,{display:"flex",overflowX:"hidden",marginBottom:"40px",position:"relative",padding:"0",width:"100vw",marginLeft:"calc(-50vw + 50%)"});}if(t){Object.assign(t.style,{display:"flex",gap:"24px",animation:"slideRightToLeftUnique 20s linear infinite",willChange:"transform",padding:"0 60px",width:"max-content"});const e=t.innerHTML;t.innerHTML+=e;t.addEventListener("mouseenter",()=>{t.style.animationPlayState="paused"});t.addEventListener("mouseleave",()=>{t.style.animationPlayState="running"})}}function setupTransformationRow2Unique(){const r=document.getElementById("transformation-row-2-unique"),t=document.getElementById("transformation-track-2-unique");if(r){Object.assign(r.style,{display:"flex",overflowX:"hidden",marginBottom:"60px",position:"relative",padding:"0",width:"100vw",marginLeft:"calc(-50vw + 50%)"});}if(t){Object.assign(t.style,{display:"flex",gap:"24px",animation:"slideLeftToRightUnique 20s linear infinite",willChange:"transform",padding:"0 60px",width:"max-content"});const e=t.innerHTML;t.innerHTML+=e;t.addEventListener("mouseenter",()=>{t.style.animationPlayState="paused"});t.addEventListener("mouseleave",()=>{t.style.animationPlayState="running"})}}
function handlePlayButtonClick(){const placeholder=document.querySelector('.video-placeholder');if(placeholder){placeholder.innerHTML='<video class="active-video-player" controls autoplay style="width:100%; height:100%; object-fit:cover;" src="https://www.w3schools.com/html/mov_bbb.mp4"></video>';}}const openFAQs={};function toggleFAQ(index){const answer=document.getElementById('answer-'+index);const arrow=document.querySelectorAll('.faq-arrow')[index];if(openFAQs[index]){answer.style.display='none';arrow.classList.remove('open');openFAQs[index]=false;}else{Object.keys(openFAQs).forEach(key=>{if(openFAQs[key]){document.getElementById('answer-'+key).style.display='none';document.querySelectorAll('.faq-arrow')[key].classList.remove('open');openFAQs[key]=false;}});answer.style.display='block';arrow.classList.add('open');openFAQs[index]=true;}}function setupCustomRow2(){const customRow2=document.getElementById('custom-row-2');const customTrack2=document.getElementById('custom-track-2');if(customRow2){customRow2.style.display='flex';customRow2.style.overflowX='hidden';customRow2.style.marginBottom='50px';customRow2.style.position='relative';customRow2.style.padding='20px 0';customRow2.style.width='100%';customRow2.style.background='linear-gradient(135deg, rgba(74, 105, 187, 0.03) 0%, rgba(243, 156, 18, 0.03) 100%)';customRow2.style.borderRadius='20px';customRow2.style.boxShadow='0 8px 32px rgba(74, 105, 187, 0.1)';}if(customTrack2){customTrack2.style.display='flex';customTrack2.style.gap='30px';customTrack2.style.animation='slideLeftToRight 25s linear infinite';customTrack2.style.willChange='transform';customTrack2.style.padding='0 30px';customTrack2.style.flexDirection='row';customTrack2.style.width='max-content';const content=customTrack2.innerHTML;customTrack2.innerHTML+=content;customTrack2.addEventListener('mouseenter',()=>{customTrack2.style.animationPlayState='paused';});customTrack2.addEventListener('mouseleave',()=>{customTrack2.style.animationPlayState='running';});}}function setupCustomRow3(){const customRow3=document.getElementById('custom-row-3');const customTrack3=document.getElementById('custom-track-3');if(customRow3){customRow3.style.display='flex';customRow3.style.overflowX='hidden';customRow3.style.marginBottom='50px';customRow3.style.position='relative';customRow3.style.padding='20px 0';customRow3.style.width='100%';customRow3.style.background='linear-gradient(135deg, rgba(243, 156, 18, 0.03) 0%, rgba(74, 105, 187, 0.03) 100%)';customRow3.style.borderRadius='20px';customRow3.style.boxShadow='0 8px 32px rgba(243, 156, 18, 0.1)';}if(customTrack3){customTrack3.style.display='flex';customTrack3.style.gap='30px';customTrack3.style.animation='slideRightToLeft 25s linear infinite';customTrack3.style.willChange='transform';customTrack3.style.padding='0 30px';customTrack3.style.flexDirection='row-reverse';customTrack3.style.width='max-content';const content=customTrack3.innerHTML;customTrack3.innerHTML+=content;customTrack3.addEventListener('mouseenter',()=>{customTrack3.style.animationPlayState='paused';});customTrack3.addEventListener('mouseleave',()=>{customTrack3.style.animationPlayState='running';});}}function setupStoriesCarousel(){const topRow=document.querySelector('.stories-top-row');const bottomRow=document.querySelector('.stories-bottom-row');const topTrack=document.querySelector('.stories-top-track');const bottomTrack=document.querySelector('.stories-bottom-track');if(topRow){topRow.style.display='flex';topRow.style.overflowX='hidden';topRow.style.marginBottom='40px';topRow.style.position='relative';topRow.style.padding='0';topRow.style.width='100vw';topRow.style.marginLeft='calc(-50vw + 50%)';}if(bottomRow){bottomRow.style.display='flex';bottomRow.style.overflowX='hidden';bottomRow.style.position='relative';bottomRow.style.padding='0';bottomRow.style.width='100vw';bottomRow.style.marginLeft='calc(-50vw + 50%)';}if(topTrack){topTrack.style.display='flex';topTrack.style.gap='30px';topTrack.style.animation='slideRight 30s linear infinite';topTrack.style.willChange='transform';topTrack.style.padding='0 60px';topTrack.style.width='max-content';const content=topTrack.innerHTML;topTrack.innerHTML+=content;}if(bottomTrack){bottomTrack.style.display='flex';bottomTrack.style.gap='30px';bottomTrack.style.animation='slideLeft 30s linear infinite';bottomTrack.style.willChange='transform';bottomTrack.style.padding='0 60px';bottomTrack.style.flexDirection='row-reverse';bottomTrack.style.width='max-content';const content=bottomTrack.innerHTML;bottomTrack.innerHTML+=content;}}function setupMarquee(){const tracks=document.querySelectorAll('.stories-top-track, .stories-bottom-track');tracks.forEach(track=>{track.innerHTML+=track.innerHTML;});}document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.faq-arrow').forEach(arrow=>{arrow.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';});document.querySelectorAll('.faq-question').forEach((question,index)=>{question.addEventListener('click',()=>toggleFAQ(index));});document.querySelectorAll('.enroll-button, .special-button, .floating-enroll-button').forEach(button=>{button.addEventListener('click',function(){alert('Redirecting to registration!');});});setupTransformationRow1Unique();setupTransformationRow2Unique();setupStoriesCarousel();setupCustomRow2();setupCustomRow3();setupMarquee();});`
        },
          
     
    
       
            "three_template": {
                "name": "FITNESS LEAD MAGNET - PAGE 1: OPT-IN LANDING",
                "description": "A friendly welcome page with a clean design and clear CTA, adapted for an energy recovery guide.",
                "thumbnail": "https://placehold.co/400x300/f97316/ffffff?text=Energy+Guide&font=roboto&style=flat",
                "css": `        
                :root {
                    --fn3-bg-primary: #FFFFFF;
                    --fn3-bg-secondary: #F8F9FA;
                    --fn3-bg-accent-soft: #FFF9E6;
                    --fn3-card-bg: #FFFFFF;
                    --fn3-card-bg-alt: #FDFDFD;
                    --fn3-text-primary: #212529;
                    --fn3-text-secondary: #5A6268;
                    --fn3-text-tertiary: #889097;
                    --fn3-text-on-accent: #FFFFFF;
                    --fn3-text-on-dark-accent: #332200;
                    --fn3-accent-yellow: #FFC000;
                    --fn3-accent-yellow-light: #FFD761;
                    --fn3-accent-yellow-dark: #E0A800;
                    --fn3-accent-teal: #00ADAD;
                    --fn3-accent-teal-light: #5CE1E1;
                    --fn3-success-green: #28A745;
                    --fn3-error-red: #DC3545;
                    --fn3-info-blue: #007BFF;
                    --fn3-border-color: #E0E0E0;
                    --fn3-border-color-strong: #CED4DA;
                    --fn3-border-color-accent: var(--fn3-accent-yellow);
                    --fn3-font-primary: 'Poppins', sans-serif;
                    --fn3-font-secondary: 'Montserrat', sans-serif;
                    --fn3-shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.05);
                    --fn3-shadow-sm: 0 3px 8px rgba(0, 0, 0, 0.07);
                    --fn3-shadow-md: 0 6px 15px rgba(0, 0, 0, 0.08);
                    --fn3-shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.1);
                    --fn3-shadow-accent: 0 6px 15px rgba(255, 192, 0, 0.3);
                    --fn3-shadow-accent-hover: 0 8px 20px rgba(255, 192, 0, 0.4);
                    --fn3-radius-sm: 6px;
                    --fn3-radius-md: 10px;
                    --fn3-radius-lg: 14px;
                    --fn3-radius-pill: 50px;
                    --fn3-transition-fast: all 0.2s ease-in-out;
                    --fn3-transition-medium: all 0.3s ease-in-out;
                    --fn3-transition-long: all 0.5s ease-in-out;
                    --fn3-accent-yellow-rgb: 255, 192, 0;
                    --fn3-accent-teal-rgb: 0, 173, 173;
                    --fn3-card-bg-rgb: 255, 255, 255;
                }
        
                body {
                    margin: 0;
                    padding: 0;
                    font-family: var(--fn3-font-primary);
                    background-color: var(--fn3-bg-primary);
                    color: var(--fn3-text-primary);
                    line-height: 1.6;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    overflow-x: hidden;
                }
        
                .fn3-page-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-height: 100vh;
                    padding: 15px;
                    box-sizing: border-box;
                    background-image:
                        radial-gradient(circle at 5% 5%, rgba(var(--fn3-accent-teal-rgb), 0.03) 0%, transparent 25%),
                        radial-gradient(circle at 95% 95%, rgba(var(--fn3-accent-yellow-rgb), 0.03) 0%, transparent 25%);
                }
        
                .fn3-main-content {
                    max-width: 1200px;
                    width: 100%;
                    padding: 0 15px;
                    box-sizing: border-box;
                }
        
                .fn3-top-banner {
                    background: linear-gradient(90deg, var(--fn3-accent-yellow), var(--fn3-accent-yellow-light));
                    color: var(--fn3-text-on-dark-accent);
                    padding: 8px 25px;
                    border-radius: var(--fn3-radius-pill);
                    margin: 20px auto 40px auto;
                    font-weight: 600;
                    font-size: 0.95em;
                    text-align: center;
                    box-shadow: var(--fn3-shadow-accent);
                    transition: var(--fn3-transition-medium);
                    position: relative;
                    z-index: 5;
                    width: fit-content;
                }
                
                .fn3-top-banner:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: var(--fn3-shadow-accent-hover);
                }
        
                .fn3-main-content-section {
                    position: relative;
                    text-align: center;
                    color: var(--fn3-text-primary);
                    z-index: 1;
                    overflow: hidden;
                    background: transparent;
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
        
                .fn3-heading-section {
                    text-align: center;
                    margin-bottom: 50px;
                }
        
                .fn3-sub-heading {
                    color: var(--fn3-accent-teal);
                    font-size: 1.1em;
                    font-weight: 600;
                    margin-bottom: 12px;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
        
                .fn3-main-title {
                    color: var(--fn3-text-primary);
                    font-family: var(--fn3-font-secondary);
                    font-size: clamp(2.2em, 5vw, 3.5em);
                    line-height: 1.15;
                    font-weight: 800;
                }
        
                .fn3-cta-button {
                    background: linear-gradient(to right, var(--fn3-accent-yellow), var(--fn3-accent-yellow-light)) !important;
                    color: #000000 !important;
                    padding: 14px 30px;
                    border: none;
                    border-radius: var(--fn3-radius-pill);
                    font-size: clamp(1em, 2.2vw, 1.2em);
                    font-weight: 700;
                    font-family: var(--fn3-font-secondary);
                    cursor: pointer;
                    transition: var(--fn3-transition-medium);
                    box-shadow: var(--fn3-shadow-accent);
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                    overflow: hidden;
                    transform-style: preserve-3d;
                    text-decoration: none;
                }
        
                .fn3-cta-button:hover {
                    background: linear-gradient(to right, var(--fn3-accent-yellow-light), var(--fn3-accent-yellow)) !important;
                    color: #000000 !important;
                    transform: translateY(-4px) scale(1.03);
                    box-shadow: var(--fn3-shadow-accent-hover);
                }
        
                .fn3-centered-button {
                    display: block;
                    margin: 0 auto 50px auto;
                    width: fit-content;
                }
        
                .fn3-spacing-top {
                    margin-top: 35px;
                }
        
                .fn3-two-column-layout {
                    display: flex;
                    gap: 35px;
                    justify-content: center;
                    flex-wrap: wrap;
                    align-items: center;
                    margin-top: 45px;
                    margin-bottom: 60px;
                }
        
                .fn3-left-column,
                .fn3-right-column {
                    flex: 1;
                    min-width: 320px;
                    padding: 5px 0;
                    text-align: left;
                }
        
                .fn3-lead-magnet-image-container {
                    background-color: var(--fn3-card-bg-alt);
                    padding: 10px;
                    border-radius: var(--fn3-radius-lg);
                    margin-bottom: 20px;
                    overflow: hidden;
                    box-shadow: var(--fn3-shadow-md);
                    border: 1px solid var(--fn3-border-color);
                }
        
                .fn3-lead-magnet-image {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    border-radius: var(--fn3-radius-md);
                }
        
                .fn3-offer-heading {
                    font-size: 1.5em;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: var(--fn3-text-primary);
                    font-family: var(--fn3-font-secondary);
                }
        
                .fn3-benefit-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 25px 0;
                    text-align: left;
                }
        
                .fn3-benefit-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 15px;
                    font-size: 1em;
                    color: var(--fn3-text-secondary);
                    line-height: 1.5;
                }
        
                .fn3-checkmark {
                    color: var(--fn3-success-green);
                    font-size: 1.2em;
                    margin-right: 10px;
                    flex-shrink: 0;
                    line-height: 1.4;
                    margin-top: 2px;
                }
        
                .fn3-disclaimer {
                    text-align: center;
                    font-size: 0.9em;
                    color: var(--fn3-text-tertiary);
                    margin-top: 20px;
                    line-height: 1.5;
                }
        
                .fn3-pain-points-section {
                    text-align: center;
                    margin-bottom: 60px;
                    padding: 35px 15px;
                    background-color: var(--fn3-bg-accent-soft);
                    border-radius: var(--fn3-radius-lg);
                }
        
                .fn3-pain-points-heading {
                    color: var(--fn3-accent-yellow-dark);
                    font-size: 2em;
                    font-weight: 800;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-family: var(--fn3-font-secondary);
                }
        
                .fn3-pain-points-heading .fn3-heading-icon {
                    color: var(--fn3-error-red);
                    font-size: 1.1em;
                }
        
                .fn3-pain-points-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 25px;
                    text-align: left;
                    margin-bottom: 40px;
                }
        
                .fn3-pain-point-item {
                    background: var(--fn3-card-bg);
                    padding: 20px;
                    border-radius: var(--fn3-radius-md);
                    box-shadow: var(--fn3-shadow-sm);
                    border-left: 4px solid var(--fn3-error-red);
                }
                
                .fn3-pain-point-title {
                    font-weight: 700;
                    font-size: 1.1em;
                    color: var(--fn3-text-primary);
                    margin-bottom: 8px;
                }
                
                .fn3-pain-point-desc {
                    color: var(--fn3-text-secondary);
                }
        
                .fn3-real-cost-section {
                    margin-top: 40px;
                }
        
                .fn3-real-cost-heading {
                    font-size: 1.4em;
                    color: var(--fn3-text-primary);
                    margin-bottom: 20px;
                    line-height: 1.5;
                    font-weight: 700;
                }
        
                .fn3-highlight-text {
                    color: var(--fn3-accent-yellow-dark);
                    font-weight: 700;
                }
        
                .fn3-real-coaches-section {
                    text-align: center;
                    margin-bottom: 60px;
                    padding: 35px 25px;
                    background-color: var(--fn3-card-bg);
                    border-radius: var(--fn3-radius-lg);
                    box-shadow: var(--fn3-shadow-md);
                    border: 1px solid var(--fn3-border-color);
                }
        
                .fn3-real-coaches-heading {
                    font-size: clamp(1.9em, 4.5vw, 2.4em);
                    font-weight: 800;
                    color: var(--fn3-text-primary);
                    margin-bottom: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-family: var(--fn3-font-secondary);
                }
        
                .fn3-real-coaches-testimonials {
                    display: flex;
                    gap: 25px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 20px;
                }
        
                .fn3-coach-testimonial-card {
                    background-color: var(--fn3-card-bg);
                    border-radius: var(--fn3-radius-lg);
                    padding: 25px;
                    max-width: 420px;
                    box-shadow: var(--fn3-shadow-md);
                    border: 1px solid var(--fn3-border-color);
                    text-align: left;
                    position: relative;
                    transition: var(--fn3-transition-medium);
                    overflow: hidden;
                }
        
                .fn3-coach-testimonial-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--fn3-shadow-lg);
                    border-color: var(--fn3-border-color-accent);
                }
        
                .fn3-coach-testimonial-card::before {
                    content: '"';
                    position: absolute;
                    top: 12px;
                    left: 18px;
                    font-size: 3em;
                    color: var(--fn3-accent-yellow);
                    opacity: 0.3;
                    font-family: serif;
                    line-height: 1;
                }
        
                .fn3-coach-quote {
                    font-size: 1.1em;
                    font-style: italic;
                    color: var(--fn3-text-secondary);
                    margin-bottom: 20px;
                    line-height: 1.5;
                    position: relative;
                    padding-left: 5px;
                }
        
                .fn3-coach-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
        
                .fn3-coach-avatar-placeholder {
                    font-size: 2.2em;
                    color: var(--fn3-text-tertiary);
                    border: 2px solid var(--fn3-border-color);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: var(--fn3-bg-secondary);
                }
        
                .fn3-coach-name {
                    font-size: 1.05em;
                    font-weight: 700;
                    color: var(--fn3-accent-yellow-dark);
                    margin-bottom: 3px;
                }
        
                .fn3-coach-role {
                    font-size: 0.85em;
                    color: var(--fn3-text-tertiary);
                }
        
                .fn3-form-section {
                    text-align: center;
                    margin-bottom: 60px;
                    padding: 35px 25px;
                    border: 2px dashed var(--fn3-accent-yellow);
                    border-radius: var(--fn3-radius-lg);
                    background-color: var(--fn3-bg-accent-soft);
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .fn3-form-heading {
                    font-size: 2em;
                    font-weight: 800;
                    color: var(--fn3-text-primary);
                    margin-bottom: 10px;
                    font-family: var(--fn3-font-secondary);
                }
        
                .fn3-form-subheading {
                    font-size: 1.1em;
                    color: var(--fn3-error-red);
                    font-weight: 600;
                    margin-bottom: 30px;
                }
        
                .fn3-form-container {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 25px;
                }
        
                .fn3-form-input {
                    width: 100%;
                    padding: 14px 18px;
                    font-size: 1em;
                    border-radius: var(--fn3-radius-md);
                    border: 1px solid var(--fn3-border-color-strong);
                    background-color: var(--fn3-card-bg);
                    color: var(--fn3-text-primary);
                    font-family: var(--fn3-font-primary);
                    box-sizing: border-box;
                    transition: var(--fn3-transition-fast);
                }
        
                .fn3-form-input:focus {
                    outline: none;
                    border-color: var(--fn3-accent-yellow);
                    box-shadow: 0 0 0 3px rgba(var(--fn3-accent-yellow-rgb), 0.2);
                }
        
                .fn3-form-cta-button {
                    width: 100%;
                    justify-content: center;
                }
        
                .fn3-form-footer-text {
                    font-size: 0.9em;
                    color: var(--fn3-text-secondary);
                    margin-top: 20px;
                }
                
                .fn3-form-footer-text i {
                    margin-right: 5px;
                }
        
                .fn3-credibility-section {
                    text-align: center;
                    margin-bottom: 60px;
                    padding: 35px 15px;
                    background-color: var(--fn3-bg-secondary);
                    border-radius: var(--fn3-radius-lg);
                }
        
                .fn3-credibility-heading {
                    font-size: 2em;
                    font-weight: 800;
                    color: var(--fn3-text-primary);
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-family: var(--fn3-font-secondary);
                }
        
                .fn3-credibility-heading .fn3-heading-icon {
                    color: var(--fn3-accent-yellow);
                    font-size: 1.1em;
                }
        
                .fn3-credibility-list {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
        
                .fn3-credibility-item {
                    background-color: var(--fn3-card-bg);
                    border-radius: var(--fn3-radius-md);
                    padding: 15px 25px;
                    width: 100%;
                    max-width: 600px;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    font-size: 1.05em;
                    color: var(--fn3-text-primary);
                    box-shadow: var(--fn3-shadow-sm);
                    border: 1px solid var(--fn3-border-color);
                    transition: var(--fn3-transition-medium);
                }
        
                .fn3-credibility-item:hover {
                    transform: translateX(5px) scale(1.01);
                    box-shadow: var(--fn3-shadow-md);
                    border-left: 4px solid var(--fn3-accent-yellow);
                }
        
                .fn3-credibility-check {
                    color: var(--fn3-success-green);
                    font-size: 1.1em;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
        
                .fn3-faq-section {
                    text-align: center;
                    margin-top: 60px;
                    margin-bottom: 80px;
                    padding: 0 15px;
                }
        
                .fn3-faq-heading {
                    font-size: 2.2em;
                    font-weight: 800;
                    color: var(--fn3-text-primary);
                    margin-bottom: 35px;
                    font-family: var(--fn3-font-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }
        
                .fn3-faq-heading .fn3-heading-icon {
                    color: var(--fn3-accent-yellow);
                    font-size: 1.05em;
                }
        
                .fn3-faq-item {
                    background-color: var(--fn3-card-bg);
                    border-radius: var(--fn3-radius-md);
                    margin-bottom: 15px;
                    box-shadow: var(--fn3-shadow-sm);
                    border: 1px solid var(--fn3-border-color);
                    overflow: hidden;
                    max-width: 750px;
                    margin-left: auto;
                    margin-right: auto;
                    text-align: left;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
        
                .fn3-faq-item.open {
                    border-color: var(--fn3-border-color-accent);
                    box-shadow: var(--fn3-shadow-md);
                }
        
                .fn3-faq-question {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 25px;
                    font-size: 1.15em;
                    font-weight: 600;
                    color: var(--fn3-text-primary);
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
        
                .fn3-faq-question:hover {
                    background-color: var(--fn3-bg-secondary);
                }
        
                .fn3-faq-arrow {
                    font-size: 1em;
                    color: var(--fn3-accent-yellow);
                    transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                }
        
                .fn3-faq-item.open .fn3-faq-arrow {
                    transform: rotate(180deg);
                }
        
                .fn3-faq-answer {
                    padding: 0 25px;
                    font-size: 1em;
                    color: var(--fn3-text-secondary);
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.5s ease-in-out, padding-bottom 0.5s ease-in-out;
                    line-height: 1.7;
                }
        
                .fn3-faq-answer p {
                    margin-top: 0;
                    margin-bottom: 1em;
                }
        
                .fn3-faq-answer p:last-child {
                    margin-bottom: 0;
                }
        
                .fn3-faq-item.open .fn3-faq-answer {
                    max-height: 1000px;
                    padding-bottom: 20px;
                }
        
                .fn3-sticky-register-bar {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    max-width: 100vw;
                    background-color: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 1000;
                    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
                    border-top: 2px solid var(--fn3-accent-yellow);
                    transition: all 0.3s ease;
                    color: var(--fn3-text-primary);
                    box-sizing: border-box;
                }
        
                .fn3-sticky-register-now-button {
                    background: linear-gradient(to right, var(--fn3-accent-yellow), var(--fn3-accent-yellow-light));
                    color: #000000 !important;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9em;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                    flex-shrink: 0;
                    text-decoration: none;
                }
        
                .fn3-sticky-text-section {
                    text-align: left;
                }
        
                .fn3-sticky-main-text {
                    font-size: 1.1em;
                    font-weight: 600;
                }
                
                .fn3-sticky-register-now-button:hover {
                    background: linear-gradient(to right, var(--fn3-accent-yellow-light), var(--fn3-accent-yellow)) !important;
                    color: #000000 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(255, 192, 0, 0.4);
                }
        
                .fn3-footer {
                    width: 100%;
                    text-align: center;
                    padding: 40px 20px 25px 20px;
                    margin-top: 60px;
                    margin-bottom: 80px; /* Space for sticky bar */
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border-top: 1px solid #D0D0D0;
                    color: #333333;
                    font-size: 0.9em;
                    position: relative;
                    z-index: 1;
                    transition: all 0.3s ease;
                }
        
                .fn3-footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }
        
                .fn3-footer-links p {
                    margin-bottom: 8px;
                    line-height: 1.6;
                    font-weight: 500;
                }
        
                .fn3-footer-links a {
                    color: var(--fn3-text-secondary);
                    text-decoration: none;
                    margin: 0 8px;
                }
                .fn3-footer-links a:hover {
                    text-decoration: underline;
                    color: var(--fn3-text-primary);
                }
        
                .fn3-footer-disclaimers {
                    margin-top: 25px;
                    font-size: 0.8em;
                    color: var(--fn3-text-tertiary);
                    text-align: left;
                    line-height: 1.5;
                    border-top: 1px solid var(--fn3-border-color);
                    padding-top: 20px;
                }
                
                .fn3-footer-disclaimers h4 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-weight: 600;
                    color: var(--fn3-text-secondary);
                }
        
                .fn3-footer-disclaimers p {
                    margin-bottom: 12px;
                }
        
        
                @media (max-width: 992px) {
                    .fn3-main-title {
                        font-size: clamp(2.4em, 5.5vw, 3.5em);
                    }
        
                    .fn3-two-column-layout {
                        flex-direction: column;
                        align-items: center;
                        gap: 40px;
                    }
        
                    .fn3-left-column,
                    .fn3-right-column {
                        min-width: unset;
                        width: 100%;
                        max-width: 600px;
                        text-align: center;
                    }
                    .fn3-benefit-list, .fn3-offer-heading {
                        text-align: left;
                    }
        
                    .fn3-pain-points-heading,
                    .fn3-credibility-heading,
                    .fn3-real-coaches-heading,
                    .fn3-faq-heading {
                        font-size: clamp(1.9em, 4.5vw, 2.4em);
                    }
        
                    .fn3-cta-button {
                        font-size: clamp(1em, 2.8vw, 1.3em);
                        padding: 16px 30px;
                    }
                }
        
                @media (max-width: 768px) {
                    .fn3-pain-points-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .fn3-sticky-register-bar {
                        padding: 10px 15px;
                        flex-wrap: wrap;
                        gap: 8px;
                        justify-content: center;
                    }
        
                    .fn3-sticky-text-section {
                        flex-basis: 100%;
                        text-align: center;
                        order: 1;
                    }
                    
                    .fn3-sticky-register-now-button {
                        order: 2;
                        padding: 10px 20px;
                        font-size: 0.9em;
                    }
        
                    .fn3-footer {
                        margin-bottom: 100px;
                    }
                }
        
                @media (max-width: 600px) {
                    .fn3-main-title {
                        font-size: clamp(1.9em, 6.5vw, 2.6em);
                    }
        
                    .fn3-top-banner {
                        padding: 10px 20px;
                        font-size: 1em;
                    }
        
                    .fn3-pain-points-heading,
                    .fn3-credibility-heading,
                    .fn3-real-coaches-heading,
                    .fn3-faq-heading {
                        font-size: clamp(1.7em, 5.5vw, 2.1em);
                        margin-bottom: 35px;
                    }
                    
                    .fn3-form-section {
                        padding: 30px 20px;
                    }
        
                    .fn3-form-heading {
                        font-size: 1.9em;
                    }
        
                    .fn3-faq-question {
                        font-size: 1.05em;
                        padding: 16px 20px;
                    }
        
                    .fn3-faq-answer {
                        padding: 0 20px;
                        font-size: 0.95em;
                    }
        
                    .fn3-faq-item.open .fn3-faq-answer {
                        padding-bottom: 18px;
                    }
        
                    .fn3-cta-button {
                        width: 100%;
                        text-align: center;
                        justify-content: center;
                    }
        
                    .fn3-centered-button {
                        width: 100%;
                    }
                }
        
                @media (max-width: 480px) {
                    .fn3-sticky-register-bar {
                        flex-direction: column;
                        text-align: center;
                        padding: 10px 15px;
                    }
        
                    .fn3-sticky-text-section {
                        margin-bottom: 8px;
                    }
        
                    .fn3-sticky-register-now-button {
                        width: 100%;
                        margin-top: 5px;
                    }
                }
                    `,
                "html": `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <div class="fn3-page-container">
                <main class="fn3-main-content">
                    <section class="fn3-main-content-section">
                        <!-- Top Banner -->
                        <header class="fn3-top-banner">
                            <p class="fn3-banner-text">For Busy Professionals Who Have Tried Multiple Methods Without Success</p>
                        </header>
        
                        <!-- Hero Content -->
                        <div class="fn3-hero-content">
                            <div class="fn3-heading-section">
                                <p class="fn3-sub-heading">The Hidden Energy Drains That Keep 73% of Professionals Exhausted</p>
                                <h1 class="fn3-main-title">
                                    Why You're Always Tired (Even After 8 Hours Sleep)
                                </h1>
                            </div>
        
                            <div class="fn3-two-column-layout">
                                <div class="fn3-left-column">
                                    <div class="fn3-lead-magnet-image-container">
                                        <img src="https://placehold.co/600x400/FFF9E6/E0A800?text=The+Executive%0AEnergy+Recovery%0AGuide&font=montserrat" alt="The Executive Energy Recovery Guide" class="fn3-lead-magnet-image" />
                                    </div>
                                </div>
        
                                <div class="fn3-right-column">
                                    <h3 class="fn3-offer-heading">
                                        <i class="fas fa-bullseye fn3-heading-icon"></i> Get FREE ACCESS to "The Executive Energy Recovery Guide"
                                    </h3>
                                    <p>A complete system to eliminate chronic fatigue in 21 days. In this guide, you'll discover:</p>
                                    <div class="fn3-benefit-list">
                                        <div class="fn3-benefit-item">
                                            <i class="fas fa-check-circle fn3-checkmark"></i>
                                            The 4 energy vampires hiding in your daily routine.
                                        </div>
                                        <div class="fn3-benefit-item">
                                            <i class="fas fa-check-circle fn3-checkmark"></i>
                                            Why sleeping 8+ hours still leaves you drained.
                                        </div>
                                        <div class="fn3-benefit-item">
                                            <i class="fas fa-check-circle fn3-checkmark"></i>
                                            The real cause of the 2 PM energy crash.
                                        </div>
                                        <div class="fn3-benefit-item">
                                            <i class="fas fa-check-circle fn3-checkmark"></i>
                                            A simple morning protocol that doubles your energy.
                                        </div>
                                        <div class="fn3-benefit-item">
                                            <i class="fas fa-check-circle fn3-checkmark"></i>
                                            Why your "healthy" breakfast might be sabotaging your day.
                                        </div>
                                    </div>
                                    <a href="#capture-form" class="fn3-cta-button">
                                        GET MY FREE ENERGY GUIDE →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
        
                    <section class="fn3-pain-points-section">
                        <h2 class="fn3-pain-points-heading">
                            <i class="fas fa-question-circle fn3-heading-icon"></i> Does This Sound Familiar?
                        </h2>
                        <div class="fn3-pain-points-grid">
                            <div class="fn3-pain-point-item">
                                <p class="fn3-pain-point-title">😴 The 3 PM Crash</p>
                                <p class="fn3-pain-point-desc">You start strong but feel completely drained by mid-afternoon, reaching for coffee or sugar just to function.</p>
                            </div>
                            <div class="fn3-pain-point-item">
                                <p class="fn3-pain-point-title">⏰ Tired but Wired</p>
                                <p class="fn3-pain-point-desc">You're exhausted all day but can't fall asleep at night, creating a vicious cycle of fatigue.</p>
                            </div>
                            <div class="fn3-pain-point-item">
                                <p class="fn3-pain-point-title">💪 No Energy for Life</p>
                                <p class="fn3-pain-point-desc">Work drains everything - no energy left for family, exercise, or things you actually enjoy.</p>
                            </div>
                             <div class="fn3-pain-point-item">
                                <p class="fn3-pain-point-title">🧠 Brain Fog Reality</p>
                                <p class="fn3-pain-point-desc">Mental clarity disappears after lunch, making important decisions feel impossible.</p>
                            </div>
                        </div>
                        <div class="fn3-real-cost-section">
                            <p class="fn3-real-cost-heading">
                                The Real Cost: Poor performance, strained relationships, declining health, and a life passing by while you're too tired to live it.
                            </p>
                        </div>
                    </section>
        
                    <section class="fn3-real-coaches-section">
                        <h2 class="fn3-real-coaches-heading">
                            <i class="fas fa-star fn3-heading-icon"></i> What Professionals Are Saying
                        </h2>
                        <div class="fn3-real-coaches-testimonials">
                            <div class="fn3-coach-testimonial-card">
                                <p class="fn3-coach-quote">I was surviving on coffee and willpower. This guide showed me why I was sabotaging my own energy. Now I wake up refreshed and stay energized until bedtime.</p>
                                <div class="fn3-coach-info">
                                    <i class="fas fa-user-circle fn3-coach-avatar-placeholder"></i>
                                    <div>
                                        <p class="fn3-coach-name">Rajesh P.</p>
                                        <p class="fn3-coach-role">Marketing Director</p>
                                    </div>
                                </div>
                            </div>
                            <div class="fn3-coach-testimonial-card">
                                <p class="fn3-coach-quote">I thought chronic fatigue was just part of being a working mom. These simple changes gave me energy I haven't felt in years. My productivity doubled.</p>
                                <div class="fn3-coach-info">
                                    <i class="fas fa-user-circle fn3-coach-avatar-placeholder"></i>
                                    <div>
                                        <p class="fn3-coach-name">Meera S.</p>
                                        <p class="fn3-coach-role">Software Engineer</p>
                                    </div>
                                </div>
                            </div>
                             <div class="fn3-coach-testimonial-card">
                                <p class="fn3-coach-quote">Stopped the afternoon crashes completely. My team noticed I'm more focused and decisive throughout the day. Better than any energy drink.</p>
                                <div class="fn3-coach-info">
                                    <i class="fas fa-user-circle fn3-coach-avatar-placeholder"></i>
                                    <div>
                                        <p class="fn3-coach-name">Dr. Amit K.</p>
                                        <p class="fn3-coach-role">Physician</p>                            
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
        
                    <section class="fn3-form-section" id="capture-form">
                        <h3 class="fn3-form-heading">Download Your FREE Energy Recovery Guide</h3>
                        <p class="fn3-form-subheading">⚠️ Limited Time Access</p>
                        <form class="fn3-form-container">
                            <input type="text" class="fn3-form-input" placeholder="Full Name*" required>
                            <input type="email" class="fn3-form-input" placeholder="Email*" required>
                            <input type="tel" class="fn3-form-input" placeholder="Phone*" required>
                            <button type="submit" class="fn3-cta-button fn3-form-cta-button">
                                GET MY FREE ENERGY GUIDE →
                            </button>
                        </form>
                        <div class="fn3-form-footer-text">
                            <p><i class="fas fa-download"></i> Instant download to your email</p>
                            <p><i class="fas fa-mobile-alt"></i> Mobile-optimized PDF format</p>
                            <p><i class="fas fa-lock"></i> Your information is secure and private</p>
                        </div>
                    </section>
        
                    <section class="fn3-credibility-section">
                        <h3 class="fn3-credibility-heading"><i class="fas fa-users fn3-heading-icon"></i> Developed by Leading Energy Metabolism Experts</h3>
                        <div class="fn3-credibility-list">
                            <div class="fn3-credibility-item">
                                <i class="fas fa-check-circle fn3-credibility-check"></i> Based on protocols used by our community of 300+ certified health specialists across 90 countries.
                            </div>
                            <div class="fn3-credibility-item">
                                <i class="fas fa-check-circle fn3-credibility-check"></i> 5,000+ professionals have restored their natural energy.
                            </div>
                            <div class="fn3-credibility-item">
                                <i class="fas fa-check-circle fn3-credibility-check"></i> 91% report significant improvement within 14 days.
                            </div>
                            <div class="fn3-credibility-item">
                                <i class="fas fa-check-circle fn3-credibility-check"></i> Complete system addressing sleep, nutrition, stress, and metabolism.
                            </div>
                             <div class="fn3-credibility-item">
                                <i class="fas fa-check-circle fn3-credibility-check"></i> Continuously refined based on real-world results.
                            </div>
                        </div>
                    </section>
        
                    <section class="fn3-faq-section">
                        <h2 class="fn3-faq-heading"><i class="fas fa-question-circle fn3-heading-icon"></i> Frequently Asked Questions</h2>
                        <div class="fn3-faq-container">
                            <div class="fn3-faq-item">
                                <div class="fn3-faq-question" onclick="toggleFaq(0)">
                                    Is this another complicated wellness routine?
                                    <i class="fas fa-angle-down fn3-faq-arrow"></i>
                                </div>
                                <div class="fn3-faq-answer">
                                    <p>No. These are simple adjustments to what you're already doing - most take under 2 minutes to implement.</p>
                                </div>
                            </div>
                            <div class="fn3-faq-item">
                                <div class="fn3-faq-question" onclick="toggleFaq(1)">
                                    Will this work if I have a demanding schedule?
                                    <i class="fas fa-angle-down fn3-faq-arrow"></i>
                                </div>
                                <div class="fn3-faq-answer">
                                    <p>Yes. This guide was specifically created for busy professionals who can't overhaul their entire lifestyle.</p>
                                </div>
                            </div>
                            <div class="fn3-faq-item">
                                <div class="fn3-faq-question" onclick="toggleFaq(2)">
                                    What if I've tried everything for my fatigue?
                                    <i class="fas fa-angle-down fn3-faq-arrow"></i>
                                </div>
                                <div class="fn3-faq-answer">
                                    <p>This focuses on hidden energy drains that most approaches completely miss. Even health-conscious people are often shocked by what they discover.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
        
                <footer class="fn3-footer">
                    <div class="fn3-footer-content">
                        <div class="fn3-footer-links">
                            <p>10X Shape Coach | Coach name</p>
                            <a href="#">Privacy Policy</a> |
                            <a href="#">Terms of Service</a> |
                            <a href="#">Disclaimer</a>
                        </div>
                        <div class="fn3-footer-disclaimers">
                            <h4>Important Disclaimers:</h4>
                            <p><strong>Medical Disclaimer:</strong> This information is for educational purposes only and is not intended as medical advice. Individual results may vary. If you have chronic fatigue or persistent sleep issues, consult with your healthcare provider before making changes. This guide is not intended to diagnose, treat, cure, or prevent any medical condition.</p>
                            <p><strong>Results Disclaimer:</strong> Success stories represent individual experiences and are not typical results. Your results may vary depending on your starting point, commitment level, underlying health conditions, and other factors beyond our control.</p>
                            <p><strong>Energy Disclaimer:</strong> This guide addresses lifestyle-related fatigue in healthy individuals. Chronic fatigue can have serious medical causes that require professional evaluation and treatment.</p>
                        </div>
                    </div>
                </footer>
        
                <div class="fn3-sticky-register-bar">
                    <div class="fn3-sticky-text-section">
                        <span class="fn3-sticky-main-text">Your FREE Energy Guide Awaits...</span>
                    </div>
                    <a href="#capture-form" class="fn3-sticky-register-now-button">
                        Download Now
                    </a>
                </div>
            </div>
            `,
                "js": "function toggleFaq(e){const t=document.querySelectorAll(\".fn3-faq-item\"),o=t[e],n=o.classList.contains(\"open\");t.forEach(e=>e.classList.remove(\"open\")),n||o.classList.add(\"open\")}document.addEventListener(\"DOMContentLoaded\",function(){document.querySelectorAll('a[href^=\"#\"]').forEach(e=>{e.addEventListener(\"click\",function(t){t.preventDefault();const o=document.querySelector(this.getAttribute(\"href\"));o&&o.scrollIntoView({behavior:\"smooth\",block:\"start\"})})})});"
            },
        
        
           'four_template': {
            name: 'Make form strach',
            description: 'A friendly welcome page with a clean design and clear CTA',
            thumbnail: 'https://placehold.co/400x300/16a34a/ffffff?text=+Blank&font=inter&size=50&style=flate',
                 css: `
           * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      body {
        background-color: #f8f9fa;
        color: #333;
        line-height: 1.6;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .blank-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 40px 20px;
      }
      
      .blank-page h1 {
        font-size: 36px;
        margin-bottom: 20px;
        color: #2c3e50;
      }
      
      .blank-page p {
        font-size: 18px;
        color: #7f8c8d;
        max-width: 600px;
        margin-bottom: 30px;
      }
      
      .start-button {
        background-color: #3498db;
        color: white;
        padding: 12px 30px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: 500;
        transition: background-color 0.3s;
      }
      
      .start-button:hover {
        background-color: #2980b9;
      }
            `,
            html: `
           <div class="blank-page">
      <div class="container">
        <h1>Start Building Your Website</h1>
        <p>This is a blank canvas ready for your creativity. Use the editor tools to add components, customize styles, and create your perfect website.</p>
        <a href="#" class="start-button">Get Started</a>
      </div>
    </div>
            `,
            js: `// Add any specific JavaScript functionality here if needed`
           },
    'five_template': {
            name: '3 funnal landing page',
            description: 'A friendly welcome page with a clean design and clear CTA',
            thumbnail: 'https://placehold.co/400x300/16a34a/ffffff?text=+Blank&font=inter&size=50&style=flate',
                 css: `
        :root {
            --fn3-bg-primary: #0F0F0F;
            --fn3-bg-secondary: #1A1A1A;
            --fn3-bg-accent-soft: #1F1A0F;
            --fn3-card-bg: #1E1E1E;
            --fn3-card-bg-alt: #262626;
            --fn3-text-primary: #FFFFFF;
            --fn3-text-secondary: #B8B8B8;
            --fn3-text-tertiary: #8A8A8A;
            --fn3-text-on-accent: #000000;
            --fn3-text-on-dark-accent: #FFD700;
            --fn3-accent-yellow: #FFD700;
            --fn3-accent-yellow-light: #FFE55C;
            --fn3-accent-yellow-dark: #FFC000;
            --fn3-accent-teal: #00D4D4;
            --fn3-accent-teal-light: #66E6E6;
            --fn3-success-green: #32CD32;
            --fn3-error-red: #FF4757;
            --fn3-info-blue: #3B82F6;
            --fn3-border-color: #333333;
            --fn3-border-color-strong: #404040;
            --fn3-border-color-accent: var(--fn3-accent-yellow);
            --fn3-font-primary: 'Poppins', sans-serif;
            --fn3-font-secondary: 'Montserrat', sans-serif;
            --fn3-shadow-xs: 0 1px 3px rgba(255, 255, 255, 0.05);
            --fn3-shadow-sm: 0 3px 8px rgba(255, 255, 255, 0.07);
            --fn3-shadow-md: 0 6px 15px rgba(255, 255, 255, 0.08);
            --fn3-shadow-lg: 0 10px 30px rgba(255, 255, 255, 0.1);
            --fn3-shadow-accent: 0 6px 15px rgba(255, 215, 0, 0.3);
            --fn3-shadow-accent-hover: 0 8px 20px rgba(255, 215, 0, 0.4);
            --fn3-radius-sm: 6px;
            --fn3-radius-md: 10px;
            --fn3-radius-lg: 14px;
            --fn3-radius-pill: 50px;
            --fn3-transition-fast: all 0.2s ease-in-out;
            --fn3-transition-medium: all 0.3s ease-in-out;
            --fn3-transition-long: all 0.5s ease-in-out;
            --fn3-accent-yellow-rgb: 255, 215, 0;
            --fn3-accent-teal-rgb: 0, 212, 212;
            --fn3-card-bg-rgb: 30, 30, 30;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: var(--fn3-font-primary);
            background-color: var(--fn3-bg-primary);
            color: var(--fn3-text-primary);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow-x: hidden;
        }

        .fn3-page-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 15px;
            box-sizing: border-box;
            background-image:
                radial-gradient(circle at 5% 5%, rgba(var(--fn3-accent-teal-rgb), 0.08) 0%, transparent 25%),
                radial-gradient(circle at 95% 95%, rgba(var(--fn3-accent-yellow-rgb), 0.08) 0%, transparent 25%);
        }

        .fn3-main-content {
            max-width: 1200px;
            width: 100%;
            padding: 0 15px;
            box-sizing: border-box;
        }

        .fn3-top-banner {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
            color: #000000;
            padding: 12px 30px;
            border-radius: var(--fn3-radius-pill);
            margin: 20px auto 40px auto;
            font-weight: 700;
            font-size: 1em;
            text-align: center;
            box-shadow:
                0 8px 25px rgba(255, 215, 0, 0.4),
                0 0 20px rgba(255, 215, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            transition: var(--fn3-transition-medium);
            position: relative;
            z-index: 5;
            width: fit-content;
            border: 2px solid rgba(255, 215, 0, 0.5);
            text-shadow: none;
        }

        .fn3-top-banner:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow:
                0 12px 35px rgba(255, 215, 0, 0.5),
                0 0 30px rgba(255, 215, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.3);
            background: linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FFA500 100%);
        }

        .fn3-banner-text {
            margin: 0;
            color: #000000;
            font-weight: 800;
            letter-spacing: 0.5px;
        }


        .fn3-main-content-section {
            position: relative;
            text-align: center;
            color: var(--fn3-text-primary);
            z-index: 1;
            overflow: hidden;
            background: transparent;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .fn3-heading-section {
            text-align: center;
            margin-bottom: 50px;
        }

        .fn3-sub-heading {
            color: var(--fn3-accent-teal);
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 12px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        .fn3-main-title {
            color: var(--fn3-text-primary);
            font-family: var(--fn3-font-secondary);
            font-size: clamp(2.2em, 5vw, 3.5em);
            line-height: 1.15;
            font-weight: 800;
        }

        .fn3-register-button {
            background: linear-gradient(to right, var(--fn3-accent-yellow), var(--fn3-accent-yellow-light)) !important;
            color: #000000 !important;
            padding: 14px 30px;
            border: none;
            border-radius: var(--fn3-radius-pill);
            font-size: clamp(1em, 2.2vw, 1.2em);
            font-weight: 700;
            font-family: var(--fn3-font-secondary);
            cursor: pointer;
            transition: var(--fn3-transition-medium);
            box-shadow: var(--fn3-shadow-accent);
            letter-spacing: 0.03em;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            position: relative;
            overflow: hidden;
            transform-style: preserve-3d;
        }

        .fn3-register-button:hover {
            background: linear-gradient(to right, var(--fn3-accent-yellow-light), var(--fn3-accent-yellow)) !important;
            color: #000000 !important;
            transform: translateY(-4px) scale(1.03);
            box-shadow: var(--fn3-shadow-accent-hover);
        }

        .fn3-centered-button {
            display: block;
            margin: 0 auto 50px auto;
            width: fit-content;
        }

        .fn3-spacing-top {
            margin-top: 35px;
        }

        .fn3-real-coaches-section {
            text-align: center;
            margin-bottom: 60px;
            padding: 35px 25px;
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-lg);
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
        }

        .fn3-real-coaches-testimonials {
            display: flex;
            gap: 25px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
        }


        .fn3-two-column-layout {
            display: flex;
            gap: 35px;
            justify-content: center;
            flex-wrap: wrap;
            align-items: flex-start;
            margin-top: 45px;
            margin-bottom: 60px;
        }

        .fn3-left-column,
        .fn3-right-column {
            flex: 1;
            min-width: 320px;
            padding: 5px 0;
        }

        .fn3-speaker-award-image-container {
            background-color: var(--fn3-card-bg-alt);
            padding: 10px;
            border-radius: var(--fn3-radius-lg);
            margin-bottom: 20px;
            overflow: hidden;
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
        }

        .fn3-speaker-award-image {
            max-width: 100%;
            height: auto;
            display: block;
            border-radius: var(--fn3-radius-md);
        }

        .fn3-speaker-info-card {
            background-color: var(--fn3-card-bg);
            padding: 20px;
            border-radius: var(--fn3-radius-lg);
            margin-bottom: 25px;
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
            transition: var(--fn3-transition-medium);
        }

        .fn3-speaker-info-card:hover {
            transform: translateY(-5px) scale(1.01);
            box-shadow: var(--fn3-shadow-lg);
            border-color: var(--fn3-border-color-accent);
        }

        .fn3-speaker-name {
            font-size: 1.8em;
            font-weight: 700;
            margin-bottom: 15px;
            color: var(--fn3-text-primary);
            font-family: var(--fn3-font-secondary);
        }

        .fn3-speaker-detail {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            color: var(--fn3-text-secondary);
            font-size: 1em;
        }

        .fn3-detail-icon {
            margin-right: 12px;
            color: var(--fn3-accent-yellow);
            font-size: 1.2em;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .fn3-webinar-details-heading {
            font-size: 1.5em;
            font-weight: 700;
            margin-bottom: 20px;
            color: var(--fn3-text-primary);
            font-family: var(--fn3-font-secondary);
        }

        .fn3-webinar-details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }

        .fn3-detail-item {
            background-color: var(--fn3-card-bg-alt);
            padding: 20px 15px;
            border-radius: var(--fn3-radius-md);
            text-align: center;
            box-shadow: var(--fn3-shadow-sm);
            border: 1px solid var(--fn3-border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: var(--fn3-transition-medium);
            min-height: 120px;
        }

        .fn3-detail-item:hover {
            transform: translateY(-5px);
            box-shadow: var(--fn3-shadow-md);
            border-color: var(--fn3-border-color-accent);
        }

        .fn3-item-icon {
            font-size: 1.8em;
            color: var(--fn3-accent-teal);
            margin-bottom: 10px;
        }

        .fn3-item-label {
            font-size: 0.9em;
            color: var(--fn3-text-tertiary);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .fn3-item-value {
            font-weight: 600;
            font-size: 1.1em;
            color: var(--fn3-text-primary);
            line-height: 1.2;
        }

        .fn3-why-attend-heading {
            font-size: 1.7em;
            font-weight: 700;
            margin-bottom: 25px;
            color: var(--fn3-text-primary);
            display: flex;
            align-items: center;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-heading-icon {
            color: var(--fn3-accent-yellow);
            font-size: 1.3em;
            margin-right: 12px;
        }

        .fn3-benefit-list {
            list-style: none;
            padding: 0;
            margin: 0 0 25px 0;
            text-align: left;
        }

        .fn3-benefit-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            font-size: 1em;
            color: var(--fn3-text-secondary);
            line-height: 1.5;
        }

        .fn3-checkmark {
            color: var(--fn3-success-green);
            font-size: 1.2em;
            margin-right: 10px;
            flex-shrink: 0;
            line-height: 1.4;
            margin-top: 2px;
        }

        .fn3-disclaimer {
            text-align: center;
            font-size: 0.9em;
            color: var(--fn3-text-tertiary);
            margin-top: 20px;
            line-height: 1.5;
        }

        .fn3-featured-section {
            position: relative;
            z-index: 10;
            margin-top: 60px;
            text-align: center;
            margin-bottom: 60px;
            padding: 35px 15px;
            background-color: var(--fn3-bg-secondary);
            border-radius: var(--fn3-radius-lg);
        }

        .fn3-featured-in-label {
            background: linear-gradient(to right, var(--fn3-accent-teal), var(--fn3-accent-teal-light));
            color: var(--fn3-text-on-accent);
            padding: 8px 25px;
            border-radius: var(--fn3-radius-pill);
            font-weight: 600;
            font-size: 0.9em;
            display: inline-block;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            z-index: 1;
            box-shadow: 0 5px 15px rgba(var(--fn3-accent-teal-rgb), 0.25);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .fn3-media-logos {
            border-radius: var(--fn3-radius-lg);
            padding: 25px 30px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            flex-wrap: wrap;
            gap: 25px;
        }

        .fn3-media-logo {
            max-height: 35px;
            filter: grayscale(0.7) opacity(0.75);
            transition: var(--fn3-transition-fast);
        }

        .fn3-media-logo:hover {
            filter: none;
            opacity: 1;
            transform: scale(1.1);
        }

        .fn3-struggle-section {
            text-align: center;
            margin-bottom: 60px;
            padding: 35px 15px;
            background-color: var(--fn3-bg-accent-soft);
            border-radius: var(--fn3-radius-lg);
        }

        .fn3-struggle-heading {
            color: var(--fn3-accent-yellow-dark);
            font-size: 2em;
            font-weight: 800;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-struggle-heading .fn3-heading-icon {
            color: var(--fn3-error-red);
            font-size: 1.1em;
        }

        .fn3-struggle-list {
            list-style: none;
            padding: 0;
            margin-bottom: 35px;
            display: inline-block;
            text-align: left;
        }

        .fn3-struggle-item {
            display: flex;
            align-items: center;
            color: var(--fn3-text-secondary);
            font-size: 1.05em;
            margin-bottom: 15px;
            font-weight: 500;
        }

        .fn3-struggle-item .fn3-cross-icon {
            color: var(--fn3-error-red);
            font-size: 1.2em;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .fn3-imagine-text {
            font-size: 1.4em;
            color: var(--fn3-text-primary);
            margin-bottom: 25px;
            line-height: 1.5;
            font-weight: 500;
        }

        .fn3-highlight-text {
            color: var(--fn3-accent-yellow-dark);
            font-weight: 700;
        }

        .fn3-workshop-promise {
            font-size: 1em;
            color: var(--fn3-text-secondary);
            margin-bottom: 30px;
            font-style: italic;
        }

        .fn3-learn-section {
            text-align: center;
            margin-top: 50px;
            margin-bottom: 50px;
        }

        .fn3-learn-separator {
            width: 70%;
            max-width: 500px;
            height: 1.5px;
            background: linear-gradient(to right, transparent, var(--fn3-accent-teal), transparent);
            margin: 0 auto 35px auto;
            opacity: 0.6;
        }

        .fn3-learn-heading {
            font-size: 2.2em;
            font-weight: 800;
            color: var(--fn3-text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-learn-check-icon {
            color: var(--fn3-success-green);
            font-size: 0.85em;
        }

        .fn3-learn-grid-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 60px;
            padding: 0 10px;
        }

        .fn3-learn-card {
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-lg);
            padding: 25px;
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: var(--fn3-transition-medium);
        }

        .fn3-learn-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: var(--fn3-shadow-lg);
            border-color: var(--fn3-border-color-accent);
        }

        .fn3-card-icon {
            font-size: 3em;
            color: var(--fn3-accent-yellow);
            margin-bottom: 15px;
            transition: var(--fn3-transition-fast);
        }

        .fn3-learn-card:hover .fn3-card-icon {
            transform: scale(1.1);
            color: var(--fn3-accent-yellow-light);
        }

        .fn3-card-title {
            font-size: 1.25em;
            font-weight: 700;
            color: var(--fn3-text-primary);
            margin-bottom: 10px;
            line-height: 1.25;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-progress-bar {
            width: 100%;
            height: 4px;
            background-color: var(--fn3-border-color);
            border-radius: 2px;
            margin: 10px 0;
            overflow: hidden;
            position: relative;
        }

        .fn3-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--fn3-accent-yellow), var(--fn3-accent-teal));
            border-radius: 2px;
            transition: width 2s ease-in-out;
            position: relative;
        }

        .fn3-card-description {
            font-size: 0.95em;
            color: var(--fn3-text-secondary);
            line-height: 1.5;
        }

        .fn3-for-you-section {
            text-align: center;
            margin-bottom: 60px;
            padding: 35px 15px;
            background-color: var(--fn3-bg-secondary);
            border-radius: var(--fn3-radius-lg);
        }

        .fn3-for-you-heading {
            font-size: 2em;
            font-weight: 800;
            color: var(--fn3-text-primary);
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-for-you-heading .fn3-heading-icon {
            color: var(--fn3-accent-yellow);
            font-size: 1.1em;
        }

        .fn3-for-you-list {
            list-style: none;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }

        .fn3-for-you-item {
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-md);
            padding: 15px 25px;
            width: 100%;
            max-width: 600px;
            text-align: left;
            display: flex;
            align-items: center;
            font-size: 1.05em;
            color: var(--fn3-text-primary);
            box-shadow: var(--fn3-shadow-sm);
            border: 1px solid var(--fn3-border-color);
            transition: var(--fn3-transition-medium);
        }

        .fn3-for-you-item:hover {
            transform: translateX(5px) scale(1.01);
            box-shadow: var(--fn3-shadow-md);
            border-left: 4px solid var(--fn3-accent-yellow);
        }

        .fn3-for-you-check {
            color: var(--fn3-success-green);
            font-size: 1.1em;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .fn3-problem-section {
            text-align: center;
            margin-bottom: 60px;
            padding: 35px 25px;
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-lg);
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
        }

        .fn3-problem-heading {
            font-size: clamp(1.6em, 3.5vw, 2.1em);
            font-weight: 700;
            color: var(--fn3-text-primary);
            margin-bottom: 25px;
            line-height: 1.3;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px 10px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-problem-icon {
            color: var(--fn3-accent-yellow);
            font-size: 1.1em;
        }

        .fn3-problem-highlight {
            color: var(--fn3-accent-yellow-dark);
        }

        .fn3-problem-text {
            font-size: 1.05em;
            color: var(--fn3-text-secondary);
            margin-bottom: 15px;
            line-height: 1.5;
        }

        .fn3-problem-bold {
            font-weight: 700;
            color: var(--fn3-text-primary);
            font-size: 1.1em;
        }

        .fn3-bonus-section {
            text-align: center;
            margin-bottom: 60px;
            padding: 35px 25px;
            border: 2px dashed var(--fn3-accent-yellow);
            border-radius: var(--fn3-radius-lg);
            background-color: var(--fn3-bg-accent-soft);
        }

        .fn3-bonus-heading {
            font-size: 2em;
            font-weight: 800;
            color: var(--fn3-text-primary);
            margin-bottom: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-coach-testimonial-card {
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-lg);
            padding: 25px;
            max-width: 420px;
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
            text-align: left;
            position: relative;
            transition: var(--fn3-transition-medium);
            overflow: hidden;
        }

        .fn3-coach-testimonial-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--fn3-shadow-lg);
            border-color: var(--fn3-border-color-accent);
        }

        .fn3-coach-testimonial-card::before {
            content: '"';
            position: absolute;
            top: 12px;
            left: 18px;
            font-size: 3em;
            color: var(--fn3-accent-yellow);
            opacity: 0.3;
            font-family: serif;
            line-height: 1;
        }

        .fn3-coach-quote {
            font-size: 1.1em;
            font-style: italic;
            color: var(--fn3-text-secondary);
            margin-bottom: 20px;
            line-height: 1.5;
            position: relative;
            padding-left: 5px;
        }

        .fn3-coach-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .fn3-coach-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--fn3-accent-yellow);
        }

        .fn3-coach-avatar-placeholder {
            font-size: 2.2em;
            color: var(--fn3-text-tertiary);
            border: 2px solid var(--fn3-border-color);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--fn3-bg-secondary);
        }

        .fn3-carousel-testimonials-section {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 60px;
            padding: 8px 0;
            overflow: hidden;
        }

        .fn3-carousel-nav {
            display: none;
        }

        .fn3-carousel-cards-container {
            display: flex;
            gap: 25px;
            overflow: hidden;
            width: 100%;
        }

        .fn3-carousel-cards-wrapper {
            display: flex;
            gap: 25px;
            animation: scrollCarousel 30s linear infinite;
            width: fit-content;
        }

        @keyframes scrollCarousel {
            0% {
                transform: translateX(0);
            }

            100% {
                transform: translateX(-50%);
            }
        }

        .fn3-carousel-cards-container:hover .fn3-carousel-cards-wrapper {
            animation-play-state: paused;
        }

        .fn3-carousel-card {
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-lg);
            padding: 20px;
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
            min-width: 260px;
            text-align: center;
            flex-shrink: 0;
            transition: var(--fn3-transition-medium);
        }

        .fn3-carousel-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--fn3-shadow-lg);
        }

        .fn3-carousel-card-title {
            font-size: 1.3em;
            font-weight: 700;
            color: var(--fn3-accent-yellow-dark);
            margin-bottom: 5px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-carousel-card-subtitle {
            font-size: 0.85em;
            color: var(--fn3-text-tertiary);
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .fn3-carousel-card-image {
            width: 100%;
            max-height: 160px;
            object-fit: cover;
            border-radius: var(--fn3-radius-md);
            margin-bottom: 12px;
            border: 1px solid var(--fn3-border-color);
        }

        .fn3-carousel-card-text {
            font-size: 0.95em;
            color: var(--fn3-text-secondary);
            line-height: 1.5;
        }

        .fn3-coach-name {
            font-size: 1.05em;
            font-weight: 700;
            color: var(--fn3-accent-yellow-dark);
            margin-bottom: 3px;
        }

        .fn3-coach-role {
            font-size: 0.85em;
            color: var(--fn3-text-tertiary);
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
            .fn3-carousel-testimonials-section {
                gap: 0;
                padding: 8px 10px;
            }

            .fn3-carousel-cards-container {
                gap: 15px;
            }

            .fn3-carousel-cards-wrapper {
                gap: 15px;
            }

            .fn3-carousel-card {
                min-width: 240px;
            }
        }





        .fn3-testimonials-section {
            text-align: center;
            margin-top: 60px;
            margin-bottom: 60px;
            padding: 0 10px;
        }

        .fn3-testimonials-heading {
            font-size: 2.2em;
            font-weight: 800;
            color: var(--fn3-text-primary);
            margin-bottom: 35px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-testimonial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 25px;
            justify-content: center;
        }

        .fn3-testimonial-card {
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-lg);
            padding: 0;
            box-shadow: var(--fn3-shadow-md);
            border: 1px solid var(--fn3-border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            overflow: hidden;
            transition: var(--fn3-transition-medium);
            text-decoration: none;
        }

        .fn3-testimonial-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: var(--fn3-shadow-lg);
        }

        .fn3-testimonial-card:hover .fn3-play-overlay {
            background-color: rgba(0, 0, 0, 0.6);
        }

        .fn3-testimonial-card:hover .fn3-youtube-icon {
            transform: scale(1.1);
        }

        .fn3-testimonial-thumbnail {
            width: 100%;
            height: 180px;
            object-fit: cover;
            display: block;
            border-top-left-radius: var(--fn3-radius-lg);
            border-top-right-radius: var(--fn3-radius-lg);
        }

        .fn3-play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 180px;
            background-color: rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            border-top-left-radius: var(--fn3-radius-lg);
            border-top-right-radius: var(--fn3-radius-lg);
            transition: var(--fn3-transition-fast);
            cursor: pointer;
        }

        .fn3-youtube-icon {
            color: #FF0000;
            font-size: 3.2em;
            cursor: pointer;
            filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
            transition: var(--fn3-transition-fast);
        }

        .fn3-testimonial-content {
            padding: 18px;
            width: 100%;
            box-sizing: border-box;
        }

        .fn3-testimonial-title {
            font-size: 1.1em;
            font-weight: 700;
            color: var(--fn3-text-primary);
            margin-bottom: 6px;
            text-align: left;
            width: 100%;
        }

        .fn3-testimonial-name {
            font-size: 0.9em;
            color: var(--fn3-text-secondary);
            margin-bottom: 8px;
            text-align: left;
            width: 100%;
        }

        .fn3-star-rating {
            color: var(--fn3-accent-yellow);
            font-size: 0.95em;
            margin-bottom: 10px;
            text-align: left;
            width: 100%;
        }

        .fn3-star-rating svg {
            margin-right: 2px;
        }

        .fn3-watch-on {
            font-size: 0.85em;
            color: var(--fn3-text-tertiary);
            display: flex;
            align-items: center;
            gap: 5px;
            text-align: left;
            width: 100%;
        }

        .fn3-watch-youtube-icon {
            color: #FF0000;
            font-size: 1.05em;
        }

        .fn3-limited-spots-section {
            background-color: var(--fn3-bg-primary);
            border: 3px solid var(--fn3-error-red);
            border-radius: var(--fn3-radius-lg);
            padding: 35px 25px;
            text-align: center;
            margin: 50px auto 60px auto;
            max-width: 650px;
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.2);
            position: relative;
        }

        .fn3-limited-spots-heading {
            font-size: 2em;
            font-weight: 800;
            color: var(--fn3-error-red);
            margin-bottom: 20px;
            line-height: 1.25;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-limited-spots-heading .fn3-heading-icon {
            color: var(--fn3-error-red);
            font-size: 1.4em;
            margin-bottom: 10px;
        }

        .fn3-limited-spots-text {
            font-size: 1.1em;
            color: var(--fn3-text-secondary);
            margin-bottom: 12px;
            line-height: 1.5;
        }

        .fn3-limited-spots-text .fn3-highlight-text {
            color: var(--fn3-error-red);
            font-weight: 700;
        }

        .fn3-about-mentor-section {
            text-align: center;
            margin-top: 60px;
            margin-bottom: 80px;
            padding: 0 15px;
        }

        .fn3-about-mentor-heading {
            font-size: 2.2em;
            font-weight: 800;
            color: var(--fn3-text-primary);
            margin-bottom: 10px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-about-mentor-subheading {
            font-size: 1.1em;
            color: var(--fn3-text-secondary);
            margin-bottom: 45px;
            font-style: italic;
        }

        .fn3-mentor-details-layout {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 35px;
            align-items: flex-start;
        }

        .fn3-mentor-image-container {
            background-color: var(--fn3-card-bg-alt);
            border-radius: var(--fn3-radius-lg);
            padding: 12px;
            box-shadow: var(--fn3-shadow-lg);
            border: 1px solid var(--fn3-border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            flex-basis: 300px;
            flex-shrink: 0;
        }

        .fn3-mentor-image {
            max-width: 100%;
            width: 270px;
            height: auto;
            border-radius: var(--fn3-radius-md);
            display: block;
            margin-bottom: -35px;
            position: relative;
            z-index: 1;
            box-shadow: var(--fn3-shadow-md);
        }

        .fn3-mentor-caption {
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-md);
            padding: 15px 18px;
            width: calc(100% - 25px);
            max-width: 250px;
            text-align: center;
            box-sizing: border-box;
            position: relative;
            z-index: 2;
            border: 1px solid var(--fn3-border-color);
            box-shadow: var(--fn3-shadow-sm);
        }

        .fn3-mentor-caption-name {
            font-size: 1.2em;
            font-weight: 700;
            color: var(--fn3-accent-yellow-dark);
            margin-bottom: 5px;
            font-family: var(--fn3-font-secondary);
        }

        .fn3-mentor-caption-role,
        .fn3-mentor-caption-specialty {
            font-size: 0.9em;
            color: var(--fn3-text-secondary);
            margin: 2px 0;
            line-height: 1.3;
        }

        .fn3-mentor-caption-specialty {
            font-weight: 600;
            color: var(--fn3-accent-teal);
        }

        .fn3-mentor-text-content {
            flex: 1;
            min-width: 350px;
            text-align: left;
            padding-top: 12px;
        }

        .fn3-mentor-paragraph {
            font-size: 1em;
            color: var(--fn3-text-secondary);
            margin-bottom: 18px;
            line-height: 1.7;
        }

        .fn3-mentor-struggle {
            font-weight: 600;
            color: var(--fn3-accent-yellow-dark);
            border-left: 3px solid var(--fn3-accent-yellow);
            padding-left: 10px;
            margin-left: -10px;
        }

        .fn3-mentor-list {
            list-style: none;
            padding: 0;
            margin-bottom: 20px;
        }

        .fn3-mentor-list li {
            display: flex;
            align-items: flex-start;
            font-size: 1em;
            color: var(--fn3-text-primary);
            margin-bottom: 10px;
        }

        .fn3-mentor-check {
            color: var(--fn3-success-green);
            font-size: 1.1em;
            margin-right: 10px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .fn3-my-mission-card {
            background: var(--fn3-bg-secondary);
            color: var(--fn3-text-primary);
            border-radius: var(--fn3-radius-lg);
            padding: 25px 30px;
            margin-top: 45px;
            max-width: 750px;
            margin-left: auto;
            margin-right: auto;
            box-shadow: var(--fn3-shadow-md);
            border-left: 5px solid var(--fn3-accent-teal);
        }

        .fn3-my-mission-heading {
            font-size: 1.6em;
            font-weight: 800;
            margin-bottom: 12px;
            font-family: var(--fn3-font-secondary);
            color: var(--fn3-accent-teal);
        }

        .fn3-my-mission-quote {
            font-size: 1.2em;
            font-style: italic;
            line-height: 1.5;
            font-weight: 500;
            color: var(--fn3-text-secondary);
        }

        .fn3-quote-highlight {
            font-weight: 700;
            color: var(--fn3-accent-teal);
        }

        .fn3-faq-section {
            text-align: center;
            margin-top: 60px;
            margin-bottom: 80px;
            padding: 0 15px;
        }

        .fn3-faq-heading {
            font-size: 2.2em;
            font-weight: 800;
            color: var(--fn3-text-primary);
            margin-bottom: 35px;
            font-family: var(--fn3-font-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .fn3-faq-heading .fn3-heading-icon {
            color: var(--fn3-accent-yellow);
            font-size: 1.05em;
        }

        .fn3-faq-item {
            background-color: var(--fn3-card-bg);
            border-radius: var(--fn3-radius-md);
            margin-bottom: 15px;
            box-shadow: var(--fn3-shadow-sm);
            border: 1px solid var(--fn3-border-color);
            overflow: hidden;
            max-width: 750px;
            margin-left: auto;
            margin-right: auto;
            text-align: left;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .fn3-faq-item.open {
            border-color: var(--fn3-border-color-accent);
            box-shadow: var(--fn3-shadow-md);
        }

        .fn3-faq-question {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            font-size: 1.15em;
            font-weight: 600;
            color: var(--fn3-text-primary);
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .fn3-faq-question:hover {
            background-color: var(--fn3-bg-secondary);
        }

        .fn3-faq-arrow {
            font-size: 1em;
            color: var(--fn3-accent-yellow);
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        .fn3-faq-item.open .fn3-faq-arrow {
            transform: rotate(180deg);
        }

        .fn3-faq-answer {
            padding: 0 25px;
            font-size: 1em;
            color: var(--fn3-text-secondary);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.5s ease-in-out, padding-bottom 0.5s ease-in-out;
            line-height: 1.7;
        }

        .fn3-faq-answer p {
            margin-top: 0;
            margin-bottom: 1em;
        }

        .fn3-faq-answer p:last-child {
            margin-bottom: 0;
        }

        .fn3-faq-item.open .fn3-faq-answer {
            max-height: 1000px;
            padding-bottom: 20px;
        }

        .fn3-sticky-register-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100vw;
            background-color: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(10px);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
            box-shadow: 0 -4px 15px rgba(255, 255, 255, 0.1);
            border-top: 2px solid var(--fn3-accent-yellow);
            transition: all 0.3s ease;
            color: var(--fn3-text-primary);
            box-sizing: border-box;
        }

        .fn3-sticky-register-now-button {
            background: linear-gradient(to right, var(--fn3-accent-yellow), var(--fn3-accent-yellow-light));
            color: #000000 !important;
            padding: 12px 20px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9em;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .fn3-sticky-timer-section {
            color: var(--fn3-accent-yellow);
            text-align: left;
        }

        .fn3-sticky-offer-ends {
            font-size: 0.9em;
            font-weight: 500;
        }

        .fn3-sticky-countdown {
            font-size: 1.2em;
            font-weight: 700;
        }

        .fn3-sticky-logo-section {
            display: flex;
            align-items: center;
            color: var(--fn3-text-primary);
        }

        .fn3-sticky-logo-icon {
            color: var(--fn3-accent-yellow);
            margin-right: 8px;
            font-size: 1.2em;
        }

        .fn3-sticky-logo-text {
            font-size: 1.1em;
            font-weight: 600;
        }



        .fn3-sticky-register-now-button:hover {
            background: linear-gradient(to right, var(--fn3-accent-yellow-light), var(--fn3-accent-yellow)) !important;
            color: #000000 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 192, 0, 0.4);
        }

        .fn3-footer {
            width: 100%;
            text-align: center;
            padding: 40px 20px 25px 20px;
            margin-top: 60px;
            margin-bottom: 80px;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border-top: 1px solid #333333;
            color: var(--fn3-text-secondary);
            font-size: 0.9em;
            position: relative;
            z-index: 1;
            transition: all 0.3s ease;
        }

        .fn3-footer-content {
            max-width: 1200px;
            margin: 0 auto;
        }

        .fn3-footer p {
            margin-bottom: 8px;
            line-height: 1.6;
            font-weight: 500;
        }

        .fn3-footer p:last-child {
            margin-bottom: 0;
        }

        @media (max-width: 992px) {
            .fn3-main-title {
                font-size: clamp(2.4em, 5.5vw, 3.5em);
            }

            .fn3-two-column-layout,
            .fn3-mentor-details-layout {
                flex-direction: column;
                align-items: center;
                gap: 40px;
            }

            .fn3-left-column,
            .fn3-right-column,
            .fn3-mentor-text-content {
                min-width: unset;
                width: 100%;
                max-width: 600px;
            }

            .fn3-mentor-image-container {
                flex-basis: auto;
                width: 100%;
                max-width: 380px;
            }

            .fn3-mentor-image {
                width: 100%;
                max-width: 330px;
            }

            .fn3-struggle-heading,
            .fn3-learn-heading,
            .fn3-for-you-heading,
            .fn3-testimonials-heading,
            .fn3-about-mentor-heading,
            .fn3-problem-heading,
            .fn3-bonus-heading,
            .fn3-real-coaches-heading,
            .fn3-limited-spots-heading,
            .fn3-faq-heading {
                font-size: clamp(1.9em, 4.5vw, 2.4em);
            }

            .fn3-struggle-item,
            .fn3-imagine-text,
            .fn3-for-you-item {
                font-size: 1.05em;
            }

            .fn3-register-button {
                font-size: clamp(1em, 2.8vw, 1.3em);
                padding: 16px 30px;
            }

            .fn3-testimonial-grid {
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            }

            .fn3-carousel-nav {
                font-size: 2.3em;
            }
        }

        @media (max-width: 768px) {
            .fn3-sticky-register-bar {
                padding: 10px 15px;
                flex-wrap: wrap;
                gap: 8px;
            }

            .fn3-sticky-timer-section {
                order: 1;
                flex: 1;
                min-width: 120px;
            }

            .fn3-sticky-logo-section {
                order: 2;
                flex: 1;
                justify-content: center;
                min-width: 100px;
            }

            .fn3-sticky-register-now-button {
                order: 3;
                padding: 8px 16px;
                font-size: 0.8em;
                flex-shrink: 0;
            }

            .fn3-footer {
                margin-bottom: 100px;
            }
        }

        @media (max-width: 480px) {
            .fn3-sticky-register-bar {
                flex-direction: column;
                text-align: center;
                padding: 8px 10px;
            }

            .fn3-sticky-timer-section,
            .fn3-sticky-logo-section {
                margin-bottom: 5px;
            }

            .fn3-sticky-register-now-button {
                width: calc(100% - 20px);
                margin-top: 5px;
            }
        }

        @media (max-width: 768px) {
            .fn3-webinar-details-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
        }

        @media (max-width: 600px) {
            .fn3-main-title {
                font-size: clamp(1.9em, 6.5vw, 2.6em);
            }

            .fn3-top-banner {
                padding: 10px 20px;
                font-size: 1em;
            }

            .fn3-media-logos {
                flex-direction: column;
                gap: 20px;
                padding: 25px;
            }

            .fn3-media-logo {
                max-height: 35px;
            }

            .fn3-struggle-heading,
            .fn3-learn-heading,
            .fn3-for-you-heading,
            .fn3-testimonials-heading,
            .fn3-about-mentor-heading,
            .fn3-problem-heading,
            .fn3-bonus-heading,
            .fn3-real-coaches-heading,
            .fn3-limited-spots-heading,
            .fn3-faq-heading {
                font-size: clamp(1.7em, 5.5vw, 2.1em);
                margin-bottom: 35px;
            }

            .fn3-learn-grid-section,
            .fn3-webinar-details-grid,
            .fn3-bonus-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }

            .fn3-learn-card,
            .fn3-detail-item,
            .fn3-bonus-item {
                padding: 20px;
            }

            .fn3-card-icon {
                font-size: 2.8em;
            }

            .fn3-card-title {
                font-size: 1.3em;
            }

            .fn3-my-mission-quote {
                font-size: 1.1em;
            }

            .fn3-mentor-image-container {
                width: 100%;
                max-width: 300px;
            }

            .fn3-mentor-image {
                margin-bottom: -35px;
            }

            .fn3-mentor-caption {
                font-size: 0.85em;
                padding: 12px;
            }

            .fn3-mentor-text-content {
                min-width: unset;
            }

            .fn3-limited-spots-section {
                padding: 30px 20px;
            }

            .fn3-limited-spots-heading {
                font-size: 1.9em;
            }

            .fn3-faq-question {
                font-size: 1.05em;
                padding: 16px 20px;
            }

            .fn3-faq-answer {
                padding: 0 20px;
                font-size: 0.95em;
            }

            .fn3-faq-item.open .fn3-faq-answer {
                padding-bottom: 18px;
            }

            .fn3-register-button {
                width: 100%;
                text-align: center;
                justify-content: center;
            }

            .fn3-centered-button {
                width: 100%;
            }

            .fn3-carousel-nav {
                display: none;
            }

            .fn3-carousel-cards-container {
                padding: 0 10px 20px 10px;
            }

            .fn3-carousel-card {
                min-width: 240px;
            }

            .fn3-testimonial-thumbnail {
                height: 160px;
            }

            .fn3-play-overlay {
                height: 160px;
            }

            .fn3-youtube-icon {
                font-size: 2.8em;
            }
        }

        @media (max-width: 768px) {
            .fn3-sticky-register-bar {
                padding: 12px 15px;
                flex-wrap: wrap;
                gap: 10px;
            }

            .fn3-sticky-timer-section {
                order: 1;
                flex: 1;
            }

            .fn3-sticky-logo-section {
                order: 2;
                flex: 1;
                justify-content: center;
            }

            .fn3-sticky-register-now-button {
                order: 3;
                padding: 10px 20px;
                font-size: 0.9em;
            }

            .fn3-footer {
                margin-bottom: 100px;
            }
        }

        @media (max-width: 480px) {
            .fn3-sticky-register-bar {
                flex-direction: column;
                text-align: center;
                padding: 10px 15px;
            }

            .fn3-sticky-timer-section,
            .fn3-sticky-logo-section {
                margin-bottom: 8px;
            }

            .fn3-sticky-register-now-button {
                width: 100%;
                margin-top: 5px;
            }
        }
            `,
            html: `
         <div class="fn3-page-container">
        <main class="fn3-main-content">
            <section class="fn3-main-content-section">
                <!-- Top Banner -->
                <header class="fn3-top-banner">
                    <p class="fn3-banner-text">Leads and Sales Automation Workshop</p>
                </header>

                <!-- Hero Content -->
                <div class="fn3-hero-content">
                    <div class="fn3-heading-section">
                        <p class="fn3-sub-heading">Unblock: 3-Hour LIVE webinar Uncovers...</p>
                        <h1 class="fn3-main-title">
                            Build a 6-Figure Health & Wellness Coaching Business Using AI – Without Offline Meetings
                        </h1>
                    </div>

                    <div class="fn3-two-column-layout">
                        <div class="fn3-left-column">
                            <div class="fn3-speaker-award-image-container">
                                <img src="https://placehold.co/600x400/E0E0E0/777777?text=Speaker+Award"
                                    alt="Chirag Chhabra receiving award" class="fn3-speaker-award-image" />
                            </div>

                            <div class="fn3-speaker-info-card">
                                <h2 class="fn3-speaker-name">Chirag Chhabra</h2>
                                <p class="fn3-speaker-detail">
                                    <i class="fas fa-users fn3-detail-icon"></i>
                                    Trained 1000+ Coaches and Affiliate Marketers
                                </p>
                                <p class="fn3-speaker-detail">
                                    <i class="fas fa-star fn3-detail-icon"></i>
                                    Rated 4.9/5
                                </p>
                            </div>

                            <h3 class="fn3-webinar-details-heading">Webinar Details</h3>

                            <div class="fn3-webinar-details-grid">
                                <div class="fn3-detail-item">
                                    <img width="55" height="55" src="https://img.icons8.com/color/48/clock.png" alt="clock"/>
                                    <p class="fn3-item-label">Duration</p>
                                    <p class="fn3-item-value">2 hours</p>
                                </div>
                                <div class="fn3-detail-item">
                                    <img width="55" height="55"
                                        src="https://img.icons8.com/3d-fluency/100/calendar.png" alt="calendar"
                                        class="fn3-item-icon" />
                                    <p class="fn3-item-label">Date</p>
                                    <p class="fn3-item-value">Upcoming Date</p>
                                </div>
                                <div class="fn3-detail-item">
                                    <img width="50" height="50" src="https://img.icons8.com/cotton/64/globe.png"
                                        alt="globe" class="fn3-item-icon" />
                                    <p class="fn3-item-label">Language</p>
                                    <p class="fn3-item-value">Hindi & English</p>
                                </div>
                                <div class="fn3-detail-item">
                                    <img width="55" height="55" src="https://img.icons8.com/ios/50/228BE6/camera--v3.png" alt="camera--v3"/>
                                    <p class="fn3-item-label">Venue</p>
                                    <p class="fn3-item-value">Zoom</p>
                                </div>
                            </div>
                        </div>

                        <div class="fn3-right-column">
                            <h3 class="fn3-why-attend-heading">
                                <i class="fas fa-lightbulb fn3-heading-icon"></i> Why Attend This Workshop?
                            </h3>

                            <div class="fn3-benefit-list">
                                <div class="fn3-benefit-item">
                                    <i class="fas fa-check-circle fn3-checkmark"></i>
                                    Break free from the constant hustle of chasing clients and still feeling stuck.
                                </div>
                                <div class="fn3-benefit-item">
                                    <i class="fas fa-check-circle fn3-checkmark"></i>
                                    No Tech Skills Needed | No Funnel Knowledge Required
                                </div>
                                <div class="fn3-benefit-item">
                                    <i class="fas fa-check-circle fn3-checkmark"></i>
                                    Discover why your current efforts aren't bringing results – and what to do instead.
                                </div>
                                <div class="fn3-benefit-item">
                                    <i class="fas fa-check-circle fn3-checkmark"></i>
                                    Build your dream coaching business without tech overwhelm, confusion, or burnout.
                                </div>
                                <div class="fn3-benefit-item">
                                    <i class="fas fa-check-circle fn3-checkmark"></i>
                                    Finally feel in control of your growth, income, and impact – without ads, funnels,
                                    or cold messages.
                                </div>
                                <div class="fn3-benefit-item">
                                    <i class="fas fa-check-circle fn3-checkmark"></i>
                                    Learn a simple yet powerful system that gets you results from Day 1 (without complex
                                    automations, paid tools, or boring theory).
                                </div>
                            </div>

                            <button class="fn3-register-button">
                                Register For Free
                            </button>

                            <p class="fn3-disclaimer">This free workshop will show you how to do exactly that.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="fn3-featured-section">
                <div class="fn3-featured-in-label">Featured in</div>
                <div class="fn3-media-logos">
                    <img src="https://placehold.co/150x50/E0E0E0/777777?text=Dailyhunt" alt="Dailyhunt"
                        class="fn3-media-logo" />
                    <img src="https://placehold.co/150x50/E0E0E0/777777?text=Hindustan+Times" alt="Hindustan Times"
                        class="fn3-media-logo" />
                    <img src="https://placehold.co/150x50/E0E0E0/777777?text=The+Print" alt="The Print"
                        class="fn3-media-logo" />
                    <img src="https://placehold.co/150x50/E0E0E0/777777?text=Business+Standard" alt="Business Standard"
                        class="fn3-media-logo" />
                </div>
            </section>

            <section class="fn3-struggle-section">
                <h2 class="fn3-struggle-heading">
                    <i class="fas fa-exclamation-triangle fn3-heading-icon"></i> STOP STRUGGLING TO FIND CLIENTS
                </h2>
                <div class="fn3-struggle-list">
                    <div class="fn3-struggle-item">
                        <i class="fas fa-times-circle fn3-cross-icon"></i> Tried posting on Instagram, but nothing
                        converts?
                    </div>
                    <div class="fn3-struggle-item">
                        <i class="fas fa-times-circle fn3-cross-icon"></i> Done with cold DMs and random content?
                    </div>
                    <div class="fn3-struggle-item">
                        <i class="fas fa-times-circle fn3-cross-icon"></i> Feel like you're meant for more, but tech
                        holds you back?
                    </div>
                </div>

                <p class="fn3-imagine-text">
                    Now imagine waking up to <span class="fn3-highlight-text">100+ quality leads a day</span>, reaching
                    out to work with you
                    – <span class="fn3-highlight-text">without paid ads, without DMing, and without begging.</span>
                </p>

                <p class="fn3-workshop-promise">
                    This free workshop will show you how to do exactly that.
                </p>
                <button class="fn3-register-button">
                    Register For Free
                </button>
            </section>

            <section class="fn3-learn-section">
                <div class="fn3-learn-separator"></div>
                <h3 class="fn3-learn-heading">
                    <i class="fas fa-check-circle fn3-learn-check-icon"></i> In Just 2 hours, You Will Learn:
                </h3>
            </section>

            <section class="fn3-learn-grid-section">
                <div class="fn3-learn-card">
                    <span class="fn3-card-icon">
                        <i class="fas fa-fire"></i>
                    </span>
                    <h4 class="fn3-card-title">100 Leads A Day Formula</h4>
                    <div class="fn3-progress-bar">
                        <div class="fn3-progress-fill" style="width: 95%"></div>
                    </div>
                    <p class="fn3-card-description">A plug-and-play AI method that brings in leads daily using FREE
                        tools</p>
                </div>
                <div class="fn3-learn-card">
                    <span class="fn3-card-icon">
                        <i class="fas fa-heart"></i>
                    </span>
                    <h4 class="fn3-card-title">No-Objection Sales Framework</h4>
                    <div class="fn3-progress-bar">
                        <div class="fn3-progress-fill" style="width: 90%"></div>
                    </div>
                    <p class="fn3-card-description">Close high-ticket clients (even if you hate selling)</p>
                </div>
                <div class="fn3-learn-card">
                    <span class="fn3-card-icon">
                        <i class="fas fa-gem"></i>
                    </span>
                    <h4 class="fn3-card-title">USP Builder Blueprint</h4>
                    <div class="fn3-progress-bar">
                        <div class="fn3-progress-fill" style="width: 85%"></div>
                    </div>
                    <p class="fn3-card-description">Craft a powerful personal brand that makes you stand out instantly
                    </p>
                </div>
                <div class="fn3-learn-card">
                    <span class="fn3-card-icon">
                        <i class="fas fa-cog"></i>
                    </span>
                    <h4 class="fn3-card-title">Funnels & Content Automation Setup</h4>
                    <div class="fn3-progress-bar">
                        <div class="fn3-progress-fill" style="width: 92%"></div>
                    </div>
                    <p class="fn3-card-description">No tech needed. Watch us build your system live in real time</p>
                </div>
                <div class="fn3-learn-card">
                    <span class="fn3-card-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </span>
                    <h4 class="fn3-card-title">Social Media Strategy for Coaches</h4>
                    <div class="fn3-progress-bar">
                        <div class="fn3-progress-fill" style="width: 88%"></div>
                    </div>
                    <p class="fn3-card-description">We show you what to post, when, and how to get leads without going
                        viral</p>
                </div>
            </section>

            <button class="fn3-register-button fn3-centered-button">
                Register For Free
            </button>

            <section class="fn3-for-you-section">
                <h3 class="fn3-for-you-heading"><i class="fas fa-fire fn3-heading-icon"></i> This Is For You If:</h3>
                <div class="fn3-for-you-list">
                    <div class="fn3-for-you-item">
                        <i class="fas fa-check-circle fn3-for-you-check"></i> You're a Coach, Therapist, Yoga
                        Instructor, or Nutritionist
                    </div>
                    <div class="fn3-for-you-item">
                        <i class="fas fa-check-circle fn3-for-you-check"></i> You want to automate your lead generation
                        and sales
                    </div>
                    <div class="fn3-for-you-item">
                        <i class="fas fa-check-circle fn3-for-you-check"></i> You're stuck offline or doing random stuff
                        online without results
                    </div>
                    <div class="fn3-for-you-item">
                        <i class="fas fa-check-circle fn3-for-you-check"></i> You've never used a landing page or funnel
                        before
                    </div>
                </div>
            </section>

            <section class="fn3-problem-section">
                <h2 class="fn3-problem-heading">
                    <span class="fn3-problem-icon"><i class="fas fa-lightbulb"></i></span> Your Current Problem is NOT
                    Your Content — It's Your System.
                </h2>
                <p class="fn3-problem-text">You don't need more likes or reels.</p>
                <p class="fn3-problem-text">You need a system that brings leads and clients on autopilot.</p>
                <p class="fn3-problem-text fn3-problem-bold">And that's exactly what we're going to build together.</p>
                <button class="fn3-register-button fn3-centered-button fn3-spacing-top">
                    Register For Free
                </button>
            </section>

            <section class="fn3-bonus-section">
                <h3 class="fn3-bonus-heading"><i class="fas fa-gift fn3-heading-icon"></i> BONUS (ONLY FOR LIVE
                    ATTENDEES)</h3>
                <div class="fn3-bonus-grid">
                    <div class="fn3-bonus-item">
                        <i class="fas fa-gift fn3-bonus-item-icon"></i>
                        <p class="fn3-bonus-item-text">AI Funnel Template</p>
                    </div>
                    <div class="fn3-bonus-item">
                        <i class="fas fa-gift fn3-bonus-item-icon"></i>
                        <p class="fn3-bonus-item-text">Social Media Content Calendar</p>
                    </div>
                    <div class="fn3-bonus-item">
                        <i class="fas fa-gift fn3-bonus-item-icon"></i>
                        <p class="fn3-bonus-item-text">High-Converting Lead Magnet Blueprint</p>
                    </div>
                    <div class="fn3-bonus-item">
                        <i class="fas fa-gift fn3-bonus-item-icon"></i>
                        <p class="fn3-bonus-item-text">No-Objection Sales Script</p>
                    </div>
                </div>
                <div class="fn3-bonus-exclusive-access">
                    <i class="fas fa-gift fn3-bonus-item-icon"></i>
                    <p class="fn3-bonus-item-text">Exclusive Lifetime Community Access</p>
                </div>

                <p class="fn3-bonus-giveaway">
                    <i class="fas fa-gift fn3-bonus-giveaway-icon"></i> Plus: Surprise Giveaway for First 50
                    Registrations
                </p>

                <button class="fn3-register-button fn3-centered-button fn3-spacing-top">
                    Register For Free
                </button>
            </section>

            <section class="fn3-real-coaches-section">
                <h2 class="fn3-real-coaches-heading">
                    <i class="fas fa-star fn3-heading-icon"></i> Real Coaches. Real Results
                </h2>
                <div class="fn3-real-coaches-testimonials">
                    <div class="fn3-coach-testimonial-card">
                        <p class="fn3-coach-quote">I was stuck for 8 months with no clients. After this workshop, I got
                            37 leads in 3 days!</p>
                        <div class="fn3-coach-info">
                            <i class="fas fa-user-circle fn3-coach-avatar-placeholder"></i>
                            <div>
                                <p class="fn3-coach-name">Aarti Mehra</p>
                                <p class="fn3-coach-role">Nutrition Coach</p>
                            </div>
                        </div>
                    </div>
                    <div class="fn3-coach-testimonial-card">
                        <p class="fn3-coach-quote">Finally understood how to position and sell my offer without being
                            salesy.</p>
                        <div class="fn3-coach-info">
                            <i class="fas fa-user-circle fn3-coach-avatar-placeholder"></i>
                            <div>
                                <p class="fn3-coach-name">Rohan Kapoor</p>
                                <p class="fn3-coach-role">Holistic Trainer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="fn3-carousel-testimonials-section">
                <div class="fn3-carousel-cards-container">
                    <div class="fn3-carousel-cards-wrapper">
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET KHUSHBOO</h4>
                            <p class="fn3-carousel-card-subtitle">Digital Marketer</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Khushboo" alt="Khushboo"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Closing High Ticket Offers with Email Daily</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET SHIVAY</h4>
                            <p class="fn3-carousel-card-subtitle">Business Consultant</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Shivay" alt="Shivay"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">AFTER - Closing Multi Lakh Every Month</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET AKSHAY</h4>
                            <p class="fn3-carousel-card-subtitle">Founder</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Akshay" alt="Akshay"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Closed his 2nd Deal Within 10 days</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET PRIYA</h4>
                            <p class="fn3-carousel-card-subtitle">Yoga Instructor</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Priya" alt="Priya"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Automated her client onboarding successfully</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET RAHUL</h4>
                            <p class="fn3-carousel-card-subtitle">Life Coach</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Rahul" alt="Rahul"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Generated 200+ leads in first month</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET ANJALI</h4>
                            <p class="fn3-carousel-card-subtitle">Wellness Expert</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Anjali" alt="Anjali"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Scaled to 6-figure business in 6 months</p>
                        </div>
                        <!-- Duplicate set for seamless loop -->
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET KHUSHBOO</h4>
                            <p class="fn3-carousel-card-subtitle">Digital Marketer</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Khushboo" alt="Khushboo"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Closing High Ticket Offers with Email Daily</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET SHIVAY</h4>
                            <p class="fn3-carousel-card-subtitle">Business Consultant</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Shivay" alt="Shivay"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">AFTER - Closing Multi Lakh Every Month</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET AKSHAY</h4>
                            <p class="fn3-carousel-card-subtitle">Founder</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Akshay" alt="Akshay"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Closed his 2nd Deal Within 10 days</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET PRIYA</h4>
                            <p class="fn3-carousel-card-subtitle">Yoga Instructor</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Priya" alt="Priya"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Automated her client onboarding successfully</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET RAHUL</h4>
                            <p class="fn3-carousel-card-subtitle">Life Coach</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Rahul" alt="Rahul"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Generated 200+ leads in first month</p>
                        </div>
                        <div class="fn3-carousel-card">
                            <h4 class="fn3-carousel-card-title">MEET ANJALI</h4>
                            <p class="fn3-carousel-card-subtitle">Wellness Expert</p>
                            <img src="https://placehold.co/300x180/E0E0E0/777777?text=Anjali" alt="Anjali"
                                class="fn3-carousel-card-image" />
                            <p class="fn3-carousel-card-text">Scaled to 6-figure business in 6 months</p>
                        </div>
                    </div>
                </div>
            </section>

            <button class="fn3-register-button fn3-centered-button fn3-spacing-top">
                Register For Free
            </button>

            <section class="fn3-testimonials-section">
                <h2 class="fn3-testimonials-heading">Hear From Coaches Like You</h2>
                <div class="fn3-testimonial-grid">
                    <a href="#" class="fn3-testimonial-card">
                        <img src="https://placehold.co/300x200/E0E0E0/777777?text=Testimonial+1" alt="Testimonial 1"
                            class="fn3-testimonial-thumbnail" />
                        <div class="fn3-play-overlay"><i class="fab fa-youtube fn3-youtube-icon"></i></div>
                        <div class="fn3-testimonial-content">
                            <p class="fn3-testimonial-title">"This One Decision Made A..."</p>
                            <p class="fn3-testimonial-name">Arun Chhabra</p>
                            <div class="fn3-star-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i
                                    class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                            <p class="fn3-watch-on">Watch on <i class="fab fa-youtube fn3-watch-youtube-icon"></i></p>
                        </div>
                    </a>
                    <a href="#" class="fn3-testimonial-card">
                        <img src="https://placehold.co/300x200/E0E0E0/777777?text=Testimonial+2" alt="Testimonial 2"
                            class="fn3-testimonial-thumbnail" />
                        <div class="fn3-play-overlay"><i class="fab fa-youtube fn3-youtube-icon"></i></div>
                        <div class="fn3-testimonial-content">
                            <p class="fn3-testimonial-title">"7 Figure Sales Closer, Shyre..."</p>
                            <p class="fn3-testimonial-name">Shreyank Jain</p>
                            <div class="fn3-star-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i
                                    class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                            <p class="fn3-watch-on">Watch on <i class="fab fa-youtube fn3-watch-youtube-icon"></i></p>
                        </div>
                    </a>
                    <a href="#" class="fn3-testimonial-card">
                        <img src="https://placehold.co/300x200/E0E0E0/777777?text=Testimonial+3" alt="Testimonial 3"
                            class="fn3-testimonial-thumbnail" />
                        <div class="fn3-play-overlay"><i class="fab fa-youtube fn3-youtube-icon"></i></div>
                        <div class="fn3-testimonial-content">
                            <p class="fn3-testimonial-title">"Sandeep's 6-Figure Digital..."</p>
                            <p class="fn3-testimonial-name">Sandeep</p>
                            <div class="fn3-star-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i
                                    class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                            <p class="fn3-watch-on">Watch on <i class="fab fa-youtube fn3-watch-youtube-icon"></i></p>
                        </div>
                    </a>
                    <a href="#" class="fn3-testimonial-card">
                        <img src="https://placehold.co/300x200/E0E0E0/777777?text=Testimonial+4" alt="Testimonial 4"
                            class="fn3-testimonial-thumbnail" />
                        <div class="fn3-play-overlay"><i class="fab fa-youtube fn3-youtube-icon"></i></div>
                        <div class="fn3-testimonial-content">
                            <p class="fn3-testimonial-title">"Shivan's Game Changing Moment!"</p>
                            <p class="fn3-testimonial-name">Shivani</p>
                            <div class="fn3-star-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i
                                    class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                            <p class="fn3-watch-on">Watch on <i class="fab fa-youtube fn3-watch-youtube-icon"></i></p>
                        </div>
                    </a>
                    <a href="#" class="fn3-testimonial-card">
                        <img src="https://placehold.co/300x200/E0E0E0/777777?text=Testimonial+5" alt="Testimonial 5"
                            class="fn3-testimonial-thumbnail" />
                        <div class="fn3-play-overlay"><i class="fab fa-youtube fn3-youtube-icon"></i></div>
                        <div class="fn3-testimonial-content">
                            <p class="fn3-testimonial-title">"From Dream to Award! Jyotsana's Win"</p>
                            <p class="fn3-testimonial-name">Jyotsana</p>
                            <div class="fn3-star-rating"><i class="fas fa-star"></i><i class="fas fa-star"></i><i
                                    class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                            <p class="fn3-watch-on">Watch on <i class="fab fa-youtube fn3-watch-youtube-icon"></i></p>
                        </div>
                    </a>
                </div>
            </section>

            <button class="fn3-register-button fn3-centered-button fn3-spacing-top">
                Register For Free
            </button>

            <section class="fn3-limited-spots-section">
                <h3 class="fn3-limited-spots-heading">
                    <i class="fas fa-lock fn3-heading-icon"></i> Limited Spots Available (Fills Fast Every Time)
                </h3>
                <p class="fn3-limited-spots-text">
                    This workshop is <span class="fn3-highlight-text">LIVE, practical, and results-focused.</span>
                </p>
                <p class="fn3-limited-spots-text">
                    We're only accepting <span class="fn3-highlight-text">serious, committed coaches.</span>
                </p>
                <p class="fn3-limited-spots-text">
                    Once it's full — it's full.
                </p>
                <button class="fn3-register-button fn3-centered-button fn3-spacing-top">
                    Secure Your Spot Now
                </button>
            </section>

            <section class="fn3-about-mentor-section">
                <h2 class="fn3-about-mentor-heading">About Mentor</h2>
                <p class="fn3-about-mentor-subheading">& The Tremendous Change She'll Help Bring In Your Life</p>
                <div class="fn3-mentor-details-layout">
                    <div class="fn3-mentor-image-container">
                        <img src="https://placehold.co/300x350/E0E0E0/777777?text=Chirag+Chhabra"
                            alt="Chirag Chhabra - Mentor" class="fn3-mentor-image" />
                        <div class="fn3-mentor-caption">
                            <p class="fn3-mentor-caption-name">Chirag Chhabra</p>
                            <p class="fn3-mentor-caption-role">Leading Business Coach</p>
                            <p class="fn3-mentor-caption-specialty">Quality leads Specialist</p>
                        </div>
                    </div>

                    <div class="fn3-mentor-text-content">
                        <p class="fn3-mentor-paragraph">
                            A Growth-Focused Coach With Real Business Experience Chirag isn't just another trainer. He's
                            a business coach who has worked directly with hundreds of health and wellness coaches to
                            build systems that actually bring clients – without chasing, begging, or burning out.
                        </p>
                        <p class="fn3-mentor-paragraph fn3-mentor-struggle">
                            He knows your struggles. No leads. No sales. No clarity.
                        </p>
                        <p class="fn3-mentor-paragraph">
                            That's exactly why he created this challenge – to help you stop guessing and start growing.
                        </p>
                        <p class="fn3-mentor-paragraph">
                            Over the past few years, he's helped solo coaches:
                        </p>
                        <ul class="fn3-mentor-list">
                            <li>
                                <i class="fas fa-check-circle fn3-mentor-check"></i>
                                Get 100+ leads a day (without paid ads)
                            </li>
                            <li>
                                <i class="fas fa-check-circle fn3-mentor-check"></i>
                                Automate their sales process
                            </li>
                            <li>
                                <i class="fas fa-check-circle fn3-mentor-check"></i>
                                Close high-ticket offers with confidence
                            </li>
                            <li>
                                <i class="fas fa-check-circle fn3-mentor-check"></i>
                                Build six-figure businesses – even with zero tech background.
                            </li>
                        </ul>
                        <p class="fn3-mentor-paragraph">This isn't theory. It's real-world business. And Chirag is here
                            to work with you, step-by-step, until you get the results you deserve.</p>
                    </div>
                </div>
                <div class="fn3-my-mission-card">
                    <h4 class="fn3-my-mission-heading">My Mission</h4>
                    <p class="fn3-my-mission-quote">"To help every coach turn their passion into profit – <span
                            class="fn3-quote-highlight">using simple tools, proven frameworks, and automation that
                            works.</span>"</p>
                </div>
            </section>

            <section class="fn3-faq-section">
                <h2 class="fn3-faq-heading"><i class="fas fa-question-circle fn3-heading-icon"></i> Frequently Asked
                    Questions</h2>
                <div class="fn3-faq-container">
                    <div class="fn3-faq-item">
                        <div class="fn3-faq-question" onclick="toggleFaq(0)">
                            Do I need to be tech-savvy?
                            <i class="fas fa-angle-down fn3-faq-arrow"></i>
                        </div>
                        <div class="fn3-faq-answer">
                            <p>No, absolutely not! This workshop is designed for coaches of all tech levels. We'll show
                                you how to build your system live, step-by-step, with no prior tech or funnel knowledge
                                required.</p>
                        </div>
                    </div>

                    <div class="fn3-faq-item">
                        <div class="fn3-faq-question" onclick="toggleFaq(1)">
                            Is this workshop really free?
                            <i class="fas fa-angle-down fn3-faq-arrow"></i>
                        </div>
                        <div class="fn3-faq-answer">
                            <p>Yes, it's 100% free. We believe in providing immense value upfront to help coaches
                                succeed. Our goal is to demonstrate the power of our methods, hoping you'll consider our
                                advanced programs in the future if you find this workshop beneficial.</p>
                        </div>
                    </div>

                    <div class="fn3-faq-item">
                        <div class="fn3-faq-question" onclick="toggleFaq(2)">
                            What if I miss the live session?
                            <i class="fas fa-angle-down fn3-faq-arrow"></i>
                        </div>
                        <div class="fn3-faq-answer">
                            <p>We highly recommend attending live to get the most out of the interactive sessions, Q&A,
                                and exclusive live bonuses. However, a replay might be available for a limited time for
                                registered participants. Details will be shared during the workshop.</p>
                        </div>
                    </div>

                    <div class="fn3-faq-item">
                        <div class="fn3-faq-question" onclick="toggleFaq(3)">
                            How long is the workshop?
                            <i class="fas fa-angle-down fn3-faq-arrow"></i>
                        </div>
                        <div class="fn3-faq-answer">
                            <p>The workshop is scheduled for 2 hours. We'll cover all the core concepts and practical
                                steps within this timeframe, plus a Q&A session.</p>
                        </div>
                    </div>

                    <div class="fn3-faq-item">
                        <div class="fn3-faq-question" onclick="toggleFaq(4)">
                            What results can I expect?
                            <i class="fas fa-angle-down fn3-faq-arrow"></i>
                        </div>
                        <div class="fn3-faq-answer">
                            <p>By implementing the strategies from this workshop, you can expect to generate more
                                qualified leads, understand how to automate parts of your sales process, and build a
                                stronger brand presence online, ultimately leading to more clients and business growth.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer class="fn3-footer">
            <div class="fn3-footer-content">
                <p>&copy; 2024 Chirag Chhabra Coaching. All Rights Reserved.</p>
                <p>Empowering Health & Wellness Coaches to Achieve Excellence and Automation.</p>
            </div>
        </footer>

        <div class="fn3-sticky-register-bar">
            <div class="fn3-sticky-timer-section">
                <span class="fn3-sticky-offer-ends">Offer Ends in</span><br />
                <span class="fn3-sticky-countdown" id="countdown">5:00 Mins</span>
            </div>
            <div class="fn3-sticky-logo-section">
                <i class="fas fa-gem fn3-sticky-logo-icon"></i>
                <span class="fn3-sticky-logo-text">Kohinoor</span>
            </div>
            <button class="fn3-sticky-register-now-button" onclick="registerNow()">
                Register Now
            </button>
        </div>
    </div>
            `,
            js: `    // FAQ Toggle Functionality
        function toggleFaq(index) {
            const faqItems = document.querySelectorAll('.fn3-faq-item');
            const currentItem = faqItems[index];
            const isOpen = currentItem.classList.contains('open');

            // Close all FAQ items
            faqItems.forEach(item => item.classList.remove('open'));

            // Open the clicked item if it wasn't already open
            if (!isOpen) {
                currentItem.classList.add('open');
            }
        }

        // Countdown Timer
        let timeLeft = 5 * 60; // 5 minutes in seconds

        function updateCountdown() {
            if (timeLeft <= 0) {
                document.getElementById('countdown').textContent = "0:00 Mins";
                return;
            }

            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
         document.getElementById('countdown').textContent = mins + ':' + (secs < 10 ? '0' : '') + secs + ' Mins';

            timeLeft--;
        }

        // Update countdown every second
        setInterval(updateCountdown, 1000);

        // Registration button functionality
        function registerNow() {
            alert("Registration functionality would be implemented here!");
            // In a real implementation, this would redirect to a registration form
            // or open a modal with registration details
        }

        // Add click handlers to all register buttons
        document.addEventListener('DOMContentLoaded', function () {
            const registerButtons = document.querySelectorAll('.fn3-register-button');
            registerButtons.forEach(button => {
                button.addEventListener('click', registerNow);
            });

            // Progress bar animation on scroll
            const progressBars = document.querySelectorAll('.fn3-progress-fill');
            const observerOptions = {
                threshold: 0.5,
                rootMargin: '0px'
            };

            const progressObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const progressBar = entry.target;
                        const width = progressBar.style.width;
                        progressBar.style.width = '0%';
                        setTimeout(() => {
                            progressBar.style.width = width;
                        }, 100);
                    }
                });
            }, observerOptions);

            progressBars.forEach(bar => progressObserver.observe(bar));
        });

        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add some basic animations on scroll
        const animateOnScrollElements = document.querySelectorAll('.fn3-learn-card, .fn3-coach-testimonial-card, .fn3-carousel-card');

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        animateOnScrollElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            scrollObserver.observe(el);
        });`
           },

        // Add Fitness VSL Templates
        ...fitnessVSLTemplates

    }
};