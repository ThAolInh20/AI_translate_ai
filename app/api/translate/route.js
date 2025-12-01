export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: "Missing text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      apiKey;
    const response = await fetch(
        url,      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Hãy dịch đoạn sau sang tiếng Việt tự nhiên nhất, chỉ trả về bản dịch, không giải thích:\n\n${text}`
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 400
          }
        })
      }
    );

    const data = await response.json();

    // Lấy text từ cấu trúc trả về chuẩn Gemini
    const translated =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    return Response.json({
      success: true,
      translated
    });

  } catch (err) {
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
