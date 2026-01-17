import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSync, FaDownload, FaArrowLeft, FaMagic, FaFileAlt, FaSave, FaFileExport, FaArrowDown, FaCalendarDay, FaGripVertical } from 'react-icons/fa';
import axios from "axios";
import { updateProjectData, setSelectedTemplateForStage, updateStageBasicInfo,
   saveFunnelToBackend, fetchFunnelBySlug, resetState } from '../../../redux/funnel.jsx';
import { templates } from './df_temp.jsx';
import addLandingPageComponents from './function.jsx';
import { getCoachId, getToken, debugAuthState } from '../../../utils/authUtils';
// GrapesJS Core and Plugins (Free version)
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from "grapesjs-preset-webpage";
import gjsForms from "grapesjs-plugin-forms";
import gjsCountdown from "grapesjs-component-countdown";
import gjsTabs from "grapesjs-tabs";
import gjsCustomCode from "grapesjs-custom-code";
import gjsTooltip from "grapesjs-tooltip";
import gjsTyped from "grapesjs-typed";
import gjsNavbar from "grapesjs-navbar";
import gjsBlocksBasic from "grapesjs-blocks-basic";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPage) {
      alert('Please select a redirect page');
      return;
    }
    onSelect(selectedPage);
    onClose();
  };

  return (
    <div className="redirect-popup-content">
      <h3>Select Redirect Page</h3>
      <p>Choose where users should be redirected after form submission:</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
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

//** Success Popup Component with Party Celebration **//
const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    // Create enhanced confetti effect with more colors and shapes
    const confettiColors = [
      '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500',
      '#ff1493', '#00ced1', '#ff4500', '#32cd32', '#9370db', '#ff69b4', '#1e90ff'
    ];
    const confettiCount = 150;
    const confettiElements = [];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 2.5 + 's';
      confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      confetti.style.animationDuration = (Math.random() * 2.5 + 2.5) + 's';
      confetti.style.setProperty('--confetti-x', `${(Math.random() - 0.5) * 200}px`);
      
      // Random sizes for variation
      const size = Math.random() * 8 + 8;
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';
      
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      confettiElements.forEach(el => el.remove());
    };
  }, [onClose]);

  return (
    <div className="success-popup-overlay">
      <div className="success-popup-content">
        <div className="success-icon-container">
          <div className="success-checkmark">✓</div>
        </div>
        <div className="success-party-emojis">
          🎉 🎊 🎈 🎆 ✨
        </div>
        <h2 className="success-title">Success!</h2>
        <p className="success-message">{message}</p>
        
        {/* Additional Success Details */}
        <div className="success-details">
          <div className="success-detail-item">
            <span className="detail-icon">✅</span>
            <span className="detail-text">Changes saved successfully</span>
          </div>
          <div className="success-detail-item">
            <span className="detail-icon">☁️</span>
            <span className="detail-text">Synced to cloud</span>
          </div>
          <div className="success-detail-item">
            <span className="detail-icon">🚀</span>
            <span className="detail-text">Ready to publish</span>
          </div>
        </div>

        <button onClick={onClose} className="success-close-btn">
          Continue
        </button>
        
        <p className="success-footer-text">Auto-closing in 4 seconds...</p>
      </div>
    </div>
  );
};

//** Day Selector Popup Component **//
const DaySelectorPopup = ({ onSelect, onClose }) => {
  const [selectedDay, setSelectedDay] = useState('');
  const [recentDate, setRecentDate] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Function to find most recent date for a day
  const findMostRecentDateForDay = (dayName) => {
    const today = new Date();
    const dayMap = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 0
    };

    const targetDay = dayMap[dayName];
    const currentDay = today.getDay();
    
    let daysToSubtract = (currentDay - targetDay + 7) % 7;
    if (daysToSubtract === 0) {
      daysToSubtract = 0;
    }
    
    const recentDate = new Date(today);
    recentDate.setDate(today.getDate() - daysToSubtract);
    
    return recentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    const recent = findMostRecentDateForDay(day);
    setRecentDate(recent);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDay) {
      alert('Please select a day');
      return;
    }
    console.log('📤 Submitting from popup:', selectedDay, recentDate);
    onSelect(selectedDay, recentDate);
    onClose();
  };

  return (
    <div className="day-selector-popup-content">
      <h3>Select Day & View Recent Date</h3>
      <p>Choose a day to see its most recent date:</p>
      
      <form onSubmit={handleSubmit}>
        <div className="day-grid-popup">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className={`day-card-popup ${selectedDay === day ? 'selected' : ''}`}
              onClick={() => handleDaySelect(day)}
            >
              <span className="day-name">{day}</span>
            </div>
          ))}
        </div>

        {selectedDay && (
          <div className="selected-day-info">
            <div className="selected-day-display">
              <strong>Selected Day:</strong> {selectedDay}
            </div>
            <div className="recent-date-display">
              <strong>Most Recent Date:</strong> {recentDate}
            </div>
          </div>
        )}

        <div className="popup-buttons">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={!selectedDay}>
            Add to Page
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

