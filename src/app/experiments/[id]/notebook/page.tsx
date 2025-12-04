"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import { useExperiment } from "@/hooks/useExperiments";

export default function NotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const { experiment, isLoading } = useExperiment(id);

  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [transcript, setTranscript] = useState("");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Initialize Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript + interimTranscript);
        };

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }

    // Load existing notes
    if (token && id) {
      fetch(`/api/experiments/${id}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.notes) {
            setNotes(data.notes);
          }
        })
        .catch(console.error);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [id, token, isAuthenticated, router]);

  const saveNotes = async (rawText?: string) => {
    if (!token || !id) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/experiments/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes,
          rawText,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save notes");
      }

      const data = await res.json();
      if (data.structuredProtocol) {
        // Could show a notification or update the protocol
        console.log("Structured protocol:", data.structuredProtocol);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Autosave on notes change
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      if (notes.trim() && token && id) {
        saveNotes();
      }
    }, 2000); // Autosave after 2 seconds of inactivity

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, token, id]);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech recognition not supported in your browser");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      // Append transcript to notes
      if (transcript.trim()) {
        setNotes((prev) => prev + (prev ? "\n\n" : "") + transcript);
        setTranscript("");
        // Trigger ML transformation
        saveNotes(transcript);
      }
    } else {
      recognition.start();
      setIsRecording(true);
      setTranscript("");
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            ← Back
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Experiment Notebook
              </h1>
              {isSaving && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Saving...
                </span>
              )}
            </div>

            {experiment && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {experiment.title}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Notes
                </label>
                <button
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isRecording
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {isRecording ? "⏹ Stop Recording" : "🎤 Start Voice Input"}
                </button>
              </div>

              {isRecording && transcript && (
                <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-200">
                  <strong>Listening:</strong> {transcript}
                </div>
              )}

              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your experiment notes here... Use voice input for hands-free note-taking."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={20}
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Notes are automatically saved every 2 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Web Speech API types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}
