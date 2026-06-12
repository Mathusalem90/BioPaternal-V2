import argon2 from 'argon2'

// Password hashing utilities using Argon2id.
// Adjust parameters if you have specific performance/security requirements.
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3,
    parallelism: 1,
  })
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password)
}

export default { hashPassword, verifyPassword }
