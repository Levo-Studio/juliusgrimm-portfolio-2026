import { Homepage } from "@/components/sections/homepage";

export const dynamic = "force-dynamic";

export default async function Page(): Promise<React.JSX.Element> {
  return <Homepage />;
}
