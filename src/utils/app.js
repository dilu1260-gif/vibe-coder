// Configuration & State
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const SYSTEM_PROMPT = `You are a Vibe Coding Engine. The user wants a single-page web app. 
Return ONLY a completely unified, self-contained HTML document containing all structural elements, inline CSS (or Tailwind via CDN), and embedded JavaScript logic.
Do NOT wrap your response in markdown code blocks (\`\`\`html). Output pure valid HTML code directly, starting with <!DOCTYPE html>.`;

// DOM Elements
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');
const promptInput = document.getElementById('prompt-input');
const generateBtn = document.getElementById('generate-btn');
const chatHistory = document.getElementById('chat-history');
const previewSandbox = document.getElementById('preview-sandbox');
const statusIndicator = document.getElementById('status-indicator');

// Load saved key on boot
window.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('openrouter_key');
  if (savedKey) {
    apiKeyInput.value = savedKey;
    statusIndicator.innerText = "API Key Loaded";
  }
});

// Save Key Functionality
saveKeyBtn.addEventListener('click', () => {
  localStorage.setItem('openrouter_key', apiKeyInput.value.trim());
  alert('API Key saved safely to your local browser storage!');
});

// Append messages to the chat view
function addChatMessage(sender, text) {
  const msgHtml = `
    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700">
      <p class="font-semibold ${sender === 'You' ? 'text-emerald-400' : 'text-blue-400'} mb-1">${sender}</p>
      <p class="whitespace-pre-wrap text-slate-300">${text}</p>
    </div>
  `;
  chatHistory.insertAdjacentHTML('beforeend', msgHtml);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Main Vibe Stream Process
generateBtn.addEventListener('click', async () => {
  const apiKey = localStorage.getItem('openrouter_key');
  const prompt = promptInput.value.trim();

  if (!apiKey) return alert("Please enter and save your OpenRouter Free Key first!");
  if (!prompt) return alert("What are we building? Type a prompt!");

  addChatMessage("You", prompt);
  promptInput.value = "";
  statusIndicator.innerText = "Coding...";
  generateBtn.disabled = true;

  let completeCodeOutput = "";
  
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        stream: true
      })
    });

    if (!response.body) throw new Error("No response body data flowing.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Create an empty chat block for the AI response
    addChatMessage("Engine", "Generating code...");
    const lastChatBlock = chatHistory.lastElementChild.querySelector('p:nth-child(2)');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataText = line.slice(6).trim();
          if (dataText === "[DONE]") break;
          
          try {
            const parsed = JSON.parse(dataText);
            const content = parsed.choices[0]?.delta?.content || "";
            
            if (content) {
              completeCodeOutput += content;
              lastChatBlock.innerText = "Writing code files...";
              
              // LIVE UPDATE: Push code updates straight into the sandbox iframe window!
              previewSandbox.srcdoc = completeCodeOutput;
            }
          } catch (e) { /* Buffer safety segment */ }
        }
      }
    }
    
    statusIndicator.innerText = "App Ready!";
    lastChatBlock.innerText = "Application generated and rendered successfully below!";

  } catch (error) {
    console.error(error);
    statusIndicator.innerText = "Error";
    addChatMessage("System Error", "Failed to compile code from stream. Check console log or API credit limit.");
  } finally {
    generateBtn.disabled = false;
  }
});
