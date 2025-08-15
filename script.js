class EduAI {
    constructor() {
        this.isLoggedIn = false;
        this.userType = 'guest';
        this.userName = '';
        this.currentSubject = null;
        this.conversationHistory = [];
        this.activityLog = [];
        this.monitoringInterval = null;
        // You need to replace this with your actual Gemini API key
        // For security, consider creating a backend endpoint to handle API calls
        this.geminiApiKey = 'AIzaSyDaLO5Ec5iaY0ceAPvruyK5_id5e78iRjw';

        // Demo LRN Database for Research
        this.studentDatabase = {
            '111501130391': 'Klint Jhon C. Zamora',
            '111072130042': 'Ethan Jared S. Gapulao',
            '111023140156': 'Juleia Luzelle K. Crispino',
            '111029130011': 'Ilona Jessica E. Garcia',
            '111090140302': 'Diego Miguel B. Panes',
            '111076130298': 'Nicah Anie Viktoria S. Rea'
        };

        this.teacherCredentials = {
            'klintzamora711@gmail.com': 'teacher123',
            'ethangapulao@gmail.com': 'teacher123',
            'demo@teacher.com': 'demo123'
        };

        this.init();
    }

    init() {
        console.log('EduScie Platform Loaded - PPCNSHS SY 2025-2026');
        console.log('Research Demo Credentials:');
        console.log('Students:');
        Object.entries(this.studentDatabase).forEach(([lrn, name]) => {
            console.log(`  LRN: ${lrn} (${name})`);
        });
        console.log('Teacher: klintzamora711@gmail.com / teacher123');
        console.log('Subjects: Mathematics, Science, English');

        this.setupEventListeners();
        this.loadData();

         if (location.hostname.includes('github.io')) {
        localStorage.removeItem('eduai_activity');
        localStorage.removeItem('eduai_conversation');
        localStorage.removeItem('eduai_active_students');
        console.log("Live site detected — old activity logs cleared.");
        
    }
}

    setupEventListeners() {
        // Welcome screen
        document.getElementById('enterPlatformBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.hideLoginModal();
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('loginModal');
            if (e.target === modal) {
                this.hideLoginModal();
            }
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Login forms
        document.getElementById('studentLogin').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentLogin();
        });

        document.getElementById('teacherLogin').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTeacherLogin();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Chat functionality
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Subject buttons
        document.querySelectorAll('.subject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subject = e.target.dataset.subject;
                this.startSubjectSession(subject);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Popup modal
        document.getElementById('popupBtn').addEventListener('click', () => {
            this.hidePopup();
        });
    }

   showLoginModal() {
    document.getElementById('welcomeScreen').style.display = 'none';
    const loginModal = document.getElementById('loginModal');
    loginModal.classList.remove('hidden');
    loginModal.style.display = 'flex'; // ✅

    }

    hideLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    // If not logged in, show welcome screen again
    if (!this.isLoggedIn) {
        document.getElementById('welcomeScreen').style.display = 'flex';
    }


    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    handleStudentLogin() {
        const lrn = document.getElementById('lrn').value.trim();

        if (!lrn) {
            this.showPopup('error', 'Input Required', 'Please enter your LRN.');
            return;
        }

        if (!/^\d{12}$/.test(lrn)) {
            this.showPopup('error', 'Invalid LRN Format', 'LRN must be exactly 12 digits.');
            return;
        }

        if (this.studentDatabase[lrn]) {
            this.userType = 'student';
            this.userName = this.studentDatabase[lrn];
            this.loginSuccess();
        } else {
            this.showPopup('error', 'Invalid LRN', 'This LRN is not registered for students in our system. Please contact your teacher.');
        }
    }

    handleTeacherLogin() {
        const email = document.getElementById('teacherEmail').value.trim();
        const password = document.getElementById('teacherPassword').value;

        if (!email || !password) {
            this.showPopup('error', 'Fields Required', 'Please enter both email and password.');
            return;
        }

        if (this.teacherCredentials[email] && this.teacherCredentials[email] === password) {
            this.userType = 'teacher';
            this.userName = email;
            this.loginSuccess();
        } else {
            this.showPopup('error', 'Invalid Gmail', 'Email or password is incorrect. Only authorized teacher Gmail accounts can access the dashboard.');
            document.getElementById('teacherEmail').value = '';
            document.getElementById('teacherPassword').value = '';
        }
    }
loginSuccess() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');

    this.isLoggedIn = true;

    // ✅ Add student to active list in localStorage
    if (this.userType === 'student') {
        const currentLrn = Object.keys(this.studentDatabase).find(
            key => this.studentDatabase[key] === this.userName
        );

        let activeStudents = JSON.parse(localStorage.getItem('eduai_active_students')) || [];

        // Remove any previous entry for same LRN
        activeStudents = activeStudents.filter(s => s.lrn !== currentLrn);

        // Add fresh entry
        activeStudents.push({
            lrn: currentLrn,
            name: this.userName,
            lastActive: Date.now()
        });

        localStorage.setItem('eduai_active_students', JSON.stringify(activeStudents));
    }

    // Update user display
    const userDisplay = document.getElementById('userDisplay');
    if (this.userType === 'student') {
        userDisplay.textContent = `Student: ${this.userName}`;
    } else {
        userDisplay.textContent = `Teacher: ${this.userName}`;
    }

    // Show/hide dashboard button
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (this.userType === 'teacher') {
        dashboardBtn.style.display = 'block';
        this.startRealTimeMonitoring();
    } else {
        dashboardBtn.style.display = 'none';
    }

    // Initialize chat
    this.initializeChat();

    if (this.userType === 'teacher') {
        this.loadDashboard();
    }



    // ✅ Track active student in localStorage
    if (this.userType === 'student') {
        let activeStudents = JSON.parse(localStorage.getItem('eduai_active_students')) || [];

        // Remove old entry for the same LRN
        const currentLrn = Object.keys(this.studentDatabase).find(
            key => this.studentDatabase[key] === this.userName
        );
        activeStudents = activeStudents.filter(s => s.lrn !== currentLrn);

        // Add new entry
        activeStudents.push({
            name: this.userName,
            lrn: currentLrn,
            timestamp: Date.now()
        });

        // Save updated list
        localStorage.setItem('eduai_active_students', JSON.stringify(activeStudents));
    }
}

    navigateToSection(sectionName) {
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(`${sectionName}-section`).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        if (sectionName === 'dashboard' && this.userType === 'teacher') {
            this.loadDashboard();
        }
    }

    initializeChat() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="message ai">
                <div class="message-content">
                    Welcome to EduScie! I'm your AI educational assistant. I can help you with:
                    <br><br>
                    📊 <strong>Mathematics:</strong> Problem-solving, concepts, formulas
                    <br>🔬 <strong>Science:</strong> Theories, experiments, principles  
                    <br>📝 <strong>English:</strong> Grammar, vocabulary, writing
                    <br><br>
                    What would you like to learn about today?
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            </div>
        `;
    }

    startSubjectSession(subject) {
        this.currentSubject = subject;
        this.navigateToSection('chat');

        const subjectNames = {
            'math': 'Mathematics',
            'science': 'Science', 
            'english': 'English'
        };

        this.addMessage('ai', `Great! Let's start your <strong>${subjectNames[subject]}</strong> session. What specific topic would you like to explore?`);
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        this.addMessage('user', message);
        input.value = '';

        this.showLoading(true);

        try {
            const response = await this.getGeminiResponse(message);
            this.addMessage('ai', response);
            this.logActivity('question', message);
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.addMessage('ai', 'I apologize, but I\'m having trouble processing your request right now. Please try again.');
        }

        this.showLoading(false);
    }

    async getGeminiResponse(message) {
        // Create educational context and limitations
        const systemPrompt = this.createEducationalPrompt(message);
        
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': this.geminiApiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt + "\n\nStudent question: " + message
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 800,
                        temperature: 0.7,
                        topP: 0.8
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                let aiResponse = data.candidates[0].content.parts[0].text;
                
                // Format the response with proper HTML
                aiResponse = this.formatEducationalResponse(aiResponse);
                
                return aiResponse;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            return this.getFallbackResponse(message);
        }
    }

    createEducationalPrompt(message) {
        const subjectContext = this.currentSubject ? ` focusing on ${this.currentSubject}` : '';
        
        return `You are EduScie, an AI educational assistant for Puerto Princesa City National Science High School students. Your role is to provide guided explanations that foster ethical learning${subjectContext}.

IMPORTANT GUIDELINES:
- Provide step-by-step explanations rather than direct answers
- Encourage critical thinking and understanding
- Use examples and analogies to clarify concepts
- Ask follow-up questions to ensure comprehension
- Support learning in Mathematics, Science, and English
- Keep responses educational and appropriate for high school level
- Use proper formatting with bold text for emphasis using <strong> tags
- Never provide direct answers to homework or test questions
- Always guide students to discover answers themselves

Current conversation context: The student is asking about educational topics in a research study environment.`;
    }

    formatEducationalResponse(response) {
        // Format the response with proper HTML and bold text
        let formatted = response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
        
        return formatted;
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Detect subject if not set
        if (!this.currentSubject) {
            if (lowerMessage.includes('math') || lowerMessage.includes('calculation')) {
                this.currentSubject = 'math';
            } else if (lowerMessage.includes('science') || lowerMessage.includes('experiment')) {
                this.currentSubject = 'science';
            } else if (lowerMessage.includes('grammar') || lowerMessage.includes('writing')) {
                this.currentSubject = 'english';
            }
        }

        return `I'd be happy to help you explore <strong>"${message}"</strong> through guided learning!

<strong>Let's approach this step-by-step:</strong>
<br>• <strong>Understand</strong> the core concepts involved
<br>• <strong>Break down</strong> the problem into manageable parts  
<br>• <strong>Apply</strong> relevant principles and methods
<br>• <strong>Practice</strong> with similar examples

What specific aspect would you like to focus on first? This will help me provide more targeted guidance for your learning journey.`;
    }

    addMessage(sender, content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const time = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
                <div class="message-time">${time}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({
            sender,
            content,
            timestamp: new Date().toISOString(),
            subject: this.currentSubject
        });

        this.saveData();
    
    }

    logActivity(type, content) {
        const activity = {
            type,
            content,
            timestamp: new Date().toISOString(),
            user: this.userName,
            userType: this.userType,
            subject: this.currentSubject
        };

        this.activityLog.push(activity);
        this.saveData();
    }

    loadDashboard() {
        if (this.userType !== 'teacher') return;

        this.loadActiveStudents();
        this.loadStudentActivity();
        this.loadChatMonitor();
        this.loadAnalytics();
    }

   loadActiveStudents() {
    const container = document.getElementById('activeStudentsList');
    if (!container) return;

    // Get stored active students
    let activeStudents = JSON.parse(localStorage.getItem('eduai_active_students')) || [];

    // Filter out students inactive for more than 5 minutes
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    activeStudents = activeStudents.filter(s => now - s.lastActive <= fiveMinutes);

    if (activeStudents.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#999;">No active students</div>`;
    } else {
        container.innerHTML = activeStudents.map(student => `
            <div class="student-item online">
                <div class="student-info">
                    <div class="status-indicator"></div>
                    <div>
                        <strong>${student.name}</strong><br>
                        <small>LRN: ${student.lrn}</small><br>
                        <small style="color: #4CAF50;">Active now</small>
                    </div>
                </div>
            </div>
        `).join('');
    }
}



   loadStudentActivity() {
    const container = document.getElementById('studentActivityList');
    if (!container) return;

    let activities = JSON.parse(localStorage.getItem('eduai_activity')) || [];

    if (activities.length === 0) {
        container.innerHTML = `<div style="color:#666;text-align:center;">No recent activity yet</div>`;
        return;
    }

    container.innerHTML = activities
        .slice(-10) // last 10 activities only
        .reverse()  // newest first
        .map(activity => `
            <div class="activity-item">
                <strong>${activity.user}</strong><br>
                <span>${activity.content}</span><br>
                <small style="color: #666;">${new Date(activity.timestamp).toLocaleString()}</small>
            </div>
        `)
        .join('');
}

    loadChatMonitor() {
    const container = document.getElementById('chatMonitor');
    if (!container) return;

    let chats = JSON.parse(localStorage.getItem('eduai_conversation')) || [];

    // Filter student messages only in last 30 minutes
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    chats = chats
        .filter(c => c.sender === 'user' && (now - new Date(c.timestamp).getTime() <= thirtyMinutes))
        .reverse();

    if (chats.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#999;">No recent chats</div>`;
    } else {
        container.innerHTML = chats.map(chat => `
            <div class="chat-item">
                <strong>${chat.user || 'Student'}:</strong><br>
                ${chat.content}
                <div class="timestamp">${new Date(chat.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
  
    }

    startRealTimeMonitoring() {
    if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
    }

   this.monitoringInterval = setInterval(() => {
    if (document.getElementById('dashboard-section').classList.contains('active')) {
        this.loadActiveStudents();
        this.loadChatMonitor();
        this.loadStudentActivity();
        this.loadAnalytics(); // 🆕 refresh analytics live
    }
}, 5000);

    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

    showPopup(type, title, message) {
        const popup = document.getElementById('popupModal');
        const icon = document.getElementById('popupIcon');
        const titleEl = document.getElementById('popupTitle');
        const messageEl = document.getElementById('popupMessage');
        const btn = document.getElementById('popupBtn');

        icon.textContent = type === 'error' ? '⚠️' : 'ℹ️';
        icon.className = `popup-icon ${type}`;
        titleEl.textContent = title;
        messageEl.textContent = message;
        btn.className = `popup-btn ${type}`;

        popup.style.display = 'flex';
    }

    hidePopup() {
        document.getElementById('popupModal').style.display = 'none';
    }

    saveData() {
        try {
            localStorage.setItem('eduai_conversation', JSON.stringify(this.conversationHistory));
            localStorage.setItem('eduai_activity', JSON.stringify(this.activityLog));
        } catch (e) {
            console.log('Could not save to localStorage');
        }
    }

    loadData() {
        try {
            const conversation = localStorage.getItem('eduai_conversation');
            const activity = localStorage.getItem('eduai_activity');

            if (conversation) {
                this.conversationHistory = JSON.parse(conversation);
            }

            if (activity) {
                this.activityLog = JSON.parse(activity);
            }
        } catch (e) {
            console.log('Could not load from localStorage');
        }
    }

   logout() {
    // Remove student from active list BEFORE clearing username
    if (this.userType === 'student') {
        const currentLrn = Object.keys(this.studentDatabase).find(
            key => this.studentDatabase[key] === this.userName
        );
        let activeStudents = JSON.parse(localStorage.getItem('eduai_active_students')) || [];
        activeStudents = activeStudents.filter(s => s.lrn !== currentLrn);
        localStorage.setItem('eduai_active_students', JSON.stringify(activeStudents));
    }

    // Reset user state
    this.isLoggedIn = false;
    this.userType = 'guest';
    this.userName = '';
    this.currentSubject = null;

    if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
    }

    // Reset UI
    document.getElementById('app').classList.add('hidden');
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('loginModal').classList.add('hidden');

    // Clear login fields
    document.getElementById('lrn').value = '';
    document.getElementById('teacherEmail').value = '';
    document.getElementById('teacherPassword').value = '';

    // Reset to student tab by default
    this.switchTab('student');
}

}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.eduAI = new EduAI();
});
