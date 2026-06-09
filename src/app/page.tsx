import Hero from "@/components/home/Hero";
import { getBusinessSettings } from "@/lib/settings/queries";

export default async function Home() {
  const settings = await getBusinessSettings();

  return (
    <>
      <Hero serviceArea={settings.address || undefined} />
    </>
  );
}
