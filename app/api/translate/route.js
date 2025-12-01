export async function POST(req) {
  try {
    const { text, target } = await req.json();

    if (!text) {
      return Response.json({ error: "Missing text" }, { status: 400 });
    }

    // Nếu không truyền target → mặc định dịch sang tiếng Việt
    const targetLang = target || "vi";

    const apiKey = process.env.GEMINI_API_KEY;
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      apiKey;

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    `Dịch đoạn sau sang ngôn ngữ "${targetLang}". ` +
                    `Trả về bản dịch tự nhiên nhất, KHÔNG giải thích:\n\n` +
                    text
                }
              ]
            }
          ],
          generationConfig: { maxOutputTokens: 400 }
        })
      });
    } catch (fetchErr) {
      return Response.json(
        { error: "Không thể kết nối đến Gemini API: " + fetchErr.message },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return Response.json(
        {
          error: "Gemini trả về lỗi HTTP " + response.status,
          detail: await response.text()
        },
        { status: 500 }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      return Response.json(
        { error: "Lỗi parse JSON từ Gemini API: " + jsonErr.message },
        { status: 500 }
      );
    }

    // Lấy kết quả dịch
    const translated =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    if (!translated) {
      return Response.json(
        {
          error: "Gemini không trả về nội dung.",
          raw: data
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      translated
    });

  } catch (err) {
    return Response.json(
      { error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}
