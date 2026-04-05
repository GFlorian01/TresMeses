self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "TresMeses";
  const options = {
    body: data.body || "Es hora de registrar tu progreso",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "tresmeses-reminder",
    data: { url: data.url || "/check" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/check";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
