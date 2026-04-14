# 📡 WiFi Heatmap Analyzer

Aplicativo Android que escaneia **todas as redes Wi-Fi ao redor** simultaneamente,
plota os sinais no mapa em tempo real e permite navegar pelo histórico de cada rede.

**Stack:** React Native CLI · MapLibre · OpenStreetMap · TypeScript  
**100% gratuito** — sem Google Maps, sem chave de API, sem custos

---

## 📱 Funcionalidades

- **Scan simultâneo** de todas as redes Wi-Fi visíveis (não só a conectada)
- **Heatmap em tempo real** — pontos coloridos no mapa conforme você se move
- **Menu lateral** com lista de todas as redes mapeadas
- **Filtro por rede** — toque em uma rede para ver só o mapa dela
- **GPS inteligente** — ignora leituras com precisão pior que 20 metros
- **Persistência** — histórico salvo entre sessões do app
- **Gradiente de cores:**
  - 🔴 Vermelho → sinal fraco (≤ -80 dBm)
  - 🟡 Amarelo → sinal médio (-65 dBm)
  - 🟢 Verde → sinal forte (≥ -50 dBm)

---

## 🗂️ Estrutura do Código

```
src/
├── domain/                          ← Regras de negócio puras (sem libs externas)
│   ├── entities/
│   │   ├── SinalWifi.ts             ← Entidade de leitura Wi-Fi + interface RedeWifi
│   │   └── PontoMapa.ts             ← Entidade de ponto georreferenciado no mapa
│   ├── repositories/
│   │   ├── IWifiRepository.ts       ← Contrato de acesso ao Wi-Fi
│   │   └── ILocalizacaoRepository.ts← Contrato de geolocalização
│   └── usecases/
│       ├── CapturarTodasRedes.ts    ← Caso de uso: captura todas as redes + GPS
│       └── AtualizarMapa.ts         ← Caso de uso: transforma dados em pontos do mapa
│
├── data/                            ← Implementações reais (integração com libs nativas)
│   ├── repositories/
│   │   ├── WifiRepository.ts        ← Usa react-native-wifi-reborn (loadWifiList)
│   │   └── LocalizacaoRepository.ts ← Usa react-native-geolocation-service
│   └── storage/
│       └── PontosStorage.ts         ← Persiste pontos por rede via AsyncStorage
│
├── infra/                           ← Configurações e utilitários
│   ├── permissoes/
│   │   └── solicitarPermissoes.ts   ← Solicita ACCESS_FINE_LOCATION no Android
│   └── utils/
│       └── rssiParaCor.ts           ← Converte RSSI (dBm) → cor HSL (verde/amarelo/vermelho)
│
└── presentation/                    ← Interface do usuário (React Native)
    ├── hooks/
    │   └── useWifiScanner.ts        ← Hook central: orquestra todo o funcionamento do app
    ├── components/
    │   ├── MapaHeatmap.tsx          ← Mapa OpenStreetMap via MapLibre com círculos GeoJSON
    │   ├── MenuLateral.tsx          ← Menu deslizante com lista de redes mapeadas
    │   ├── PainelStatus.tsx         ← Exibe RSSI médio, qualidade, GPS e total de pontos
    │   └── BotoesControle.tsx       ← Botões Iniciar/Parar scan e Limpar
    └── screens/
        └── HomeScreen.tsx           ← Tela principal — integra todos os componentes
```

---

## 🔧 Como Buildar e Instalar

### Pré-requisitos