//** Main Editor Component **//
const PortfolioEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug, stageId } = useParams();
  const { contentData, stages, apiStatus, funnelId, funnelType } = useSelector((state) => state.funnel);
  const authState = useSelector((state) => state.auth);
  const user = authState?.user;
  const coachId = getCoachId(authState);
  const token = getToken(authState);

  // Debug auth state
  debugAuthState(authState, 'PortfolioEdit');

  const API_BASE_URL = window.API_BASE_URL || 'https://api.funnelseye.com';

  const [editorInstance, setEditorInstance] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [showRedirectPopup, setShowRedirectPopup] = useState(false);
  const [showDaySelectorPopup, setShowDaySelectorPopup] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const [forceRefreshKey, setForceRefreshKey] = useState(0);
  const [assets, setAssets] = useState([]);
  const [selectedRedirectPage, setSelectedRedirectPage] = useState('');
  const [availableForms, setAvailableForms] = useState([]);
  const [showPagesSidebar, setShowPagesSidebar] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState(stageId);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Ref to prevent multiple editor initializations
  const editorInitializedRef = React.useRef(false);
  const editorContainerRef = React.useRef(null);
  const projectDataRef = React.useRef(null);
  
  // Day Selector state management
  const [daySelectedComponents, setDaySelectedComponents] = useState(new Set());
  const [selectedDaySelectorId, setSelectedDaySelectorId] = useState(null);
  const [selectedComponentElement, setSelectedComponentElement] = useState(null);

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
  }, []); // Empty dependencies to prevent re-creation

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
    if (slug) {
      dispatch(fetchFunnelBySlug(slug));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (stages && stageId) {
      const stage = stages.find(s => s.id === stageId);
      if (stage) {
        setCurrentStage(stage);
        const stageConfig = contentData.stagesConfig?.[stage.type] || contentData.customStagesConfig?.[stage.id];
        if (stageConfig?.redirectPage) {
          setSelectedRedirectPage(stageConfig.redirectPage);
        }
      }
    }
  }, [stages, stageId, contentData]);

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
              const formData = {
                name: this.querySelector('input[name="name"]').value,
                email: this.querySelector('input[name="email"]').value,
                phone: fullPhoneNumber,
                city: this.querySelector('input[name="city"]').value,
                country: this.querySelector('input[name="country"]').value,
                coachId: coachId,
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
                throw new Error('Coach information not available');
              }

              // API call to create lead
              const response = await axios.post('https://api.funnelseye.com/api/leads', {
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

    setTimeout(initializeAllForms, 1000);
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
      // Check if CSS still exists in iframe
      setTimeout(() => {
        const iframe = editor.Canvas.getFrameEl();
        if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
          const iframeDoc = iframe.contentWindow.document;
          const hasPageCss = iframeDoc.querySelector('style[data-page-css]');
          
          if (!hasPageCss) {
            const currentPage = editor.Pages?.getSelected();
            if (currentPage) {
              console.log('⚠️ CSS lost after component change, re-injecting...');
              injectPageCSS(currentPage, false);
            }
          }
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
      content: `<div class="day-selector-display-widget" data-component-id="${Date.now()}"><div class="day-selector-header"><span class="calendar-icon">📅</span><h3>Day Information</h3></div><div class="day-info-content"><div class="selected-day-info"><strong>Selected Day:</strong> <span class="day-value">Click Day Selector to choose</span></div><div class="recent-date-info"><strong>Most Recent Date:</strong> <span class="date-value">No day selected</span></div></div><div class="day-selector-instructions"><p>Use "Day Selector" button to set day for this component</p></div></div>`,
      attributes: { 
        class: 'day-selector-widget-element',
        'data-selected-day': '',
        'data-recent-date': '',
        'data-component-id': `day-selector-${Date.now()}`
      },
      media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,
    });

    // Add CSS for Day Selector Widget
    editor.setStyle(`.day-selector-display-widget{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:15px;padding:20px;margin:20px 0;box-shadow:0 10px 30px rgba(0,0,0,0.2);color:white;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;text-align:center;min-height:150px;display:flex;flex-direction:column;justify-content:center;transition:all 0.3s ease;border:3px solid transparent}.day-selector-display-widget.selected{border:3px solid #4CAF50!important;box-shadow:0 0 20px rgba(76,175,80,0.5);animation:selectedPulse 2s infinite}@keyframes selectedPulse{0%{box-shadow:0 0 20px rgba(76,175,80,0.5)}50%{box-shadow:0 0 30px rgba(76,175,80,0.8)}100%{box-shadow:0 0 20px rgba(76,175,80,0.5)}}.day-selector-display{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:15px;padding:20px;margin:20px 0;box-shadow:0 10px 30px rgba(0,0,0,0.2);color:white;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;text-align:center;min-height:150px;display:flex;flex-direction:column;justify-content:center}.day-selector-header{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px}.calendar-icon{font-size:24px}.day-selector-header h3{margin:0;font-size:24px;font-weight:600;text-shadow:0 2px 4px rgba(0,0,0,0.3)}.day-info-content{display:flex;flex-direction:column;gap:15px}.selected-day-info,.recent-date-info{background:rgba(255,255,255,0.15);padding:15px 20px;border-radius:10px;border-left:4px solid #ffd700;backdrop-filter:blur(10px)}.selected-day-info strong,.recent-date-info strong{color:#ffd700;margin-right:10px}.selected-day-value,.recent-date-value,.day-value,.date-value{color:#fff;font-weight:500}.day-selector-instructions{margin-top:20px;padding:15px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px dashed rgba(255,255,255,0.3)}.day-selector-instructions p{margin:0;color:rgba(255,255,255,0.8);font-size:14px;font-style:italic}@media (max-width:768px){.day-selector-display-widget,.day-selector-display{margin:10px 0;padding:15px;min-height:120px}.day-selector-header h3{font-size:20px}.selected-day-info,.recent-date-info{padding:12px 15px;font-size:14px}}@media (max-width:480px){.day-selector-header{flex-direction:column;gap:5px}.day-selector-header h3{font-size:18px}.day-info-content{gap:10px}}`);

    // Component selection handler - REPLACE EXISTING
    editor.on('component:selected', (component) => {
      // Clear all selections first
      document.querySelectorAll('.day-selector-display-widget, .day-selector-widget-element').forEach(el => {
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
        
        // Visual feedback
        element.classList.add('selected');
        
        console.log('✅ Day selector selected:', componentId);
      } else {
        setSelectedDaySelectorId(null);
        setSelectedComponentElement(null);
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
        const dayComponents = document.querySelectorAll('[data-selected-day]:not([data-selected-day=""])');
        dayComponents.forEach(component => {
          const selectedDay = component.getAttribute('data-selected-day');
          if (selectedDay) {
            const findMostRecentDateForDay = (dayName) => {
              const today = new Date();
              const dayMap = {
                'Monday': 1,
                'Tuesday': 2,
                'Wednesday': 3,
                'Thursday': 4,
                'Friday': 5,
                'Saturday': 6,
                'Sunday': 0
              };
              
              const targetDay = dayMap[dayName];
              const currentDay = today.getDay();
              let daysToSubtract = (currentDay - targetDay + 7) % 7;
              if (daysToSubtract === 0) daysToSubtract = 0;
              
              const recentDate = new Date(today);
              recentDate.setDate(today.getDate() - daysToSubtract);
              
              return recentDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              });
            };
            
            const newDate = findMostRecentDateForDay(selectedDay);
            const dateValue = component.querySelector('.date-value');
            if (dateValue && dateValue.textContent !== newDate) {
              dateValue.textContent = newDate;
              component.setAttribute('data-recent-date', newDate);
            }
          }
        });
      };
      
      // Update every minute
      setInterval(updateDaySelectors, 60000);
      // Update on page load
      setTimeout(updateDaySelectors, 1000);
    };

    // Initialize auto-update
    setupAutoUpdateDaySelectors();

    // Direct DOM update function for day selector
    window.updateDaySelectorDirectly = (selectedDay, recentDate) => {
      console.log('Direct DOM update called with:', selectedDay, recentDate);
      
      // Find all day selector components
      const dayComponents = document.querySelectorAll('.day-selector-display-widget');
      console.log('Found day components for direct update:', dayComponents.length);
      
      dayComponents.forEach((component, index) => {
        const dayValue = component.querySelector('.day-value');
        const dateValue = component.querySelector('.date-value');
        
        if (dayValue) {
          dayValue.textContent = selectedDay;
          console.log(`Updated day-value ${index}:`, selectedDay);
        }
        
        if (dateValue) {
          dateValue.textContent = recentDate;
          console.log(`Updated date-value ${index}:`, recentDate);
        }
        
        // Update attributes
        component.setAttribute('data-selected-day', selectedDay);
        component.setAttribute('data-recent-date', recentDate);
      });
      
      return dayComponents.length;
    };

    // Function to update day selector widget
    window.updateDaySelectorWidget = (selectedDay, recentDate) => {
      console.log('Updating day selector widgets with:', selectedDay, recentDate);
      
      // Find all day selector widgets on the page with multiple selectors
      const widgets = document.querySelectorAll(
        '.day-selector-widget-element, .day-selector-display, .day-selector-display-widget, [data-selected-day], .day-info-content'
      );
      
      console.log('Found widgets:', widgets.length);
      
      widgets.forEach((widget, index) => {
        console.log(`Updating widget ${index}:`, widget);
        
        // Try multiple selectors for day value
        let dayValue = widget.querySelector('.day-value') || 
                      widget.querySelector('.selected-day-value') ||
                      widget.querySelector('[class*="day-value"]');
        
        // Try multiple selectors for date value  
        let dateValue = widget.querySelector('.date-value') || 
                       widget.querySelector('.recent-date-value') ||
                       widget.querySelector('[class*="date-value"]');
        
        // If not found, try to find by text content
        if (!dayValue) {
          const allSpans = widget.querySelectorAll('span');
          allSpans.forEach(span => {
            if (span.textContent.includes('Select Day') || span.textContent.includes('Day')) {
              dayValue = span;
            }
          });
        }
        
        if (!dateValue) {
          const allSpans = widget.querySelectorAll('span');
          allSpans.forEach(span => {
            if (span.textContent.includes('Invalid Date') || span.textContent.includes('Date')) {
              dateValue = span;
            }
          });
        }
        
        console.log('Day value element:', dayValue);
        console.log('Date value element:', dateValue);
        
        if (dayValue) {
          dayValue.textContent = selectedDay;
          console.log('Updated day value to:', selectedDay);
        }
        if (dateValue) {
          dateValue.textContent = recentDate;
          console.log('Updated date value to:', recentDate);
        }
        
        // Update data attributes
        widget.setAttribute('data-selected-day', selectedDay);
        widget.setAttribute('data-recent-date', recentDate);
        
        console.log('Updated widget attributes');
      });
      
      // Also try to update using GrapesJS editor if available
      if (window.editor || editorInstance) {
        const editor = window.editor || editorInstance;
        const components = editor.DomComponents.getComponents();
        
        components.forEach(component => {
          const componentEl = component.getEl();
          if (componentEl && (
            componentEl.classList.contains('day-selector-widget-element') ||
            componentEl.classList.contains('day-selector-display') ||
            componentEl.classList.contains('day-selector-display-widget')
          )) {
            console.log('Updating GrapesJS component:', component);
            
            const dayValue = componentEl.querySelector('.day-value') || 
                            componentEl.querySelector('.selected-day-value');
            const dateValue = componentEl.querySelector('.date-value') || 
                             componentEl.querySelector('.recent-date-value');
            
            if (dayValue) dayValue.textContent = selectedDay;
            if (dateValue) dateValue.textContent = recentDate;
            
            // Update component attributes
            component.addAttributes({
              'data-selected-day': selectedDay,
              'data-recent-date': recentDate
            });
          }
        });
        
        // Refresh the editor
        editor.trigger('change:canvas');
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

    // FIXED: Robust CSS injection function
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
      
      console.log(`🎨 Injecting CSS for: ${page.get('name')} (${pageCss.length} chars)`);
      
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
          
          // Create and inject new style tag with complete CSS (NO SPLITTING!)
          const styleTag = iframeDoc.createElement('style');
          styleTag.setAttribute('data-page-css', 'true');
          styleTag.setAttribute('data-page-id', page.id);
          styleTag.setAttribute('type', 'text/css');
          
          // Set CSS content - preserve all formatting, imports, etc.
          styleTag.textContent = pageCss;
          
          // Insert at the beginning of head (before GrapesJS styles)
          if (iframeDoc.head.firstChild) {
            iframeDoc.head.insertBefore(styleTag, iframeDoc.head.firstChild);
          } else {
            iframeDoc.head.appendChild(styleTag);
          }
          
          console.log('✅ CSS injected successfully into iframe');
          console.log('   First 100 chars:', pageCss.substring(0, 100));
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
        const pageToSelect = editor.Pages.get(stageId);
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
      
      // Initialize auto-update for day selectors
      setupAutoUpdateDaySelectors();

      if (selectedRedirectPage) {
        updateDirectFormsRedirect(editor, selectedRedirectPage);
      }

      // Initial form detection
      setTimeout(detectFormsOnPage, 1000);
      
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
            
            if (!hasPageCss) {
              console.log('⚠️ CSS missing, re-injecting...');
              injectPageCSS(currentPage, false);
            }
          }
        }
      }, 5000);
      
      // Store interval ID for cleanup
      window.cssCheckInterval = cssCheckInterval;
    }, 500);

  }, []); // Empty dependencies to prevent re-initialization

  useEffect(() => {
    // Prevent multiple initializations
    if (editorInitializedRef.current && forceRefreshKey === 0) {
      console.log('⚠️ Editor already initialized, skipping...');
      return;
    }

    console.log('🚀 Initializing GrapesJS editor...');
    editorInitializedRef.current = true;

    // FIXED: Generate project data ONCE and cache it
    if (!projectDataRef.current || forceRefreshKey > 0) {
      projectDataRef.current = generateInitialProject();
      console.log('📦 Generated fresh project data');
    }
    const projectData = projectDataRef.current;
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
        gjsForms,
        gjsCountdown,
        gjsTabs,
        gjsCustomCode,
        gjsTooltip,
        gjsTyped,
        gjsNavbar,
        gjsBlocksBasic,
      ],
      pluginsOpts: {
        'gjs-preset-webpage': {},
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

      // FIXED: Store CSS/JS in page attributes for later retrieval
      page.set('_savedCss', pageData.styles || '');
      page.set('_savedJs', pageData.script || '');

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

    // No global CSS - Each page has its own independent CSS
    console.log('✅ Skipping global CSS - Using page-specific CSS only');

    onEditorReady(editor);

    return () => {
      console.log('🧹 Cleanup - destroying editor...');
      
      // Clear CSS check interval
      if (window.cssCheckInterval) {
        clearInterval(window.cssCheckInterval);
        delete window.cssCheckInterval;
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
  }, [forceRefreshKey]); // Only re-initialize on force refresh

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Really want to exit? Unsaved changes may be lost.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const generateInitialProject = useCallback(() => {
    const savedProjectData = contentData.projectData;
    const hasSavedPages = savedProjectData && 
      savedProjectData.pages && 
      Array.isArray(savedProjectData.pages) && 
      savedProjectData.pages.length > 0;

    console.log('🔧 generateInitialProject called');
    console.log('   Has saved pages:', hasSavedPages);
    console.log('   Stages count:', stages?.length);

    const createPageFromTemplate = (stage) => {
      const isCustom = stage.type === 'custom-page';
      const config = isCustom ? 
        contentData.customStagesConfig?.[stage.id] : 
        contentData.stagesConfig?.[stage.type];

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
          id: stage.id,
          name: stage.name,
          component: `<h1>${stage.name}</h1><p>Template not configured for this stage type.</p>`,
          styles: '',
          script: '',
          basicInfo: config?.basicInfo || {},
          redirectPage: config?.redirectPage || ''
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
  setTimeout(fillAppointmentForms, 1000);
  setTimeout(fillAppointmentForms, 3000);
  setTimeout(fillAppointmentForms, 5000);
})();
`;
        
        // Prepend the localStorage script to the existing template JS
        templateJs = appointmentScript + '\n\n' + templateJs;
      }

      return {
        id: stage.id,
        name: stage.name,
        component: templateHtml,
        styles: template.css || '',
        script: templateJs,
        basicInfo: config?.basicInfo || {},
        redirectPage: config?.redirectPage || ''
      };
    };

    let pages;

    if (hasSavedPages) {
      console.log('✅ Using saved pages from Redux');
      pages = stages.map(stage => {
        const savedPage = savedProjectData.pages.find(p => p.id === stage.id);
        if (savedPage) {
          console.log(`   Loading saved page: ${savedPage.name}`);
          console.log(`     - HTML: ${savedPage.html?.length || 0} chars`);
          console.log(`     - CSS: ${savedPage.css?.length || 0} chars`);
          console.log(`     - JS: ${savedPage.js?.length || 0} chars`);
          return {
            id: stage.id,
            name: savedPage.name || stage.name,
            component: savedPage.html,
            styles: savedPage.css || '',
            script: savedPage.js || '',
            basicInfo: savedPage.basicInfo || {},
            redirectPage: savedPage.redirectPage || ''
          };
        } else {
          console.log(`   Creating new page from template: ${stage.name}`);
          return createPageFromTemplate(stage);
        }
      });
    } else {
      console.log('⚠️ No saved pages, creating from templates');
      pages = stages.map(stage => createPageFromTemplate(stage));
    }

    console.log('📦 Final project data:');
    console.log(`   Total pages: ${pages.length}`);
    console.log(`   No global CSS - Each page has its own CSS`);

    return {
      pages,
      css: '' // No global CSS - each page is independent
    };
  }, [stages, contentData, coachId]); // Removed stageId from dependencies

  const extractPageCSS = (editor, pageId) => {
    try {
      const page = editor.Pages.get(pageId);
      
      // FIXED: Extract inline styles from HTML components
      let inlineStyles = '';
      try {
        const pageHTML = page.getMainComponent().toHTML();
        
        // Extract all <style> tags from HTML
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        const matches = pageHTML.matchAll(styleRegex);
        
        for (const match of matches) {
          if (match[1] && match[1].trim()) {
            inlineStyles += match[1].trim() + '\n\n';
          }
        }
        
        if (inlineStyles.trim()) {
          console.log(`✅ Extracted ${inlineStyles.length} chars of inline CSS from HTML`);
        }
      } catch (htmlError) {
        console.warn('Could not extract inline styles from HTML:', htmlError);
      }
      
      // Get saved CSS from page object
      const savedCss = page?.get('_savedCss') || page?.get('styles') || '';
      
      // Extract from CSS composer
      const cssComposer = editor.Css;
      const allRules = cssComposer.getAll();
      let composerCSS = '';

      allRules.forEach(rule => {
        const cssText = rule.toCSS();
        if (cssText && cssText.trim()) {
          composerCSS += cssText + '\n';
        }
      });
      
      // FIXED: Combine all CSS sources (inline + saved + composer)
      let combinedCSS = '';
      
      // Add inline styles first (highest priority)
      if (inlineStyles.trim()) {
        combinedCSS += '/* Inline Component Styles */\n' + inlineStyles + '\n';
      }
      
      // Add saved CSS
      if (savedCss && savedCss.trim()) {
        combinedCSS += '/* Saved Page Styles */\n' + savedCss + '\n';
      }
      
      // Add composer CSS
      if (composerCSS && composerCSS.trim()) {
        combinedCSS += '/* Editor Styles */\n' + composerCSS + '\n';
      }
      
      console.log(`📦 Combined CSS for page ${pageId}:`);
      console.log(`   Inline: ${inlineStyles.length} chars`);
      console.log(`   Saved: ${savedCss.length} chars`);
      console.log(`   Composer: ${composerCSS.length} chars`);
      console.log(`   Total: ${combinedCSS.length} chars`);
      
      return combinedCSS.trim();
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
      currentPage.set('_savedCss', currentCss);
      currentPage.set('_savedJs', currentJs);
      console.log(`💾 Pre-save: Captured CSS (${currentCss.length} chars) and JS (${currentJs.length} chars) for current page`);
    }
    
    // No global CSS - Each page is independent
    const funnelName = contentData?.name || 'My Funnel';

    const preparePageData = (page) => {
      const stage = stages.find(s => s.id === page.id);
      const pageId = page.id;
      
      // Extract CSS - prioritize saved CSS
      const pageCSS = extractPageCSS(editor, pageId);
      
      // Extract HTML
      const pageHTML = page.getMainComponent().toHTML();
      
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
        const formScript = `<script>(function(){console.log('🔧 Initializing direct forms...');const initForms=()=>{const forms=document.querySelectorAll('.bss-direct-form:not([data-initialized]), .bss-direct-form-v2:not([data-initialized])');forms.forEach(form=>{try{form.setAttribute('data-initialized','true');const container=form.closest('.bss-direct-form-container, .bss-direct-form-v2-container');const messageEl=container?container.querySelector('.form-message'):null;const submitBtn=form.querySelector('.bss-submit-btn, .bss-submit-btn-v2');const showMessage=(message,type)=>{if(messageEl){messageEl.style.display='block';messageEl.className='form-message '+type;messageEl.textContent=message;}else{alert(message);}};const hideMessage=()=>{if(messageEl){messageEl.style.display='none';messageEl.textContent='';}};form.querySelectorAll('input').forEach(input=>{input.addEventListener('focus',hideMessage);});const countryCodeMap={'+1':'United States/Canada','+44':'United Kingdom','+91':'India','+61':'Australia','+49':'Germany','+33':'France','+81':'Japan','+86':'China','+7':'Russia','+55':'Brazil','+52':'Mexico','+34':'Spain','+39':'Italy','+31':'Netherlands','+46':'Sweden','+47':'Norway','+45':'Denmark','+358':'Finland','+41':'Switzerland','+43':'Austria','+48':'Poland','+420':'Czech Republic','+36':'Hungary','+380':'Ukraine','+90':'Turkey','+82':'South Korea','+65':'Singapore','+60':'Malaysia','+66':'Thailand','+84':'Vietnam','+62':'Indonesia','+63':'Philippines','+971':'United Arab Emirates','+966':'Saudi Arabia','+20':'Egypt','+27':'South Africa','+234':'Nigeria','+254':'Kenya','+233':'Ghana','+212':'Morocco','+216':'Tunisia','+213':'Algeria','+225':'Ivory Coast','+237':'Cameroon','+251':'Ethiopia','+256':'Uganda','+260':'Zambia','+263':'Zimbabwe','+265':'Malawi','+267':'Botswana','+268':'Eswatini','+269':'Comoros','+290':'Saint Helena','+291':'Eritrea','+297':'Aruba','+298':'Faroe Islands','+299':'Greenland','+350':'Gibraltar','+351':'Portugal','+352':'Luxembourg','+353':'Ireland','+354':'Iceland','+355':'Albania','+356':'Malta','+357':'Cyprus','+359':'Bulgaria','+370':'Lithuania','+371':'Latvia','+372':'Estonia','+373':'Moldova','+374':'Armenia','+375':'Belarus','+376':'Andorra','+377':'Monaco','+378':'San Marino','+379':'Vatican City','+381':'Serbia','+382':'Montenegro','+383':'Kosovo','+385':'Croatia','+386':'Slovenia','+387':'Bosnia and Herzegovina','+389':'North Macedonia','+421':'Slovakia','+423':'Liechtenstein','+501':'Belize','+502':'Guatemala','+503':'El Salvador','+504':'Honduras','+505':'Nicaragua','+506':'Costa Rica','+507':'Panama','+508':'Saint Pierre and Miquelon','+509':'Haiti','+590':'Guadeloupe','+591':'Bolivia','+592':'Guyana','+593':'Ecuador','+594':'French Guiana','+595':'Paraguay','+596':'Martinique','+597':'Suriname','+598':'Uruguay','+599':'Caribbean Netherlands','+670':'East Timor','+672':'Antarctica','+673':'Brunei','+674':'Nauru','+675':'Papua New Guinea','+676':'Tonga','+677':'Solomon Islands','+678':'Vanuatu','+679':'Fiji','+680':'Palau','+681':'Wallis and Futuna','+682':'Cook Islands','+683':'Niue','+685':'Samoa','+686':'Kiribati','+687':'New Caledonia','+688':'Tuvalu','+689':'French Polynesia','+690':'Tokelau','+691':'Micronesia','+692':'Marshall Islands','+850':'North Korea','+852':'Hong Kong','+853':'Macau','+855':'Cambodia','+856':'Laos','+880':'Bangladesh','+886':'Taiwan','+960':'Maldives','+961':'Lebanon','+962':'Jordan','+963':'Syria','+964':'Iraq','+965':'Kuwait','+967':'Yemen','+968':'Oman','+970':'Palestine','+972':'Israel','+973':'Bahrain','+974':'Qatar','+975':'Bhutan','+976':'Mongolia','+977':'Nepal','+992':'Tajikistan','+993':'Turkmenistan','+994':'Azerbaijan','+995':'Georgia','+996':'Kyrgyzstan','+998':'Uzbekistan','+1242':'Bahamas','+1246':'Barbados','+1264':'Anguilla','+1268':'Antigua and Barbuda','+1284':'British Virgin Islands','+1340':'U.S. Virgin Islands','+1345':'Cayman Islands','+1441':'Bermuda','+1473':'Grenada','+1649':'Turks and Caicos Islands','+1664':'Montserrat','+1671':'Guam','+1684':'American Samoa','+1758':'Saint Lucia','+1767':'Dominica','+1784':'Saint Vincent and the Grenadines','+1787':'Puerto Rico','+1809':'Dominican Republic','+1868':'Trinidad and Tobago','+1869':'Saint Kitts and Nevis','+1876':'Jamaica','+1939':'Puerto Rico'};const countryCodeSelect=form.querySelector('select[name="countryCode"]');const countryInput=form.querySelector('input[name="country"]');if(countryCodeSelect&&countryInput){const updateCountry=()=>{const selectedCode=countryCodeSelect.value;if(selectedCode&&countryCodeMap[selectedCode]){countryInput.value=countryCodeMap[selectedCode];console.log('✅ Country updated to:',countryCodeMap[selectedCode]);}};countryCodeSelect.addEventListener('change',updateCountry);if(countryCodeSelect.value){updateCountry();}}form.addEventListener('submit',async function(e){e.preventDefault();if(!submitBtn)return;const originalText=submitBtn.innerHTML;submitBtn.innerHTML='<span>Processing...</span>';submitBtn.disabled=true;hideMessage();const redirectPage=this.getAttribute('data-redirect-page')||container.getAttribute('data-redirect-page');try{const countryCode=this.querySelector('select[name="countryCode"]')?.value||'+1';const phoneNumber=this.querySelector('input[name="phone"]').value;const fullPhoneNumber=countryCode+' '+phoneNumber;const formData={name:this.querySelector('input[name="name"]').value,email:this.querySelector('input[name="email"]').value,phone:fullPhoneNumber,city:this.querySelector('input[name="city"]').value,country:this.querySelector('input[name="country"]').value,coachId:'${userId}',funnelId:'${currentFunnelId}',funnelType:'${currentFunnelType}',status:'${stageName}',targetAudience:'${targetAudience}'};console.log('📝 Form submitted:',formData);console.log('🔍 Country Code Debug:',{element:this.querySelector('select[name="countryCode"]'),value:this.querySelector('select[name="countryCode"]')?.value,defaultValue:'+1'});const response=await fetch('https://api.funnelseye.com/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)});const result=await response.json();if(result.success){const leadId=result.data&&result.data._id?result.data._id:result.leadId;if(formData.coachId&&leadId){try{localStorage.setItem('coachId',formData.coachId);localStorage.setItem('leadId',leadId);localStorage.setItem('leadName',formData.name);localStorage.setItem('firstName',formData.name.split(' ')[0]);const storedCoachId=localStorage.getItem('coachId');const storedLeadId=localStorage.getItem('leadId');const storedLeadName=localStorage.getItem('leadName');const storedFirstName=localStorage.getItem('firstName');console.log('✅ STORAGE VERIFICATION:');console.log('Stored CoachId:',storedCoachId);console.log('Stored LeadId:',storedLeadId);console.log('Stored LeadName:',storedLeadName);console.log('Stored FirstName:',storedFirstName);console.log('Storage successful:',storedCoachId===formData.coachId&&storedLeadId===leadId&&storedLeadName===formData.name);window.dispatchEvent(new CustomEvent('leadDataStored',{detail:{coachId:formData.coachId,leadId:leadId,leadName:formData.name,firstName:formData.name.split(' ')[0]}}));}catch(storageError){console.error('❌ localStorage Error:',storageError);}}showMessage('Thank you! Your submission was successful!','success');if(submitBtn){submitBtn.innerHTML='<span>✅ Done!</span>';submitBtn.style.backgroundColor='#10B981';submitBtn.style.color='white';}if(redirectPage&&redirectPage.trim()){setTimeout(()=>{let redirectUrl;if(redirectPage.startsWith('http')){redirectUrl=redirectPage;}else if(redirectPage.startsWith('/')){redirectUrl=redirectPage;}else{const pathParts=window.location.pathname.split('/').filter(Boolean);const funnelSlug=pathParts.length>=2?pathParts[1]:'funnel';redirectUrl='/funnels/'+funnelSlug+'/'+redirectPage;}console.log('Redirecting to:',redirectUrl);window.location.href=redirectUrl;},2000);}setTimeout(()=>{this.reset();if(submitBtn){submitBtn.innerHTML=originalText;submitBtn.style.backgroundColor='';submitBtn.style.color='';submitBtn.disabled=false;}},3000);}else{throw new Error(result.message||'Failed to submit form');}}catch(error){console.error('Error:',error);showMessage('Sorry, there was an error. Please try again.','error');if(submitBtn){submitBtn.innerHTML=originalText;submitBtn.disabled=false;}}});}catch(error){console.error('Error initializing form:',error);}});};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initForms);}else{initForms();}})();</script>`;
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
          page.set('_savedCss', pageCss);
          page.set('_savedJs', pageJs);
          console.log(`💾 Pre-save all: Captured CSS (${pageCss.length} chars) and JS (${pageJs.length} chars) for ${page.get('name')}`);
        });
        pagesData = allPages.map(preparePageData);
      }

      console.log('📤 Dispatching to Redux - Summary:');
      pagesData.forEach(page => {
        console.log(`   ${page.name}: HTML=${page.html.length}chars, CSS=${page.css.length}chars, JS=${page.js.length}chars`);
      });
      console.log(`   ✅ No global CSS - Each page has independent styling`);

      dispatch(updateProjectData({
        pages: pagesData,
        globalCss: '' // No global CSS
      }));

      const response = await dispatch(saveFunnelToBackend({
        slug,
        funnelName
      }));

      if (saveFunnelToBackend.fulfilled.match(response)) {
        // Show success popup with party celebration
        const message = saveType === 'single' 
          ? "🎉 Page saved successfully!" 
          : "🎉 All pages saved successfully!";
        setSuccessMessage(message);
        setShowSuccessPopup(true);
      } else if (saveFunnelToBackend.rejected.match(response)) {
        const errorMessage = response.payload || response.error?.message || 'Failed to save funnel';
        console.error('Save rejected with error:', errorMessage);
        alert(`Failed to save data: ${errorMessage}`);
      } else {
        throw new Error('Unexpected response from save operation');
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
    // No global CSS - Only page-specific CSS

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

    dispatch(setSelectedTemplateForStage({
      stageId: currentStage.id,
      templateKey,
      stageType: currentStage.type
    }));

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

  const handleRedirectSelect = (pageSlug) => {
    const formattedSlug = pageSlug.replace(/^\/|\/$/g, '');
    console.log('Setting redirect page to:', formattedSlug);

    setSelectedRedirectPage(formattedSlug);

    if (editorInstance) {
      const currentPage = editorInstance.Pages.getSelected();
      if (currentPage) {
        currentPage.set('redirectPage', formattedSlug);
        console.log('Updated current page redirect to:', formattedSlug);
      }

      updateDirectFormsRedirect(editorInstance, formattedSlug);

      setTimeout(() => {
        updateDirectFormsRedirect(editorInstance, formattedSlug);
      }, 500);

      if (currentStage) {
        const updateData = {
          stageId: currentStage.id,
          stageType: currentStage.type,
          basicInfo: currentStage.basicInfo || {},
          redirectPage: formattedSlug
        };
        dispatch(updateStageBasicInfo(updateData));
        console.log('Dispatched redirect page update to Redux:', updateData);
      }
    }

    setShowRedirectPopup(false);
    alert(`Redirect page set to: ${formattedSlug}\nAll direct forms will now redirect to this page after submission.`);
  };

  const handleDaySelectorSelect = (selectedDay, recentDate) => {
    console.log('🎯 Day selected:', selectedDay, 'Date:', recentDate);
    console.log('🔍 Selected ID:', selectedDaySelectorId);
    console.log('📍 Selected Element:', selectedComponentElement);
    console.log('📊 Editor Instance:', !!editorInstance);

    let targetElement = null;
    
    // Method 1: Use stored element reference
    if (selectedComponentElement && document.contains(selectedComponentElement)) {
      targetElement = selectedComponentElement;
      console.log('✅ Using stored element reference');
    }
    
    // Method 2: Find by component ID
    if (!targetElement && selectedDaySelectorId) {
      targetElement = document.querySelector(`[data-component-id="${selectedDaySelectorId}"]`);
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
      const allDayComponents = document.querySelectorAll('.day-selector-display-widget');
      if (allDayComponents.length > 0) {
        targetElement = allDayComponents[0];
        console.log('✅ Using first available component');
      }
    }

    if (targetElement) {
      console.log('🔄 Updating component...');
      
      // Direct DOM update - using exact selectors from component structure
      const daySpan = targetElement.querySelector('.day-value');
      const dateSpan = targetElement.querySelector('.date-value');
      
      console.log('Day span found:', !!daySpan);
      console.log('Date span found:', !!dateSpan);
      console.log('Target element HTML:', targetElement.innerHTML);
      
      if (daySpan) {
        daySpan.textContent = selectedDay;
        daySpan.innerHTML = selectedDay;
        console.log('✅ Day updated:', selectedDay);
      } else {
        // Try finding by text content
        const allSpans = targetElement.querySelectorAll('span');
        allSpans.forEach((span, index) => {
          console.log(`Span ${index}:`, span.textContent, span.className);
          if (span.textContent.includes('Click Day Selector')) {
            span.textContent = selectedDay;
            span.innerHTML = selectedDay;
            console.log('✅ Day updated via text search');
          }
        });
      }
      
      if (dateSpan) {
        dateSpan.textContent = recentDate;
        dateSpan.innerHTML = recentDate;
        console.log('✅ Date updated:', recentDate);
      } else {
        // Try finding by text content
        const allSpans = targetElement.querySelectorAll('span');
        allSpans.forEach((span, index) => {
          if (span.textContent.includes('No day selected')) {
            span.textContent = recentDate;
            span.innerHTML = recentDate;
            console.log('✅ Date updated via text search');
          }
        });
      }
      
      // Update attributes
      targetElement.setAttribute('data-selected-day', selectedDay);
      targetElement.setAttribute('data-recent-date', recentDate);
      
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

  // Auto-update functionality - onEditorReady के अंत में add करो:
  useEffect(() => {
    const autoUpdateInterval = setInterval(() => {
      const dayComponents = document.querySelectorAll('[data-selected-day]:not([data-selected-day=""])');
      
      dayComponents.forEach(component => {
        const selectedDay = component.getAttribute('data-selected-day');
        if (selectedDay) {
          const findMostRecentDateForDay = (dayName) => {
            const today = new Date();
            const dayMap = {
              'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
              'Friday': 5, 'Saturday': 6, 'Sunday': 0
            };
            
            const targetDay = dayMap[dayName];
            const currentDay = today.getDay();
            let daysToSubtract = (currentDay - targetDay + 7) % 7;
            
            const recentDate = new Date(today);
            recentDate.setDate(today.getDate() - daysToSubtract);
            
            return recentDate.toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            });
          };
          
          const newDate = findMostRecentDateForDay(selectedDay);
          const dateSpan = component.querySelector('.date-value');
          if (dateSpan && dateSpan.textContent !== newDate) {
            dateSpan.textContent = newDate;
            component.setAttribute('data-recent-date', newDate);
          }
        }
      });
    }, 60000); // Update every minute

    return () => clearInterval(autoUpdateInterval);
  }, []);

  // Global function for day selector popup
  useEffect(() => {
    window.openDaySelectorPopup = (currentDay, currentDate) => {
      console.log('Opening day selector popup for:', currentDay, currentDate);
      setShowDaySelectorPopup(true);
    };
    
    return () => {
      delete window.openDaySelectorPopup;
    };
  }, []);

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
      dispatch(resetState());
      navigate(`/dashboard/Funnel_settings/${slug}`);
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

  if (apiStatus === 'loading') {
    return (
      <div className="portfolio-edit-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <h2>Loading Funnel Editor...</h2>
      </div>
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
    <div className="portfolio-edit-container">
      {/* Left Sidebar - Pages Navigation */}
      <div className={`pages-sidebar ${showPagesSidebar ? 'show' : 'hide'}`}>
        <div className="pages-sidebar-header">
          <div className="header-title">
            <FaFileAlt className="header-icon" />
            <h3>Pages</h3>
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setShowPagesSidebar(!showPagesSidebar)}
            title="Toggle Sidebar"
          >
            <FaArrowLeft />
          </button>
        </div>
        
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

      {/* Floating Form Buttons */}
      <FloatingFormButton
        forms={availableForms}
        onScrollToForm={scrollToForm}
      />

      {showTemplateSelector && currentStage && (
        <div className="modal-overlay">
          <div className="modal-content">
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

          <button
            onClick={() => setShowRedirectPopup(true)}
            className="modern-btn info-btn"
            title="Set Form Redirect"
          >
            <FaFileAlt />
            <span>Redirect</span>
          </button>

          <button
            onClick={() => {
              console.log('📅 Day Selector button clicked');
              const dayComponents1 = document.querySelectorAll('.day-selector-display-widget');
              const dayComponents2 = document.querySelectorAll('.day-selector-widget-element');
              const dayComponents3 = document.querySelectorAll('[data-component-id*="day-selector"]');
              
              const allDayComponents = [...dayComponents1, ...dayComponents2, ...dayComponents3];
              const uniqueComponents = [...new Set(allDayComponents)];
              
              if (selectedDaySelectorId || selectedComponentElement) {
                setShowDaySelectorPopup(true);
              } else if (uniqueComponents.length > 0) {
                const firstComp = uniqueComponents[0];
                const compId = firstComp.getAttribute('data-component-id') || 
                              `day-selector-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                
                firstComp.setAttribute('data-component-id', compId);
                setSelectedDaySelectorId(compId);
                setSelectedComponentElement(firstComp);
                firstComp.classList.add('selected');
                setShowDaySelectorPopup(true);
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


      <div className={`editor-main-area ${showPagesSidebar ? 'with-sidebar' : 'full-width'}`}>
        <div 
          id="gjs" 
          key={`editor-${slug}-${forceRefreshKey}`}
          ref={editorContainerRef}
          style={{ height: '100%', width: '100%', overflow: 'hidden' }}
        ></div> {/* GrapesJS container */}
      </div>

      <style>{`
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
          background: #f8fafc;
        }

        /* Left Sidebar - Pages Navigation */
        .pages-sidebar {
          position: fixed;
          left: 0;
          top: 68px;
          width: 300px;
          height: calc(100vh - 68px);
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-right: 2px solid #e2e8f0;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          z-index: 1001;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pages-sidebar.hide {
          transform: translateX(-100%);
        }

        .pages-sidebar.show {
          transform: translateX(0);
        }

        .pages-sidebar-header {
          padding: 20px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-bottom: 3px solid #3b82f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }

        .header-title .header-icon {
          font-size: 20px;
          color: #3b82f6;
        }

        .header-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .sidebar-toggle-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .sidebar-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .sidebar-toggle-btn-floating {
          position: fixed;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1002;
        }

        .sidebar-toggle-btn-floating:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.5);
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
          background: #f1f5f9;
          border-radius: 10px;
        }

        .pages-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 10px;
        }

        .page-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .page-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .page-item:hover {
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
          border-color: #3b82f6;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .page-item:hover::before {
          transform: scaleY(1);
        }

        .page-item.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-color: #3b82f6;
          color: white;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
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
          color: #1e293b;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.2px;
        }

        .page-item-type {
          font-size: 11px;
          font-weight: 500;
          color: #64748b;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .page-item-order {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          background: #f1f5f9;
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
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-top: 1px solid #e5e7eb;
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
          background: white;
          border-radius: 10px;
          flex: 1;
          border: 1px solid #e5e7eb;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
          line-height: 1;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Modern Action Bar - Top Header */
        .modern-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-bottom: 3px solid #3b82f6;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);
          z-index: 1002;
          gap: 20px;
        }

        .action-bar-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-bar-section.left-section {
          min-width: 250px;
        }

        .action-bar-section.center-section {
          flex: 1;
          justify-content: center;
          max-width: 900px;
          background: rgba(255, 255, 255, 0.05);
          padding: 6px;
          border-radius: 14px;
          backdrop-filter: blur(10px);
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
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .page-subtitle {
          color: rgba(255, 255, 255, 0.6);
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

        /* Button Color Variants */
        .back-btn {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          padding: 11px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateX(-3px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .primary-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .primary-btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.45);
          transform: translateY(-2px);
        }

        .success-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .success-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 6px 24px rgba(16, 185, 129, 0.45);
          transform: translateY(-2px);
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

        /* Editor Main Area - Optimized for full view */
        .editor-main-area {
          flex: 1;
          position: relative;
          height: calc(100vh - 68px);
          width: 100%;
          overflow: hidden;
          background: #f1f5f9;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding-top: 0;
          margin-top: 0;
        }

        .editor-main-area.with-sidebar {
          margin-left: 300px;
          width: calc(100% - 300px);
        }

        .editor-main-area.full-width {
          margin-left: 0;
          width: 100%;
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

        /* Canvas Container - Center aligned with top padding */
        .gjs-cv-canvas {
          width: 100% !important;
          height: 100% !important;
          overflow: auto !important;
          background: #f1f5f9 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          padding: 30px 20px 20px 20px !important;
        }

        /* Canvas Frame Wrapper - Center with max-width */
        .gjs-cv-canvas__frames {
          width: 100% !important;
          max-width: 1400px !important;
          margin: 0 auto !important;
          display: flex !important;
          justify-content: center !important;
        }

        /* Main Frame (Website Preview) - Center with controlled width */
        .gjs-frame {
          width: 100% !important;
          max-width: 1400px !important;
          min-width: 320px !important;
          height: auto !important;
          min-height: calc(100vh - 108px) !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08) !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          margin: 0 auto !important;
          display: block !important;
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
            padding: 25px 18px 18px 18px !important;
          }
        }

        @media (max-width: 1200px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 900px !important;
          }
          .gjs-cv-canvas {
            padding: 20px 15px 15px 15px !important;
          }
        }

        @media (max-width: 1024px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 800px !important;
          }
          .gjs-cv-canvas {
            padding: 18px 12px 12px 12px !important;
          }
        }

        @media (max-width: 768px) {
          .gjs-cv-canvas__frames,
          .gjs-frame {
            max-width: 100% !important;
          }
          .gjs-cv-canvas {
            padding: 15px 10px 10px 10px !important;
          }
        }

        /* Modern GrapesJS Panel Customization */
        .gjs-pn-panel {
          background: #ffffff !important;
          border-right: 1px solid #e5e7eb !important;
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

        /* All Panel Types - Force White Background */
        .gjs-pn-panel,
        .gjs-pn-panel *,
        .gjs-pn-views-container,
        .gjs-pn-views-container *,
        .gjs-blocks-c,
        .gjs-blocks-c *,
        .gjs-layer-wrapper,
        .gjs-layer-wrapper *,
        .gjs-trt-traits,
        .gjs-trt-traits *,
        .gjs-sm-sectors,
        .gjs-sm-sectors *,
        .gjs-sm-sector,
        .gjs-sm-sector *,
        .gjs-sm-properties,
        .gjs-sm-properties *,
        .gjs-pn-views,
        .gjs-pn-views * {
          background-color: #ffffff !important;
        }

        /* Specific Panel Overrides */
        .gjs-pn-panel[data-pn-type="views-container"],
        .gjs-pn-panel[data-pn-type="blocks"],
        .gjs-pn-panel[data-pn-type="layers"],
        .gjs-pn-panel[data-pn-type="traits"],
        .gjs-pn-panel[data-pn-type="style-manager"] {
          background: #ffffff !important;
        }

        /* Force White Background for All Panel Content */
        .gjs-pn-panel .gjs-pn-panel,
        .gjs-pn-panel .gjs-pn-panel *,
        .gjs-pn-panel .gjs-pn-views-container,
        .gjs-pn-panel .gjs-pn-views-container *,
        .gjs-pn-panel .gjs-blocks-c,
        .gjs-pn-panel .gjs-blocks-c *,
        .gjs-pn-panel .gjs-layer-wrapper,
        .gjs-pn-panel .gjs-layer-wrapper *,
        .gjs-pn-panel .gjs-trt-traits,
        .gjs-pn-panel .gjs-trt-traits *,
        .gjs-pn-panel .gjs-sm-sectors,
        .gjs-pn-panel .gjs-sm-sectors *,
        .gjs-pn-panel .gjs-sm-sector,
        .gjs-pn-panel .gjs-sm-sector *,
        .gjs-pn-panel .gjs-sm-properties,
        .gjs-pn-panel .gjs-sm-properties *,
        .gjs-pn-panel .gjs-pn-views,
        .gjs-pn-panel .gjs-pn-views * {
          background-color: #ffffff !important;
        }

        /* Remove Any Default Panel Styling */
        .gjs-pn-panel,
        .gjs-pn-panel * {
          background-image: none !important;
          background: #ffffff !important;
        }

        /* Block Categories - Force White Background */
        .gjs-block-category,
        .gjs-block-category *,
        .gjs-block-category .gjs-blocks-c,
        .gjs-block-category .gjs-blocks-c * {
          background: #ffffff !important;
          background-color: #ffffff !important;
          background-image: none !important;
        }

        /* Override Any Default GrapesJS Styling */
        .gjs-pn-panel *[class*="gjs-"],
        .gjs-pn-panel *[class*="gjs-"] * {
          background: #ffffff !important;
          background-color: #ffffff !important;
          background-image: none !important;
        }

        /* Fix Text and Icon Colors in All Panels */
        .gjs-pn-panel,
        .gjs-pn-panel *,
        .gjs-pn-views-container,
        .gjs-pn-views-container *,
        .gjs-blocks-c,
        .gjs-blocks-c *,
        .gjs-layer-wrapper,
        .gjs-layer-wrapper *,
        .gjs-trt-traits,
        .gjs-trt-traits *,
        .gjs-sm-sectors,
        .gjs-sm-sectors *,
        .gjs-sm-sector,
        .gjs-sm-sector *,
        .gjs-sm-properties,
        .gjs-sm-properties *,
        .gjs-pn-views,
        .gjs-pn-views * {
          color: #1e293b !important;
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
          color: #1e293b !important;
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
          color: #64748b !important;
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

        /* Override Any Default GrapesJS Text Colors */
        .gjs-pn-panel *[class*="gjs-"] {
          color: #1e293b !important;
        }

        .gjs-pn-panel *[class*="gjs-"] * {
          color: inherit !important;
        }

        .gjs-pn-buttons {
          padding: 8px 4px !important;
        }

        .gjs-pn-btn {
          border-radius: 8px !important;
          margin: 4px !important;
          transition: all 0.2s ease !important;
          border: 1px solid transparent !important;
        }

        .gjs-pn-btn:hover {
          background: #f1f5f9 !important;
          border-color: #e5e7eb !important;
          transform: translateY(-1px) !important;
        }

        .gjs-pn-btn.gjs-pn-active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        /* Block Manager Styling */
        .gjs-block-category {
          border-bottom: 1px solid #e5e7eb !important;
          background: #fafbfc !important;
        }

        .gjs-block {
          border-radius: 16px !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 3px solid transparent !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
          margin: 0 !important;
          position: relative !important;
          overflow: hidden !important;
          width: 100% !important;
          aspect-ratio: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
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
          transform: translateY(-6px) scale(1.08) rotate(1deg) !important;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25), 0 8px 16px rgba(139, 92, 246, 0.15) !important;
          border-color: #3b82f6 !important;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%) !important;
        }

        .gjs-block:hover::before {
          opacity: 1 !important;
        }

        .gjs-block__media {
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          filter: brightness(1.1) saturate(1.2) !important;
          width: 48px !important;
          height: 48px !important;
          margin-bottom: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .gjs-block:hover .gjs-block__media {
          transform: scale(1.2) !important;
          filter: brightness(1.3) saturate(1.5) !important;
        }

        .gjs-block-label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          color: #1e293b !important;
          letter-spacing: -0.2px !important;
          text-align: center !important;
          padding: 4px 8px !important;
          position: relative !important;
          z-index: 2 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          line-height: 1.2 !important;
          max-width: 100% !important;
          word-wrap: break-word !important;
        }

        .gjs-block:hover .gjs-block-label {
          color: #3b82f6 !important;
          transform: translateY(-2px) !important;
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

        /* ========================================
           RIGHT SIDEBAR - MODERN PROFESSIONAL DESIGN
           ======================================== */

        /* Right Sidebar Panel - Main Container - Optimized Width */
        #gjs .gjs-pn-panel.gjs-pn-views-container {
          background: #ffffff !important;
          border-left: 2px solid #e2e8f0 !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08) !important;
          width: 280px !important;
          min-width: 280px !important;
          max-width: 280px !important;
        }

        /* Right Sidebar Responsive Width */
        @media (min-width: 1920px) {
          #gjs .gjs-pn-panel.gjs-pn-views-container {
            width: 300px !important;
            min-width: 300px !important;
            max-width: 300px !important;
          }
        }

        @media (max-width: 1400px) {
          #gjs .gjs-pn-panel.gjs-pn-views-container {
            width: 260px !important;
            min-width: 260px !important;
            max-width: 260px !important;
          }
        }

        @media (max-width: 1200px) {
          #gjs .gjs-pn-panel.gjs-pn-views-container {
            width: 240px !important;
            min-width: 240px !important;
            max-width: 240px !important;
          }
        }

        /* Right Sidebar Views Container */
        .gjs-pn-views-container {
          background: #ffffff !important;
        }

        /* Style Manager Panel Container */
        .gjs-pn-panel.gjs-pn-panel.gjs-pn-views-container {
          background: #ffffff !important;
        }

        /* Style Manager Content Area */
        .gjs-sm-sectors {
          background: #ffffff !important;
          padding: 8px !important;
        }

        /* Style Manager - Modern Card Design */
        .gjs-sm-sector {
          background: #ffffff !important;
          border-radius: 16px !important;
          margin: 12px 8px !important;
          border: 2px solid #e5e7eb !important;
          overflow: hidden !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .gjs-sm-sector:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15) !important;
          transform: translateY(-2px) !important;
        }

        /* Sector Title - Gradient Header */
        .gjs-sm-sector .gjs-sm-title {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          letter-spacing: -0.3px !important;
          color: white !important;
          padding: 14px 16px !important;
          border-radius: 0 !important;
          border: none !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        }

        .gjs-sm-sector .gjs-sm-title:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        /* Sector Title Icon */
        .gjs-sm-sector .gjs-sm-title .gjs-sm-sector-caret {
          color: white !important;
          font-size: 12px !important;
          transition: transform 0.3s ease !important;
        }

        .gjs-sm-sector.gjs-sm-open .gjs-sm-title .gjs-sm-sector-caret {
          transform: rotate(90deg) !important;
        }

        /* Sector Properties Container */
        .gjs-sm-sector .gjs-sm-properties {
          padding: 16px !important;
          background: #ffffff !important;
          border-radius: 0 0 16px 16px !important;
        }

        /* Property Row - Modern Layout */
        .gjs-sm-property {
          padding: 12px 0 !important;
          border-bottom: 1px solid #f1f5f9 !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-property:last-child {
          border-bottom: none !important;
        }

        .gjs-sm-property:hover {
          background: #f8fafc !important;
          padding-left: 8px !important;
        }

        /* Property Label */
        .gjs-sm-property .gjs-sm-label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #334155 !important;
          margin-bottom: 8px !important;
          letter-spacing: -0.2px !important;
        }

        /* Property Field Container */
        .gjs-sm-property .gjs-field {
          border-radius: 10px !important;
          border: 2px solid #e5e7eb !important;
          background: white !important;
          transition: all 0.3s ease !important;
          padding: 8px 12px !important;
        }

        .gjs-sm-property .gjs-field:hover {
          border-color: #cbd5e1 !important;
          background: #f8fafc !important;
        }

        .gjs-sm-property .gjs-field:focus-within {
          border-color: #3b82f6 !important;
          background: white !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }

        /* Input Fields - Modern Style */
        .gjs-sm-property input[type="text"],
        .gjs-sm-property input[type="number"],
        .gjs-sm-property select {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          color: #1e293b !important;
          font-weight: 500 !important;
          border: none !important;
          background: transparent !important;
          padding: 4px 8px !important;
        }

        .gjs-sm-property input[type="text"]:focus,
        .gjs-sm-property input[type="number"]:focus,
        .gjs-sm-property select:focus {
          outline: none !important;
        }

        /* Color Picker - Modern Design */
        .gjs-field-color-picker {
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .gjs-field-color-picker .gjs-field-colorp-c {
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }

        .gjs-field-color-picker .gjs-field-colorp-c:hover {
          border-color: #3b82f6 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
        }

        /* Slider - Modern Track Design */
        .gjs-sm-property input[type="range"] {
          -webkit-appearance: none !important;
          appearance: none !important;
          height: 6px !important;
          border-radius: 10px !important;
          background: linear-gradient(90deg, #e5e7eb 0%, #cbd5e1 100%) !important;
          outline: none !important;
          transition: all 0.3s ease !important;
        }

        .gjs-sm-property input[type="range"]:hover {
          background: linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%) !important;
        }

        .gjs-sm-property input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 18px !important;
          height: 18px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          cursor: pointer !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
          transition: all 0.3s ease !important;
        }

        .gjs-sm-property input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2) !important;
          box-shadow: 0 6px 18px rgba(59, 130, 246, 0.6) !important;
        }

        .gjs-sm-property input[type="range"]::-moz-range-thumb {
          width: 18px !important;
          height: 18px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          cursor: pointer !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
          border: none !important;
        }

        /* Composite Property - Modern Grid Layout */
        .gjs-sm-composite {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
          padding: 8px !important;
          background: #ffffff !important;
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
        }

        .gjs-sm-composite.gjs-sm-composite--cols-4 {
          grid-template-columns: repeat(4, 1fr) !important;
        }

        /* Composite Field - Modern Button Groups */
        .gjs-sm-composite .gjs-field {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
        }

        .gjs-sm-composite .gjs-field:hover {
          border-color: #cbd5e1 !important;
          background: #f8fafc !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .gjs-sm-composite .gjs-field:focus-within {
          border-color: #3b82f6 !important;
          background: white !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }

        /* Composite Input Fields */
        .gjs-sm-composite input[type="text"],
        .gjs-sm-composite input[type="number"],
        .gjs-sm-composite select {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #1e293b !important;
          border: none !important;
          background: transparent !important;
          padding: 4px 6px !important;
          width: 100% !important;
        }

        .gjs-sm-composite input[type="text"]:focus,
        .gjs-sm-composite input[type="number"]:focus,
        .gjs-sm-composite select:focus {
          outline: none !important;
        }

        /* Composite Button Groups - Modern Design */
        .gjs-sm-composite .gjs-field-radio {
          display: flex !important;
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
          transition: all 0.3s ease !important;
        }

        .gjs-sm-composite .gjs-field-radio:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .gjs-sm-composite .gjs-field-radio:focus-within {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }

        /* Radio Button Options */
        .gjs-sm-composite .gjs-field-radio .gjs-field-radio-option {
          flex: 1 !important;
          padding: 10px 12px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #64748b !important;
          background: transparent !important;
          border: none !important;
          border-right: 1px solid #e5e7eb !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          text-align: center !important;
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
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
        }

        /* Single Button Fields */
        .gjs-sm-composite .gjs-field-select {
          background: white !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 10px !important;
          padding: 10px 12px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
        }

        .gjs-sm-composite .gjs-field-select:hover {
          border-color: #cbd5e1 !important;
          background: #f8fafc !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .gjs-sm-composite .gjs-field-select:focus-within {
          border-color: #3b82f6 !important;
          background: white !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }

        /* Select Dropdown */
        .gjs-sm-composite .gjs-field-select select {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #1e293b !important;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          width: 100% !important;
          cursor: pointer !important;
        }

        .gjs-sm-composite .gjs-field-select select:focus {
          outline: none !important;
        }

        /* General Section - Modern Blue Theme */
        .gjs-sm-sector[data-name="general"] {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
          border-color: #3b82f6 !important;
        }

        .gjs-sm-sector[data-name="general"] .gjs-sm-title {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }

        .gjs-sm-sector[data-name="general"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
        }

        /* Dimension Section - Modern Golden Theme */
        .gjs-sm-sector[data-name="dimension"] {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          border-color: #f59e0b !important;
        }

        .gjs-sm-sector[data-name="dimension"] .gjs-sm-title {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        }

        .gjs-sm-sector[data-name="dimension"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #fefce8 100%) !important;
        }

        /* Typography Section - Modern Blue Theme */
        .gjs-sm-sector[data-name="typography"] {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
          border-color: #3b82f6 !important;
        }

        .gjs-sm-sector[data-name="typography"] .gjs-sm-title {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }

        .gjs-sm-sector[data-name="typography"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%) !important;
        }

        /* Decorations Section - Modern Purple Theme */
        .gjs-sm-sector[data-name="decorations"] {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%) !important;
          border-color: #8b5cf6 !important;
        }

        .gjs-sm-sector[data-name="decorations"] .gjs-sm-title {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
        }

        .gjs-sm-sector[data-name="decorations"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%) !important;
        }

        /* Flexbox Section - Modern Green Theme */
        .gjs-sm-sector[data-name="flexbox"] {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
          border-color: #10b981 !important;
        }

        .gjs-sm-sector[data-name="flexbox"] .gjs-sm-title {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        }

        .gjs-sm-sector[data-name="flexbox"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%) !important;
        }

        /* Extra Section - Modern Red Theme */
        .gjs-sm-sector[data-name="extra"] {
          background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%) !important;
          border-color: #ef4444 !important;
        }

        .gjs-sm-sector[data-name="extra"] .gjs-sm-title {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        }

        .gjs-sm-sector[data-name="extra"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%) !important;
        }

        /* Layout Section - Modern Indigo Theme */
        .gjs-sm-sector[data-name="layout"] {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
          border-color: #6366f1 !important;
        }

        .gjs-sm-sector[data-name="layout"] .gjs-sm-title {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
        }

        .gjs-sm-sector[data-name="layout"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
        }

        /* Border Section - Modern Teal Theme */
        .gjs-sm-sector[data-name="border"] {
          background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%) !important;
          border-color: #14b8a6 !important;
        }

        .gjs-sm-sector[data-name="border"] .gjs-sm-title {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%) !important;
        }

        .gjs-sm-sector[data-name="border"] .gjs-sm-properties {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%) !important;
        }

        /* Stack Property - Modern Spacing */
        .gjs-sm-stack {
          background: #f8fafc !important;
          border-radius: 10px !important;
          padding: 12px !important;
          margin-top: 8px !important;
          border: 1px solid #e5e7eb !important;
        }

        .gjs-sm-stack .gjs-sm-layer {
          background: white !important;
          border-radius: 8px !important;
          padding: 10px 12px !important;
          margin-bottom: 8px !important;
          border: 1px solid #e5e7eb !important;
          transition: all 0.2s ease !important;
        }

        .gjs-sm-stack .gjs-sm-layer:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1) !important;
          transform: translateX(4px) !important;
        }

        /* Layers Panel - Modern Tree View */
        #gjs .gjs-layer-wrapper {
          background: #ffffff !important;
          padding: 16px 12px !important;
        }

        .gjs-layer {
          border-radius: 12px !important;
          margin: 6px 0 !important;
          padding: 14px 16px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 2px solid #e5e7eb !important;
          background: #ffffff !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }

        .gjs-layer:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
          border-color: #3b82f6 !important;
          transform: translateX(6px) scale(1.02) !important;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15) !important;
        }

        .gjs-layer.gjs-selected {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25) !important;
          font-weight: 600 !important;
          transform: translateX(4px) !important;
        }

        .gjs-layer__icon {
          color: #64748b !important;
          margin-right: 12px !important;
          transition: all 0.3s ease !important;
          font-size: 16px !important;
        }

        .gjs-layer:hover .gjs-layer__icon {
          color: #3b82f6 !important;
          transform: scale(1.2) !important;
        }

        .gjs-layer.gjs-selected .gjs-layer__icon {
          color: #3b82f6 !important;
          transform: scale(1.15) !important;
        }

        /* Layer Title */
        .gjs-layer-title {
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #334155 !important;
          letter-spacing: -0.2px !important;
        }

        .gjs-layer.gjs-selected .gjs-layer-title {
          color: #1e40af !important;
          font-weight: 700 !important;
        }

        /* Layer Eye Icon (Visibility) */
        .gjs-layer__eye {
          color: #64748b !important;
          transition: all 0.3s ease !important;
          font-size: 16px !important;
          margin-left: 8px !important;
        }

        .gjs-layer__eye:hover {
          color: #3b82f6 !important;
          transform: scale(1.2) !important;
        }

        /* Blocks Panel - Modern Card Grid - Responsive */
        #gjs .gjs-blocks-c {
          padding: 16px 12px !important;
          background: #ffffff !important;
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
        }

        /* Blocks Grid - Responsive Layout */
        @media (min-width: 1920px) {
          #gjs .gjs-blocks-c {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }
        }

        @media (max-width: 1400px) {
          #gjs .gjs-blocks-c {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            padding: 12px 10px !important;
          }
        }

        @media (max-width: 1200px) {
          #gjs .gjs-blocks-c {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 10px 8px !important;
          }
        }

        .gjs-block-category {
          margin-bottom: 20px !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          border: 2px solid #e5e7eb !important;
          background: white !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          grid-column: 1 / -1 !important;
        }

        .gjs-block-category:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15) !important;
          transform: translateY(-2px) !important;
        }

        .gjs-block-category .gjs-title {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          padding: 16px 20px !important;
          border-bottom: none !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          letter-spacing: -0.3px !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
        }

        .gjs-block-category .gjs-title:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        /* Block Category Specific Colors */
        
        /* Basic Blocks Category */
        .gjs-block-category[data-name="basic"] .gjs-title {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }

        /* Typography Category */
        .gjs-block-category[data-name="typography"] .gjs-title {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
        }

        /* Media Category */
        .gjs-block-category[data-name="media"] .gjs-title {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        }

        /* Layout Category */
        .gjs-block-category[data-name="layout"] .gjs-title {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        }

        /* Forms Category */
        .gjs-block-category[data-name="forms"] .gjs-title {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        }

        /* Advanced Category */
        .gjs-block-category[data-name="advanced"] .gjs-title {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
        }

        /* Extra Category */
        .gjs-block-category[data-name="extra"] .gjs-title {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        }

        /* Extra Category Content Area */
        .gjs-block-category[data-name="extra"] {
          background: #ffffff !important;
        }

        .gjs-block-category[data-name="extra"] .gjs-blocks-c {
          background: #ffffff !important;
        }

        /* Traits Panel - Modern Form Design */
        #gjs .gjs-trt-traits {
          padding: 16px 12px !important;
          background: #ffffff !important;
        }

        .gjs-trt-trait {
          padding: 16px !important;
          margin-bottom: 16px !important;
          background: white !important;
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }

        .gjs-trt-trait:hover {
          border-color: #3b82f6 !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15) !important;
          transform: translateY(-2px) !important;
        }

        .gjs-trt-trait__label {
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          color: #334155 !important;
          margin-bottom: 12px !important;
          display: block !important;
          letter-spacing: -0.2px !important;
        }

        .gjs-trt-trait input,
        .gjs-trt-trait select,
        .gjs-trt-trait textarea {
          width: 100% !important;
          padding: 12px 16px !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 10px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #1e293b !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          background: white !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
        }

        .gjs-trt-trait input:hover,
        .gjs-trt-trait select:hover,
        .gjs-trt-trait textarea:hover {
          border-color: #cbd5e1 !important;
          background: #f8fafc !important;
        }

        .gjs-trt-trait input:focus,
        .gjs-trt-trait select:focus,
        .gjs-trt-trait textarea:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
          background: white !important;
        }

        /* Right Sidebar Scrollbar - Modern Style */
        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar {
          width: 8px !important;
        }

        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
          border-radius: 10px !important;
        }

        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
          border-radius: 10px !important;
          transition: all 0.3s ease !important;
        }

        #gjs .gjs-pn-panel.gjs-pn-views-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) !important;
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

        /* Panel Tabs - Modern Tab Design */
        .gjs-pn-views {
          background: #ffffff !important;
          border-bottom: 2px solid #e5e7eb !important;
          padding: 8px 4px !important;
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
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
          width: 90vw;
          max-width: 1200px;
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

        /* Day Selector Popup - Modern Design */
        .day-selector-popup-content {
          min-width: 560px;
          max-width: 640px;
        }

        .day-selector-popup-content h3 {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .day-selector-popup-content p {
          color: #64748b;
          margin-bottom: 28px;
          font-size: 14px;
          line-height: 1.6;
        }

        .day-grid-popup {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .day-card-popup {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          font-size: 14px;
          color: #475569;
          position: relative;
          overflow: hidden;
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
          font-size: 14px;
          position: relative;
          z-index: 1;
        }

        .selected-day-info {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border-left: 4px solid #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .selected-day-display, .recent-date-display {
          margin-bottom: 12px;
          padding: 14px 16px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e0e7ff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .selected-day-display:last-child, .recent-date-display:last-child {
          margin-bottom: 0;
        }

        .selected-day-display strong, .recent-date-display strong {
          color: #3b82f6;
          margin-right: 8px;
          font-weight: 700;
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
          .ai-popup-content {
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

        /* Success Popup Overlay */
        .success-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.40) 0%, rgba(30, 41, 59, 0.50) 100%);
          backdrop-filter: blur(8px) saturate(140%);
          -webkit-backdrop-filter: blur(8px) saturate(140%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: overlayFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes overlayFadeIn {
          0% {
            opacity: 0;
            backdrop-filter: blur(0px) saturate(100%);
          }
          100% {
            opacity: 1;
            backdrop-filter: blur(8px) saturate(140%);
          }
        }

        /* Success Popup Content */
        .success-popup-content {
          background: 
            linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9)),
            linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%);
          padding: 40px 50px 35px 50px;
          border-radius: 24px;
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.4),
            0 60px 120px -20px rgba(0, 0, 0, 0.5),
            0 30px 60px -15px rgba(16, 185, 129, 0.5),
            0 15px 30px -10px rgba(16, 185, 129, 0.4),
            0 8px 16px -8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 1),
            inset 0 -1px 0 rgba(16, 185, 129, 0.1);
          max-width: 580px;
          text-align: center;
          position: relative;
          border: 2px solid rgba(16, 185, 129, 0.2);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          animation: successSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: visible;
          transform-style: preserve-3d;
        }

        .success-popup-content::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 24px;
          background: linear-gradient(135deg, 
            rgba(16, 185, 129, 0.4) 0%, 
            rgba(59, 130, 246, 0.3) 25%,
            rgba(139, 92, 246, 0.3) 50%,
            rgba(236, 72, 153, 0.3) 75%,
            rgba(16, 185, 129, 0.4) 100%);
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite, borderGlow 2s ease-in-out infinite;
          z-index: -1;
          filter: blur(8px);
          opacity: 0.7;
        }

        @keyframes borderGlow {
          0%, 100% {
            opacity: 0.5;
            filter: blur(8px);
          }
          50% {
            opacity: 1;
            filter: blur(12px);
          }
        }

        .success-popup-content::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 24px;
          background: 
            radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%);
          animation: subtleShimmer 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes subtleShimmer {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        @keyframes successSlideUp {
          0% {
            transform: translateY(80px) scale(0.8);
            opacity: 0;
            filter: blur(10px);
          }
          60% {
            transform: translateY(-15px) scale(1.03);
          }
          80% {
            transform: translateY(5px) scale(0.98);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }

        /* Success Icon Container */
        .success-icon-container {
          width: 100px;
          height: 100px;
          margin: 0 auto 20px;
          background: 
            linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 0 0 8px rgba(16, 185, 129, 0.1),
            0 0 0 16px rgba(16, 185, 129, 0.05),
            0 20px 60px rgba(16, 185, 129, 0.6),
            0 10px 30px rgba(16, 185, 129, 0.4),
            0 5px 15px rgba(0, 0, 0, 0.3),
            inset 0 2px 15px rgba(255, 255, 255, 0.4),
            inset 0 -2px 10px rgba(0, 0, 0, 0.1);
          animation: successBounce 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55), iconPulse 2s ease-in-out infinite 1s;
          position: relative;
          z-index: 1;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .success-icon-container::before {
          content: '';
          position: absolute;
          top: -15px;
          left: -15px;
          right: -15px;
          bottom: -15px;
          border-radius: 50%;
          border: 2px solid rgba(16, 185, 129, 0.2);
          animation: rotateDashed 15s linear infinite;
          border-style: dashed;
          border-spacing: 10px;
        }

        .success-icon-container::after {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.2));
          filter: blur(15px);
          animation: iconGlow 2s ease-in-out infinite;
          z-index: -1;
        }

        @keyframes rotateDashed {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 0 0 8px rgba(16, 185, 129, 0.1),
              0 0 0 16px rgba(16, 185, 129, 0.05),
              0 20px 60px rgba(16, 185, 129, 0.6),
              0 10px 30px rgba(16, 185, 129, 0.4),
              0 5px 15px rgba(0, 0, 0, 0.3),
              inset 0 2px 15px rgba(255, 255, 255, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 
              0 0 0 12px rgba(16, 185, 129, 0.15),
              0 0 0 24px rgba(16, 185, 129, 0.08),
              0 25px 70px rgba(16, 185, 129, 0.7),
              0 12px 35px rgba(16, 185, 129, 0.5),
              0 6px 18px rgba(0, 0, 0, 0.4),
              inset 0 2px 20px rgba(255, 255, 255, 0.5);
          }
        }

        @keyframes iconGlow {
          0%, 100% {
            opacity: 0.5;
            filter: blur(15px);
          }
          50% {
            opacity: 1;
            filter: blur(20px);
          }
        }

        @keyframes successBounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-checkmark {
          font-size: 50px;
          color: white;
          font-weight: 900;
          animation: checkmarkPop 0.7s 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
          text-shadow: 
            0 5px 15px rgba(0, 0, 0, 0.4),
            0 3px 8px rgba(0, 0, 0, 0.3),
            0 1px 3px rgba(0, 0, 0, 0.2);
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.4));
          position: relative;
          z-index: 2;
        }

        @keyframes checkmarkPop {
          0% {
            transform: scale(0) rotate(-360deg);
            opacity: 0;
            filter: blur(10px);
          }
          50% {
            transform: scale(1.4) rotate(20deg);
            filter: blur(0);
          }
          70% {
            transform: scale(0.9) rotate(-10deg);
          }
          85% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
            filter: blur(0);
          }
        }

        /* Party Emojis */
        .success-party-emojis {
          font-size: 32px;
          margin-bottom: 16px;
          letter-spacing: 10px;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
          animation: partyEmojis 2s ease-in-out infinite, emojiGlow 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }

        @keyframes partyEmojis {
          0%, 100% {
            transform: scale(1) rotate(0deg) translateY(0px);
          }
          20% {
            transform: scale(1.2) rotate(-10deg) translateY(-8px);
          }
          40% {
            transform: scale(1.15) rotate(5deg) translateY(-12px);
          }
          60% {
            transform: scale(1.18) rotate(-5deg) translateY(-10px);
          }
          80% {
            transform: scale(1.12) rotate(8deg) translateY(-6px);
          }
        }

        @keyframes emojiGlow {
          0%, 100% {
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2)) 
                    drop-shadow(0 0 0px rgba(255, 255, 0, 0));
          }
          50% {
            filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.3)) 
                    drop-shadow(0 0 20px rgba(255, 200, 0, 0.6));
          }
        }

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

        /* Success Title */
        .success-title {
          font-size: 36px;
          font-weight: 900;
          background: linear-gradient(135deg, #10b981 0%, #059669 40%, #10b981 70%, #059669 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 14px 0;
          letter-spacing: -1.5px;
          animation: successTitleSlide 0.7s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both, titleShimmer 3s ease-in-out infinite;
          position: relative;
          filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
        }

        @keyframes titleShimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .success-title::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 5px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(16, 185, 129, 0.3) 20%,
            rgba(16, 185, 129, 0.8) 50%,
            rgba(16, 185, 129, 0.3) 80%,
            transparent 100%);
          border-radius: 5px;
          animation: underlineExpand 0.6s 0.5s ease both;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.5);
        }

        @keyframes underlineExpand {
          0% {
            width: 0;
            opacity: 0;
          }
          100% {
            width: 100px;
            opacity: 1;
          }
        }

        @keyframes successTitleSlide {
          0% {
            transform: translateY(-40px) scale(0.85);
            opacity: 0;
            filter: blur(15px) drop-shadow(0 0 0 rgba(16, 185, 129, 0));
          }
          60% {
            transform: translateY(8px) scale(1.08);
            filter: blur(0) drop-shadow(0 6px 12px rgba(16, 185, 129, 0.4));
          }
          80% {
            transform: translateY(-3px) scale(0.98);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0) drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
          }
        }

        /* Success Message */
        .success-message {
          font-size: 18px;
          color: #334155;
          margin: 18px 0 24px 0;
          line-height: 1.6;
          font-weight: 600;
          animation: successMessageFade 0.7s 0.4s ease both;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          letter-spacing: -0.3px;
          padding: 0 10px;
          position: relative;
        }

        .success-message::before {
          content: '';
          position: absolute;
          left: 50%;
          top: -10px;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
          border-radius: 2px;
        }

        @keyframes successMessageFade {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.95);
            filter: blur(8px);
          }
          60% {
            transform: translateY(-3px) scale(1.02);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        /* Success Close Button */
        .success-close-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          color: white;
          border: none;
          padding: 14px 44px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.3),
            0 10px 30px rgba(16, 185, 129, 0.5),
            0 5px 15px rgba(16, 185, 129, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.4),
            inset 0 -2px 0 rgba(0, 0, 0, 0.1);
          font-family: 'Inter', sans-serif;
          letter-spacing: 1px;
          text-transform: uppercase;
          animation: successButtonFade 0.7s 0.5s ease both;
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .success-close-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.4), 
            transparent);
          transition: left 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .success-close-btn::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: width 0.6s, height 0.6s;
        }

        .success-close-btn:hover::before {
          left: 100%;
        }

        .success-close-btn:hover::after {
          width: 300px;
          height: 300px;
        }

        @keyframes successButtonFade {
          0% {
            transform: translateY(30px) scale(0.85);
            opacity: 0;
            filter: blur(8px);
          }
          60% {
            transform: translateY(-8px) scale(1.1);
            filter: blur(0);
          }
          80% {
            transform: translateY(3px) scale(0.95);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }

        .success-close-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
          transform: translateY(-6px) scale(1.1);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.4),
            0 20px 50px rgba(16, 185, 129, 0.7),
            0 10px 25px rgba(16, 185, 129, 0.5),
            0 4px 12px rgba(0, 0, 0, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.5),
            inset 0 -2px 0 rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .success-close-btn:active {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 0 0 1px rgba(255, 255, 255, 0.3),
            0 10px 30px rgba(16, 185, 129, 0.6),
            0 5px 15px rgba(16, 185, 129, 0.4),
            inset 0 2px 0 rgba(0, 0, 0, 0.1);
        }

        /* Confetti Animation */
        .confetti {
          position: fixed;
          top: -10px;
          width: 12px;
          height: 12px;
          z-index: 10000;
          border-radius: 2px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          animation: confettiFall linear forwards, confettiRotate linear infinite;
        }

        @keyframes confettiFall {
          0% {
            top: -10px;
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          100% {
            top: 110vh;
            transform: translateX(var(--confetti-x, 100px)) translateY(20px);
            opacity: 0;
          }
        }

        @keyframes confettiRotate {
          0% {
            transform: rotateZ(0deg) rotateY(0deg);
          }
          100% {
            transform: rotateZ(720deg) rotateY(720deg);
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

        /* Success Details Section */
        .success-details {
          width: 100%;
          margin: 20px 0 20px 0;
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.15);
          box-shadow: 
            0 4px 12px rgba(16, 185, 129, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          animation: detailsFadeIn 0.6s 0.6s ease both;
        }

        @keyframes detailsFadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .success-detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          animation: detailItemSlide 0.4s ease both;
        }

        .success-detail-item:nth-child(1) {
          animation-delay: 0.7s;
        }

        .success-detail-item:nth-child(2) {
          animation-delay: 0.8s;
        }

        .success-detail-item:nth-child(3) {
          animation-delay: 0.9s;
        }

        @keyframes detailItemSlide {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .detail-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
          flex-shrink: 0;
        }

        .detail-text {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          letter-spacing: -0.2px;
        }

        /* Success Footer Text */
        .success-footer-text {
          margin: 14px 0 0 0;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          opacity: 0.7;
          animation: footerFadeIn 0.5s 1s ease both;
          font-style: italic;
        }

        @keyframes footerFadeIn {
          0% {
            opacity: 0;
            transform: translateY(5px);
          }
          100% {
            opacity: 0.8;
            transform: translateY(0);
          }
        }

        /* Mobile Responsive for Success Popup */
        @media (max-width: 768px) {
          .success-popup-content {
            padding: 40px 28px;
            max-width: 92vw;
            border-radius: 24px;
          }

          .success-details {
            margin: 24px 0 20px 0;
            padding: 20px;
            border-radius: 14px;
          }

          .success-detail-item {
            padding: 8px 0;
            gap: 10px;
          }

          .detail-icon {
            font-size: 18px;
            width: 28px;
            height: 28px;
          }

          .detail-text {
            font-size: 14px;
          }

          .success-footer-text {
            font-size: 12px;
            margin: 16px 0 0 0;
          }

          .success-icon-container {
            width: 90px;
            height: 90px;
          }

          .success-icon-container::before {
            top: -8px;
            left: -8px;
            right: -8px;
            bottom: -8px;
            border-width: 2px;
          }

          .success-checkmark {
            font-size: 48px;
          }

          .success-party-emojis {
            font-size: 32px;
            letter-spacing: 8px;
            margin-bottom: 20px;
          }

          .success-title {
            font-size: 30px;
            margin-bottom: 12px;
          }

          .success-title::after {
            width: 60px;
            height: 3px;
          }

          .success-message {
            font-size: 17px;
            margin: 20px 0 32px 0;
          }

          .success-close-btn {
            padding: 14px 36px;
            font-size: 15px;
            border-radius: 14px;
          }
        }

        @media (max-width: 480px) {
          .success-popup-content {
            padding: 32px 24px;
            max-width: 95vw;
            border-radius: 20px;
          }

          .success-icon-container {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
          }

          .success-checkmark {
            font-size: 42px;
          }

          .success-party-emojis {
            font-size: 28px;
            letter-spacing: 6px;
            margin-bottom: 16px;
          }

          .success-title {
            font-size: 26px;
            margin-bottom: 10px;
          }

          .success-title::after {
            width: 50px;
            height: 3px;
          }

          .success-message {
            font-size: 16px;
            margin: 18px 0 20px 0;
            padding: 0 10px;
          }

          .success-details {
            margin: 20px 0 16px 0;
            padding: 16px;
            border-radius: 12px;
          }

          .success-detail-item {
            padding: 6px 0;
            gap: 8px;
          }

          .detail-icon {
            font-size: 16px;
            width: 26px;
            height: 26px;
            border-radius: 6px;
          }

          .detail-text {
            font-size: 13px;
          }

          .success-close-btn {
            padding: 13px 32px;
            font-size: 14px;
            border-radius: 12px;
            letter-spacing: 0.3px;
          }

          .success-footer-text {
            font-size: 11px;
            margin: 14px 0 0 0;
          }
        }

      `}</style>
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
        <div p={8} textAlign="center">
          <div status="error">
            <div />
            <div>
              <div>Something went wrong!</div>
              <div>
                The editor encountered an error. Please refresh the page.
              </div>
            </div>
          </div>
          <button mt={4} onClick={() => window.location.reload()}>
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
