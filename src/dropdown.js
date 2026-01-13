// Dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get all dropdown triggers
  const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
  
  // Close all dropdowns
  function closeAllDropdowns() {
    dropdownTriggers.forEach(trigger => {
      const content = document.getElementById(trigger.getAttribute('aria-controls'));
      if (content) {
        content.classList.add('hidden');
        trigger.setAttribute('data-state', 'closed');
        trigger.setAttribute('aria-expanded', 'false');
        const chevron = trigger.querySelector('.chevron-icon');
        if (chevron) {
          chevron.style.transform = 'rotate(0deg)';
        }
      }
    });
  }

  // Toggle dropdown
  function toggleDropdown(trigger) {
    const contentId = trigger.getAttribute('aria-controls');
    if (!contentId) return;
    
    const content = document.getElementById(contentId);
    if (!content) return;

    const isOpen = trigger.getAttribute('data-state') === 'open';
    const chevron = trigger.querySelector('.chevron-icon');

    if (isOpen) {
      // Close
      content.classList.add('hidden');
      trigger.setAttribute('data-state', 'closed');
      trigger.setAttribute('aria-expanded', 'false');
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)';
      }
    } else {
      // Close all other dropdowns first
      closeAllDropdowns();
      
      // Open this one
      content.classList.remove('hidden');
      trigger.setAttribute('data-state', 'open');
      trigger.setAttribute('aria-expanded', 'true');
      if (chevron) {
        chevron.style.transform = 'rotate(180deg)';
      }
    }
  }

  // Add click handlers to all dropdown triggers
  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(trigger);
    });
  });

  // Handle option selection
  document.addEventListener('click', (e) => {
    const option = e.target.closest('[data-value]');
    if (option && option.closest('.dropdown-content')) {
      const dropdownContent = option.closest('.dropdown-content');
      const trigger = document.querySelector(`[aria-controls="${dropdownContent.id}"]`);
      
      if (trigger) {
        const selectValue = trigger.querySelector('[data-slot="select-value"]');
        if (selectValue) {
          // Update the displayed value
          const text = option.textContent.trim();
          const icon = option.querySelector('svg');
          
          if (icon) {
            // If there's an icon, clone it
            selectValue.innerHTML = '';
            const clonedIcon = icon.cloneNode(true);
            clonedIcon.classList.add('mr-2', 'h-4', 'w-4');
            selectValue.appendChild(clonedIcon);
            selectValue.appendChild(document.createTextNode(text));
          } else {
            selectValue.textContent = text;
          }
        }
        
        // Close dropdown
        closeAllDropdowns();
      }
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-trigger') && !e.target.closest('.dropdown-content')) {
      closeAllDropdowns();
    }
  });

  // Close dropdowns on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
});
