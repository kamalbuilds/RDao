
<p align= "center">
    <img src="https://github.com/legendarykamal/RDao/assets/95926324/67dea8df-8184-47ec-9dea-4345239ea501" alt="rdao">
</p>

Welcome to ResearchDao, a decentralized Data DAO built on top of the FVM (Filecoin Virtual Machine) that aims to solve the challenges faced by the scientific research community. ResearchDao provides a comprehensive solution to the DeSci Problem by offering various innovative features such as quadratic voting, NFT-gated peer review system, document encryption, and access control. It is designed to revolutionize the funding and peer review processes in scientific research.

Contract code for the Repo can be found at -> [RDao Contract Code](https://github.com/legendarykamal/RDao-Contract)

## Features

- Quadratic Voting: ResearchDao leverages quadratic voting to ensure fair and democratic decision-making within the DAO. This allows the community to collectively determine the allocation of resources and funding to research papers.

- NFT-gated Peer Review System: The Polybase integration in ResearchDao enables a peer review system where researchers can collaborate, provide feedback, and engage in discussions within an NFT-gated chat. This promotes collaboration and knowledge sharing among researchers.

- Document Encryption: ResearchDao utilizes Lit Protocol's Public Key Pinning (PKP) encryption to ensure the privacy and protection of research papers. PKP encryption allows researchers to securely store and share their papers within the platform.

- Access Control: Lighthouse SDK provides robust access control mechanisms for research papers within ResearchDao. It ensures that only authorized individuals have access to specific documents, maintaining data integrity and security.

- AI-generated NFTs: AI-generated NFTs play a crucial role in the ResearchDao ecosystem. NFT.storage is used to store these NFTs, which are minted on the Filecoin Network. Researchers can token gate their papers using these AI-generated NFTs.

## Technologies Used

ResearchDao incorporates various technologies to deliver its innovative features:


| Technology       | Description                                                                                                                                                                                                                                                          | Code Link                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| Polybase         | NFT-gated peer review system and chat functionality for collaborative research and feedback among researchers.                                                                                                                                                       | [Polybase Code](https://github.com/legendarykamal/RDao/blob/master/src/pages/nftchat.tsx)                                                |
| FVM              | Filecoin Virtual Machine for decentralized and secure storage of research papers, enabling the DataDAO Market for open sharing of valuable datasets.                                                                                                               | [FVM Code](https://github.com/legendarykamal/RDao-Contract)                                                                               |
| Lit Protocol     | Provides PKP (Public Key Pinning) encryption for document privacy and data protection within the platform.                                                                                                                                                          | [Lit Protocol Code](https://github.com/legendarykamal/RDao/blob/master/src/pages/pkp.tsx)                                                |
| TableLand        | Enables data mutability and management of the DataDao table in the form of NFTs.                                                                                                                                                                                    | [TableLand Code](https://github.com/legendarykamal/RDao-Contract/blob/main/contracts/TableHolders.sol)                                   |
| Spheron          | Decentralized deployment framework ensuring secure and decentralized deployment of the Research Dao platform.                                                                                                                                                       | [Spheron Code](https://rdao-03a6a0.spheron.app/)                             |
| Bacalhau         | Deep fake detection model used for screening research papers and maintaining the integrity and authenticity of the content.                                                                                                                                          | [Bacalhau Code](https://github.com/legendarykamal/RDao/blob/master/src/model/deep-fake-detection-on-images-and-videos.ipynb)             |
| Ceramic          | Integration with Lit Protocol, allowing researchers to securely store PKP-encrypted research papers and ensuring interoperability across multiple platforms.                                                                                                         | [Ceramic Code](https://github.com/legendarykamal/RDao/blob/master/src/components/Storeonceramic.tsx)                                     |
| Lighthouse SDK   | Provides access control on the research papers, ensuring secure and authorized access for researchers.                                                                                                                                                               | [Lighthouse Code](https://github.com/legendarykamal/RDao/blob/master/src/components/lighthouse/acesscontrol.tsx)                          |
| NFT.storage      | Used to store AI-generated NFTs, which are then minted on the Filecoin Network and used by researchers to token gate their papers.                                                                                                                                  | [NFT.storage Code](https://github.com/legendarykamal/RDao/blob/master/src/pages/nft.tsx#L99)                                             |
| ApeCoin Dao      | APE Coin is used for funding research papers by a wide audience, providing utility to ApeCoin on the Dao.                                                                                                                                                           | [ApeCoin Dao Code](https://github.com/legendarykamal/RDao/blob/master/src/pages/marketplace.tsx#L45)                                    |
| Huddle01         | Huddle Token Gated Meetings used for 1-1 or group meetings to get peer reviews from other researchers.                                                                                                                                                             | [Huddle01 Code](https://github.com/legendarykamal/RDao/blob/master/src/pages/dashboard/%5Bindex%5D.tsx)                                  |
| Filecoin Saturn  | Used for retrieval via distributed CDN, helping with network and/or IPNI for data discovery and verified retrieval.                                                                                                                                                  | [Filecoin Saturn Code](https://github.com/legendarykamal/RDao/blob/master/public/saturn-sw.js)                                          |
                                                                                                                    
### Bacaulhau Job Completed with job id - 3066f86d-3f10-4330-b514-e5891997538c

Published Results - ipfs:/QmbEjTkzJJSERu35pYgS4t2g7WpAXeW2GZvuZihxAym6Fe

![image](https://github.com/legendarykamal/RDao/assets/95926324/185f13e8-c8b3-491c-a653-b1873fe5d561)

## Installation and Usage

To set up and run ResearchDao locally, follow these steps:

1. Clone the repository: `git clone https://github.com/legendarykamal/RDao.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Access ResearchDao in your web browser at: `http://localhost:3000`

Feel free to explore the different pages and features of ResearchDao. Enjoy the seamless and secure experience it provides for researchers!

## Contributions

Contributions to ResearchDao are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository. Let's work together to enhance the platform and empower the scientific research community.

## License

ResearchDao is released under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute this project for your own purposes.

---

Thank you for your interest in ResearchDao! We hope this platform will revolutionize the way scientific research is conducted and foster collaboration among researchers worldwide. If you have any questions or feedback, please don't hesitate to reach out. Happy researching!i
