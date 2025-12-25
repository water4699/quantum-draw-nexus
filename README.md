# Encrypted Lucky Draw

Encrypted Lucky Draw is an end-to-end MVP that demonstrates a privacy-preserving raffle powered by Zama’s Fully
Homomorphic Encryption Virtual Machine (FHEVM). Participants submit their names as encrypted fingerprints, the contract
selects a random encrypted index, and every participant can locally decrypt the winning entry without leaking any clear
text to the blockchain.

## Overview

This project implements a fully encrypted lottery system using Zama's FHEVM technology.

## Live Demo & Resources

- **🌐 Live Deployment**: [https://lotteryxa.vercel.app/](https://lotteryxa.vercel.app/)
- **🎥 Demo Video**: [Download lottery.mp4](lottery.mp4) (Project demonstration video)

## Key Capabilities

- **Homomorphic participant storage** – participant names are turned into 64-bit fingerprints and stored as `euint64`
  ciphertexts.
- **Encrypted drawing logic** – a random winner is drawn on-chain, while the encrypted index and fingerprint remain
  private.
- **RainbowKit wallet UX** – RainbowKit/Wagmi provide secure wallet connection and signature flows (Metamask,
  WalletConnect, Coinbase Wallet…).
- **React + Next.js dashboard** – a responsive UI shows registration status, encrypted winner data, and supports local
  decryption via the FHEVM relayer pipeline.

## Repository Layout

```
pro7/encrypted-lucky-draw
├── contracts/                    # EncryptedLuckyDraw.sol smart contract
├── deploy/                       # hardhat-deploy script
├── tasks/                        # task:register / task:draw / task:winner-* helpers
├── test/                         # Hardhat test suites (local + Sepolia-readonly)
├── frontend/                     # Next.js RainbowKit frontend
│   ├── app/                      # Next App Router pages, layout, providers
│   ├── components/               # React components (dashboard, error states…)
│   ├── hooks/                    # FHEVM + lucky draw hooks
│   ├── lib/                      # Wagmi/RainbowKit config
│   └── public/                   # Logos and favicon
└── deployments/                  # hardhat-deploy artifacts (localhost & sepolia)
```

## Prerequisites

- Node.js ≥ 20
- npm ≥ 8
- A browser wallet (MetaMask, Rabby…) to test the RainbowKit flow
- Optional: Sepolia RPC credentials for live network testing (`MNEMONIC`, `INFURA_API_KEY`)

## Smart Contract Workflow

1. Install dependencies

   ```bash
   npm install
   ```

2. Compile & test

   ```bash
   npm run compile
   npm run test             # runs local FHEVM mock tests
   ```

3. Deploy locally (Hardhat mock FHEVM)

   ```bash
   npx hardhat node         # terminal A
   npx hardhat deploy --network localhost   # terminal B
   ```

4. Deploy to Sepolia (optional)

   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat deploy --network sepolia
   ```

5. CLI helpers

   ```bash
   npx hardhat task:register --name "Alice"        # encrypts + registers Alice
   npx hardhat task:draw                           # draws a random encrypted winner
   npx hardhat task:winner-index                   # decrypt winner index (requires ACL)
   npx hardhat task:winner-name                    # decrypt winner fingerprint
   ```

## Frontend Workflow

1. Install UI dependencies

   ```bash
   cd frontend
   npm install
   ```

2. Generate ABI/address map (runs automatically on `npm run dev`, but available standalone)

   ```bash
   npm run genabi
   ```

3. Start the dashboard in mock mode (connects to local Hardhat FHEVM)

   ```bash
   npm run dev:mock
   ```

4. Browse to `http://localhost:3000` and:
   - connect your wallet using the RainbowKit button
   - register participants with human-friendly names
   - draw an encrypted winner and decrypt the result locally

## Testing Strategy

- `test/EncryptedLuckyDraw.ts` exercises the full encryption–draw–decryption loop in the mocked FHEVM environment.
- `test/EncryptedLuckyDrawSepolia.ts` is a read-only regression that ensures Sepolia deployments are discoverable and
  callable. It is skipped automatically when running on the mock network.

## Useful Scripts

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run compile`   | Compile contracts & regenerate typings         |
| `npm run test`      | Run unit tests (mock FHEVM + readonly Sepolia) |
| `npm run lint`      | Run ESLint (when required)                     |
| `npm run clean`     | Remove build artifacts and generated types     |
| `frontend/npm run dev:mock` | Run the Next.js app connected to the local mock node |

## Environment Variables

| Variable                        | Purpose                                    |
| ------------------------------- | ------------------------------------------ |
| `MNEMONIC`                      | Wallet seed phrase for deployments         |
| `INFURA_API_KEY` (or RPC URL)   | RPC provider for Sepolia                   |
| `NEXT_PUBLIC_WALLETCONNECT_ID`  | WalletConnect project id (RainbowKit)      |

If you do not set `NEXT_PUBLIC_WALLETCONNECT_ID`, a placeholder value is used for local development.

## Architecture Notes

- Contract permissions rely on FHE ACLs: every time a winner is drawn the encrypted index and fingerprint are authorised
  for all registered participants, enabling local decryption without revealing clear-text on-chain.
- The frontend leverages existing MetaMask hooks for FHE signing while RainbowKit handles multi-wallet connection UX.
- Encrypted names are deterministic fingerprints (`uint64`) derived from keccak-256; the clear input never leaves the
  browser.

## License

Licensed under the BSD-3-Clause-Clear License. See [LICENSE](LICENSE) for details.
