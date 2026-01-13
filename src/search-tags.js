// Search and tag management functionality for Categories and Tags

// Sample data - in a real app, this would come from an API
const categoryOptions = [
  'Other', 'News', 'Entertainment', 'Education', 'Business', 'Technology',
  'Science', 'Health', 'Sports', 'Travel', 'Food', 'Culture', 'History',
  'Literature', 'Music', 'Art', 'Politics', 'Economics', 'Language Learning'
];

const tagOptions = [
  'beginner', 'intermediate', 'advanced', 'grammar', 'vocabulary', 'listening',
  'reading', 'speaking', 'writing', 'pronunciation', 'conversation', 'business',
  'travel', 'news', 'culture', 'history', 'literature', 'science', 'technology'
];

// Provider options
const providerOptions = [
  'BBC Français',
  'FrenchLingQ',
  'Online news for learners of French',
  'podcastfrançaisfacile.com',
  'RFI Radio'
];

// Initialize search and tag functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Categories
  initSearchTags('category', categoryOptions);
  
  // Initialize Tags
  initSearchTags('tag', tagOptions);
  
  // Initialize Provider (using same pattern as tags, but single select)
  initSearchTags('provider', providerOptions);
  
  // Check if provider already has a value on load and update icon accordingly
  const providerInput = document.getElementById('provider-search');
  if (providerInput && providerInput.value.trim()) {
    providerInput.dataset.selectedProvider = providerInput.value.trim();
    updateProviderIcon(true);
  } else {
    // Initialize all fields to add mode if empty
    switchToAddMode('category');
    switchToAddMode('tag');
    switchToAddMode('provider');
  }
  
  // Initialize tag containers - hide if empty (before adding initial tag)
  const categoryTags = document.getElementById('category-tags');
  const tagTags = document.getElementById('tag-tags');
  if (categoryTags && categoryTags.querySelectorAll('[data-tag-value]').length === 0) {
    categoryTags.style.display = 'none';
  }
  if (tagTags && tagTags.querySelectorAll('[data-tag-value]').length === 0) {
    tagTags.style.display = 'none';
  }
  
});

