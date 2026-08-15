import React, { useState } from 'react';
import apiClient from '../api/client';
import DashboardLayout from '../components/layout/DashboardLayout';

import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Sparkles,
  Database,
  BarChart3,
  ShieldCheck,
  Clock3,
  ArrowUpRight,
  Users,
} from 'lucide-react';

const Reports = () => {
  const [loadingReport, setLoadingReport] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // --------------------------------------------------
  // GENERATE REPORT
  // --------------------------------------------------

  const generateReport = async (type) => {
    try {
      setLoadingReport(type);
      setMessage('');
      setError('');

      const response =
        await apiClient.get(
          `/reports/${type}`,
          {
            responseType: 'blob',
          }
        );

      const contentType =
        response.headers?.['content-type'] ||
        'application/octet-stream';

      const blob = new Blob(
        [response.data],
        {
          type: contentType,
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = url;

      const extension =
        type === 'csv'
          ? 'csv'
          : type === 'excel'
          ? 'xlsx'
          : 'pdf';

      const timestamp =
        new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:T]/g, '-');

      link.download =
        `attendance_report_${timestamp}.${extension}`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        `${type.toUpperCase()} report downloaded successfully.`
      );
    } catch (err) {
      console.error(
        `${type} report error:`,
        err
      );

      /*
       * Since the request uses responseType: 'blob',
       * backend error responses may also arrive as blobs.
       * Try to decode them before showing a generic message.
       */
      let backendMessage = '';

      try {
        if (
          err.response?.data instanceof Blob
        ) {
          const text =
            await err.response.data.text();

          const parsed =
            JSON.parse(text);

          backendMessage =
            parsed?.message ||
            parsed?.error ||
            '';
        }
      } catch {
        // Ignore blob parsing errors.
      }

      setError(
        backendMessage ||
          err.response?.data?.message ||
          `Failed to download ${type.toUpperCase()} report.`
      );
    } finally {
      setLoadingReport('');
    }
  };

  // --------------------------------------------------
  // REPORT CARD
  // --------------------------------------------------

  const reportCards = [
    {
      type: 'csv',
      title: 'CSV Report',
      subtitle:
        'Lightweight attendance data for spreadsheets, imports and external analysis.',
      icon: FileText,
      accent: 'emerald',
      badge: 'Data',
    },
    {
      type: 'excel',
      title: 'Excel Report',
      subtitle:
        'Structured attendance workbook for detailed academic review and analysis.',
      icon: FileSpreadsheet,
      accent: 'blue',
      badge: 'Analysis',
    },
    {
      type: 'pdf',
      title: 'PDF Report',
      subtitle:
        'Presentation-ready attendance report for sharing, printing and documentation.',
      icon: FileText,
      accent: 'rose',
      badge: 'Document',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e17] text-gray-200">

      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-blue-600/[0.08] blur-3xl" />

        <div
          className="absolute right-0 top-1/3 h-[28rem] w-[28rem] animate-pulse rounded-full bg-indigo-600/[0.07] blur-3xl"
          style={{
            animationDelay: '1s',
          }}
        />

        <div
          className="absolute bottom-0 left-1/3 h-80 w-80 animate-pulse rounded-full bg-cyan-500/[0.05] blur-3xl"
          style={{
            animationDelay: '2s',
          }}
        />

      </div>

      <DashboardLayout>

        <div className="relative">

          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="mb-8">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
                    Report Center
                  </span>

                </div>

                <h1 className="text-4xl font-black tracking-tight text-white">

                  Attendance

                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    Reports
                  </span>

                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                  Generate professional attendance reports directly from your
                  database and export them in the format you need.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={17}
                      className="text-emerald-400"
                    />

                    <div>

                      <p className="text-[10px] uppercase tracking-wider text-gray-600">
                        Data Source
                      </p>

                      <p className="text-xs font-semibold text-emerald-400">
                        Live Database
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </header>

          {/* ==================================================
              STATUS
          ================================================== */}

          {message && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05]">

              <div className="flex items-center gap-4 p-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">

                  <CheckCircle
                    size={19}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold text-emerald-400">
                    Report Ready
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-400/60">
                    {message}
                  </p>

                </div>

              </div>

            </div>
          )}

          {error && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.05]">

              <div className="flex items-center gap-4 p-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">

                  <AlertCircle
                    size={19}
                    className="text-red-400"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold text-red-400">
                    Report Generation Failed
                  </p>

                  <p className="mt-0.5 text-xs text-red-400/60">
                    {error}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              HERO CARD
          ================================================== */}

          <div className="relative mb-5 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/[0.07] blur-3xl" />

            <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-indigo-500/[0.05] blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 ring-1 ring-blue-500/20">

                  <Database
                    size={25}
                    className="text-blue-400"
                  />

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                    Centralized Export
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    Generate from verified attendance data
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                    Every report is generated from the current attendance
                    records available to your account.
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.025] px-4 py-3">

                <Clock3
                  size={16}
                  className="text-gray-500"
                />

                <span className="text-xs text-gray-500">
                  Ready for export
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              REPORT CARDS
          ================================================== */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {reportCards.map(
              ({
                type,
                title,
                subtitle,
                icon: Icon,
                accent,
                badge,
              }) => {

                const isLoading =
                  loadingReport === type;

                const accentClasses = {
                  emerald: {
                    iconBg:
                      'bg-emerald-500/10',
                    icon:
                      'text-emerald-400',
                    glow:
                      'bg-emerald-500/[0.06]',
                    border:
                      'hover:border-emerald-500/20',
                    button:
                      'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20',
                  },

                  blue: {
                    iconBg:
                      'bg-blue-500/10',
                    icon:
                      'text-blue-400',
                    glow:
                      'bg-blue-500/[0.06]',
                    border:
                      'hover:border-blue-500/20',
                    button:
                      'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20',
                  },

                  rose: {
                    iconBg:
                      'bg-rose-500/10',
                    icon:
                      'text-rose-400',
                    glow:
                      'bg-rose-500/[0.06]',
                    border:
                      'hover:border-rose-500/20',
                    button:
                      'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20',
                  },
                };

                const style =
                  accentClasses[
                    accent
                  ];

                return (
                  <div
                    key={type}
                    className={`group relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${style.border}`}
                  >

                    <div
                      className={`absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl ${style.glow}`}
                    />

                    <div className="relative">

                      <div className="mb-7 flex items-start justify-between">

                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${style.iconBg}`}
                        >

                          <Icon
                            size={25}
                            className={style.icon}
                          />

                        </div>

                        <span className="rounded-full border border-white/[0.05] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                          {badge}
                        </span>

                      </div>

                      <h2 className="text-xl font-bold text-white">
                        {title}
                      </h2>

                      <p className="mt-3 min-h-[48px] text-sm leading-6 text-gray-600">
                        {subtitle}
                      </p>

                      <div className="my-6 h-px bg-white/[0.05]" />

                      <div className="flex items-center gap-2 text-xs text-gray-600">

                        <Sparkles
                          size={14}
                          className={style.icon}
                        />

                        Generated from live attendance data

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          generateReport(
                            type
                          )
                        }
                        disabled={
                          loadingReport !==
                          ''
                        }
                        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${style.button}`}
                      >

                        {isLoading ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />

                            Generating report...
                          </>
                        ) : (
                          <>
                            <FileDown
                              size={18}
                            />

                            Generate {type.toUpperCase()}
                          </>
                        )}

                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* ==================================================
              INCLUDED DATA
          ================================================== */}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">

            {/* Data scope */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] xl:col-span-8">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <BarChart3
                      size={19}
                      className="text-blue-400"
                    />

                    <h3 className="font-semibold text-white">
                      Included Data
                    </h3>

                  </div>

                  <p className="mt-1 text-xs text-gray-600">
                    Information included in generated reports
                  </p>

                </div>

                <span className="rounded-full border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Verified
                </span>

              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                {[
                  {
                    label: 'Student ID',
                    description:
                      'Unique student identifier',
                    icon: Users,
                  },
                  {
                    label: 'Student Name',
                    description:
                      'Registered student name',
                    icon: ShieldCheck,
                  },
                  {
                    label: 'Department',
                    description:
                      'Academic department',
                    icon: Database,
                  },
                  {
                    label: 'Attendance %',
                    description:
                      'Calculated attendance rate',
                    icon: BarChart3,
                  },
                ].map(
                  ({
                    label,
                    description,
                    icon: Icon,
                  }) => (
                    <div
                      key={label}
                      className="group rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.035]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                          <Icon
                            size={17}
                            className="text-blue-400"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-white">
                            {label}
                          </p>

                          <p className="mt-1 text-[11px] text-gray-600">
                            {description}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* Export info */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#171c27]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] xl:col-span-4">

              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-500/[0.05] blur-3xl" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10">

                  <Download
                    size={20}
                    className="text-cyan-400"
                  />

                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Export Workflow
                </p>

                <h3 className="mt-2 text-xl font-bold text-white">
                  Ready to share
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Choose the format that best matches your academic,
                  administrative or presentation needs.
                </p>

                <div className="mt-6 space-y-2">

                  {[
                    'CSV for raw data',
                    'Excel for analysis',
                    'PDF for presentation',
                  ].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >

                        <CheckCircle
                          size={14}
                          className="text-emerald-400"
                        />

                        {item}

                      </div>
                    )
                  )}

                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gray-700">

                  <ArrowUpRight
                    size={13}
                  />

                  Instant browser download

                </div>

              </div>

            </div>

          </div>

        </div>

      </DashboardLayout>
    </div>
  );
};

export default Reports;