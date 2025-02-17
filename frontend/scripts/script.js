document.addEventListener("DOMContentLoaded", async (event) => {
  const API_BASE = `https://api.deceit.dev`;
  const API_ENDPOINT = `/api/osu/chat`;
  const TEMPLATE_CHAT_ENTRY = `
  <div class="flex items-start gap-2.5 mt-3">
      <img
          class="w-8 h-8 rounded-full shadow-lg"
          src="https://api.deceit.dev/api/osu/image/{{CHAT_SENDER}}"
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
                  class="text-sm font-normal"
                  style="color: #9d8a93 !important;">{{CHAT_TIME}}</span>
          </div>
          <div
              class="flex flex-col leading-1.5 p-4 border-gray-200 rounded shadow-md chat-entry"
              style="background-color: #1c1719 !important;"
          >
              <p class="text-sm font-normal text-white">
                  {{CHAT_CONTENT}}
              </p>
          </div>
      </div>
  </div>
  `;

  const messageContainer = document.querySelector(".message-container");

  async function getRedirectLocation(url) {
    try {
      const response = await fetch(url, { redirect: "manual" });

      if (response.status === 302) {
        const location = response.headers.get("Location");
        return location;
      } else {
        return `No redirect. Status code: ${response.status}`;
      }
    } catch (error) {
      return `An error occurred: ${error.message}`;
    }
  }

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
