"use client";

import { useState, useEffect, useCallback } from "react";
import { keccak256, toUtf8Bytes } from "ethers";

const NAME_MASK = (1n << 64n) - 1n;
const STORAGE_KEY = "participant_names";

type ParticipantNameMap = Record<string, string>; // account -> name
type FingerprintNameMap = Record<string, string>; // fingerprint -> name

const fingerprintName = (name: string): bigint => {
  const hash = keccak256(toUtf8Bytes(name));
  return BigInt(hash) & NAME_MASK;
};

export const useParticipantNames = () => {
  const [namesByAccount, setNamesByAccount] = useState<ParticipantNameMap>({});

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNamesByAccount(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load participant names:", error);
    }
  }, []);

  const saveName = useCallback((account: string, name: string) => {
    setNamesByAccount((prev) => {
      const updated = { ...prev, [account]: name };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save participant name:", error);
      }
      return updated;
    });
  }, []);

  const getParticipantName = useCallback(
    (fingerprint: bigint): string | null => {
      // Search through stored names to find matching fingerprint
      for (const [account, name] of Object.entries(namesByAccount)) {
        const nameFingerprint = fingerprintName(name);
        if (nameFingerprint === fingerprint) {
          return name;
        }
      }
      return null;
    },
    [namesByAccount]
  );

  const getAllParticipantNames = useCallback((): ParticipantNameMap => {
    return namesByAccount;
  }, [namesByAccount]);

  return {
    saveName,
    getParticipantName,
    getAllParticipantNames,
  };
};

