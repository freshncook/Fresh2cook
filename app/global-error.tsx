"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            padding: 40,
            textAlign: "center",
          }}
        >
          <h2>Something went wrong</h2>

          <button
            onClick={() => reset()}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}




