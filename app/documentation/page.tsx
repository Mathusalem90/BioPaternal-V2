import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation scientifique — Groupes sanguins et lois de Mendel',
  description:
    "Comprendre l'hérédité des groupes sanguins (ABO, Rhésus, Kell) et les lois de Mendel " +
    "appliquées à l'analyse de paternité. Guide complet et scientifiquement fondé.",
  keywords: [
    'lois de Mendel groupes sanguins',
    'hérédité ABO',
    'génétique groupes sanguins',
    'facteur Rhésus hérédité',
    'système Kell',
    'compatibilité sanguine père enfant',
    'test paternité sanguin',
    'génotype phénotype ABO',
    'allèles groupes sanguins',
    'analyse paternité Mendel',
  ],
  openGraph: {
    title: 'Groupes sanguins et lois de Mendel — BioPaternal',
    description:
      "Guide scientifique complet sur l'hérédité des groupes sanguins et l'analyse de compatibilité de paternité.",
    type: 'article',
  },
}

const s = {
  page: {
    maxWidth: '820px',
    margin: '0 auto',
    padding: '48px 24px 80px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#1c1917',
    lineHeight: '1.7',
  } as React.CSSProperties,
  header: {
    borderBottom: '2px solid #1e3a5f',
    paddingBottom: '24px',
    marginBottom: '40px',
  } as React.CSSProperties,
  brand: { color: '#1e3a5f', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em' },
  h1: { fontSize: '30px', fontWeight: 800, color: '#1e3a5f', margin: '8px 0 8px' },
  lead: { fontSize: '17px', color: '#374151', margin: '8px 0 0' },
  toc: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px 24px',
    marginBottom: '40px',
    fontSize: '14px',
  } as React.CSSProperties,
  tocTitle: { fontWeight: 700, color: '#1e3a5f', marginBottom: '10px' },
  tocList: { paddingLeft: '18px', margin: 0 } as React.CSSProperties,
  tocItem: { marginBottom: '5px' },
  section: { marginBottom: '48px' } as React.CSSProperties,
  h2: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1e3a5f',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '8px',
    marginTop: '0',
    marginBottom: '18px',
  } as React.CSSProperties,
  h3: { fontSize: '17px', fontWeight: 600, color: '#1e40af', margin: '24px 0 10px' },
  p: { margin: '12px 0', fontSize: '15.5px' },
  ul: { paddingLeft: '22px', margin: '12px 0', fontSize: '15.5px' } as React.CSSProperties,
  li: { marginBottom: '8px' },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    margin: '18px 0',
    fontSize: '14.5px',
  },
  th: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    padding: '10px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#374151',
  },
  td: { border: '1px solid #e5e7eb', padding: '10px 16px' },
  callout: {
    background: '#eff6ff',
    border: '1.5px solid #bfdbfe',
    borderRadius: '8px',
    padding: '14px 18px',
    margin: '20px 0',
    fontSize: '15px',
    color: '#1e40af',
  } as React.CSSProperties,
  warning: {
    background: '#fffbeb',
    border: '1.5px solid #fcd34d',
    borderRadius: '8px',
    padding: '14px 18px',
    margin: '20px 0',
    fontSize: '15px',
    color: '#92400e',
  } as React.CSSProperties,
  faqItem: {
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '20px',
    marginBottom: '20px',
  } as React.CSSProperties,
  faqQ: { fontWeight: 700, fontSize: '15.5px', color: '#1e3a5f', marginBottom: '8px' },
  faqA: { fontSize: '15px', color: '#374151' },
  badge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
    margin: '0 2px',
  } as React.CSSProperties,
  footer: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
    marginTop: '60px',
    fontSize: '13px',
    color: '#6b7280',
  } as React.CSSProperties,
}

const BadgeBlue = ({ children }: { children: React.ReactNode }) => (
  <span style={{ ...s.badge, background: '#dbeafe', color: '#1d4ed8' }}>{children}</span>
)
const BadgeGreen = ({ children }: { children: React.ReactNode }) => (
  <span style={{ ...s.badge, background: '#dcfce7', color: '#15803d' }}>{children}</span>
)

