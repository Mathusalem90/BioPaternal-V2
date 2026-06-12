import PDFDocument from 'pdfkit'

export type ReportResultType = 'EXCLUSION' | 'INCAPACITY_TO_EXCLUDE'

const C = {
  navy: '#1e3a5f',
  blue: '#2563eb',
  red: '#dc2626',
  redBg: '#fef2f2',
  green: '#16a34a',
  greenBg: '#f0fdf4',
  amber: '#d97706',
  amberBg: '#fffbeb',
  amberText: '#92400e',
  gray: '#f3f4f6',
  grayBorder: '#e5e7eb',
  text: '#1c1917',
  muted: '#6b7280',
  divider: '#d1d5db',
}

const X = 50   // left margin
const W = 495  // content width (595 − 2×50)

export function generateReportPdf(
  resultType: ReportResultType,
  transactionId: string,
  reportDate: Date,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: X,
      info: {
        Title: "BioPaternal — Rapport d'analyse de paternité",
        Author: 'BioPaternal',
        Subject: 'Analyse de compatibilité de paternité sanguine',
        Keywords: 'paternité, ABO, Rhésus, Kell, Mendel',
        Creator: 'BioPaternal',
      },
    })

    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    renderPdf(doc, resultType, transactionId, reportDate)

    doc.end()
  })
}

