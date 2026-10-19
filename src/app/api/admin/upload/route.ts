import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { IMAGE_UPLOAD } from "@/config/storage";
import { getAdminSession } from "@/lib/auth/session";
import { parseImagePathname } from "@/lib/blob/images";

// Step 2 of the image upload (prepare → direct upload → finalize): issues a presigned PUT for
// exactly one server-generated path. No upload-completed webhook is registered; the upload is
// verified by finalizeImageUpload instead.

const TOKEN_TTL_MS = 5 * 60 * 1000;

export async function POST(request: Request): Promise<Response> {
  // Route handlers are outside proxy.ts and must authorize themselves.
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: HandleUploadPresignedBody;
  try {
    body = (await request.json()) as HandleUploadPresignedBody;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, _clientPayload, multipart) => {
        // Only paths produced by prepareImageUpload: images/{kind}/{id}/{uuid}.{ext}.
        const parsed = parseImagePathname(pathname);
        if (!parsed || multipart) throw new UploadRejected("Upload path is not allowed");

        const validUntil = Date.now() + TOKEN_TTL_MS;
        const constraints = {
          allowedContentTypes: [parsed.contentType],
          maximumSizeInBytes: IMAGE_UPLOAD.maxSizeBytes,
        };
        const token = await issueSignedToken({ pathname, operations: ["put"], validUntil, ...constraints });
        return {
          token,
          urlOptions: { ...constraints, validUntil, allowOverwrite: false, addRandomSuffix: false },
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    if (error instanceof UploadRejected) return Response.json({ error: error.message }, { status: 400 });
    console.error("[upload] presign failed", error);
    return Response.json({ error: "Upload is not available" }, { status: 500 });
  }
}

class UploadRejected extends Error {}
