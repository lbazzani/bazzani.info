import { NextResponse } from 'next/server';
import twilio from 'twilio';
import prisma from '@/db'

export async function POST(req) {
    const { phone } = await req.json();

    if (!phone ) {
        return NextResponse.json({ error: "Missing phone " }, { status: 400 });
    
    }
    
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        const response = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
            to: `whatsapp:${phone}`,
            channel: "whatsapp",
        });

        return NextResponse.json({ success: true, sid: response.sid });
    } catch (error) {
        console.error("Errore invio verifica:", error);
        return NextResponse.json({ error: "Failed to send verification" }, { status: 500 });
    }
}