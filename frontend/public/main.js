let WALLET_CONNECTED = "";
// !!! IMPORTANT: Replace with YOUR DEPLOYED TRACKING CONTRACT ADDRESS !!!
let contractAddress = "0x5584C956Bd5124A52b062B95b79124aAAdf2c919"; // Example: "0x123...abc"

// This will be populated after fetching the ABI
let trackingContract;

// Enum for Solidity State (must match your contract's enum order)
const ProductState = {
    Manufactured: 0,
    Shipped: 1,
    Received: 2,
    Sold: 3
};

// --- Modal Functions ---
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    // Optionally clear previous feedback/inputs when opening
    const feedbackElement = document.querySelector(`#${modalId} .modal-feedback`);
    if (feedbackElement) {
        feedbackElement.innerHTML = "";
    }
    const inputElements = document.querySelectorAll(`#${modalId} input`);
    inputElements.forEach(input => input.value = ''); // Clear all inputs
    
    // For getProductDetailsModal, also clear displayed details
    if (modalId === 'getProductDetailsModal') {
        document.getElementById("displayId").textContent = "";
        document.getElementById("displayName").textContent = "";
        document.getElementById("displayManufacturer").textContent = "";
        document.getElementById("displayDistributor").textContent = "";
        document.getElementById("displayRetailer").textContent = "";
        document.getElementById("displayCurrentOwner").textContent = "";
        document.getElementById("displayCurrentState").textContent = "";
        document.getElementById("displayTimestamp").textContent = "";
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Function to load ABI and initialize contract
const loadContract = async () => {
    try {
        // !!! IMPORTANT: Ensure 'tracking.json' is copied to your frontend/public/ directory !!!
        // You get tracking.json from your Foundry project: artifacts/contracts/tracking.sol/tracking.json
        const response = await fetch('./tracking.json'); // Adjust path if tracking.json is in a subfolder within public
        const data = await response.json();
        
        // As discussed, this line assumes the ABI array is the direct content of your tracking.json
        const contractAbi = data; 
        
        // Initialize the contract once ABI is loaded
        if (window.ethereum) { // Check if Metamask is available
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            trackingContract = new ethers.Contract(contractAddress, contractAbi, signer);
            console.log("Tracking contract initialized:", trackingContract);
            // Update main notification here since contract is ready
            document.getElementById("mainNotification").innerHTML = "Metamask Connected. Contract Ready.";
        } else {
            console.error("Metamask not detected. Contract cannot be fully initialized.");
            document.getElementById("mainNotification").innerHTML = "Metamask not detected. Please install Metamask.";
        }
    } catch (error) {
        console.error("Error loading contract ABI or initializing contract:", error);
        document.getElementById("mainNotification").innerHTML = `Error loading ABI: ${error.message || error.code}`;
    }
};

// Call loadContract when the page loads
document.addEventListener('DOMContentLoaded', loadContract);


// --- Wallet Connection ---
const connectMetamask = async() => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            WALLET_CONNECTED = await signer.getAddress();
            document.getElementById("mainNotification").innerHTML = "Metamask Connected: " + WALLET_CONNECTED; // Update status immediately

            // Ensure contract is initialized with the correct signer
            if (!trackingContract || !trackingContract.signer || (await trackingContract.signer.getAddress()) !== WALLET_CONNECTED) {
                await loadContract(); // Re-load contract with signer if not already
            }
            if (trackingContract && !trackingContract.signer) { // If contract was initialized without signer, update it
                trackingContract = trackingContract.connect(signer);
            }
            console.log("Metamask connected and contract ready.");

        } catch (error) {
            console.error("Error connecting Metamask:", error);
            document.getElementById("mainNotification").innerHTML = `Error connecting Metamask: ${error.message || error.code}`;
        }
    } else {
        console.error("Metamask (window.ethereum) is not detected.");
        document.getElementById("mainNotification").innerHTML = "Metamask is not detected. Please install Metamask.";
    }
};


// --- Contract Interactions (Updated to use Modal Inputs) ---

