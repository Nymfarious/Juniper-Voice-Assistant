// Juniper v6.3.1 - Speech & Voice

const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2';

async function responseError(response) {
  try {
    const data = await response.json();
    return data.detail?.message || data.detail || data.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

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
    MiniMantis.report('speech_request', 'started');
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + state.selectedVoiceId, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': state.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) throw new Error(await responseError(response));
    
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    state.currentAudio = new Audio(audioUrl);
    state.currentAudio.playbackRate = state.speechSpeed;
    
    state.currentAudio.onplay = () => setStatus('speaking', 'Speaking...');
    state.currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      setStatus('ready', 'Ready');
      MiniMantis.report('speech_request', 'ok');
      if (isTest) {
        document.getElementById('testBtn').textContent = '🔊 Test';
        document.getElementById('testBtn').classList.remove('stop-mode');
        state.isTesting = false;
      }
    };
    
    await state.currentAudio.play();
    if (!isTest) addHistory(text);
    
  } catch (e) {
    setStatus('error', e.message || 'Voice request failed');
    MiniMantis.report('speech_request', 'error', { errorKind: 'provider_request' });
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
    if (!response.ok) throw new Error(await responseError(response));
    const data = await response.json();
    if (!Array.isArray(data.voices)) throw new Error('Voice provider returned an invalid response');
    
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
    MiniMantis.report('voice_catalog', 'ok', { resultCount: state.allVoices.length + state.specialVoices.length });
    
  } catch (e) {
    setStatus('error', e.message || 'Could not load voices');
    MiniMantis.report('voice_catalog', 'error', { errorKind: 'provider_request' });
    console.error(e);
  }
}

function renderSpecialVoices() {
  const container = document.getElementById('specialVoices');
  
  if (!state.specialVoices.length) {
    replaceChildrenWith(container, [createElement('div', { className: 'loading-msg', text: 'No custom voices' })]);
    return;
  }
  
  replaceChildrenWith(container, state.specialVoices.map(voice => makeVoiceButton(voice, true)));
  
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
  
  replaceChildrenWith(grid, state.filteredVoices.length
    ? state.filteredVoices.map(voice => makeVoiceButton(voice, false))
    : [createElement('div', { className: 'loading-msg', text: 'None' })]);
}

function makeVoiceButton(voice, special) {
  const button = createElement('button', {
    className: `${special ? 'special-voice' : 'voice-card'}${voice.id === state.selectedVoiceId ? ' selected' : ''}`,
    type: 'button',
    ariaLabel: `Select ${voice.name} voice`
  }, [
    createElement('span', { className: 'voice-name', text: `${special ? '⭐ ' : ''}${voice.name}` }),
    createElement('span', { className: 'voice-meta', text: special ? 'Custom' : (voice.accent || voice.gender || '') })
  ]);
  button.dataset.voiceId = voice.id;
  button.addEventListener('click', () => selectVoice(voice.id));
  return button;
}

function selectVoice(id) {
  state.selectedVoiceId = id;
  localStorage.setItem('juniperVoiceId', id);
  
  document.querySelectorAll('.voice-card, .special-voice').forEach(c => {
    c.classList.toggle('selected', c.dataset.voiceId === id);
    c.setAttribute('aria-pressed', String(c.dataset.voiceId === id));
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
