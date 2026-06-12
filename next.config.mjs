/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    // pdfkit accesses its own bundled font files at runtime and must
    // not be inlined by the Next.js bundler.
    serverComponentsExternalPackages: ['pdfkit'],
  },
}

export default config
