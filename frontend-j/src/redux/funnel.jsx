
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCoachId, getToken } from '../utils/authUtils';
import { API_BASE_URL } from '../config/apiConfig';

function generateFunnelUrl() {
  const url = `funnel-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
  console.log('[FUNNEL SLICE] Generated new fallback funnel URL:', url);
  return url;
}

// Helper function to clean and minimize content (preserves CSS/JS formatting)
const cleanContent = (content, defaultValue = '', preserveFormatting = false) => {
  if (!content) return defaultValue;
  // For CSS/JS, preserve formatting to avoid breaking code
  if (preserveFormatting) {
    return content.trim();
  }
  // For HTML/text, minimize spaces
  return content.replace(/\s+/g, ' ').trim();
};

export const fetchFunnelBySlug = createAsyncThunk(
  'funnel/fetchBySlug',
  async (funnelId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const coachId = getCoachId(state.auth);
      const token = getToken(state.auth);

      if (!coachId || !token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachId}/funnels/${funnelId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return rejectWithValue(`Failed to fetch funnel: ${response.status}`);
      }

      const { data, success } = await response.json();

      if (!success) {
        return rejectWithValue('Invalid data format from API');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveFunnelToBackend = createAsyncThunk(
  'funnel/saveFunnelToBackend',
  async ({ slug, funnelName }, { getState, rejectWithValue }) => {
    try {
      const rootState = getState();
      const funnelState = rootState.funnel;
      const authState = rootState.auth;

      const coachId = getCoachId(authState);
      const token = getToken(authState);

      if (!coachId || !token) {
        return rejectWithValue('Authentication required. Please log in to save the funnel.');
      }

      const funnelId = funnelState.funnelId;
      const isNewFunnel = !funnelId;

      // Construct optimized payload with coachId and token in body
      const payload = {
        coachId,
        token,
        name: cleanContent(funnelName || funnelState.contentData.name, 'My New Funnel'),
        description: cleanContent(funnelState.contentData.description, 'A funnel created with the builder.'),
        isActive: funnelState.contentData.isActive !== false,
        funnelUrl: cleanContent(slug || funnelState.contentData.slug) || generateFunnelUrl(),
        stages: funnelState.stages.map((stage, index) => {
          const projectPage = funnelState.contentData.projectData?.pages?.find(p => p.id === stage.id) || {};
          
          const config = stage.type === 'custom-page'
            ? funnelState.contentData.customStagesConfig[stage.id] || {}
            : funnelState.contentData.stagesConfig[stage.type] || {};

          // Minimal basic info
          const basicInfo = {
            title: cleanContent(projectPage.basicInfo?.title || stage.name, 'Untitled Page'),
            description: cleanContent(projectPage.basicInfo?.description, ''),
            keywords: cleanContent(projectPage.basicInfo?.keywords, ''),
            ...(projectPage.basicInfo?.favicon && { favicon: projectPage.basicInfo.favicon }),
            ...(projectPage.basicInfo?.socialImage && { socialImage: projectPage.basicInfo.socialImage }),
            ...(projectPage.basicInfo?.socialTitle && { socialTitle: projectPage.basicInfo.socialTitle }),
            ...(projectPage.basicInfo?.socialDescription && { socialDescription: projectPage.basicInfo.socialDescription }),
            ...(projectPage.basicInfo?.customHtmlHead && { customHtmlHead: projectPage.basicInfo.customHtmlHead }),
            ...(projectPage.basicInfo?.customHtmlBody && { customHtmlBody: projectPage.basicInfo.customHtmlBody })
          };

          // Use slug as pageId if available, otherwise use existing pageId
          const pageId = projectPage.basicInfo?.slug || (isNewFunnel ? `${stage.id}-${Date.now()}` : (projectPage.id || `${stage.id}-${Date.now()}`));

          return {
            pageId: pageId,
            name: cleanContent(stage.name || projectPage.name, 'Unnamed Stage'),
            type: stage.type,
            selectedTemplateKey: config.selectedTemplateKey || null,
            html: cleanContent(projectPage.html, '<div></div>'),
            css: cleanContent(projectPage.css || '', '', true), // Preserve CSS formatting
            js: cleanContent(projectPage.js || '', '', true), // Preserve JS formatting
            ...(projectPage.assets?.length ? { assets: projectPage.assets } : {}),
            basicInfo,
            order: index,
            isEnabled: stage.isEnabled !== false,
          };
        })
      };

      console.log('Optimized payload to backend:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachId}/funnels/${funnelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', { status: response.status, data: errorText });
        
        let errorMessage = `Server error (${response.status})`;
        
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to save this funnel.';
            break;
          case 404:
            errorMessage = 'Funnel not found. Please refresh and try again.';
            break;
          case 422:
            errorMessage = 'Invalid data provided. Please check your funnel content.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server error (${response.status})`;
        }
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          if (errorText.length < 200 && errorText.trim()) {
            errorMessage += `: ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Funnel saved successfully. Response:', result);
      return result;

    } catch (error) {
      console.error('Error in saveFunnelToBackend thunk:', error);
      
      // Handle different types of errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return rejectWithValue('Network error. Please check your internet connection and try again.');
      } else if (error.name === 'AbortError') {
        return rejectWithValue('Request was cancelled. Please try again.');
      } else if (error.message.includes('JSON')) {
        return rejectWithValue('Invalid response from server. Please try again.');
      } else {
        return rejectWithValue(error.message || 'An unexpected error occurred while saving.');
      }
    }
  }
);

const DEFAULT_FUNNEL_CONTENT = {
  name: 'My New Funnel',
  description: 'A new funnel created in the builder.',
  isActive: true,
  slug: '',
  welcomePage: { 
    basicInfo: { 
      name: 'Welcome Page', 
      title: 'Welcome to My Funnel', 
      description: '', 
      favicon: null, 
      keywords: '', 
      socialTitle: '', 
      socialImage: null, 
      socialDescription: '', 
      customHtmlHead: '', 
      customHtmlBody: '' 
    }, 
    selectedTemplateKey: null 
  },
  generalSettings: {
    appointment: { 
      basicInfo: { name: 'Appointment Page', title: 'Book Your Appointment', description: '', favicon: null, keywords: '', socialTitle: '', socialImage: null, socialDescription: '', customHtmlHead: '', customHtmlBody: '' }, 
      settings: { availabilityRange: { startDate: new Date().toISOString(), endDate: null } } 
    }, 
    payment: { 
      basicInfo: { name: 'Payment Page', title: 'Complete Your Purchase', description: '', favicon: null, keywords: '', socialTitle: '', socialImage: null, socialDescription: '', customHtmlHead: '', customHtmlBody: '' }, 
      settings: { currency: 'INR', gateways: { razorpay: { connected: false, keyId: '' } } } 
    } 
  },
  projectData: { 
    pages: [
      { 
        id: 'welcome-page', 
        name: 'Welcome Page', 
        html: `<h1>Welcome Page</h1><p>Design your welcome page here.</p>`, 
        css: '', 
        js: '', 
        assets: [],
        basicInfo: { name: 'Welcome Page', title: 'Welcome Page', description: '', favicon: null, keywords: '', socialTitle: '', socialImage: null, socialDescription: '', customHtmlHead: '', customHtmlBody: '' } 
      },
      { 
        id: 'thankyou-page', 
        name: 'Thank You Page', 
        html: `<h1>Thank You Page</h1><p>Design your thank you page here.</p>`, 
        css: '',
        js: '', 
        assets: [],
        basicInfo: { name: 'Thank You Page', title: 'Thank You Page', description: '', favicon: null, keywords: '', socialTitle: '', socialImage: null, socialDescription: '', customHtmlHead: '', customHtmlBody: '' } 
      }
    ], 
    globalCss: '' 
  },
  stagesConfig: {
    'welcome-page': { name: 'Welcome Page', selectedTemplateKey: null }, 
    'vsl-page': { name: 'VSL Page', selectedTemplateKey: null }, 
    'product-offer': { name: 'Product Offer', selectedTemplateKey: null }, 
    'payment-page': { name: 'Payment Page', selectedTemplateKey: null }, 
    'appointment-page': { name: 'Appointment Page', selectedTemplateKey: null }, 
    'whatsapp-page': { name: 'WhatsApp Community', selectedTemplateKey: null }, 
    'thankyou-page': { name: 'Thank You Page', selectedTemplateKey: null }
  },
  customStages: {},
  customStagesConfig: {}
};

const getDefaultStages = () => [
  { id: 'welcome-page', name: 'Welcome Page', type: 'welcome-page', fixed: true, isEnabled: true },
  { id: 'thankyou-page', name: 'Thank You Page', type: 'thankyou-page', fixed: true, isEnabled: true }
];

const loadInitialState = () => {
  const localStorageKey = 'funnelBuilderState_v6';
  try {
    const savedState = localStorage.getItem(localStorageKey);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      const defaultFixedPages = DEFAULT_FUNNEL_CONTENT.projectData.pages;
      const existingProjectPages = parsedState.contentData.projectData?.pages || [];
      const mergedProjectPages = defaultFixedPages.map(defaultPage => {
        const existingPage = existingProjectPages.find(p => p.id === defaultPage.id);
        return existingPage ? { ...defaultPage, ...existingPage, basicInfo: { ...defaultPage.basicInfo, ...(existingPage.basicInfo || {}) } } : defaultPage;
      }).concat(existingProjectPages.filter(existingPage => !defaultFixedPages.some(defaultPage => defaultPage.id === existingPage.id)));

      return {
        contentData: { 
          ...DEFAULT_FUNNEL_CONTENT, 
          ...parsedState.contentData, 
          projectData: { 
            pages: mergedProjectPages, 
            globalCss: parsedState.contentData.projectData?.globalCss || '' 
          }, 
          stagesConfig: { 
            ...DEFAULT_FUNNEL_CONTENT.stagesConfig, 
            ...(parsedState.contentData.stagesConfig || {}) 
          }, 
          customStages: parsedState.contentData.customStages || {}, 
          customStagesConfig: parsedState.contentData.customStagesConfig || {} 
        },
        stages: parsedState.stages || getDefaultStages(),
        apiStatus: 'idle',
        error: null,
        funnelId: parsedState.funnelId || null
      };
    }
  } catch (e) {
    console.error('Error loading state from localStorage', e);
  }
  return { 
    contentData: DEFAULT_FUNNEL_CONTENT,
    stages: getDefaultStages(), 
    apiStatus: 'idle', 
    error: null,
    funnelId: null
  };
};

const initialState = loadInitialState();

const saveStateToLocalStorage = (state) => {
  const localStorageKey = 'funnelBuilderState_v6';
  try {
    const stateToSave = { 
      contentData: state.contentData, 
      stages: state.stages,
      funnelId: state.funnelId
    };
    localStorage.setItem(localStorageKey, JSON.stringify(stateToSave));
  } catch (e) {
    console.error('Error saving state to localStorage', e);
  }
};

export const funnelSlice = createSlice({
  name: 'funnel',
  initialState,
  reducers: {
    resetState: (state) => {
      localStorage.removeItem('funnelBuilderState_v6');
      Object.assign(state, { 
        contentData: DEFAULT_FUNNEL_CONTENT, 
        stages: getDefaultStages(), 
        apiStatus: 'idle', 
        error: null,
        funnelId: null 
      });
    },
    updateProjectData(state, action) {
      const { pages: newPages, globalCss } = action.payload;
      const existingPages = state.contentData.projectData?.pages || [];
      
      newPages.forEach(newPage => {
        const index = existingPages.findIndex(p => p.id === newPage.id);
        if (index !== -1) {
          existingPages[index] = { 
            ...existingPages[index], 
            ...newPage, 
            css: newPage.css !== undefined ? cleanContent(newPage.css || '', '', true) : existingPages[index].css,
            js: newPage.js !== undefined ? cleanContent(newPage.js || '', '', true) : existingPages[index].js,
            basicInfo: { 
              ...(existingPages[index].basicInfo || {}), 
              ...(newPage.basicInfo || {}) 
            } 
          };
        } else {
          existingPages.push({
            ...newPage,
            css: cleanContent(newPage.css || '', '', true),
            js: cleanContent(newPage.js || '', '', true)
          });
        }
      });
      
      state.contentData.projectData = { 
        ...state.contentData.projectData, 
        pages: existingPages, 
        globalCss: typeof globalCss === 'string' ? cleanContent(globalCss, '', true) : state.contentData.projectData.globalCss 
      };
      saveStateToLocalStorage(state);
    },
    addStage: (state, action) => {
      const newStage = { ...action.payload, isEnabled: true };
      if (state.stages.some(s => s.id === newStage.id)) return;
      const defaultBasicInfo = { 
        name: newStage.name, 
        title: newStage.name, 
        description: '', 
        favicon: null, 
        keywords: '', 
        socialTitle: '', 
        socialImage: null, 
        socialDescription: '', 
        customHtmlHead: '', 
        customHtmlBody: '' 
      };
      state.stages.push(newStage);
      if (newStage.type === 'custom-page') {
        state.contentData.customStagesConfig[newStage.id] = { 
          name: newStage.name, 
          selectedTemplateKey: null, 
          basicInfo: defaultBasicInfo 
        };
      }
      if (!state.contentData.projectData.pages.find(p => p.id === newStage.id)) {
        state.contentData.projectData.pages.push({ 
          id: newStage.id, 
          name: newStage.name, 
          html: `<h1>${newStage.name}</h1><p>Design your page here.</p>`, 
          css: '',
          js: '', 
          assets: [], 
          basicInfo: defaultBasicInfo 
        });
      }
      saveStateToLocalStorage(state);
    },
    removeStage: (state, action) => {
      const stageIdToRemove = action.payload;
      state.stages = state.stages.filter(stage => stage.id !== stageIdToRemove);
      delete state.contentData.customStagesConfig[stageIdToRemove];
      if (state.contentData.projectData?.pages) {
        state.contentData.projectData.pages = state.contentData.projectData.pages.filter(page => page.id !== stageIdToRemove);
      }
      saveStateToLocalStorage(state);
    },
    updateStageBasicInfo: (state, action) => {
      const { stageId, key, value } = action.payload;
      const stage = state.stages.find(s => s.id === stageId);
      if (!stage) return;
      
      const projectPage = state.contentData.projectData?.pages?.find(p => p.id === stageId);
      if (projectPage) {
        if (!projectPage.basicInfo) projectPage.basicInfo = {};
        projectPage.basicInfo[key] = value;
        if (key === 'name') {
          stage.name = value;
          projectPage.name = value;
          projectPage.basicInfo.title = value;
        }
      }
      
      if (stage.type === 'custom-page' && state.contentData.customStagesConfig[stageId]) {
        state.contentData.customStagesConfig[stageId].basicInfo[key] = value;
        if (key === 'name') state.contentData.customStagesConfig[stageId].name = value;
      } else if (stage.type === 'welcome-page') {
        state.contentData.welcomePage.basicInfo[key] = value;
      } else if (['appointment-page', 'payment-page'].includes(stage.type)) {
        const settingKey = stage.type.replace('-page', '');
        if (state.contentData.generalSettings[settingKey]?.basicInfo) {
          state.contentData.generalSettings[settingKey].basicInfo[key] = value;
        }
      }
      saveStateToLocalStorage(state);
    },
    setSelectedTemplateForStage: (state, action) => {
      const { stageId, templateKey } = action.payload;
      const stage = state.stages.find(s => s.id === stageId);
      if (!stage) return;
      
      const configTarget = stage.type === 'custom-page' 
        ? state.contentData.customStagesConfig 
        : state.contentData.stagesConfig;
      const keyTarget = stage.type === 'custom-page' ? stageId : stage.type;
      
      if (!configTarget[keyTarget]) { 
        configTarget[keyTarget] = { name: stage.name }; 
      }
      configTarget[keyTarget].selectedTemplateKey = templateKey;
      saveStateToLocalStorage(state);
    },
    setFunnelData: (state, action) => {
      state.contentData = { ...state.contentData, ...action.payload };
      saveStateToLocalStorage(state);
    },
    setStages: (state, action) => {
      state.stages = action.payload;
      saveStateToLocalStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFunnelBySlug.pending, (state) => {
        state.apiStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchFunnelBySlug.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload._id !== state.funnelId) {
          localStorage.removeItem('funnelBuilderState_v6');
        }
        state.funnelId = payload._id;
        state.contentData.name = payload.name;
        state.contentData.description = payload.description;
        state.contentData.isActive = payload.isActive;
        state.contentData.slug = payload.funnelUrl;

        state.stages = payload.stages.sort((a, b) => a.order - b.order).map(s => ({
          id: s.pageId,
          name: s.name,
          type: s.type,
          fixed: ['welcome-page', 'thankyou-page'].includes(s.type),
          isEnabled: s.isEnabled
        }));

        state.contentData.projectData.pages = payload.stages.map(s => ({
          id: s.pageId,
          name: s.name,
          html: s.html,
          css: cleanContent(s.css),
          js: s.js,
          assets: s.assets || [],
          basicInfo: {
            ...s.basicInfo,
            slug: s.pageId, // Map pageId to slug for frontend display
            keywords: s.basicInfo?.keywords || ''
          }
        }));

        state.contentData.stagesConfig = {};
        state.contentData.customStagesConfig = {};
        payload.stages.forEach(s => {
          const config = {
            name: s.name,
            selectedTemplateKey: s.selectedTemplateKey,
            basicInfo: s.basicInfo
          };
          if (s.type === 'custom-page') {
            state.contentData.customStagesConfig[s.pageId] = config;
          } else {
            state.contentData.stagesConfig[s.type] = config;
          }
        });

        const appointmentStage = payload.stages.find(s => s.type === 'appointment-page');
        if (appointmentStage) {
          state.contentData.generalSettings.appointment = {
            basicInfo: appointmentStage.basicInfo,
            settings: appointmentStage.settings || { availabilityRange: { startDate: new Date().toISOString(), endDate: null } }
          };
        }

        const paymentStage = payload.stages.find(s => s.type === 'payment-page');
        if (paymentStage) {
          state.contentData.generalSettings.payment = {
            basicInfo: paymentStage.basicInfo,
            settings: paymentStage.settings || { currency: 'INR', gateways: { razorpay: { connected: false, keyId: '' } } }
          };
        }

        if (state.stages.length === 0) {
          state.stages = getDefaultStages();
          state.contentData.projectData.pages = DEFAULT_FUNNEL_CONTENT.projectData.pages;
          state.contentData.stagesConfig['welcome-page'] = { 
            name: 'Welcome Page', 
            selectedTemplateKey: null, 
            basicInfo: DEFAULT_FUNNEL_CONTENT.welcomePage.basicInfo 
          };
          state.contentData.stagesConfig['thankyou-page'] = { 
            name: 'Thank You Page', 
            selectedTemplateKey: null, 
            basicInfo: DEFAULT_FUNNEL_CONTENT.projectData.pages[1].basicInfo 
          };
        }

        state.apiStatus = 'succeeded';
        saveStateToLocalStorage(state);
      })
      .addCase(fetchFunnelBySlug.rejected, (state, action) => {
        state.apiStatus = 'failed';
        state.error = action.payload || 'Failed to fetch funnel';
        Object.assign(state, { 
          contentData: DEFAULT_FUNNEL_CONTENT, 
          stages: getDefaultStages(),
          funnelId: null 
        });
      })
      .addCase(saveFunnelToBackend.pending, (state) => {
        state.apiStatus = 'publishing';
        state.error = null;
      })
      .addCase(saveFunnelToBackend.fulfilled, (state, action) => {
        state.apiStatus = 'published';
        state.funnelId = action.payload.data._id;
        if (action.payload?.data?.funnelUrl) {
          state.contentData.slug = action.payload.data.funnelUrl;
        }
        saveStateToLocalStorage(state);
      })
      .addCase(saveFunnelToBackend.rejected, (state, action) => {
        state.apiStatus = 'failed';
        state.error = action.payload || 'Failed to save funnel';
      });
  }
});

export const {
  resetState,
  updateProjectData,
  addStage,
  removeStage,
  updateStageBasicInfo,
  setSelectedTemplateForStage,
  setFunnelData,
  setStages
} = funnelSlice.actions;

export default funnelSlice.reducer;