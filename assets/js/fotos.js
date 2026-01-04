/**
 * Fotos Upload Module
 * Handles image compression and upload to backend
 */

// API URL
const API_URL = 'https://aniversario-back.onrender.com';

// State
let selectedFile = null;
let compressedImageData = null;

// Elements
const cardsContainer = document.getElementById('cardsContainer');
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const successSection = document.getElementById('successSection');
const errorSection = document.getElementById('errorSection');
const imagePreview = document.getElementById('imagePreview');
const originalSizeEl = document.getElementById('originalSize');
const compressedSizeEl = document.getElementById('compressedSize');
const btnSend = document.getElementById('btnSend');
const errorMessage = document.getElementById('errorMessage');

/**
 * Show upload options
 */
function mostrarOpcoes() {
    cardsContainer.style.display = 'none';
    uploadSection.style.display = 'block';
}

/**
 * Go back to initial view
 */
function voltarInicio() {
    uploadSection.style.display = 'none';
    previewSection.style.display = 'none';
    successSection.style.display = 'none';
    errorSection.style.display = 'none';
    cardsContainer.style.display = 'flex';
    resetState();
}

/**
 * Cancel upload and go back to options
 */
function cancelarUpload() {
    previewSection.style.display = 'none';
    uploadSection.style.display = 'block';
    resetState();
}

/**
 * Reset state
 */
function resetState() {
    selectedFile = null;
    compressedImageData = null;
    imagePreview.src = '';
    originalSizeEl.textContent = '';
    compressedSizeEl.textContent = '';
    
    // Reset file inputs
    document.getElementById('inputCamera').value = '';
    document.getElementById('inputGallery').value = '';
}

/**
 * Handle file selection from camera or gallery
 */
async function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida.');
        return;
    }
    
    selectedFile = file;
    
    console.log(`📷 Imagem selecionada: ${file.name} (${formatSize(file.size)})`);
    
    // Show preview section
    uploadSection.style.display = 'none';
    previewSection.style.display = 'block';
    
    // Show original size
    originalSizeEl.textContent = formatSize(file.size);
    compressedSizeEl.textContent = 'Comprimindo...';
    
    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Compress the image
    try {
        compressedImageData = await compressImage(file);
        const compressedSize = Math.round((compressedImageData.length * 3) / 4); // Base64 to bytes estimate
        compressedSizeEl.textContent = formatSize(compressedSize);
        
        console.log(`✅ Comprimido: ${formatSize(file.size)} → ${formatSize(compressedSize)}`);
    } catch (error) {
        console.error('Erro ao comprimir:', error);
        compressedSizeEl.textContent = 'Erro';
    }
}

/**
 * Compress image using Canvas API
 * Target: Max 1920x1080, quality 0.7-0.8
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                const maxWidth = 1920;
                const maxHeight = 1080;
                
                let width = img.width;
                let height = img.height;
                
                // Resize if needed
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                
                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Determine quality based on original size
                let quality = 0.8;
                if (file.size > 3 * 1024 * 1024) {
                    quality = 0.6; // 3MB+ -> 60%
                } else if (file.size > 1 * 1024 * 1024) {
                    quality = 0.7; // 1-3MB -> 70%
                }
                
                // Convert to base64 JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            
            img.onerror = () => {
                reject(new Error('Erro ao carregar imagem'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Send photo to backend
 */
async function enviarFoto() {
    if (!compressedImageData) {
        alert('Aguarde a compressão da imagem.');
        return;
    }
    
    // Show loading
    setLoading(true);
    
    const payload = {
        imageData: compressedImageData,
        fileName: selectedFile ? selectedFile.name : 'foto.jpg',
        mimeType: 'image/jpeg'
    };
    
    console.log('📤 Enviando foto...');
    
    try {
        const response = await fetch(`${API_URL}/api/fotos/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('✅ Upload concluído!');
            showSuccess();
        } else {
            console.error('❌ Erro:', data.message);
            showError(data.message || 'Erro ao enviar foto');
        }
    } catch (error) {
        console.error('❌ Erro de conexão:', error);
        showError('Erro ao conectar com o servidor. Verifique sua internet.');
    } finally {
        setLoading(false);
    }
}

/**
 * Show/hide loading state
 */
function setLoading(loading) {
    const btnText = btnSend.querySelector('.btn-text');
    const btnLoading = btnSend.querySelector('.btn-loading');
    
    if (loading) {
        btnSend.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        btnSend.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

/**
 * Show success screen
 */
function showSuccess() {
    previewSection.style.display = 'none';
    successSection.style.display = 'block';
    resetState();
}

/**
 * Show error screen
 */
function showError(message) {
    previewSection.style.display = 'none';
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

/**
 * Send another photo
 */
function enviarOutra() {
    successSection.style.display = 'none';
    uploadSection.style.display = 'block';
}

/**
 * Retry after error
 */
function tentarNovamente() {
    errorSection.style.display = 'none';
    uploadSection.style.display = 'block';
}

/**
 * Format file size to human readable
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Log initialization
console.log('📸 Módulo de fotos carregado');
