const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1S_gBBhZ8qP0dVZPSRR_buXqEXTVY_Y4qfjk6mLdZY07CMRD8zbpomqg5LowQI31Q/exec";

function resizeImageFile(file, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.readAsDataURL(blob);
        }, "image/jpeg", quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function beliTiket() {
  const msg = document.getElementById("msg");
  const btn = document.getElementById("btnBeli");

  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("email").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const file = document.getElementById("bukti").files[0];

  if (!nama || !email || !wa || !file) {
    msg.style.color = "#ff6b6b";
    msg.innerText = "❌ Lengkapi semua data & upload bukti transfer.";
    return;
  }

  btn.disabled = true;
  msg.style.color = "#fff";
  msg.innerText = "⏳ Mengirim data...";

  try {
    const dataUrl = await resizeImageFile(file);
    const base64 = dataUrl.split(",")[1];

    const params = new URLSearchParams({
      nama,
      email,
      wa,
      fileName: file.name.replace(/\s+/g, "_"),
      fileBase64: base64
    });

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      body: params
    });

    const result = await res.json();

    if (result.success) {
      msg.style.color = "#9be7a7";
      msg.innerText = "✅ Berhasil! Ticket ID: " + result.ticketId;
      btn.innerText = "Menunggu Validasi";
    } else {
      throw new Error(result.message);
    }

  } catch (err) {
    console.error(err);
    msg.style.color = "#ff6b6b";
    msg.innerText = "❌ Gagal mengirim data.";
    btn.disabled = false;
  }
}
