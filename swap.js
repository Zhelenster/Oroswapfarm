const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { GasPrice } = require('@cosmjs/stargate');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

class ZigAutoSwapper {
    constructor() {
        this.wallets = [];
        this.proxies = [];
        this.currentProxyIndex = 0;
        this.rpcEndpoint = 'https://rpc.zigchain.org';
        this.chainId = 'zigchain_5000-1';
        this.gasPrice = GasPrice.fromString('25000000000uzig');
        
        // Contract addresses for different tokens
        this.contracts = {
            wizz: 'zig1ej9x8me3fhtm9hwvu6tngklxp5hqekg3d893vf6ewevlvz55a99qs7mcl0',
            fartcoin: 'zig16hgeu44j5vezxavgjkgqsl2wy77223kqyu8al0vq73te0uh7374q33mqjg',
            rwaonzig: 'zig1sk7fmq4js7j24rttgflu9jwv4s7yzduzyln85p5mphxunn22f4psna95u6',
            apexgroup: 'zig1e5ngrvpruhfuqyjsm3l3hrxmpzernrzmtgzx5cz3s0p7dw60dmgsfuav8v'
        };
        
        // Token info
        this.tokens = {
            wizz: {
                denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.wizz',
                beliefPrice: '13.888888888888889284'
            },
            fartcoin: {
                denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.fartcoin',
                beliefPrice: '55.119195259749204752'
            },
            rwaonzig: {
                denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.rwaonzig',
                beliefPrice: '337.837837837837810184'
            },
            apexgroup: {
                denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.apexgroup',
                beliefPrice: '482.641011615560330483'
            }
        };
    }

    // Load mnemonics from file
    loadMnemonics() {
        try {
            if (!fs.existsSync('mnemonic.txt')) {
                console.log('❌ File mnemonic.txt tidak ditemukan!');
                return false;
            }
            
            const content = fs.readFileSync('mnemonic.txt', 'utf8');
            const mnemonics = content.split('\n').filter(line => line.trim() !== '');
            
            if (mnemonics.length === 0) {
                console.log('❌ Tidak ada mnemonic ditemukan dalam file!');
                return false;
            }
            
            console.log(`✅ Loaded ${mnemonics.length} mnemonic(s)`);
            this.mnemonics = mnemonics;
            return true;
        } catch (error) {
            console.log('❌ Error loading mnemonics:', error.message);
            return false;
        }
    }

    // Load proxies from file (optional)
    loadProxies() {
        try {
            if (fs.existsSync('proxy.txt')) {
                const content = fs.readFileSync('proxy.txt', 'utf8');
                this.proxies = content.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(proxy => proxy.trim());
                
                if (this.proxies.length > 0) {
                    console.log(`✅ Loaded ${this.proxies.length} proxy(s)`);
                } else {
                    console.log('⚠️ File proxy.txt kosong, menggunakan koneksi langsung');
                }
            } else {
                console.log('⚠️ File proxy.txt tidak ditemukan, menggunakan koneksi langsung');
            }
        } catch (error) {
            console.log('⚠️ Error loading proxies:', error.message);
        }
    }

    // Get next proxy
    getNextProxy() {
        if (this.proxies.length === 0) return null;
        
        const proxy = this.proxies[this.currentProxyIndex];
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
        return proxy;
    }

    // Create HTTP agent with proxy
    createHttpAgent(proxy) {
        if (!proxy) return undefined;
        
        try {
            // Format: http://username:password@host:port or http://host:port
            return new HttpsProxyAgent(proxy);
        } catch (error) {
            console.log(`⚠️ Invalid proxy format: ${proxy}`);
            return undefined;
        }
    }

    // Initialize wallets
    async initializeWallets() {
        try {
            for (let i = 0; i < this.mnemonics.length; i++) {
                const mnemonic = this.mnemonics[i].trim();
                const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                    prefix: 'zig'
                });
                
                const accounts = await wallet.getAccounts();
                const address = accounts[0].address;
                
                this.wallets.push({
                    wallet,
                    address,
                    index: i
                });
                
                console.log(`✅ Wallet ${i + 1}: ${address}`);
            }
            
