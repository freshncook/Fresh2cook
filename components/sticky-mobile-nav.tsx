export default function StickyMobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-50">

      <a href="/">
        Home
      </a>

      <a href="/offers">
        Offers
      </a>

      <a href="/orders">
        Orders
      </a>

      <a href="/cart">
        Cart
      </a>

      <a href="/account">
        Account
      </a>

    </div>
  );
}

