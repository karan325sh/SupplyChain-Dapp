// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/tracking.sol";

contract TrackingTest is Test {
    tracking public tracker;

    address manufacturer = address(1);
    address distributor = address(2);
    address retailer = address(3);
    address attacker = address(4);

    function setUp() public {
        tracker = new tracking();
    }

    function testFullProductLifecycle() public {
        // Manufacturer creates a product
        vm.prank(manufacturer);
        uint id = tracker.manufactureProduct("Laptop");

        // Set distributor and retailer
        vm.prank(manufacturer);
        tracker.setParticipants(id, distributor, retailer);

        // Distributor ships the product
        vm.prank(distributor);
        tracker.shipProduct(id);

        (, , , , , address currentOwner1, tracking.State state1, ) = tracker.getProduct(id);
        assertEq(currentOwner1, distributor);
        assertEq(uint(state1), uint(tracking.State.Shipped));

        // Retailer receives the product
        vm.prank(retailer);
        tracker.receiveProduct(id);

        (, , , , , address currentOwner2, tracking.State state2, ) = tracker.getProduct(id);
        assertEq(currentOwner2, retailer);
        assertEq(uint(state2), uint(tracking.State.Received));

        // Retailer sells the product
        vm.prank(retailer);
        tracker.sellProduct(id);

        (, , , , , address currentOwner3, tracking.State state3, ) = tracker.getProduct(id);
        assertEq(currentOwner3, retailer);
        assertEq(uint(state3), uint(tracking.State.Sold));
    }

    function test_RevertWhen_ShipCalledByWrongUser() public {
        vm.prank(manufacturer);
        uint id = tracker.manufactureProduct("Phone");

        vm.prank(manufacturer);
        tracker.setParticipants(id, distributor, retailer);

        vm.prank(attacker);
        vm.expectRevert("Not distributor");
        tracker.shipProduct(id);
    }

    function test_RevertWhen_ReceiveBeforeShipping() public {
        vm.prank(manufacturer);
        uint id = tracker.manufactureProduct("Tablet");

        vm.prank(manufacturer);
        tracker.setParticipants(id, distributor, retailer);

        vm.prank(retailer);
        vm.expectRevert("Invalid state transition");
        tracker.receiveProduct(id);
    }

    function test_RevertWhen_SellBeforeReceiving() public {
        vm.prank(manufacturer);
        uint id = tracker.manufactureProduct("Camera");

        vm.prank(manufacturer);
        tracker.setParticipants(id, distributor, retailer);

        vm.prank(distributor);
        tracker.shipProduct(id);

        vm.prank(retailer);
        vm.expectRevert("Invalid state transition");
        tracker.sellProduct(id);
    }
}
