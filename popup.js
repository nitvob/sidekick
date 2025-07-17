class SidekickPopup {
  constructor() {
    this.apiKey = "";
    this.systemPrompts = {
      default: "You are a helpful assistant.",
      coding:
        "You are a coding assistant. Help with programming questions, debug code, and provide technical solutions.",
      creative:
        "You are a creative writing assistant. Help with storytelling, poetry, and creative content.",
      professional:
        "You are a professional assistant. Help with business communications, emails, and workplace tasks.",
    };
    this.chatHistory = [];
    this.isLoading = false;
    this.selectedSystemPrompt = "";

    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadSettings();
    await this.loadSystemPrompts();
    this.updateUI();
    this.clearChatOnFocus();

    // Ensure input state reflects current selection
    this.handleInputChange();

    // Listen for storage changes to refresh prompts
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync" && changes.custom_system_prompts) {
        this.refreshSystemPrompts();
      }
    });
  }

  bindEvents() {
    // DOM elements
    this.sendBtn = document.getElementById("sendBtn");
    this.userInput = document.getElementById("userInput");
    this.chatMessages = document.getElementById("chatMessages");
    this.systemPromptSelect = document.getElementById("systemPromptSelect");
    this.optionsBtn = document.getElementById("optionsBtn");
    this.statusText = document.getElementById("statusText");
    this.apiStatus = document.getElementById("apiStatus");

    // Event listeners
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.userInput.addEventListener("input", () => this.handleInputChange());
    this.userInput.addEventListener("keydown", (e) => this.handleKeyDown(e));
    this.systemPromptSelect.addEventListener("change", () =>
      this.handleSystemPromptChange()
    );
    this.optionsBtn.addEventListener("click", () => this.openOptions());

    // Clear chat when popup loses focus
    window.addEventListener("blur", () => this.clearChat());
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        "openai_api_key",
        "custom_system_prompts",
        "last_selected_prompt",
      ]);
      this.apiKey = result.openai_api_key || "";

      if (result.custom_system_prompts) {
        // Custom prompts override defaults (including modified default prompts)
        this.systemPrompts = {
          ...this.systemPrompts,
          ...result.custom_system_prompts,
        };
      }

      // Restore last selected prompt
      if (
        result.last_selected_prompt &&
        result.last_selected_prompt in this.systemPrompts
      ) {
        this.selectedSystemPrompt = result.last_selected_prompt;
      } else if (result.last_selected_prompt) {
        // Last selected prompt no longer exists (e.g., custom prompt was deleted)
        // Clear the saved selection
        chrome.storage.sync.remove("last_selected_prompt");
      }

      this.updateApiStatus();
    } catch (error) {
      console.error("Error loading settings:", error);
      this.updateStatus("Error loading settings");
    }
  }

  async loadSystemPrompts() {
    // Clear existing options except the first one
    while (this.systemPromptSelect.children.length > 1) {
      this.systemPromptSelect.removeChild(this.systemPromptSelect.lastChild);
    }

    // Add system prompts to select
    Object.keys(this.systemPrompts).forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = this.getPromptDisplayName(key);
      this.systemPromptSelect.appendChild(option);
    });

    // Set the dropdown to the last selected prompt
    if (this.selectedSystemPrompt) {
      this.systemPromptSelect.value = this.selectedSystemPrompt;
      this.updateStatus(
        `Restored: ${this.getPromptDisplayName(this.selectedSystemPrompt)}`
      );
    }
  }

  async refreshSystemPrompts() {
    // Reload settings to get updated prompts
    await this.loadSettings();
    await this.loadSystemPrompts();

    // Make sure UI reflects current selection
    this.handleInputChange();
  }

  getPromptDisplayName(key) {
    const names = {
      default: "Default Assistant",
      coding: "Coding Assistant",
      creative: "Creative Writer",
      professional: "Professional Helper",
    };
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  handleInputChange() {
    const hasText = this.userInput.value.trim().length > 0;
    const hasPrompt = this.systemPromptSelect.value !== "";
    this.sendBtn.disabled = !hasText || !hasPrompt || this.isLoading;
  }

  handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!this.sendBtn.disabled) {
        this.sendMessage();
      }
    }
  }

  async handleSystemPromptChange() {
    this.selectedSystemPrompt = this.systemPromptSelect.value;
    this.handleInputChange();

    if (this.selectedSystemPrompt) {
      this.updateStatus("System prompt selected");

      // Save the selected prompt for next time
      try {
        await chrome.storage.sync.set({
          last_selected_prompt: this.selectedSystemPrompt,
        });
      } catch (error) {
        console.error("Error saving selected prompt:", error);
      }
    } else {
      this.updateStatus("Select a system prompt");
    }
  }

  async sendMessage() {
    if (this.isLoading) return;

    const message = this.userInput.value.trim();
    if (!message || !this.selectedSystemPrompt) return;

    if (!this.apiKey) {
      this.showError("Please set your OpenAI API key in the options.");
      return;
    }

    this.isLoading = true;
    this.updateUI();

    try {
      // Add user message to chat
      this.addMessage("user", message);
      this.userInput.value = "";
      this.handleInputChange();

      // Show typing indicator
      this.showTypingIndicator();

      // Make API call
      const response = await this.callAI(message);

      // Remove typing indicator
      this.hideTypingIndicator();

      // Add assistant response
      this.addMessage("assistant", response);

      this.updateStatus("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      this.hideTypingIndicator();
      this.showError(
        "Error sending message. Please check your API key and try again."
      );
    } finally {
      this.isLoading = false;
      this.updateUI();
    }
  }

  async callAI(userMessage) {
    const systemPrompt = this.systemPrompts[this.selectedSystemPrompt];

    const messages = [
      { role: "system", content: systemPrompt },
      ...this.chatHistory,
      { role: "user", content: userMessage },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Add to chat history
    this.chatHistory.push({ role: "user", content: userMessage });
    this.chatHistory.push({ role: "assistant", content: assistantMessage });

    return assistantMessage;
  }

  addMessage(role, content) {
    // Remove welcome message if it exists
    const welcomeMessage = this.chatMessages.querySelector(".welcome-message");
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);

    // Add copy button for assistant messages
    if (role === "assistant") {
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.innerHTML = "📋";
      copyBtn.title = "Copy response";
      copyBtn.addEventListener("click", () =>
        this.copyToClipboard(content, copyBtn)
      );
      messageDiv.appendChild(copyBtn);
    }

    this.chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);

      // Visual feedback
      const originalText = button.innerHTML;
      button.innerHTML = "✅";
      button.style.background = "#4caf50";

      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = "";
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);

      // Fallback feedback for copy failure
      const originalText = button.innerHTML;
      button.innerHTML = "❌";
      button.style.background = "#f44336";

      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = "";
      }, 2000);
    }
  }

  showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    this.chatMessages.appendChild(typingDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator =
      this.chatMessages.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    this.chatMessages.appendChild(errorDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

    this.updateStatus("Error occurred");
  }

  clearChat() {
    this.chatHistory = [];
    this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <p>👋 Welcome! Select a system prompt and ask me anything.</p>
            </div>
        `;
    this.updateStatus("Chat cleared");
  }

  clearChatOnFocus() {
    // Clear chat when popup opens (simulating clicking out and back in)
    document.addEventListener("DOMContentLoaded", () => {
      this.clearChat();
    });
  }

  updateUI() {
    this.handleInputChange();
    this.updateApiStatus();
  }

  updateApiStatus() {
    if (!this.apiKey) {
      this.apiStatus.className = "status-indicator error";
      this.updateStatus("API key not set");
    } else if (this.isLoading) {
      this.apiStatus.className = "status-indicator loading";
      this.updateStatus("Sending message...");
    } else {
      this.apiStatus.className = "status-indicator connected";
      this.updateStatus("Ready");
    }
  }

  updateStatus(message) {
    this.statusText.textContent = message;
  }

  openOptions() {
    chrome.runtime.openOptionsPage();
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SidekickPopup();
});

// Clear chat when popup closes
window.addEventListener("beforeunload", () => {
  // This will be handled by the popup closing
});
