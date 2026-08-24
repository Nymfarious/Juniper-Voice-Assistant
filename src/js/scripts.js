// Juniper v6.4.0 - Scripts & History

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
  sessionStorage.setItem('juniperHistory', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  
  if (!state.history.length) {
    replaceChildrenWith(list, [createElement('p', { className: 'empty-message', text: 'Messages appear here' })]);
    return;
  }
  replaceChildrenWith(list, state.history.map(history => {
    const button = createElement('button', { className: 'history-item', type: 'button', ariaLabel: `Reuse message from ${history.time}` }, [
      createElement('span', { className: 'time', text: history.time }),
      document.createTextNode(` ${history.text}`)
    ]);
    button.addEventListener('click', () => {
      document.getElementById('customText').value = history.full;
      document.getElementById('customText').focus();
    });
    return button;
  }));
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
  
  if (!state.myScripts.length) {
    replaceChildrenWith(grid, [createElement('div', { className: 'no-scripts', text: 'Tap "+ New"' })]);
  } else {
    replaceChildrenWith(grid, state.myScripts.map(script => {
      const speakButton = createElement('button', { className: 'script-card-content', type: 'button', ariaLabel: `Speak ${script.name}` }, [
        createElement('span', { className: 'script-icon', text: script.icon || '⭐' }),
        createElement('span', { className: 'script-name', text: script.name }),
        createElement('span', { className: 'script-preview', text: script.text })
      ]);
      speakButton.addEventListener('click', () => speak(script.text));
      const deleteButton = createElement('button', { className: 'delete-script', text: '✕', type: 'button', ariaLabel: `Delete ${script.name}` });
      deleteButton.addEventListener('click', () => deleteMyScript(script.id));
      return createElement('div', { className: 'script-card' }, [speakButton, deleteButton]);
    }));
  }
  
  renderQuickScripts();
}

function renderQuickScripts() {
  const container = document.getElementById('quickScripts');
  const quick = state.myScripts.filter(s => s.quick !== false);
  
  replaceChildrenWith(container, quick.map(script => {
    const button = createElement('button', { className: 'quick-script-btn', type: 'button', ariaLabel: `Speak ${script.name}` }, [
      createElement('span', { text: script.icon || '⭐' }),
      document.createTextNode(script.name)
    ]);
    button.addEventListener('click', () => speak(script.text));
    return button;
  }));
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
  
  sessionStorage.setItem('juniperScripts', JSON.stringify(state.myScripts));
  renderMyScripts();
  closeMyScriptModal();
}

function deleteMyScript(id) {
  state.myScripts = state.myScripts.filter(s => s.id !== id);
  sessionStorage.setItem('juniperScripts', JSON.stringify(state.myScripts));
  renderMyScripts();
}

// ============================================
// FULL SCRIPTS
// ============================================
function showScriptCategory(cat, btn) {
  state.currentCat = cat;
  document.querySelectorAll('.script-tabs .modal-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderFullScripts();
}

function renderFullScripts() {
  const list = state.fullScripts[state.currentCat] || [];
  const container = document.getElementById('fullScriptsList');
  
  if (!list.length) {
    replaceChildrenWith(container, [createElement('div', { className: 'loading-msg', text: 'No scripts' })]);
    return;
  }
  replaceChildrenWith(container, list.map(script => {
    const speakButton = createElement('button', { className: 'script-item-btn', text: '▶️', type: 'button', ariaLabel: `Speak ${script.name}` });
    const deleteButton = createElement('button', { className: 'script-item-btn', text: '🗑️', type: 'button', ariaLabel: `Delete ${script.name}` });
    speakButton.addEventListener('click', () => speakFullScript(script.id));
    deleteButton.addEventListener('click', () => deleteFullScript(script.id));
    return createElement('div', { className: 'script-item' }, [
      createElement('div', { className: 'script-item-header' }, [
        createElement('span', { className: 'script-item-title', text: script.name }),
        createElement('div', {}, [speakButton, deleteButton])
      ]),
      createElement('div', { className: 'script-item-text', text: replacePlaceholders(script.text) })
    ]);
  }));
}

function speakFullScript(id) {
  const script = (state.fullScripts[state.currentCat] || []).find(x => x.id === id);
  if (script) speak(replacePlaceholders(script.text));
}

function deleteFullScript(id) {
  state.fullScripts[state.currentCat] = state.fullScripts[state.currentCat].filter(s => s.id !== id);
  sessionStorage.setItem('juniperFullScripts', JSON.stringify(state.fullScripts));
  renderFullScripts();
}

function showCreateScript() {
  document.getElementById('scriptsView').style.display = 'none';
  document.getElementById('scriptsCreate').style.display = 'block';
}

function showBrowseScripts() {
  document.getElementById('scriptsView').style.display = 'block';
  document.getElementById('scriptsCreate').style.display = 'none';
}

function showScriptsCat(cat, btn) {
  showScriptCategory(cat, btn);
}

function generateScript() {
  const description = document.getElementById('scriptDescribe').value.trim();
  const textarea = document.getElementById('scriptTextarea');
  if (!description) {
    alert('Describe what you need');
    return;
  }
  textarea.value = `Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. ${description}`;
  textarea.focus();
  MiniMantis.report('script_template', 'ok');
}

function saveFullScript() {
  const name = document.getElementById('scriptName').value.trim();
  const text = document.getElementById('scriptTextarea').value.trim();
  const cat = document.getElementById('scriptCat').value;
  
  if (!name || !text) {
    alert('Fill name and text');
    return;
  }
  
  state.fullScripts[cat].push({
    id: Date.now(),
    name,
    text
  });
  
  sessionStorage.setItem('juniperFullScripts', JSON.stringify(state.fullScripts));
  showBrowseScripts();
  renderFullScripts();
}
