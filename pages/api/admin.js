import { bookingsCollection, giftcardsCollection } from "../../lib/firebase";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "240408Pp";

function isAuthorized(req) {
  const token = req.headers["x-admin-token"] || req.query.token;
  return token === ADMIN_SECRET;
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET all bookings
  if (req.method === "GET") {
    try {
      const snapshot = await bookingsCollection.orderBy("date", "desc").get();
      const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json({ bookings });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
