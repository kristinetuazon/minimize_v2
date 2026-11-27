import { appIcon } from "@/lib/icon";

export const dynamic = "force-static";

const VARIANTS = { "192": [192, 0.06], "512": [512, 0.06], maskable: [512, 0.16] } as const;

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const spec = VARIANTS[variant as keyof typeof VARIANTS];
  if (!spec) return new Response("Not found", { status: 404 });
  return appIcon(spec[0], spec[1]);
}
