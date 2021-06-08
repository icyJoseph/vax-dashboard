import { VercelRequest, VercelResponse } from "@vercel/node";
import { getTestCenterInformation } from "civic-api";

async function get_by_hsaid(req: VercelRequest, res: VercelResponse) {
  const { hsaid } = req.query;
  if (req.method !== "GET") {
    return res.send(404);
  }
  try {
    const id = Array.isArray(hsaid) ? hsaid[0] : hsaid;
    const result = await getTestCenterInformation({ hsaid: id }, false);

    return res.send(result);
  } catch (e) {
    return res.send(500);
  }
}

export default get_by_hsaid;
