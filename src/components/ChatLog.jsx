import { createEffect, on } from 'solid-js';
export default function ChatLog(props) {
  const groupedChats = () => {
    const grouped = [];
    let cur;
    props.chats.slice().reverse().forEach(chat => {
      if (cur && cur.from === chat.from) {
        cur.chats.push(chat);
      } else {
        cur = {
          from: chat.from,
          chats: [chat],
        };
        grouped.push(cur);
      }
    });
    return grouped;
  };
  createEffect(on(() => [props.chats.length, props.context], () => {
    if (log) log.scroll(0, log.scrollHeight);
  }));
  let log;
  return (
    <div class="mt-1 flex-[1_5_0%] min-h-[59px] flex flex-col-reverse">
      <div ref={el => log = el} class="p-2 bg-yellow-950/60 rounded-md text-white overflow-y-auto max-h-full">
        <For each={groupedChats()}>
          {(group) => (
            <>
              <p class="text-yellow-300">
                &nbsp; {our === group.from ? 'me' : group.from}:
              </p>
              <For each={group.chats}>
                {(chat, i) => (
                  <p class="whitespace-pre-wrap">
                    {/* {our === chat.from ? 'me' : chat.from}: {chat.text} */}
                    {chat.text}
                  </p>
                )}
              </For>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
