# 📋 Contract Deploy Rehberi

## 🚀 Hızlı Başlangıç

### 1. Testnet'e Deploy (Önerilen - Ücretsiz)

Base Sepolia testnet'e deploy etmek için:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Testnet token almak için:**
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) - Ücretsiz test token'ı alın
- Veya [Alchemy Faucet](https://sepoliafaucet.com/) kullanın

### 2. Mainnet'e Deploy

Base mainnet'e deploy etmek için wallet'ınızda ETH/Base token olmalı:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network base
```

**Gereksinimler:**
- Wallet'ta en az 0.001 ETH (veya Base token)
- `.env` dosyasında `PRIVATE_KEY` tanımlı olmalı

## ⚙️ Environment Variables

`contracts/.env` dosyası oluşturun:

```env
# Private key (deploy edecek wallet'ın private key'i)
PRIVATE_KEY=your_private_key_here

# RPC URL'ler (opsiyonel, default değerler kullanılabilir)
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Etherscan API Key (verify için, opsiyonel)
BASESCAN_API_KEY=your_api_key_here
```

## 📝 Deploy Sonrası

Deploy işlemi tamamlandıktan sonra:

1. **Contract adresleri** `contracts/deployed-addresses.json` dosyasına kaydedilir
2. **Frontend'de kullanmak için** `.env.local` dosyasına ekleyin:

```env
NEXT_PUBLIC_REVIEW_NFT_ADDRESS=0x...  # deployed-addresses.json'dan kopyalayın
```

## 🔍 Contract Verify Etme

Deploy sonrası contract'ları verify etmek için:

```bash
# Testnet
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>

# Mainnet
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

## ⚠️ Güvenlik Uyarıları

- **ASLA** private key'inizi Git'e commit etmeyin
- `.env` dosyasını `.gitignore`'a ekleyin
- Production'da mainnet kullanın, testnet sadece test için

## 🐛 Sorun Giderme

### "insufficient funds for gas" hatası
- Wallet'ta yeterli ETH/Base token yok
- Testnet kullanın veya wallet'a token ekleyin

### "Module type" uyarısı
- `package.json`'da `"type": "module"` ekli (zaten eklendi)

### Contract adresi bulunamıyor
- `deployed-addresses.json` dosyasını kontrol edin
- `.env.local` dosyasında `NEXT_PUBLIC_REVIEW_NFT_ADDRESS` tanımlı olmalı