function initSearchTags(type, options) {
  const searchInput = document.getElementById(`${type}-search`);
  const dropdown = document.getElementById(`${type}-dropdown`);
  const tagsContainer = type !== 'provider' ? document.getElementById(`${type}-tags`) : null;
  const selectedTags = new Set();
  let selectedProvider = null; // For provider single select
  
  // Store reference to selected tags for this type
  if (searchInput) {
    searchInput.dataset.selectedTags = JSON.stringify([]);
  }
  
  // Get existing tags from the container (not for provider)
  if (tagsContainer) {
    const existingTags = Array.from(tagsContainer.querySelectorAll('[data-tag-value]')).map(tag => tag.dataset.tagValue);
    existingTags.forEach(tag => selectedTags.add(tag));
  }
  
  // For provider, check if there's an existing value in the input
  if (type === 'provider' && searchInput.value.trim()) {
    selectedProvider = searchInput.value.trim();
  }
  
  // Track dropdown state using data attribute
  searchInput.dataset.isDropdownOpen = 'false';
  
  // Show dropdown on click
  searchInput.addEventListener('click', (e) => {
    // Switch placeholder to search mode when clicked
    switchToSearchMode(type);
    
    if (searchInput.dataset.isDropdownOpen === 'false') {
      // For provider, if there's a selected value, clear it to show search
      if (type === 'provider' && searchInput.dataset.selectedProvider) {
        searchInput.value = '';
        // Don't change icon - keep it as user icon
      }
      const query = searchInput.value.trim().toLowerCase();
      const currentProvider = type === 'provider' ? searchInput.dataset.selectedProvider : null;
      performSearch(type, query, options, selectedTags, dropdown, currentProvider);
      searchInput.dataset.isDropdownOpen = 'true';
    }
  });
  
  // Also show on focus (when tabbed to)
  searchInput.addEventListener('focus', (e) => {
    // Switch placeholder to search mode when focused
    switchToSearchMode(type);
    
    if (searchInput.dataset.isDropdownOpen === 'false') {
      // For provider, if there's a selected value, clear it to show search
      if (type === 'provider' && searchInput.dataset.selectedProvider) {
        searchInput.value = '';
        // Don't change icon - keep it as user icon
      }
      const query = searchInput.value.trim().toLowerCase();
      const currentProvider = type === 'provider' ? searchInput.dataset.selectedProvider : null;
      performSearch(type, query, options, selectedTags, dropdown, currentProvider);
      searchInput.dataset.isDropdownOpen = 'true';
    }
  });
  
  // Switch back to add mode when blurred and empty
  searchInput.addEventListener('blur', (e) => {
    // Small delay to allow click events on dropdown to register
    setTimeout(() => {
      switchToAddMode(type);
    }, 200);
  });
  
  // Update search when typing (filter results in real-time)
  searchInput.addEventListener('input', (e) => {
    if (searchInput.dataset.isDropdownOpen === 'true') {
      const query = e.target.value.trim().toLowerCase();
      const currentProvider = type === 'provider' ? searchInput.dataset.selectedProvider : null;
      performSearch(type, query, options, selectedTags, dropdown, currentProvider);
      // Clear selected provider when user starts typing (but keep user icon)
      if (type === 'provider') {
        searchInput.dataset.selectedProvider = '';
        // Don't change icon - keep it as user icon
      }
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest(`#${type}-search`) && !e.target.closest(`#${type}-dropdown`)) {
      dropdown.classList.add('hidden');
      searchInput.dataset.isDropdownOpen = 'false';
      
      // For provider, restore selected value if search was cleared
      if (type === 'provider' && searchInput.dataset.selectedProvider && !searchInput.value.trim()) {
        searchInput.value = searchInput.dataset.selectedProvider;
        updateProviderIcon(true);
      } else if (type !== 'provider') {
        // Switch back to add mode if empty (not for provider)
        switchToAddMode(type);
      }
    }
  });
  
  // Handle Enter key to add first result or create new tag
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = e.target.value.trim();
      if (query.length > 0) {
        if (type === 'provider') {
          // For provider, select first matching option
          const matchingOptions = options.filter(opt => 
            opt.toLowerCase().includes(query.toLowerCase())
          );
          if (matchingOptions.length > 0) {
            selectProvider(matchingOptions[0], searchInput);
            searchInput.dataset.selectedProvider = matchingOptions[0];
          } else {
            // Create new provider
            selectProvider(query, searchInput);
            searchInput.dataset.selectedProvider = query;
          }
        } else {
          // For categories/tags, add as tag
          const matchingOptions = options.filter(opt => 
            opt.toLowerCase().includes(query.toLowerCase()) && 
            !selectedTags.has(opt)
          );
          
          if (matchingOptions.length > 0) {
            addTag(type, matchingOptions[0], type === 'category' ? 'amber-500' : 'blue-500');
          } else if (!selectedTags.has(query)) {
            addTag(type, query, type === 'category' ? 'amber-500' : 'blue-500');
          }
          searchInput.value = '';
        }
        dropdown.classList.add('hidden');
        searchInput.dataset.isDropdownOpen = 'false';
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.add('hidden');
      searchInput.dataset.isDropdownOpen = 'false';
      
      // For provider, restore selected value
      if (type === 'provider' && searchInput.dataset.selectedProvider) {
        searchInput.value = searchInput.dataset.selectedProvider;
        updateProviderIcon(true);
      }
      
      searchInput.blur();
    }
  });
}

// Function to select a provider (single select, shows in input field)
function selectProvider(providerName, searchInput) {
  searchInput.value = providerName;
  searchInput.dataset.selectedProvider = providerName;
  updateProviderIcon(true);
}

// Function to update provider icon based on selection state
function updateProviderIcon(hasProvider) {
  const icon = document.getElementById('provider-icon');
  if (!icon) return;
  
  if (hasProvider) {
    // Show source/book icon when provider is selected
    icon.innerHTML = `
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>
      <path d="M8 11h8"></path>
      <path d="M8 7h6"></path>
    `;
    icon.classList.remove('provider-icon-search', 'provider-icon-add');
    icon.classList.add('provider-icon-source');
  } else {
    // Show user icon (default, never show search icon)
    icon.innerHTML = `
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    `;
    icon.classList.remove('provider-icon-search', 'provider-icon-source');
    icon.classList.add('provider-icon-add');
  }
}

