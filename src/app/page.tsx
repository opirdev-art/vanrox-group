import Hero from "@/components/home/Hero";
import Reviews from "@/components/home/Reviews";
import { getBusinessSettings } from "@/lib/settings/queries";

export default async function Home() {
  const settings = await getBusinessSettings();

  return (
    <>
      <Hero serviceArea={settings.address || undefined} />
      <Reviews />
    </>
  );
}
