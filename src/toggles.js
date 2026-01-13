// Handle toggle interactions and conditional price input
document.addEventListener('DOMContentLoaded', () => {
  // Function to update toggle state
  function updateToggleState(toggle, isChecked) {
    if (isChecked) {
      toggle.setAttribute('aria-checked', 'true');
      toggle.setAttribute('data-state', 'checked');
      const thumb = toggle.querySelector('span[data-slot="switch-thumb"]');
      if (thumb) {
        thumb.setAttribute('data-state', 'checked');
      }
    } else {
      toggle.setAttribute('aria-checked', 'false');
      toggle.setAttribute('data-state', 'unchecked');
      const thumb = toggle.querySelector('span[data-slot="switch-thumb"]');
      if (thumb) {
        thumb.setAttribute('data-state', 'unchecked');
      }
    }
  }

  // Get all toggle switches
  const allToggles = document.querySelectorAll('button[role="switch"]');
  
  // Add click handlers to all toggles
  allToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isCurrentlyChecked = toggle.getAttribute('data-state') === 'checked';
      const newState = !isCurrentlyChecked;
      updateToggleState(toggle, newState);
      
      // Special handling for paywall toggle
      if (toggle.id === 'paywall-toggle') {
        const priceInputContainer = document.getElementById('price-input-container');
        const priceInput = document.getElementById('price-input');
        if (priceInputContainer && priceInput) {
          if (newState) {
            priceInputContainer.classList.remove('hidden');
            priceInput.removeAttribute('disabled');
          } else {
            priceInputContainer.classList.add('hidden');
            priceInput.setAttribute('disabled', '');
            priceInput.value = '0.00';
          }
        }
      }
    });
  });

  // Initialize paywall toggle state
  const paywallToggle = document.getElementById('paywall-toggle');
  const priceInputContainer = document.getElementById('price-input-container');
  const priceInput = document.getElementById('price-input');
  
  if (paywallToggle && priceInputContainer && priceInput) {
    const initialState = paywallToggle.getAttribute('data-state') === 'checked';
    if (initialState) {
      priceInputContainer.classList.remove('hidden');
      priceInput.removeAttribute('disabled');
    } else {
      priceInputContainer.classList.add('hidden');
      priceInput.setAttribute('disabled', '');
    }
  }
});
