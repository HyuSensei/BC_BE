const stripe = require("stripe")(
  "sk_test_51P6CpDP2UJ6LZY9hglORNFSjpADMHzstFywhmBvMIVm0UyWuMAy57mekaEBEP7zQU08fBwbMP86yuXeGkuNVRbxO00S9zJ8mET"
);

const deletePayment = async (id) => {
  const paymentMethod = await stripe.paymentMethods.detach(id);
};

deletePayment("pm_1P6T67P2UJ6LZY9hoye7a3Qw");
