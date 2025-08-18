// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MoodNFT is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("MoodNFT", "MOOD") {}

    /// @notice Anybody can mint an NFT for free
    function safeMint(address to, string memory ipfsURI) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsURI);
    }
}