| Ferramenta     | Versão   | Como instalar                                                        |
| -------------- | -------- | -------------------------------------------------------------------- |
| Java JDK       | 17       | `sudo apt install openjdk-17-jdk`                                    |
| Node.js        | 18+      | `nvm install 18`                                                     |
| Android Studio | Qualquer | [developer.android.com/studio](https://developer.android.com/studio) |

### 1. Configurar variáveis de ambiente

Adicione ao `~/.bashrc`:

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
source ~/.bashrc
```

### 2. Criar o projeto React Native

```bash
cd ~/sua-pasta
npx @react-native-community/cli@latest init WiFiHeatmap
cd WiFiHeatmap
```

### 3. Instalar dependências

```bash
npm install @maplibre/maplibre-react-native
npm install react-native-wifi-reborn
npm install react-native-geolocation-service
npm install @react-native-async-storage/async-storage@1.23.1
```

> ⚠️ Use a versão `1.23.1` do async-storage — versões 2.x+ têm incompatibilidade com o Gradle

### 4. Copiar os arquivos deste projeto

```bash
cp -r /caminho/do/zip/src ./
cp /caminho/do/zip/App.tsx ./
cp /caminho/do/zip/android/AndroidManifest.xml \
   android/app/src/main/AndroidManifest.xml

mkdir -p android/app/src/main/res/xml
cp /caminho/do/zip/android/network_security_config.xml \
   android/app/src/main/res/xml/
```

### 5. Configurar o build.gradle

Em `android/app/build.gradle`, confirme:

```gradle
defaultConfig {
    minSdkVersion 23   // mínimo para react-native-wifi-reborn
    ...
}
```

Em `android/gradle.properties`, adicione:

```
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
```

### 6. Gerar o APK

```bash
cd android
chmod +x gradlew

# APK debug (para testes — precisa do Metro rodando)
./gradlew assembleDebug

# APK release (independente — para uso no dia a dia)
./gradlew assembleRelease
```

**APK gerado em:**

```
android/app/build/outputs/apk/release/app-release.apk
```

### 7. Assinar o APK release (obrigatório)

```bash
cd android/app

# Criar keystore (só uma vez)
keytool -genkeypair -v \
  -keystore minha.keystore \
  -alias meuapp \
  -keyalg RSA -keysize 2048 -validity 10000

# Adicionar no build.gradle:
# signingConfigs {
#   release {
#     storeFile file('minha.keystore')
#     storePassword 'SUA_SENHA'
#     keyAlias 'meuapp'
#     keyPassword 'SUA_SENHA'
#   }
# }
```

### 8. Instalar no celular

**Via USB:**

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Sem USB (WhatsApp, Drive, etc.):**

1. Copie o `.apk` para Downloads
2. Envie para você mesmo pelo WhatsApp
3. No celular: Configurações → Segurança → Fontes desconhecidas → Ativar
4. Abra o arquivo e instale

---

## 📋 Permissões necessárias

| Permissão                | Para quê                              |
| ------------------------ | ------------------------------------- |
| `ACCESS_FINE_LOCATION`   | GPS preciso + Wi-Fi scan (Android 6+) |
| `ACCESS_COARSE_LOCATION` | Localização aproximada                |
| `ACCESS_WIFI_STATE`      | Ler informações do Wi-Fi              |
| `CHANGE_WIFI_STATE`      | Iniciar scan de redes                 |
| `INTERNET`               | Baixar tiles do OpenStreetMap         |

> **Android 10+:** O scan de redes Wi-Fi **obrigatoriamente** requer permissão de localização.
> Sem ela, `loadWifiList()` retorna lista vazia.

---

## 🐧 Problemas comuns no Debian/Linux

**`adb: command not found`**

```bash
export PATH=$PATH:$HOME/Android/Sdk/platform-tools
source ~/.bashrc
```

**Celular não aparece no `adb devices`**

```bash
# Descobrir idVendor do celular
lsusb
# Criar regra udev (substitua 04e8 pelo idVendor do seu celular)
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="04e8", MODE="0666", GROUP="plugdev"' \
  | sudo tee /etc/udev/rules.d/51-android.rules
sudo udevadm control --reload-rules && sudo udevadm trigger
sudo usermod -aG plugdev $USER
# Fazer logout e login novamente
```

**`SDK location not found`**

```bash
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
```

**Erro de memória no Gradle**

```bash
echo "org.gradle.jvmargs=-Xmx4g" >> android/gradle.properties
```

---

## 🗺️ Por que OpenStreetMap + MapLibre?

|                  | Google Maps    | MapLibre + OSM  |
| ---------------- | -------------- | --------------- |
| Custo            | Pago após cota | **Gratuito**    |
| Chave de API     | Obrigatória    | **Não precisa** |
| Código aberto    | Não            | **Sim**         |
| Funciona offline | Não            | **Sim (cache)** |

---

_Desenvolvido com React Native CLI · MapLibre · OpenStreetMap · Clean Architecture_
