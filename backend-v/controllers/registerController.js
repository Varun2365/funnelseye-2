const express = require('express');
const authController = require('./authController');

class RegisterController {
    
    /**
     * Render signup page
     * GET /register/signup
     */
    async getSignupPage(req, res) {
        try {
            res.send(this.renderSignupPage());
        } catch (error) {
            console.error('Error rendering signup page:', error);
            res.status(500).send(this.renderErrorPage('Server Error', 'An error occurred while loading the signup page.'));
        }
    }

    /**
     * Render login page
     * GET /register/login
     */
    async getLoginPage(req, res) {
        try {
            res.send(this.renderLoginPage());
        } catch (error) {
            console.error('Error rendering login page:', error);
            res.status(500).send(this.renderErrorPage('Server Error', 'An error occurred while loading the login page.'));
        }
    }

    /**
     * Render verify OTP page
     * GET /register/verify-otp
     */
    async getVerifyOtpPage(req, res) {
        try {
            const { email } = req.query;
            res.send(this.renderVerifyOtpPage(email));
        } catch (error) {
            console.error('Error rendering verify OTP page:', error);
            res.status(500).send(this.renderErrorPage('Server Error', 'An error occurred while loading the verification page.'));
        }
    }

    /**
     * Render select plan page
     * GET /register/select-plan
     */
    async getSelectPlanPage(req, res) {
        try {
            const { getSelectPlanPage } = require('./subscriptionController');
            await getSelectPlanPage(req, res);
        } catch (error) {
            console.error('Error rendering select plan page:', error);
            res.status(500).send(this.renderErrorPage('Server Error', 'An error occurred while loading the plan selection page.'));
        }
    }

