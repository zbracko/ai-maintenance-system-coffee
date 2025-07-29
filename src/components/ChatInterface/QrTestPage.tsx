import React, { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrTestDebug() {
  useEffect(() => {
    console.log("[QrTestDebug] useEffect started.");
    const containerId = "test-qr-reader";

    // 1) Check if the <div> exists
    const testEl = document.getElementById(containerId);
    if (!testEl) {
      console.error(`[QrTestDebug] #${containerId} NOT found in DOM!`);
      return; // This will cause the "null is not an object" if you proceed
    } else {
      console.log("[QrTestDebug] Found element:", testEl);
    }

    // 2) Create scanner
    const html5QrCode = new Html5Qrcode(containerId);
    console.log("[QrTestDebug] Html5Qrcode instance created.");

    // 3) Start scanning
    Html5Qrcode.getCameras()
      .then((devices) => {
        console.log("[QrTestDebug] getCameras() =>", devices);
        if (!devices.length) throw new Error("No cameras found");
        return html5QrCode.start(
          devices[0].id,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            console.log("[QrTestDebug] SCANNED CODE:", decodedText);
          }
        );
      })
      .catch((err) => {
        console.error("[QrTestDebug] Error starting scanner:", err);
      });

    // 4) Cleanup
    return () => {
      console.log("[QrTestDebug] Cleanup: stopping scanner...");
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch((err) =>
          console.error("[QrTestDebug] Failed to stop scanner:", err)
        );
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>QrTestDebug</h2>
      {/* MUST match the containerId you used above */}
      <div
        id="test-qr-reader"
        style={{
          width: 320,
          height: 320,
          margin: "0 auto",
          border: "1px solid #000",
        }}
      />
    </div>
  );
}
