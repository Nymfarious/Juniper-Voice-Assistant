// Juniper v6.3.0 - AI Image Description

// ============================================
// IMAGE UPLOAD & DESCRIPTION
// ============================================

function openImageUpload() {
  document.getElementById('imageFileInput').click();
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) processImageFile(file);
}

function handleImageDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('imageDropZone').classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) processImageFile(file);
}

function handleImageDragOver(event) {
  event.preventDefault();
  document.getElementById('imageDropZone').classList.add('drag-over');
}

function handleImageDragLeave(event) {
  event.preventDefault();
  document.getElementById('imageDropZone').classList.remove('drag-over');
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    alert('Image must be under 20MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    showImagePreview(base64Data, file.type);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(dataUrl, mediaType) {
  const preview = document.getElementById('imagePreview');
  const dropZone = document.getElementById('imageDropZone');
  const actions = document.getElementById('imageActions');

  preview.innerHTML = `<img src="${dataUrl}" alt="Uploaded image">`;
  preview.style.display = 'block';
  dropZone.style.display = 'none';
  actions.style.display = 'flex';

  // Store for API call
  state.pendingImage = {
    dataUrl: dataUrl,
    mediaType: mediaType.replace('image/', '')
  };

  // Clear previous results
  document.getElementById('imageDescription').style.display = 'none';
  document.getElementById('imageDescription').textContent = '';
}

function clearImage() {
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('imageDropZone').style.display = 'flex';
  document.getElementById('imageActions').style.display = 'none';
  document.getElementById('imageDescription').style.display = 'none';
  document.getElementById('imageDescription').textContent = '';
  document.getElementById('imageFileInput').value = '';
  state.pendingImage = null;
}

async function describeImage() {
  if (!state.pendingImage) {
    alert('Upload an image first');
    return;
  }

  if (!state.claudeKey) {
    alert('Add your Claude API key in Info > API to use image description');
    return;
  }

  const descBox = document.getElementById('imageDescription');
  const descBtn = document.getElementById('describeBtn');
  descBtn.disabled = true;
  descBtn.textContent = 'Analyzing...';
  descBox.style.display = 'block';
  descBox.textContent = 'Analyzing image...';
  descBox.className = 'image-description loading';

  // Extract base64 without the data URL prefix
  const base64 = state.pendingImage.dataUrl.split(',')[1];
  const mediaType = 'image/' + state.pendingImage.mediaType;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': state.claudeKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64
              }
            },
            {
              type: 'text',
              text: 'Describe this image in 2-3 natural sentences, as if you were telling someone what you see over the phone. Be concise and conversational.'
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'API error');
    }

    const description = data.content[0].text;
    descBox.textContent = description;
    descBox.className = 'image-description ready';

    // Store for speaking
    state.imageDescription = description;

    // Show speak button
    document.getElementById('speakImageBtn').style.display = 'inline-flex';

  } catch (e) {
    descBox.textContent = 'Error: ' + e.message;
    descBox.className = 'image-description error';
  } finally {
    descBtn.disabled = false;
    descBtn.textContent = 'Describe';
  }
}

function speakImageDescription() {
  if (state.imageDescription) {
    speak(state.imageDescription);
  }
}
