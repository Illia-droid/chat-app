// src/store/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set) => ({
      // Текущий открытый чат
      activeChatId: null,
      setActiveChatId: (chatId) => set({ activeChatId: chatId }),

      // Черновики сообщений (chatId → текст)
      drafts: {},
      setDraft: (chatId, text) =>
        set((state) => ({
          drafts: { ...state.drafts, [chatId]: text },
        })),
      clearDraft: (chatId) =>
        set((state) => {
          const { [chatId]: _, ...rest } = state.drafts;
          return { drafts: rest };
        }),

      // Кто печатает в каком чате (chatId → массив userId или displayName)
      typingInChats: {},
      addTyping: (chatId, userId) =>
        set((state) => {
          const current = state.typingInChats[chatId] || [];
          if (current.includes(userId)) return state;
          return {
            typingInChats: {
              ...state.typingInChats,
              [chatId]: [...current, userId],
            },
          };
        }),
      removeTyping: (chatId, userId) =>
        set((state) => {
          const current = state.typingInChats[chatId] || [];
          return {
            typingInChats: {
              ...state.typingInChats,
              [chatId]: current.filter((id) => id !== userId),
            },
          };
        }),

      // Количество непрочитанных сообщений по чатам
      unreadCounts: {},
      incrementUnread: (chatId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [chatId]: (state.unreadCounts[chatId] || 0) + 1,
          },
        })),
      resetUnread: (chatId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [chatId]: 0,
          },
        })),
      setUnread: (chatId, count) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [chatId]: count,
          },
        })),
    }),

    {
      name: "chat-storage", // ключ в localStorage
      partialize: (state) => ({
        // Что сохранять при перезагрузке страницы
        drafts: state.drafts,
        unreadCounts: state.unreadCounts,
        // activeChatId можно не сохранять — пусть сбрасывается
      }),
    },
  ),
);
