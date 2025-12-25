"use client";

import { useFhevm } from "@/fhevm/useFhevm";
import { useLuckyDraw } from "@/hooks/useLuckyDraw";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useParticipantNames } from "@/hooks/useParticipantNames";
import { errorNotDeployed } from "./ErrorNotDeployed";
import clsx from "clsx";
import { useState } from "react";
import { motion } from "framer-motion";

export const RegisterPage = () => {
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

  const [name, setName] = useState("");
  const { saveName } = useParticipantNames();

  const canSubmitName = name.trim().length > 1 && luckyDraw.canRegister;

  const handleRegister = async () => {
    if (!canSubmitName || !accounts || accounts.length === 0) return;
    const trimmedName = name.trim();
    await luckyDraw.registerParticipant(trimmedName);
    // Save the name associated with the account
    saveName(accounts[0], trimmedName);
    setName("");
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
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200/70">Register for the Draw</p>
              <h1 className="mt-2 text-4xl font-semibold text-white md:text-5xl">Encrypt & Join</h1>
              <p className="mt-4 max-w-xl text-base text-slate-200/80">
                Your name is fingerprinted locally, encrypted with the Zama FHEVM toolkit, and stored on-chain. Your
                privacy is preserved throughout the entire process.
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto w-full max-w-2xl rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-xl backdrop-blur"
      >
        <h2 className="text-2xl font-semibold text-white">Enter Your Display Name</h2>
        <p className="mt-2 text-sm text-slate-300/70">
          Your name will be fingerprinted and encrypted before being stored on-chain.
        </p>
        <div className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-200/80">
            Display Name
            <motion.input
              whileFocus={{ scale: 1.02 }}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alice Wonder"
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-sky-400/80 focus:bg-slate-900/70"
            />
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={!canSubmitName}
            onClick={handleRegister}
            className={clsx(
              "w-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition",
              !canSubmitName && "cursor-not-allowed opacity-40"
            )}
          >
            {luckyDraw.isRegistering ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⚙️
                </motion.span>
                Encrypting...
              </span>
            ) : (
              "Encrypt & Join"
            )}
          </motion.button>
          <p className="text-xs text-slate-300/70">
            At least two encrypted participants are required before a winner can be drawn.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

