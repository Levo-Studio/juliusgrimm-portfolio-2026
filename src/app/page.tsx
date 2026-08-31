import { Homepage } from "@/components/sections/homepage";
import { JsonLd } from "@/components/shared/json-ld";

export const dynamic = "force-dynamic";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Julius Grimm",
  url: "https://juliusgrimm.dev",
  image: "https://juliusgrimm.dev/jg_badge.png",
  jobTitle: "Full-stack Engineer",
  description:
    "Founder and full-stack engineer building polished web apps, internal tools, and self-hosted product systems.",
  email: "mailto:me@juliusgrimm.dev",
  worksFor: {
    "@type": "Organization",
    name: "Levo Studio",
    url: "https://levo-studio.com"
  },
  sameAs: [
    "https://github.com/justthatrandomcoder",
    "https://linkedin.com/in/julius-gr/",
    "https://www.instagram.com/justthatrandomcoder"
  ]
};

export default async function Page(): Promise<React.JSX.Element> {
  return (
    <>
      <JsonLd data={personSchema} />
      <Homepage />
    </>
  );
}
