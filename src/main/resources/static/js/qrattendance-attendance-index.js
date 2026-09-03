document.addEventListener('DOMContentLoaded', function () {
    const pageRoot = document.querySelector('.qrattendance-page');
    const cameraBtn = document.getElementById('cameraDeviceBtn');
    const sensorBtn = document.getElementById('sensorDeviceBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const statusEl = document.getElementById('scanStatus');
    const cameraViewport = document.getElementById('cameraViewport');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraPlaceholder = document.getElementById('cameraPlaceholder');
    const sensorPanel = document.getElementById('sensorPanel');
    const sensorInput = document.getElementById('sensorInput');

    let activeStream = null;
    let deviceMode = 'camera';

    function setStatus(message, type) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.className = 'qrattendance-status ' + (type || 'info');
    }

    function stopCamera() {
        if (activeStream) {
            activeStream.getTracks().forEach(function (track) { track.stop(); });
            activeStream = null;
        }
        if (cameraVideo) {
            cameraVideo.srcObject = null;
            cameraVideo.hidden = true;
        }
        if (cameraPlaceholder) {
            cameraPlaceholder.hidden = false;
        }
    }

    async function startCamera() {
        stopCamera();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus('Camera not found.', 'error');
            return;
        }

        try {
            activeStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            if (cameraVideo) {
                cameraVideo.srcObject = activeStream;
                cameraVideo.hidden = false;
            }
            if (cameraPlaceholder) {
                cameraPlaceholder.hidden = true;
            }
            setStatus('Camera ready. Scan your ID card QR code / barcode.', 'success');
        } catch (error) {
            setStatus('Camera not found.', 'error');
        }
    }

    function setDeviceMode(mode) {
        deviceMode = mode;

        if (cameraBtn) cameraBtn.classList.toggle('active', mode === 'camera');
        if (sensorBtn) sensorBtn.classList.toggle('active', mode === 'sensor');

        if (mode === 'camera') {
            if (sensorPanel) sensorPanel.classList.remove('active');
            if (cameraViewport) cameraViewport.hidden = false;
            startCamera();
        } else {
            stopCamera();
            if (cameraViewport) cameraViewport.hidden = true;
            if (sensorPanel) sensorPanel.classList.add('active');
            setStatus('Place cursor in the field and scan with your sensor device.', 'info');
            if (sensorInput) sensorInput.focus();
        }
    }

    if (cameraBtn) {
        cameraBtn.addEventListener('click', function () {
            setDeviceMode('camera');
        });
    }

    if (sensorBtn) {
        sensorBtn.addEventListener('click', function () {
            setDeviceMode('sensor');
        });
    }

    if (fullscreenBtn && pageRoot) {
        fullscreenBtn.addEventListener('click', function () {
            if (!document.fullscreenElement) {
                pageRoot.requestFullscreen().catch(function () {});
            } else {
                document.exitFullscreen();
            }
        });
    }

    if (sensorInput) {
        sensorInput.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter') return;
            const value = sensorInput.value.trim();
            if (!value) return;
            setStatus('Scanned code: ' + value, 'success');
            sensorInput.value = '';
        });
    }

    window.addEventListener('beforeunload', stopCamera);
    setDeviceMode('camera');
});
