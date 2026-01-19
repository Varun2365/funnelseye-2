import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getCoachId, getToken, isAuthenticated, debugAuthState } from '../../../utils/authUtils';
import { API_BASE_URL } from '../../../config/apiConfig';
import {
  setStages,
  setSelectedTemplateForStage,
  addStage,
  removeStage,
  saveFunnelToBackend,
  updateStageBasicInfo,
  fetchFunnelBySlug,
  resetState,
  updateProjectData,
  setFunnelData,
} from '../../../redux/funnel.jsx';
import { templates, templateCategories } from './df_temp.jsx';
import { organizedTemplates } from './temp.jsx';
import './style.css';

const FiTrash2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const FiEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const FiSave = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const FiExternalLink = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
const FiPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const FiChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const FiChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const FiChevronUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>;
const FiEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const FiCopy = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const FiCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const FiCreditCard = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const FiArrowLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const FiGripVertical = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>;
const FiMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const FiX = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// Professional Skeleton Loader Styles
const additionalStyles = `
/* Modern Professional Skeleton Loader */
.skeleton-wrapper {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.skeleton-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
  z-index: 0;
}

.skeleton-content {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 24px;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
}

.skeleton-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
}

.skeleton-header-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title {
  height: 36px;
  width: 320px;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.4) 0%, 
    rgba(226, 232, 240, 0.8) 20%, 
    rgba(255, 255, 255, 0.9) 40%, 
    rgba(226, 232, 240, 0.8) 60%, 
    rgba(226, 232, 240, 0.4) 100%);
  background-size: 300% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.skeleton-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shine 2.5s ease-in-out infinite;
}

.skeleton-subtitle {
  height: 20px;
  width: 240px;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.3) 0%, 
    rgba(226, 232, 240, 0.6) 50%, 
    rgba(226, 232, 240, 0.3) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite 0.2s;
  border-radius: 6px;
}

.skeleton-button {
  height: 44px;
  width: 140px;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%, 
    rgba(147, 51, 234, 0.1) 50%, 
    rgba(236, 72, 153, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite 0.4s;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
  overflow: hidden;
}

.skeleton-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2.5s ease-in-out infinite 0.4s;
}

.skeleton-layout {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 600px;
}

.skeleton-sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.skeleton-sidebar-title {
  height: 24px;
  width: 70%;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.4) 0%, 
    rgba(226, 232, 240, 0.8) 50%, 
    rgba(226, 232, 240, 0.4) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 6px;
  margin-bottom: 24px;
}

.skeleton-sidebar-item {
  height: 56px;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.3) 0%, 
    rgba(226, 232, 240, 0.6) 50%, 
    rgba(226, 232, 240, 0.3) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.skeleton-sidebar-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2.5s ease-in-out infinite;
}

.skeleton-sidebar-item:nth-child(2) { animation-delay: 0.1s; }
.skeleton-sidebar-item:nth-child(3) { animation-delay: 0.2s; }
.skeleton-sidebar-item:nth-child(4) { animation-delay: 0.3s; }
.skeleton-sidebar-item:nth-child(5) { animation-delay: 0.4s; }

.skeleton-add-button {
  height: 48px;
  width: 100%;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%, 
    rgba(147, 51, 234, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite 0.5s;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin-top: 20px;
}

.skeleton-main-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.skeleton-content-header {
  height: 32px;
  width: 50%;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.4) 0%, 
    rgba(226, 232, 240, 0.8) 50%, 
    rgba(226, 232, 240, 0.4) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 6px;
  margin-bottom: 24px;
}

.skeleton-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.skeleton-tab {
  height: 40px;
  width: 100px;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.3) 0%, 
    rgba(226, 232, 240, 0.6) 50%, 
    rgba(226, 232, 240, 0.3) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 8px;
}

.skeleton-tab:nth-child(2) { animation-delay: 0.1s; }
.skeleton-tab:nth-child(3) { animation-delay: 0.2s; }

.skeleton-form-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.skeleton-form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-form-label {
  height: 18px;
  width: 40%;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.3) 0%, 
    rgba(226, 232, 240, 0.6) 50%, 
    rgba(226, 232, 240, 0.3) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-form-input {
  height: 44px;
  width: 100%;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.2) 0%, 
    rgba(226, 232, 240, 0.5) 50%, 
    rgba(226, 232, 240, 0.2) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.skeleton-form-textarea {
  height: 88px;
  width: 100%;
  background: linear-gradient(90deg, 
    rgba(226, 232, 240, 0.2) 0%, 
    rgba(226, 232, 240, 0.5) 50%, 
    rgba(226, 232, 240, 0.2) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.skeleton-card {
  height: 120px;
  width: 100%;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.05) 0%, 
    rgba(147, 51, 234, 0.05) 50%, 
    rgba(236, 72, 153, 0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer-wave 2.5s ease-in-out infinite;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  margin: 24px 0;
  position: relative;
  overflow: hidden;
}

.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shine 2.5s ease-in-out infinite;
}

/* Professional Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes shimmer-wave {
  0% {
    background-position: 200% 0;
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    background-position: -200% 0;
    opacity: 0.8;
  }
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .skeleton-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  .skeleton-sidebar {
    width: 100%;
  }
  
  .skeleton-form-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .skeleton-title {
    width: 250px;
  }
  
  .skeleton-subtitle {
    width: 200px;
  }
}

/* Input styling based on content */
.styled-input, .styled-textarea, .styled-select {
  transition: color 0.2s ease;
  color: #000;
}

.styled-input:placeholder-shown, 
.styled-textarea:placeholder-shown,
.styled-select:placeholder-shown {
  color: #aaa !important;
}

.styled-input:not(:placeholder-shown), 
.styled-textarea:not(:placeholder-shown),
.styled-select:not(:placeholder-shown) {
  color: #000 !important;
}

input, textarea, select {
  transition: color 0.2s ease;
}

input:placeholder-shown, 
textarea:placeholder-shown,
select:placeholder-shown {
  color: #aaa !important;
}

input:not(:placeholder-shown), 
textarea:not(:placeholder-shown),
select:not(:placeholder-shown) {
  color: #000 !important;
}

.editor-mode-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  padding: 4px 10px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* Drag and Drop Styles */
.stage-item.dragging {
  opacity: 0.5;
  cursor: grabbing !important;
  transform: scale(0.98);
}

.stage-item.drag-over {
  border-top: 2px solid #3b82f6 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.stage-item[draggable="true"] {
  cursor: grab;
  user-select: none;
}

.stage-item[draggable="true"]:active {
  cursor: grabbing;
}

.stage-item:hover {
  background-color: rgba(247, 250, 252, 0.8);
}
`;

