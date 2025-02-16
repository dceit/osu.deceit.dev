document.addEventListener("DOMContentLoaded", async (event) => {
  const API_BASE = `https://api.deceit.dev`;
  const API_ENDPOINT = `/api/osu/chat`;
  const TEMPLATE_CHAT_ENTRY = `
  <div class="flex items-start gap-2.5 mt-3">
      <img
          class="w-8 h-8 rounded-full"
          src="https://a.ppy.sh/{{CHAT_BANCHO_ID}}?{{CURRENT_TIME}}.jpeg"
          alt="{{CHAT_SENDER}}"
      />
      <div class="flex flex-col gap-1 w-full max-w-[320px]">
          <div
              class="flex items-center space-x-2 rtl:space-x-reverse"
          >
              <span
                  class="text-sm font-semibold text-gray-200 dark:text-white"
                  >{{CHAT_SENDER}}</span
              >
              <span
                  class="text-sm font-normal text-gray-300 dark:text-gray-400"
                  >{{CHAT_TIME}}</span
              >
          </div>
          <div
              class="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded bg-gray-700"
          >
              <p class="text-sm font-normal text-white">
                  {{CHAT_CONTENT}}
              </p>
          </div>
      </div>
  </div>
  `;

  const messageContainer = document.querySelector(".message-container");

  function xssFilter(dirtyInput) {
    return DOMPurify.sanitize(dirtyInput, { ALLOWED_TAGS: [] }).replace(
      /[\x00-\x1f\x7f-\x9f&<>"'`=]/g,
      (char) => `&#${char.charCodeAt(0)};`,
    );
  }

  function populateMessageContainer(messages) {
    messageContainer.innerHTML = "";

    messages.forEach((message) => {
      messageContainer.innerHTML += TEMPLATE_CHAT_ENTRY.replaceAll(
        "{{CHAT_CONTENT}}",
        xssFilter(message.message),
      )
        .replaceAll("{{CHAT_SENDER}}", xssFilter(message.username))
        .replaceAll("{{CHAT_TIME}}", xssFilter(message.time))
        .replaceAll("{{CHAT_BANCHO_ID}}", xssFilter(message.bancho_id))
        .replaceAll("{{CURRENT_TIME}}", xssFilter(message.time));
    });
  }

  await fetch(API_BASE + API_ENDPOINT + location.search)
    .then((response) => response.json())
    .then((messages) => populateMessageContainer(messages))
    .catch((error) => console.log(error));
});
