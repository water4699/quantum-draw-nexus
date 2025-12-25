"use client";

import { useFhevm } from "@/fhevm/useFhevm";
import { useLuckyDraw } from "@/hooks/useLuckyDraw";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { motion } from "framer-motion";
import { useParticipantNames } from "@/hooks/useParticipantNames";

const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const ParticipantsPage = () => {
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

  const { getAllParticipantNames } = useParticipantNames();
  const participantNames = getAllParticipantNames();

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
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200/70">Participants</p>
              <h1 className="mt-2 text-4xl font-semibold text-white md:text-5xl">Encrypted Participants</h1>
              <p className="mt-4 max-w-xl text-base text-slate-200/80">
                All submitted fingerprints remain encrypted on-chain. Addresses are displayed for auditability only.
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
                <li>
                  <span className="text-slate-400">Total:</span> {luckyDraw.participants.length} participants
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-3xl border border-white/5 bg-slate-950/60 p-8 shadow-xl backdrop-blur"
      >
        <h2 className="text-xl font-semibold text-white mb-6">All Participants</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {luckyDraw.participants.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-sm text-slate-400 py-8"
            >
              No encrypted participants yet.
            </motion.p>
          ) : (
            luckyDraw.participants.map((participant, index) => {
              const name = participantNames[participant.account] || "Unknown";
              return (
                <motion.div
                  key={participant.index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-200/90 shadow-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">#{participant.index}</span>
                    <span className="text-xs text-sky-300/70">Encrypted</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 mb-1">Display Name:</p>
                    <p className="font-semibold text-white">{name}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Account:</p>
                    <p className="font-mono text-xs">{formatAddress(participant.account)}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

