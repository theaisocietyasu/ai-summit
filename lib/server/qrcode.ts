import QRCode from "qrcode";

export async function generateQRCodeDataURI(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 300,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}
