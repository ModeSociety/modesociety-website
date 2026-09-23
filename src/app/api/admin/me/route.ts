import { backendOwnerEmail, errorResponse, getAdminSession, listAdmins, ownerEmail } from "@/lib/auth";
import { backendConfigured, callBackend } from "@/lib/backend";

type Info = { spreadsheetUrl: string; folderUrl: string; imagesFolderUrl: string; talentFolderUrl: string };

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return Response.json({ ok: true, session: null });
    let info: Info | null = null;
    let backendError = "";
    if (backendConfigured()) {
      try {
        info = await callBackend<Info>("getInfo");
      } catch (err) {
        backendError = (err as Error).message;
      }
    }
    return Response.json({
      ok: true,
      session,
      owner: ownerEmail(),
      admins: await listAdmins(true),
      backendOwner: await backendOwnerEmail(),
      backendConfigured: backendConfigured(),
      backendError,
      info,
    });
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
