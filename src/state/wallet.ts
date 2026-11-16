type Provider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toString(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect?: () => Promise<void>;
  signMessage?: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array } | Uint8Array>;
};

type Injected = {
  phantom?: { solana?: Provider };
  solflare?: Provider;
  backpack?: Provider;
  solana?: Provider;
};

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58(bytes: Uint8Array): string {
  let n = 0n;
  for (const b of bytes) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) {
    const rem = Number(n % 58n);
    n /= 58n;
    out = B58[rem] + out;
  }
  for (const b of bytes) {
    if (b !== 0) break;
    out = "1" + out;
  }
  return out || "1";
}

export function detectProvider(): { name: string; provider: Provider } | null {
  const w = window as unknown as Injected;
  if (w.phantom?.solana?.isPhantom) return { name: "Phantom", provider: w.phantom.solana };
  if (w.solflare?.isSolflare) return { name: "Solflare", provider: w.solflare };
  if (w.backpack?.isBackpack) return { name: "Backpack", provider: w.backpack };
  if (w.solana?.isPhantom) return { name: "Phantom", provider: w.solana };
  return null;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export async function connectWallet(): Promise<{ name: string; address: string }> {
  const found = detectProvider();
  if (!found) throw new Error("No Solana wallet found. Install Phantom or open this on a device with a wallet.");
  const res = await found.provider.connect();
  const address = res?.publicKey?.toString() ?? found.provider.publicKey?.toString() ?? "";
  if (!address) throw new Error("Wallet connected but returned no address.");
  return { name: found.name, address };
}

export async function signReceipt(message: string): Promise<{ signature: string; signer: string }> {
  const found = detectProvider();
  if (!found) throw new Error("No Solana wallet found.");
  if (!found.provider.signMessage) throw new Error(`${found.name} does not support message signing.`);

  let address = found.provider.publicKey?.toString() ?? "";
  if (!address) {
    const res = await found.provider.connect();
    address = res.publicKey.toString();
  }
  if (!address) throw new Error("Wallet returned no address.");

  const encoded = new TextEncoder().encode(message);
  const result = await found.provider.signMessage(encoded, "utf8");
  const sigBytes = result instanceof Uint8Array ? result : result.signature;
  return { signature: base58(sigBytes), signer: address };
}