    /**
     * Render signup page HTML
     */
    renderSignupPage() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - FunnelsEye</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
            min-height: 100vh;
            color: #1a1a1a;
            line-height: 1.6;
            position: relative;
            overflow-x: hidden;
        }
        
        /* Floating background elements */
        .floating-element {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(59, 130, 246, 0.12) 50%, rgba(139, 92, 246, 0.08) 100%);
            animation: float 20s infinite linear;
            pointer-events: none;
            z-index: 0;
        }
        
        .floating-element:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .floating-element:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 20%;
            right: 15%;
            animation-delay: -5s;
        }
        
        .floating-element:nth-child(3) {
            width: 60px;
            height: 60px;
            top: 60%;
            left: 5%;
            animation-delay: -10s;
        }
        
        .floating-element:nth-child(4) {
            width: 100px;
            height: 100px;
            top: 70%;
            right: 10%;
            animation-delay: -15s;
        }
        
        .floating-element:nth-child(5) {
            width: 40px;
            height: 40px;
            top: 40%;
            left: 20%;
            animation-delay: -8s;
        }
        
        .floating-element:nth-child(6) {
            width: 90px;
            height: 90px;
            top: 30%;
            right: 30%;
            animation-delay: -12s;
        }
        
        @keyframes float {
            0% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0.3;
            }
            50% {
                transform: translateY(-20px) rotate(180deg);
                opacity: 0.6;
            }
            100% {
                transform: translateY(0px) rotate(360deg);
                opacity: 0.3;
            }
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            z-index: 1;
        }
        
        .signup-wrapper {
            display: flex;
            gap: 40px;
            align-items: flex-start;
            justify-content: center;
        }
        
        .form-section {
            flex: 1;
            max-width: 500px;
        }
        
        .coach-info-panel {
            flex: 1;
            max-width: 400px;
            background: #ffffff;
            border-radius: 12px;
            padding: 32px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            display: none;
            position: sticky;
            top: 40px;
        }
        
        .coach-info-panel.show {
            display: block;
        }
        
        .coach-info-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .coach-info-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0;
        }
        
        .edit-coach-btn {
            background: #6366f1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .edit-coach-btn:hover {
            background: #5b21b6;
        }
        
        .coach-info-item {
            margin-bottom: 16px;
        }
        
        .coach-info-label {
            font-size: 0.8rem;
            font-weight: 500;
            color: #666;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .coach-info-value {
            font-size: 0.9rem;
            color: #1a1a1a;
            font-weight: 500;
            padding: 8px 12px;
            background: #f8f9ff;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        .coach-status {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 20px;
            padding: 12px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
        }
        
        .coach-status-icon {
            width: 16px;
            height: 16px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
        }
        
        .coach-status-text {
            font-size: 0.8rem;
            color: #059669;
            font-weight: 500;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header .subtitle {
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6366f1;
            margin-bottom: 16px;
            font-family: 'Poppins', sans-serif;
        }
        
        .header h1 {
            font-size: 2rem;
            font-weight: 300;
            color: #1a1a1a;
            margin-bottom: 8px;
            line-height: 1.3;
            font-family: 'Poppins', sans-serif;
        }
        
        .header p {
            color: #666666;
            font-size: 0.9rem;
            font-weight: 400;
        }
        
        .form-container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px 32px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #1a1a1a;
            font-weight: 500;
            font-size: 0.9rem;
            font-family: 'Poppins', sans-serif;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 16px 20px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            background: #ffffff;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
        }
        
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .role-selection {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }
        
        .role-option {
            padding: 16px 20px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #ffffff;
            user-select: none;
            position: relative;
            z-index: 1;
        }
        
        .role-option.selected {
            border-color: #6366f1;
            background: #6366f1;
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .role-option:hover {
            border-color: #6366f1;
        }
        
        .role-option strong {
            display: block;
            font-weight: 500;
            font-size: 0.9rem;
            margin-bottom: 4px;
        }
        
        .role-option small {
            font-size: 0.75rem;
            opacity: 0.8;
        }
        
        /* Modal Dialog Styles */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            backdrop-filter: blur(4px);
        }
        
        .modal-overlay.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            position: relative;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #666;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .modal-close:hover {
            background: #f1f5f9;
            color: #333;
        }
        
        .coach-fields {
            display: none;
            margin-top: 24px;
            padding: 24px;
            background: #f8f9ff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .coach-fields.show {
            display: block;
        }
        
        .coach-fields .form-group {
            margin-bottom: 20px;
        }
        
        .coach-fields small {
            color: #666666;
            font-size: 0.75rem;
            margin-top: 4px;
            display: block;
        }
        
        .search-sponsors-btn {
            margin-top: 8px;
            padding: 8px 16px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            color: #6366f1;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        }
        
        .search-sponsors-btn:hover {
            background: #e2e8f0;
        }
        
        .sponsor-results {
            margin-top: 12px;
            display: none;
        }
        
        .sponsor-search-container {
            margin-top: 12px;
            display: none;
        }
        
        .sponsor-search-container.show {
            display: block;
        }
        
        .search-input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.9rem;
            margin-bottom: 16px;
            font-family: 'Poppins', sans-serif;
        }
        
        .search-input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .sponsor-list {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: white;
        }
        
        .sponsor-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f1f5f9;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .sponsor-item:last-child {
            border-bottom: none;
        }
        
        .sponsor-item:hover {
            background: #f8f9ff;
        }
        
        .sponsor-item.selected {
            background: #6366f1;
            color: white;
        }
        
        .sponsor-info {
            flex: 1;
        }
        
        .sponsor-id {
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .sponsor-details {
            font-size: 0.8rem;
            opacity: 0.8;
            margin-top: 2px;
        }
        
        .sponsor-level {
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .sponsor-item.selected .sponsor-level {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 16px;
            gap: 8px;
        }
        
        .pagination button {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }
        
        .pagination button:hover:not(:disabled) {
            background: #f8f9ff;
            border-color: #6366f1;
        }
        
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .pagination button.active {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
        }
        
        .pagination-info {
            font-size: 0.8rem;
            color: #666;
            margin: 0 8px;
        }
        
        .btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 8px;
            font-family: 'Poppins', sans-serif;
        }
        
        .btn:hover {
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        
        .btn:disabled {
            background: #f0f0f0;
            color: #cccccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .login-link {
            text-align: center;
            margin-top: 24px;
            color: #666666;
            font-size: 0.9rem;
        }
        
        .login-link a {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
        }
        
        .login-link a:hover {
            text-decoration: underline;
        }
        
        .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.85rem;
            display: none;
            border: 1px solid #fecaca;
        }
        
        .success-message {
            background: #f0fdf4;
            color: #16a34a;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.85rem;
            display: none;
            border: 1px solid #bbf7d0;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 12px;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .signup-wrapper {
                flex-direction: column;
                gap: 20px;
            }
            
            .coach-info-panel {
                position: static;
                order: -1;
            }
        }
        
        @media (max-width: 640px) {
            .container {
                padding: 20px 16px;
            }
            
            .form-container {
                padding: 32px 24px;
            }
            
            .role-selection {
                grid-template-columns: 1fr;
            }
            
            .coach-info-panel {
                padding: 24px 20px;
            }
        }
    </style>
