export const callOpenRouter = async (systemPrompt, userText, model = 'google/gemini-2.5-flash', imageUrls = []) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API Key is missing. Please set VITE_OPENROUTER_API_KEY in your environment variables.');
  }

  let userContent = userText;
  if (imageUrls && imageUrls.length > 0) {
    userContent = [{ type: 'text', text: userText }];
    imageUrls.forEach(url => {
      userContent.push({ type: 'image_url', image_url: { url } });
    });
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href, // Recommended by OpenRouter
      'X-Title': 'Swastika Sarees Admin AI',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.2 // Lower temp for more deterministic parsing
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenRouter API Error: ${response.status}`);
  }

  const data = await response.json();
  
  try {
    // Some models might wrap JSON in markdown blocks even with json_object enabled
    let content = data.choices[0].message.content;
    content = content.replace(/^\s*```json/i, '').replace(/```\s*$/i, '');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse AI response as JSON:', data.choices[0].message.content);
    throw new Error('AI returned an invalid JSON response.');
  }
};
