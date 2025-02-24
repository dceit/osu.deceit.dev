document.addEventListener("DOMContentLoaded", async (event) => {
  const API_BASE = `https://api.deceit.dev`;
  const API_ENDPOINT = `/api/osu/chat`;
  const TEMPLATE_CHAT_ENTRY = `
  <div class="flex items-start gap-2.5 mt-3">
      <a href="http://osu.ppy.sh/u/{{CHAT_SENDER}}"><img
          class="w-8 h-8 rounded-full shadow-lg"
          src="https://api.deceit.dev/api/osu/image/{{CHAT_SENDER}}"
      /></a>
      <div class="flex flex-col gap-1 w-full max-w-[320px]">
          <div
              class="flex items-center space-x-2 rtl:space-x-reverse"
          >
              <a href="http://osu.ppy.sh/u/{{CHAT_SENDER}}"><span
                  class="text-sm font-semibold text-gray-200 dark:text-white"
                  >{{CHAT_SENDER}}</span
              ></a>
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

  const TEMPLATE_NO_CHAT_ENTRY = `
    <h1 class="text-center text-xl font-bold">Nothing found!</h1>
    <p class="text-center">osu!logger database does not have anything which matches this query.</p>
    <img class="mt-5 mx-auto" src="https://media.tenor.com/8j2YHcxUKKsAAAAM/zoning-out-cat-complete-blcak-cat.gif">
  `;

  const parentContainer = document.querySelector(".parent-container");
  const messageContainer = document.querySelector(".message-container");
  let currentOffset = 0;

  parentContainer.addEventListener("scroll", async function () {
    const scrollHeight = parentContainer.scrollHeight;
    const scrollTop = parentContainer.scrollTop;
    const clientHeight = parentContainer.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      const totalMessages = messageContainer.children.length;

      if (totalMessages % 20 === 0) {
        currentOffset += 20;
        const params = new URLSearchParams(window.location.search);
        params.set("offset", currentOffset);
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?${params}`,
        );

        await fetch(API_BASE + API_ENDPOINT + location.search)
          .then((response) => response.json())
          .then((messages) => populateMessageContainer(messages))
          .catch((error) => console.log(error));
      }
    }
  });

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

  function formatDate(inputString) {
    const date = new Date(inputString);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${hours}:${minutes} - ${month}/${day}/${year}`;
  }

  function populateMessageContainer(messages) {
    if (messages.length == 0) {
      messageContainer.innerHTML = TEMPLATE_NO_CHAT_ENTRY;
      return;
    }

    messages.forEach((message) => {
      messageContainer.innerHTML += TEMPLATE_CHAT_ENTRY.replaceAll(
        "{{CHAT_CONTENT}}",
        xssFilter(message.message),
      )
        .replaceAll("{{CHAT_SENDER}}", xssFilter(message.username))
        .replaceAll("{{CHAT_TIME}}", xssFilter(formatDate(message.time)))
        .replaceAll("{{CHAT_BANCHO_ID}}", xssFilter(message.bancho_id))
        .replaceAll("{{CURRENT_TIME}}", xssFilter(message.time));
    });
  }

  await fetch(API_BASE + API_ENDPOINT + location.search)
    .then((response) => response.json())
    .then((messages) => populateMessageContainer(messages))
    .catch((error) => console.log(error));
});
