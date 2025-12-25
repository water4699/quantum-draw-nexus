"use client";

import { useFhevm } from "@/fhevm/useFhevm";
import { useLuckyDraw } from "@/hooks/useLuckyDraw";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { errorNotDeployed } from "./ErrorNotDeployed";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useParticipantNames } from "@/hooks/useParticipantNames";

const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const DrawPage = () => {
  const { storage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const luckyDraw = useLuckyDraw({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage: storage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const { getParticipantName, getAllParticipantNames } = useParticipantNames();
  const [showDecryption, setShowDecryption] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  const winnerFingerprint =
    luckyDraw.winnerNameClear?.clear !== undefined
      ? luckyDraw.winnerNameClear.clear.toString()
      : undefined;

  const winnerIndex =
    luckyDraw.winnerIndexClear?.clear !== undefined
      ? luckyDraw.winnerIndexClear.clear.toString()
      : undefined;

  // Find winner name when decrypted
  useEffect(() => {
    if (winnerFingerprint && luckyDraw.participants.length > 0) {
      // First try to find by fingerprint
      const name = getParticipantName(BigInt(winnerFingerprint));
      if (name) {
        setWinnerName(name);
        setShowDecryption(true);
      } else {
        // If name not found by fingerprint, try to find by account
        const winnerParticipant = luckyDraw.participants.find(
          (p) => p.account.toLowerCase() === luckyDraw.winnerAccount?.toLowerCase()
        );
        if (winnerParticipant) {
          // Try to get name from all stored names
          const allNames = getAllParticipantNames();
          const foundName = allNames[winnerParticipant.account];
          if (foundName) {
            setWinnerName(foundName);
            setShowDecryption(true);
          } else {
            // Name not found, but we have decrypted data
            setWinnerName(null);
            setShowDecryption(true);
          }
        } else {
          setWinnerName(null);
          setShowDecryption(true);
        }
      }
    } else if (winnerIndex !== undefined || winnerFingerprint !== undefined) {
      // We have some decrypted data but no fingerprint match
      setShowDecryption(true);
    } else {
      setShowDecryption(false);
      setWinnerName(null);
    }
  }, [winnerFingerprint, winnerIndex, luckyDraw.participants, luckyDraw.winnerAccount, getParticipantName, getAllParticipantNames]);

  const handleDecrypt = async () => {
    setShowDecryption(false);
    setWinnerName(null);
    await luckyDraw.decryptWinner();
  };

  if (!isConnected) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-12 grid w-full max-w-3xl gap-6 rounded-3xl border border-white/10 bg-white/10 p-12 text-center shadow-xl backdrop-blur"
      >
        <h2 className="text-3xl font-semibold text-white">Connect Your Wallet</h2>
        <p className="text-base text-white/80">
          Use the Rainbow wallet button in the top-right corner to connect before participating in the encrypted lucky
          draw.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={connect}
          className="mx-auto inline-flex items-center justify-center rounded-full bg-white/90 px-6 py-3 text-sm font-medium uppercase tracking-wide text-gray-900 shadow-lg transition hover:bg-white"
        >
          Detect MetaMask
        </motion.button>
      </motion.section>
    );
  }

  if (!luckyDraw.isDeployed) {
    return errorNotDeployed(chainId);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full flex-col gap-8"
    >
      <motion.header
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/70 via-indigo-600/60 to-sky-500/60 p-[1px] shadow-2xl"
      >
        <div className="rounded-[23px] bg-slate-950/70 p-10 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200/70">Encrypted Winner</p>
              <h1 className="mt-2 text-4xl font-semibold text-white md:text-5xl">Draw & Decrypt</h1>
              <p className="mt-4 max-w-xl text-base text-slate-200/80">
                Once a winner is drawn, decrypt the encrypted index and fingerprint locally with your wallet keys.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-100 shadow-inner">
              <ul className="space-y-2 font-mono">
                <li>
                  <span className="text-slate-400">Chain:</span> {chainId ? `#${chainId}` : "unknown"}
                </li>
                <li>
                  <span className="text-slate-400">Account:</span>{" "}
                  {accounts && accounts.length > 0
                    ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
                    : "not detected"}
                </li>
                <li>
                  <span className="text-slate-400">FHE Runtime:</span>{" "}
                  {fhevmStatus === "ready" ? "ready" : fhevmStatus}
                </li>
                {fhevmError && <li className="text-red-300">FHE Error: {fhevmError.message}</li>}
              </ul>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-xl backdrop-blur"
        >
          <h2 className="text-xl font-semibold text-white">Draw Winner</h2>
          <p className="mt-2 text-sm text-slate-300/70">
            Select a random encrypted winner from all registered participants.
          </p>
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={luckyDraw.drawWinner}
              disabled={!luckyDraw.canDraw}
              className={clsx(
                "w-full rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-white",
                !luckyDraw.canDraw && "cursor-not-allowed opacity-40"
              )}
            >
              {luckyDraw.isDrawing ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    🎲
                  </motion.span>
                  Selecting...
                </span>
              ) : (
                "Draw Winner"
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-xl backdrop-blur"
        >
          <h2 className="text-xl font-semibold text-white">Encrypted Winner Data</h2>
          <p className="mt-2 text-sm text-slate-300/70">
            Decrypt the winner information using your wallet keys.
          </p>
          
          {/* Encrypted Data Section */}
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-slate-300/80 mb-3">🔒 Encrypted Data (On-Chain)</h3>
              <div className="space-y-2 text-xs text-slate-400">
                <p>
                  <span className="text-slate-500">Winner Account:</span>{" "}
                  <span className="font-mono text-slate-300">
                    {luckyDraw.winnerAccount ? formatAddress(luckyDraw.winnerAccount) : "Not drawn yet"}
                  </span>
                </p>
                {luckyDraw.winnerIndexHandle && (
                  <p className="break-all">
                    <span className="text-slate-500">Encrypted Index:</span>{" "}
                    <span className="font-mono text-slate-300/70">{luckyDraw.winnerIndexHandle}</span>
                  </p>
                )}
                {luckyDraw.winnerNameHandle && (
                  <p className="break-all">
                    <span className="text-slate-500">Encrypted Fingerprint:</span>{" "}
                    <span className="font-mono text-slate-300/70">{luckyDraw.winnerNameHandle}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Decrypted Data Section */}
            {winnerIndex !== undefined || winnerFingerprint !== undefined ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border-2 border-green-400/40 bg-green-400/10 p-4"
              >
                <h3 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <span>✅</span> Decrypted Result
                </h3>
                <div className="space-y-3">
                  {winnerIndex !== undefined && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-slate-300">Participant Position:</span>
                      <span className="text-lg font-bold text-white">
                        #{Number(winnerIndex) + 1}
                      </span>
                    </div>
                  )}
                  {winnerFingerprint !== undefined && (
                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-slate-300 block mb-2">Winner Name:</span>
                      {winnerName ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300"
                        >
                          {winnerName}
                        </motion.span>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-yellow-300 text-sm">
                            ⚠️ Name not found in local storage
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            Fingerprint: {winnerFingerprint}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {luckyDraw.winnerAccount && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-slate-300">Wallet Address:</span>
                      <span className="text-sm font-mono text-sky-300">
                        {formatAddress(luckyDraw.winnerAccount)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-slate-400 text-sm">
                  {luckyDraw.winnerAccount ? "Click below to decrypt the winner information" : "Draw a winner first to see encrypted data"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleDecrypt}
              disabled={!luckyDraw.canDecryptWinner}
              className={clsx(
                "w-full rounded-full border border-sky-400/60 px-6 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20",
                !luckyDraw.canDecryptWinner && "cursor-not-allowed opacity-40"
              )}
            >
              {luckyDraw.isDecrypting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    🔓
                  </motion.span>
                  Decrypting...
                </span>
              ) : (
                "🔓 Decrypt Winner Data"
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDecryption && winnerName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative overflow-hidden rounded-3xl border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-400/30 via-orange-400/30 to-pink-400/30 p-8 shadow-2xl backdrop-blur"
          >
            {/* Animated background particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-300/40"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  scale: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            
            {/* Sparkle effects */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [1, 1.2, 1], rotate: 360 }}
              transition={{ delay: 0.3, duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute -top-4 -right-4 text-6xl"
            >
              🎉
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [1, 1.2, 1], rotate: -360 }}
              transition={{ delay: 0.4, duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute -bottom-4 -left-4 text-6xl"
            >
              ✨
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ delay: 0.5, duration: 1.5, repeat: Infinity, repeatDelay: 0.3 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20"
            >
              ⭐
            </motion.div>
            
            <div className="relative z-10 text-center">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl font-bold text-white mb-2"
              >
                🏆 Winner Revealed! 🏆
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                className="mt-6"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="text-xl text-slate-200/90 mb-4"
                >
                  The winner is:
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.8,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="mt-4 text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 via-pink-300 to-yellow-300 animate-shimmer"
                  style={{
                    backgroundSize: "200% auto",
                    animation: "shimmer 3s linear infinite",
                  }}
                >
                  {winnerName}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
                >
                  <p className="text-sm text-slate-300/70 mb-1">Winner Account:</p>
                  <p className="text-base font-mono text-sky-200">
                    {luckyDraw.winnerAccount ? formatAddress(luckyDraw.winnerAccount) : "N/A"}
                  </p>
                  {winnerIndex && (
                    <p className="text-xs text-slate-400 mt-2">Index: #{winnerIndex}</p>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

