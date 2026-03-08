export async function POST(req) {
  try {
    const body = await req.json()
    const { text } = body

    if (!text) {
      return Response.json(
        { success: false, error: "text is required" },
        { status: 400 }
      )
    }

    const prompt = `
Extract product names and quantities from the text.

Rules:
- quantity must be number
- name must be singular lowercase
- return JSON only

Example input:
10 donuts 5 tables

Example output:
{
 "items":[
  {"name":"donut","quantity":10},
  {"name":"table","quantity":5}
 ]
}

Text:
${text}
`
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    )

    const data = await res.json()

    let aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // remove markdown
    aiText = aiText.replace(/```json/g, "")
    aiText = aiText.replace(/```/g, "")
    aiText = aiText.trim()

    const items = JSON.parse(aiText)

    return Response.json({
      success: true,
      items:items.items
    })
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message
    })
  }
}