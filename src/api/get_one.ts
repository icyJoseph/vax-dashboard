import { VercelRequest, VercelResponse } from "@vercel/node";
import { getTestCenterInformation } from "civic-api";

async function get_one(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.send(404);
  }
  try {
    const result = await getTestCenterInformation();

    return res.send(result);
  } catch (e) {
    return res.send(500);
  }
}

export default get_one;
