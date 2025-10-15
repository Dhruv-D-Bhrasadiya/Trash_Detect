import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const { imageBase64 } = body;

    // Validate imageBase64 exists and format
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: imageBase64 is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate base64 format (data:image/[type];base64,[data])
    const base64Regex = /^data:image\/(png|jpg|jpeg|webp|gif);base64,/;
    if (!base64Regex.test(imageBase64)) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format. Must be a valid base64 encoded image (png, jpg, jpeg, webp, or gif)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate size (10MB limit)
    const base64Data = imageBase64.split(',')[1];
    if (!base64Data) {
      return new Response(
        JSON.stringify({ error: 'Invalid base64 encoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const decoded = atob(base64Data);
      const sizeInBytes = decoded.length;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (sizeInBytes > maxSize) {
        return new Response(
          JSON.stringify({ error: `Image too large. Maximum size is 10MB, received ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (decodeError) {
      return new Response(
        JSON.stringify({ error: 'Invalid base64 encoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Detecting trash and bins in image...');

    // Call Lovable AI for vision-based trash detection
    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a trash detection AI. Analyze images and detect trash items and bins. Return a JSON array of detections with label, confidence (0-1), and box coordinates (xmin, ymin, xmax, ymax). Valid labels: "trash", "bin", "plastic", "paper", "metal", "glass", "organic". Return empty array if nothing detected.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Detect all trash items and bins in this image. Return JSON array format: [{"label": "bin", "score": 0.95, "box": {"xmin": 100, "ymin": 50, "xmax": 200, "ymax": 150}}]'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response:', aiResponse);

    // Parse the AI response to extract detections
    const aiContent = aiResponse.choices?.[0]?.message?.content || '[]';
    let results = [];
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      results = [];
    }

    console.log('Detection results:', results);

    // Process detections
    const detected_items = results.map((result: any) => ({
      label: result.label,
      confidence: result.score,
      box: result.box,
    }));

    // Get unique labels
    const found_labels = [...new Set(detected_items.map((item: any) => item.label))].sort();

    // Check if "bin" detected
    let score_value = 0;
    let score_msg = "No items detected";

    if (found_labels.length > 0) {
      if (found_labels.includes('bin')) {
        score_value = 1;
        score_msg = `+1 point! Found: ${found_labels.join(', ')}`;
      } else {
        score_value = -1;
        score_msg = `No trash bin detected, -1 point. Found: ${found_labels.join(', ')}`;
      }
    }

    const output = {
      detections: detected_items,
      summary: score_msg,
      points: score_value,
      labels: found_labels,
    };

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in detect-trash function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
