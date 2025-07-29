# ZIG Chain Auto Swapper

Bot otomatis untuk melakukan swap token di ZIG Chain berdasarkan transaksi yang telah dianalisis.

## 🚀 Fitur

- ✅ **Multi Wallet Support** - Mendukung multiple wallet dari mnemonic
- ✅ **Auto Proxy Rotation** - Rotasi proxy otomatis untuk setiap wallet
- ✅ **RPC Rate Limiting** - Delay 40-50 detik per transaksi untuk menghindari limit
- ✅ **Random Swap** - Random token dan amount untuk setiap swap
- ✅ **Error Handling** - Penanganan error dan retry otomatis
- ✅ **Detailed Logging** - Log detail untuk monitoring

## 📋 Supported Tokens

- **WIZZ** - wizz token swap
- **FARTCOIN** - fartcoin token swap  
- **RWAONZIG** - rwaonzig token swap
- **APEXGROUP** - apexgroup token swap

## 🛠️ Setup & Installation

### 1. Clone atau Download Script
```bash
# Download semua file ke folder project
```

### 2. Install Dependencies
```bash
npm install
# atau
npm run install-deps
```

### 3. Setup File Konfigurasi

#### A. File `mnemonic.txt` (WAJIB)
Buat file `mnemonic.txt` dan masukkan mnemonic wallet Anda (satu per baris):
```
your first wallet mnemonic phrase here
your second wallet mnemonic phrase here
your third wallet mnemonic phrase here
```

#### B. File `proxy.txt` (OPSIONAL)
Buat file `proxy.txt` untuk menggunakan proxy (satu per baris):
```
http://username:password@proxy1.com:8080
http://username:password@proxy2.com:8080
http://proxy3.com:3128
```

**Format proxy yang didukung:**
- `http://host:port`
- `http://username:password@host:port`
- `https://host:port`
- `https://username:password@host:port`

### 4. Menjalankan Bot
```bash
npm start
# atau
node swap.js
```

## ⚙️ Konfigurasi

### Swap Settings
- **Amount**: Random antara 10, 15, atau 20 ZIG per swap
- **Delay**: Random 40-50 detik antar transaksi
- **Max Spread**: 0.5% untuk semua swap
- **Token**: Random selection dari 4 token yang tersedia

### Network Settings
- **RPC**: `https://rpc.zigchain.org`
- **Chain ID**: `zigchain_5000-1`
- **Gas Price**: `25000000000uzig`

## 📊 Contoh Output

```
🔥 ZIG Chain Auto Swapper Starting...

✅ Loaded 3 mnemonic(s)
✅ Loaded 2 proxy(s)

📝 Initializing wallets...
✅ Wallet 1: zig1l4q0dh9pz4q073tucs6tr6s4njw8l526awrn48
✅ Wallet 2: zig1abc123def456ghi789jkl012mno345pqr678st
✅ Wallet 3: zig1xyz789abc123def456ghi012jkl345mno678pq

✅ Setup completed!
📊 Wallets: 3
🌐 Proxies: 2
🎯 Supported tokens: wizz, fartcoin, rwaonzig, apexgroup

🚀 Starting auto swap...
⏰ Delay per transaction: 40-50 seconds
💫 Press Ctrl+C to stop

🔄 Swap #1
⏰ 29/7/2025, 22:38:19
🔄 Using proxy: proxy1.com:8080 for wallet 1
🔄 Executing swap: 15 ZIG → FARTCOIN
📍 Wallet: zig1l4q0dh9pz4q073tucs6tr6s4njw8l526awrn48
📍 Contract: zig16hgeu44j5vezxavgjkgqsl2wy77223kqyu8al0vq73te0uh7374q33mqjg
✅ Swap successful!
📍 TxHash: F81394FCEF0DE9008D864A62DAF3C7EC0B77F516EC3AB34E381DFAC8043A0BB0
📍 Gas used: 298060
📍 Return amount: 181425
⏳ Waiting 47 seconds before next swap...
```

## 🔧 Advanced Configuration

### Mengubah Token dan Contract
Edit bagian `contracts` dan `tokens` dalam script untuk menambah/mengubah token:

```javascript
this.contracts = {
    wizz: 'zig1ej9x8me3fhtm9hwvu6tngklxp5hqekg3d893vf6ewevlvz55a99qs7mcl0',
    // tambahkan token baru
    newtoken: 'zig1newcontractaddresshere'
};

this.tokens = {
    wizz: {
        denom: 'coin.zig1zpnw5dtzzttmgtdjgtywt08wnlyyskpuupy3cfw8mytlslx54j9sgz6w4n.wizz',
        beliefPrice: '13.888888888888889284'
    },
    // tambahkan info token baru
};
```

### Mengubah Swap Amount
Edit fungsi `getRandomSwapAmount()`:

```javascript
getRandomSwapAmount() {
    const amounts = [5000000, 10000000, 25000000]; // 5, 10, 25 ZIG
    return amounts[Math.floor(Math.random() * amounts.length)];
}
```

### Mengubah Delay
Edit fungsi `getRandomDelay()`:

```javascript
getRandomDelay() {
    return Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000; // 30-60 detik
}
```

## 🚨 Peringatan Keamanan

- ⚠️ **Jangan share mnemonic.txt** - File ini berisi private key wallet Anda
- ⚠️ **Backup wallet** - Pastikan Anda memiliki backup mnemonic yang aman
- ⚠️ **Test dengan amount kecil** - Test dulu dengan amount kecil sebelum production
- ⚠️ **Monitor gas fee** - Pastikan wallet memiliki cukup ZIG untuk gas fee
- ⚠️ **Check contract address** - Selalu verify contract address sebelum swap

## 🛡️ Error Handling

Bot dilengkapi dengan error handling untuk:
- ✅ RPC connection timeout
- ✅ Invalid proxy handling
- ✅ Insufficient balance
- ✅ Transaction failure
- ✅ Network issues
- ✅ Graceful shutdown (Ctrl+C)

## 📝 Troubleshooting

### Bot tidak bisa connect
- Check RPC endpoint masih aktif
- Check internet connection
- Verify proxy settings

### Transaction failed
- Check wallet balance (minimal untuk gas + swap amount)
- Check belief_price apakah masih valid
- Check contract address

### Proxy issues
- Verify proxy format correct
- Test proxy connection manually
- Use direct connection jika proxy bermasalah

## 📞 Support

Jika ada issues atau pertanyaan, silakan check:
1. Error message pada console
2. Network connection
3. Balance wallet
4. Contract address validity

## 📄 License

MIT License - Gunakan dengan risiko sendiri!
