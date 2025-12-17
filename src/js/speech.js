// Juniper v6.2.1 - Speech & Voice

// ============================================
// STATUS
// ============================================
function setStatus(status, text) {
  document.getElementById('statusDot').className = 'status-dot ' + status;
  document.getElementById('statusText').textContent = text;
}

// ============================================
// SPEECH
// ============================================
async function speak(text, isTest = false) {
  if (!state.apiKey || !state.selectedVoiceId) {
    alert('Add API key and select voice');
    return;
  }
  
  stopSpeaking();
  setStatus('loading', 'Speaking...');
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + state.selectedVoiceId, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': state.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });
    
    const blob = await response.blob();
    state.currentAudio = new Audio(URL.createObjectURL(blob));
    state.currentAudio.playbackRate = state.speechSpeed;
    
    state.currentAudio.onplay = () => setStatus('speaking', 'Speaking...');
    state.currentAudio.onended = () => {
      setStatus('ready', 'Ready');
      if (isTest) {
        document.getElementById('testBtn').textContent = '🔊 Test';
        document.getElementById('testBtn').classList.remove('stop-mode');
        state.isTesting = false;
      }
    };
    
    await state.currentAudio.play();
    if (!isTest) addHistory(text);
    
  } catch (e) {
    setStatus('error', 'Error');
    console.error(e);
  }
}

function stopSpeaking() {
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio = null;
  }
  setStatus('ready', 'Ready');
}

// ============================================
// SPEAK HELPERS
// ============================================
function speakCustom() {
  const text = document.getElementById('customText').value.trim();
  if (text) {
    speak(text);
    document.getElementById('customText').value = '';
  }
}

function speakIntro() {
  speak(replacePlaceholders(state.introText));
}

function speakVerify() {
  speak(replacePlaceholders(state.verifyText));
}

function speakInfo(type) {
  const primary = state.insurances.find(i => i.type === 'Medical') || state.insurances[0];
  const pharm = state.pharmacies.find(p => p.primary) || state.pharmacies[0];
  
  const phrases = {
    name: "The name is " + getFullName() + ".",
    dob: "Date of birth is " + (state.info.dob || 'not set') + ".",
    phone: "Phone is " + (state.info.phone || 'not set') + ".",
    address: "Address is " + getFullAddress() + ".",
    insurance: primary 
      ? "Insurance is " + primary.provider + ", ID " + primary.memberId + 
        (primary.group ? ", Group " + primary.group : "") + "."
      : 'Insurance not set.',
    pharmacy: pharm 
      ? "Pharmacy is " + pharm.name + (pharm.phone ? " at " + pharm.phone : "") + "."
      : 'Pharmacy not set.'
  };
  
  speak(phrases[type]);
}

// ============================================
// VOICE LOADING
// ============================================
async function loadVoices() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': state.apiKey }
    });
    const data = await response.json();
    
    state.allVoices = data.voices.map(v => ({
      id: v.voice_id,
      name: v.name,
      gender: (v.labels?.gender || '').toLowerCase(),
      accent: (v.labels?.accent || '').toLowerCase()
    }));
    
    // Separate special voices (Robin's cloned voices)
    state.specialVoices = state.allVoices
      .filter(v => v.name.toLowerCase().includes('robin'))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    state.allVoices = state.allVoices
      .filter(v => !v.name.toLowerCase().includes('robin'))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    renderSpecialVoices();
    filterVoices('all', document.querySelector('.filter-btn'));
    
  } catch (e) {
    console.error(e);
  }
}

function renderSpecialVoices() {
  const container = document.getElementById('specialVoices');
  
  if (!state.specialVoices.length) {
    container.innerHTML = '<div class="loading-msg">No custom voices</div>';
    return;
  }
  
  container.innerHTML = state.specialVoices.map(v => 
    `<div class="special-voice ${v.id === state.selectedVoiceId ? 'selected' : ''}" 
          onclick="selectVoice('${v.id}')">
      <div class="voice-name">⭐ ${v.name}</div>
      <div class="voice-meta">Custom</div>
    </div>`
  ).join('');
  
  // Auto-select first special voice if none selected
  if (!state.selectedVoiceId && state.specialVoices.length) {
    selectVoice(state.specialVoices[0].id);
  }
}

function filterVoices(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  if (filter === 'all') {
    state.filteredVoices = state.allVoices;
  } else if (filter === 'female' || filter === 'male') {
    state.filteredVoices = state.allVoices.filter(v => v.gender === filter);
  } else {
    state.filteredVoices = state.allVoices.filter(v => v.accent.includes(filter));
  }
  
  renderVoices();
}

function renderVoices() {
  const grid = document.getElementById('voiceGrid');
  document.getElementById('voiceCount').textContent = state.filteredVoices.length + ' voices';
  
  grid.innerHTML = state.filteredVoices.length 
    ? state.filteredVoices.map(v => 
        `<div class="voice-card ${v.id === state.selectedVoiceId ? 'selected' : ''}" 
              onclick="selectVoice('${v.id}')">
          <div class="voice-name">${v.name}</div>
          <div class="voice-meta">${v.accent || v.gender || ''}</div>
        </div>`
      ).join('')
    : '<div class="loading-msg">None</div>';
}

function selectVoice(id) {
  state.selectedVoiceId = id;
  localStorage.setItem('juniperVoiceId', id);
  
  document.querySelectorAll('.voice-card, .special-voice').forEach(c => {
    c.classList.toggle('selected', c.onclick?.toString().includes(id));
  });
  
  document.getElementById('testBtn').disabled = false;
}

function toggleTest() {
  if (state.isTesting) {
    stopSpeaking();
    document.getElementById('testBtn').textContent = '🔊 Test';
    document.getElementById('testBtn').classList.remove('stop-mode');
    state.isTesting = false;
  } else {
    state.isTesting = true;
    document.getElementById('testBtn').textContent = '⏹ Stop';
    document.getElementById('testBtn').classList.add('stop-mode');
    speak("Hello! I'm Juniper.", true);
  }
}
