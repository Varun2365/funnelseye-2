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
  
  // Day Selector state management
  const [daySelectedComponents, setDaySelectedComponents] = useState(new Set());
  const [selectedDaySelectorId, setSelectedDaySelectorId] = useState(null);
  const [selectedComponentElement, setSelectedComponentElement] = useState(null);

  // Function to detect forms on the current page
  const detectFormsOnPage = useCallback(() => {
    if (!editorInstance) return;

    const forms = [];
    const page = editorInstance.Pages.getSelected();
    if (!page) return;

    const wrapper = page.getMainComponent();

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
  }, [editorInstance]);

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
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets?coachId=${coachID}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch assets: ${response.statusText}`);
        }
        const result = await response.json();
        setAssets(result.data || []);
      } catch (error) {
        console.error("Error fetching initial assets:", error);
        setAssets([]);
      }
    };

    fetchInitialAssets();
  }, []);

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
    window.editor = editor;
    setEditorInstance(editor);

    const getPageElements = () => {
      const elements = [{ id: '', name: '-- Select element --' }];
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
          componentId = `day-selector-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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
                'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
                'Friday': 5, 'Saturday': 6, 'Sunday': 0
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

    const pagesEl = document.querySelector("#pages");
    if (pagesEl) {
      editor.Pages.__appendTo({ el: pagesEl });
    }

    setTimeout(() => {
      const pageToSelect = editor.Pages.get(stageId);
      if (pageToSelect) {
        editor.Pages.select(pageToSelect);
        editor.runCommand('canvas:reload');
      } else if (editor.Pages.getAll().length > 0) {
        editor.Pages.select(editor.Pages.getAll()[0]);
        editor.runCommand('canvas:reload');
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
    }, 500);

  }, [selectedRedirectPage, stages, stageId, slug, user, funnelId, detectFormsOnPage]);

  useEffect(() => {
    return () => {
      if (editorInstance) {
        editorInstance.destroy();
        setEditorInstance(null);
        delete window.editor;
      }
    };
  }, [editorInstance]);

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
    let globalCss = '';

    if (hasSavedPages) {
      globalCss = savedProjectData.globalCss || '';
      pages = stages.map(stage => {
        const savedPage = savedProjectData.pages.find(p => p.id === stage.id);
        return savedPage ? {
          id: stage.id,
          name: savedPage.name || stage.name,
          component: savedPage.html,
          styles: savedPage.css || '',
          script: savedPage.js || '',
          basicInfo: savedPage.basicInfo || {},
          redirectPage: savedPage.redirectPage || ''
        } : createPageFromTemplate(stage);
      });
    } else {
      pages = stages.map(stage => createPageFromTemplate(stage));
    }

    return {
      pages,
      css: globalCss
    };
  }, [stages, contentData, stageId]);

  const extractPageCSS = (editor, pageId) => {
    try {
      const cssComposer = editor.CssComposer;
      const allRules = cssComposer.getAll();
      let pageCSS = '';

      allRules.forEach(rule => {
        const cssText = rule.toCSS();
        if (cssText && cssText.trim()) {
          pageCSS += cssText + '\n';
        }
      });

      return pageCSS.trim();
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
    const saveButton = document.querySelector('.save-button');
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.innerHTML = '<span>Saving...</span>';
    }

    const editor = editorInstance;
    const globalCss = editor.getCss();
    const funnelName = contentData?.name || 'My Funnel';

    const preparePageData = (page) => {
      const stage = stages.find(s => s.id === page.id);
      const pageCSS = extractPageCSS(editor, page.id);
      const pageHTML = page.getMainComponent().toHTML();

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

      return {
        id: page.id,
        name: page.get('name') || stage?.name || 'Unnamed Page',
        type: stage?.type || 'custom-page',
        html: finalHTML,
        css: pageCSS,
        js: page.get('script') || '',
        assets: [],
        basicInfo: page.get('basicInfo') || {},
        redirectPage: page.get('redirectPage') || selectedRedirectPage || '',
        isEnabled: stage?.isEnabled !== false,
        order: stages.findIndex(s => s.id === page.id)
      };
    };

    try {
      // Check authentication before proceeding
      if (!coachId || !token) {
        alert('Authentication required. Please log in to save the funnel.');
        // Redirect to login page
        window.location.href = '/login';
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
        pagesData = editor.Pages.getAll().map(preparePageData);
      }

      dispatch(updateProjectData({
        pages: pagesData,
        globalCss: globalCss
      }));

      const response = await dispatch(saveFunnelToBackend({
        slug,
        funnelName
      }));

      if (saveFunnelToBackend.fulfilled.match(response)) {
        alert(saveType === 'single' ? "Page saved successfully!" : "All pages saved successfully!");
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
      // Reset button state
      const saveButton = document.querySelector('.save-button');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.innerHTML = '<span>Save</span>';
      }
    }
  };

  const handleDownloadProject = () => {
    if (!editorInstance) {
      alert("Editor is not ready.");
      return;
    }

    const editor = editorInstance;
    const currentPage = editor.Pages.getSelected();
    if (!currentPage) {
      alert("No page is selected to download.");
      return;
    }

    const pageName = currentPage.get('name') || `page-${currentPage.cid}`;
    const pageCSS = extractPageCSS(editor, currentPage.id);
    const globalCSS = editor.getCss();
    const combinedCSS = globalCSS + '\n' + pageCSS;

    const fullCode = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${pageName}</title><style>${combinedCSS}</style></head><body>${currentPage.getMainComponent().toHTML()}<script>${currentPage.get('script') || ''}</script></body></html>`;

    const blob = new Blob([fullCode], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${pageName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleTemplateSelect = (templateKey) => {
    if (!currentStage || !editorInstance) return;

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

            const cssRules = editorInstance.CssComposer.getAll();
            const pageRules = cssRules.filter(rule => true);
            pageRules.forEach(rule => editorInstance.CssComposer.remove(rule));

            if (css.trim()) {
              try {
                // Validate CSS before setting to prevent unclosed block errors
                const tempStyle = document.createElement('style');
                tempStyle.textContent = css;
                document.head.appendChild(tempStyle);
                document.head.removeChild(tempStyle);
                
                // If validation passes, set the rule
                editorInstance.CssComposer.setRule(css);
              } catch (cssError) {
                console.error('Invalid CSS detected, skipping:', cssError);
                // Set a safe fallback CSS
                editorInstance.CssComposer.setRule('/* CSS validation failed */');
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
        js: processedJs || template.js,
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

  const editorKey = `funnel-editor-${slug}-${forceRefreshKey}`;

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

      <div className="action-buttons">
        <button
          onClick={() => handleSave('single')}
          className="action-button save-button"
        >
          <FaSave />
          <span>Save Page</span>
        </button>

        <button
          onClick={() => handleSave('all')}
          className="action-button save-all-button"
        >
          <FaFileExport />
          <span>Save All</span>
        </button>

        <button
          onClick={() => setShowAIPopup(true)}
          className="action-button ai-generate-button"
        >
          <FaMagic />
          <span>AI Content</span>
        </button>

        <button
          onClick={() => setShowRedirectPopup(true)}
          className="action-button redirect-button"
        >
          <FaFileAlt />
          <span>Set Redirect</span>
        </button>

        <button
          onClick={() => {
            console.log('📅 Day Selector button clicked');
            console.log('Selected ID:', selectedDaySelectorId);
            console.log('Selected Element:', selectedComponentElement);
            
            // Check for components on page - try multiple selectors
            const dayComponents1 = document.querySelectorAll('.day-selector-display-widget');
            const dayComponents2 = document.querySelectorAll('.day-selector-widget-element');
            const dayComponents3 = document.querySelectorAll('[data-component-id*="day-selector"]');
            
            const allDayComponents = [...dayComponents1, ...dayComponents2, ...dayComponents3];
            const uniqueComponents = [...new Set(allDayComponents)];
            
            console.log('Components found:', uniqueComponents.length);
            console.log('All components:', uniqueComponents);
            
            if (selectedDaySelectorId || selectedComponentElement) {
              console.log('✅ Opening popup for selected component');
              setShowDaySelectorPopup(true);
            } else if (uniqueComponents.length > 0) {
              // Auto-select first component
              const firstComp = uniqueComponents[0];
              const compId = firstComp.getAttribute('data-component-id') || 
                            `day-selector-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
              
              firstComp.setAttribute('data-component-id', compId);
              setSelectedDaySelectorId(compId);
              setSelectedComponentElement(firstComp);
              firstComp.classList.add('selected');
              
              console.log('✅ Auto-selected first component:', compId);
              setShowDaySelectorPopup(true);
            } else {
              alert('⚠️ No Day Selector found!\n\n1. Drag "Day Selector" from left panel\n2. Drop it on the page\n3. Click on it to select\n4. Then click this button');
            }
          }}
          className="action-button day-selector-button"
        >
          <FaCalendarDay />
          <span>Day Selector</span>
        </button>

        <button
          onClick={forceTemplateRefresh}
          className="action-button refresh-button"
        >
          <FaSync />
          <span>Refresh</span>
        </button>

        <button
          onClick={handleDownloadProject}
          className="action-button download-button"
        >
          <FaDownload />
          <span>Download</span>
        </button>

        <button
          onClick={handleBack}
          className="action-button back-button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
      </div>


      <div className="editor-main-area" style={{ width: '100%', height: '100%' }}>
        <div id="pages" className="pages-container" />
        <StudioEditor
          key={editorKey}
          onEditor={onEditorReady}
          style={{ width: "100%", height: "100%" }}
          options={{
            storage: {
              type: "self",
              onSave: async ({ project }) => console.log("[Frontend] Project auto-synced (GrapesJS internal).", project),
              onLoad: () => ({ project: generateInitialProject() }),
            },
            assetManager: {
              assets: assets.map(asset => ({
                ...asset,
                src: asset.src.startsWith('/') ? asset.src : `/${asset.src}`
              })),
              upload: `${API_BASE_URL}/api/assets`,
              uploadRequest: {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              },
              uploadName: 'assets',
              multiUpload: true,
              customUpload: async (files, onComplete, onError) => {
                try {
                  const uploaded = await uploadFiles(files);
                  onComplete(uploaded.map(asset => ({
                    ...asset,
                    src: asset.src.startsWith('/') ? asset.src : `/${asset.src}`
                  })));
                  setAssets(prev => [...uploaded, ...prev]);
                } catch (err) {
                  console.error(err);
                  onError(err.message);
                }
              },
            },
            plugins: [
              gjsForms,
              gjsCountdown,
              gjsTabs,
              gjsCustomCode,
              gjsTooltip,
              gjsTyped,
              gjsNavbar,
              gjsBlocksBasic,
            ],
          }}
        />
      </div>

      <style jsx>{`
        .portfolio-edit-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          background-color: #f0f2f5;
        }

        .editor-main-area {
          flex-grow: 1;
          position: relative;
          height: 100%;
        }

        .pages-container {
          position: absolute;
          top: 15px;
          left: 15px;
          z-index: 1000;
          background: rgba(30, 30, 30, 0.9);
          color: white;
          padding: 8px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .floating-form-buttons {
          position: fixed;
          top: 50%;
          left: 20px;
          transform: translateY(-50%);
          z-index: 1500;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .floating-form-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          min-width: 140px;
          white-space: nowrap;
        }

        .floating-form-btn:hover {
          transform: translateX(5px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .action-buttons {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-button {
          padding: 12px 18px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .save-button {
          background-color: #3498db;
          color: white;
        }

        .save-all-button {
          background-color: #16a085;
          color: white;
        }

        .ai-generate-button {
          background-color: #8e44ad;
          color: white;
        }

        .redirect-button {
          background-color: #2ecc71;
          color: white;
        }

        .refresh-button {
          background-color: #f39c12;
          color: white;
        }

        .download-button {
          background-color: #27ae60;
          color: white;
        }

        .back-button {
          background-color: #c0392b;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .modal-content {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close-btn {
          position: absolute;
          top: 10px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #888;
        }

        .template-selector-container {
          width: 90vw;
          max-width: 1200px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .template-card {
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .template-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .template-card.selected {
          border-color: #3498db;
          box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
        }

        .template-thumbnail img {
          width: 100%;
          height: auto;
          display: block;
          background-color: #eee;
        }

        .template-info {
          padding: 15px;
        }

        .template-info h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .template-info p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .redirect-popup-content {
          min-width: 400px;
          max-width: 500px;
        }

        .redirect-popup-content h3 {
          margin-top: 0;
          color: #2c3e50;
        }

        .redirect-popup-content p {
          color: #7f8c8d;
          margin-bottom: 20px;
        }

        .redirect-popup-content select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        /* Day Selector Popup Styles */
        .day-selector-popup-content {
          min-width: 500px;
          max-width: 600px;
        }

        .day-selector-popup-content h3 {
          margin-top: 0;
          color: #2c3e50;
        }

        .day-selector-popup-content p {
          color: #7f8c8d;
          margin-bottom: 20px;
        }

        .day-grid-popup {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .day-card-popup {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 15px 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .day-card-popup:hover {
          background: #e9ecef;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .day-card-popup.selected {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-color: #667eea;
          color: white;
          font-weight: bold;
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
        }

        .day-name {
          font-size: 14px;
        }

        .selected-day-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          border-left: 4px solid #667eea;
        }

        .selected-day-display, .recent-date-display {
          margin-bottom: 10px;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .selected-day-display strong, .recent-date-display strong {
          color: #667eea;
          margin-right: 10px;
        }

        .popup-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .popup-buttons button {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .cancel-btn {
          background-color: #e74c3c;
          color: white;
          border: none;
        }

        .submit-btn {
          background-color: #2ecc71;
          color: white;
          border: none;
        }

        @media (max-width: 768px) {
          .floating-form-buttons {
            left: 10px;
            top: 20%;
          }

          .floating-form-btn {
            padding: 10px 12px;
            font-size: 12px;
            min-width: 120px;
          }

          .floating-form-btn span {
            display: none;
          }

          .floating-form-btn {
            min-width: 45px;
            justify-content: center;
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
        <Box p={8} textAlign="center">
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>
                The editor encountered an error. Please refresh the page.
              </AlertDescription>
            </Box>
          </Alert>
          <Button mt={4} onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Box>
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