import {
  adminSides,
  backendOwnerEmail,
  errorResponse,
  getAdminSession,
  listAdmins,
  ownerEmail,
} from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { backendConfigured, callBackend } from "@/lib/backend";

type Info = {
  spreadsheetUrl: string;
  folderUrl: string;
  imagesFolderUrl: string;
  talentFolderUrl: string;
};

/** The Sheet and Drive folder links never change, so the website keeps them for a day. */
const getInfo = unstable_cache(
  () => callBackend<Info>("getInfo"),
  ["backend-info-v1"],
  { revalidate: 86_400 },
);

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return Response.json({ ok: true, session: null });
    let backendError = "";
    // side by side, each from the website's kept copy
    const [info, admins, backendOwner, sides] = await Promise.all([
      backendConfigured()
        ? getInfo().catch((err: Error) => {
            backendError = err.message;
            return null;
          })
        : null,
      listAdmins(),
      backendOwnerEmail(),
      adminSides(),
    ]);
    return Response.json(
      {
        ok: true,
        session,
        owner: ownerEmail(),
        admins,
        // which admins are limited to one business (Access shows and changes it)
        adminSides: sides,
        backendOwner,
        backendConfigured: backendConfigured(),
        backendError,
        info,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (err) {
    return errorResponse(err, { expose: true });
  }
}
