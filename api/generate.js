// api/generate.js - Secure Backend Proxy
export const config = {
  runtime: 'edge', // Enables high-speed streaming response compatibility
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt, systemHistory, masterCode } = await req.json();

    // 1. SECURELY FETCH YOUR KEY FROM VERCEL ENVIRONMENT VARIABLES
    const API_KEY = process.env.OPENROUTER_API_KEY; 
    const MODEL = "meta-llama/llama-3.3-70b-instruct:free"; // Keeping it on the free tier

    const systemPrompt = `You are a Vibe Coding Engine. 
If the user wants a brand-new app, output a complete, standalone HTML document starting with <!DOCTYPE html>. Do not wrap it in markdown code blocks.
If the user is asking for a change, tweak, or bug fix to an app you already wrote, do NOT rewrite the whole thing. Instead, output precise patch blocks using this exact format:
<<<<<<< SEARCH
[exact lines of code from the existing app that need to change]
=======
[the new lines of code that should replace the search block]
>>>>>>> REPLACE`;

    // 2. REBUILD THE CONVERSATION STRUCTURE SECURELY ON THE SERVER
    let messages = [{ role: "system", content: systemPrompt }];
    
    if (!masterCode) {
      messages.push({ role: "user", content: prompt });
    } else {
      messages.push({ role: "assistant", content: "Current app code:\n" + masterCode });
      messages.push({ role: "user", content: `Modify the app: ${prompt}` });
    }

    // 3. CALL OPENROUTER FROM THE SERVER
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vibecoder.ai", // Optional branding identifier
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: true
      })
    });

    // 4. STREAM THE TOKENS DIRECTLY BACK TO THE USER'S MOBILE BROWSER
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server proxy failed to route payload tokens' }), { status: 500 });
  }
}
