export default async function handler(req, res) {
  try {
    const { sendClientConfirmation } = await import("../../lib/email");
    await sendClientConfirmation({
      name: "Тест",
      email: "pavlina.dochevaas@gmail.com",
      phone: "0888000000",
      date: "01.01.2025",
      time: "10:00",
      services: ["Гел маникюр"],
      totalPrice: "50.00",
      designUrl: "",
    });
    return res.status(200).json({ success: true, message: "Email sent!" });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