// Function to switch input to search mode (update placeholder only)
function switchToSearchMode(type) {
  const searchInput = document.getElementById(`${type}-search`);
  
  if (!searchInput) return;
  
  // Update placeholder - Tags and Providers have different text than Categories
  const placeholders = {
    'category': 'Search Categories ...',
    'tag': 'Search tags or type to add a new tag',
    'provider': 'Search providers or type to add a new provider'
  };
  searchInput.placeholder = placeholders[type];
}

// Function to switch input to add mode (when empty and not focused)
function switchToAddMode(type) {
  const searchInput = document.getElementById(`${type}-search`);
  
  if (!searchInput) return;
  
  // Check if field is empty (and for provider, no selected value)
  const isEmpty = !searchInput.value.trim() && 
    (type !== 'provider' || !searchInput.dataset.selectedProvider);
  
  if (!isEmpty) return; // Don't switch if there's content
  
  // Update placeholder to "Add [field name]"
  const placeholders = {
    'category': 'Add Categories',
    'tag': 'Add Tags',
    'provider': 'Add Provider'
  };
  searchInput.placeholder = placeholders[type];
}

function performSearch(type, query, options, selectedTags, dropdown, selectedProvider = null) {
  const queryLower = query.toLowerCase();
  const results = options.filter(opt => {
    const matches = opt.toLowerCase().includes(queryLower);
    // For provider, don't filter by selected (single select)
    const notSelected = type === 'provider' ? true : !selectedTags.has(opt);
    return matches && notSelected;
  });
  
  const dropdownContent = dropdown.querySelector('.p-1');
  dropdownContent.innerHTML = '';
  
  const sectionNames = {
    'category': 'category',
    'tag': 'tag',
    'provider': 'provider'
  };
  const sectionName = sectionNames[type];
  
  // Helper function to create "Add '[query]' as new [section name]" option
  function createAddQueryOption(queryText) {
    const createOption = document.createElement('div');
    createOption.className = 'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground';
    createOption.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4">
        <path d="M5 12h14"></path>
        <path d="M12 5v14"></path>
      </svg>
      Add "${queryText}" as new ${sectionName}
    `;
    createOption.addEventListener('click', () => {
      if (type === 'provider') {
        const searchInput = document.getElementById(`${type}-search`);
        selectProvider(queryText, searchInput);
        searchInput.dataset.selectedProvider = queryText;
      } else {
        addTag(type, queryText, type === 'category' ? 'amber-500' : 'blue-500');
        const searchInput = document.getElementById(`${type}-search`);
        searchInput.value = '';
      }
      dropdown.classList.add('hidden');
      const searchInput = document.getElementById(`${type}-search`);
      searchInput.dataset.isDropdownOpen = 'false';
    });
    return createOption;
  }
  
  if (query.length === 0) {
    // Show all available options when search is empty
    const availableOptions = type === 'provider' 
      ? options 
      : options.filter(opt => !selectedTags.has(opt));
    
    availableOptions.slice(0, 10).forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground';
      
      // For provider, add book icon
      if (type === 'provider') {
        optionElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>
            <path d="M8 11h8"></path>
            <path d="M8 7h6"></path>
          </svg>
          <span>${option}</span>
        `;
      } else {
        optionElement.textContent = option;
      }
      
      optionElement.addEventListener('click', () => {
        if (type === 'provider') {
          const searchInput = document.getElementById(`${type}-search`);
          selectProvider(option, searchInput);
          searchInput.dataset.selectedProvider = option;
        } else {
          addTag(type, option, type === 'category' ? 'amber-500' : 'blue-500');
          const searchInput = document.getElementById(`${type}-search`);
          searchInput.value = '';
        }
        dropdown.classList.add('hidden');
        const searchInput = document.getElementById(`${type}-search`);
        searchInput.dataset.isDropdownOpen = 'false';
      });
      dropdownContent.appendChild(optionElement);
    });
  } else {
    // User has typed something - show "Add '[query]' as new [section name]" option
    // Show it at top if there are results, or as the only option if no results
    if (results.length === 0) {
      // No results - show only "Add '[query]' as new [section name]"
      dropdownContent.appendChild(createAddQueryOption(query));
    } else {
      // Has results - show "Add '[query]' as new [section name]" → results
      dropdownContent.appendChild(createAddQueryOption(query));
      
      // Show matching results
      results.slice(0, 10).forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground';
        
        // For provider, add book icon
        if (type === 'provider') {
          optionElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-4 w-4">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>
              <path d="M8 11h8"></path>
              <path d="M8 7h6"></path>
            </svg>
            <span>${option}</span>
          `;
        } else {
          optionElement.textContent = option;
        }
        
        optionElement.addEventListener('click', () => {
          if (type === 'provider') {
            const searchInput = document.getElementById(`${type}-search`);
            selectProvider(option, searchInput);
            searchInput.dataset.selectedProvider = option;
          } else {
            addTag(type, option, type === 'category' ? 'amber-500' : 'blue-500');
            const searchInput = document.getElementById(`${type}-search`);
            searchInput.value = '';
          }
          dropdown.classList.add('hidden');
          const searchInput = document.getElementById(`${type}-search`);
          searchInput.dataset.isDropdownOpen = 'false';
        });
        dropdownContent.appendChild(optionElement);
      });
    }
  }
  
  dropdown.classList.remove('hidden');
}

function addTag(type, value, colorClass) {
  const tagsContainer = document.getElementById(`${type}-tags`);
  const searchInput = document.getElementById(`${type}-search`);
  
  // Check if tag already exists
  if (tagsContainer.querySelector(`[data-tag-value="${value}"]`)) {
    return;
  }
  
  // Map color classes to actual Tailwind classes
  const colorMap = {
    'amber-500': {
      border: 'border-amber-500',
      text: 'text-amber-500',
      textHover: 'hover:text-amber-600',
      bgHover: 'hover:bg-amber-500/20'
    },
    'blue-500': {
      border: 'border-blue-500',
      text: 'text-blue-500',
      textHover: 'hover:text-blue-600',
      bgHover: 'hover:bg-blue-500/20'
    }
  };
  
  const colors = colorMap[colorClass] || colorMap['blue-500'];
  
  // Create tag element with updated styling
  const tagElement = document.createElement('span');
  tagElement.className = 'tag-badge';
  tagElement.dataset.tagValue = value;
  
  tagElement.innerHTML = `
    <span class="tag-text">${value}</span>
    <button type="button" class="tag-remove" aria-label="Remove ${value}">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tag-remove-icon">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      </svg>
    </button>
  `;
  
  // Add remove functionality
  const removeButton = tagElement.querySelector('.tag-remove');
  removeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    tagElement.remove();
    
    // Hide container if no tags remain
    const tagsContainer = document.getElementById(`${type}-tags`);
    if (tagsContainer && tagsContainer.querySelectorAll('[data-tag-value]').length === 0) {
      tagsContainer.style.display = 'none';
    }
    
    // Update clear all button (not for provider)
    if (type !== 'provider') {
      updateClearAllButton(type);
    }
  });
  
  tagsContainer.appendChild(tagElement);
  
  // Ensure container is visible when tags are added
  tagsContainer.style.display = 'flex';
  
  // Clear search input
  searchInput.value = '';
  
  // For provider, don't add as tag - just update the input field
  if (type === 'provider') {
    return; // Don't add tag for provider
  }
  
  // Update clear all button visibility
  updateClearAllButton(type);
}

function updateClearAllButton(type) {
  const tagsContainer = document.getElementById(`${type}-tags`);
  if (!tagsContainer) return;
  
  // Don't show clear all for provider (single select)
  if (type === 'provider') return;
  
  const tagCount = tagsContainer.querySelectorAll('[data-tag-value]').length;
  
  // Remove existing clear all button if any
  const existingButton = tagsContainer.querySelector('.clear-all-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Show clear all button if there are 2 or more tags
  if (tagCount >= 2) {
    const clearAllButton = document.createElement('button');
    clearAllButton.type = 'button';
    clearAllButton.className = 'clear-all-button inline-flex items-center cursor-pointer justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-color disabled:pointer-events-none disabled:opacity-50 rounded-full border-transparent border bg-transparent text-muted-foreground hover:text-muted-foreground/80 data-hover:border-border hover:border-border h-8 px-3';
    clearAllButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-muted-foreground">
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
        <path d="M3 6h18"></path>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      <span class="text-muted-foreground">Clear All</span>
    `;
    
    clearAllButton.addEventListener('click', (e) => {
      e.stopPropagation();
      // Remove all tags
      tagsContainer.querySelectorAll('[data-tag-value]').forEach(tag => tag.remove());
      
      // Hide container when all tags are removed
      tagsContainer.style.display = 'none';
      
      updateClearAllButton(type);
    });
    
    tagsContainer.appendChild(clearAllButton);
  }
}