// Manufacturer: manufactureProduct
const manufactureProductUI = async() => {
    if (!WALLET_CONNECTED || !trackingContract) {
        document.getElementById("manufactureFeedback").innerHTML = "Please connect Metamask first.";
        return;
    }
    const productName = document.getElementById("modalManufactureName").value; // Get from modal input
    if (!productName) {
        document.getElementById("manufactureFeedback").innerHTML = "Please enter a product name.";
        return;
    }

    document.getElementById("manufactureFeedback").innerHTML = "Manufacturing product... Please confirm in Metamask.";
    try {
        const tx = await trackingContract.manufactureProduct(productName);
        await tx.wait();
        document.getElementById("manufactureFeedback").innerHTML = `Product "${productName}" manufactured! Tx Hash: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash.substring(0, 10)}...</a>`;
        document.getElementById("modalManufactureName").value = ""; // Clear input
    } catch (error) {
        console.error("Error manufacturing product:", error);
        document.getElementById("manufactureFeedback").innerHTML = `Error: ${error.message || error.code}`;
    }
};

// Manufacturer: setParticipants
const setParticipantsUI = async() => {
    if (!WALLET_CONNECTED || !trackingContract) {
        document.getElementById("setParticipantsFeedback").innerHTML = "Please connect Metamask first.";
        return;
    }
    const productId = document.getElementById("modalSetParticipantsId").value;
    const distributorAddress = document.getElementById("modalDistributorAddress").value;
    const retailerAddress = document.getElementById("modalRetailerAddress").value;

    if (!productId || !distributorAddress || !retailerAddress) {
        document.getElementById("setParticipantsFeedback").innerHTML = "Please fill all fields.";
        return;
    }

    document.getElementById("setParticipantsFeedback").innerHTML = "Setting participants... Please confirm in Metamask.";
    try {
        const tx = await trackingContract.setParticipants(productId, distributorAddress, retailerAddress);
        await tx.wait();
        document.getElementById("setParticipantsFeedback").innerHTML = `Participants set for Product ID ${productId}! Tx Hash: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash.substring(0, 10)}...</a>`;
        document.getElementById("modalSetParticipantsId").value = "";
        document.getElementById("modalDistributorAddress").value = "";
        document.getElementById("modalRetailerAddress").value = "";
    } catch (error) {
        console.error("Error setting participants:", error);
        document.getElementById("setParticipantsFeedback").innerHTML = `Error: ${error.message || error.code}`;
    }
};

// Distributor: shipProduct
const shipProductUI = async() => {
    if (!WALLET_CONNECTED || !trackingContract) {
        document.getElementById("shipFeedback").innerHTML = "Please connect Metamask first.";
        return;
    }
    const productId = document.getElementById("modalShipProductId").value;
    if (!productId) {
        document.getElementById("shipFeedback").innerHTML = "Please enter Product ID.";
        return;
    }

    document.getElementById("shipFeedback").innerHTML = "Shipping product... Please confirm in Metamask.";
    try {
        const tx = await trackingContract.shipProduct(productId);
        await tx.wait();
        document.getElementById("shipFeedback").innerHTML = `Product ID ${productId} shipped! Tx Hash: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash.substring(0, 10)}...</a>`;
        document.getElementById("modalShipProductId").value = "";
    } catch (error) {
        console.error("Error shipping product:", error);
        document.getElementById("shipFeedback").innerHTML = `Error: ${error.message || error.code}`;
    }
};

// Retailer: receiveProduct
const receiveProductUI = async() => {
    if (!WALLET_CONNECTED || !trackingContract) {
        document.getElementById("receiveFeedback").innerHTML = "Please connect Metamask first.";
        return;
    }
    const productId = document.getElementById("modalReceiveProductId").value;
    if (!productId) {
        document.getElementById("receiveFeedback").innerHTML = "Please enter Product ID.";
        return;
    }

    document.getElementById("receiveFeedback").innerHTML = "Receiving product... Please confirm in Metamask.";
    try {
        const tx = await trackingContract.receiveProduct(productId);
        await tx.wait();
        document.getElementById("receiveFeedback").innerHTML = `Product ID ${productId} received! Tx Hash: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash.substring(0, 10)}...</a>`;
        document.getElementById("modalReceiveProductId").value = "";
    } catch (error) {
        console.error("Error receiving product:", error);
        document.getElementById("receiveFeedback").innerHTML = `Error: ${error.message || error.code}`;
    }
};

