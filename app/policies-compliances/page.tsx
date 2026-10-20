import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Policies & Compliance | Fresh2Cook" };

export default function Page() {
  return (
    <LegalPage
      title="Policies & Compliance"
      intro="The food safety, hygiene and operating standards we follow."
      current="/policies-compliances"
      sections={(s) => [
      { heading: "Food safety & hygiene", body: [["Vegetables and fruits are washed in clean water and cut/packed in a clean area", "Packing staff wear gloves and hairnets", "Every order goes through a 5-step check (Prepare, Cross Check, Sticker, Final Pack, Invoice)"]] },
      { heading: "Delivery safety", body: [["A unique delivery OTP for every order", "Only verified and approved riders deliver", "Rider details are shown on the order tracking page"]] },
      { heading: "Payments", body: ["Payments are made by UPI; we do not store your card or bank details."] },
      { heading: "Grievances", body: ["For any complaint, WhatsApp or email us — we aim to reply within 48 hours."] },
    ]}
    />
  );
}
