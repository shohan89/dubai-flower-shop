import { getResolvedHomepageSections } from "@/services/homepage.service";
import { SectionRenderer } from "@/components/storefront/sections/section-renderer";

export default async function HomePage() {
  const sections = await getResolvedHomepageSections();

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.row.id} section={section} />
      ))}
    </div>
  );
}
