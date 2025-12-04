import crypto from "crypto";

/**
 * Generate a cryptographic hash of experiment data
 */
export function generateHash(data: Record<string, unknown>): string {
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

/**
 * Generate ECDSA key pair for signing
 */
export function generateKeyPair(): {
  privateKey: string;
  publicKey: string;
} {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "secp256k1",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
  };
}

/**
 * Sign a hash with a private key
 */
export function signHash(hash: string, privateKey: string): string {
  const sign = crypto.createSign("SHA256");
  sign.update(hash);
  sign.end();
  return sign.sign(privateKey, "hex");
}

/**
 * Verify a signature
 */
export function verifySignature(
  hash: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(hash);
    verify.end();
    return verify.verify(publicKey, signature, "hex");
  } catch {
    return false;
  }
}
