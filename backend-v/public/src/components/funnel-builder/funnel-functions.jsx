function addLandingPageComponents(editor, userId = 'guest', stages, slug) {
  const bm = editor.BlockManager;
  const domc = editor.DomComponents;

  // Add this if showMessage isn't defined elsewhere
window.showMessage = function(message, type) {
  const messageEl = document.querySelector('.form-message');
  if (messageEl) {
    messageEl.style.display = 'block';
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
  } else {
    // Fallback if message element not found
    console.log(`${type.toUpperCase()} MESSAGE: ${message}`);
    if (type === 'error') {
      alert(message);
    }
  }
};

// Add this directly to your HTML page inside a <script> tag at the bottom

// Make sure these functions are globally accessible
window.showMessage = function(message, type) {
  const messageEl = document.querySelector('.form-message');
  if (messageEl) {
    messageEl.style.display = 'block';
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
  } else {
    // Fallback if message element not found
    console.log(`${type.toUpperCase()} MESSAGE: ${message}`);
    if (type === 'error') {
      alert(message);
    } else {
      alert(message);
    }
  }
};

window.hideMessage = function() {
  const messageEl = document.querySelector('.form-message');
  if (messageEl) {
    messageEl.style.display = 'none';
    messageEl.textContent = '';
  }
};

// Fix for Join Our Community form
// Add this code to your page to fix the "Join Our Community" form submission
// Fix for Join Our Community form
document.addEventListener('DOMContentLoaded', function() {
  // Find the "Join Our Community" form
  const communityForm = document.querySelector('.popup-content form') || 
                        document.querySelector('[id*="community"] form') ||
                        document.querySelector('form:has(button:contains("Send"))');
  
  if (communityForm) {
    // Find the Send button
    const sendButton = communityForm.querySelector('button') || 
                      document.querySelector('button:contains("Send")');
    
    if (sendButton) {
      // Add click event listener to the Send button
      sendButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔔 BUTTON CLICKED: Send button clicked');
        
        // Get form data
        const nameInput = communityForm.querySelector('input[type="text"]') || 
                         communityForm.querySelector('input:not([type="email"])');
        const emailInput = communityForm.querySelector('input[type="email"]');
        const phoneInput = communityForm.querySelector('input[type="tel"]') || 
                          communityForm.querySelector('input[placeholder*="Phone"]');
        
        // Create data object with all values
        const formData = {
          name: nameInput ? nameInput.value : '',
          email: emailInput ? emailInput.value : '',
          phone: phoneInput ? phoneInput.value : '',
          timestamp: new Date().toISOString(),
          source: 'Join Our Community Form'
        };
        
        // Enhanced console logging with clear formatting
        console.log('%c📝 FORM SUBMISSION DATA', 'color: #4CAF50; font-size: 14px; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50');
        console.log('%c📋 Form Values:', 'color: #2196F3; font-weight: bold;');
        console.log('   🔹 Name:', formData.name);
        console.log('   🔹 Email:', formData.email);
        console.log('   🔹 Phone:', formData.phone || '(Not provided)');
        console.log('%c⏱️ Submission Details:', 'color: #2196F3; font-weight: bold;');
        console.log('   🔹 Time:', new Date().toLocaleString());
        console.log('   🔹 Source:', formData.source);
        console.log('%c✅ FORM DATA CAPTURED SUCCESSFULLY', 'color: #4CAF50; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50');
        
        // Show visual confirmation
        alert('Form submitted successfully! Check the console for the submitted data.');
        
        // Close the popup
        const popup = communityForm.closest('.popup-content');
        if (popup) {
          const closeBtn = popup.querySelector('.popup-close') || 
                          popup.querySelector('.close');
          if (closeBtn) {
            closeBtn.click();
          } else {
            // Try to find and close the modal directly
            const modal = popup.parentElement;
            if (modal && modal.style) {
              modal.style.display = 'none';
            }
          }
        }
      });
      
      console.log('✅ Community form event listener attached successfully');
    } else {
      console.log('⚠️ Send button not found in community form');
    }
  } else {
    console.log('⚠️ Join Our Community form not found');
  }
});

      
    


window.hideMessage = function() {
  const messageEl = document.querySelector('.form-message');
  if (messageEl) {
    messageEl.style.display = 'none';
    messageEl.textContent = '';
  }
};

// **NEW: Global function definitions for form submission**
window.progressToNextStage = function() {
  console.log('🚀 PROGRESSING TO NEXT STAGE...');
  
  // Find all possible sidebar elements (different forms might have different IDs)
  const sidebarSelectors = [
    '#sidebar-step-title',
    '.sidebar-title', 
    '[id*="sidebar"][id*="title"]'
  ];
  
  const subtitleSelectors = [
    '#sidebar-step-subtitle',
    '.sidebar-subtitle',
    '[id*="sidebar"][id*="subtitle"]'
  ];
  
  const progressSelectors = [
    '#sidebar-progress-indicator',
    '.sidebar-progress',
    '[id*="progress"]'
  ];
  
  // Try to find and update sidebar elements
  let sidebarTitle = null;
  let sidebarSubtitle = null;
  let progressIndicator = null;
  
  for (let selector of sidebarSelectors) {
    sidebarTitle = document.querySelector(selector);
    if (sidebarTitle) break;
  }
  
  for (let selector of subtitleSelectors) {
    sidebarSubtitle = document.querySelector(selector);
    if (sidebarSubtitle) break;
  }
  
  for (let selector of progressSelectors) {
    progressIndicator = document.querySelector(selector);
    if (progressIndicator) break;
  }
  
  if (sidebarTitle && sidebarSubtitle && progressIndicator) {
    console.log('📊 Updating sidebar elements...');
    
    // Update sidebar to show next stage
    sidebarTitle.textContent = '✅ Information Collected';
    sidebarSubtitle.textContent = 'Step 2 of 2 - Complete!';
    
    // Animate progress to 100%
    progressIndicator.style.transition = 'width 1.5s ease-in-out, background-color 0.5s ease';
    progressIndicator.style.width = '100%';
    progressIndicator.style.backgroundColor = '#28a745'; // Green for completion
    
    console.log('✅ Sidebar updated successfully');
    console.log('📈 Progress: 100% Complete');
  } else {
    console.log('⚠️ Sidebar elements not found, creating alternative notification');
  }
  
  // Show completion message regardless
  setTimeout(() => {
    window.showCompletionMessage();
  }, 1000);
};

