// Juniper v6.2.1 - App State & Initialization

// ============================================
// STATE
// ============================================
const state = {
  // API Keys
  apiKey: localStorage.getItem('juniperApiKey') || '',
  claudeKey: localStorage.getItem('juniperClaudeKey') || '',
  
  // Voice
  allVoices: [],
  filteredVoices: [],
  specialVoices: [],
  selectedVoiceId: localStorage.getItem('juniperVoiceId') || '',
  speechSpeed: parseFloat(localStorage.getItem('juniperSpeed') || '0.95'),
  currentAudio: null,
  isTesting: false,
  
  // User Info
  info: JSON.parse(localStorage.getItem('juniperInfo') || '{}'),
  insurances: JSON.parse(localStorage.getItem('juniperInsurances') || '[]'),
  pharmacies: JSON.parse(localStorage.getItem('juniperPharmacies') || '[]'),
  
  // History & Scripts
  history: JSON.parse(localStorage.getItem('juniperHistory') || '[]'),
  myScripts: JSON.parse(localStorage.getItem('juniperScripts') || '[]'),
  fullScripts: JSON.parse(localStorage.getItem('juniperFullScripts') || JSON.stringify({
    doctor: [{id: 1, name: 'Schedule Appointment', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We'd like to schedule an appointment. Date of birth is [DOB]."}],
    pharmacy: [{id: 2, name: 'Refill Rx', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We need to refill a prescription. DOB is [DOB]."}],
    transport: [{id: 3, name: 'Schedule Ride', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We need a ride. Pickup at [ADDRESS]."}],
    insurance: [{id: 4, name: 'Coverage Question', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We have a question. Member ID is [INSURANCE]."}],
    custom: []
  })),
  currentCat: 'doctor',
  
  // UI State
  selectedIcon: '⭐',
  editingBtn: '',
  
  // Custom Button Text
  introText: localStorage.getItem('juniperIntroText') || "Hello, I'm Juniper, an AI voice assistant calling on behalf of [FULL_NAME]. [FIRST] can hear you but uses me to communicate. How may I help?",
  introLabel: localStorage.getItem('juniperIntroLabel') || '"Hello, I\'m Juniper..."',
  verifyText: localStorage.getItem('juniperVerifyText') || "I'll let [FIRST] verify that directly. [FIRST], go ahead.",
  verifyLabel: localStorage.getItem('juniperVerifyLabel') || '"Let me verify..."'
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
  loadInfoFields();
  updateHeaderName();
  updateBtnLabels();
  
  // API Key Status
  if (state.apiKey) {
    document.getElementById('apiKey').value = '••••••';
    document.getElementById('keyStatus').textContent = '✓ Saved';
    document.getElementById('keyStatus').className = 'key-status saved';
    loadVoices();
  }
  
  if (state.claudeKey) {
    document.getElementById('claudeKey').value = '••••••';
    document.getElementById('claudeStatus').textContent = '✓ Saved';
    document.getElementById('claudeStatus').className = 'key-status saved';
  }
  
  // Speed Slider
  document.getElementById('speedSlider').value = state.speechSpeed;
  document.getElementById('speedValue').textContent = state.speechSpeed.toFixed(2) + 'x';
  document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speechSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = state.speechSpeed.toFixed(2) + 'x';
    localStorage.setItem('juniperSpeed', state.speechSpeed);
  });
  
  // Enter key for custom text
  document.getElementById('customText').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') speakCustom();
  });
  
  // Hotkey buttons
  document.querySelectorAll('.hotkey-btn[data-msg]').forEach(b => {
    b.addEventListener('click', () => speak(b.dataset.msg));
  });
  
  document.querySelectorAll('.hotkey-btn[data-info]').forEach(b => {
    b.addEventListener('click', () => speakInfo(b.dataset.info));
  });
  
  // Render UI
  renderMyScripts();
  renderHistory();
  renderInsurances();
  renderPharmacies();
  renderQuickScripts();
}

// Run on load
window.addEventListener('load', init);
