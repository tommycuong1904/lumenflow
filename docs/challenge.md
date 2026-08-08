# AI Instructions

Purpose:
- This file is the source of truth for official Stellar challenge requirements.

Current target:
- Level 2 – Yellow Belt
- Level 1 is completed and submitted.
- Level 3 is future scope.

Rules:
- Never modify official requirements unless the user explicitly provides an update.
- Read only the section for the active level.
- Do not read completed or future levels unless the task requires comparison or dependency context.
- Do not summarize requirements unless requested.

# Level 1 – White Belt Submission

## Overview

Your goal is to build your first working **Stellar dApp** on the **Stellar Testnet**.

This level focuses on the core fundamentals of Stellar development:

- Wallet integration
- Wallet balances
- XLM transactions

By completing this level, you will learn how to:

- Connect a Stellar wallet
- Fund a wallet on Testnet
- Display wallet balances correctly
- Send XLM transactions on Stellar Testnet
- Deploy a working application
- Publish the source code in a public GitHub repository

---

# Requirements

Your project **must include all of the following**.

## 1. Wallet Setup

- Set up the Freighter Wallet
- Use Stellar Testnet

---

## 2. Wallet Connection

Implement:

- Wallet Connect
- Wallet Disconnect

---

## 3. Balance Handling

Implement:

- Fetch connected wallet XLM balance
- Display balance clearly in the UI

---

## 4. Transaction Flow

Implement:

- Send an XLM transaction on Stellar Testnet
- Display transaction feedback

Feedback should include:

- Success state
- Failure state
- Transaction hash OR confirmation message

---

## 5. Development Standards

Project should demonstrate:

- Clean UI
- Wallet integration
- Balance fetching
- Transaction logic
- Error handling

---

# Suggested Project Ideas

Choose one or build your own (as long as all requirements are satisfied).

- Simple Payment dApp
  - Send XLM to any address

- Wallet Balance Checker
  - Display balances for multiple accounts

- Transaction History Viewer
  - Show recent wallet transactions

- Testnet Faucet Interface
  - Request testnet XLM with one click

- Tip Jar
  - Static donation page with QR code

- Split Bill Calculator
  - Calculate bill split and send payment

---

# Example Repositories

Use these examples as references.

- https://github.com/Halfgork/stellar-frontend-challenge
- https://github.com/cagatayok/stellar-frontend-challenge
- https://github.com/benmevic/stellar-airstellar
- https://github.com/senemeylulsat/stellarzoneylul
- https://github.com/talhaaydinn/stellar-frontend-challenge
- https://github.com/ensar-sencan/ticketverse-nft-platform

---

# Submission Checklist

Your submission must include:

- Public GitHub repository
- README.md

README.md must contain:

- Project description
- Local setup instructions
- Screenshots showing:
  - Connected wallet
  - Displayed balance
  - Successful Testnet transaction
  - Transaction result shown to the user

---

# Submission Notes

- Submit your public GitHub repository before the monthly deadline.
- You may submit at any time during the month.
- Earlier submissions are reviewed first.
- Estimated completion time: **~1 week**.


# Level 2 – Yellow Belt Submission

## Overview

Building on your White Belt skills, you will now integrate multiple wallets, deploy your first smart contract, and implement real-time event handling.

**Focus:** Multi-wallet integration, smart contract deployment, and real-time data synchronization.

### By completing this level, you will learn:

* StellarWalletsKit implementation
* Error handling (wallet not found, rejected, insufficient balance)
* Deploying a contract to the Testnet
* Calling contract functions from the frontend
* Reading and writing data to a contract
* Event listening and state synchronization
* Transaction status tracking (pending/success/fail)

At the end of the monthly review period, selected winners will receive a prize based on the quality of their submission, and each winner will receive **$10**.

---

## Requirements

Your project must include all items below to successfully complete Level 2.

* 3 error types handled
* Contract deployed on Testnet
* Contract called from the frontend
* Transaction status visible
* Minimum 2+ meaningful commits

**Deliverable:** Multi-wallet app with deployed contract and real-time event integration.

---

## Project Ideas

Choose one of these projects or propose your own as long as it meets the requirements. You can reach out to any of the DevRel team members.

* **Token Swap Interface** — Basic swap UI using Stellar DEX orderbook
* **NFT Minter** — Mint simple NFT with metadata and live status
* **Crowdfunding Page** — Collect donations with real-time progress
* **Real-time Auction** — Live bidding with event updates
* **Token Leaderboard** — Track and display token holders in real-time
* **Activity Feed** — Stream contract events as notifications
* **Live Poll** — One-question poll with real-time results
* **Payment Tracker** — Multi-address payments with status updates

---

## Submission Checklist

Ensure your project meets all requirements before submitting.

* Public GitHub repository
* README with setup instructions
* Minimum 2+ meaningful commits

### Required in README

* Live demo link (deployed on Vercel, Netlify, or similar) — optional
* Screenshot showing wallet options available
* Deployed contract address
* Transaction hash of a contract call (verifiable on Stellar Explorer)

Submit your GitHub repository link before the monthly deadline.

*You can submit anytime during the month. Earlier submissions will be reviewed first.*

# Level 3 – Orange Belt Submission

**Status:** Future scope. Do not use for current implementation decisions unless explicitly requested.

## Overview

I hope you enjoyed building during Level 1 & 2. Now it’s time to go deeper into smart contracts, production architecture, and real-world dApp development.

In this level, you will build a complete end-to-end Stellar dApp with advanced contract logic, testing, deployment, CI/CD, and production-ready infrastructure.

This level is focused on helping you move beyond beginner demos and start building applications that resemble real-world production products.

**Focus:** Advanced Smart Contracts + Production-Ready dApps

## Rewards

At the end of the monthly review period, selected winners will receive rewards based on the quality, complexity, and execution of their submission.

**Prize per selected winner: $50**

---

## Requirements

- Advanced smart contract development
- Inter-contract communication
- Event streaming & real-time updates
- CI/CD pipeline setup
- Smart contract deployment workflow
- Mobile responsive frontend development
- Error handling & loading states
- Writing tests for contracts and frontend
- Production-ready architecture practices
- Documentation & demo presentation

---

## Submission Checklist

Ensure your project meets all requirements before submitting.

### Required

- Public GitHub repository
- README with complete documentation
- Minimum 10+ meaningful commits
- Live demo link (Vercel, Netlify, or similar)
- Contract deployment address
- Transaction hash for contract interaction
- Screenshots showing:
  - Mobile responsive UI
  - CI/CD pipeline running
  - Test output with 3+ passing tests
- Demo video link (1–2 minutes)
