// api/generate.js - High Availability Multi-Model Fallback Engine
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

    if (!API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Backend Configuration Error: OPENROUTER_API_KEY environment variable is completely missing on Vercel.' 
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Sequential list of free models to try if the primary one is rate-limited
    const FREE_MODELS_POOL = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen-2.5-72b-instruct:free"
    ];

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

    let lastErrorDetails = null;

    // Loop through the models in our pool
    for (const activeModel of FREE_MODELS_POOL) {
      try {
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vibe-coder.vercel.app", 
          },
          body: JSON.stringify({
            model: activeModel,
            messages: messages,
            stream: true
          })
        });

        // If a model responds with a 429 rate limit, record it and continue to the next model
        if (!openRouterResponse.ok) {
          const errorText = await openRouterResponse.text();
          lastErrorDetails = `Model ${activeModel} failed with status (${openRouterResponse.status}): ${errorText}`;
          
          if (openRouterResponse.status === 429) {
            console.warn(`${activeModel} is rate-limited. Moving to fallback model...`);
            continue; 
          }

          // For fatal non-429 issues (like invalid keys/401), exit immediately
          return new Response(JSON.stringify({ error: lastErrorDetails }), { 
            status: openRouterResponse.status, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        // Success! Pipe the working model's stream out to the user
        return new Response(openRouterResponse.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });

      } catch (loopError) {
        lastErrorDetails = `Network execution failure on ${activeModel}: ${loopError.message}`;
        continue;
      }
    }

    // If the engine completely runs out of models to try
    return new Response(JSON.stringify({ 
      error: `All free endpoints are temporarily congested. Please wait a moment and try again. Technical log: ${lastErrorDetails}` 
    }), { 
      status: 429, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Internal Server Proxy Crash: ${error.message}` }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
