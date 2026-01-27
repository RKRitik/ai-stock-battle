import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      function sendData() {
        const data = {
          bot1: Math.floor(Math.random() * 1000),
          bot2: Math.floor(Math.random() * 1000),
          bot3: Math.floor(Math.random() * 1000),
          bot4: Math.floor(Math.random() * 1000),
        };
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      }

      const interval = setInterval(sendData, 2000);
      sendData();

      controller.cancel = () => {
        clearInterval(interval);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}