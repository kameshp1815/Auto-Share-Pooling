import React from "react";

export default function SOS() {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [loc, setLoc] = React.useState(null);
  const [error, setError] = React.useState("");

  const getLocation = async () => {
    setError("");
    setBusy(true);
    try {
      await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          setError("Geolocation not supported");
          return resolve();
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const url = `https://maps.google.com/?q=${latitude},${longitude}`;
            setLoc({ latitude, longitude, url });
            resolve();
          },
          (err) => {
            setError(err.message || "Location unavailable");
            resolve();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!loc?.url) return;
    try { await navigator.clipboard.writeText(loc.url); } catch {}
  };

  return (
    <>
      <button
        aria-label="SOS"
        className="fixed bottom-6 right-6 z-50 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-2xl w-14 h-14 text-lg font-extrabold focus:outline-none focus:ring-4 focus:ring-red-300"
        onClick={() => setOpen(true)}
      >
        SOS
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6">
            <h2 className="text-xl font-extrabold text-red-600 mb-2">Emergency Assistance</h2>
            <p className="text-gray-600 mb-4">Use only if you feel unsafe or need urgent help.</p>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <div className="space-y-3">
              <a
                href="tel:112"
                className="block text-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
              >
                Call Emergency (112)
              </a>

              <button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl"
                onClick={getLocation}
                disabled={busy}
              >
                {busy ? "Getting location..." : "Get Current Location"}
              </button>

              {loc?.url && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <div className="text-sm text-gray-800 break-all mb-2">{loc.url}</div>
                  <div className="flex gap-2">
                    <a
                      href={loc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                    >
                      Open in Maps
                    </a>
                    <button
                      onClick={copyLink}
                      className="px-4 bg-gray-800 hover:bg-black text-white font-semibold rounded-lg"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
