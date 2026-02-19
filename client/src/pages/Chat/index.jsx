import { useEffect, useRef } from 'react'
import {
  useConversations,
  useMessages,
  useSendMessage
} from '../../api/chatQueries'
import { useChatStore } from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import Header from '../../components/Header'

function Chat () {
  const { user } = useAuthStore()
  const currentUserId = user?.id

  // Список чатов + функция обновления после создания группы
  const { data: conversations = [], isLoading: chatsLoading } =
    useConversations()

  const activeChatId = useChatStore(s => s.activeChatId)
  const { data: messages = [], isLoading: messagesLoading } =
    useMessages(activeChatId)

  const { mutate: sendMessage, isPending: isSending } = useSendMessage()

  const messagesEndRef = useRef(null) // для скролла вниз

  // Скролл вниз при новых сообщениях или смене чата
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChatId])

  // Отправка сообщения
  const handleSend = e => {
    if (
      e.key !== 'Enter' ||
      !e.target.value.trim() ||
      !activeChatId ||
      isSending
    )
      return

    e.preventDefault() // ← предотвращаем перенос строки при Enter

    sendMessage(
      {
        conversationId: activeChatId,
        content: e.target.value.trim()
      },
      {
        onSuccess: () => {
          e.target.value = '' // очищаем поле после успеха
        }
      }
    )
  }

  if (chatsLoading) {
    return (
      <p style={{ textAlign: 'center', padding: '50px' }}>Загрузка чатов...</p>
    )
  }

  return (
    <>
      <Header />
      <div
        style={{
          display: 'flex',
          height: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* Левая панель — список чатов */}
        <div
          style={{
            width: '320px',
            borderRight: '1px solid #ddd',
            overflowY: 'auto',
            background: '#f8f9fa'
          }}
        >
          <div
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0 }}>Чаты</h3>
            {/* Кнопка создания группы — можешь подключить модалку */}
            <button
              onClick={() => alert('Модалка создания группы — добавь позже')}
              style={{
                padding: '6px 12px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              + Группа
            </button>
          </div>

          {conversations.length === 0 ? (
            <p style={{ padding: '20px', color: '#888' }}>Нет чатов</p>
          ) : (
            conversations.map(chat => (
              <div
                key={chat.id}
                onClick={() => useChatStore.getState().setActiveChatId(chat.id)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background:
                    activeChatId === chat.id ? '#e0f7fa' : 'transparent',
                  borderBottom: '1px solid #eee'
                }}
              >
                <strong>
                  {chat.type === 'group'
                    ? chat.name || 'Группа'
                    : chat.participants?.find(p => p.id !== currentUserId)
                        ?.displayName || 'Чат'}
                </strong>
              </div>
            ))
          )}
        </div>

        {/* Правая панель — чат */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChatId ? (
            <>
              {/* Заголовок */}
              <div
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #ddd',
                  background: '#f8f9fa'
                }}
              >
                <h2 style={{ margin: 0 }}>
                  {conversations.find(c => c.id === activeChatId)?.name ||
                    conversations
                      .find(c => c.id === activeChatId)
                      ?.participants?.find(p => p.id !== currentUserId)
                      ?.displayName}
                </h2>
              </div>

              {/* Сообщения */}
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  overflowY: 'auto',
                  background: '#fafafa'
                }}
              >
                {messagesLoading ? (
                  <p style={{ textAlign: 'center' }}>Загрузка сообщений...</p>
                ) : messages.length === 0 ? (
                  <p
                    style={{
                      textAlign: 'center',
                      color: '#888',
                      marginTop: '100px'
                    }}
                  >
                    Напишите первое сообщение!
                  </p>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: '12px',
                        textAlign:
                          msg.senderId === currentUserId ? 'right' : 'left'
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          maxWidth: '70%',
                          padding: '10px 14px',
                          borderRadius: '18px',
                          background:
                            msg.senderId === currentUserId
                              ? '#0084ff'
                              : '#e5e5ea',
                          color:
                            msg.senderId === currentUserId ? 'white' : 'black'
                        }}
                      >
                        <strong>{msg.sender?.displayName || 'Кто-то'}:</strong>{' '}
                        {msg.content}
                        <div
                          style={{
                            fontSize: '10px',
                            marginTop: '4px',
                            opacity: 0.7,
                            textAlign: 'right'
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <div
                style={{
                  padding: '12px',
                  borderTop: '1px solid #ddd',
                  display: 'flex',
                  background: '#fff'
                }}
              >
                <input
                  type='text'
                  placeholder='Напишите сообщение...'
                  disabled={isSending}
                  onKeyDown={handleSend}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '24px',
                    border: '1px solid #ccc',
                    outline: 'none'
                  }}
                />

                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]')
                    if (input && input.value.trim() && !isSending) {
                      handleSend({
                        key: 'Enter',
                        target: { value: input.value }
                      })
                      input.value = ''
                    }
                  }}
                  disabled={isSending}
                  style={{
                    marginLeft: '8px',
                    padding: '0 20px',
                    borderRadius: '24px',
                    background: isSending ? '#ccc' : '#0084ff',
                    color: 'white',
                    border: 'none',
                    cursor: isSending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSending ? 'Отправка...' : '➤'}
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888'
              }}
            >
              Выберите чат слева или создайте новый
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Chat
