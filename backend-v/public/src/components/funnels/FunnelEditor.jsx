import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSync, FaDownload, FaArrowLeft, FaMagic, FaFileAlt, FaSave, FaFileExport, FaArrowDown, FaCalendarDay, FaGripVertical, FaCode, FaMoon, FaSun, FaLaptop, FaTabletAlt, FaMobileAlt, FaLayerGroup, FaExchangeAlt, FaThLarge, FaTimes, FaPlus, FaCube, FaCopy, FaClone, FaTrash } from 'react-icons/fa';
import axios from "axios";
import { useAuth } from '../../contexts/AuthContext';
import { templates } from '../funnel-builder/df_temp.jsx';
import addLandingPageComponents from '../funnel-builder/function.jsx';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from "grapesjs-preset-webpage";
import gjsCountdown from "grapesjs-component-countdown";
import gjsTabs from "grapesjs-tabs";
import gjsCustomCode from "grapesjs-custom-code";
import gjsTooltip from "grapesjs-tooltip";
import gjsTyped from "grapesjs-typed";
import gjsNavbar from "grapesjs-navbar";
import gjsBlocksBasic from "grapesjs-blocks-basic";

import gjsStyleGradient from 'grapesjs-style-gradient';
import gjsPluginExport from 'grapesjs-plugin-export';

const BUILDER_PANEL_ENABLED = false;

const SECTION_LAYOUTS = [
  { id: 'section-full', label: 'Full Width', description: 'Edge-to-edge hero section', actionType: 'section', payload: { maxWidth: '100%', columns: 1, background: '#0f172a', textColor: '#ffffff' } },
  { id: 'section-wide', label: 'Wide', description: 'Great for hero + media combos', actionType: 'section', payload: { maxWidth: '1280px', columns: 1, background: '#ffffff', textColor: '#0f172a' } },
  { id: 'section-medium', label: 'Medium', description: 'Content focused layout', actionType: 'section', payload: { maxWidth: '960px', columns: 1, background: '#ffffff', textColor: '#0f172a' } },
  { id: 'section-small', label: 'Small', description: 'Compact spotlight or CTA', actionType: 'section', payload: { maxWidth: '720px', columns: 1, background: '#ffffff', textColor: '#0f172a' } },
];

const COLUMN_LAYOUTS = [
  { id: 'columns-one', label: '1 Column', description: 'Single column content block', actionType: 'columns', payload: { columns: 1 } },
  { id: 'columns-two', label: '2 Columns', description: 'Balanced two column layout', actionType: 'columns', payload: { columns: 2 } },
  { id: 'columns-two-wide-left', label: '2 Columns 3/7', description: 'Sidebar + content layout', actionType: 'columns', payload: { columns: 2, template: '3fr 7fr' } },
  { id: 'columns-three', label: '3 Columns', description: 'Feature highlights', actionType: 'columns', payload: { columns: 3 } },
  { id: 'columns-four', label: '4 Columns', description: 'Icon or stat grid', actionType: 'columns', payload: { columns: 4 } },
];

const ELEMENT_BLOCKS = [
  { id: 'element-heading', label: 'Hero Heading', description: 'Large center aligned heading', actionType: 'element', payload: { type: 'heading' } },
  { id: 'element-text', label: 'Paragraph', description: 'Readable multiline text block', actionType: 'element', payload: { type: 'paragraph' } },
  { id: 'element-button', label: 'CTA Button', description: 'Primary gradient button', actionType: 'element', payload: { type: 'button' } },
  { id: 'element-image', label: 'Image', description: 'Responsive image placeholder', actionType: 'element', payload: { type: 'image' } },
  { id: 'element-video', label: 'Video Embed', description: '16:9 responsive frame', actionType: 'element', payload: { type: 'video' } },
];

const PREBUILT_SECTIONS = [
  { id: 'prebuilt-hero', label: 'Hero + CTA', description: 'Hero copy with CTA button and supporting text', actionType: 'prebuilt', payload: { template: 'hero' } },
  { id: 'prebuilt-feature', label: 'Feature Grid', description: 'Three column feature showcase', actionType: 'prebuilt', payload: { template: 'features' } },
  { id: 'prebuilt-testimonial', label: 'Testimonial', description: 'Quote with avatar and rating', actionType: 'prebuilt', payload: { template: 'testimonial' } },
];

const CTA_BLOCKS = [
  { id: 'cta-banner', label: 'CTA Banner', description: 'High-impact CTA bar with button', actionType: 'prebuilt', payload: { template: 'cta' } },
  { id: 'cta-split', label: 'Two-Column CTA', description: 'Copy + checklist + CTA', actionType: 'prebuilt', payload: { template: 'cta-split' } },
];

const FORM_LAYOUTS = [
  { id: 'form-simple', label: 'Simple Form', description: 'Name, email, phone stacked inputs', actionType: 'prebuilt', payload: { template: 'form-simple' } },
  { id: 'form-dual', label: 'Two Column Form', description: 'Compact form for bookings', actionType: 'prebuilt', payload: { template: 'form-dual' } },
];

const FAQ_SECTIONS = [
  { id: 'faq-list', label: 'FAQ List', description: 'Stacked accordion style questions', actionType: 'prebuilt', payload: { template: 'faq' } },
];

const STATS_SECTIONS = [
  { id: 'stats-grid', label: 'Stats Grid', description: 'KPIs with icons', actionType: 'prebuilt', payload: { template: 'stats' } },
  { id: 'timeline', label: 'Timeline', description: 'Milestones/roadmap cards', actionType: 'prebuilt', payload: { template: 'timeline' } },
];

const GLOBAL_SECTIONS = [
  { id: 'global-banner', label: 'Announcement Banner', description: 'Reusable top banner for promotions', actionType: 'global', payload: { title: 'Announcement', body: 'Add your global announcement here.' } },
  { id: 'global-footer', label: 'Footer Links', description: 'Footer navigation links section', actionType: 'global', payload: { title: 'Footer Links', body: 'Add your site-wide footer links here.' } },
];

const CUSTOM_VALUE_ITEMS = [
  { id: 'custom-name', label: '{{user_name}}', description: 'Personalize with the visitor name', actionType: 'customValue', payload: { token: '{{user_name}}' } },
  { id: 'custom-date', label: '{{current_date}}', description: 'Show current date dynamically', actionType: 'customValue', payload: { token: '{{current_date}}' } },
  { id: 'custom-city', label: '{{city}}', description: 'Location-aware placeholder', actionType: 'customValue', payload: { token: '{{city}}' } },
];

const BUILDER_ITEM_MAP = {
  sections: SECTION_LAYOUTS,
  columns: COLUMN_LAYOUTS,
  elements: ELEMENT_BLOCKS,
  'pre-built': PREBUILT_SECTIONS,
  cta: CTA_BLOCKS,
  forms: FORM_LAYOUTS,
  faq: FAQ_SECTIONS,
  stats: STATS_SECTIONS,
  'global-section': GLOBAL_SECTIONS,
  'custom-value': CUSTOM_VALUE_ITEMS,
};

const STATIC_BUILDER_GROUPS = [
  { id: 'sections', label: 'Section' },
  { id: 'columns', label: 'Column' },
  { id: 'elements', label: 'Elements' },
  { id: 'pre-built', label: 'Pre-Built' },
  { id: 'cta', label: 'Call To Action' },
  { id: 'forms', label: 'Forms' },
  { id: 'stats', label: 'Metrics' },
  { id: 'faq', label: 'FAQ' },
  { id: 'global-section', label: 'Global Section' },
  { id: 'custom-value', label: 'Custom Value' },
];

const DAY_NAME_TO_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

const DAY_DATE_LOCALE = 'en-IN';
const DAY_DATE_TIMEZONE = 'Asia/Kolkata';

const getLocalizedNow = () => {
  const now = new Date();
  return new Date(
    now.toLocaleString('en-US', { timeZone: DAY_DATE_TIMEZONE })
  );
};

const formatRecentDateDisplay = (date) =>
  new Intl.DateTimeFormat(DAY_DATE_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: DAY_DATE_TIMEZONE
  }).format(date);

const getUpcomingDateForDay = (dayName) => {
  if (!dayName || typeof DAY_NAME_TO_INDEX[dayName] === 'undefined') {
    return '';
  }

  const today = getLocalizedNow();
  const targetDay = DAY_NAME_TO_INDEX[dayName];
  const currentDay = today.getDay();

  const daysToAdd = (targetDay - currentDay + 7) % 7;
  const upcomingDate = new Date(today);
  upcomingDate.setDate(today.getDate() + daysToAdd);

  return formatRecentDateDisplay(upcomingDate);
};

const normalizeDaySelection = (selectionInput, fallbackDate) => {
  if (!selectionInput) return [];

  if (Array.isArray(selectionInput)) {
    return selectionInput
      .map(item => {
        if (!item) return null;
        if (typeof item === 'string') {
          return { day: item, date: getUpcomingDateForDay(item) };
        }
        if (typeof item === 'object') {
          const normalizedDay = item.day || item.value;
          if (!normalizedDay) return null;
          return {
            day: normalizedDay,
            date: item.date || getUpcomingDateForDay(normalizedDay)
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  if (typeof selectionInput === 'string') {
    return [{
      day: selectionInput,
      date: fallbackDate || getUpcomingDateForDay(selectionInput)
    }];
  }

  if (typeof selectionInput === 'object') {
    const normalizedDay = selectionInput.day || selectionInput.value;
    if (!normalizedDay) return [];
    return [{
      day: normalizedDay,
      date: selectionInput.date || fallbackDate || getUpcomingDateForDay(normalizedDay)
    }];
  }

  return [];
};

const formatDaySummary = (entries) => (
  entries.length ? entries.map(entry => entry.day).join(', ') : 'Click Day Selector to choose'
);

const formatDateSummary = (entries) => (
  entries.length ? entries.map(entry => entry.date || getUpcomingDateForDay(entry.day)).join(', ') : 'No day selected'
);

const parseDaySelectionFromElement = (element) => {
  if (!element) return [];

  const multiAttr = element.getAttribute('data-selected-days');
  if (multiAttr) {
    try {
      const parsed = JSON.parse(multiAttr);
      const normalized = normalizeDaySelection(parsed);
      if (normalized.length) {
        return normalized;
      }
    } catch (error) {
      // Failed to parse data-selected-days
    }
  }

  const singleDay = element.getAttribute('data-selected-day');
  if (singleDay) {
    const singleDate = element.getAttribute('data-recent-date');
    return normalizeDaySelection(singleDay, singleDate);
  }

  return [];
};

//** Floating Form Button Component **//
const FloatingFormButton = ({ forms, onScrollToForm }) => {
  if (forms.length === 0) return null;

  return (
    <div className="floating-form-buttons">
      {forms.map((form, index) => (
        <button
          key={`${form.type}-${index}`}
          className="floating-form-btn"
          onClick={() => onScrollToForm(form.selector)}
          title={`Scroll to ${form.label}`}
        >
          <FaArrowDown />
          <span>{form.label}</span>
        </button>
      ))}
    </div>
  );
};

//** Redirect Page Selector Popup **//
const RedirectPageSelector = ({ stages, currentStageId, onSelect, onClose }) => {
  const [selectedPage, setSelectedPage] = useState('');
  const [redirectMode, setRedirectMode] = useState('page');
  const [customLink, setCustomLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (redirectMode === 'page') {
      if (!selectedPage) {
        alert('Please select a redirect page');
        return;
      }
      onSelect(selectedPage);
      onClose();
      return;
    }

    const trimmedLink = customLink.trim();
    if (!trimmedLink) {
      alert('Please enter a redirect link');
      return;
    }
    if (!/^https?:\/\//i.test(trimmedLink)) {
      alert('Please enter a full URL starting with http:// or https://');
      return;
    }

    onSelect(trimmedLink);
    onClose();
  };

  return (
    <div className="redirect-popup-content">
      <h3>Select Redirect Destination</h3>
      <p>Choose a funnel page or enter a custom link for post-submit redirect.</p>

      <div className="redirect-mode-toggle">
        <button
          type="button"
          className={`redirect-mode-btn ${redirectMode === 'page' ? 'active' : ''}`}
          onClick={() => setRedirectMode('page')}
        >
          Funnel Pages
        </button>
        <button
          type="button"
          className={`redirect-mode-btn ${redirectMode === 'link' ? 'active' : ''}`}
          onClick={() => setRedirectMode('link')}
        >
          Custom Link
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {redirectMode === 'page' && (
          <div className="form-group">
            <label className="input-label">Choose a funnel page</label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              required
            >
              <option value="">-- Select a page --</option>
              {stages
                .filter(stage => stage.id !== currentStageId)
                .map(stage => (
                  <option key={stage.id} value={stage.slug || stage.id}>
                    {stage.name} ({stage.type})
                  </option>
                ))}
            </select>
          </div>
        )}

        {redirectMode === 'link' && (
          <div className="form-group">
            <label className="input-label">Custom redirect URL</label>
            <input
              type="url"
              placeholder="https://example.com/thank-you"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              required
            />
            <small className="helper-text">
              Include the full URL (https://...) to redirect outside the funnel.
            </small>
          </div>
        )}

        <div className="popup-buttons">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Set Redirect
          </button>
        </div>
      </form>
    </div>
  );
};

//** Professional Success Popup Component with Party Effect & Sound **//
const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    // Play professional success sound
    try {
      // Create Web Audio API context for professional sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Professional success sound sequence
      const playSuccessSound = () => {
        const now = audioContext.currentTime;
        
        // First tone (Higher pitch)
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
        oscillator1.frequency.value = 800;
        oscillator1.type = 'sine';
        gainNode1.gain.setValueAtTime(0.3, now);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator1.start(now);
        oscillator1.stop(now + 0.3);
        
        // Second tone (Lower pitch - confirmation)
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 600;
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0, now + 0.15);
        gainNode2.gain.setValueAtTime(0.35, now + 0.15);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator2.start(now + 0.15);
        oscillator2.stop(now + 0.5);
      };
      
      playSuccessSound();
    } catch (error) {
      // Audio not supported
    }

    // Professional particle effect (more particles for party feel)
    const particleColors = ['#10b981', '#3b82f6', '#059669', '#2563eb', '#8b5cf6', '#06b6d4'];
    const particleCount = 80;
    const particleElements = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'success-particle-professional';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 0.5 + 's';
      particle.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
      particle.style.animationDuration = (Math.random() * 1.5 + 2) + 's';
      particle.style.setProperty('--particle-x', `${(Math.random() - 0.5) * 200}px`);
      particle.style.setProperty('--particle-rotate', `${Math.random() * 720}deg`);
      
      const size = Math.random() * 6 + 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      document.body.appendChild(particle);
      particleElements.push(particle);
    }

    // Professional confetti effect
    const confettiColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
    const confettiCount = 50;
    const confettiElements = [];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'professional-confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 0.3 + 's';
      confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      confetti.style.animationDuration = (Math.random() * 1.5 + 2.5) + 's';
      confetti.style.setProperty('--confetti-x', `${(Math.random() - 0.5) * 150}px`);
      
      const width = Math.random() * 8 + 4;
      const height = Math.random() * 12 + 6;
      confetti.style.width = width + 'px';
      confetti.style.height = height + 'px';
      
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    // Auto close after 3.5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    // Cleanup
    return () => {
      clearTimeout(timer);
      particleElements.forEach(el => el.remove());
      confettiElements.forEach(el => el.remove());
    };
  }, [onClose]);

  return (
    <div className="success-popup-overlay">
      <div className="success-popup-content">
        {/* Professional Party Sparkles */}
        <div className="success-sparkles">
          <span className="sparkle sparkle-1">✨</span>
          <span className="sparkle sparkle-2">⭐</span>
          <span className="sparkle sparkle-3">✨</span>
          <span className="sparkle sparkle-4">💫</span>
        </div>

        {/* Professional Checkmark Circle */}
        <div className="success-icon-container">
          <svg className="success-checkmark-svg" viewBox="0 0 52 52">
            <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
          {/* Pulse rings for celebration */}
          <div className="success-pulse-ring"></div>
          <div className="success-pulse-ring-2"></div>
        </div>

        {/* Professional Title & Message */}
        <h2 className="success-title">
          <span className="title-icon">🎉</span>
          Operation Successful
          <span className="title-icon">🎉</span>
        </h2>
        <p className="success-message">{message}</p>
        
        {/* Professional Status Indicators */}
        <div className="success-details">
          <div className="success-detail-item">
            <div className="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span className="detail-text">Changes saved successfully</span>
          </div>
          <div className="success-detail-item">
            <div className="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
              </svg>
            </div>
            <span className="detail-text">Synced to cloud storage</span>
          </div>
          <div className="success-detail-item">
            <div className="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span className="detail-text">Ready for deployment</span>
          </div>
        </div>

        <button onClick={onClose} className="success-close-btn">
          <span>Continue Working</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        
        <p className="success-footer-text">This dialog will close automatically in a moment</p>
      </div>
    </div>
  );
};

//** Day Selector Popup Component **//
const DaySelectorPopup = ({ onSelect, onClose, initialSelection = [] }) => {
  const normalizedInitialSelection = useMemo(
    () => normalizeDaySelection(initialSelection),
    [initialSelection]
  );
  const [selectedDays, setSelectedDays] = useState(normalizedInitialSelection);

  useEffect(() => {
    setSelectedDays(normalizedInitialSelection);
  }, [normalizedInitialSelection]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDaySelection = (day) => {
    setSelectedDays((prev) => {
      const exists = prev.find((item) => item.day === day);
      if (exists) {
        return prev.filter((item) => item.day !== day);
      }
      return [
        ...prev,
        {
          day,
          date: getUpcomingDateForDay(day)
        }
      ];
    });
  };

  const applyPresetDays = (presetDays) => {
    const uniqueDays = Array.from(new Set(presetDays));
    setSelectedDays(uniqueDays.map((day) => ({
      day,
      date: getUpcomingDateForDay(day)
    })));
  };

  const handleQuickSelect = (type) => {
    switch (type) {
      case 'weekdays':
        applyPresetDays(daysOfWeek.slice(0, 5));
        break;
      case 'weekend':
        applyPresetDays(daysOfWeek.slice(5));
        break;
      case 'all':
        applyPresetDays(daysOfWeek);
        break;
      case 'clear':
        setSelectedDays([]);
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }
    const normalized = normalizeDaySelection(selectedDays);
    onSelect(normalized);
    onClose();
  };

  return (
    <div className="day-selector-popup-content">
      <div className="day-popup-header">
        <div className="day-popup-icon">📅</div>
        <div className="day-popup-copy">
          <h3>Schedule Days</h3>
          <p>Select any combination of days to keep the widget dated automatically.</p>
        </div>
        <div className="selected-count">
          <span>{selectedDays.length}</span>
          <small>Selected</small>
        </div>
      </div>

      <div className="quick-select-row">
        <button type="button" className="quick-select-btn" onClick={() => handleQuickSelect('weekdays')}>
          Weekdays
        </button>
        <button type="button" className="quick-select-btn" onClick={() => handleQuickSelect('weekend')}>
          Weekend
        </button>
        <button type="button" className="quick-select-btn" onClick={() => handleQuickSelect('all')}>
          All Days
        </button>
        <button type="button" className="quick-select-btn ghost" onClick={() => handleQuickSelect('clear')}>
          Clear
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="day-grid-popup">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className={`day-card-popup ${selectedDays.some((item) => item.day === day) ? 'selected' : ''}`}
              onClick={() => toggleDaySelection(day)}
            >
              <span className="day-name">{day}</span>
              <span className="day-date">{getUpcomingDateForDay(day)}</span>
            </div>
          ))}
        </div>

        {selectedDays.length > 0 && (
          <div className="day-summary-panel">
            <div className="summary-header">
              <div>
                <p className="summary-label">Selected Snapshot</p>
                <h4>{selectedDays.length} day{selectedDays.length > 1 ? 's' : ''} scheduled</h4>
            </div>
              <button type="button" className="ghost-btn small" onClick={() => setSelectedDays([])}>
                Clear Selection
              </button>
            </div>

            <div className="summary-chip-list">
              {selectedDays.map((item) => (
                <div key={item.day} className="summary-chip">
                  <strong>{item.day}</strong>
                  <span>{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="popup-buttons">
          <button
            type="button"
            onClick={() => setSelectedDays(normalizedInitialSelection)}
            className="ghost-btn"
          >
            Reset
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={selectedDays.length === 0}>
            Apply Selection
          </button>
        </div>
      </form>
    </div>
  );
};

//** Template Selector Component **//
const StageTemplateSelector = ({ stageType, selectedKey, onSelect }) => {
  const templateSet = {
    'welcome-page': templates.welcomeTemplates,
    'vsl-page': templates.vslTemplates,
    'thankyou-page': templates.thankyouTemplates,
    'whatsapp-page': templates.whatsappTemplates,
    'product-offer': templates.productOfferTemplates,
    'custom-page': templates.miscTemplates,
    'appointment-page': templates.appointmentTemplates,
    'payment-page': templates.paymentTemplates,
  }[stageType];

  if (!templateSet || Object.keys(templateSet).length === 0) {
    return (
      <div className="no-templates-message">
        <p>No templates available for this stage type.</p>
      </div>
    );
  }

  return (
    <div className="template-selector-container">
      <h3 className="template-selector-title">Select a Template</h3>
      <div className="template-grid">
        {Object.entries(templateSet).map(([key, template]) => (
          <div
            key={key}
            className={`template-card ${selectedKey === key ? 'selected' : ''}`}
            onClick={() => onSelect(key)}
          >
            <div className="template-thumbnail">
              <img
                src={template.thumbnail}
                alt={template.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x300/ccc/ffffff?text=No+Image';
                }}
              />
            </div>
            <div className="template-info">
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

//** AI Generative Popup Component **//
const AIGenerativePopup = ({ onClose, onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) {
      alert('Please provide a description for the content you want to generate.');
      return;
    }
    onSubmit({ description });
  };

  return (
    <div className="ai-popup-content">
      <h3>AI Content Generation</h3>
      <p>Describe the changes you want to make to the content:</p>
      <div className="description-section">
        <label>Describe what you want:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., 'Make the headline more exciting and shorten the paragraph about benefits.'"
          rows={4}
        />
      </div>
      <div className="ai-popup-buttons">
        <button
          onClick={onClose}
          className="ai-cancel-btn cancel"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="ai-submit-btn upload"
          disabled={isLoading || !description.trim()}
        >
          {isLoading ? 'Generating...' : 'Update Content'}
        </button>
      </div>
    </div>
  );
};

//** Custom Code Popup Component **//
const CustomCodePopup = ({ onClose, onSubmit }) => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [activeTab, setActiveTab] = useState('html');

  const handleSubmit = () => {
    if (!htmlCode.trim() && !cssCode.trim() && !jsCode.trim()) {
      alert('Please enter at least one type of code (HTML, CSS, or JS).');
      return;
    }
    onSubmit({ html: htmlCode, css: cssCode, js: jsCode });
  };

  return (
    <div className="custom-code-popup-content">
      <div className="custom-code-popup-header">
        <div className="popup-header-icon">
          <FaCode />
        </div>
        <div className="popup-header-text">
          <h3>Add Custom Code</h3>
          <p>Enter your HTML, CSS, and/or JS code. The code will be added to the bottom of the current page.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="code-tabs-navigation">
        <button
          className={`code-tab ${activeTab === 'html' ? 'active' : ''}`}
          onClick={() => setActiveTab('html')}
        >
          <span className="code-icon html-icon">&lt;/&gt;</span>
          <span>HTML</span>
          {htmlCode.length > 0 && <span className="tab-badge">{htmlCode.length}</span>}
        </button>
        <button
          className={`code-tab ${activeTab === 'css' ? 'active' : ''}`}
          onClick={() => setActiveTab('css')}
        >
          <span className="code-icon css-icon">&#123; &#125;</span>
          <span>CSS</span>
          {cssCode.length > 0 && <span className="tab-badge">{cssCode.length}</span>}
        </button>
        <button
          className={`code-tab ${activeTab === 'js' ? 'active' : ''}`}
          onClick={() => setActiveTab('js')}
        >
          <span className="code-icon js-icon">JS</span>
          <span>JavaScript</span>
          {jsCode.length > 0 && <span className="tab-badge">{jsCode.length}</span>}
        </button>
      </div>
      
      <div className="custom-code-tabs-container">
        {/* HTML Tab Content */}
        {activeTab === 'html' && (
          <div className="code-section-wrapper html-section">
            <div className="code-section-header">
              <span className="code-icon html-icon">&lt;/&gt;</span>
              <label>HTML Code</label>
              <span className="code-count">{htmlCode.length} characters</span>
            </div>
            <div className="textarea-container">
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder="<!-- Enter your HTML code here -->"
                rows={10}
                className="code-textarea html-textarea"
              />
            </div>
          </div>
        )}

        {/* CSS Tab Content */}
        {activeTab === 'css' && (
          <div className="code-section-wrapper css-section">
            <div className="code-section-header">
              <span className="code-icon css-icon">&#123; &#125;</span>
              <label>CSS Code</label>
              <span className="code-count">{cssCode.length} characters</span>
            </div>
            <div className="textarea-container">
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                placeholder="/* Enter your CSS code here */"
                rows={10}
                className="code-textarea css-textarea"
              />
            </div>
          </div>
        )}

        {/* JS Tab Content */}
        {activeTab === 'js' && (
          <div className="code-section-wrapper js-section">
            <div className="code-section-header">
              <span className="code-icon js-icon">JS</span>
              <label>JavaScript Code</label>
              <span className="code-count">{jsCode.length} characters</span>
            </div>
            <div className="textarea-container">
              <textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                placeholder="// Enter your JavaScript code here"
                rows={10}
                className="code-textarea js-textarea"
              />
            </div>
          </div>
        )}
      </div>

      <div className="custom-code-popup-footer">
        <div className="popup-info-text">
          <span>💡 Tip: You can enter any combination of HTML, CSS, and JavaScript code</span>
        </div>
        <div className="custom-code-popup-buttons">
          <button
            onClick={onClose}
            className="custom-code-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="custom-code-submit-btn"
            disabled={!htmlCode.trim() && !cssCode.trim() && !jsCode.trim()}
          >
            <FaCode />
            <span>Add to Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

//** HTML Upload Popup Component **//
const HtmlUploadPopup = ({ onClose, onSubmit }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's an HTML file
    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      alert('Please select an HTML file (.html or .htm)');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
      setPreviewHtml(content);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsProcessing(false);
      setUploadedFile(null);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!fileContent.trim()) {
      alert('Please select an HTML file first.');
      return;
    }
    onSubmit({ html: fileContent });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent('');
    setPreviewHtml('');
    setShowPreview(false);
  };

  return (
    <div className="html-upload-popup-content">
      <div className="html-upload-popup-header">
        <div className="popup-header-icon">
          <FaFileAlt />
        </div>
        <div className="popup-header-text">
          <h3>Upload External HTML File</h3>
          <p>Select an HTML file to add its content to the current page. The complete HTML, CSS, and JavaScript will be preserved.</p>
        </div>
      </div>

      <div className="html-upload-area">
        {!uploadedFile ? (
          <div className="file-drop-zone">
            <input
              type="file"
              id="html-file-input"
              accept=".html,.htm"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="html-file-input" className="file-drop-label">
              <div className="file-upload-icon">
                <FaFileAlt />
              </div>
              <div className="file-upload-text">
                <h4>Click to browse or drag and drop</h4>
                <p>Select an HTML file (.html or .htm)</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="file-selected-area">
            <div className="file-info">
              <div className="file-icon">
                <FaFileAlt />
              </div>
              <div className="file-details">
                <h4>{uploadedFile.name}</h4>
                <p>Size: {(uploadedFile.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                className="remove-file-btn"
                onClick={handleRemoveFile}
                title="Remove file"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="file-actions">
              <button
                className="preview-btn"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {showPreview && (
              <div className="html-preview-container">
                <div className="preview-header">
                  <h5>HTML Preview</h5>
                  <span className="preview-size">Content: {fileContent.length} characters</span>
                </div>
                <div className="html-preview-frame">
                  <iframe
                    srcDoc={fileContent}
                    className="preview-iframe"
                    title="HTML Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="processing-message">
          <div className="spinner"></div>
          <span>Processing HTML file...</span>
        </div>
      )}

      <div className="html-upload-popup-footer">
        <div className="popup-info-text">
          <span>💡 The uploaded HTML will be added to the bottom of the current page with all its styling and functionality intact.</span>
        </div>
        <div className="html-upload-popup-buttons">
          <button
            onClick={onClose}
            className="html-upload-cancel-btn"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="html-upload-submit-btn"
            disabled={!fileContent.trim() || isProcessing}
          >
            <FaFileAlt />
            <span>Add to Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

//** Main Editor Component **//
const PortfolioEdit = () => {
  const navigate = useNavigate();
  const { funnelId, stageId } = useParams();
  const { admin } = useAuth();
  
  // State management (replacing Redux)
  const [funnel, setFunnel] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [stages, setStages] = useState([]);
  const [apiStatus, setApiStatus] = useState('idle');
  const [funnelType, setFunnelType] = useState('standard');
  
  const user = admin;
  const coachId = admin?.id || '';
  const token = localStorage.getItem('adminToken') || '';
  
  // API base URL - detect from environment
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : window.location.origin;

  // Load funnel data on mount
  useEffect(() => {
    const loadFunnel = async () => {
      if (!funnelId || !token) return;
      
      try {
        setApiStatus('loading');
        const response = await fetch(`/api/admin/funnels/${funnelId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load funnel');
        
        const result = await response.json();
        if (result.success) {
          const funnelData = result.data;
          setFunnel(funnelData);
          setContentData({
            name: funnelData.name,
            targetAudience: funnelData.targetAudience || 'customer',
            stagesConfig: {},
            customStagesConfig: {},
            projectData: null
          });
          setStages(funnelData.stages || []);
          setFunnelType(funnelData.type || 'standard');
          setApiStatus('success');
        }
      } catch (err) {
        console.error('Error loading funnel:', err);
        setApiStatus('error');
      }
    };
    
    loadFunnel();
  }, [funnelId, token]);

  const [editorInstance, setEditorInstance] = useState(null);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [showRedirectPopup, setShowRedirectPopup] = useState(false);
  const [showDaySelectorPopup, setShowDaySelectorPopup] = useState(false);
  const [showCustomCodePopup, setShowCustomCodePopup] = useState(false);
  const [showHtmlUploadPopup, setShowHtmlUploadPopup] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const [forceRefreshKey, setForceRefreshKey] = useState(0);
  const [assets, setAssets] = useState([]);
  const [selectedRedirectPage, setSelectedRedirectPage] = useState('');
  const [availableForms, setAvailableForms] = useState([]);
  const [showPagesSidebar, setShowPagesSidebar] = useState(true);
  const [showBlocksPanel, setShowBlocksPanel] = useState(false);
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    const savedPreference = localStorage.getItem('portfolioEditorToolsPanelOpen');
    return savedPreference ? JSON.parse(savedPreference) : true;
  });
  const [toolsPanelSide, setToolsPanelSide] = useState(() => {
    if (typeof window === 'undefined') {
      return 'right';
    }
    return localStorage.getItem('portfolioEditorToolsPanelSide') || 'right';
  });
  const [showBuilderPanel, setShowBuilderPanel] = useState(false);
  const [activeBuilderCategory, setActiveBuilderCategory] = useState('sections');
  const [builderSearchTerm, setBuilderSearchTerm] = useState('');
  const [blockCategories, setBlockCategories] = useState([]);
  const [isBuilderDragging, setIsBuilderDragging] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(stageId);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const hasDirectForms = availableForms.some(
    (form) => form.type === 'direct-form' || form.type === 'direct-form-v2'
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Light mode only - dark mode disabled
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Ref to prevent multiple editor initializations
  const editorInitializedRef = React.useRef(false);
  const editorContainerRef = React.useRef(null);
  const projectDataRef = React.useRef(null);
  
  // Day Selector state management
  const [daySelectedComponents, setDaySelectedComponents] = useState(new Set());
  const [selectedDaySelectorId, setSelectedDaySelectorId] = useState(null);
  const [selectedComponentElement, setSelectedComponentElement] = useState(null);
  const [daySelectorInitialSelection, setDaySelectorInitialSelection] = useState([]);
  const [hasDaySelectors, setHasDaySelectors] = useState(false);
  
  // Frame width resize state
  const [frameWidth, setFrameWidth] = useState(null); // null means use default max-width
  const isResizingRef = React.useRef(false);
  const resizeStartXRef = React.useRef(0);
  const resizeStartWidthRef = React.useRef(0);

  const refreshBlockCategories = useCallback(() => {
    try {
      if (!editorInstance || !editorInstance.BlockManager || typeof editorInstance.BlockManager.getAll !== 'function') {
        setBlockCategories([]);
        return;
      }

      const blockManager = editorInstance.BlockManager;
      const allBlocksCollection = blockManager.getAll();
      if (!allBlocksCollection) {
        setBlockCategories([]);
        return;
      }

      let blocksList = [];
      if (Array.isArray(allBlocksCollection)) {
        blocksList = allBlocksCollection;
      } else if (typeof allBlocksCollection.toArray === 'function') {
        blocksList = allBlocksCollection.toArray();
      } else if (Array.isArray(allBlocksCollection.models)) {
        blocksList = allBlocksCollection.models;
      }

      const categoriesMap = {};

      blocksList.forEach(block => {
        if (!block || typeof block.get !== 'function') return;
        const rawCategory = block.get('category');
        let categoryLabel = 'Blocks';
        let categoryId = 'blocks';
        if (typeof rawCategory === 'string') {
          categoryLabel = rawCategory;
          categoryId = rawCategory.toLowerCase().replace(/\s+/g, '-');
        } else if (rawCategory && typeof rawCategory === 'object') {
          const label = typeof rawCategory.get === 'function' ? rawCategory.get('label') : rawCategory.label;
          const id = rawCategory.id || label;
          categoryLabel = label || id || 'Blocks';
          categoryId = (id || categoryLabel).toLowerCase().replace(/\s+/g, '-');
        }

        if (!categoriesMap[categoryId]) {
          categoriesMap[categoryId] = {
            id: categoryId,
            label: categoryLabel,
            blocks: []
          };
        }

        const blockId = (typeof block.getId === 'function' && block.getId()) || block.id || block.get('id') || `${categoryId}-${categoriesMap[categoryId].blocks.length}`;

        categoriesMap[categoryId].blocks.push({
          id: `grapes-${blockId}`,
          label: block.get('label') || 'Untitled Block',
          description: (block.get('attributes') && block.get('attributes').title) || block.get('categoryLabel') || '',
          actionType: 'grapesBlock',
          blockId
        });
      });

      setBlockCategories(Object.values(categoriesMap));
    } catch (error) {
      // Failed to load GrapesJS blocks
      setBlockCategories([]);
    }
  }, [editorInstance]);

  useEffect(() => {
    refreshBlockCategories();
    if (!editorInstance || !editorInstance.BlockManager) return undefined;
    const blockManager = editorInstance.BlockManager;

    const handler = () => refreshBlockCategories();
    if (typeof blockManager.on === 'function') {
      blockManager.on('add', handler);
      blockManager.on('remove', handler);
      return () => {
        blockManager.off('add', handler);
        blockManager.off('remove', handler);
      };
    }
    return undefined;
  }, [editorInstance, refreshBlockCategories]);

  const builderNavItems = useMemo(() => {
    if (!BUILDER_PANEL_ENABLED) return [];
    const staticItems = STATIC_BUILDER_GROUPS.map(item => ({
      id: item.id,
      label: item.label,
      type: 'static',
      count: BUILDER_ITEM_MAP[item.id]?.length || 0
    }));

    const dynamicItems = blockCategories.map(category => ({
      id: `blocks-${category.id}`,
      label: category.label || 'Blocks',
      type: 'grapes',
      count: category.blocks.length
    }));

    return [...staticItems, ...dynamicItems];
  }, [blockCategories]);

  useEffect(() => {
    if (!builderNavItems.length) return;
    if (!builderNavItems.some(item => item.id === activeBuilderCategory)) {
      setActiveBuilderCategory(builderNavItems[0].id);
    }
  }, [builderNavItems, activeBuilderCategory]);

  const builderItems = useMemo(() => {
    if (!BUILDER_PANEL_ENABLED) return [];
    const staticItems = BUILDER_ITEM_MAP[activeBuilderCategory];
    if (staticItems) {
      return staticItems;
    }

    if (activeBuilderCategory.startsWith('blocks-')) {
      const categoryId = activeBuilderCategory.replace('blocks-', '');
      const category = blockCategories.find(cat => cat.id === categoryId);
      return category ? category.blocks : [];
    }

    return [];
  }, [activeBuilderCategory, blockCategories]);

  const filteredBuilderItems = useMemo(() => {
    if (!BUILDER_PANEL_ENABLED) return [];
    const searchTerm = builderSearchTerm.trim().toLowerCase();
    if (!searchTerm) return builderItems;
    return builderItems.filter(item =>
      item.label.toLowerCase().includes(searchTerm) ||
      (item.description && item.description.toLowerCase().includes(searchTerm))
    );
  }, [builderItems, builderSearchTerm]);

  const toolsPanelVisibilityRef = React.useRef(isToolsPanelOpen);
  const toolsPanelSideRef = React.useRef(toolsPanelSide);
  const pagesSidebarVisibilityRef = React.useRef(showPagesSidebar);

  const applyToolsPanelPlacement = useCallback(() => {
    const rightPanels = document.querySelectorAll('.gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
    if (!rightPanels.length) return;

    const pagesSidebarElement = document.querySelector('.pages-sidebar');
    const editorAreaElement = document.querySelector('.editor-main-area');
    const editorRect = editorAreaElement ? editorAreaElement.getBoundingClientRect() : null;
    const containerElement = document.querySelector('.portfolio-edit-container');
    const containerStyles = containerElement ? window.getComputedStyle(containerElement) : null;
    const toolsPanelWidth = containerStyles ? parseInt(containerStyles.getPropertyValue('--tools-panel-width'), 10) || 280 : 280;
    
    // Get current pages sidebar width
    const currentNavSidebarWidth = pagesSidebarVisibilityRef.current && pagesSidebarElement
      ? pagesSidebarElement.getBoundingClientRect().width || 300
      : 0;

    rightPanels.forEach(panel => {
      panel.style.display = 'block';
      panel.style.visibility = 'visible';
      panel.style.opacity = '1';
      panel.style.position = 'fixed';
      panel.style.top = '68px';
      panel.style.height = 'calc(100vh - 68px)';
      panel.style.maxHeight = 'calc(100vh - 68px)';
      panel.style.zIndex = '1000';
      panel.style.marginTop = '0';
      panel.style.paddingTop = '0';
      panel.style.overflowY = 'auto';
      panel.style.overflowX = 'hidden';
      if (toolsPanelSideRef.current === 'left') {
        // Position tools panel directly after the left sidebar
        panel.style.left = `${currentNavSidebarWidth}px`;
        panel.style.right = 'auto';
        panel.style.borderRight = '1px solid #2d2d2d';
        panel.style.borderLeft = 'none';
        panel.style.transform = toolsPanelVisibilityRef.current ? 'translateX(0)' : `translateX(-${toolsPanelWidth + 40}px)`;
      } else {
        panel.style.left = 'auto';
        panel.style.right = '0';
        panel.style.borderLeft = '1px solid #2d2d2d';
        panel.style.borderRight = 'none';
        panel.style.transform = toolsPanelVisibilityRef.current ? 'translateX(0)' : `translateX(${toolsPanelWidth + 40}px)`;
      }
      panel.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      panel.style.width = `${toolsPanelWidth}px`;
      panel.style.maxWidth = `${toolsPanelWidth}px`;
      panel.style.minWidth = `${toolsPanelWidth}px`;
      panel.style.pointerEvents = toolsPanelVisibilityRef.current ? 'auto' : 'none';
      panel.style.opacity = toolsPanelVisibilityRef.current ? '1' : '0';
    });
  }, []);

  useEffect(() => {
    toolsPanelVisibilityRef.current = isToolsPanelOpen;
    localStorage.setItem('portfolioEditorToolsPanelOpen', JSON.stringify(isToolsPanelOpen));
    const timer = setTimeout(() => applyToolsPanelPlacement(), 50);
    return () => clearTimeout(timer);
  }, [isToolsPanelOpen, applyToolsPanelPlacement]);

  useEffect(() => {
    toolsPanelSideRef.current = toolsPanelSide;
    localStorage.setItem('portfolioEditorToolsPanelSide', toolsPanelSide);
    const timer = setTimeout(() => applyToolsPanelPlacement(), 50);
    return () => clearTimeout(timer);
  }, [toolsPanelSide, applyToolsPanelPlacement]);

  useEffect(() => {
    pagesSidebarVisibilityRef.current = showPagesSidebar;
    applyToolsPanelPlacement();
    if (!showPagesSidebar) {
      setShowBuilderPanel(false);
    }
  }, [showPagesSidebar, applyToolsPanelPlacement]);

  // Handle Layers panel toggle - properly move layers to left sidebar
  useEffect(() => {
    if (!editorInstance) return;

    let movedLayersElement = null;
    let movedLayersView = null;

    const findLayersContent = (container) => {
      if (!container) return { layersView: null, layersContent: null };
      
      // First, try to find the layers view by data attribute
      let layersView = container.querySelector('.gjs-pn-view[data-pn-type="layers"]');
      
      // If not found, try active view
      if (!layersView) {
        const activeView = container.querySelector('.gjs-pn-view.gjs-pn-active');
        // Check if active view has layers content
        if (activeView) {
          const hasLayers = activeView.querySelector('.gjs-layer, .gjs-layer-item, .gjs-layer-wrapper');
          if (hasLayers) {
            layersView = activeView;
          }
        }
      }
      
      // If still not found, search all views for layers
      if (!layersView) {
        const allViews = container.querySelectorAll('.gjs-pn-view');
        for (let view of allViews) {
          const hasLayers = view.querySelector('.gjs-layer, .gjs-layer-item, .gjs-layer-wrapper, .gjs-layers');
          if (hasLayers) {
            layersView = view;
            break;
          }
        }
      }
      
      if (layersView) {
        // Find the actual content container - prioritize the one with actual layer items
        let layersContent = null;
        
        // First, try to find wrapper that contains actual layer items
        const wrappers = layersView.querySelectorAll('.gjs-layer-wrapper, .gjs-layers, .gjs-pn-view-content');
        for (let wrapper of wrappers) {
          const hasItems = wrapper.querySelector('.gjs-layer, .gjs-layer-item');
          if (hasItems) {
            layersContent = wrapper;
            break;
          }
        }
        
        // If no wrapper with items found, use first wrapper
        if (!layersContent && wrappers.length > 0) {
          layersContent = wrappers[0];
        }
        
        // If still no content, check if view itself has layer items
        if (!layersContent) {
          const hasLayerItems = layersView.querySelector('.gjs-layer, .gjs-layer-item');
          if (hasLayerItems) {
            // Use the view but try to get its content div
            const contentDiv = layersView.querySelector('div') || layersView;
            layersContent = contentDiv;
          }
        }
        
        // Last resort: use the entire view
        if (!layersContent) {
          layersContent = layersView;
        }
        
        return { layersView, layersContent };
      }
      
      return { layersView: null, layersContent: null };
    };

    const handleLayersPanelToggle = () => {
      const rightSidebarPanel = document.querySelector('.gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
      const leftSidebarContainer = document.getElementById('left-sidebar-blocks-container');
      
      if (!rightSidebarPanel || !leftSidebarContainer) {
        // Retry if elements not found
        const retryTimer = setTimeout(() => handleLayersPanelToggle(), 100);
        return () => clearTimeout(retryTimer);
      }

      if (showBlocksPanel) {
        // Activate layers view by clicking the layers button
        const layersBtn = document.querySelector('.gjs-pn-btn[data-pn-type="layers"]');
        if (layersBtn) {
          if (!layersBtn.classList.contains('gjs-pn-active')) {
            layersBtn.click();
          }
        }
        
        // Wait for layers to render, then find and move - with multiple retries
        const tryMoveLayers = (attempt = 1, maxAttempts = 8) => {
          const { layersView, layersContent } = findLayersContent(rightSidebarPanel);
          
          if (layersContent && layersContent.parentNode) {
            if (layersContent && leftSidebarContainer) {
              // Verify that layersContent actually has layer items
              const hasLayerItems = layersContent.querySelector('.gjs-layer, .gjs-layer-item, [data-layer-item]');
              
              // Also check if the layersView itself has items (in case content is the view)
              const viewHasItems = layersView ? layersView.querySelector('.gjs-layer, .gjs-layer-item, [data-layer-item]') : null;
              
              if ((hasLayerItems || viewHasItems) && layersContent.parentNode !== leftSidebarContainer) {
                // Clear left sidebar
                leftSidebarContainer.innerHTML = '';
                
                // Move the entire layers content
                leftSidebarContainer.appendChild(layersContent);
                movedLayersElement = layersContent;
                movedLayersView = layersView;
                
                // Force display styles on both container and content
                leftSidebarContainer.style.display = 'flex';
                leftSidebarContainer.style.flexDirection = 'column';
                leftSidebarContainer.style.overflow = 'auto';
                
                layersContent.style.display = 'block';
                layersContent.style.visibility = 'visible';
                layersContent.style.opacity = '1';
                layersContent.style.width = '100%';
                layersContent.style.height = '100%';
                
                // Ensure all child layers are visible
                const allLayers = layersContent.querySelectorAll('.gjs-layer, .gjs-layer-item');
                allLayers.forEach(layer => {
                  layer.style.display = 'flex';
                  layer.style.visibility = 'visible';
                  layer.style.opacity = '1';
                });
                
                // Keep right sidebar visible (light mode requirement)
                rightSidebarPanel.style.display = 'block';
                rightSidebarPanel.style.visibility = 'visible';
                rightSidebarPanel.style.opacity = '1';
                
                // Layers panel moved successfully
              } else if (!hasLayerItems && !viewHasItems && attempt < maxAttempts) {
                // Layers content found but no items, retrying...
                setTimeout(() => tryMoveLayers(attempt + 1, maxAttempts), 200);
              } else if (layersContent.parentNode === leftSidebarContainer) {
                // Layers panel already in left sidebar
              }
            } else if (attempt < maxAttempts) {
              // Layers content not found, retrying...
              setTimeout(() => tryMoveLayers(attempt + 1, maxAttempts), 200);
            } else {
              // Failed to find layers content after multiple attempts
              // Show right sidebar if we failed
              rightSidebarPanel.style.display = 'block';
              rightSidebarPanel.style.visibility = 'visible';
              rightSidebarPanel.style.opacity = '1';
            }
          } else if (attempt < maxAttempts) {
            // Layers content not found, retrying...
            setTimeout(() => tryMoveLayers(attempt + 1, maxAttempts), 200);
          } else {
            // Failed to find layers content after multiple attempts
            // Show right sidebar if we failed
            rightSidebarPanel.style.display = 'block';
            rightSidebarPanel.style.visibility = 'visible';
            rightSidebarPanel.style.opacity = '1';
          }
        };
        
        // Start trying after initial delay - give more time for layers to render
        setTimeout(() => tryMoveLayers(), 100);
      } else {
        // Restore: move layers content back to right sidebar
        const rightSidebarPanelRestore = document.querySelector('.gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
        
        if (leftSidebarContainer && movedLayersElement && leftSidebarContainer.contains(movedLayersElement) && rightSidebarPanelRestore) {
          // Try to restore to the original location
          if (movedLayersView && movedLayersView.parentNode === rightSidebarPanelRestore) {
            movedLayersView.appendChild(movedLayersElement);
          } else {
            // Find or create layers view
            const { layersView: restoreView } = findLayersContent(rightSidebarPanelRestore);
            if (restoreView) {
              restoreView.appendChild(movedLayersElement);
            } else {
              rightSidebarPanelRestore.appendChild(movedLayersElement);
            }
          }
          
          movedLayersElement = null;
          movedLayersView = null;
          leftSidebarContainer.innerHTML = '';
        }
        
        // Show right sidebar
        if (rightSidebarPanelRestore) {
          rightSidebarPanelRestore.style.display = 'block';
          rightSidebarPanelRestore.style.visibility = 'visible';
          rightSidebarPanelRestore.style.opacity = '1';
        }
      }
    };

    const timer = setTimeout(() => {
      handleLayersPanelToggle();
    }, 200);

    // Watch for DOM changes to catch when layers are rendered
    const observer = new MutationObserver(() => {
      if (showBlocksPanel && !movedLayersElement) {
        const rightSidebarPanel = document.querySelector('.gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
        const leftSidebarContainer = document.getElementById('left-sidebar-blocks-container');
        
        if (rightSidebarPanel && leftSidebarContainer) {
          const { layersView, layersContent } = findLayersContent(rightSidebarPanel);
          const hasLayerItems = layersContent ? layersContent.querySelector('.gjs-layer, .gjs-layer-item, [data-layer-item]') : null;
          
          // If layers are found and not yet moved, move them
          if (layersContent && hasLayerItems && layersContent.parentNode !== leftSidebarContainer) {
            leftSidebarContainer.innerHTML = '';
            leftSidebarContainer.appendChild(layersContent);
            movedLayersElement = layersContent;
            movedLayersView = layersView;
            
            // Apply styles
            leftSidebarContainer.style.display = 'flex';
            layersContent.style.display = 'block';
            layersContent.style.visibility = 'visible';
            layersContent.style.opacity = '1';
            
            // Keep right sidebar visible (light mode requirement)
            rightSidebarPanel.style.display = 'block';
            rightSidebarPanel.style.visibility = 'visible';
            rightSidebarPanel.style.opacity = '1';
            
            console.log('✅ Layers panel moved via observer');
          }
        }
      }
    });

    const rightSidebarPanel = document.querySelector('.gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
    if (rightSidebarPanel) {
      observer.observe(rightSidebarPanel, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [showBlocksPanel, editorInstance]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('resize', applyToolsPanelPlacement);
    return () => window.removeEventListener('resize', applyToolsPanelPlacement);
  }, [applyToolsPanelPlacement]);

  // Dark mode toggle handler - DISABLED (light mode only)
  const toggleDarkMode = () => {
    // Dark mode disabled - always keep light mode
    setIsDarkMode(false);
    localStorage.setItem('portfolioEditorDarkMode', JSON.stringify(false));
    document.body.classList.remove('dark-mode-active');
  };

  const toggleToolsPanel = () => {
    setIsToolsPanelOpen(prev => !prev);
  };

  const toggleToolsPanelSide = () => {
    setIsToolsPanelOpen(true);
    setToolsPanelSide(prev => (prev === 'left' ? 'right' : 'left'));
  };

  const insertHtmlIntoEditor = useCallback((html) => {
    if (!editorInstance) {
      alert('Editor is still loading. Please wait a moment and try again.');
      return null;
    }

    try {
      const inserted = editorInstance.addComponents(html);
      const component = Array.isArray(inserted) ? inserted[inserted.length - 1] : inserted;
      if (component) {
        editorInstance.select(component);
        editorInstance.trigger('change:canvas');
      }
      return component;
    } catch (error) {
      console.error('Failed to insert builder content:', error);
      alert('Unable to add this block. Please try again.');
      return null;
    }
  }, [editorInstance]);

  const insertSectionLayout = useCallback((config) => {
    const { maxWidth, columns, background, textColor } = config;
    const safeColumns = Math.max(1, columns || 1);
    const componentsHtml = Array.from({ length: safeColumns }).map((_, index) => `
      <div style="background:rgba(255,255,255,0.92);border-radius:18px;padding:32px;border:1px solid rgba(148,163,184,0.2);min-height:180px;">
        <h3 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Column ${index + 1}</h3>
        <p style="margin:0;color:#475569;font-size:14px;">Add your content here.</p>
      </div>
    `).join('');

    const html = `
      <section style="width:100%;padding:80px 24px;background:${background};color:${textColor};">
        <div style="max-width:${maxWidth};margin:0 auto;display:flex;flex-direction:column;gap:32px;">
          <div style="text-align:center;">
            <p style="margin:0 0 12px;letter-spacing:4px;text-transform:uppercase;font-size:12px;opacity:0.7;">Section Label</p>
            <h2 style="margin:0;font-size:36px;">Add a powerful headline</h2>
            <p style="margin:12px auto 0;max-width:640px;color:rgba(255,255,255,0.8);font-size:16px;">Describe the value of this section to your visitors.</p>
          </div>
          <div style="display:grid;gap:24px;grid-template-columns:repeat(${safeColumns}, minmax(0,1fr));">
            ${componentsHtml}
          </div>
        </div>
      </section>
    `;

    insertHtmlIntoEditor(html);
  }, [insertHtmlIntoEditor]);

  const insertColumnLayout = useCallback((config) => {
    const columns = Math.max(1, config.columns || 1);
    const template = config.template || `repeat(${columns}, minmax(0, 1fr))`;
    const cells = Array.from({ length: columns }).map(() => `
      <div style="border-radius:14px;border:1px dashed #cbd5f5;background:#f8fafc;min-height:160px;"></div>
    `).join('');

    const html = `
      <section style="width:100%;padding:50px 20px;">
        <div style="max-width:1200px;margin:0 auto;">
          <div style="display:grid;gap:20px;grid-template-columns:${template};">
            ${cells}
          </div>
        </div>
      </section>
    `;

    insertHtmlIntoEditor(html);
  }, [insertHtmlIntoEditor]);

  const insertElementBlock = useCallback((config) => {
    let html = '';
    switch (config.type) {
      case 'heading':
        html = `
          <section style="width:100%;padding:40px 20px;text-align:center;">
            <div style="max-width:960px;margin:0 auto;">
              <p style="text-transform:uppercase;letter-spacing:4px;margin:0 0 12px;color:#6366f1;">Label</p>
              <h2 style="margin:0;font-size:42px;color:#0f172a;">Write a magnetic headline</h2>
              <p style="margin:16px 0 0;color:#475569;font-size:18px;">Add a concise supporting sentence that explains the value.</p>
            </div>
          </section>
        `;
        break;
      case 'paragraph':
        html = `
          <section style="width:100%;padding:20px;">
            <div style="max-width:760px;margin:0 auto;color:#475569;font-size:18px;line-height:1.7;">
              <p>Use this paragraph block to tell a short story or describe a feature in more detail.</p>
            </div>
          </section>
        `;
        break;
      case 'button':
        html = `
          <div style="display:flex;justify-content:center;">
            <a href="#" style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:999px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-weight:700;text-decoration:none;">Call To Action</a>
          </div>
        `;
        break;
      case 'image':
        html = `
          <div style="width:100%;padding:20px 0;display:flex;justify-content:center;">
            <div style="width:100%;max-width:720px;height:320px;background:linear-gradient(135deg,#e2e8f0,#cbd5f5);border-radius:24px;border:2px dashed #94a3b8;display:flex;align-items:center;justify-content:center;color:#475569;font-weight:600;">Image Placeholder</div>
          </div>
        `;
        break;
      case 'video':
        html = `
          <div style="width:100%;padding:20px 0;display:flex;justify-content:center;">
            <div style="width:100%;max-width:860px;aspect-ratio:16/9;background:#0f172a;border-radius:20px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;">▶</div>
          </div>
        `;
        break;
      default:
        break;
    }

    if (html) {
      insertHtmlIntoEditor(html);
    }
  }, [insertHtmlIntoEditor]);

  const insertPrebuiltSection = useCallback((config) => {
    let html = '';
    if (config.template === 'hero') {
      html = `
        <section style="padding:100px 20px;background:linear-gradient(135deg,#0f172a,#111936);color:#fff;">
          <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px;align-items:center;">
            <div>
              <p style="text-transform:uppercase;letter-spacing:4px;margin:0 0 12px;color:#60a5fa;">Featured</p>
              <h1 style="margin:0 0 16px;font-size:48px;">Launch faster with our funnel builder</h1>
              <p style="margin:0 0 30px;color:rgba(255,255,255,0.8);font-size:18px;">Craft landing pages, sections and components visually without touching code.</p>
              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <a href="#" style="padding:14px 28px;border-radius:999px;background:#3b82f6;color:#fff;font-weight:700;text-decoration:none;">Get Started</a>
                <a href="#" style="padding:14px 28px;border-radius:999px;border:1px solid rgba(255,255,255,0.3);color:#fff;font-weight:700;text-decoration:none;background:transparent;">Watch Demo</a>
              </div>
            </div>
            <div style="border-radius:24px;background:rgba(15,23,42,0.6);padding:24px;border:1px solid rgba(255,255,255,0.15);">
              <div style="height:220px;background:linear-gradient(135deg,#38bdf8,#6366f1);border-radius:18px;"></div>
              <p style="margin:16px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Mockup area for product shot or illustration.</p>
            </div>
          </div>
        </section>
      `;
    } else if (config.template === 'features') {
      html = `
        <section style="padding:80px 20px;background:#ffffff;">
          <div style="max-width:1100px;margin:0 auto;text-align:center;">
            <h2 style="margin-bottom:12px;font-size:36px;color:#0f172a;">Highlight your best features</h2>
            <p style="margin:0 auto 40px;max-width:640px;color:#475569;">Quickly describe the benefits or steps in your process.</p>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;">
              ${[1,2,3].map(idx => `
                <div style="padding:28px;border-radius:20px;border:1px solid #e2e8f0;background:#f8fafc;">
                  <div style="width:48px;height:48px;border-radius:12px;background:#e0f2fe;margin:0 auto 16px;"></div>
                  <h3 style="margin:0 0 10px;">Feature ${idx}</h3>
                  <p style="margin:0;color:#475569;font-size:15px;">Explain how this benefit helps your visitor succeed.</p>
                </div>`).join('')}
            </div>
          </div>
        </section>
      `;
    } else if (config.template === 'testimonial') {
      html = `
        <section style="padding:80px 20px;background:#f8fafc;">
          <div style="max-width:840px;margin:0 auto;background:#ffffff;border-radius:30px;padding:40px;border:1px solid #e2e8f0;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
            <div style="display:flex;gap:18px;align-items:center;margin-bottom:24px;">
              <div style="width:56px;height:56px;border-radius:50%;background:#c7d2fe;"></div>
              <div>
                <strong style="display:block;color:#0f172a;">Alex Customer</strong>
                <span style="color:#64748b;font-size:14px;">CEO, Growth Labs</span>
              </div>
            </div>
            <p style="margin:0;color:#0f172a;font-size:20px;line-height:1.6;">“This builder helped us launch new pages in hours instead of weeks. The predefined sections saved so much time.”</p>
          </div>
        </section>
      `;
    } else if (config.template === 'pricing') {
      html = `
        <section style="padding:90px 20px;background:#0f172a;color:#fff;">
          <div style="max-width:1100px;margin:0 auto;text-align:center;">
            <h2 style="margin:0 0 12px;font-size:38px;">Choose your plan</h2>
            <p style="margin:0 auto 40px;max-width:640px;color:rgba(255,255,255,0.75);">Flexible options for every business stage.</p>
            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;">
              ${['Starter','Growth','Scale'].map((tier, idx) => `
                <div style="border-radius:24px;padding:32px;background:${idx === 1 ? '#1d4ed8' : 'rgba(255,255,255,0.08)'};border:${idx === 1 ? '3px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.12)'};">
                  <h3 style="margin:0 0 6px;">${tier}</h3>
                  <p style="margin:0 0 20px;color:rgba(255,255,255,0.75);">Perfect for ${tier === 'Starter' ? 'new projects' : tier === 'Growth' ? 'scaling teams' : 'large launches'}.</p>
                  <div style="font-size:42px;font-weight:700;margin-bottom:24px;">${idx === 0 ? '$49' : idx === 1 ? '$149' : '$299'}</div>
                  <ul style="list-style:none;padding:0;margin:0 0 24px;text-align:left;color:rgba(255,255,255,0.85);line-height:1.6;">
                    <li>✔ Unlimited pages</li>
                    <li>✔ Premium components</li>
                    <li>✔ Priority support</li>
                  </ul>
                  <a href="#" style="display:block;padding:14px;border-radius:999px;background:#fff;color:#0f172a;font-weight:700;text-decoration:none;">Select Plan</a>
                </div>`).join('')}
            </div>
          </div>
        </section>
      `;
    } else if (config.template === 'cta') {
      html = `
        <section style="padding:50px 24px;">
          <div style="max-width:960px;margin:0 auto;padding:34px;border-radius:24px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;display:flex;flex-direction:column;gap:18px;text-align:center;">
            <p style="margin:0;text-transform:uppercase;letter-spacing:4px;font-size:12px;opacity:0.8;">Ready to launch?</p>
            <h2 style="margin:0;font-size:32px;">Ship beautiful funnels in minutes, not days.</h2>
            <p style="margin:0;color:rgba(255,255,255,0.8);">Kickstart your launch with battle-tested sections and smart automation.</p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <a href="#" style="padding:14px 28px;border-radius:999px;background:#fff;color:#2563eb;font-weight:700;text-decoration:none;">Book a Demo</a>
              <a href="#" style="padding:14px 28px;border-radius:999px;border:1px solid rgba(255,255,255,0.4);color:#fff;font-weight:700;text-decoration:none;">Chat with us</a>
            </div>
          </div>
        </section>
      `;
    } else if (config.template === 'cta-split') {
      html = `
        <section style="padding:80px 20px;background:#ffffff;">
          <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:34px;align-items:center;">
            <div>
              <p style="margin:0 0 10px;color:#10b981;font-weight:600;">Growth Toolkit</p>
              <h2 style="margin:0 0 14px;font-size:38px;color:#0f172a;">Everything you need to launch and scale.</h2>
              <ul style="margin:0 0 20px;padding:0;list-style:none;color:#475569;line-height:1.8;">
                <li>✔ Drag & drop sections</li>
                <li>✔ 1-click funnel templates</li>
                <li>✔ Automation-ready forms</li>
              </ul>
              <a href="#" style="display:inline-flex;align-items:center;padding:14px 28px;border-radius:999px;background:#0f172a;color:#fff;font-weight:700;text-decoration:none;">Start free trial</a>
            </div>
            <div style="border-radius:26px;padding:26px;background:#f8fafc;border:1px solid #e2e8f0;">
              <p style="margin:0 0 10px;font-weight:600;color:#0f172a;">What’s inside?</p>
              <ol style="margin:0;padding-left:20px;color:#475569;line-height:1.8;">
                <li>30+ designer sections</li>
                <li>AI-powered copy prompts</li>
                <li>One-click publishing</li>
              </ol>
            </div>
          </div>
        </section>
      `;
    } else if (config.template === 'form-simple') {
      html = `
        <section style="padding:70px 20px;background:#f8fafc;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:30px;padding:36px;border:1px solid #e2e8f0;box-shadow:0 30px 60px rgba(15,23,42,0.08);">
            <h3 style="margin:0 0 8px;color:#0f172a;">Request a Consultation</h3>
            <p style="margin:0 0 24px;color:#475569;">Tell us about your project and we'll get in touch.</p>
            <form style="display:flex;flex-direction:column;gap:16px;">
              <input placeholder="Full Name" style="padding:14px;border-radius:14px;border:1px solid #cbd5f5;" />
              <input placeholder="Email Address" style="padding:14px;border-radius:14px;border:1px solid #cbd5f5;" />
              <input placeholder="Phone Number" style="padding:14px;border-radius:14px;border:1px solid #cbd5f5;" />
              <textarea placeholder="Tell us about your goals" rows="4" style="padding:14px;border-radius:14px;border:1px solid #cbd5f5;resize:none;"></textarea>
              <button type="button" style="padding:14px;border:none;border-radius:14px;background:#2563eb;color:#fff;font-weight:700;">Submit Request</button>
            </form>
          </div>
        </section>
      `;
    } else if (config.template === 'form-dual') {
      html = `
        <section style="padding:80px 20px;background:#ffffff;">
          <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;align-items:center;">
            <div>
              <p style="margin:0 0 10px;color:#6366f1;font-weight:600;">Free Strategy Session</p>
              <h2 style="margin:0 0 14px;font-size:36px;color:#0f172a;">Book your funnel roadmap call</h2>
              <p style="margin:0;color:#475569;">We’ll audit your current funnel, map the opportunity and share the launch plan.</p>
            </div>
            <form style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">
              <input placeholder="First Name" style="padding:14px;border-radius:14px;border:1px solid #e2e8f0;" />
              <input placeholder="Last Name" style="padding:14px;border-radius:14px;border:1px solid #e2e8f0;" />
              <input placeholder="Email" style="padding:14px;border-radius:14px;border:1px solid #e2e8f0;" />
              <input placeholder="Website" style="padding:14px;border-radius:14px;border:1px solid #e2e8f0;" />
              <textarea placeholder="What do you want to build?" rows="3" style="grid-column:span 2;padding:14px;border-radius:14px;border:1px solid #e2e8f0;"></textarea>
              <button type="button" style="grid-column:span 2;padding:14px;border:none;border-radius:14px;background:#0f172a;color:#fff;font-weight:700;">Schedule Call</button>
            </form>
          </div>
        </section>
      `;
    } else if (config.template === 'stats') {
      html = `
        <section style="padding:70px 20px;background:#0f172a;color:#fff;">
          <div style="max-width:1100px;margin:0 auto;">
            <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;">
              ${['3.2x', '245+', '92%', '12k'].map((stat, idx) => `
                <div style="padding:28px;border-radius:20px;background:rgba(255,255,255,0.05);text-align:center;">
                  <div style="font-size:40px;font-weight:700;margin-bottom:4px;">${stat}</div>
                  <p style="margin:0;color:rgba(255,255,255,0.75);">${['Avg. ROI', 'Funnels Shipped', 'Client Retention', 'Subscribers'][idx]}</p>
                </div>`).join('')}
            </div>
          </div>
        </section>
      `;
    } else if (config.template === 'faq') {
      html = `
        <section style="padding:80px 20px;background:#ffffff;">
          <div style="max-width:900px;margin:0 auto;">
            <h2 style="margin:0 0 24px;font-size:34px;color:#0f172a;">Frequently asked questions</h2>
            ${[1,2,3,4].map(idx => `
              <details style="border-radius:16px;border:1px solid #e2e8f0;margin-bottom:14px;padding:18px;background:#f8fafc;">
                <summary style="cursor:pointer;font-weight:600;color:#0f172a;">Question ${idx} headline goes here?</summary>
                <p style="margin:12px 0 0;color:#475569;">Add your helpful answer. Keep it short, honest, and useful.</p>
              </details>`).join('')}
          </div>
        </section>
      `;
    } else if (config.template === 'timeline') {
      html = `
        <section style="padding:80px 20px;background:#f8fafc;">
          <div style="max-width:960px;margin:0 auto;">
            <h2 style="margin:0 0 32px;font-size:34px;color:#0f172a;text-align:center;">Launch roadmap</h2>
            <div style="display:grid;gap:20px;">
              ${['Research','Wireframe','Build','Launch'].map((phase, idx) => `
                <div style="display:flex;gap:18px;align-items:flex-start;">
                  <div style="width:14px;height:14px;border-radius:50%;background:#2563eb;margin-top:6px;"></div>
                  <div>
                    <p style="margin:0;font-weight:600;color:#0f172a;">Phase ${idx + 1}: ${phase}</p>
                    <p style="margin:4px 0 0;color:#475569;">Describe what happens during this step.</p>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </section>
      `;
    }

    if (html) {
      insertHtmlIntoEditor(html);
    }
  }, [insertHtmlIntoEditor]);

  const insertGlobalSection = useCallback((config) => {
    const html = `
      <section data-global-section="${config.title}" style="padding:30px 20px;border:1px dashed #94a3b8;border-radius:16px;background:#fffbe6;">
        <strong style="display:block;margin-bottom:8px;color:#92400e;">${config.title}</strong>
        <p style="margin:0;color:#7c2d12;">${config.body}</p>
      </section>
    `;
    insertHtmlIntoEditor(html);
  }, [insertHtmlIntoEditor]);

  const insertCustomValueToken = useCallback((config) => {
    const html = `
      <span style="padding:6px 12px;border-radius:999px;background:#e0f2fe;color:#0f172a;font-weight:600;">${config.token}</span>
    `;
    insertHtmlIntoEditor(html);
  }, [insertHtmlIntoEditor]);

  const insertGrapesBlock = useCallback((blockId) => {
    if (!editorInstance || !editorInstance.BlockManager || typeof editorInstance.BlockManager.get !== 'function') {
      alert('Editor is still loading blocks. Please wait a moment.');
      return;
    }

    const block = editorInstance.BlockManager.get(blockId);
    if (!block) {
      alert('Could not find this block. Please reload and try again.');
      return;
    }

    const content = block.get('content');
    if (!content) {
      alert('This block has no content to insert.');
      return;
    }

    const insertedComponents = editorInstance.addComponents(content);
    if (Array.isArray(insertedComponents) && insertedComponents.length) {
      const lastComponent = insertedComponents[insertedComponents.length - 1];
      if (lastComponent) {
        editorInstance.select(lastComponent);
      }
    }

    editorInstance.trigger('change:canvas');
  }, [editorInstance]);

  const handleBuilderItemClick = useCallback((item) => {
    switch (item.actionType) {
      case 'section':
        insertSectionLayout(item.payload);
        break;
      case 'columns':
        insertColumnLayout(item.payload);
        break;
      case 'element':
        insertElementBlock(item.payload);
        break;
      case 'prebuilt':
        insertPrebuiltSection(item.payload);
        break;
      case 'global':
        insertGlobalSection(item.payload);
        break;
      case 'customValue':
        insertCustomValueToken(item.payload);
        break;
      case 'grapesBlock':
        insertGrapesBlock(item.blockId);
        break;
      default:
        console.warn('Unknown builder action:', item);
    }
  }, [insertSectionLayout, insertColumnLayout, insertElementBlock, insertPrebuiltSection, insertGlobalSection, insertCustomValueToken, insertGrapesBlock]);

  const builderDragPayloadRef = React.useRef(null);

  const handleBuilderDragStart = useCallback((item, event) => {
    if (!BUILDER_PANEL_ENABLED) return;
    builderDragPayloadRef.current = item;
    setIsBuilderDragging(true);
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      const payload = item.actionType === 'grapesBlock'
        ? JSON.stringify({ type: 'grapesBlock', id: item.blockId })
        : JSON.stringify({ type: 'builder', item });
      event.dataTransfer.setData('application/json', payload);
      event.dataTransfer.setData('text/plain', item.id);
    }
  }, []);

  const handleBuilderDragEnd = useCallback(() => {
    if (!BUILDER_PANEL_ENABLED) return;
    builderDragPayloadRef.current = null;
    setIsBuilderDragging(false);
  }, []);

  useEffect(() => {
    if (!BUILDER_PANEL_ENABLED) return undefined;
    const editorArea = document.querySelector('.editor-main-area');
    if (!editorArea) return undefined;

    const handleDragOver = (event) => {
      if (!builderDragPayloadRef.current) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (event) => {
      if (!builderDragPayloadRef.current) return;
      event.preventDefault();
      const payload = event.dataTransfer.getData('application/json');
      if (payload) {
        try {
          const parsed = JSON.parse(payload);
          if (parsed.type === 'grapesBlock') {
            insertGrapesBlock(parsed.id);
          } else if (parsed.type === 'builder') {
            handleBuilderItemClick(parsed.item);
          }
        } catch (err) {
          console.warn('Failed to parse drag payload, falling back:', err);
          handleBuilderItemClick(builderDragPayloadRef.current);
        }
      } else {
        handleBuilderItemClick(builderDragPayloadRef.current);
      }
      builderDragPayloadRef.current = null;
      setIsBuilderDragging(false);
    };

    editorArea.addEventListener('dragover', handleDragOver);
    editorArea.addEventListener('drop', handleDrop);

    return () => {
      editorArea.removeEventListener('dragover', handleDragOver);
      editorArea.removeEventListener('drop', handleDrop);
    };
  }, [handleBuilderItemClick, insertGrapesBlock, showBuilderPanel]);

  const renderBuilderPreview = (item) => {
    if (item.actionType === 'section' || item.actionType === 'columns') {
      const columns = item.payload.template
        ? item.payload.template.split(' ').length
        : Math.max(1, item.payload.columns || 1);
      return (
        <div
          className="preview-grid"
          style={{ gridTemplateColumns: item.payload.template || `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, idx) => (
            <div key={`${item.id}-col-${idx}`} className="preview-cell" />
          ))}
        </div>
      );
    }

    if (item.actionType === 'element') {
      if (item.payload.type === 'button') {
        return <div className="preview-button">Button</div>;
      }
      if (item.payload.type === 'image') {
        return <div className="preview-media image" />;
      }
      if (item.payload.type === 'video') {
        return <div className="preview-media video">▶</div>;
      }
      return (
        <div className="preview-text">
          <span />
          <span />
          <span />
        </div>
      );
    }

    if (item.actionType === 'prebuilt') {
      return (
        <div className="preview-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="preview-cell" />
          <div className="preview-cell" />
          <div className="preview-cell" />
        </div>
      );
    }

    if (item.actionType === 'global') {
      return (
        <div className="preview-banner">
          <span />
          <span />
        </div>
      );
    }

    if (item.actionType === 'customValue') {
      return (
        <div className="preview-token">
          {item.payload.token}
        </div>
      );
    }

    return <div className="preview-cell" />;
  };

  // Initialize light mode on mount (dark mode disabled)
  useEffect(() => {
    // Always keep light mode - remove dark mode class
    document.body.classList.remove('dark-mode-active');
    localStorage.setItem('portfolioEditorDarkMode', JSON.stringify(false));
    setIsDarkMode(false);
    return () => {
      document.body.classList.remove('dark-mode-active');
    };
  }, []);

  // Function to detect forms on the current page
  const detectFormsOnPage = useCallback(() => {
    const editor = window.editor || editorInstance;
    if (!editor || !editor.DomComponents) {
      return;
    }

    const forms = [];
    const wrapper = editor.DomComponents.getWrapper();
    
    if (!wrapper) {
      return;
    }

    // Detect Direct Form
    const directForms = wrapper.find('.bss-direct-form-container');
    directForms.forEach((form, index) => {
      forms.push({
        type: 'direct-form',
        selector: '.bss-direct-form-container',
        label: `Direct Form ${index + 1}`,
        index
      });
    });

    // Detect Direct Form V2
    const directFormsV2 = wrapper.find('.bss-direct-form-v2-container');
    directFormsV2.forEach((form, index) => {
      forms.push({
        type: 'direct-form-v2',
        selector: '.bss-direct-form-v2-container',
        label: `Direct Form V2 ${index + 1}`,
        index
      });
    });

    // Detect PDF Download Forms
    const pdfForms = wrapper.find('.pdf-form-container');
    pdfForms.forEach((form, index) => {
      forms.push({
        type: 'pdf-download',
        selector: '.pdf-form-container',
        label: `PDF Form ${index + 1}`,
        index
      });
    });

    // Detect Appointment Forms
    const appointmentForms = wrapper.find('.appointment-booking, .quick-appointment');
    appointmentForms.forEach((form, index) => {
      const formType = form.getEl()?.classList.contains('appointment-booking') ? 'Professional Appointment' : 'Quick Appointment';
      forms.push({
        type: 'appointment-form',
        selector: '.appointment-booking, .quick-appointment',
        label: `${formType} ${index + 1}`,
        index
      });
    });

    setAvailableForms(forms);

    const daySelectorTargets = [
      '.day-selector-display-widget',
      '.day-selector-widget-element',
      '[data-component-id*="day-selector"]'
    ];

    const hasDaySelectorComponents = daySelectorTargets.some(selector => wrapper.find(selector).length > 0);
    setHasDaySelectors(hasDaySelectorComponents);
  }, [editorInstance]);

  useEffect(() => {
    if (!editorInstance) return;

    const refreshForms = () => {
      detectFormsOnPage();
    };

    const events = ['component:add', 'component:remove', 'component:update', 'component:drag:end', 'page:select'];

    events.forEach((eventName) => {
      editorInstance.on(eventName, refreshForms);
    });

    refreshForms();

    return () => {
      events.forEach((eventName) => {
        editorInstance.off(eventName, refreshForms);
      });
    };
  }, [editorInstance, detectFormsOnPage]);

  // Function to scroll to a specific form
  const scrollToForm = (selector) => {
    const formElement = document.querySelector(selector);
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // Add a highlight effect
      formElement.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.8)';
      setTimeout(() => {
        formElement.style.boxShadow = '';
      }, 2000);
    }
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.reduxStore = {
        getState: () => ({
          funnel: {
            stages: stages,
            contentData: contentData
          }
        })
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.reduxStore;
      }
    };
  }, [stages, contentData]);

  useEffect(() => {
    if (stages && stageId) {
      const stage = stages.find(s => (s._id === stageId) || (s.pageId === stageId) || (s.id === stageId));
      if (stage) {
        setCurrentStage(stage);
        // Check for redirect page in stage basicInfo
        if (stage.basicInfo?.redirectPage) {
          setSelectedRedirectPage(stage.basicInfo.redirectPage);
        }
      }
    }
  }, [stages, stageId]);

  const uploadFiles = async files => {
    const fd = new FormData();
    files.forEach(f => fd.append('assets', f));

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/assets`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return data.data.map(asset => ({
        ...asset,
        src: asset.src.startsWith('/') ? asset.src : `/${asset.src}`
      }));
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchInitialAssets = async () => {
      // Skip if no coachId or token
      if (!coachId || !token) {
        console.log('Skipping asset fetch - no coachId or token');
        setAssets([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/assets?coachId=${coachId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // Handle 404 gracefully - assets endpoint might not exist yet
          if (response.status === 404) {
            console.log('Assets endpoint not found, using empty assets list');
            setAssets([]);
            return;
          }
          throw new Error(`Failed to fetch assets: ${response.statusText}`);
        }
        
        const result = await response.json();
        setAssets(result.data || []);
      } catch (error) {
        console.warn("Could not fetch assets:", error.message);
        // Set empty array instead of throwing error
        setAssets([]);
      }
    };

    fetchInitialAssets();
  }, [coachId, token]);

  // Function to update direct forms with redirect URL (updated to handle both form types)
  const updateDirectFormsRedirect = (editor, redirectSlug) => {
    if (!editor || !redirectSlug) return;

    setTimeout(() => {
      const wrapper = editor.DomComponents.getWrapper();

      // Update both original and V2 forms
      const directContainers = wrapper.find('.bss-direct-form-container, .bss-direct-form-v2-container');
      let updatedCount = 0;

      directContainers.forEach(container => {
        const form = container.find('.bss-direct-form, .bss-direct-form-v2').at(0);
        if (form) {
          form.addAttributes({
            'data-redirect-page': redirectSlug
          });

          const view = form.getView();
          if (view && view.el) {
            view.el.setAttribute('data-redirect-page', redirectSlug);
          }
          updatedCount++;
          console.log('Updated direct form redirect to:', redirectSlug);
        }
      });

      console.log(`Updated ${updatedCount} direct forms with redirect: ${redirectSlug}`);

      editor.trigger('change:canvas');
      editor.runCommand('canvas:reload');
    }, 100);
  };

  // FIXED: Enhanced form handlers with proper localStorage integration
  const initializeDirectFormHandlers = () => {
    const initializeAllForms = () => {
      console.log('🔧 Initializing all forms...');
      
      // Initialize Direct Forms (both V1 and V2)
      const forms = document.querySelectorAll('.bss-direct-form:not([data-initialized]), .bss-direct-form-v2:not([data-initialized])');
      console.log(`Found ${forms.length} direct forms to initialize`);
      
      if (forms.length === 0) {
        console.log('No uninitialized forms found');
        return;
      }
      
      forms.forEach((form, formIndex) => {
        try {
          form.setAttribute('data-initialized', 'true');
          console.log(`Initializing form ${formIndex + 1}/${forms.length}`);

          const container = form.closest('.bss-direct-form-container, .bss-direct-form-v2-container');
          const messageEl = container ? container.querySelector('.form-message') : null;
          const submitBtn = form.querySelector('.bss-submit-btn, .bss-submit-btn-v2');

          const showMessage = (message, type) => {
            if (messageEl) {
              messageEl.style.display = 'block';
              messageEl.className = 'form-message ' + type;
              messageEl.textContent = message;
              messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              console.log(type.toUpperCase() + ': ' + message);
              alert(message);
            }
          };

          const hideMessage = () => {
            if (messageEl) {
              messageEl.style.display = 'none';
              messageEl.textContent = '';
            }
          };

          const inputs = form.querySelectorAll('input');
          inputs.forEach(input => {
            input.addEventListener('focus', hideMessage);
          });

          // Add country code to country name mapping
          const countryCodeMap = {
            '+1': 'United States/Canada',
            '+44': 'United Kingdom',
            '+91': 'India',
            '+61': 'Australia',
            '+49': 'Germany',
            '+33': 'France',
            '+81': 'Japan',
            '+86': 'China',
            '+7': 'Russia',
            '+55': 'Brazil',
            '+52': 'Mexico',
            '+34': 'Spain',
            '+39': 'Italy',
            '+31': 'Netherlands',
            '+46': 'Sweden',
            '+47': 'Norway',
            '+45': 'Denmark',
            '+358': 'Finland',
            '+41': 'Switzerland',
            '+43': 'Austria',
            '+48': 'Poland',
            '+420': 'Czech Republic',
            '+36': 'Hungary',
            '+380': 'Ukraine',
            '+90': 'Turkey',
            '+82': 'South Korea',
            '+65': 'Singapore',
            '+60': 'Malaysia',
            '+66': 'Thailand',
            '+84': 'Vietnam',
            '+62': 'Indonesia',
            '+63': 'Philippines',
            '+971': 'United Arab Emirates',
            '+966': 'Saudi Arabia',
            '+20': 'Egypt',
            '+27': 'South Africa',
            '+234': 'Nigeria',
            '+254': 'Kenya',
            '+233': 'Ghana',
            '+212': 'Morocco',
            '+216': 'Tunisia',
            '+213': 'Algeria',
            '+225': 'Ivory Coast',
            '+237': 'Cameroon',
            '+251': 'Ethiopia',
            '+256': 'Uganda',
            '+260': 'Zambia',
            '+263': 'Zimbabwe',
            '+265': 'Malawi',
            '+267': 'Botswana',
            '+268': 'Eswatini',
            '+269': 'Comoros',
            '+290': 'Saint Helena',
            '+291': 'Eritrea',
            '+297': 'Aruba',
            '+298': 'Faroe Islands',
            '+299': 'Greenland',
            '+350': 'Gibraltar',
            '+351': 'Portugal',
            '+352': 'Luxembourg',
            '+353': 'Ireland',
            '+354': 'Iceland',
            '+355': 'Albania',
            '+356': 'Malta',
            '+357': 'Cyprus',
            '+359': 'Bulgaria',
            '+370': 'Lithuania',
            '+371': 'Latvia',
            '+372': 'Estonia',
            '+373': 'Moldova',
            '+374': 'Armenia',
            '+375': 'Belarus',
            '+376': 'Andorra',
            '+377': 'Monaco',
            '+378': 'San Marino',
            '+379': 'Vatican City',
            '+381': 'Serbia',
            '+382': 'Montenegro',
            '+383': 'Kosovo',
            '+385': 'Croatia',
            '+386': 'Slovenia',
            '+387': 'Bosnia and Herzegovina',
            '+389': 'North Macedonia',
            '+421': 'Slovakia',
            '+423': 'Liechtenstein',
            '+501': 'Belize',
            '+502': 'Guatemala',
            '+503': 'El Salvador',
            '+504': 'Honduras',
            '+505': 'Nicaragua',
            '+506': 'Costa Rica',
            '+507': 'Panama',
            '+508': 'Saint Pierre and Miquelon',
            '+509': 'Haiti',
            '+590': 'Guadeloupe',
            '+591': 'Bolivia',
            '+592': 'Guyana',
            '+593': 'Ecuador',
            '+594': 'French Guiana',
            '+595': 'Paraguay',
            '+596': 'Martinique',
            '+597': 'Suriname',
            '+598': 'Uruguay',
            '+599': 'Caribbean Netherlands',
            '+670': 'East Timor',
            '+672': 'Antarctica',
            '+673': 'Brunei',
            '+674': 'Nauru',
            '+675': 'Papua New Guinea',
            '+676': 'Tonga',
            '+677': 'Solomon Islands',
            '+678': 'Vanuatu',
            '+679': 'Fiji',
            '+680': 'Palau',
            '+681': 'Wallis and Futuna',
            '+682': 'Cook Islands',
            '+683': 'Niue',
            '+685': 'Samoa',
            '+686': 'Kiribati',
            '+687': 'New Caledonia',
            '+688': 'Tuvalu',
            '+689': 'French Polynesia',
            '+690': 'Tokelau',
            '+691': 'Micronesia',
            '+692': 'Marshall Islands',
            '+850': 'North Korea',
            '+852': 'Hong Kong',
            '+853': 'Macau',
            '+855': 'Cambodia',
            '+856': 'Laos',
            '+880': 'Bangladesh',
            '+886': 'Taiwan',
            '+960': 'Maldives',
            '+961': 'Lebanon',
            '+962': 'Jordan',
            '+963': 'Syria',
            '+964': 'Iraq',
            '+965': 'Kuwait',
            '+967': 'Yemen',
            '+968': 'Oman',
            '+970': 'Palestine',
            '+972': 'Israel',
            '+973': 'Bahrain',
            '+974': 'Qatar',
            '+975': 'Bhutan',
            '+976': 'Mongolia',
            '+977': 'Nepal',
            '+992': 'Tajikistan',
            '+993': 'Turkmenistan',
            '+994': 'Azerbaijan',
            '+995': 'Georgia',
            '+996': 'Kyrgyzstan',
            '+998': 'Uzbekistan',
            '+1242': 'Bahamas',
            '+1246': 'Barbados',
            '+1264': 'Anguilla',
            '+1268': 'Antigua and Barbuda',
            '+1284': 'British Virgin Islands',
            '+1340': 'U.S. Virgin Islands',
            '+1345': 'Cayman Islands',
            '+1441': 'Bermuda',
            '+1473': 'Grenada',
            '+1649': 'Turks and Caicos Islands',
            '+1664': 'Montserrat',
            '+1671': 'Guam',
            '+1684': 'American Samoa',
            '+1758': 'Saint Lucia',
            '+1767': 'Dominica',
            '+1784': 'Saint Vincent and the Grenadines',
            '+1787': 'Puerto Rico',
            '+1809': 'Dominican Republic',
            '+1868': 'Trinidad and Tobago',
            '+1869': 'Saint Kitts and Nevis',
            '+1876': 'Jamaica',
            '+1939': 'Puerto Rico'
          };

          // Auto-populate country field when country code changes
          const countryCodeSelect = form.querySelector('select[name="countryCode"]');
          const countryInput = form.querySelector('input[name="country"]');
          
          if (countryCodeSelect && countryInput) {
            const updateCountry = () => {
              const selectedCode = countryCodeSelect.value;
              if (selectedCode && countryCodeMap[selectedCode]) {
                countryInput.value = countryCodeMap[selectedCode];
                console.log('✅ Country updated to:', countryCodeMap[selectedCode]);
              }
            };
            
            countryCodeSelect.addEventListener('change', updateCountry);
            
            // Set initial country if country code is pre-selected
            if (countryCodeSelect.value) {
              updateCountry();
            }
          }

          form.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!submitBtn) return;

            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Processing...</span>';
            submitBtn.disabled = true;
            hideMessage();

            const redirectPage = this.getAttribute('data-redirect-page') || container.getAttribute('data-redirect-page');
         
            try {
              // Get current page name
              const currentPageName = editorInstance?.Pages?.getSelected()?.get('name') || currentStage?.name || 'Unknown Page';

              // Get targetAudience from Redux state
              const reduxState = window.reduxStore ? window.reduxStore.getState() : null;
              const targetAudience = reduxState?.funnel?.contentData?.targetAudience || 'client';
              const countryCodeEl = this.querySelector('select[name="countryCode"]');
              const phoneEl = this.querySelector('input[name="phone"]');
              const countryCode = countryCodeEl?.value || '+1';
              const phoneNumber = phoneEl?.value || '';
              const fullPhoneNumber = `${countryCode} ${phoneNumber}`;

              // Get form data including new city and country fields
              // Extract couch ID from URL for form submission
              const urlCouchId = extractCouchIdFromUrl();
              console.log('🔍 Couch ID Debug:', {
                urlCouchId: urlCouchId,
                loggedInCoachId: coachId,
                usingCouchId: urlCouchId || coachId
              });
              const formData = {
                name: this.querySelector('input[name="name"]').value,
                email: this.querySelector('input[name="email"]').value,
                phone: fullPhoneNumber,
                city: this.querySelector('input[name="city"]').value,
                country: this.querySelector('input[name="country"]').value,
                coachId: urlCouchId || coachId, // Use URL couch ID first, fallback to logged-in coach ID
                funnelId: funnelId || 'default-funnel-id',
                funnelType: funnelType || 'standard',
                status: currentPageName,
                targetAudience: targetAudience
              };

              console.log('📝 FORM SUBMISSION:', formData);
              console.log('🔍 Country Code Debug:', {
                element: this.querySelector('select[name="countryCode"]'),
                value: this.querySelector('select[name="countryCode"]')?.value,
                defaultValue: '+1'
              });

              // Validate required fields
              if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
                throw new Error('Name, email and phone are required');
              }

              if (!formData.coachId) {
                throw new Error('Couch ID information not available. Please ensure you are accessing this page from a valid funnel URL.');
              }

              // API call to create lead
              const response = await axios.post(`${API_BASE_URL}/api/leads`, {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                city: formData.city.trim(),
                country: formData.country.trim(),
                coachId: formData.coachId,
                funnelId: formData.funnelId,
                funnelType: formData.funnelType,
                status: formData.status,
                targetAudience: formData.targetAudience
              }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              if (response.data.success) {
                // FIXED: Proper localStorage storage with error handling
                const leadId = response.data.data?._id || response.data.leadId;
                if (formData.coachId && leadId) {
                  try {
                    localStorage.setItem('coachId', formData.coachId);
                    localStorage.setItem('leadId', leadId);
                    localStorage.setItem('leadName', formData.name);
                    localStorage.setItem('firstName', formData.name.split(' ')[0]); // Store first name separately
                    
                    // Verify storage
                    const storedCoachId = localStorage.getItem('coachId');
                    const storedLeadId = localStorage.getItem('leadId');
                    const storedLeadName = localStorage.getItem('leadName');
                    const storedFirstName = localStorage.getItem('firstName');
                    
                    console.log('✅ STORAGE VERIFICATION:');
                    console.log('Stored CoachId:', storedCoachId);
                    console.log('Stored LeadId:', storedLeadId);
                    console.log('Stored LeadName:', storedLeadName);
                    console.log('Stored FirstName:', storedFirstName);
                    console.log('Storage successful:', storedCoachId === formData.coachId && storedLeadId === leadId && storedLeadName === formData.name);
                    
                    // Dispatch event to notify other components
                    window.dispatchEvent(new CustomEvent('leadDataStored', {
                      detail: { 
                        coachId: formData.coachId, 
                        leadId: leadId, 
                        leadName: formData.name,
                        firstName: formData.name.split(' ')[0]
                      }
                    }));
                    
                  } catch (storageError) {
                    console.error('❌ localStorage Error:', storageError);
                  }
                }

                // Show success message and update button to "Done"
                showMessage('🎉 Thank you! Your submission was successful!', 'success');
                if (submitBtn) {
                  submitBtn.innerHTML = '<span>✅ Done!</span>';
                  submitBtn.style.backgroundColor = '#10B981';
                  submitBtn.style.color = 'white';
                }

                setTimeout(() => {
                  if (redirectPage && redirectPage.trim() !== '') {
                    console.log('Redirecting to:', redirectPage);
                    let redirectUrl;
                    if (redirectPage.startsWith('http')) {
                      redirectUrl = redirectPage;
                    } else if (redirectPage.startsWith('/')) {
                      redirectUrl = redirectPage;
                    } else {
                      const currentPath = window.location.pathname;
                      const pathParts = currentPath.split('/').filter(Boolean);
                      const funnelSlug = pathParts[0] || 'funnel';
                      redirectUrl = `/${funnelSlug}/${redirectPage}`;
                    }
                    console.log('Final redirect URL:', redirectUrl);
                    setTimeout(() => {
                      window.location.href = redirectUrl;
                    }, 2000);
                  }
                }, 1000);

                setTimeout(() => {
                  this.reset();
                  // Reset button to original state after form reset
                  if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                  }
                }, 3000);
              } else {
                throw new Error(response.data.message || 'Failed to submit form');
              }
            } catch (error) {
              console.error('Form submission error:', error);
              showMessage(error.response?.data?.message || error.message || 'Sorry, there was an error. Please try again.', 'error');
              // Reset button to original state on error
              if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
              }
            }
          });
        } catch (error) {
          console.error(`Error initializing form ${formIndex + 1}:`, error);
        }
      });

      // FIXED: Initialize Appointment Forms with localStorage integration
      const appointmentContainers = document.querySelectorAll('.appointment-booking:not([data-initialized]), .quick-appointment:not([data-initialized])');
      console.log(`Found ${appointmentContainers.length} appointment containers to initialize`);
      
      appointmentContainers.forEach((container, containerIndex) => {
        try {
          container.setAttribute('data-initialized', 'true');
          console.log(`Initializing appointment container ${containerIndex + 1}/${appointmentContainers.length}`);
          
          // Inject stored data into appointment forms
          const storedCoachId = localStorage.getItem('coachId');
          const storedLeadId = localStorage.getItem('leadId');
          const storedLeadName = localStorage.getItem('leadName');
          const storedFirstName = localStorage.getItem('firstName');
          
          if (storedCoachId || storedLeadId) {
            console.log('🔄 Initializing appointment form with stored data:');
            console.log('CoachId:', storedCoachId);
            console.log('LeadId:', storedLeadId);
            console.log('LeadName:', storedLeadName);
            console.log('FirstName:', storedFirstName);
            
            // Set coachId in window for appointment system
            if (storedCoachId) {
              window.appointmentCoachId = storedCoachId;
            }
            
            // Set leadId in input if exists
            const leadIdInput = container.querySelector('input[name="leadId"], #leadId');
            if (leadIdInput && storedLeadId) {
              leadIdInput.value = storedLeadId;
              console.log('✅ Set leadId in appointment form:', storedLeadId);
            }
            
            // Set leadName in input if exists
            const leadNameInput = container.querySelector('input[name="leadName"], #leadName');
            if (leadNameInput && storedLeadName) {
              leadNameInput.value = storedLeadName;
              console.log('✅ Set leadName in appointment form:', storedLeadName);
            }
            
            // Set firstName in input if exists
            const firstNameInput = container.querySelector('input[name="firstName"], #firstName');
            if (firstNameInput && storedFirstName) {
              firstNameInput.value = storedFirstName;
              console.log('✅ Set firstName in appointment form:', storedFirstName);
            }
            
            // Trigger appointment system initialization
            if (typeof window.initializeBookingSystem === 'function') {
              window.initializeBookingSystem();
            }
          }
        } catch (error) {
          console.error(`Error initializing appointment container ${containerIndex + 1}:`, error);
        }
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAllForms);
    } else {
      initializeAllForms();
    }

    setTimeout(initializeAllForms, 200);
  };

  const onEditorReady = useCallback((editor) => {
    // Prevent multiple initializations
    if (editor._isInitialized) {
      console.log('Editor already initialized, skipping...');
      return;
    }
    editor._isInitialized = true;
    
    window.editor = editor;
    setEditorInstance(editor);
    setIsEditorLoading(false);

    // Ensure block categories dropdown functionality works
    // This will be called after editor is ready
    setTimeout(() => {
      const setupBlockCategories = () => {
        // Use GrapesJS BlockManager to ensure categories work
        if (editor.BlockManager) {
          const blockManager = editor.BlockManager;
          
          // Listen for block manager updates
          if (typeof blockManager.on === 'function') {
            blockManager.on('all', () => {
              setTimeout(() => {
                const categories = document.querySelectorAll('.gjs-block-category');
                categories.forEach(category => {
                  const title = category.querySelector('.gjs-title');
                  if (title && !title.hasAttribute('data-category-setup')) {
                    title.setAttribute('data-category-setup', 'true');
                    
                    // DEFAULT: Ensure category starts closed
                    category.classList.remove('gjs-open');
                    
                    const blocksContainer = category.querySelector('.gjs-blocks-c');
                    if (blocksContainer) {
                      blocksContainer.style.display = 'none';
                      blocksContainer.style.maxHeight = '0';
                      blocksContainer.style.padding = '0';
                      blocksContainer.style.height = '0';
                    }
                    
                    // Add click handler
                    title.addEventListener('click', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Toggle category
                      category.classList.toggle('gjs-open');
                      
                      if (blocksContainer) {
                        if (category.classList.contains('gjs-open')) {
                          blocksContainer.style.display = 'block';
                          blocksContainer.style.maxHeight = '5000px';
                          blocksContainer.style.padding = '8px';
                          blocksContainer.style.height = 'auto';
                        } else {
                          blocksContainer.style.display = 'none';
                          blocksContainer.style.maxHeight = '0';
                          blocksContainer.style.padding = '0';
                          blocksContainer.style.height = '0';
                        }
                      }
                    });
                  }
                });
              }, 100);
            });
          }
        }
      };
      
      setupBlockCategories();
    }, 500);

    const getPageElements = () => {
      const elements = [{ id: '', name: '-- Select element --' }];
      // Add null check for editor.Pages
      if (!editor || !editor.Pages) {
        return elements;
      }
      const currentPage = editor.Pages.getSelected();
      if (currentPage) {
        const walkComponents = (component) => {
          if (!component) return;
          const id = component.getId();
          if (id) {
            const tagName = component.get('tagName') || 'div';
            elements.push({
              id: `#${id}`,
              name: `${tagName}#${id}`
            });
          }
          component.components().forEach(walkComponents);
        };
        walkComponents(currentPage.getMainComponent());
      }
      return elements;
    };

    // FIXED: Add form initialization when components are added to the editor
    editor.on('component:add', (component) => {
      // Check if the added component is a form
      if (component.get('tagName') === 'form' || 
          component.getEl()?.classList.contains('bss-direct-form') ||
          component.getEl()?.classList.contains('bss-direct-form-v2')) {
        console.log('🔧 Form component added to editor, initializing...');
        setTimeout(() => {
          initializeDirectFormHandlers();
        }, 100);
      }
    });

    // FIXED: Add form initialization when components are updated
    editor.on('component:update', (component) => {
      if (component.get('tagName') === 'form' || 
          component.getEl()?.classList.contains('bss-direct-form') ||
          component.getEl()?.classList.contains('bss-direct-form-v2')) {
        console.log('🔧 Form component updated in editor, reinitializing...');
        setTimeout(() => {
          initializeDirectFormHandlers();
        }, 100);
      }
    });

    // FIXED: Ensure CSS persists after component changes and auto-save CSS/JS
    editor.on('component:update component:add component:remove', () => {
      // Check if CSS still exists in iframe and re-inject if needed
      setTimeout(() => {
        if (!editor.Canvas || typeof editor.Canvas.getFrameEl !== 'function') {
          console.warn('Canvas not ready for CSS check');
          return;
        }
        const iframe = editor.Canvas.getFrameEl();
        if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) {
          console.warn('Iframe not ready for CSS check');
          return;
        }
        const iframeDoc = iframe.contentWindow.document;
        const hasPageCss = iframeDoc.querySelector('style[data-page-css]');
        
        const currentPage = editor.Pages && typeof editor.Pages.getSelected === 'function'
          ? editor.Pages.getSelected()
          : null;
        if (currentPage && !hasPageCss) {
          console.log('⚠️ CSS lost after component change, re-injecting...');
          injectPageCSS(currentPage, true);
        }
      }, 100);
    });

    // FIXED: Auto-save CSS when style changes are made
    editor.on('style:update', () => {
      const currentPage = editor.Pages?.getSelected();
      if (currentPage) {
        setTimeout(() => {
          const currentCss = extractPageCSS(editor, currentPage.id);
          currentPage.set('_savedCss', currentCss);
          console.log(`💾 Auto-saved CSS after style update: ${currentCss.length} chars`);
        }, 500);
      }
    });

    // FIXED: Auto-save JS when script changes are made
    editor.on('component:update:script', (component) => {
      const currentPage = editor.Pages?.getSelected();
      if (currentPage) {
        const currentJs = currentPage.get('script') || '';
        currentPage.set('_savedJs', currentJs);
        console.log(`💾 Auto-saved JS after script update: ${currentJs.length} chars`);
      }
    });

    // Add the original direct form component
    editor.BlockManager.add('direct-form', {
      label: 'Direct Form',
      category: 'Forms',
      content: `
        <div class="bss-direct-form-container" data-redirect-page="${selectedRedirectPage || ''}">
          <div class="bss-form-content">
            <div class="bss-form-header">
              <h4>Get Free Access</h4>
              <h2>Claim Your FREE Training Access</h2>
              <p>⚠️ Limited to Serious Professionals Only</p>
            </div>
            <form class="bss-direct-form" data-redirect-page="${selectedRedirectPage || ''}" data-redirect-set="true" onsubmit="return false;">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Full Name*</label>
                  <input type="text" id="name" name="name" placeholder="Enter your full name" required>
                </div>
                <div class="form-group">
                  <label for="email">Email Address*</label>
                  <input type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone Number*</label>
                  <div class="phone-input-group">
                    <select name="countryCode" class="country-code-select" required>
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                      <option value="+49">+49</option>
                      <option value="+33">+33</option>
                      <option value="+81">+81</option>
                      <option value="+86">+86</option>
                    </select>
                    <input type="tel" id="phone" name="phone" placeholder="98765 43210" required>
                  </div>
                </div>
                <div class="form-group">
                  <label for="city">City</label>
                  <input type="text" id="city" name="city" placeholder="Your city">
                </div>
              </div>
              
              <div class="form-group">
                <label for="country">Country</label>
                <input type="text" id="country" name="country" placeholder="Your country" required readonly>
                <small class="form-helper-text">Country will be automatically filled based on your phone country code selection</small>
              </div>
              
              <button type="submit" class="bss-submit-btn">GET FREE ACCESS NOW →</button>
            </form>
            <div class="form-message" style="display:none; margin-top:15px;"></div>
            <div class="bss-form-footer">
              <div class="form-features">
                <div class="form-feature">
                  <i class="fas fa-check-circle"></i>
                  <span>Instant access to complete training series</span>
                </div>
                <div class="form-feature">
                  <i class="fas fa-lock"></i>
                  <span>Your information is secure and private</span>
                </div>
                <div class="form-feature">
                  <i class="fas fa-clock"></i>
                  <span>Limited time offer</span>
                </div>
              </div>
            </div>
          </div>
          <style>
            .bss-direct-form-container {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              max-width: 600px;
              margin: 20px auto;
              padding: 0;
            }
            .bss-form-content {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.1);
              border: 1px solid rgba(255,174,0,0.2);
              position: relative;
              overflow: hidden;
            }
            .bss-form-content::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 5px;
              background: linear-gradient(90deg, #FFAE00 0%, #F54200 100%);
            }
            .bss-form-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .bss-form-header h4 {
              color: #FFAE00;
              font-size: 1rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .bss-form-header h2 {
              font-size: 1.8rem;
              font-weight: 700;
              color: #333;
              margin-bottom: 10px;
              line-height: 1.3;
            }
            .bss-form-header p {
              color: #666;
              font-size: 0.95rem;
              font-weight: 500;
              margin: 0;
            }
            .form-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .form-group {
              margin-bottom: 25px;
            }
            .form-group label {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
              color: #333;
              font-size: 0.95rem;
            }
            .form-group input {
              width: 100%;
              padding: 12px 15px;
              border: 2px solid #e1e8ed;
              border-radius: 8px;
              font-size: 14px;
              transition: all 0.3s ease;
              background: #fff;
              box-sizing: border-box;
            }
            .form-group input:focus {
              outline: none;
              border-color: #FFAE00;
              box-shadow: 0 0 0 3px rgba(255,174,0,0.1);
            }
            .form-group input::placeholder {
              color: #adb5bd;
              font-style: italic;
            }
            .bss-submit-btn {
              width: 100%;
              background: linear-gradient(90deg, #FFAE00 0%, #F54200 100%);
              color: white;
              padding: 14px 20px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(255,174,0,0.3);
              margin-top: 20px;
            }
            .bss-submit-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(255,174,0,0.4);
            }
            .bss-submit-btn:disabled {
              opacity: 0.7;
              cursor: not-allowed;
              transform: none;
            }
            .form-message {
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-size: 16px;
              font-weight: 500;
            }
            .form-message.success {
              background-color: #d4edda;
              color: #155724;
              border: 1px solid #c3e6cb;
            }
            .form-message.error {
              background-color: #f8d7da;
              color: #721c24;
              border: 1px solid #f5c6cb;
            }
            .form-features {
              display: flex;
              justify-content: center;
              gap: 20px;
              margin-top: 25px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
            }
            .form-feature {
              display: flex;
              align-items: center;
              gap: 6px;
              color: #666;
              font-size: 12px;
              font-weight: 500;
            }
            .form-feature i {
              color: #FFAE00;
              font-size: 14px;
            }
            .bss-form-footer {
              margin-top: 20px;
            }
            .phone-input-group {
              display: flex;
              gap: 10px;
              align-items: center;
            }
            .country-code-select {
              flex: 0 0 100px;
              padding: 12px 8px;
              border: 2px solid #e1e8ed;
              border-radius: 8px;
              font-size: 14px;
              background-color: #fff;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .country-code-select:focus {
              outline: none;
              border-color: #FFAE00;
              background-color: #fff;
              box-shadow: 0 0 0 3px rgba(255,174,0,0.1);
            }
            .country-code-select:hover {
              border-color: #FFAE00;
              background-color: #fff;
            }
            .phone-input-group input[type="tel"] {
              flex: 1;
              padding: 12px 15px;
              border: 2px solid #e1e8ed;
              border-radius: 8px;
              font-size: 14px;
              transition: all 0.3s ease;
            }
            .phone-input-group input[type="tel"]:focus {
              outline: none;
              border-color: #FFAE00;
              box-shadow: 0 0 0 3px rgba(255,174,0,0.1);
            }
            .form-group input[readonly] {
              background-color: #f8f9fa;
              color: #495057;
              cursor: not-allowed;
              border-color: #ced4da;
            }
            .form-group input[readonly]:focus {
              border-color: #ced4da;
              box-shadow: none;
            }
            .form-helper-text {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
              font-style: italic;
            }
            @media (max-width: 768px) {
              .bss-direct-form-container {
                margin: 10px;
                max-width: none;
              }
              .bss-form-content {
                padding: 25px 20px;
              }
              .phone-input-group {
                flex-direction: column;
                gap: 8px;
              }
              .country-code-select {
                flex: none;
                width: 100%;
              }
              .form-row {
                grid-template-columns: 1fr;
                gap: 0;
              }
              .bss-form-header h2 {
                font-size: 1.5rem;
              }
              .form-features {
                flex-direction: column;
                gap: 10px;
              }
            }
          </style>
        `,
      attributes: { class: 'bss-direct-form-element' },
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    });

    // Add the new Direct Form V2 with professional design
    editor.BlockManager.add('direct-form-v2', {
      label: 'Direct Form V2',
      category: 'Forms',
      content: `
        <div class="bss-direct-form-v2-container" data-redirect-page="${selectedRedirectPage || ''}">
          <div class="bss-form-v2-content">
            <div class="bss-form-v2-header">
              <div class="header-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#2563eb"/>
                </svg>
              </div>
              <h3>Professional Contact</h3>
              <p>Connect with us for personalized solutions</p>
            </div>
            <form class="bss-direct-form-v2" data-redirect-page="${selectedRedirectPage || ''}" data-redirect-set="true">
              <div class="form-row">
                <div class="form-group-v2">
                  <label for="name-v2">Full Name *</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#6b7280"/>
                    </svg>
                    <input type="text" id="name-v2" name="name" placeholder="Enter your full name" required>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group-v2">
                  <label for="email-v2">Email Address *</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#6b7280"/>
                    </svg>
                    <input type="email" id="email-v2" name="email" placeholder="your.email@example.com" required>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group-v2">
                  <label for="phone-v2">Phone Number *</label>
                  <div class="phone-input-wrapper">
                    <div class="country-code-selector">
                      <select name="countryCode" class="country-code-select-v2" required>
                        <option value="">Code</option>
                        <option value="+1" selected>🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+31">🇳🇱 +31</option>
                        <option value="+46">🇸🇪 +46</option>
                        <option value="+47">🇳🇴 +47</option>
                        <option value="+45">🇩🇰 +45</option>
                        <option value="+358">🇫🇮 +358</option>
                        <option value="+41">🇨🇭 +41</option>
                        <option value="+43">🇦🇹 +43</option>
                        <option value="+48">🇵🇱 +48</option>
                        <option value="+420">🇨🇿 +420</option>
                        <option value="+36">🇭🇺 +36</option>
                        <option value="+380">🇺🇦 +380</option>
                        <option value="+90">🇹🇷 +90</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+65">🇸🇬 +65</option>
                        <option value="+60">🇲🇾 +60</option>
                        <option value="+66">🇹🇭 +66</option>
                        <option value="+84">🇻🇳 +84</option>
                        <option value="+62">🇮🇩 +62</option>
                        <option value="+63">🇵🇭 +63</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+27">🇿🇦 +27</option>
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+233">🇬🇭 +233</option>
                        <option value="+212">🇲🇦 +212</option>
                        <option value="+216">🇹🇳 +216</option>
                        <option value="+213">🇩🇿 +213</option>
                        <option value="+225">🇨🇮 +225</option>
                        <option value="+237">🇨🇲 +237</option>
                        <option value="+251">🇪🇹 +251</option>
                        <option value="+256">🇺🇬 +256</option>
                        <option value="+260">🇿🇲 +260</option>
                        <option value="+263">🇿🇼 +263</option>
                        <option value="+265">🇲🇼 +265</option>
                        <option value="+267">🇧🇼 +267</option>
                        <option value="+268">🇸🇿 +268</option>
                        <option value="+269">🇰🇲 +269</option>
                        <option value="+290">🇸🇭 +290</option>
                        <option value="+291">🇪🇷 +291</option>
                        <option value="+297">🇦🇼 +297</option>
                        <option value="+298">🇫🇴 +298</option>
                        <option value="+299">🇬🇱 +299</option>
                        <option value="+350">🇬🇮 +350</option>
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+352">🇱🇺 +352</option>
                        <option value="+353">🇮🇪 +353</option>
                        <option value="+354">🇮🇸 +354</option>
                        <option value="+355">🇦🇱 +355</option>
                        <option value="+356">🇲🇹 +356</option>
                        <option value="+357">🇨🇾 +357</option>
                        <option value="+359">🇧🇬 +359</option>
                        <option value="+370">🇱🇹 +370</option>
                        <option value="+371">🇱🇻 +371</option>
                        <option value="+372">🇪🇪 +372</option>
                        <option value="+373">🇲🇩 +373</option>
                        <option value="+374">🇦🇲 +374</option>
                        <option value="+375">🇧🇾 +375</option>
                        <option value="+376">🇦🇩 +376</option>
                        <option value="+377">🇲🇨 +377</option>
                        <option value="+378">🇸🇲 +378</option>
                        <option value="+379">🇻🇦 +379</option>
                        <option value="+381">🇷🇸 +381</option>
                        <option value="+382">🇲🇪 +382</option>
                        <option value="+383">🇽🇰 +383</option>
                        <option value="+385">🇭🇷 +385</option>
                        <option value="+386">🇸🇮 +386</option>
                        <option value="+387">🇧🇦 +387</option>
                        <option value="+389">🇲🇰 +389</option>
                        <option value="+421">🇸🇰 +421</option>
                        <option value="+423">🇱🇮 +423</option>
                        <option value="+501">🇧🇿 +501</option>
                        <option value="+502">🇬🇹 +502</option>
                        <option value="+503">🇸🇻 +503</option>
                        <option value="+504">🇭🇳 +504</option>
                        <option value="+505">🇳🇮 +505</option>
                        <option value="+506">🇨🇷 +506</option>
                        <option value="+507">🇵🇦 +507</option>
                        <option value="+508">🇵🇲 +508</option>
                        <option value="+509">🇭🇹 +509</option>
                        <option value="+590">🇬🇵 +590</option>
                        <option value="+591">🇧🇴 +591</option>
                        <option value="+592">🇬🇾 +592</option>
                        <option value="+593">🇪🇨 +593</option>
                        <option value="+594">🇬🇫 +594</option>
                        <option value="+595">🇵🇾 +595</option>
                        <option value="+596">🇲🇶 +596</option>
                        <option value="+597">🇸🇷 +597</option>
                        <option value="+598">🇺🇾 +598</option>
                        <option value="+599">🇧🇶 +599</option>
                        <option value="+670">🇹🇱 +670</option>
                        <option value="+672">🇦🇶 +672</option>
                        <option value="+673">🇧🇳 +673</option>
                        <option value="+674">🇳🇷 +674</option>
                        <option value="+675">🇵🇬 +675</option>
                        <option value="+676">🇹🇴 +676</option>
                        <option value="+677">🇸🇧 +677</option>
                        <option value="+678">🇻🇺 +678</option>
                        <option value="+679">🇫🇯 +679</option>
                        <option value="+680">🇵🇼 +680</option>
                        <option value="+681">🇼🇫 +681</option>
                        <option value="+682">🇨🇰 +682</option>
                        <option value="+683">🇳🇺 +683</option>
                        <option value="+685">🇼🇸 +685</option>
                        <option value="+686">🇰🇮 +686</option>
                        <option value="+687">🇳🇨 +687</option>
                        <option value="+688">🇹🇻 +688</option>
                        <option value="+689">🇵🇫 +689</option>
                        <option value="+690">🇹🇰 +690</option>
                        <option value="+691">🇫🇲 +691</option>
                        <option value="+692">🇲🇭 +692</option>
                        <option value="+850">🇰🇵 +850</option>
                        <option value="+852">🇭🇰 +852</option>
                        <option value="+853">🇲🇴 +853</option>
                        <option value="+855">🇰🇭 +855</option>
                        <option value="+856">🇱🇦 +856</option>
                        <option value="+880">🇧🇩 +880</option>
                        <option value="+886">🇹🇼 +886</option>
                        <option value="+960">🇲🇻 +960</option>
                        <option value="+961">🇱🇧 +961</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+963">🇸🇾 +963</option>
                        <option value="+964">🇮🇶 +964</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+967">🇾🇪 +967</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+970">🇵🇸 +970</option>
                        <option value="+972">🇮🇱 +972</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+975">🇧🇹 +975</option>
                        <option value="+976">🇲🇳 +976</option>
                        <option value="+977">🇳🇵 +977</option>
                        <option value="+992">🇹🇯 +992</option>
                        <option value="+993">🇹🇲 +993</option>
                        <option value="+994">🇦🇿 +994</option>
                        <option value="+995">🇬🇪 +995</option>
                        <option value="+996">🇰🇬 +996</option>
                        <option value="+998">🇺🇿 +998</option>
                        <option value="+1242">🇧🇸 +1242</option>
                        <option value="+1246">🇧🇧 +1246</option>
                        <option value="+1264">🇦🇮 +1264</option>
                        <option value="+1268">🇦🇬 +1268</option>
                        <option value="+1284">🇻🇬 +1284</option>
                        <option value="+1340">🇻🇮 +1340</option>
                        <option value="+1345">🇰🇾 +1345</option>
                        <option value="+1441">🇧🇲 +1441</option>
                        <option value="+1473">🇬🇩 +1473</option>
                        <option value="+1649">🇹🇨 +1649</option>
                        <option value="+1664">🇲🇸 +1664</option>
                        <option value="+1671">🇬🇺 +1671</option>
                        <option value="+1684">🇦🇸 +1684</option>
                        <option value="+1758">🇱🇨 +1758</option>
                        <option value="+1767">🇩🇲 +1767</option>
                        <option value="+1784">🇻🇨 +1784</option>
                        <option value="+1787">🇵🇷 +1787</option>
                        <option value="+1809">🇩🇴 +1809</option>
                        <option value="+1868">🇹🇹 +1868</option>
                        <option value="+1869">🇰🇳 +1869</option>
                        <option value="+1876">🇯🇲 +1876</option>
                        <option value="+1939">🇵🇷 +1939</option>
                      </select>
                    </div>
                    <div class="phone-input-field">
                      <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="#6b7280"/>
                      </svg>
                      <input type="tel" id="phone-v2" name="phone" placeholder="(555) 123-4567" required>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-row-split">
                <div class="form-group-v2 half-width">
                  <label for="city-v2">City *</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#6b7280"/>
                    </svg>
                    <input type="text" id="city-v2" name="city" placeholder="Your city" required>
                  </div>
                </div>
                <div class="form-group-v2 half-width">
                  <label for="country-v2">Country *</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22S22 17.52 22 12S17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z" fill="#6b7280"/>
                    </svg>
                    <input type="text" id="country-v2" name="country" placeholder="Your country" required readonly>
                    <small class="form-helper-text-v2">Country will be automatically filled based on your phone country code selection</small>
                  </div>
                </div>
              </div>
              <button type="submit" class="bss-submit-btn-v2">
                <span class="btn-text">Get Started</span>
                <svg class="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </form>
            <div class="form-message" style="display:none; margin-top:20px;"></div>
            <div class="bss-form-v2-footer">
              <div class="security-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#10b981"/>
                </svg>
                <span>100% Secure & Confidential</span>
              </div>
            </div>
          </div>
          <style>
            .bss-direct-form-v2-container {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 30px auto;
              padding: 0;
            }
            .bss-form-v2-content {
              background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 25px rgba(0, 0, 0, 0.08);
              border: 1px solid rgba(148, 163, 184, 0.1);
              position: relative;
              overflow: hidden;
            }
            .bss-form-v2-content::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #2563eb, #3b82f6, #1d4ed8);
            }
            .bss-form-v2-header {
              text-align: center;
              margin-bottom: 35px;
            }
            .header-icon {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #dbeafe, #bfdbfe);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
            }
            .bss-form-v2-header h3 {
              color: #1e293b;
              margin: 0 0 8px 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .bss-form-v2-header p {
              color: #64748b;
              font-size: 16px;
              margin: 0;
              line-height: 1.6;
              font-weight: 400;
            }
            .form-row {
              margin-bottom: 24px;
            }
            .form-row-split {
              display: flex;
              gap: 16px;
              margin-bottom: 24px;
            }
            .form-group-v2 {
              display: flex;
              flex-direction: column;
            }
            .form-group-v2.half-width {
              flex: 1;
            }
            .form-group-v2 label {
              color: #374151;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 8px;
              display: block;
            }
            .input-wrapper {
              position: relative;
            }
            .input-icon {
              position: absolute;
              left: 16px;
              top: 50%;
              transform: translateY(-50%);
              z-index: 2;
            }
            .form-group-v2 input {
              width: 100%;
              padding: 16px 16px 16px 48px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 400;
              box-sizing: border-box;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              background-color: #ffffff;
              color: #1f2937;
            }
            .form-group-v2 input::placeholder {
              color: #9ca3af;
            }
            .form-group-v2 input:focus {
              outline: none;
              border-color: #2563eb;
              background-color: #ffffff;
              box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
              transform: translateY(-1px);
            }
            .form-group-v2 input:hover:not(:focus) {
              border-color: #d1d5db;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            .phone-input-wrapper {
              display: flex;
              gap: 12px;
              align-items: center;
            }
            .country-code-selector {
              flex: 0 0 100px;
            }
            .country-code-select-v2 {
              width: 100%;
              padding: 16px 12px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 400;
              background-color: #ffffff;
              color: #1f2937;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .country-code-select-v2:focus {
              outline: none;
              border-color: #2563eb;
              background-color: #ffffff;
              box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
            }
            .country-code-select-v2:hover:not(:focus) {
              border-color: #d1d5db;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            .phone-input-field {
              flex: 1;
              position: relative;
            }
            .phone-input-field .input-icon {
              left: 16px;
            }
            .phone-input-field input {
              padding-left: 48px;
            }
            .form-group-v2 input[readonly] {
              background-color: #f8fafc;
              color: #64748b;
              cursor: not-allowed;
              border-color: #d1d5db;
            }
            .form-group-v2 input[readonly]:focus {
              border-color: #d1d5db;
              box-shadow: none;
              transform: none;
            }
            .form-helper-text-v2 {
              display: block;
              margin-top: 6px;
              font-size: 13px;
              color: #6b7280;
              font-weight: 400;
            }
            .bss-submit-btn-v2 {
              width: 100%;
              padding: 18px 24px;
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              border: none;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-top: 8px;
              position: relative;
              overflow: hidden;
            }
            .bss-submit-btn-v2::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
              transition: left 0.5s;
            }
            .bss-submit-btn-v2:hover::before {
              left: 100%;
            }
            .bss-submit-btn-v2:hover {
              background: linear-gradient(135deg, #1d4ed8, #1e40af);
              transform: translateY(-2px);
              box-shadow: 0 12px 35px rgba(37, 99, 235, 0.4);
            }
            .bss-submit-btn-v2:active {
              transform: translateY(0);
              box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
            }
            .bss-submit-btn-v2:disabled {
              background: linear-gradient(135deg, #9ca3af, #6b7280);
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }
            .btn-arrow {
              transition: transform 0.3s ease;
            }
            .bss-submit-btn-v2:hover .btn-arrow {
              transform: translateX(4px);
            }
            .form-message {
              padding: 16px 20px;
              border-radius: 12px;
              text-align: center;
              font-size: 15px;
              font-weight: 500;
              border: 1px solid;
            }
            .form-message.success {
              background-color: #ecfdf5;
              color: #047857;
              border-color: #a7f3d0;
            }
            .form-message.error {
              background-color: #fef2f2;
              color: #dc2626;
              border-color: #fca5a5;
            }
            .bss-form-v2-footer {
              margin-top: 30px;
              text-align: center;
            }
            .security-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              color: #059669;
              font-size: 14px;
              font-weight: 500;
              background-color: #ecfdf5;
              padding: 8px 16px;
              border-radius: 20px;
              border: 1px solid #a7f3d0;
            }
            @media (max-width: 640px) {
              .bss-direct-form-v2-container {
                margin: 20px 15px;
                max-width: none;
              }
              .bss-form-v2-content {
                padding: 30px 24px;
              }
              .bss-form-v2-header h3 {
                font-size: 24px;
              }
              .bss-form-v2-header p {
                font-size: 15px;
              }
              .form-row-split {
                flex-direction: column;
                gap: 24px;
              }
              .form-group-v2 input {
                padding: 14px 14px 14px 44px;
                font-size: 16px;
              }
              .bss-submit-btn-v2 {
                padding: 16px 20px;
                font-size: 15px;
              }
              .input-icon {
                left: 14px;
                width: 14px;
                height: 14px;
              }
              .phone-input-wrapper {
                flex-direction: column;
                gap: 12px;
              }
              .country-code-selector {
                flex: none;
                width: 100%;
              }
              .phone-input-field {
                flex: none;
                width: 100%;
              }
              .phone-input-field input {
                padding-left: 44px;
              }
            }
          </style>
        `,
      attributes: { class: 'bss-direct-form-v2-element' },
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM20 6L12 11L4 6V6H20V6Z"/></svg>`,
    });

    // Add Day Selector Drag & Drop Component
    editor.BlockManager.add('day-selector-widget', {
      label: 'Day Selector',
      category: 'Interactive Components',
      content: `<div class="day-selector-display-widget" data-component-id="${Date.now()}"><div class="day-selector-header"><div class="day-selector-title"><span class="calendar-icon">📅</span><div><h3>Day Information</h3><p>Upcoming schedule snapshot</p></div></div><button class="day-refresh-btn" data-refresh-days>Refresh</button></div><div class="day-info-content"><div class="selected-day-info"><div class="info-label">Selected Days</div><span class="day-value">Click Day Selector to choose</span></div><div class="recent-date-info"><div class="info-label">Upcoming Dates</div><span class="date-value">No day selected</span></div></div></div>`,
      attributes: { 
        class: 'day-selector-widget-element',
        'data-selected-day': '',
        'data-recent-date': '',
        'data-component-id': `day-selector-${Date.now()}`
      },
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,
    });

    // Add CSS for Day Selector Widget
    editor.setStyle(`.day-selector-display-widget{background:linear-gradient(120deg,#312e81 0%,#7c3aed 40%,#9333ea 100%);border-radius:20px;padding:24px;margin:20px 0;box-shadow:0 25px 60px rgba(76,29,149,0.35);color:white;font-family:'Inter','Segoe UI',sans-serif;display:flex;flex-direction:column;gap:18px;border:1px solid rgba(255,255,255,0.15);position:relative}.day-selector-display-widget::after{content:'';position:absolute;inset:16px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);pointer-events:none}.day-selector-display-widget.selected{border:1px solid rgba(16,185,129,0.7);box-shadow:0 0 0 1px rgba(16,185,129,0.6),0 25px 60px rgba(16,185,129,0.15)}.day-selector-header{display:flex;align-items:center;justify-content:space-between;gap:16px;z-index:1}.day-selector-title{display:flex;align-items:center;gap:12px}.calendar-icon{font-size:42px;background:rgba(255,255,255,0.12);padding:14px;border-radius:14px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.2)}.day-selector-title h3{margin:0;font-size:26px;font-weight:700}.day-selector-title p{margin:2px 0 0 0;font-size:13px;letter-spacing:0.6px;text-transform:uppercase;color:rgba(255,255,255,0.75)}.day-refresh-btn{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);color:white;padding:10px 18px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer;transition:all .3s ease}.day-refresh-btn:hover{background:rgba(255,255,255,0.25)}.day-info-content{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;z-index:1}.selected-day-info,.recent-date-info{background:rgba(15,23,42,0.25);border-radius:16px;padding:18px;box-shadow:0 15px 30px rgba(2,6,23,0.25);border:1px solid rgba(255,255,255,0.18)}.info-label{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:8px}.day-value,.date-value{font-size:18px;font-weight:600;color:#f8fafc;line-height:1.5}.day-selector-display-widget ::selection{background:rgba(59,130,246,0.4)}@media (max-width:640px){.day-selector-header{flex-direction:column;align-items:flex-start}.day-refresh-btn{width:100%;text-align:center}.day-info-content{grid-template-columns:1fr}}`);

    // Add Switch/Toggle Button Component
    editor.BlockManager.add('switch-button', {
      label: 'Switch Button',
      category: 'Interactive Components',
      content: `
        <div class="bss-switch-container" data-switch-id="${Date.now()}">
          <label class="bss-switch-label">
            <span class="switch-label-text">Enable Feature</span>
            <div class="bss-switch-wrapper">
              <input type="checkbox" class="bss-switch-input" checked>
              <span class="bss-switch-slider"></span>
            </div>
          </label>
        </div>
        <style>
          .bss-switch-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .bss-switch-label {
            display: flex;
            align-items: center;
            gap: 16px;
            cursor: pointer;
            user-select: none;
          }
          .switch-label-text {
            font-size: 16px;
            font-weight: 500;
            color: #374151;
          }
          .bss-switch-wrapper {
            position: relative;
            display: inline-block;
            width: 56px;
            height: 32px;
          }
          .bss-switch-input {
            opacity: 0;
            width: 0;
            height: 0;
            position: absolute;
          }
          .bss-switch-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #cbd5e1;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 34px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .bss-switch-slider:before {
            position: absolute;
            content: "";
            height: 24px;
            width: 24px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .bss-switch-input:checked + .bss-switch-slider {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .bss-switch-input:checked + .bss-switch-slider:before {
            transform: translateX(24px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
          .bss-switch-input:focus + .bss-switch-slider {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .bss-switch-input:disabled + .bss-switch-slider {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .bss-switch-label:hover .bss-switch-slider:not(:disabled) {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          @media (max-width: 640px) {
            .bss-switch-container {
              padding: 16px;
            }
            .switch-label-text {
              font-size: 14px;
            }
            .bss-switch-wrapper {
              width: 48px;
              height: 28px;
            }
            .bss-switch-slider:before {
              height: 20px;
              width: 20px;
              left: 4px;
              bottom: 4px;
            }
            .bss-switch-input:checked + .bss-switch-slider:before {
              transform: translateX(20px);
            }
          }
        </style>
      `,
      attributes: { class: 'bss-switch-element' },
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
    });

    // Component selection handler - REPLACE EXISTING
    editor.on('component:selected', (component) => {
      // Clear all selections first
      const canvasDocument = getDaySelectorDocument(editor);
      canvasDocument.querySelectorAll('.day-selector-display-widget, .day-selector-widget-element').forEach(el => {
        el.classList.remove('selected');
      });
      
      const element = component.getEl();
      const componentType = component.get('type');
      const componentClass = component.get('attributes')?.class;
      
      console.log('Component selected:', componentType, componentClass);
      console.log('Element classes:', element?.className);
      
      if (element && (
        element.classList.contains('day-selector-widget-element') || 
        element.classList.contains('day-selector-display-widget') ||
        componentType === 'day-selector-widget' ||
        componentClass?.includes('day-selector-widget-element')
      )) {
        
        // Generate unique ID if not exists
        let componentId = element.getAttribute('data-component-id');
        if (!componentId) {
          componentId = `day-selector-${Date.now()}`;
          element.setAttribute('data-component-id', componentId);
        }
        
        // Ensure both classes are present
        element.classList.add('day-selector-display-widget');
        element.classList.add('day-selector-widget-element');
        
        // Update states
        setSelectedDaySelectorId(componentId);
        setSelectedComponentElement(element);
        setDaySelectorInitialSelection(parseDaySelectionFromElement(element));
        
        // Visual feedback
        element.classList.add('selected');
        
        console.log('✅ Day selector selected:', componentId);
      } else {
        setSelectedDaySelectorId(null);
        setSelectedComponentElement(null);
        setDaySelectorInitialSelection([]);
      }
    });

    // Component add handler - REPLACE EXISTING  
    editor.on('component:add', (component) => {
      const componentClass = component.get('attributes')?.class;
      const componentType = component.get('type');
      
      console.log('🆕 Component added:', componentType, componentClass);
      
      if (componentClass?.includes('day-selector-widget-element') || 
          componentType === 'day-selector-widget') {
        console.log('🆕 Day selector component added');
        
        setTimeout(() => {
          const element = component.getEl();
          if (element) {
            // Auto-generate ID
            const componentId = `day-selector-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            element.setAttribute('data-component-id', componentId);
            
            // Add both classes to ensure detection
            element.classList.add('day-selector-display-widget');
            element.classList.add('day-selector-widget-element');
            
            // Auto-select the new component
            setTimeout(() => {
              editor.select(component);
              setSelectedDaySelectorId(componentId);
              setSelectedComponentElement(element);
              setDaySelectorInitialSelection(parseDaySelectionFromElement(element));
              element.classList.add('selected');
              console.log('✅ Auto-selected new component:', componentId);
              console.log('Element classes:', element.className);
            }, 100);
          }
        }, 200);
      }
    });

    // Function to initialize day selector widget
    const initializeDaySelectorWidget = (widgetElement) => {
      if (!widgetElement) {
        console.log('Day selector widget initialized');
        return;
      }
      console.log('Day selector widget initialized:', widgetElement);
    };

    // Auto-update day selector components
    const setupAutoUpdateDaySelectors = () => {
      const updateDaySelectors = () => {
        const canvasDocument = getDaySelectorDocument(editor);
        const dayComponents = canvasDocument.querySelectorAll('.day-selector-display-widget');
        dayComponents.forEach(component => {
          const selection = parseDaySelectionFromElement(component);
          if (!selection.length) return;
          const refreshedSelection = selection.map(item => ({
            day: item.day,
            date: getUpcomingDateForDay(item.day)
          }));
          applyDaySelectionToDomElement(component, refreshedSelection);
        });
      };
      
      // Update every minute
      setInterval(updateDaySelectors, 60000);
      // Update on page load
      setTimeout(updateDaySelectors, 200);
    };

    // Initialize auto-update
    setupAutoUpdateDaySelectors();

    // Direct DOM update function for day selector
    window.updateDaySelectorDirectly = (selectionPayload, legacyRecentDate) => {
      console.log('Direct DOM update called with:', selectionPayload);
      const normalizedSelection = normalizeDaySelection(selectionPayload, legacyRecentDate);
      if (!normalizedSelection.length) return 0;
      
      const canvasDocument = getDaySelectorDocument(editor);
      const dayComponents = canvasDocument.querySelectorAll('.day-selector-display-widget');
      console.log('Found day components for direct update:', dayComponents.length);
      
      dayComponents.forEach((component) => {
        const applied = applyDaySelectionToDomElement(component, normalizedSelection);
        syncDaySelectorComponentModel(component, applied, editor);
      });
      
      return dayComponents.length;
    };

    // Function to update day selector widget
    window.updateDaySelectorWidget = (selectionPayload, legacyRecentDate) => {
      console.log('Updating day selector widgets with:', selectionPayload);
      const normalizedSelection = normalizeDaySelection(selectionPayload, legacyRecentDate);
      if (!normalizedSelection.length) return;
      
      const canvasDocument = getDaySelectorDocument(editor);
      const widgets = canvasDocument.querySelectorAll(
        '.day-selector-widget-element, .day-selector-display, .day-selector-display-widget, [data-selected-day], .day-info-content'
      );
      
      console.log('Found widgets:', widgets.length);
      
      widgets.forEach((widget, index) => {
        console.log(`Updating widget ${index}:`, widget);
        const applied = applyDaySelectionToDomElement(widget, normalizedSelection);
        syncDaySelectorComponentModel(widget, applied, editor);
      });
      
      if (window.editor || editorInstance) {
        const activeEditor = window.editor || editorInstance;
        const components = activeEditor.DomComponents.getComponents();
        
        components.forEach(component => {
          const componentEl = component.getEl();
          if (componentEl && (
            componentEl.classList.contains('day-selector-widget-element') ||
            componentEl.classList.contains('day-selector-display') ||
            componentEl.classList.contains('day-selector-display-widget')
          )) {
            console.log('Updating GrapesJS component:', component);
            applyDaySelectionToDomElement(componentEl, normalizedSelection);
            component.addAttributes({
              'data-selected-day': normalizedSelection[0]?.day || '',
              'data-recent-date': normalizedSelection[0]?.date || '',
              'data-selected-days': JSON.stringify(normalizedSelection)
            });
          }
        });
        
        activeEditor.trigger('change:canvas');
      }
    };

    addLandingPageComponents(editor, user?.name || 'guest');

    // Initialize form handlers
    initializeDirectFormHandlers();

    // FIXED: Wait for iframe to be fully ready
    const waitForIframe = (callback, maxAttempts = 10) => {
      let attempts = 0;
      
      const checkIframe = () => {
        attempts++;
        const iframe = editor.Canvas.getFrameEl();
        
        if (iframe && iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.head) {
          console.log(`✅ Iframe ready after ${attempts} attempts`);
          callback();
        } else if (attempts < maxAttempts) {
          console.log(`⏳ Waiting for iframe... (attempt ${attempts}/${maxAttempts})`);
          setTimeout(checkIframe, 100);
        } else {
          console.error('❌ Iframe not ready after max attempts');
        }
      };
      
      checkIframe();
    };

    // SIMPLIFIED CSS injection function following Funnel.js approach
    const injectPageCSS = (page, forceRefresh = false) => {
      if (!page) {
        console.warn('⚠️ No page provided to injectPageCSS');
        return;
      }
      
      const pageCss = page.get('_savedCss') || window.pageCssMap?.[page.id] || '';
      
      if (!pageCss || !pageCss.trim()) {
        console.log('⚠️ No CSS to inject for page:', page.get('name'));
        return;
      }
      
      console.log(`🎨 Injecting PAGE-SPECIFIC CSS for: ${page.get('name')} (${pageCss.length} chars)`);
      console.log(`   CSS preview: ${pageCss.substring(0, 100)}...`);
      
      const doInject = () => {
        try {
          const iframe = editor.Canvas.getFrameEl();
          if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) {
            console.warn('❌ Iframe not accessible');
            return false;
          }
          
          const iframeDoc = iframe.contentWindow.document;
          
          // Remove existing page styles if force refresh
          if (forceRefresh) {
            const existingStyles = iframeDoc.querySelectorAll('style[data-page-css]');
            existingStyles.forEach(style => style.remove());
            console.log(`🗑️ Removed ${existingStyles.length} existing style tags`);
          }
          
          // Check if CSS already exists
          const existingStyle = iframeDoc.querySelector('style[data-page-css]');
          if (existingStyle && !forceRefresh) {
            console.log('✅ CSS already exists, skipping injection');
            return true;
          }
          
          // SIMPLIFIED: Just inject the CSS directly like Funnel.js does
          const styleTag = iframeDoc.createElement('style');
          styleTag.setAttribute('data-page-css', 'true');
          styleTag.setAttribute('data-page-id', page.id);
          styleTag.setAttribute('type', 'text/css');
          
          // Set CSS content directly (browser will handle @import statements)
          styleTag.textContent = pageCss;
          
          // Insert at the beginning of head (highest priority)
          if (iframeDoc.head.firstChild) {
            iframeDoc.head.insertBefore(styleTag, iframeDoc.head.firstChild);
          } else {
            iframeDoc.head.appendChild(styleTag);
          }
          
          // CRITICAL: For VSL templates, override display:none for editor preview
          if (pageCss.includes('vsl') || pageCss.includes('VSL')) {
            console.log('🎬 VSL CSS detected - overriding display:none for editor');
            
            // Add CSS override for VSL content visibility in editor
            const overrideStyle = iframeDoc.createElement('style');
            overrideStyle.setAttribute('data-vsl-editor-override', 'true');
            overrideStyle.textContent = `
              /* VSL Editor Override - Show all content in editor */
              .cta-section, .learn-section, #firstCta, #socialProof, #finalCta, #valueReinforcement {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
              }
              
              /* Show progress as completed in editor */
              .vsl-progress-fill {
                width: 100% !important;
              }
              
              .vsl-progress-text {
                content: "100%" !important;
              }
            `;
            iframeDoc.head.appendChild(overrideStyle);
            console.log('✅ VSL editor override CSS added');
          }
          
          console.log('✅ CSS injected successfully into iframe');
          console.log('   First 100 chars:', pageCss.substring(0, 100).replace(/\s+/g, ' '));
          return true;
        } catch (e) {
          console.error('❌ CSS injection failed:', e.message);
          return false;
        }
      };
      
      // Wait for iframe if not immediately available
      const iframe = editor.Canvas.getFrameEl();
      if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) {
        console.log('⏳ Iframe not ready, waiting...');
        waitForIframe(doInject);
      } else {
        doInject();
      }
    };

    // FIXED: Add frame load listener (more reliable than canvas:load)
    editor.on('canvas:frame:load', (iframe) => {
      console.log('🖼️ Canvas frame loaded');
      
      setTimeout(() => {
        const currentPage = editor.Pages.getSelected();
        if (currentPage) {
          console.log('🎨 Frame loaded - injecting CSS for:', currentPage.get('name'));
          injectPageCSS(currentPage, true);
          
          setTimeout(() => {
            injectPageJS(currentPage);
          }, 100);
        }
      }, 200);
    });

    // FIXED: Add canvas load listener to inject CSS (backup)
    editor.on('canvas:load', () => {
      console.log('🖼️ Canvas loaded');
      
      setTimeout(() => {
        const currentPage = editor.Pages.getSelected();
        if (currentPage) {
          injectPageCSS(currentPage, false);
        }
      }, 200);
    });

    // FIXED: Robust JS injection function
    const injectPageJS = (page) => {
      if (!page) return;
      
      const pageJs = page.get('_savedJs') || window.pageJsMap?.[page.id] || '';
      
      if (!pageJs || !pageJs.trim()) {
        console.log('⚠️ No JS to inject for page:', page.get('name'));
        return;
      }
      
      console.log(`📜 Injecting JS for: ${page.get('name')} (${pageJs.length} chars)`);
      
      try {
        // Set JS on page object (GrapesJS will handle execution)
        page.set('script', pageJs);
        
        // Also inject into iframe for immediate execution
        const iframe = editor.Canvas.getFrameEl();
        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
          const iframeDoc = iframe.contentWindow.document;
          
          // Remove existing page scripts
          const existingScripts = iframeDoc.querySelectorAll('script[data-page-js]');
          existingScripts.forEach(script => script.remove());
          
          // CRITICAL: For VSL templates, show content immediately in editor
          if (pageJs.includes('vslVideo') || pageJs.includes('VSL')) {
            console.log('🎬 VSL template detected - showing all content in editor');
            
            // Show all hidden content in editor
            const hiddenElements = iframeDoc.querySelectorAll('[style*="display: none"], [style*="display:none"]');
            hiddenElements.forEach(element => {
              element.style.display = 'block';
              console.log('✅ Showed hidden element:', element.id || element.className);
            });
            
            // Set initial video progress to 100% for editor preview
            const progressFill = iframeDoc.getElementById('statusFill');
            const progressText = iframeDoc.getElementById('progressText');
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
          }
          
          // Create and inject new script tag
          const scriptTag = iframeDoc.createElement('script');
          scriptTag.setAttribute('data-page-js', 'true');
          scriptTag.setAttribute('data-page-id', page.id);
          scriptTag.textContent = pageJs;
          iframeDoc.body.appendChild(scriptTag);
          
          console.log('✅ JS injected and executing in iframe');
        }
        
        return true;
      } catch (e) {
        console.error('❌ JS injection failed:', e.message);
        return false;
      }
    };

    // FIXED: Add page change listener to re-inject CSS/JS and save changes
    editor.on('page:select', (page) => {
      console.log('📄 Page selected:', page.get('name'), 'ID:', page.id);
      
      // Save current page CSS/JS before switching (if any)
      const previousPage = editor.Pages.getAllWrapper()?.find(p => p !== page);
      if (previousPage) {
        const prevCss = extractPageCSS(editor, previousPage.id);
        const prevJs = previousPage.get('script') || '';
        previousPage.set('_savedCss', prevCss);
        previousPage.set('_savedJs', prevJs);
        console.log(`💾 Auto-saved CSS/JS for: ${previousPage.get('name')}`);
      }
      
      // Re-inject CSS and JS for this page
      setTimeout(() => {
        // Inject CSS using the robust function
        injectPageCSS(page, true);
        
        // Inject JS using the robust function
        setTimeout(() => {
          injectPageJS(page);
          
          // Trigger canvas refresh
          editor.trigger('change:canvas');
        }, 100);
      }, 150);
    });

    setTimeout(() => {
      // Add null check for editor.Pages
      if (editor && editor.Pages) {
        const pageToSelect = editor.Pages.get(stageId) || editor.Pages.getAll().find(p => {
          const pageId = p.id;
          return stages.some(s => (s._id === pageId) || (s.pageId === pageId) || (s.id === pageId));
        });
        if (pageToSelect) {
          editor.Pages.select(pageToSelect);
          
          // FIXED: Manually trigger CSS/JS injection for initial page
          setTimeout(() => {
            injectPageCSS(pageToSelect, true);
            
            setTimeout(() => {
              injectPageJS(pageToSelect);
              editor.runCommand('canvas:reload');
            }, 150);
          }, 400);
        } else if (editor.Pages.getAll && editor.Pages.getAll().length > 0) {
          const firstPage = editor.Pages.getAll()[0];
          editor.Pages.select(firstPage);
          
          // FIXED: Inject CSS/JS for first page
          setTimeout(() => {
            injectPageCSS(firstPage, true);
            
            setTimeout(() => {
              injectPageJS(firstPage);
              editor.runCommand('canvas:reload');
            }, 150);
          }, 400);
        }
      } else {
        console.warn('Editor or Pages manager not available yet');
      }
      
      console.log('✅ Editor initialization completed');
      
      // Fallback: Hide loading after 8 seconds as safety measure
      setTimeout(() => {
        setIsEditorLoading(false);
      }, 8000);
      
      // Initialize auto-update for day selectors
      setupAutoUpdateDaySelectors();

      if (selectedRedirectPage) {
        updateDirectFormsRedirect(editor, selectedRedirectPage);
      }

      // Initial form detection
      setTimeout(detectFormsOnPage, 200);
      
      // Auto-scroll to form if coming from landing page
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const scrollToForm = urlParams.get('scrollToForm') || sessionStorage.getItem('scrollToForm');
        
        if (scrollToForm === 'true') {
          console.log('🔄 Auto-scrolling to form...');
          const formElement = document.querySelector('.bss-direct-form-container, .bss-direct-form-v2-container');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('✅ Scrolled to form');
            // Clear the flag
            sessionStorage.removeItem('scrollToForm');
          }
        }
      }, 2000);
      
      // FIXED: Add periodic form initialization to catch any missed forms
      setInterval(() => {
        const uninitializedForms = document.querySelectorAll('.bss-direct-form:not([data-initialized]), .bss-direct-form-v2:not([data-initialized])');
        if (uninitializedForms.length > 0) {
          console.log(`🔧 Found ${uninitializedForms.length} uninitialized forms, reinitializing...`);
          initializeDirectFormHandlers();
        }
      }, 3000);
      
      // FIXED: Periodic CSS check and re-injection if needed
      const cssCheckInterval = setInterval(() => {
        const currentPage = editor.Pages?.getSelected();
        if (currentPage) {
          const iframe = editor.Canvas.getFrameEl();
          if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
            const iframeDoc = iframe.contentWindow.document;
            const hasPageCss = iframeDoc.querySelector('style[data-page-css]');
            
            // Check if CSS is missing
            if (!hasPageCss) {
              console.log('⚠️ CSS missing, re-injecting...');
              injectPageCSS(currentPage, true);
            }
          }
        }
      }, 5000);
      
      // Store interval ID for cleanup
      window.cssCheckInterval = cssCheckInterval;

      // FIXED: Periodic check to ensure GrapesJS sidebar stays visible
      const rightSidebarCheckInterval = setInterval(() => {
        applyToolsPanelPlacement();
      }, 2000);
      
      // Store interval ID for cleanup
      window.rightSidebarCheckInterval = rightSidebarCheckInterval;
    }, 500);

  }, []); // Empty dependencies to prevent re-initialization

  // Define generateInitialProject BEFORE the useEffect that uses it
  const generateInitialProject = useCallback(() => {
    if (!contentData || !stages || stages.length === 0) {
      console.warn('⚠️ generateInitialProject called without data');
      return { pages: [], css: '' };
    }

    const savedProjectData = contentData?.projectData || null;
    const hasSavedPages = savedProjectData && 
      savedProjectData.pages && 
      Array.isArray(savedProjectData.pages) && 
      savedProjectData.pages.length > 0;

    console.log('🔧 generateInitialProject called');
    console.log('   Has saved pages:', hasSavedPages);
    console.log('   Stages count:', stages?.length);

    const createPageFromTemplate = (stage) => {
      const stageId = stage._id || stage.pageId || stage.id;
      
      // If stage already has HTML/CSS/JS, use it
      if (stage.html && stage.html.trim()) {
        return {
          id: stageId,
          name: stage.name,
          component: stage.html,
          styles: stage.css || '',
          script: stage.js || '',
          basicInfo: stage.basicInfo || {},
          redirectPage: stage.basicInfo?.redirectPage || ''
        };
      }
      
      const isCustom = stage.type === 'custom-page';
      const config = isCustom ? 
        (contentData?.customStagesConfig?.[stageId] || null) : 
        (contentData?.stagesConfig?.[stage.type] || null);

      const templateSet = {
        'welcome-page': templates.welcomeTemplates,
        'vsl-page': templates.vslTemplates,
        'thankyou-page': templates.thankyouTemplates,
        'whatsapp-page': templates.whatsappTemplates,
        'product-offer': templates.productOfferTemplates,
        'custom-page': templates.miscTemplates,
        'appointment-page': templates.appointmentTemplates,
        'payment-page': templates.paymentTemplates,
      }[stage.type];

      const templateKey = config?.selectedTemplateKey;
      let template = (templateKey && templateSet && templateSet[templateKey]) ? 
        templateSet[templateKey] : 
        (templateSet ? Object.values(templateSet)[0] : null);

      if (!template) {
        return {
          id: stageId,
          name: stage.name,
          component: `<h1>${stage.name}</h1><p>Template not configured for this stage type.</p>`,
          styles: '',
          script: '',
          basicInfo: stage.basicInfo || {},
          redirectPage: stage.basicInfo?.redirectPage || ''
        };
      }

      // FIXED: Inject localStorage integration for appointment templates and coach ID for VSL templates
      let templateHtml = template.html || `<h1>${stage.name}</h1><p>Template content not found.</p>`;
      let templateJs = typeof template.js === 'function' ? template.js.toString() : template.js || '';

      // If it's a VSL page, inject coach ID
      if (stage.type === 'vsl-page' && templateJs) {
        // Replace default-coach-id with real coach ID
        const realCoachId = coachId || 'default-coach-id';
        templateJs = templateJs.replace(/coachId.*=.*['"`]default-coach-id['"`]/g, `coachId: '${realCoachId}'`);
        templateJs = templateJs.replace(/coachId.*=.*['"`]default-coach-id['"`]/g, `coachId: '${realCoachId}'`);
        console.log('🔧 Injected coach ID into VSL template:', realCoachId);
      }

      // If it's an appointment page, inject localStorage integration
      if (stage.type === 'appointment-page') {
        // Add localStorage initialization script to appointment templates
        const appointmentScript = `
// FIXED: Enhanced localStorage integration for appointment forms
(function() {
  console.log('🔧 Initializing appointment system with localStorage integration...');
  
  // Get stored data
  const storedCoachId = localStorage.getItem('coachId');
  const storedLeadId = localStorage.getItem('leadId');
  const storedLeadName = localStorage.getItem('leadName');
  const storedFirstName = localStorage.getItem('firstName');
  
  console.log('📊 Stored Data Check:');
  console.log('CoachId from localStorage:', storedCoachId);
  console.log('LeadId from localStorage:', storedLeadId);
  console.log('LeadName from localStorage:', storedLeadName);
  console.log('FirstName from localStorage:', storedFirstName);
  
  // Set global variables for appointment system
  if (storedCoachId) {
    window.appointmentCoachId = storedCoachId;
    console.log('✅ Set global appointmentCoachId:', storedCoachId);
  }
  
  // Listen for localStorage updates
  window.addEventListener('leadDataStored', function(e) {
    console.log('📢 LeadData stored event received:', e.detail);
    if (e.detail.coachId) {
      window.appointmentCoachId = e.detail.coachId;
    }
    // Reinitialize appointment system if available
    if (typeof window.initializeBookingSystem === 'function') {
      window.initializeBookingSystem();
    }
  });
  
  // Auto-fill forms when page loads
  const fillAppointmentForms = () => {
    // Fill leadId in appointment forms
    const leadIdInputs = document.querySelectorAll('input[name="leadId"], #leadId');
    leadIdInputs.forEach(input => {
      if (storedLeadId && !input.value) {
        input.value = storedLeadId;
        console.log('✅ Auto-filled leadId in appointment form:', storedLeadId);
      }
    });
    
    // Fill leadName in appointment forms
    const leadNameInputs = document.querySelectorAll('input[name="leadName"], #leadName');
    leadNameInputs.forEach(input => {
      if (storedLeadName && !input.value) {
        input.value = storedLeadName;
        console.log('✅ Auto-filled leadName in appointment form:', storedLeadName);
      }
    });
    
    // Fill firstName in appointment forms
    const firstNameInputs = document.querySelectorAll('input[name="firstName"], #firstName');
    firstNameInputs.forEach(input => {
      if (storedFirstName && !input.value) {
        input.value = storedFirstName;
        console.log('✅ Auto-filled firstName in appointment form:', storedFirstName);
      }
    });
    
    // Set coachId for appointment system
    if (storedCoachId && !window.appointmentCoachId) {
      window.appointmentCoachId = storedCoachId;
      console.log('✅ Set appointmentCoachId from localStorage:', storedCoachId);
    }
  };
  
  // Execute on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillAppointmentForms);
  } else {
    fillAppointmentForms();
  }
  
  // Execute periodically to catch dynamic forms
  setTimeout(fillAppointmentForms, 200);
  setTimeout(fillAppointmentForms, 400);
  setTimeout(fillAppointmentForms, 600);
})();
`;
        
        // Prepend the localStorage script to the existing template JS
        templateJs = appointmentScript + '\n\n' + templateJs;
      }

      return {
        id: stageId,
        name: stage.name,
        component: templateHtml,
        styles: template.css || '',
        script: templateJs,
        basicInfo: stage.basicInfo || config?.basicInfo || {},
        redirectPage: stage.basicInfo?.redirectPage || config?.redirectPage || ''
      };
    };

    let pages;
    let globalCss = '';

    if (hasSavedPages) {
      console.log('✅ Using saved pages from project data');
      globalCss = savedProjectData.globalCss || '';
      pages = stages.map(stage => {
        const stageId = stage._id || stage.pageId || stage.id;
        const savedPage = savedProjectData.pages.find(p => p.id === stageId);
        if (savedPage) {
          console.log(`   Loading saved page: ${savedPage.name}`);
          console.log(`     - HTML: ${savedPage.html?.length || 0} chars`);
          console.log(`     - CSS: ${savedPage.css?.length || 0} chars`);
          console.log(`     - JS: ${savedPage.js?.length || 0} chars`);
          return {
            id: stageId,
            name: savedPage.name || stage.name,
            component: savedPage.html,
            styles: savedPage.css || '',
            script: savedPage.js || '',
            basicInfo: savedPage.basicInfo || stage.basicInfo || {},
            redirectPage: savedPage.redirectPage || stage.basicInfo?.redirectPage || ''
          };
        } else {
          console.log(`   Creating new page from template: ${stage.name}`);
          return createPageFromTemplate(stage);
        }
      });
    } else {
      console.log('⚠️ No saved pages, using stage data or creating from templates');
      pages = stages.map(stage => createPageFromTemplate(stage));
    }

    console.log('📦 Final project data:');
    console.log(`   Total pages: ${pages.length}`);
    console.log(`   Global CSS: ${globalCss.length} chars`);

    return {
      pages,
      css: globalCss
    };
  }, [stages, contentData, coachId]);

  useEffect(() => {
    // Wait for data to load before initializing
    if (!contentData || !stages || stages.length === 0) {
      console.log('⏳ Waiting for funnel data to load...');
      return;
    }

    // Prevent multiple initializations
    if (editorInitializedRef.current && forceRefreshKey === 0) {
      console.log('⚠️ Editor already initialized, skipping...');
      return;
    }

    console.log('🚀 Initializing GrapesJS editor...');
    setIsEditorLoading(true);
    editorInitializedRef.current = true;

    // FIXED: Generate project data ONCE and cache it
    if (!projectDataRef.current || forceRefreshKey > 0) {
      projectDataRef.current = generateInitialProject();
      console.log('📦 Generated fresh project data');
    }
    const projectData = projectDataRef.current;
    
    if (!projectData || !projectData.pages || projectData.pages.length === 0) {
      console.error('❌ No project data available');
      setIsEditorLoading(false);
      return;
    }
    console.log('📦 Using project data:', {
      pagesCount: projectData.pages?.length,
      globalCssLength: projectData.css?.length
    });

    // Initialize GrapesJS editor (free version)
    const editor = grapesjs.init({
      container: '#gjs',
      height: '100%',
      width: '100%',
      fromElement: false,
      storageManager: false, // Disable built-in storage, handle manually
      assetManager: {
        assets: assets.map(asset => ({
          ...asset,
          src: asset.src.startsWith('/') ? asset.src : `/${asset.src}`
        })),
        upload: `${API_BASE_URL}/api/assets`,
        uploadFile: async (e) => {
          const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
          try {
            const uploaded = await uploadFiles(files);
            return uploaded.map(asset => ({
              ...asset,
              src: asset.src.startsWith('/') ? asset.src : `/${asset.src}`
            }));
          } catch (err) {
            console.error(err);
            throw err;
          }
        },
        multiUpload: true,
      },
      plugins: [
        gjsPresetWebpage,
        gjsCountdown,
        gjsTabs,
        gjsCustomCode,
        gjsTooltip,
        gjsTyped,
        gjsNavbar,
        gjsBlocksBasic,
        // 🆕 NEW FREE PLUGINS (100% FREE - NO TOKEN REQUIRED)
        gjsStyleGradient,
        gjsPluginExport,
      ],
      pluginsOpts: {
        'gjs-preset-webpage': {},
        // 🆕 GRADIENT STYLING - Beautiful color gradients (FREE)
        'grapesjs-style-gradient': {
          colorPicker: 'default',
          grapickOpts: {},
        },
        // 🆕 EXPORT FEATURE - Download as ZIP (FREE)
        'grapesjs-plugin-export': {
          addExportBtn: true,
          btnLabel: '📦 Export ZIP',
          filenamePfx: 'funnel_template',
          filename: (editor) => {
            const pageName = editor.Pages?.getSelected()?.get('name') || 'page';
            return `${pageName.toLowerCase().replace(/\s+/g, '_')}_export`;
          },
          root: {
            css: {
              'style.css': (editor) => editor.getCss(),
            },
            js: {
              'script.js': (editor) => editor.getJs(),
            },
            'index.html': (editor) => {
              const page = editor.Pages.getSelected();
              const html = page ? page.getMainComponent().toHTML() : '';
              const css = editor.getCss();
              const js = editor.getJs();
              return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page?.get('name') || 'Funnel Page'}</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>`;
            }
          }
        },
      },
      canvas: {
        styles: [],
        scripts: [],
      },
    });

    // FIXED: Store page CSS/JS in a map for later use
    const pageCssMap = {};
    const pageJsMap = {};
    
    projectData.pages.forEach((pageData) => {
      pageCssMap[pageData.id] = pageData.styles || '';
      pageJsMap[pageData.id] = pageData.script || '';
    });
    
    // Store in window for access in event handlers
    window.pageCssMap = pageCssMap;
    window.pageJsMap = pageJsMap;

    // FIXED: Manually add pages with proper CSS/JS injection
    projectData.pages.forEach((pageData, index) => {
      console.log(`📄 Adding page ${index + 1}:`, pageData.name);
      console.log(`   HTML length: ${pageData.component?.length || 0} chars`);
      console.log(`   CSS length: ${pageData.styles?.length || 0} chars`);
      console.log(`   JS length: ${pageData.script?.length || 0} chars`);
      
      const page = editor.Pages.add({
        id: pageData.id,
        name: pageData.name,
        component: pageData.component || '',
      });

      // FIXED: Store CSS/JS in page attributes for later retrieval (following Funnel.js approach)
      page.set('_savedCss', pageData.styles || '');
      page.set('_savedJs', pageData.script || '');
      
      // CRITICAL: Also set the styles attribute for GrapesJS compatibility
      page.set('styles', pageData.styles || '');
      page.set('script', pageData.script || '');

      // FIXED: Properly inject JS for the page
      if (pageData.script && pageData.script.trim()) {
        try {
          // Store script in page data
          page.set('script', pageData.script);
          console.log(`✅ Set JS script for page:`, pageData.name);
        } catch (error) {
          console.error('Error setting JS for page:', pageData.name, error);
        }
      }

      // Store basic info and redirect page
      if (pageData.basicInfo) {
        page.set('basicInfo', pageData.basicInfo);
      }
      if (pageData.redirectPage) {
        page.set('redirectPage', pageData.redirectPage);
      }
    });

    // CRITICAL: Immediately inject CSS for the first page after creation
    setTimeout(() => {
      const firstPage = editor.Pages.getAll()[0];
      if (firstPage) {
        console.log('🚀 Immediately injecting CSS for first page:', firstPage.get('name'));
        injectPageCSS(firstPage, true);
        injectPageJS(firstPage);
        
        // CRITICAL: For VSL pages, show all content immediately in editor
        const pageJs = firstPage.get('_savedJs') || firstPage.get('script') || '';
        if (pageJs.includes('vslVideo') || pageJs.includes('VSL')) {
          console.log('🎬 VSL page detected - applying immediate content visibility fix');
          
          setTimeout(() => {
            const iframe = editor.Canvas.getFrameEl();
            if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
              const iframeDoc = iframe.contentWindow.document;
              
              // Show all hidden VSL content
              const hiddenElements = iframeDoc.querySelectorAll('[style*="display: none"], [style*="display:none"]');
              hiddenElements.forEach(element => {
                element.style.display = 'block';
                element.style.opacity = '1';
                element.style.visibility = 'visible';
              });
              
              // Set video progress to 100%
              const progressFill = iframeDoc.getElementById('statusFill');
              const progressText = iframeDoc.getElementById('progressText');
              if (progressFill) progressFill.style.width = '100%';
              if (progressText) progressText.textContent = '100%';
              
              console.log('✅ VSL content made visible in editor');
            }
          }, 1000);
        }
      }
    }, 500);

    // REMOVED: Don't add page-specific CSS to global CSS
    // Each page will inject its own CSS via injectPageCSS function
    console.log('ℹ️ Skipping global CSS injection - using page-specific CSS injection instead');
    
    // Only add truly global CSS (if any exists)
    if (projectData.css && projectData.css.trim()) {
      console.log(`🎨 Global CSS available but not injecting to avoid conflicts (${projectData.css.length} chars)`);
      // Note: Page-specific CSS is injected via injectPageCSS function for each page
    }

    // Call onEditorReady after a small delay to ensure editor is fully initialized
    setTimeout(() => {
      onEditorReady(editor);
    }, 100);

    // Add Copy, Duplicate, and Delete Functions - FIXED TO WORK PROPERLY!
    setTimeout(() => {
      // Handle Copy - Works for component level
      const handleCopy = () => {
        try {
          // First check if text is selected (RTE mode)
          const iframe = editor.Canvas.getFrameEl();
          if (iframe && iframe.contentWindow) {
            const iframeDoc = iframe.contentWindow.document;
            const selection = iframeDoc.getSelection();
            if (selection && selection.toString().trim()) {
              window.copiedText = selection.toString();
              console.log('✅ Text copied:', window.copiedText);
              return;
            }
          }

          // Otherwise copy component
          const selected = editor.getSelected();
          if (!selected) {
            console.warn('No component selected');
            return;
          }
          
          const cloned = selected.clone();
          window.copiedComponent = cloned;
          console.log('✅ Component copied');
        } catch (error) {
          console.error('Copy error:', error);
        }
      };

      // Handle Duplicate - FIXED: Proper parent access
      const handleDuplicate = () => {
        try {
          // First check if text is selected (RTE mode)
          const iframe = editor.Canvas.getFrameEl();
          if (iframe && iframe.contentWindow) {
            const iframeDoc = iframe.contentWindow.document;
            const selection = iframeDoc.getSelection();
            if (selection && selection.toString().trim()) {
              const text = selection.toString();
              const range = selection.getRangeAt(0);
              const clonedText = iframeDoc.createTextNode(text);
              range.insertNode(clonedText);
              range.setStartAfter(clonedText);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
              console.log('✅ Text duplicated');
              return;
            }
          }

          // Otherwise duplicate component
          const selected = editor.getSelected();
          if (!selected) {
            console.warn('No component selected');
            return;
          }

          // Get the direct parent component - this is where the duplicate will be added
          const parent = selected.parent();
          
          if (!parent) {
            console.warn('No parent found for component');
            return;
          }
          
          // Get parent's components collection
          const components = parent.components();
          
          if (!components) {
            console.warn('Parent has no components collection');
            return;
          }
          
          // Find the index of selected component in parent's children
          let index = -1;
          try {
            index = components.indexOf(selected);
          } catch (e) {
            // Fallback: manually find index
            const compsArray = [];
            components.each((comp) => compsArray.push(comp));
            index = compsArray.findIndex(c => c === selected);
          }
          
          if (index === -1) {
            console.warn('Could not find component index in parent, adding to end');
            const cloned = selected.clone();
            components.add(cloned);
            editor.select(cloned);
            editor.trigger('change:canvas');
            return;
          }
          
          // Clone the component - this creates a clean copy without nested structure
          const cloned = selected.clone();
          
          // Add cloned component at index + 1 (right after original, same level)
          // Using GrapesJS's add method with 'at' option ensures proper insertion at same level
          components.add(cloned, { at: index + 1 });
          
          // Select the cloned component
          editor.select(cloned);
          
          // Trigger canvas update to refresh the view
          editor.trigger('change:canvas');
          editor.trigger('component:update', cloned);
          
          console.log('✅ Component duplicated at same level (parent:', parent.get('type') || 'unknown', ', index:', index, '->', index + 1, ')');
        } catch (error) {
          console.error('Duplicate error:', error);
        }
      };

      // Handle Delete - Works for component level
      const handleDelete = () => {
        try {
          // First check if text is selected (RTE mode)
          const iframe = editor.Canvas.getFrameEl();
          if (iframe && iframe.contentWindow) {
            const iframeDoc = iframe.contentWindow.document;
            const selection = iframeDoc.getSelection();
            if (selection && selection.toString().trim()) {
              selection.deleteFromDocument();
              editor.trigger('change:canvas');
              console.log('✅ Text deleted');
              return;
            }
          }

          // Otherwise delete component
          const selected = editor.getSelected();
          if (!selected) {
            console.warn('No component selected');
            return;
          }
          
          // Store parent before deletion
          const parent = selected.parent();
          
          // Remove the component
          selected.remove();
          
          // Trigger updates
          editor.trigger('change:canvas');
          if (parent) {
            editor.trigger('component:update', parent);
          }
          
          console.log('✅ Component deleted');
        } catch (error) {
          console.error('Delete error:', error);
        }
      };

      // Register commands
      editor.Commands.add('component-copy', { run: handleCopy });
      editor.Commands.add('component-duplicate', { run: handleDuplicate });
      editor.Commands.add('component-delete', { run: handleDelete });

      // Add buttons to Commands Panel (appears for ALL components) - Header Theme
      const addButtonsToCommandsPanel = () => {
        let commandsPanel = document.querySelector('.gjs-cm');
        
        // If commands panel doesn't exist, try to find or create it
        if (!commandsPanel) {
          console.log('❌ Commands panel not found, searching for alternatives...');
          // Try alternative selectors
          commandsPanel = document.querySelector('[class*="gjs-cm"]') || 
                         document.querySelector('.gjs-toolbar') ||
                         document.querySelector('[class*="commands"]');
        }
        
        if (!commandsPanel) {
          console.log('❌ Still no commands panel found');
          return;
        }
        
        if (commandsPanel.querySelector('.custom-actions-container')) {
          console.log('✅ Custom actions already exist');
          return;
        }

        console.log('🔧 Adding custom actions to commands panel');
        console.log('Commands panel found:', commandsPanel.className, commandsPanel);
        
        const container = document.createElement('div');
        container.className = 'custom-actions-container';
        container.style.cssText = 'display: flex !important; align-items: center !important; gap: 2px !important; margin-left: 8px !important; padding-left: 8px !important; border-left: 1px solid #2d2d2d !important; visibility: visible !important; opacity: 1 !important;';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'gjs-cm-btn custom-copy-btn';
        copyBtn.title = 'Copy';
        copyBtn.style.cssText = 'display: flex !important; align-items: center !important; justify-content: center !important; width: 26px !important; height: 26px !important; visibility: visible !important; opacity: 1 !important;';
        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyBtn.addEventListener('click', (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          e.stopImmediatePropagation();
          setTimeout(() => handleCopy(), 0);
        }, true);

        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'gjs-cm-btn custom-duplicate-btn';
        duplicateBtn.title = 'Duplicate';
        duplicateBtn.style.cssText = 'display: flex !important; align-items: center !important; justify-content: center !important; width: 26px !important; height: 26px !important; visibility: visible !important; opacity: 1 !important;';
        duplicateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path><path d="M9 9h6v6H9z"></path></svg>';
        duplicateBtn.addEventListener('click', (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          e.stopImmediatePropagation();
          setTimeout(() => handleDuplicate(), 0);
        }, true);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'gjs-cm-btn custom-delete-btn';
        deleteBtn.title = 'Delete';
        deleteBtn.style.cssText = 'display: flex !important; align-items: center !important; justify-content: center !important; width: 26px !important; height: 26px !important; visibility: visible !important; opacity: 1 !important;';
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        deleteBtn.addEventListener('click', (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          e.stopImmediatePropagation();
          setTimeout(() => handleDelete(), 0);
        }, true);

        container.appendChild(copyBtn);
        container.appendChild(duplicateBtn);
        container.appendChild(deleteBtn);
        commandsPanel.appendChild(container);
        console.log('✅ Custom actions added successfully');
      };

      // Handle text-level operations (when RTE toolbar is visible)
      // These now just call the main handlers which handle both text and components
      const handleTextCopy = () => {
        handleCopy();
      };

      const handleTextDuplicate = () => {
        handleDuplicate();
      };

      const handleTextDelete = () => {
        handleDelete();
      };

      // Add buttons to RTE toolbar (for text editing) - Header Theme
      const addButtonsToRTEToolbar = () => {
        const rteToolbar = document.querySelector('.gjs-rte-toolbar');
        if (!rteToolbar || rteToolbar.querySelector('.rte-custom-buttons-container')) return;

        const container = document.createElement('div');
        container.className = 'rte-custom-buttons-container';
        container.style.cssText = 'display: flex; align-items: center; gap: 2px; margin-left: 8px; padding-left: 8px; border-left: 1px solid #2d2d2d;';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'gjs-rte-toolbar-item rte-copy-btn';
        copyBtn.title = 'Copy';
        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyBtn.addEventListener('click', (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          e.stopImmediatePropagation();
          setTimeout(() => handleTextCopy(), 0);
        }, true);

        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'gjs-rte-toolbar-item rte-duplicate-btn';
        duplicateBtn.title = 'Duplicate';
        duplicateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path><path d="M9 9h6v6H9z"></path></svg>';
        duplicateBtn.addEventListener('click', (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          e.stopImmediatePropagation();
          setTimeout(() => handleTextDuplicate(), 0);
        }, true);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'gjs-rte-toolbar-item rte-delete-btn';
        deleteBtn.title = 'Delete';
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        deleteBtn.addEventListener('click', (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          e.stopImmediatePropagation();
          setTimeout(() => handleTextDelete(), 0);
        }, true);

        container.appendChild(copyBtn);
        container.appendChild(duplicateBtn);
        container.appendChild(deleteBtn);
        rteToolbar.appendChild(container);
      };

      // Watch for both toolbars
      const observer = new MutationObserver(() => {
        addButtonsToCommandsPanel();
        addButtonsToRTEToolbar();
      });

      observer.observe(document.body, { childList: true, subtree: true });
      const canvasEl = document.querySelector('#gjs');
      if (canvasEl) observer.observe(canvasEl, { childList: true, subtree: true });
      
      // Floating Toolbar for Blocks, Sections, Images, Videos (separate from text toolbar)
      let floatingToolbar = null;
      let isRTEActive = false;

      const createFloatingToolbar = () => {
        // Remove existing toolbar if any
        const existing = document.querySelector('.floating-element-toolbar');
        if (existing) existing.remove();

        // Create new floating toolbar
        floatingToolbar = document.createElement('div');
        floatingToolbar.className = 'floating-element-toolbar';
        floatingToolbar.style.cssText = `
          position: fixed;
          background: #1e1e1e;
          border: 1px solid #2d2d2d;
          border-radius: 8px;
          padding: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 10001;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        `;

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'floating-toolbar-btn floating-copy-btn';
        copyBtn.title = 'Copy';
        copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          setTimeout(() => handleCopy(), 0);
        }, true);

        // Duplicate button
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'floating-toolbar-btn floating-duplicate-btn';
        duplicateBtn.title = 'Duplicate';
        duplicateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path><path d="M9 9h6v6H9z"></path></svg>';
        duplicateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          setTimeout(() => handleDuplicate(), 0);
        }, true);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'floating-toolbar-btn floating-delete-btn';
        deleteBtn.title = 'Delete';
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          setTimeout(() => handleDelete(), 0);
        }, true);

        floatingToolbar.appendChild(copyBtn);
        floatingToolbar.appendChild(duplicateBtn);
        floatingToolbar.appendChild(deleteBtn);
        document.body.appendChild(floatingToolbar);
      };

      // Store last click position for toolbar positioning
      let lastClickX = null;
      let lastClickY = null;

      const updateFloatingToolbarPosition = (clickX = null, clickY = null) => {
        if (!floatingToolbar || isRTEActive || floatingToolbar.style.opacity === '0') {
          return;
        }

        try {
          const selected = editor.getSelected();
          if (!selected) {
            hideFloatingToolbar();
            return;
          }

          const iframe = editor.Canvas.getFrameEl();
          if (!iframe || !iframe.contentWindow) return;

          // Get component view element
          const compView = selected.getView?.();
          if (!compView || !compView.el) {
            hideFloatingToolbar();
            return;
          }

          const el = compView.el;
          const rect = el.getBoundingClientRect();
          const iframeRect = iframe.getBoundingClientRect();

          // Get layout offsets for proper positioning
          const pagesSidebarElement = document.querySelector('.pages-sidebar');
          const editorAreaElement = document.querySelector('.editor-main-area');
          const containerElement = document.querySelector('.portfolio-edit-container');
          const containerStyles = containerElement ? window.getComputedStyle(containerElement) : null;
          const toolsPanelWidth = containerStyles ? parseInt(containerStyles.getPropertyValue('--tools-panel-width'), 10) || 280 : 280;
          
          // Calculate sidebar width offset
          let sidebarOffset = 0;
          if (pagesSidebarElement && pagesSidebarElement.classList.contains('show')) {
            sidebarOffset = pagesSidebarElement.getBoundingClientRect().width || 300;
          }
          
          // Calculate tools panel offset based on side and visibility
          let toolsPanelOffset = 0;
          const isToolsPanelOpen = document.querySelector('.gjs-pn-panel.gjs-pn-views-container')?.style.opacity === '1';
          if (isToolsPanelOpen && toolsPanelSideRef.current === 'left') {
            toolsPanelOffset = toolsPanelWidth;
          }

          const toolbarHeight = 40;
          const toolbarWidth = 100;
          const spacing = 8;
          const headerHeight = 68; // Header height

          let top, left;

          // If click position is available, use it (with offset)
          if (clickX !== null && clickY !== null) {
            // Position toolbar near click position, accounting for sidebar
            left = clickX - (toolbarWidth / 2) - sidebarOffset - toolsPanelOffset;
            top = clickY - toolbarHeight - spacing;
            
            // If not enough space above, show below
            if (top < headerHeight + 10) {
              top = clickY + spacing;
            }
          } else if (lastClickX !== null && lastClickY !== null) {
            // Use stored click position
            left = lastClickX - (toolbarWidth / 2) - sidebarOffset - toolsPanelOffset;
            top = lastClickY - toolbarHeight - spacing;
            
            if (top < headerHeight + 10) {
              top = lastClickY + spacing;
            }
          } else {
            // Fallback: position relative to element, accounting for sidebar
            const elementCenterX = iframeRect.left + rect.left + (rect.width / 2);
            const elementCenterY = iframeRect.top + rect.top + (rect.height / 2);
            
            left = elementCenterX - (toolbarWidth / 2) - sidebarOffset - toolsPanelOffset;
            top = elementCenterY - toolbarHeight - spacing;
            
            // If not enough space above, show below
            if (top < headerHeight + 10) {
              top = iframeRect.top + rect.bottom + spacing;
            }
          }

          // Ensure toolbar stays within viewport and doesn't overlap with sidebar
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Adjust horizontal position if needed
          if (left < sidebarOffset + toolsPanelOffset + 10) {
            left = sidebarOffset + toolsPanelOffset + 10;
          } else if (left + toolbarWidth > viewportWidth - 10) {
            left = viewportWidth - toolbarWidth - 10;
          }
          
          // Adjust vertical position if needed
          if (top < headerHeight + 10) {
            top = headerHeight + 10;
          } else if (top + toolbarHeight > viewportHeight - 10) {
            top = viewportHeight - toolbarHeight - 10;
          }

          floatingToolbar.style.top = `${top}px`;
          floatingToolbar.style.left = `${left}px`;
        } catch (error) {
          console.error('Error updating floating toolbar position:', error);
        }
      };

      const showFloatingToolbar = (component, clickX = null, clickY = null) => {
        if (!floatingToolbar || isRTEActive) {
          if (floatingToolbar) floatingToolbar.style.opacity = '0';
          return;
        }

        try {
          const selected = editor.getSelected();
          if (!selected) {
            hideFloatingToolbar();
            return;
          }

          // Update position with click coordinates if available
          updateFloatingToolbarPosition(clickX, clickY);
          floatingToolbar.style.opacity = '1';
          floatingToolbar.style.pointerEvents = 'auto';
        } catch (error) {
          console.error('Error showing floating toolbar:', error);
        }
      };

      const hideFloatingToolbar = () => {
        if (floatingToolbar) {
          floatingToolbar.style.opacity = '0';
          floatingToolbar.style.pointerEvents = 'none';
        }
      };

      // Initialize floating toolbar
      createFloatingToolbar();

      // Add scroll and resize listeners to update toolbar position
      const updatePositionOnScroll = () => {
        if (floatingToolbar && floatingToolbar.style.opacity === '1' && !isRTEActive) {
          updateFloatingToolbarPosition();
        }
      };

      window.addEventListener('scroll', updatePositionOnScroll, true);
      window.addEventListener('resize', updatePositionOnScroll);
      
      // Get iframe reference once
      const iframe = editor.Canvas.getFrameEl();
      
      // Also listen to iframe scroll
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.addEventListener('scroll', updatePositionOnScroll, true);
      }

      // Track click position for toolbar positioning
      const handleCanvasClick = (e) => {
        try {
          // For iframe events, coordinates are relative to iframe viewport
          // We need to convert them to main window coordinates
          if (iframe && iframe.getBoundingClientRect) {
            const iframeRect = iframe.getBoundingClientRect();
            // e.clientX/clientY are relative to iframe, add iframe position
            const clickX = (e.clientX !== undefined ? e.clientX : e.pageX) || 0;
            const clickY = (e.clientY !== undefined ? e.clientY : e.pageY) || 0;
            lastClickX = iframeRect.left + clickX;
            lastClickY = iframeRect.top + clickY;
          } else {
            // For main window clicks, use coordinates directly
            lastClickX = e.clientX || e.pageX || 0;
            lastClickY = e.clientY || e.pageY || 0;
          }
        } catch (error) {
          console.warn('Error tracking click position:', error);
        }
      };

      // Add click listener to iframe canvas
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.addEventListener('click', handleCanvasClick, true);
        iframe.contentWindow.addEventListener('mousedown', handleCanvasClick, true);
      }

      // Also listen on main window for clicks in canvas area
      window.addEventListener('click', (e) => {
        const canvasEl = document.querySelector('#gjs');
        if (canvasEl && (canvasEl.contains(e.target) || e.target.closest('#gjs'))) {
          lastClickX = e.clientX;
          lastClickY = e.clientY;
        }
      }, true);
      
      window.addEventListener('mousedown', (e) => {
        const canvasEl = document.querySelector('#gjs');
        if (canvasEl && (canvasEl.contains(e.target) || e.target.closest('#gjs'))) {
          lastClickX = e.clientX;
          lastClickY = e.clientY;
        }
      }, true);

      // Show/hide toolbar on component selection - REMOVED floating toolbar from single click
      editor.on('component:selected', (component) => {
        setTimeout(() => { 
          addButtonsToCommandsPanel(); 
          addButtonsToRTEToolbar(); 
          // Floating toolbar removed from single click - now only shows on double click
        }, 100);
      });

      editor.on('component:deselected', () => {
        hideFloatingToolbar();
      });

      // Update position when canvas changes
      editor.on('change:canvas', () => {
        if (floatingToolbar && floatingToolbar.style.opacity === '1' && !isRTEActive) {
          setTimeout(updateFloatingToolbarPosition, 50);
        }
      });

      // Hide floating toolbar when RTE is enabled (text editing mode)
      editor.on('rte:enable', () => {
        isRTEActive = true;
        hideFloatingToolbar();
        setTimeout(addButtonsToRTEToolbar, 100);
      });

      // Show floating toolbar when RTE is disabled
      editor.on('rte:disable', () => {
        isRTEActive = false;
        const selected = editor.getSelected();
        if (selected) {
          setTimeout(() => showFloatingToolbar(selected, lastClickX, lastClickY), 100);
        }
      });

      editor.on('component:dblclick', (component) => {
        console.log('🔄 Double click detected!', component);
        
        // Store click position immediately
        const selected = editor.getSelected();
        if (selected) {
          const compView = selected.getView?.();
          if (compView && compView.el) {
            const rect = compView.el.getBoundingClientRect();
            lastClickX = rect.left + rect.width / 2;
            lastClickY = rect.top - 10; // Position above element
          }
        }
        
        setTimeout(() => { 
          addButtonsToCommandsPanel(); 
          addButtonsToRTEToolbar(); 
          
          // Force show floating toolbar on double click
          const selected = editor.getSelected();
          console.log('🎯 Selected component:', selected);
          console.log('📝 isRTEActive:', isRTEActive);
          console.log('🔧 floatingToolbar exists:', !!floatingToolbar);
          console.log('📍 Click position:', lastClickX, lastClickY);
          
          if (selected && !isRTEActive && floatingToolbar) {
            console.log('✅ Showing floating toolbar');
            // Force toolbar visibility
            floatingToolbar.style.opacity = '1';
            floatingToolbar.style.pointerEvents = 'auto';
            floatingToolbar.style.zIndex = '99999';
            
            // Update position
            updateFloatingToolbarPosition(lastClickX, lastClickY);
          } else {
            console.log('❌ Cannot show toolbar - conditions not met');
            console.log('Selected:', !!selected, 'RTE Active:', isRTEActive, 'Toolbar:', !!floatingToolbar);
          }
        }, 100);
      });
      
      // Initial attempts - MORE FREQUENT AND AGGRESSIVE
      setTimeout(() => { addButtonsToCommandsPanel(); addButtonsToRTEToolbar(); }, 100);
      setTimeout(() => { addButtonsToCommandsPanel(); addButtonsToRTEToolbar(); }, 300);
      setTimeout(() => { addButtonsToCommandsPanel(); addButtonsToRTEToolbar(); }, 300);
      setTimeout(() => { addButtonsToCommandsPanel(); addButtonsToRTEToolbar(); }, 600);
      setTimeout(() => { addButtonsToCommandsPanel(); addButtonsToRTEToolbar(); }, 900);
      setTimeout(() => { addButtonsToCommandsPanel(); addButtonsToRTEToolbar(); }, 1200);
      setTimeout(() => { addButtonsToCommandsPanel(); addButtonsToRTEToolbar(); }, 1500);
      
      // Keep trying every 2 seconds for the first 10 seconds
      let attempts = 0;
      const interval = setInterval(() => {
        addButtonsToCommandsPanel();
        addButtonsToRTEToolbar();
        attempts++;
        if (attempts >= 5) {
          clearInterval(interval);
        }
      }, 2000);
    }, 1000);

    // FIXED: Ensure Right Sidebar Panels are Always Visible and Functional
    setTimeout(() => {
      // Force show right sidebar panels
      const rightPanels = document.querySelectorAll('.gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
      rightPanels.forEach(panel => {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
        panel.style.overflowY = 'auto';
        panel.style.overflowX = 'hidden';
        panel.style.marginTop = '0';
        panel.style.paddingTop = '0';
        console.log('✅ Right sidebar panel initialized:', panel);
      });
      applyToolsPanelPlacement();

      // FIXED: Force active buttons to have blue background and white icons
      const fixActiveButtons = () => {
        const activeButtons = document.querySelectorAll('.gjs-cm-btn.gjs-cm-active, .gjs-pn-btn.gjs-pn-active, .gjs-btn.active');
        activeButtons.forEach(btn => {
          // Force blue background - Figma Style
          btn.style.background = '#18a0fb';
          btn.style.backgroundColor = '#18a0fb';
          btn.style.color = 'white';
          
          // Force white icons
          const icons = btn.querySelectorAll('svg, i, path, polygon, circle, rect, line, g, use');
          icons.forEach(icon => {
            icon.style.fill = 'white';
            icon.style.stroke = 'white';
            icon.style.color = 'white';
          });
        });
      };

      // Run immediately and on button clicks
      fixActiveButtons();
      
      // Watch for button state changes
      const observer = new MutationObserver(() => {
        fixActiveButtons();
      });

      const toolbar = document.querySelector('.gjs-cm, .gjs-pn-buttons');
      if (toolbar) {
        observer.observe(toolbar, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
      }

      // Also fix on click events
      document.addEventListener('click', (e) => {
        if (e.target.closest('.gjs-cm-btn, .gjs-pn-btn, .gjs-btn')) {
          setTimeout(fixActiveButtons, 10);
        }
      }, true);

      // Ensure Style Manager, Traits, and Layers are visible
      const styleManager = editor.Panels.getPanel('views-container');
      if (styleManager) {
        styleManager.set('visible', true);
        console.log('✅ Style Manager panel enabled');
      }

      // Professional Empty State for Style Manager
      const setupStyleManagerEmptyState = () => {
        const updateEmptyState = () => {
          const sectorsContainer = document.querySelector('.gjs-sm-sectors');
          if (!sectorsContainer) return;

          const selected = editor.getSelected();
          const hasSectors = sectorsContainer.querySelector('.gjs-sm-sector');
          let emptyState = sectorsContainer.querySelector('.gjs-sm-empty-state');

          // Check if Style Manager panel is active
          const styleManagerBtn = document.querySelector('.gjs-pn-btn[data-pn-type="style-manager"]');
          const isStyleManagerActive = styleManagerBtn && styleManagerBtn.classList.contains('gjs-pn-active');

          if (!selected && !hasSectors && isStyleManagerActive) {
            // Show empty state
            if (!emptyState) {
              emptyState = document.createElement('div');
              emptyState.className = 'gjs-sm-empty-state';
              emptyState.innerHTML = `
                <div class="gjs-sm-empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <h3 class="gjs-sm-empty-state-title">Select an Element</h3>
                <p class="gjs-sm-empty-state-message">Click on any element in the canvas to start styling with the Style Manager</p>
                <div class="gjs-sm-empty-state-hint">
                  💡 Tip: Select text, images, buttons, or any component to customize its appearance
                </div>
              `;
              sectorsContainer.appendChild(emptyState);
            } else {
              emptyState.style.display = 'flex';
            }
          } else {
            // Hide empty state
            if (emptyState) {
              emptyState.style.display = 'none';
            }
          }
        };

        // Update on component selection changes
        editor.on('component:selected', updateEmptyState);
        editor.on('component:deselected', updateEmptyState);
        editor.on('component:update', updateEmptyState);

        // Update when switching between panels
        const styleManagerBtn = document.querySelector('.gjs-pn-btn[data-pn-type="style-manager"]');
        if (styleManagerBtn) {
          styleManagerBtn.addEventListener('click', () => {
            setTimeout(updateEmptyState, 100);
          });
        }

        // Initial update
        setTimeout(updateEmptyState, 200);
        
        // Watch for DOM changes in sectors container
        const sectorsContainer = document.querySelector('.gjs-sm-sectors');
        if (sectorsContainer) {
          const observer = new MutationObserver(() => {
            setTimeout(updateEmptyState, 50);
          });
          observer.observe(sectorsContainer, {
            childList: true,
            subtree: true
          });
        }
      };

      // Setup empty state after a short delay to ensure DOM is ready
      setTimeout(setupStyleManagerEmptyState, 500);

      // Enhance Style Manager Fields - Make Unit Dropdowns Visible & User-Friendly
      const enhanceStyleManagerFields = () => {
        const enhanceFields = () => {
          // Add placeholders to empty input fields
          const allInputs = document.querySelectorAll('.gjs-sm-property input[type="text"], .gjs-sm-property input[type="number"], .gjs-sm-composite input[type="text"], .gjs-sm-composite input[type="number"]');
          allInputs.forEach(input => {
            if (!input.placeholder && !input.value) {
              const label = input.closest('.gjs-sm-property')?.querySelector('.gjs-sm-label')?.textContent?.toLowerCase();
              if (label) {
                input.placeholder = `Enter ${label}...`;
              }
            }
          });

          // Remove "-" buttons and ensure unit selectors are visible
          const allFields = document.querySelectorAll('.gjs-sm-property .gjs-field, .gjs-sm-composite .gjs-field');
          allFields.forEach(field => {
            const input = field.querySelector('input[type="text"], input[type="number"]');
            
            // Remove any "-" buttons or dash symbols
            const dashButtons = field.querySelectorAll('button, .fa-minus, [class*="minus"], [class*="dash"]');
            dashButtons.forEach(btn => {
              if (btn.textContent === '-' || btn.textContent.includes('-') || btn.classList.contains('fa-minus')) {
                btn.style.display = 'none';
                btn.style.visibility = 'hidden';
              }
            });
            
            if (input) {
              // Check if unit selector exists
              let unitSelect = field.querySelector('.gjs-field-unit select, select[class*="unit"]');
              let unitWrapper = field.querySelector('.gjs-field-unit');
              
              // Detect field type based on label or property name
              const property = field.closest('.gjs-sm-property');
              const label = property?.querySelector('.gjs-sm-label')?.textContent?.toLowerCase() || '';
              const propertyName = property?.getAttribute('name')?.toLowerCase() || 
                                   property?.getAttribute('data-name')?.toLowerCase() || '';
              
              // Check if this is a transition duration field
              const isDurationField = label.includes('duration') || 
                                     propertyName.includes('duration') ||
                                     label.includes('transition-duration') ||
                                     propertyName.includes('transition-duration');
              
              // Create unit selector if it doesn't exist
              if (!unitSelect || !unitWrapper) {
                // Remove old wrapper if exists
                if (unitWrapper && !unitSelect) {
                  unitWrapper.remove();
                }
                
                unitWrapper = document.createElement('div');
                unitWrapper.className = 'gjs-field-unit';
                
                unitSelect = document.createElement('select');
                
                // Use time units for duration fields, otherwise use default units
                let options, defaultSelected;
                if (isDurationField) {
                  options = ['s', 'ms'];
                  defaultSelected = 's';
                } else {
                  options = ['px', '%', 'em', 'rem', 'auto', 'inherit', 'initial', 'none', 'vh', 'vw'];
                  defaultSelected = 'px';
                }
                
                options.forEach(opt => {
                  const option = document.createElement('option');
                  option.value = opt;
                  option.textContent = opt;
                  if (opt === defaultSelected) option.selected = true;
                  unitSelect.appendChild(option);
                });
                
                unitWrapper.appendChild(unitSelect);
                
                // Insert after input
                if (input.nextSibling) {
                  field.insertBefore(unitWrapper, input.nextSibling);
                } else {
                  field.appendChild(unitWrapper);
                }
              } else {
                // If unit selector already exists, update it if it's a duration field
                if (isDurationField) {
                  const currentValue = unitSelect.value;
                  // Check if current options are time units
                  const hasTimeUnits = Array.from(unitSelect.options).some(opt => opt.value === 's' || opt.value === 'ms');
                  if (!hasTimeUnits) {
                    // Replace with time units
                    unitSelect.innerHTML = '';
                    ['s', 'ms'].forEach(opt => {
                      const option = document.createElement('option');
                      option.value = opt;
                      option.textContent = opt;
                      if (opt === 's') option.selected = true;
                      unitSelect.appendChild(option);
                    });
                  }
                }
              }
              
              // Ensure unit selector is visible and styled
              if (unitWrapper) {
                unitWrapper.style.display = 'inline-flex';
                unitWrapper.style.visibility = 'visible';
                unitWrapper.style.opacity = '1';
                unitWrapper.style.position = 'relative';
              }
              
              // Style the select
              if (unitSelect) {
                unitSelect.style.display = 'block';
                unitSelect.style.visibility = 'visible';
                unitSelect.style.opacity = '1';
                unitSelect.style.cursor = 'pointer';
              }
            }
          });

          // Hide ALL duplicate parent labels and add single "Margin" label
          const compositeContainers = document.querySelectorAll('.gjs-sm-composite');
          compositeContainers.forEach(container => {
            // Hide ALL parent property labels (remove all duplicate "Margin" text)
            const parentProperty = container.closest('.gjs-sm-property');
            if (parentProperty) {
              const allParentLabels = parentProperty.querySelectorAll('.gjs-sm-label');
              allParentLabels.forEach(label => {
                // Only hide if it's not inside the composite itself
                if (!container.contains(label)) {
                  label.style.display = 'none';
                  label.style.visibility = 'hidden';
                  label.style.opacity = '0';
                  label.style.height = '0';
                  label.style.margin = '0';
                  label.style.padding = '0';
                  label.style.overflow = 'hidden';
                }
              });
            }
            
            // Remove any existing duplicate labels
            const existingLabels = container.querySelectorAll('.composite-field-label');
            if (existingLabels.length > 1) {
              for (let i = 1; i < existingLabels.length; i++) {
                existingLabels[i].remove();
              }
            }
            
            // Check if label already exists, if not create one
            let existingLabel = container.querySelector('.composite-field-label');
            if (!existingLabel) {
              // Check parent property to determine if it's Margin or Padding
              const propertyName = parentProperty?.getAttribute('data-name')?.toLowerCase() || 
                                   parentProperty?.getAttribute('name')?.toLowerCase() || '';
              const labelText = propertyName.includes('padding') ? 'Padding' : 'Margin';
              
              existingLabel = document.createElement('div');
              existingLabel.className = 'composite-field-label';
              existingLabel.textContent = labelText;
              container.insertBefore(existingLabel, container.firstChild);
            }
          });

          // Enhance composite fields (Margin, Padding) with better UX
          const compositeFields = document.querySelectorAll('.gjs-sm-composite .gjs-field');
          compositeFields.forEach(field => {
            const inputs = field.querySelectorAll('input[type="text"], input[type="number"]');
            inputs.forEach((input, index) => {
              // Make input clearly editable
              input.style.display = 'block';
              input.style.visibility = 'visible';
              input.style.opacity = '1';
              input.style.width = '100%';
              input.style.minWidth = '60px';
              input.style.padding = '4px 0';
              input.style.fontSize = '14px';
              input.style.fontWeight = '500';
              input.style.color = '#1e293b';
              input.style.background = 'transparent';
              input.style.border = 'none';
              input.style.outline = 'none';
              input.readOnly = false;
              input.disabled = false;
              
              // Add placeholder
              if (!input.placeholder) {
                input.placeholder = '0';
              }
              
              // Make inputs more visible based on value
              if (!input.value || input.value === '-' || input.value === 'auto' || input.value.trim() === '') {
                input.style.color = '#94a3b8';
                input.style.fontStyle = 'italic';
              } else {
                input.style.color = '#1e293b';
                input.style.fontStyle = 'normal';
              }
              
              // Ensure input is focusable
              input.tabIndex = 0;
            });
            
            // Ensure the field container is properly structured
            field.style.display = 'flex';
            field.style.alignItems = 'center';
            field.style.gap = '10px';
          });

          // Add tooltips/hints for link/unlink buttons
          const linkButtons = document.querySelectorAll('.gjs-sm-composite .fa-link, .gjs-sm-composite .fa-unlink, .gjs-sm-composite [class*="link"]');
          linkButtons.forEach(btn => {
            if (!btn.title) {
              btn.title = btn.classList.contains('fa-unlink') || btn.classList.contains('unlink') 
                ? 'Unlink values - Set different values for each side' 
                : 'Link values - Use same value for all sides';
            }
          });

          // Add clear labels and tooltips to ALL inputs that don't have clear labels
          const allProperties = document.querySelectorAll('.gjs-sm-property:not(:has(.gjs-sm-composite))');
          allProperties.forEach(property => {
            const label = property.querySelector('.gjs-sm-label');
            const field = property.querySelector('.gjs-field');
            const input = property.querySelector('input, select, textarea');
            
            if (field && !label) {
              // Create label from field name or attribute
              const fieldName = field.getAttribute('data-name') || 
                               field.getAttribute('name') || 
                               field.className.match(/gjs-field-(\w+)/)?.[1] || 
                               'Property';
              const labelText = fieldName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              const newLabel = document.createElement('div');
              newLabel.className = 'gjs-sm-label';
              newLabel.textContent = labelText;
              newLabel.style.cssText = `
                font-family: 'Inter', sans-serif !important;
                font-weight: 600 !important;
                font-size: 13px !important;
                color: #334155 !important;
                margin-bottom: 8px !important;
                display: block !important;
              `;
              property.insertBefore(newLabel, field);
            }
            
            // Add tooltip to input if no clear label
            if (input && !input.title && !input.getAttribute('aria-label')) {
              const labelText = label?.textContent || 
                               input.getAttribute('placeholder') || 
                               input.getAttribute('name') || 
                               'Enter value';
              input.setAttribute('title', labelText);
              input.setAttribute('aria-label', labelText);
              input.setAttribute('data-label', labelText);
            }
          });
        };

        // Run on component selection and updates
        editor.on('component:selected', () => {
          setTimeout(enhanceFields, 100);
        });

        editor.on('component:update', () => {
          setTimeout(enhanceFields, 100);
        });

        // Watch for DOM changes
        const sectorsContainer = document.querySelector('.gjs-sm-sectors');
        if (sectorsContainer) {
          const observer = new MutationObserver(() => {
            setTimeout(enhanceFields, 50);
          });
          observer.observe(sectorsContainer, {
            childList: true,
            subtree: true
          });
        }

        // Initial enhancement
        setTimeout(enhanceFields, 300);
      };

      // Setup field enhancements
      setTimeout(enhanceStyleManagerFields, 600);

      // Force show all panel views
      const panelViews = editor.Panels.getPanels();
      panelViews.forEach(panel => {
        if (panel.get('visible') === false) {
          panel.set('visible', true);
        }
      });

      // Ensure right sidebar buttons are visible
      const rightPanelButtons = document.querySelectorAll('.gjs-pn-btn[data-pn-type="style-manager"], .gjs-pn-btn[data-pn-type="traits"], .gjs-pn-btn[data-pn-type="layers"]');
      rightPanelButtons.forEach(btn => {
        btn.style.display = 'flex';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
      });

      console.log('✅ Right sidebar panels fully initialized and visible');

      // Add search bar for block categories - TOP POSITION
      const addBlockSearchBar = () => {
        const viewsContainer = document.querySelector('.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
        
        if (!viewsContainer) return;
        
        // Check if search bar already exists
        if (document.querySelector('.gjs-blocks-search-container')) return;
        
        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'gjs-blocks-search-container';
        searchContainer.innerHTML = `
          <input 
            type="text" 
            class="gjs-blocks-search-input" 
            placeholder="Search blocks and categories..." 
            autocomplete="off"
          />
        `;
        
        // Insert search bar at the TOP of views container (first child)
        viewsContainer.insertBefore(searchContainer, viewsContainer.firstChild);
        
        // Add search functionality
        const searchInput = searchContainer.querySelector('.gjs-blocks-search-input');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const categories = document.querySelectorAll('.gjs-block-category');
            const allBlocks = document.querySelectorAll('.gjs-block');
            
            if (searchTerm === '') {
              // Show all categories and blocks
              categories.forEach(category => {
                category.style.display = '';
                category.removeAttribute('data-search-match');
                // Reset to default closed state
                category.classList.remove('gjs-open');
                const catBlocksContainer = category.querySelector('.gjs-blocks-c');
                if (catBlocksContainer) {
                  catBlocksContainer.style.display = 'none';
                  catBlocksContainer.style.maxHeight = '0';
                  catBlocksContainer.style.padding = '0';
                }
              });
              
              allBlocks.forEach(block => {
                block.style.display = '';
                block.removeAttribute('data-block-match');
              });
            } else {
              // Filter categories and blocks
              let hasAnyMatch = false;
              
              categories.forEach(category => {
                const title = category.querySelector('.gjs-title');
                const titleText = title ? title.textContent.toLowerCase().trim() : '';
                const categoryBlocks = category.querySelectorAll('.gjs-block');
                let categoryHasMatch = false;
                let blockMatchesInCategory = 0;
                
                // Check if category title matches
                if (titleText.includes(searchTerm)) {
                  categoryHasMatch = true;
                  hasAnyMatch = true;
                }
                
                // Check each block in category
                categoryBlocks.forEach(block => {
                  const label = block.querySelector('.gjs-block-label');
                  const labelText = label ? label.textContent.toLowerCase().trim() : '';
                  
                  // Also check block type/attributes
                  const blockType = block.getAttribute('data-type') || '';
                  const blockId = block.getAttribute('data-id') || '';
                  
                  if (labelText.includes(searchTerm) || 
                      blockType.toLowerCase().includes(searchTerm) ||
                      blockId.toLowerCase().includes(searchTerm)) {
                    block.setAttribute('data-block-match', 'true');
                    block.style.display = 'flex';
                    categoryHasMatch = true;
                    blockMatchesInCategory++;
                    hasAnyMatch = true;
                  } else {
                    block.removeAttribute('data-block-match');
                    block.style.display = 'none';
                  }
                });
                
                // Show/hide category based on matches
                if (categoryHasMatch) {
                  category.style.display = '';
                  category.setAttribute('data-search-match', 'true');
                  // Auto-open matching categories only if search is active
                  if (searchTerm) {
                    category.classList.add('gjs-open');
                    const catBlocksContainer = category.querySelector('.gjs-blocks-c');
                    if (catBlocksContainer) {
                      catBlocksContainer.style.setProperty('display', 'grid', 'important');
                      catBlocksContainer.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                      catBlocksContainer.style.setProperty('gap', '8px', 'important');
                      catBlocksContainer.style.setProperty('max-height', '5000px', 'important');
                      catBlocksContainer.style.setProperty('padding', '10px', 'important');
                      catBlocksContainer.style.setProperty('opacity', '1', 'important');
                      catBlocksContainer.style.setProperty('visibility', 'visible', 'important');
                      catBlocksContainer.style.setProperty('overflow', 'visible', 'important');
                    }
                  }
                } else {
                  category.style.display = 'none';
                  category.removeAttribute('data-search-match');
                }
              });
            }
          });
        }
      };

      // Add search bar after a delay to ensure blocks are loaded
      setTimeout(addBlockSearchBar, 500);
      setTimeout(addBlockSearchBar, 1500);
      setTimeout(addBlockSearchBar, 2500);

      // Ensure block categories dropdown functionality works - SIMPLE & RELIABLE
      const setupBlockCategoryClickHandlers = () => {
        const blockCategories = document.querySelectorAll('.gjs-block-category');
        blockCategories.forEach(category => {
          const title = category.querySelector('.gjs-title');
          if (title) {
            // Ensure it's clickable
            title.style.cursor = 'pointer';
            title.style.pointerEvents = 'auto';
            title.style.userSelect = 'none';
            
            // Remove old handler if exists
            if (title._clickHandler) {
              title.removeEventListener('click', title._clickHandler);
            }
            
            // Create new click handler
            const clickHandler = function(e) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              
              console.log('✅ Category clicked:', category);
              
              // Mark as user-opened
              category.setAttribute('data-user-opened', 'true');
              
              // Toggle the gjs-open class
              const isCurrentlyOpen = category.classList.contains('gjs-open');
              category.classList.toggle('gjs-open');
              const isNowOpen = category.classList.contains('gjs-open');
              
              console.log('✅ Toggle:', isCurrentlyOpen ? 'OPEN -> CLOSED' : 'CLOSED -> OPEN');
              
              // Get blocks container
              const blocksContainer = category.querySelector('.gjs-blocks-c');
              if (blocksContainer) {
                if (isNowOpen) {
                  // OPEN: Show blocks with GRID LAYOUT (2 columns) - PROPER SPACE
                  blocksContainer.style.setProperty('display', 'grid', 'important');
                  blocksContainer.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                  blocksContainer.style.setProperty('gap', '8px', 'important');
                  blocksContainer.style.setProperty('max-height', '5000px', 'important');
                  blocksContainer.style.setProperty('padding', '10px', 'important');
                  blocksContainer.style.setProperty('padding-top', '10px', 'important');
                  blocksContainer.style.setProperty('padding-bottom', '10px', 'important');
                  blocksContainer.style.setProperty('margin', '0', 'important');
                  blocksContainer.style.setProperty('opacity', '1', 'important');
                  blocksContainer.style.setProperty('visibility', 'visible', 'important');
                  blocksContainer.style.setProperty('overflow', 'visible', 'important');
                  blocksContainer.style.setProperty('width', '100%', 'important');
                  blocksContainer.style.setProperty('height', 'auto', 'important');
                  blocksContainer.setAttribute('data-force-show', 'true');
                  
                  // Also ensure all blocks inside are visible
                  const blocks = blocksContainer.querySelectorAll('.gjs-block');
                  blocks.forEach(block => {
                    block.style.setProperty('display', 'flex', 'important');
                    block.style.setProperty('visibility', 'visible', 'important');
                    block.style.setProperty('opacity', '1', 'important');
                  });
                  
                  console.log('✅ Blocks container OPENED, blocks count:', blocks.length);
                } else {
                  // CLOSE: Hide blocks - NO SPACE
                  blocksContainer.style.setProperty('max-height', '0', 'important');
                  blocksContainer.style.setProperty('padding-top', '0', 'important');
                  blocksContainer.style.setProperty('padding-bottom', '0', 'important');
                  blocksContainer.style.setProperty('padding-left', '0', 'important');
                  blocksContainer.style.setProperty('padding-right', '0', 'important');
                  blocksContainer.style.setProperty('margin', '0', 'important');
                  blocksContainer.style.setProperty('opacity', '0', 'important');
                  blocksContainer.style.setProperty('visibility', 'hidden', 'important');
                  blocksContainer.style.setProperty('overflow', 'hidden', 'important');
                  blocksContainer.removeAttribute('data-force-show');
                  console.log('✅ Blocks container CLOSED');
                }
              } else {
                console.warn('⚠️ Blocks container not found for category:', category);
              }
              
              return false;
            };
            
            // Store handler reference and attach
            title._clickHandler = clickHandler;
            title.addEventListener('click', clickHandler, true);
            
            // Initialize display state - DEFAULT CLOSED (only if not user-opened)
            // EXCEPT for "basic" category which should be open by default
            const categoryTitle = title.textContent?.toLowerCase().trim() || '';
            const isBasicCategory = categoryTitle === 'basic';
            
            if (!category.hasAttribute('data-user-opened')) {
              if (isBasicCategory) {
                // Keep "basic" category open by default
                category.classList.add('gjs-open');
                const blocksContainer = category.querySelector('.gjs-blocks-c');
                if (blocksContainer) {
                  blocksContainer.style.setProperty('display', 'grid', 'important');
                  blocksContainer.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                  blocksContainer.style.setProperty('gap', '8px', 'important');
                  blocksContainer.style.setProperty('max-height', '5000px', 'important');
                  blocksContainer.style.setProperty('padding', '10px', 'important');
                  blocksContainer.style.setProperty('padding-top', '10px', 'important');
                  blocksContainer.style.setProperty('padding-bottom', '10px', 'important');
                  blocksContainer.style.setProperty('margin', '0', 'important');
                  blocksContainer.style.setProperty('opacity', '1', 'important');
                  blocksContainer.style.setProperty('visibility', 'visible', 'important');
                  blocksContainer.style.setProperty('overflow', 'visible', 'important');
                  blocksContainer.style.setProperty('width', '100%', 'important');
                  blocksContainer.style.setProperty('height', 'auto', 'important');
                  blocksContainer.setAttribute('data-force-show', 'true');
                }
              } else {
                // Close all other categories
                category.classList.remove('gjs-open');
                const blocksContainer = category.querySelector('.gjs-blocks-c');
                if (blocksContainer) {
                  blocksContainer.style.setProperty('max-height', '0', 'important');
                  blocksContainer.style.setProperty('padding-top', '0', 'important');
                  blocksContainer.style.setProperty('padding-bottom', '0', 'important');
                  blocksContainer.style.setProperty('padding-left', '0', 'important');
                  blocksContainer.style.setProperty('padding-right', '0', 'important');
                  blocksContainer.style.setProperty('margin', '0', 'important');
                  blocksContainer.style.setProperty('opacity', '0', 'important');
                  blocksContainer.style.setProperty('visibility', 'hidden', 'important');
                  blocksContainer.style.setProperty('overflow', 'hidden', 'important');
                }
              }
            }
          }
        });
      };
      
      // Also use event delegation for more reliability
      const setupEventDelegation = () => {
        const viewsContainer = document.querySelector('.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]');
        if (viewsContainer && !viewsContainer.hasAttribute('data-delegation-setup')) {
          viewsContainer.setAttribute('data-delegation-setup', 'true');
          viewsContainer.addEventListener('click', function(e) {
            const title = e.target.closest('.gjs-block-category .gjs-title');
            if (title) {
              const category = title.closest('.gjs-block-category');
              if (category) {
                e.preventDefault();
                e.stopPropagation();
                
                // Trigger toggle
                category.setAttribute('data-user-opened', 'true');
                category.classList.toggle('gjs-open');
                
                const blocksContainer = category.querySelector('.gjs-blocks-c');
                if (blocksContainer) {
                  if (category.classList.contains('gjs-open')) {
                    // OPEN: Show with proper space
                    blocksContainer.style.setProperty('display', 'grid', 'important');
                    blocksContainer.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                    blocksContainer.style.setProperty('gap', '8px', 'important');
                    blocksContainer.style.setProperty('max-height', '5000px', 'important');
                    blocksContainer.style.setProperty('padding', '10px', 'important');
                    blocksContainer.style.setProperty('padding-top', '10px', 'important');
                    blocksContainer.style.setProperty('padding-bottom', '10px', 'important');
                    blocksContainer.style.setProperty('margin', '0', 'important');
                    blocksContainer.style.setProperty('opacity', '1', 'important');
                    blocksContainer.style.setProperty('visibility', 'visible', 'important');
                    blocksContainer.style.setProperty('overflow', 'visible', 'important');
                    blocksContainer.style.setProperty('width', '100%', 'important');
                    blocksContainer.style.setProperty('height', 'auto', 'important');
                    blocksContainer.setAttribute('data-force-show', 'true');
                    
                    // Ensure blocks inside are visible
                    const blocks = blocksContainer.querySelectorAll('.gjs-block');
                    blocks.forEach(block => {
                      block.style.setProperty('display', 'flex', 'important');
                      block.style.setProperty('visibility', 'visible', 'important');
                      block.style.setProperty('opacity', '1', 'important');
                    });
                  } else {
                    // CLOSE: Hide with no space
                    blocksContainer.style.setProperty('max-height', '0', 'important');
                    blocksContainer.style.setProperty('padding-top', '0', 'important');
                    blocksContainer.style.setProperty('padding-bottom', '0', 'important');
                    blocksContainer.style.setProperty('padding-left', '0', 'important');
                    blocksContainer.style.setProperty('padding-right', '0', 'important');
                    blocksContainer.style.setProperty('margin', '0', 'important');
                    blocksContainer.style.setProperty('opacity', '0', 'important');
                    blocksContainer.style.setProperty('visibility', 'hidden', 'important');
                    blocksContainer.style.setProperty('overflow', 'hidden', 'important');
                    blocksContainer.removeAttribute('data-force-show');
                  }
                }
              }
            }
          }, true);
        }
      };

      // Run immediately and periodically to catch all categories
      // Also ensure all categories start closed by default EXCEPT "basic" which should be open
      const ensureAllClosed = () => {
        const categories = document.querySelectorAll('.gjs-block-category');
        categories.forEach(category => {
          // Only close if user hasn't explicitly opened it and search is not active
          const searchInput = document.querySelector('.gjs-blocks-search-input');
          const isSearchActive = searchInput && searchInput.value.trim() !== '';
          
          // Check if this is the "basic" category
          const title = category.querySelector('.gjs-title');
          const categoryTitle = title?.textContent?.toLowerCase().trim() || '';
          const isBasicCategory = categoryTitle === 'basic';
          
          if (!category.hasAttribute('data-user-opened') && !isSearchActive) {
            if (isBasicCategory) {
              // Keep "basic" category open by default
              category.classList.add('gjs-open');
              const blocksContainer = category.querySelector('.gjs-blocks-c');
              if (blocksContainer) {
                blocksContainer.style.setProperty('display', 'grid', 'important');
                blocksContainer.style.setProperty('grid-template-columns', 'repeat(2, 1fr)', 'important');
                blocksContainer.style.setProperty('gap', '8px', 'important');
                blocksContainer.style.setProperty('max-height', '5000px', 'important');
                blocksContainer.style.setProperty('padding', '10px', 'important');
                blocksContainer.style.setProperty('padding-top', '10px', 'important');
                blocksContainer.style.setProperty('padding-bottom', '10px', 'important');
                blocksContainer.style.setProperty('margin', '0', 'important');
                blocksContainer.style.setProperty('opacity', '1', 'important');
                blocksContainer.style.setProperty('visibility', 'visible', 'important');
                blocksContainer.style.setProperty('overflow', 'visible', 'important');
                blocksContainer.style.setProperty('width', '100%', 'important');
                blocksContainer.style.setProperty('height', 'auto', 'important');
                blocksContainer.setAttribute('data-force-show', 'true');
              }
            } else {
              // Close all other categories
              category.classList.remove('gjs-open');
              const blocksContainer = category.querySelector('.gjs-blocks-c');
              if (blocksContainer) {
                blocksContainer.style.setProperty('max-height', '0', 'important');
                blocksContainer.style.setProperty('padding-top', '0', 'important');
                blocksContainer.style.setProperty('padding-bottom', '0', 'important');
                blocksContainer.style.setProperty('padding-left', '0', 'important');
                blocksContainer.style.setProperty('padding-right', '0', 'important');
                blocksContainer.style.setProperty('margin', '0', 'important');
                blocksContainer.style.setProperty('opacity', '0', 'important');
                blocksContainer.style.setProperty('visibility', 'hidden', 'important');
                blocksContainer.style.setProperty('overflow', 'hidden', 'important');
              }
            }
          }
        });
      };

      // Setup handlers multiple times to ensure they work
      setupEventDelegation();
      setupBlockCategoryClickHandlers();
      ensureAllClosed();
      
      setTimeout(() => { setupEventDelegation(); setupBlockCategoryClickHandlers(); }, 100);
      setTimeout(() => { setupEventDelegation(); setupBlockCategoryClickHandlers(); ensureAllClosed(); }, 300);
      setTimeout(() => { setupEventDelegation(); setupBlockCategoryClickHandlers(); ensureAllClosed(); }, 800);
      setTimeout(() => { setupEventDelegation(); setupBlockCategoryClickHandlers(); ensureAllClosed(); }, 1500);
      setTimeout(() => { setupEventDelegation(); setupBlockCategoryClickHandlers(); ensureAllClosed(); }, 2500);
      
      // Also setup on any DOM changes
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => { setupEventDelegation(); setupBlockCategoryClickHandlers(); }, 100);
        });
      } else {
        setTimeout(() => { setupEventDelegation(); setupBlockCategoryClickHandlers(); }, 100);
      }

      // Watch for new categories being added
      const categoryObserver = new MutationObserver((mutations) => {
        let shouldSetup = false;
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && (node.classList?.contains('gjs-block-category') || node.querySelector?.('.gjs-block-category'))) {
                shouldSetup = true;
              }
            });
          }
        });
        if (shouldSetup) {
          setTimeout(setupBlockCategoryClickHandlers, 100);
        }
      });

      const blocksContainer = document.querySelector('.gjs-blocks-c, .gjs-blocks, #gjs-blocks');
      if (blocksContainer) {
        categoryObserver.observe(blocksContainer, {
          childList: true,
          subtree: true
        });
      }

      // Also watch the entire document for any new block categories
      const globalObserver = new MutationObserver(() => {
        const categories = document.querySelectorAll('.gjs-block-category:not([data-handler-checked])');
        if (categories.length > 0) {
          categories.forEach(cat => cat.setAttribute('data-handler-checked', 'true'));
          setTimeout(setupBlockCategoryClickHandlers, 100);
        }
      });

      globalObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }, 1000);

    return () => {
      console.log('🧹 Cleanup - destroying editor...');
      
      // Clear CSS check interval
      if (window.cssCheckInterval) {
        clearInterval(window.cssCheckInterval);
        delete window.cssCheckInterval;
      }
      
      // Clear right sidebar check interval
      if (window.rightSidebarCheckInterval) {
        clearInterval(window.rightSidebarCheckInterval);
        delete window.rightSidebarCheckInterval;
      }
      
      // Clear page CSS/JS maps
      delete window.pageCssMap;
      delete window.pageJsMap;
      
      if (editor) {
        try {
          editor.destroy();
        } catch (err) {
          console.error('Error destroying editor:', err);
        }
      }
      setEditorInstance(null);
      delete window.editor;
      editorInitializedRef.current = false;
      projectDataRef.current = null;
    };
  }, [forceRefreshKey, contentData, stages, generateInitialProject]); // Re-initialize when data loads or force refresh

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Really want to exit? Unsaved changes may be lost.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Removed stageId from dependencies

  const extractPageCSS = (editor, pageId) => {
    try {
      const page = editor.Pages.get(pageId);
      
      // CRITICAL: Get page-specific CSS from multiple sources
      let cssFromPage = page?.get('_savedCss') || page?.get('styles') || '';
      
      // FIXED: Also extract CSS from editor's CSS manager for this page
      const allCssRules = editor.Css.getAll();
      let editorCss = '';
      allCssRules.forEach(rule => {
        const cssString = rule.toCSS ? rule.toCSS() : '';
        if (cssString) {
          editorCss += cssString + '\n';
        }
      });
      
      // FIXED: Extract inline styles from current HTML
      const pageHTML = page?.getMainComponent()?.toHTML() || '';
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      const inlineStyles = [];
      let match;
      
      while ((match = styleRegex.exec(pageHTML)) !== null) {
        inlineStyles.push(match[1].trim());
      }
      
      const inlineCss = inlineStyles.join('\n\n');
      
      // Combine all CSS sources
      const combinedCss = [cssFromPage, editorCss, inlineCss]
        .filter(css => css && css.trim())
        .join('\n\n');
      
      console.log(`📦 Extracted PAGE CSS for page ${pageId}:`);
      console.log(`   - Saved CSS: ${cssFromPage.length} chars`);
      console.log(`   - Editor CSS: ${editorCss.length} chars`);
      console.log(`   - Inline CSS: ${inlineCss.length} chars`);
      console.log(`   - Total CSS: ${combinedCss.length} chars`);
      
      return combinedCss.trim();
    } catch (error) {
      console.error('Error extracting page CSS:', error);
      return '';
    }
  };

  const handleSave = async (saveType) => {
    if (!editorInstance) {
      alert("Editor is not ready.");
      return;
    }

    // Show loading state
    setIsSaving(true);

    const editor = editorInstance;
    
    // FIXED: Save current page's CSS/JS before preparing data
    const currentPage = editor.Pages?.getSelected();
    if (currentPage) {
      const currentCss = extractPageCSS(editor, currentPage.id);
      const currentJs = currentPage.get('script') || '';
      
      // CRITICAL: Store CSS in BOTH _savedCss and styles for persistence
      currentPage.set('_savedCss', currentCss);
      currentPage.set('styles', currentCss);
      currentPage.set('_savedJs', currentJs);
      
      console.log(`💾 Pre-save: Captured CSS (${currentCss.length} chars) and JS (${currentJs.length} chars) for current page`);
    }
    
    // REMOVED: Don't use global CSS - each page has its own CSS
    const funnelName = contentData?.name || 'My Funnel';

    // FIXED: Helper function to remove inline <style> tags from HTML after CSS extraction
    const removeInlineStyles = (html) => {
      return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    };

    const preparePageData = (page) => {
      const stage = stages.find(s => (s._id === page.id) || (s.pageId === page.id) || (s.id === page.id));
      const pageId = page.id;
      
      // CRITICAL: Extract PAGE-SPECIFIC CSS (already includes inline styles from extractPageCSS)
      let pageCSS = extractPageCSS(editor, pageId);
      
      // Extract HTML and remove inline <style> tags
      let pageHTML = page.getMainComponent().toHTML();
      pageHTML = removeInlineStyles(pageHTML);
      
      // Extract JS - prioritize saved JS
      const savedJs = page.get('_savedJs') || page.get('script') || '';
      
      console.log(`📦 Preparing page data for: ${page.get('name')} (ID: ${pageId})`);
      console.log(`   HTML: ${pageHTML.length} chars`);
      console.log(`   CSS: ${pageCSS.length} chars`);
      console.log(`   JS: ${savedJs.length} chars`);

      // FIXED: Enhanced form script injection with proper JavaScript escaping
      const hasDirectForm = pageHTML.includes('bss-direct-form') || pageHTML.includes('bss-direct-form-v2');
      const hasAppointmentForm = pageHTML.includes('appointment-booking') || pageHTML.includes('quick-appointment');
      
      let finalHTML = pageHTML;
      
      if (hasDirectForm) {
        const targetAudience = contentData?.targetAudience || 'client';
        const userId = coachId || '';
        const currentFunnelId = funnelId || 'default-funnel-id';
        const currentFunnelType = funnelType || 'standard';
        const stageName = currentStage?.name || stage?.name || 'Unknown Page';
        
        // FIXED: Single line JavaScript to prevent syntax errors when saved
        // Dynamic API URL detection - uses localhost in development, api.funnelseye.com in production
        const formScript = `<script>(function(){console.log('🔧 Initializing direct forms...');const initForms=()=>{const forms=document.querySelectorAll('.bss-direct-form:not([data-initialized]), .bss-direct-form-v2:not([data-initialized])');forms.forEach(form=>{try{form.setAttribute('data-initialized','true');const container=form.closest('.bss-direct-form-container, .bss-direct-form-v2-container');const messageEl=container?container.querySelector('.form-message'):null;const submitBtn=form.querySelector('.bss-submit-btn, .bss-submit-btn-v2');const showMessage=(message,type)=>{if(messageEl){messageEl.style.display='block';messageEl.className='form-message '+type;messageEl.textContent=message;}else{alert(message);}};const hideMessage=()=>{if(messageEl){messageEl.style.display='none';messageEl.textContent='';}};form.querySelectorAll('input').forEach(input=>{input.addEventListener('focus',hideMessage);});const countryCodeMap={'+1':'United States/Canada','+44':'United Kingdom','+91':'India','+61':'Australia','+49':'Germany','+33':'France','+81':'Japan','+86':'China','+7':'Russia','+55':'Brazil','+52':'Mexico','+34':'Spain','+39':'Italy','+31':'Netherlands','+46':'Sweden','+47':'Norway','+45':'Denmark','+358':'Finland','+41':'Switzerland','+43':'Austria','+48':'Poland','+420':'Czech Republic','+36':'Hungary','+380':'Ukraine','+90':'Turkey','+82':'South Korea','+65':'Singapore','+60':'Malaysia','+66':'Thailand','+84':'Vietnam','+62':'Indonesia','+63':'Philippines','+971':'United Arab Emirates','+966':'Saudi Arabia','+20':'Egypt','+27':'South Africa','+234':'Nigeria','+254':'Kenya','+233':'Ghana','+212':'Morocco','+216':'Tunisia','+213':'Algeria','+225':'Ivory Coast','+237':'Cameroon','+251':'Ethiopia','+256':'Uganda','+260':'Zambia','+263':'Zimbabwe','+265':'Malawi','+267':'Botswana','+268':'Eswatini','+269':'Comoros','+290':'Saint Helena','+291':'Eritrea','+297':'Aruba','+298':'Faroe Islands','+299':'Greenland','+350':'Gibraltar','+351':'Portugal','+352':'Luxembourg','+353':'Ireland','+354':'Iceland','+355':'Albania','+356':'Malta','+357':'Cyprus','+359':'Bulgaria','+370':'Lithuania','+371':'Latvia','+372':'Estonia','+373':'Moldova','+374':'Armenia','+375':'Belarus','+376':'Andorra','+377':'Monaco','+378':'San Marino','+379':'Vatican City','+381':'Serbia','+382':'Montenegro','+383':'Kosovo','+385':'Croatia','+386':'Slovenia','+387':'Bosnia and Herzegovina','+389':'North Macedonia','+421':'Slovakia','+423':'Liechtenstein','+501':'Belize','+502':'Guatemala','+503':'El Salvador','+504':'Honduras','+505':'Nicaragua','+506':'Costa Rica','+507':'Panama','+508':'Saint Pierre and Miquelon','+509':'Haiti','+590':'Guadeloupe','+591':'Bolivia','+592':'Guyana','+593':'Ecuador','+594':'French Guiana','+595':'Paraguay','+596':'Martinique','+597':'Suriname','+598':'Uruguay','+599':'Caribbean Netherlands','+670':'East Timor','+672':'Antarctica','+673':'Brunei','+674':'Nauru','+675':'Papua New Guinea','+676':'Tonga','+677':'Solomon Islands','+678':'Vanuatu','+679':'Fiji','+680':'Palau','+681':'Wallis and Futuna','+682':'Cook Islands','+683':'Niue','+685':'Samoa','+686':'Kiribati','+687':'New Caledonia','+688':'Tuvalu','+689':'French Polynesia','+690':'Tokelau','+691':'Micronesia','+692':'Marshall Islands','+850':'North Korea','+852':'Hong Kong','+853':'Macau','+855':'Cambodia','+856':'Laos','+880':'Bangladesh','+886':'Taiwan','+960':'Maldives','+961':'Lebanon','+962':'Jordan','+963':'Syria','+964':'Iraq','+965':'Kuwait','+967':'Yemen','+968':'Oman','+970':'Palestine','+972':'Israel','+973':'Bahrain','+974':'Qatar','+975':'Bhutan','+976':'Mongolia','+977':'Nepal','+992':'Tajikistan','+993':'Turkmenistan','+994':'Azerbaijan','+995':'Georgia','+996':'Kyrgyzstan','+998':'Uzbekistan','+1242':'Bahamas','+1246':'Barbados','+1264':'Anguilla','+1268':'Antigua and Barbuda','+1284':'British Virgin Islands','+1340':'U.S. Virgin Islands','+1345':'Cayman Islands','+1441':'Bermuda','+1473':'Grenada','+1649':'Turks and Caicos Islands','+1664':'Montserrat','+1671':'Guam','+1684':'American Samoa','+1758':'Saint Lucia','+1767':'Dominica','+1784':'Saint Vincent and the Grenadines','+1787':'Puerto Rico','+1809':'Dominican Republic','+1868':'Trinidad and Tobago','+1869':'Saint Kitts and Nevis','+1876':'Jamaica','+1939':'Puerto Rico'};const countryCodeSelect=form.querySelector('select[name="countryCode"]');const countryInput=form.querySelector('input[name="country"]');if(countryCodeSelect&&countryInput){const updateCountry=()=>{const selectedCode=countryCodeSelect.value;if(selectedCode&&countryCodeMap[selectedCode]){countryInput.value=countryCodeMap[selectedCode];console.log('✅ Country updated to:',countryCodeMap[selectedCode]);}};countryCodeSelect.addEventListener('change',updateCountry);if(countryCodeSelect.value){updateCountry();}}const getApiUrl=()=>{const hostname=window.location.hostname;const port=window.location.port;const origin=window.location.origin;const isLocalhost=hostname==='localhost'||hostname==='127.0.0.1'||hostname.includes('localhost')||hostname.includes('127.0.0.1');const isDevPort=port==='5000'||port==='3000'||port==='5173'||port==='8080'||port==='';const isProduction=origin.includes('funnelseye.com')&&!isLocalhost;const isDev=isLocalhost||isDevPort||!isProduction;const apiUrl=isDev?'http://localhost:8080':'https://api.funnelseye.com';console.log('🔍 API URL Detection:',{hostname,port,origin,isLocalhost,isDevPort,isProduction,isDev,apiUrl});return apiUrl;};const apiUrl=getApiUrl();form.addEventListener('submit',async function(e){e.preventDefault();if(!submitBtn)return;const originalText=submitBtn.innerHTML;submitBtn.innerHTML='<span>Processing...</span>';submitBtn.disabled=true;hideMessage();const redirectPage=this.getAttribute('data-redirect-page')||container.getAttribute('data-redirect-page');try{const countryCode=this.querySelector('select[name="countryCode"]')?.value||'+1';const phoneNumber=this.querySelector('input[name="phone"]').value;const fullPhoneNumber=countryCode+' '+phoneNumber;const formData={name:this.querySelector('input[name="name"]').value,email:this.querySelector('input[name="email"]').value,phone:fullPhoneNumber,city:this.querySelector('input[name="city"]').value,country:this.querySelector('input[name="country"]').value,coachId:'${userId}',funnelId:'${currentFunnelId}',funnelType:'${currentFunnelType}',status:'${stageName}',targetAudience:'${targetAudience}'};console.log('📝 Form submitted:',formData);console.log('🔍 Country Code Debug:',{element:this.querySelector('select[name="countryCode"]'),value:this.querySelector('select[name="countryCode"]')?.value,defaultValue:'+1'});const response=await fetch(apiUrl+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)});const result=await response.json();if(result.success){const leadId=result.data&&result.data._id?result.data._id:result.leadId;if(formData.coachId&&leadId){try{localStorage.setItem('coachId',formData.coachId);localStorage.setItem('leadId',leadId);localStorage.setItem('leadName',formData.name);localStorage.setItem('firstName',formData.name.split(' ')[0]);const storedCoachId=localStorage.getItem('coachId');const storedLeadId=localStorage.getItem('leadId');const storedLeadName=localStorage.getItem('leadName');const storedFirstName=localStorage.getItem('firstName');console.log('✅ STORAGE VERIFICATION:');console.log('Stored CoachId:',storedCoachId);console.log('Stored LeadId:',storedLeadId);console.log('Stored LeadName:',storedLeadName);console.log('Stored FirstName:',storedFirstName);console.log('Storage successful:',storedCoachId===formData.coachId&&storedLeadId===leadId&&storedLeadName===formData.name);window.dispatchEvent(new CustomEvent('leadDataStored',{detail:{coachId:formData.coachId,leadId:leadId,leadName:formData.name,firstName:formData.name.split(' ')[0]}}));}catch(storageError){console.error('❌ localStorage Error:',storageError);}}showMessage('Thank you! Your submission was successful!','success');if(submitBtn){submitBtn.innerHTML='<span>✅ Done!</span>';submitBtn.style.backgroundColor='#10B981';submitBtn.style.color='white';}if(redirectPage&&redirectPage.trim()){setTimeout(()=>{let redirectUrl;if(redirectPage.startsWith('http')){redirectUrl=redirectPage;}else if(redirectPage.startsWith('/')){redirectUrl=redirectPage;}else{const pathParts=window.location.pathname.split('/').filter(Boolean);const funnelSlug=pathParts.length>=2?pathParts[1]:'funnel';redirectUrl='/funnels/'+funnelSlug+'/'+redirectPage;}console.log('Redirecting to:',redirectUrl);window.location.href=redirectUrl;},2000);}setTimeout(()=>{this.reset();if(submitBtn){submitBtn.innerHTML=originalText;submitBtn.style.backgroundColor='';submitBtn.style.color='';submitBtn.disabled=false;}},3000);}else{throw new Error(result.message||'Failed to submit form');}}catch(error){console.error('Error:',error);showMessage('Sorry, there was an error. Please try again.','error');if(submitBtn){submitBtn.innerHTML=originalText;submitBtn.disabled=false;}}});}catch(error){console.error('Error initializing form:',error);}});};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initForms);}else{initForms();}})();</script>`;
        finalHTML += formScript;
      }
      
      if (hasAppointmentForm) {
        // FIXED: Enhanced appointment form script with localStorage integration and proper escaping
        const appointmentScript = `
<script>
console.log('🔧 Initializing appointment forms with localStorage integration...');

const storedCoachId = localStorage.getItem('coachId');
const storedLeadId = localStorage.getItem('leadId');
const storedLeadName = localStorage.getItem('leadName');
const storedFirstName = localStorage.getItem('firstName');

console.log('📊 Stored Data for Appointments:');
console.log('CoachId from localStorage:', storedCoachId);
console.log('LeadId from localStorage:', storedLeadId);
console.log('LeadName from localStorage:', storedLeadName);
console.log('FirstName from localStorage:', storedFirstName);

if (storedCoachId) {
  window.appointmentCoachId = storedCoachId;
  localStorage.setItem('coachId', storedCoachId);
  console.log('✅ Set global appointmentCoachId:', storedCoachId);
}

window.addEventListener('leadDataStored', function(e) {
  console.log('📢 LeadData stored event received in appointment:', e.detail);
  if (e.detail.coachId) {
    window.appointmentCoachId = e.detail.coachId;
    localStorage.setItem('coachId', e.detail.coachId);
  }
  if (e.detail.leadId) {
    localStorage.setItem('leadId', e.detail.leadId);
  }
  if (e.detail.leadName) {
    localStorage.setItem('leadName', e.detail.leadName);
  }
  if (e.detail.firstName) {
    localStorage.setItem('firstName', e.detail.firstName);
  }
  
  if (typeof window.initializeBookingSystem === 'function') {
    console.log('🔄 Reinitializing appointment system...');
    window.initializeBookingSystem();
  }
});

const fillAppointmentForms = () => {
  console.log('🔄 Auto-filling appointment forms...');
  
  const leadIdInputs = document.querySelectorAll('input[name="leadId"], #leadId');
  leadIdInputs.forEach(input => {
    if (storedLeadId && !input.value) {
      input.value = storedLeadId;
      console.log('✅ Auto-filled leadId in appointment form:', storedLeadId);
    }
  });
  
  const leadNameInputs = document.querySelectorAll('input[name="leadName"], #leadName');
  leadNameInputs.forEach(input => {
    if (storedLeadName && !input.value) {
      input.value = storedLeadName;
      console.log('✅ Auto-filled leadName in appointment form:', storedLeadName);
    }
  });
  
  const firstNameInputs = document.querySelectorAll('input[name="firstName"], #firstName');
  firstNameInputs.forEach(input => {
    if (storedFirstName && !input.value) {
      input.value = storedFirstName;
      console.log('✅ Auto-filled firstName in appointment form:', storedFirstName);
    }
  });
  
  if (storedCoachId) {
    window.appointmentCoachId = storedCoachId;
    localStorage.setItem('coachId', storedCoachId);
    console.log('✅ Set appointmentCoachId from localStorage:', storedCoachId);
  }
  
  if (typeof window.initializeBookingSystem === 'function') {
    console.log('🚀 Initializing appointment booking system...');
    window.initializeBookingSystem();
  } else if (typeof window.initializeQuickAppointment === 'function') {
    console.log('🚀 Initializing quick appointment system...');
    window.initializeQuickAppointment();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fillAppointmentForms);
} else {
  fillAppointmentForms();
}

setTimeout(fillAppointmentForms, 1000);
setTimeout(fillAppointmentForms, 3000);
setTimeout(fillAppointmentForms, 5000);
</script>`;
        finalHTML += appointmentScript;
      }

      const pageData = {
        id: pageId,
        name: page.get('name') || stage?.name || 'Unnamed Page',
        type: stage?.type || 'custom-page',
        html: finalHTML,
        css: pageCSS,
        js: savedJs,
        assets: [],
        basicInfo: page.get('basicInfo') || {},
        redirectPage: page.get('redirectPage') || selectedRedirectPage || '',
        isEnabled: stage?.isEnabled !== false,
        order: stages.findIndex(s => s.id === pageId)
      };
      
      console.log(`✅ Page data prepared successfully for: ${pageData.name}`);
      return pageData;
    };

    try {
      // Check authentication before proceeding
      if (!coachId || !token) {
        alert('Authentication required. Please log in to save the funnel.');
        // Redirect to login page
        window.location.href = '/login';
        return;
      }

      // Add null check for editor.Pages
      if (!editor || !editor.Pages) {
        alert("Editor is not fully initialized. Please wait a moment and try again.");
        return;
      }

      let pagesData;
      if (saveType === 'single') {
        const currentPage = editor.Pages.getSelected();
        if (!currentPage) {
          alert("No page is selected to save.");
          return;
        }
        pagesData = [preparePageData(currentPage)];
      } else {
        // FIXED: Save CSS/JS for all pages before preparing data
        const allPages = editor.Pages.getAll();
        allPages.forEach(page => {
          const pageCss = extractPageCSS(editor, page.id);
          const pageJs = page.get('script') || '';
          
          // CRITICAL: Store CSS in BOTH _savedCss and styles for persistence
          page.set('_savedCss', pageCss);
          page.set('styles', pageCss);
          page.set('_savedJs', pageJs);
          
          console.log(`💾 Pre-save all: Captured CSS (${pageCss.length} chars) and JS (${pageJs.length} chars) for ${page.get('name')}`);
        });
        pagesData = allPages.map(preparePageData);
      }

      console.log('📤 Saving to backend - Summary:');
      pagesData.forEach(page => {
      console.log(`   ${page.name}: HTML=${page.html.length}chars, CSS=${page.css.length}chars, JS=${page.js.length}chars`);
    });
    console.log(`   ✅ All pages have individual CSS - no global CSS needed`);

      // Update stages with page data
      const updatedStages = stages.map(stageItem => {
        const pageData = pagesData.find(p => {
          const stageId = stageItem._id || stageItem.pageId || stageItem.id;
          return p.id === stageId;
        });
        
        if (pageData) {
          return {
            ...stageItem,
            html: pageData.html,
            css: pageData.css,
            js: pageData.js,
            basicInfo: {
              ...stageItem.basicInfo,
              ...pageData.basicInfo
            }
          };
        }
        return stageItem;
      });

      // Save to backend
      const response = await fetch(`/api/admin/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...funnel,
          stages: updatedStages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save funnel');
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setFunnel(result.data);
        setStages(result.data.stages || []);
        
        // Show success popup with party celebration
        const message = saveType === 'single' 
          ? "🎉 Page saved successfully!" 
          : "🎉 All pages saved successfully!";
        setSuccessMessage(message);
        setShowSuccessPopup(true);
      } else {
        throw new Error(result.message || 'Failed to save funnel');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save data: ${error.message}`);
    } finally {
      // Reset loading state
      setIsSaving(false);
    }
  };

  const handleDownloadProject = () => {
    if (!editorInstance) {
      alert("Editor is not ready.");
      return;
    }

    const editor = editorInstance;
    
    // Add null check for editor.Pages
    if (!editor.Pages) {
      alert("Editor is not fully initialized. Please wait a moment and try again.");
      return;
    }
    
    const currentPage = editor.Pages.getSelected();
    if (!currentPage) {
      alert("No page is selected to download.");
      return;
    }

    const pageName = currentPage.get('name') || `page-${currentPage.cid}`;
    const pageCSS = extractPageCSS(editor, currentPage.id);
    
    // CRITICAL: Use only PAGE-SPECIFIC CSS (not global CSS)
    const fullCode = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${pageName}</title><style>${pageCSS}</style></head><body>${currentPage.getMainComponent().toHTML()}<script>${currentPage.get('script') || ''}</script></body></html>`;

    const blob = new Blob([fullCode], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${pageName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleTemplateSelect = (templateKey) => {
    if (!currentStage || !editorInstance) return;

    // Add null check for editor.Pages
    if (!editorInstance.Pages) {
      alert("Editor is not fully initialized. Please wait a moment and try again.");
      return;
    }

    const templateSet = {
      'welcome-page': templates.welcomeTemplates,
      'vsl-page': templates.vslTemplates,
      'thankyou-page': templates.thankyouTemplates,
      'whatsapp-page': templates.whatsappTemplates,
      'product-offer': templates.productOfferTemplates,
      'custom-page': templates.miscTemplates,
      'appointment-page': templates.appointmentTemplates,
      'payment-page': templates.paymentTemplates,
    }[currentStage.type];

    const template = templateSet?.[templateKey];
    if (!template) {
      console.error('Template not found:', templateKey);
      return;
    }

    // Template selection - update local state if needed
    // (No Redux dispatch needed - state is managed locally)

    const page = editorInstance.Pages.get(currentStage.id);
    if (page) {
      const applyDataToPage = (page, { html, css, js, basicInfo, redirectPage }) => {
        if (!editorInstance || !page) return;

        try {
          // Inject coach ID for VSL templates
          let processedJs = js;
          if (currentStage.type === 'vsl-page' && js) {
            const realCoachId = coachId || 'default-coach-id';
            processedJs = js.replace(/coachId.*=.*['"`]default-coach-id['"`]/g, `coachId: '${realCoachId}'`);
            console.log('🔧 Template Select: Injected coach ID:', realCoachId);
          }

          if (html !== undefined) {
            page.set('component', '');
            page.set('component', html);
          }

          if (css !== undefined) {
            page.set('styles', css);

            const cssRules = editorInstance.Css.getAll();
            const pageRules = cssRules.filter(rule => true);
            pageRules.forEach(rule => editorInstance.Css.remove(rule));

            if (css.trim()) {
              try {
                // Validate CSS before setting to prevent unclosed block errors
                const tempStyle = document.createElement('style');
                tempStyle.textContent = css;
                document.head.appendChild(tempStyle);
                document.head.removeChild(tempStyle);
                
                // If validation passes, set the rule
                editorInstance.Css.setRule(css);
              } catch (cssError) {
                console.error('Invalid CSS detected, skipping:', cssError);
                // Set a safe fallback CSS
                editorInstance.Css.setRule('/* CSS validation failed */');
              }
            }
          }

          if (processedJs !== undefined) {
            page.set('script', typeof processedJs === 'function' ? processedJs.toString() : processedJs);
          }

          if (basicInfo) {
            page.set('basicInfo', basicInfo);
          }

          if (redirectPage !== undefined) {
            page.set('redirectPage', redirectPage);
            setSelectedRedirectPage(redirectPage);
            updateDirectFormsRedirect(editorInstance, redirectPage);
          }

          editorInstance.Pages.select(page);
          editorInstance.trigger('change:canvas');
          editorInstance.runCommand('canvas:reload');
        } catch (error) {
          console.error(`Error applying data to page ${page.id}:`, error);
        }
      };

      applyDataToPage(page, {
        html: template.html,
        css: template.css,
        js: template.js,
        basicInfo: template.basicInfo || {},
        redirectPage: template.redirectPage || ''
      });
    }

    setShowTemplateSelector(false);
  };

  const handleRedirectSelect = (targetValue) => {
    if (!targetValue) {
      alert('Please choose a redirect destination');
      return;
    }

    let formattedTarget = targetValue.trim();
    const isExternalLink = /^https?:\/\//i.test(formattedTarget);

    if (!isExternalLink) {
      formattedTarget = formattedTarget.replace(/^\/|\/$/g, '');
    }

    if (!formattedTarget) {
      alert('Please provide a valid redirect destination');
      return;
    }

    console.log('Setting redirect destination to:', formattedTarget);

    setSelectedRedirectPage(formattedTarget);

    if (editorInstance) {
      const currentPage = editorInstance.Pages.getSelected();
      if (currentPage) {
        currentPage.set('redirectPage', formattedTarget);
        console.log('Updated current page redirect to:', formattedTarget);
      }

      updateDirectFormsRedirect(editorInstance, formattedTarget);

      setTimeout(() => {
        updateDirectFormsRedirect(editorInstance, formattedTarget);
      }, 500);

      if (currentStage) {
        // Update local state
        const updatedStages = stages.map(s => {
          if ((s._id === currentStage._id) || (s.pageId === currentStage.pageId) || (s.id === currentStage.id)) {
            return {
              ...s,
              basicInfo: {
                ...s.basicInfo,
                redirectPage: formattedTarget
              }
            };
          }
          return s;
        });
        setStages(updatedStages);
        console.log('Updated redirect page in local state:', formattedTarget);
      }
    }

    setShowRedirectPopup(false);
    alert(`Redirect destination set to: ${formattedTarget}\nAll direct forms will now redirect here after submission.`);
  };

  const getDaySelectorDocument = (instanceOverride) => {
    const activeEditor = instanceOverride || window.editor || editorInstance;
    const frameEl = activeEditor?.Canvas?.getFrameEl?.();
    if (frameEl?.contentDocument) {
      return frameEl.contentDocument;
    }
    if (frameEl?.contentWindow?.document) {
      return frameEl.contentWindow.document;
    }
    return document;
  };

  const applyDaySelectionToDomElement = (targetElement, selectionInput) => {
    if (!targetElement) return [];
    const normalizedSelection = normalizeDaySelection(selectionInput);
    const daySummary = formatDaySummary(normalizedSelection);
    const dateSummary = formatDateSummary(normalizedSelection);

    const daySpan = targetElement.querySelector('.day-value');
    const dateSpan = targetElement.querySelector('.date-value');

    if (daySpan) {
      daySpan.textContent = daySummary;
    }
    if (dateSpan) {
      dateSpan.textContent = dateSummary;
    }

    const primaryDay = normalizedSelection[0]?.day || '';
    const primaryDate = normalizedSelection[0]?.date || (primaryDay ? getUpcomingDateForDay(primaryDay) : '');

    targetElement.setAttribute('data-selected-days', JSON.stringify(normalizedSelection));
    targetElement.setAttribute('data-selected-day', primaryDay);
    targetElement.setAttribute('data-recent-date', primaryDate);

    return normalizedSelection;
  };

  const syncDaySelectorComponentModel = (targetElement, selectionInput, editorOverride) => {
    const activeEditor = editorOverride || window.editor || editorInstance;
    if (!activeEditor || !targetElement) {
      return;
    }

    const normalizedSelection = normalizeDaySelection(selectionInput);
    const componentId = targetElement.getAttribute('data-component-id');
    const wrapper = activeEditor.DomComponents?.getWrapper?.();
    let componentModel = null;

    if (componentId && wrapper?.find) {
      const matches = wrapper.find(`[data-component-id="${componentId}"]`);
      if (matches?.length) {
        componentModel = matches[0];
      }
    }

    if (!componentModel) {
      const selected = activeEditor.getSelected?.();
      if (selected?.getEl?.() === targetElement) {
        componentModel = selected;
      }
    }

    if (!componentModel) return;

    const primaryDay = normalizedSelection[0]?.day || '';
    const primaryDate = normalizedSelection[0]?.date || (primaryDay ? getUpcomingDateForDay(primaryDay) : '');

    componentModel.addAttributes?.({
      'data-selected-day': primaryDay,
      'data-recent-date': primaryDate,
      'data-selected-days': JSON.stringify(normalizedSelection)
    });

    const dayValueComponent = componentModel.find?.('.day-value')?.[0];
    const dateValueComponent = componentModel.find?.('.date-value')?.[0];

    if (dayValueComponent) {
      dayValueComponent.components?.(formatDaySummary(normalizedSelection));
    }
    if (dateValueComponent) {
      dateValueComponent.components?.(formatDateSummary(normalizedSelection));
    }

    componentModel.view?.render?.();
    activeEditor.trigger?.('change:canvas');
  };

  const openDaySelectorPopupForElement = (element) => {
    if (element) {
      setDaySelectorInitialSelection(parseDaySelectionFromElement(element));
    } else {
      setDaySelectorInitialSelection([]);
    }
    setShowDaySelectorPopup(true);
  };

  const handleDaySelectorSelect = (selectionPayload, legacyRecentDate) => {
    const normalizedSelection = normalizeDaySelection(selectionPayload, legacyRecentDate);
    console.log('🎯 Day selected:', normalizedSelection);
    console.log('🔍 Selected ID:', selectedDaySelectorId);
    console.log('📍 Selected Element:', selectedComponentElement);
    console.log('📊 Editor Instance:', !!editorInstance);

    if (!normalizedSelection.length) {
      alert('Please select at least one day');
      return;
    }

    let targetElement = null;
    const canvasDocument = getDaySelectorDocument();
    
    // Method 1: Use stored element reference
    if (selectedComponentElement && canvasDocument.contains(selectedComponentElement)) {
      targetElement = selectedComponentElement;
      console.log('✅ Using stored element reference');
    }
    
    // Method 2: Find by component ID
    if (!targetElement && selectedDaySelectorId) {
      targetElement = canvasDocument.querySelector(`[data-component-id="${selectedDaySelectorId}"]`);
      console.log('✅ Found by component ID:', !!targetElement);
    }
    
    // Method 3: Find selected component in editor
    if (!targetElement && editorInstance) {
      const selectedComp = editorInstance.getSelected();
      if (selectedComp?.getEl) {
        const el = selectedComp.getEl();
        if (el?.classList.contains('day-selector-display-widget')) {
          targetElement = el;
          console.log('✅ Using editor selected component');
        }
      }
    }
    
    // Method 4: Find any available day selector
    if (!targetElement) {
      const allDayComponents = canvasDocument.querySelectorAll('.day-selector-display-widget');
      if (allDayComponents.length > 0) {
        targetElement = allDayComponents[0];
        console.log('✅ Using first available component');
      }
    }

    if (targetElement) {
      console.log('🔄 Updating component...');
      
      const appliedSelection = applyDaySelectionToDomElement(targetElement, normalizedSelection);

      // Sync GrapesJS component model so the value persists after save/export
      syncDaySelectorComponentModel(targetElement, appliedSelection);
      setDaySelectorInitialSelection(appliedSelection);
      
      // Force visual update
      targetElement.style.display = 'none';
      targetElement.offsetHeight; // Trigger reflow
      targetElement.style.display = '';
      
      console.log('✅ Component updated successfully!');
      
      // Reset selection after update
      setTimeout(() => {
        setSelectedDaySelectorId(null);
        setSelectedComponentElement(null);
        targetElement.classList.remove('selected');
      }, 1000);
      
    } else {
      console.error('❌ No target element found');
      alert('Error: Could not find day selector component to update.\n\n1. Make sure you dropped a Day Selector component\n2. Click on it to select it\n3. Then click Day Selector button');
    }

    setShowDaySelectorPopup(false);
  };

  const handleCustomCodeSubmit = ({ html, css, js }) => {
    const editor = window.editor || editorInstance;
    if (!editor) {
      alert('Editor is not initialized. Please wait and try again.');
      return;
    }

    const currentPage = editor.Pages.getSelected();
    if (!currentPage) {
      alert('No page is currently selected. Please select a page first.');
      return;
    }

    try {
      // Append HTML to the bottom of the page using GrapesJS
      if (html && html.trim()) {
        try {
          // Use addComponents which adds components at the end by default
          editor.addComponents(html.trim());
          console.log('✅ HTML components added to page');
        } catch (error) {
          console.error('Error adding HTML components:', error);
          // Fallback: Append to wrapper
          const wrapper = editor.DomComponents.getWrapper();
          if (wrapper) {
            wrapper.append(html.trim());
            console.log('✅ HTML appended to wrapper as fallback');
          }
        }
      }

      // Get current CSS and append new CSS
      let currentCss = currentPage.get('_savedCss') || currentPage.get('styles') || '';
      if (css && css.trim()) {
        currentCss += '\n' + css.trim();
      }

      // Get current JS and append new JS
      let currentJs = currentPage.get('_savedJs') || currentPage.get('script') || '';
      if (js && js.trim()) {
        currentJs += '\n' + js.trim();
      }

      // Update the page CSS/JS
      if (css && css.trim()) {
        currentPage.set('_savedCss', currentCss);
        currentPage.set('styles', currentCss);
      }
      if (js && js.trim()) {
        currentPage.set('_savedJs', currentJs);
        currentPage.set('script', currentJs);
      }

      // Update CSS in editor
      if (css && css.trim()) {
        try {
          // Validate CSS
          const tempStyle = document.createElement('style');
          tempStyle.textContent = css.trim();
          document.head.appendChild(tempStyle);
          document.head.removeChild(tempStyle);
          
          // Add CSS rule
          editor.Css.setRule(css.trim());
        } catch (cssError) {
          console.error('CSS validation error:', cssError);
        }
      }

      // Inject CSS into iframe immediately
      if (css && css.trim()) {
        const iframe = editor.Canvas.getFrameEl();
        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
          const iframeDoc = iframe.contentWindow.document;
          // Remove existing custom code styles
          const existingStyles = iframeDoc.querySelectorAll('style[data-custom-code]');
          existingStyles.forEach(style => style.remove());
          
          const styleTag = iframeDoc.createElement('style');
          styleTag.setAttribute('data-custom-code', 'true');
          styleTag.textContent = css.trim();
          iframeDoc.head.appendChild(styleTag);
        }
      }

      // Inject JS into iframe immediately
      if (js && js.trim()) {
        const iframe = editor.Canvas.getFrameEl();
        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
          const iframeDoc = iframe.contentWindow.document;
          // Remove existing custom code scripts
          const existingScripts = iframeDoc.querySelectorAll('script[data-custom-code]');
          existingScripts.forEach(script => script.remove());
          
          const scriptTag = iframeDoc.createElement('script');
          scriptTag.setAttribute('data-custom-code', 'true');
          scriptTag.textContent = js.trim();
          iframeDoc.body.appendChild(scriptTag);
        }
      }

      // Re-inject page CSS/JS to ensure everything is in sync
      setTimeout(() => {
        const iframe = editor.Canvas.getFrameEl();
        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
          const iframeDoc = iframe.contentWindow.document;
          const currentPageCss = currentPage.get('_savedCss') || '';
          const currentPageJs = currentPage.get('_savedJs') || '';

          // Re-inject CSS
          if (currentPageCss) {
            const pageStyleTag = iframeDoc.querySelector('style[data-page-css]');
            if (!pageStyleTag) {
              const newStyleTag = iframeDoc.createElement('style');
              newStyleTag.setAttribute('data-page-css', 'true');
              newStyleTag.textContent = currentPageCss;
              iframeDoc.head.appendChild(newStyleTag);
            } else {
              pageStyleTag.textContent = currentPageCss;
            }
          }

          // Re-inject JS
          if (currentPageJs) {
            const pageScriptTag = iframeDoc.querySelector('script[data-page-js]');
            if (!pageScriptTag) {
              const newScriptTag = iframeDoc.createElement('script');
              newScriptTag.setAttribute('data-page-js', 'true');
              newScriptTag.textContent = currentPageJs;
              iframeDoc.body.appendChild(newScriptTag);
            } else {
              pageScriptTag.textContent = currentPageJs;
            }
          }
        }
      }, 100);

      // Refresh the canvas
      editor.trigger('change:canvas');

      setShowSuccessPopup(true);
      setSuccessMessage('✅ Custom code added successfully to the bottom of the page!');
      setShowCustomCodePopup(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding custom code:', error);
      alert('Failed to add custom code. Please check the console for details.');
    }
  };

  const handleHtmlUploadSubmit = ({ html }) => {
    const editor = window.editor || editorInstance;
    if (!editor) {
      alert('Editor is not initialized. Please wait and try again.');
      return;
    }

    const currentPage = editor.Pages.getSelected();
    if (!currentPage) {
      alert('No page is currently selected. Please select a page first.');
      return;
    }

    try {
      // Extract CSS and JS from HTML content
      let cssContent = '';
      let jsContent = '';
      let cleanHtml = html;

      // Extract CSS from <style> tags
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      const styleMatches = html.match(styleRegex);
      if (styleMatches) {
        styleMatches.forEach(match => {
          const cssContent = match.replace(/<\/?style[^>]*>/gi, '').trim();
          if (cssContent) {
            // Add to page CSS
            let currentCss = currentPage.get('_savedCss') || currentPage.get('styles') || '';
            currentCss += '\n' + cssContent;
            currentPage.set('_savedCss', currentCss);
            currentPage.set('styles', currentCss);
          }
        });
        // Remove style tags from HTML
        cleanHtml = cleanHtml.replace(styleRegex, '');
      }

      // Extract JS from <script> tags
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      const scriptMatches = html.match(scriptRegex);
      if (scriptMatches) {
        scriptMatches.forEach(match => {
          const jsContent = match.replace(/<\/?script[^>]*>/gi, '').trim();
          if (jsContent) {
            // Add to page JS
            let currentJs = currentPage.get('_savedJs') || currentPage.get('script') || '';
            currentJs += '\n' + jsContent;
            currentPage.set('_savedJs', currentJs);
            currentPage.set('script', currentJs);
          }
        });
        // Remove script tags from HTML
        cleanHtml = cleanHtml.replace(scriptRegex, '');
      }

      // Add the clean HTML to the page
      if (cleanHtml && cleanHtml.trim()) {
        try {
          // Use addComponents which adds components at the end by default
          editor.addComponents(cleanHtml.trim());
          console.log('✅ HTML content added to page');
        } catch (error) {
          console.error('Error adding HTML content:', error);
          // Fallback: Append to wrapper
          const wrapper = editor.DomComponents.getWrapper();
          if (wrapper) {
            wrapper.append(cleanHtml.trim());
            console.log('✅ HTML appended to wrapper as fallback');
          }
        }
      }

      // Inject CSS into iframe immediately
      const iframe = editor.Canvas.getFrameEl();
      if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        const iframeDoc = iframe.contentWindow.document;
        
        // Inject extracted CSS
        if (styleMatches) {
          styleMatches.forEach(match => {
            const cssContent = match.replace(/<\/?style[^>]*>/gi, '').trim();
            if (cssContent) {
              const styleTag = iframeDoc.createElement('style');
              styleTag.setAttribute('data-html-upload', 'true');
              styleTag.textContent = cssContent;
              iframeDoc.head.appendChild(styleTag);
            }
          });
        }

        // Inject extracted JS
        if (scriptMatches) {
          scriptMatches.forEach(match => {
            const jsContent = match.replace(/<\/?script[^>]*>/gi, '').trim();
            if (jsContent) {
              const scriptTag = iframeDoc.createElement('script');
              scriptTag.setAttribute('data-html-upload', 'true');
              scriptTag.textContent = jsContent;
              iframeDoc.body.appendChild(scriptTag);
            }
          });
        }
      }

      // Refresh the canvas
      editor.trigger('change:canvas');

      setShowSuccessPopup(true);
      setSuccessMessage('✅ HTML file uploaded successfully! Content, CSS, and JavaScript have been added to the page.');
      setShowHtmlUploadPopup(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error('Error uploading HTML file:', error);
      alert('Failed to upload HTML file. Please check the console for details.');
    }
  };

  // Auto-update functionality - onEditorReady के अंत में add करो:
  useEffect(() => {
    const autoUpdateInterval = setInterval(() => {
      const dayComponents = document.querySelectorAll('.day-selector-display-widget');
      
      dayComponents.forEach(component => {
        const selection = parseDaySelectionFromElement(component);
        if (!selection.length) return;
        const refreshedSelection = selection.map(item => ({
          day: item.day,
          date: getUpcomingDateForDay(item.day)
        }));
        applyDaySelectionToDomElement(component, refreshedSelection);
      });
    }, 60000); // Update every minute

    return () => clearInterval(autoUpdateInterval);
  }, []);

  // Global function for day selector popup
  useEffect(() => {
    window.openDaySelectorPopup = (selectionPayload, legacyRecentDate) => {
      console.log('Opening day selector popup for:', selectionPayload);

      if (selectionPayload instanceof Element) {
        openDaySelectorPopupForElement(selectionPayload);
        return;
      }

      if (selectionPayload) {
        setDaySelectorInitialSelection(normalizeDaySelection(selectionPayload, legacyRecentDate));
      } else if (selectedComponentElement) {
        setDaySelectorInitialSelection(parseDaySelectionFromElement(selectedComponentElement));
      } else {
        setDaySelectorInitialSelection([]);
      }

      setShowDaySelectorPopup(true);
    };
    
    return () => {
      delete window.openDaySelectorPopup;
    };
  }, [selectedComponentElement]);

  const getSelectedTemplateKey = () => {
    if (!currentStage) return null;
    const config = currentStage.type === 'custom-page' ? 
      contentData.customStagesConfig?.[currentStage.id] : 
      contentData.stagesConfig?.[currentStage.type];
    return config?.selectedTemplateKey;
  };

  const forceTemplateRefresh = () => {
    if (window.confirm("Are you sure? This will reload all pages from their initial templates and discard unsaved changes.")) {
      setForceRefreshKey(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (window.confirm('Really want to exit? Unsaved changes may be lost.')) {
      navigate(`/funnels/manage/${funnelId}`);
    }
  };

  const handlePageSwitch = (pageId) => {
    if (!editorInstance || !editorInstance.Pages) return;
    
    const page = editorInstance.Pages.get(pageId);
    if (page) {
      editorInstance.Pages.select(page);
      setSelectedPageId(pageId);
      
      // Update current stage
      const stage = stages.find(s => s.id === pageId);
      if (stage) {
        setCurrentStage(stage);
      }
    }
  };

  // Frame width resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    
    // Get current frame width
    const frame = document.querySelector('.gjs-frame');
    if (frame) {
      resizeStartWidthRef.current = frameWidth !== null ? frameWidth : frame.offsetWidth;
    }
    
    const handleMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      
      const deltaX = moveEvent.clientX - resizeStartXRef.current;
      const newWidth = resizeStartWidthRef.current + deltaX;
      
      // Clamp between 320px and 2000px
      const clampedWidth = Math.max(320, Math.min(2000, newWidth));
      setFrameWidth(clampedWidth);
      
      // Apply to frame immediately
      const frameEl = document.querySelector('.gjs-frame');
      const framesContainer = document.querySelector('.gjs-cv-canvas__frames');
      if (frameEl && framesContainer) {
        frameEl.classList.add('custom-width-set');
        frameEl.style.setProperty('width', `${clampedWidth}px`, 'important');
        frameEl.style.setProperty('max-width', `${clampedWidth}px`, 'important');
        framesContainer.style.setProperty('max-width', `${clampedWidth}px`, 'important');
      }
    };

    const handleEnd = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  // Preset width handlers
  const handlePresetWidth = (width) => {
    console.log('Setting frame width to:', width);
    
    const applyWidth = () => {
      const frame = document.querySelector('.gjs-frame');
      const framesContainer = document.querySelector('.gjs-cv-canvas__frames');
      
      if (frame && framesContainer) {
        if (width === null) {
          // Reset to default
          frame.classList.remove('custom-width-set');
          frame.style.removeProperty('width');
          frame.style.removeProperty('max-width');
          framesContainer.style.removeProperty('max-width');
          setFrameWidth(null);
        } else {
          // Set custom width
          frame.classList.add('custom-width-set');
          frame.style.setProperty('width', `${width}px`, 'important');
          frame.style.setProperty('max-width', `${width}px`, 'important');
          framesContainer.style.setProperty('max-width', `${width}px`, 'important');
          setFrameWidth(width);
        }
        console.log('Width applied successfully:', width);
      } else {
        console.log('Frame not found, retrying...');
        setTimeout(applyWidth, 100);
      }
    };
    
    applyWidth();
  };

  // Apply frame width on mount and when frameWidth changes
  useEffect(() => {
    const applyWidth = () => {
      if (frameWidth !== null) {
        const frame = document.querySelector('.gjs-frame');
        const framesContainer = document.querySelector('.gjs-cv-canvas__frames');
        if (frame && framesContainer) {
          frame.classList.add('custom-width-set');
          frame.style.setProperty('width', `${frameWidth}px`, 'important');
          frame.style.setProperty('max-width', `${frameWidth}px`, 'important');
          framesContainer.style.setProperty('max-width', `${frameWidth}px`, 'important');
        } else {
          // Retry if frame not found
          setTimeout(applyWidth, 200);
        }
      } else {
        // Remove custom width class when reset
        const frame = document.querySelector('.gjs-frame');
        if (frame) {
          frame.classList.remove('custom-width-set');
        }
      }
    };
    
    applyWidth();
  }, [frameWidth, forceRefreshKey]);

  // Position resize handle relative to frame
  useEffect(() => {
    const updateResizeHandlePosition = () => {
      const frame = document.querySelector('.gjs-frame');
      const resizeHandle = document.querySelector('.frame-resize-handle');
      const editorArea = document.querySelector('.editor-main-area');
      
      if (frame && resizeHandle && editorArea) {
        const frameRect = frame.getBoundingClientRect();
        const editorRect = editorArea.getBoundingClientRect();
        
        // Calculate position relative to editor area
        const frameRightRelativeToEditor = frameRect.right - editorRect.left;
        const editorWidth = editorRect.width;
        const rightOffset = editorWidth - frameRightRelativeToEditor;
        
        resizeHandle.style.right = `${rightOffset + 12}px`;
      }
    };

    // Update position when frame is ready
    const timer = setTimeout(updateResizeHandlePosition, 500);
    const observer = new MutationObserver(() => {
      setTimeout(updateResizeHandlePosition, 100);
    });
    
    const canvas = document.querySelector('.gjs-cv-canvas');
    if (canvas) {
      observer.observe(canvas, { childList: true, subtree: true, attributes: true });
    }

    window.addEventListener('resize', updateResizeHandlePosition);
    
    // Also update when frame width changes
    const frameObserver = new MutationObserver(updateResizeHandlePosition);
    const frame = document.querySelector('.gjs-frame');
    if (frame) {
      frameObserver.observe(frame, { attributes: true, attributeFilter: ['style'] });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      frameObserver.disconnect();
      window.removeEventListener('resize', updateResizeHandlePosition);
    };
  }, [forceRefreshKey, frameWidth]);

  if (apiStatus === 'loading') {
    return (
      <>
        <style>{`
          @keyframes skeleton-shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          .skeleton-loader-wrapper {
            width: 100%;
            height: 100vh;
            background: #0f172a;
            display: flex;
            position: relative;
            overflow: hidden;
          }
          
          .skeleton-sidebar {
            width: 280px;
            height: 100vh;
            background: #1e293b;
            border-right: 1px solid #334155;
            display: flex;
            flex-direction: column;
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
          }
          
          .skeleton-sidebar-header {
            padding: 16px 18px;
            border-bottom: 1px solid #334155;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #1e293b;
          }
          
          .skeleton-box {
            background: linear-gradient(
              90deg,
              #1e293b 0%,
              #334155 25%,
              #475569 50%,
              #334155 75%,
              #1e293b 100%
            );
            background-size: 400% 100%;
            animation: skeleton-shimmer 2s ease-in-out infinite;
            border-radius: 6px;
            position: relative;
            overflow: hidden;
          }
          
          .skeleton-box::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            animation: skeleton-shimmer 2s ease-in-out infinite;
          }
          
          .skeleton-header-title {
            width: 90px;
            height: 22px;
          }
          
          .skeleton-header-actions {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          
          .skeleton-icon-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
          }
          
          .skeleton-pages-list {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
          }
          
          .skeleton-page-item {
            height: 64px;
            margin-bottom: 10px;
            border-radius: 10px;
            padding: 14px;
            display: flex;
            align-items: center;
            gap: 14px;
            background: #1e293b;
            border: 1px solid #334155;
          }
          
          .skeleton-page-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            flex-shrink: 0;
          }
          
          .skeleton-page-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .skeleton-page-title {
            height: 18px;
            width: 75%;
            border-radius: 4px;
          }
          
          .skeleton-page-subtitle {
            height: 14px;
            width: 55%;
            border-radius: 4px;
          }
          
          .skeleton-main-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #0f172a;
            position: relative;
          }
          
          .skeleton-top-bar {
            height: 68px;
            background: #1e293b;
            border-bottom: 1px solid #334155;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
          
          .skeleton-top-left {
            display: flex;
            gap: 20px;
            align-items: center;
          }
          
          .skeleton-logo {
            width: 140px;
            height: 28px;
            border-radius: 6px;
          }
          
          .skeleton-top-right {
            display: flex;
            gap: 12px;
            align-items: center;
          }
          
          .skeleton-btn {
            width: 110px;
            height: 38px;
            border-radius: 8px;
          }
          
          .skeleton-editor-canvas {
            flex: 1;
            margin: 24px;
            background: #1e293b;
            border-radius: 12px;
            border: 1px solid #334155;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          
          .skeleton-canvas-content {
            width: 92%;
            max-width: 1200px;
            display: flex;
            flex-direction: column;
            gap: 28px;
            padding: 48px;
          }
          
          .skeleton-hero-section {
            height: 220px;
            border-radius: 10px;
          }
          
          .skeleton-content-section {
            height: 160px;
            border-radius: 10px;
          }
          
          .skeleton-feature-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .skeleton-feature-card {
            height: 140px;
            border-radius: 10px;
          }
          
          .skeleton-tools-panel {
            width: 340px;
            height: 100vh;
            background: #1e293b;
            border-left: 1px solid #334155;
            display: flex;
            flex-direction: column;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
          }
          
          .skeleton-tools-header {
            padding: 18px;
            border-bottom: 1px solid #334155;
            background: #1e293b;
          }
          
          .skeleton-tools-title {
            width: 140px;
            height: 22px;
            margin-bottom: 14px;
            border-radius: 6px;
          }
          
          .skeleton-tabs {
            display: flex;
            gap: 10px;
          }
          
          .skeleton-tab {
            width: 90px;
            height: 36px;
            border-radius: 8px;
          }
          
          .skeleton-tools-content {
            flex: 1;
            padding: 18px;
            overflow-y: auto;
          }
          
          .skeleton-property-group {
            margin-bottom: 28px;
          }
          
          .skeleton-property-label {
            width: 120px;
            height: 16px;
            margin-bottom: 14px;
            border-radius: 4px;
          }
          
          .skeleton-property-input {
            width: 100%;
            height: 40px;
            margin-bottom: 10px;
            border-radius: 8px;
          }
          
          .skeleton-property-input-small {
            width: 65%;
            height: 40px;
            border-radius: 8px;
          }
          
          .skeleton-loader-wrapper::-webkit-scrollbar {
            width: 8px;
          }
          
          .skeleton-loader-wrapper::-webkit-scrollbar-track {
            background: #1e293b;
          }
          
          .skeleton-loader-wrapper::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 4px;
          }
          
          .skeleton-loader-wrapper::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        `}</style>
        
        <div className="skeleton-loader-wrapper">
          {/* Left Sidebar Skeleton */}
          <div className="skeleton-sidebar">
            <div className="skeleton-sidebar-header">
              <div className="skeleton-box skeleton-header-title"></div>
              <div className="skeleton-header-actions">
                <div className="skeleton-box skeleton-icon-btn"></div>
                <div className="skeleton-box skeleton-icon-btn"></div>
                <div className="skeleton-box skeleton-icon-btn"></div>
              </div>
            </div>
            <div className="skeleton-pages-list">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="skeleton-page-item">
                  <div className="skeleton-box skeleton-page-icon"></div>
                  <div className="skeleton-page-content">
                    <div className="skeleton-box skeleton-page-title"></div>
                    <div className="skeleton-box skeleton-page-subtitle"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Editor Area Skeleton */}
          <div className="skeleton-main-area">
            <div className="skeleton-top-bar">
              <div className="skeleton-top-left">
                <div className="skeleton-box skeleton-logo"></div>
              </div>
              <div className="skeleton-top-right">
                <div className="skeleton-box skeleton-btn"></div>
                <div className="skeleton-box skeleton-btn"></div>
                <div className="skeleton-box skeleton-icon-btn"></div>
                <div className="skeleton-box skeleton-icon-btn"></div>
              </div>
            </div>
            <div className="skeleton-editor-canvas">
              <div className="skeleton-canvas-content">
                <div className="skeleton-box skeleton-hero-section"></div>
                <div className="skeleton-box skeleton-content-section"></div>
                <div className="skeleton-feature-grid">
                  <div className="skeleton-box skeleton-feature-card"></div>
                  <div className="skeleton-box skeleton-feature-card"></div>
                  <div className="skeleton-box skeleton-feature-card"></div>
                </div>
                <div className="skeleton-box skeleton-content-section"></div>
                <div className="skeleton-box skeleton-content-section" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Right Tools Panel Skeleton */}
          <div className="skeleton-tools-panel">
            <div className="skeleton-tools-header">
              <div className="skeleton-box skeleton-tools-title"></div>
              <div className="skeleton-tabs">
                <div className="skeleton-box skeleton-tab"></div>
                <div className="skeleton-box skeleton-tab"></div>
                <div className="skeleton-box skeleton-tab"></div>
              </div>
            </div>
            <div className="skeleton-tools-content">
              {[1, 2, 3, 4, 5].map((group) => (
                <div key={group} className="skeleton-property-group">
                  <div className="skeleton-box skeleton-property-label"></div>
                  <div className="skeleton-box skeleton-property-input"></div>
                  <div className="skeleton-box skeleton-property-input"></div>
                  <div className="skeleton-box skeleton-property-input-small"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (apiStatus === 'failed') {
    return (
      <div className="portfolio-edit-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <h2>Error loading funnel. Please try again.</h2>
      </div>
    );
  }

  return (
    <div className={`portfolio-edit-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Professional Full Screen Skeleton Loader */}
      {isEditorLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: '#1a1a1a',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <style>{`
            @keyframes skeleton-shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            
            .skel-box {
              background: linear-gradient(
                90deg,
                #1e1e1e 0%,
                #2a2a2a 25%,
                #333333 50%,
                #2a2a2a 75%,
                #1e1e1e 100%
              );
              background-size: 400% 100%;
              animation: skeleton-shimmer 1.5s ease-in-out infinite;
              border-radius: 6px;
              position: relative;
              overflow: hidden;
            }
            
            .skel-box::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.06),
                transparent
              );
              animation: skeleton-shimmer 1.5s ease-in-out infinite;
            }
            
            .skel-top-bar {
              height: 68px;
              background: #1e1e1e;
              border-bottom: 1px solid #2d2d2d;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 24px;
              gap: 20px;
            }
            
            .skel-top-left {
              display: flex;
              align-items: center;
              gap: 12px;
              min-width: 250px;
            }
            
            .skel-top-center {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              max-width: 900px;
            }
            
            .skel-top-right {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .skel-btn {
              width: 100px;
              height: 36px;
            }
            
            .skel-btn-small {
              width: 36px;
              height: 36px;
            }
            
            .skel-page-info {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            
            .skel-page-title {
              width: 120px;
              height: 16px;
            }
            
            .skel-page-subtitle {
              width: 100px;
              height: 12px;
            }
            
            .skel-device-controls {
              display: flex;
              gap: 8px;
            }
            
            .skel-device-btn {
              width: 36px;
              height: 36px;
            }
            
            .skel-main-layout {
              flex: 1;
              display: flex;
              height: calc(100vh - 68px);
              overflow: hidden;
            }
            
            .skel-left-sidebar {
              width: 300px;
              background: #1e1e1e;
              border-right: 1px solid #2d2d2d;
              display: flex;
              flex-direction: column;
            }
            
            .skel-sidebar-header {
              padding: 16px 18px;
              border-bottom: 1px solid #2d2d2d;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            
            .skel-sidebar-title {
              width: 80px;
              height: 20px;
            }
            
            .skel-sidebar-actions {
              display: flex;
              gap: 8px;
            }
            
            .skel-sidebar-btn {
              width: 32px;
              height: 32px;
            }
            
            .skel-pages-list {
              flex: 1;
              padding: 12px;
              overflow-y: auto;
            }
            
            .skel-page-item {
              height: 64px;
              margin-bottom: 10px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 12px;
              background: #1e1e1e;
              border: 1px solid #2d2d2d;
              border-radius: 8px;
            }
            
            .skel-page-icon {
              width: 40px;
              height: 40px;
              border-radius: 6px;
              flex-shrink: 0;
            }
            
            .skel-page-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            
            .skel-page-name {
              width: 70%;
              height: 16px;
            }
            
            .skel-page-type {
              width: 50%;
              height: 12px;
            }
            
            .skel-editor-area {
              flex: 1;
              background: #1a1a1a;
              display: flex;
              flex-direction: column;
              position: relative;
            }
            
            .skel-canvas {
              flex: 1;
              margin: 20px;
              background: #252525;
              border-radius: 8px;
              border: 1px solid #2d2d2d;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            
            .skel-canvas-content {
              width: 90%;
              max-width: 1200px;
              display: flex;
              flex-direction: column;
              gap: 24px;
              padding: 40px;
            }
            
            .skel-hero {
              height: 200px;
              border-radius: 8px;
            }
            
            .skel-section {
              height: 150px;
              border-radius: 8px;
            }
            
            .skel-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
            }
            
            .skel-card {
              height: 120px;
              border-radius: 8px;
            }
            
            .skel-right-sidebar {
              width: 280px;
              background: #1e1e1e;
              border-left: 1px solid #2d2d2d;
              display: flex;
              flex-direction: column;
            }
            
            .skel-tools-header {
              padding: 16px;
              border-bottom: 1px solid #2d2d2d;
            }
            
            .skel-tools-title {
              width: 120px;
              height: 18px;
              margin-bottom: 12px;
            }
            
            .skel-tabs {
              display: flex;
              gap: 8px;
            }
            
            .skel-tab {
              width: 70px;
              height: 32px;
            }
            
            .skel-tools-content {
              flex: 1;
              padding: 16px;
              overflow: hidden;
            }
            
            .skel-right-sidebar {
              overflow: hidden;
            }
            
            .skel-pages-list {
              overflow: hidden;
            }
            
            .skel-property-group {
              margin-bottom: 24px;
            }
            
            .skel-property-label {
              width: 100px;
              height: 14px;
              margin-bottom: 12px;
            }
            
            .skel-property-input {
              width: 100%;
              height: 36px;
              margin-bottom: 8px;
            }
            
            .skel-property-input-small {
              width: 60%;
              height: 36px;
            }
          `}</style>
          
          {/* Top Header Skeleton */}
          <div className="skel-top-bar">
            <div className="skel-top-left">
              <div className="skel-box skel-btn-small"></div>
              <div className="skel-page-info">
                <div className="skel-box skel-page-title"></div>
                <div className="skel-box skel-page-subtitle"></div>
              </div>
              <div className="skel-device-controls">
                <div className="skel-box skel-device-btn"></div>
                <div className="skel-box skel-device-btn"></div>
                <div className="skel-box skel-device-btn"></div>
              </div>
            </div>
            <div className="skel-top-center">
              <div className="skel-box skel-btn"></div>
              <div className="skel-box skel-btn"></div>
              <div className="skel-box skel-btn-small"></div>
              <div className="skel-box skel-btn-small"></div>
            </div>
            <div className="skel-top-right">
              <div className="skel-box skel-btn"></div>
              <div className="skel-box skel-btn-small"></div>
              <div className="skel-box skel-btn-small"></div>
            </div>
          </div>
          
          {/* Main Layout Skeleton */}
          <div className="skel-main-layout">
            {/* Left Sidebar Skeleton */}
            <div className="skel-left-sidebar">
              <div className="skel-sidebar-header">
                <div className="skel-box skel-sidebar-title"></div>
                <div className="skel-sidebar-actions">
                  <div className="skel-box skel-sidebar-btn"></div>
                  <div className="skel-box skel-sidebar-btn"></div>
                  <div className="skel-box skel-sidebar-btn"></div>
                </div>
              </div>
              <div className="skel-pages-list">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="skel-page-item">
                    <div className="skel-box skel-page-icon"></div>
                    <div className="skel-page-content">
                      <div className="skel-box skel-page-name"></div>
                      <div className="skel-box skel-page-type"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Editor Area Skeleton */}
            <div className="skel-editor-area">
              <div className="skel-canvas">
                <div className="skel-canvas-content">
                  <div className="skel-box skel-hero"></div>
                  <div className="skel-box skel-section"></div>
                  <div className="skel-grid">
                    <div className="skel-box skel-card"></div>
                    <div className="skel-box skel-card"></div>
                    <div className="skel-box skel-card"></div>
                  </div>
                  <div className="skel-box skel-section"></div>
                  <div className="skel-box skel-section" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar Skeleton */}
            <div className="skel-right-sidebar">
              <div className="skel-tools-header">
                <div className="skel-box skel-tools-title"></div>
                <div className="skel-tabs">
                  <div className="skel-box skel-tab"></div>
                  <div className="skel-box skel-tab"></div>
                  <div className="skel-box skel-tab"></div>
                </div>
              </div>
              <div className="skel-tools-content">
                {[1, 2, 3, 4, 5].map((group) => (
                  <div key={group} className="skel-property-group">
                    <div className="skel-box skel-property-label"></div>
                    <div className="skel-box skel-property-input"></div>
                    <div className="skel-box skel-property-input"></div>
                    <div className="skel-box skel-property-input-small"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Left Sidebar - Pages Navigation */}
      <div className={`pages-sidebar ${showPagesSidebar ? 'show' : 'hide'}`}>
        <div className="pages-sidebar-header">
          <div className="header-title">
            {showBlocksPanel ? (
              <>
                <FaLayerGroup className="header-icon" />
                <h3>Layers</h3>
              </>
            ) : (
              <>
                <FaFileAlt className="header-icon" />
                <h3>Pages</h3>
              </>
            )}
          </div>
          <div className="header-actions">
            <button
              className={`blocks-toggle-btn ${showBlocksPanel ? 'active' : ''}`}
              onClick={() => setShowBlocksPanel(prev => !prev)}
              title={showBlocksPanel ? 'Show Pages' : 'Show Layers'}
            >
              <FaLayerGroup />
            </button>
            {BUILDER_PANEL_ENABLED && (
              <button
                className={`builder-panel-btn ${showBuilderPanel ? 'active' : ''}`}
                onClick={() => setShowBuilderPanel(prev => !prev)}
                title={showBuilderPanel ? 'Close Page Builder' : 'Open Page Builder'}
              >
                <FaThLarge />
              </button>
            )}
            <button
              className={`tools-toggle-btn ${isToolsPanelOpen ? 'active' : ''}`}
              onClick={toggleToolsPanel}
              title={isToolsPanelOpen ? 'Hide Builder Tools' : 'Show Builder Tools'}
            >
              <FaLayerGroup />
            </button>
            <button
              className="tools-position-btn"
              onClick={toggleToolsPanelSide}
              title={`Move builder tools to the ${toolsPanelSide === 'left' ? 'right' : 'left'} side`}
            >
              <FaExchangeAlt />
            </button>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setShowPagesSidebar(!showPagesSidebar)}
            title="Toggle Sidebar"
          >
            <FaArrowLeft />
          </button>
          </div>
        </div>

        {BUILDER_PANEL_ENABLED && showBuilderPanel && (
          <div className="builder-panel" onClick={(e) => e.stopPropagation()}>
            <div className="builder-panel-header">
              <div className="builder-panel-title">
                <FaThLarge />
                <div>
                  <h4>Page Builder</h4>
                  <p>Add sections, columns, and reusable elements</p>
                </div>
              </div>
              <button
                className="builder-panel-close-btn"
                onClick={() => setShowBuilderPanel(false)}
                title="Close builder panel"
              >
                <FaTimes />
              </button>
            </div>

            <div className="builder-panel-search">
              <input
                type="text"
                placeholder="Search elements..."
                value={builderSearchTerm}
                onChange={(e) => setBuilderSearchTerm(e.target.value)}
              />
            </div>

            <div className="builder-panel-body">
              <div className="builder-panel-nav">
                {builderNavItems.map(category => (
                  <button
                    key={category.id}
                    className={`builder-nav-item ${category.id === activeBuilderCategory ? 'active' : ''}`}
                    onClick={() => setActiveBuilderCategory(category.id)}
                  >
                    <span>{category.label}</span>
                    <span className="item-count">{category.count}</span>
                  </button>
                ))}
              </div>

              <div className="builder-panel-content">
                {builderItems.length === 0 && (
                  <div className="builder-panel-empty">
                    <p>No presets available for this category yet.</p>
                  </div>
                )}

                {builderItems.length > 0 && filteredBuilderItems.length === 0 && (
                  <div className="builder-panel-empty">
                    <p>No elements match your search.</p>
                  </div>
                )}

                {filteredBuilderItems.length > 0 && (
                  <div className="builder-blocks-grid">
                    <div className="builder-panel-instructions">
                      Drag any card onto the canvas to insert it into the page.
                    </div>
                    {filteredBuilderItems.map(item => (
                      <div
                        key={item.id}
                        className="builder-block-card"
                        draggable
                        onDragStart={(event) => handleBuilderDragStart(item, event)}
                        onDragEnd={handleBuilderDragEnd}
                        onDoubleClick={() => handleBuilderItemClick(item)}
                      >
                        <div className="block-card-header">
                          <div className="block-card-label">
                            <span className="block-title">{item.label}</span>
                            {item.description && (
                              <span className="block-description">{item.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="block-preview">
                          {renderBuilderPreview(item)}
                        </div>
                        <div className="block-card-actions">
                          <button
                            className="block-add-btn"
                            onClick={() => handleBuilderItemClick(item)}
                          >
                            <FaPlus />
                            <span>Add to Page</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Layers Panel - GrapesJS Layers/Component Tree */}
        {showBlocksPanel && (
          <div className="blocks-panel-container" id="left-sidebar-blocks-container">
            {/* This container will hold the GrapesJS layers/component tree content */}
          </div>
        )}
        
        {/* Pages List - shown when blocks panel is hidden */}
        {!showBlocksPanel && (
          <>
            <div className="pages-list">
          {stages.map((stage, index) => {
            const isActive = selectedPageId === stage.id;
            const stageTypeIcons = {
              'welcome-page': '👋',
              'vsl-page': '🎬',
              'thankyou-page': '🎉',
              'whatsapp-page': '💬',
              'product-offer': '🛍️',
              'custom-page': '📄',
              'appointment-page': '📅',
              'payment-page': '💳',
            };
            
            return (
              <div
                key={stage.id}
                className={`page-item ${isActive ? 'active' : ''} ${!stage.isEnabled ? 'disabled' : ''}`}
                onClick={() => handlePageSwitch(stage.id)}
                title={stage.name}
              >
                <div className="page-item-icon">
                  {stageTypeIcons[stage.type] || '📄'}
                </div>
                <div className="page-item-content">
                  <div className="page-item-name">{stage.name}</div>
                  <div className="page-item-type">{stage.type.replace('-', ' ')}</div>
                </div>
                <div className="page-item-order">#{index + 1}</div>
              </div>
            );
          })}
        </div>
        
        <div className="pages-sidebar-footer">
          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-value">{stages.length}</span>
              <span className="stat-label">Total Pages</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stages.filter(s => s.isEnabled !== false).length}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Sidebar Toggle Button (when sidebar is hidden) */}
      {!showPagesSidebar && (
        <button
          className="sidebar-toggle-btn-floating"
          onClick={() => setShowPagesSidebar(true)}
          title="Show Pages Sidebar"
        >
          <FaGripVertical />
        </button>
      )}

      {showTemplateSelector && currentStage && (
        <div className="modal-overlay">
          <div className="modal-content day-selector-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowTemplateSelector(false)}
            >
              ×
            </button>
            <StageTemplateSelector
              stageType={currentStage.type}
              selectedKey={getSelectedTemplateKey()}
              onSelect={handleTemplateSelect}
            />
          </div>
        </div>
      )}

      {showAIPopup && (
        <div className="modal-overlay">
          <div className="modal-content ai-modal-content">
            <AIGenerativePopup
              isLoading={isAILoading}
              onClose={() => setShowAIPopup(false)}
              onSubmit={() => {}}
            />
          </div>
        </div>
      )}

      {showCustomCodePopup && (
        <div className="modal-overlay">
          <div className="modal-content custom-code-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowCustomCodePopup(false)}
            >
              ×
            </button>
            <CustomCodePopup
              onClose={() => setShowCustomCodePopup(false)}
              onSubmit={handleCustomCodeSubmit}
            />
          </div>
        </div>
      )}

      {showHtmlUploadPopup && (
        <div className="modal-overlay">
          <div className="modal-content html-upload-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowHtmlUploadPopup(false)}
            >
              ×
            </button>
            <HtmlUploadPopup
              onClose={() => setShowHtmlUploadPopup(false)}
              onSubmit={handleHtmlUploadSubmit}
            />
          </div>
        </div>
      )}

      {showRedirectPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowRedirectPopup(false)}
            >
              ×
            </button>
            <RedirectPageSelector
              stages={stages}
              currentStageId={stageId}
              onSelect={handleRedirectSelect}
              onClose={() => setShowRedirectPopup(false)}
            />
          </div>
        </div>
      )}

      {showDaySelectorPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowDaySelectorPopup(false)}
            >
              ×
            </button>
            <DaySelectorPopup
              onSelect={handleDaySelectorSelect}
              initialSelection={daySelectorInitialSelection}
              onClose={() => setShowDaySelectorPopup(false)}
            />
          </div>
        </div>
      )}

      {/* Success Popup with Party Celebration */}
      {showSuccessPopup && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}

      {/* Modern Floating Action Bar */}
      <div className="modern-action-bar">
        <div className="action-bar-section left-section">
          <button
            onClick={handleBack}
            className="modern-btn back-btn"
            title="Back to Settings"
          >
            <FaArrowLeft />
          </button>
          
          <div className="page-info">
              <span className="page-title">{currentStage?.name || 'Editor'}</span>
            <span className="page-subtitle">Visual Page Builder</span>
          </div>

          <div className="btn-divider"></div>

          {/* Device Preview Controls - moved next to Pages sidebar */}
          <div className="device-preview-controls left-aligned-device-controls">
            <button
              onClick={() => handlePresetWidth(null)}
              className={`device-preview-btn desktop ${frameWidth === null ? 'active' : ''}`}
              title="Desktop preview"
            >
              <FaLaptop />
            </button>
            <button
              onClick={() => handlePresetWidth(1024)}
              className={`device-preview-btn tablet ${frameWidth === 1024 ? 'active' : ''}`}
              title="Tablet preview (1024px)"
            >
              <FaTabletAlt />
            </button>
            <button
              onClick={() => handlePresetWidth(414)}
              className={`device-preview-btn mobile ${frameWidth === 414 ? 'active' : ''}`}
              title="Mobile preview (414px)"
            >
              <FaMobileAlt />
            </button>
          </div>
        </div>

        <div className="action-bar-section center-section">
          <button
            onClick={() => handleSave('single')}
            className="modern-btn primary-btn"
            title="Save Current Page"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="spinner"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>Save Page</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleSave('all')}
            className="modern-btn success-btn"
            title="Save All Pages"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="spinner"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaFileExport />
                <span>Save All</span>
              </>
            )}
          </button>

          <div className="btn-divider"></div>

          {/* Frame Width Controls */}
          <div className="frame-width-controls">
            <span className="width-label">Width:</span>
            <button
              onClick={() => handlePresetWidth(800)}
              className={`modern-btn preset-width-btn ${frameWidth === 800 ? 'active' : ''}`}
              title="Small (800px)"
            >
              <span>S</span>
            </button>
            <button
              onClick={() => handlePresetWidth(1200)}
              className={`modern-btn preset-width-btn ${frameWidth === 1200 ? 'active' : ''}`}
              title="Medium (1200px)"
            >
              <span>M</span>
            </button>
            <button
              onClick={() => handlePresetWidth(1400)}
              className={`modern-btn preset-width-btn ${frameWidth === 1400 ? 'active' : ''}`}
              title="Large (1400px)"
            >
              <span>L</span>
            </button>
            <button
              onClick={() => handlePresetWidth(null)}
              className={`modern-btn preset-width-btn ${frameWidth === null ? 'active' : ''}`}
              title="Auto (Default)"
            >
              <span>A</span>
            </button>
            {frameWidth !== null && (
              <span className="current-width-display">{frameWidth}px</span>
            )}
          </div>

          <div className="btn-divider"></div>

          {/* Upload HTML File Button */}
          <button
            onClick={() => setShowHtmlUploadPopup(true)}
            className="modern-btn secondary-btn"
            title="Upload External HTML File"
          >
            <FaFileAlt />
            <span>Upload HTML</span>
          </button>

          {hasDirectForms && (
            <button
              onClick={() => setShowRedirectPopup(true)}
              className="modern-btn info-btn"
              title="Set Form Redirect"
            >
              <FaFileAlt />
              <span>Redirect</span>
            </button>
          )}

          {hasDaySelectors && (
          <button
            onClick={() => {
              console.log('📅 Day Selector button clicked');
                const canvasDocument = getDaySelectorDocument();
                const dayComponents1 = canvasDocument.querySelectorAll('.day-selector-display-widget');
                const dayComponents2 = canvasDocument.querySelectorAll('.day-selector-widget-element');
                const dayComponents3 = canvasDocument.querySelectorAll('[data-component-id*="day-selector"]');
              
              const allDayComponents = [...dayComponents1, ...dayComponents2, ...dayComponents3];
              const uniqueComponents = [...new Set(allDayComponents)];
              
                let targetElement = null;

                if (selectedComponentElement && canvasDocument.contains(selectedComponentElement)) {
                  targetElement = selectedComponentElement;
                } else if (selectedDaySelectorId) {
                  targetElement = canvasDocument.querySelector(`[data-component-id="${selectedDaySelectorId}"]`);
                }

                if (!targetElement && uniqueComponents.length > 0) {
                  targetElement = uniqueComponents[0];
                  const compId = targetElement.getAttribute('data-component-id') || 
                                 `day-selector-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                  targetElement.setAttribute('data-component-id', compId);
                setSelectedDaySelectorId(compId);
                  setSelectedComponentElement(targetElement);
                  targetElement.classList.add('selected');
                }

                if (targetElement) {
                  openDaySelectorPopupForElement(targetElement);
              } else {
                alert('⚠️ No Day Selector found!\n\n1. Drag "Day Selector" from left panel\n2. Drop it on the page\n3. Click to select\n4. Then click this button');
              }
            }}
            className="modern-btn purple-btn"
            title="Day Selector Widget"
          >
            <FaCalendarDay />
            <span>Day Selector</span>
          </button>
          )}

          <button
            onClick={() => setShowCustomCodePopup(true)}
            className="modern-btn code-btn"
            title="Add Custom Code"
          >
            <FaCode />
            <span>Custom Code</span>
          </button>
        </div>

        <div className="action-bar-section right-section">
          <button
            onClick={() => setShowAIPopup(true)}
            className="modern-btn ai-btn"
            title="AI Content Generator"
          >
            <FaMagic />
            <span>AI Content</span>
          </button>

          <button
            onClick={forceTemplateRefresh}
            className="modern-btn warning-btn"
            title="Refresh Editor"
          >
            <FaSync />
          </button>

          <button
            onClick={handleDownloadProject}
            className="modern-btn download-btn"
            title="Download HTML"
          >
            <FaDownload />
          </button>
        </div>
      </div>


        <div className={`editor-main-area ${showPagesSidebar ? 'with-sidebar' : 'full-width'} ${isToolsPanelOpen ? 'tools-panel-open' : 'tools-panel-hidden'} ${toolsPanelSide === 'left' ? 'tools-left' : 'tools-right'} ${BUILDER_PANEL_ENABLED && isBuilderDragging ? 'builder-drag-active' : ''}`}>
        <div 
          id="gjs" 
          key={`editor-${funnelId}-${forceRefreshKey}`}
          ref={editorContainerRef}
          style={{ 
            height: '100%', 
            width: '100%', 
            overflow: 'hidden', 
            position: 'relative',
            opacity: isEditorLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        ></div> {/* GrapesJS container */}
        
        {/* Resize Handle - positioned outside #gjs to avoid GrapesJS interference */}
        <div 
          className="frame-resize-handle"
          onMouseDown={handleResizeStart}
          title="Drag to resize page width"
        >
          <FaGripVertical />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .portfolio-edit-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #1a1a1a;
          color: #e5e5e5;
          transition: background-color 0.3s ease, color 0.3s ease;
          --nav-sidebar-width: 300px;
          --tools-panel-width: 280px;
          --header-bg: #1e1e1e;
          --header-border-color: #2d2d2d;
        }

        /* Dark Mode Styles - Figma-like Professional Black Theme */
        .portfolio-edit-container.dark-mode {
          background: #1a1a1a;
          color: #e5e5e5;
          --header-bg: #1e1e1e;
          --header-border-color: #2d2d2d;
        }

        .dark-mode-toggle {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
          color: #fff !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-mode-toggle:hover {
          background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(148, 163, 184, 0.3) !important;
        }

        .dark-mode-toggle.dark-active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
          color: #1e293b !important;
        }

        .dark-mode-toggle.dark-active:hover {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        }

        /* Left Sidebar - Pages Navigation - Figma Style */
        .pages-sidebar {
          position: fixed;
          left: 0;
          top: 68px;
          width: var(--nav-sidebar-width);
          height: calc(100vh - 68px);
          background: #1e1e1e;
          border-right: 1px solid #2d2d2d;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          z-index: 1002;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, border-color 0.3s ease;
        }

        .pages-sidebar.hide {
          transform: translateX(-100%);
        }

        .pages-sidebar.show {
          transform: translateX(0);
        }

        .pages-sidebar.hide {
          transform: translateX(-100%);
        }

        .pages-sidebar.show {
          transform: translateX(0);
        }

        .pages-sidebar-header {
          padding: 16px 18px;
          background: #1e1e1e;
          border-bottom: 1px solid #2d2d2d;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #e5e5e5;
        }

        .header-title .header-icon {
          font-size: 20px;
          color: #18a0fb;
        }

        .header-title h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.2px;
          color: #e5e5e5;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .blocks-toggle-btn,
        .builder-panel-btn,
        .tools-toggle-btn,
        .tools-position-btn,
        .sidebar-toggle-btn {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          color: #1e293b;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .dark-mode .blocks-toggle-btn,
        .dark-mode .builder-panel-btn,
        .dark-mode .tools-toggle-btn,
        .dark-mode .tools-position-btn,
        .dark-mode .sidebar-toggle-btn {
          background: #2d2d2d;
          border: 1px solid #3a3a3a;
          color: #e5e5e5;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
        }

        .blocks-toggle-btn:hover,
        .builder-panel-btn:hover,
        .tools-toggle-btn:hover,
        .tools-position-btn:hover,
        .sidebar-toggle-btn:hover {
          background: #f1f5f9;
          border-color: #e5e7eb;
          color: #2563eb;
          transform: translateY(-1px);
        }

        .dark-mode .blocks-toggle-btn:hover,
        .dark-mode .builder-panel-btn:hover,
        .dark-mode .tools-toggle-btn:hover,
        .dark-mode .tools-position-btn:hover,
        .dark-mode .sidebar-toggle-btn:hover {
          background: #3a3a3a;
          border-color: #4a4a4a;
          color: #18a0fb;
          transform: translateY(-1px);
        }

        /* Right Sidebar (GrapesJS views) - Dark Theme */
        .gjs-pn-panel.gjs-pn-views-container,
        .gjs-pn-panel[data-pn-type="views-container"] {
          background: var(--header-bg) !important;
          border-left: 1px solid var(--header-border-color) !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.45) !important;
          color: #e5e5e5 !important;
        }

        /* Force all children of the right panel to inherit dark theme */
        .gjs-pn-panel.gjs-pn-views-container *,
        .gjs-pn-panel[data-pn-type="views-container"] * {
          color: #e5e5e5 !important;
          border-color: #2d2d2d !important;
        }

        /* Core backgrounds for views, lists, and sections */
        .gjs-pn-panel.gjs-pn-views-container .gjs-pn-views,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-pn-views,
        .gjs-pn-panel.gjs-pn-views-container .gjs-pn-panel,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-pn-panel,
        .gjs-pn-panel.gjs-pn-views-container .gjs-layers,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-layers,
        .gjs-pn-panel.gjs-pn-views-container .gjs-blocks-c,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-blocks-c,
        .gjs-pn-panel.gjs-pn-views-container .gjs-sm-sectors,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-sm-sectors,
        .gjs-pn-panel.gjs-pn-views-container .gjs-traits-wrapper,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-traits-wrapper {
          background: var(--header-bg) !important;
        }

        /* List and item backgrounds */
        .gjs-pn-panel.gjs-pn-views-container .gjs-block-category,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-block-category,
        .gjs-pn-panel.gjs-pn-views-container .gjs-layer-item,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-layer-item,
        .gjs-pn-panel.gjs-pn-views-container .gjs-sm-sector,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-sm-sector,
        .gjs-pn-panel.gjs-pn-views-container .gjs-trt-trait,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-trt-trait {
          background: var(--header-bg) !important;
          border-color: var(--header-border-color) !important;
        }

        /* Force GrapesJS base theme tokens to dark */
        .gjs-one-bg {
          background-color: #1e1e1e !important;
        }
        .gjs-two-color,
        .gjs-four-color,
        .gjs-field,
        .gjs-field input,
        .gjs-field select,
        .gjs-field textarea {
          color: #e5e5e5 !important;
        }
        .gjs-three-bg,
        .gjs-field,
        .gjs-sm-sector,
        .gjs-traits-label {
          background-color: #252525 !important;
        }
        .gjs-border-color,
        .gjs-field,
        .gjs-sm-sector,
        .gjs-traits-label {
          border-color: #2d2d2d !important;
        }

        .gjs-pn-panel.gjs-pn-views-container .gjs-pn-btn,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-pn-btn {
          color: #e5e5e5 !important;
        }

        .gjs-pn-panel.gjs-pn-views-container .gjs-pn-btn:hover,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-pn-btn:hover {
          background: #2d2d2d !important;
          color: #18a0fb !important;
        }

        .gjs-pn-panel.gjs-pn-views-container .gjs-pn-btn.gjs-pn-active,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-pn-btn.gjs-pn-active {
          background: #18a0fb !important;
          color: #ffffff !important;
        }

        .gjs-pn-panel.gjs-pn-views-container .gjs-pn-views,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-pn-views {
          background: #1e1e1e !important;
        }

        .gjs-pn-panel.gjs-pn-views-container .gjs-title,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-title,
        .gjs-pn-panel.gjs-pn-views-container .gjs-layer-title,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-layer-title {
          color: #e5e5e5 !important;
        }

        .gjs-pn-panel.gjs-pn-views-container .gjs-block,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-block {
          background: #252525 !important;
          border: 1px solid #2d2d2d !important;
          color: #e5e5e5 !important;
        }

        .gjs-pn-panel.gjs-pn-views-container .gjs-block:hover,
        .gjs-pn-panel[data-pn-type="views-container"] .gjs-block:hover {
          background: #2d2d2d !important;
          border-color: #3a3a3a !important;
        }

        .blocks-toggle-btn.active,
        .builder-panel-btn.active,
        .tools-toggle-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-color: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .dark-mode .blocks-toggle-btn.active,
        .dark-mode .builder-panel-btn.active,
        .dark-mode .tools-toggle-btn.active {
          background: #18a0fb;
          border-color: #18a0fb;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(24, 160, 251, 0.35);
        }

        .builder-panel {
          position: fixed;
          top: 68px;
          left: 60px;
          width: 360px;
          height: calc(100vh - 80px);
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          z-index: 2000;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
          animation: builderSlideIn 0.25s ease;
        }

        .dark-mode .builder-panel {
          background: #0f172a;
          border-right-color: #1f2a3d;
        }

        @keyframes builderSlideIn {
          from { transform: translate(-10px, 10px); opacity: 0; }
          to { transform: translate(0, 0); opacity: 1; }
        }

        .builder-panel-header {
          padding: 16px 20px 8px 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .builder-panel-title {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          color: #0f172a;
        }

        .dark-mode .builder-panel-title {
          color: #e2e8f0;
        }

        .builder-panel-title h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .builder-panel-title p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .dark-mode .builder-panel-title p {
          color: #94a3b8;
        }

        .builder-panel-close-btn {
          background: transparent;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .builder-panel-close-btn:hover {
          background: rgba(15, 23, 42, 0.08);
          color: #0f172a;
        }

        .dark-mode .builder-panel-close-btn:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #e2e8f0;
        }

        .builder-panel-search {
          padding: 0 20px 12px;
        }

        .builder-panel-search input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .builder-panel-search input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .dark-mode .builder-panel-search input {
          background: #1f2937;
          border-color: #334155;
          color: #e2e8f0;
        }

        .builder-panel-body {
          flex: 1;
          display: flex;
          gap: 10px;
          overflow: hidden;
          padding: 0 20px 20px 20px;
        }

        .builder-panel-nav {
          width: 140px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 8px;
          overflow-y: auto;
        }

        .builder-nav-item {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .builder-nav-item.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
        }

        .builder-nav-item .item-count {
          font-size: 11px;
          background: rgba(15, 23, 42, 0.08);
          padding: 3px 8px;
          border-radius: 999px;
          color: inherit;
        }

        .builder-panel-content {
          flex: 1;
          overflow-y: auto;
        }

        .dark-mode .builder-panel-content {
          background: #111827;
        }

        .builder-panel-empty {
          padding: 24px;
          text-align: center;
          color: #94a3b8;
        }

        .builder-blocks-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .builder-panel-instructions {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          text-align: center;
        }

        .block-preview {
          margin: 16px 0;
          padding: 12px;
          border: 1px dashed #cbd5f5;
          border-radius: 12px;
          background: #f8fafc;
        }

        .builder-block-card {
          cursor: grab;
        }

        .builder-block-card:active {
          cursor: grabbing;
        }

        .dark-mode .block-preview {
          background: #1f2937;
          border-color: #334155;
        }

        .preview-grid {
          display: grid;
          gap: 8px;
        }

        .preview-cell {
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%);
          opacity: 0.8;
        }

        .preview-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preview-text span {
          display: block;
          height: 10px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.6);
        }

        .preview-button {
          height: 32px;
          border-radius: 999px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-media {
          height: 56px;
          border-radius: 12px;
          background: #0f172a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }

        .preview-banner {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .preview-banner span {
          height: 12px;
          border-radius: 4px;
          background: rgba(249, 115, 22, 0.4);
        }

        .preview-token {
          padding: 6px 10px;
          border-radius: 999px;
          background: #e0f2fe;
          color: #0f172a;
          font-weight: 600;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .builder-block-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
        }

        .dark-mode .builder-block-card {
          background: linear-gradient(135deg, #1f2937 0%, #0f172a 100%);
          border-color: #1e293b;
        }

        .block-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .block-card-label {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .block-title {
          font-weight: 700;
          font-size: 14px;
          color: #0f172a;
        }

        .dark-mode .block-title {
          color: #e2e8f0;
        }

        .block-description {
          font-size: 12px;
          color: #64748b;
        }

        .dark-mode .block-description {
          color: #94a3b8;
        }

        .block-card-actions {
          display: flex;
          justify-content: flex-end;
        }

        .block-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 600;
          border-radius: 999px;
          padding: 8px 16px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .block-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(37, 99, 235, 0.4);
        }

        .sidebar-toggle-btn-floating {
          position: fixed;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: #18a0fb;
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          border: 1px solid #18a0fb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(24, 160, 251, 0.4);
          transition: all 0.2s ease;
          z-index: 1002;
        }

        .sidebar-toggle-btn-floating:hover {
          background: #0d8ce8;
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 6px 16px rgba(24, 160, 251, 0.5);
        }

        .pages-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pages-list::-webkit-scrollbar {
          width: 6px;
        }

        .pages-list::-webkit-scrollbar-track {
          background: #1e1e1e;
          border-radius: 10px;
        }

        .pages-list::-webkit-scrollbar-thumb {
          background: #18a0fb;
          border-radius: 10px;
        }

        .dark-mode .pages-list::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .dark-mode .pages-list::-webkit-scrollbar-thumb {
          background: #18a0fb;
        }

        .page-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #252525;
          border: 1px solid #2d2d2d;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          color: #e5e5e5;
        }

        .dark-mode .page-item {
          background: #252525;
          border-color: #2d2d2d;
          color: #e5e5e5;
        }

        .dark-mode .page-item:hover {
          background: #2d2d2d;
          border-color: #3a3a3a;
        }

        .dark-mode .page-item.active {
          background: #18a0fb;
          border-color: #18a0fb;
          color: #ffffff;
        }

        .page-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #18a0fb;
          transform: scaleY(0);
          transition: transform 0.2s ease;
        }

        .page-item:hover {
          background: #2d2d2d;
          border-color: #3a3a3a;
          transform: translateX(2px);
        }

        .page-item:hover::before {
          transform: scaleY(1);
        }

        .page-item.active {
          background: #18a0fb;
          border-color: #18a0fb;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(24, 160, 251, 0.3);
        }

        .page-item.active::before {
          transform: scaleY(1);
          background: rgba(255, 255, 255, 0.3);
        }

        .page-item.active .page-item-name,
        .page-item.active .page-item-type,
        .page-item.active .page-item-order {
          color: white;
        }

        .page-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-item.disabled:hover {
          transform: none;
          background: white;
          border-color: #e5e7eb;
        }

        .page-item-icon {
          font-size: 24px;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 50%);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .page-item:hover .page-item-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .page-item.active .page-item-icon {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .page-item-content {
          flex: 1;
          min-width: 0;
        }

        .page-item-name {
          font-size: 14px;
          font-weight: 700;
          color: #e5e5e5;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.2px;
        }

        .page-item-type {
          font-size: 11px;
          font-weight: 500;
          color: #cbd5e1;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .page-item-order {
          font-size: 12px;
          font-weight: 700;
          color: #cbd5e1;
          background: #2d2d2d;
          padding: 4px 10px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .page-item.active .page-item-order {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .pages-sidebar-footer {
          padding: 16px;
          background: #252525;
          border-top: 1px solid #2d2d2d;
        }

        .sidebar-stats {
          display: flex;
          gap: 12px;
          justify-content: space-around;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px;
          background: #2d2d2d;
          border-radius: 8px;
          flex: 1;
          border: 1px solid #3a3a3a;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #18a0fb;
          line-height: 1;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Blocks Panel Container in Left Sidebar - Figma Style */
        .blocks-panel-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          background: #1e1e1e;
          display: flex;
          flex-direction: column;
          min-height: 0;
          position: relative;
        }

        .dark-mode .blocks-panel-container {
          background: #1e1e1e;
        }

        .blocks-panel-container .gjs-blocks-c,
        .blocks-panel-container .gjs-blocks {
          padding: 12px;
          height: 100%;
          overflow-y: auto;
        }

        .blocks-panel-container .gjs-layer-wrapper,
        .blocks-panel-container .gjs-layers,
        .blocks-panel-container .gjs-pn-view-content,
        .blocks-panel-container .gjs-pn-view {
          padding: 0 !important;
          height: 100% !important;
          min-height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          width: 100% !important;
          background: #ffffff !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .dark-mode .blocks-panel-container .gjs-layer-wrapper,
        .dark-mode .blocks-panel-container .gjs-layers,
        .dark-mode .blocks-panel-container .gjs-pn-view-content,
        .dark-mode .blocks-panel-container .gjs-pn-view {
          background: #1e1e1e !important;
        }

        .blocks-panel-container .gjs-layer-item,
        .blocks-panel-container .gjs-layer {
          cursor: pointer !important;
          display: block !important;
          visibility: visible !important;
        }

        /* Ensure all layers content is visible */
        .blocks-panel-container .gjs-layer,
        .blocks-panel-container .gjs-layer-item,
        .blocks-panel-container [data-layer-item] {
          visibility: visible !important;
          display: flex !important;
          opacity: 1 !important;
        }

        .blocks-panel-container .gjs-block-category {
          margin-bottom: 16px;
        }

        .blocks-panel-container .gjs-block {
          margin: 4px;
        }

        /* Modern Action Bar - Top Header - Figma Style */
        .modern-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: var(--header-bg);
          border-bottom: 1px solid var(--header-border-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          z-index: 1002;
          gap: 20px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 68px;
          min-height: 68px;
          max-height: 68px;
          box-sizing: border-box;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .dark-mode .modern-action-bar {
        background: var(--header-bg);
        border-bottom-color: var(--header-border-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .action-bar-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-bar-section.left-section {
          min-width: 250px;
          flex: 0 0 auto;
        }

        .left-aligned-device-controls {
          margin-left: 8px;
          flex-shrink: 0;
        }

        .action-bar-section.center-section {
          flex: 1;
          justify-content: center;
          max-width: 900px;
          background: #252525;
          padding: 6px;
          border-radius: 8px;
          border: 1px solid #2d2d2d;
        }

        .action-bar-section.right-section {
          min-width: 200px;
          justify-content: flex-end;
        }

        .page-info {
          display: flex;
          flex-direction: column;
          margin-left: 16px;
        }

        .page-title {
          color: #e5e5e5;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .page-subtitle {
          color: #999999;
          font-size: 12px;
          font-weight: 500;
          margin-top: 2px;
        }

        /* Modern Button Styles */
        .modern-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
          letter-spacing: -0.2px;
        }

        .modern-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .modern-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .modern-btn:active {
          transform: scale(0.96);
        }

        .modern-btn svg {
          font-size: 16px;
          position: relative;
          z-index: 1;
        }

        .modern-btn span {
          position: relative;
          z-index: 1;
        }

        /* Button Color Variants - Figma Style */
        .back-btn {
          background: #2d2d2d;
          color: #b3b3b3;
          padding: 11px;
          border: 1px solid #3a3a3a;
        }

        .back-btn:hover {
          background: #3a3a3a;
          color: #e5e5e5;
          border-color: #4a4a4a;
          transform: translateX(-3px);
        }

        .primary-btn {
          background: #18a0fb;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(24, 160, 251, 0.3);
          border: 1px solid #18a0fb;
        }

        .primary-btn:hover {
          background: #0d8ce8;
          box-shadow: 0 4px 12px rgba(24, 160, 251, 0.4);
          transform: translateY(-1px);
        }

        .success-btn {
          background: #18a0fb;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(24, 160, 251, 0.3);
          border: 1px solid #18a0fb;
        }

        .success-btn:hover {
          background: #0d8ce8;
          box-shadow: 0 4px 12px rgba(24, 160, 251, 0.4);
          transform: translateY(-1px);
        }

        .info-btn {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-btn:hover {
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
          box-shadow: 0 6px 24px rgba(6, 182, 212, 0.45);
          transform: translateY(-2px);
        }

        .purple-btn {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .purple-btn:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.45);
          transform: translateY(-2px);
        }

        .ai-btn {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(236, 72, 153, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ai-btn:hover {
          background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
          box-shadow: 0 6px 24px rgba(236, 72, 153, 0.45);
          transform: translateY(-2px);
        }

        .warning-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #fff;
          padding: 11px;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .warning-btn:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          box-shadow: 0 6px 24px rgba(245, 158, 11, 0.45);
          transform: rotate(180deg) scale(1.05);
        }

        .download-btn {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #fff;
          padding: 11px;
          box-shadow: 0 4px 14px rgba(20, 184, 166, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .download-btn:hover {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          box-shadow: 0 6px 24px rgba(20, 184, 166, 0.45);
          transform: translateY(-2px);
        }


        .btn-divider {
          width: 1px;
          height: 32px;
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
          margin: 0 8px;
        }

        /* Device Preview Controls */
        .device-preview-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #252525;
          padding: 4px 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 1px solid #2d2d2d;
        }

        .device-preview-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid #3a3a3a;
          color: #b3b3b3;
          background: transparent;
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 0;
        }

        .device-preview-btn.desktop {
          width: 38px;
          height: 34px;
          font-size: 18px;
        }

        .device-preview-btn.tablet {
          width: 30px;
          height: 26px;
          font-size: 16px;
        }

        .device-preview-btn.mobile {
          width: 24px;
          height: 24px;
          font-size: 14px;
        }

        .device-preview-btn:hover {
          border-color: #18a0fb;
          color: #e5e5e5;
        }

        .device-preview-btn.active {
          border-color: #18a0fb;
          box-shadow: 0 0 0 2px rgba(24, 160, 251, 0.2);
          color: #18a0fb;
          background: rgba(24, 160, 251, 0.1);
        }

        /* Frame Width Controls */
        .frame-width-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #2d2d2d;
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #3a3a3a;
        }

        .width-label {
          color: #999999;
          font-size: 12px;
          font-weight: 600;
          margin-right: 4px;
        }

        .preset-width-btn {
          padding: 8px 14px !important;
          min-width: 40px;
          font-weight: 700;
          font-size: 13px;
          background: #3a3a3a !important;
          border: 1px solid #4a4a4a !important;
          color: #b3b3b3 !important;
          cursor: pointer;
        }

        .preset-width-btn:hover {
          background: #4a4a4a !important;
          color: #e5e5e5 !important;
          transform: translateY(-1px);
        }

        .preset-width-btn.active {
          background: #18a0fb !important;
          border-color: #18a0fb !important;
          color: #ffffff !important;
          box-shadow: 0 2px 8px rgba(24, 160, 251, 0.3) !important;
        }

        .current-width-display {
          color: #e5e5e5;
          font-size: 12px;
          font-weight: 600;
          margin-left: 4px;
          padding: 4px 8px;
          background: rgba(24, 160, 251, 0.2);
          border-radius: 6px;
          border: 1px solid rgba(24, 160, 251, 0.3);
        }

        /* Frame Resize Handle - Figma Style */
        .frame-resize-handle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 100px;
          background: #18a0fb;
          border-radius: 8px 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ew-resize;
          z-index: 10000;
          box-shadow: -4px 0 16px rgba(24, 160, 251, 0.4);
          transition: opacity 0.3s ease, width 0.3s ease, box-shadow 0.3s ease;
          color: white;
          opacity: 0.8;
          pointer-events: auto;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .frame-resize-handle:hover {
          opacity: 1;
          width: 36px;
          box-shadow: -6px 0 20px rgba(24, 160, 251, 0.6);
          background: #0d8ce8;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .frame-resize-handle:active {
          opacity: 1;
          background: #0b7dd1;
          width: 32px;
        }

        .frame-resize-handle svg {
          font-size: 16px;
          opacity: 1;
        }

        .frame-resize-handle:hover svg {
          opacity: 1;
          transform: scale(1.1);
        }

        /* Editor Main Area - Optimized for full view - Figma Style */
        .editor-main-area {
          flex: 1;
          position: relative;
          height: calc(100vh - 68px);
          width: 100%;
          overflow: hidden;
          background: #1a1a1a;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease;
          padding-top: 0;
          margin-top: 68px;
        }

        .editor-main-area.builder-drag-active::after {
          content: 'Release to drop section';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 16px 24px;
          border-radius: 8px;
          background: #18a0fb;
          color: #fff;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(24, 160, 251, 0.4);
          pointer-events: none;
          z-index: 5;
        }

        .dark-mode .editor-main-area {
          background: #1a1a1a;
        }

        .editor-main-area.with-sidebar {
          margin-left: var(--nav-sidebar-width);
          width: calc(100% - var(--nav-sidebar-width));
        }

        .editor-main-area.full-width {
          margin-left: 0;
          width: 100%;
        }

        .editor-main-area.with-sidebar.tools-panel-open.tools-left {
          margin-left: calc(var(--nav-sidebar-width) + var(--tools-panel-width));
          margin-right: 0;
          width: calc(100% - (var(--nav-sidebar-width) + var(--tools-panel-width)));
        }

        .editor-main-area.with-sidebar.tools-panel-hidden.tools-left {
          margin-left: var(--nav-sidebar-width);
          margin-right: 0;
          width: calc(100% - var(--nav-sidebar-width));
        }

        .editor-main-area.full-width.tools-panel-open.tools-left {
          margin-left: var(--tools-panel-width);
          margin-right: 0;
          width: calc(100% - var(--tools-panel-width));
        }

        .editor-main-area.full-width.tools-panel-hidden.tools-left {
          margin-left: 0;
          margin-right: 0;
          width: 100%;
        }

        .editor-main-area.with-sidebar.tools-panel-open.tools-right {
          margin-left: var(--nav-sidebar-width);
          margin-right: var(--tools-panel-width);
          width: calc(100% - (var(--nav-sidebar-width) + var(--tools-panel-width)));
        }

        .editor-main-area.with-sidebar.tools-panel-hidden.tools-right {
          margin-left: var(--nav-sidebar-width);
          margin-right: 0;
          width: calc(100% - var(--nav-sidebar-width));
        }

        .editor-main-area.full-width.tools-panel-open.tools-right {
          margin-left: 0;
          margin-right: var(--tools-panel-width);
          width: calc(100% - var(--tools-panel-width));
        }

        .editor-main-area.full-width.tools-panel-hidden.tools-right {
          margin-left: 0;
          margin-right: 0;
          width: 100%;
        }

        /* Adjust for right sidebar on different screen sizes */
        @media (min-width: 1920px) {
          .portfolio-edit-container {
            --tools-panel-width: 300px;
          }
        }

        @media (max-width: 1400px) {
          .portfolio-edit-container {
            --tools-panel-width: 260px;
          }
        }

        @media (max-width: 1200px) {
          .portfolio-edit-container {
            --tools-panel-width: 240px;
          }
        }

        @media (max-width: 768px) {
          .editor-main-area.with-sidebar {
            margin-left: 0;
            margin-right: 0;
            margin-bottom: 50vh;
            width: 100%;
          }
          .editor-main-area.full-width {
            margin-right: 0;
            margin-bottom: 50vh;
            width: 100%;
          }
          .editor-main-area.tools-panel-open.with-sidebar,
          .editor-main-area.tools-panel-open.full-width {
            margin-left: 0;
          }
        }

        /* Ensure no extra spacing from top */
        .portfolio-edit-container .editor-main-area {
          top: 0;
          padding-top: 0;
        }

        #gjs {
          position: relative !important;
          height: 100% !important;
          width: 100% !important;
          overflow: hidden !important;
        }

        /* Canvas Container - Center aligned with top padding - Figma Style */
        .gjs-cv-canvas {
          width: 100% !important;
          height: 100% !important;
          overflow: auto !important;
          background: #1a1a1a !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          padding: 60px 20px 20px 20px !important;
          transition: background 0.3s ease !important;
        }

        .dark-mode .gjs-cv-canvas {
          background: #1a1a1a !important;
        }

        /* Canvas Frame Wrapper - Center with max-width */
        .gjs-cv-canvas__frames {
          width: 100% !important;
          max-width: 1400px !important;
          margin: 0 auto !important;
          display: flex !important;
          justify-content: center !important;
        }

        /* Main Frame (Website Preview) - Center with controlled width - Figma Style */
        .gjs-frame {
          width: 100% !important;
          max-width: 1400px !important;
          min-width: 320px !important;
          height: auto !important;
          min-height: calc(100vh - 108px) !important;
          border: 1px solid #2d2d2d !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3) !important;
          border-radius: 8px !important;
          background: #ffffff !important;
          margin: 0 auto !important;
          display: block !important;
        }

        /* Override media queries when custom width is set */
        .gjs-frame.custom-width-set {
          max-width: inherit !important;
        }

        /* Override all media query max-widths for custom width */
        @media (min-width: 1920px) {
          .gjs-frame.custom-width-set {
            max-width: inherit !important;
          }
        }

        @media (max-width: 1600px) {
          .gjs-frame.custom-width-set {
            max-width: inherit !important;
          }
        }

        @media (max-width: 1400px) {
          .gjs-frame.custom-width-set {
            max-width: inherit !important;
          }
        }

        @media (max-width: 1200px) {
          .gjs-frame.custom-width-set {
            max-width: inherit !important;
          }
        }

        @media (max-width: 1024px) {
          .gjs-frame.custom-width-set {
            max-width: inherit !important;
          }
        }

        @media (max-width: 768px) {
          .gjs-frame.custom-width-set {
            max-width: inherit !important;
          }
        }

        /* Frame Wrapper - Center alignment */
        .gjs-frame-wrapper {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          padding: 0 !important;
        }

        /* Responsive widths for different screens */
        @media (min-width: 1920px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 1600px !important;
          }
        }

        @media (max-width: 1600px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 1300px !important;
          }
        }

        @media (max-width: 1400px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 1100px !important;
          }
          .gjs-cv-canvas {
            padding: 50px 18px 18px 18px !important;
          }
        }

        @media (max-width: 1200px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 900px !important;
          }
          .gjs-cv-canvas {
            padding: 45px 15px 15px 15px !important;
          }
        }

        @media (max-width: 1024px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 800px !important;
          }
          .gjs-cv-canvas {
            padding: 40px 12px 12px 12px !important;
          }
        }

        @media (max-width: 768px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 100% !important;
          }
          .gjs-cv-canvas {
            padding: 35px 10px 10px 10px !important;
          }
        }

        /* Modern GrapesJS Panel Customization */
        .gjs-pn-panel {
 
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.03) !important;
        }

        /* Optimized Panel Width - Reduced for more canvas space */
        .gjs-pn-panel.gjs-pn-views-container {
          width: 280px !important;
          min-width: 280px !important;
          max-width: 280px !important;
        }

        /* All Panel Types Width - Reduced for better canvas view */
        .gjs-pn-panel[data-pn-type="views-container"],
        .gjs-pn-panel[data-pn-type="blocks"],
        .gjs-pn-panel[data-pn-type="layers"],
        .gjs-pn-panel[data-pn-type="traits"],
        .gjs-pn-panel[data-pn-type="style-manager"] {
          width: 280px !important;
          min-width: 280px !important;
          max-width: 280px !important;
        }

        /* Left Panel - Blocks Panel Optimization */
        .gjs-pn-panel[data-pn-type="views"] {
          width: 60px !important;
          min-width: 60px !important;
        }

        /* Responsive Panel Width Adjustments */
        @media (min-width: 1920px) {
          .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel[data-pn-type="views-container"],
          .gjs-pn-panel[data-pn-type="blocks"],
          .gjs-pn-panel[data-pn-type="layers"],
          .gjs-pn-panel[data-pn-type="traits"],
          .gjs-pn-panel[data-pn-type="style-manager"] {
            width: 300px !important;
            min-width: 300px !important;
            max-width: 300px !important;
          }
        }

        @media (max-width: 1400px) {
          .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel[data-pn-type="views-container"],
          .gjs-pn-panel[data-pn-type="blocks"],
          .gjs-pn-panel[data-pn-type="layers"],
          .gjs-pn-panel[data-pn-type="traits"],
          .gjs-pn-panel[data-pn-type="style-manager"] {
            width: 260px !important;
            min-width: 260px !important;
            max-width: 260px !important;
          }
        }

        @media (max-width: 1200px) {
          .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel[data-pn-type="views-container"],
          .gjs-pn-panel[data-pn-type="blocks"],
          .gjs-pn-panel[data-pn-type="layers"],
          .gjs-pn-panel[data-pn-type="traits"],
          .gjs-pn-panel[data-pn-type="style-manager"] {
            width: 240px !important;
            min-width: 240px !important;
            max-width: 240px !important;
          }
        }

        /* All Panel Types - Default White Background (overridden by dark mode) */
        .gjs-pn-panel:not(.dark-mode *),
        .gjs-pn-panel:not(.dark-mode *) *,
        .gjs-pn-views-container:not(.dark-mode *),
        .gjs-pn-views-container:not(.dark-mode *) *,
        .gjs-blocks-c:not(.dark-mode *),
        .gjs-blocks-c:not(.dark-mode *) *,
        .gjs-layer-wrapper:not(.dark-mode *),
        .gjs-layer-wrapper:not(.dark-mode *) *,
        .gjs-trt-traits:not(.dark-mode *),
        .gjs-trt-traits:not(.dark-mode *) *,
        .gjs-sm-sectors:not(.dark-mode *),
        .gjs-sm-sectors:not(.dark-mode *) *,
        .gjs-sm-sector:not(.dark-mode *),
        .gjs-sm-sector:not(.dark-mode *) *,
        .gjs-sm-properties:not(.dark-mode *),
        .gjs-sm-properties:not(.dark-mode *) *,
        .gjs-pn-views:not(.dark-mode *),
        .gjs-pn-views:not(.dark-mode *) * {
          background-color: #1e1e1e !important;
          color: #e5e5e5 !important;
        }

        /* Specific Panel Overrides - Default (overridden by dark mode) */
        .gjs-pn-panel[data-pn-type="views-container"]:not(.dark-mode *),
        .gjs-pn-panel[data-pn-type="blocks"]:not(.dark-mode *),
        .gjs-pn-panel[data-pn-type="layers"]:not(.dark-mode *),
        .gjs-pn-panel[data-pn-type="traits"]:not(.dark-mode *),
        .gjs-pn-panel[data-pn-type="style-manager"]:not(.dark-mode *) {
          background: var(--header-bg) !important;
        }

        /* Remove default GrapesJS device buttons (replaced with custom controls) */
        .gjs-pn-devices,
        .gjs-pn-devices-c,
        .gjs-pn-panel .gjs-pn-btn.gjs-pn-device {
          display: none !important;
        }

        /* Force White Background for All Panel Content - Default (overridden by dark mode) */
        .gjs-pn-panel:not(.dark-mode *) .gjs-pn-panel,
        .gjs-pn-panel:not(.dark-mode *) .gjs-pn-panel *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-pn-views-container,
        .gjs-pn-panel:not(.dark-mode *) .gjs-pn-views-container *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-blocks-c,
        .gjs-pn-panel:not(.dark-mode *) .gjs-blocks-c *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-layer-wrapper,
        .gjs-pn-panel:not(.dark-mode *) .gjs-layer-wrapper *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-trt-traits,
        .gjs-pn-panel:not(.dark-mode *) .gjs-trt-traits *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-sm-sectors,
        .gjs-pn-panel:not(.dark-mode *) .gjs-sm-sectors *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-sm-sector,
        .gjs-pn-panel:not(.dark-mode *) .gjs-sm-sector *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-sm-properties,
        .gjs-pn-panel:not(.dark-mode *) .gjs-sm-properties *,
        .gjs-pn-panel:not(.dark-mode *) .gjs-pn-views,
        .gjs-pn-panel:not(.dark-mode *) .gjs-pn-views * {
          background-color: var(--header-bg) !important;
        }

        /* Remove Any Default Panel Styling - Default (overridden by dark mode) */
        .gjs-pn-panel:not(.dark-mode *),
        .gjs-pn-panel:not(.dark-mode *) * {
          background-image: none !important;
          background: var(--header-bg) !important;
        }

        /* Block Categories - Default White Background (overridden by dark mode) */
        .gjs-block-category:not(.dark-mode *),
        .gjs-block-category:not(.dark-mode *) *,
        .gjs-block-category:not(.dark-mode *) .gjs-blocks-c,
        .gjs-block-category:not(.dark-mode *) .gjs-blocks-c * {
          background: var(--header-bg) !important;
          background-color: var(--header-bg) !important;
          background-image: none !important;
        }

        /* Override Any Default GrapesJS Styling - Default (overridden by dark mode) */
        .gjs-pn-panel:not(.dark-mode *) *[class*="gjs-"],
        .gjs-pn-panel:not(.dark-mode *) *[class*="gjs-"] * {
          background: var(--header-bg) !important;
          background-color: var(--header-bg) !important;
          background-image: none !important;
        }

        /* Fix Text and Icon Colors in All Panels - Default (overridden by dark mode) */
        .gjs-pn-panel:not(.dark-mode *),
        .gjs-pn-panel:not(.dark-mode *) *,
        .gjs-pn-views-container:not(.dark-mode *),
        .gjs-pn-views-container:not(.dark-mode *) *,
        .gjs-blocks-c:not(.dark-mode *),
        .gjs-blocks-c:not(.dark-mode *) *,
        .gjs-layer-wrapper:not(.dark-mode *),
        .gjs-layer-wrapper:not(.dark-mode *) *,
        .gjs-trt-traits:not(.dark-mode *),
        .gjs-trt-traits:not(.dark-mode *) *,
        .gjs-sm-sectors:not(.dark-mode *),
        .gjs-sm-sectors:not(.dark-mode *) *,
        .gjs-sm-sector:not(.dark-mode *),
        .gjs-sm-sector:not(.dark-mode *) *,
        .gjs-sm-properties:not(.dark-mode *),
        .gjs-sm-properties:not(.dark-mode *) *,
        .gjs-pn-views:not(.dark-mode *),
        .gjs-pn-views:not(.dark-mode *) * {
          color: #e5e5e5 !important;
        }

        /* Specific Text Color Fixes */
        .gjs-pn-panel .gjs-pn-btn,
        .gjs-pn-panel .gjs-pn-btn *,
        .gjs-pn-panel .gjs-sm-title,
        .gjs-pn-panel .gjs-sm-title *,
        .gjs-pn-panel .gjs-sm-label,
        .gjs-pn-panel .gjs-sm-label *,
        .gjs-pn-panel .gjs-layer-title,
        .gjs-pn-panel .gjs-layer-title *,
        .gjs-pn-panel .gjs-block-label,
        .gjs-pn-panel .gjs-block-label *,
        .gjs-pn-panel .gjs-trt-trait__label,
        .gjs-pn-panel .gjs-trt-trait__label * {
          color: #e5e5e5 !important;
        }

        /* Icon Color Fixes */
        .gjs-pn-panel .gjs-pn-btn .fa,
        .gjs-pn-panel .gjs-pn-btn i,
        .gjs-pn-panel .gjs-layer__icon,
        .gjs-pn-panel .gjs-layer__eye,
        .gjs-pn-panel .gjs-sm-sector-caret,
        .gjs-pn-panel .gjs-block__media,
        .gjs-pn-panel .gjs-block__media *,
        .gjs-pn-panel .gjs-trt-trait i,
        .gjs-pn-panel .gjs-trt-trait .fa {
          color: #e5e5e5 !important;
        }

        /* Hover State Colors */
        .gjs-pn-panel .gjs-pn-btn:hover,
        .gjs-pn-panel .gjs-pn-btn:hover *,
        .gjs-pn-panel .gjs-layer:hover,
        .gjs-pn-panel .gjs-layer:hover *,
        .gjs-pn-panel .gjs-block:hover,
        .gjs-pn-panel .gjs-block:hover * {
          color: #3b82f6 !important;
        }

        /* Active State Colors */
        .gjs-pn-panel .gjs-pn-btn.gjs-pn-active,
        .gjs-pn-panel .gjs-pn-btn.gjs-pn-active *,
        .gjs-pn-panel .gjs-layer.gjs-selected,
        .gjs-pn-panel .gjs-layer.gjs-selected * {
          color: #ffffff !important;
        }

        /* Input Field Colors */
        .gjs-pn-panel input,
        .gjs-pn-panel input *,
        .gjs-pn-panel select,
        .gjs-pn-panel select *,
        .gjs-pn-panel textarea,
        .gjs-pn-panel textarea *,
        .gjs-pn-panel .gjs-field,
        .gjs-pn-panel .gjs-field * {
          color: #1e293b !important;
          background: #ffffff !important;
        }

        /* Placeholder Colors */
        .gjs-pn-panel input::placeholder,
        .gjs-pn-panel select::placeholder,
        .gjs-pn-panel textarea::placeholder,
        .gjs-pn-panel .gjs-field::placeholder {
          color: #9ca3af !important;
        }

        /* Focus State Colors */
        .gjs-pn-panel input:focus,
        .gjs-pn-panel select:focus,
        .gjs-pn-panel textarea:focus,
        .gjs-pn-panel .gjs-field:focus {
          color: #1e293b !important;
          background: #ffffff !important;
        }

        /* Button Colors */
        .gjs-pn-panel button,
        .gjs-pn-panel button *,
        .gjs-pn-panel .gjs-btn,
        .gjs-pn-panel .gjs-btn * {
          color: #1e293b !important;
        }

        /* Link Colors */
        .gjs-pn-panel a,
        .gjs-pn-panel a *,
        .gjs-pn-panel .gjs-link,
        .gjs-pn-panel .gjs-link * {
          color: #3b82f6 !important;
        }

        // /* Override Any Default GrapesJS Text Colors */
        // .gjs-pn-panel *[class*="gjs-"] {
        //   color: #1e293b !important;
        // }

        // .gjs-pn-panel *[class*="gjs-"] * {
        //   color: inherit !important;
        // }

        .gjs-pn-buttons {
          padding: 8px 4px !important;
        }
        #gjs .gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel.gjs-pn-views-container, .gjs-pn-panel[data-pn-type="views-container"]{
        background: #1e293b !important;
        }

        .gjs-pn-btn {
          border-radius: 8px !important;
          margin: 4px !important;
          transition: all 0.2s ease !important;
          border: 1px solid transparent !important;
          color:rgb(177, 177, 177) !important;
        }

        .gjs-pn-btn:hover {
          background: #f1f5f9 !important;
          border-color: #e5e7eb !important;
          transform: translateY(-1px) !important;
          color: #3b82f6 !important;
        }

        .gjs-pn-btn.gjs-pn-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        .gjs-pn-btn.gjs-pn-active *,
        .gjs-pn-btn.gjs-pn-active i,
        .gjs-pn-btn.gjs-pn-active svg,
        .gjs-pn-btn.gjs-pn-active .fa,
        .gjs-pn-btn.gjs-pn-active::before,
        .gjs-pn-btn.gjs-pn-active::after {
          color: white !important;
          fill: white !important;
          stroke: white !important;
        }

        /* Top Toolbar Commands Buttons - Fix Active State */
        .gjs-cm-btn {
          color: #1e293b !important;
          background: transparent !important;
        }

        .gjs-cm-btn *,
        .gjs-cm-btn i,
        .gjs-cm-btn svg,
        .gjs-cm-btn svg * {
          color: #1e293b !important;
          fill: #1e293b !important;
          stroke: #1e293b !important;
        }

        .gjs-cm-btn:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          color: #3b82f6 !important;
        }

        .gjs-cm-btn:hover *,
        .gjs-cm-btn:hover i,
        .gjs-cm-btn:hover svg,
        .gjs-cm-btn:hover svg * {
          color: #3b82f6 !important;
          fill: #3b82f6 !important;
          stroke: #3b82f6 !important;
        }

        /* CRITICAL: Active state with blue background and white icons */
        .gjs-cm-btn.gjs-cm-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          background-color: #3b82f6 !important;
          color: white !important;
        }

        .gjs-cm-btn.gjs-cm-active *,
        .gjs-cm-btn.gjs-cm-active i,
        .gjs-cm-btn.gjs-cm-active svg,
        .gjs-cm-btn.gjs-cm-active::before,
        .gjs-cm-btn.gjs-cm-active::after {
          color: white !important;
        }

        .gjs-cm-btn.gjs-cm-active svg *,
        .gjs-cm-btn.gjs-cm-active path,
        .gjs-cm-btn.gjs-cm-active polygon,
        .gjs-cm-btn.gjs-cm-active circle,
        .gjs-cm-btn.gjs-cm-active rect,
        .gjs-cm-btn.gjs-cm-active line {
          fill: white !important;
          stroke: white !important;
          color: white !important;
        }

        /* Commands Toolbar Container */
        .gjs-cm,
        .gjs-cm * {
          background: transparent !important;
        }

        /* Prevent white background from hiding icons - FORCE BLUE BACKGROUND */
        .gjs-cm-btn.gjs-cm-active,
        .gjs-pn-btn.gjs-pn-active,
        .gjs-btn.active,
        .gjs-btn-command.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          background-color: #3b82f6 !important;
          background-image: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }

        /* Override any white background that might be applied */
        .gjs-cm-btn.gjs-cm-active[style*="background"],
        .gjs-pn-btn.gjs-pn-active[style*="background"],
        .gjs-btn.active[style*="background"] {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          background-color: #3b82f6 !important;
        }

        /* Force icon visibility in all button states */
        .gjs-cm-btn svg,
        .gjs-pn-btn svg,
        .gjs-btn svg,
        .gjs-btn-command svg {
          pointer-events: none;
        }

        .gjs-cm-btn.gjs-cm-active svg *,
        .gjs-pn-btn.gjs-pn-active svg *,
        .gjs-btn.active svg *,
        .gjs-btn-command.active svg * {
          fill: white !important;
          stroke: white !important;
          color: white !important;
        }

        /* Force white icons in active buttons - override all possible styles */
        .gjs-cm-btn.gjs-cm-active [class*="icon"],
        .gjs-cm-btn.gjs-cm-active [class*="Icon"],
        .gjs-cm-btn.gjs-cm-active i[class*="fa"],
        .gjs-cm-btn.gjs-cm-active i[class*="icon"] {
          color: white !important;
          fill: white !important;
          stroke: white !important;
        }

        /* Ensure SVG icons are white in active state */
        .gjs-cm-btn.gjs-cm-active svg {
          color: white !important;
        }

        .gjs-cm-btn.gjs-cm-active svg path,
        .gjs-cm-btn.gjs-cm-active svg g,
        .gjs-cm-btn.gjs-cm-active svg use {
          fill: white !important;
          stroke: white !important;
          color: white !important;
        }

        /* ULTIMATE FIX: Override ALL possible white backgrounds on active buttons */
        .gjs-cm-btn.gjs-cm-active,
        .gjs-pn-btn.gjs-pn-active {
          background: #3b82f6 !important;
          background-color: #3b82f6 !important;
          background-image: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }

        /* Force all child elements to be white in active buttons */
        .gjs-cm-btn.gjs-cm-active *:not(script):not(style),
        .gjs-pn-btn.gjs-pn-active *:not(script):not(style) {
          color: white !important;
        }

        .gjs-cm-btn.gjs-cm-active svg *,
        .gjs-pn-btn.gjs-pn-active svg * {
          fill: white !important;
          stroke: white !important;
        }

        .gjs-cm-btn {
          background: transparent !important;
          border: 1px solid transparent !important;
          border-radius: 6px !important;
          padding: 6px 8px !important;
          transition: all 0.2s ease !important;
        }

        .gjs-cm-btn:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
        }

        .gjs-cm-btn.gjs-cm-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
        }

        /* Ensure icons inside active buttons are visible */
        .gjs-cm-btn.gjs-cm-active path,
        .gjs-cm-btn.gjs-cm-active polygon,
        .gjs-cm-btn.gjs-cm-active circle,
        .gjs-cm-btn.gjs-cm-active rect,
        .gjs-cm-btn.gjs-cm-active line {
          fill: white !important;
          stroke: white !important;
        }

        /* Additional button classes that might be used */
        .gjs-btn,
        .gjs-btn-command,
        .gjs-toolbar-item {
          color: #1e293b !important;
        }

        .gjs-btn:hover,
        .gjs-btn-command:hover,
        .gjs-toolbar-item:hover {
          color: #3b82f6 !important;
        }

        .gjs-btn.active,
        .gjs-btn-command.active,
        .gjs-toolbar-item.active,
        .gjs-btn[aria-pressed="true"],
        .gjs-btn-command[aria-pressed="true"],
        .gjs-toolbar-item[aria-pressed="true"] {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
        }

        .gjs-btn.active *,
        .gjs-btn-command.active *,
        .gjs-toolbar-item.active *,
        .gjs-btn.active i,
        .gjs-btn.active svg,
        .gjs-btn-command.active i,
        .gjs-btn-command.active svg,
        .gjs-toolbar-item.active i,
        .gjs-toolbar-item.active svg {
          color: white !important;
          fill: white !important;
          stroke: white !important;
        }

        /* Block Manager Styling */
        .gjs-block-category {
          border-bottom: 1px solid #e5e7eb !important;
          background: #fafbfc !important;
          transition: all 0.3s ease !important;
        }

        .gjs-block-category-title {
          color: #1e293b !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          font-size: 13px !important;
        }

        .gjs-block {
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
          border: 3px solid #cbd5e1 !important; /* thicker border for clearer separation */
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%) !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.14), 0 0 0 2px rgba(37, 99, 235, 0.08) !important; /* subtle outer glow to highlight */
          margin: 0 !important;
          position: relative !important;
          overflow: hidden !important;
          width: 100% !important;
          max-width: 100% !important;
          padding: 8px !important;
          min-height: 60px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          box-sizing: border-box !important;
        }

        .gjs-block::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%) !important;
          opacity: 0 !important;
          transition: opacity 0.3s ease !important;
          border-radius: 16px !important;
        }

        .gjs-block:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 26px rgba(59, 130, 246, 0.32), 0 0 0 3px rgba(37, 99, 235, 0.18) !important;
          border-color: #1d4ed8 !important;
          background: linear-gradient(180deg, #f8fbff 0%, #e9f2ff 100%) !important;
        }

        .gjs-block:hover::before {
          opacity: 1 !important;
        }

        /* Hide duplicate drag icons - only show one icon */
        .gjs-block__media {
          width: 24px !important;
          height: 24px !important;
          margin-bottom: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          opacity: 0.7 !important;
        }

        /* Hide any duplicate drag handle icons */
        .gjs-block .fa-grip,
        .gjs-block .gjs-drag-handle,
        .gjs-block [class*="drag"],
        .gjs-block [class*="grip"] {
          display: none !important;
        }

        .gjs-block:hover .gjs-block__media {
          opacity: 1 !important;
        }

        .gjs-block-label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          color: #475569 !important;
          text-align: center !important;
          padding: 4px 6px !important;
          position: relative !important;
          z-index: 2 !important;
          line-height: 1.4 !important;
          max-width: 100% !important;
          word-wrap: break-word !important;
          transition: color 0.2s ease !important;
        }

        .gjs-block:hover .gjs-block-label {
          color: #3b82f6 !important;
          font-weight: 600 !important;
        }

        /* Specific Block Types - Beautiful Color Schemes */
        
        /* Text Blocks */
        .gjs-block[data-type="text"] {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          border-color: #f59e0b !important;
        }

        .gjs-block[data-type="text"]:hover {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
          border-color: #d97706 !important;
        }

        /* Link Blocks */
        .gjs-block[data-type="link"] {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
          border-color: #3b82f6 !important;
        }

        .gjs-block[data-type="link"]:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          border-color: #1d4ed8 !important;
        }

        /* Image Blocks */
        .gjs-block[data-type="image"] {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
          border-color: #10b981 !important;
        }

        .gjs-block[data-type="image"]:hover {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          border-color: #047857 !important;
        }

        /* Column Blocks */
        .gjs-block[data-type="column"] {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%) !important;
          border-color: #8b5cf6 !important;
        }

        .gjs-block[data-type="column"]:hover {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
          border-color: #6d28d9 !important;
        }

        /* Video/YouTube Blocks */
        .gjs-block[data-type="video"] {
          background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%) !important;
          border-color: #ef4444 !important;
        }

        .gjs-block[data-type="video"]:hover {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          border-color: #b91c1c !important;
        }

        /* Quote Blocks */
        .gjs-block[data-type="quote"] {
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%) !important;
          border-color: #14b8a6 !important;
        }

        .gjs-block[data-type="quote"]:hover {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%) !important;
          border-color: #0f766e !important;
        }

        /* Map Blocks */
        .gjs-block[data-type="map"] {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%) !important;
          border-color: #ea580c !important;
        }

        .gjs-block[data-type="map"]:hover {
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%) !important;
          border-color: #9a3412 !important;
        }

        /* Layers Panel */
        .gjs-layer {
          border-radius: 6px !important;
          margin: 2px 4px !important;
          transition: all 0.2s ease !important;
        }

        .gjs-layer:hover {
          background: #f1f5f9 !important;
        }

        .gjs-layer.gjs-selected {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
          border-left: 3px solid #3b82f6 !important;
        }


.gjs-pn-panel input, .gjs-pn-panel input *, .gjs-pn-panel select, .gjs-pn-panel select *, .gjs-pn-panel textarea, .gjs-pn-panel textarea *, .gjs-pn-panel .gjs-field, .gjs-pn-panel .gjs-field *{
color: gray !important;
}

        /* ========================================
           RIGHT SIDEBAR - SIMPLE & PROFESSIONAL DESIGN
           ======================================== */

        /* Right Sidebar Panel - Main Container */
        #gjs .gjs-pn-panel.gjs-pn-views-container,
        .gjs-pn-panel.gjs-pn-views-container,
        .gjs-pn-panel[data-pn-type="views-container"] {
          background: #1e1e1e !important;
        
          width: 280px !important;
          min-width: 280px !important;
          max-width: 280px !important;
          position: fixed !important;
          right: 0 !important;
          top: 68px !important;
          height: calc(100vh - 68px) !important;
          max-height: calc(100vh - 68px) !important;
          z-index: 1001 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04) !important;
        }

        /* Right Sidebar Responsive Width */
        @media (min-width: 1920px) {
          #gjs .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel[data-pn-type="views-container"] {
            width: 300px !important;
            min-width: 300px !important;
            max-width: 300px !important;
          }
        }

        @media (max-width: 1400px) {
          #gjs .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel[data-pn-type="views-container"] {
            width: 260px !important;
            min-width: 260px !important;
            max-width: 260px !important;
          }
        }

        @media (max-width: 1200px) {
          #gjs .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel[data-pn-type="views-container"] {
            width: 240px !important;
            min-width: 240px !important;
            max-width: 240px !important;
          }
        }

        @media (max-width: 768px) {
          #gjs .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel.gjs-pn-views-container,
          .gjs-pn-panel[data-pn-type="views-container"] {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            position: fixed !important;
            bottom: 0 !important;
            top: auto !important;
            height: 50vh !important;
            border-left: none !important;
            border-top: 2px solid #e2e8f0 !important;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08) !important;
          }
        }

        /* Right Sidebar Views Container - Professional */
        .gjs-pn-views-container {
          background: #ffffff !important;
          height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Search Bar for Block Categories - Professional Design */
        .gjs-blocks-search-container {
          padding: 14px 12px !important;
          background: #ffffff !important;
          border-bottom: 1px solid #e2e8f0 !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 100 !important;
          margin: 0 !important;
          backdrop-filter: blur(10px) !important;
        }

        .gjs-blocks-search-input {
          width: 100% !important;
          padding: 9px 12px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          color: gray !important;
          background: #f8fafc !important;
          outline: none !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
        }

        .gjs-blocks-search-input:hover {
          border-color: #cbd5e1 !important;
          background: #ffffff !important;
        }

        .gjs-blocks-search-input:focus {
          border-color: #3b82f6 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .gjs-blocks-search-input::placeholder {
          color: #94a3b8 !important;
          font-weight: 400 !important;
        }

        /* Hide categories and blocks that don't match search */
        .gjs-blocks-c.hide-search .gjs-block-category:not([data-search-match="true"]) {
          display: none !important;
        }

        /* Hide individual blocks that don't match */
        .gjs-block:not([data-block-match="true"]) {
          display: none !important;
        }

        /* Show matching blocks */
        .gjs-block[data-block-match="true"] {
          display: flex !important;
        }

        /* Style Manager Panel Container */
        .gjs-pn-panel.gjs-pn-panel.gjs-pn-views-container {
          background: var(--header-bg) !important;
          border-left: 1px solid var(--header-border-color) !important;
        }

        /* Right Sidebar Header - Figma Style */
        .gjs-pn-views-container .gjs-pn-buttons {
          background: var(--header-bg) !important;
          border-bottom: 1px solid var(--header-border-color) !important;
          padding: 8px !important;
          display: flex !important;
          gap: 4px !important;
        }

        /* Right Sidebar Buttons - Figma Style */
        .gjs-pn-views-container .gjs-pn-btn {
          flex: 1 !important;
          padding: 10px 12px !important;
          border-radius: 6px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #b3b3b3 !important;
          background: transparent !important;
          border: none !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
        }

        .gjs-pn-views-container .gjs-pn-btn:hover {
          background: #2d2d2d !important;
          color: #e5e5e5 !important;
        }

        .gjs-pn-views-container .gjs-pn-btn.gjs-pn-active {
          background: #18a0fb !important;
          color: #ffffff !important;
          box-shadow: 0 2px 8px rgba(24, 160, 251, 0.3) !important;
        }

        .gjs-pn-views-container .gjs-pn-btn svg,
        .gjs-pn-views-container .gjs-pn-btn i {
          width: 16px !important;
          height: 16px !important;
        }

        /* Ensure Right Sidebar Panels are Always Visible */
        .gjs-pn-panel[data-pn-type="style-manager"],
        .gjs-pn-panel[data-pn-type="traits"],
        .gjs-pn-panel[data-pn-type="layers"] {
          position: relative !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 1 !important;
        }

        /* Right Sidebar Scrollbar - Figma Style */
        .gjs-pn-views-container::-webkit-scrollbar {
          width: 6px !important;
        }

        .gjs-pn-views-container::-webkit-scrollbar-track {
          background: var(--header-bg) !important;
        }

        .gjs-pn-views-container::-webkit-scrollbar-thumb {
          background: #18a0fb !important;
          border-radius: 3px !important;
          transition: background 0.2s ease !important;
        }

        .gjs-pn-views-container::-webkit-scrollbar-thumb:hover {
          background: #0d8ce8 !important;
        }

        /* Style Manager Content Area - Figma Style */
        .gjs-sm-sectors {
          background: var(--header-bg) !important;
          padding: 12px !important;
          max-height: none !important;
          overflow-y: visible !important;
          min-height: 200px !important;
        }

        /* Style Manager Container - Figma Style */
        .gjs-pn-panel[data-pn-type="style-manager"] {
          background: var(--header-bg) !important;
        }

        .gjs-pn-panel[data-pn-type="style-manager"] .gjs-pn-views {
          background: var(--header-bg) !important;
        }

        /* Ensure Style Manager is properly displayed */
        .gjs-sm-sectors,
        .gjs-sm-sector,
        .gjs-sm-properties {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Professional Empty State for Style Manager */
        .gjs-sm-sectors:empty::before,
        .gjs-sm-sectors:has(.gjs-sm-empty-state)::before {
          content: none !important;
        }

        .gjs-sm-empty-state {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 48px 24px !important;
          text-align: center !important;
          background: var(--header-bg) !important;
          min-height: 300px !important;
        }

        .gjs-sm-empty-state-icon {
          width: 80px !important;
          height: 80px !important;
          margin: 0 auto 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #252525 !important;
          border-radius: 20px !important;
          color: #e5e5e5 !important;
          font-size: 36px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35) !important;
        }

        .gjs-sm-empty-state-icon svg {
          width: 40px !important;
          height: 40px !important;
          stroke-width: 1.5 !important;
        }

        .gjs-sm-empty-state-title {
          font-family: 'Inter', sans-serif !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #e5e5e5 !important;
          margin: 0 0 8px 0 !important;
          line-height: 1.4 !important;
        }

        .gjs-sm-empty-state-message {
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          color: #e5e7eb !important;
          margin: 0 !important;
          line-height: 1.6 !important;
          max-width: 280px !important;
        }

        .gjs-sm-empty-state-hint {
          margin-top: 20px !important;
          padding: 12px 16px !important;
          background: #252525 !important;
          border: 1px solid var(--header-border-color) !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          color: #d1d5db !important;
          line-height: 1.6 !important;
          max-width: 300px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
        }

        /* Ensure default Style Manager empty text stays readable */
        .gjs-sm-sectors .gjs-sm-empty,
        .gjs-sm-sectors .gjs-sm-empty *,
        .gjs-sm-sectors .gjs-sm-placeholder,
        .gjs-sm-sectors .gjs-sm-placeholder *,
        .gjs-sm-sectors .gjs-sm-help,
        .gjs-sm-sectors .gjs-sm-help * {
          color: #e5e7eb !important;
        }

        /* Responsive Empty State */
        @media (max-width: 768px) {
          .gjs-sm-empty-state {
            padding: 32px 16px !important;
            min-height: 250px !important;
          }

          .gjs-sm-empty-state-icon {
            width: 64px !important;
            height: 64px !important;
            font-size: 28px !important;
          }

          .gjs-sm-empty-state-title {
            font-size: 16px !important;
          }

          .gjs-sm-empty-state-message {
            font-size: 13px !important;
          }
        }

        /* Hide default GrapesJS empty message if exists */
        .gjs-sm-sectors > .gjs-sm-title:only-child,
        .gjs-sm-sectors > div:empty:only-child {
          display: none !important;
        }

        /* Traits Panel Styling - Figma Style */
        .gjs-trt-traits {
          background: #1e1e1e !important;
          padding: 16px !important;
          max-height: none !important;
          overflow-y: auto !important;
        }

        .gjs-trt-trait {
          padding: 12px 0 !important;
          border-bottom: 1px solid #2d2d2d !important;
        }

        .gjs-trt-trait:last-child {
          border-bottom: none !important;
        }

        .gjs-trt-trait__label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #b3b3b3 !important;
          margin-bottom: 8px !important;
        }

        /* Layers Panel Styling - Figma Style */
        .gjs-layer-wrapper {
          background: #1e1e1e !important;
          padding: 8px !important;
          max-height: none !important;
          overflow-y: auto !important;
        }

        .gjs-layer {
          padding: 10px 12px !important;
          margin: 4px 0 !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
          color: #e5e5e5 !important;
        }

        .gjs-layer:hover {
          background: #2d2d2d !important;
        }

        .gjs-layer.gjs-selected {
          background: #2d2d2d !important;
          border-left: 3px solid #18a0fb !important;
        }

        /* Ensure Right Sidebar Panel Buttons are Visible */
        .gjs-pn-buttons .gjs-pn-btn[data-pn-type="style-manager"],
        .gjs-pn-buttons .gjs-pn-btn[data-pn-type="traits"],
        .gjs-pn-buttons .gjs-pn-btn[data-pn-type="layers"] {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Prevent Right Sidebar from Being Hidden */
        .gjs-pn-panel.gjs-pn-views-container[style*="display: none"],
        .gjs-pn-panel[data-pn-type="views-container"][style*="display: none"] {
          display: block !important;
        }

        .gjs-pn-panel.gjs-pn-views-container[style*="visibility: hidden"],
        .gjs-pn-panel[data-pn-type="views-container"][style*="visibility: hidden"] {
          visibility: visible !important;
        }

        /* ========================================
           PREMIUM GRADIENT TEXT CLASS
           Real-world ready gradient text styling
           ======================================== */
        .gradient-text-premium {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          font-weight: 700;
          display: inline-block;
          animation: gradientShift 3s ease infinite;
          text-shadow: none;
          position: relative;
          letter-spacing: -0.02em;
        }

        /* Animated gradient background */
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Premium gradient text with glow effect */
        .gradient-text-premium {
          text-shadow: 0 0 30px rgba(102, 126, 234, 0.3),
                      0 0 60px rgba(118, 75, 162, 0.2),
                      0 0 90px rgba(240, 147, 251, 0.1);
        }

        /* Optional glow effect using filter (for better browser support) */
        .gradient-text-premium.gradient-glow {
          filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.4))
                  drop-shadow(0 0 16px rgba(118, 75, 162, 0.3))
                  drop-shadow(0 0 24px rgba(240, 147, 251, 0.2));
        }

        /* Hover effect for premium gradient text */
        .gradient-text-premium:hover {
          animation-duration: 1.5s;
          transform: scale(1.02);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Responsive font sizes */
        .gradient-text-premium {
          font-size: clamp(2rem, 5vw, 4rem);
          line-height: 1.2;
        }

        /* Small variant */
        .gradient-text-premium.gradient-text-small {
          font-size: clamp(1.25rem, 3vw, 2rem);
        }

        /* Medium variant */
        .gradient-text-premium.gradient-text-medium {
          font-size: clamp(1.75rem, 4vw, 3rem);
        }

        /* Large variant */
        .gradient-text-premium.gradient-text-large {
          font-size: clamp(2.5rem, 6vw, 5rem);
        }

        /* Extra large variant */
        .gradient-text-premium.gradient-text-xl {
          font-size: clamp(3rem, 7vw, 6rem);
        }

        /* Alternative gradient colors - Gold Premium */
        .gradient-text-premium.gradient-gold {
          background: linear-gradient(135deg, #f6d365 0%, #fda085 25%, #ffecd2 50%, #fcb69f 75%, #ff8a80 100%);
          background-size: 200% 200%;
          text-shadow: 0 0 30px rgba(246, 211, 101, 0.3),
                      0 0 60px rgba(253, 160, 133, 0.2),
                      0 0 90px rgba(255, 236, 210, 0.1);
        }

        .gradient-text-premium.gradient-gold.gradient-glow {
          filter: drop-shadow(0 0 8px rgba(246, 211, 101, 0.4))
                  drop-shadow(0 0 16px rgba(253, 160, 133, 0.3))
                  drop-shadow(0 0 24px rgba(255, 236, 210, 0.2));
        }

        /* Alternative gradient colors - Ocean Premium */
        .gradient-text-premium.gradient-ocean {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #4facfe 50%, #00f2fe 75%, #43e97b 100%);
          background-size: 200% 200%;
          text-shadow: 0 0 30px rgba(79, 172, 254, 0.3),
                      0 0 60px rgba(0, 242, 254, 0.2),
                      0 0 90px rgba(67, 233, 123, 0.1);
        }

        .gradient-text-premium.gradient-ocean.gradient-glow {
          filter: drop-shadow(0 0 8px rgba(79, 172, 254, 0.4))
                  drop-shadow(0 0 16px rgba(0, 242, 254, 0.3))
                  drop-shadow(0 0 24px rgba(67, 233, 123, 0.2));
        }

        /* Alternative gradient colors - Sunset Premium */
        .gradient-text-premium.gradient-sunset {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 25%, #ff6e7f 50%, #bfe9ff 75%, #a8edea 100%);
          background-size: 200% 200%;
          text-shadow: 0 0 30px rgba(250, 112, 154, 0.3),
                      0 0 60px rgba(254, 225, 64, 0.2),
                      0 0 90px rgba(255, 110, 127, 0.1);
        }

        .gradient-text-premium.gradient-sunset.gradient-glow {
          filter: drop-shadow(0 0 8px rgba(250, 112, 154, 0.4))
                  drop-shadow(0 0 16px rgba(254, 225, 64, 0.3))
                  drop-shadow(0 0 24px rgba(255, 110, 127, 0.2));
        }

        /* Alternative gradient colors - Dark Premium */
        .gradient-text-premium.gradient-dark {
          background: linear-gradient(135deg, #434343 0%, #000000 25%, #1e3c72 50%, #2a5298 75%, #7e8ba3 100%);
          background-size: 200% 200%;
          text-shadow: 0 0 30px rgba(42, 82, 152, 0.3),
                      0 0 60px rgba(30, 60, 114, 0.2),
                      0 0 90px rgba(126, 139, 163, 0.1);
        }

        .gradient-text-premium.gradient-dark.gradient-glow {
          filter: drop-shadow(0 0 8px rgba(42, 82, 152, 0.4))
                  drop-shadow(0 0 16px rgba(30, 60, 114, 0.3))
                  drop-shadow(0 0 24px rgba(126, 139, 163, 0.2));
        }

        /* Static gradient (no animation) */
        .gradient-text-premium.gradient-static {
          animation: none;
          background-position: 0% 50%;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .gradient-text-premium {
            font-size: clamp(1.5rem, 6vw, 3rem);
            letter-spacing: -0.01em;
          }

        }

        /* Print styles - solid color fallback */
        @media print {
          .gradient-text-premium {
            background: none;
            -webkit-text-fill-color: #667eea;
            color: #667eea;
            animation: none;
          }

        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .gradient-text-premium {
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            -webkit-text-fill-color: #000000;
            color: #000000;
            animation: none;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .gradient-text-premium {
            animation: none;
            background-position: 0% 50%;
          }

        }

        /* Style Manager - Figma Style */
        .gjs-sm-sector {
          background: #252525 !important;
          margin: 0 0 10px 0 !important;
          border: 1px solid #2d2d2d !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-sector:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
          border-color: #3a3a3a !important;
        }

        /* Sector Title - Figma Style Header */
        .gjs-sm-sector .gjs-sm-title {
          background: #252525 !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          color: #e5e5e5 !important;
          padding: 14px 16px !important;
          border-bottom: 1px solid #2d2d2d !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          user-select: none !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-sector .gjs-sm-title:hover {
          background: #2d2d2d !important;
          color: #ffffff !important;
        }

        .gjs-sm-sector.gjs-sm-open .gjs-sm-title {
          background: #2d2d2d !important;
          border-bottom-color: #18a0fb !important;
          color: #18a0fb !important;
        }

        /* Sector Title Icon - Caret - Figma Style */
        .gjs-sm-sector .gjs-sm-title .gjs-sm-sector-caret {
          color: #999999 !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-right: 8px !important;
          width: 18px !important;
          height: 18px !important;
        }

        .gjs-sm-sector.gjs-sm-open .gjs-sm-title .gjs-sm-sector-caret {
          transform: rotate(90deg) !important;
          color: #18a0fb !important;
        }

        /* Ensure properties are visible when sector is open */
        .gjs-sm-sector.gjs-sm-open .gjs-sm-properties {
          display: block !important;
          animation: fadeIn 0.2s ease !important;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hide properties when sector is closed */
        .gjs-sm-sector:not(.gjs-sm-open) .gjs-sm-properties {
          display: none !important;
        }

        /* Sector Properties Container - Figma Style */
        .gjs-sm-sector .gjs-sm-properties {
          padding: 16px !important;
          background: #252525 !important;
        }

        /* Property Row - Figma Style */
        .gjs-sm-property {
          padding: 12px 0 !important;
          border-bottom: 1px solid #2d2d2d !important;
          margin-bottom: 4px !important;
        }

        .gjs-sm-property:last-child {
          border-bottom: none !important;
          margin-bottom: 0 !important;
        }

        /* Property Label - Figma Style */
        .gjs-sm-property .gjs-sm-label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #b3b3b3 !important;
          margin-bottom: 8px !important;
          display: block !important;
          letter-spacing: -0.01em !important;
        }

        /* Ensure all property labels are visible (except composite parent labels) */
        .gjs-sm-property:not(:has(.gjs-sm-composite)) .gjs-sm-label {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Add tooltip/help text for unclear inputs */
        .gjs-sm-property .gjs-field[title=""],
        .gjs-sm-property .gjs-field:not([title]) {
          position: relative !important;
        }

        /* Tooltip for inputs without clear labels */
        .gjs-sm-property .gjs-field::before {
          content: attr(data-label) !important;
          position: absolute !important;
          bottom: 100% !important;
          left: 0 !important;
          background: #1e293b !important;
          color: #ffffff !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 11px !important;
          white-space: nowrap !important;
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.2s !important;
          z-index: 1000 !important;
          margin-bottom: 4px !important;
        }

        .gjs-sm-property .gjs-field:hover::before {
          opacity: 1 !important;
        }

        /* Property Field Container - Figma Style Input */
        .gjs-sm-property .gjs-field {
          border: 1.5px solid #2d2d2d !important;
          background: #1e1e1e !important;
          padding: 8px 12px !important;
          width: 100% !important;
          min-width: 120px !important;
          box-sizing: border-box !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
          font-size: 13px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          position: relative !important;
        }

        .gjs-sm-property .gjs-field:hover {
          border-color: #18a0fb !important;
          background: #252525 !important;
          box-shadow: 0 0 0 2px rgba(24, 160, 251, 0.1) !important;
        }

        .gjs-sm-property .gjs-field:focus-within {
          border-color: #18a0fb !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(24, 160, 251, 0.2) !important;
          background: #252525 !important;
        }

        /* Input Field - Figma Style */
        .gjs-sm-property .gjs-field input[type="text"],
        .gjs-sm-property .gjs-field input[type="number"] {
          flex: 1 !important;
          min-width: 0 !important;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          font-size: 13px !important;
          color: #e5e5e5 !important;
          font-weight: 500 !important;
        }

        .gjs-sm-property .gjs-field input[type="text"]::placeholder,
        .gjs-sm-property .gjs-field input[type="number"]::placeholder {
          color: #999999 !important;
          font-weight: 400 !important;
        }

        /* Empty/Dash Value Styling */
        .gjs-sm-property .gjs-field input[type="text"]:not(:focus):empty::before,
        .gjs-sm-property .gjs-field input[type="number"]:not(:focus):empty::before {
          content: 'Enter value' !important;
          color: #94a3b8 !important;
          font-weight: 400 !important;
        }

        /* Unit Selector in Property Fields */
        .gjs-sm-property .gjs-field-unit {
          flex-shrink: 0 !important;
        }

        /* Input Fields - Figma Style */
        .gjs-sm-property input[type="text"],
        .gjs-sm-property input[type="number"] {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          color: #e5e5e5 !important;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          font-weight: 500 !important;
          line-height: 1.5 !important;
        }

        /* Style for empty or dash values */
        .gjs-sm-property input[type="text"][value=""],
        .gjs-sm-property input[type="text"][value="-"],
        .gjs-sm-property input[type="number"][value=""],
        .gjs-sm-property input[type="number"][value="-"] {
          color: #999999 !important;
          font-style: italic !important;
        }

        .gjs-sm-property input[type="text"]:focus,
        .gjs-sm-property input[type="number"]:focus {
          outline: none !important;
          color: #e5e5e5 !important;
          font-style: normal !important;
        }

        .gjs-sm-property input[type="text"]::placeholder,
        .gjs-sm-property input[type="number"]::placeholder {
          color: #94a3b8 !important;
          font-weight: 400 !important;
          font-style: italic !important;
        }

        /* Select Dropdown - Figma Style */
        .gjs-sm-property select {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #e5e5e5 !important;
          border: 1.5px solid #2d2d2d !important;
          background: #1e1e1e !important;
          padding: 6px 28px 6px 10px !important;
          width: auto !important;
          min-width: 80px !important;
          box-sizing: border-box !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }

        .gjs-sm-property select:hover {
          border-color: #18a0fb !important;
          background: #252525 !important;
        }

        .gjs-sm-property select:focus {
          outline: none !important;
          border-color: #18a0fb !important;
          box-shadow: 0 0 0 3px rgba(24, 160, 251, 0.2) !important;
        }

        /* Dropdown Arrow for Select - Figma Style */
        .gjs-sm-property select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999999' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 10px center !important;
          background-size: 12px !important;
          padding-right: 32px !important;
        }

        /* Classes Section - Figma Style */
        .gjs-clm-tags,
        .gjs-clm-select {
          background: #252525 !important;
          border: 1px solid #2d2d2d !important;
          border-radius: 8px !important;
          padding: 12px !important;
          margin-bottom: 12px !important;
          font-family: 'Inter', sans-serif !important;
        }

        .gjs-clm-tags {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          align-items: center !important;
        }

        .gjs-clm-tag {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 6px 12px !important;
          background: rgba(24, 160, 251, 0.2) !important;
          border: 1.5px solid #18a0fb !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #18a0fb !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        .gjs-clm-tag:hover {
          background: rgba(24, 160, 251, 0.3) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(24, 160, 251, 0.3) !important;
        }

        .gjs-clm-tag .fa-check,
        .gjs-clm-tag .fa-times {
          font-size: 11px !important;
          color: #18a0fb !important;
        }

        .gjs-clm-tag .fa-times {
          margin-left: 4px !important;
          opacity: 0.7 !important;
          cursor: pointer !important;
        }

        .gjs-clm-tag .fa-times:hover {
          opacity: 1 !important;
          color: #dc2626 !important;
        }

        .gjs-clm-select {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .gjs-clm-select select {
          flex: 1 !important;
          padding: 8px 12px !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 6px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          color: #1e293b !important;
          background: #ffffff !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        .gjs-clm-select select:hover {
          border-color: #cbd5e1 !important;
          background: #f8fafc !important;
        }

        .gjs-clm-select select:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .gjs-clm-select button {
          padding: 8px 14px !important;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .gjs-clm-select button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
        }

        .gjs-clm-select button:active {
          transform: translateY(0) !important;
        }

        /* Classes Header */
        .gjs-sm-sectors > div:first-child .gjs-sm-title,
        .gjs-clm-header {
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #1e293b !important;
          margin-bottom: 8px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }

        /* State Section */
        .gjs-sm-sectors > div:nth-child(2) .gjs-sm-title {
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #1e293b !important;
        }

        /* Color Picker - Professional */
        .gjs-field-color-picker .gjs-field-colorp-c {
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }

        .gjs-field-color-picker .gjs-field-colorp-c:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }

        /* Slider - Professional Design */
        .gjs-sm-property input[type="range"] {
          -webkit-appearance: none !important;
          appearance: none !important;
          height: 6px !important;
          background: #e2e8f0 !important;
          outline: none !important;
          border-radius: 3px !important;
          width: 100% !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-property input[type="range"]:hover {
          background: #cbd5e1 !important;
        }

        .gjs-sm-property input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 18px !important;
          height: 18px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          cursor: pointer !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-property input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4) !important;
        }

        .gjs-sm-property input[type="range"]::-moz-range-thumb {
          width: 18px !important;
          height: 18px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          cursor: pointer !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-property input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4) !important;
        }

        .gjs-sm-property input[type="range"]::-moz-range-track {
          height: 6px !important;
          background: #e2e8f0 !important;
          border-radius: 3px !important;
        }

        /* Composite Property - Vertical Stack (TOP, RIGHT, BOTTOM, LEFT) - Full Width, No Box */
        .gjs-sm-composite {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
        }

        .gjs-sm-composite.gjs-sm-composite--cols-4 {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        /* Composite Field - Match Regular Property Fields (Full Width, No Nested Box) */
        .gjs-sm-composite .gjs-field {
          border: 1.5px solid #e2e8f0 !important;
          background: #ffffff !important;
          padding: 8px 12px !important;
          width: 100% !important;
          min-width: 120px !important;
          box-sizing: border-box !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
          font-size: 13px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          position: relative !important;
        }

        .gjs-sm-composite .gjs-field:hover {
          border-color: #3b82f6 !important;
          background: #f8fafc !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.05) !important;
        }

        .gjs-sm-composite .gjs-field:focus-within {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          background: #ffffff !important;
        }

        /* Composite Field Label (TOP, RIGHT, BOTTOM, LEFT) - Clear & Visible */
        .gjs-sm-composite .gjs-sm-property {
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }

        .gjs-sm-composite .gjs-sm-property .gjs-sm-label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          color: #64748b !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          margin-bottom: 0 !important;
        }

        /* Composite Field Input - Clear, Visible & Editable */
        .gjs-sm-composite .gjs-field input[type="text"],
        .gjs-sm-composite .gjs-field input[type="number"] {
          flex: 1 !important;
          min-width: 60px !important;
          border: none !important;
          background: transparent !important;
          padding: 4px 0 !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #1e293b !important;
          outline: none !important;
        }

        .gjs-sm-composite .gjs-field input[type="text"]:focus,
        .gjs-sm-composite .gjs-field input[type="number"]:focus {
          color: #0f172a !important;
          font-weight: 600 !important;
        }

        .gjs-sm-composite .gjs-field input[type="text"]::placeholder,
        .gjs-sm-composite .gjs-field input[type="number"]::placeholder {
          color: #94a3b8 !important;
          font-weight: 400 !important;
          font-style: italic !important;
        }

        /* Link/Unlink Button - Professional */
        .gjs-sm-composite .gjs-field .fa-link,
        .gjs-sm-composite .gjs-field .fa-unlink,
        .gjs-sm-composite .gjs-field [class*="link"],
        .gjs-sm-composite .gjs-field [class*="unlink"] {
          color: #64748b !important;
          font-size: 12px !important;
          cursor: pointer !important;
          padding: 4px 6px !important;
          border-radius: 4px !important;
          transition: all 0.2s ease !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 24px !important;
          height: 24px !important;
        }

        .gjs-sm-composite .gjs-field .fa-link:hover,
        .gjs-sm-composite .gjs-field .fa-unlink:hover,
        .gjs-sm-composite .gjs-field [class*="link"]:hover,
        .gjs-sm-composite .gjs-field [class*="unlink"]:hover {
          color: #3b82f6 !important;
          background: #eff6ff !important;
        }

        /* Show Parent Property Label for Margin/Padding (Main Label) */
        .gjs-sm-property:has(.gjs-sm-composite) > .gjs-sm-label {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          color: #1e293b !important;
          margin-bottom: 12px !important;
          padding-bottom: 10px !important;
          border-bottom: 2px solid #e2e8f0 !important;
          text-transform: capitalize !important;
          letter-spacing: -0.01em !important;
          height: auto !important;
          overflow: visible !important;
        }

        /* Show label only for individual field items (TOP, RIGHT, BOTTOM, LEFT) - Clear & Visible */
        .gjs-sm-composite .gjs-sm-property .gjs-sm-label {
          display: block !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          color: #475569 !important;
          margin-bottom: 8px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }

        /* Remove helper text - Keep labels clean */
        .gjs-sm-composite .gjs-sm-property .gjs-sm-label::after {
          content: none !important;
          display: none !important;
        }

        /* Composite Field Container - No Box, Full Width */
        .gjs-sm-composite {
          background: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          border: none !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          position: relative !important;
          box-shadow: none !important;
        }

        /* Hide Duplicate Label Inside Composite Container (Keep Only Main Label) */
        .composite-field-label {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          font-size: 0 !important;
          line-height: 0 !important;
        }

        /* Individual Composite Field Items - Match Regular Property Layout */
        .gjs-sm-composite .gjs-sm-property {
          margin-bottom: 12px !important;
          padding-bottom: 0 !important;
          border-bottom: none !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
          width: 100% !important;
        }

        .gjs-sm-composite .gjs-sm-property:last-child {
          margin-bottom: 0 !important;
        }

        /* Show Composite Field Labels (TOP, RIGHT, BOTTOM, LEFT) - Clear & Visible */
        .gjs-sm-composite .gjs-sm-property .gjs-sm-label {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #475569 !important;
          margin-bottom: 6px !important;
          text-transform: capitalize !important;
          letter-spacing: 0.3px !important;
          height: auto !important;
          padding: 0 !important;
          overflow: visible !important;
          line-height: 1.4 !important;
        }

        /* Better Visual Feedback for Empty Composite Fields */
        .gjs-sm-composite .gjs-field input[type="text"]:empty + .gjs-field-unit,
        .gjs-sm-composite .gjs-field input[type="number"]:empty + .gjs-field-unit {
          opacity: 0.6 !important;
        }

        /* Ensure all unit selectors are visible */
        .gjs-sm-property .gjs-field-unit,
        .gjs-sm-composite .gjs-field-unit {
          display: inline-flex !important;
          align-items: center !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Composite Input Fields - Match Regular Property Inputs */
        .gjs-sm-composite input[type="text"],
        .gjs-sm-composite input[type="number"] {
          flex: 1 !important;
          min-width: 0 !important;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          font-size: 13px !important;
          color: #1e293b !important;
          font-weight: 500 !important;
          font-family: 'Inter', sans-serif !important;
          width: 100% !important;
          box-sizing: border-box !important;
          line-height: 1.5 !important;
        }

        .gjs-sm-composite input[type="text"]::placeholder,
        .gjs-sm-composite input[type="number"]::placeholder {
          color: #94a3b8 !important;
          font-weight: 400 !important;
        }

        .gjs-sm-composite input[type="text"]:focus,
        .gjs-sm-composite input[type="number"]:focus {
          outline: none !important;
          color: #0f172a !important;
        }

        /* Unit Selector Dropdown - Professional */
        .gjs-sm-composite select,
        .gjs-sm-property select,
        .gjs-field-unit select {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #1e293b !important;
          border: none !important;
          background: transparent !important;
          padding: 0 20px 0 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          line-height: 1.5 !important;
        }

        /* Hide "-" Symbol Button - Replace with Dropdown */
        .gjs-field .fa-minus,
        .gjs-field [class*="minus"],
        .gjs-field [class*="dash"],
        .gjs-sm-property .gjs-field button,
        .gjs-sm-composite .gjs-field button,
        .gjs-field button[title*="-"],
        .gjs-field button:empty,
        .gjs-field .gjs-btn-arrow {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Hide any text content that is just "-" */
        .gjs-field span:empty,
        .gjs-field span:contains("-") {
          display: none !important;
        }

        /* Unit Selector Container - Visible Dropdown */
        .gjs-field-unit,
        .gjs-sm-property .gjs-field-unit,
        .gjs-sm-composite .gjs-field-unit {
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
          min-width: 75px !important;
          margin-left: 8px !important;
          flex-shrink: 0 !important;
        }

        /* Professional Dropdown Arrow - SVG Icon (Always Visible) */
        .gjs-field-unit::after {
          content: '' !important;
          position: absolute !important;
          right: 10px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          pointer-events: none !important;
          width: 14px !important;
          height: 14px !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Cpath d='M3.5 5.25L7 8.75L10.5 5.25' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          background-size: contain !important;
          z-index: 10 !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Hover state for dropdown arrow */
        .gjs-field-unit:hover::after {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Cpath d='M3.5 5.25L7 8.75L10.5 5.25' stroke='%232563eb' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
        }

        .gjs-field-unit select {
          padding: 8px 32px 8px 10px !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 6px !important;
          background: #ffffff !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #334155 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
          min-width: 75px !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }

        .gjs-field-unit select:hover {
          border-color: #3b82f6 !important;
          background: #f8fafc !important;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1) !important;
        }

        .gjs-field-unit select:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
          background: #ffffff !important;
        }

        .gjs-field-unit select option {
          padding: 10px 12px !important;
          background: #ffffff !important;
          color: #1e293b !important;
          font-size: 13px !important;
        }

        .gjs-field-unit select option:hover {
          background: #f8fafc !important;
        }

        /* Ensure unit selector is always visible in composite fields */
        .gjs-sm-composite .gjs-field .gjs-field-unit {
          display: inline-flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin-left: 8px !important;
          flex-shrink: 0 !important;
        }

        /* Make sure the select element is visible */
        .gjs-sm-composite .gjs-field .gjs-field-unit select,
        .gjs-sm-property .gjs-field .gjs-field-unit select {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          min-width: 70px !important;
        }

        /* Ensure input field takes proper space */
        .gjs-sm-composite .gjs-field {
          min-height: 44px !important;
        }

        /* Make input clearly visible and editable */
        .gjs-sm-composite .gjs-field input {
          min-width: 80px !important;
          flex: 1 1 auto !important;
        }

        /* Composite Button Groups - Professional */
        .gjs-sm-composite .gjs-field-radio {
          display: flex !important;
          background: #ffffff !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 6px !important;
          overflow: hidden !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-composite .gjs-field-radio:hover {
          border-color: #cbd5e1 !important;
        }

        /* Radio Button Options - Professional */
        .gjs-sm-composite .gjs-field-radio .gjs-field-radio-option {
          flex: 1 !important;
          padding: 10px 12px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #64748b !important;
          background: transparent !important;
          border: none !important;
          border-right: 1px solid #e2e8f0 !important;
          cursor: pointer !important;
          text-align: center !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-composite .gjs-field-radio .gjs-field-radio-option:last-child {
          border-right: none !important;
        }

        .gjs-sm-composite .gjs-field-radio .gjs-field-radio-option:hover {
          background: #f8fafc !important;
          color: #334155 !important;
        }

        .gjs-sm-composite .gjs-field-radio .gjs-field-radio-option.gjs-field-radio-option-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
        }

        /* Select Dropdown - Professional */
        .gjs-sm-composite .gjs-field-select select {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 400 !important;
          color: #1e293b !important;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          width: 100% !important;
          cursor: pointer !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          line-height: 1.5 !important;
        }

        .gjs-sm-composite .gjs-field-select select:focus {
          outline: none !important;
        }

        .gjs-sm-composite .gjs-field-select select option {
          padding: 8px 12px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
        }

        /* Hide custom dropdown arrow icon added by GrapesJS */
        .gjs-field-select::after,
        .gjs-sm-property .gjs-field-select::after,
        .gjs-sm-composite .gjs-field-select::after {
          display: none !important;
          content: none !important;
        }

        /* All sections use same simple styling - no special themes */

        /* Stack Property - Full Width, No Box (Text Shadow, Box Shadow, etc.) */
        .gjs-sm-stack {
          background: transparent !important;
          padding: 0 !important;
          margin-top: 0 !important;
          border: none !important;
          width: 100% !important;
          box-shadow: none !important;
        }

        /* Remove grey box from ALL stack layers - Keep content visible (First, Second, Third, etc.) */
        .gjs-sm-stack .gjs-sm-layer,
        .gjs-sm-stack .gjs-sm-layer:first-child,
        .gjs-sm-stack .gjs-sm-layer:last-child,
        .gjs-sm-stack .gjs-sm-layer:nth-child(1),
        .gjs-sm-stack .gjs-sm-layer:nth-child(2),
        .gjs-sm-stack .gjs-sm-layer:nth-child(3),
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) {
          background: transparent !important;
          padding: 0 !important;
          margin-bottom: 16px !important;
          border: none !important;
          width: 100% !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }

        .gjs-sm-stack .gjs-sm-layer:hover,
        .gjs-sm-stack .gjs-sm-layer:first-child:hover,
        .gjs-sm-stack .gjs-sm-layer:last-child:hover,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n):hover {
          background: transparent !important;
          border: none !important;
        }

        /* Minimize layer header box for ALL layers - Make it less prominent */
        .gjs-sm-stack .gjs-sm-layer > div:first-child,
        .gjs-sm-stack .gjs-sm-layer:first-child > div:first-child,
        .gjs-sm-stack .gjs-sm-layer:last-child > div:first-child,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) > div:first-child {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          padding: 8px 12px !important;
          margin-bottom: 12px !important;
          border-radius: 6px !important;
          box-shadow: none !important;
        }

        /* Make layer header compact and clean for ALL layers */
        .gjs-sm-stack .gjs-sm-layer > div:first-child:hover,
        .gjs-sm-stack .gjs-sm-layer:first-child > div:first-child:hover,
        .gjs-sm-stack .gjs-sm-layer:last-child > div:first-child:hover,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) > div:first-child:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }

        /* Keep properties visible for ALL layers */
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-properties,
        .gjs-sm-stack .gjs-sm-layer:first-child .gjs-sm-properties,
        .gjs-sm-stack .gjs-sm-layer:last-child .gjs-sm-properties,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) .gjs-sm-properties {
          display: block !important;
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Stack Layer Fields - Full Width for ALL layers */
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property,
        .gjs-sm-stack .gjs-sm-layer:first-child .gjs-sm-property,
        .gjs-sm-stack .gjs-sm-layer:last-child .gjs-sm-property,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) .gjs-sm-property {
          width: 100% !important;
          margin-bottom: 12px !important;
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property:last-child,
        .gjs-sm-stack .gjs-sm-layer:first-child .gjs-sm-property:last-child,
        .gjs-sm-stack .gjs-sm-layer:last-child .gjs-sm-property:last-child,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) .gjs-sm-property:last-child {
          margin-bottom: 0 !important;
        }

        /* Remove any wrapper boxes around fields */
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property > div,
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property > span,
        .gjs-sm-stack .gjs-sm-layer .gjs-field-wrapper {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        /* Stack Layer Field Inputs - Full Width for ALL layers, No Nested Boxes */
        .gjs-sm-stack .gjs-sm-layer .gjs-field,
        .gjs-sm-stack .gjs-sm-layer:first-child .gjs-field,
        .gjs-sm-stack .gjs-sm-layer:last-child .gjs-field,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) .gjs-field {
          border: 1.5px solid #e2e8f0 !important;
          background: #ffffff !important;
          padding: 8px 12px !important;
          width: 100% !important;
          min-width: 120px !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
          font-size: 13px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          position: relative !important;
          margin: 0 !important;
        }

        /* Remove any additional boxes or containers */
        .gjs-sm-stack .gjs-sm-layer .gjs-field > div,
        .gjs-sm-stack .gjs-sm-layer .gjs-field > span {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }

        /* Hover and focus states for ALL layers */
        .gjs-sm-stack .gjs-sm-layer .gjs-field:hover,
        .gjs-sm-stack .gjs-sm-layer:first-child .gjs-field:hover,
        .gjs-sm-stack .gjs-sm-layer:last-child .gjs-field:hover,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) .gjs-field:hover {
          border-color: #3b82f6 !important;
          background: #f8fafc !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.05) !important;
        }

        .gjs-sm-stack .gjs-sm-layer .gjs-field:focus-within,
        .gjs-sm-stack .gjs-sm-layer:first-child .gjs-field:focus-within,
        .gjs-sm-stack .gjs-sm-layer:last-child .gjs-field:focus-within,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) .gjs-field:focus-within {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          background: #ffffff !important;
        }

        /* Stack Layer Field Labels - Visible for ALL layers */
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property .gjs-sm-label,
        .gjs-sm-stack .gjs-sm-layer:first-child .gjs-sm-property .gjs-sm-label,
        .gjs-sm-stack .gjs-sm-layer:last-child .gjs-sm-property .gjs-sm-label,
        .gjs-sm-stack .gjs-sm-layer:nth-child(n) .gjs-sm-property .gjs-sm-label {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #475569 !important;
          margin-bottom: 6px !important;
          text-transform: capitalize !important;
          letter-spacing: 0.3px !important;
          height: auto !important;
          padding: 0 !important;
          overflow: visible !important;
          line-height: 1.4 !important;
        }

        /* Stack Layer Field Inputs - Match Regular Property Inputs - Full Width */
        .gjs-sm-stack .gjs-sm-layer .gjs-field input[type="text"],
        .gjs-sm-stack .gjs-sm-layer .gjs-field input[type="number"] {
          flex: 1 !important;
          min-width: 0 !important;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          font-size: 13px !important;
          color: #1e293b !important;
          font-weight: 500 !important;
          font-family: 'Inter', sans-serif !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Ensure field wrapper doesn't restrict width - Full Width */
        .gjs-sm-stack .gjs-sm-layer .gjs-field-wrapper,
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property .gjs-field-wrapper,
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property > * {
          width: 100% !important;
          max-width: 100% !important;
          display: block !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }

        /* Ensure input field takes full width */
        .gjs-sm-stack .gjs-sm-layer .gjs-sm-property .gjs-field {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
        }

        /* Layers Panel - Simple */
        #gjs .gjs-layer-wrapper {
          background: #ffffff !important;
          padding: 12px !important;
        }

        .gjs-layer {
          margin: 4px 0 !important;
          padding: 10px 12px !important;
          border: 1px solid #e5e7eb !important;
          background: #ffffff !important;
        }

        .gjs-layer:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
        }

        .gjs-layer.gjs-selected {
          background: #dbeafe !important;
          border-color: #3b82f6 !important;
        }

        .gjs-layer__icon {
          color: #64748b !important;
          margin-right: 8px !important;
          font-size: 14px !important;
        }

        .gjs-layer.gjs-selected .gjs-layer__icon {
          color: #3b82f6 !important;
        }

        /* Layer Title */
        .gjs-layer-title {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #334155 !important;
        }

        .gjs-layer.gjs-selected .gjs-layer-title {
          color: #1e40af !important;
          font-weight: 600 !important;
        }

        /* Layer Eye Icon (Visibility) */
        .gjs-layer__eye {
          color: #64748b !important;
          font-size: 14px !important;
          margin-left: 8px !important;
        }

        .gjs-layer__eye:hover {
          color: #3b82f6 !important;
        }

        /* Blocks Panel - 2 Columns Grid - Professional */
        #gjs .gjs-blocks-c,
        .gjs-blocks-c {
          padding: 10px !important;
          background: var(--header-bg) !important;
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          width: 100% !important;
        }

        /* Ensure blocks take proper width in grid */
        .gjs-blocks-c .gjs-block {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }

        /* Blocks Grid - Always 2 Columns - Professional Spacing */
        @media (min-width: 1920px) {
          #gjs .gjs-blocks-c,
          .gjs-blocks-c {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 10px !important;
          }
        }

        @media (max-width: 1400px) {
          #gjs .gjs-blocks-c,
          .gjs-blocks-c {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 10px !important;
          }
        }

        @media (max-width: 1200px) {
          #gjs .gjs-blocks-c,
          .gjs-blocks-c {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 10px !important;
          }
        }

        /* Force 2 columns for all block containers - Professional */
        .gjs-block-category .gjs-blocks-c,
        .gjs-block-category.gjs-open .gjs-blocks-c,
        .gjs-block-category .gjs-blocks-c[data-force-show="true"] {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          padding: 10px !important;
          width: 100% !important;
        }

        /* Ensure blocks don't break grid layout */
        .gjs-block-category .gjs-blocks-c .gjs-block {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          flex-shrink: 0 !important;
          box-sizing: border-box !important;
        }

        /* Block Category - Professional Design */
        .gjs-block-category {
          margin-bottom: 6px !important;
          border: 1px solid var(--header-border-color) !important;
          background: var(--header-bg) !important;
          grid-column: 1 / -1 !important;
          border-radius: 6px !important;
          overflow: visible !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }

        .gjs-block-category:hover {
          border-color: var(--header-border-color) !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25) !important;
        }

        .gjs-block-category .gjs-title {
          background: var(--header-bg) !important;
          color: #e5e5e5 !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding: 10px 12px !important;
          cursor: pointer !important;
          position: relative !important;
          user-select: none !important;
          margin: 0 !important;
          border: none !important;
          border-bottom: 1px solid var(--header-border-color) !important;
          transition: all 0.2s ease !important;
        }

        .gjs-block-category .gjs-title:hover {
          background: #252525 !important;
          color: #ffffff !important;
        }

        /* Block Category Caret Icon - Professional */
        .gjs-block-category .gjs-title::before {
          content: '▶' !important;
          display: inline-block !important;
          margin-right: 10px !important;
          font-size: 10px !important;
          color: #64748b !important;
          transition: transform 0.2s ease, color 0.2s ease !important;
          vertical-align: middle !important;
        }

        .gjs-block-category .gjs-title:hover::before {
          color: #3b82f6 !important;
        }

        .gjs-block-category.gjs-open .gjs-title::before {
          transform: rotate(90deg) !important;
          color: #3b82f6 !important;
        }

        /* Block Category Content - Professional Expand/Collapse */
        .gjs-block-category .gjs-blocks-c {
          background: var(--header-bg) !important;
          overflow: hidden !important;
          transition: max-height 0.25s ease, padding 0.25s ease, opacity 0.25s ease, margin 0.25s ease !important;
          box-sizing: border-box !important;
        }

        /* Hide blocks completely when category is closed - NO SPACE, NO HEIGHT */
        .gjs-block-category:not(.gjs-open) .gjs-blocks-c {
          max-height: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          overflow: hidden !important;
        }

        /* Show blocks when category is open - PROPER SPACE with GRID LAYOUT (2 columns) */
        .gjs-block-category.gjs-open .gjs-blocks-c,
        .gjs-block-category.gjs-open .gjs-blocks-c[data-force-show="true"],
        .gjs-blocks-c[data-force-show="true"] {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          max-height: 5000px !important;
          padding: 10px !important;
          margin: 0 !important;
          opacity: 1 !important;
          visibility: visible !important;
          overflow: visible !important;
          width: 100% !important;
          height: auto !important;
        }

        /* Ensure blocks inside are visible when category is open */
        .gjs-block-category.gjs-open .gjs-blocks-c .gjs-block {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Ensure category title is clickable and always interactive */
        .gjs-block-category .gjs-title {
          pointer-events: auto !important;
          cursor: pointer !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          position: relative !important;
          z-index: 10 !important;
        }

        /* Prevent any overlay from blocking clicks */
        .gjs-block-category {
          position: relative !important;
          z-index: 1 !important;
        }

        /* When closed, category should take minimal space */
        .gjs-block-category:not(.gjs-open) {
          border-bottom: 1px solid #e5e7eb !important;
        }

        /* When open, show border */
        .gjs-block-category.gjs-open {
          border-bottom: 1px solid #e5e7eb !important;
        }

        /* Ensure search doesn't block category clicks */
        .gjs-blocks-search-container {
          pointer-events: auto !important;
        }

        .gjs-blocks-search-container * {
          pointer-events: auto !important;
        }

        /* Extra Category Content Area */
        .gjs-block-category[data-name="extra"] {
          background: var(--header-bg) !important;
        }

        .gjs-block-category[data-name="extra"] .gjs-blocks-c {
          background: var(--header-bg) !important;
        }

        /* Traits Panel - Simple */
        #gjs .gjs-trt-traits {
          padding: 12px !important;
          background: var(--header-bg) !important;
        }

        .gjs-trt-trait {
          padding: 12px 0 !important;
          margin-bottom: 12px !important;
          border-bottom: 1px solid var(--header-border-color) !important;
        }

        .gjs-trt-trait:last-child {
          border-bottom: none !important;
        }

        .gjs-trt-trait__label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          color: #e5e5e5 !important;
          margin-bottom: 6px !important;
          display: block !important;
        }

        .gjs-trt-trait input,
        .gjs-trt-trait select,
        .gjs-trt-trait textarea {
          width: 100% !important;
          min-width: 140px !important;
          padding: 6px 10px !important;
          border: 1px solid #e5e7eb !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          color: #1e293b !important;
          background: white !important;
          box-sizing: border-box !important;
        }

        .gjs-trt-trait input:focus,
        .gjs-trt-trait select:focus,
        .gjs-trt-trait textarea:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
        }

        /* Right Sidebar Scrollbar - Modern Style */
        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar {
          width: 8px !important;
        }

        /* GrapesJS Input Field Width Fixes */
        .gjs-sm-property,
        .gjs-sm-composite,
        .gjs-trt-trait {
          width: 100% !important;
          min-width: 0 !important;
        }

        /* Ensure all input fields have proper sizing */
        .gjs-field input,
        .gjs-field select,
        .gjs-field textarea {
          width: 100% !important;
          min-width: 80px !important;
          box-sizing: border-box !important;
        }

        /* Hide native dropdown arrow for all select fields */
        .gjs-field select {
          -webkit-appearance: none !important;
          appearance: none !important;
        }

        /* Hide custom dropdown arrow icon added by GrapesJS on wrapper */
        .gjs-field-select::after,
        .gjs-field-select::before {
          display: none !important;
          content: none !important;
        }

        /* Fix for GrapesJS default field sizing */
        .gjs-sm-property .gjs-field-wrapper,
        .gjs-sm-composite .gjs-field-wrapper,
        .gjs-trt-trait .gjs-field-wrapper {
          width: 100% !important;
          display: block !important;
        }

        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
          border-radius: 10px !important;
        }

        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 3px !important;
        }

        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }

        /* Toolbar - Modern Floating Design - Left Side Positioned */
        .gjs-toolbar {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
          border-radius: 12px !important;
          padding: 6px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          border: 2px solid rgba(255, 255, 255, 0.15) !important;
          backdrop-filter: blur(10px) !important;
          position: fixed !important;
          left: 20px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 10000 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }

        .gjs-toolbar-item {
          border-radius: 8px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          color: white !important;
          padding: 8px !important;
        }

        .gjs-toolbar-item:hover {
          background: rgba(59, 130, 246, 0.2) !important;
          transform: scale(1.15) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        /* RTE Toolbar - Header Theme Design (Single Line) */
        .gjs-rte-toolbar {
          background: #1e1e1e !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid #2d2d2d !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 2px !important;
          flex-wrap: nowrap !important;
        }

        /* Custom buttons container - Single Line - Header Theme */
        .rte-custom-buttons-container {
          display: flex !important;
          align-items: center !important;
          gap: 2px !important;
          margin-left: 8px !important;
          padding-left: 8px !important;
          border-left: 1px solid #2d2d2d !important;
        }

        /* Custom toolbar buttons (Copy, Duplicate, Delete) - Header Theme Design */
        .rte-copy-btn,
        .rte-duplicate-btn,
        .rte-delete-btn {
          color: #e5e5e5 !important;
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          padding: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 4px !important;
          transition: all 0.2s ease !important;
          min-width: 26px !important;
          height: 26px !important;
        }

        .rte-copy-btn:hover {
          background: #2d2d2d !important;
          color: #ffffff !important;
        }

        .rte-duplicate-btn:hover {
          background: #2d2d2d !important;
          color: #ffffff !important;
        }

        .rte-delete-btn:hover {
          background: #2d2d2d !important;
          color: #ffffff !important;
        }

        .rte-copy-btn:active,
        .rte-duplicate-btn:active,
        .rte-delete-btn:active {
          background: #252525 !important;
          transform: scale(0.95) !important;
        }

        .rte-copy-btn svg,
        .rte-duplicate-btn svg,
        .rte-delete-btn svg {
          width: 14px !important;
          height: 14px !important;
          stroke: currentColor !important;
          fill: none !important;
          stroke-width: 2.5 !important;
        }

        /* Ensure RTE toolbar items are in single line - Header Theme */
        .gjs-rte-toolbar .gjs-rte-toolbar-item {
          display: inline-flex !important;
          margin: 0 1px !important;
          color: #e5e5e5 !important;
        }

        .gjs-rte-toolbar .gjs-rte-toolbar-item:hover {
          background: #2d2d2d !important;
        }

        /* Commands Panel - Custom Actions (Copy, Duplicate, Delete) - Header Theme */
        .custom-actions-container {
          display: flex !important;
          align-items: center !important;
          gap: 2px !important;
          margin-left: 8px !important;
          padding-left: 8px !important;
          border-left: 1px solid #2d2d2d !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          z-index: 9999 !important;
        }

        .custom-copy-btn,
        .custom-duplicate-btn,
        .custom-delete-btn {
          color: #e5e5e5 !important;
          background: transparent !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 26px !important;
          height: 26px !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          z-index: 9999 !important;
        }

        .custom-copy-btn:hover,
        .custom-duplicate-btn:hover,
        .custom-delete-btn:hover {
          background: #2d2d2d !important;
          color: #ffffff !important;
        }

        .custom-copy-btn:active,
        .custom-duplicate-btn:active,
        .custom-delete-btn:active {
          background: #252525 !important;
          transform: scale(0.95) !important;
        }

        .custom-copy-btn svg,
        .custom-duplicate-btn svg,
        .custom-delete-btn svg {
          width: 14px !important;
          height: 14px !important;
          stroke: currentColor !important;
          fill: none !important;
          stroke-width: 2.5 !important;
        }

        /* Floating Toolbar for Blocks, Sections, Images, Videos - Separate from Text Toolbar */
        .floating-element-toolbar {
          position: fixed !important;
          background: #1e1e1e !important;
          border: 1px solid #2d2d2d !important;
          border-radius: 8px !important;
          padding: 6px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          z-index: 10001 !important;
          backdrop-filter: blur(10px) !important;
        }

        .floating-toolbar-btn {
          color: #e5e5e5 !important;
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          padding: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 4px !important;
          transition: all 0.2s ease !important;
          min-width: 28px !important;
          height: 28px !important;
        }

        .floating-toolbar-btn:hover {
          background: #2d2d2d !important;
          color: #ffffff !important;
          transform: scale(1.1) !important;
        }

        .floating-toolbar-btn:active {
          background: #252525 !important;
          transform: scale(0.95) !important;
        }

        .floating-delete-btn:hover {
          background: #dc2626 !important;
          color: #ffffff !important;
        }

        .floating-copy-btn:hover {
          background: #2563eb !important;
          color: #ffffff !important;
        }

        .floating-duplicate-btn:hover {
          background: #16a34a !important;
          color: #ffffff !important;
        }

        .floating-toolbar-btn svg {
          width: 14px !important;
          height: 14px !important;
          stroke: currentColor !important;
          fill: none !important;
          stroke-width: 2.5 !important;
        }

        /* Commands Panel Styling - Header Theme */
        .gjs-cm {
          background: #1e1e1e !important;
          border: 1px solid #2d2d2d !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
        }

        /* Panel Tabs - Modern Tab Design */
        .gjs-pn-views {
          background: #ffffff !important;
         
        
        }

        .gjs-pn-btn.gjs-pn-views-item {
          border-radius: 10px !important;
          margin: 0 4px !important;
          padding: 10px 16px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #64748b !important;
          border: 2px solid transparent !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .gjs-pn-btn.gjs-pn-views-item:hover {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
          color: #2563eb !important;
          border-color: #bfdbfe !important;
        }

        .gjs-pn-btn.gjs-pn-views-item.gjs-pn-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        /* Pages Container - Modern Design */
        .pages-container {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 1000;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%);
          color: white;
          padding: 4px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Floating Form Buttons - Modern Design */
        .floating-form-buttons {
          position: fixed;
          top: 50%;
          left: 24px;
          transform: translateY(-50%);
          z-index: 1500;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .floating-form-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 160px;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
          letter-spacing: -0.2px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .floating-form-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s;
        }

        .floating-form-btn:hover::before {
          left: 100%;
        }

        .floating-form-btn:hover {
          transform: translateX(8px) scale(1.05);
          box-shadow: 0 12px 36px rgba(99, 102, 241, 0.6);
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%);
        }

        .floating-form-btn:active {
          transform: translateX(5px) scale(0.98);
        }

        .floating-form-btn svg {
          font-size: 18px;
          position: relative;
          z-index: 1;
        }

        .floating-form-btn span {
          position: relative;
          z-index: 1;
        }

        /* Modern Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.85) 100%);
          backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
          transition: background 0.3s ease;
        }

        .dark-mode .modal-overlay {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%);
          backdrop-filter: blur(16px);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.15);
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .day-selector-modal-content {
          width: clamp(320px, 92vw, 760px);
          padding: clamp(20px, 4vw, 36px);
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          font-weight: 700;
        }

        .modal-close-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.4);
        }

        /* Template Selector - Modern Design */
        .template-selector-container {
          width: 85vw;
          max-width: 900px;
        }

        .template-selector-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 24px;
          text-align: center;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          padding: 4px;
        }

        .template-card {
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          background: #ffffff;
          position: relative;
        }

        .template-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .template-card:hover::before {
          opacity: 1;
        }

        .template-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 16px 36px rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
        }

        .template-card.selected {
          border-color: #3b82f6;
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
          background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
        }

        .template-card.selected::after {
          content: '✓';
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          animation: checkmark 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .template-thumbnail {
          position: relative;
          overflow: hidden;
          background: #f1f5f9;
        }

        .template-thumbnail img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .template-card:hover .template-thumbnail img {
          transform: scale(1.08);
        }

        .template-info {
          padding: 20px;
        }

        .template-info h4 {
          margin: 0 0 8px 0;
          font-size: 17px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.3px;
        }

        .template-info p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
        }

        /* Redirect Popup - Modern Design */
        .redirect-popup-content {
          min-width: 480px;
          max-width: 560px;
        }

        .redirect-popup-content h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .redirect-popup-content p {
          color: #64748b;
          margin-bottom: 24px;
          font-size: 14px;
          line-height: 1.6;
        }

        .redirect-popup-content .form-group {
          margin-bottom: 24px;
        }

        .redirect-mode-toggle {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          background: #f8fafc;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .redirect-mode-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          font-weight: 600;
          font-size: 14px;
          color: #475569;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .redirect-mode-btn.active {
          background: #2563eb;
          color: #fff;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
        }

        .redirect-popup-content .input-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .redirect-popup-content select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          background: #ffffff;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.3s ease;
          outline: none;
        }

        .redirect-popup-content select:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .redirect-popup-content select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background: #ffffff;
        }

        .redirect-popup-content input[type="url"] {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          background: #ffffff;
          color: #1e293b;
          outline: none;
          transition: all 0.3s ease;
        }

        .redirect-popup-content input[type="url"]:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
        }

        .redirect-popup-content .helper-text {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          color: #94a3b8;
        }

        /* Day Selector Popup - Modern Design */
        .day-selector-popup-content {
          width: 100%;
        }

        .day-popup-header {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: linear-gradient(120deg, rgba(59,130,246,0.08), rgba(244,114,182,0.1));
          margin-bottom: 24px;
        }

        .day-popup-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #1d4ed8;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 12px 30px rgba(29, 78, 216, 0.25);
        }

        .day-popup-copy h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }

        .day-popup-copy p {
          margin: 4px 0 0 0;
          color: #475569;
          font-size: 14px;
        }

        .selected-count {
          margin-left: auto;
          text-align: center;
          min-width: 80px;
          background: rgba(15, 23, 42, 0.06);
          border-radius: 14px;
          padding: 8px 12px;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .selected-count span {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }

        .selected-count small {
          font-size: 11px;
          letter-spacing: 0.5px;
          color: #475569;
          text-transform: uppercase;
        }

        .quick-select-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .quick-select-btn {
          padding: 10px 18px;
          border-radius: 999px;
          border: none;
          background: rgba(59, 130, 246, 0.12);
          color: #1d4ed8;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .quick-select-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          transform: translateY(-1px);
        }

        .quick-select-btn.ghost {
          background: rgba(15, 23, 42, 0.08);
          color: #0f172a;
        }

        .day-grid-popup {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          justify-items: center;
          margin-bottom: 24px;
        }

        .day-card-popup {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          color: #0f172a;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: min(100%, 240px);
          min-height: 95px;
        }

        .day-card-popup::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.5s;
        }

        .day-card-popup:hover::before {
          left: 100%;
        }

        .day-card-popup:hover {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-color: #3b82f6;
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
        }

        .day-card-popup.selected {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-color: #3b82f6;
          color: white;
          font-weight: 700;
          transform: scale(1.05);
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);
        }

        .day-name {
          font-size: 16px;
          position: relative;
          z-index: 1;
          font-weight: 700;
        }

        .day-date {
          font-size: 12px;
          color: #475569;
          margin-top: 4px;
          opacity: 0.85;
        }

        .day-card-popup.selected .day-date {
          color: rgba(255,255,255,0.85);
        }

        .day-summary-panel {
          background: linear-gradient(135deg, #fdf2f8 0%, #eef2ff 100%);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
        }

        .summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .summary-label {
          margin: 0;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #475569;
        }

        .day-summary-panel h4 {
          margin: 2px 0 0 0;
          font-size: 18px;
          color: #0f172a;
        }

        .summary-chip-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .summary-chip {
          background: #fff;
          border-radius: 12px;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-chip strong {
          color: #111827;
          font-size: 15px;
        }

        .summary-chip span {
          font-size: 12px;
          color: #475569;
        }

        /* Popup Buttons - Modern Design */
        .popup-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
        }

        .popup-buttons button {
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          outline: none;
          letter-spacing: -0.2px;
        }

        .cancel-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .cancel-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.4);
        }

        .submit-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .ghost-btn {
          background: #f8fafc;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          box-shadow: none;
        }

        .ghost-btn:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }

        .ghost-btn.small {
          padding: 8px 16px;
          font-size: 12px;
          border-radius: 999px;
        }

        @media (max-width: 640px) {
          .day-popup-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .selected-count {
            margin-left: 0;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .selected-count span {
            font-size: 20px;
          }

          .quick-select-row {
            flex-direction: column;
          }

          .quick-select-btn,
          .quick-select-btn.ghost {
            width: 100%;
            text-align: center;
          }

          .day-grid-popup {
            gap: 10px;
          }

          @media (max-width: 420px) {
            .day-grid-popup {
              grid-template-columns: 1fr;
            }

            .day-card-popup {
              width: 100%;
            }
          }

          .day-card-popup {
            min-height: 90px;
          }

          .day-summary-panel {
            padding: 16px;
          }

          .summary-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .summary-chip-list {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          }

          .popup-buttons {
            flex-direction: column;
          }

          .popup-buttons button {
            width: 100%;
            text-align: center;
          }
        }

        .submit-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
        }

        .submit-btn:disabled {
          background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
          cursor: not-allowed;
          transform: none;
          opacity: 0.6;
        }

        /* AI Popup Content */
        .ai-popup-content {
          min-width: 500px;
          max-width: 600px;
        }

        .ai-popup-content h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .ai-popup-content p {
          color: #64748b;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .description-section {
          margin-bottom: 24px;
        }

        .description-section label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #334155;
          font-size: 14px;
        }

        .description-section textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          resize: vertical;
          transition: all 0.3s ease;
          outline: none;
        }

        .description-section textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .ai-popup-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .ai-cancel-btn, .ai-submit-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }

        .ai-cancel-btn {
          background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
          color: white;
        }

        .ai-cancel-btn:hover {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          transform: translateY(-2px);
        }

        .ai-submit-btn {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }

        .ai-submit-btn:hover {
          background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(236, 72, 153, 0.4);
        }

        .ai-submit-btn:disabled {
          background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
          cursor: not-allowed;
          transform: none;
          opacity: 0.6;
        }

        /* Custom Code Popup Styles - Professional Design */
        .custom-code-popup-content {
          min-width: 500px;
          max-width: 600px;
          width: 65%;
          background: #ffffff;
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .custom-code-popup-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 3px solid rgba(255, 255, 255, 0.2);
        }

        .popup-header-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .popup-header-text {
          flex: 1;
        }

        .popup-header-text h3 {
          margin: 0 0 6px 0;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .popup-header-text p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          line-height: 1.5;
        }

        /* Tabs Navigation */
        .code-tabs-navigation {
          display: flex;
          gap: 8px;
          padding: 16px 28px;
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          overflow-x: auto;
        }

        .code-tabs-navigation::-webkit-scrollbar {
          height: 4px;
        }

        .code-tabs-navigation::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        .code-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
        }

        .code-tab:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          color: #475569;
          transform: translateY(-2px);
        }

        .code-tab.active {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-color: #6366f1;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .code-tab.active .code-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          box-shadow: none;
        }

        .code-tab.active .html-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .code-tab.active .css-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .code-tab.active .js-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .code-tab .code-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
        }

        .tab-badge {
          background: rgba(255, 255, 255, 0.3);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          margin-left: auto;
        }

        .code-tab:not(.active) .tab-badge {
          background: #e2e8f0;
          color: #64748b;
        }

        .custom-code-tabs-container {
          padding: 24px 28px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .custom-code-tabs-container::-webkit-scrollbar {
          width: 8px;
        }

        .custom-code-tabs-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .custom-code-tabs-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .custom-code-tabs-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .code-section-wrapper {
          margin-bottom: 0;
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .code-section-wrapper:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .code-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .code-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          color: white;
        }

        .html-icon {
          background: linear-gradient(135deg, #e34c26 0%, #f06529 100%);
          box-shadow: 0 4px 12px rgba(227, 76, 38, 0.3);
        }

        .css-icon {
          background: linear-gradient(135deg, #264de4 0%, #2965f1 100%);
          box-shadow: 0 4px 12px rgba(38, 77, 228, 0.3);
        }

        .js-icon {
          background: linear-gradient(135deg, #f7df1e 0%, #f0db4f 100%);
          color: #323330;
          box-shadow: 0 4px 12px rgba(247, 223, 30, 0.3);
        }

        .code-section-header label {
          flex: 1;
          font-weight: 700;
          font-size: 16px;
          color: #1e293b;
          margin: 0;
        }

        .code-count {
          font-size: 12px;
          color: #64748b;
          background: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 500;
        }

        .textarea-container {
          position: relative;
        }

        .code-textarea {
          width: 100%;
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 13px;
          font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
          resize: vertical;
          transition: all 0.3s ease;
          outline: none;
          background: #ffffff;
          color: #1e293b;
          line-height: 1.6;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .code-textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.02);
          background: #ffffff;
        }

        .html-textarea:focus {
          border-color: #e34c26;
          box-shadow: 0 0 0 4px rgba(227, 76, 38, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .css-textarea:focus {
          border-color: #264de4;
          box-shadow: 0 0 0 4px rgba(38, 77, 228, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .js-textarea:focus {
          border-color: #f7df1e;
          box-shadow: 0 0 0 4px rgba(247, 223, 30, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .code-textarea::placeholder {
          color: #94a3b8;
          font-style: italic;
        }

        .custom-code-popup-footer {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 18px 28px;
          border-top: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .popup-info-text {
          flex: 1;
          font-size: 13px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .custom-code-popup-buttons {
          display: flex;
          gap: 12px;
        }

        .custom-code-cancel-btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .custom-code-cancel-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #475569;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }

        .custom-code-submit-btn {
          padding: 12px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .custom-code-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.5);
        }

        .custom-code-submit-btn:disabled {
          background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
          cursor: not-allowed;
          transform: none;
          opacity: 0.6;
          box-shadow: none;
        }

        .custom-code-modal-content {
          max-height: 90vh;
          overflow: hidden;
          border-radius: 20px;
        }

        /* Code Button Style */
        .code-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .code-btn:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .action-bar-section.center-section {
            max-width: 700px;
          }

          .modern-btn span {
            display: none;
          }

          .modern-btn {
            padding: 11px;
          }

          .page-info {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .modern-action-bar {
            padding: 10px 16px;
            flex-wrap: wrap;
          }

          .action-bar-section.left-section,
          .action-bar-section.right-section {
            min-width: auto;
          }

          .action-bar-section.center-section {
            order: 3;
            width: 100%;
            margin-top: 8px;
            max-width: 100%;
          }

          .floating-form-buttons {
            left: 12px;
            top: auto;
            bottom: 100px;
            transform: none;
          }

          .floating-form-btn {
            padding: 12px 16px;
            font-size: 13px;
            min-width: 140px;
          }

          .floating-form-btn span {
            display: block;
          }

          .template-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .modal-content {
            padding: 24px;
            border-radius: 16px;
            max-width: 95vw;
          }

          .day-grid-popup {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .redirect-popup-content,
          .day-selector-popup-content,
          .ai-popup-content,
          .custom-code-popup-content,
          .html-upload-popup-content {
            min-width: auto;
            width: 100%;
          }
        }

        /* Custom Scrollbar */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        }

        /* Loading States */
        .modern-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Hover Effects for Interactive Elements */
        button {
          -webkit-tap-highlight-color: transparent;
        }

        /* Focus States for Accessibility */
        .modern-btn:focus-visible {
          outline: 3px solid rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }

        /* No Templates Message */
        .no-templates-message {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
          font-size: 16px;
        }

        .no-templates-message p {
          margin: 0;
          font-weight: 500;
        }

        /* Loading Spinner */
        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Professional Success Popup Overlay */
        .success-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, 
            rgba(15, 23, 42, 0.85) 0%, 
            rgba(30, 41, 59, 0.90) 100%);
          backdrop-filter: blur(12px) saturate(120%);
          -webkit-backdrop-filter: blur(12px) saturate(120%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: professionalOverlayFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes professionalOverlayFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }

        /* Professional Success Popup Content */
        .success-popup-content {
          background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
          padding: 48px 56px;
          border-radius: 16px;
          box-shadow: 
            0 0 0 1px rgba(16, 185, 129, 0.1),
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 10px 30px rgba(0, 0, 0, 0.2);
          max-width: 520px;
          text-align: center;
          position: relative;
          border: 1px solid rgba(16, 185, 129, 0.15);
          animation: professionalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .success-popup-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
          border-radius: 16px 16px 0 0;
        }

        @keyframes professionalSlideIn {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Professional Party Sparkles */
        .success-sparkles {
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          height: 60px;
          pointer-events: none;
        }

        .sparkle {
          position: absolute;
          font-size: 24px;
          animation: professionalSparkle 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        }

        .sparkle-1 {
          top: 10px;
          left: 15%;
          animation-delay: 0s;
        }

        .sparkle-2 {
          top: 5px;
          right: 15%;
          animation-delay: 0.3s;
        }

        .sparkle-3 {
          top: 30px;
          left: 25%;
          animation-delay: 0.6s;
        }

        .sparkle-4 {
          top: 25px;
          right: 25%;
          animation-delay: 0.9s;
        }

        @keyframes professionalSparkle {
          0%, 100% {
            transform: scale(0.8) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
        }

        /* Professional Success Icon Container with Pulse Rings */
        .success-icon-container {
          width: 96px;
          height: 96px;
          margin: 0 auto 28px;
          position: relative;
          animation: professionalIconScale 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes professionalIconScale {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Pulse Rings for Celebration Effect */
        .success-pulse-ring,
        .success-pulse-ring-2 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 2px solid #10b981;
          opacity: 0;
          animation: professionalPulseRing 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .success-pulse-ring-2 {
          animation-delay: 0.5s;
          border-color: #3b82f6;
        }

        @keyframes professionalPulseRing {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }

        /* Professional SVG Checkmark */
        .success-checkmark-svg {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #10b981;
          stroke-miterlimit: 10;
          box-shadow: 
            0 0 0 8px rgba(16, 185, 129, 0.08),
            0 8px 24px rgba(16, 185, 129, 0.25);
        }

        .success-checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #10b981;
          fill: #ffffff;
          animation: professionalCircleStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .success-checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke: #10b981;
          stroke-width: 3;
          stroke-linecap: round;
          animation: professionalCheckStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }

        @keyframes professionalCircleStroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes professionalCheckStroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Professional Success Title with Party Icons */
        .success-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
          animation: professionalTitleFade 0.4s 0.2s ease both;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .title-icon {
          display: inline-block;
          font-size: 24px;
          animation: professionalTitleIconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s both;
        }

        .title-icon:first-child {
          animation-delay: 0.4s;
        }

        .title-icon:last-child {
          animation-delay: 0.5s;
        }

        @keyframes professionalTitleIconBounce {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.3) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes professionalTitleFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Professional Success Message */
        .success-message {
          font-size: 16px;
          color: #64748b;
          margin: 0 0 32px 0;
          line-height: 1.6;
          font-weight: 500;
          animation: professionalMessageFade 0.4s 0.3s ease both;
          letter-spacing: -0.2px;
        }

        @keyframes professionalMessageFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Professional Success Close Button */
        .success-close-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.2px;
          animation: professionalButtonFade 0.4s 0.5s ease both;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .success-close-btn svg {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        @keyframes professionalButtonFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-close-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .success-close-btn:hover svg {
          transform: translateX(4px);
        }

        .success-close-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        /* Professional Particle Animation with Party Effect */
        .success-particle-professional {
          position: fixed;
          top: 50%;
          z-index: 9998;
          border-radius: 50%;
          opacity: 0.8;
          animation: professionalParticleBurst linear forwards;
          box-shadow: 0 0 10px currentColor;
        }

        @keyframes professionalParticleBurst {
          0% {
            top: 50%;
            left: 50%;
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            top: calc(50% + var(--particle-x, 0px) * 0.5);
            left: calc(50% + var(--particle-x, 0px));
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5) rotate(var(--particle-rotate, 360deg));
          }
        }

        /* Professional Confetti Animation */
        .professional-confetti {
          position: fixed;
          top: -20px;
          z-index: 9998;
          border-radius: 2px;
          opacity: 0.9;
          animation: professionalConfettiFall linear forwards;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        @keyframes professionalConfettiFall {
          0% {
            top: -20px;
            transform: translateX(0) translateY(0) rotateZ(0deg) rotateY(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            top: 110vh;
            transform: translateX(var(--confetti-x, 0px)) translateY(20px) rotateZ(1080deg) rotateY(720deg);
            opacity: 0;
          }
        }

        /* Disabled Save Button State */
        .modern-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        .modern-btn:disabled:hover {
          transform: none !important;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35) !important;
        }

        /* Professional Success Details Section */
        .success-details {
          width: 100%;
          margin: 0 0 28px 0;
          padding: 0;
          animation: professionalDetailsFadeIn 0.4s 0.4s ease both;
        }

        @keyframes professionalDetailsFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
          animation: professionalDetailItemSlide 0.3s ease both;
        }

        .success-detail-item:last-child {
          border-bottom: none;
        }

        .success-detail-item:nth-child(1) {
          animation-delay: 0.45s;
        }

        .success-detail-item:nth-child(2) {
          animation-delay: 0.50s;
        }

        .success-detail-item:nth-child(3) {
          animation-delay: 0.55s;
        }

        @keyframes professionalDetailItemSlide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: #10b981;
          flex-shrink: 0;
        }

        .detail-icon svg {
          width: 20px;
          height: 20px;
        }

        .detail-text {
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          letter-spacing: -0.2px;
          flex: 1;
        }

        /* Professional Success Footer Text */
        .success-footer-text {
          margin: 16px 0 0 0;
          font-size: 13px;
          color: #94a3b8;
          font-weight: 400;
          animation: professionalFooterFadeIn 0.4s 0.6s ease both;
        }

        @keyframes professionalFooterFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Professional Mobile Responsive for Success Popup */
        @media (max-width: 768px) {
          .success-popup-content {
            padding: 40px 32px;
            max-width: 90vw;
            border-radius: 16px;
          }

          .success-sparkles {
            top: 15px;
            height: 50px;
          }

          .sparkle {
            font-size: 20px;
          }

          .success-icon-container {
            width: 80px;
            height: 80px;
            margin-bottom: 24px;
          }

          .success-checkmark-svg {
            width: 80px;
            height: 80px;
          }

          .success-pulse-ring,
          .success-pulse-ring-2 {
            width: 80px;
            height: 80px;
          }

          .success-title {
            font-size: 22px;
            margin-bottom: 10px;
            gap: 8px;
          }

          .title-icon {
            font-size: 20px;
          }

          .success-message {
            font-size: 15px;
            margin-bottom: 28px;
          }

          .success-details {
            margin-bottom: 24px;
          }

          .success-detail-item {
            padding: 10px 0;
            gap: 10px;
          }

          .detail-icon {
            width: 20px;
            height: 20px;
          }

          .detail-icon svg {
            width: 18px;
            height: 18px;
          }

          .detail-text {
            font-size: 13px;
          }

          .success-close-btn {
            padding: 12px 28px;
            font-size: 14px;
          }

          .success-footer-text {
            font-size: 12px;
            margin-top: 14px;
          }
        }

        @media (max-width: 480px) {
          .success-popup-content {
            padding: 36px 24px;
            max-width: 92vw;
          }

          .success-sparkles {
            top: 10px;
            height: 40px;
          }

          .sparkle {
            font-size: 18px;
          }

          .success-icon-container {
            width: 72px;
            height: 72px;
            margin-bottom: 20px;
          }

          .success-checkmark-svg {
            width: 72px;
            height: 72px;
          }

          .success-pulse-ring,
          .success-pulse-ring-2 {
            width: 72px;
            height: 72px;
          }

          .success-title {
            font-size: 20px;
            gap: 6px;
          }

          .title-icon {
            font-size: 18px;
          }

          .success-message {
            font-size: 14px;
            margin-bottom: 24px;
          }

          .success-details {
            margin-bottom: 20px;
          }

          .success-detail-item {
            padding: 8px 0;
            gap: 8px;
          }

          .detail-text {
            font-size: 12px;
          }

          .success-close-btn {
            padding: 12px 24px;
            font-size: 13px;
          }

          .success-footer-text {
            font-size: 11px;
          }
        }

        /* ========================================
           COMPREHENSIVE DARK MODE STYLES
           ======================================== */

        /* Modal Content Dark Mode */
        .dark-mode .modal-content {
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-color: #334155 !important;
        }

        .dark-mode .template-selector-title {
          color: #e2e8f0 !important;
        }

        .dark-mode .template-card {
          background: #1e293b !important;
          border-color: #334155 !important;
        }

        .dark-mode .template-card:hover {
          background: #334155 !important;
          border-color: #475569 !important;
        }

        .dark-mode .template-info h4 {
          color: #e2e8f0 !important;
        }

        .dark-mode .template-info p {
          color: #94a3b8 !important;
        }

        /* Popup Content Dark Mode */
        .dark-mode .redirect-popup-content h3,
        .dark-mode .day-selector-popup-content h3,
        .dark-mode .ai-popup-content h3,
        .dark-mode .custom-code-popup-content h3,
        .dark-mode .html-upload-popup-content h3 {
          color: #e2e8f0 !important;
        }

        .dark-mode .redirect-popup-content p,
        .dark-mode .day-selector-popup-content p,
        .dark-mode .ai-popup-content p {
          color: #94a3b8 !important;
        }

        .dark-mode .redirect-popup-content select,
        .dark-mode .day-selector-popup-content select {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .redirect-popup-content select:hover {
          background: #334155 !important;
          border-color: #475569 !important;
        }

        .dark-mode .redirect-popup-content input[type="url"] {
          background: #0f172a !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .redirect-popup-content input[type="url"]:focus {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2) !important;
        }

        .dark-mode .redirect-mode-toggle {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: #334155 !important;
        }

        .dark-mode .redirect-mode-btn {
          color: #cbd5f5 !important;
        }

        .dark-mode .redirect-mode-btn.active {
          background: #2563eb !important;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35) !important;
        }

        .dark-mode .redirect-popup-content .helper-text {
          color: #94a3b8 !important;
        }

        .dark-mode .day-card-popup {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .day-card-popup:hover {
          background: #334155 !important;
          border-color: #475569 !important;
        }

        .dark-mode .selected-day-info {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        /* Custom Code Popup Dark Mode */
        .dark-mode .custom-code-popup-content {
          background: #1e293b !important;
        }

        .dark-mode .code-tabs-navigation {
          background: #0f172a !important;
          border-color: #334155 !important;
        }

        .dark-mode .code-tab {
          color: #94a3b8 !important;
        }

        .dark-mode .code-tab.active {
          background: #334155 !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .code-section-wrapper {
          background: #0f172a !important;
          border-color: #334155 !important;
        }

        .dark-mode .code-textarea {
          background: #0f172a !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .code-textarea:focus {
          border-color: #3b82f6 !important;
          background: #1e293b !important;
        }

        .dark-mode .code-textarea::placeholder {
          color: #64748b !important;
        }

        /* AI Popup Dark Mode */
        .dark-mode .ai-popup-content {
          background: #1e293b !important;
        }

        .dark-mode .ai-popup-content textarea {
          background: #0f172a !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        /* HTML Upload Popup Styles */
        .html-upload-popup-content {
          min-width: 500px;
          max-width: 570px;
          width: 90%;
        }

        .html-upload-popup-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        .html-upload-popup-header .popup-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
        }

        .html-upload-popup-header .popup-header-text h3 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .html-upload-popup-header .popup-header-text p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        .html-upload-area {
          margin-bottom: 24px;
        }

        .file-drop-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          background: #f8fafc;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .file-drop-zone:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .file-drop-label {
          cursor: pointer;
          display: block;
        }

        .file-upload-icon {
          font-size: 48px;
          color: #3b82f6;
          margin-bottom: 16px;
        }

        .file-upload-text h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .file-upload-text p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .file-selected-area {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .file-info .file-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .file-info .file-details {
          flex: 1;
        }

        .file-info .file-details h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .file-info .file-details p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .remove-file-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #ef4444;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: background 0.2s ease;
        }

        .remove-file-btn:hover {
          background: #dc2626;
        }

        .file-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .preview-btn {
          padding: 8px 16px;
          border: 1px solid #3b82f6;
          background: white;
          color: #3b82f6;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .preview-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .html-preview-container {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-header h5 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .preview-size {
          font-size: 12px;
          color: #64748b;
        }

        .html-preview-frame {
          height: 300px;
          background: white;
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .processing-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          color: #0369a1;
          font-size: 14px;
        }

        .html-upload-popup-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .popup-info-text {
          flex: 1;
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
        }

        .html-upload-popup-buttons {
          display: flex;
          gap: 12px;
        }

        .html-upload-cancel-btn {
          padding: 10px 20px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .html-upload-cancel-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .html-upload-cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .html-upload-submit-btn {
          padding: 10px 20px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .html-upload-submit-btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .html-upload-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* HTML Upload Popup Dark Mode */
        .dark-mode .html-upload-popup-content {
          background: #1e293b !important;
        }

        .dark-mode .html-upload-popup-header {
          border-bottom-color: #334155 !important;
        }

        .dark-mode .html-upload-popup-header .popup-header-text h3 {
          color: #e2e8f0 !important;
        }

        .dark-mode .html-upload-popup-header .popup-header-text p {
          color: #94a3b8 !important;
        }

        .dark-mode .file-drop-zone {
          background: #0f172a !important;
          border-color: #334155 !important;
        }

        .dark-mode .file-drop-zone:hover {
          border-color: #3b82f6 !important;
          background: #1e293b !important;
        }

        .dark-mode .file-upload-text h4 {
          color: #e2e8f0 !important;
        }

        .dark-mode .file-upload-text p {
          color: #94a3b8 !important;
        }

        .dark-mode .file-selected-area {
          background: #0f172a !important;
          border-color: #334155 !important;
        }

        .dark-mode .file-info .file-details h4 {
          color: #e2e8f0 !important;
        }

        .dark-mode .file-info .file-details p {
          color: #94a3b8 !important;
        }

        .dark-mode .preview-btn {
          background: #1e293b !important;
          border-color: #3b82f6 !important;
          color: #3b82f6 !important;
        }

        .dark-mode .preview-btn:hover {
          background: #3b82f6 !important;
          color: white !important;
        }

        .dark-mode .html-preview-container {
          border-color: #334155 !important;
        }

        .dark-mode .preview-header {
          background: #334155 !important;
          border-bottom-color: #475569 !important;
        }

        .dark-mode .preview-header h5 {
          color: #e2e8f0 !important;
        }

        .dark-mode .preview-size {
          color: #94a3b8 !important;
        }

        .dark-mode .processing-message {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #60a5fa !important;
        }

        .dark-mode .html-upload-popup-footer {
          border-top-color: #334155 !important;
        }

        .dark-mode .popup-info-text {
          color: #94a3b8 !important;
        }

        .dark-mode .html-upload-cancel-btn {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #94a3b8 !important;
        }

        .dark-mode .html-upload-cancel-btn:hover {
          background: #334155 !important;
          border-color: #475569 !important;
        }

        /* Pages Sidebar Header Dark Mode */
        .dark-mode .pages-sidebar-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
          border-bottom-color: #334155 !important;
        }

        .dark-mode .pages-sidebar-footer {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
          border-top-color: #334155 !important;
        }

        .dark-mode .stat-item {
          background: #1e293b !important;
          border-color: #334155 !important;
        }

        .dark-mode .stat-value {
          color: #3b82f6 !important;
        }

        .dark-mode .stat-label {
          color: #94a3b8 !important;
        }

        /* Page Item Text Dark Mode */
        .dark-mode .page-item-name {
          color: #e2e8f0 !important;
        }

        .dark-mode .page-item-type {
          color: #94a3b8 !important;
        }

        .dark-mode .page-item-order {
          background: #334155 !important;
          color: #cbd5e1 !important;
        }

        /* Action Bar Text Dark Mode */
        .dark-mode .page-title {
          color: #fff !important;
        }

        .dark-mode .page-subtitle {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        /* GrapesJS Panels Dark Mode - Figma Style */
        .dark-mode .gjs-pn-panel,
        .dark-mode .gjs-pn-panel *,
        .dark-mode .gjs-pn-views-container,
        .dark-mode .gjs-pn-views-container *,
        .dark-mode .gjs-blocks-c,
        .dark-mode .gjs-blocks-c *,
        .dark-mode .gjs-layer-wrapper,
        .dark-mode .gjs-layer-wrapper *,
        .dark-mode .gjs-trt-traits,
        .dark-mode .gjs-trt-traits *,
        .dark-mode .gjs-sm-sectors,
        .dark-mode .gjs-sm-sectors *,
        .dark-mode .gjs-sm-sector,
        .dark-mode .gjs-sm-sector *,
        .dark-mode .gjs-sm-properties,
        .dark-mode .gjs-sm-properties * {
          background-color: #1e1e1e !important;
          color: #e5e5e5 !important;
        }

        .dark-mode .gjs-pn-panel {
          border-right-color: #2d2d2d !important;
          border-left-color: #2d2d2d !important;
        }

        .dark-mode .gjs-pn-btn {
          color: #b3b3b3 !important;
        }

        .dark-mode .gjs-pn-btn:hover {
          background: #2d2d2d !important;
          color: #18a0fb !important;
        }

        .dark-mode .gjs-sm-sector {
          background: #252525 !important;
          border-color: #2d2d2d !important;
        }

        .dark-mode .gjs-sm-property .gjs-sm-label {
          color: #b3b3b3 !important;
        }

        .dark-mode .gjs-sm-property .gjs-field {
          background: #252525 !important;
          border-color: #2d2d2d !important;
          color: #e5e5e5 !important;
        }

        .dark-mode .gjs-sm-property input[type="text"],
        .dark-mode .gjs-sm-property input[type="number"],
        .dark-mode .gjs-sm-property select {
          color: #e5e5e5 !important;
          background: transparent !important;
        }

        /* ========================================
           CREATIVE & BEAUTIFUL DARK MODE BLOCKS
           ======================================== */
        
        /* Block Category Header - Figma Style Dark Mode */
        .dark-mode .gjs-block-category,
        .dark-mode .gjs-block-category * {
          background: #252525 !important;
          background-color: #252525 !important;
          border-bottom: 1px solid #2d2d2d !important;
          padding: 12px 16px !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .dark-mode .gjs-block-category::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: -100% !important;
          width: 100% !important;
          height: 100% !important;
          background: linear-gradient(90deg, transparent, rgba(24, 160, 251, 0.1), transparent) !important;
          animation: shimmer 3s infinite !important;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .dark-mode .gjs-block-category-title,
        .dark-mode .gjs-block-category-title * {
          color: #e5e5e5 !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          font-size: 13px !important;
          position: relative !important;
          z-index: 1 !important;
        }
        
        /* Force dark mode for all blocks panel elements */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] *,
        .dark-mode .gjs-pn-panel .gjs-blocks-c *,
        .dark-mode .gjs-block-category *,
        .dark-mode .gjs-block * {
          background-color: transparent !important;
        }
        
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] {
          background: #1e1e1e !important;
        }
        
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-blocks-c {
          background: #1e1e1e !important;
        }
        
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block-category {
          background: #252525 !important;
        }
        
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block {
          background: #252525 !important;
        }
        
        /* Search input in blocks panel */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="text"],
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="search"] {
          background: #252525 !important;
          border: 1px solid #2d2d2d !important;
          color: #e5e5e5 !important;
        }
        
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="text"]::placeholder,
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="search"]::placeholder {
          color: #999999 !important;
        }

        /* Blocks Container - Figma Style Dark Background */
        .dark-mode .gjs-blocks-c,
        .dark-mode .gjs-blocks-c * {
          background: #1e1e1e !important;
          background-color: #1e1e1e !important;
          padding: 16px !important;
        }
        
        /* Override all white backgrounds in dark mode blocks panel */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"],
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] *,
        .dark-mode .gjs-pn-panel .gjs-blocks-c,
        .dark-mode .gjs-pn-panel .gjs-blocks-c * {
          background: #1e1e1e !important;
          background-color: #1e1e1e !important;
        }
        
        /* Block category in dark mode */
        .dark-mode .gjs-block-category,
        .dark-mode .gjs-block-category * {
          background: #252525 !important;
          background-color: #252525 !important;
        }

        /* Individual Blocks - Figma Style */
        .dark-mode .gjs-block,
        .dark-mode .gjs-block * {
          background: #252525 !important;
          background-color: #252525 !important;
          border: 1px solid #2d2d2d !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .dark-mode .gjs-block::before {
          content: '' !important;
          position: absolute !important;
          top: -50% !important;
          left: -50% !important;
          width: 200% !important;
          height: 200% !important;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%) !important;
          opacity: 0 !important;
          transition: opacity 0.5s ease !important;
        }

        .dark-mode .gjs-block::after {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%) !important;
          opacity: 0 !important;
          transition: opacity 0.3s ease !important;
          border-radius: 16px !important;
        }

        .dark-mode .gjs-block:hover {
          transform: translateY(-2px) !important;
          border-color: #18a0fb !important;
          box-shadow: 
            0 4px 12px rgba(24, 160, 251, 0.3),
            0 0 20px rgba(24, 160, 251, 0.1) !important;
          background: #2d2d2d !important;
        }

        .dark-mode .gjs-block:hover::before {
          opacity: 1 !important;
        }

        .dark-mode .gjs-block:hover::after {
          opacity: 1 !important;
        }

        /* Block Label - Figma Style Typography */
        .dark-mode .gjs-block-label {
          color: #e5e5e5 !important;
          font-weight: 600 !important;
          position: relative !important;
          z-index: 2 !important;
        }

        .dark-mode .gjs-block:hover .gjs-block-label {
          color: #ffffff !important;
        }

        /* Block Media/Icons - Figma Style */
        .dark-mode .gjs-block__media {
          filter: brightness(1.1) !important;
          position: relative !important;
          z-index: 2 !important;
        }

        .dark-mode .gjs-block:hover .gjs-block__media {
          filter: brightness(1.2) !important;
          transform: scale(1.05) !important;
        }

        /* Specific Block Types - Figma Style */
        .dark-mode .gjs-block[data-type="text"]:hover,
        .dark-mode .gjs-block[data-type="link"]:hover,
        .dark-mode .gjs-block[data-type="image"]:hover,
        .dark-mode .gjs-block[data-type="column"]:hover,
        .dark-mode .gjs-block[data-type="video"]:hover,
        .dark-mode .gjs-block[data-type="quote"]:hover,
        .dark-mode .gjs-block[data-type="map"]:hover {
          border-color: #18a0fb !important;
          box-shadow: 0 4px 12px rgba(24, 160, 251, 0.3) !important;
        }

        .dark-mode .gjs-layer {
          color: #e5e5e5 !important;
        }

        .dark-mode .gjs-layer:hover {
          background: #2d2d2d !important;
        }

        .dark-mode .gjs-layer.gjs-selected {
          background: #2d2d2d !important;
          border-left-color: #18a0fb !important;
        }

        /* Success Popup Dark Mode */
        .dark-mode .success-popup-content {
          background: linear-gradient(to bottom, #1e293b 0%, #0f172a 100%) !important;
          border-color: #334155 !important;
        }

        .dark-mode .success-title {
          color: #e2e8f0 !important;
        }

        .dark-mode .success-message {
          color: #94a3b8 !important;
        }

        .dark-mode .success-detail-item {
          border-bottom-color: #334155 !important;
        }

        .dark-mode .detail-text {
          color: #cbd5e1 !important;
        }

        .dark-mode .success-footer-text {
          color: #64748b !important;
        }

        /* Floating Form Buttons Dark Mode */
        .dark-mode .floating-form-btn {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .floating-form-btn:hover {
          background: #334155 !important;
          border-color: #475569 !important;
        }

        /* Popup Buttons Dark Mode */
        .dark-mode .popup-buttons .cancel-btn {
          background: #1e293b !important;
          border-color: #334155 !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .popup-buttons .cancel-btn:hover {
          background: #334155 !important;
          border-color: #475569 !important;
        }

        /* Scrollbar Dark Mode */
        .dark-mode .pages-list::-webkit-scrollbar-track {
          background: #0f172a !important;
        }

        .dark-mode .pages-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
        }

        .dark-mode .gjs-pn-views-container::-webkit-scrollbar-track {
          background: #1e1e1e !important;
        }

        .dark-mode .gjs-pn-views-container::-webkit-scrollbar-thumb {
          background: #18a0fb !important;
        }

        /* Professional Enhancements for Dark Mode - Figma Style */
        .dark-mode .portfolio-edit-container {
          background: #1a1a1a;
        }

        .dark-mode .editor-main-area {
          background: #1a1a1a;
        }

        /* Enhanced Right Panel - Blocks Panel - Figma Style */
        .dark-mode .gjs-pn-panel.gjs-pn-views-container {
          background: #1e1e1e !important;
          border-left: 1px solid #2d2d2d !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5) !important;
        }

        /* Panel Buttons - Figma Style Dark Mode */
        .dark-mode .gjs-pn-btn {
          background: #252525 !important;
          border: 1px solid #2d2d2d !important;
          color: #b3b3b3 !important;
        }

        .dark-mode .gjs-pn-btn:hover {
          background: #2d2d2d !important;
          border-color: #3a3a3a !important;
          color: #18a0fb !important;
        }

        .dark-mode .gjs-pn-btn.gjs-pn-active {
          background: #18a0fb !important;
          border-color: #18a0fb !important;
          color: #ffffff !important;
          box-shadow: 0 2px 8px rgba(24, 160, 251, 0.3) !important;
        }

        /* Smooth Transitions for All Dark Mode Elements */
        .dark-mode * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
        }

        /* Additional Creative Effects */
        .dark-mode .gjs-blocks-c::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: 
            radial-gradient(circle at 20% 50%, rgba(24, 160, 251, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(24, 160, 251, 0.1) 0%, transparent 50%) !important;
          pointer-events: none !important;
          z-index: 0 !important;
        }

        /* ========================================
           COMPREHENSIVE BLOCKS PANEL DARK MODE OVERRIDES
           ======================================== */
        
        /* Force dark background for blocks panel container */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"],
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-pn-views,
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-pn-views-container {
          background: #1e1e1e !important;
          background-color: #1e1e1e !important;
        }

        /* Blocks container dark mode */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-blocks-c,
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-blocks {
          background: #1e1e1e !important;
          background-color: #1e1e1e !important;
        }

        /* All child elements in blocks panel */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] * {
          background-color: transparent !important;
        }

        /* Block categories dark mode */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block-category {
          background: #252525 !important;
          background-color: #252525 !important;
        }

        /* Block items dark mode */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block {
          background: #252525 !important;
          background-color: #252525 !important;
        }

        /* Block labels dark mode */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block-label,
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block-category-title {
          color: #e5e5e5 !important;
        }

        /* Search input in blocks panel */
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input,
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="text"],
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="search"] {
          background: #252525 !important;
          background-color: #252525 !important;
          border: 1px solid #2d2d2d !important;
          color: #e5e5e5 !important;
        }

        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input::placeholder,
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="text"]::placeholder,
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input[type="search"]::placeholder {
          color: #999999 !important;
        }

        .dark-mode .gjs-pn-panel[data-pn-type="blocks"] input:focus {
          border-color: #18a0fb !important;
          background: #2d2d2d !important;
        }

        /* Override any remaining white backgrounds with higher specificity */
        .dark-mode .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"],
        .dark-mode .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"] *,
        .dark-mode .portfolio-edit-container .gjs-blocks-c,
        .dark-mode .portfolio-edit-container .gjs-blocks-c *,
        .dark-mode .portfolio-edit-container .gjs-block-category,
        .dark-mode .portfolio-edit-container .gjs-block-category *,
        .dark-mode .portfolio-edit-container .gjs-block,
        .dark-mode .portfolio-edit-container .gjs-block * {
          background-color: transparent !important;
        }

        /* Specific backgrounds for containers */
        .dark-mode .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"] {
          background: #1e1e1e !important;
        }

        .dark-mode .portfolio-edit-container .gjs-blocks-c {
          background: #1e1e1e !important;
        }

        .dark-mode .portfolio-edit-container .gjs-block-category {
          background: #252525 !important;
        }

        .dark-mode .portfolio-edit-container .gjs-block {
          background: #252525 !important;
        }

        /* Right sidebar dark mode should mirror light layout (only colors differ) */
        .dark-mode .gjs-pn-panel.gjs-pn-views-container,
        body.dark-mode-active .gjs-pn-panel.gjs-pn-views-container,
        .dark-mode .gjs-pn-panel[data-pn-type="views-container"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="views-container"],
        .dark-mode .gjs-pn-panel[data-pn-type="blocks"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="blocks"],
        .dark-mode .gjs-pn-panel[data-pn-type="layers"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="layers"],
        .dark-mode .gjs-pn-panel[data-pn-type="traits"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="traits"],
        .dark-mode .gjs-pn-panel[data-pn-type="style-manager"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="style-manager"] {
          background: #0f172a !important;
          border-left: 1px solid #1f2937 !important;
          border-right: 1px solid #1f2937 !important;
          box-shadow: -6px 0 24px rgba(0, 0, 0, 0.45) !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .gjs-pn-buttons,
        body.dark-mode-active .gjs-pn-buttons,
        .dark-mode .gjs-pn-views,
        body.dark-mode-active .gjs-pn-views {
          background: transparent !important;
          padding: 10px 8px !important;
        }

        .dark-mode .gjs-pn-btn,
        body.dark-mode-active .gjs-pn-btn {
          background: #111827 !important;
          border: 1px solid #1f2937 !important;
          color: #cbd5e1 !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
        }

        .dark-mode .gjs-pn-btn:hover,
        body.dark-mode-active .gjs-pn-btn:hover {
          background: #1f2937 !important;
          border-color: #2563eb !important;
          color: #e2e8f0 !important;
        }

        .dark-mode .gjs-pn-btn.gjs-pn-active,
        body.dark-mode-active .gjs-pn-btn.gjs-pn-active {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          border-color: #1d4ed8 !important;
          color: #f8fafc !important;
          box-shadow: 0 10px 24px rgba(37, 99, 235, 0.35) !important;
        }

        .dark-mode .gjs-pn-btn.gjs-pn-active *,
        .dark-mode .gjs-pn-btn.gjs-pn-active svg,
        .dark-mode .gjs-pn-btn.gjs-pn-active .fa {
          color: #f8fafc !important;
          fill: #f8fafc !important;
        }

        /* Match light-mode spacing/structure in dark palette */
        .dark-mode .gjs-pn-views-container,
        body.dark-mode-active .gjs-pn-views-container,
        .dark-mode .gjs-pn-panel .gjs-pn-views,
        body.dark-mode-active .gjs-pn-panel .gjs-pn-views,
        .dark-mode .gjs-pn-panel .gjs-pn-views-container,
        body.dark-mode-active .gjs-pn-panel .gjs-pn-views-container,
        .dark-mode .gjs-pn-panel .gjs-blocks-c,
        body.dark-mode-active .gjs-pn-panel .gjs-blocks-c {
          padding: 12px 10px !important;
          background: transparent !important;
        }

        .dark-mode .gjs-blocks-c,
        body.dark-mode-active .gjs-blocks-c,
        .dark-mode .gjs-blocks,
        body.dark-mode-active .gjs-blocks {
          display: grid !important;
          gap: 10px !important;
        }

        /* Keep block cards structured like light mode but with dark palette */
        .dark-mode .gjs-block-category,
        body.dark-mode-active .gjs-block-category {
          background: #111827 !important;
          border: 1px solid #1f2937 !important;
          border-radius: 8px !important;
          margin: 0 12px 16px 12px !important; /* match light spacing */
          padding: 12px 12px 10px 12px !important;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25) !important;
        }

        .dark-mode .gjs-block,
        body.dark-mode-active .gjs-block {
          background: #0b1220 !important;
          border: 1px solid #1f2937 !important;
          border-radius: 6px !important; /* same shape as light */
          color: #e2e8f0 !important;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.35) !important;
          padding: 8px !important; /* match light padding */
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
          min-height: 60px !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          justify-content: center !important;
          align-items: center !important;
        }

        .dark-mode .gjs-block:hover,
        body.dark-mode-active .gjs-block:hover {
          border-color: #2563eb !important;
          box-shadow: 0 12px 26px rgba(37, 99, 235, 0.35) !important;
          transform: translateY(-2px);
        }

        .dark-mode .gjs-block .gjs-block-title,
        body.dark-mode-active .gjs-block .gjs-block-title,
        .dark-mode .gjs-block .gjs-block-label,
        body.dark-mode-active .gjs-block .gjs-block-label {
          color: #e2e8f0 !important;
          font-weight: 600 !important;
        }

        .dark-mode .gjs-block__media,
        body.dark-mode-active .gjs-block__media,
        .dark-mode .gjs-block__media *,
        body.dark-mode-active .gjs-block__media * {
          color: #cbd5e1 !important;
          width: 24px !important;
          height: 24px !important;
          margin-bottom: 4px !important;
          opacity: 0.8 !important;
        }

        .dark-mode .gjs-block-content,
        body.dark-mode-active .gjs-block-content {
          background: transparent !important;
        }

        .dark-mode .gjs-block-category-title,
        body.dark-mode-active .gjs-block-category-title {
          color: #cbd5e1 !important;
        }

        /* Inputs in right sidebar panels */
        .dark-mode .gjs-pn-panel input,
        body.dark-mode-active .gjs-pn-panel input,
        .dark-mode .gjs-pn-panel select,
        body.dark-mode-active .gjs-pn-panel select,
        .dark-mode .gjs-pn-panel textarea,
        body.dark-mode-active .gjs-pn-panel textarea,
        .dark-mode .gjs-pn-panel .gjs-field,
        body.dark-mode-active .gjs-pn-panel .gjs-field {
          background: #0b1220 !important;
          border: 1px solid #1f2937 !important;
          color: #e2e8f0 !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
        }

        .dark-mode .gjs-pn-panel input::placeholder,
        body.dark-mode-active .gjs-pn-panel input::placeholder,
        .dark-mode .gjs-pn-panel select::placeholder,
        body.dark-mode-active .gjs-pn-panel select::placeholder,
        .dark-mode .gjs-pn-panel textarea::placeholder,
        body.dark-mode-active .gjs-pn-panel textarea::placeholder,
        .dark-mode .gjs-pn-panel .gjs-field::placeholder,
        body.dark-mode-active .gjs-pn-panel .gjs-field::placeholder {
          color: #94a3b8 !important;
        }

        /* Panels content spacing */
        .dark-mode .gjs-pn-panel .gjs-pn-views-container,
        .dark-mode .gjs-pn-panel .gjs-blocks-c,
        .dark-mode .gjs-pn-panel .gjs-layer-wrapper,
        body.dark-mode-active .gjs-pn-panel .gjs-layer-wrapper,
        .dark-mode .gjs-pn-panel .gjs-sm-sectors,
        body.dark-mode-active .gjs-pn-panel .gjs-sm-sectors,
        .dark-mode .gjs-pn-panel .gjs-trt-traits,
        body.dark-mode-active .gjs-pn-panel .gjs-trt-traits {
          padding: 12px 10px !important;
          background: transparent !important;
        }

        /* Keep blocks list padding like light mode */
        .dark-mode .gjs-blocks-c,
        body.dark-mode-active .gjs-blocks-c {
          padding: 4px 8px 16px 8px !important;
        }

        /* Final high-specificity overrides so dark mode matches light layout exactly */
        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-blocks-c,
        body.dark-mode-active .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"] .gjs-blocks-c {
          display: grid !important;
          gap: 10px !important;
          padding: 4px 8px 16px 8px !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block-category,
        body.dark-mode-active .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"] .gjs-block-category {
          background: #fafbfc !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          margin: 0 12px 16px 12px !important;
          padding: 12px 12px 10px 12px !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block,
        body.dark-mode-active .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"] .gjs-block {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 8px !important;
          min-height: 60px !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 6px !important;
          box-sizing: border-box !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block .gjs-block-label,
        body.dark-mode-active .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"] .gjs-block .gjs-block-label {
          font-size: 12px !important;
          font-weight: 600 !important;
          line-height: 1.4 !important;
          color: #475569 !important;
          padding: 4px 6px !important;
          text-align: center !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="blocks"] .gjs-block__media,
        body.dark-mode-active .portfolio-edit-container .gjs-pn-panel[data-pn-type="blocks"] .gjs-block__media {
          width: 24px !important;
          height: 24px !important;
          margin-bottom: 4px !important;
          opacity: 0.8 !important;
        }

        /* Make dark-mode panels reuse light-mode styling (layout + colors) */
        .portfolio-edit-container.dark-mode .gjs-pn-panel.gjs-pn-views-container,
        body.dark-mode-active .gjs-pn-panel.gjs-pn-views-container,
        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="views-container"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="views-container"],
        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="blocks"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="blocks"],
        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="layers"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="layers"],
        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="traits"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="traits"],
        .portfolio-edit-container.dark-mode .gjs-pn-panel[data-pn-type="style-manager"],
        body.dark-mode-active .gjs-pn-panel[data-pn-type="style-manager"] {
          background: #ffffff !important;
          border-left: 1px solid #e5e7eb !important;
          border-right: 1px solid #e5e7eb !important;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.03) !important;
          color: #1e293b !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-buttons,
        body.dark-mode-active .gjs-pn-buttons,
        .portfolio-edit-container.dark-mode .gjs-pn-views,
        body.dark-mode-active .gjs-pn-views {
          background: transparent !important;
          padding: 10px 8px !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-btn,
        body.dark-mode-active .gjs-pn-btn {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          color: #1e293b !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-btn:hover,
        body.dark-mode-active .gjs-pn-btn:hover {
          background: #f1f5f9 !important;
          border-color: #e5e7eb !important;
          color: #3b82f6 !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-btn.gjs-pn-active,
        body.dark-mode-active .gjs-pn-btn.gjs-pn-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          border-color: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        .portfolio-edit-container.dark-mode .gjs-pn-btn.gjs-pn-active *,
        body.dark-mode-active .gjs-pn-btn.gjs-pn-active * {
          color: #ffffff !important;
          fill: #ffffff !important;
        }

        /* Text colors to stay readable */
        .dark-mode .gjs-pn-panel,
        body.dark-mode-active .gjs-pn-panel,
        .dark-mode .gjs-pn-panel *,
        body.dark-mode-active .gjs-pn-panel * {
          color: #e2e8f0 !important;
        }

        .dark-mode .gjs-pn-panel .gjs-block-label,
        body.dark-mode-active .gjs-pn-panel .gjs-block-label,
        .dark-mode .gjs-pn-panel .gjs-block-category-title,
        body.dark-mode-active .gjs-pn-panel .gjs-block-category-title,
        .dark-mode .gjs-pn-panel .gjs-sm-title,
        body.dark-mode-active .gjs-pn-panel .gjs-sm-title,
        .dark-mode .gjs-pn-panel .gjs-sm-label,
        body.dark-mode-active .gjs-pn-panel .gjs-sm-label {
          color: #e2e8f0 !important;
        }

        /* Scrollbar subtle like light mode */
        .dark-mode .gjs-pn-views-container::-webkit-scrollbar-thumb,
        body.dark-mode-active .gjs-pn-views-container::-webkit-scrollbar-thumb {
          background: #2563eb !important;
          border-radius: 8px !important;
        }
        `
      }} />
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ 
            padding: '24px', 
            background: '#fee2e2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Something went wrong!
            </div>
            <div style={{ fontSize: '14px' }}>
              The editor encountered an error. Please refresh the page.
            </div>
          </div>
          <button 
            style={{ 
              padding: '12px 24px', 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapped component with error boundary
const PortfolioEditWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <PortfolioEdit {...props} />
  </ErrorBoundary>
);

export default PortfolioEditWithErrorBoundary;
