"use client";

import React from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";

export interface AtsResumeEditableData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  summary: string;
  mitra: string;
  periode: string;
  bullets: string[];
  hardSkills: string;
  tools: string;
  softSkills: string;
  univ: string;
  prodi: string;
  tahun: string;
  ipk: string;
}

export interface AtsResumePreviewProps {
  data: AtsResumeEditableData;
  onDataChange: (patch: Partial<AtsResumeEditableData>) => void;
  targetRole: string;
  onTargetRoleChange: (value: string) => void;
  onAddBullet: () => void;
  onRemoveBullet: (index: number) => void;
  onUpdateBullet: (index: number, value: string) => void;
}

export const AtsResumePreview: React.FC<AtsResumePreviewProps> = ({
  data,
  onDataChange,
  targetRole,
  onTargetRoleChange,
  onAddBullet,
  onRemoveBullet,
  onUpdateBullet,
}) => {
  return (
  <div className="space-y-4">
    <div className="no-print p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>
          <strong>Mode Live Editing Aktif:</strong> Anda dapat mengedit langsung nama, kontak, ringkasan, dan poin peluru (bullet) di lembar kertas di bawah ini sebelum mengunduh.
        </span>
      </div>
      <button
        type="button"
        onClick={onAddBullet}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Tambah Poin STAR</span>
      </button>
    </div>

    {/* LEMBAR KERTAS A4 HARVARD CV */}
    <div
      id="harvard-cv-print-area"
      className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-300 text-slate-900 font-serif leading-normal transition-all"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* 1. Header Identitas */}
      <div className="text-center pb-3 border-b-2 border-slate-900">
        <input
          type="text"
          value={data.name}
          onChange={(e) => onDataChange({ name: e.target.value })}
          className="w-full text-center text-2xl sm:text-3xl font-extrabold uppercase tracking-wide bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-700 mt-2 font-sans">
          <input
            type="text"
            value={data.location}
            onChange={(e) => onDataChange({ location: e.target.value })}
            className="text-center w-36 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
          />
          <span>•</span>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => onDataChange({ phone: e.target.value })}
            className="text-center w-36 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
          />
          <span>•</span>
          <input
            type="text"
            value={data.email}
            onChange={(e) => onDataChange({ email: e.target.value })}
            className="text-center w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
          />
          <span>•</span>
          <input
            type="text"
            value={data.linkedIn}
            onChange={(e) => onDataChange({ linkedIn: e.target.value })}
            className="text-center w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none text-blue-700"
          />
        </div>
      </div>

      {/* 2. Professional Summary */}
      <div className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
          Professional Summary
        </h4>
        <textarea
          rows={3}
          value={data.summary}
          onChange={(e) => onDataChange({ summary: e.target.value })}
          className="w-full text-xs sm:text-sm leading-relaxed text-justify bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded p-1 focus:outline-none"
        />
      </div>

      {/* 3. Work Experience */}
      <div className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
          Professional Work Experience
        </h4>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm font-bold text-slate-900">
          <div className="flex items-center gap-1.5 flex-1">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => onTargetRoleChange(e.target.value)}
              className="font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-1/2"
            />
            <span>—</span>
            <input
              type="text"
              value={data.mitra}
              onChange={(e) => onDataChange({ mitra: e.target.value })}
              className="italic font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-1/2"
            />
          </div>
          <input
            type="text"
            value={data.periode}
            onChange={(e) => onDataChange({ periode: e.target.value })}
            className="text-right sm:w-44 font-normal text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none mt-1 sm:mt-0"
          />
        </div>

        {/* Bullet Points List */}
        <div className="mt-2.5 space-y-2">
          {data.bullets.map((bullet, idx) => (
            <div key={idx} className="group relative flex items-start gap-2">
              <span className="text-slate-800 font-bold mt-1 select-none">•</span>
              <textarea
                rows={2}
                value={bullet}
                onChange={(e) => onUpdateBullet(idx, e.target.value)}
                className="w-full text-xs sm:text-sm text-justify leading-relaxed bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded p-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onRemoveBullet(idx)}
                className="no-print opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                title="Hapus bullet ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Skills & Competencies */}
      <div className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
          Technical & Core Competencies
        </h4>
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-start gap-1">
            <span className="font-bold shrink-0">• Hard Skills:</span>
            <input
              type="text"
              value={data.hardSkills}
              onChange={(e) => onDataChange({ hardSkills: e.target.value })}
              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
            />
          </div>
          <div className="flex items-start gap-1">
            <span className="font-bold shrink-0">• Tools & Technologies:</span>
            <input
              type="text"
              value={data.tools}
              onChange={(e) => onDataChange({ tools: e.target.value })}
              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
            />
          </div>
          <div className="flex items-start gap-1">
            <span className="font-bold shrink-0">• Soft Skills:</span>
            <input
              type="text"
              value={data.softSkills}
              onChange={(e) => onDataChange({ softSkills: e.target.value })}
              className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5. Education */}
      <div className="mt-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
          Education
        </h4>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm">
          <input
            type="text"
            value={data.univ}
            onChange={(e) => onDataChange({ univ: e.target.value })}
            className="font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-full sm:w-2/3"
          />
          <input
            type="text"
            value={data.tahun}
            onChange={(e) => onDataChange({ tahun: e.target.value })}
            className="text-left sm:text-right font-normal text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-full sm:w-1/3"
          />
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 mt-1">
          <span>Bachelor Degree in</span>
          <input
            type="text"
            value={data.prodi}
            onChange={(e) => onDataChange({ prodi: e.target.value })}
            className="font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none flex-1"
          />
          <span>(IPK:</span>
          <input
            type="text"
            value={data.ipk}
            onChange={(e) => onDataChange({ ipk: e.target.value })}
            className="font-bold text-center w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
          />
          <span>)</span>
        </div>
      </div>
    </div>
  </div>
  );
};