// Retailer: sellProduct
const sellProductUI = async() => {
    if (!WALLET_CONNECTED || !trackingContract) {
        document.getElementById("sellFeedback").innerHTML = "Please connect Metamask first.";
        return;
    }
    const productId = document.getElementById("modalSellProductId").value;
    if (!productId) {
        document.getElementById("sellFeedback").innerHTML = "Please enter Product ID.";
        return;
    }

    document.getElementById("sellFeedback").innerHTML = "Selling product... Please confirm in Metamask.";
    try {
        const tx = await trackingContract.sellProduct(productId);
        await tx.wait();
        document.getElementById("sellFeedback").innerHTML = `Product ID ${productId} sold! Tx Hash: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash.substring(0, 10)}...</a>`;
        document.getElementById("modalSellProductId").value = "";
    } catch (error) {
        console.error("Error selling product:", error);
        document.getElementById("sellFeedback").innerHTML = `Error: ${error.message || error.code}`;
    }
};

// Get Product Details
const getProductUI = async() => {
    if (!WALLET_CONNECTED || !trackingContract) {
        document.getElementById("getProductFeedback").innerHTML = "Please connect Metamask first.";
        return;
    }
    const productId = document.getElementById("modalGetProductId").value;
    if (!productId) {
        document.getElementById("getProductFeedback").innerHTML = "Please enter a Product ID.";
        // Clear previous details if ID is empty
        document.getElementById("displayId").textContent = "";
        document.getElementById("displayName").textContent = "";
        document.getElementById("displayManufacturer").textContent = "";
        document.getElementById("displayDistributor").textContent = "";
        document.getElementById("displayRetailer").textContent = "";
        document.getElementById("displayCurrentOwner").textContent = "";
        document.getElementById("displayCurrentState").textContent = "";
        document.getElementById("displayTimestamp").textContent = "";
        return;
    }

    document.getElementById("getProductFeedback").innerHTML = "Fetching product details...";
    try {
        const product = await trackingContract.getProduct(productId);
        console.log("Fetched product:", product);

        // Map the state enum number to a readable string
        const stateNames = ["Manufactured", "Shipped", "Received", "Sold"];
        const currentStateName = stateNames[product.currentState];

        document.getElementById("displayId").textContent = product.id.toString();
        document.getElementById("displayName").textContent = product.name;
        document.getElementById("displayManufacturer").textContent = product.manufacturer;
        document.getElementById("displayDistributor").textContent = product.distributor;
        document.getElementById("displayRetailer").textContent = product.retailer;
        document.getElementById("displayCurrentOwner").textContent = product.currentOwner;
        document.getElementById("displayCurrentState").textContent = currentStateName;
        document.getElementById("displayTimestamp").textContent = new Date(product.timestamp * 1000).toLocaleString();

        document.getElementById("getProductFeedback").innerHTML = `Details for Product ID ${productId} loaded.`;

    } catch (error) {
        console.error("Error getting product details:", error);
        document.getElementById("getProductFeedback").innerHTML = `Error: ${error.message || error.code}`;
        // Clear previous details on error
        document.getElementById("displayId").textContent = "";
        document.getElementById("displayName").textContent = "";
        document.getElementById("displayManufacturer").textContent = "";
        document.getElementById("displayDistributor").textContent = "";
        document.getElementById("displayRetailer").textContent = "";
        document.getElementById("displayCurrentOwner").textContent = "";
        document.getElementById("displayCurrentState").textContent = "";
        document.getElementById("displayTimestamp").textContent = "";
    }
};