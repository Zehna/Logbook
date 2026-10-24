"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  tooltipText?: string;
  mode?: "append" | "replace";
}

// Declarations for browser SpeechRecognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

export function VoiceDictationButton({
  onTranscript,
  className = "",
  tooltipText = "Diktekan dengan Suara (Bahasa Indonesia)",
  mode = "append",
}: VoiceDictationButtonProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "id-ID";

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }

        if (finalTranscript.trim()) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("Izin mikrofon ditolak oleh browser.");
        } else if (event.error === "no-speech") {
          // Tidak ada suara terdeteksi sementara
        } else {
          setErrorMessage(`Error dikte suara: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("SpeechRecognition init failed:", err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      toast.error("Browser Anda belum mendukung Web Speech API. Coba gunakan Google Chrome atau Microsoft Edge.");
      return;
    }

    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("SpeechRecognition start error:", err);
        try {
          recognitionRef.current.abort();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 150);
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? "Klik untuk menghentikan rekaman suara" : tooltipText}
        className={`relative inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 select-none ${
          isListening
            ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30 animate-pulse ring-2 ring-rose-300"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80"
        } ${className}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Merekam...</span>
            {/* Visual Wave Bars */}
            <span className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1 h-3.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Dikte Suara (id-ID)</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="absolute top-full left-0 mt-1 z-30 flex items-center gap-1 px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded shadow-md whitespace-nowrap">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
