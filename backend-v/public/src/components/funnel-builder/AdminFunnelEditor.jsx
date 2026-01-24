import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSync, FaDownload, FaArrowLeft, FaMagic, FaFileAlt, FaSave, FaFileExport, FaArrowDown, FaCalendarDay, FaGripVertical, FaCode, FaMoon, FaSun, FaLaptop, FaTabletAlt, FaMobileAlt, FaLayerGroup, FaExchangeAlt, FaThLarge, FaTimes, FaPlus, FaCube, FaCopy, FaClone, FaTrash } from 'react-icons/fa';
import axios from "axios";
import { templates } from './df_temp.jsx';
import addLandingPageComponents from './function.jsx';
import adminApiService from '../../services/adminApiService';
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

// Constants and configurations (copied from portfolioedit.jsx)
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

// Date and time utilities
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

// Main component
const AdminFunnelEditor = () => {
  const navigate = useNavigate();
  const { funnelId, category, action, templateKey } = useParams();

  // Local state instead of Redux
  const [contentData, setContentData] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to extract admin ID from URL pattern
  const extractAdminIdFromUrl = () => {
    try {
      const currentPath = window.location.pathname;
      console.log('Current path for admin ID extraction:', currentPath);

      // Pattern: /admin/funnels/builder/{funnelId}/...
      const adminFunnelPattern = /\/admin\/funnels\/builder\/([^\/]+)/;
      const match = currentPath.match(adminFunnelPattern);

      if (match && match[1]) {
        const adminId = match[1];
        console.log('Extracted admin ID from URL:', adminId);
        return adminId;
      }

      console.log('No admin ID found in URL');
      return null;
    } catch (error) {
      console.error('Error extracting admin ID from URL:', error);
      return null;
    }
  };



  // All the state and functionality from the original component follows...
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
    const savedPreference = localStorage.getItem('adminFunnelEditorToolsPanelOpen');
    return savedPreference ? JSON.parse(savedPreference) : true;
  });
  const [toolsPanelSide, setToolsPanelSide] = useState(() => {
    if (typeof window === 'undefined') {
      return 'right';
    }
    return localStorage.getItem('adminFunnelEditorToolsPanelSide') || 'right';
  });
  const [showBuilderPanel, setShowBuilderPanel] = useState(false);
  const [activeBuilderCategory, setActiveBuilderCategory] = useState('sections');
  const [builderSearchTerm, setBuilderSearchTerm] = useState('');
  const [blockCategories, setBlockCategories] = useState([]);
  const [isBuilderDragging, setIsBuilderDragging] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Ref to prevent multiple editor initializations
  const editorInitializedRef = React.useRef(false);
  const editorContainerRef = React.useRef(null);
  const projectDataRef = React.useRef(null);

  // Handle save function
  const handleSave = async (mode = 'single') => {
    try {
      setIsSaving(true);

      // Get editor content
      const html = editorInstance?.getHtml() || '';
      const css = editorInstance?.getCss() || '';
      const js = editorInstance?.getJs() || '';

      const funnelData = {
        name: contentData?.funnelName || 'New Funnel',
        description: contentData?.description || '',
        category: category || 'admin',
        templateKey: templateKey || '',
        stages: stages.map(stage => ({
          ...stage,
          content: {
            html,
            css,
            js
          }
        }))
      };

      // Save using admin API service
      if (isNewFunnel) {
        // Create new funnel
        const response = await adminApiService.createFunnel(funnelData);
        if (response.success) {
          setSuccessMessage('Funnel created successfully!');
          // Navigate to edit mode
          navigate(`/funnels/builder/${response.data._id}/${category}/edit`);
        } else {
          throw new Error(response.message || 'Failed to create funnel');
        }
      } else {
        // Update existing funnel
        const response = await adminApiService.updateFunnel(funnelId, funnelData);
        if (response.success) {
          setSuccessMessage('Funnel updated successfully!');
        } else {
          throw new Error(response.message || 'Failed to update funnel');
        }
      }

      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error saving funnel:', error);
      setError(`Failed to save funnel: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

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

  // ... rest of the component logic would go here
  // This is a placeholder - the actual implementation would include all the methods
  // from the original portfolioedit.jsx but adapted for admin use

  // Handle different route scenarios
  const isNewFunnel = funnelId === 'new';
  const isTemplateBased = !!templateKey;

  // Load funnel data for existing funnels
  useEffect(() => {
    const loadFunnelData = async () => {
      if (isNewFunnel) {
        // For new funnels, set default data
        setContentData({
          funnelName: 'New Admin Funnel',
          description: 'Created via admin panel'
        });
        setStages([{
          id: 'stage-1',
          name: 'Landing Page',
          type: category === 'coach' ? 'welcome-page' : 'product-offer',
          content: {}
        }]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Load existing funnel data
        const response = await adminApiService.getFunnel(funnelId);
        if (response.success) {
          setContentData(response.data);
          setStages(response.data.stages || []);
        } else {
          throw new Error(response.message || 'Failed to load funnel');
        }
      } catch (error) {
        console.error('Error loading funnel:', error);
        setError(`Failed to load funnel: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (funnelId) {
      loadFunnelData();
    } else {
      navigate('/funnels');
    }
  }, [funnelId, isNewFunnel, category, navigate]);

  // Render the full funnel editor interface (this would include all the complex UI from portfolioedit.jsx)
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Adapted from portfolioedit.jsx */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/funnels')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FaArrowLeft className="h-4 w-4" />
              Back to Funnels
            </button>
            <div>
              <h1 className="text-xl font-semibold">
                {isNewFunnel ? 'Create New Funnel' : (contentData?.funnelName || 'Edit Funnel')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isTemplateBased ? `Using template: ${templateKey}` : (currentStage?.name || 'Funnel Editor')} - Admin Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FaMagic className="h-4 w-4 mr-2 inline" />
              Change Template
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4 mr-2 inline" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - This would include all the complex editor UI from portfolioedit.jsx */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Pages/Stages */}
        {showPagesSidebar && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Funnel Stages</h3>
            </div>
            <div className="flex-1 p-2">
              {stages?.map((stage, index) => (
                <div
                  key={stage._id || `stage-${index}`}
                  className={`p-3 rounded-lg cursor-pointer mb-2 ${
                    selectedPageId === stage._id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPageId(stage._id)}
                >
                  <h4 className="font-medium text-sm">{stage.name}</h4>
                  <p className="text-xs text-muted-foreground">{stage.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 relative">
          <div
            ref={editorContainerRef}
            className="w-full h-full"
            style={{ minHeight: 'calc(100vh - 80px)' }}
          />
        </div>

        {/* Right Sidebar - Tools */}
        {isToolsPanelOpen && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Builder Tools</h3>
            </div>
            <div className="flex-1 p-4">
              <p className="text-sm text-muted-foreground">
                Builder tools would be implemented here with all the components from portfolioedit.jsx
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isEditorLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Funnel Editor...</p>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Select a Template</h2>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground">
                Template selector would be implemented here with all templates from portfolioedit.jsx
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFunnelEditor;