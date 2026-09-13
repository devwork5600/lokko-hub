// The Push API requires applicationServerKey as raw bytes (Uint8Array), but
// VAPID public keys are generated and stored as URL-safe base64 strings.
// This converts one to the other — see the base64url → base64 padding/
// character-swap explanation this pairs with when reviewing the diff.
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