window.showCompletionMessage = function() {
  console.log('🎉 SHOWING COMPLETION MESSAGE');
  
  // Create success notification
  const completionDiv = document.createElement('div');
  completionDiv.id = 'lead-success-notification';
  completionDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
    z-index: 10001;
    font-weight: 600;
    font-size: 16px;
    max-width: 350px;
    animation: slideInBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-left: 5px solid #ffffff;
  `;
  
  completionDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <div>
        <div style="font-weight: bold; margin-bottom: 4px;">Success! 🎯</div>
        <div style="font-size: 14px; opacity: 0.9;">Lead information captured and processed</div>
      </div>
    </div>
  `;
  
  // Add animation styles if not already present
  if (!document.querySelector('#completion-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'completion-animation-styles';
    style.textContent = `
      @keyframes slideInBounce {
        0% { 
          transform: translateX(100%) scale(0.8); 
          opacity: 0; 
        }
        70% { 
          transform: translateX(-10px) scale(1.05); 
          opacity: 1; 
        }
        100% { 
          transform: translateX(0) scale(1); 
          opacity: 1; 
        }
      }
      @keyframes fadeOutRight {
        to { 
          transform: translateX(100%); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(completionDiv);
  
  console.log('🎊 Success notification displayed');
  console.log('⏱️ Auto-hide in 5 seconds');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    completionDiv.style.animation = 'fadeOutRight 0.5s ease-in-out forwards';
    setTimeout(() => {
      if (completionDiv.parentNode) {
        completionDiv.parentNode.removeChild(completionDiv);
      }
    }, 500);
  }, 5000);
  
  // Allow manual close on click
  completionDiv.addEventListener('click', () => {
    completionDiv.style.animation = 'fadeOutRight 0.3s ease-in-out forwards';
    setTimeout(() => {
      if (completionDiv.parentNode) {
        completionDiv.parentNode.removeChild(completionDiv);
      }
    }, 300);
  });
};

  // Configurable API base URL
  const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000';

  const getAssetUrl = (src) => {
    if (!src) return src;
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    return `${API_BASE_URL}${src.startsWith('/') ? src : `/${src}`}`;
  };

  // Function to create the media upload popup
  // const createMediaUploadPopup = (type, callback) => {
  //   console.log("👤 User ID:", userId);
  //   
  //   const popup = document.createElement('div');
  //   popup.id = 'media-upload-popup';
  //   popup.style.position = 'fixed';
  //   popup.style.top = '0';
  //   popup.style.left = '0';
  //   popup.style.width = '100%';
  //   popup.style.height = '100%';
  //   popup.style.backgroundColor = 'rgba(0,0,0,0.7)';
  //   popup.style.display = 'flex';
  //   popup.style.justifyContent = 'center';
  //   popup.style.alignItems = 'center';
  //   popup.style.zIndex = '10000';
  //   
  //   const popupContent = document.createElement('div');
  //   popupContent.style.backgroundColor = 'white';
  //   popupContent.style.padding = '20px';
  //   popupContent.style.borderRadius = '8px';
  //   popupContent.style.width = '90%';
  //   popupContent.style.maxWidth = '800px';
  //   popupContent.style.maxHeight = '80vh';
  //   popupContent.style.overflow = 'auto';
  //   popupContent.style.position = 'relative';
  //   
  //   const title = document.createElement('h3');
  //   title.textContent = `Upload ${type === 'image' ? 'Image' : 'Video'}`;
  //   title.style.marginTop = '0';
  //   title.style.color = '#333';
  //   
  //   const closeBtn = document.createElement('button');
  //   closeBtn.innerHTML = '&times;';
  //   closeBtn.style.position = 'absolute';
  //   closeBtn.style.top = '10px';
  //   closeBtn.style.right = '10px';
  //   closeBtn.style.background = 'none';
  //   closeBtn.style.border = 'none';
  //   closeBtn.style.fontSize = '24px';
  //   closeBtn.style.cursor = 'pointer';
  //   closeBtn.style.color = '#888';
  //   closeBtn.style.width = '40px';
  //   closeBtn.style.height = '40px';
  //   closeBtn.style.display = 'flex';
  //   closeBtn.style.alignItems = 'center';
  //   closeBtn.style.justifyContent = 'center';
  //   closeBtn.style.borderRadius = '50%';
  //   
  //   closeBtn.addEventListener('mouseenter', () => {
  //     closeBtn.style.backgroundColor = '#f5f5f5';
  //   });
  //   
  //   closeBtn.addEventListener('mouseleave', () => {
  //     closeBtn.style.backgroundColor = 'transparent';
  //   });
  //   
  //   const uploadBtn = document.createElement('button');
  //   uploadBtn.textContent = 'Upload Files';
  //   uploadBtn.style.padding = '10px 20px';
  //   uploadBtn.style.background = '#3498db';
  //   uploadBtn.style.color = 'white';
  //   uploadBtn.style.border = 'none';
  //   uploadBtn.style.borderRadius = '4px';
  //   uploadBtn.style.marginTop = '20px';
  //   uploadBtn.style.cursor = 'pointer';
  //   uploadBtn.style.display = 'flex';
  //   uploadBtn.style.alignItems = 'center';
  //   uploadBtn.style.gap = '8px';
  //   
  //   const uploadIcon = document.createElement('span');
  //   uploadIcon.innerHTML = '&#x1F4C2;';
  //   uploadBtn.prepend(uploadIcon);
  //   
  //   const fileInput = document.createElement('input');
  //   fileInput.type = 'file';
  //   fileInput.multiple = true;
  //   fileInput.accept = type === 'image' ? 'image/*' : 'video/*';
  //   fileInput.style.display = 'none';
  //   
  //   const mediaGrid = document.createElement('div');
  //   mediaGrid.style.display = 'grid';
  //   mediaGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
  //   mediaGrid.style.gap = '15px';
  //   mediaGrid.style.marginTop = '20px';
  //   
  //   // Load existing media for this user
  //   const loadMedia = async () => {
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/api/assets?userId=${userId}`);
  //       if (!response.ok) throw new Error('Failed to fetch media');
  //       const result = await response.json();
  //       
  //       mediaGrid.innerHTML = '';
  //       
  //       if (result.data.length === 0) {
  //         const emptyMsg = document.createElement('p');
  //         emptyMsg.textContent = 'No media found. Upload some files!';
  //         emptyMsg.style.textAlign = 'center';
  //         emptyMsg.style.color = '#666';
  //         emptyMsg.style.gridColumn = '1 / -1';
  //         mediaGrid.appendChild(emptyMsg);
  //         return;
  //       }
  //       
  //       result.data.forEach(asset => {
  //         if ((type === 'image' && asset.type === 'image') || 
  //             (type === 'video' && asset.type === 'video')) {
  //           const mediaItem = document.createElement('div');
  //           mediaItem.style.position = 'relative';
  //           mediaItem.style.cursor = 'pointer';
  //           mediaItem.style.border = '2px solid #eee';
  //           mediaItem.style.borderRadius = '4px';
  //           mediaItem.style.padding = '5px';
  //           mediaItem.style.transition = 'all 0.2s';
  //           mediaItem.style.overflow = 'hidden';
  //           
  //           mediaItem.addEventListener('mouseenter', () => {
  //             mediaItem.style.borderColor = '#3498db';
  //           });
  //           
  //           mediaItem.addEventListener('mouseleave', () => {
  //             mediaItem.style.borderColor = '#eee';
  //           });
  //           
  //           // Remove button
  //           const removeBtn = document.createElement('button');
  //           removeBtn.innerHTML = '&times;';
  //           removeBtn.style.position = 'absolute';
  //           removeBtn.style.top = '5px';
  //           removeBtn.style.right = '5px';
  //           removeBtn.style.background = 'rgba(0,0,0,0.7)';
  //           removeBtn.style.color = 'white';
  //           removeBtn.style.border = 'none';
  //           removeBtn.style.borderRadius = '50%';
  //           removeBtn.style.width = '25px';
  //           removeBtn.style.height = '25px';
  //           removeBtn.style.display = 'flex';
  //           removeBtn.style.alignItems = 'center';
  //           removeBtn.style.justifyContent = 'center';
  //           removeBtn.style.cursor = 'pointer';
  //           removeBtn.style.fontSize = '16px';
  //           removeBtn.style.opacity = '0';
  //           removeBtn.style.transition = 'opacity 0.2s';
  //           
  //           removeBtn.addEventListener('click', async (e) => {
  //             e.stopPropagation();
  //             if (confirm('Are you sure you want to delete this file?')) {
  //               try {
  //                 const deleteResponse = await fetch(`${API_BASE_URL}/api/assets`, {
  //                   method: 'DELETE',
  //                   headers: {
  //                     'Content-Type': 'application/json',
  //                   },
  //                   body: JSON.stringify({
  //                     src: asset.src,
  //                     userId: userId
  //                   }),
  //                 });
  //                 
  //                 if (!deleteResponse.ok) throw new Error('Delete failed');
  //                 
  //                 mediaItem.style.transform = 'scale(0)';
  //                 setTimeout(() => {
  //                   mediaItem.remove();
  //                   if (mediaGrid.children.length === 0) {
  //                     loadMedia();
  //                   }
  //                 }, 300);
  //               } catch (error) {
  //                 console.error('Delete error:', error);
  //                 alert('Failed to delete file');
  //               }
  //             }
  //           });
  //           
  //           mediaItem.addEventListener('mouseenter', () => {
  //             removeBtn.style.opacity = '1';
  //           });
  //           
  //           mediaItem.addEventListener('mouseleave', () => {
  //             removeBtn.style.opacity = '0';
  //           });
  //           
  //           if (type === 'image') {
  //             const img = document.createElement('img');
  //             img.src = getAssetUrl(asset.src);
  //             img.style.width = '100%';
  //             img.style.height = '150px';
  //             img.style.objectFit = 'cover';
  //             img.style.display = 'block';
  //             img.style.borderRadius = '2px';
  //             mediaItem.appendChild(img);
  //           } else {
  //             const videoContainer = document.createElement('div');
  //             videoContainer.style.position = 'relative';
  //             videoContainer.style.paddingBottom = '100%';
  //             videoContainer.style.overflow = 'hidden';
  //             
  //             const video = document.createElement('video');
  //             video.src = getAssetUrl(asset.src);
  //             video.style.position = 'absolute';
  //             video.style.top = '0';
  //             video.style.left = '0';
  //             video.style.width = '100%';
  //             video.style.height = '100%';
  //             video.style.objectFit = 'cover';
  //             video.style.display = 'block';
  //             video.muted = true;
  //             video.playsInline = true;
  //             video.loop = true;
  //             video.autoplay = true;
  //             
  //             videoContainer.appendChild(video);
  //             mediaItem.appendChild(videoContainer);
  //           }
  //           
  //           mediaItem.appendChild(removeBtn);
  //           
  //           mediaItem.addEventListener('click', () => {
  //             callback(asset.src);
  //             document.body.removeChild(popup);
  //           });
  //           
  //           mediaGrid.appendChild(mediaItem);
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error loading media:', error);
  //       const errorMsg = document.createElement('p');
  //       errorMsg.textContent = 'Failed to load media. Please try again.';
  //       errorMsg.style.color = '#e74c3c';
  //       errorMsg.style.textAlign = 'center';
  //       errorMsg.style.gridColumn = '1 / -1';
  //       mediaGrid.innerHTML = '';
  //       mediaGrid.appendChild(errorMsg);
  //     }
  //   };
  //   
  //   uploadBtn.addEventListener('click', () => {
  //     fileInput.click();
  //   });
  //   
  //   fileInput.addEventListener('change', async (e) => {
  //     const files = e.target.files;
  //     if (files.length === 0) return;
  //     
  //     const formData = new FormData();
  //     formData.append('userId', userId);
  //     for (let i = 0; i < files.length; i++) {
  //       formData.append('assets', files[i]);
  //     }
  //     
  //     try {
  //       uploadBtn.disabled = true;
  //       uploadBtn.innerHTML = '&#x1F504; Uploading...';
  //       
  //       const response = await fetch(`${API_BASE_URL}/api/assets`, {
  //         method: 'POST',
  //         body: formData,
  //       });
  //       
  //       if (!response.ok) throw new Error('Upload failed');
  //       
  //       await loadMedia();
  //     } catch (error) {
  //       console.error('Upload error:', error);
  //       alert('Failed to upload files');
  //     } finally {
  //       uploadBtn.disabled = false;
  //       uploadBtn.innerHTML = '&#x1F4C2; Upload Files';
  //     }
  //   });
  //   
  //   closeBtn.addEventListener('click', () => {
  //     document.body.removeChild(popup);
  //   });
  //   
  //   popup.addEventListener('click', (e) => {
  //     if (e.target === popup) {
  //       document.body.removeChild(popup);
  //     }
  //   });
  //   
  //   popupContent.appendChild(closeBtn);
  //   popupContent.appendChild(title);
  //   popupContent.appendChild(uploadBtn);
  //   popupContent.appendChild(mediaGrid);
  //   popup.appendChild(popupContent);
  //   document.body.appendChild(popup);
  //   
  //   loadMedia();
  // };

  // Enhanced Video Component with Upload Functionality
// Enhanced Video Component with Upload Functionality
editor.DomComponents.addType('custom-video', {
  model: {
    defaults: {
      tagName: 'div',
      classes: ['custom-video-container'],
      droppable: false,
      resizable: true,
      traits: [
        {
          type: 'checkbox',
          name: 'controls',
          label: 'Show Controls',
          value: true
        },
        {
          type: 'checkbox',
          name: 'autoplay',
          label: 'Autoplay'
        },
        {
          type: 'checkbox',
          name: 'loop',
          label: 'Loop Video'
        },
        {
          type: 'checkbox',
          name: 'muted',
          label: 'Muted',
          value: true
        }
      ],
      attributes: {
        'data-video-src': '',
      },
    },
  },
  
  view: {
    events: {
      // 'click .video-upload-btn': 'openVideoUpload',
      'click .video-fullscreen-btn': 'toggleFullscreen',
      'click .video-play-btn': 'togglePlay',
      'click video': 'togglePlay'
    },
    
    init() {
      this.listenTo(this.model, 'change:attributes:data-video-src', this.render);
      this.listenTo(this.model, 'change:traits', this.render);
    },
    
    // openVideoUpload() {
    //   createMediaUploadPopup('video', (src) => {
    //     this.model.set({
    //       attributes: {
    //         ...this.model.get('attributes'),
    //         'data-video-src': src,
    //       }
    //     });
    //   });
    // },
        toggleFullscreen() {
      const container = this.el.querySelector('.video-container');
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },
    togglePlay() {
      const video = this.el.querySelector('video');
      const playBtn = this.el.querySelector('.video-play-btn');
      if (video) {
        if (video.paused) {
          video.play();
          playBtn?.classList.add('playing');
        } else {
          video.pause();
          playBtn?.classList.remove('playing');
        }
      }
    },
    
    render() {
      const videoSrc = this.model.get('attributes')['data-video-src'];
      const showControls = this.model.getTrait('controls')?.get('value') ?? true;
      const autoplay = this.model.getTrait('autoplay')?.get('value') ?? false;
      const loop = this.model.getTrait('loop')?.get('value') ?? false;
      const muted = this.model.getTrait('muted')?.get('value') ?? true;
    
      if (videoSrc) {
        this.el.innerHTML = `
          <div style="
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          ">
            <video 
              style="width: 100%; height: 100%; display: block;"
              ${showControls ? 'controls' : ''}
              ${autoplay ? 'autoplay' : ''}
              ${loop ? 'loop' : ''}
              ${muted ? 'muted' : ''}
              playsinline
              preload="metadata"
            >
              <source src="${getAssetUrl(videoSrc)}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            
            ${!showControls ? `
              <button class="video-play-btn" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80px;
                height: 80px;
                background: rgba(231, 76, 60, 0.8);
                border: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
              ">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            ` : ''}
          </div>
        `;
        
        // Initialize video functionality
     const video = this.el.querySelector('video');
        const playBtn = this.el.querySelector('.video-play-btn');
        const pulseEffect = this.el.querySelector('.pulse-effect');
        
       if (video && playBtn && pulseEffect) {
          // ऑटोप्ले के लिए चेक
          if (autoplay) {
            playBtn.classList.add('playing');
            pulseEffect.classList.add('active');
          }
          
          // इवेंट लिस्नर्स
          video.addEventListener('play', () => {
            playBtn.classList.add('playing');
            pulseEffect.classList.remove('active');
          });
          
          video.addEventListener('pause', () => {
            playBtn.classList.remove('playing');
            if (!video.ended) {
              pulseEffect.classList.add('active');
            }
          });
          
          video.addEventListener('ended', () => {
            playBtn.classList.remove('playing');
            pulseEffect.classList.add('active');
          });
        }
      } else {
        this.el.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            min-height: 200px;
            border: 2px dashed #ccc; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            background: #f9f9f9;
            cursor: pointer;
          ">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#3498db">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <polygon points="10,12 14,16 18,12" fill="currentColor"/>
              <line x1="14" y1="16" x2="14" y2="8" stroke="currentColor" stroke-width="2"/>
            </svg>
            <button class="video-upload-btn" style="
              margin-top: 15px;
              padding: 8px 16px;
              background: #3498db;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">
              Upload Video
            </button>
          </div>
        `;
      }
      
      return this;
    }
  }
});

  // Enhanced Image Component with Upload Functionality
  editor.DomComponents.addType('custom-image', {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['custom-image-container'],
        droppable: false,
        resizable: true,
        traits: [
          {
            type: 'text',
            name: 'alt',
            label: 'Alt Text',
            placeholder: 'Image description'
          },
          {
            type: 'select',
            name: 'object_fit',
            label: 'Image Fit',
            options: [
              { value: 'cover', name: 'Cover' },
              { value: 'contain', name: 'Contain' },
              { value: 'fill', name: 'Fill' },
              { value: 'none', name: 'None' }
            ],
            default: 'cover'
          }
        ],
        attributes: {
          'data-image-src': '',
        },
      },
    },
    
    view: {
      events: {
        // 'click .image-upload-btn': 'openImageUpload',
        // 'dblclick .image-upload-placeholder': 'openImageUpload',
      },
      
      init() {
        this.listenTo(this.model, 'change:attributes:data-image-src', this.render);
        this.listenTo(this.model, 'change:traits', this.render);
      },
      
      // openImageUpload() {
      //   createMediaUploadPopup('image', (src) => {
      //     this.model.set({
      //       attributes: {
      //         ...this.model.get('attributes'),
      //         'data-image-src': src,
      //       }
      //     });
      //   });
      // },
      
      render() {
        const imageSrc = this.model.get('attributes')['data-image-src'];
        const altText = this.model.getTrait('alt')?.get('value') || '';
        const objectFit = this.model.getTrait('object_fit')?.get('value') || 'cover';
        
        if (imageSrc) {
          this.el.innerHTML = `
            <img 
              src="${getAssetUrl(imageSrc)}"
              alt="${altText}"
              style="width: 100%; height: 100%; object-fit: ${objectFit}; display: block;"
              draggable="false"
            />
          `;
        } else {
          this.el.innerHTML = `
            <div style="
              width: 100%;
              height: 100%;
              min-height: 150px;
              border: 2px dashed #ccc; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              background: #f9f9f9;
              cursor: pointer;
            ">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#e74c3c">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
              <button class="image-upload-btn" style="
                margin-top: 15px;
                padding: 8px 16px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              ">
                Upload Image
              </button>
            </div>
          `;
        }
        
        return this;
      }
    }
  });

  // // Add video block to the Basic section
  // editor.BlockManager.add('custom-video', {
  //   label: 'Video',
  //   category: 'Basic',
  //   content: {
  //     type: 'custom-video',
  //     attributes: {
  //       'data-video-src': '',
  //     },
  //     traits: [
  //       { name: 'controls', value: true },
  //       { name: 'muted', value: true }
  //     ]
  //   },
  //   media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
  // });

  // // Add image block to the Basic section
  // editor.BlockManager.add('custom-image', {
  //   label: 'Image',
  //   category: 'Basic',
  //   content: {
  //     type: 'custom-image',
  //     attributes: {
  //       'data-image-src': '',
  //     }
  //   },
  //   media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5m16 1V5a2 2 0 0 0-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z"/></svg>`,
  // });



    // VSL Video Component
    bm.add("vsl-video", {
      label: "VSL Video",
      category: "Landing Page",
      content: {
        type: "video",
        provider: "yt",
        videoId: "dQw4w9WgXcQ",
        style: { 
          width: "100%", 
          "aspect-ratio": "16 / 9",
          "border-radius": "8px",
          "box-shadow": "0 5px 15px rgba(0,0,0,0.1)"
        },
        attributes: {
          "data-vsl": "true"
        }
      },
    });

    // WhatsApp Button Component
    bm.add("whatsapp-button", {
      label: "WhatsApp Button",
      category: "Landing Page",
      content: {
        tagName: "a",
        content: "Join on WhatsApp",
        attributes: {
          href: "https://chat.whatsapp.com/YourGroupInviteLink",
          target: "_blank",
          style: "display:inline-block;padding:15px 25px;background-color:#25D366;color:white;text-decoration:none;border-radius:8px;font-weight:bold;transition:all 0.3s;"
        },
      },
    });

    // CTA Button
    bm.add("cta-button", {
      label: "CTA Button",
      category: "Landing Page",
      content: {
        tagName: "a",
        content: "Get Started Now",
        attributes: {
          href: "#",
          style: "display:inline-block;padding:15px 30px;background-color:#e74c3c;color:white;text-decoration:none;border-radius:5px;font-weight:bold;font-size:1.1em;transition:all 0.3s;"
        },
      },
    });

    // Feature Box
    bm.add("feature-box", {
      label: "Feature Box",
      category: "Landing Page",
      content: {
        style: {
          "flex": "1",
          "min-width": "300px",
          "max-width": "350px",
          "margin": "20px",
          "padding": "30px",
          "background": "white",
          "border-radius": "8px",
          "box-shadow": "0 5px 15px rgba(0,0,0,0.05)",
          "text-align": "center"
        },
        components: [
          {
            type: "text",
            content: "<h3>Amazing Feature</h3><p>Description of this great feature that will benefit the user.</p>",
            style: { "margin": "0" }
          }
        ]
      },
    });

    // Testimonial Component
    bm.add("testimonial", {
      label: "Testimonial",
      category: "Landing Page",
      content: {
        style: {
          "background": "white",
          "padding": "30px",
          "border-radius": "8px",
          "box-shadow": "0 5px 15px rgba(0,0,0,0.05)",
          "max-width": "500px",
          "margin": "20px auto",
          "position": "relative"
        },
        components: [
          {
            type: "text",
            content: "<p style='font-style:italic;margin-bottom:20px;'>\"This product changed my life! I've never seen such amazing results before.\"</p>",
            style: { "margin": "0" }
          },
          {
            type: "text",
            content: "<p style='font-weight:bold;margin:0;'>- Satisfied Customer</p>",
            style: { "margin": "0" }
          }
        ]
      },
    });

    // Webinar Registration Form
    domc.addType('webinar-form', {
      model: {
        defaults: {
          tagName: 'form',
          attributes: { 
            style: 'font-family: Arial, sans-serif;',
            method: 'post'
          },
          components: [
            {
              type: 'text',
              content: '<h3 style="text-align:center;margin-bottom:20px;">Register for the Webinar</h3>',
              draggable: false
            },
            {
              tagName: 'div',
              attributes: { class: 'form-group' },
              components: [
                {
                  tagName: 'label',
                  attributes: { for: 'name' },
                  content: 'Full Name'
                },
                {
                  tagName: 'input',
                  attributes: { 
                    type: 'text', 
                    id: 'name', 
                    name: 'name',
                    required: 'required',
                    style: 'width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;'
                  }
                }
              ]
            },
            {
              tagName: 'div',
              attributes: { class: 'form-group' },
              components: [
                {
                  tagName: 'label',
                  attributes: { for: 'email' },
                  content: 'Email Address'
                },
                {
                  tagName: 'input',
                  attributes: { 
                    type: 'email', 
                    id: 'email', 
                    name: 'email',
                    required: 'required',
                    style: 'width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;'
                  }
                }
              ]
            },
            {
              tagName: 'button',
              attributes: { 
                type: 'submit',
                class: 'submit-btn',
                style: 'background:#4a89dc;color:white;border:none;padding:12px 20px;width:100%;border-radius:4px;cursor:pointer;font-size:1em;'
              },
              content: 'Register Now'
            }
          ]
        }
      }
    });

    bm.add('webinar-form', {
      label: 'Webinar Form',
      category: 'Landing Page',
      content: { type: 'webinar-form' }
    });

    // Countdown Timer
    bm.add('countdown-timer', {
      label: 'Countdown Timer',
      category: 'Landing Page',
      content: {
        type: 'countdown',
        attributes: {
          'data-end': '2025-12-31 23:59:59',
          style: 'font-size:24px;text-align:center;padding:20px;background:#f8f9fa;border-radius:8px;'
        }
      }
    });

// Popup Trigger Button
  // Popup Trigger Button
