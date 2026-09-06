import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#d97757',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 900 }}>Lokko Hub</div>
        <div style={{ fontSize: 36, marginTop: 16 }}>Vends tes produits locaux en quelques minutes.</div>
      </div>
    ),
    size,
  );
}
