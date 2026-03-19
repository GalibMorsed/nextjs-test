"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  HandCoins,
  Landmark,
  X,
} from "lucide-react";

interface SupportProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onSupportComplete: () => void;
}

export default function SupportProject({
  isOpen,
  onClose,
  onSupportComplete,
}: SupportProjectProps) {
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "online">("bank");
  const [copied, setCopied] = useState(false);

  const upiVpa = "morsedgalib982@oksbi";
  const payeeName = "Galib";
  const amount = "25";

  const qrCodeUrl = useMemo(() => {
    const transactionNote = encodeURIComponent(
      `Chai treat via ${paymentMethod === "bank" ? "e-Transfer" : "Online"}`,
    );
    const upiString = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${transactionNote}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;
  }, [paymentMethod]);

  const upiString = useMemo(() => {
    const transactionNote = encodeURIComponent(
      `Chai treat via ${paymentMethod === "bank" ? "e-Transfer" : "Online"}`,
    );
    return `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${transactionNote}`;
  }, [paymentMethod]);

  const handleCopyUpi = async () => {
    await navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const handleProcessPayment = () => {
    if (typeof window !== "undefined") {
      window.location.href = upiString;
    }

    onClose();
    onSupportComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-full rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 sm:max-w-md sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close support popup"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:ring-amber-400/20">
                <HandCoins className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200">
                I&apos;m Galib, and if NextNews feels useful to you, you can
                support the project with a small chai treat.
              </p>
              <div className="mx-auto w-full max-w-sm rounded-[30px] bg-slate-100 p-4 text-left ring-1 ring-slate-200/80 dark:bg-slate-950/70 dark:ring-slate-700/70">
                <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900/90 dark:ring-slate-700/80">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Galib Morsed
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        India
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {upiVpa}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleCopyUpi()}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-1 dark:ring-slate-700 dark:hover:bg-slate-700"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-950/80 dark:ring-1 dark:ring-slate-800">
                    <div className="flex flex-col items-center justify-center">
                      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                        Scan to pay via UPI
                      </p>
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-white">
                        <img
                          src={qrCodeUrl}
                          alt="UPI QR Code"
                          width={150}
                          height={150}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Payment method
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={clsx(
                          "rounded-xl border p-3 text-center transition-colors dark:shadow-sm",
                          paymentMethod === "bank"
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/12"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800",
                        )}
                      >
                        <div className="mb-1 flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300">
                          <Landmark className="h-4 w-4" />
                          {paymentMethod === "bank" && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          e-Transfer
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={clsx(
                          "rounded-xl border p-3 text-center transition-colors dark:shadow-sm",
                          paymentMethod === "online"
                            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/12"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800",
                        )}
                      >
                        <div className="mb-1 flex items-center justify-center text-slate-700 dark:text-slate-200">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          Online
                        </p>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-400/90 dark:text-slate-950 dark:hover:bg-emerald-300"
                  >
                    Process Payment
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
