import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message, MessagesResponse, ConversationsResponse } from "@/api/generated/data-contracts";

const WS_BASE = (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:8000";
const MAX_RETRIES = 5;

export function useWebSocket(conversationId: string | null) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const cleanupRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    if (!conversationId || cleanupRef.current) return;

    const token = await getToken();
    if (!token || cleanupRef.current) return;

    const url = `${WS_BASE}/api/v1/ws/conversations/${conversationId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (cleanupRef.current) {
        ws.close();
        return;
      }
      setIsConnected(true);
      retriesRef.current = 0;
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as Message;
        queryClient.setQueriesData<MessagesResponse>(
          { queryKey: ["messages", conversationId] },
          (old) => {
            if (!old) return { data: [message], total: 1, limit: 50, offset: 0 };
            if (old.data.some((m) => m.id === message.id)) return old;
            return { ...old, data: [...old.data, message] };
          },
        );
        queryClient.setQueriesData<ConversationsResponse>(
          { queryKey: ["conversations"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((conv) =>
                conv.id === conversationId
                  ? { ...conv, last_message: message }
                  : conv,
              ),
            };
          },
        );
      } catch {
        // ignore non-JSON frames
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (!cleanupRef.current && retriesRef.current < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
        retriesRef.current += 1;
        setTimeout(() => void connect(), delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [conversationId, getToken, queryClient]);

  useEffect(() => {
    if (!conversationId) return;
    cleanupRef.current = false;
    retriesRef.current = 0;
    void connect();
    return () => {
      cleanupRef.current = true;
      wsRef.current?.close();
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [conversationId, connect]);

  const sendMessage = useCallback((body: string): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ body }));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  return { isConnected, sendMessage };
}