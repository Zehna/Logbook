import React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import {
  MONTH_NAMES,
  DAY_HEADERS,
  type CalendarDayCell,
  type CalendarData,
} from "@/src/lib/utils/calendarData";

interface CalendarTabSectionProps {
  activeDayCell: CalendarDayCell | null;
  calendarData: CalendarData;
  handleNextMonth: () => void;
  handlePrevMonth: () => void;
  onClose: () => void;
  onSelectDateToBackfill: (dateIso: string, formattedDateStr: string) => void;
  setSelectedDayCell: React.Dispatch<React.SetStateAction<CalendarDayCell | null>>;
  setViewMonth: React.Dispatch<React.SetStateAction<number>>;
  setViewYear: React.Dispatch<React.SetStateAction<number>>;
  viewMonth: number;
  viewYear: number;
}

export function CalendarTabSection({ activeDayCell, calendarData, handleNextMonth, handlePrevMonth, onClose, onSelectDateToBackfill, setSelectedDayCell, setViewMonth, setViewYear, viewMonth, viewYear }: CalendarTabSectionProps) {
  return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 7 Cols: Monthly Calendar Grid */}
              <div className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {calendarData.filledInMonth.length} hari terisi ·{" "}
                      {calendarData.missingWorkdaysInMonth.length} hari kerja belum diisi
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setViewYear(now.getFullYear());
                        setViewMonth(now.getMonth());
                      }}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      Bulan Ini
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
                  {DAY_HEADERS.map((d, i) => (
                    <div
                      key={d}
                      className={`text-[11px] font-semibold py-1 ${
                        i >= 5 ? "text-rose-500 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarData.cells.map((cell) => {
                    const isFilled = Boolean(cell.matchedEntry);
                    const isMissingWorkday =
                      cell.isCurrentMonth &&
                      !cell.isWeekend &&
                      !cell.holidayName &&
                      !cell.isFuture &&
                      !isFilled;

                    const isSelected = activeDayCell?.isoDate === cell.isoDate;

                    let cellStyle =
                      "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border-zinc-200/60 dark:border-zinc-800";
                    if (!cell.isCurrentMonth) {
                      cellStyle =
                        "opacity-35 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200/40 dark:border-zinc-800";
                    } else if (isFilled) {
                      cellStyle =
                        "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-semibold";
                    } else if (cell.holidayName) {
                      cellStyle =
                        "bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60";
                    } else if (isMissingWorkday) {
                      cellStyle =
                        "bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800/70 hover:bg-amber-100/80";
                    } else if (cell.isWeekend) {
                      cellStyle =
                        "bg-zinc-100/70 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-500 border-zinc-200/60 dark:border-zinc-800";
                    }

                    return (
                      <button
                        key={cell.isoDate}
                        type="button"
                        onClick={() => setSelectedDayCell(cell)}
                        className={`h-12 sm:h-14 rounded-lg border p-1.5 flex flex-col justify-between items-start transition cursor-pointer text-left relative ${cellStyle} ${
                          isSelected ? "ring-2 ring-zinc-900 dark:ring-zinc-100" : ""
                        }`}
                      >
                        <span className="text-xs font-mono tabular-nums leading-none">
                          {cell.dayNumber}
                        </span>
                        <div className="w-full flex items-center justify-between">
                          {isFilled ? (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 truncate">
                              Terisi
                            </span>
                          ) : cell.holidayName ? (
                            <span className="text-[9px] text-rose-600 dark:text-rose-400 truncate">
                              Libur
                            </span>
                          ) : isMissingWorkday ? (
                            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 truncate">
                              Kosong
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-400 truncate">
                              {cell.isWeekend ? "Akhir Pekan" : ""}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                    Logbook Terisi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
                    Hari Kerja Bolong (Perlu Ditambal)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 inline-block" />
                    Libur Nasional / Akhir Pekan
                  </span>
                </div>
              </div>

              {/* Right 5 Cols: Selected Day Inspector & Missing Workdays Quick Backfill List */}
              <div className="lg:col-span-5 space-y-4">
                {/* Selected Date Card */}
                {activeDayCell ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/60 dark:bg-zinc-900/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {activeDayCell.fullFormattedDate}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          ISO: {activeDayCell.isoDate}
                        </p>
                      </div>
                      {activeDayCell.matchedEntry ? (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Sudah Terisi (+8 Jam)
                        </span>
                      ) : activeDayCell.holidayName ? (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {activeDayCell.holidayName}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          Belum Ada Logbook
                        </span>
                      )}
                    </div>

                    {activeDayCell.matchedEntry ? (
                      <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 border-t border-zinc-200/80 dark:border-zinc-800 pt-2.5">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          Peran: {activeDayCell.matchedEntry.peran}
                        </p>
                        <p className="line-clamp-3 leading-relaxed">
                          {activeDayCell.matchedEntry.deskripsiKegiatan}
                        </p>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDateToBackfill(
                              activeDayCell.isoDate,
                              activeDayCell.fullFormattedDate
                            );
                            onClose();
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Isi / Tambal Logbook Tanggal Ini</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Missing Workdays List */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Deteksi Hari Kerja Bolong ({calendarData.missingWorkdaysInMonth.length} Hari)
                      </span>
                    </h4>
                  </div>

                  {calendarData.missingWorkdaysInMonth.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Tidak Ada Hari Kerja yang Terlewat!
                      </p>
                      <p>Seluruh hari kerja efektif pada bulan ini telah memiliki logbook.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {calendarData.missingWorkdaysInMonth.map((missing) => (
                        <div
                          key={missing.isoDate}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
                        >
                          <div>
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {missing.fullFormattedDate}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              Hari kerja efektif • Belum ada entri
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDateToBackfill(missing.isoDate, missing.fullFormattedDate);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[11px] font-semibold shrink-0 transition cursor-pointer"
                          >
                            Tambal
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
  );
}
