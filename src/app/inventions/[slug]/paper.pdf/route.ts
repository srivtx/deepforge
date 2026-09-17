import { INVENTIONS } from "@/data/inventions";
import { getInvention, paperFilename, toPdfDoc } from "@/lib/inventions";
import { renderPaperPdf } from "@/lib/pdf";

/**
 * Static PDF endpoint: `/inventions/<slug>/paper.pdf`.
 *
 * The route is generated at build time for every registered paper
 * (`force-static` plus `generateStaticParams`), so the download is a plain
 * static asset with an immutable cache header. The body is built from the
 * same paper data as the HTML page, which keeps the two in sync.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return INVENTIONS.map((paper) => ({ slug: paper.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const paper = getInvention(slug);
  if (!paper) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const pdf = renderPaperPdf(toPdfDoc(paper));
  const body = pdf.buffer.slice(
    pdf.byteOffset,
    pdf.byteOffset + pdf.byteLength,
  ) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${paperFilename(paper)}"`,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
