// This script provides runtime monitoring and recovery for the application
// It detects common issues and tries to recover automatically

// Monitor for unhandled errors
window.addEventListener('error', function(event) {
  console.error('Runtime error detected:', event.error);
  
  // Log to localStorage for debugging
  const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
  errors.push({
    message: event.error?.message || 'Unknown error',
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  });
  
  // Keep only the last 10 errors
  if (errors.length > 10) errors.shift();
  localStorage.setItem('app_errors', JSON.stringify(errors));
  
  // Check if we should reload the page
  const shouldReload = shouldAttemptReload();
  if (shouldReload) {
    console.log('Attempting automatic recovery by reloading...');
    setTimeout(() => window.location.reload(), 2000);
  }
});

// Monitor for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Log to localStorage
  const rejections = JSON.parse(localStorage.getItem('app_rejections') || '[]');
  rejections.push({
    message: event.reason?.message || 'Unknown rejection',
    stack: event.reason?.stack,
    timestamp: new Date().toISOString()
  });
  
  // Keep only the last 10 rejections
  if (rejections.length > 10) rejections.shift();
  localStorage.setItem('app_rejections', JSON.stringify(rejections));
});

// Monitor for frozen UI
let lastActivity = Date.now();
document.addEventListener('mousemove', updateActivity);
document.addEventListener('keydown', updateActivity);
document.addEventListener('click', updateActivity);
document.addEventListener('scroll', updateActivity);

function updateActivity() {
  lastActivity = Date.now();
}

// Check UI responsiveness periodically
setInterval(() => {
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  
  // If the user has been active in the last 30 seconds but the app seems frozen
  if (timeSinceLastActivity < 30000 && isAppFrozen()) {
    console.log('Application appears to be frozen, attempting recovery...');
    localStorage.setItem('app_recovery_attempt', Date.now().toString());
    window.location.reload();
  }
}, 10000);

// Determine if we should attempt a reload based on error frequency
function shouldAttemptReload() {
  // Get the last time we attempted a reload
  const lastReloadAttempt = parseInt(localStorage.getItem('app_reload_attempt') || '0', 10);
  const now = Date.now();
  
  // Don't reload more than once every 30 seconds
  if (now - lastReloadAttempt < 30000) {
    return false;
  }
  
  // Set the reload attempt timestamp
  localStorage.setItem('app_reload_attempt', now.toString());
  return true;
}

// Check if the app appears to be frozen
function isAppFrozen() {
  // Implementation depends on your app's specifics
  // This is a basic example - you may need to customize
  const loadingElement = document.querySelector('.loading-indicator');
  const appRoot = document.getElementById('root');
  
  // If we're still showing a loading indicator after 20 seconds, something might be wrong
  if (loadingElement && document.body.contains(loadingElement) && 
      loadingElement.style.display !== 'none' && 
      Date.now() - (parseInt(localStorage.getItem('app_init_time') || Date.now(), 10)) > 20000) {
    return true;
  }
  
  // If the app root is empty after initialization
  if (appRoot && (!appRoot.children || appRoot.children.length === 0) &&
      Date.now() - (parseInt(localStorage.getItem('app_init_time') || Date.now(), 10)) > 10000) {
    return true;
  }
  
  return false;
}

// Record the initialization time
localStorage.setItem('app_init_time', Date.now().toString());

console.log('Runtime monitoring initialized');
