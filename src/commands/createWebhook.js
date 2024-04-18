const stripe = require("stripe")(
  "sk_test_51P6CpDP2UJ6LZY9hglORNFSjpADMHzstFywhmBvMIVm0UyWuMAy57mekaEBEP7zQU08fBwbMP86yuXeGkuNVRbxO00S9zJ8mET"
);

(async () => {
  const webhookEndpoint = await stripe.webhookEndpoints.create({
    url: "https://e9be-171-224-179-48.ngrok-free.app/api/v1/webhook/order",
    enabled_events: ["checkout.session.completed"],
  });
  console.log("Webhook endpoint created:", webhookEndpoint);
  //   const webhooks = await stripe.webhookEndpoints.list();
  //   console.log("Webhooks:", webhooks.data);
})();
