import { Icon } from '../components/shared'
import { SubpageNav, SubpageHero, SubpageFooter } from '../components/subpage-shell'

export default function Privacy() {
  return (
    <div className="tg-root">
      <SubpageNav active="Privacy" />

      <SubpageHero
        eyebrow="Privacy, in detail"
        title="What we collect, what we don't, and what only you can see."
        sub="TrialGuard is a pseudonymous portal. Your real identity stays in an encrypted vault you control; researchers see only a participant ID and the specific fields you choose to share, study by study."
      />

      {/* ON THIS PAGE */}
      <section style={{ padding: '24px var(--tg-pad-x)', background: 'var(--cream-2)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-3)' }}>ON THIS PAGE</span>
          {[
            ['#what', 'What we collect'],
            ['#vault', 'How the vault works'],
            ['#sharing', 'When data is shared'],
            ['#rights', 'Your rights'],
            ['#security', 'Security'],
            ['#terms', 'Terms'],
          ].map(([h, l]) => (
            <a key={h} href={h} style={{ fontSize: 13, color: 'var(--ink-2)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </section>

      {/* WHAT WE COLLECT */}
      <section id="what" style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: 80 }}>
          <div style={{ position: 'sticky', top: 100, alignSelf: 'flex-start' }}>
            <span className="tg-eyebrow"><span className="dot"></span>§ What we collect</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(32px, 3.6vw, 44px)', lineHeight: 1.1, margin: '14px 0' }}>
              Two buckets — and one of them stays in your hands.
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 15, maxWidth: '38ch' }}>
              We separate identifying information from study data so that even if one half is compromised, the other doesn't help an attacker.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { tag: 'YOUR VAULT', title: 'Encrypted, only-you-can-decrypt', items: [['Legal name', 'You provide on sign-up — never visible to researchers'], ['Email', 'Only used to deliver your pseudonym ID + service alerts'], ['Date of birth', 'Optional · only requested if a study needs exact age'], ['Uploaded documents', 'Medical history, referrals, lab results']], tone: 'sage' },
              { tag: 'PER-STUDY', title: 'Released only with your explicit consent', items: [['Pseudonym ID', 'PT-XXXX-XX — the identifier researchers use'], ['Approved demographics', 'Each field a separate yes/no'], ['Trial-relevant medical info', 'Only what the protocol calls for'], ['Self-reports and visit data', 'Generated during the trial; you see all of it']], tone: 'coral' },
            ].map((b, i) => (
              <div key={i} className="tg-card" style={{ background: b.tone === 'sage' ? 'var(--sage-tint)' : 'var(--coral-tint)', borderColor: b.tone === 'sage' ? 'var(--sage-soft)' : 'var(--coral-soft)' }}>
                <div className="tg-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: b.tone === 'sage' ? 'var(--sage-2)' : 'var(--coral-2)' }}>{b.tag}</div>
                <div className="tg-serif" style={{ fontSize: 26, marginTop: 6, lineHeight: 1.2 }}>{b.title}</div>
                <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                  {b.items.map(([k, v], j) => (
                    <div key={j} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, padding: '12px 0', borderTop: j === 0 ? '1px solid var(--line)' : 'none' }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{k}</span>
                      <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VAULT */}
      <section id="vault" style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--ink)', color: 'var(--cream)' }}>
        <span className="tg-eyebrow" style={{ color: 'var(--cream-3)' }}><span className="dot"></span>§ How the vault works</span>
        <h2 className="tg-serif" style={{ fontSize: 'clamp(34px, 3.8vw, 48px)', lineHeight: 1.1, marginTop: 14, maxWidth: '22ch' }}>
          Encrypted on your device. Decrypted only by you.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--tg-gap)', marginTop: 40 }}>
          {[
            ['01', 'Key derivation', 'When you set a passphrase, we derive an AES-256-GCM key locally. The passphrase itself never reaches our servers.'],
            ['02', 'Encrypted upload', 'Your vault payload is encrypted in the browser before it leaves your device. We store ciphertext.'],
            ['03', 'Server blind', 'TrialGuard staff, researchers, and admins cannot decrypt your vault. We don\'t hold the key.'],
            ['04', 'Selective release', 'When you consent to a data point for a study, the client decrypts it, signs the release, and re-encrypts it for the researcher.'],
          ].map(([n, t, s]) => (
            <div key={n} style={{ padding: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="tg-mono" style={{ fontSize: 12, color: 'var(--coral)', letterSpacing: '0.1em' }}>{n}</div>
              <div className="tg-serif" style={{ fontSize: 22, marginTop: 8, color: 'var(--cream)' }}>{t}</div>
              <p style={{ fontSize: 13, color: 'var(--cream-3)', marginTop: 8, lineHeight: 1.55 }}>{s}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 36, padding: '20px 24px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, color: 'var(--cream-3)', maxWidth: 720 }}>
          <strong style={{ color: 'var(--cream)' }}>One implication:</strong> if you lose your passphrase, we cannot help you recover the vault. We can give you a fresh pseudonym, but the old vault stays unreadable. Write your passphrase down somewhere safe.
        </div>
      </section>

      {/* SHARING */}
      <section id="sharing" style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <span className="tg-eyebrow"><span className="dot"></span>§ When data is shared</span>
        <h2 className="tg-serif" style={{ fontSize: 'clamp(34px, 3.8vw, 48px)', lineHeight: 1.1, marginTop: 14, maxWidth: '24ch' }}>
          Sharing is always explicit, always per-field, always reversible.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--tg-gap)', marginTop: 36 }}>
          {[
            ['Patient → Researcher', 'You approve each data point: share, skip, or redact a portion. The researcher only ever sees your pseudonym ID alongside the fields you released.'],
            ['Patient → Admin', 'Admins never receive your decrypted vault. They handle sponsor verification, audit logs, and platform health — all on metadata only.'],
            ['Researcher → Sponsor', 'Sponsors receive aggregated, pseudonymous study data per the protocol. Re-identification is contractually forbidden.'],
          ].map(([t, s]) => (
            <div key={t} className="tg-card">
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 24, lineHeight: 1.15 }}>{t}</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 12, lineHeight: 1.6 }}>{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RIGHTS */}
      <section id="rights" style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--sage-tint)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <span className="tg-eyebrow"><span className="dot"></span>§ Your rights</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(32px, 3.6vw, 44px)', lineHeight: 1.1, marginTop: 14 }}>
              Six things you can do, at any time, from your account.
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 15, marginTop: 14, maxWidth: '40ch' }}>
              Aligned with HIPAA, GDPR, and the common-sense version of both.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { i: 'eye', t: 'See everything', s: 'A live ledger of every data point you\'ve shared, with whom, and when.' },
              { i: 'edit', t: 'Correct anything', s: 'Edit your vault directly. Researchers receive the update on their next sync.' },
              { i: 'pause', t: 'Pause a study', s: 'Pause sharing without leaving the trial — useful for travel, illness, or just a break.' },
              { i: 'trash', t: 'Withdraw', s: 'Leave a trial at any time. Choose retention or full deletion of your prior data.' },
              { i: 'file', t: 'Download a copy', s: 'Export your vault as encrypted JSON; you hold the key.' },
              { i: 'flag', t: 'Object & complain', s: 'File a complaint with your regulator (or with us — we route to a human within 8 hours).' },
            ].map((r) => (
              <div key={r.t} style={{ display: 'flex', gap: 16, padding: '16px 18px', background: 'var(--white)', borderRadius: 'var(--tg-radius)', border: '1px solid var(--line)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sage-tint)', color: 'var(--sage-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={r.i} size={16} />
                </span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{r.t}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{r.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)' }}>
        <span className="tg-eyebrow"><span className="dot"></span>§ Security posture</span>
        <h2 className="tg-serif" style={{ fontSize: 'clamp(34px, 3.8vw, 48px)', lineHeight: 1.1, marginTop: 14, maxWidth: '22ch' }}>
          Boring on purpose. Audited often.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--tg-gap)', marginTop: 36 }}>
          {[
            ['Encryption at rest', 'AES-256-GCM for every data blob.'],
            ['Encryption in transit', 'TLS 1.3 everywhere. HSTS preload.'],
            ['Authentication', 'Argon2id passphrase hashing · 2FA required for staff · hardware-key support for everyone.'],
            ['Access control', 'Strict per-role scopes. Admins cannot decrypt vaults. Researchers cannot see any patient outside their cohort.'],
            ['Audit trail', 'Append-only, cryptographically signed. Every admin and researcher action is logged.'],
            ['Independent review', 'SOC 2 Type II annual · HIPAA aligned · GDPR DPA available to enterprise sponsors.'],
            ['Bug bounty', <>In-scope, paid. <span className="tg-mono">security@trialguard.health</span></>],
            ['Incident response', 'Breach notification within 72 hours. Zero breaches since 2021.'],
          ].map(([t, s]) => (
            <div key={t} style={{ borderTop: '1px solid var(--line)', paddingTop: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{t}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TERMS */}
      <section id="terms" style={{ padding: 'var(--tg-pad-y) var(--tg-pad-x)', background: 'var(--cream-2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 64 }}>
          <div>
            <span className="tg-eyebrow"><span className="dot"></span>§ Terms, short version</span>
            <h2 className="tg-serif" style={{ fontSize: 'clamp(32px, 3.6vw, 44px)', lineHeight: 1.1, marginTop: 14 }}>
              The contract, summarized.
            </h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 15, marginTop: 14, maxWidth: '38ch' }}>
              The full legal text is available on request — <span className="tg-mono">legal@trialguard.health</span>. These bullets are the working agreement.
            </p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
            {[
              'You can browse trials and run the screener without creating an account. No tracking.',
              'Your pseudonym ID is yours alone. We will not transfer it, sell it, or allow anyone else to log in as you.',
              'TrialGuard is not a medical provider. We do not give medical advice. Trial sponsors do — under their own clinical protocols.',
              'You are free to participate in zero, one, or many trials. There is no quota or expectation.',
              'Compensation is between you and the sponsor; we do not take a cut of stipends.',
              'We do not advertise to patients. Ever.',
              'If we are acquired or shut down, your vault is exportable and destroyable on demand — no successor entity inherits decryption ability.',
            ].map((t, i) => (
              <li key={i} style={{ display: 'flex', gap: 14, padding: 16, background: 'var(--white)', borderRadius: 'var(--tg-radius)', border: '1px solid var(--line)' }}>
                <span className="tg-mono" style={{ fontSize: 11, color: 'var(--coral)', letterSpacing: '0.08em', minWidth: 28, paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SubpageFooter />
    </div>
  )
}
