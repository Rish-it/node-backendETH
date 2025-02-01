import { JsonRpcProvider, Contract, id, ethers } from "ethers";



const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDT_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];


const provider = new JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/Hu1KqbYFqD-HF4w-HGJesVh3Y5ndiaTZ");


const usdtContract = new Contract(USDT_ADDRESS, USDT_ABI, provider);


function logTransferEvent(log: ethers.Log) {
    try {
        const parsedLog = usdtContract.interface.parseLog(log);

    
        if (parsedLog) {
            console.log(
                `USDT Transfer: ${parsedLog.args.from} -> ${parsedLog.args.to}, Amount: ${ethers.formatUnits(parsedLog.args.value, 6)}`
            );
        } else {
            console.error("Failed to parse log:", log);
        }
    } catch (error) {
        console.error("Error parsing log:", error);
    }
}


async function pollBlock(blockNumber: number) {
    try {
        const logs = await provider.getLogs({
            address: USDT_ADDRESS,
            fromBlock: blockNumber,
            toBlock: blockNumber,
            topics: [id("Transfer(address,address,uint256)")]
        });

        logs.forEach(logTransferEvent);
    } catch (error) {
        console.error("Error fetching logs:", error);
    }
}

async function watchUSDTTransfers() {
    let latestBlock = await provider.getBlockNumber();

    setInterval(async () => {
        try {
            const newBlock = await provider.getBlockNumber();
            if (newBlock > latestBlock) {
                console.log(`Checking block: ${newBlock}`);
                await pollBlock(newBlock);
                latestBlock = newBlock;
            }
        } catch (error) {
            console.error("Error polling new block:", error);
        }
    }, 5000);
}


watchUSDTTransfers();
console.log("Started polling for USDT transfers...");