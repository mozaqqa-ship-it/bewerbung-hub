const DEFAULT_FORMELN = [
  {
    id: 'e1', kat: 'einstieg', tag: 'Branche · Vorlage',
    text: '[Branche] ist eine eigene Disziplin: [Anforderung] muss [Eigenschaft A] sein und trotzdem [Eigenschaft B] bleiben. Genau das verantworte ich aktuell als Content Managerin bei SaniFuture.',
    custom: false
  },
  {
    id: 'e2', kat: 'einstieg', tag: 'Branche · Gesundheit',
    text: 'Content im Gesundheitswesen ist eine eigene Disziplin: medizinische Inhalte müssen präzise sein und trotzdem verständlich bleiben. Genau das tue ich aktuell als Content Managerin bei SaniFuture.',
    custom: false
  },
  {
    id: 'e3', kat: 'einstieg', tag: 'Branche · E-Commerce',
    text: 'Content im E-Commerce ist eine eigene Disziplin: Produkttexte müssen verkaufen und trotzdem gefunden werden. Genau das verantworte ich täglich.',
    custom: false
  },
  {
    id: 'e4', kat: 'einstieg', tag: 'Branche · Nachhaltigkeit',
    text: 'Content für nachhaltige Marken ist eine eigene Disziplin: Haltung muss spürbar sein, ohne zur Predigt zu werden.',
    custom: false
  },
  {
    id: 'e5', kat: 'einstieg', tag: 'Branche · Tourismus',
    text: 'Content im Tourismus ist eine eigene Disziplin: Fernweh wecken und gleichzeitig konkrete Entscheidungshilfe liefern.',
    custom: false
  },
  {
    id: 'e6', kat: 'einstieg', tag: 'Marke · Lokal',
    text: 'Als Urkölnerin weiß ich, dass die Stadt einiges zu bieten hat. [FIRMA] ist aber ein besonderer Grund zum Lokalpatriotismus.',
    custom: false
  },
  {
    id: 'e7', kat: 'einstieg', tag: 'Marke · These',
    text: '[FIRMA] zeigt, dass [These]. Genau dafür stehe ich mit meiner Arbeit: Content, der Haltung trägt.',
    custom: false
  },
  {
    id: 'e8', kat: 'einstieg', tag: 'Schnittstelle',
    text: 'Als Content Managerin im E-Commerce steht für mich nicht nur der Text im Mittelpunkt, sondern die Frage, wie er auf der Seite wirkt: ob er gefunden wird, ob er überzeugt, ob er führt.',
    custom: false
  },
  {
    id: 'e9', kat: 'einstieg', tag: 'Master · Storytelling',
    text: 'Meine Masterarbeit über Repräsentation und Narrativ im amerikanischen Film hat mir beigebracht, wie Sprache Haltung transportiert. Genau das ist der Kern guter Content-Arbeit.',
    custom: false
  },
  {
    id: 'k1', kat: 'kompetenz', tag: 'SaniFuture · komplett',
    text: 'Bei SaniFuture verantworte ich den Content für Online-Shop und Website, pflege über 200 Produktdatensätze in Pimcore und Storyblok und habe als Autorin auf joviva.de 18 medizinische Ratgeberartikel veröffentlicht, die komplexe Gesundheitsthemen verständlich aufbereiten.',
    custom: false
  },
  {
    id: 'k2', kat: 'kompetenz', tag: 'SaniFuture · Produkte',
    text: 'Bei SaniFuture pflege ich über 200 Produktdatensätze in Pimcore und Storyblok und verantworte den redaktionellen Content für Website und Online-Shop.',
    custom: false
  },
  {
    id: 'k3', kat: 'kompetenz', tag: 'SaniFuture · Artikel',
    text: 'Als Autorin auf joviva.de habe ich 18 medizinische Ratgeberartikel veröffentlicht, die komplexe Gesundheitsthemen verständlich aufbereiten.',
    custom: false
  },
  {
    id: 'k4', kat: 'kompetenz', tag: 'SaniFuture · Automatisierung',
    text: 'Daneben automatisiere ich Workflows mit Google Apps Script und KI-gestützten Tools, was mir einen strukturierten Blick auf Content-Prozesse gibt, der über reine Texterstellung hinausgeht.',
    custom: false
  },
  {
    id: 'k5', kat: 'kompetenz', tag: 'WORLD INSIGHT · Events',
    text: 'Bei WORLD INSIGHT habe ich eine deutschlandweite Tour mitorganisiert und vor Ort begleitet sowie wöchentliche Newsletter und Social-Media-Kanäle redaktionell verantwortet.',
    custom: false
  },
  {
    id: 'k6', kat: 'kompetenz', tag: 'WORLD INSIGHT · Schnittstelle',
    text: 'Dadurch habe ich ein Verständnis für die Schnittstelle zwischen Live-Kommunikation und digitalem Marketing entwickelt, das besonders im Event- und Messekontext relevant ist.',
    custom: false
  },
  {
    id: 'k7', kat: 'kompetenz', tag: 'GRENZGANG · Social Media',
    text: 'Bei GRENZGANG habe ich zielgruppenorientierte Social-Media-Inhalte konzipiert und grafisch umgesetzt, Pressetexte geschrieben und Veranstaltungen organisiert.',
    custom: false
  },
  {
    id: 'k8', kat: 'kompetenz', tag: 'Media Matters · Schreiben',
    text: 'Bei Media Matters International habe ich auf Englisch und Deutsch Pressebriefings für internationale Unternehmen aus verschiedenen Branchen zusammengefasst, unter wechselnden Anforderungen und mit konstant hoher Zuverlässigkeit.',
    custom: false
  },
  {
    id: 'k9', kat: 'kompetenz', tag: 'Usability · Zertifikat',
    text: 'Im März 2026 habe ich die Weiterbildung zum Usability Manager an der Akademie der Deutschen Medien abgeschlossen, mit Schwerpunkten auf Customer Journey, UX-Optimierung und Messverfahren.',
    custom: false
  },
  {
    id: 'k10', kat: 'kompetenz', tag: 'Master · Note 1,5',
    text: 'Meinen Master in North American Studies habe ich an der Universität zu Köln mit 1,5 abgeschlossen.',
    custom: false
  },
  {
    id: 'k11', kat: 'kompetenz', tag: 'Sprachen',
    text: 'Ich kommuniziere auf Deutsch und Englisch auf Muttersprachenniveau und auf Arabisch verhandlungssicher.',
    custom: false
  },
  {
    id: 'v1', kat: 'verbindung', tag: 'Blick',
    text: 'Das gibt mir einen Blick auf [Thema der Stelle], der über das Offensichtliche hinausgeht.',
    custom: false
  },
  {
    id: 'v2', kat: 'verbindung', tag: 'Kombination',
    text: 'Diese Kombination aus redaktionellem Denken und technischem Verständnis ist der Kern dieser Stelle.',
    custom: false
  },
  {
    id: 'v3', kat: 'verbindung', tag: 'Gleichzeitig',
    text: 'Dabei habe ich gelernt, Qualität und Geschwindigkeit gleichzeitig zu denken.',
    custom: false
  },
  {
    id: 'v4', kat: 'verbindung', tag: 'Zeugnis-Beleg',
    text: 'Dass ich dabei stets und oft über die vereinbarten Ziele hinausgegangen bin, ist im Zeugnis meiner Vorgesetzten bei WORLD INSIGHT nachzulesen.',
    custom: false
  },
  {
    id: 'v5', kat: 'verbindung', tag: 'UX-Bezug',
    text: 'Die Weiterbildung zum Usability Manager gibt mir einen strukturierten Blick auf Content nicht nur als Text, sondern als Teil einer durchdachten Nutzererfahrung.',
    custom: false
  },
  {
    id: 'a1', kat: 'abschluss', tag: 'Stark · aktiv',
    text: 'Gern überzeuge ich Sie in einem persönlichen Gespräch davon, wie ich Ihr Team inhaltlich und strategisch weiterentwickeln kann.',
    custom: false
  },
  {
    id: 'a2', kat: 'abschluss', tag: 'Kurz · aktiv',
    text: 'Über eine Einladung zum Gespräch freue ich mich.',
    custom: false
  },
  {
    id: 'a3', kat: 'abschluss', tag: 'Persönlich',
    text: 'Ich freue mich auf ein persönliches Kennenlernen.',
    custom: false
  },
  {
    id: 'a4', kat: 'abschluss', tag: 'Mit Bezug',
    text: 'Gern erzähle ich in einem Gespräch mehr davon, wie ich [Kernaufgabe der Stelle] konkret angehe.',
    custom: false
  },
  {
    id: 'a5', kat: 'abschluss', tag: 'Rückmeldung',
    text: 'Über Ihre Rückmeldung freue ich mich.',
    custom: false
  }
];

