Rider Step 2-6 Fix  (Order #37 flow)

कौन सी file कहाँ replace करनी है (पहले purani file का backup ले लें):

1. app/api/processing/orders/route.ts
   -> Steps 2 Prepare, 3 Cross Check, 4 Sticker, 5 Final Pack, 6 Invoice + Rider ka backend

2. components/orders-panel.tsx
   -> Processing Dashboard ka orders panel. Isko apni purani orders-panel.tsx
      (jo bhi folder me hai) ki jagah rakhein.

3. app/api/rider-my-tasks/route.ts
4. app/api/rider-dashboard/route.ts
   -> Step 6 ke baad rider ko order dikhne ke liye

5. app/rider-otp-page-fix/page.tsx
   -> Rider OTP page (jis page.tsx ka backup aapne bheja tha). Isme sirf tooti hui
      Hindi text theek ki gayi hai. Apne OTP page ke page.tsx ki jagah rakhein.

Replace karne ke baad dev server restart karein:  Ctrl+C  ->  npm run dev
