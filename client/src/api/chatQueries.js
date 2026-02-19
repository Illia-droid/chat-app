// src/api/chatQueries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api"; // твой axios-инстанс

// Список чатов текущего пользователя
export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get("/conversations").then((res) => res.data),
  });
};

// Сообщения в конкретном чате
export const useMessages = (chatId) => {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () =>
      api.get(`/conversations/${chatId}/messages`).then((res) => res.data),
    enabled: !!chatId, // не запрашиваем, если chatId нет
  });
};

// Отправка сообщения (с optimistic update)
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => api.post("/messages", payload),
    onMutate: async (newMsg) => {
      // Отменяем текущие запросы, чтобы не было конфликтов
      await queryClient.cancelQueries({
        queryKey: ["messages", newMsg.conversationId],
      });

      // Сохраняем предыдущее состояние (для rollback)
      const previousMessages = queryClient.getQueryData([
        "messages",
        newMsg.conversationId,
      ]);

      // Optimistic update — добавляем сообщение сразу
      const optimisticMsg = {
        id: Date.now(), // временный id
        content: newMsg.content,
        senderId: "currentUser", // замени на реальный id из auth
        createdAt: new Date().toISOString(),
        isSending: true,
      };

      queryClient.setQueryData(
        ["messages", newMsg.conversationId],
        (old = []) => [...old, optimisticMsg],
      );

      return { previousMessages }; // для onError
    },
    onError: (err, newMsg, context) => {
      // Откатываем оптимистическое обновление
      queryClient.setQueryData(
        ["messages", newMsg.conversationId],
        context.previousMessages,
      );
    },
    onSuccess: (savedMsg, variables) => {
      // Заменяем временное сообщение на реальное
      queryClient.setQueryData(
        ["messages", variables.conversationId],
        (old = []) => old.map((m) => (m.id === savedMsg.id ? savedMsg : m)),
      );

      // Обновляем список чатов (last message, unread и т.д.)
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
