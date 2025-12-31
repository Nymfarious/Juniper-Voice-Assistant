// Juniper v6.2.1 - Scripts & History

// ============================================
// HISTORY
// ============================================
function addHistory(text) {
  state.history.unshift({
    text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
    full: text,
    time: new Date().toLocaleTimeString()
  });
  
  if (state.history.length > 20) state.history.pop();
  localStorage.setItem('juniperHistory', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  
  list.innerHTML = state.history.length 
    ? state.history.map((h, i) => 
        `<div class="history-item" onclick="document.getElementById('customText').value=state.history[${i}].full">
          <span class="time">${h.time}</span> ${h.text}
        </div>`
      ).join('')
    : '<p style="color:var(--text-muted);padding:10px;">Messages appear here</p>';
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem('juniperHistory');
  renderHistory();
}

// ============================================
// MY SCRIPTS
// ============================================
function renderMyScripts() {
  const grid = document.getElementById('scriptsGrid');
  
  grid.innerHTML = state.myScripts.length 
    ? state.myScripts.map(s => 
        `<div class="script-card" onclick="speak(\`${s.text.replace(/`/g, '\\`')}\`)">
          <div class="script-icon">${s.icon || '⭐'}</div>
          <div class="script-name">${s.name}</div>
          <div class="script-preview">${s.text}</div>
          <button class="delete-script" onclick="event.stopPropagation();deleteMyScript(${s.id})">✕</button>
        </div>`
      ).join('')
    : '<div class="no-scripts">Tap "+ New"</div>';
  
  renderQuickScripts();
}

function renderQuickScripts() {
  const container = document.getElementById('quickScripts');
  const quick = state.myScripts.filter(s => s.quick !== false);
  
  container.innerHTML = quick.length 
    ? quick.map(s => 
        `<button class="quick-script-btn" onclick="speak(\`${s.text.replace(/`/g, '\\`')}\`)">
          <span>${s.icon}</span>${s.name}
        </button>`
      ).join('')
    : '';
}

function saveMyScript() {
  const name = document.getElementById('myScriptName').value.trim();
  const text = document.getElementById('myScriptText').value.trim();
  const quick = document.getElementById('myScriptQuick').value === 'yes';
  
  if (!name || !text) {
    alert('Fill name and text');
    return;
  }
  
  state.myScripts.push({
    id: Date.now(),
    name,
    text,
    icon: state.selectedIcon,
    quick
  });
  
  localStorage.setItem('juniperScripts', JSON.stringify(state.myScripts));
  renderMyScripts();
  closeMyScriptModal();
}

function deleteMyScript(id) {
  state.myScripts = state.myScripts.filter(s => s.id !== id);
  localStorage.setItem('juniperScripts', JSON.stringify(state.myScripts));
  renderMyScripts();
}

// ============================================
// FULL SCRIPTS
// ============================================
function showScriptCategory(cat, btn) {
  state.currentCat = cat;
  document.querySelectorAll('.script-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderFullScripts();
}

function renderFullScripts() {
  const list = state.fullScripts[state.currentCat] || [];
  const container = document.getElementById('scriptList');
  
  container.innerHTML = list.length 
    ? list.map(s => 
        `<div class="script-item">
          <div class="script-item-header">
            <span class="script-item-title">${s.name}</span>
            <div>
              <button class="script-item-btn" onclick="speakFullScript(${s.id})">▶️</button>
              <button class="script-item-btn" onclick="deleteFullScript(${s.id})">🗑️</button>
            </div>
          </div>
          <div class="script-item-text">${replacePlaceholders(s.text)}</div>
        </div>`
      ).join('')
    : '<div class="loading-msg">No scripts</div>';
}

function speakFullScript(id) {
  const script = (state.fullScripts[state.currentCat] || []).find(x => x.id === id);
  if (script) speak(replacePlaceholders(script.text));
}

function deleteFullScript(id) {
  state.fullScripts[state.currentCat] = state.fullScripts[state.currentCat].filter(s => s.id !== id);
  localStorage.setItem('juniperFullScripts', JSON.stringify(state.fullScripts));
  renderFullScripts();
}

function showCreateScriptView() {
  document.getElementById('browseScriptsView').style.display = 'none';
  document.getElementById('createScriptView').classList.add('active');
}

function hideCreateScriptView() {
  document.getElementById('browseScriptsView').style.display = 'block';
  document.getElementById('createScriptView').classList.remove('active');
}

async function generateScriptAI() {
  const desc = document.getElementById('scriptDescribe').value.trim();
  
  if (!desc) {
    alert('Describe what you need');
    return;
  }
  
  if (!state.claudeKey) {
    alert('Add Claude key');
    return;
  }
  
  document.getElementById('generatedScript').value = 'Generating...';
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': state.claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Write a phone script. Need: ${desc}\n\nStart with "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]." Use [FIRST], [LAST], [FULL_NAME], [DOB], [ADDRESS], [INSURANCE], [PHARMACY]. Keep concise.`
        }]
      })
    });
    
    const data = await response.json();
    document.getElementById('generatedScript').value = data.content[0].text;
    
  } catch (e) {
    document.getElementById('generatedScript').value = 'Error: ' + e.message;
  }
}

function saveFullScript() {
  const name = document.getElementById('newScriptName').value.trim();
  const text = document.getElementById('generatedScript').value.trim();
  const cat = document.getElementById('newScriptCat').value;
  
  if (!name || !text) {
    alert('Fill name and text');
    return;
  }
  
  state.fullScripts[cat].push({
    id: Date.now(),
    name,
    text
  });
  
  localStorage.setItem('juniperFullScripts', JSON.stringify(state.fullScripts));
  hideCreateScriptView();
  renderFullScripts();
}