</head>
<body>
    <!-- Floating background elements -->
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    
    <div class="container">
        <div class="header">
            <div class="subtitle">Join FunnelsEye</div>
            <h1>Create Your Account</h1>
            <p>Start your journey to growth and success</p>
        </div>
        
        <div class="signup-wrapper">
            <div class="form-section">
                <div class="form-container">
            <div class="error-message" id="errorMessage"></div>
            <div class="success-message" id="successMessage"></div>
            
            <form id="signupForm">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required minlength="6">
                </div>
                
                <div class="form-group">
                    <label>Select Role</label>
                    <div class="role-selection">
                        <div class="role-option" data-role="client">
                            <strong>Client</strong>
                        </div>
                        <div class="role-option" data-role="coach">
                            <strong>Coach</strong>
                        </div>
                    </div>
                    <input type="hidden" id="role" name="role" value="client">
                </div>
                
                <!-- Hidden inputs for coach data -->
                <input type="hidden" id="selfCoachId" name="selfCoachId">
                <input type="hidden" id="currentLevel" name="currentLevel">
                <input type="hidden" id="sponsorId" name="sponsorId">
                
                <button type="submit" class="btn" id="submitBtn">
                    Create Account
                </button>
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>Creating your account...</p>
                </div>
            </form>
            
            <div class="login-link">
                Already have an account? <a href="/register/login">Sign In</a>
            </div>
                </div>
            </div>
            
            <!-- Coach Information Panel -->
            <div class="coach-info-panel" id="coachInfoPanel">
                <div class="coach-info-header">
                    <h3 class="coach-info-title">Coach Information</h3>
                    <button class="edit-coach-btn" id="editCoachBtn">Edit</button>
                </div>
                
                <div class="coach-info-item">
                    <div class="coach-info-label">Coach ID</div>
                    <div class="coach-info-value" id="displayCoachId">-</div>
                </div>
                
                <div class="coach-info-item">
                    <div class="coach-info-label">Hierarchy Level</div>
                    <div class="coach-info-value" id="displayCurrentLevel">-</div>
                </div>
                
                <div class="coach-info-item">
                    <div class="coach-info-label">Sponsor ID</div>
                    <div class="coach-info-value" id="displaySponsorId">-</div>
                </div>
                
                <div class="coach-status">
                    <div class="coach-status-icon">✓</div>
                    <div class="coach-status-text">Coach information saved</div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Coach Information Modal -->
    <div class="modal-overlay" id="coachModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Coach Information</h3>
                <button class="modal-close" id="closeCoachModal">&times;</button>
            </div>
            
            <form id="coachForm">
                <div class="form-group">
                    <label for="modalSelfCoachId">Coach ID</label>
                    <input type="text" id="modalSelfCoachId" name="selfCoachId" placeholder="Enter your unique Coach ID" required>
                </div>
                
                <div class="form-group">
                    <label for="modalCurrentLevel">Hierarchy Level</label>
                    <select id="modalCurrentLevel" name="currentLevel" required>
                        <option value="">Loading levels...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="modalSponsorId">Sponsor ID</label>
                    <input type="text" id="modalSponsorId" name="sponsorId" placeholder="Enter your sponsor's Coach ID (e.g., W02942)" required>
                    <small>Enter the Coach ID of your sponsor, not their MongoDB ID</small>
                    <button type="button" id="modalSearchSponsorsBtn" class="search-sponsors-btn">Search Available Sponsors</button>
                    
                    <div id="modalSponsorSearchContainer" class="sponsor-search-container">
                        <input type="text" id="sponsorSearchInput" class="search-input" placeholder="Search sponsors by name or ID...">
                        <div id="modalSponsorList" class="sponsor-list"></div>
                        <div id="modalPagination" class="pagination"></div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button type="button" class="btn" id="saveCoachInfo" style="flex: 1;">
                        Save Coach Information
                    </button>
                    <button type="button" class="btn btn-secondary" id="cancelCoachInfo" style="flex: 1;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Initialize role selection immediately
        function initializeRoleSelection() {
            console.log('Initializing role selection...');
            
            // Role selection
            const roleOptions = document.querySelectorAll('.role-option');
            console.log('Found role options:', roleOptions.length);
            
            roleOptions.forEach(option => {
                console.log('Adding click listener to:', option.dataset.role);
                option.addEventListener('click', function() {
                    console.log('Role clicked:', this.dataset.role);
                    
                    // Remove selected class from all options
                    document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    
                    // Update hidden input value
                    document.getElementById('role').value = this.dataset.role;
                    
            // Show/hide coach modal
            if (this.dataset.role === 'coach') {
                document.getElementById('coachModal').classList.add('show');
                console.log('Coach modal shown');
                // Load hierarchy levels when modal opens
                loadHierarchyLevels();
            } else {
                document.getElementById('coachModal').classList.remove('show');
                console.log('Coach modal hidden');
            }
                });
            });
            
            // Set default selection
            const defaultOption = document.querySelector('.role-option[data-role="client"]');
            if (defaultOption) {
                defaultOption.classList.add('selected');
                console.log('Default selection set to client');
            } else {
                console.error('Could not find default client option');
            }
        }
        
        // Function to load hierarchy levels from API (global scope)
        async function loadHierarchyLevels() {
            try {
                const response = await fetch('/api/advanced-mlm/hierarchy-levels');
                const result = await response.json();
                
                const levelSelect = document.getElementById('modalCurrentLevel');
                
                if (result.success && result.data && result.data.length > 0) {
                    // Clear existing options
                    levelSelect.innerHTML = '<option value="">Select Level</option>';
                    
                    // Add hierarchy levels from API
                    result.data.forEach(level => {
                        const option = document.createElement('option');
                        option.value = level.level;
                        option.textContent = level.name + ' (Level ' + level.level + ')';
                        levelSelect.appendChild(option);
                    });
                    
                    console.log('Hierarchy levels loaded:', result.data.length);
                } else {
                    // Fallback to default levels if API fails
                    levelSelect.innerHTML = '<option value="">Select Level</option>' +
                        '<option value="1">Level 1</option>' +
                        '<option value="2">Level 2</option>' +
                        '<option value="3">Level 3</option>' +
                        '<option value="4">Level 4</option>' +
                        '<option value="5">Level 5</option>';
                    console.warn('Failed to load hierarchy levels, using fallback');
                }
            } catch (error) {
                console.error('Error loading hierarchy levels:', error);
                // Fallback to default levels
                const levelSelect = document.getElementById('modalCurrentLevel');
                levelSelect.innerHTML = '<option value="">Select Level</option>' +
                    '<option value="1">Level 1</option>' +
                    '<option value="2">Level 2</option>' +
                    '<option value="3">Level 3</option>' +
                    '<option value="4">Level 4</option>' +
                    '<option value="5">Level 5</option>';
            }
        }
        
        // Try to initialize immediately, then also on DOMContentLoaded as backup
        initializeRoleSelection();
        document.addEventListener('DOMContentLoaded', initializeRoleSelection);
        
        // Modal functionality
        document.addEventListener('DOMContentLoaded', function() {
            const coachModal = document.getElementById('coachModal');
            const closeModalBtn = document.getElementById('closeCoachModal');
            const cancelBtn = document.getElementById('cancelCoachInfo');
            const saveBtn = document.getElementById('saveCoachInfo');
            
            // Close modal functions
            function closeModal() {
                coachModal.classList.remove('show');
                // Reset form
                document.getElementById('coachForm').reset();
                document.getElementById('modalSponsorSearchContainer').classList.remove('show');
            }
            
            closeModalBtn.addEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);
            
            // Close modal when clicking outside
            coachModal.addEventListener('click', function(e) {
                if (e.target === coachModal) {
                    closeModal();
                }
            });
            
            // Save coach information
            saveBtn.addEventListener('click', function() {
                const formData = new FormData(document.getElementById('coachForm'));
                const coachData = Object.fromEntries(formData);
                
                // Validate required fields
                if (!coachData.selfCoachId || !coachData.currentLevel || !coachData.sponsorId) {
                    alert('Please fill in all required fields.');
                    return;
                }
                
                // Store coach data in hidden inputs for form submission
                document.getElementById('selfCoachId').value = coachData.selfCoachId;
                document.getElementById('currentLevel').value = coachData.currentLevel;
                document.getElementById('sponsorId').value = coachData.sponsorId;
                
                // Update coach info panel display
                updateCoachInfoPanel(coachData);
                
                closeModal();
            });
            
            // Edit coach information
            const editBtn = document.getElementById('editCoachBtn');
            editBtn.addEventListener('click', function() {
                // Pre-fill modal with existing data
                const existingData = {
                    selfCoachId: document.getElementById('selfCoachId').value,
                    currentLevel: document.getElementById('currentLevel').value,
                    sponsorId: document.getElementById('sponsorId').value
                };
                
                if (existingData.selfCoachId) {
                    document.getElementById('modalSelfCoachId').value = existingData.selfCoachId;
                    document.getElementById('modalSponsorId').value = existingData.sponsorId;
                    
                    // Load hierarchy levels and then set the value
                    loadHierarchyLevels().then(() => {
                        document.getElementById('modalCurrentLevel').value = existingData.currentLevel;
                    });
                    
                    // Show modal
                    coachModal.classList.add('show');
                }
            });
            
            
            // Function to update coach info panel
            function updateCoachInfoPanel(coachData) {
                document.getElementById('displayCoachId').textContent = coachData.selfCoachId;
                
                // Find the level name from the select options
                const levelSelect = document.getElementById('modalCurrentLevel');
                const options = levelSelect.getElementsByTagName('option');
                let levelDisplayName = 'Level ' + coachData.currentLevel;
                
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === coachData.currentLevel) {
                        levelDisplayName = options[i].textContent;
                        break;
                    }
                }
                
                document.getElementById('displayCurrentLevel').textContent = levelDisplayName;
                document.getElementById('displaySponsorId').textContent = coachData.sponsorId;
                
                // Show the panel
                document.getElementById('coachInfoPanel').classList.add('show');
            }
            
            // Sponsor search with pagination
            let allSponsors = [];
            let currentPage = 1;
            const itemsPerPage = 5;
            let filteredSponsors = [];
            
            const searchBtn = document.getElementById('modalSearchSponsorsBtn');
            const searchContainer = document.getElementById('modalSponsorSearchContainer');
            const searchInput = document.getElementById('sponsorSearchInput');
            const sponsorList = document.getElementById('modalSponsorList');
            const pagination = document.getElementById('modalPagination');
            
            // Load sponsors
            async function loadSponsors() {
                try {
                    const response = await fetch('/api/auth/available-sponsors');
                    const result = await response.json();
                    
                    if (result.success && result.data.digitalSponsors.length > 0) {
                        allSponsors = result.data.digitalSponsors;
                        filteredSponsors = [...allSponsors];
                        renderSponsors();
                        renderPagination();
                    } else {
                        sponsorList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No sponsors available at the moment.</div>';
                    }
                } catch (error) {
                    sponsorList.innerHTML = '<div style="padding: 20px; text-align: center; color: #c33;">Error loading sponsors. Please try again.</div>';
                }
            }
            
            // Render sponsors
            function renderSponsors() {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const pageSponsors = filteredSponsors.slice(startIndex, endIndex);
                
                if (pageSponsors.length === 0) {
                    sponsorList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No sponsors found.</div>';
                    return;
                }
                
                let html = '';
                pageSponsors.forEach(sponsor => {
                    html += '<div class="sponsor-item" data-sponsor-id="' + sponsor.selfCoachId + '">';
                    html += '<div class="sponsor-info">';
                    html += '<div class="sponsor-id">' + sponsor.selfCoachId + '</div>';
                    html += '<div class="sponsor-details">' + sponsor.name + '</div>';
                    html += '</div>';
                    html += '<div class="sponsor-level">Level ' + sponsor.currentLevel + '</div>';
                    html += '</div>';
                });
                sponsorList.innerHTML = html;
                
                // Add click listeners
                sponsorList.querySelectorAll('.sponsor-item').forEach(item => {
                    item.addEventListener('click', function() {
                        // Remove previous selection
                        sponsorList.querySelectorAll('.sponsor-item').forEach(i => i.classList.remove('selected'));
                        
                        // Add selection to clicked item
                        this.classList.add('selected');
                        
                        // Set sponsor ID
                        const sponsorId = this.getAttribute('data-sponsor-id');
                        document.getElementById('modalSponsorId').value = sponsorId;
                        
                        // Hide search container
                        searchContainer.classList.remove('show');
                    });
                });
            }
            
            // Render pagination
            function renderPagination() {
                const totalPages = Math.ceil(filteredSponsors.length / itemsPerPage);
                
                if (totalPages <= 1) {
                    pagination.innerHTML = '';
                    return;
                }
                
                let html = '';
                
                // Previous button
                html += '<button ' + (currentPage === 1 ? 'disabled' : '') + ' onclick="changePage(' + (currentPage - 1) + ')">‹</button>';
                
                // Page numbers
                for (let i = 1; i <= totalPages; i++) {
                    if (i === currentPage) {
                        html += '<button class="active" onclick="changePage(' + i + ')">' + i + '</button>';
                    } else {
                        html += '<button onclick="changePage(' + i + ')">' + i + '</button>';
                    }
                }
                
                // Next button
                html += '<button ' + (currentPage === totalPages ? 'disabled' : '') + ' onclick="changePage(' + (currentPage + 1) + ')">›</button>';
                
                pagination.innerHTML = html;
            }
            
            // Change page function (global for onclick)
            window.changePage = function(page) {
                currentPage = page;
                renderSponsors();
                renderPagination();
            };
            
            // Search functionality
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                filteredSponsors = allSponsors.filter(sponsor => 
                    sponsor.selfCoachId.toLowerCase().includes(searchTerm) ||
                    sponsor.name.toLowerCase().includes(searchTerm)
                );
                currentPage = 1;
                renderSponsors();
                renderPagination();
            });
            
            // Show search container
            searchBtn.addEventListener('click', function() {
                searchContainer.classList.toggle('show');
                if (searchContainer.classList.contains('show') && allSponsors.length === 0) {
                    loadSponsors();
                }
            });
        });
        
        // Form submission
        document.addEventListener('DOMContentLoaded', function() {
            const signupForm = document.getElementById('signupForm');
            if (signupForm) {
                signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            
            submitBtn.disabled = true;
            loading.style.display = 'block';
            
            try {
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    successMessage.textContent = result.message;
                    successMessage.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = '/register/verify-otp?email=' + encodeURIComponent(data.email);
                    }, 2000);
                } else {
                    errorMessage.textContent = result.message;
                    errorMessage.style.display = 'block';
                }
                
            } catch (error) {
                errorMessage.textContent = 'Network error. Please try again.';
                errorMessage.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                loading.style.display = 'none';
            }
                });
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Render login page HTML
     */
    renderLoginPage() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - FunnelsEye</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
            min-height: 100vh;
            color: #1a1a1a;
            line-height: 1.6;
            position: relative;
            overflow-x: hidden;
        }
        
        /* Floating background elements */
        .floating-element {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(59, 130, 246, 0.12) 50%, rgba(139, 92, 246, 0.08) 100%);
            animation: float 20s infinite linear;
            pointer-events: none;
            z-index: 0;
        }
        
        .floating-element:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .floating-element:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 20%;
            right: 15%;
            animation-delay: -5s;
        }
        
        .floating-element:nth-child(3) {
            width: 60px;
            height: 60px;
            top: 60%;
            left: 5%;
            animation-delay: -10s;
        }
        
        .floating-element:nth-child(4) {
            width: 100px;
            height: 100px;
            top: 70%;
            right: 10%;
            animation-delay: -15s;
        }
        
        .floating-element:nth-child(5) {
            width: 40px;
            height: 40px;
            top: 40%;
            left: 20%;
            animation-delay: -8s;
        }
        
        .floating-element:nth-child(6) {
            width: 90px;
            height: 90px;
            top: 30%;
            right: 30%;
            animation-delay: -12s;
        }
        
        @keyframes float {
            0% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0.3;
            }
            50% {
                transform: translateY(-20px) rotate(180deg);
                opacity: 0.6;
            }
            100% {
                transform: translateY(0px) rotate(360deg);
                opacity: 0.3;
            }
        }
        
        .container {
            max-width: 400px;
            margin: 0 auto;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            z-index: 1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header .subtitle {
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6366f1;
            margin-bottom: 16px;
            font-family: 'Poppins', sans-serif;
        }
        
        .header h1 {
            font-size: 2rem;
            font-weight: 300;
            color: #1a1a1a;
            margin-bottom: 8px;
            line-height: 1.3;
            font-family: 'Poppins', sans-serif;
        }
        
        .header p {
            color: #666666;
            font-size: 0.9rem;
            font-weight: 400;
        }
        
        .form-container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px 32px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #1a1a1a;
            font-weight: 500;
            font-size: 0.9rem;
            font-family: 'Poppins', sans-serif;
        }
        
        .form-group input {
            width: 100%;
            padding: 16px 20px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            background: #ffffff;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 8px;
            font-family: 'Poppins', sans-serif;
        }
        
        .btn:hover {
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        
        .btn:disabled {
            background: #f0f0f0;
            color: #cccccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .links {
            text-align: center;
            margin-top: 24px;
            color: #666666;
            font-size: 0.9rem;
        }
        
        .links a {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
            display: block;
            margin-bottom: 8px;
        }
        
        .links a:hover {
            text-decoration: underline;
        }
        
        .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.85rem;
            display: none;
            border: 1px solid #fecaca;
        }
        
        .success-message {
            background: #f0fdf4;
            color: #16a34a;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.85rem;
            display: none;
            border: 1px solid #bbf7d0;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 12px;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
            .container {
                padding: 20px 16px;
            }
            
            .form-container {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<body>
    <!-- Floating background elements -->
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    
    <div class="container">
        <div class="header">
            <div class="subtitle">Welcome Back</div>
            <h1>Sign In</h1>
            <p>Access your FunnelsEye account</p>
        </div>
        
        <div class="form-container">
            <div class="error-message" id="errorMessage"></div>
            <div class="success-message" id="successMessage"></div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit" class="btn" id="submitBtn">
                    Sign In
                </button>
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>Signing you in...</p>
                </div>
            </form>
            
            <div class="links">
                <a href="/register/signup">Don't have an account? Sign Up</a>
                <a href="#" id="forgotPasswordLink">Forgot Password?</a>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const submitBtn = document.getElementById('submitBtn');
                    const loading = document.getElementById('loading');
                    const errorMessage = document.getElementById('errorMessage');
                    const successMessage = document.getElementById('successMessage');
                    
                    errorMessage.style.display = 'none';
                    successMessage.style.display = 'none';
                    
                    submitBtn.disabled = true;
                    loading.style.display = 'block';
                    
                    try {
                        const formData = new FormData(this);
                        const data = Object.fromEntries(formData);
                        
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            successMessage.textContent = 'Login successful! Redirecting...';
                            successMessage.style.display = 'block';
                            
                            if (result.token) {
                                localStorage.setItem('token', result.token);
                            }
                            
                            setTimeout(() => {
                                if (result.user && result.user.role === 'coach') {
                                    window.location.href = '/register/select-plan?token=' + result.token;
                                } else {
                                    window.location.href = '/dashboard';
                                }
                            }, 1500);
                        } else {
                            if (result.needsVerification) {
                                errorMessage.innerHTML = result.message + '<br><a href="/register/verify-otp?email=' + encodeURIComponent(data.email) + '" style="color: #6366f1;">Click here to verify your email</a>';
                            } else {
                                errorMessage.textContent = result.message;
                            }
                            errorMessage.style.display = 'block';
                        }
                        
                    } catch (error) {
                        errorMessage.textContent = 'Network error. Please try again.';
                        errorMessage.style.display = 'block';
                    } finally {
                        submitBtn.disabled = false;
                        loading.style.display = 'none';
                    }
                });
            }
            
            const forgotPasswordLink = document.getElementById('forgotPasswordLink');
            if (forgotPasswordLink) {
                forgotPasswordLink.addEventListener('click', async function(e) {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    
                    if (!email) {
                        alert('Please enter your email address first.');
                        return;
                    }
                    
                    try {
                        const response = await fetch('/api/auth/forgot-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Password reset email sent! Check your inbox.');
                        } else {
                            alert(result.message);
                        }
                    } catch (error) {
                        alert('Network error. Please try again.');
                    }
                });
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Render verify OTP page HTML
     */
    renderVerifyOtpPage(email = '') {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email - FunnelsEye</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
            min-height: 100vh;
            color: #1a1a1a;
            line-height: 1.6;
            position: relative;
            overflow-x: hidden;
        }
        
        /* Floating background elements */
        .floating-element {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(59, 130, 246, 0.12) 50%, rgba(139, 92, 246, 0.08) 100%);
            animation: float 20s infinite linear;
            pointer-events: none;
            z-index: 0;
        }
        
        .floating-element:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }
        
        .floating-element:nth-child(2) {
            width: 120px;
            height: 120px;
            top: 20%;
            right: 15%;
            animation-delay: -5s;
        }
        
        .floating-element:nth-child(3) {
            width: 60px;
            height: 60px;
            top: 60%;
            left: 5%;
            animation-delay: -10s;
        }
        
        .floating-element:nth-child(4) {
            width: 100px;
            height: 100px;
            top: 70%;
            right: 10%;
            animation-delay: -15s;
        }
        
        .floating-element:nth-child(5) {
            width: 40px;
            height: 40px;
            top: 40%;
            left: 20%;
            animation-delay: -8s;
        }
        
        .floating-element:nth-child(6) {
            width: 90px;
            height: 90px;
            top: 30%;
            right: 30%;
            animation-delay: -12s;
        }
        
        @keyframes float {
            0% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0.3;
            }
            50% {
                transform: translateY(-20px) rotate(180deg);
                opacity: 0.6;
            }
            100% {
                transform: translateY(0px) rotate(360deg);
                opacity: 0.3;
            }
        }
        
        .container {
            max-width: 400px;
            margin: 0 auto;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            z-index: 1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header .subtitle {
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6366f1;
            margin-bottom: 16px;
            font-family: 'Poppins', sans-serif;
        }
        
        .header h1 {
            font-size: 2rem;
            font-weight: 300;
            color: #1a1a1a;
            margin-bottom: 8px;
            line-height: 1.3;
            font-family: 'Poppins', sans-serif;
        }
        
        .header p {
            color: #666666;
            font-size: 0.9rem;
            font-weight: 400;
        }
        
        .verification-icon {
            text-align: center;
            margin-bottom: 24px;
        }
        
        .verification-icon svg {
            width: 48px;
            height: 48px;
            color: #6366f1;
        }
        
        .form-container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px 32px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #1a1a1a;
            font-weight: 500;
            font-size: 0.9rem;
            font-family: 'Poppins', sans-serif;
        }
        
        .form-group input {
            width: 100%;
            padding: 16px 20px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            background: #ffffff;
            font-family: 'Poppins', sans-serif;
            font-weight: 400;
            text-align: center;
            letter-spacing: 2px;
            font-weight: 600;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 8px;
            font-family: 'Poppins', sans-serif;
        }
        
        .btn:hover {
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        
        .btn:disabled {
            background: #f0f0f0;
            color: #cccccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .btn-secondary {
            background: #f1f5f9;
            color: #6366f1;
            margin-top: 12px;
        }
        
        .btn-secondary:hover {
            background: #e2e8f0;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        
        .links {
            text-align: center;
            margin-top: 24px;
            color: #666666;
            font-size: 0.9rem;
        }
        
        .links a {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
            display: block;
            margin-bottom: 8px;
        }
        
        .links a:hover {
            text-decoration: underline;
        }
        
        .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.85rem;
            display: none;
            border: 1px solid #fecaca;
        }
        
        .success-message {
            background: #f0fdf4;
            color: #16a34a;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.85rem;
            display: none;
            border: 1px solid #bbf7d0;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 12px;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .email-display {
            background: #f8f9ff;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            text-align: center;
            font-weight: 500;
            color: #1a1a1a;
            border: 1px solid #e2e8f0;
        }
        
        @media (max-width: 640px) {
            .container {
                padding: 20px 16px;
            }
            
            .form-container {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<body>
    <!-- Floating background elements -->
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    <div class="floating-element"></div>
    
    <div class="container">
        <div class="header">
            <div class="subtitle">Email Verification</div>
            <h1>Verify Your Email</h1>
            <p>Enter the verification code sent to your email</p>
        </div>
        
        <div class="verification-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
        </div>
        
        <div class="form-container">
            <div class="error-message" id="errorMessage"></div>
            <div class="success-message" id="successMessage"></div>
            
            <div class="email-display" id="emailDisplay">
                ${email ? 'Verification code sent to: ' + email : 'Enter your email and verification code'}
            </div>
            
            <form id="verifyForm">
                <div class="form-group" id="emailGroup" style="${email ? 'display: none;' : ''}">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="${email}" required>
                </div>
                
                <div class="form-group">
                    <label for="otp">Verification Code</label>
                    <input type="text" id="otp" name="otp" placeholder="Enter 6-digit code" maxlength="6" required>
                </div>
                
                <button type="submit" class="btn" id="submitBtn">
                    Verify Email
                </button>
                
                <button type="button" class="btn btn-secondary" id="resendBtn">
                    Resend Code
                </button>
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>Verifying...</p>
                </div>
            </form>
            
            <div class="links">
                <a href="/register/signup">Back to Sign Up</a>
                <a href="/register/login">Back to Sign In</a>
            </div>
        </div>
    </div>

    <script>
        const email = '${email}';
        
        document.addEventListener('DOMContentLoaded', function() {
            // Focus on OTP input
            const otpInput = document.getElementById('otp');
            if (otpInput) {
                otpInput.focus();
            }
            
            // Form submission
            const verifyForm = document.getElementById('verifyForm');
            if (verifyForm) {
                verifyForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const submitBtn = document.getElementById('submitBtn');
                    const loading = document.getElementById('loading');
                    const errorMessage = document.getElementById('errorMessage');
                    const successMessage = document.getElementById('successMessage');
                    
                    errorMessage.style.display = 'none';
                    successMessage.style.display = 'none';
                    
                    submitBtn.disabled = true;
                    loading.style.display = 'block';
                    
                    try {
                        const formData = new FormData(this);
                        const data = Object.fromEntries(formData);
                        
                        const response = await fetch('/api/auth/verify-otp', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            successMessage.textContent = 'Email verified successfully! Redirecting...';
                            successMessage.style.display = 'block';
                            
                            if (result.token) {
                                localStorage.setItem('token', result.token);
                            }
                            
                            setTimeout(() => {
                                if (result.user && result.user.role === 'coach') {
                                    window.location.href = '/register/select-plan?token=' + result.token;
                                } else {
                                    window.location.href = '/dashboard';
                                }
                            }, 1500);
                        } else {
                            errorMessage.textContent = result.message;
                            errorMessage.style.display = 'block';
                        }
                        
                    } catch (error) {
                        errorMessage.textContent = 'Network error. Please try again.';
                        errorMessage.style.display = 'block';
                    } finally {
                        submitBtn.disabled = false;
                        loading.style.display = 'none';
                    }
                });
            }
            
            // Resend button
            const resendBtn = document.getElementById('resendBtn');
            if (resendBtn) {
                resendBtn.addEventListener('click', async function() {
                    const emailValue = document.getElementById('email').value;
                    
                    if (!emailValue) {
                        alert('Please enter your email address first.');
                        return;
                    }
                    
                    try {
                        const response = await fetch('/api/auth/resend-otp', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: emailValue })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('New verification code sent!');
                        } else {
                            alert(result.message);
                        }
                    } catch (error) {
                        alert('Network error. Please try again.');
                    }
                });
            }
            
            // Auto-submit when OTP is complete
            if (otpInput) {
                otpInput.addEventListener('input', function() {
                    if (this.value.length === 6) {
                        setTimeout(() => {
                            const verifyForm = document.getElementById('verifyForm');
                            if (verifyForm) {
                                verifyForm.dispatchEvent(new Event('submit'));
                            }
                        }, 500);
                    }
                });
            }
        });
    </script>
</body>
</html>`;
    }

    /**
     * Render error page HTML
     */
    renderErrorPage(title, message) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - FunnelsEye</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .logo h1 {
            color: #667eea;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        
        .error-icon {
            font-size: 48px;
            color: #e74c3c;
            margin-bottom: 20px;
        }
        
        h2 {
            color: #333;
            margin-bottom: 15px;
        }
        
        p {
            color: #666;
            margin-bottom: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>FunnelsEye</h1>
        </div>
        
        <div class="error-icon">⚠️</div>
        
        <h2>${title}</h2>
        <p>${message}</p>
        
        <a href="/register/signup" class="btn">Go to Sign Up</a>
    </div>
</body>
</html>`;
    }
}

module.exports = RegisterController;