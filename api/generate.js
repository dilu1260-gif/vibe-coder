// api/generate.js - Smart Error Catching Proxy
export const config = {
  runtime: 'edge', 
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt, systemHistory, masterCode } = await req.json();
    const API_KEY = process.env.OPENROUTER_API_KEY; 

    // 1. Check if Vercel actually loaded your key
    if (!API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Backend Configuration Error: The OPENROUTER_API_KEY environment variable is completely missing on Vercel.' 
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

    const systemPrompt = `You are a Vibe Coding Engine. 
If the user wants a brand-new app, output a complete, standalone HTML document starting with <!DOCTYPE html>. Do not wrap it in markdown code blocks.
If the user is asking for a change, tweak, or bug fix to an app you already wrote, do NOT rewrite the whole thing. Instead, output precise patch blocks using this exact format:
<<<<<<< SEARCH
[exact lines of code from the existing app that need to change]
=======
[the new lines of code that should replace the search block]
>>>>>>> REPLACE`;

    let messages = [{ role: "system", content: systemPrompt }];
    if (!masterCode) {
      messages.push({ role: "user", content: prompt });
    } else {
      messages.push({ role: "assistant", content: "Current app code:\n" + masterCode });
      messages.push({ role: "user", content: `Modify the app: ${prompt}` });
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vibe-coder.vercel.app", 
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: true
      })
    });

    // 2. IF OPENROUTER FAILS, CAPTURE THE TRUE REASON AND STOP THE ROUTE
    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return new Response(JSON.stringify({ 
        error: `OpenRouter Server Rejected Request (${openRouterResponse.status}): ${errorText}` 
      }), { 
        status: openRouterResponse.status, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 3. If everything is green, pass the clean stream data back
    return new Response(openRouterResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Internal Server Proxy Crash: ${error.message}` }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