editor.BlockManager.add('bss-popup-form', {
  label: 'Popup Form',
  category: 'Lead Generation',
  content: `
    <div class="bss-popup-container">
      <!-- Trigger Button -->
      <button class="bss-trigger-btn" id="bss-trigger">
        <i class="fas fa-envelope"></i> Sign Up Now
      </button>
      
      <!-- Popup Modal -->
      <div class="bss-popup-modal" id="bss-popup">
        <div class="bss-popup-content">
          <span class="bss-close-btn">&times;</span>
          <div class="bss-popup-header">
            <h3>Join Our Community</h3>
            <p>Get exclusive updates and offers</p>
          </div>
          
          <form class="bss-form" id="bss-form">
            <div class="form-group">
              <input type="text" name="name" placeholder="Your Name" required>
            </div>
            <div class="form-group">
              <input type="email" name="email" placeholder="Your Email" required>
            </div>
            <div class="form-group">
              <input type="tel" name="phone" placeholder="Phone Number (Optional)">
            </div>
            <button type="submit" class="bss-submit-btn">
              <i class="fas fa-paper-plane"></i> Subscribe
            </button>
          </form>
          
          <div class="form-message" style="display:none; margin-top:15px;"></div>
          
          <div class="bss-popup-footer">
            <p>We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>
    </div>

    <style>
      .bss-popup-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .bss-trigger-btn {
        padding: 12px 24px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      
      .bss-trigger-btn:hover {
        background-color: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .bss-popup-modal {
        display: none !important;
        position: fixed !important;
        z-index: 99999 !important;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        animation: fadeIn 0.3s;
      }
      
      .bss-popup-modal.active {
        display: block !important;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .bss-popup-content {
        background-color: #fff;
        margin: 10% auto;
        padding: 30px;
        border-radius: 8px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        position: relative;
        z-index: 100000;
      }
      
      .bss-close-btn {
        position: absolute;
        top: 15px;
        right: 20px;
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .bss-close-btn:hover {
        color: #333;
      }
      
      .bss-popup-header {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .bss-popup-header h3 {
        color: #333;
        margin-bottom: 8px;
      }
      
      .bss-popup-header p {
        color: #666;
        font-size: 14px;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }
      
      .form-group input:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
      }
      
      .bss-submit-btn {
        width: 100%;
        padding: 12px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .bss-submit-btn:hover {
        background-color: #45a049;
      }
      
      .bss-popup-footer {
        margin-top: 20px;
        text-align: center;
        font-size: 12px;
        color: #999;
      }
      
      .form-message {
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
      }
      
      .form-message.success {
        background-color: #d4edda;
        color: #155724;
      }
      
      .form-message.error {
        background-color: #f8d7da;
        color: #721c24;
      }
      
      @media (max-width: 480px) {
        .bss-popup-content {
          margin: 20% auto;
          padding: 20px;
        }
      }
    </style>

    <script>
      (function(){function init(){const t=document.getElementById('bss-trigger'),p=document.getElementById('bss-popup'),c=document.querySelector('.bss-close-btn'),f=document.getElementById('bss-form'),m=document.querySelector('.form-message');if(!t||!p){setTimeout(init,100);return}const openPopup=function(e){if(e){e.preventDefault();e.stopPropagation()}if(p){p.style.display='block';p.style.zIndex='99999';p.classList.add('active');if(document.body)document.body.style.overflow='hidden'}console.log('Popup opened')};const closePopup=function(e){if(e){e.preventDefault();e.stopPropagation()}if(p){p.style.display='none';p.classList.remove('active');if(document.body)document.body.style.overflow=''}if(m)m.style.display='none'};if(t&&!t.dataset.listenerAttached){t.style.cursor='pointer';t.addEventListener('click',openPopup,true);t.addEventListener('mousedown',function(e){e.stopPropagation()},true);t.dataset.listenerAttached='true';console.log('Button listener attached')}if(c&&!c.dataset.listenerAttached){c.style.cursor='pointer';c.addEventListener('click',closePopup,true);c.dataset.listenerAttached='true'}if(p&&!p.dataset.listenerAttached){p.addEventListener('click',function(e){if(e.target===p||e.target.classList.contains('bss-popup-modal'))closePopup(e)},true);p.dataset.listenerAttached='true'}if(!window.bssPopupEscapeListener){window.addEventListener('keydown',function(e){if(e.key==='Escape'&&p&&p.style.display==='block')closePopup()});window.bssPopupEscapeListener=true}if(f&&!f.dataset.listenerAttached){f.addEventListener('submit',function(e){e.preventDefault();e.stopPropagation();const s=this.querySelector('button[type="submit"]'),o=s?s.innerHTML:'';if(s){s.innerHTML='<i class="fas fa-spinner fa-spin"></i> Processing...';s.disabled=true}const d={name:this.querySelector('input[name="name"]')?.value||'',email:this.querySelector('input[name="email"]')?.value||'',phone:this.querySelector('input[name="phone"]')?.value||'',timestamp:new Date().toISOString(),source:'Popup Form'};console.log('%c📝 POPUP FORM SUBMISSION DATA','color: #4CAF50; font-size: 16px; font-weight: bold;');console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━','color: #4CAF50');console.log('%c📋 Form Values:','color: #2196F3; font-weight: bold;');console.log('   🔹 Name:',d.name);console.log('   🔹 Email:',d.email);console.log('   🔹 Phone:',d.phone||'(Not provided)');console.log('%c⏱️ Submission Details:','color: #2196F3; font-weight: bold;');console.log('   🔹 Time:',new Date().toLocaleString());console.log('   🔹 Source:',d.source);console.log('%c✅ FORM DATA CAPTURED SUCCESSFULLY','color: #4CAF50; font-weight: bold;');console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━','color: #4CAF50');setTimeout(()=>{if(m){m.textContent='Thank you for subscribing!';m.className='form-message success';m.style.display='block'}f.reset();if(s){s.innerHTML=o;s.disabled=false}setTimeout(()=>{closePopup()},3000)},1000)});f.dataset.listenerAttached='true'}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{setTimeout(init,200)}})();
    </script>
  `,
  attributes: { class: 'bss-popup-element' },
  traits: [
    {
      type: 'text',
      name: 'trigger_text',
      label: 'Trigger Button Text',
      default: 'Sign Up Now'
    },
    {
      type: 'text',
      name: 'popup_title',
      label: 'Popup Title',
      default: 'Join Our Community'
    },
    {
      type: 'text',
      name: 'popup_subtitle',
      label: 'Popup Subtitle',
      default: 'Get exclusive updates and offers'
    },
    {
      type: 'text',
      name: 'submit_text',
      label: 'Submit Button Text',
      default: 'Subscribe'
    }
  ],
  media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>`
});



// This second part defines the component's logic and functionality.
// Update the popup-form-component in function.jsx
domc.addType('popup-form-component', {
  model: {
    defaults: {
      components: `
        <div class="popup-system">
          <button class="popup-trigger-btn">Click for Special Offer</button>
          <div class="popup-modal" style="display: none;">
            <div class="popup-content">
              <span class="popup-close">&times;</span>
              <h3>Special Offer!</h3>
              <p>Enter your details to claim your exclusive offer</p>
              <form class="lead-form">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" class="name-input" name="name" required>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" class="email-input" name="email" required>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" class="phone-input" name="phone" required>
                </div>
                <button type="submit" class="submit-btn">Claim Offer</button>
              </form>
              <div class="form-message" style="display: none;"></div>
            </div>
          </div>
        </div>
      `,
      styles: `
        .popup-system { font-family: Arial, sans-serif; }
        .popup-trigger-btn { padding: 12px 25px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; }
        .popup-trigger-btn:hover { background: #ff5252; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .popup-modal { display: none; position: fixed !important; z-index: 10000 !important; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .popup-content { background-color: white; margin: 10% auto; padding: 30px; border-radius: 10px; width: 90%; max-width: 500px; position: relative; z-index: 10001; box-shadow: 0 5px 30px rgba(0,0,0,0.3); animation: slideIn 0.4s ease-out; }
        @keyframes slideIn { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .popup-close { position: absolute; top: 15px; right: 25px; font-size: 28px; font-weight: bold; color: #aaa; cursor: pointer; transition: color 0.2s; }
        .popup-close:hover { color: #333; }
        .popup-content h3 { color: #2c3e50; margin-bottom: 10px; text-align: center; }
        .popup-content p { color: #7f8c8d; margin-bottom: 25px; text-align: center; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500; }
        .form-group input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box; transition: all 0.2s; }
        .form-group input:focus { outline: none; border-color: #ff6b6b; box-shadow: 0 0 0 2px rgba(255,107,107,0.2); }
        .submit-btn { width: 100%; padding: 14px; background-color: #ff6b6b; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.3s; }
        .submit-btn:hover { background-color: #ff5252; }
        .submit-btn:disabled { background-color: #ccc; cursor: not-allowed; }
        .form-message { margin-top: 20px; padding: 12px; border-radius: 5px; text-align: center; }
        .form-message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .form-message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      `,
      traits: [
        { 
          type: 'text', 
          name: 'api_endpoint', 
          label: 'API Endpoint URL', 
          default: 'https://your-api.com/submit-lead', 
          changeProp: 1 
        },
        { 
          type: 'text', 
          name: 'button_text', 
          label: 'Button Text', 
          default: 'Click for Special Offer', 
          changeProp: 1 
        },
        { 
          type: 'text', 
          name: 'popup_title', 
          label: 'Popup Title', 
          default: 'Special Offer!', 
          changeProp: 1 
        },
        { 
          type: 'text', 
          name: 'popup_description', 
          label: 'Popup Description', 
          default: 'Enter your details to claim your exclusive offer', 
          changeProp: 1 
        },
        { 
          type: 'select',
          name: 'redirect_page',
          label: 'Redirect After Submission',
          options: [
            { value: '', name: 'Same Page (No Redirect)' },
            { value: '/thank-you', name: 'Thank You Page' },
            { value: '/home', name: 'Home Page' },
            { value: '/offer', name: 'Offer Page' },
            { value: '/checkout', name: 'Checkout Page' }
          ],
          default: '',
          changeProp: 1
        },
        {
          type: 'checkbox',
          name: 'open_new_tab',
          label: 'Open In New Tab',
          changeProp: 1
        }
      ],
    }
  },
  view: {
    onRender() {
      const m=this.model,e=this.el;const init=()=>{const t=e.querySelector('.popup-trigger-btn'),p=e.querySelector('.popup-modal'),c=e.querySelector('.popup-close'),f=e.querySelector('.lead-form'),msgEl=e.querySelector('.form-message'),h3El=e.querySelector('h3'),dEl=e.querySelector('.popup-content > p');if(!t||!p){setTimeout(init,100);return}const u=()=>{if(t)t.innerText=m.get('button_text')||'Click for Special Offer';if(h3El)h3El.innerText=m.get('popup_title')||'Special Offer!';if(dEl)dEl.innerText=m.get('popup_description')||'Enter your details...'};this.listenTo(m,'change:button_text change:popup_title change:popup_description',u);u();const s=(msg,type)=>{if(msgEl){msgEl.style.display='block';msgEl.className=`form-message ${type}`;msgEl.textContent=msg}};const hide=()=>{if(msgEl){msgEl.style.display='none';msgEl.textContent=''}};const cl=(ev)=>{if(ev){ev.preventDefault();ev.stopPropagation()}if(p){p.style.display='none';p.style.zIndex='1000'}if(document.body)document.body.style.overflow='';hide()};const op=(ev)=>{if(ev){ev.preventDefault();ev.stopPropagation()}if(p){p.style.display='block';p.style.zIndex='10000';p.style.position='fixed';p.style.top='0';p.style.left='0';p.style.width='100%';p.style.height='100%'}if(document.body)document.body.style.overflow='hidden';hide();console.log('Popup opened')};if(t&&!t.dataset.listenerAttached){t.style.cursor='pointer';t.addEventListener('click',op,true);t.addEventListener('mousedown',function(ev){ev.stopPropagation()},true);t.dataset.listenerAttached='true';console.log('Trigger button listener attached')}if(c&&!c.dataset.listenerAttached){c.addEventListener('click',cl,true);c.style.cursor='pointer';c.dataset.listenerAttached='true'}if(p&&!p.dataset.listenerAttached){p.addEventListener('click',function(ev){if(ev.target===p||ev.target.classList.contains('popup-modal'))cl(ev)},true);p.dataset.listenerAttached='true'}if(f&&!f.dataset.listenerAttached){f.addEventListener('submit',async function(ev){ev.preventDefault();ev.stopPropagation();const api=m.get('api_endpoint'),rd=m.get('redirect_page'),nt=m.get('open_new_tab');console.log('Attempting to send data to API Endpoint:',api);console.log('Redirect settings:',{redirectPage:rd,openNewTab:nt});if(!api||api==='https://api.funnelseye.com/api/leads'||api==='https://your-api.com/submit-lead'){s('API Endpoint is not set. Please configure it in the component settings.','error');console.error('API Endpoint Error: API endpoint is not configured or is still the default placeholder.');return}const fd={name:this.querySelector('.name-input')?.value||'',email:this.querySelector('.email-input')?.value||'',phone:this.querySelector('.phone-input')?.value||'',source:'Website Popup',campaign:'Special Offer'};const sb=this.querySelector('.submit-btn');try{if(sb){sb.disabled=true;sb.textContent='Processing...'}hide();const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fd)});const res=await r.json();if(r.ok){s(res.message||'Thank you! Your information has been submitted.','success');f.reset();if(rd){setTimeout(()=>{if(nt)window.open(rd,'_blank');else window.location.href=rd},2000)}else{setTimeout(()=>cl(),3000)}}else{const em=res.message||`Failed to submit form. Status: ${r.status}`;throw new Error(em)}}catch(err){console.error('Form Submission Error:',err);s(err.message||'An error occurred. Please try again.','error')}finally{if(sb){sb.disabled=false;sb.textContent='Claim Offer'}}});f.dataset.listenerAttached='true'}};setTimeout(init,200)
    },
  }
});

// Add the block to the BlockManager
bm.add('popup-form', {
  label: 'Popup Form with Redirect',
  category: 'Lead Generation',
  content: { type: 'popup-form-component' },
  media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>`,
});


// **NEW: Add these functions for stage progression**
const progressToNextStage = () => {
  console.log('🚀 PROGRESSING TO NEXT STAGE...');
  
  // Find all possible sidebar elements (different forms might have different IDs)
  const sidebarSelectors = [
    '#sidebar-step-title',
    '.sidebar-title', 
    '[id*="sidebar"][id*="title"]'
  ];
  
  const subtitleSelectors = [
    '#sidebar-step-subtitle',
    '.sidebar-subtitle',
    '[id*="sidebar"][id*="subtitle"]'
  ];
  
  const progressSelectors = [
    '#sidebar-progress-indicator',
    '.sidebar-progress',
    '[id*="progress"]'
  ];
  
  // Try to find and update sidebar elements
  let sidebarTitle = null;
  let sidebarSubtitle = null;
  let progressIndicator = null;
  
  for (let selector of sidebarSelectors) {
    sidebarTitle = document.querySelector(selector);
    if (sidebarTitle) break;
  }
  
  for (let selector of subtitleSelectors) {
    sidebarSubtitle = document.querySelector(selector);
    if (sidebarSubtitle) break;
  }
  
  for (let selector of progressSelectors) {
    progressIndicator = document.querySelector(selector);
    if (progressIndicator) break;
  }
  
  if (sidebarTitle && sidebarSubtitle && progressIndicator) {
    console.log('📊 Updating sidebar elements...');
    
    // Update sidebar to show next stage
    sidebarTitle.textContent = '✅ Information Collected';
    sidebarSubtitle.textContent = 'Step 2 of 2 - Complete!';
    
    // Animate progress to 100%
    progressIndicator.style.transition = 'width 1.5s ease-in-out, background-color 0.5s ease';
    progressIndicator.style.width = '100%';
    progressIndicator.style.backgroundColor = '#28a745'; // Green for completion
    
    console.log('✅ Sidebar updated successfully');
    console.log('📈 Progress: 100% Complete');
  } else {
    console.log('⚠️ Sidebar elements not found, creating alternative notification');
  }
  
  // Show completion message regardless
  setTimeout(() => {
    showCompletionMessage();
  }, 1000);
};

const showCompletionMessage = () => {
  console.log('🎉 SHOWING COMPLETION MESSAGE');
  
  // Create success notification
  const completionDiv = document.createElement('div');
  completionDiv.id = 'lead-success-notification';
  completionDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
    z-index: 10001;
    font-weight: 600;
    font-size: 16px;
    max-width: 350px;
    animation: slideInBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-left: 5px solid #ffffff;
  `;
  
  completionDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <div>
        <div style="font-weight: bold; margin-bottom: 4px;">Success! 🎯</div>
        <div style="font-size: 14px; opacity: 0.9;">Lead information captured and processed</div>
      </div>
    </div>
  `;
  
  // Add animation styles if not already present
  if (!document.querySelector('#completion-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'completion-animation-styles';
    style.textContent = `
      @keyframes slideInBounce {
        0% { 
          transform: translateX(100%) scale(0.8); 
          opacity: 0; 
        }
        70% { 
          transform: translateX(-10px) scale(1.05); 
          opacity: 1; 
        }
        100% { 
          transform: translateX(0) scale(1); 
          opacity: 1; 
        }
      }
      @keyframes fadeOutRight {
        to { 
          transform: translateX(100%); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(completionDiv);
  
  console.log('🎊 Success notification displayed');
  console.log('⏱️ Auto-hide in 5 seconds');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    completionDiv.style.animation = 'fadeOutRight 0.5s ease-in-out forwards';
    setTimeout(() => {
      if (completionDiv.parentNode) {
        completionDiv.parentNode.removeChild(completionDiv);
      }
    }, 500);
  }, 5000);
  
  // Allow manual close on click
  completionDiv.addEventListener('click', () => {
    completionDiv.style.animation = 'fadeOutRight 0.3s ease-in-out forwards';
    setTimeout(() => {
      if (completionDiv.parentNode) {
        completionDiv.parentNode.removeChild(completionDiv);
      }
    }, 300);
  });
};

    
        bm.add('advanced-appointment-form', {
          label: 'Advanced Appointment Form',
          category: 'Integrations',
          content: `
          <style>/* ... (पिछली CSS के सभी स्टाइल यहाँ कॉपी करें) ... */

/* Overall page background matching the image */
.page-background {
  background-color: rgb(255, 174, 0); /* Purple background from image */
  min-height: 100vh;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

.form-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 25px;
  border-bottom: 1px solid #E9ECEF;
}

.logo-container .logo-text {
  font-weight: bold;
  font-size: 1.5em;
  color: rgb(255, 174, 0);
}

.user-info {
  display: flex;
  align-items: center;
  font-size: 0.9em;
  color: #495057;
}
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}
.dropdown-arrow { margin-left: 8px; font-size: 0.7em; }

.form-card-body { display: flex; flex-grow: 1; }

.sidebar {
  width: 250px;
  background-color: #F8F9FA;
  padding: 30px 25px;
  border-right: 1px solid #E9ECEF;
  display: flex;
  flex-direction: column;

}
.sidebar-icon-container { margin-bottom: 20px; color: rgb(255, 174, 0); }
.sidebar-title { font-size: 1.25em; color: #343A40; margin-top: 0; margin-bottom: 8px; }
.sidebar-subtitle { font-size: 0.85em; color: #6C757D; margin-bottom: 25px; }
.sidebar-progress-bar {
  width: 80%; /* Increased width for better visibility */
  height: 8px; /* Slightly thicker */
  background-color: #DEE2E6;
  border-radius: 4px;
  overflow: hidden;
}
.sidebar-progress {
  height: 100%;
  background-color: rgb(255, 174, 0);
  border-radius: 4px;
  transition: width 0.3s ease-in-out; /* Smooth transition for progress */
}

.main-content {
  flex-grow: 1;
  padding: 30px 35px;
  overflow-y: auto;
  max-height: calc(100vh - 160px); /* (Header + Padding + some buffer) */
}
.main-title { font-size: 1.75em; color: #343A40; margin-top: 0; margin-bottom: 25px; }

.appointment-form .form-section-title { /* For step titles like "Personal Details" */
  font-size: 1.2em; /* Made slightly larger */
  color: #343A40; /* Darker for more prominence */
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #E9ECEF;
}

.form-step-content-area {
  min-height: 300px; /* Ensure some min height for content switching */
}

.form-row { display: flex; gap: 20px; margin-bottom: 15px; }
.form-row .form-group { flex: 1; margin-bottom: 0; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: 600; font-size: 0.85em; margin-bottom: 8px; color: #495057; }

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #CED4DA;
  border-radius: 4px;
  font-size: 0.95em;
  box-sizing: border-box;
  background-color: #FFFFFF;
  color: #495057;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #80BDFF;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.form-group textarea { resize: vertical; min-height: 80px; }

.radio-group { display: flex; gap: 15px; flex-wrap: wrap; }
.radio-group label { font-weight: normal; font-size: 0.9em; display: inline-flex; align-items: center; cursor: pointer; }
.radio-group input[type="radio"] { margin-right: 6px; accent-color: rgb(255, 174, 0); }
.conditional-input { margin-top: 10px; }

.form-actions { margin-top: 30px; display: flex; justify-content: flex-end; gap: 12px; }
.form-actions button { padding: 10px 20px; border-radius: 4px; font-size: 0.9em; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, border-color 0.2s ease; }
.button-cancel { background-color: #F8F9FA; color: #6C757D; border: 1px solid #CED4DA; }
.button-cancel:hover { background-color: #E2E6EA; border-color: #DAE0E5; }
.button-next { background-color: rgb(255, 174, 0); color: white; border: 1px solid rgb(255, 174, 0); }
.button-next:hover { background-color: rgb(255, 174, 0); border-color: rgb(255, 174, 0); }
.form-actions button:first-child:not(:only-child) { /* If Back button exists */
    margin-right: auto; /* Pushes Back button to the left */
}


/* --- Styles for Calendar and Time Slots --- */
.calendar-wrapper {
  padding: 15px;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  margin-bottom: 25px;
  background-color: #FDFDFD; /* Slightly off-white for calendar background */
}
.calendar-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.current-month-year { font-size: 1.1em; font-weight: 600; color: #343A40; }
.nav-arrow {
  background: none; border: none; font-size: 1.4em; color: rgb(255, 174, 0); cursor: pointer; padding: 0 8px;
}
.nav-arrow:hover { color: #0056b3; }

.calendar-grid-headers, .calendar-grid-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}
.grid-header-cell { font-weight: 600; font-size: 0.8em; padding-bottom: 8px; color: #6C757D; }
.calendar-day {
  padding: 10px 5px;
  border: 1px solid transparent;
  background-color: #FFFFFF;
  color: #495057;
  cursor: pointer;
  font-size: 0.9em;
  position: relative;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
  margin: 1px;
  border-radius: 4px;
}
.calendar-day.empty { background-color: transparent; cursor: default; }
.calendar-day.unavailable, .calendar-day.past {
  color: #ADB5BD;
  background-color: #F1F3F5; /* Lighter grey for unavailable/past */
  cursor: not-allowed;
  text-decoration: line-through;
}
.calendar-day.available:hover { background-color: #E9ECEF; border-color: #CED4DA; }
.calendar-day.selected {
  background-color: rgb(255, 174, 0) !important;
  color: white !important;
  border-color: rgb(255, 174, 0) !important;
  font-weight: bold;
}
.availability-dot {
  height: 5px; width: 5px; background-color: #28A745; /* Green dot for availability */
  border-radius: 50%; display: block; margin: 3px auto 0;
}
.calendar-day.selected .availability-dot { background-color: white; }

.time-selector-wrapper { margin-top: 20px; }
.time-selector-title { font-size: 1em; font-weight: 600; margin-bottom: 10px; color: #343A40; }
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
}
.time-slot-btn {
  padding: 8px 10px;
  border: 1px solid #CED4DA;
  background-color: #FFFFFF;
  color: rgb(255, 174, 0);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  font-size: 0.9em;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.time-slot-btn:hover { background-color: #E9ECEF; border-color: rgb(255, 174, 0); }
.time-slot-btn.selected {
  background-color: rgb(255, 174, 0) !important;
  color: white !important;
  border-color: rgb(255, 174, 0) !important;
  font-weight: bold;
}

/* Review Section Styles */
.review-section {
  margin-bottom: 12px;
  font-size: 0.95em;
  line-height: 1.6;
}
.review-section strong {
  color: #343A40;
  min-width: 150px; /* Adjust for alignment if needed */
  display: inline-block;
}

/* Scrollbar and Responsive (from previous CSS) */
.main-content::-webkit-scrollbar { width: 8px; }
.main-content::-webkit-scrollbar-track { background: #F1F1F1; border-radius: 10px; }
.main-content::-webkit-scrollbar-thumb { background: #C0C0C0; border-radius: 10px; }
.main-content::-webkit-scrollbar-thumb:hover { background: #A0A0A0; }

@media (max-width: 768px) {
  .page-background { padding: 15px; }
  .form-card-body { flex-direction: column; }
  .sidebar { width: 100%; border-right: none; border-bottom: 1px solid #E9ECEF; padding: 20px; max-height: none; }
  .main-content { padding: 20px; max-height: none; }
  .form-row { flex-direction: column; gap: 0; }
  .form-row .form-group { margin-bottom: 15px; }
   .form-actions { flex-direction: column; }
  .form-actions button { width: 100%; }
  .form-actions button:first-child:not(:only-child) { margin-right: 0; margin-bottom: 10px; } /* Adjust for stacked buttons */
}


/* Black Theme with Orange Accents */
.page-background.dark-theme {
  background-color: #000000; /* Pure black */
}

.page-background.light-theme {
  background-color: #F3F4F6;
}

.dark-theme .form-card {
  background-color: #121212; /* Slightly lighter than pure black */
  color: #e0e0e0;
  border: 1px solid #333333;
}

.dark-theme .form-card-header {
  border-bottom-color: #333333;
  background-color: #121212;
}

.dark-theme .logo-text,
.dark-theme .main-title,
.dark-theme .form-section-title,
.dark-theme .sidebar-title {
  color: rgb(255, 174, 0); /* Orange headings */
}

.dark-theme .review-section strong {
  color: rgb(255, 174, 0); /* Orange for strong text */
}

.dark-theme .sidebar {
  background-color: #121212;
  border-right-color: #333333;
}

.dark-theme .form-group label,
.dark-theme .sidebar-subtitle {
  color: #b0b0b0;
}

.dark-theme .review-section {
  color: #d0d0d0;
}

.dark-theme input[type="text"],
.dark-theme input[type="email"],
.dark-theme input[type="tel"],
.dark-theme input[type="number"],
.dark-theme select,
.dark-theme textarea {
  background-color: #1e1e1e;
  border-color: #333333;
  color: #e0e0e0;
}

.dark-theme input:focus,
.dark-theme select:focus,
.dark-theme textarea:focus {
  border-color: rgb(255, 174, 0);
  box-shadow: 0 0 0 0.2rem rgba(255, 174, 0, 0.25);
}

.dark-theme .calendar-wrapper {
  background-color: #1e1e1e;
  border-color: #333333;
}

.dark-theme .calendar-day {
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.dark-theme .calendar-day.available:hover {
  background-color: #2a2a2a;
}

.dark-theme .calendar-day.selected {
  background-color: rgb(255, 174, 0) !important;
  color: #121212 !important;
  border-color: rgb(255, 174, 0) !important;
}

.dark-theme .calendar-day.unavailable,
.dark-theme .calendar-day.past {
  background-color: #2a2a2a;
  color: #707070;
}

.dark-theme .time-slot-btn {
  background-color: #1e1e1e;
  border-color: #333333;
  color: #e0e0e0;
}

.dark-theme .time-slot-btn.selected {
  background-color: rgb(255, 174, 0) !important;
  color: #121212 !important;
  border-color: rgb(255, 174, 0) !important;
}

.dark-theme .button-next {
  background-color: rgb(255, 174, 0);
  color: #121212;
  border-color: rgb(255, 174, 0);
}

.dark-theme .button-next:hover {
  background-color: rgb(255, 190, 50);
  border-color: rgb(255, 190, 50);
}

.dark-theme .button-cancel {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #333333;
}

.dark-theme .button-cancel:hover {
  background-color: #333333;
}

.dark-theme .radio-group input[type="radio"] {
  accent-color: rgb(255, 174, 0);
}

.dark-theme .sidebar-progress {
  background-color: rgb(255, 174, 0);
}

.dark-theme .availability-dot {
  background-color: rgb(255, 174, 0);
}

/* ... (Existing CSS) ... */

/* Sidebar improvements */
.sidebar {
  width: 300px; /* Aap ise 250px ya apni pasand se adjust kar sakte hain */
  /* Image ke अनुसार white background */
  border-right: 1px solid #E9ECEF;
  display: flex;
  flex-direction: column; /* Scrollable content aur cookie link ko stack karne ke liye */
  /* Agar form-card-body ki height main-content ke hisab se stretch hoti hai, toh sidebar bhi stretch hoga */
}

.sidebar-scrollable-content {
  flex-grow: 1; /* Bachi hui jagah lega */
  overflow-y: auto; /* Vertical scroll agar content zyada ho */
  padding: 25px;
  color: #343A40; /* Default text color */
}

/* Sidebar scrollbar styling (optional) */
.sidebar-scrollable-content::-webkit-scrollbar {
  width: 6px;
}
.sidebar-scrollable-content::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}
.sidebar-scrollable-content::-webkit-scrollbar-thumb {
  background: #cccccc;
  border-radius: 3px;
}
.sidebar-scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #aaaaaa;
}

.cookie-settings-container {
  padding: 15px 25px;
  border-top: 1px solid #E9ECEF; /* Separator */
  font-size: 0.85em;
  background-color: #FFFFFF; /* Ensures background consistency */
  flex-shrink: 0; /* Prevents shrinking */
  text-align: left; /* Ensure text is aligned left */
}

.cookie-settings-link {
  color: #6C757D; /* Image jaisa halka color */
  text-decoration: none;
}
.cookie-settings-link:hover {
  text-decoration: underline;
}

/* Content styling inside sidebar */
.sidebar-coach-name {
  font-size: 0.9em;
  color: #6C757D;
  margin-bottom: 4px;
}

.sidebar-main-assessment-title {
  font-size: 1.5em; /* Image ke bade title jaisa */
  font-weight: bold;
  color: #1f2d3d; /* Thoda gehra color */
  margin-bottom: 15px;
  line-height: 1.3;
}

.sidebar-info-item {
  display: flex;
  align-items: flex-start; /* Align items to the start for multi-line text */
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #495057;
}

.sidebar-info-item svg {
  margin-right: 8px;
  flex-shrink: 0; /* Icon ko shrink hone se bachaye */
  width: 18px; /* Explicit width */
  height: 18px; /* Explicit height */
  margin-top: 2px; /* Align with first line of text */
}

.sidebar-section-heading {
  font-size: 0.9em; /* Consistent with image's smaller headings */
  font-weight: bold;
  color: #1f2d3d;
  margin-top: 20px;
  margin-bottom: 8px;
}

.sidebar-list {
  list-style-position: outside;
  padding-left: 20px;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 0.85em; /* Thoda chhota text list ke liye */
  color: #495057;
  line-height: 1.5;
}

.sidebar-list-item {
  margin-bottom: 6px;
}

.sidebar-small-text {
  font-size: 0.85em; /* Consistent chhota text */
  color: #495057;
  line-height: 1.5;
  margin-bottom: 15px;
}

/* Dark Theme adjustments for new sidebar content */
.dark-theme .sidebar {
  background-color: #121212; /* Dark card background */
  border-right-color: #333333;
}

.dark-theme .sidebar-scrollable-content {
  color: #e0e0e0; /* Light text for dark background */
}
.dark-theme .sidebar-scrollable-content::-webkit-scrollbar-track {
  background: #2a2a2a;
}
.dark-theme .sidebar-scrollable-content::-webkit-scrollbar-thumb {
  background: #555555;
}
.dark-theme .sidebar-scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #777777;
}


.dark-theme .cookie-settings-container {
  background-color: #121212;
  border-top-color: #333333;
}

.dark-theme .cookie-settings-link {
  color: #a0a0a0; /* Lighter grey for dark theme */
}

.dark-theme .sidebar-coach-name {
  color: #a0a0a0;
}

.dark-theme .sidebar-main-assessment-title,
.dark-theme .sidebar-section-heading {
  color: #f0f0f0; /* Brighter white/off-white for headings */
}

.dark-theme .sidebar-info-item,
.dark-theme .sidebar-list,
.dark-theme .sidebar-small-text {
  color: #b0b0b0; /* Lighter grey for general text */
}

/* Ensure icons in dark theme also adapt if they use currentColor */
.dark-theme .sidebar-info-item svg {
  color: #b0b0b0; /* Match text color or use accent */
}

/* Ensure .form-card-body allows sidebar and main-content to define its height */
.form-card-body {
  display: flex;
  flex-grow: 1;
  /* align-items: stretch; /* Default, good */
}
/* --- Styles for Form Subsection Titles --- */
.form-subsection-title {
  font-size: 1.1em; /* Slightly smaller than form-section-title */
  color: #495057;   /* A bit softer than the main section title */
  margin-top: 25px; /* More top margin for separation */
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E9ECEF; /* Consistent with other borders */
  font-weight: 600; /* Make it semi-bold */
}

.dark-theme .form-subsection-title {
  color: #c0c0c0; /* Lighter grey for dark theme */
  border-bottom-color: #333333;
}

/* --- Styles for Congratulations Screen --- */
.congratulations-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px; /* Responsive padding */
  background-color: #FFFFFF;
  border-radius: 12px; /* Slightly more rounded */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 650px; 
  margin: 40px auto; /* Centered on the page-background */
  animation: fadeInScaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; /* Playful bounce */
  color: #343A40; /* Darker text for better readability */
}

.congratulations-container h2 {
  font-size: 2.2em; /* Adjusted size */
  color: rgb(255, 174, 0); /* Theme accent color */
  margin-bottom: 15px;
  font-weight: 700;
}

.congratulations-container p {
  font-size: 1.05em; /* Slightly larger paragraph text */
  color: #495057;
  margin-bottom: 12px;
  line-height: 1.7;
  max-width: 90%; /* Prevent text from being too wide */
}

.congratulations-container p strong {
    color: #343A40;
}

.congratulations-icon {
  color: rgb(255, 174, 0); /* Accent color for the icon */
  margin-bottom: 20px;
  animation: iconPop 0.5s 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards; /* Delayed pop with bounce */
}

@keyframes fadeInScaleUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes iconPop {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Dark theme adjustments for congratulations */
.dark-theme .congratulations-container {
  background-color: #1A1A1A; /* Darker card background */
  color: #e0e0e0;
  border: 1px solid #383838; /* Slightly more prominent border */
  box-shadow: 0 12px 30px rgba(255, 174, 0, 0.08); /* Subtle orange glow */
}
.dark-theme .congratulations-container h2 {
  color: rgb(255, 174, 0);
}
.dark-theme .congratulations-container p {
  color: #b0b0b0;
}
.dark-theme .congratulations-container p strong {
    color: #e0e0e0;
}
.dark-theme .congratulations-icon {
  color: rgb(255, 174, 0); /* Orange accent for dark theme icon too */
}

/* Ensure the page background accommodates the congratulations box if it's taller */
.page-background {
    min-height: 100vh;
    padding: 20px; /* Ensure some padding even on smaller screens */
    display: flex; /* Helps center the congratulations box if it's the only child */
    align-items: center; /* Vertically center if content is not too tall */
    justify-content: center;
}

/* --- Styles for NEW Enhanced Congratulations Screen --- */
.page-background { /* Ensure it's set up for centering */
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden; /* Hide confetti that goes off-screen */
}

.congratulations-container-wrapper {
  position: relative; /* For confetti positioning */
  perspective: 1000px; /* For 3D-ish effects if desired later */
}

.congratulations-container {
  position: relative; /* For z-index stacking of confetti */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 35px 25px;
  background-color: #FFFFFF;
  border-radius: 15px; /* Softer, more modern radius */
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0,0,0,0.07); /* Deeper shadow */
  width: 100%;
  max-width: 600px; /* Slightly narrower for a sleeker look */
  margin: 20px;
  color: #343A40;
  z-index: 10; /* Above confetti background if any */
  /* Entrance Animation */
  opacity: 0;
  transform: translateY(50px) scale(0.8);
  animation: energeticEntrance 0.8s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.congratulations-title { /* Renamed from h2 for clarity */
  font-size: 2.3em;
  color: rgb(255, 174, 0); /* Your theme accent */
  margin-bottom: 10px;
  font-weight: 700;
  animation: textGlow 1.5s ease-in-out infinite alternate; /* Subtle glow */
}

.congratulations-container p {
  font-size: 1em;
  color: #495057;
  margin-bottom: 10px;
  line-height: 1.6;
  max-width: 95%;
}

.congratulations-container p strong {
  color: #2c3e50; /* Slightly darker strong text */
}

.congratulations-icon {
  color: rgb(255, 174, 0);
  margin-bottom: 15px;
  transform: scale(0);
  opacity: 0;
  animation: iconCelebration 0.7s 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Keyframe Animations */
@keyframes energeticEntrance {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes iconCelebration {
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes textGlow {
  from {
    text-shadow: 0 0 5px rgba(255, 174, 0, 0.4), 0 0 10px rgba(255, 174, 0, 0.3);
  }
  to {
    text-shadow: 0 0 10px rgba(255, 174, 0, 0.6), 0 0 20px rgba(255, 174, 0, 0.4);
  }
}

/* Confetti Styles */
.confetti-burst-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible; /* Allow confetti to fly out */
  pointer-events: none; /* Don't interfere with clicks */
  z-index: 1; /* Behind the main content but visible */
}

.confetti-piece {
  position: absolute;
  opacity: 0; /* Start hidden */
  animation-name: confettiFall;
  animation-timing-function: linear; /* Consistent fall speed */
  animation-fill-mode: forwards;
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(0vh) rotate(0deg); /* Start from their random 'top' position */
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg); /* Fall down and rotate */
  }
}

/* Dark Theme Adjustments for Enhanced Congratulations */
.dark-theme .congratulations-container {
  background-color: #1E1E1E; /* Darker, richer background */
  color: #e0e0e0;
  border: 1px solid #333;
}
.dark-theme .congratulations-title {
  color: rgb(255, 174, 0);
  animation-name: textGlowDark; /* Different glow for dark theme if needed, or adjust existing */
}
.dark-theme .congratulations-container p {
  color: #b0b0b0;
}
.dark-theme .congratulations-container p strong {
  color: #dadada;
}
.dark-theme .congratulations-icon {
  color: rgb(255, 174, 0);
}

@keyframes textGlowDark { /* Optional: slightly different glow for dark */
  from {
    text-shadow: 0 0 8px rgba(255, 174, 0, 0.5), 0 0 15px rgba(255, 174, 0, 0.4);
  }
  to {
    text-shadow: 0 0 15px rgba(255, 174, 0, 0.7), 0 0 30px rgba(255, 174, 0, 0.5);
  }
}
</style>
          <div class="page-background light-theme">
            <div class="form-card" id="appointment-form-card">
              <header class="form-card-header">
                <div class="logo-container"><span class="logo-text">Your Brand</span></div>
                <div class="user-info"><img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" class="user-avatar" /></div>
              </header>
              <div class="form-card-body">
                <aside class="sidebar">
                  <div class="sidebar-scrollable-content">
                    <h3 style="margin: 0; padding: 0; font-size: 1.2rem; font-weight: 600;">Hi, Valued Guest!</h3>
                    <div class="sidebar-info-item" style="display: flex; align-items: center; gap: 8px; margin: 10px 0;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                      <span>30 min</span>
                    </div>
                    <div class="sidebar-info-item" style="display: flex; align-items: center; gap: 8px; margin: 10px 0;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 12H5V6h14v9zM8 12h8v2H8v-2z"/></svg>
                      <span>Web conferencing details provided upon confirmation.</span>
                    </div>
                    <h3 class="sidebar-title" id="sidebar-step-title">Schedule Slot</h3>
                    <p class="sidebar-subtitle" id="sidebar-step-subtitle">Step 1 of 2</p>
                    <div class="sidebar-progress-bar"><div class="sidebar-progress" id="sidebar-progress-indicator" style="width: 50%;"></div></div>
                  </div>
                </aside>
                <main class="main-content">
                  <h2 class="main-title">Book Your Free Health Assessment Call</h2>
                  <form class="appointment-form">
                    
                    <!-- Step 1: Schedule -->
                    <div class="form-step" id="form-step-1">
                      <h4 class="form-section-title">Select Date & Time</h4>
                      <div class="calendar-wrapper">
                        <div class="calendar-navigation">
                          <button type="button" class="nav-arrow" id="cal-prev-month">&lt;</button>
                          <h5 class="current-month-year" id="cal-month-year">Month Year</h5>
                          <button type="button" class="nav-arrow" id="cal-next-month">&gt;</button>
                        </div>
                        <div class="calendar-grid-headers">
                          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>
                        <div class="calendar-grid-days" id="cal-days-grid"></div>
                      </div>
                      <div class="time-selector-wrapper" id="time-selector-container" style="display: none;">
                        <h5 class="time-selector-title" id="time-selector-title">Available Times for...</h5>
                        <div class="time-slots-grid" id="time-slots-grid"></div>
                      </div>
                    </div>

                    <!-- Step 2: Additional Info -->
                    <div class="form-step" id="form-step-2" style="display: none;">
                      <h4 class="form-section-title">Complete Your Information</h4>
                      <h5 class="form-subsection-title">Personal Details</h5>
                      <div class="form-row">
                        <div class="form-group"><label>Full Name*</label><input type="text" name="fullName" required /></div>
                        <div class="form-group"><label>Email Address*</label><input type="email" name="emailAddress" required /></div>
                      </div>
                      <div class="form-row">
                        <div class="form-group"><label>WhatsApp Number*</label><input type="tel" name="whatsappNumber" required /></div>
                        <div class="form-group"><label>City & Country*</label><input type="text" name="cityCountry" required /></div>
                      </div>
                      <div class="form-row">
                        <div class="form-group"><label>Instagram/Facebook username</label><input type="text" name="socialMediaUsername" /></div>
                        <div class="form-group"><label>What is your age?*</label><input type="number" name="age" min="1" required /></div>
                      </div>
                      <h5 class="form-subsection-title">Health & Lifestyle Assessment</h5>
                      <div class="form-group"><label>Did you watch the full video before booking this call?*</label><div class="radio-group"><label><input type="radio" name="watchedVideo" value="Yes" required /> Yes</label><label><input type="radio" name="watchedVideo" value="No" /> No</label><label><input type="radio" name="watchedVideo" value="Soon" /> I plan to watch it soon</label></div></div>
                      <div class="form-group"><label>Current profession/daily routine?*</label><input type="text" name="currentProfession" required /></div>
                      <div class="form-group"><label>Main health goal?*</label><select name="mainHealthGoal" required><option value="">Select goal</option><option value="Weight Loss">Weight Loss</option><option value="Weight Gain">Weight Gain</option><option value="Muscle Building">Muscle Building</option><option value="Other">Other</option></select></div>
                      <div class="form-group"><label>Any medical conditions/lifestyle diseases?*</label><div class="radio-group"><label><input type="radio" name="medicalConditions" value="Yes" required /> Yes</label><label><input type="radio" name="medicalConditions" value="No" checked /> No</label></div></div>
                    </div>

                    <div class="form-actions" id="form-actions-container">
                      <button type="button" class="button-cancel" id="btn-back" style="display: none;">Back</button>
                      <button type="button" class="button-next" id="btn-next">Next &rarr;</button>
                      <button type="button" class="button-next" id="btn-submit" style="display: none;">Confirm & Submit Booking</button>
                    </div>
                  </form>
                </main>
              </div>
            </div>
            
            <!-- Congratulations Screen -->
            <div class="congratulations-container-wrapper" id="congrats-screen" style="display: none;">
              <div class="congratulations-container">
                <div class="confetti-burst-container" id="confetti-container"></div>
                <svg class="congratulations-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h2 class="congratulations-title" id="congrats-name">Congratulations!</h2>
                <p>Your Free Health Assessment Call is successfully booked for:</p>
                <p><strong>Date:</strong> <span id="congrats-date"></span></p>
                <p><strong>Time:</strong> <span id="congrats-time"></span></p>
                <p>We're excited to speak with you and will send a confirmation email to <strong id="congrats-email"></strong> shortly.</p>
              </div>
            </div>
          </div>
          
          <script>
            (() => {
              // Self-contained script to avoid scope issues
              const formWrapper = document.querySelector('.page-background');
              if (!formWrapper) return;

              // --- DOM ELEMENT SELECTION ---
              const formCard = formWrapper.querySelector('#appointment-form-card');
              const congratsScreen = formWrapper.querySelector('#congrats-screen');
              const step1Div = formWrapper.querySelector('#form-step-1');
              const step2Div = formWrapper.querySelector('#form-step-2');
              const btnNext = formWrapper.querySelector('#btn-next');
              const btnBack = formWrapper.querySelector('#btn-back');
              const btnSubmit = formWrapper.querySelector('#btn-submit');
              const sidebarTitle = formWrapper.querySelector('#sidebar-step-title');
              const sidebarSubtitle = formWrapper.querySelector('#sidebar-step-subtitle');
              const progressIndicator = formWrapper.querySelector('#sidebar-progress-indicator');
              const calMonthYear = formWrapper.querySelector('#cal-month-year');
              const calDaysGrid = formWrapper.querySelector('#cal-days-grid');
              const calPrevBtn = formWrapper.querySelector('#cal-prev-month');
              const calNextBtn = formWrapper.querySelector('#cal-next-month');
              const timeSelectorContainer = formWrapper.querySelector('#time-selector-container');
              const timeSelectorTitle = formWrapper.querySelector('#time-selector-title');
              const timeSlotsGrid = formWrapper.querySelector('#time-slots-grid');
              
              // --- STATE MANAGEMENT ---
              let currentStep = 1;
              const totalSteps = 2;
              let selectedMonthDate = new Date();
              const formData = {
                bookingDate: '', bookingTime: '', fullName: 'Valued Guest', emailAddress: ''
              };

              const availableDates = (() => {
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();
                let dates = {};
                for (let i = 0; i <= 10; i++) {
                    const dayCandidate = new Date(currentYear, currentMonth, today.getDate() + i);
                    const dateStr = \`\${dayCandidate.getFullYear()}-\${String(dayCandidate.getMonth() + 1).padStart(2, '0')}-\${String(dayCandidate.getDate()).padStart(2, '0')}\`;
                    dates[dateStr] = ['09:00', '11:30', '14:00', '16:30'];
                }
                return dates;
              })();

              // --- UI UPDATE FUNCTIONS ---
              const updateUI = () => {
                step1Div.style.display = currentStep === 1 ? 'block' : 'none';
                step2Div.style.display = currentStep === 2 ? 'block' : 'none';
                btnBack.style.display = currentStep > 1 ? 'inline-block' : 'none';
                btnNext.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
                btnSubmit.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
                
                sidebarTitle.textContent = currentStep === 1 ? 'Schedule Slot' : 'Your Information';
                sidebarSubtitle.textContent = \`Step \${currentStep} of \${totalSteps}\`;
                progressIndicator.style.width = \`\${(currentStep / totalSteps) * 100}%\`;
              };

              const renderCalendar = (monthDate) => {
                const year = monthDate.getFullYear();
                const month = monthDate.getMonth();
                calMonthYear.textContent = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                calDaysGrid.innerHTML = '';
                
                const today = new Date();
                today.setHours(0,0,0,0);
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDayOfMonth = new Date(year, month, 1).getDay();

                for (let i = 0; i < firstDayOfMonth; i++) {
                  calDaysGrid.insertAdjacentHTML('beforeend', '<div class="calendar-day empty"></div>');
                }

                for (let day = 1; day <= daysInMonth; day++) {
                  const currentDateObj = new Date(year, month, day);
                  const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
                  const isAvailable = availableDates[dateStr] && availableDates[dateStr].length > 0;
                  const isSelected = formData.bookingDate === dateStr;
                  const isPast = currentDateObj < today;
                  
                  const dayBtn = document.createElement('button');
                  dayBtn.type = 'button';
                  dayBtn.className = 'calendar-day';
                  if (isPast) dayBtn.classList.add('past');
                  else if (isAvailable) dayBtn.classList.add('available');
                  else dayBtn.classList.add('unavailable');
                  if (isSelected) dayBtn.classList.add('selected');

                  dayBtn.textContent = day;
                  dayBtn.dataset.date = dateStr;
                  dayBtn.disabled = !isAvailable || isPast;
                  if(isAvailable && !isPast) {
                    dayBtn.insertAdjacentHTML('beforeend', '<span class="availability-dot"></span>');
                  }
                  calDaysGrid.appendChild(dayBtn);
                }
              };

              const renderTimeSlots = (dateStr) => {
                const times = availableDates[dateStr] || [];
                timeSlotsGrid.innerHTML = '';
                if (times.length > 0) {
                  timeSelectorTitle.textContent = \`Available Times for \${new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}\`;
                  times.forEach(time => {
                    const timeBtn = document.createElement('button');
                    timeBtn.type = 'button';
                    timeBtn.className = 'time-slot-btn';
                    if (formData.bookingTime === time) timeBtn.classList.add('selected');
                    timeBtn.textContent = time;
                    timeBtn.dataset.time = time;
                    timeSlotsGrid.appendChild(timeBtn);
                  });
                  timeSelectorContainer.style.display = 'block';
                } else {
                  timeSelectorContainer.style.display = 'none';
                }
              };

              const triggerConfetti = () => {
                const container = formWrapper.querySelector('#confetti-container');
                container.innerHTML = '';
                const colors = ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32', '#FF4500', '#9370DB'];
                for (let i = 0; i < 50; i++) {
                  const piece = document.createElement('div');
                  piece.className = 'confetti-piece';
                  piece.style.left = \`\${Math.random() * 100}%\`;
                  piece.style.top = \`\${Math.random() * -50 - 50}%\`;
                  piece.style.width = \`\${Math.random() * 8 + 4}px\`;
                  piece.style.height = \`\${Math.random() * 10 + 5}px\`;
                  piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                  piece.style.transform = \`rotate(\${Math.random() * 360}deg)\`;
                  piece.style.animationDelay = \`\${Math.random() * 0.5}s\`;
                  piece.style.animationDuration = \`\${Math.random() * 2 + 2}s\`;
                  container.appendChild(piece);
                }
              };

              // --- EVENT HANDLERS ---
              calPrevBtn.addEventListener('click', () => {
                selectedMonthDate.setMonth(selectedMonthDate.getMonth() - 1);
                renderCalendar(selectedMonthDate);
              });
              calNextBtn.addEventListener('click', () => {
                selectedMonthDate.setMonth(selectedMonthDate.getMonth() + 1);
                renderCalendar(selectedMonthDate);
              });

              calDaysGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('available')) {
                  formData.bookingDate = e.target.dataset.date;
                  formData.bookingTime = ''; // Reset time
                  renderCalendar(selectedMonthDate); // Re-render to show selection
                  renderTimeSlots(formData.bookingDate);
                }
              });

              timeSlotsGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('time-slot-btn')) {
                  formData.bookingTime = e.target.dataset.time;
                  renderTimeSlots(formData.bookingDate); // Re-render to show selection
                }
              });

              btnNext.addEventListener('click', () => {
                if (currentStep === 1 && (!formData.bookingDate || !formData.bookingTime)) {
                  alert('Please select a date and time.');
                  return;
                }
                if (currentStep < totalSteps) {
                  currentStep++;
                  updateUI();
                }
              });

              btnBack.addEventListener('click', () => {
                if (currentStep > 1) {
                  currentStep--;
                  updateUI();
                }
              });

              btnSubmit.addEventListener('click', () => {
                // Simplified validation for demo
                const inputs = step2Div.querySelectorAll('input[required], select[required]');
                let isValid = true;
                inputs.forEach(input => {
                  if (!input.value) isValid = false;
                  // Store data
                  if (input.name) formData[input.name] = input.value;
                });
                
                if (!isValid) {
                  alert('Please fill all required fields.');
                  return;
                }
                
                formWrapper.querySelector('#congrats-name').textContent = \`Congratulations, \${formData.fullName}!\`;
                formWrapper.querySelector('#congrats-date').textContent = new Date(formData.bookingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                formWrapper.querySelector('#congrats-time').textContent = formData.bookingTime;
                formWrapper.querySelector('#congrats-email').textContent = formData.emailAddress;
                
                formCard.style.display = 'none';
                congratsScreen.style.display = 'flex';
                triggerConfetti();
              });

              // --- INITIALIZATION ---
              renderCalendar(selectedMonthDate);
              updateUI();
            })();
          </script>
          `,
          media: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path><path d="m16 16-2-2-4 4"></path></svg>`,
        });

        
      // ==================== LAYOUT COMPONENTS ====================
      
      // 2 Column Layout
      bm.add('two-columns', {
        label: '2 Columns',
        category: 'Layout',
        content: `
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px; padding: 20px; background: #f5f5f5; border: 2px dashed #ccc;">
              <p>Column 1 - Add content here</p>
            </div>
            <div style="flex: 1; min-width: 250px; padding: 20px; background: #f5f5f5; border: 2px dashed #ccc;">
              <p>Column 2 - Add content here</p>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,3H11V21H3V3M13,3H21V21H13V3Z"/></svg>`,
      });

      // 3 Column Layout
      bm.add('three-columns', {
        label: '3 Columns',
        category: 'Layout',
        content: `
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px; padding: 20px; background: #f5f5f5; border: 2px dashed #ccc;">
              <p>Column 1</p>
            </div>
            <div style="flex: 1; min-width: 200px; padding: 20px; background: #f5f5f5; border: 2px dashed #ccc;">
              <p>Column 2</p>
            </div>
            <div style="flex: 1; min-width: 200px; padding: 20px; background: #f5f5f5; border: 2px dashed #ccc;">
              <p>Column 3</p>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2,3H8V21H2V3M9,3H15V21H9V3M16,3H22V21H16V3Z"/></svg>`,
      });

      // 4 Column Layout
      bm.add('four-columns', {
        label: '4 Columns',
        category: 'Layout',
        content: `
          <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px; padding: 15px; background: #f5f5f5; border: 2px dashed #ccc; text-align: center;">
              <p>Column 1</p>
            </div>
            <div style="flex: 1; min-width: 150px; padding: 15px; background: #f5f5f5; border: 2px dashed #ccc; text-align: center;">
              <p>Column 2</p>
            </div>
            <div style="flex: 1; min-width: 150px; padding: 15px; background: #f5f5f5; border: 2px dashed #ccc; text-align: center;">
              <p>Column 3</p>
            </div>
            <div style="flex: 1; min-width: 150px; padding: 15px; background: #f5f5f5; border: 2px dashed #ccc; text-align: center;">
              <p>Column 4</p>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2,3H6V21H2V3M7,3H11V21H7V3M12,3H16V21H12V3M17,3H21V21H17V3Z"/></svg>`,
      });

      // Container
      bm.add('container', {
        label: 'Container',
        category: 'Layout',
        content: `
          <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <p>Add your content inside this container</p>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2,3H22V21H2V3M4,5V19H20V5H4Z"/></svg>`,
      });

      // ==================== TEXT & HEADINGS ====================
      
      bm.add('heading-h1', {
        label: 'Heading 1',
        category: 'Text',
        content: '<h1 style="font-size: 2.5em; font-weight: bold; margin: 20px 0;">Heading 1</h1>',
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,7H9V5H3V7M3,13H9V11H3V13M3,19H9V17H3V19M11,19H21V17H11V19M11,13H21V11H11V13M11,7H21V5H11V7Z"/></svg>`,
      });

      bm.add('heading-h2', {
        label: 'Heading 2',
        category: 'Text',
        content: '<h2 style="font-size: 2em; font-weight: bold; margin: 18px 0;">Heading 2</h2>',
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,7H9V5H3V7M3,13H9V11H3V13M3,19H9V17H3V19M11,19H21V17H11V19M11,13H21V11H11V13M11,7H21V5H11V7Z"/></svg>`,
      });

      bm.add('paragraph', {
        label: 'Paragraph',
        category: 'Text',
        content: '<p style="line-height: 1.6; margin: 15px 0;">This is a paragraph. Double click to edit the text and customize the styling.</p>',
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,4A4,4 0 0,1 17,8A4,4 0 0,1 13,12H11V18H9V4H13M13,10A2,2 0 0,0 15,8A2,2 0 0,0 13,6H11V10H13Z"/></svg>`,
      });

      bm.add('quote', {
        label: 'Quote',
        category: 'Text',
        content: `
          <blockquote style="border-left: 4px solid #4CAF50; padding-left: 20px; margin: 20px 0; font-style: italic; color: #555;">
            "This is a quote. Edit this text to add your own inspiring quote or testimonial."
          </blockquote>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/></svg>`,
      });

      // ==================== BUTTONS ====================
      
      bm.add('primary-button', {
        label: 'Primary Button',
        category: 'Buttons',
        content: `
          <a href="#" style="display: inline-block; padding: 15px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; transition: all 0.3s;">
            Click Me
          </a>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5L16,12L10,7.5V16.5Z"/></svg>`,
      });

      bm.add('outline-button', {
        label: 'Outline Button',
        category: 'Buttons',
        content: `
          <a href="#" style="display: inline-block; padding: 15px 30px; background-color: transparent; color: #4CAF50; text-decoration: none; border: 2px solid #4CAF50; border-radius: 5px; font-weight: 600; transition: all 0.3s;">
            Learn More
          </a>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>`,
      });

      bm.add('rounded-button', {
        label: 'Rounded Button',
        category: 'Buttons',
        content: `
          <a href="#" style="display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s;">
            Get Started
          </a>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M10,16.5L16,12L10,7.5V16.5Z"/></svg>`,
      });

      // WhatsApp Button
      bm.add('whatsapp-button', {
        label: 'WhatsApp Button',
        category: 'Buttons',
        content: `
          <a href="https://wa.me/1234567890" target="_blank" style="display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; background-color: #25D366; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; box-shadow: 0 4px 15px rgba(37,211,102,0.3); transition: all 0.3s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.41 4.93L2.06 22l5.32-1.48c1.37.81 2.96 1.29 4.66 1.29 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"/>
            </svg>
            Chat on WhatsApp
          </a>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.41 4.93L2.06 22l5.32-1.48c1.37.81 2.96 1.29 4.66 1.29 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"/></svg>`,
      });

      // ==================== CARDS ====================
      
      bm.add('basic-card', {
        label: 'Basic Card',
        category: 'Cards',
        content: `
          <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Card Title</h3>
            <p style="color: #666; line-height: 1.6;">This is a card component. Add your content here.</p>
            <a href="#" style="color: #4CAF50; text-decoration: none; font-weight: 600;">Learn More →</a>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/></svg>`,
      });

      bm.add('icon-card', {
        label: 'Icon Card',
        category: 'Cards',
        content: `
          <div style="background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 35px; text-align: center; margin: 20px 0; transition: all 0.3s;">
            <div style="width: 60px; height: 60px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 10px 0; color: #333;">Feature Title</h3>
            <p style="color: #666; line-height: 1.6; margin: 0;">Describe your amazing feature here.</p>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21,16V4H3V16H21M21,2A2,2 0 0,1 23,4V16A2,2 0 0,1 21,18H14V20H16V22H8V20H10V18H3C1.89,18 1,17.1 1,16V4C1,2.89 1.89,2 3,2H21Z"/></svg>`,
      });

      bm.add('pricing-card', {
        label: 'Pricing Card',
        category: 'Cards',
        content: `
          <div style="background: white; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.1); padding: 40px 30px; text-align: center; max-width: 350px; margin: 20px auto; border: 2px solid #f0f0f0;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 1.5em;">Basic Plan</h3>
            <div style="margin: 20px 0;">
              <span style="font-size: 3em; font-weight: bold; color: #4CAF50;">$29</span>
              <span style="color: #999;">/month</span>
            </div>
            <ul style="list-style: none; padding: 0; margin: 25px 0; text-align: left;">
              <li style="padding: 10px 0; color: #666;">✓ Feature 1</li>
              <li style="padding: 10px 0; color: #666;">✓ Feature 2</li>
              <li style="padding: 10px 0; color: #666;">✓ Feature 3</li>
            </ul>
            <a href="#" style="display: block; padding: 15px; background: #4CAF50; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px;">Choose Plan</a>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/></svg>`,
      });

      // ==================== NAVIGATION ====================
      
      bm.add('navbar', {
        label: 'Navigation Bar',
        category: 'Navigation',
        content: `
          <nav style="background: #333; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div style="color: white; font-size: 1.5em; font-weight: bold;">Logo</div>
            <div style="display: flex; gap: 25px; flex-wrap: wrap;">
              <a href="#" style="color: white; text-decoration: none; transition: opacity 0.3s;">Home</a>
              <a href="#" style="color: white; text-decoration: none; transition: opacity 0.3s;">About</a>
              <a href="#" style="color: white; text-decoration: none; transition: opacity 0.3s;">Services</a>
              <a href="#" style="color: white; text-decoration: none; transition: opacity 0.3s;">Contact</a>
            </div>
          </nav>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/></svg>`,
      });

      bm.add('breadcrumb', {
        label: 'Breadcrumb',
        category: 'Navigation',
        content: `
          <div style="padding: 15px 0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <a href="#" style="color: #4CAF50; text-decoration: none;">Home</a>
            <span style="color: #999;">›</span>
            <a href="#" style="color: #4CAF50; text-decoration: none;">Category</a>
            <span style="color: #999;">›</span>
            <span style="color: #666;">Current Page</span>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/></svg>`,
      });

      // ==================== DIRECT FORM WITH CTA ====================
      
      bm.add('direct-form-with-cta', {
        label: 'Direct Form with CTA',
        category: 'Forms',
        content: `
          <div class="direct-form-cta-wrapper" style="margin: 40px 0;">
            <!-- CTA Button Section -->
            <div class="cta-button-section" style="text-align: center; margin-bottom: 50px;">
              <button 
                class="scroll-to-form-cta" 
                onclick="var f=document.querySelector('[id^=direct-form-target]')||document.querySelector('.bss-direct-form-container');if(f){f.scrollIntoView({behavior:'smooth',block:'start'});}"
                style="
                  background: linear-gradient(135deg, #FFAE00 0%, #F54200 100%);
                  color: white;
                  border: none;
                  padding: 20px 50px;
                  font-size: 1.3em;
                  font-weight: 700;
                  border-radius: 50px;
                  cursor: pointer;
                  box-shadow: 0 10px 30px rgba(255, 174, 0, 0.4);
                  transition: all 0.3s ease;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                "
                onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 15px 40px rgba(255, 174, 0, 0.6)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 10px 30px rgba(255, 174, 0, 0.4)';"
              >
                Get Free Access Now →
              </button>
            </div>

            <!-- Direct Form Section -->
            <div class="bss-direct-form-container" id="direct-form-target" data-redirect-page="" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 0;">
              <div class="bss-form-content" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); border: 1px solid rgba(255,174,0,0.2); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #FFAE00 0%, #F54200 100%);"></div>
                
                <div class="bss-form-header" style="text-align: center; margin-bottom: 30px;">
                  <h4 style="color: #FFAE00; font-size: 1em; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Get Free Access</h4>
                  <h2 style="color: #333; font-size: 2em; font-weight: 700; margin: 0 0 10px 0;">Claim Your FREE Training Access</h2>
                  <p style="color: #666; font-size: 0.95em; margin: 0;">⚠️ Limited to Serious Professionals Only</p>
                </div>
                
                <form class="bss-direct-form" data-redirect-page="" data-redirect-set="true" onsubmit="return false;" style="margin: 0;">
                  <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                      <label for="name" style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.9em;">Full Name*</label>
                      <input type="text" id="name" name="name" placeholder="Enter your full name" required style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; box-sizing: border-box; transition: border-color 0.3s;" onfocus="this.style.borderColor='#FFAE00';" onblur="this.style.borderColor='#e0e0e0';">
                    </div>
                    <div class="form-group">
                      <label for="email" style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.9em;">Email Address*</label>
                      <input type="email" id="email" name="email" placeholder="your@email.com" required style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; box-sizing: border-box; transition: border-color 0.3s;" onfocus="this.style.borderColor='#FFAE00';" onblur="this.style.borderColor='#e0e0e0';">
                    </div>
                  </div>
                  
                  <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="form-group">
                      <label for="phone" style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.9em;">Phone Number*</label>
                      <div class="phone-input-group" style="display: flex; gap: 10px;">
                        <select name="countryCode" class="country-code-select" required style="padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; background: white; cursor: pointer; min-width: 100px;">
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+61">+61</option>
                          <option value="+49">+49</option>
                          <option value="+33">+33</option>
                          <option value="+81">+81</option>
                          <option value="+86">+86</option>
                        </select>
                        <input type="tel" id="phone" name="phone" placeholder="98765 43210" required style="flex: 1; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; box-sizing: border-box; transition: border-color 0.3s;" onfocus="this.style.borderColor='#FFAE00';" onblur="this.style.borderColor='#e0e0e0';">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="city" style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.9em;">City</label>
                      <input type="text" id="city" name="city" placeholder="Your city" style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; box-sizing: border-box; transition: border-color 0.3s;" onfocus="this.style.borderColor='#FFAE00';" onblur="this.style.borderColor='#e0e0e0';">
                    </div>
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 20px;">
                    <label for="country" style="display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 0.9em;">Country</label>
                    <input type="text" id="country" name="country" placeholder="Your country" required readonly style="width: 100%; padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; box-sizing: border-box; background: #f5f5f5;">
                    <small class="form-helper-text" style="display: block; margin-top: 5px; color: #666; font-size: 0.85em;">Country will be automatically filled based on your phone country code selection</small>
                  </div>
                  
                  <button type="submit" class="bss-submit-btn" style="width: 100%; padding: 18px; background: linear-gradient(135deg, #FFAE00 0%, #F54200 100%); color: white; border: none; border-radius: 10px; font-size: 1.1em; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 5px 20px rgba(255, 174, 0, 0.3); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(255, 174, 0, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 20px rgba(255, 174, 0, 0.3)';">
                    GET FREE ACCESS NOW →
                  </button>
                </form>
                
                <div class="form-message" style="display:none; margin-top:15px; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600;"></div>
                
                <div class="bss-form-footer" style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                  <div class="form-features" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="form-feature" style="display: flex; align-items: center; gap: 12px;">
                      <span style="color: #4CAF50; font-size: 1.2em;">✓</span>
                      <span style="color: #666; font-size: 0.95em;">Instant access to complete training series</span>
                    </div>
                    <div class="form-feature" style="display: flex; align-items: center; gap: 12px;">
                      <span style="color: #4CAF50; font-size: 1.2em;">✓</span>
                      <span style="color: #666; font-size: 0.95em;">Your information is secure and private</span>
                    </div>
                    <div class="form-feature" style="display: flex; align-items: center; gap: 12px;">
                      <span style="color: #4CAF50; font-size: 1.2em;">✓</span>
                      <span style="color: #666; font-size: 0.95em;">Limited time offer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/></svg>`,
      });

  // Enhanced PDF Download Block with Popup Form
  bm.add('pdf-download-block', {
  label: 'PDF Download with Email Capture',
  category: 'Lead Generation',
  content: `
    <div class="pdf-download-container">
      <button class="pdf-download-btn" id="pdf-download-trigger">
        <i class="fas fa-file-pdf"></i> <span class="btn-text">Download Free E-book</span>
      </button>
  
      <div class="pdf-download-modal" id="pdf-download-modal">
        <div class="pdf-download-modal-content">
          <span class="pdf-download-close">&times;</span>
          <div class="pdf-download-icon">
            <i class="fas fa-file-pdf"></i>
          </div>
          <h3 class="modal-title">Get Your Free E-book</h3>
          <p class="modal-description">Enter your email to download the PDF</p>
          <form id="pdf-download-form">
            <div class="form-group">
              <input type="email" name="email" placeholder="Your best email" required>
            </div>
            <div class="form-group">
              <input type="text" name="name" placeholder="Your name">
            </div>
            <button type="submit" class="download-submit-btn">
              <i class="fas fa-download"></i> Download Now
            </button>
            <div class="form-message" style="display:none; margin-top:15px;"></div>
          </form>
          <p class="privacy-text">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </div>

    <style>
      .pdf-download-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .pdf-download-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 28px;
        background-color: #d9534f;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1.1em;
        box-shadow: 0 4px 15px rgba(217,83,79,0.3);
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        gap: 10px;
      }
      
      .pdf-download-btn:hover {
        background-color: #c9302c;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(217,83,79,0.4);
      }
      
      .pdf-download-btn i {
        font-size: 1.2em;
      }
      
      .pdf-download-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        animation: fadeIn 0.3s;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .pdf-download-modal-content {
        background-color: white;
        margin: 10% auto;
        padding: 30px;
        border-radius: 12px;
        width: 90%;
        max-width: 450px;
        text-align: center;
        position: relative;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      
      .pdf-download-close {
        position: absolute;
        top: 15px;
        right: 25px;
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .pdf-download-close:hover {
        color: #333;
      }
      
      .pdf-download-icon {
        font-size: 3em;
        color: #d9534f;
        margin-bottom: 15px;
      }
      
      .pdf-download-modal h3 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-size: 1.5em;
      }
      
      .pdf-download-modal p {
        color: #7f8c8d;
        margin-bottom: 25px;
      }
      
      .pdf-download-modal .form-group {
        margin-bottom: 20px;
        text-align: left;
      }
      
      .pdf-download-modal input {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1em;
        box-sizing: border-box;
      }
      
      .pdf-download-modal input:focus {
        outline: none;
        border-color: #d9534f;
        box-shadow: 0 0 0 2px rgba(217,83,79,0.2);
      }
      
      .download-submit-btn {
        width: 100%;
        padding: 14px;
        background-color: #d9534f;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 1em;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      
      .download-submit-btn:hover {
        background-color: #c9302c;
      }
      
      .privacy-text {
        font-size: 0.8em;
        color: #95a5a6;
        margin-top: 20px;
      }
      
      .form-message.success {
        color: #28a745;
      }
      
      .form-message.error {
        color: #dc3545;
      }
      
      @media (max-width: 600px) {
        .pdf-download-modal-content {
          margin: 20% auto;
          padding: 20px;
        }
      }
    </style>

    <script>
      (function() {
        const trigger = document.getElementById('pdf-download-trigger');
        const modal = document.getElementById('pdf-download-modal');
        const closeBtn = document.querySelector('.pdf-download-close');
        const form = document.getElementById('pdf-download-form');
        const messageEl = form.querySelector('.form-message');
        
        if (trigger && modal) {
          trigger.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
          });
          
          closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            messageEl.style.display = 'none';
          });
          
          window.addEventListener('click', function(e) {
            if (e.target === modal) {
              modal.style.display = 'none';
              messageEl.style.display = 'none';
            }
          });
          
          if (form) {
            form.addEventListener('submit', async function(e) {
              e.preventDefault();
              const submitBtn = this.querySelector('button[type="submit"]');
              const originalBtnText = submitBtn.innerHTML;
              
              // Show loading state
              submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
              submitBtn.disabled = true;
              
              // Get form data
              const formData = new FormData(this);
              formData.append('pdf_url', this.closest('.pdf-download-container').getAttribute('data-pdf-url'));
              
              try {
                // Replace with your API endpoint
                const response = await fetch('https://your-api-endpoint.com/submit', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    'Accept': 'application/json'
                  }
                });
                
                const result = await response.json();
                
                if (response.ok) {
                  // Show success message
                  messageEl.textContent = result.message || 'Thank you! Download starting...';
                  messageEl.className = 'form-message success';
                  messageEl.style.display = 'block';
                  
                  // Trigger download
                  if (result.downloadUrl) {
                    const link = document.createElement('a');
                    link.href = result.downloadUrl;
                    link.download = result.filename || 'document.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                  
                  // Close modal after delay
                  setTimeout(() => {
                    modal.style.display = 'none';
                    messageEl.style.display = 'none';
                  }, 3000);
                } else {
                  throw new Error(result.message || 'Failed to submit form');
                }
              } catch (error) {
                messageEl.textContent = error.message || 'An error occurred. Please try again.';
                messageEl.className = 'form-message error';
                messageEl.style.display = 'block';
              } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
              }
            });
          }
        }
      })();
    </script>
  `,
  traits: [
  {
    type: 'text',
    name: 'trigger_text',
    label: 'Trigger Button Text',
    default: 'Sign Up Now'
  },
  {
    type: 'text',
    name: 'popup_title',
    label: 'Popup Title',
    default: 'Join Our Community'
  },
  {
    type: 'text',
    name: 'popup_subtitle',
    label: 'Popup Subtitle',
    default: 'Get exclusive updates and offers'
  },
  {
    type: 'text',
    name: 'submit_text',
    label: 'Submit Button Text',
    default: 'Subscribe'
  },
  {
    type: 'text',
    name: 'api_endpoint',
    label: 'API Endpoint URL',
    default: 'https://your-backend-api.com/api/leads',
    placeholder: 'Enter your backend API endpoint (e.g., https://api.yoursite.com/leads)'
  }
],
  media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m-2 16v-4H8v4H6v-6h12v6h-2m-3-6.5V14h-2v-2.5A1.5 1.5 0 0 1 10.5 10h3a1.5 1.5 0 0 1 1.5 1.5Z"/></svg>`,
  
  // Update the component when traits are changed
  onUpdate({ component, traits }) {
    // Update button text
    if (traits.button_text) {
      component.find('.btn-text').at(0).set('content', traits.button_text);
    }
    
    // Update modal title
    if (traits.modal_title) {
      component.find('.modal-title').at(0).set('content', traits.modal_title);
    }
    
    // Update modal description
    if (traits.modal_description) {
      component.find('.modal-description').at(0).set('content', traits.modal_description);
    }
    
    // Update PDF URL data attribute
    if (traits.pdf_url) {
      component.addAttributes({ 'data-pdf-url': traits.pdf_url });
    }
    
    // Update API endpoint in the script
    if (traits.api_endpoint) {
      const scriptContent = component.get('content').replace(
        /fetch\('https:\/\/your-api-endpoint\.com\/submit'\)/g,
        `fetch('${traits.api_endpoint}')`
      );
      component.set('content', scriptContent);
    }
  }
});

//   label: 'PDF Download with Email Capture',
//   category: 'Lead Generation',
//   content: `
//     <div class="pdf-download-container">
//       <button class="pdf-download-btn" id="pdf-download-trigger">
//         <i class="fas fa-file-pdf"></i> Download Free E-book
//       </button>
  
//       <div class="pdf-download-modal" id="pdf-download-modal">
//         <div class="pdf-download-modal-content">
//           <span class="pdf-download-close">&times;</span>
//           <div class="pdf-download-icon">
//             <i class="fas fa-file-pdf"></i>
//           </div>
//           <h3>Get Your Free E-book</h3>
//           <p>Enter your email to download the PDF</p>
//           <form id="pdf-download-form">
//             <div class="form-group">
//               <input type="email" placeholder="Your best email" required>
//             </div>
//             <div class="form-group">
//               <input type="text" placeholder="Your name (optional)">
//             </div>
//             <button type="submit" class="download-submit-btn">
//               <i class="fas fa-download"></i> Download Now
//             </button>
//           </form>
//           <p class="privacy-text">We respect your privacy. Unsubscribe at any time.</p>
//         </div>
//       </div>
//     </div>

//     <style>
//       .pdf-download-container {
//         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//       }
      
//       .pdf-download-btn {
//         display: inline-flex;
//         align-items: center;
//         justify-content: center;
//         padding: 14px 28px;
//         background-color: #d9534f;
//         color: white;
//         text-decoration: none;
//         border-radius: 8px;
//         font-weight: 600;
//         font-size: 1.1em;
//         box-shadow: 0 4px 15px rgba(217,83,79,0.3);
//         transition: all 0.3s ease;
//         border: none;
//         cursor: pointer;
//         gap: 10px;
//       }
      
//       .pdf-download-btn:hover {
//         background-color: #c9302c;
//         transform: translateY(-2px);
//         box-shadow: 0 6px 20px rgba(217,83,79,0.4);
//       }
      
//       .pdf-download-btn i {
//         font-size: 1.2em;
//       }
      
//       .pdf-download-modal {
//         display: none;
//         position: fixed;
//         z-index: 1000;
//         left: 0;
//         top: 0;
//         width: 100%;
//         height: 100%;
//         background-color: rgba(0,0,0,0.7);
//         animation: fadeIn 0.3s;
//       }
      
//       @keyframes fadeIn {
//         from { opacity: 0; }
//         to { opacity: 1; }
//       }
      
//       .pdf-download-modal-content {
//         background-color: white;
//         margin: 10% auto;
//         padding: 30px;
//         border-radius: 12px;
//         width: 90%;
//         max-width: 450px;
//         text-align: center;
//         position: relative;
//         box-shadow: 0 10px 30px rgba(0,0,0,0.2);
//       }
      
//       .pdf-download-close {
//         position: absolute;
//         top: 15px;
//         right: 25px;
//         color: #aaa;
//         font-size: 28px;
//         font-weight: bold;
//         cursor: pointer;
//       }
      
//       .pdf-download-close:hover {
//         color: #333;
//       }
      
//       .pdf-download-icon {
//         font-size: 3em;
//         color: #d9534f;
//         margin-bottom: 15px;
//       }
      
//       .pdf-download-modal h3 {
//         color: #2c3e50;
//         margin-bottom: 10px;
//         font-size: 1.5em;
//       }
      
//       .pdf-download-modal p {
//         color: #7f8c8d;
//         margin-bottom: 25px;
//       }
      
//       .pdf-download-modal .form-group {
//         margin-bottom: 20px;
//         text-align: left;
//       }
      
//       .pdf-download-modal input {
//         width: 100%;
//         padding: 12px 15px;
//         border: 1px solid #ddd;
//         border-radius: 6px;
//         font-size: 1em;
//         box-sizing: border-box;
//       }
      
//       .pdf-download-modal input:focus {
//         outline: none;
//         border-color: #d9534f;
//         box-shadow: 0 0 0 2px rgba(217,83,79,0.2);
//       }
      
//       .download-submit-btn {
//         width: 100%;
//         padding: 14px;
//         background-color: #d9534f;
//         color: white;
//         border: none;
//         border-radius: 6px;
//         font-weight: 600;
//         font-size: 1em;
//         cursor: pointer;
//         transition: all 0.3s;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         gap: 10px;
//       }
      
//       .download-submit-btn:hover {
//         background-color: #c9302c;
//       }
      
//       .privacy-text {
//         font-size: 0.8em;
//         color: #95a5a6;
//         margin-top: 20px;
//       }
      
//       @media (max-width: 600px) {
//         .pdf-download-modal-content {
//           margin: 20% auto;
//           padding: 20px;
//         }
//       }
//     </style>

//     <script>
//       (function() {
//         const trigger = document.getElementById('pdf-download-trigger');
//         const modal = document.getElementById('pdf-download-modal');
//         const closeBtn = document.querySelector('.pdf-download-close');
//         const form = document.getElementById('pdf-download-form');
        
//         if (trigger && modal) {
//           trigger.addEventListener('click', function(e) {
//             e.preventDefault();
//             modal.style.display = 'block';
//           });
          
//           closeBtn.addEventListener('click', function() {
//             modal.style.display = 'none';
//           });
          
//           window.addEventListener('click', function(e) {
//             if (e.target === modal) {
//               modal.style.display = 'none';
//             }
//           });
          
//           if (form) {
//             form.addEventListener('submit', function(e) {
//               e.preventDefault();
//               const email = this.querySelector('input[type="email"]').value;
              
//               // Here you would typically:
//               // 1. Send the email to your server/email service
//               // 2. Then initiate the download
              
//               // For demo purposes, we'll just show an alert and "download"
//               alert('Thank you! Your download will start now.');
              
//               // Create a temporary link to trigger download
//               const link = document.createElement('a');
//               link.href = '#';
//               link.download = 'free-ebook.pdf';
//               document.body.appendChild(link);
//               link.click();
//               document.body.removeChild(link);
              
//               // Close the modal
//               modal.style.display = 'none';
//             });
//           }
//         }
//       })();
//     </script>
//   `,
//   traits: [
//     { 
//       type: 'text',
//       name: 'pdf_url', 
//       label: 'PDF File URL',
//       changeProp: 1,
//     },
//     { 
//       type: 'text',
//       name: 'button_text', 
//       label: 'Button Text',
//       changeProp: 1,
//       default: 'Download Free E-book'
//     },
//     { 
//       type: 'text',
//       name: 'modal_title', 
//       label: 'Modal Title',
//       changeProp: 1,
//       default: 'Get Your Free E-book'
//     },
//     { 
//       type: 'text',
//       name: 'modal_description', 
//       label: 'Modal Description',
//       changeProp: 1,
//       default: 'Enter your email to download the PDF'
//     }
//   ],
//   media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m-2 16v-4H8v4H6v-6h12v6h-2m-3-6.5V14h-2v-2.5A1.5 1.5 0 0 1 10.5 10h3a1.5 1.5 0 0 1 1.5 1.5Z"/></svg>`,
// });
      // ==================== HERO SECTIONS ====================
      
      bm.add('hero-section', {
        label: 'Hero Section',
        category: 'Sections',
        content: `
          <section style="padding: 100px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
            <div style="max-width: 900px; margin: 0 auto;">
              <h1 style="font-size: 3.5em; margin-bottom: 20px; font-weight: 700; line-height: 1.2;">Welcome to Our Amazing Platform</h1>
              <p style="font-size: 1.3em; margin-bottom: 40px; opacity: 0.95; line-height: 1.6;">Create stunning websites with our powerful drag-and-drop builder</p>
              <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="#" style="padding: 18px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s;">Get Started</a>
                <a href="#" style="padding: 18px 40px; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; border: 2px solid white; transition: all 0.3s;">Learn More</a>
              </div>
            </div>
          </section>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>`,
      });

      bm.add('hero-with-image', {
        label: 'Hero with Image',
        category: 'Sections',
        content: `
          <section style="padding: 80px 20px; background: #f8f9fa;">
            <div style="max-width: 1200px; margin: 0 auto; display: flex; gap: 50px; align-items: center; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 300px;">
                <h1 style="font-size: 3em; margin-bottom: 20px; color: #333; font-weight: 700;">Build Something Amazing</h1>
                <p style="font-size: 1.2em; color: #666; margin-bottom: 30px; line-height: 1.6;">Transform your ideas into reality with our intuitive platform</p>
                <a href="#" style="display: inline-block; padding: 16px 35px; background: #4CAF50; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Building</a>
              </div>
              <div style="flex: 1; min-width: 300px; background: #e0e0e0; height: 400px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #999;">
                <p>Add your image here</p>
              </div>
            </div>
          </section>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z"/></svg>`,
      });

      // ==================== FOOTER ====================
      
      bm.add('footer', {
        label: 'Footer',
        category: 'Sections',
        content: `
          <footer style="background: #2c3e50; color: white; padding: 50px 20px 20px;">
            <div style="max-width: 1200px; margin: 0 auto;">
              <div style="display: flex; gap: 40px; flex-wrap: wrap; margin-bottom: 30px;">
                <div style="flex: 1; min-width: 200px;">
                  <h4 style="margin-top: 0; margin-bottom: 15px;">About Us</h4>
                  <p style="opacity: 0.8; line-height: 1.6;">Your company description goes here. We help businesses succeed.</p>
                </div>
                <div style="flex: 1; min-width: 200px;">
                  <h4 style="margin-top: 0; margin-bottom: 15px;">Quick Links</h4>
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="#" style="color: white; opacity: 0.8; text-decoration: none;">Home</a>
                    <a href="#" style="color: white; opacity: 0.8; text-decoration: none;">About</a>
                    <a href="#" style="color: white; opacity: 0.8; text-decoration: none;">Services</a>
                    <a href="#" style="color: white; opacity: 0.8; text-decoration: none;">Contact</a>
                  </div>
                </div>
                <div style="flex: 1; min-width: 200px;">
                  <h4 style="margin-top: 0; margin-bottom: 15px;">Contact</h4>
                  <p style="opacity: 0.8; line-height: 1.8;">Email: info@example.com<br/>Phone: +1 234 567 890</p>
                </div>
              </div>
              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: center; opacity: 0.7;">
                <p>© 2024 Your Company. All rights reserved.</p>
              </div>
            </div>
          </footer>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"/></svg>`,
      });

      // ==================== LISTS ====================
      
      bm.add('feature-list', {
        label: 'Feature List',
        category: 'Content',
        content: `
          <div style="padding: 40px 20px;">
            <h3 style="margin-bottom: 25px; color: #333;">Key Features</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 15px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px;">
                <span style="color: #4CAF50; font-size: 1.5em;">✓</span>
                <span style="color: #555;">Feature description goes here</span>
              </li>
              <li style="padding: 15px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px;">
                <span style="color: #4CAF50; font-size: 1.5em;">✓</span>
                <span style="color: #555;">Another amazing feature</span>
              </li>
              <li style="padding: 15px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; gap: 15px;">
                <span style="color: #4CAF50; font-size: 1.5em;">✓</span>
                <span style="color: #555;">One more great feature</span>
              </li>
            </ul>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z"/></svg>`,
      });

      // ==================== FAQ / ACCORDION ====================
      
      bm.add('faq-section', {
        label: 'FAQ Section',
        category: 'Content',
        content: `
          <div style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 40px; color: #333; font-size: 2.5em;">Frequently Asked Questions</h2>
            <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="border-bottom: 1px solid #e0e0e0; padding: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 1.2em;">Question 1: How does it work?</h4>
                <p style="margin: 0; color: #666; line-height: 1.6;">Answer: This is where you explain how your product or service works. Add detailed information here.</p>
              </div>
              <div style="border-bottom: 1px solid #e0e0e0; padding: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 1.2em;">Question 2: What are the benefits?</h4>
                <p style="margin: 0; color: #666; line-height: 1.6;">Answer: List all the amazing benefits your customers will get.</p>
              </div>
              <div style="padding: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 1.2em;">Question 3: How much does it cost?</h4>
                <p style="margin: 0; color: #666; line-height: 1.6;">Answer: Provide clear pricing information here.</p>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/></svg>`,
      });

      // ==================== STATS / COUNTERS ====================
      
      bm.add('stats-section', {
        label: 'Stats Counter',
        category: 'Content',
        content: `
          <div style="padding: 60px 20px; background: #f8f9fa;">
            <div style="max-width: 1200px; margin: 0 auto; display: flex; gap: 30px; flex-wrap: wrap; justify-content: center;">
              <div style="flex: 1; min-width: 200px; text-align: center; padding: 30px;">
                <div style="font-size: 3.5em; font-weight: bold; color: #4CAF50; margin-bottom: 10px;">1000+</div>
                <p style="color: #666; font-size: 1.1em; margin: 0;">Happy Clients</p>
              </div>
              <div style="flex: 1; min-width: 200px; text-align: center; padding: 30px;">
                <div style="font-size: 3.5em; font-weight: bold; color: #2196F3; margin-bottom: 10px;">50+</div>
                <p style="color: #666; font-size: 1.1em; margin: 0;">Projects Completed</p>
              </div>
              <div style="flex: 1; min-width: 200px; text-align: center; padding: 30px;">
                <div style="font-size: 3.5em; font-weight: bold; color: #FF9800; margin-bottom: 10px;">24/7</div>
                <p style="color: #666; font-size: 1.1em; margin: 0;">Support Available</p>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"/></svg>`,
      });

      // ==================== PROGRESS BARS ====================
      
      bm.add('progress-bar', {
        label: 'Progress Bar',
        category: 'Content',
        content: `
          <div style="padding: 30px 20px;">
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600; color: #333;">Web Design</span>
                <span style="color: #666;">90%</span>
              </div>
              <div style="width: 100%; height: 12px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="width: 90%; height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); border-radius: 10px;"></div>
              </div>
            </div>
            <div style="margin-bottom: 25px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600; color: #333;">Development</span>
                <span style="color: #666;">85%</span>
              </div>
              <div style="width: 100%; height: 12px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="width: 85%; height: 100%; background: linear-gradient(90deg, #2196F3, #03A9F4); border-radius: 10px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600; color: #333;">Marketing</span>
                <span style="color: #666;">75%</span>
              </div>
              <div style="width: 100%; height: 12px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="width: 75%; height: 100%; background: linear-gradient(90deg, #FF9800, #FFC107); border-radius: 10px;"></div>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/></svg>`,
      });

      // ==================== BADGES & ALERTS ====================
      
      bm.add('badges', {
        label: 'Badges',
        category: 'Content',
        content: `
          <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 20px;">
            <span style="display: inline-block; padding: 8px 16px; background: #4CAF50; color: white; border-radius: 20px; font-size: 0.9em; font-weight: 600;">Success</span>
            <span style="display: inline-block; padding: 8px 16px; background: #2196F3; color: white; border-radius: 20px; font-size: 0.9em; font-weight: 600;">Info</span>
            <span style="display: inline-block; padding: 8px 16px; background: #FF9800; color: white; border-radius: 20px; font-size: 0.9em; font-weight: 600;">Warning</span>
            <span style="display: inline-block; padding: 8px 16px; background: #f44336; color: white; border-radius: 20px; font-size: 0.9em; font-weight: 600;">Error</span>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.41,11.58L12.41,2.58C12.04,2.21 11.53,2 11,2H4A2,2 0 0,0 2,4V11C2,11.53 2.21,12.04 2.59,12.41L11.58,21.41C11.95,21.78 12.47,22 13,22C13.53,22 14.04,21.79 14.41,21.41L21.41,14.41C21.79,14.04 22,13.53 22,13C22,12.47 21.79,11.96 21.41,11.58M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7Z"/></svg>`,
      });

      bm.add('alert-box', {
        label: 'Alert Box',
        category: 'Content',
        content: `
          <div style="padding: 20px 25px; background: #e8f5e9; border-left: 5px solid #4CAF50; border-radius: 5px; margin: 20px 0; display: flex; align-items: start; gap: 15px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#4CAF50">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
            </svg>
            <div>
              <strong style="color: #2e7d32; display: block; margin-bottom: 5px;">Success!</strong>
              <p style="margin: 0; color: #1b5e20; line-height: 1.6;">Your action was completed successfully.</p>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/></svg>`,
      });

      // ==================== DIVIDERS & SPACERS ====================
      
      bm.add('divider', {
        label: 'Divider',
        category: 'Layout',
        content: `<hr style="border: none; border-top: 2px solid #e0e0e0; margin: 30px 0;"/>`,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,4H21V6H3V4M3,11H21V13H3V11M3,18H21V20H3V18Z"/></svg>`,
      });

      bm.add('spacer', {
        label: 'Spacer',
        category: 'Layout',
        content: `<div style="height: 50px;"></div>`,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,11H16V13H8V11M2,20V4H4V20H2M20,20V4H22V20H20Z"/></svg>`,
      });

      // ==================== SOCIAL MEDIA ====================
      
      bm.add('social-icons', {
        label: 'Social Icons',
        category: 'Social Media',
        content: `
          <div style="display: flex; gap: 15px; justify-content: center; padding: 30px 0;">
            <a href="#" style="width: 45px; height: 45px; background: #1877f2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>
            </a>
            <a href="#" style="width: 45px; height: 45px; background: #1da1f2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.70,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.60 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"/></svg>
            </a>
            <a href="#" style="width: 45px; height: 45px; background: #e4405f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/></svg>
            </a>
            <a href="#" style="width: 45px; height: 45px; background: #0077b5; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"/></svg>
            </a>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/></svg>`,
      });

      // ==================== TABLE ====================
      
      bm.add('table', {
        label: 'Table',
        category: 'Content',
        content: `
          <div style="padding: 30px 20px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #4CAF50; color: white;">
                  <th style="padding: 15px; text-align: left; font-weight: 600;">Name</th>
                  <th style="padding: 15px; text-align: left; font-weight: 600;">Email</th>
                  <th style="padding: 15px; text-align: left; font-weight: 600;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                  <td style="padding: 15px;">John Doe</td>
                  <td style="padding: 15px;">john@example.com</td>
                  <td style="padding: 15px;"><span style="background: #e8f5e9; color: #2e7d32; padding: 5px 12px; border-radius: 15px; font-size: 0.9em;">Active</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #e0e0e0;">
                  <td style="padding: 15px;">Jane Smith</td>
                  <td style="padding: 15px;">jane@example.com</td>
                  <td style="padding: 15px;"><span style="background: #fff3e0; color: #e65100; padding: 5px 12px; border-radius: 15px; font-size: 0.9em;">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z"/></svg>`,
      });

      // ==================== TEAM MEMBERS ====================
      
      bm.add('team-member-card', {
        label: 'Team Member',
        category: 'Team',
        content: `
          <div style="background: white; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 300px; margin: 20px auto; transition: all 0.3s;">
            <div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 3em; font-weight: bold;">JD</div>
            <h3 style="margin: 0 0 5px 0; color: #333; font-size: 1.4em;">John Doe</h3>
            <p style="color: #667eea; font-weight: 600; margin: 0 0 15px 0;">CEO & Founder</p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 0.95em;">Passionate about building great products and leading innovative teams.</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <a href="#" style="width: 35px; height: 35px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #666; transition: all 0.3s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"/></svg>
              </a>
              <a href="#" style="width: 35px; height: 35px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #666; transition: all 0.3s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.70,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.60 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"/></svg>
              </a>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/></svg>`,
      });

      bm.add('team-grid', {
        label: 'Team Grid',
        category: 'Team',
        content: `
          <div style="padding: 60px 20px; background: #f8f9fa;">
            <div style="text-align: center; margin-bottom: 50px;">
              <h2 style="font-size: 2.5em; margin-bottom: 15px; color: #333;">Meet Our Team</h2>
              <p style="color: #666; font-size: 1.1em;">Talented people behind our success</p>
            </div>
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
              <div style="background: white; border-radius: 10px; padding: 25px; text-align: center; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #4CAF50; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5em;">👨</div>
                <h4 style="margin: 0 0 5px 0; color: #333;">Alex Johnson</h4>
                <p style="color: #4CAF50; font-weight: 600; margin: 0;">Designer</p>
              </div>
              <div style="background: white; border-radius: 10px; padding: 25px; text-align: center; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #2196F3; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5em;">👩</div>
                <h4 style="margin: 0 0 5px 0; color: #333;">Sarah Williams</h4>
                <p style="color: #2196F3; font-weight: 600; margin: 0;">Developer</p>
              </div>
              <div style="background: white; border-radius: 10px; padding: 25px; text-align: center; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #FF9800; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5em;">👨</div>
                <h4 style="margin: 0 0 5px 0; color: #333;">Mike Brown</h4>
                <p style="color: #FF9800; font-weight: 600; margin: 0;">Marketing</p>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"/></svg>`,
      });

      // ==================== TESTIMONIALS ====================
      
      bm.add('testimonial-card', {
        label: 'Testimonial Card',
        category: 'Testimonials',
        content: `
          <div style="background: white; border-radius: 15px; padding: 35px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); max-width: 500px; margin: 20px auto; position: relative;">
            <div style="color: #667eea; font-size: 3em; line-height: 0.5; margin-bottom: 15px;">"</div>
            <p style="color: #555; font-size: 1.1em; line-height: 1.7; margin-bottom: 25px; font-style: italic;">This product absolutely transformed our business. The results were beyond our expectations!</p>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5em;">JS</div>
              <div>
                <h4 style="margin: 0 0 5px 0; color: #333; font-size: 1.1em;">Jane Smith</h4>
                <p style="margin: 0; color: #999; font-size: 0.9em;">CEO, Tech Company</p>
              </div>
            </div>
            <div style="position: absolute; top: 20px; right: 25px; display: flex; gap: 3px;">
              <span style="color: #FFC107; font-size: 1.2em;">★</span>
              <span style="color: #FFC107; font-size: 1.2em;">★</span>
              <span style="color: #FFC107; font-size: 1.2em;">★</span>
              <span style="color: #FFC107; font-size: 1.2em;">★</span>
              <span style="color: #FFC107; font-size: 1.2em;">★</span>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/></svg>`,
      });

      bm.add('testimonial-slider', {
        label: 'Testimonial Slider',
        category: 'Testimonials',
        content: `
          <div style="padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div style="max-width: 900px; margin: 0 auto; text-align: center; color: white;">
              <h2 style="font-size: 2.5em; margin-bottom: 15px;">What Our Clients Say</h2>
              <p style="font-size: 1.1em; opacity: 0.9; margin-bottom: 50px;">Don't just take our word for it</p>
              <div style="background: white; border-radius: 15px; padding: 50px 40px; color: #333; position: relative;">
                <div style="font-size: 4em; color: #667eea; position: absolute; top: 20px; left: 30px; opacity: 0.2;">"</div>
                <p style="font-size: 1.3em; line-height: 1.8; margin-bottom: 30px; position: relative; z-index: 1;">Amazing service! They delivered exactly what we needed and more. Highly recommended for anyone looking to grow their business.</p>
                <h4 style="margin: 0 0 5px 0; font-size: 1.2em;">Michael Roberts</h4>
                <p style="margin: 0; color: #667eea; font-weight: 600;">Marketing Director</p>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 30px;">
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #667eea;"></div>
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #ddd;"></div>
                  <div style="width: 12px; height: 12px; border-radius: 50%; background: #ddd;"></div>
                </div>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.5,4L19.66,8.35L22.5,11.69C23.03,12.38 22.74,13.28 22.05,13.81C22,13.85 22,13.85 21.95,13.85L16.97,16.96L15.5,21.5C15.23,22.32 14.41,22.76 13.57,22.5C13.5,22.5 13.42,22.46 13.38,22.43L12,21.5L10.62,22.43C9.91,22.85 9,22.57 8.5,21.75L7.03,17.21L2.05,14.1C1.42,13.7 1.16,12.81 1.5,12.08C1.55,11.96 1.63,11.88 1.71,11.8L4.34,8.66L5.5,4C5.8,3.17 6.63,2.72 7.47,3C7.5,3 7.5,3 7.53,3.04L12,5.1L16.47,3C17.31,2.72 18.13,3.16 18.43,4C18.43,4 18.43,4 18.5,4M13.97,3.54L12,4.57L10.03,3.54L11,6.96L12,10.38L13,6.96L13.97,3.54M12,11.47L10.5,12.4L9.44,9.57L10.97,7.48L12,11.47M13.03,7.5L14.56,9.6L13.5,12.4L12,11.47L13.03,7.5Z"/></svg>`,
      });

      // ==================== CALL TO ACTION ====================
      
      bm.add('cta-box', {
        label: 'CTA Box',
        category: 'CTA',
        content: `
          <div style="padding: 80px 20px; background: linear-gradient(135deg, #FF6B6B, #FF8E53); text-align: center; color: white;">
            <div style="max-width: 800px; margin: 0 auto;">
              <h2 style="font-size: 2.8em; margin-bottom: 20px; font-weight: 700;">Ready to Get Started?</h2>
              <p style="font-size: 1.2em; margin-bottom: 35px; opacity: 0.95; line-height: 1.6;">Join thousands of satisfied customers and transform your business today</p>
              <a href="#" style="display: inline-block; padding: 18px 45px; background: white; color: #FF6B6B; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 1.1em; box-shadow: 0 5px 20px rgba(0,0,0,0.2); transition: all 0.3s;">Start Free Trial</a>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>`,
      });

      bm.add('cta-split', {
        label: 'CTA Split',
        category: 'CTA',
        content: `
          <div style="padding: 80px 20px; background: #2c3e50;">
            <div style="max-width: 1100px; margin: 0 auto; display: flex; gap: 40px; align-items: center; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 300px; color: white;">
                <h2 style="font-size: 2.5em; margin-bottom: 20px; line-height: 1.2;">Start Your Journey Today</h2>
                <p style="font-size: 1.1em; opacity: 0.9; line-height: 1.7;">No credit card required. Cancel anytime. Get started in less than 2 minutes.</p>
              </div>
              <div style="flex: 0 0 auto; display: flex; gap: 15px; flex-wrap: wrap;">
                <a href="#" style="padding: 16px 35px; background: #4CAF50; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em; white-space: nowrap;">Get Started Free</a>
                <a href="#" style="padding: 16px 35px; background: transparent; color: white; text-decoration: none; border: 2px solid white; border-radius: 8px; font-weight: 600; font-size: 1.1em; white-space: nowrap;">Learn More</a>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5L16,12L10,7.5V16.5Z"/></svg>`,
      });

      // ==================== IMAGE GALLERY ====================
      
      bm.add('image-gallery', {
        label: 'Image Gallery',
        category: 'Media',
        content: `
          <div style="padding: 60px 20px;">
            <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 50px; color: #333;">Our Gallery</h2>
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
              <div style="aspect-ratio: 1; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; transition: all 0.3s;">
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2em;">Image 1</div>
              </div>
              <div style="aspect-ratio: 1; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; transition: all 0.3s;">
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2em;">Image 2</div>
              </div>
              <div style="aspect-ratio: 1; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; transition: all 0.3s;">
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2em;">Image 3</div>
              </div>
              <div style="aspect-ratio: 1; background: linear-gradient(135deg, #43e97b, #38f9d7); border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; transition: all 0.3s;">
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2em;">Image 4</div>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M22,16V4A2,2 0 0,0 20,2H8A2,2 0 0,0 6,4V16A2,2 0 0,0 8,18H20A2,2 0 0,0 22,16M11,12L13.03,14.71L16,11L20,16H8M2,6V20A2,2 0 0,0 4,22H18V20H4V6"/></svg>`,
      });

      // ==================== TIMELINE ====================
      
      bm.add('timeline', {
        label: 'Timeline',
        category: 'Content',
        content: `
          <div style="padding: 60px 20px; background: #f8f9fa;">
            <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 50px; color: #333;">Our Journey</h2>
            <div style="max-width: 800px; margin: 0 auto; position: relative;">
              <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: #4CAF50; transform: translateX(-50%);"></div>
              
              <div style="display: flex; margin-bottom: 50px; position: relative;">
                <div style="flex: 1; padding-right: 30px; text-align: right;">
                  <h3 style="color: #333; margin-bottom: 10px;">2020</h3>
                  <h4 style="color: #4CAF50; margin-bottom: 10px;">Company Founded</h4>
                  <p style="color: #666; line-height: 1.6;">Started our journey with a vision to transform the industry</p>
                </div>
                <div style="width: 20px; height: 20px; background: #4CAF50; border-radius: 50%; position: relative; z-index: 1; border: 4px solid #f8f9fa;"></div>
                <div style="flex: 1;"></div>
              </div>
              
              <div style="display: flex; margin-bottom: 50px; position: relative;">
                <div style="flex: 1;"></div>
                <div style="width: 20px; height: 20px; background: #2196F3; border-radius: 50%; position: relative; z-index: 1; border: 4px solid #f8f9fa;"></div>
                <div style="flex: 1; padding-left: 30px;">
                  <h3 style="color: #333; margin-bottom: 10px;">2021</h3>
                  <h4 style="color: #2196F3; margin-bottom: 10px;">First Major Milestone</h4>
                  <p style="color: #666; line-height: 1.6;">Reached 10,000 satisfied customers</p>
                </div>
              </div>
              
              <div style="display: flex; position: relative;">
                <div style="flex: 1; padding-right: 30px; text-align: right;">
                  <h3 style="color: #333; margin-bottom: 10px;">2024</h3>
                  <h4 style="color: #FF9800; margin-bottom: 10px;">Global Expansion</h4>
                  <p style="color: #666; line-height: 1.6;">Expanded operations to 50+ countries worldwide</p>
                </div>
                <div style="width: 20px; height: 20px; background: #FF9800; border-radius: 50%; position: relative; z-index: 1; border: 4px solid #f8f9fa;"></div>
                <div style="flex: 1;"></div>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/></svg>`,
      });

      // ==================== PROCESS STEPS ====================
      
      bm.add('process-steps', {
        label: 'Process Steps',
        category: 'Content',
        content: `
          <div style="padding: 60px 20px;">
            <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 50px; color: #333;">How It Works</h2>
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
              <div style="text-align: center; position: relative;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 2em; font-weight: bold; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);">1</div>
                <h3 style="color: #333; margin-bottom: 12px; font-size: 1.3em;">Sign Up</h3>
                <p style="color: #666; line-height: 1.6;">Create your free account in less than a minute</p>
              </div>
              <div style="text-align: center; position: relative;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 2em; font-weight: bold; box-shadow: 0 5px 20px rgba(245, 87, 108, 0.4);">2</div>
                <h3 style="color: #333; margin-bottom: 12px; font-size: 1.3em;">Customize</h3>
                <p style="color: #666; line-height: 1.6;">Set up your preferences and requirements</p>
              </div>
              <div style="text-align: center; position: relative;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 2em; font-weight: bold; box-shadow: 0 5px 20px rgba(0, 242, 254, 0.4);">3</div>
                <h3 style="color: #333; margin-bottom: 12px; font-size: 1.3em;">Launch</h3>
                <p style="color: #666; line-height: 1.6;">Go live and start achieving your goals</p>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/></svg>`,
      });

      // ==================== LOGO GRID ====================
      
      bm.add('logo-grid', {
        label: 'Logo Grid',
        category: 'Content',
        content: `
          <div style="padding: 60px 20px; background: #f8f9fa;">
            <h3 style="text-align: center; font-size: 1.5em; color: #666; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px;">Trusted By Leading Companies</h3>
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 40px; align-items: center;">
              <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s;">
                <div style="font-size: 2em; font-weight: bold; color: #667eea;">Company</div>
              </div>
              <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s;">
                <div style="font-size: 2em; font-weight: bold; color: #4CAF50;">Brand</div>
              </div>
              <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s;">
                <div style="font-size: 2em; font-weight: bold; color: #FF9800;">Partner</div>
              </div>
              <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.3s;">
                <div style="font-size: 2em; font-weight: bold; color: #2196F3;">Client</div>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12,16.5C9.5,16.5 7.5,14.5 7.5,12C7.5,9.5 9.5,7.5 12,7.5C14.5,7.5 16.5,9.5 16.5,12C16.5,14.5 14.5,16.5 12,16.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>`,
      });

      // ==================== VIDEO SECTION ====================
      
      bm.add('video-section', {
        label: 'Video Section',
        category: 'Media',
        content: `
          <div style="padding: 80px 20px; background: #1a1a1a;">
            <div style="max-width: 1000px; margin: 0 auto;">
              <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 20px; color: white;">Watch Our Story</h2>
              <p style="text-align: center; color: #ccc; font-size: 1.1em; margin-bottom: 40px;">See how we're making a difference</p>
              <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center;">
                  <div style="text-align: center; color: white;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="white" style="opacity: 0.9; cursor: pointer;">
                      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)"/>
                      <path d="M10,8.5v7l6-3.5L10,8.5z"/>
                    </svg>
                    <p style="margin-top: 15px; font-size: 1.1em;">Click to play video</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/></svg>`,
      });

      // ==================== SEARCH BARS ====================
      
      bm.add('search-bar', {
        label: 'Search Bar',
        category: 'Forms',
        content: `
          <div style="max-width: 600px; margin: 30px auto;">
            <form style="display: flex; gap: 10px; box-shadow: 0 2px 15px rgba(0,0,0,0.1); border-radius: 50px; padding: 8px; background: white;">
              <input type="search" placeholder="Search..." style="flex: 1; border: none; padding: 12px 20px; font-size: 1em; outline: none; background: transparent;"/>
              <button type="submit" style="padding: 12px 30px; background: #4CAF50; color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/></svg>
                Search
              </button>
            </form>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/></svg>`,
      });

      // ==================== SERVICES/FEATURES ====================
      
      bm.add('service-box', {
        label: 'Service Box',
        category: 'Services',
        content: `
          <div style="padding: 40px 25px; background: white; border-radius: 12px; box-shadow: 0 3px 15px rgba(0,0,0,0.08); text-align: center; transition: all 0.3s; max-width: 350px; margin: 20px auto; border-top: 4px solid #4CAF50;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #4CAF50, #8BC34A); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="white">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.5em;">Web Design</h3>
            <p style="color: #666; line-height: 1.7; margin-bottom: 20px;">Create stunning, responsive websites that engage and convert your visitors.</p>
            <a href="#" style="color: #4CAF50; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">Learn More 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>
            </a>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M11,7H13V9H11V7M11,11H13V17H11V11M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"/></svg>`,
      });

      // ==================== TABS ====================
      
      bm.add('tabs', {
        label: 'Tabs',
        category: 'Interactive',
        content: `
          <div style="max-width: 900px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 3px 15px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="display: flex; border-bottom: 2px solid #f0f0f0; background: #f8f9fa;">
              <button style="flex: 1; padding: 18px; background: white; border: none; border-bottom: 3px solid #4CAF50; cursor: pointer; font-weight: 600; color: #4CAF50; font-size: 1em;">Overview</button>
              <button style="flex: 1; padding: 18px; background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; color: #666; font-size: 1em;">Features</button>
              <button style="flex: 1; padding: 18px; background: transparent; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; color: #666; font-size: 1em;">Pricing</button>
            </div>
            <div style="padding: 40px;">
              <h3 style="margin-top: 0; color: #333; font-size: 1.8em;">Overview</h3>
              <p style="color: #666; line-height: 1.7; font-size: 1.05em;">This is the overview tab content. Click on different tabs to see more information about features and pricing.</p>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21,3H3C1.89,3 1,3.89 1,5V19A2,2 0 0,0 3,21H21A2,2 0 0,0 23,19V5C23,3.89 22.1,3 21,3M21,19H3V5H13V9H21V19Z"/></svg>`,
      });

      // ==================== ACCORDION ====================
      
      bm.add('accordion', {
        label: 'Accordion',
        category: 'Interactive',
        content: `
          <div style="max-width: 800px; margin: 40px auto;">
            <div style="margin-bottom: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
              <button style="width: 100%; padding: 20px 25px; background: white; border: none; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 1.1em; font-weight: 600; color: #333;">
                <span>What services do you offer?</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#666"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>
              </button>
              <div style="padding: 0 25px 20px; color: #666; line-height: 1.7; background: #f8f9fa;">We offer a comprehensive range of web development, design, and digital marketing services.</div>
            </div>
            <div style="margin-bottom: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <button style="width: 100%; padding: 20px 25px; background: white; border: none; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 1.1em; font-weight: 600; color: #333;">
                <span>How long does a project take?</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#666"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>
              </button>
            </div>
            <div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <button style="width: 100%; padding: 20px 25px; background: white; border: none; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 1.1em; font-weight: 600; color: #333;">
                <span>What is your pricing model?</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#666"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>
              </button>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19M17,17H7V15H17V17M17,13H7V11H17V13M17,9H7V7H17V9Z"/></svg>`,
      });

      // ==================== MAP SECTION ====================
      
      bm.add('map-section', {
        label: 'Map Section',
        category: 'Contact',
        content: `
          <div style="padding: 0; margin: 40px 0;">
            <div style="height: 400px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2em; position: relative;">
              <div style="text-align: center; z-index: 1;">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="white" style="margin-bottom: 15px;">
                  <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                </svg>
                <p>Embed Google Maps or custom map here</p>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/></svg>`,
      });

      // ==================== CONTACT INFO CARDS ====================
      
      bm.add('contact-info', {
        label: 'Contact Info',
        category: 'Contact',
        content: `
          <div style="padding: 60px 20px; background: #f8f9fa;">
            <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
              <div style="background: white; padding: 35px; border-radius: 12px; text-align: center; box-shadow: 0 3px 15px rgba(0,0,0,0.08); transition: all 0.3s;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #4CAF50, #8BC34A); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/></svg>
                </div>
                <h4 style="margin: 0 0 12px 0; color: #333; font-size: 1.2em;">Visit Us</h4>
                <p style="margin: 0; color: #666; line-height: 1.6;">123 Business Street<br/>New York, NY 10001</p>
              </div>
              <div style="background: white; padding: 35px; border-radius: 12px; text-align: center; box-shadow: 0 3px 15px rgba(0,0,0,0.08); transition: all 0.3s;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #2196F3, #03A9F4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>
                </div>
                <h4 style="margin: 0 0 12px 0; color: #333; font-size: 1.2em;">Call Us</h4>
                <p style="margin: 0; color: #666; line-height: 1.6;">+1 (234) 567-890<br/>Mon-Fri: 9AM-6PM</p>
              </div>
              <div style="background: white; padding: 35px; border-radius: 12px; text-align: center; box-shadow: 0 3px 15px rgba(0,0,0,0.08); transition: all 0.3s;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FF9800, #FFC107); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/></svg>
                </div>
                <h4 style="margin: 0 0 12px 0; color: #333; font-size: 1.2em;">Email Us</h4>
                <p style="margin: 0; color: #666; line-height: 1.6;">info@company.com<br/>support@company.com</p>
              </div>
            </div>
          </div>
        `,
        media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/></svg>`,
      });

  // Initialize scroll to form functionality for CTA buttons
  // This will work in both editor and live page
  if (typeof window !== 'undefined') {
    // Global function for scrolling to form
    window.scrollToDirectFormFromCTA = function(button) {
      try {
        // Find wrapper containing both button and form
        const wrapper = button.closest('.direct-form-cta-wrapper');
        if (!wrapper) {
          console.warn('Could not find wrapper');
          return false;
        }
        
        // Find form within the same wrapper
        const formElement = wrapper.querySelector('.bss-direct-form-container');
        if (!formElement) {
          console.warn('Could not find form element');
          return false;
        }
        
        // Scroll to form
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add highlight effect
        formElement.style.transition = 'box-shadow 0.3s ease';
        formElement.style.boxShadow = '0 0 30px rgba(255, 174, 0, 0.6)';
        
        setTimeout(() => {
          formElement.style.boxShadow = '';
        }, 2000);
        
        return true;
      } catch (error) {
        console.error('Error scrolling to form:', error);
        return false;
      }
    };
    
    // Event delegation for CTA buttons (works even if buttons are added dynamically)
    const initScrollToFormListeners = function() {
      // Remove existing listeners to avoid duplicates
      document.removeEventListener('click', handleCTAClick);
      // Add new listener
      document.addEventListener('click', handleCTAClick, true);
    };
    
    const handleCTAClick = function(e) {
      const button = e.target.closest('.scroll-to-form-cta') || e.target.closest('[data-scroll-to-form]');
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        
        // Find form - try multiple methods
        let formElement = null;
        
        // Method 1: Find wrapper and form within it
        const wrapper = button.closest('.direct-form-cta-wrapper');
        if (wrapper) {
          formElement = wrapper.querySelector('.bss-direct-form-container');
        }
        
        // Method 2: Find by ID pattern (handles dynamic IDs like direct-form-target-3)
        if (!formElement) {
          formElement = document.querySelector('[id^="direct-form-target"]') || 
                       document.querySelector('.bss-direct-form-container');
        }
        
        // Method 3: Find any form container on page
        if (!formElement) {
          formElement = document.querySelector('.bss-direct-form-container');
        }
        
        if (formElement) {
          formElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add highlight effect
          formElement.style.transition = 'box-shadow 0.3s ease';
          formElement.style.boxShadow = '0 0 30px rgba(255, 174, 0, 0.6)';
          
          setTimeout(() => {
            formElement.style.boxShadow = '';
          }, 2000);
        } else {
          console.warn('Form not found for scroll');
        }
      }
    };
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScrollToFormListeners);
    } else {
      initScrollToFormListeners();
    }
    
    // Also initialize in editor iframe when available
    const initIframeListeners = function() {
      try {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            if (iframe.contentWindow && iframe.contentWindow.document) {
              const iframeDoc = iframe.contentWindow.document;
              const iframeHandleClick = function(e) {
                const button = e.target.closest('.scroll-to-form-cta') || e.target.closest('[data-scroll-to-form]');
                if (button) {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Find form - try multiple methods
                  let formElement = null;
                  
                  // Method 1: Find wrapper and form within it
                  const wrapper = button.closest('.direct-form-cta-wrapper');
                  if (wrapper) {
                    formElement = wrapper.querySelector('.bss-direct-form-container');
                  }
                  
                  // Method 2: Find by ID pattern
                  if (!formElement) {
                    formElement = iframeDoc.querySelector('[id^="direct-form-target"]') || 
                                 iframeDoc.querySelector('.bss-direct-form-container');
                  }
                  
                  // Method 3: Find any form container
                  if (!formElement) {
                    formElement = iframeDoc.querySelector('.bss-direct-form-container');
                  }
                  
                  if (formElement) {
                    formElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                    
                    formElement.style.transition = 'box-shadow 0.3s ease';
                    formElement.style.boxShadow = '0 0 30px rgba(255, 174, 0, 0.6)';
                    
                    setTimeout(() => {
                      formElement.style.boxShadow = '';
                    }, 2000);
                  }
                }
              };
              
              if (iframeDoc.readyState === 'loading') {
                iframeDoc.addEventListener('DOMContentLoaded', () => {
                  iframeDoc.removeEventListener('click', iframeHandleClick);
                  iframeDoc.addEventListener('click', iframeHandleClick, true);
                });
              } else {
                iframeDoc.removeEventListener('click', iframeHandleClick);
                iframeDoc.addEventListener('click', iframeHandleClick, true);
              }
            }
          } catch (e) {
            // Cross-origin or other iframe access issues - ignore
          }
        });
      } catch (e) {
        // Ignore errors
      }
    };
    
    // Try to initialize iframe listeners after a delay
    setTimeout(initIframeListeners, 1000);
    setTimeout(initIframeListeners, 3000);
  }

  }
export default addLandingPageComponents;
