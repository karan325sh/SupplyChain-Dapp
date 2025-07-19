//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract tracking {
    struct Product {
        uint256 id;
        string name;
        address currentOwner;
        State currentState;
        uint256 timestamp;
        address manufacturer;
        address distributor;
        address retailer;
    }

    enum State {
        Manufactured,
        Shipped,
        Received,
        Sold
    }

    mapping(uint256 => Product) public products;
    uint256 public productCounter;

    modifier onlyManufacturer(uint256 _productId) {
        require(msg.sender == products[_productId].manufacturer, "Not manufacturer");
        _;
    }

    modifier onlyDistributor(uint256 _productId) {
        require(msg.sender == products[_productId].distributor, "Not distributor");
        _;
    }

    modifier onlyRetailer(uint256 _productId) {
        require(msg.sender == products[_productId].retailer, "Not retailer");
        _;
    }

    modifier instate(uint256 _productId, State _state) {
        require(products[_productId].currentState == _state, "Invalid state transition");
        _;
    }

    event ProductManufactured(uint256 id, string name, address manufacturer, uint256 timestamp);
    event ShippedProduct(uint256 productId, address distributor, uint256 timestamp);
    event ProductReceived(uint256 productId, address retailer, uint256 timestamp);
    event ProductSold(uint256 productId, address retailer, uint256 timestamp);

    function manufactureProduct(string memory _name) public returns (uint256) {
        productCounter++;
        products[productCounter] = Product({
            id: productCounter,
            name: _name,
            currentOwner: msg.sender,
            currentState: State.Manufactured,
            timestamp: block.timestamp,
            manufacturer: msg.sender,
            distributor: address(0),
            retailer: address(0)
        });

        emit ProductManufactured(productCounter, _name, msg.sender, block.timestamp);
        return productCounter;
    }
function setParticipants(uint256 _id, address _distributor, address _retailer) public onlyManufacturer(_id) {
    products[_id].distributor = _distributor;
    products[_id].retailer = _retailer;
}

    function shipProduct(uint256 _id) public onlyDistributor(_id) instate(_id, State.Manufactured) {
        Product storage product = products[_id];
        product.currentState = State.Shipped;
        product.timestamp = block.timestamp;
        product.currentOwner = msg.sender;
        emit ShippedProduct(_id, msg.sender, block.timestamp);
    }

    function receiveProduct(uint256 _id) public onlyRetailer(_id) instate(_id, State.Shipped) {
        Product storage product = products[_id];
        product.currentState = State.Received;
        product.timestamp = block.timestamp;
        product.currentOwner = msg.sender;
        emit ProductReceived(_id, msg.sender, block.timestamp);
    }

    function sellProduct(uint256 _id) public onlyRetailer(_id) instate(_id, State.Received) {
        Product storage product = products[_id];
        product.currentState = State.Sold;
        product.timestamp = block.timestamp;
        product.currentOwner = msg.sender;
        emit ProductSold(_id, msg.sender, block.timestamp);
    }

    function getProduct(uint256 _productId)
        public
        view
        returns (
            uint256 id,
            string memory name,
            address manufacturer,
            address distributor,
            address retailer,
            address currentOwner,
            State currentState,
            uint256 timestamp
        )
    {
        Product storage product = products[_productId];
        return (
            product.id,
            product.name,
            product.manufacturer,
            product.distributor,
            product.retailer,
            product.currentOwner,
            product.currentState,
            product.timestamp
        );
    }
}
