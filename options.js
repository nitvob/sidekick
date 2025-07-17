class OptionsManager {
  constructor() {
    this.defaultSystemPrompts = {
      default: "You are a helpful assistant.",
      coding:
        "You are a coding assistant. Help with programming questions, debug code, and provide technical solutions.",
      creative:
        "You are a creative writing assistant. Help with storytelling, poetry, and creative content.",
      professional:
        "You are a professional assistant. Help with business communications, emails, and workplace tasks.",
    };

    this.customSystemPrompts = {};
    this.apiKey = "";

    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadSettings();
    this.renderSystemPrompts();
  }

  bindEvents() {
    // API Key management
    document
      .getElementById("toggleApiKey")
      .addEventListener("click", () => this.toggleApiKeyVisibility());
    document
      .getElementById("saveApiKey")
      .addEventListener("click", () => this.saveApiKey());
    document
      .getElementById("testConnection")
      .addEventListener("click", () => this.testConnection());

    // System prompts management
    document
      .getElementById("addPrompt")
      .addEventListener("click", () => this.addNewPrompt());
    document
      .getElementById("savePrompts")
      .addEventListener("click", () => this.saveSystemPrompts());
    document
      .getElementById("resetPrompts")
      .addEventListener("click", () => this.resetToDefaults());
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        "openai_api_key",
        "custom_system_prompts",
      ]);

      this.apiKey = result.openai_api_key || "";
      this.customSystemPrompts = result.custom_system_prompts || {};

      // Update UI with loaded data
      document.getElementById("apiKey").value = this.apiKey;
    } catch (error) {
      console.error("❌ Error loading settings:", error);
      this.showStatus("Error loading settings", "error");
    }
  }

  toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById("apiKey");
    const toggleBtn = document.getElementById("toggleApiKey");

    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      toggleBtn.textContent = "🙈";
    } else {
      apiKeyInput.type = "password";
      toggleBtn.textContent = "👁️";
    }
  }

  async saveApiKey() {
    const apiKeyInput = document.getElementById("apiKey");
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      this.showStatus("Please enter an API key", "error");
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      this.showStatus(
        'Invalid API key format. OpenAI API keys start with "sk-"',
        "error"
      );
      return;
    }

    try {
      await chrome.storage.sync.set({ openai_api_key: apiKey });
      this.apiKey = apiKey;
      this.showStatus("API key saved successfully!", "success");
    } catch (error) {
      console.error("Error saving API key:", error);
      this.showStatus("Error saving API key", "error");
    }
  }

  async testConnection() {
    if (!this.apiKey) {
      this.showStatus("Please save an API key first", "error");
      return;
    }

    const testBtn = document.getElementById("testConnection");
    testBtn.disabled = true;
    testBtn.textContent = "Testing...";

    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        this.showStatus("Connection successful! API key is valid.", "success");
      } else {
        const error = await response.json();
        this.showStatus(
          `Connection failed: ${error.error?.message || "Invalid API key"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      this.showStatus(
        "Connection test failed. Please check your internet connection.",
        "error"
      );
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = "Test Connection";
    }
  }

  renderSystemPrompts() {
    const container = document.getElementById("systemPrompts");
    container.innerHTML = "";

    // Custom prompts override defaults (including modified default prompts)
    const allPrompts = {
      ...this.defaultSystemPrompts,
      ...this.customSystemPrompts,
    };

    Object.entries(allPrompts).forEach(([key, value]) => {
      const isCustomized = key in this.customSystemPrompts;
      const promptItem = this.createPromptItem(key, value, isCustomized);
      container.appendChild(promptItem);
    });
  }

  createPromptItem(key, value, isCustomized = false) {
    const isDefault = key in this.defaultSystemPrompts;

    const promptDiv = document.createElement("div");
    promptDiv.className = "prompt-item";
    promptDiv.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                    <input type="text" value="${key}" ${
      isDefault ? "readonly" : ""
    } 
                           placeholder="Prompt name" class="prompt-name" style="flex: 1;">
                    ${
                      isDefault && isCustomized
                        ? '<span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px;">✏️ Modified</span>'
                        : ""
                    }
                    ${
                      isDefault && isCustomized
                        ? '<button class="btn btn-warning btn-sm restore-default">Restore Default</button>'
                        : !isDefault
                        ? '<button class="btn btn-danger btn-sm remove-prompt">Remove</button>'
                        : ""
                    }
                </div>
                <textarea class="prompt-content" placeholder="Enter the system prompt..." 
                          style="width: 100%; min-height: 80px; resize: vertical;">${value}</textarea>
                ${
                  isDefault && !isCustomized
                    ? '<div class="help-text">This is a default prompt. You can edit it, and your changes will be saved.</div>'
                    : isDefault && isCustomized
                    ? '<div class="help-text" style="color: #856404;">This default prompt has been modified. Click "Restore Default" to revert to original.</div>'
                    : ""
                }
            </div>
        `;

    // Add remove functionality for custom prompts
    if (!isDefault) {
      const removeBtn = promptDiv.querySelector(".remove-prompt");
      removeBtn.addEventListener("click", () => {
        promptDiv.remove();
        this.showStatus(
          "Prompt removed. Remember to save your changes.",
          "success"
        );
      });
    }

    // Add restore functionality for modified default prompts
    if (isDefault && isCustomized) {
      const restoreBtn = promptDiv.querySelector(".restore-default");
      restoreBtn.addEventListener("click", () => {
        const textarea = promptDiv.querySelector(".prompt-content");
        textarea.value = this.defaultSystemPrompts[key];
        this.showStatus(
          `"${key}" prompt restored to default. Remember to save your changes.`,
          "success"
        );
      });
    }

    return promptDiv;
  }

  addNewPrompt() {
    const container = document.getElementById("systemPrompts");
    const promptItem = this.createPromptItem("", "");
    container.appendChild(promptItem);

    // Focus on the name input
    const nameInput = promptItem.querySelector(".prompt-name");
    nameInput.focus();

    this.showStatus("New prompt added. Don't forget to save!", "success");
  }

  async saveSystemPrompts() {
    const promptItems = document.querySelectorAll(".prompt-item");
    const savedPrompts = {};

    let hasError = false;

    promptItems.forEach((item) => {
      const nameInput = item.querySelector(".prompt-name");
      const contentTextarea = item.querySelector(".prompt-content");

      const name = nameInput.value.trim();
      const content = contentTextarea.value.trim();

      if (name && content) {
        // Only save prompts that are different from defaults or are custom prompts
        const isDefault = name in this.defaultSystemPrompts;
        const isModified =
          !isDefault || content !== this.defaultSystemPrompts[name];

        if (isModified) {
          savedPrompts[name] = content;
        }
      } else if (name || content) {
        // Incomplete prompt
        hasError = true;
      }
    });

    if (hasError) {
      this.showStatus(
        "Please fill in both name and content for all prompts, or remove incomplete ones.",
        "error"
      );
      return;
    }

    try {
      // Clean up any existing saved prompts that are now identical to defaults
      const existingCustom = this.customSystemPrompts || {};
      const cleanedPrompts = { ...savedPrompts };

      Object.keys(existingCustom).forEach((key) => {
        if (
          key in this.defaultSystemPrompts &&
          existingCustom[key] === this.defaultSystemPrompts[key] &&
          !(key in cleanedPrompts)
        ) {
          // This stored prompt is identical to default, so we don't need to store it
        }
      });

      await chrome.storage.sync.set({ custom_system_prompts: cleanedPrompts });
      this.customSystemPrompts = cleanedPrompts;

      // Enhanced success message with details
      const promptCount = Object.keys(cleanedPrompts).length;
      this.showStatus(
        `System prompts saved successfully! (${promptCount} custom prompt${
          promptCount !== 1 ? "s" : ""
        })`,
        "success"
      );

      // Refresh the UI to update the "modified" indicators
      this.renderSystemPrompts();
    } catch (error) {
      console.error("❌ Error saving system prompts:", error);
      this.showStatus("Error saving system prompts: " + error.message, "error");
    }
  }

  async resetToDefaults() {
    if (
      confirm(
        "Are you sure you want to reset all custom prompts to defaults? This cannot be undone."
      )
    ) {
      try {
        await chrome.storage.sync.set({ custom_system_prompts: {} });
        this.customSystemPrompts = {};
        this.renderSystemPrompts();
        this.showStatus(
          "System prompts reset to defaults successfully!",
          "success"
        );
      } catch (error) {
        console.error("Error resetting prompts:", error);
        this.showStatus("Error resetting prompts", "error");
      }
    }
  }

  showStatus(message, type) {
    const statusDiv = document.getElementById("statusMessage");
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusDiv.classList.add("hidden");
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new OptionsManager();
});

// Export for use in other parts of the extension
window.OptionsManager = OptionsManager;