const VERBOTEN = [
  { phrase: 'mit großem interesse', reason: 'Verbotene Interessensformel' },
  { phrase: 'mit moderatem interesse', reason: 'Verbotene Interessensformel' },
  { phrase: 'auf ihre stellenanzeige aufmerksam geworden', reason: 'Verbotene Interessensformel' },
  { phrase: 'hiermit bewerbe ich mich', reason: 'Generischer Einstieg' },
  { phrase: 'ich bin auf der suche nach', reason: 'Generischer Einstieg' },
  { phrase: 'ich bewerbe mich für', reason: 'Generischer Einstieg' },
  { phrase: 'leidenschaftlich', reason: 'KI-Phrase ohne Beleg' },
  { phrase: 'teamorientiert', reason: 'KI-Phrase ohne Beleg' },
  { phrase: 'ergebnisorientiert', reason: 'KI-Phrase ohne Beleg' },
  { phrase: 'proaktiv', reason: 'KI-Phrase ohne Beleg' },
  { phrase: 'kommunikativ', reason: 'KI-Phrase ohne Beleg' },
  { phrase: 'zielorientiert', reason: 'KI-Phrase ohne Beleg' },
  { phrase: 'einzigartige kombination', reason: 'KI-Phrase' },
  { phrase: 'synergi', reason: 'KI-Phrase' },
  { phrase: 'herausforderung', reason: 'Ausgelutscht – nur mit konkretem Beleg' },
  { phrase: 'ich würde mich sehr freuen', reason: 'Konjunktiv im Abschluss' },
  { phrase: 'ich würde mich freuen', reason: 'Konjunktiv im Abschluss' },
  { phrase: 'wenn sie mir die möglichkeit', reason: 'Absicherungssprache' },
  { phrase: 'ich bin jemand, der', reason: 'Selbstreferenzieller Satz' },
  { phrase: 'ich sehe mich als', reason: 'Selbstreferenzieller Satz' },
  { phrase: 'mit freundlichen grüßen,', reason: 'Kein Komma nach "Mit freundlichen Grüßen"' },
];

const KAT_LABELS = {
  einstieg: 'Einstieg',
  kompetenz: 'Kompetenz & Beleg',
  verbindung: 'Verbindungssatz',
  abschluss: 'Abschluss'
};
