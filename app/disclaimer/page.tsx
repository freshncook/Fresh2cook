import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Disclaimer | Fresh2Cook" };

export default function Page() {
  return (
    <LegalPage
      title="Disclaimer"
      intro="Important information about the content on this website."
      current="/disclaimer"
      sections={(s) => [
      { heading: "Product images", body: ["Product photos are for reference only. Fresh produce naturally varies in size, colour and shape."] },
      { heading: "Weight", body: ["The weight of fresh produce may vary slightly (about ±5%)."] },
      { heading: "Health information", body: ["Any nutrition or health information is for general awareness only and is not medical advice."] },
      { heading: "External links", body: ["External links such as WhatsApp, Instagram and Facebook are governed by their own policies."] },
    ]}
    />
  );
}
