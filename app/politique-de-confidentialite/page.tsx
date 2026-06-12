import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    "Politique de confidentialité de BioPaternal — traitement des données personnelles, " +
    "absence de persistance génétique, droits RGPD et avertissement médical.",
  robots: { index: true, follow: true },
}

const s = {
  page: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '48px 24px 80px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#1c1917',
    lineHeight: '1.65',
  } as React.CSSProperties,
  header: {
    borderBottom: '2px solid #1e3a5f',
    paddingBottom: '24px',
    marginBottom: '40px',
  } as React.CSSProperties,
  brand: { color: '#1e3a5f', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em' },
  h1: { fontSize: '28px', fontWeight: 700, color: '#1e3a5f', margin: '8px 0 4px' },
  version: { fontSize: '13px', color: '#6b7280' },
  warning: {
    background: '#fffbeb',
    border: '1.5px solid #d97706',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '36px',
    fontSize: '14px',
    color: '#92400e',
  } as React.CSSProperties,
  warningTitle: { fontWeight: 700, marginBottom: '6px', fontSize: '14px' },
  section: { marginBottom: '40px' } as React.CSSProperties,
  h2: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e3a5f',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '8px',
    marginBottom: '16px',
  } as React.CSSProperties,
  h3: { fontSize: '15px', fontWeight: 600, color: '#1e3a5f', margin: '20px 0 8px' },
  p: { margin: '10px 0', fontSize: '15px' },
  ul: { paddingLeft: '20px', margin: '10px 0', fontSize: '15px' } as React.CSSProperties,
  li: { marginBottom: '6px' },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    margin: '16px 0',
    fontSize: '14px',
  },
  th: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    padding: '10px 14px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#374151',
  },
  td: { border: '1px solid #e5e7eb', padding: '10px 14px' },
  badge: {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#1d4ed8',
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

export default function PolitiqueDeConfidentialite() {
  return (
    <main style={s.page}>

      {/* En-tête */}
      <header style={s.header}>
        <div style={s.brand}>BIOPATERNAL</div>
        <h1 style={s.h1}>Politique de confidentialité</h1>
        <p style={s.version}>Version 1.0 — Entrée en vigueur : juin 2025</p>
      </header>

      {/* Avertissement médical (en évidence) */}
      <div style={s.warning}>
        <div style={s.warningTitle}>Avertissement médical obligatoire</div>
        BioPaternal est un outil d&apos;orientation informatif fondé sur les lois mendéliennes de
        l&apos;hérédité sanguine. Il n&apos;a aucune valeur juridique, médicale ni probatoire devant
        un tribunal ou toute autorité administrative. Pour toute démarche légale, seul un test ADN
        réalisé par un laboratoire médico-légal agréé a valeur probante.
      </div>

      {/* 1. Responsable du traitement */}
      <section style={s.section}>
        <h2 style={s.h2}>1. Responsable du traitement</h2>
        <p style={s.p}>
          BioPaternal (ci-après &laquo;&nbsp;Nous&nbsp;&raquo; ou &laquo;&nbsp;BioPaternal&nbsp;&raquo;)
          est responsable du traitement des données personnelles collectées via le site{' '}
          <strong>biopaternal.com</strong> et l&apos;application associée.
        </p>
        <p style={s.p}>
          Contact&nbsp;:{' '}
          <a href="mailto:contact@biopaternal.com" style={{ color: '#2563eb' }}>
            contact@biopaternal.com
          </a>
        </p>
      </section>

      {/* 2. Données collectées */}
      <section style={s.section}>
        <h2 style={s.h2}>2. Données collectées et finalités</h2>

        <h3 style={s.h3}>2.1 Données d&apos;inscription et d&apos;authentification</h3>
        <p style={s.p}>Lors de la création d&apos;un compte, nous collectons&nbsp;:</p>
        <ul style={s.ul}>
          <li style={s.li}>Votre adresse e-mail (obligatoire)</li>
          <li style={s.li}>Votre nom ou pseudonyme (facultatif)</li>
          <li style={s.li}>
            Un mot de passe haché avec <span style={s.badge}>Argon2</span> (jamais stocké en clair)
            ou un identifiant OAuth (Google)
          </li>
          <li style={s.li}>La date et l&apos;heure d&apos;acceptation des CGU et de la présente politique</li>
        </ul>
        <p style={s.p}>
          <strong>Finalité&nbsp;:</strong> création et gestion de votre espace utilisateur.
          <br />
          <strong>Base légale&nbsp;:</strong> exécution du contrat (article&nbsp;6, §1, b du RGPD).
        </p>

        <h3 style={s.h3}>2.2 Données de transaction</h3>
        <p style={s.p}>Lors de l&apos;achat d&apos;un rapport, nous conservons&nbsp;:</p>
        <ul style={s.ul}>
          <li style={s.li}>Un identifiant de transaction interne (UUID anonymisé)</li>
          <li style={s.li}>Le montant, la devise et le pays de facturation (code ISO)</li>
          <li style={s.li}>Le fournisseur de paiement utilisé (Stripe, FedaPay ou CinetPay)</li>
          <li style={s.li}>Le statut de la transaction</li>
          <li style={s.li}>Une référence technique côté fournisseur (ID de session Stripe, etc.)</li>
        </ul>
        <p style={s.p}>
          Aucun numéro de carte bancaire n&apos;est traité ni stocké par BioPaternal. Le paiement est
          intégralement géré par le fournisseur de paiement.
          <br />
          <strong>Base légale&nbsp;:</strong> obligation légale et exécution du contrat (article&nbsp;6, §1,
          b et c du RGPD).
        </p>

        <h3 style={s.h3}>2.3 Données biologiques — traitement éphémère sans persistance</h3>
        <p style={s.p}>
          Les phénotypes sanguins (groupes ABO, facteur Rhésus, système Kell) saisis lors
          d&apos;une analyse <strong>ne sont jamais écrits en base de données</strong>. Ils sont traités
          exclusivement en mémoire vive (RAM) le temps d&apos;exécuter l&apos;algorithme, puis
          détruits immédiatement.
        </p>
        <p style={s.p}>
          Le résultat (exclusion ou compatibilité) est temporairement scellé dans un jeton
          cryptographique éphémère&nbsp;:{' '}
          <span style={s.badge}>JWT HS256</span>, durée de vie&nbsp;: 1&nbsp;heure.
          Ce jeton est chiffré, non déchiffrable côté frontend, et détruit dès la génération
          du rapport PDF.
        </p>
        <p style={s.p}>
          Cette architecture garantit une <strong>absence totale de persistance de données
          génétiques ou biologiques</strong> conformément au principe de minimisation des données
          (article&nbsp;5, §1, c du RGPD) et aux exigences spécifiques aux données de santé
          (article&nbsp;9 du RGPD).
          <br />
          <strong>Base légale&nbsp;:</strong> consentement explicite recueilli lors de
          l&apos;inscription (article&nbsp;9, §2, a du RGPD).
        </p>
      </section>

      {/* 3. Conservation */}
      <section style={s.section}>
        <h2 style={s.h2}>3. Durée de conservation</h2>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Catégorie de données</th>
              <th style={s.th}>Durée de conservation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>Comptes utilisateurs</td>
              <td style={s.td}>Jusqu&apos;à la suppression du compte ou 3&nbsp;ans d&apos;inactivité</td>
            </tr>
            <tr>
              <td style={s.td}>Transactions</td>
              <td style={s.td}>
                10&nbsp;ans (obligation légale comptable — art.&nbsp;L123-22 du Code de commerce)
              </td>
            </tr>
            <tr>
              <td style={s.td}>Journaux techniques</td>
              <td style={s.td}>12&nbsp;mois maximum</td>
            </tr>
            <tr>
              <td style={s.td}>Phénotypes sanguins &amp; résultat d&apos;analyse</td>
              <td style={s.td}>
                <strong>Détruits immédiatement</strong> après traitement en RAM (pas de stockage)
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 4. Sécurité */}
      <section style={s.section}>
        <h2 style={s.h2}>4. Sécurité des données</h2>
        <p style={s.p}>
          Nous mettons en œuvre les mesures techniques et organisationnelles suivantes&nbsp;:
        </p>
        <ul style={s.ul}>
          <li style={s.li}>
            <strong>HTTPS/TLS&nbsp;:</strong> toutes les communications entre votre navigateur et
            nos serveurs sont chiffrées en transit
          </li>
          <li style={s.li}>
            <strong>Mots de passe&nbsp;:</strong> hachés avec{' '}
            <span style={s.badge}>Argon2</span>, résistant aux attaques par GPU
          </li>
          <li style={s.li}>
            <strong>Tokens éphémères&nbsp;:</strong>{' '}
            <span style={s.badge}>HMAC-SHA256</span> avec secret d&apos;environnement isolé
          </li>
          <li style={s.li}>
            <strong>Webhooks de paiement&nbsp;:</strong> vérification cryptographique de signature
            (HMAC-SHA256 avec comparaison à temps constant)
          </li>
          <li style={s.li}>
            <strong>Hébergement UE&nbsp;:</strong> infrastructure en Europe de l&apos;Ouest
          </li>
          <li style={s.li}>
            <strong>Accès minimal&nbsp;:</strong> données accessibles aux seuls membres habilités
          </li>
        </ul>
      </section>

      {/* 5. Cookies */}
      <section style={s.section}>
        <h2 style={s.h2}>5. Cookies</h2>
        <p style={s.p}>
          Nous utilisons uniquement des cookies de session strictement nécessaires au fonctionnement
          du service&nbsp;:
        </p>
        <ul style={s.ul}>
          <li style={s.li}>
            <strong>Cookie d&apos;authentification</strong> (<code>next-auth.session-token</code>)&nbsp;:
            attributs <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite=Lax</code>
          </li>
          <li style={s.li}>
            Durée&nbsp;: session active ou 30&nbsp;jours avec option &laquo;&nbsp;se
            souvenir de moi&nbsp;&raquo;
          </li>
        </ul>
        <p style={s.p}>
          <strong>
            Nous n&apos;utilisons aucun cookie publicitaire, de profilage, analytique tiers
            ni de suivi cross-site.
          </strong>
        </p>
      </section>

      {/* 6. Droits RGPD */}
      <section style={s.section}>
        <h2 style={s.h2}>6. Vos droits (RGPD)</h2>
        <p style={s.p}>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          des droits suivants&nbsp;:
        </p>
        <ul style={s.ul}>
          <li style={s.li}>
            <strong>Droit d&apos;accès</strong> (art.&nbsp;15)&nbsp;: obtenir une copie de vos données
          </li>
          <li style={s.li}>
            <strong>Droit de rectification</strong> (art.&nbsp;16)&nbsp;: corriger des données inexactes
          </li>
          <li style={s.li}>
            <strong>Droit à l&apos;effacement</strong> (art.&nbsp;17)&nbsp;: demander la suppression de
            votre compte et de vos données
          </li>
          <li style={s.li}>
            <strong>Droit à la portabilité</strong> (art.&nbsp;20)&nbsp;: recevoir vos données dans
            un format structuré et lisible
          </li>
          <li style={s.li}>
            <strong>Droit d&apos;opposition</strong> (art.&nbsp;21)&nbsp;: vous opposer au traitement
            pour des motifs légitimes
          </li>
          <li style={s.li}>
            <strong>Droit à la limitation</strong> (art.&nbsp;18)&nbsp;: restreindre le traitement
            dans certaines situations
          </li>
        </ul>
        <p style={s.p}>
          Pour exercer vos droits&nbsp;:{' '}
          <a href="mailto:contact@biopaternal.com" style={{ color: '#2563eb' }}>
            contact@biopaternal.com
          </a>
        </p>
        <p style={s.p}>
          Vous disposez également du droit d&apos;introduire une réclamation auprès de la{' '}
          <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés)&nbsp;:{' '}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb' }}
          >
            www.cnil.fr
          </a>
        </p>
      </section>

      {/* 7. Transferts hors UE */}
      <section style={s.section}>
        <h2 style={s.h2}>7. Transferts hors Union européenne</h2>
        <p style={s.p}>
          Nos partenaires de paiement peuvent traiter certaines données hors de l&apos;UE&nbsp;:
        </p>
        <ul style={s.ul}>
          <li style={s.li}>
            <strong>Stripe&nbsp;:</strong> transferts encadrés par des Clauses Contractuelles Types
            (CCT) conformes à l&apos;article&nbsp;46 du RGPD
          </li>
          <li style={s.li}>
            <strong>FedaPay / CinetPay&nbsp;:</strong> traitent les données dans le cadre de leurs
            politiques de confidentialité propres et des réglementations locales applicables
            (zones UEMOA/CEDEAO)
          </li>
        </ul>
        <p style={s.p}>
          L&apos;hébergement principal de BioPaternal est situé en Europe de l&apos;Ouest.
        </p>
      </section>

      {/* 8. Modifications */}
      <section style={s.section}>
        <h2 style={s.h2}>8. Modifications de la politique</h2>
        <p style={s.p}>
          Nous nous réservons le droit de modifier la présente politique. En cas de modification
          substantielle, vous serez informé par e-mail ou notification dans l&apos;application.
          La date d&apos;entrée en vigueur figure en haut de ce document.
        </p>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p>
          BioPaternal — biopaternal.com &nbsp;|&nbsp; Contact&nbsp;:{' '}
          <a href="mailto:contact@biopaternal.com" style={{ color: '#2563eb' }}>
            contact@biopaternal.com
          </a>
        </p>
        <p>Version 1.0 — Juin 2025</p>
      </footer>

    </main>
  )
}
