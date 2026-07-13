export async function streamCodeGeneration(
  prompt: string, 
  apiKey: string, 
  onChunk: (text: string) => void
) {
  // We use standard fetch to call OpenRouter directly from the browser
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free", // Using a solid free model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      stream: true,
    }),
  });

  if (!response.body) throw new Error("No response body data available");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Save incomplete line for next chunk

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataText = line.slice(6).trim();
        if (dataText === "[DONE]") break;
        try {
          const parsed = JSON.parse(dataText);
          const chunk = parsed.choices[0]?.delta?.content || "";
          onChunk(chunk);
        } catch (e) {
          // Keep parsing gracefully if a line is malformed
        }
      }
    }
  }
}
