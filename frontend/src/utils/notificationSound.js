/**
 * Notification Sound Utility
 * Provides functions to play notification sounds for staff alerts
 */

/**
 * Play a simple beep notification sound using Web Audio API
 * This works without needing external audio files
 */
export const playNotificationBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for the beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the beep sound
    oscillator.frequency.value = 800; // Frequency in Hz
    oscillator.type = 'sine'; // Sine wave for smooth sound
    
    // Fade out effect
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log('🔊 Notification sound played');
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

/**
 * Play a double beep notification (more attention-grabbing)
 */
export const playDoubleBeep = () => {
  playNotificationBeep();
  setTimeout(() => {
    playNotificationBeep();
  }, 200);
};

/**
 * Play a triple beep notification (urgent)
 */
export const playTripleBeep = () => {
  playNotificationBeep();
  setTimeout(() => {
    playNotificationBeep();
  }, 200);
  setTimeout(() => {
    playNotificationBeep();
  }, 400);
};

/**
 * Play notification from audio file
 * @param {string} audioPath - Path to the audio file
 */
export const playNotificationFromFile = (audioPath = '/sounds/notification.mp3') => {
  try {
    const audio = new Audio(audioPath);
    audio.volume = 0.7; // Set volume (0.0 to 1.0)
    audio.play().catch(err => {
      console.error('Error playing audio file:', err);
      // Fallback to beep if file fails
      playNotificationBeep();
    });
  } catch (error) {
    console.error('Error creating audio:', error);
    // Fallback to beep
    playNotificationBeep();
  }
};

/**
 * Request notification permission (for mobile devices)
 * Call this when user first interacts with the app
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  }
  return false;
};

/**
 * Show browser notification with sound
 * @param {Object} options - Notification options
 */
export const showNotificationWithSound = (options) => {
  const {
    title = 'Khách hàng cần hỗ trợ!',
    body = 'Có yêu cầu mới từ khách hàng',
    icon = '/icon.png',
    soundType = 'double' // 'single', 'double', 'triple', or 'file'
  } = options;

  // Play sound
  switch (soundType) {
    case 'single':
      playNotificationBeep();
      break;
    case 'double':
      playDoubleBeep();
      break;
    case 'triple':
      playTripleBeep();
      break;
    case 'file':
      playNotificationFromFile();
      break;
    default:
      playDoubleBeep();
  }

  // Show browser notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      requireInteraction: true, // Keep notification until user interacts
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

export default {
  playNotificationBeep,
  playDoubleBeep,
  playTripleBeep,
  playNotificationFromFile,
  requestNotificationPermission,
  showNotificationWithSound
};
