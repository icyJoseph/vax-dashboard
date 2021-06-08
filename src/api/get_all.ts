import { VercelRequest, VercelResponse } from "@vercel/node";
import { getTestCenters, setCredentials } from "civic-api";

async function get_all(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.send(404);
  }
  try {
    if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
      setCredentials(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

      const result = await getTestCenters(2, "production", false);

      return res.send(result);
    } else {
      return res.send(401);
    }
  } catch (e) {
    return res.send(500);
  }
}

export default get_all;
