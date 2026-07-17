import { supabase } from '../api/supabase';
import type {
  QRCode,
  QRCodeDownload,
  QRDownloadFormat,
  QRScanLog,
  DigitalPassport,
  PassportData,
  PassportVerificationStatus,
  Batch,
} from '../types';
import { VERIFY_BASE_URL } from '../constants';

// ─── HMAC-SHA256 Signing (Web Crypto API) ────────────────────────────

const SIGNING_SECRET = import.meta.env.VITE_QR_SIGNING_SECRET || 'farmerpay-qr-signing-secret-v1';

async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function checksum(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash + payload.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ─── QR Code Service ─────────────────────────────────────────────────

export const qrService = {
  async generateForBatch(batch: Batch): Promise<QRCode> {
    const verifyUrl = `${VERIFY_BASE_URL}/${batch.batchId}`;
    const timestamp = Date.now().toString();
    const payload = JSON.stringify({
      url: verifyUrl,
      batchId: batch.batchId,
      ts: timestamp,
    });

    const signature = await hmacSha256(payload, SIGNING_SECRET);
    const cs = checksum(payload + signature);

    // Invalidate any existing active QR codes for this batch
    await supabase
      .from('qr_codes')
      .update({ status: 'COMPROMISED', compromised_at: new Date().toISOString() })
      .eq('batch_id', batch.id)
      .eq('status', 'ACTIVE');

    // Get the next version number
    const { data: existing } = await supabase
      .from('qr_codes')
      .select('version')
      .eq('batch_id', batch.id)
      .order('version', { ascending: false })
      .limit(1);

    const version = (existing && existing.length > 0 ? existing[0].version : 0) + 1;

    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        batch_id: batch.id,
        batch_internal_id: batch.batchId,
        version,
        payload,
        signature,
        checksum: cs,
        verify_url: verifyUrl,
        status: 'ACTIVE',
      })
      .select('*')
      .single();

    if (error) throw error;
    return this.mapQRCode(data);
  },

  async getForBatch(batchId: string): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('batch_id', batchId)
      .eq('status', 'ACTIVE')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapQRCode(data) : null;
  },

  async getAllForBatch(batchId: string): Promise<QRCode[]> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('batch_id', batchId)
      .order('version', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((d) => this.mapQRCode(d));
  },

  async regenerate(batch: Batch): Promise<QRCode> {
    return this.generateForBatch(batch);
  },

  async verifyPayload(payload: string, signature: string, cs: string): Promise<boolean> {
    const expectedChecksum = checksum(payload + signature);
    if (expectedChecksum !== cs) return false;
    const expectedSignature = await hmacSha256(payload, SIGNING_SECRET);
    return signature === expectedSignature;
  },

  async logDownload(qrCodeId: string, batchId: string, format: QRDownloadFormat): Promise<void> {
    const userAgent = navigator.userAgent;
    const ipHash = await hmacSha256('anonymous', SIGNING_SECRET).then((h) => h.substring(0, 16));
    await supabase.from('qr_code_downloads').insert({
      qr_code_id: qrCodeId,
      batch_id: batchId,
      format,
      ip_hash: ipHash,
      user_agent: userAgent,
    });
  },

  async getDownloads(batchId: string): Promise<QRCodeDownload[]> {
    const { data, error } = await supabase
      .from('qr_code_downloads')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: d.id,
      qrCodeId: d.qr_code_id,
      batchId: d.batch_id,
      format: d.format,
      downloadedBy: d.downloaded_by,
      ipHash: d.ip_hash,
      userAgent: d.user_agent,
      createdAt: d.created_at,
    }));
  },

  async logScan(batchInternalId: string, qrCodeId?: string): Promise<void> {
    const userAgent = navigator.userAgent;
    const deviceType = /Mobile|Android|iPhone/.test(userAgent) ? 'Mobile' : 'Desktop';
    let browser = 'Unknown';
    if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edg/.test(userAgent)) browser = 'Edge';

    const ipHash = await hmacSha256(batchInternalId + Date.now(), SIGNING_SECRET).then((h) => h.substring(0, 16));

    await supabase.from('qr_scan_logs').insert({
      qr_code_id: qrCodeId ?? null,
      batch_internal_id: batchInternalId,
      device_type: deviceType,
      browser,
      ip_hash: ipHash,
      user_agent: userAgent,
    });
  },

  async getScanHistory(batchInternalId: string, limit = 50): Promise<QRScanLog[]> {
    const { data, error } = await supabase
      .from('qr_scan_logs')
      .select('*')
      .eq('batch_internal_id', batchInternalId)
      .order('scan_time', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((d) => ({
      id: d.id,
      qrCodeId: d.qr_code_id,
      batchInternalId: d.batch_internal_id,
      scanTime: d.scan_time,
      country: d.country,
      city: d.city,
      deviceType: d.device_type,
      browser: d.browser,
      ipHash: d.ip_hash,
      userAgent: d.user_agent,
      createdAt: d.created_at,
    }));
  },

  mapQRCode(data: Record<string, unknown>): QRCode {
    return {
      id: data.id as string,
      batchId: data.batch_id as string,
      batchInternalId: data.batch_internal_id as string,
      version: data.version as number,
      payload: data.payload as string,
      signature: data.signature as string,
      checksum: data.checksum as string,
      verifyUrl: data.verify_url as string,
      status: data.status as QRCode['status'],
      generatedBy: (data.generated_by as string) ?? null,
      compromisedAt: (data.compromised_at as string) ?? null,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  },
};

// ─── Passport Service ─────────────────────────────────────────────────

export const passportService = {
  async getPassport(batchId: string): Promise<DigitalPassport | null> {
    const { data, error } = await supabase
      .from('digital_passports')
      .select('*')
      .eq('batch_id', batchId)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapPassport(data) : null;
  },

  async getPassportByBatchCode(batchCode: string): Promise<DigitalPassport | null> {
    const { data, error } = await supabase
      .from('digital_passports')
      .select('*')
      .eq('batch_internal_id', batchCode)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapPassport(data) : null;
  },

  async createOrUpdate(batch: Batch): Promise<DigitalPassport> {
    const passportData = this.buildPassportData(batch);
    const verificationStatus = this.deriveVerificationStatus(batch);

    const { data, error } = await supabase
      .from('digital_passports')
      .upsert({
        batch_id: batch.id,
        batch_internal_id: batch.batchId,
        passport_data: passportData,
        verification_status: verificationStatus,
        last_updated: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return this.mapPassport(data);
  },

  buildPassportData(batch: Batch): PassportData {
    return {
      batchId: batch.id,
      batchInternalId: batch.batchId,
      product: batch.product
        ? {
            name: batch.product.name,
            scientificName: batch.product.scientificName ?? null,
            description: batch.product.description ?? null,
            category: batch.product.category?.name ?? null,
            imageUrl: batch.product.imageUrl ?? null,
          }
        : null,
      farm: batch.farm
        ? {
            name: batch.farm.name,
            address: batch.farm.address ?? null,
            district: batch.farm.district ?? null,
            state: batch.farm.state ?? null,
            country: batch.farm.country ?? 'Unknown',
            latitude: batch.farm.location?.latitude ?? null,
            longitude: batch.farm.location?.longitude ?? null,
            isOrganic: batch.farm.isOrganic ?? false,
          }
        : null,
      farmer: null,
      harvest: batch.harvest
        ? {
            harvestDate: batch.harvest.harvestDate,
            season: batch.harvest.season ?? null,
            weatherNotes: batch.harvest.weatherNotes ?? null,
            notes: batch.harvest.notes ?? null,
          }
        : null,
      quantity: batch.quantity,
      unit: batch.unit,
      status: batch.status,
      verificationStatus: this.deriveVerificationStatus(batch),
      currentHolder: null,
      images: batch.images ?? [],
      certifications: batch.certifications ?? [],
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    };
  },

  deriveVerificationStatus(batch: Batch): PassportVerificationStatus {
    if (batch.status === 'REJECTED') return 'REJECTED';
    if (batch.status === 'SUSPENDED') return 'SUSPENDED';
    if (batch.status === 'EXPIRED') return 'EXPIRED';
    if (batch.status === 'VERIFIED') return 'VERIFIED';
    return 'PENDING_VERIFICATION';
  },

  mapPassport(data: Record<string, unknown>): DigitalPassport {
    return {
      id: data.id as string,
      batchId: data.batch_id as string,
      batchInternalId: data.batch_internal_id as string,
      passportData: data.passport_data as PassportData,
      verificationStatus: data.verification_status as PassportVerificationStatus,
      lastUpdated: data.last_updated as string,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  },
};