            return true;
        } catch (error) {
            console.log('❌ Error initializing wallets:', error.message);
            return false;
        }
    }

    // Create signing client with proxy
    async createSigningClient(wallet, proxy) {
        try {
            const httpOptions = {};
            if (proxy) {
                httpOptions.agent = this.createHttpAgent(proxy);
            }

            const client = await SigningCosmWasmClient.connectWithSigner(
                this.rpcEndpoint,
                wallet,
                {
                    gasPrice: this.gasPrice,
                    httpOptions
                }
            );
            
            return client;
        } catch (error) {
            console.log('❌ Error creating signing client:', error.message);
            return null;
        }
    }

    // Get random swap amount
    getRandomSwapAmount() {
        const amounts = [10000000, 15000000, 20000000]; // 10, 15, 20 ZIG
        return amounts[Math.floor(Math.random() * amounts.length)];
    }

    // Get random token to swap
    getRandomToken() {
        const tokenNames = Object.keys(this.tokens);
        return tokenNames[Math.floor(Math.random() * tokenNames.length)];
    }

    // Execute swap transaction
    async executeSwap(walletInfo, tokenName, amount) {
        const proxy = this.getNextProxy();
        if (proxy) {
            console.log(`🔄 Using proxy: ${proxy.split('@')[1] || proxy} for wallet ${walletInfo.index + 1}`);
        }

        try {
            const client = await this.createSigningClient(walletInfo.wallet, proxy);
            if (!client) {
                throw new Error('Failed to create signing client');
            }

            const contract = this.contracts[tokenName];
            const token = this.tokens[tokenName];
            
            const msg = {
                swap: {
                    belief_price: token.beliefPrice,
                    max_spread: "0.005",
                    offer_asset: {
                        amount: amount.toString(),
                        info: {
                            native_token: {
                                denom: "uzig"
                            }
                        }
                    }
                }
            };

            const funds = [{
                denom: "uzig",
                amount: amount.toString()
            }];

            console.log(`🔄 Executing swap: ${amount / 1000000} ZIG → ${tokenName.toUpperCase()}`);
            console.log(`📍 Wallet: ${walletInfo.address}`);
            console.log(`📍 Contract: ${contract}`);

            const result = await client.execute(
                walletInfo.address,
                contract,
                msg,
                "auto",
                "Swap (Native)",
                funds
            );

            console.log(`✅ Swap successful!`);
            console.log(`📍 TxHash: ${result.transactionHash}`);
            console.log(`📍 Gas used: ${result.gasUsed}`);
            
            // Parse return amount from events
            const swapEvent = result.events.find(e => e.type === 'wasm');
            if (swapEvent) {
                const returnAmountAttr = swapEvent.attributes.find(a => a.key === 'return_amount');
                if (returnAmountAttr) {
                    console.log(`📍 Return amount: ${returnAmountAttr.value}`);
                }
            }

            return {
                success: true,
                txHash: result.transactionHash,
                gasUsed: result.gasUsed
            };

        } catch (error) {
            console.log(`❌ Swap failed: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get random delay between 40-50 seconds
    getRandomDelay() {
        return Math.floor(Math.random() * (50000 - 40000 + 1)) + 40000;
    }

    // Main swap loop
    async startSwapping() {
        console.log('🚀 Starting auto swap...');
        console.log('⏰ Delay per transaction: 40-50 seconds');
        console.log('💫 Press Ctrl+C to stop\n');

        let swapCount = 0;
        
        while (true) {
            try {
                for (const walletInfo of this.wallets) {
                    const tokenName = this.getRandomToken();
                    const amount = this.getRandomSwapAmount();
                    
                    console.log(`\n🔄 Swap #${++swapCount}`);
                    console.log(`⏰ ${new Date().toLocaleString()}`);
                    
                    const result = await this.executeSwap(walletInfo, tokenName, amount);
                    
                    if (result.success) {
                        console.log(`✅ Swap completed successfully`);
                    } else {
                        console.log(`❌ Swap failed: ${result.error}`);
                    }
                    
                    // Random delay between swaps
                    const delay = this.getRandomDelay();
                    console.log(`⏳ Waiting ${delay / 1000} seconds before next swap...`);
                    await this.sleep(delay);
                }
            } catch (error) {
                console.log(`❌ Unexpected error: ${error.message}`);
                console.log('⏳ Waiting 60 seconds before retry...');
                await this.sleep(60000);
            }
        }
    }

    // Initialize and start
    async run() {
        console.log('🔥 ZIG Chain Auto Swapper Starting...\n');
        
        // Load configurations
        if (!this.loadMnemonics()) {
            return;
        }
        
        this.loadProxies();
        
        // Initialize wallets
        console.log('\n📝 Initializing wallets...');
        if (!await this.initializeWallets()) {
            return;
        }
        
        console.log(`\n✅ Setup completed!`);
        console.log(`📊 Wallets: ${this.wallets.length}`);
        console.log(`🌐 Proxies: ${this.proxies.length || 'None (direct connection)'}`);
        console.log(`🎯 Supported tokens: ${Object.keys(this.tokens).join(', ')}`);
        
        // Start swapping
        await this.startSwapping();
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down gracefully...');
    process.exit(0);
});

// Run the bot
const swapper = new ZigAutoSwapper();
swapper.run().catch(error => {
    console.log('❌ Fatal error:', error.message);
    process.exit(1);
});
