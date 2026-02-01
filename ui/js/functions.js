function makeLinksClickable(baseElement) {
  baseElement = baseElement || document;
  baseElement.querySelectorAll("[data-open-url").forEach((e) => {
    const value = e.getAttribute("data-open-url");
    if (value) {
      e.onclick = async () => {
        let path;
        if (value.indexOf("http") !== 0) {
          path = document.location.href.split("/");
          path.pop();
          path.push(value.split("/").pop());
          path = path.join("/");
        } else {
          path = value;
        }
        const payload = { url: path };
        await SDPIComponents.streamDeckClient.send('openUrl', payload);
      };
    } else {
      console.log(`${value} is not a supported url`);
    }
  });
}

// Handle messages from the plugin here
SDPIComponents.streamDeckClient.sendToPropertyInspector.subscribe((data) => {
  console.log("Received data from plugin:", data);

  if (!data || !data.payload) {
    return;
  }

  if (data.payload.event == "get-mutedeck-status") {
    const md_status = data.payload.data.mutedeck_status || "disconnected";
    let md_status_container = document.getElementById("mutedeck_connection_status");
    if (md_status == "connected") {
      md_status_container.innerHTML = `✅ Connected to MuteDeck!`;
    } else {
      md_status_container.innerHTML = `⚠️ Not connected to MuteDeck. For this plugin to work, please download
          <a href="#" data-open-url="https://mutedeck.com/downloads/">MuteDeck</a>
          Or get <a href="#" data-open-url="https://mutedeck.com/go/troubleshooting">troubleshooting</a> help`;
      // to make sure the link is clickable
      makeLinksClickable();
    }
  }
});