// app/api/uploadMetadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const metadata = await req.json();

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name: 'mood-metadata.json' },
        pinataContent: metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({ ipfsHash: response.data.IpfsHash });
  } catch (err: any) {
    console.error(err.response?.data || err);
    return NextResponse.json(
      { error: 'Failed to upload metadata to Pinata' },
      { status: 500 }
    );
  }
}
