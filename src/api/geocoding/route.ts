import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q,
          format: "json",
          limit: 1,
          countrycodes: "vn",
        },
        headers: {
          "User-Agent": "UrbanMartNextJS/1.0 (contact@urbanmart.com)",
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Server Geocoding Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
