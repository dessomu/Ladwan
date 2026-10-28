import { handleBridgeRequest } from "@ladwan/database/bridge";

export async function GET(req) {
  return handleBridgeRequest(req);
}

export async function POST(req) {
  return handleBridgeRequest(req);
}

export async function OPTIONS(req) {
  return handleBridgeRequest(req);
}
