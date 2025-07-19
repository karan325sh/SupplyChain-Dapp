# 📦 Supply Chain Tracker DApp

A decentralized application (DApp) to track products through the supply chain using smart contracts on the Ethereum blockchain. Built using **Solidity**, **Foundry**, **React.js**, and **Ethers.js v6**.

---

## 🚀 Features

- Track products through **Manufacturing → Shipping → Receiving → Sale**
- Each product's state is stored and verified on-chain
- Roles: **Manufacturer**, **Distributor**, **Retailer**
- Real-time interaction using MetaMask and Ethereum testnet (Sepolia)

---

## 🛠 Tech Stack

- **Solidity** – Smart contract logic
- **Foundry** – For compiling, testing, and deploying
- **React.js** – Frontend interface
- **Ethers.js v6** – Web3 integration
- **MetaMask** – Wallet and transaction signing
- **Sepolia** – Testnet for deployment

---

## 📁 Project Structure

```
root/
├── contracts/               # Solidity contract (tracking.sol)
├── script/                  # Foundry deployment script
├── test/                    # Foundry test cases
├── frontend/
│   ├── src/
│   │   ├── App.js           # React app logic
│   │   ├── TrackingABI.json # ABI for contract interaction
│   └── .env                 # Contains REACT_APP_CONTRACT_ADDRESS
```

---

## 🔧 Installation & Setup

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/supplychain-tracker.git
cd supplychain-tracker
```

### 2. Install Foundry (if not installed)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 3. Compile & Deploy Smart Contract

```bash
forge build
forge script script/DeployTracking.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast -vv
```

> ✅ Contract will be deployed to Sepolia and address printed in terminal.

### 4. Configure `.env` for Frontend

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### 5. Run Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Testing

Tests written using Foundry:

```bash
forge test
```

Includes:
- ✅ Success tests for product lifecycle
- ❌ Revert tests for wrong users or wrong states

---

## 👨‍💻 Functionality Walkthrough

1. **Connect Wallet** using MetaMask
2. **Manufacture Product** → Generates new product ID
3. **Set Participants** → Assign distributor and retailer
4. **Ship Product** → Only distributor can ship
5. **Receive Product** → Only retailer can receive
6. **Sell Product** → Final step of the product
7. **Get Product Info** → Shows full history & current state

---

## 🖼 Frontend UI Highlights

- 📦 Manufacture Button
- 🧾 Input Fields for Product ID, Distributor, Retailer
- 🚚 Buttons to Ship, Receive, Sell product
- 📊 Display Product Info with State Timeline

---

## 📄 Contract Overview (Solidity)

```solidity
function manufactureProduct(string memory _name) public returns (uint256);
function setParticipants(uint256 id, address distributor, address retailer) public;
function shipProduct(uint256 id) public;
function receiveProduct(uint256 id) public;
function sellProduct(uint256 id) public;
function getProduct(uint256 id) public view returns (...);
```

---

## 📜 License

This project is open source under the [MIT License](LICENSE).

---

## 🙏 Credits

Developed by **Karan Sharma** as a blockchain learning project using Foundry, Solidity, and React.