function renderPdf(
  doc: InstanceType<typeof PDFDocument>,
  resultType: ReportResultType,
  transactionId: string,
  reportDate: Date,
) {
  const isExclusion = resultType === 'EXCLUSION'
  const resultColor = isExclusion ? C.red : C.green
  const resultBg = isExclusion ? C.redBg : C.greenBg

  const dateStr = reportDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = reportDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  // ── En-tête ──────────────────────────────────────────────────────────────
  doc
    .fillColor(C.navy)
    .font('Helvetica-Bold')
    .fontSize(26)
    .text('BIOPATERNAL', X, 50)

  doc
    .fillColor(C.muted)
    .font('Helvetica')
    .fontSize(11)
    .text("Rapport d'analyse de paternité sanguine", X, 82)

  doc
    .moveTo(X, 102)
    .lineTo(X + W, 102)
    .strokeColor(C.navy)
    .lineWidth(2)
    .stroke()

  doc
    .fillColor(C.muted)
    .font('Helvetica')
    .fontSize(9)
    .text(`Référence de transaction : ${transactionId}`, X, 114)
    .text(`Date d'émission : ${dateStr} à ${timeStr} UTC`, X, 126)

  // ── Avertissement juridique (en évidence) ────────────────────────────────
  const DY = 150
  doc
    .rect(X, DY, W, 108)
    .fillAndStroke(C.amberBg, C.amber)

  doc
    .fillColor(C.amberText)
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .text('AVERTISSEMENT JURIDIQUE ET MÉDICAL OBLIGATOIRE', X + 14, DY + 13)

  doc
    .fillColor(C.text)
    .font('Helvetica')
    .fontSize(9.5)
    .text(
      "Ce document est produit par un outil d'orientation à usage informatif uniquement. " +
        "Il n'a aucune valeur juridique, médicale ni probatoire devant un tribunal, " +
        'une autorité administrative ou toute autre juridiction.\n\n' +
        "Seul un test ADN réalisé par un laboratoire médico-légal agréé, " +
        "dans le cadre légal en vigueur dans votre pays, possède une valeur " +
        'probante pour établir une filiation.',
      X + 14,
      DY + 32,
      { width: W - 28, lineGap: 2 },
    )

  // ── Résultat principal ───────────────────────────────────────────────────
  const RY = 273
  doc
    .rect(X, RY, W, 160)
    .fillAndStroke(resultBg, resultColor)

  doc
    .fillColor(resultColor)
    .font('Helvetica-Bold')
    .fontSize(17)
    .text(
      isExclusion ? 'EXCLUSION DE PATERNITÉ' : 'COMPATIBILITÉ DE PATERNITÉ',
      X,
      RY + 20,
      { align: 'center', width: W },
    )

  doc
    .moveTo(X + 25, RY + 50)
    .lineTo(X + W - 25, RY + 50)
    .strokeColor(resultColor)
    .lineWidth(0.8)
    .stroke()

  const resultText = isExclusion
    ? "Sur la base des phénotypes sanguins saisis (systèmes ABO, Rhésus D et Kell), " +
      "l'algorithme conclut à une EXCLUSION biologique de la paternité déclarée.\n\n" +
      "La combinaison génotypique de l'enfant est biologiquement incompatible " +
      "avec une transmission depuis le père déclaré."
    : "Sur la base des phénotypes sanguins saisis (systèmes ABO, Rhésus D et Kell), " +
      "l'algorithme ne peut pas exclure la paternité déclarée.\n\n" +
      "Les phénotypes sanguins du père déclaré sont compatibles avec ceux de l'enfant. " +
      "Cette compatibilité ne constitue pas une preuve de paternité."

  doc
    .fillColor(C.text)
    .font('Helvetica')
    .fontSize(10)
    .text(resultText, X + 22, RY + 64, { width: W - 44, lineGap: 3 })

  // ── Systèmes analysés ────────────────────────────────────────────────────
  let y = RY + 160 + 18

  doc
    .fillColor(C.navy)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Systèmes sanguins analysés', X, y)

  y += 16
  doc.moveTo(X, y).lineTo(X + W, y).strokeColor(C.divider).lineWidth(0.8).stroke()
  y += 10

  const systems = [
    {
      name: 'Système ABO',
      desc: 'Groupes A, B, AB et O — transmission mendélienne autosomique codominante (locus ABO).',
    },
    {
      name: 'Système Rhésus D (Rh)',
      desc: 'Antigène D positif (+) ou négatif (−) — transmission autosomique dominante, locus RHD.',
    },
    {
      name: 'Système Kell (K)',
      desc: 'Antigène K présent (K+) ou absent (K−) — transmission autosomique dominante, locus KEL.',
    },
  ]

  for (const sys of systems) {
    doc.fillColor(C.blue).font('Helvetica-Bold').fontSize(10).text(sys.name, X + 8, y)
    y += 14
    doc
      .fillColor(C.text)
      .font('Helvetica')
      .fontSize(9.5)
      .text(sys.desc, X + 8, y, { width: W - 16 })
    y += 24
  }

  // ── Fondements scientifiques ─────────────────────────────────────────────
  y += 4
  doc.fillColor(C.navy).font('Helvetica-Bold').fontSize(12).text('Fondements scientifiques', X, y)
  y += 16
  doc.moveTo(X, y).lineTo(X + W, y).strokeColor(C.divider).lineWidth(0.8).stroke()
  y += 10

  doc
    .fillColor(C.text)
    .font('Helvetica')
    .fontSize(9.5)
    .text(
      "L'analyse applique les lois de Mendel à l'hérédité des groupes sanguins. " +
        "Pour chaque locus, l'algorithme énumère tous les génotypes compatibles avec " +
        "le phénotype déclaré, puis vérifie si au moins une combinaison cohérente " +
        'existe pour la triade mère–père–enfant. ' +
        "En l'absence d'une telle combinaison, la paternité est exclue.",
      X + 8,
      y,
      { width: W - 16, lineGap: 2 },
    )

  y += 58

  // ── Clause RGPD ──────────────────────────────────────────────────────────
  doc.rect(X, y, W, 62).fillAndStroke(C.gray, C.grayBorder)

  doc
    .fillColor(C.muted)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Traitement des données — Conformité RGPD', X + 12, y + 10)

  doc
    .font('Helvetica')
    .text(
      "Aucune donnée biologique (phénotypes ou résultat) n'est conservée après " +
        "génération de ce rapport. Le traitement a été effectué exclusivement en " +
        'mémoire vive (RAM). La référence de transaction est conservée uniquement ' +
        'à des fins de traçabilité financière.',
      X + 12,
      y + 24,
      { width: W - 24, lineGap: 1.5 },
    )

  y += 62 + 16

  // ── Pied de page ─────────────────────────────────────────────────────────
  doc.moveTo(X, y).lineTo(X + W, y).strokeColor(C.divider).lineWidth(0.8).stroke()
  y += 8

  doc
    .fillColor(C.muted)
    .font('Helvetica')
    .fontSize(8)
    .text('BioPaternal — biopaternal.com', X, y)

  doc
    .text(
      `Document strictement personnel — Généré le ${dateStr}`,
      X,
      y + 12,
      { width: W, align: 'center' },
    )
}
