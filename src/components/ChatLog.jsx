import { createEffect, on } from 'solid-js';
import { getDateString } from 'lib/utils';

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
  let log;
  createEffect(on(() => [props.chats.length, props.context], () => {
    if (log) log.scroll(0, log.scrollHeight);
  }));
  return (
    <div class="mt-1 flex-[1_5_0%] min-h-[59px] flex flex-col-reverse">
      <div ref={el => log = el} class="p-2 bg-yellow-950/60 rounded-md text-white overflow-y-auto max-h-full pointer-events-auto">
        <For each={groupedChats()}>
          {(group) => (
            <>
              <div class="flex flex-wrap">
                <span class="text-yellow-300">
                  &nbsp; {our === group.from ? 'me' : group.from}:
                </span>
                {group.chats[0] &&
                <span class="flex-grow text-right">
                  {getDateString(group.chats[0].at)}
                </span>}
              </div>
              <For each={group.chats}>
                {(chat, i) => (
                  <p class="whitespace-pre-wrap" title={getDateString(chat.at, false)}>
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