// Professional Main Skeleton Loader Component
const MainSkeletonLoader = () => {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-content">
        <div className="skeleton-header">
          <div className="skeleton-header-left">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
          <div className="skeleton-button"></div>
        </div>
        
        <div className="skeleton-layout">
          <div className="skeleton-sidebar">
            <div className="skeleton-sidebar-title"></div>
            <div className="skeleton-sidebar-item"></div>
            <div className="skeleton-sidebar-item"></div>
            <div className="skeleton-sidebar-item"></div>
            <div className="skeleton-sidebar-item"></div>
            <div className="skeleton-sidebar-item"></div>
            <div className="skeleton-add-button"></div>
          </div>
          
          <div className="skeleton-main-content">
            <div className="skeleton-content-header"></div>
            
            <div className="skeleton-tabs">
              <div className="skeleton-tab"></div>
              <div className="skeleton-tab"></div>
              <div className="skeleton-tab"></div>
            </div>
            
            <div className="skeleton-form-section">
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-input"></div>
              </div>
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-input"></div>
              </div>
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-textarea"></div>
              </div>
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-input"></div>
              </div>
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-input"></div>
              </div>
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-input"></div>
              </div>
            </div>
            
            <div className="skeleton-card"></div>
            
            <div className="skeleton-form-section">
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-textarea"></div>
              </div>
              <div className="skeleton-form-item">
                <div className="skeleton-form-label"></div>
                <div className="skeleton-form-textarea"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Preview Component with Auto-scroll
const TemplatePreview = ({ template, isHovered }) => {
  const previewRef = React.useRef(null);
  const scrollIntervalRef = React.useRef(null);

  React.useEffect(() => {
    if (isHovered && previewRef.current) {
      const container = previewRef.current;
      const totalHeight = container.scrollHeight;
      const visibleHeight = container.clientHeight;
      const maxScroll = totalHeight - visibleHeight;
      
      if (maxScroll <= 0) return;
      
      let currentScroll = 0;
      let direction = 1;
      let isAnimating = true;

      const animate = () => {
        if (!isAnimating || !previewRef.current) return;
        
        // Smooth scrolling
        const scrollSpeed = 1.5; // pixels per frame
        currentScroll += direction * scrollSpeed;
        
        if (currentScroll >= maxScroll) {
          currentScroll = maxScroll;
          direction = -1;
        } else if (currentScroll <= 0) {
          currentScroll = 0;
          direction = 1;
        }
        
        if (previewRef.current) {
          previewRef.current.scrollTop = currentScroll;
        }
        
        if (isAnimating) {
          scrollIntervalRef.current = requestAnimationFrame(animate);
        }
      };

      scrollIntervalRef.current = requestAnimationFrame(animate);
      
      return () => {
        isAnimating = false;
        if (scrollIntervalRef.current) {
          cancelAnimationFrame(scrollIntervalRef.current);
        }
      };
    } else {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      // Reset scroll position when not hovering
      if (previewRef.current) {
        previewRef.current.scrollTop = 0;
      }
    }
  }, [isHovered]);

  // Create a preview structure from template HTML or thumbnail
  const createPreviewContent = () => {
    // First, try to use thumbnail image if available - create scrollable preview with image
    if (template && template.thumbnail) {
      // Create multiple sections using the thumbnail image for scrollable preview
      return Array.from({ length: 6 }, (_, index) => {
        const heights = [140, 130, 150, 135, 145, 140];
        return (
          <div
            key={index}
            style={{
              minHeight: `${heights[index]}px`,
              backgroundImage: `url(${template.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {/* Overlay for better text visibility */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(102, 126, 234, ${0.3 + index * 0.1}) 0%, rgba(118, 75, 162, ${0.3 + index * 0.1}) 100%)`
            }} />
            <div style={{ 
              position: 'relative', 
              zIndex: 1, 
              color: 'white', 
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Section {index + 1}
              </div>
            </div>
          </div>
        );
      });
    }
    
    // If no thumbnail, try to extract sections from HTML
    if (!template || !template.html) return null;
    
    // Extract sections from HTML to create scrollable preview
    const parser = new DOMParser();
    const doc = parser.parseFromString(template.html, 'text/html');
    const sections = doc.querySelectorAll('section, div[class*="section"], div[class*="hero"], div[class*="header"], div[class*="footer"]');
    
    if (sections.length === 0) {
      // If no sections found, create a simple preview
      return (
        <div style={{ padding: '20px', minHeight: '300px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ color: 'white', textAlign: 'center' }}>
            <h3 style={{ margin: '20px 0' }}>Template Preview</h3>
            <p>{template.name}</p>
          </div>
        </div>
      );
    }

    return Array.from(sections).slice(0, 5).map((section, index) => {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
      const height = 100 + (index % 3) * 30;
      return (
        <div
          key={index}
          style={{
            minHeight: `${height}px`,
            background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              {section.tagName.toLowerCase()} Section
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {template.name} - Part {index + 1}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      ref={previewRef}
      style={{
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        position: 'relative',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        cursor: 'default'
      }}
    >
      {createPreviewContent() || (
        <div style={{ 
          padding: '20px', 
          minHeight: '180px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Template Preview</h4>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Hover to see auto-scroll</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Template Preview Modal Component
const TemplatePreviewModal = ({ template, onClose }) => {
  const previewRef = React.useRef(null);
  const scrollIntervalRef = React.useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  React.useEffect(() => {
    if (isAutoScrolling && previewRef.current) {
      const container = previewRef.current;
      const totalHeight = container.scrollHeight;
      const visibleHeight = container.clientHeight;
      const maxScroll = totalHeight - visibleHeight;
      
      if (maxScroll <= 0) return;
      
      let currentScroll = 0;
      let direction = 1;
      let isAnimating = true;

      const animate = () => {
        if (!isAnimating || !previewRef.current) return;
        
        const scrollSpeed = 1.5;
        currentScroll += direction * scrollSpeed;
        
        if (currentScroll >= maxScroll) {
          currentScroll = maxScroll;
          direction = -1;
        } else if (currentScroll <= 0) {
          currentScroll = 0;
          direction = 1;
        }
        
        if (previewRef.current) {
          previewRef.current.scrollTop = currentScroll;
        }
        
        if (isAnimating) {
          scrollIntervalRef.current = requestAnimationFrame(animate);
        }
      };

      scrollIntervalRef.current = requestAnimationFrame(animate);
      
      return () => {
        isAnimating = false;
        if (scrollIntervalRef.current) {
          cancelAnimationFrame(scrollIntervalRef.current);
        }
      };
    }
  }, [isAutoScrolling]);

  const createPreviewContent = () => {
    if (template && template.thumbnail) {
      return Array.from({ length: 8 }, (_, index) => {
        const heights = [200, 180, 220, 190, 210, 195, 205, 200];
        return (
          <div
            key={index}
            style={{
              minHeight: `${heights[index]}px`,
              backgroundImage: `url(${template.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(102, 126, 234, ${0.3 + index * 0.1}) 0%, rgba(118, 75, 162, ${0.3 + index * 0.1}) 100%)`
            }} />
            <div style={{ 
              position: 'relative', 
              zIndex: 1, 
              color: 'white', 
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Section {index + 1}
              </div>
            </div>
          </div>
        );
      });
    }
    
    if (!template || !template.html) return null;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(template.html, 'text/html');
    const sections = doc.querySelectorAll('section, div[class*="section"], div[class*="hero"], div[class*="header"], div[class*="footer"]');
    
    if (sections.length === 0) {
      return (
        <div style={{ padding: '40px', minHeight: '400px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ color: 'white', textAlign: 'center' }}>
            <h3 style={{ margin: '20px 0' }}>Template Preview</h3>
            <p>{template.name}</p>
          </div>
        </div>
      );
    }

    return Array.from(sections).slice(0, 8).map((section, index) => {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
      const height = 150 + (index % 3) * 40;
      return (
        <div
          key={index}
          style={{
            minHeight: `${height}px`,
            background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: '30px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '8px' }}>
              {section.tagName.toLowerCase()} Section
            </div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>
              {template.name} - Part {index + 1}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90vw',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ 
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1a202c' 
            }}>
              {template?.name || 'Template Preview'}
            </h3>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '12px', 
              color: '#6b7280' 
            }}>
              Live Template Preview
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                background: isAutoScrolling ? '#10b981' : '#f3f4f6',
                color: isAutoScrolling ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isAutoScrolling) {
                  e.target.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAutoScrolling) {
                  e.target.backgroundColor = '#f3f4f6';
                }
              }}
            >
              {isAutoScrolling ? 'Pause Scroll' : 'Auto Scroll'}
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.backgroundColor = '#f3f4f6';
                e.target.color = '#1a202c';
              }}
              onMouseLeave={(e) => {
                e.target.backgroundColor = 'transparent';
                e.target.color = '#6b7280';
              }}
            >
              &times;
            </button>
          </div>
        </div>
        <div style={{
          flex: 1,
          overflow: 'hidden',
          background: '#f9fafb',
          borderRadius: '0 0 12px 12px'
        }}>
          <div
            ref={previewRef}
            style={{
              width: '100%',
              height: '70vh',
              overflow: 'auto',
              position: 'relative',
              background: '#f9fafb'
            }}
          >
            {createPreviewContent() || (
              <div style={{ 
                padding: '40px', 
                minHeight: '400px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Template Preview</h4>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Preview not available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Selection Modal Component
const TemplateSelectionModal = ({ stageType, selectedKey, onClose, onSelect, onStartFromScratch }) => {
  const [viewMode, setViewMode] = useState('options'); // 'options', 'customer-coach-selection', or 'templates'
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [templateCategory, setTemplateCategory] = useState(null); // 'customer' or 'coach'
  const [previewTemplate, setPreviewTemplate] = useState(null); // Template to preview in modal
  
  // Get base template set
  const baseTemplateSet = { 
    'welcome-page': templates.welcomeTemplates, 
    'vsl-page': templates.vslTemplates, 
    'thankyou-page': templates.thankyouTemplates, 
    'whatsapp-page': templates.whatsappTemplates, 
    'product-offer': templates.productOfferTemplates, 
    'custom-page': templates.miscTemplates, 
    'appointment-page': templates.appointmentTemplates, 
    'payment-page': templates.paymentTemplates 
  }[stageType];

  // Get organized templates based on category (customer or coach)
  const getOrganizedTemplateSet = () => {
    if (!templateCategory || !organizedTemplates[templateCategory]) {
      return baseTemplateSet;
    }
    
    // For welcome-page, use organized templates
    if (stageType === 'welcome-page' && organizedTemplates[templateCategory].welcomeTemplates) {
      return organizedTemplates[templateCategory].welcomeTemplates;
    }
    
    // For other stage types, use base template set
    return baseTemplateSet;
  };

  const templateSet = getOrganizedTemplateSet();

  const currentTemplate = selectedKey && templateSet && selectedKey !== 'blank-template' ? templateSet[selectedKey] : null;
  const isBlankTemplate = selectedKey === 'blank-template';

  const handleTemplateSelect = (templateKey) => {
    // Pass templateKey and category to onSelect
    onSelect(templateKey, templateCategory);
    onClose();
  };

  const handleStartFromScratch = () => {
    onStartFromScratch();
    onClose();
  };

  const handleCategorySelect = (category) => {
    setTemplateCategory(category);
    setViewMode('templates');
  };

  // Check if we need to show customer/coach selection for welcome-page
  const needsCategorySelection = stageType === 'welcome-page' && viewMode === 'templates' && !templateCategory;

  if (!templateSet || Object.keys(templateSet).length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content template-selection-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Template Selection</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <p>This stage is managed by system settings and does not have a selectable design here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90vw',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {(viewMode === 'templates' || viewMode === 'customer-coach-selection') && (
              <button 
                onClick={() => {
                  if (viewMode === 'customer-coach-selection') {
                    setViewMode('options');
                  } else if (templateCategory) {
                    setTemplateCategory(null);
                    setViewMode('customer-coach-selection');
                  } else {
                    setViewMode('options');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#4b5563',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.target.backgroundColor = 'transparent';
                }}
              >
                <FiChevronRight style={{ transform: 'rotate(180deg)', width: '20px', height: '20px' }} />
              </button>
            )}
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              {viewMode === 'options' ? 'Select Template' : 
               viewMode === 'customer-coach-selection' ? 'Choose Category' : 
               'Choose a Template'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.backgroundColor = '#f3f4f6';
              e.target.color = '#1a202c';
            }}
            onMouseLeave={(e) => {
              e.target.backgroundColor = 'transparent';
              e.target.color = '#6b7280';
            }}
          >
            &times;
          </button>
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {viewMode === 'customer-coach-selection' ? (
            <div className="template-options-grid">
              <div style={{ 
                width: '100%', 
                textAlign: 'center', 
                marginBottom: '24px',
                padding: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '12px',
                  color: '#2d3748'
                }}>
                  Select Template Category
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#718096',
                  marginBottom: '32px'
                }}>
                  Choose whether you want Customer templates or Coach templates
                </p>
              </div>
              
              {/* Customer Option */}
              <div 
                className="template-option-card" 
                onClick={() => handleCategorySelect('customer')}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="template-option-icon" style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="template-option-content">
                  <h4>Customer Templates</h4>
                  <p>Browse templates designed for customer-facing pages and landing pages.</p>
                </div>
                <div className="template-option-arrow">
                  <FiChevronRight />
                </div>
              </div>

              {/* Coach Option */}
              <div 
                className="template-option-card" 
                onClick={() => handleCategorySelect('coach')}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="template-option-icon" style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="template-option-content">
                  <h4>Coach Templates</h4>
                  <p>Browse templates designed for coach business pages and professional coaching funnels.</p>
                </div>
                <div className="template-option-arrow">
                  <FiChevronRight />
                </div>
              </div>
            </div>
          ) : viewMode === 'options' ? (
            <div className="template-options-grid">
              {/* Option 1: Start from Scratch */}
              <div 
                className="template-option-card" 
                onClick={handleStartFromScratch}
              >
                <div className="template-option-icon" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                </div>
                <div className="template-option-content">
                  <h4>Start from Scratch</h4>
                  <p>Begin with a blank canvas and build your page from the ground up with complete creative freedom.</p>
                </div>
                <div className="template-option-arrow">
                  <FiChevronRight />
                </div>
              </div>

              {/* Option 2: Current Template */}
              {currentTemplate || isBlankTemplate ? (
                <div 
                  className="template-option-card current-template" 
                  onClick={() => {
                    if (currentTemplate) {
                      handleTemplateSelect(selectedKey);
                    } else {
                      handleStartFromScratch();
                    }
                  }}
                >
                  {currentTemplate ? (
                    <>
                      <div className="template-option-image">
                        <img 
                          src={currentTemplate.thumbnail} 
                          alt={currentTemplate.name}
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src='https://placehold.co/200x150/10b981/ffffff?text=Template'; 
                          }}
                        />
                        <div className="image-overlay">
                          <span className="current-badge">Active</span>
                        </div>
                      </div>
                      <div className="template-option-content">
                        <h4>Current Template</h4>
                        <p>{currentTemplate.name}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {currentTemplate.description}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="template-option-icon" style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M2 12h20"/>
                        </svg>
                      </div>
                      <div className="template-option-content">
                        <h4>Current Template</h4>
                        <p>Blank Template (Start from Scratch)</p>
                        <span className="current-badge">Active</span>
                      </div>
                    </>
                  )}
                  <div className="template-option-arrow">
                    <FiChevronRight />
                  </div>
                </div>
              ) : (
                <div className="template-option-card disabled">
                  <div className="template-option-icon" style={{ 
                    background: '#e5e7eb',
                    color: '#9ca3af'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <div className="template-option-content">
                    <h4>Current Template</h4>
                    <p>No template selected yet</p>
                  </div>
                </div>
              )}

              {/* Option 3: Choose Template */}
              <div 
                className="template-option-card" 
                onClick={() => {
                  // For welcome-page, show customer/coach selection first
                  if (stageType === 'welcome-page') {
                    setViewMode('customer-coach-selection');
                  } else {
                    setViewMode('templates');
                  }
                }}
              >
                <div className="template-option-icon" style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M9 9h6v6H9z"/>
                  </svg>
                </div>
                <div className="template-option-content">
                  <h4>Choose Template</h4>
                  <p>Browse and select from our collection of professionally designed templates.</p>
                </div>
                <div className="template-option-arrow">
                  <FiChevronRight />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ 
                marginBottom: '24px', 
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Select a template to use as the starting point for your page design.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {Object.keys(templateSet).map((templateKey) => {
                  const template = templateSet[templateKey];
                  const isSelected = selectedKey === templateKey;
                  const isHovered = hoveredTemplate === templateKey;
                  return (
                    <div 
                      key={templateKey} 
                      onClick={() => handleTemplateSelect(templateKey)}
                      onMouseEnter={(e) => {
                        setHoveredTemplate(templateKey);
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        setHoveredTemplate(null);
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                      style={{ 
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{ 
                        position: 'relative', 
                        overflow: 'hidden',
                        aspectRatio: '1',
                        backgroundColor: '#f3f4f6'
                      }}>
                        {isHovered ? (
                          <TemplatePreview template={template} isHovered={isHovered} />
                        ) : (
                          <>
                            <img 
                              src={template.thumbnail} 
                              alt={template.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src='https://placehold.co/200x200/ccc/ffffff?text=Template'; 
                              }} 
                            />
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: '#3b82f6',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                zIndex: 10
                              }}>
                                Selected
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplate(template);
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#3b82f6',
                                zIndex: 15,
                                transition: 'all 0.2s',
                                width: '28px',
                                height: '28px',
                                opacity: isHovered ? 1 : 0.8
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.opacity = '1';
                                e.target.style.background = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.opacity = '0.8';
                                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                              }}
                              title="View Template Preview"
                            >
                              <FiEye style={{ width: '16px', height: '16px' }} />
                            </button>
                          </>
                        )}
                      </div>
                      <div style={{
                        padding: '12px',
                        backgroundColor: 'white'
                      }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1a202c'
                        }}>{template.name}</h4>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>{template.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
};

// Template Grid Component (for Choose Template option)
const StageTemplateSelector = ({ stageType, selectedKey, onSelect }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  
  const templateSet = { 
    'welcome-page': templates.welcomeTemplates, 
    'vsl-page': templates.vslTemplates, 
    'thankyou-page': templates.thankyouTemplates, 
    'whatsapp-page': templates.whatsappTemplates, 
    'product-offer': templates.productOfferTemplates, 
    'custom-page': templates.miscTemplates, 
    'appointment-page': templates.appointmentTemplates, 
    'payment-page': templates.paymentTemplates 
  }[stageType];

  if (!templateSet || Object.keys(templateSet).length === 0) {
    return (
      <div className="content-section animate-fadeIn">
        <p>This stage is managed by system settings and does not have a selectable design here.</p>
      </div>
    );
  }

  return (
    <div className="content-section animate-fadeIn">
      <h3 className="section-title">Select a Design</h3>
      <p className="field-note" style={{ marginBottom: '20px' }}>
        Choose a starting point for your page. This will be the initial design in the editor.
      </p>
      <div className="template-grid">
        {Object.keys(templateSet).map((templateKey) => {
          const template = templateSet[templateKey];
          const isSelected = selectedKey === templateKey;
          const isHovered = hoveredTemplate === templateKey;
          return (
            <div 
              key={templateKey} 
              className={`template-card ${isSelected ? 'selected' : ''}`} 
              onClick={() => onSelect(templateKey)}
              onMouseEnter={() => setHoveredTemplate(templateKey)}
              onMouseLeave={() => setHoveredTemplate(null)}
              style={{ position: 'relative' }}
            >
              <div className="template-thumbnail" style={{ position: 'relative', overflow: 'hidden' }}>
                {isHovered ? (
                  <TemplatePreview template={template} isHovered={isHovered} />
                ) : (
                  <img 
                    src={template.thumbnail} 
                    alt={template.name} 
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src='https://placehold.co/400x300/ccc/ffffff?text=Error'; 
                    }} 
                  />
                )}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    zIndex: 10
                  }}>
                    Hover to preview
                  </div>
                )}
              </div>
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BasicInfoForm = ({ stage, stageConfig, onUpdate }) => {
  const [expanded, setExpanded] = useState(true);
  const authState = useSelector(state => state.auth);
  const token = getToken(authState);
  const coachID = getCoachId(authState);
  
  // Get the project page data to access the actual slug and keywords
  const projectPage = useSelector(state => 
    state.funnel.contentData.projectData?.pages?.find(p => p.id === stage.id)
  );
  
  const [formData, setFormData] = useState({
    name: stageConfig?.name || stage.name || '',
    slug: projectPage?.basicInfo?.slug || stageConfig?.basicInfo?.slug || '',
    title: projectPage?.basicInfo?.title || stageConfig?.basicInfo?.title || '',
    description: projectPage?.basicInfo?.description || stageConfig?.basicInfo?.description || '',
    keywords: projectPage?.basicInfo?.keywords || stageConfig?.basicInfo?.keywords || '',
    favicon: projectPage?.basicInfo?.favicon || stageConfig?.basicInfo?.favicon || null,
    socialImage: projectPage?.basicInfo?.socialImage || stageConfig?.basicInfo?.socialImage || null,
    socialTitle: projectPage?.basicInfo?.socialTitle || stageConfig?.basicInfo?.socialTitle || '',
    socialDescription: projectPage?.basicInfo?.socialDescription || stageConfig?.basicInfo?.socialDescription || '',
    customHtmlHead: projectPage?.basicInfo?.customHtmlHead || stageConfig?.basicInfo?.customHtmlHead || '',
    customHtmlBody: projectPage?.basicInfo?.customHtmlBody || stageConfig?.basicInfo?.customHtmlBody || ''
  });

  // Update form data when project page data changes
  useEffect(() => {
    if (projectPage?.basicInfo) {
      setFormData(prev => ({
        ...prev,
        slug: projectPage.basicInfo.slug || prev.slug,
        title: projectPage.basicInfo.title || prev.title,
        description: projectPage.basicInfo.description || prev.description,
        keywords: projectPage.basicInfo.keywords || prev.keywords,
        favicon: projectPage.basicInfo.favicon || prev.favicon,
        socialImage: projectPage.basicInfo.socialImage || prev.socialImage,
        socialTitle: projectPage.basicInfo.socialTitle || prev.socialTitle,
        socialDescription: projectPage.basicInfo.socialDescription || prev.socialDescription,
        customHtmlHead: projectPage.basicInfo.customHtmlHead || prev.customHtmlHead,
        customHtmlBody: projectPage.basicInfo.customHtmlBody || prev.customHtmlBody
      }));
    }
  }, [projectPage?.basicInfo]);

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    onUpdate(stage.id, key, value);
  };

  const handleFileChange = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('assets', file); // Assuming backend handles single file as well

    try {
      const response = await fetch(`${API_BASE_URL}/api/assets?coachId=${coachID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();
      const uploadedUrl = result.data[0]?.src; // Assuming backend returns array with src

      if (uploadedUrl) {
        handleChange(key, uploadedUrl); // Set URL in state
      } else {
        alert('Upload successful, but no URL returned');
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: expanded ? '20px' : '0',
          paddingBottom: expanded ? '16px' : '0',
          borderBottom: expanded ? '1px solid #e2e8f0' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#1a202c'
        }}>
          Basic Details
        </h3>
        <span style={{
          color: '#718096',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          <FiChevronDown />
        </span>
      </div>
      
      {expanded && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Basic Information Section */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Basic Information
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Page Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter page name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="url-friendly-name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '12px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>URL-friendly version (e.g., my-awesome-page)</p>
              </div>
            </div>
          </div>

          {/* SEO Settings Section */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              SEO Settings
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Page Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Page title for browser tab"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Keywords</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  placeholder="Comma-separated keywords"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Meta Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Short summary of page content for SEO"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Assets & Media Section */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Assets & Media
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Favicon</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    id={`favicon-upload-${stage.id}`}
                    type="file"
                    onChange={(e) => handleFileChange('favicon', e)}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor={`favicon-upload-${stage.id}`}
                    style={{
                      padding: '11px 18px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-block',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.borderColor = '#cbd5e0';
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Select Image
                  </label>
                  {formData.favicon && (
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>{typeof formData.favicon === 'string' ? formData.favicon : 'Selected'}</span>
                  )}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Social Share Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    id={`social-image-upload-${stage.id}`}
                    type="file"
                    onChange={(e) => handleFileChange('socialImage', e)}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor={`social-image-upload-${stage.id}`}
                    style={{
                      padding: '11px 18px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-block',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.borderColor = '#cbd5e0';
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Select Image
                  </label>
                  {formData.socialImage && (
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>{typeof formData.socialImage === 'string' ? formData.socialImage : 'Selected'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Settings Section */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Social Media Settings
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Social Title</label>
                <input
                  type="text"
                  value={formData.socialTitle}
                  onChange={(e) => handleChange('socialTitle', e.target.value)}
                  placeholder="Title for social sharing"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Social Description</label>
                <textarea
                  value={formData.socialDescription}
                  onChange={(e) => handleChange('socialDescription', e.target.value)}
                  placeholder="Description for social sharing"
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Custom HTML Section */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Custom HTML
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Custom HTML Head</label>
                <textarea
                  value={formData.customHtmlHead}
                  onChange={(e) => handleChange('customHtmlHead', e.target.value)}
                  placeholder="<meta>, <link>, <style>, <script> tags"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '12px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>Add custom HTML to be included in the &lt;head&gt; section.</p>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#4b5563',
                  marginBottom: '10px'
                }}>Custom HTML Body</label>
                <textarea
                  value={formData.customHtmlBody}
                  onChange={(e) => handleChange('customHtmlBody', e.target.value)}
                  placeholder="Tracking codes, scripts"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.borderColor = '#3b82f6';
                    e.target.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.borderColor = '#d1d5db';
                    e.target.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '12px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>Add custom HTML to be included just before the closing &lt;/body&gt; tag.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentSettings = ({ settings, onUpdate }) => {
  return (
    <div className="content-section animate-fadeIn">
      <h3 className="section-title">Payment Settings</h3>
      <div className="form-field">
        <label>Default Currency</label>
        <select
          className="styled-select"
          value={settings.currency}
          onChange={(e) => onUpdate('currency', e.target.value)}
        >
          <option value="INR">Indian Rupee (INR)</option>
          <option value="USD">US Dollar (USD)</option>
        </select>
      </div>
      
      <div className="payment-gateway-card">
        <div className="gateway-header">
          <h4>Razorpay</h4>
          <span className={`status-badge ${settings.gateways.razorpay.connected ? 'connected' : ''}`}>
            {settings.gateways.razorpay.connected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        <div className="form-field">
          <label>Razorpay Key ID</label>
          <input
            type="text"
            className="styled-input"
            value={settings.gateways.razorpay.keyId}
            onChange={(e) => onUpdate('gateways.razorpay.keyId', e.target.value)}
            placeholder="rzp_live_..."
          />
        </div>
        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.gateways.razorpay.connected}
              onChange={(e) => onUpdate('gateways.razorpay.connected', e.target.checked)}
            />
            <span>Connect Razorpay</span>
          </label>
        </div>
      </div>
    </div>
  );
};

const StageTypeModal = ({ onClose, onAddStage }) => {
  const [stageType, setStageType] = useState('');
  const [customName, setCustomName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const defaultStages = [
    { type: 'welcome-page', name: 'Welcome Page', icon: <FiEdit /> },
    { type: 'vsl-page', name: 'Video Sales Letter', icon: <FiEdit /> },
    { type: 'product-offer', name: 'Product Offer', icon: <FiEdit /> },
    { type: 'thankyou-page', name: 'Thank You Page', icon: <FiEdit /> },
    { type: 'whatsapp-page', name: 'WhatsApp Community', icon: <FiEdit /> },
    { type: 'appointment-page', name: 'Appointment', icon: <FiCalendar /> },
    { type: 'payment-page', name: 'Payment', icon: <FiCreditCard /> },
    { type: 'custom-page', name: 'Custom Page', icon: <FiPlus /> }
  ];

  const handleStageSelect = (type, name) => {
    if (type === 'custom-page') {
      setStageType(type);
      setShowNameInput(true);
    } else {
      onAddStage(type, name);
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stageType === 'custom-page' && !customName.trim()) {
      alert('Please enter a name for your custom stage');
      return;
    }
    onAddStage(stageType, customName || defaultStages.find(s => s.type === stageType)?.name);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Stage</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {!showNameInput ? (
            <>
              <h4>Select Stage Type</h4>
              <div className="stage-type-grid">
                {defaultStages.map(stage => (
                  <div 
                    key={stage.type} 
                    className="stage-option-card" 
                    onClick={() => handleStageSelect(stage.type, stage.name)}
                  >
                    <div className="stage-option-icon">{stage.icon}</div>
                    <div className="stage-option-card-content">
                      <h4>{stage.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <> 
              <form onSubmit={handleSubmit}>
                <h4>Enter Custom Stage Name</h4>
                <div className="form-field">
                  <input
                    type="text"
                    className="styled-input"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., My Awesome Page"
                    autoFocus
                  />
                </div>
                <br />
                <div className="modal-footer" style={{margin:'-30px'}}>
                  <button type="button" className="button-dark" onClick={() => setShowNameInput(false)}>
                    Back
                  </button>
                  <button type="submit" className="button-primary">
                    Add Stage
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FunnelEditorIndex = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();

  const { contentData, stages, apiStatus, error, funnelId } = useSelector((state) => state.funnel);
  const authState = useSelector(state => state.auth);
  const [activeStageId, setActiveStageId] = useState('');
  const [showStageModal, setShowStageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Template');
  const [pageUrl, setPageUrl] = useState('');
  const [funnelUrl, setFunnelUrl] = useState('');
  const selectFunnelName = (state) => state.funnel.contentData.name;
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewHovered, setPreviewHovered] = useState(false);
  const [showTemplatePreviewModal, setShowTemplatePreviewModal] = useState(false);

  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef(null);
  const tabRefs = useRef({});
  const [draggedStageId, setDraggedStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [isFunnelActive, setIsFunnelActive] = useState(contentData?.isActive ?? true);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  // Update funnel active state when contentData changes
  useEffect(() => {
    if (contentData?.isActive !== undefined) {
      setIsFunnelActive(contentData.isActive);
    }
  }, [contentData?.isActive]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      dispatch(fetchFunnelBySlug(slug))
        .finally(() => {
          setTimeout(() => {
            setIsLoading(false);
          }, 800); // Add slight delay for smoother transition
        });
    } else {
      dispatch(resetState());
    }
    setActiveStageId('');
  }, [slug, dispatch]);

  useEffect(() => {
    if (apiStatus !== 'loading' && stages && stages.length > 0 && !activeStageId) {
      setActiveStageId(stages[0].id);
    }
  }, [stages, apiStatus, activeStageId]);

  const activeStage = stages.find(s => s.id === activeStageId);

  // Load page URL when active stage changes
  useEffect(() => {
    const loadPageUrl = async () => {
      if (activeStage?.id) {
        const url = await getPageUrl(activeStage.id);
        setPageUrl(url || '');
      } else {
        setPageUrl('');
      }
    };
    loadPageUrl();
  }, [activeStage?.id]);

  // Load funnel preview URL
  useEffect(() => {
    const loadFunnelUrl = async () => {
      const url = await getFunnelPreviewUrl();
      setFunnelUrl(url || '');
    };
    if (slug && contentData?.name) {
      loadFunnelUrl();
    }
  }, [slug, contentData?.name]);

  const TABS = ['Template', 'Basic'];
  if (activeStage && ['appointment-page', 'payment-page'].includes(activeStage.type)) {
    TABS.push('Settings');
  }

  useEffect(() => {
    const activeTabNode = tabRefs.current[activeTab];
    if (activeTabNode) {
      setIndicatorStyle({
        left: activeTabNode.offsetLeft,
        width: activeTabNode.offsetWidth,
      });
    }
  }, [activeTab, activeStageId, TABS.length]);

  const handleBuildPage = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) { 
      alert("Stage not found"); 
      return; 
    }
    const isCustom = stage.type === 'custom-page';
    const config = isCustom ? contentData.customStagesConfig[stageId] : contentData.stagesConfig[stage.type];
    if (!config?.selectedTemplateKey && ['welcome-page', 'vsl-page', 'thankyou-page', 'whatsapp-page', 'product-offer', 'custom-page', 'appointment-page', 'payment-page'].includes(stage.type)) {
      alert("Please select a template first."); 
      return;
    }
    window.open(`/funnel_edit/${slug}/${stageId}`);
  };

  const handlePreviewFunnel = async (specificPageId = null) => {
    try {
      const coachID = getCoachId(authState);
      const token = getToken(authState);
      
      if (!slug || !coachID || !token) {
        alert('Unable to preview funnel. Please ensure the funnel is saved first.');
        return;
      }

      // Fetch funnel to get funnelUrl and indexPageId
      const response = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        alert('Failed to load funnel details for preview.');
        return;
      }

      const { data: funnel } = await response.json();
      
      if (!funnel.funnelUrl || !funnel.stages || funnel.stages.length === 0) {
        alert('Funnel URL not available. Please publish the funnel first.');
        return;
      }

      // Use specificPageId if provided, otherwise use indexPageId or first stage's pageId
      let pageId = specificPageId;
      if (!pageId) {
        pageId = funnel.indexPageId || funnel.stages[0]?.pageId;
      }
      
      if (!pageId) {
        alert('No pages available in this funnel. Please add a stage first.');
        return;
      }

      const previewUrl = `${API_BASE_URL}/funnels/${funnel.funnelUrl}/${pageId}`;
      window.open(previewUrl, '_blank');
    } catch (err) {
      console.error('Error previewing funnel:', err);
      alert('Failed to open preview. Please try again.');
    }
  };

  const getPageUrl = async (stageId) => {
    try {
      const coachID = getCoachId(authState);
      const token = getToken(authState);
      
      if (!slug || !coachID || !token) {
        return null;
      }

      // Fetch funnel to get funnelUrl
      const response = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        return null;
      }

      const { data: funnel } = await response.json();
      
      if (!funnel.funnelUrl || !funnel.stages || funnel.stages.length === 0) {
        return null;
      }

      // Find the stage in the backend data to get its pageId
      const backendStage = funnel.stages?.find(s => 
        (s.pageId === stageId) || (s._id === stageId) || 
        (stages.find(st => st.id === stageId) && s.pageId === stages.find(st => st.id === stageId).id)
      );

      // If not found in backend, try to use stageId directly
      const pageId = backendStage?.pageId || stageId;
      
      if (!pageId) {
        return null;
      }

      const previewUrl = `${API_BASE_URL}/funnels/${funnel.funnelUrl}/${pageId}`;
      return previewUrl;
    } catch (err) {
      console.error('Error getting page URL:', err);
      return null;
    }
  };

  const handlePreviewStage = async (stageId) => {
    const previewUrl = await getPageUrl(stageId);
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    } else {
      alert('Unable to preview page. Please ensure the funnel is saved and published first.');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy URL');
    }
  };

  const getFunnelPreviewUrl = async () => {
    try {
      const coachID = getCoachId(authState);
      const token = getToken(authState);
      
      if (!slug || !coachID || !token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        return null;
      }

      const { data: funnel } = await response.json();
      
      if (!funnel.funnelUrl) {
        return null;
      }

      const pageId = funnel.indexPageId || (funnel.stages && funnel.stages.length > 0 ? funnel.stages[0].pageId : null);
      
      if (!pageId) {
        return null;
      }

      return `${API_BASE_URL}/funnels/${funnel.funnelUrl}/${pageId}`;
    } catch (err) {
      console.error('Error getting funnel URL:', err);
      return null;
    }
  };

  const handlePublish = () => {
    const funnelName = contentData.name || `Funnel: ${slug}`; 
    dispatch(saveFunnelToBackend({ funnelName }))
    .then((result) => {
      if (saveFunnelToBackend.fulfilled.match(result)) {
        alert("Funnel published successfully!");
        const newId = result.payload.data._id;
        if (slug !== newId) {
          navigate(`/funnel_settings/${newId}`);
        }
      } else if (saveFunnelToBackend.rejected.match(result)) {
        alert(`Failed to publish funnel: ${result.error.message}`);
      }
    });
  };
  const handleAddStage = (type, name) => {
    if (type !== 'custom-page' && stages.some(s => s.type === type)) {
      alert(`A ${name} stage already exists in this funnel.`); 
      return;
    }
    const id = type === 'custom-page' ? `custom_${Date.now()}` : type;
    dispatch(addStage({ id, name, type, fixed: false }));
    setActiveStageId(id);
    setActiveTab('Template');
  };

  const handleRemoveStage = (stageId) => {
    if (window.confirm(`Are you sure you want to delete this stage?`)) {
      const currentIndex = stages.findIndex(s => s.id === stageId);
      dispatch(removeStage(stageId));
      if (activeStageId === stageId) {
        const remainingStages = stages.filter(s => s.id !== stageId);
        const nextStageIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        setActiveStageId(remainingStages[nextStageIndex]?.id || '');
      }
    }
  };

  const handleDuplicateStage = async (stageId) => {
    const stageToDuplicate = stages.find(s => s.id === stageId);
    if (!stageToDuplicate) {
      alert('Stage not found');
      return;
    }

    try {
      const coachID = getCoachId(authState);
      const token = getToken(authState);
      
      if (!coachID || !token || !slug) {
        alert('Authentication data not available. Please log in again.');
        return;
      }

      // Fetch current funnel to get full stage data
      const fetchRes = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!fetchRes.ok) {
        alert('Failed to fetch funnel data');
        return;
      }

      const { data: fullFunnel } = await fetchRes.json();
      const backendStage = fullFunnel.stages?.find(s => 
        (s.pageId === stageId) || (s.pageId === stageToDuplicate.pageId) || (s._id === stageId)
      );

      if (!backendStage) {
        alert('Stage data not found in backend');
        return;
      }

      // Create new stage ID
      const newStageId = stageToDuplicate.type === 'custom-page' 
        ? `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        : `${stageToDuplicate.type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const newPageId = `${backendStage.pageId || stageId}_copy_${Date.now()}`;
      const newStageName = `${stageToDuplicate.name} (Copy)`;

      // Get stage config
      const isCustom = stageToDuplicate.type === 'custom-page';
      const stageConfig = isCustom 
        ? contentData.customStagesConfig[stageId] 
        : contentData.stagesConfig[stageToDuplicate.type];

      // Create new stage object
      const newStage = {
        id: newStageId,
        name: newStageName,
        type: stageToDuplicate.type,
        fixed: false
      };

      // Add stage to Redux
      const currentIndex = stages.findIndex(s => s.id === stageId);
      const newStages = [...stages];
      newStages.splice(currentIndex + 1, 0, newStage);
      dispatch(setStages(newStages));

      // Update project data with duplicated content
      const projectPage = contentData.projectData?.pages?.find(p => p.id === stageId);
      
      if (projectPage) {
        dispatch(updateProjectData({
          pages: [{
            id: newStageId,
            html: projectPage.html || backendStage.html || '',
            css: projectPage.css || backendStage.css || '',
            js: projectPage.js || backendStage.js || '',
            basicInfo: projectPage.basicInfo || backendStage.basicInfo || {}
          }]
        }));
      }

      // Set template if exists
      if (stageConfig?.selectedTemplateKey) {
        dispatch(setSelectedTemplateForStage({ 
          stageId: newStageId, 
          templateKey: stageConfig.selectedTemplateKey 
        }));
      }

      // Save to backend
      const newBackendStage = {
        ...backendStage,
        _id: undefined, // Remove _id for new stage
        pageId: newPageId,
        name: newStageName,
        order: currentIndex + 1,
        html: backendStage.html || '',
        css: backendStage.css || '',
        js: backendStage.js || '',
        assets: [...(backendStage.assets || [])],
        basicInfo: { ...(backendStage.basicInfo || {}) },
        isEnabled: true
      };

      // Update all stages orders
      const updatedStages = fullFunnel.stages.map((s, idx) => {
        if (idx > currentIndex) {
          return { ...s, order: idx + 1 };
        }
        return s;
      });

      // Insert new stage at correct position
      updatedStages.splice(currentIndex + 1, 0, newBackendStage);

      const updatedFunnel = {
        ...fullFunnel,
        stages: updatedStages
      };

      const saveRes = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedFunnel)
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save duplicated stage');
      }

      // Set active stage to the new duplicated stage
      setActiveStageId(newStageId);
      setActiveTab('Template');

      alert('Stage duplicated successfully!');
    } catch (err) {
      console.error('Error duplicating stage:', err);
      alert(`Failed to duplicate stage: ${err.message}`);
    }
  };

  // Function to update index page and save to backend
  const updateIndexPageAndSave = async (newStages) => {
    if (newStages.length === 0) return;
    
    const firstStage = newStages[0];
    const stagePageId = firstStage.pageId || firstStage.id;
    
    // Update indexPageId in contentData
    dispatch(setFunnelData({ indexPageId: stagePageId }));
    
    // Save to backend immediately
    const coachID = getCoachId(authState);
    const token = getToken(authState);
    
    if (!coachID || !token || !slug) return;
    
    try {
      // Fetch current funnel to get full data
      const fetchRes = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (fetchRes.ok) {
        const { data: fullFunnel } = await fetchRes.json();
        if (fullFunnel) {
          // Reorder stages in backend data to match new order
          const reorderedStages = newStages.map((newStage, idx) => {
            const backendStage = fullFunnel.stages.find(s => 
              (s.pageId === newStage.id) || (s.pageId === newStage.pageId) || (s._id === newStage.id)
            );
            return backendStage ? { ...backendStage, order: idx } : null;
          }).filter(Boolean);
          
          // Update funnel with new indexPageId and reordered stages
          const updatedFunnel = {
            ...fullFunnel,
            indexPageId: stagePageId,
            stages: reorderedStages
          };
          
          // Save to backend
          await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(updatedFunnel)
          });
        }
      }
    } catch (err) {
      console.error('Error updating index page:', err);
    }
  };

  const handleMoveStage = async (stageId, direction) => {
    const currentIndex = stages.findIndex(s => s.id === stageId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= stages.length) return;
    
    // Create new stages array with swapped positions
    const newStages = [...stages];
    [newStages[currentIndex], newStages[newIndex]] = [newStages[newIndex], newStages[currentIndex]];
    
    // Update stages in Redux
    dispatch(setStages(newStages));
    
    // Always update index page if first stage changed
    await updateIndexPageAndSave(newStages);
  };

  // Track if we're dragging to prevent click events
  const isDraggingRef = useRef(false);

  // Drag and Drop Handlers
  const handleDragStart = (e, stageId) => {
    isDraggingRef.current = true;
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', stageId);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedStageId(null);
    setDragOverStageId(null);
    // Reset dragging flag after a short delay to allow drop to complete
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (stageId !== draggedStageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e) => {
    setDragOverStageId(null);
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedStageId || draggedStageId === targetStageId) {
      setDraggedStageId(null);
      setDragOverStageId(null);
      return;
    }

    const draggedIndex = stages.findIndex(s => s.id === draggedStageId);
    const targetIndex = stages.findIndex(s => s.id === targetStageId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedStageId(null);
      setDragOverStageId(null);
      return;
    }

    // Create new stages array with reordered items
    const newStages = [...stages];
    const [removed] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIndex, 0, removed);
    
    // Update stages in Redux
    dispatch(setStages(newStages));
    
    // Update index page if first stage changed
    await updateIndexPageAndSave(newStages);
    
    setDraggedStageId(null);
    setDragOverStageId(null);
  };

  const handleUpdateBasicInfo = (stageId, key, value) => {
    dispatch(updateStageBasicInfo({ stageId, key, value }));
  };

  const handleUpdatePaymentSettings = (key, value) => {
    dispatch(updateStageBasicInfo({ 
      stageId: 'payment-page', 
      key: `settings.${key}`, 
      value 
    }));
  };

  // New function to handle template selection and reset page content
  const handleTemplateSelect = (stageType, stageId, templateKey, category = null) => {
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

    const template = templateSet[templateKey];
    if (!template) return;

    // Set the selected template key
    dispatch(setSelectedTemplateForStage({ stageId, templateKey }));

    // Reset the page content to the new template's HTML/CSS/JS
    dispatch(updateProjectData({
      pages: [{
        id: stageId,
        html: template.html,
        css: template.css,
        js: template.js,
        basicInfo: template.basicInfo || {},
      }],
    }));

    // If welcome-page template is selected, automatically add related pages
    if (stageType === 'welcome-page') {
      // Determine if it's a customer or coach template
      // Use passed category if available, otherwise detect from templateKey
      let detectedCategory = category;
      if (!detectedCategory) {
        const isCoachTemplate = templateKey.includes('coach');
        detectedCategory = isCoachTemplate ? 'coach' : 'customer';
      }
      
      // Get template keys for related pages
      const vslTemplateKey = templateCategories[detectedCategory].vsl;
      const appointmentTemplateKey = templateCategories[detectedCategory].appointment;
      const thankyouTemplateKey = templateCategories[detectedCategory].thankyou;

      // Check if stages already exist
      const hasVSL = stages.some(s => s.type === 'vsl-page');
      const hasAppointment = stages.some(s => s.type === 'appointment-page');
      const hasThankyou = stages.some(s => s.type === 'thankyou-page');

      // Add VSL page if it doesn't exist
      if (!hasVSL && templates.vslTemplates[vslTemplateKey]) {
        const vslId = 'vsl-page';
        dispatch(addStage({ id: vslId, name: 'Video Sales Letter', type: 'vsl-page', fixed: false }));
        dispatch(setSelectedTemplateForStage({ stageId: vslId, templateKey: vslTemplateKey }));
        
        const vslTemplate = templates.vslTemplates[vslTemplateKey];
        dispatch(updateProjectData({
          pages: [{
            id: vslId,
            html: vslTemplate.html,
            css: vslTemplate.css,
            js: vslTemplate.js,
            basicInfo: vslTemplate.basicInfo || {},
          }],
        }));
      }

      // Add Appointment page if it doesn't exist
      if (!hasAppointment && templates.appointmentTemplates[appointmentTemplateKey]) {
        const appointmentId = 'appointment-page';
        dispatch(addStage({ id: appointmentId, name: 'Appointment', type: 'appointment-page', fixed: false }));
        dispatch(setSelectedTemplateForStage({ stageId: appointmentId, templateKey: appointmentTemplateKey }));
        
        const appointmentTemplate = templates.appointmentTemplates[appointmentTemplateKey];
        dispatch(updateProjectData({
          pages: [{
            id: appointmentId,
            html: appointmentTemplate.html,
            css: appointmentTemplate.css,
            js: appointmentTemplate.js,
            basicInfo: appointmentTemplate.basicInfo || {},
          }],
        }));
      }

      // Add Thank You page if it doesn't exist
      if (!hasThankyou && templates.thankyouTemplates[thankyouTemplateKey]) {
        const thankyouId = 'thankyou-page';
        dispatch(addStage({ id: thankyouId, name: 'Thank You Page', type: 'thankyou-page', fixed: false }));
        dispatch(setSelectedTemplateForStage({ stageId: thankyouId, templateKey: thankyouTemplateKey }));
        
        const thankyouTemplate = templates.thankyouTemplates[thankyouTemplateKey];
        dispatch(updateProjectData({
          pages: [{
            id: thankyouId,
            html: thankyouTemplate.html,
            css: thankyouTemplate.css,
            js: thankyouTemplate.js,
            basicInfo: thankyouTemplate.basicInfo || {},
          }],
        }));
      }
    }
  };

  // Handle start from scratch
  const handleStartFromScratch = (stageId) => {
    // Create a blank template
    const blankTemplate = {
      html: '<div class="container"><h1>Your Page Title</h1><p>Start building your page here.</p></div>',
      css: '.container { max-width: 1200px; margin: 0 auto; padding: 20px; }',
      js: '',
      basicInfo: {}
    };

    // Set a special key for blank template
    dispatch(setSelectedTemplateForStage({ stageId, templateKey: 'blank-template' }));

    // Reset the page content to blank
    dispatch(updateProjectData({
      pages: [{
        id: stageId,
        html: blankTemplate.html,
        css: blankTemplate.css,
        js: blankTemplate.js,
        basicInfo: blankTemplate.basicInfo,
      }],
    }));
  };

 
  if (apiStatus === 'loading' || isLoading) {
    return (
      <div className="editor-container">
        <style>{additionalStyles}</style>
        <MainSkeletonLoader />
      </div>
    );
  }

  const renderContentArea = () => {
    if (!activeStage) {
      if (apiStatus === 'failed' && error) {
        return (
          <div className="content-section">
            <strong>Error:</strong> {error} You can start building a new funnel.
          </div>
        );
      }

      return (
        <div className="empty-state">
          <h2>Welcome to Your Funnel Builder</h2>
          <p>Select a stage from the sidebar or add a new one to begin crafting your premium funnel.</p>
          <button 
         
            type="button" 
            className="button-primary" 
            onClick={() => setShowStageModal(true)}
          >
            <FiPlus /> Add New Stage
          </button>
        </div>
      );
    }

    const { type, id } = activeStage;
    const isCustom = type === 'custom-page';
    let stageConfig = isCustom ? contentData.customStagesConfig[id] : contentData.stagesConfig[type];

    if (!stageConfig) { 
      stageConfig = {}; 
    }

    const canBeBuilt = [
      'welcome-page', 
      'vsl-page', 
      'thankyou-page', 
      'whatsapp-page', 
      'product-offer', 
      'custom-page', 
      'appointment-page', 
      'payment-page'
    ].includes(type);

    return (
      <>
        <div className="content-area-header animate-fadeIn" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: isMobile ? '16px' : '20px', 
          gap: isMobile ? '12px' : '15px', 
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <h2 className="content-title" style={{ 
            margin: 0,
            fontSize: isMobile ? '18px' : '24px',
            lineHeight: '1.3'
          }}>
            {stageConfig?.name || activeStage.name}
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '8px' : '10px', 
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto'
          }}>
          </div>
        </div>
        
        <div className="content-body" key={id}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Template Section */}
            <div className="content-section animate-fadeIn" style={{ width: '100%', marginBottom: '32px' }}>
              <div style={{
                marginBottom: '28px'
              }}>
                <h2 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '28px', 
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  Template Selection
                </h2>
                <p style={{ 
                  margin: 0, 
                  fontSize: '15px', 
                  color: '#6b7280',
                  lineHeight: '1.5',
                  fontWeight: '400'
                }}>
                  Choose how you want to start building your page. Select a template or start from scratch.
                </p>
              </div>

              {stageConfig?.selectedTemplateKey ? (() => {
                const templateSet = {
                  'welcome-page': templates.welcomeTemplates,
                  'vsl-page': templates.vslTemplates,
                  'thankyou-page': templates.thankyouTemplates,
                  'whatsapp-page': templates.whatsappTemplates,
                  'product-offer': templates.productOfferTemplates,
                  'custom-page': templates.miscTemplates,
                  'appointment-page': templates.appointmentTemplates,
                  'payment-page': templates.paymentTemplates,
                }[type];
                
                const currentTemplate = stageConfig.selectedTemplateKey !== 'blank-template' 
                  ? templateSet?.[stageConfig.selectedTemplateKey] 
                  : null;
                
                const templateName = currentTemplate?.name || 'Blank Template (Start from Scratch)';
                
                return (
                  <div style={{
                    background: 'linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%)',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    padding: '28px 32px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      borderRadius: '0 2px 2px 0'
                    }} />
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '24px',
                      paddingLeft: '4px'
                    }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#10b981',
                            flexShrink: 0
                          }} />
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px'
                          }}>
                            Current Template
                          </div>
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#111827',
                          lineHeight: '1.4',
                          marginBottom: '6px'
                        }}>
                          {templateName}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span>Template is configured and ready to use</span>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start'
                      }}>
                        <button
                          onClick={() => setShowTemplateModal(true)}
                          style={{
                            padding: '10px 18px',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                            e.target.style.borderColor = '#9ca3af';
                            e.target.style.color = '#111827';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.color = '#374151';
                          }}
                        >
                          <FiEdit style={{ width: '14px', height: '14px' }} /> Change Template
                        </button>
                        {activeStage && pageUrl && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '7px 10px', 
                            backgroundColor: '#f7fafc', 
                            borderRadius: '6px', 
                            border: '1px solid #e2e8f0',
                            width: '100%',
                            maxWidth: '300px',
                            overflow: 'hidden'
                          }}>
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#4a5568', 
                              maxWidth: 'calc(100% - 30px)', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {pageUrl}
                            </span>
                            <button
                              onClick={() => copyToClipboard(pageUrl)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#3182ce'
                              }}
                              title="Copy page link"
                            >
                              <FiCopy style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        )}
                        {canBeBuilt && (
                          <button
                            onClick={() => handleBuildPage(id)}
                            style={{
                              padding: '10px 18px',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
                              e.target.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                              e.target.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.2)';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            <FiEdit style={{ width: '14px', height: '14px' }} /> Build Page
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div style={{
                  background: 'linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%)',
                  borderRadius: '12px',
                  border: '1px dashed #d1d5db',
                  padding: '48px 32px',
                  textAlign: 'center',
                  marginBottom: '24px',
                  width: '100%',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#f59e0b',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.15)'
                  }}>
                    <FiEdit style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    letterSpacing: '-0.01em'
                  }}>
                    No Template Selected
                  </h4>
                  <p style={{
                    margin: '0 0 24px 0',
                    fontSize: '13px',
                    color: '#6b7280',
                    maxWidth: '420px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.5'
                  }}>
                    Select a template to get started with your page design, or start from scratch with a blank canvas.
                  </p>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    style={{
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
                      e.target.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                      e.target.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.2)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <FiEdit style={{ width: '14px', height: '14px' }} /> Select Template
                  </button>
                </div>
              )}
            </div>
            
            {/* Basic Settings Section */}
            <BasicInfoForm 
              stage={activeStage} 
              stageConfig={stageConfig} 
              onUpdate={handleUpdateBasicInfo} 
            />
        
            
            {/* Payment Settings */}
            {type === 'payment-page' && (
              <PaymentSettings
                settings={contentData.generalSettings.payment.settings}
                onUpdate={handleUpdatePaymentSettings}
              />
            )}
          </div>
        </div>
      </>
    );
  };

  const getPublishButtonText = () => {
    switch (apiStatus) {
      case 'publishing': return 'Publishing...';
      case 'published': return 'Published!';
      default: return 'Publish';
    }
  };

  return (
    <div className="editor-container">
      <style>{additionalStyles}</style>
      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <button
          className="sidebar-toggle-mobile"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}
        >
          <FiMenu style={{ width: '20px', height: '20px' }} />
        </button>
      )}
      {/* Sidebar Overlay for Mobile */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <header className="editor-header" style={{
        padding: isMobile ? '12px 16px' : window.innerWidth <= 991 ? '14px 20px' : '16px 32px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/funnels')}
            style={{
              background: '#f7fafc',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              padding: isMobile ? '8px 10px' : '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              color: '#4a5568',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#edf2f7';
              e.currentTarget.style.color = '#2d3748';
              e.currentTarget.style.borderColor = '#cbd5e0';
              e.currentTarget.style.transform = 'translateX(-2px)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f7fafc';
              e.currentTarget.style.color = '#4a5568';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            }}
            title="Back to Portfolio"
          >
            <FiArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
        <div style={{ flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
          <h1 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            flexWrap: 'wrap',
            fontSize: isMobile ? '18px' : window.innerWidth <= 991 ? '20px' : '23px',
            lineHeight: '1.3',
            margin: 0
          }}>
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              maxWidth: isMobile ? '100%' : '400px'
            }}>
              Funnel: {contentData.name || 'Untitled Funnel'}
            </span>
          </h1>
            <p style={{ 
              fontSize: isMobile ? '12px' : '14px',
              margin: '4px 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Editing Stage: {activeStage?.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="header-actions" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '8px' : '10px', 
          flexWrap: 'wrap',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Funnel Active Switch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '500',
              color: '#4b5563'
            }}>
              {isFunnelActive ? 'Active' : 'Inactive'}
            </span>
            {isStatusLoading ? (
              <div style={{
                width: '48px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e2e8f0',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
              </div>
            ) : (
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isFunnelActive}
                  onChange={async (e) => {
                    const newStatus = e.target.checked;
                    setIsStatusLoading(true);
                    setIsFunnelActive(newStatus);
                    try {
                      const coachID = getCoachId(authState);
                      const token = getToken(authState);
                      
                      if (!coachID || !token) {
                        throw new Error('Authentication required. Please log in again.');
                      }
                      
                      // First fetch the full funnel data
                      const fetchRes = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      
                      if (!fetchRes.ok) {
                        if (fetchRes.status === 401) {
                          throw new Error('Authentication failed. Please log in again.');
                        } else if (fetchRes.status === 404) {
                          throw new Error('Funnel not found.');
                        } else {
                          throw new Error(`Failed to fetch funnel details (${fetchRes.status})`);
                        }
                      }
                      
                      const { data: fullFunnel } = await fetchRes.json();
                      
                      // Prepare payload with full funnel data
                      const payload = { 
                        ...fullFunnel, 
                        isActive: newStatus,
                        isPublished: newStatus
                      };
                      
                      // Update using PUT with full payload
                      const updateRes = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${slug}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                      });
                      
                      if (!updateRes.ok) {
                        if (updateRes.status === 401) {
                          throw new Error('Authentication failed. Please log in again.');
                        } else if (updateRes.status === 403) {
                          throw new Error('You do not have permission to update this funnel.');
                        } else {
                          throw new Error(`Failed to update funnel status (${updateRes.status})`);
                        }
                      }
                      
                      // Success - update Redux state
                      dispatch(setFunnelData({ isActive: newStatus, isPublished: newStatus }));
                      
                    } catch (err) {
                      setIsFunnelActive(!newStatus); // Revert on error
                      console.error('Error updating funnel status:', err);
                      alert(err.message || 'Failed to update funnel status');
                    } finally {
                      setIsStatusLoading(false);
                    }
                  }}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isFunnelActive ? '#10b981' : '#d1d5db',
                  borderRadius: '24px',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}>
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    left: isFunnelActive ? '26px' : '2px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            )}
          </div>
          {funnelUrl && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: isMobile ? '6px 10px' : '8px 12px', 
              backgroundColor: '#f7fafc', 
              borderRadius: '6px', 
              border: '1px solid #e2e8f0',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '100%' : '300px',
              overflow: 'hidden'
            }}>
              <span style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#4a5568', 
                maxWidth: isMobile ? 'calc(100% - 30px)' : '300px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {funnelUrl}
              </span>
              <button
                onClick={() => copyToClipboard(funnelUrl)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#3182ce'
                }}
                title="Copy link"
              >
                <FiCopy />
              </button>
            </div>
          )}
          <button 
            className="button-primary"
            onClick={() => handlePreviewFunnel()}
            style={{
              padding: isMobile ? '8px 12px' : '10px 16px',
              fontSize: isMobile ? '12px' : '14px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <FiExternalLink /> Preview
          </button>
        </div>
      </header>
      
      <div className="editor-layout">
        <aside className={`editor-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {isMobile && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{fontSize:'18px', margin: 0}} className="sidebar-title">Funnel Stages</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#4a5568'
                }}
              >
                <FiX style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          )}
          {!isMobile && (
            <h3 style={{fontSize:'19px'}} className="sidebar-title">Funnel Stages</h3>
          )}
          <ul className="stages-list">
            {stages.map((stage, index) => {
              const isIndexPage = index === 0; // First stage is always the index page
              return (
              <li 
                key={stage.id} 
                className={`stage-item ${activeStageId === stage.id ? 'active' : ''} ${isIndexPage ? 'index-page' : ''} ${draggedStageId === stage.id ? 'dragging' : ''} ${dragOverStageId === stage.id ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, stage.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                onClick={(e) => { 
                  // Prevent click if we just finished dragging
                  if (isDraggingRef.current) {
                    e.preventDefault();
                    return;
                  }
                  setActiveStageId(stage.id); 
                  if (!['appointment-page', 'payment-page'].includes(stage.type) && activeTab === 'Settings') {
                    setActiveTab('Template'); 
                  } else { 
                    setActiveTab('Template'); 
                  }
                  // Close sidebar on mobile after selection
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                style={{
                  cursor: draggedStageId === stage.id ? 'grabbing' : 'grab',
                  opacity: draggedStageId === stage.id ? 0.5 : 1,
                  borderTop: dragOverStageId === stage.id ? '2px solid #3b82f6' : 'none',
                  transform: dragOverStageId === stage.id ? 'translateY(-2px)' : 'none',
                  transition: draggedStageId ? 'none' : 'all 0.2s ease'
                }}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    flex: 1, 
                    width: '100%', 
                    position: 'relative',
                    cursor: 'grab'
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'grab',
                      padding: '2px',
                      color: '#9ca3af',
                      transition: 'color 0.2s',
                      userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#4a5568';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    title="Drag to reorder"
                  >
                    <FiGripVertical style={{ width: '14px', height: '14px' }} />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '4px', 
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%'
                    }}>
                      <span className="stage-name" style={{ 
                        fontWeight: isIndexPage ? '600' : 'normal',
                        color: isIndexPage ? '#1F2937' : 'inherit',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{stage.name}</span>
                    </div>
                    {isIndexPage && (
                      <span 
                        style={{
                          fontSize: '8px',
                          fontWeight: '600',
                          color: '#10B981',
                          backgroundColor: '#D1FAE5',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap',
                          width: 'fit-content'
                        }}
                      >
                        <span style={{ 
                          width: '4px', 
                          height: '4px', 
                          backgroundColor: '#10B981', 
                          borderRadius: '50%',
                          display: 'inline-block'
                        }}></span>
                        Index
                      </span>
                    )}
                  </div>
                </div>
                <div className="stage-actions">
                  <button 
                    type="button" 
                    className="preview-stage-button" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handlePreviewStage(stage.id); 
                    }}
                    title="Preview Page"
                  >
                    <FiEye style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button 
                    type="button" 
                    className="copy-link-button" 
                    onClick={async (e) => { 
                      e.stopPropagation(); 
                      const stageUrl = await getPageUrl(stage.id);
                      if (stageUrl) {
                        copyToClipboard(stageUrl);
                      } else {
                        alert('Stage URL not available. Please publish the funnel first.');
                      }
                    }}
                    title="Copy Stage Link"
                  >
                    <FiExternalLink style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button 
                    type="button" 
                    className="duplicate-stage-button" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDuplicateStage(stage.id); 
                    }}
                    title="Duplicate Stage"
                  >
                    <FiCopy style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button 
                    type="button" 
                    className="remove-stage-button" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleRemoveStage(stage.id); 
                    }}
                    title="Delete Stage"
                  >
                    <FiTrash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                  <FiChevronRight style={{ color: '#9ca3af', marginLeft: '4px', width: '14px', height: '14px' }} />
                </div>
              </li>
            );
            })}
          </ul>
          <button 
           style={{fontSize:'14px'}}
            type="button" 
            className="button-primary-full" 
            onClick={() => setShowStageModal(true)}
          >
            <FiPlus /> Add New Stage
          </button>
        </aside>
        
        <main className="editor-main-content">
          {renderContentArea()}
        </main>
      </div>
      
      {showStageModal && (
        <StageTypeModal 
          onClose={() => setShowStageModal(false)} 
          onAddStage={handleAddStage} 
        />
      )}

      {showTemplateModal && activeStage && (() => {
        const { type, id } = activeStage;
        const isCustom = type === 'custom-page';
        const currentStageConfig = isCustom ? contentData.customStagesConfig[id] : contentData.stagesConfig[type];
        return (
          <TemplateSelectionModal
            stageType={type}
            selectedKey={currentStageConfig?.selectedTemplateKey}
            onClose={() => setShowTemplateModal(false)}
            onSelect={(templateKey, category) => {
              handleTemplateSelect(type, id, templateKey, category);
            }}
            onStartFromScratch={() => {
              handleStartFromScratch(id);
            }}
          />
        );
      })()}

      {showTemplatePreviewModal && activeStage && (() => {
        const { type, id } = activeStage;
        const isCustom = type === 'custom-page';
        const currentStageConfig = isCustom ? contentData.customStagesConfig[id] : contentData.stagesConfig[type];
        
        const templateSet = {
          'welcome-page': templates.welcomeTemplates,
          'vsl-page': templates.vslTemplates,
          'thankyou-page': templates.thankyouTemplates,
          'whatsapp-page': templates.whatsappTemplates,
          'product-offer': templates.productOfferTemplates,
          'custom-page': templates.miscTemplates,
          'appointment-page': templates.appointmentTemplates,
          'payment-page': templates.paymentTemplates,
        }[type];
        
        const currentTemplate = currentStageConfig?.selectedTemplateKey && currentStageConfig.selectedTemplateKey !== 'blank-template'
          ? templateSet?.[currentStageConfig.selectedTemplateKey]
          : null;
        
        if (!currentTemplate) return null;
        
        return (
          <TemplatePreviewModal
            template={currentTemplate}
            onClose={() => setShowTemplatePreviewModal(false)}
          />
        );
      })()}
    </div>
  );
};

export default FunnelEditorIndex;