export default function Documentation() {
  return (
    <main style={s.page}>

      {/* En-tête */}
      <header style={s.header}>
        <div style={s.brand}>BIOPATERNAL — DOCUMENTATION SCIENTIFIQUE</div>
        <h1 style={s.h1}>Groupes sanguins et lois de Mendel</h1>
        <p style={s.lead}>
          Guide complet sur l&apos;hérédité des groupes sanguins et son application à
          l&apos;analyse de compatibilité de paternité.
        </p>
      </header>

      {/* Table des matières */}
      <nav style={s.toc} aria-label="Table des matières">
        <div style={s.tocTitle}>Table des matières</div>
        <ol style={s.tocList}>
          {[
            ['#mendel', 'Les lois fondamentales de Mendel'],
            ['#abo', 'Le système ABO'],
            ['#rhesus', 'Le facteur Rhésus D (Rh)'],
            ['#kell', 'Le système Kell (K)'],
            ['#algorithme', "Fonctionnement de l'algorithme BioPaternal"],
            ['#limites', "Limites scientifiques de l'analyse"],
            ['#faq', 'Questions fréquentes'],
          ].map(([href, label]) => (
            <li key={href} style={s.tocItem}>
              <a href={href} style={{ color: '#2563eb' }}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1. Lois de Mendel */}
      <section id="mendel" style={s.section}>
        <h2 style={s.h2}>1. Les lois fondamentales de Mendel</h2>
        <p style={s.p}>
          Gregor Mendel (1822–1884) a formulé les lois fondamentales de l&apos;hérédité
          génétique à partir de ses expériences sur les petits pois. Ces lois s&apos;appliquent
          directement aux groupes sanguins humains et constituent la base scientifique de
          BioPaternal.
        </p>

        <h3 style={s.h3}>1.1 Loi de ségrégation (1re loi)</h3>
        <p style={s.p}>
          Chaque individu possède <strong>deux allèles</strong> pour chaque gène, un hérité de sa
          mère, l&apos;autre de son père. Lors de la formation des gamètes (spermatozoïdes et ovules),
          ces allèles se séparent : chaque gamète ne reçoit qu&apos;un seul allèle par locus.
          L&apos;enfant hérite donc d&apos;un allèle de la mère et d&apos;un allèle du père.
        </p>

        <h3 style={s.h3}>1.2 Loi d&apos;assortiment indépendant (2e loi)</h3>
        <p style={s.p}>
          Les loci situés sur des chromosomes différents se transmettent indépendamment.
          Les trois systèmes analysés par BioPaternal obéissent à ce principe&nbsp;:
        </p>
        <ul style={s.ul}>
          <li style={s.li}>Système ABO — chromosome 9</li>
          <li style={s.li}>Système Rhésus D (RHD) — chromosome 1</li>
          <li style={s.li}>Système Kell (KEL) — chromosome 7</li>
        </ul>

        <h3 style={s.h3}>1.3 Codominance et dominance</h3>
        <p style={s.p}>
          Dans le système ABO, les allèles <strong>A</strong> et <strong>B</strong> sont
          {' '}<strong>codominants</strong> (l&apos;individu AB exprime les deux antigènes), tandis que
          l&apos;allèle <strong>O</strong> est <strong>récessif</strong>. Dans les systèmes
          Rhésus et Kell, l&apos;allèle positif (D et K) est dominant sur le négatif.
        </p>
      </section>

      {/* 2. Système ABO */}
      <section id="abo" style={s.section}>
        <h2 style={s.h2}>2. Le système ABO</h2>
        <p style={s.p}>
          Le système ABO définit quatre groupes sanguins principaux —{' '}
          <BadgeBlue>A</BadgeBlue>, <BadgeBlue>B</BadgeBlue>, <BadgeBlue>AB</BadgeBlue> et{' '}
          <BadgeBlue>O</BadgeBlue> — déterminés par les antigènes présents à la surface des
          globules rouges. Chaque individu hérite d&apos;un allèle de chaque parent.
        </p>

        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Groupe sanguin</th>
              <th style={s.th}>Antigènes présents</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['A', 'Antigène A'],
              ['B', 'Antigène B'],
              ['AB', 'Antigènes A et B'],
              ['O', 'Aucun'],
            ].map(([ph, ant]) => (
              <tr key={ph}>
                <td style={{ ...s.td, fontWeight: 700 }}>{ph}</td>
                <td style={s.td}>{ant}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={s.callout}>
          <strong>Règle d&apos;exclusion ABO&nbsp;:</strong> certaines combinaisons de groupes
          parentaux rendent biologiquement impossible l&apos;apparition d&apos;un groupe donné chez
          l&apos;enfant. Lorsqu&apos;une telle incompatibilité est détectée, le père déclaré est
          exclu.
        </div>
      </section>

      {/* 3. Rhésus */}
      <section id="rhesus" style={s.section}>
        <h2 style={s.h2}>3. Le facteur Rhésus D (Rh)</h2>
        <p style={s.p}>
          Le facteur Rhésus est déterminé par le gène <strong>RHD</strong> sur le chromosome 1.
          La présence (<BadgeGreen>Rh+</BadgeGreen>) ou l&apos;absence (
          <BadgeBlue>Rh−</BadgeBlue>) de l&apos;antigène D suit une transmission autosomique
          dominante&nbsp;:
        </p>
        <ul style={s.ul}>
          <li style={s.li}>
            <strong>Rh+ (D+)&nbsp;:</strong> présence de l&apos;antigène D — génotype DD ou Dd
          </li>
          <li style={s.li}>
            <strong>Rh− (D−)&nbsp;:</strong> absence de l&apos;antigène D — génotype dd (homozygote
            récessif)
          </li>
        </ul>

        <div style={s.callout}>
          <strong>Règle d&apos;exclusion Rhésus&nbsp;:</strong> si les deux parents sont Rh−, ils sont
          génotypiquement <em>dd</em> et ne peuvent transmettre que l&apos;allèle d. Un enfant Rh+
          (portant au moins un allèle D) est biologiquement impossible, constituant une exclusion de
          paternité.
        </div>
      </section>

      {/* 4. Kell */}
      <section id="kell" style={s.section}>
        <h2 style={s.h2}>4. Le système Kell (K)</h2>
        <p style={s.p}>
          Le système Kell est déterminé par le gène <strong>KEL</strong> sur le chromosome 7.
          L&apos;antigène K, également transmis de façon autosomique dominante, est cliniquement
          important en immunohématologie (cause fréquente d&apos;incompatibilité foeto-maternelle).
        </p>
        <ul style={s.ul}>
          <li style={s.li}>
            <strong>K+ (Kell positif)&nbsp;:</strong> présence de l&apos;antigène K — génotype KK ou Kk
          </li>
          <li style={s.li}>
            <strong>K− (Kell négatif)&nbsp;:</strong> absence de l&apos;antigène K — génotype kk
          </li>
        </ul>

        <div style={s.callout}>
          <strong>Règle d&apos;exclusion Kell&nbsp;:</strong> deux parents K− (génotype kk) ne peuvent
          transmettre que l&apos;allèle k. Un enfant K+ entre deux parents K− est biologiquement
          impossible.
        </div>
      </section>

      {/* 5. Algorithme */}
      <section id="algorithme" style={s.section}>
        <h2 style={s.h2}>5. Fonctionnement de l&apos;algorithme BioPaternal</h2>
        <p style={s.p}>
          Pour chaque locus, l&apos;algorithme applique les étapes suivantes&nbsp;:
        </p>
        <ol style={{ ...s.ul, listStyleType: 'decimal' }}>
          <li style={s.li}>
            <strong>Énumération des génotypes possibles&nbsp;:</strong> pour chaque phénotype déclaré
            (mère, père déclaré, enfant), l&apos;algorithme liste tous les génotypes compatibles
            avec ce phénotype
          </li>
          <li style={s.li}>
            <strong>Vérification de la cohérence mère-enfant&nbsp;:</strong> l&apos;enfant doit avoir
            pu hériter d&apos;au moins un allèle de sa mère. Si aucune combinaison n&apos;est possible,
            une erreur de saisie est signalée
          </li>
          <li style={s.li}>
            <strong>Test de compatibilité père-enfant&nbsp;:</strong> au moins une combinaison
            génotypique mère-père doit permettre à l&apos;enfant d&apos;hériter l&apos;allèle
            manquant du père déclaré
          </li>
          <li style={s.li}>
            <strong>Décision&nbsp;:</strong> si aucune combinaison cohérente n&apos;existe pour au moins
            un des trois systèmes, le résultat est une{' '}
            <strong style={{ color: '#dc2626' }}>EXCLUSION biologique</strong>. Sinon, le résultat
            est une{' '}
            <strong style={{ color: '#16a34a' }}>COMPATIBILITÉ</strong> (ne constituant pas une
            preuve)
          </li>
        </ol>
        <p style={s.p}>
          L&apos;analyse est exécutée <strong>entièrement en mémoire vive</strong>, sans aucun accès
          à la base de données. Les phénotypes saisis sont détruits immédiatement après l&apos;analyse.
        </p>
      </section>

      {/* 6. Limites */}
      <section id="limites" style={s.section}>
        <h2 style={s.h2}>6. Limites scientifiques de l&apos;analyse</h2>
        <div style={s.warning}>
          <strong>Important&nbsp;:</strong> l&apos;analyse par les groupes sanguins est une méthode
          d&apos;orientation, non une méthode de confirmation. Un résultat de compatibilité ne
          prouve pas la paternité.
        </div>
        <ul style={s.ul}>
          <li style={s.li}>
            <strong>Pouvoir d&apos;exclusion partiel&nbsp;:</strong> l&apos;analyse peut exclure un père
            biologiquement incompatible, mais ne peut jamais prouver qu&apos;une personne compatible
            est le père biologique
          </li>
          <li style={s.li}>
            <strong>Variants génétiques rares&nbsp;:</strong> le phénotype Bombay (h/h), le
            chimérisme sanguin ou des discordances sérotypiques rares peuvent produire des résultats
            atypiques non détectés par cette méthode
          </li>
          <li style={s.li}>
            <strong>Données déclaratives&nbsp;:</strong> la fiabilité du résultat dépend entièrement
            de l&apos;exactitude des groupes sanguins saisis
          </li>
          <li style={s.li}>
            <strong>Trois systèmes seulement&nbsp;:</strong> l&apos;analyse n&apos;exploite pas
            l&apos;ensemble des marqueurs génétiques disponibles
          </li>
        </ul>
        <div style={s.callout}>
          Seul un test ADN sur marqueurs STR (<em>Short Tandem Repeats</em>), réalisé par un
          laboratoire médico-légal agréé, permet d&apos;établir une paternité avec un degré de
          certitude supérieur à <strong>99,9&nbsp;%</strong>.
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" style={s.section}>
        <h2 style={s.h2}>7. Questions fréquentes</h2>

        {[
          {
            q: "Un résultat de « compatibilité » prouve-t-il la paternité ?",
            a: "Non. Une compatibilité signifie que le père déclaré n'est pas exclu sur la base des groupes sanguins analysés. Un tiers possédant les mêmes phénotypes sanguins serait tout aussi compatible. C'est une absence d'exclusion, pas une preuve positive.",
          },
          {
            q: "L'analyse est-elle conforme aux exigences judiciaires françaises ?",
            a: "Non. En France, les tests de paternité sont réglementés par l'article 16-11 du Code civil : ils ne peuvent être ordonnés que par un juge ou réalisés à des fins médicales, par des laboratoires agréés, avec consentement des parties. BioPaternal est un outil d'orientation personnel sans valeur légale ni probatoire.",
          },
          {
            q: "Puis-je utiliser le rapport PDF comme preuve devant un tribunal ?",
            a: "Non. Le rapport PDF contient un avertissement légal explicite indiquant qu'il ne peut pas être invoqué devant une juridiction ou toute autorité administrative.",
          },
          {
            q: "Les groupes sanguins de mes parents peuvent-ils être différents des miens ?",
            a: "Oui, c'est la règle. Par exemple, deux parents de groupe A (génotype AO) peuvent avoir un enfant de groupe O (génotype OO). L'algorithme tient compte de tous les génotypes possibles pour chaque phénotype.",
          },
          {
            q: "Comment connaître mon groupe sanguin Kell (K) ?",
            a: "Le groupe Kell est rarement indiqué sur les cartes de groupe sanguin standard. Il est déterminé lors de bilans immuno-hématologiques ou de dons de sang. Consultez votre médecin ou un laboratoire d'analyses médicales.",
          },
        ].map(({ q, a }) => (
          <div key={q} style={s.faqItem}>
            <div style={s.faqQ}>{q}</div>
            <div style={s.faqA}>{a}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p>
          BioPaternal — biopaternal.com &nbsp;|&nbsp;{' '}
          <a href="/politique-de-confidentialite" style={{ color: '#2563eb' }}>
            Politique de confidentialité
          </a>
        </p>
        <p>
          Ce guide est fourni à titre informatif et éducatif. Il ne constitue pas un avis médical
          ou juridique.
        </p>
      </footer>

    </main>
  )
}
