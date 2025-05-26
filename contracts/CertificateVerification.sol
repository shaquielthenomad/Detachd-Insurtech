// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateVerification {
    struct Certificate {
        string certificateId;
        string claimId;
        address issuer;
        uint256 timestamp;
        string ipfsHash;
        bool isValid;
    }
    
    mapping(string => Certificate) public certificates;
    mapping(address => bool) public authorizedIssuers;
    
    address public owner;
    
    event CertificateIssued(
        string indexed certificateId,
        string indexed claimId,
        address indexed issuer,
        string ipfsHash
    );
    
    event CertificateRevoked(string indexed certificateId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized to issue certificates");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }
    
    function addAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
    }
    
    function removeAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
    }
    
    function issueCertificate(
        string memory certificateId,
        string memory claimId,
        string memory ipfsHash
    ) external onlyAuthorizedIssuer {
        require(bytes(certificates[certificateId].certificateId).length == 0, "Certificate already exists");
        
        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            claimId: claimId,
            issuer: msg.sender,
            timestamp: block.timestamp,
            ipfsHash: ipfsHash,
            isValid: true
        });
        
        emit CertificateIssued(certificateId, claimId, msg.sender, ipfsHash);
    }
    
    function revokeCertificate(string memory certificateId) external onlyAuthorizedIssuer {
        require(bytes(certificates[certificateId].certificateId).length > 0, "Certificate does not exist");
        require(certificates[certificateId].issuer == msg.sender || msg.sender == owner, "Not authorized to revoke this certificate");
        
        certificates[certificateId].isValid = false;
        emit CertificateRevoked(certificateId);
    }
    
    function verifyCertificate(string memory certificateId) external view returns (
        bool exists,
        bool isValid,
        string memory claimId,
        address issuer,
        uint256 timestamp,
        string memory ipfsHash
    ) {
        Certificate memory cert = certificates[certificateId];
        
        exists = bytes(cert.certificateId).length > 0;
        isValid = cert.isValid;
        claimId = cert.claimId;
        issuer = cert.issuer;
        timestamp = cert.timestamp;
        ipfsHash = cert.ipfsHash;
    }
    
    function getCertificate(string memory certificateId) external view returns (Certificate memory) {
        return certificates[certificateId];
    }
} 