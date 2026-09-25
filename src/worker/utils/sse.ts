/**
 * 格式化 Server-Sent Events (SSE) 数据帧
 */
export function formatSSE(event: string, data: any): string {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  return `event: ${event}\ndata: ${payload}\n\n`;
}

/**
 * 创建标准 SSE 响应头
 */
export function getSSEHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  };
}
