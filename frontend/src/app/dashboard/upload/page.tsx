'use client';
// src/app/dashboard/upload/page.tsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle2, XCircle, Clock, ChevronDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useUploadFile, useUploads } from '@/hooks/use-data';
import { formatDateTime, MARKETPLACE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MARKETPLACES = [
  { id: 'GOFOOD',     label: 'GoFood',     color: 'bg-green-500',   hint: 'File Excel/CSV dari GoBiz' },
  { id: 'GRABFOOD',   label: 'GrabFood',   color: 'bg-emerald-500', hint: 'File Excel/CSV dari GrabMerchant' },
  { id: 'SHOPEEFOOD', label: 'ShopeeFood', color: 'bg-orange-500',  hint: 'File Excel/CSV dari ShopeeFood Partner' },
];

export default function UploadPage() {
  const [marketplace, setMarketplace]   = useState('GOFOOD');
  const [uploadDate,  setUploadDate]    = useState(new Date().toISOString().split('T')[0]);
  const [files,       setFiles]         = useState<File[]>([]);
  const [result,      setResult]        = useState<any>(null);
  const { mutateAsync: upload, isPending } = useUploadFile();
  const { data: history } = useUploads();

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!files.length) return;
    const results = [];
    for (const file of files) {
      const r = await upload({ file, marketplace, uploadDate });
      results.push({ file: file.name, ...r });
    }
    setResult(results);
    setFiles([]);
  };

  const selected = MARKETPLACES.find(m => m.id === marketplace)!;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-ink">Upload Laporan</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Download laporan dari marketplace lalu upload di sini. Sistem akan membaca dan menggabungkan data otomatis.
        </p>
      </div>

      {/* Step 1 — Pilih Marketplace */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          Pilih Marketplace
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {MARKETPLACES.map(m => (
            <button
              key={m.id}
              onClick={() => setMarketplace(m.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center',
                marketplace === m.id
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-stone-100 hover:border-stone-200',
              )}
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', m.color)}>
                <span className="text-white text-xs font-bold">{m.label[0]}</span>
              </div>
              <span className="text-xs font-semibold text-ink">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2">{selected.hint}</p>
      </div>

      {/* Step 2 — Tanggal laporan */}
      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">2</span>
          Tanggal Laporan
        </h2>
        <input
          type="date"
          value={uploadDate}
          onChange={e => setUploadDate(e.target.value)}
          className="input max-w-xs"
        />
      </div>

      {/* Step 3 — Upload file */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">3</span>
          Upload File
        </h2>

        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-brand-400 bg-brand-50'
              : 'border-stone-200 hover:border-brand-300 hover:bg-stone-50',
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn('w-8 h-8 mx-auto mb-3', isDragActive ? 'text-brand-500' : 'text-stone-300')} />
          {isDragActive ? (
            <p className="text-sm font-semibold text-brand-500">Lepas file di sini...</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-stone-600">Drag & drop file di sini</p>
              <p className="text-xs text-stone-400 mt-1">atau klik untuk memilih file</p>
              <p className="text-xs text-stone-300 mt-2">Format: .xlsx, .xls, .csv · Maks 10MB</p>
            </>
          )}
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-lg px-3 py-2">
                <FileSpreadsheet className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span className="text-sm text-stone-600 truncate flex-1">{f.name}</span>
                <span className="text-xs text-stone-400">{(f.size / 1024).toFixed(0)} KB</span>
                <button
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="text-stone-300 hover:text-red-400 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!files.length || isPending}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isPending ? 'Memproses...' : `Upload ${files.length > 0 ? `(${files.length} file)` : ''}`}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Hasil Upload</h2>
          {result.map((r: any, i: number) => (
            <div key={i} className="bg-stone-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-ink truncate">{r.file}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-white rounded-lg p-2 border border-stone-100">
                  <p className="font-bold text-ink">{r.rowsTotal}</p>
                  <p className="text-stone-400">Total Baris</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                  <p className="font-bold text-green-600">{r.rowsSuccess}</p>
                  <p className="text-green-500">Berhasil</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                  <p className="font-bold text-red-500">{r.rowsFailed}</p>
                  <p className="text-red-400">Gagal/Duplikat</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload History */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-ink mb-4">Riwayat Upload</h2>
        {!history?.data?.length ? (
          <p className="text-sm text-stone-400 text-center py-4">Belum ada riwayat upload</p>
        ) : (
          <div className="space-y-2">
            {history.data.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-stone-50 last:border-0">
                <StatusIcon status={u.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{u.filename}</p>
                  <p className="text-xs text-stone-400">
                    {MARKETPLACE_LABELS[u.marketplace]} · {formatDateTime(u.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-green-600">{u.rowsSuccess} ok</p>
                  {u.rowsFailed > 0 && <p className="text-xs text-red-400">{u.rowsFailed} gagal</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'SUCCESS')    return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
  if (status === 'FAILED')     return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
  return <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />;
}
