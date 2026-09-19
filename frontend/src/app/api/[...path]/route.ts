import { NextRequest, NextResponse } from "next/server";

// BFF (Backend For Frontend): el navegador solo conoce las rutas /api/* de Next.js.
// La URL real del backend vive únicamente en el servidor (variable sin prefijo NEXT_PUBLIC_).
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

// Encabezados que se reenvían del cliente hacia el backend
const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type", "accept", "accept-language"];

export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  const targetUrl = `${BACKEND_URL}/api/${params.path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const requestBody = ["GET", "HEAD"].includes(request.method) ? "" : await request.text();

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: requestBody || undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    const body = backendResponse.status === 204 ? null : await backendResponse.arrayBuffer();
    return new NextResponse(body, { status: backendResponse.status, headers: responseHeaders });
  } catch (error: any) {
    console.error(`[BFF] ${request.method} ${targetUrl} falló:`, error.message);
    return NextResponse.json(
      { success: false, message: "Servicio no disponible temporalmente", data: null },
      { status: 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
