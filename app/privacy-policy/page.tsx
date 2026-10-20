import LegalPage from "@/components/legal-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Policy | Fresh2Cook" };

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Keeping your information safe is our responsibility. This policy explains what data we collect and why."
      current="/privacy-policy"
      sections={(s) => [
      { heading: "Information we collect", body: [["Name, mobile number, delivery address and pincode", "Order and payment details (Transaction ID/UTR)", "Account password (stored encrypted; nobody can read it)", "Location, only when you share it for delivery"]] },
      { heading: "How we use it", body: [["To deliver your orders and keep you updated", "For customer support and refunds", "For wallet and Refer & Earn rewards", "Anonymous analysis to improve our service"]] },
      { heading: "Who we share it with", body: ["Only the details needed for delivery (name, phone, address) are shown to the assigned rider. We never sell your data. It may be shared with government authorities when required by law."] },
      { heading: "Your rights", body: ["You can update your profile in My Account, and contact support to have your account or data deleted."] },
      { heading: "Cookies", body: ["We use essential cookies and browser storage to keep you logged in and remember your cart."] },
    ]}
    />
  );
}
